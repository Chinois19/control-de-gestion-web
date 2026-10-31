/**
 * fetch-consultas-odontologicas.cjs
 * ─────────────────────────────────
 * Extrae Consultas y Controles Odontológicos (BICS.DWP_F_RCE_ODO_ESPEC) desde
 * la ODBC Oracle "dwh.dssasur.cl" (consulta Discoverer) y los guarda en:
 *   public/data/consultas_odontologicas_cached.json(.gz)
 *
 * Uso:
 *   node fetch-consultas-odontologicas.cjs
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

const FECHA_EXPR = `(decode(o1519312.FECHA_ATENCION,null,to_date(null, 'MMDDYYYY'),to_date(to_char(trunc(o1519312.FECHA_ATENCION,'DD'),'YYYYMMDD') || '','YYYYMMDD')))`;

const ACT_COLS = [];
for (let i = 1; i <= 12; i++) {
  ACT_COLS.push(`o1519312.ACT_CODIGO_${i}`, `o1519312.ACT_PROCEDIMIENTO_${i}`);
}

const COLS = [
  `CASE WHEN o1519312.TC_TIPO_CONSULTA = 'CONSULTA NUEVA' THEN 'a) CONSULTA NUEVA' ELSE CASE WHEN o1519312.TC_TIPO_CONSULTA IN ('CONTROL','CONTROL POST REEVALUACION APS') THEN 'b) CONTROL' ELSE CASE WHEN o1519312.TC_TIPO_CONSULTA = 'CONTROL DE ESPECIALIDAD POST ALTA' THEN 'c) CONTROL DE ESPECIALIDAD POST ALTA' ELSE CASE WHEN o1519312.TC_TIPO_CONSULTA = 'TELECONSULTA POR CONTINGENCIA COVID-19' THEN 'd) TELECONSULTA POR CONTINGENCIA COVID-19' END END END END`,
  'o1518902.SEXO', 'o1518902.PREVISION', 'o1518902.PRAIS', 'o1518902.NACIONALIDAD', 'o1518902.PUEBLO_ORIGINARIO',
  'o1519312.ESTABLECIMIENTO', 'o1519312.BENEFICIARIO_RCE', 'o1519312.CTA_CTE', 'o1519312.ESTADO_CTA_CTE',
  'o1519312.ESTADO_HORA', 'o1519312.ESTADO_ATENCION', 'o1519312.ACCION_A_TOMAR', 'o1519312.TIPO_ATENCION_PROGRAMADA',
  'o1519312.CONTRAREFERIR_ESTABLECIMIENTO', 'o1519312.CONTRAREFERIR', 'o1519312.DG_AUGE_1',
  'o1519312.IC_ASOC_HORA', 'o1519312.IC_ESTAB_ORIGEN', 'o1519312.IC_FECHA', 'o1519312.IC_DIAGNOSTICO', 'o1519312.IC_ESTADO_AUGE',
  FECHA_EXPR,
  'o1519312.TC_TIPO_CONSULTA', 'o1519312.TC_PERTINENCIA_PROTOCOLO_REF', 'o1519312.TC_PERTINENCIA_CONDICION_CLIN',
  ...ACT_COLS,
  'o1519312.RUT_PROFESIONAL', 'o1519312.NOMBRE_PROFESIONAL', 'o1519312.APELLIDO_PAT_PROF', 'o1519312.APELLIDO_MAT_PROF',
  'o1519312.ESPECIALIDAD_POLI', 'o1519312.SUB_ESPECIALIDAD_POLI', 'o1519312.POLICLINICO',
  'o1518902.SITUACION_CALLE', 'o1518902.ES_DISCAPACITADA', 'o1518902.ES_SENAME', 'o1518902.ES_EMBARAZADA',
  'o1519312.IC_PRIORIDAD_DESTINO'
];

// Alias estables (C_1, C_2, ...) para evitar problemas con nombres duplicados / acentos.
const SELECT_LIST = COLS.map((c, i) => `${c} AS C_${i + 1}`).join(',\n  ');
const GROUP_LIST  = COLS.join(',\n  ');

const SQL = `
SELECT
  ${SELECT_LIST},
  SUM(o1519312.EDAD_AÑOS_PAC_RCE) AS EDAD_SUM,
  COUNT(*) AS N
FROM BICS.DWP_D_PACIENTE o1518902,
     BICS.DWP_F_RCE_ODO_ESPEC o1519312
WHERE ( (o1518902.ID_PACIENTE = o1519312.ID_PACIENTE))
  AND (o1519312.ESTABLECIMIENTO IN ('VILLARRICA HOSP.'))
  AND (${FECHA_EXPR} <= TO_DATE('20300731000000','YYYYMMDDHH24MISS'))
  AND (${FECHA_EXPR} >= TO_DATE('20240101000000','YYYYMMDDHH24MISS'))
GROUP BY ${GROUP_LIST}
`;

// Índices (1-based) de columnas en COLS
const IDX = {};
[
  'tipo', 'sexo', 'prevision', 'prais', 'nacionalidad', 'pueblo_originario',
  'establecimiento', 'beneficiario_rce', 'cta_cte', 'estado_cta_cte',
  'estado_hora', 'estado_atencion', 'accion_a_tomar', 'tipo_atencion_programada',
  'contrareferir_establecimiento', 'contrareferir', 'dg_auge_1',
  'ic_asoc_hora', 'ic_estab_origen', 'ic_fecha', 'ic_diagnostico', 'ic_estado_auge',
  'fecha_atencion', 'tc_tipo_consulta', 'pertinencia_protocolo', 'pertinencia_condicion'
].forEach((k, i) => { IDX[k] = i + 1; });
const ACT_START = 27; // C_27 .. C_50
const PROF_START = ACT_START + 24; // 51
const IDX2 = {
  rut_profesional: PROF_START, nombre_profesional: PROF_START + 1,
  apellido_pat: PROF_START + 2, apellido_mat: PROF_START + 3,
  especialidad_poli: PROF_START + 4, sub_especialidad_poli: PROF_START + 5, policlinico: PROF_START + 6,
  situacion_calle: PROF_START + 7, discapacitada: PROF_START + 8, sename: PROF_START + 9, embarazada: PROF_START + 10,
  prioridad_destino: PROF_START + 11
};

const clean = (v) => (v === null || v === undefined) ? '' : String(v).trim();

async function run() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(' Consultas y Controles Odontológicos - Extractor ODBC');
  console.log(` DSN: ${DSN} | Usuario: ${USER}`);
  console.log(' Fecha:', new Date().toLocaleString('es-CL'));
  console.log('═══════════════════════════════════════════════════════════');

  let connection;
  try {
    console.log('\n[1/4] Conectando a Oracle via ODBC...');
    connection = await odbc.connect(CONNECTION_STRING);
    console.log('      ✓ Conexión establecida.');

    console.log('\n[2/4] Ejecutando consulta SQL...');
    const t0 = Date.now();
    const result = await connection.query(SQL);
    console.log(`      ✓ ${result.length.toLocaleString('es-CL')} filas en ${((Date.now() - t0) / 1000).toFixed(1)}s`);

    console.log('\n[3/4] Compactando registros...');
    const records = result.map(row => {
      const g = (i) => clean(row[`C_${i}`]);
      const o = {};
      const set = (k, v) => { if (v) o[k] = v; };

      for (const k of Object.keys(IDX)) {
        let v = g(IDX[k]);
        if (k === 'fecha_atencion' || k === 'ic_fecha') v = v ? (row[`C_${IDX[k]}`] instanceof Date
          ? row[`C_${IDX[k]}`].toISOString().substring(0, 10) : v.substring(0, 10)) : '';
        set(k, v);
      }
      const acts = [];
      for (let i = 0; i < 12; i++) {
        const cod = g(ACT_START + i * 2);
        const proc = g(ACT_START + i * 2 + 1);
        if (cod || proc) acts.push([cod, proc]);
      }
      if (acts.length) o.actividades = acts;

      const nombre = [g(IDX2.nombre_profesional), g(IDX2.apellido_pat), g(IDX2.apellido_mat)].filter(Boolean).join(' ');
      set('rut_profesional', g(IDX2.rut_profesional));
      set('profesional', nombre);
      set('especialidad_poli', g(IDX2.especialidad_poli));
      set('sub_especialidad_poli', g(IDX2.sub_especialidad_poli));
      set('policlinico', g(IDX2.policlinico));
      set('situacion_calle', g(IDX2.situacion_calle));
      set('discapacitada', g(IDX2.discapacitada));
      set('sename', g(IDX2.sename));
      set('embarazada', g(IDX2.embarazada));
      set('prioridad_destino', g(IDX2.prioridad_destino));
      if (row.EDAD_SUM !== null && row.EDAD_SUM !== undefined) o.edad = Number(row.EDAD_SUM);
      o.n = Number(row.N) || 1;
      return o;
    });

    console.log('\n[4/4] Guardando JSON en public/data...');
    const cacheDir = path.join(__dirname, 'public', 'data');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const output = { lastUpdated: new Date().toISOString(), totalRecords: records.length, records };
    const buf = Buffer.from(JSON.stringify(output), 'utf-8');
    const outPath = path.join(cacheDir, 'consultas_odontologicas_cached.json');
    fs.writeFileSync(outPath, buf);
    const gz = zlib.gzipSync(buf, { level: 9 });
    fs.writeFileSync(outPath + '.gz', gz);
    console.log(`      ✓ ${outPath} (${(buf.length / 1048576).toFixed(2)} MB)`);
    console.log(`      ✓ ${outPath}.gz (${(gz.length / 1048576).toFixed(2)} MB)`);
  } catch (err) {
    console.error('\n❌ Error en extracción ODBC:', err.message || err);
    if (err.odbcErrors) console.error(JSON.stringify(err.odbcErrors, null, 2));
    process.exit(1);
  } finally {
    if (connection) await connection.close();
  }
}

run();

