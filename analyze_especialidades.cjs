const odbc = require('odbc');

async function analyzeEspecialidades() {
  const sql = `
  SELECT 
    DISTINCT O239491.ESPEC_PROF_ATIENDE_1 as esp1,
             O239491.ESPEC_PROF_ATIENDE_2 as esp2,
             O239491.ESPEC_PROF_ATIENDE_3 as esp3,
             O239491.ESPEC_PROF_ATIENDE_4 as esp4,
             O239491.ESPEC_PROF_ATIENDE_5 as esp5
  FROM URGENCIA.D_ADMISION O239378, URGENCIA.D_CIERRE_ATENCION O239491, URGENCIA.D_PACIENTE O239642, URGENCIA.D_SIGNOS_VITALES O245244
  WHERE ( ( O239378.DAU = O239642.DAU ) AND ( O239378.DAU = O239491.DAU ) AND ( O239378.DAU = O245244.DAU ) ) 
    AND ( O239491.FECHA_CIERRE_FINAL <= TO_DATE('20270101000000','YYYYMMDDHH24MISS') ) 
    AND ( O239491.FECHA_CIERRE_FINAL >= TO_DATE('20260101000000','YYYYMMDDHH24MISS') ) 
    AND ( O239378.ESTABLECIMIENTO = 'VILLARRICA HOSP.' )
  `;
  try {
    const conn = await odbc.connect('DSN=dwh.dssasur.cl;Uid=ghperez;Pwd=Josefa20');
    console.log('Conectado a Oracle DWH via ODBC. Obteniendo valores únicos de especialidades...');
    const res = await conn.query(sql);
    console.log(`Combinaciones encontradas: ${res.length}`);
    
    // Extraer todos los valores individuales distintos
    const allValues = new Set();
    res.forEach(r => {
      [r.ESP1, r.ESP2, r.ESP3, r.ESP4, r.ESP5].forEach(v => {
        if (v && v.trim()) allValues.add(v.trim());
      });
    });
    console.log('Valores individuales de especialidad encontrados:');
    console.log(Array.from(allValues).sort());

    await conn.close();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

analyzeEspecialidades();
