const odbc = require('odbc');

async function testWaitTimeDiff() {
  const sql = `
  SELECT 
    O239378.DAU,
    O239378.CATEGORIZACION_LE as cat_le,
    O239491.ESPEC_PROF_ATIENDE_1 as esp1,
    O239491.ESPEC_PROF_ATIENDE_2 as esp2,
    O239491.ESPEC_PROF_ATIENDE_3 as esp3,
    O239491.ESPEC_PROF_ATIENDE_4 as esp4,
    O239491.ESPEC_PROF_ATIENDE_5 as esp5,
    O245244.FECHA_TOMA_MUESTRA_1 as fecha_toma_muestra,
    O239491.FECHA_CIERRE as fecha_cierre,
    O239491.FECHA_CIERRE_FINAL as fecha_cierre_final,
    O239378.FECHA_ADMISION as fecha_admision
  FROM URGENCIA.D_ADMISION O239378, URGENCIA.D_CIERRE_ATENCION O239491, URGENCIA.D_PACIENTE O239642, URGENCIA.D_SIGNOS_VITALES O245244
  WHERE ( ( O239378.DAU = O239642.DAU ) AND ( O239378.DAU = O239491.DAU ) AND ( O239378.DAU = O245244.DAU ) ) 
    AND ( O239491.FECHA_CIERRE_FINAL <= TO_DATE('20270101000000','YYYYMMDDHH24MISS') ) 
    AND ( O239491.FECHA_CIERRE_FINAL >= TO_DATE('20260101000000','YYYYMMDDHH24MISS') ) 
    AND ( O239378.ESTABLECIMIENTO = 'VILLARRICA HOSP.' )
    AND ( O239378.CATEGORIZACION_LE = 'C2' )
  `;

  try {
    const conn = await odbc.connect('DSN=dwh.dssasur.cl;Uid=ghperez;Pwd=Josefa20');
    console.log('Extrayendo C2 para análisis de fechas y tiempos...');
    const rows = await conn.query(sql);
    console.log(`Total C2 obtenidos: ${rows.length}`);

    // Muestra de las fechas de los primeros 5 registros
    console.log('Muestra de 5 registros:');
    rows.slice(0, 5).forEach((r, idx) => {
      console.log(`\nCaso ${idx + 1} (DAU: ${r.DAU}):`);
      console.log(`  Admision:     ${r.FECHA_ADMISION}`);
      console.log(`  Toma Muestra: ${r.FECHA_TOMA_MUESTRA}`);
      console.log(`  Fecha Cierre: ${r.FECHA_CIERRE}`);
      console.log(`  Cierre Final: ${r.FECHA_CIERRE_FINAL}`);
    });

    // Analizar la diferencia entre FECHA_CIERRE y FECHA_TOMA_MUESTRA
    let countMenorIgual30 = 0;
    let countMayor30 = 0;
    let countSinFecha = 0;
    let diffs = [];

    rows.forEach(r => {
      if (!r.FECHA_CIERRE || !r.FECHA_TOMA_MUESTRA) {
        countSinFecha++;
        return;
      }
      const tInicio = new Date(r.FECHA_CIERRE).getTime();
      const tMuestra = new Date(r.FECHA_TOMA_MUESTRA).getTime();
      const diffMinutos = Math.round((tInicio - tMuestra) / (1000 * 60));
      diffs.push(diffMinutos);

      if (diffMinutos <= 30 && diffMinutos >= 0) {
        countMenorIgual30++;
      } else {
        countMayor30++;
      }
    });

    console.log('\n--- Análisis preliminar FECHA_CIERRE vs FECHA_TOMA_MUESTRA ---');
    console.log(`Total analizados con ambas fechas: ${diffs.length}`);
    console.log(`<= 30 min: ${countMenorIgual30}`);
    console.log(`> 30 min: ${countMayor30}`);
    console.log(`Sin alguna de las dos fechas: ${countSinFecha}`);

    await conn.close();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testWaitTimeDiff();
