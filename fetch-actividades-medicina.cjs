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

    console.log('\n[3/4] Procesando registros...');
    const records = result.map(row => {
      const nombreProf = [row.NOMBRES, row.APELLIDO_PAT, row.APELLIDO_MAT].filter(Boolean).join(' ').trim();
      return {
        accion_a_tomar: row.ACCION_A_TOMAR || '',
        actividad: row.ACTIVIDAD || '',
        agrupacion_1: row.AGRUPACION_1 || '',
        agrupacion_2: row.AGRUPACION_2 || '',
        agrupacion_3: row.AGRUPACION_3 || '',
        profesional_nombre: nombreProf,
        apellido_pat: row.APELLIDO_PAT || '',
        apellido_mat: row.APELLIDO_MAT || '',
        nombres: row.NOMBRES || '',
        especialidad: row.ESPECIALIDAD || '',
        subespecialidad: row.SUBESPECIALIDAD || '',
        policlinico: row.POLICLINICO || '',
        auge_1: row.AUGE_1 || '',
        auge_2: row.AUGE_2 || '',
        auge_3: row.AUGE_3 || '',
        cantidad_diag: row.CANTIDAD_DIAG || 0,
        cantidad_prest: row.CANTIDAD_PREST || 0,
        codigo_diag_1: row.CODIGO_DIAG_1 || '',
        codigo_prest_1: row.CODIGO_PREST_1 || '',
        cta_cte: row.CTA_CTE || '',
        diagnostico_ic: row.DIAGNOSTICO_IC || '',
        diagnostico_1: row.DIAGNOSTICO_1 || '',
        diagnostico_2: row.DIAGNOSTICO_2 || '',
        diagnostico_3: row.DIAGNOSTICO_3 || '',
        edad: row.EDAD || null,
        estab_origen_ic: row.ESTAB_ORIGEN_IC || '',
        estado_atencion: row.ESTADO_ATENCION || '',
        estado_auge: row.ESTADO_AUGE || '',
        estado_hora: row.ESTADO_HORA || '',
        fecha_ic: row.FECHA_IC || null,
        fecha_nac: row.FECHA_NAC || null,
        grupo_diag: row.GRUPO_DIAG || '',
        hora_generada: row.HORA_GENERADA || null,
        ic_asoc_hora: row.IC_ASOC_HORA || '',
        prestacion_1: row.PRESTACION_1 || '',
        prestacion_2: row.PRESTACION_2 || '',
        prestacion_3: row.PRESTACION_3 || '',
        prevision: row.PREVISION || '',
        problema_salud: row.PROBLEMA_SALUD || '',
        sexo: row.SEXO || '',
        tipo_consulta: row.TIPO_CONSULTA || '',
        fecha_atencion: row.FECHA_ATENCION || null,
        procedencia: row.PROCEDENCIA || '',
        pertinencia: row.PERTINENCIA || '',
        tiempo_establecido_pertinencia: row.TIEMPO_ESTABLECIDO_PERTINENCIA || '',
        grupo_actividad: row.GRUPO_ACTIVIDAD || '',
        nacionalidad: row.NACIONALIDAD || '',
        pueblo_originario: row.PUEBLO_ORIGINARIO || '',
        hip_diagnostica: row.HIP_DIAGNOSTICA || '',
        tipo_atencion_programada: row.TIPO_ATENCION_PROGRAMADA || '',
        tipo_atencion_realizada: row.TIPO_ATENCION_REALIZADA || '',
        contrareferir_establecimiento: row.CONTRAREFERIR_ESTABLECIMIENTO || '',
        contrareferir: row.CONTRAREFERIR || '',
        videoconsulta: row.VIDEOCONSULTA || '',
        sobrecupo: row.SOBRECUPO || ''
      };
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

    const outPath = path.join(cacheDir, 'actividades_medicina_cached.json');
    fs.writeFileSync(outPath, JSON.stringify(output), 'utf-8');

    const sizeKB = Math.round(fs.statSync(outPath).size / 1024);
    console.log(`      ✓ Guardado en: ${outPath}`);
    console.log(`      ✓ Tamaño: ${sizeKB.toLocaleString('es-CL')} KB`);
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
