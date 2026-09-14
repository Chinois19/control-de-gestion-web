/**
 * fetch-profesionales-aps.cjs
 * ───────────────────────────
 * Extrae los datos de Consultas y Atenciones de Profesionales No Médicos (RUP APS)
 * desde la ODBC Oracle "dwh.dssasur.cl" y los guarda como JSON optimizado en:
 *   public/data/profesionales_aps_cached.json
 *   public/data/profesionales_aps_cached.json.gz
 *
 * Uso:
 *   node fetch-profesionales-aps.cjs
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

// Consulta Discoverer oficial para RUP APS
const SQL = `
SELECT  
  CASE 
    WHEN o160871.EDAD_AÑOS_PAC_RUP < 5 THEN '(a) 0 - 4' 
    ELSE CASE 
      WHEN o160871.EDAD_AÑOS_PAC_RUP < 10 THEN '(b) 5 - 9' 
      ELSE CASE 
        WHEN o160871.EDAD_AÑOS_PAC_RUP < 15 THEN '(c) 10 - 14' 
        ELSE CASE 
          WHEN o160871.EDAD_AÑOS_PAC_RUP < 20 THEN '(d) 15 - 19' 
          ELSE CASE 
            WHEN o160871.EDAD_AÑOS_PAC_RUP < 25 THEN '(e) 20 - 24' 
            ELSE CASE 
              WHEN o160871.EDAD_AÑOS_PAC_RUP < 30 THEN '(f) 25 - 29' 
              ELSE CASE 
                WHEN o160871.EDAD_AÑOS_PAC_RUP < 35 THEN '(g) 30 - 34' 
                ELSE CASE 
                  WHEN o160871.EDAD_AÑOS_PAC_RUP < 40 THEN '(h) 35 - 39' 
                  ELSE CASE 
                    WHEN o160871.EDAD_AÑOS_PAC_RUP < 45 THEN '(i) 40 - 44' 
                    ELSE CASE 
                      WHEN o160871.EDAD_AÑOS_PAC_RUP < 50 THEN '(j) 45 - 49' 
                      ELSE CASE 
                        WHEN o160871.EDAD_AÑOS_PAC_RUP < 55 THEN '(k) 50 - 54' 
                        ELSE CASE 
                          WHEN o160871.EDAD_AÑOS_PAC_RUP < 60 THEN '(l) 55 - 59' 
                          ELSE CASE 
                            WHEN o160871.EDAD_AÑOS_PAC_RUP < 65 THEN '(m) 60 - 64' 
                            ELSE CASE 
                              WHEN o160871.EDAD_AÑOS_PAC_RUP < 70 THEN '(n) 65 - 69' 
                              ELSE CASE 
                                WHEN o160871.EDAD_AÑOS_PAC_RUP < 75 THEN '(o) 70 - 74' 
                                ELSE CASE 
                                  WHEN o160871.EDAD_AÑOS_PAC_RUP < 80 THEN '(p) 75 - 79' 
                                  ELSE CASE 
                                    WHEN o160871.EDAD_AÑOS_PAC_RUP < 120 THEN '(q) 80 y más años' 
                                    ELSE '(r) Edad errónea' 
                                  END 
                                END 
                              END 
                            END 
                          END 
                        END 
                      END 
                    END 
                  END 
                END 
              END 
            END 
          END 
        END 
      END 
    END 
  END as C_1,
  o160837.ACTIVIDAD as E160838,
  o160837.TIPO_CONSULTA as E160841,
  o160843.CODIGO_1 as E160845,
  o160843.DIAGNOSTICO_1 as E160846,
  o160843.AUGE_1 as E160847,
  o160843.PROBLEMA_SALUD_1 as E160849,
  o160843.CODIGO_2 as E160850,
  o160843.DIAGNOSTICO_2 as E160851,
  o160871.ESTADO_HORA as E160876,
  o160871.ESTADO_ATENCION as E160877,
  o160871.EDAD_AÑOS_PAC_RUP as E160880,
  o160871.CTA_CTE as E160884,
  o161077.PREVISION as E161083,
  o161077.PERCEPCION_ETNIA as E161085,
  o161077.URBANO_RURAL as E161086,
  o161077.COMUNA as E161087,
  o161077.SEXO as E161089,
  o161077.BENEFICIARIO as E161093,
  o161077.FICHA as E161094,
  o161130.PRESTACION_1 as E161133,
  o161130.PRESTACION_2 as E161136,
  o161130.PRESTACION_3 as E161139,
  o161130.PRESTACION_4 as E161142,
  o161130.PRESTACION_5 as E161152,
  o161166.RUT as E161168,
  o161166.APELLIDO_PAT as E161169,
  o161166.APELLIDO_MAT as E161170,
  o161166.NOMBRES as E161171,
  o161166.AGRUPACION as E161172,
  o161166.POLICLINICO as E161175,
  o161077.FECHA_NAC as E227996,
  o160837.GRUPO_ACTIVIDAD as E230659,
  (decode(o160871.FECHA_ATENCION,null,to_date(null, 'MMDDYYYY'),to_date(to_char(trunc(o160871.FECHA_ATENCION,'DD'),'YYYYMMDD') || '','YYYYMMDD'))) as E726311,
  (decode(o160871.FECHA_ATENCION,null,to_date(null, 'MMDDYYYY'),to_date(to_char(trunc(o160871.FECHA_ATENCION,'MI'),'HH24MI') || '19000101','HH24MIYYYYMMDD'))) as E726358,
  o160871.ACCION_A_TOMAR as E824281,
  o161077.SITUACION_CALLE as E1684115,
  o161077.ES_DISCAPACITADA as E1684116,
  o161077.ES_SENAME as E1684117,
  o161077.ES_EMBARAZADA as E1684118
FROM 
  HOJA_DIARIA.ACTIVIDAD_LISTADO_APS o160837,
  HOJA_DIARIA.DIAGNOSTICO_APS o160843,
  HOJA_DIARIA.HOJA_DIARIA_APS o160871,
  HOJA_DIARIA.PACIENTE_APS o161077,
  HOJA_DIARIA.PRESTACIONES_APS o161130,
  HOJA_DIARIA.PROFESIONAL_APS o161166
WHERE ( 
  (o161077.HORAS_GENERADAS_ID = o160871.HORA_GENERADA)
  and (o161166.HORAS_GENERADAS_ID = o160871.HORA_GENERADA)
  and (o160871.HORA_GENERADA = o160837.HG_ID(+))
  and (o160871.HORA_GENERADA = o160843.HG_ID(+))
  and (o161130.HG_ID = o160871.HORA_GENERADA(+))
)
AND (o160871.FECHA_ATENCION(+) BETWEEN TO_DATE('20250101120000','YYYYMMDDHH24MISS') AND TO_DATE('20300331120000','YYYYMMDDHH24MISS'))
AND (o161166.AGRUPACION IN (
  'Asesor Cultural','Asistente Social','Auge','Educadora','Educadora Parvulos','Enfermera(o)','Fonoaudiologo',
  'Int. Quirurgica','Kinesiologo','Matron(a)','Medico APS','ninguna','Nutricionista','Odontólogo','Podologa(o)',
  'Profesor','Psicologia','Psicopedagogo','Quimico Farmaceutico','Tecnico Enfermeria','Tecnico Paramedico',
  'Tecnico Rehabilitador','Tecnico Trabajo Social','Tecnologo Medico','Terapeuta','Terapeuta Ocupacional','VIH'
))
AND (o160871.ESTABLECIMIENTO IN ('VILLARRICA HOSP.'))
AND (o160871.ESTADO_HORA(+) NOT IN ('LIBRE'))
ORDER BY o160871.ESTADO_ATENCION DESC
`;

async function run() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(' Consultas Profesionales No Médicos (RUP APS) - Extractor ODBC');
  console.log(` DSN: ${DSN} | Usuario: ${USER}`);
  console.log(' Fecha:', new Date().toLocaleString('es-CL'));
  console.log('═══════════════════════════════════════════════════════════');

  let connection;
  try {
    console.log('\n[1/4] Conectando a la base de datos Oracle via ODBC...');
    connection = await odbc.connect(CONNECTION_STRING);
    console.log('      ✓ Conexión establecida.');

    console.log('\n[2/4] Ejecutando consulta SQL Discoverer APS...');
    const startTime = Date.now();
    const result = await connection.query(SQL);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`      ✓ Consulta ejecutada en ${elapsed}s. Filas obtenidas: ${result.length.toLocaleString('es-CL')}`);

    console.log('\n[3/4] Mapeando y compactando registros...');
    const records = result.map(row => {
      const nombreProf = [row.E161171, row.E161169, row.E161170]
        .filter(Boolean)
        .map(s => String(s).trim())
        .filter(Boolean)
        .join(' ')
        .trim();

      const obj = {};
      if (row.C_1) obj.rango_edad = String(row.C_1).trim();
      if (row.E160838) obj.actividad = String(row.E160838).trim();
      if (row.E160841) obj.tipo_consulta = String(row.E160841).trim();
      if (row.E160845) obj.codigo_diag_1 = String(row.E160845).trim();
      if (row.E160846) obj.diagnostico_1 = String(row.E160846).trim();
      if (row.E160847) obj.auge_1 = String(row.E160847).trim();
      if (row.E160849) obj.problema_salud_1 = String(row.E160849).trim();
      if (row.E160850) obj.codigo_diag_2 = String(row.E160850).trim();
      if (row.E160851) obj.diagnostico_2 = String(row.E160851).trim();
      if (row.E160876) obj.estado_hora = String(row.E160876).trim();
      if (row.E160877) obj.estado_atencion = String(row.E160877).trim();
      if (row.E160880 !== null && row.E160880 !== undefined && row.E160880 !== '') {
        obj.edad = Number(row.E160880);
      }
      if (row.E160884) obj.cta_cte = String(row.E160884).trim();
      if (row.E161083) obj.prevision = String(row.E161083).trim();
      if (row.E161085) obj.pueblo_originario = String(row.E161085).trim();
      if (row.E161086) obj.urbano_rural = String(row.E161086).trim();
      if (row.E161087) obj.comuna = String(row.E161087).trim();
      if (row.E161089) obj.sexo = String(row.E161089).trim();
      if (row.E161093) obj.beneficiario = String(row.E161093).trim();
      if (row.E161094) obj.ficha = String(row.E161094).trim();

      const prest = [row.E161133, row.E161136, row.E161139, row.E161142, row.E161152]
        .filter(Boolean)
        .map(s => String(s).trim())
        .filter(Boolean);

      if (prest.length > 0) {
        obj.prestacion_1 = prest[0];
        if (prest.length > 1) {
          obj.prestaciones = prest;
        }
      }

      if (row.E161168) obj.profesional_rut = String(row.E161168).trim();
      if (nombreProf) obj.profesional_nombre = nombreProf;
      if (row.E161172) obj.agrupacion = String(row.E161172).trim();
      if (row.E161175) obj.policlinico = String(row.E161175).trim();
      if (row.E227996) obj.fecha_nac = String(row.E227996).substring(0, 10);
      if (row.E230659) obj.grupo_actividad = String(row.E230659).trim();
      if (row.E726311) obj.fecha_atencion = String(row.E726311).substring(0, 10);
      if (row.E824281) obj.accion_a_tomar = String(row.E824281).trim();

      // Indicadores de vulnerabilidad
      if (row.E1684115 && String(row.E1684115).trim().toUpperCase() === 'SI') obj.situacion_calle = true;
      if (row.E1684116 && String(row.E1684116).trim().toUpperCase() === 'SI') obj.es_discapacitada = true;
      if (row.E1684117 && String(row.E1684117).trim().toUpperCase() === 'SI') obj.es_sename = true;
      if (row.E1684118 && String(row.E1684118).trim().toUpperCase() === 'SI') obj.es_embarazada = true;

      return obj;
    });

    console.log('\n[4/4] Guardando en public/data/profesionales_aps_cached.json (.gz)...');
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
    const outPath = path.join(cacheDir, 'profesionales_aps_cached.json');
    fs.writeFileSync(outPath, jsonBuffer);

    const outPathGz = path.join(cacheDir, 'profesionales_aps_cached.json.gz');
    const gzipped = zlib.gzipSync(jsonBuffer, { level: 9 });
    fs.writeFileSync(outPathGz, gzipped);

    const sizeMB = (jsonBuffer.length / (1024 * 1024)).toFixed(2);
    const sizeGzMB = (gzipped.length / (1024 * 1024)).toFixed(2);

    console.log(`      ✓ Archivo JSON creado: ${outPath} (${sizeMB} MB)`);
    console.log(`      ✓ Archivo GZIP creado: ${outPathGz} (${sizeGzMB} MB)`);
    console.log('\n Extracción RUP APS completada exitosamente.');

  } catch (err) {
    console.error('\n❌ ERROR durante la extracción ODBC:', err);
    process.exit(1);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('      ✓ Conexión ODBC cerrada.');
      } catch (closeErr) {
        console.error('      Error al cerrar conexión:', closeErr);
      }
    }
  }
}

run();
