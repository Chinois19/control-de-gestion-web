const odbc = require('odbc');

async function testQuery() {
  const sql = `
  SELECT 
    COUNT(*) as total,
    COUNT(DISTINCT O239378.DAU) as total_dau,
    MIN(O239378.FECHA_ADMISION) as min_fecha,
    MAX(O239378.FECHA_ADMISION) as max_fecha
  FROM URGENCIA.D_ADMISION O239378, URGENCIA.D_CIERRE_ATENCION O239491, URGENCIA.D_PACIENTE O239642, URGENCIA.D_SIGNOS_VITALES O245244
  WHERE ( ( O239378.DAU = O239642.DAU ) AND ( O239378.DAU = O239491.DAU ) AND ( O239378.DAU = O245244.DAU ) )
    AND ( O239491.FECHA_CIERRE_FINAL <= TO_DATE('20270101000000','YYYYMMDDHH24MISS') )
    AND ( O239491.FECHA_CIERRE_FINAL >= TO_DATE('20260101000000','YYYYMMDDHH24MISS') )
    AND ( O239378.ESTABLECIMIENTO = 'VILLARRICA HOSP.' )
  `;
  try {
    const conn = await odbc.connect('DSN=dwh.dssasur.cl;Uid=ghperez;Pwd=Josefa20');
    console.log('Conectado a Oracle DWH via ODBC. Ejecutando conteo...');
    const res = await conn.query(sql);
    console.log('Estadísticas de la consulta:', JSON.stringify(res, null, 2));

    console.log('Probando obtención de una muestra de 2 registros...');
    const sampleSql = `
    SELECT * FROM (
      SELECT 
        O239378.DAU, 
        O239378.ESTADO_ATENCION, 
        O239378.TIPO_CONSULTA, 
        O239491.CATEGORIZACION, 
        O239642.EDAD_ANOS, 
        O239378.CATEGORIZACION_LE, 
        O239491.DESTINO_INMEDIATO, 
        O245244.FECHA_TOMA_MUESTRA_1, 
        O239491.NUMERO_ATENCIONES, 
        O239642.TIPO_PACIENTE, 
        O239491.TIPO_PROFESIONAL, 
        O239491.DESTINO_ESPECIFICO,
        O239378.FECHA_ADMISION,
        O239491.FECHA_CIERRE,
        O239491.FECHA_CIERRE_FINAL,
        O239491.DESTINO_ALTA_DOMICILIO
      FROM URGENCIA.D_ADMISION O239378, URGENCIA.D_CIERRE_ATENCION O239491, URGENCIA.D_PACIENTE O239642, URGENCIA.D_SIGNOS_VITALES O245244
      WHERE ( ( O239378.DAU = O239642.DAU ) AND ( O239378.DAU = O239491.DAU ) AND ( O239378.DAU = O245244.DAU ) ) 
        AND ( O239491.FECHA_CIERRE_FINAL <= TO_DATE('20270101000000','YYYYMMDDHH24MISS') ) 
        AND ( O239491.FECHA_CIERRE_FINAL >= TO_DATE('20260101000000','YYYYMMDDHH24MISS') ) 
        AND ( O239378.ESTABLECIMIENTO = 'VILLARRICA HOSP.' )
    ) WHERE ROWNUM <= 2
    `;
    const sampleRes = await conn.query(sampleSql);
    console.log('Muestra:', JSON.stringify(sampleRes, null, 2));

    await conn.close();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testQuery();
