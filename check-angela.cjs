const odbc = require('odbc');

const DSN = 'dwh.dssasur.cl';
const USER = 'ghperez';
const PASSWORD = 'Josefa20';
const CONNECTION_STRING = `DSN=${DSN};UID=${USER};PWD=${PASSWORD};`;

async function main() {
  console.log('Connecting to Oracle DWH...');
  try {
    const conn = await odbc.connect(CONNECTION_STRING);
    console.log('Connected!');

    // 1. Check in PACIENTE table
    console.log('\n--- 1. Query PACIENTE table for RUT 10705093 ---');
    const qPac = await conn.query('SELECT * FROM INTERVENCION.PACIENTE WHERE RUT_PACIENTE = 10705093');
    console.log('Results in PACIENTE:', qPac);

    // 2. Check in PABELLON table for LE 749663
    console.log('\n--- 2. Query PABELLON table for LE 749663 ---');
    const qPab = await conn.query('SELECT * FROM INTERVENCION.PABELLON WHERE NUM_LE = 749663');
    console.log('Results in PABELLON:', qPab);

    // 3. Check in LISTA_ESPERA table for LE 749663
    console.log('\n--- 3. Query LISTA_ESPERA table for LE 749663 ---');
    const qLE = await conn.query('SELECT NUM_LE, ESTADO_LE, FECHA_INGRESO_LE, ESTABLECIMIENTO_ORIGEN FROM INTERVENCION.LISTA_ESPERA WHERE NUM_LE = 749663');
    console.log('Results in LISTA_ESPERA:', qLE);

    // 4. Check in IQS_2 for LE 749663
    console.log('\n--- 4. Query IQS_2 for LE 749663 ---');
    const qIq = await conn.query('SELECT * FROM INTERVENCION.IQS_2 WHERE NUM_LE = 749663');
    console.log('Results in IQS_2:', qIq);

    // 5. Check in EQUIPO_MEDICO for LE 749663
    console.log('\n--- 5. Query EQUIPO_MEDICO for LE 749663 ---');
    const qEq = await conn.query('SELECT * FROM INTERVENCION.EQUIPO_MEDICO WHERE NUM_LE = 749663');
    console.log('Results in EQUIPO_MEDICO:', qEq);

    // 6. Check DIGITACION_LE for LE 749663
    console.log('\n--- 6. Query DIGITACION_LE for LE 749663 ---');
    const qDig = await conn.query('SELECT * FROM INTERVENCION.DIGITACION_LE WHERE NUM_LE = 749663');
    console.log('Results in DIGITACION_LE:', qDig);

    await conn.close();
  } catch (err) {
    console.error('Error during execution:', err.message);
  }
}

main();
