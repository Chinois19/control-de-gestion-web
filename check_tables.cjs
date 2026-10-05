const odbc = require('odbc');

async function checkDiscovererItems() {
  try {
    const conn = await odbc.connect('DSN=dwh.dssasur.cl;Uid=ghperez;Pwd=Josefa20');
    console.log('Buscando en vistas o tablas con SELECTOR / PROTOCOLO...');

    const q = `
      SELECT OWNER, TABLE_NAME, COLUMN_NAME 
      FROM ALL_TAB_COLUMNS 
      WHERE (
        COLUMN_NAME LIKE '%SELEC%' 
        OR COLUMN_NAME LIKE '%PROTO%' 
        OR COLUMN_NAME LIKE '%DEMAN%'
      )
    `;
    const res = await conn.query(q);
    console.log('Resultados encontrados:', res);

    // Revisar si existe otra tabla en URGENCIA
    const urgTables = await conn.query("SELECT TABLE_NAME FROM ALL_TABLES WHERE OWNER = 'URGENCIA'");
    console.log('\nTodas las tablas de URGENCIA:', urgTables.map(t => t.TABLE_NAME));

    await conn.close();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

checkDiscovererItems();
