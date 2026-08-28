/**
 * fetch-actividades-medicina.cjs
 * ──────────────────────────────
 * Extrae los datos de Actividades Medicina de Especialidad desde
 * la ODBC Oracle "dwh.dssasur.cl" y los guarda como JSON en:
 *   public/data/actividades_medicina_cached.json
 *
 * Uso:
 *   node fetch-actividades-medicina.cjs
 */

'use strict';

const odbc = require('odbc');
const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

const DSN      = 'dwh.dssasur.cl';
const USER     = 'ghperez';
const PASSWORD = 'Josefa20';

const CONNECTION_STRING = `DSN=${DSN};UID=${USER};PWD=${PASSWORD};`;

// Consulta exact de Oracle Discoverer
const SQL = `
SELECT 
  O195950.ACCION_A_TOMAR, 
  O195900.ACTIVIDAD, 
  O195993.AGRUPACION_1, 
  O195993.AGRUPACION_2, 
  O195993.AGRUPACION_3, 
  O196004.APELLIDO_MAT, 
  O196004.APELLIDO_PAT, 
  O195936.AUGE_1, 
  O195936.AUGE_2, 
  O195936.AUGE_3, 
  O195936.CANTIDAD AS CANTIDAD_DIAG, 
  O195993.CANTIDAD AS CANTIDAD_PREST, 
  O195936.CODIGO_1 AS CODIGO_DIAG_1, 
  O195993.CODIGO_1 AS CODIGO_PREST_1, 
  O195936.CODIGO_2 AS CODIGO_DIAG_2, 
  O195993.CODIGO_2 AS CODIGO_PREST_2, 
  O195936.CODIGO_3 AS CODIGO_DIAG_3, 
  O195993.CODIGO_3 AS CODIGO_PREST_3, 
  O195950.CTA_CTE, 
  O195960.DIAGNOSTICO_IC, 
  O195936.DIAGNOSTICO_1, 
  O195936.DIAGNOSTICO_2, 
  O195936.DIAGNOSTICO_3, 
  O195950.EDAD_AÑOS_PAC_RUP AS EDAD, 
  O196004.ESPECIALIDAD, 
  O195960.ESTAB_ORIGEN_IC, 
  O195950.ESTADO_ATENCION, 
  O195960.ESTADO_AUGE, 
  O195950.ESTADO_HORA, 
  O195936.ESTADO_1, 
  O195936.ESTADO_2, 
  O195936.ESTADO_3, 
  O195960.FECHA_IC, 
  O195982.FECHA_NAC, 
  O195936.GRUPO_DIAG, 
  O195950.HORA_GENERADA, 
  O195960.IC_ASOC_HORA, 
  O196004.NOMBRES, 
  O196004.POLICLINICO, 
  O195993.PRESTACION_1, 
  O195993.PRESTACION_2, 
  O195993.PRESTACION_3, 
  O195982.PREVISION, 
  O195960.PROBLEMA_SALUD, 
  O195936.PROBLEMA_SALUD_1, 
  O195936.PROBLEMA_SALUD_2, 
  O195936.PROBLEMA_SALUD_3, 
  O195982.SEXO, 
  O196004.SUBESPECIALIDAD, 
  O195900.TIPO_CONSULTA, 
  ( DECODE(O195950.FECHA_ATENCION,NULL,TO_DATE(NULL,'MMDDYYYY'),TO_DATE(TO_CHAR(TRUNC(O195950.FECHA_ATENCION,'DD'),'YYYYMMDD')||'','YYYYMMDD')) ) AS FECHA_ATENCION, 
  O195900.PROCEDENCIA, 
  O195900.PERTINENCIA, 
  O195900.TIEMPO_ESTABLECIDO_PERTINENCIA, 
  O195900.GRUPO_ACTIVIDAD, 
  O195982.NACIONALIDAD, 
  O195982.PUEBLO_ORIGINARIO, 
  O195950.HIP_DIAGNOSTICA, 
  O195950.TIPO_ATENCION_PROGRAMADA, 
  O195950.TIPO_ATENCION_REALIZADA, 
  O195950.CONTRAREFERIR_ESTABLECIMIENTO, 
  O195950.CONTRAREFERIR, 
  O195950.VIDEOCONSULTA, 
  O195950.SOBRECUPO
FROM 
  HOJA_DIARIA.ACTIVIDAD_LISTADO_ESPEC O195900, 
  HOJA_DIARIA.DIAGNOSTICO_ESPEC O195936, 
  HOJA_DIARIA.HOJA_DIARIA_ESPEC O195950, 
  HOJA_DIARIA.INTERCONSULTA_RUP O195960, 
  HOJA_DIARIA.PACIENTE_ESPEC O195982, 
  HOJA_DIARIA.PRESTACIONES_ESPEC O195993, 
  HOJA_DIARIA.PROFESIONAL_ESPEC O196004
WHERE ( 
  ( O195950.HORA_GENERADA = O195900.HG_ID ) AND 
  ( O195950.HORA_GENERADA = O195936.HG_ID ) AND 
  ( O195950.HORA_GENERADA = O195982.HORAS_GENERADAS_ID ) AND 
  ( O195950.HORA_GENERADA = O195993.HG_ID ) AND 
  ( O195950.HORA_GENERADA = O196004.HORAS_GENERADAS_ID ) AND 
  ( O195950.HORA_GENERADA = O195960.HORA_GENERADA ) 
) 
AND ( O195950.COD_DEIS_SERV = '21' ) 
AND ( ( DECODE(O195950.FECHA_ATENCION,NULL,TO_DATE(NULL,'MMDDYYYY'),TO_DATE(TO_CHAR(TRUNC(O195950.FECHA_ATENCION,'DD'),'YYYYMMDD')||'','YYYYMMDD')) ) >= TO_DATE('20240101','YYYYMMDD') ) 
AND ( ( DECODE(O195950.FECHA_ATENCION,NULL,TO_DATE(NULL,'MMDDYYYY'),TO_DATE(TO_CHAR(TRUNC(O195950.FECHA_ATENCION,'DD'),'YYYYMMDD')||'','YYYYMMDD')) ) <= TO_DATE('20261231','YYYYMMDD') ) 
AND ( O195950.ESTABLECIMIENTO = 'VILLARRICA HOSP.' )
ORDER BY O196004.APELLIDO_PAT ASC
`;

