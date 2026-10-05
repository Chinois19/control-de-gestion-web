const odbc = require('odbc');

async function searchDiscovererMapping() {
  try {
    const conn = await odbc.connect('DSN=dwh.dssasur.cl;Uid=ghperez;Pwd=Josefa20');
    console.log('Buscando en catálogo de Discoverer / EUL o todas las tablas con columnas similares...');

    // Ver si hay esquema EUL o DISCOVERER
    const schemasSql = `
      SELECT USERNAME FROM ALL_USERS WHERE USERNAME LIKE '%EUL%' OR USERNAME LIKE '%DISC%'
    `;
    const schemas = await conn.query(schemasSql);
    console.log('Esquemas EUL encontrados:', schemas);

    // Listar todas las columnas de las 4 tablas principales para ver los nombres exactos
    const tables = ['D_ADMISION', 'D_CIERRE_ATENCION', 'D_PACIENTE', 'D_SIGNOS_VITALES'];
    for (const t of tables) {
      const q = `SELECT COLUMN_NAME FROM ALL_TAB_COLUMNS WHERE OWNER = 'URGENCIA' AND TABLE_NAME = '${t}'`;
      const cols = await conn.query(q);
      console.log(`\nColumnas de ${t}:`);
      console.log(cols.map(c => c.COLUMN_NAME).join(', '));
    }

    await conn.close();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

searchDiscovererMapping();
