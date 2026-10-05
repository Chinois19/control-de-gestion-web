const odbc = require('odbc');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Consulta SQL Discoverer oficial
const SQL_QUERY = `
SELECT 
    O239378.DAU,
    O239378.ESTADO_ATENCION,
    O239378.TIPO_CONSULTA,
    O239491.CATEGORIZACION,
    O239642.EDAD_ANOS,
    O239378.CATEGORIZACION_LE,
    O239491.ESPEC_PROF_ATIENDE_1,
    O239491.ESPEC_PROF_ATIENDE_2,
    O239491.AGR_PROF_ATENDE_1,
    O239491.AGR_PROF_ATIENDE_2,
    O239491.DESTINO_INMEDIATO,
    O245244.FECHA_TOMA_MUESTRA_1,
    O239491.NUMERO_ATENCIONES,
    O239642.TIPO_PACIENTE,
    O239491.TIPO_PROFESIONAL,
    O239491.TIPO_PROFESIONAL_2,
    O239491.DESTINO_ESPECIFICO,
    O239378.FECHA_ADMISION,
    O239491.FECHA_CIERRE,
    O239491.FECHA_CIERRE_FINAL,
    O239491.DESTINO_ALTA_DOMICILIO,
    O239491.DESTINO_TIPO_PATOLOGIA,
    O239491.DESTINO_TIPO_CAMA,
    O239491.DESTINO_ESTABLECIMIENTO,
    O239491.AGR_PROF_ATENDE_3,
    O239491.AGR_PROF_ATENDE_4,
    O239491.AGR_PROF_ATENDE_5,
    O239491.ESPEC_PROF_ATIENDE_3,
    O239491.ESPEC_PROF_ATIENDE_4,
    O239491.ESPEC_PROF_ATIENDE_5,
    O239642.SEXO,
    O239642.PREVISION
FROM 
    URGENCIA.D_ADMISION O239378,
    URGENCIA.D_CIERRE_ATENCION O239491,
    URGENCIA.D_PACIENTE O239642,
    URGENCIA.D_SIGNOS_VITALES O245244
WHERE 
    ( O239378.DAU = O239642.DAU ) 
    AND ( O239378.DAU = O239491.DAU ) 
    AND ( O239378.DAU = O245244.DAU )
    AND ( O239491.FECHA_CIERRE_FINAL <= TO_DATE('20270101000000','YYYYMMDDHH24MISS') )
    AND ( O239491.FECHA_CIERRE_FINAL >= TO_DATE('20250101000000','YYYYMMDDHH24MISS') )
    AND ( O239378.ESTABLECIMIENTO = 'VILLARRICA HOSP.' )
`;

function clasificarTipoEspecialidad(row) {
  const esps = [
    row.ESPEC_PROF_ATIENDE_1,
    row.ESPEC_PROF_ATIENDE_2,
    row.ESPEC_PROF_ATIENDE_3,
    row.ESPEC_PROF_ATIENDE_4,
    row.ESPEC_PROF_ATIENDE_5
  ]
    .filter(v => v !== null && v !== undefined && String(v).trim() !== '')
    .map(v => String(v).trim().toUpperCase());

  if (esps.length === 0) return 'SIN REGISTRO / NO ESPECIFICADO';

  // Regla 2: MEDICO GINECO-OBSTETRA
  const hasGineco = esps.some(e => e.includes('GINECOLOGIA') || e.includes('OBSTETRICIA'));
  if (hasGineco) return 'MEDICO GINECO-OBSTETRA';

  // Regla 3: MATRON(A)
  const allMatrona = esps.every(e => e.includes('MATRON'));
  if (allMatrona) return 'MATRON(A)';

  // Regla 1: MEDICO ADULTO Y NIÑO
  return 'MEDICO ADULTO Y NIÑO';
}

