/**
 * fetch-lista-espera.cjs
 * ──────────────────────
 * Extrae los datos de Lista de Espera de Consultas (interconsultas) desde
 * la ODBC Oracle "dwh.dssasur.cl" y los guarda como JSON en:
 *   public/data/lista_espera_cached.json
 *
 * Uso:
 *   node fetch-lista-espera.cjs
 *
 * Requiere que la VPN institucional esté activa y el DSN ODBC configurado.
 */

'use strict';

const odbc = require('odbc');
const fs   = require('fs');
const path = require('path');

// ─── Configuración de conexión ────────────────────────────────────────────────
// DSN configurado en el sistema (Panel de control → ODBC de Windows)
const DSN      = 'dwh.dssasur.cl';
const USER     = 'ghperez';
const PASSWORD = 'Josefa20';

const CONNECTION_STRING = `DSN=${DSN};UID=${USER};PWD=${PASSWORD};`;

// ─── Query principal ──────────────────────────────────────────────────────────
const SQL = `
SELECT
  O102782.NUM_INTERCONSULTA,
  O102782.ESTABLECIMIENTO_ORIGEN,
  O102782.ESTADO_IC,
  O102782.ESTABLECIMIENTO_DESTINO,
  O102782.ESPECIALIDAD_DESTINO,
  O102782.POLICLINICO_DESTINO,
  O102782.COD_DIAGNO,
  O102782.NOM_DIAGNOSTICO,
  O102823.DOMICILIO,
  O102823.COMUNA,
  O102823.SEXO,
  O102823.FECHA_NACIMIENTO,
  O102858.RUT_PROF_DERIVA,
  O102858.DV_PROF_DERIVA,
  O102858.APEPAT_PROF_DERIVA,
  O102858.APEMAT_PROF_DERIVA,
  O102858.NOMBRE_PROF_DERIVA,
  O102823.PREVISION,
  O102823.URBANO_RURAL,
  DECODE(O102782.FECHA_IC, NULL, TO_DATE(NULL,'MMDDYYYY'),
         TO_DATE(TO_CHAR(TRUNC(O102782.FECHA_IC,'DD'),'YYYYMMDD')||'','YYYYMMDD')) AS FECHA_IC,
  O102823.PRAIS,
  O102782.COMUNA_ESTAB_ORIGEN,
  O120750.FONO1,
  O102782.GESTION_INTERCONSULTA
FROM
  INTERCONSULTA.INTERCONSULTA O102782,
  INTERCONSULTA.PACIENTE       O102823,
  INTERCONSULTA.PROFESIONAL_DERIVA O102858,
  INTERCONSULTA.FONOS_PACIENTES_IC O120750
WHERE
  ( O102782.ID = O102858.ID )
  AND ( O102782.ID = O102823.ID )
  AND ( O102782.ID = O120750.INTERCONSULTA_ID )
  AND ( O102782.ESTABLECIMIENTO_DESTINO = 'VILLARRICA HOSP.' )
  AND (
    DECODE(O102782.FECHA_IC, NULL, TO_DATE(NULL,'MMDDYYYY'),
           TO_DATE(TO_CHAR(TRUNC(O102782.FECHA_IC,'DD'),'YYYYMMDD')||'','YYYYMMDD'))
    <= TO_DATE('20300807000000','YYYYMMDDHH24MISS')
  )
  AND ( O102823.PREVISION IN ('FONASA - A','FONASA - B','FONASA - C','FONASA - D') )
  AND ( O102782.ESPECIALIDAD_DESTINO IN (
    'ANESTESIOLOGIA','BRONCOPULMONAR ADULTO','BRONCOPULMONAR INFANTIL',
    'CARDIOCIRUGIA ADULTO','CARDIOLOGIA','CARDIOLOGIA ADULTO','CARDIOLOGIA INFANTIL',
    'CARDIOLOGIA PEDIATRICA','CIRUGIA  PLASTICA','CIRUGIA ABDOMINAL','CIRUGIA BUCAL',
    'CIRUGIA CABEZA CUELLO Y MAXILOFACIAL','CIRUGIA CABEZA Y CUELLO',
    'CIRUGIA CARDIOVASCULAR','CIRUGIA DIGESTIVA','CIRUGIA DIGESTIVA ALTA',
    'CIRUGIA GENERAL','CIRUGIA GENERAL ADULTO','CIRUGIA GENERAL INFANTIL',
    'CIRUGIA MAMAS','CIRUGIA PEDIATRICA','CIRUGIA PLASTICA Y REPARADORA',
    'CIRUGIA PLASTICA Y REPARADORA ADULTO','CIRUGIA PROCTOLOGICA','CIRUGIA TORAX',
    'CIRUGIA VASCULAR','CIRUGIA VASCULAR PERIFERICA',
    'CIRUGIA Y TRAUMATOLOGIA BUCO MAXILOFACIAL','COLOPROCTOLOGIA','DERMATOLOGIA',
    'DIABETOLOGIA','ENDOCRINOLOGIA ADULTO','ENDOCRINOLOGIA INFANTIL',
    'ENDOCRINOLOGIA PEDIATRICA','ENDODONCIA',
    'ENFERMEDAD RESPIRATORIA DE ADULTO (BRONCOPULMONAR)',
    'ENFERMEDADES RESPIRATORIAS PEDIATRICAS (BRONCOPULMONAR PEDIATRICO)',
    'FISIATRIA','GASTROENTEROLOGIA','GASTROENTEROLOGIA ADULTO',
    'GASTROENTEROLOGIA INFANTIL','GASTROENTEROLOGIA PEDIATRICA',
    'GENETICA CLINICA','GENETICA INFANTIL','GERIATRIA','GINECOLOGIA',
    'GINECOLOGIA ADULTO','GINECOLOGIA GENERAL','GINECOLOGIA GENERAL ADULTO',
    'GINECOLOGIA ONCOLOGICA','GINECOLOGIA PEDIATRICA Y DE LA ADOLESCENCIA',
    'HEMATOLOGIA','HEMATOLOGIA ADULTO','HEMATO-ONCOLOGIA PEDIATICA',
    'IMPLANTOLOGIA BUCO MAXILOFACIAL','INFECTOLOGIA','INFECTOLOGIA PEDIATRICA',
    'INMUNOLOGIA','MASTOLOGIA','MEDICINA FAMILIAR','MEDICINA FISICA Y REHABILITACION',
    'MEDICINA FÍSICA Y REHABILITACIÓN ADULTO (FISIATRÍA ADULTO)',
    'MEDICINA FISICA Y REHABILITACION (FISIATRIA ADULTO)',
    'MEDICINA FISICA Y REHABILITACION PEDIATRICA (FISIATRIA PEDIATRICA)',
    'MEDICINA INTEGRATIVA','MEDICINA INTERNA','MEDICINA MATERNO FETAL',
    'NEFROLOGIA ADULTO','NEFROLOGIA INFANTIL','NEFROLOGIA PEDIATRICA',
    'NEONATOLOGIA','NEUROCIRUGIA','NEUROLOGIA','NEUROLOGIA ADULTO',
    'NEUROLOGIA INFANTIL','NEUROLOGIA PEDIATRICA','NUTRIOLOGA','OBSTETRICIA',
    'OBSTETRICIA GENERAL','OBSTETRICIA Y GINECOLOGIA',
    'ODONT. OPERAT. Y REHAB. PROT. REMOV.','ODONT. PACIENTES ESPECIALES',
    'ODONT. REHAB. PROTESIS','ODONTOGERIATRIA','ODONTOLOGIA CIRUGIA MAXILOFACIAL',
    'ODONTOLOGIA CUIDADOS ESPECIALES','ODONTOLOGIA ENDODONCIA',
    'ODONTOLOGIA ESPECIALIDAD','ODONTOLOGIA GENERAL','ODONTOLOGIA GES 60 AÑOS',
    'ODONTOLOGIA OPERATORIA','ODONTOLOGIA ORTODONCIA','ODONTOLOGIA PERIODONCIA',
    'ODONTOLOGIA RADIOLOGIA','ODONTOPEDIATRIA','OFTALMOLOGIA','OFTALMOLOGIA ADULTO',
    'ONCOLOGIA ADULTO','ORTODONCIA Y ORTOPEDIA DENTO MAXILO FACIAL',
    'ORTODONCIA Y ORTOPEDIA MAXILOFACIAL','OTORRINOLARINGOLOGIA',
    'PATOLOGIA CERVICAL','PATOLOGIA MAMARIA','PATOLOGIA ORAL','PEDIATRIA',
    'PEDIATRIA GENERAL','PERIODONCIA','PSICOPEDAGOGIA','PSIQUIATRIA ADULTO',
    'PSIQUIATRIA INFANTIL','PSIQUIATRIA PEDIATRICA Y DE LA ADOLESCENCIA',
    'RADIOLOGIA','RADIOLOGIA INTERVENCIONISTA','REHAB. ORAL PROTESIS REMOVIBLE',
    'REHAB. PROTESIS FIJA','REHABILITACION ORAL','REHABILITACION ORAL: PROTESIS FIJA',
    'REHABILITACION ORAL: PROTESIS REMOVIBLE','REUMATOLOGIA','REUMATOLOGIA ADULTO',
    'REUMATOLOGIA PEDIATRICA','SOMATO - PROTESIS','TECNOLOGO MEDICO OFTALMOLOGIA',
    'TRANSTORNOS TEMPOROMANDIBULARES Y DOLOR OROFACIAL',
    'TRASTORNO TEMPOROMANDIBULAR Y DOLOR OROFACIAL','TRAUMATOLOGIA',
    'TRAUMATOLOGIA ADULTO','TRAUMATOLOGIA ADULTO COLUMNA','TRAUMATOLOGIA INFANTIL',
    'TRAUMATOLOGIA Y ORTOPEDIA','TRAUMATOLOGIA Y ORTOPEDIA ADULTO',
    'TRAUMATOLOGIA Y ORTOPEDIA PEDIATRICA','UROLOGIA','UROLOGIA ADULTO',
    'UROLOGIA INFANTIL','UROLOGIA PEDIATRICA'
  ) )
  AND ( O102782.ESTADO_IC IN (
    'DIGITADA','MODIFICADA','POR AGENDAR','AGENDADA','EN LISTA DE ESPERA'
  ) )
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Devuelve las especialidades odontológicas (para clasificación automática)
 */
const ODONTO_KEYWORDS = [
  'ODONT', 'ENDODONCIA', 'PERIODONCIA', 'ORTODONCIA', 'IMPLANTOLOGIA',
  'ODONTOGERIATRIA', 'ODONTOPEDIATRIA', 'PATOLOGIA ORAL', 'REHAB. ORAL',
  'REHABILITACION ORAL', 'SOMATO - PROTESIS', 'TRANSTORNO TEMPOROMANDIBULAR',
  'TRASTORNO TEMPOROMANDIBULAR', 'CIRUGIA Y TRAUMATOLOGIA BUCO',
  'CIRUGIA BUCAL', 'CIRUGIA CABEZA CUELLO Y MAXILOFACIAL', 'PATOLOGIA CERVICAL'
];

function esEspecialidadOdontologica(especialidad) {
  if (!especialidad) return false;
  const up = especialidad.toUpperCase();
  return ODONTO_KEYWORDS.some(k => up.includes(k));
}

/**
 * Calcula días de espera a partir de FECHA_IC hasta hoy
 */
function calcularDiasEspera(fechaIc) {
  if (!fechaIc) return null;
  try {
    const fecha = new Date(fechaIc);
    if (isNaN(fecha.getTime())) return null;
    const hoy = new Date();
    const diff = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : null;
  } catch {
    return null;
  }
}

/**
 * Calcula la edad en años a partir de FECHA_NACIMIENTO
 */
function calcularEdad(fechaNac) {
  if (!fechaNac) return null;
  try {
    const fn = new Date(fechaNac);
    if (isNaN(fn.getTime())) return null;
    const hoy = new Date();
    let edad = hoy.getFullYear() - fn.getFullYear();
    const m = hoy.getMonth() - fn.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fn.getDate())) edad--;
    return edad >= 0 ? edad : null;
  } catch {
    return null;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(' Lista de Espera - Extractor ODBC Oracle');
  console.log(` DSN: ${DSN}  |  Usuario: ${USER}`);
  console.log(' Fecha:', new Date().toLocaleString('es-CL'));
  console.log('═══════════════════════════════════════════════════════════');

  let connection;
  try {
    console.log('\n[1/4] Conectando a la base de datos...');
    connection = await odbc.connect(CONNECTION_STRING);
    console.log('      ✓ Conexión establecida correctamente.');

    console.log('\n[2/4] Ejecutando consulta SQL (puede tardar 1-3 minutos)...');
    const startTime = Date.now();
    const result = await connection.query(SQL);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`      ✓ Consulta completada en ${elapsed}s. Filas obtenidas: ${result.length.toLocaleString('es-CL')}`);

    console.log('\n[3/4] Procesando y enriqueciendo registros...');
    const records = result.map(row => {
      const especialidad = row.ESPECIALIDAD_DESTINO || '';
      const diasEspera   = calcularDiasEspera(row.FECHA_IC);
      const edad         = calcularEdad(row.FECHA_NACIMIENTO);
      const tipoLE       = esEspecialidadOdontologica(especialidad) ? 'Odontológica' : 'Médica';

      return {
        num_interconsulta:     row.NUM_INTERCONSULTA,
        establecimiento_origen: row.ESTABLECIMIENTO_ORIGEN,
        estado_ic:             row.ESTADO_IC,
        especialidad_destino:  especialidad,
        policlinico_destino:   row.POLICLINICO_DESTINO,
        cod_diagno:            row.COD_DIAGNO,
        nom_diagnostico:       row.NOM_DIAGNOSTICO,
        sexo:                  row.SEXO,
        prevision:             row.PREVISION,
        urbano_rural:          row.URBANO_RURAL,
        prais:                 row.PRAIS,
        comuna:                row.COMUNA,
        comuna_estab_origen:   row.COMUNA_ESTAB_ORIGEN,
        fecha_ic:              row.FECHA_IC,
        gestion_interconsulta: row.GESTION_INTERCONSULTA,
        // Campos enriquecidos (sin datos sensibles de paciente)
        tipo_lista_espera:     tipoLE,
        dias_espera:           diasEspera,
        edad:                  edad,
        // Tramo de espera para agrupación visual
        tramo_espera: diasEspera === null ? 'Sin fecha'
          : diasEspera <= 90   ? '0-90 días'
          : diasEspera <= 180  ? '91-180 días'
          : diasEspera <= 365  ? '181-365 días'
          : diasEspera <= 540  ? '366-540 días'
          : '> 540 días'
      };
    });

    console.log(`      ✓ ${records.length.toLocaleString('es-CL')} registros procesados.`);

    // ── Guardar en public/data/ ──────────────────────────────────────────────
    console.log('\n[4/4] Guardando archivo JSON...');
    const cacheDir = path.join(__dirname, 'public', 'data');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const output = {
      lastUpdated: new Date().toISOString(),
      totalRecords: records.length,
      records
    };

    const outPath = path.join(cacheDir, 'lista_espera_cached.json');
    fs.writeFileSync(outPath, JSON.stringify(output), 'utf-8');

    const sizeKB = Math.round(fs.statSync(outPath).size / 1024);
    console.log(`      ✓ Archivo guardado: ${outPath}`);
    console.log(`      ✓ Tamaño: ${sizeKB.toLocaleString('es-CL')} KB`);

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(' Extracción completada exitosamente.');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('\n❌ ERROR durante la extracción:');
    console.error('   ', err.message || err);
    console.error('\n   Posibles causas:');
    console.error('   • VPN no está activa');
    console.error('   • DSN "dwh.dssasur.cl" no está configurado en ODBC de Windows');
    console.error('   • Credenciales incorrectas');
    console.error('   • La consulta tardó demasiado (timeout)');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.close();
      console.log('[INFO] Conexión cerrada.');
    }
  }
}

run();
