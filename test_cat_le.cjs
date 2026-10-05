const odbc = require('odbc');

async function testCategorizaciones() {
  const sql = `
  SELECT 
    O239378.CATEGORIZACION_LE as cat_le,
    O239491.CATEGORIZACION as cat_cierre,
    COUNT(*) as cantidad
  FROM URGENCIA.D_ADMISION O239378, URGENCIA.D_CIERRE_ATENCION O239491, URGENCIA.D_PACIENTE O239642, URGENCIA.D_SIGNOS_VITALES O245244
  WHERE ( ( O239378.DAU = O239642.DAU ) AND ( O239378.DAU = O239491.DAU ) AND ( O239378.DAU = O245244.DAU ) ) 
    AND ( O239491.FECHA_CIERRE_FINAL <= TO_DATE('20270101000000','YYYYMMDDHH24MISS') ) 
    AND ( O239491.FECHA_CIERRE_FINAL >= TO_DATE('20260101000000','YYYYMMDDHH24MISS') ) 
    AND ( O239378.ESTABLECIMIENTO = 'VILLARRICA HOSP.' )
  GROUP BY O239378.CATEGORIZACION_LE, O239491.CATEGORIZACION
  ORDER BY cantidad DESC
  `;

  try {
    const conn = await odbc.connect('DSN=dwh.dssasur.cl;Uid=ghperez;Pwd=Josefa20');
    console.log('Comparando O239378.CATEGORIZACION_LE vs O239491.CATEGORIZACION...');
    const rows = await conn.query(sql);
    console.log(JSON.stringify(rows, null, 2));

    // Conteo por CAT_LE solo
    const sqlLE = `
    SELECT 
      O239378.CATEGORIZACION_LE as cat_le,
      COUNT(*) as total
    FROM URGENCIA.D_ADMISION O239378, URGENCIA.D_CIERRE_ATENCION O239491, URGENCIA.D_PACIENTE O239642, URGENCIA.D_SIGNOS_VITALES O245244
    WHERE ( ( O239378.DAU = O239642.DAU ) AND ( O239378.DAU = O239491.DAU ) AND ( O239378.DAU = O245244.DAU ) ) 
      AND ( O239491.FECHA_CIERRE_FINAL <= TO_DATE('20270101000000','YYYYMMDDHH24MISS') ) 
      AND ( O239491.FECHA_CIERRE_FINAL >= TO_DATE('20260101000000','YYYYMMDDHH24MISS') ) 
      AND ( O239378.ESTABLECIMIENTO = 'VILLARRICA HOSP.' )
    GROUP BY O239378.CATEGORIZACION_LE
    ORDER BY total DESC
    `;
    const rowsLE = await conn.query(sqlLE);
    console.log('\n--- Solo O239378.CATEGORIZACION_LE (Selector de Demanda) ---');
    console.log(JSON.stringify(rowsLE, null, 2));

    await conn.close();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testCategorizaciones();
