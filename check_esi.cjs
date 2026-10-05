const odbc = require('odbc');

async function checkEsiTable() {
  try {
    const conn = await odbc.connect('DSN=dwh.dssasur.cl;Uid=ghperez;Pwd=Josefa20');
    console.log('Inspeccionando URGENCIA.D_FORMULARIO_ESI...');

    const cols = await conn.query("SELECT COLUMN_NAME, DATA_TYPE FROM ALL_TAB_COLUMNS WHERE OWNER = 'URGENCIA' AND TABLE_NAME = 'D_FORMULARIO_ESI'");
    console.log('Columnas de D_FORMULARIO_ESI:', cols.map(c => c.COLUMN_NAME));

    // Ver si en D_ADMISION o D_CIERRE_ATENCION hay columnas con nombres Discoverer
    // En Discoverer las carpetas tienen items como O239378.CATEGORIZACION_LE o O239491.CATEGORIZACION
    console.log('\nValores de CATEGORIZACION en D_CIERRE_ATENCION:');
    const q1 = await conn.query("SELECT DISTINCT CATEGORIZACION FROM URGENCIA.D_CIERRE_ATENCION WHERE ROWNUM <= 20");
    console.log(q1);

    console.log('\nValores de CATEGORIZACION_LE en D_ADMISION:');
    const q2 = await conn.query("SELECT DISTINCT CATEGORIZACION_LE FROM URGENCIA.D_ADMISION WHERE ROWNUM <= 20");
    console.log(q2);

    await conn.close();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

checkEsiTable();
