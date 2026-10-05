const odbc = require('odbc');

async function findSelectorDemandaColumn() {
  try {
    const conn = await odbc.connect('DSN=dwh.dssasur.cl;Uid=ghperez;Pwd=Josefa20');
    console.log('Buscando columnas relacionadas con SELECTOR o PROTOCOLO...');

    const tables = ['D_ADMISION', 'D_CIERRE_ATENCION', 'D_PACIENTE', 'D_SIGNOS_VITALES'];
    for (const table of tables) {
      const sql = `
        SELECT COLUMN_NAME, DATA_TYPE, DATA_LENGTH 
        FROM ALL_TAB_COLUMNS 
        WHERE OWNER = 'URGENCIA' AND TABLE_NAME = '${table}'
        ORDER BY COLUMN_ID
      `;
      const cols = await conn.query(sql);
      console.log(`\n--- Tabla URGENCIA.${table} (${cols.length} columnas) ---`);
      cols.forEach(c => {
        const name = c.COLUMN_NAME;
        if (name.includes('PROTO') || name.includes('SELEC') || name.includes('DEMAND') || name.includes('CAT') || name.includes('RESULT')) {
          console.log(`  -> ${name} (${c.DATA_TYPE})`);
        }
      });
    }

    // Probar también buscar en ALL_TAB_COLUMNS para cualquier tabla en URGENCIA
    const allColsSql = `
      SELECT TABLE_NAME, COLUMN_NAME 
      FROM ALL_TAB_COLUMNS 
      WHERE OWNER = 'URGENCIA' 
        AND (
          COLUMN_NAME LIKE '%SELEC%' 
          OR COLUMN_NAME LIKE '%DEMAND%' 
          OR COLUMN_NAME LIKE '%PROTO%'
          OR COLUMN_NAME LIKE '%RESULT%'
        )
    `;
    const anyMatches = await conn.query(allColsSql);
    console.log('\n--- Coincidencias en todo el esquema URGENCIA ---');
    console.log(anyMatches);

    await conn.close();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

findSelectorDemandaColumn();