async function extractUrgenciaAtencionData() {
  let conn;
  try {
    console.log('Conectando a Oracle DWH via ODBC (DSN=dwh.dssasur.cl)...');
    conn = await odbc.connect('DSN=dwh.dssasur.cl;Uid=ghperez;Pwd=Josefa20');
    console.log('¡Conexión establecida!');

    console.log('Ejecutando consulta Discoverer de Urgencia y Tiempos de Espera...');
    const rawResults = await conn.query(SQL_QUERY);
    console.log(`Registros recuperados: ${rawResults.length}`);

    const mappedRecords = rawResults.map((r, idx) => {
      const tipoEsp = clasificarTipoEspecialidad(r);

      // Calcular tiempo de espera en minutos entre Fecha y Hora de Inicio de Atención (FECHA_CIERRE) y FECHA_TOMA_MUESTRA_1
      let tiempoEsperaMinutos = null;
      let rangoEspera = 'Sin Registro';

      if (r.FECHA_CIERRE && r.FECHA_TOMA_MUESTRA_1) {
        const tAtencion = new Date(r.FECHA_CIERRE).getTime();
        const tMuestra = new Date(r.FECHA_TOMA_MUESTRA_1).getTime();
        let diff = Math.round((tAtencion - tMuestra) / (1000 * 60));
        if (diff < 0) diff = 0; // atención inmediata
        tiempoEsperaMinutos = diff;
        rangoEspera = diff <= 30 ? 'Menor o igual a 30 minutos' : 'Mayor a 30 Min.';
      }

      const fAdm = r.FECHA_ADMISION ? new Date(r.FECHA_ADMISION) : null;
      const fCierre = r.FECHA_CIERRE ? new Date(r.FECHA_CIERRE) : null;
      const year = fAdm ? fAdm.getFullYear() : (fCierre ? fCierre.getFullYear() : null);
      const month = fAdm ? fAdm.getMonth() + 1 : (fCierre ? fCierre.getMonth() + 1 : null);

      return {
        id: `DAU-${r.DAU || idx}`,
        dau: r.DAU,
        year,
        month,
        fecha_admision: r.FECHA_ADMISION,
        fecha_inicio_atencion: r.FECHA_CIERRE,
        fecha_toma_muestra: r.FECHA_TOMA_MUESTRA_1,
        fecha_cierre_final: r.FECHA_CIERRE_FINAL,
        estado_atencion: r.ESTADO_ATENCION || 'CERRADO',
        tipo_consulta: r.TIPO_CONSULTA || 'ADULTO',
        categorizacion_urgencia: r.CATEGORIZACION,
        selector_demanda: r.CATEGORIZACION_LE || 'Sin Categorizar',
        tipo_especialidad: tipoEsp,
        tiempo_espera_minutos: tiempoEsperaMinutos,
        rango_espera: rangoEspera,
        cumple_meta_30m: tiempoEsperaMinutos !== null ? (tiempoEsperaMinutos <= 30) : null,
        edad: parseInt(r.EDAD_ANOS, 10) || 0,
        sexo: r.SEXO === 'M' ? 'Masculino' : (r.SEXO === 'F' ? 'Femenino' : r.SEXO),
        prevision: r.PREVISION ? r.PREVISION.trim() : 'FONASA',
        destino_inmediato: r.DESTINO_INMEDIATO || 'ALTA DOMICILIO',
        esp_1: r.ESPEC_PROF_ATIENDE_1,
        esp_2: r.ESPEC_PROF_ATIENDE_2,
        esp_3: r.ESPEC_PROF_ATIENDE_3,
        esp_4: r.ESPEC_PROF_ATIENDE_4,
        esp_5: r.ESPEC_PROF_ATIENDE_5
      };
    });

    const outputJson = path.join(__dirname, 'public', 'data', 'urgencia_tiempos_c2_cached.json');
    const outputGz = path.join(__dirname, 'public', 'data', 'urgencia_tiempos_c2_cached.json.gz');

    const payload = {
      lastUpdated: new Date().toISOString(),
      fuente: 'Oracle Discoverer DWH (URGENCIA.D_ADMISION, D_CIERRE_ATENCION, D_PACIENTE, D_SIGNOS_VITALES)',
      total_registros: mappedRecords.length,
      records: mappedRecords
    };

    const buf = Buffer.from(JSON.stringify(payload), 'utf-8');
    fs.writeFileSync(outputJson, buf);
    const gz = zlib.gzipSync(buf, { level: 9 });
    fs.writeFileSync(outputGz, gz);

    console.log(`Archivo generado con éxito: ${outputJson} (${(buf.length / (1024*1024)).toFixed(2)} MB)`);
    console.log(`Archivo comprimido: ${outputGz} (${(gz.length / (1024*1024)).toFixed(2)} MB)`);

    await conn.close();
  } catch (e) {
    console.error('Error durante la extracción:', e.message);
    if (conn) await conn.close();
  }
}

extractUrgenciaAtencionData();
