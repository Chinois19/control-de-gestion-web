const odbc = require('odbc');

async function findInicioAtencionColumn() {
  try {
    const conn = await odbc.connect('DSN=dwh.dssasur.cl;Uid=ghperez;Pwd=Josefa20');
    console.log('Buscando columnas de fecha u hora de atención en tablas de Urgencia...');

    const q = `
      SELECT OWNER, TABLE_NAME, COLUMN_NAME, DATA_TYPE
      FROM ALL_TAB_COLUMNS 
      WHERE OWNER = 'URGENCIA' 
        AND (
          COLUMN_NAME LIKE '%FECHA%' 
          OR COLUMN_NAME LIKE '%HORA%' 
          OR COLUMN_NAME LIKE '%ATENC%'
          OR COLUMN_NAME LIKE '%INICIO%'
        )
      ORDER BY TABLE_NAME, COLUMN_NAME
    `;
    const res = await conn.query(q);
    res.forEach(r => {
      console.log(`${r.TABLE_NAME}.${r.COLUMN_NAME} (${r.DATA_TYPE})`);
    });

    await conn.close();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

findInicioAtencionColumn();