async function run() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(' Actividades Medicina de Especialidad - Extractor ODBC');
  console.log(` DSN: ${DSN} | Usuario: ${USER}`);
  console.log(' Fecha:', new Date().toLocaleString('es-CL'));
  console.log('═══════════════════════════════════════════════════════════');

  let connection;
  try {
    console.log('\n[1/4] Conectando a la base de datos Oracle via ODBC...');
    connection = await odbc.connect(CONNECTION_STRING);
    console.log('      ✓ Conexión establecida.');

    console.log('\n[2/4] Ejecutando consulta SQL...');
    const startTime = Date.now();
    const result = await connection.query(SQL);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`      ✓ Consulta ejecutada en ${elapsed}s. Filas: ${result.length.toLocaleString('es-CL')}`);

    console.log('\n[3/4] Procesando registros y compactando...');
    const records = result.map(row => {
      const nombreProf = [row.NOMBRES, row.APELLIDO_PAT, row.APELLIDO_MAT].filter(Boolean).join(' ').trim();
      const obj = {};
      if (row.ESPECIALIDAD) obj.especialidad = row.ESPECIALIDAD;
      if (nombreProf) obj.profesional_nombre = nombreProf;
      if (row.POLICLINICO) obj.policlinico = row.POLICLINICO;
      if (row.TIPO_CONSULTA) obj.tipo_consulta = row.TIPO_CONSULTA;
      if (row.ACTIVIDAD) obj.actividad = row.ACTIVIDAD;
      if (row.DIAGNOSTICO_1) obj.diagnostico_1 = row.DIAGNOSTICO_1;
      if (row.PRESTACION_1) obj.prestacion_1 = row.PRESTACION_1;
      if (row.ESTADO_ATENCION) obj.estado_atencion = row.ESTADO_ATENCION;
      if (row.ESTADO_HORA) obj.estado_hora = row.ESTADO_HORA;
      if (row.FECHA_ATENCION) obj.fecha_atencion = String(row.FECHA_ATENCION).substring(0, 10);
      if (row.PERTINENCIA) obj.pertinencia = row.PERTINENCIA;
      if (row.TIEMPO_ESTABLECIDO_PERTINENCIA) obj.tiempo_establecido_pertinencia = row.TIEMPO_ESTABLECIDO_PERTINENCIA;
      if (row.SOBRECUPO) obj.sobrecupo = row.SOBRECUPO;
      if (row.VIDEOCONSULTA) obj.videoconsulta = row.VIDEOCONSULTA;
      if (row.AUGE_1 || row.PROBLEMA_SALUD || row.ESTADO_AUGE) obj.auge_1 = row.AUGE_1 || row.PROBLEMA_SALUD || row.ESTADO_AUGE;
      if (row.HIP_DIAGNOSTICA) obj.hip_diagnostica = row.HIP_DIAGNOSTICA;
      if (row.CONTRAREFERIR) obj.contrareferir = row.CONTRAREFERIR;
      if (row.CONTRAREFERIR_ESTABLECIMIENTO) obj.contrareferir_establecimiento = row.CONTRAREFERIR_ESTABLECIMIENTO;
      if (row.ACCION_A_TOMAR) obj.accion_a_tomar = row.ACCION_A_TOMAR;
      return obj;
    });

    console.log('\n[4/4] Guardando JSON en public/data/actividades_medicina_cached.json...');
    const cacheDir = path.join(__dirname, 'public', 'data');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const output = {
      lastUpdated: new Date().toISOString(),
      totalRecords: records.length,
      records
    };

    const jsonBuffer = Buffer.from(JSON.stringify(output), 'utf-8');
    const outPath = path.join(cacheDir, 'actividades_medicina_cached.json');
    fs.writeFileSync(outPath, jsonBuffer);

    const outPathGz = path.join(cacheDir, 'actividades_medicina_cached.json.gz');
    const gzipped = zlib.gzipSync(jsonBuffer, { level: 9 });
    fs.writeFileSync(outPathGz, gzipped);

    const sizeMB = (jsonBuffer.length / (1024 * 1024)).toFixed(2);
    const sizeGzMB = (gzipped.length / (1024 * 1024)).toFixed(2);
    console.log(`      ✓ Guardado en: ${outPath} (${sizeMB} MB)`);
    console.log(`      ✓ Comprimido en: ${outPathGz} (${sizeGzMB} MB)`);
    console.log('\n═══════════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('\n❌ ERROR en la extracción:', err.message || err);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

run();
