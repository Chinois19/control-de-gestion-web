const odbc = require('odbc');

async function testTiempoAtencionPorTipo() {
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
    O239491.FECHA_CIERRE as fecha_inicio_atencion,
    O239491.FECHA_CIERRE_FINAL as fecha_cierre_final,
    O239378.FECHA_ADMISION as fecha_admision,
    O239642.EDAD_ANOS as edad,
    O239378.ESTADO_ATENCION as estado_atencion
  FROM URGENCIA.D_ADMISION O239378, URGENCIA.D_CIERRE_ATENCION O239491, URGENCIA.D_PACIENTE O239642, URGENCIA.D_SIGNOS_VITALES O245244
  WHERE ( ( O239378.DAU = O239642.DAU ) AND ( O239378.DAU = O239491.DAU ) AND ( O239378.DAU = O245244.DAU ) ) 
    AND ( O239491.FECHA_CIERRE_FINAL <= TO_DATE('20270101000000','YYYYMMDDHH24MISS') ) 
    AND ( O239491.FECHA_CIERRE_FINAL >= TO_DATE('20260101000000','YYYYMMDDHH24MISS') ) 
    AND ( O239378.ESTABLECIMIENTO = 'VILLARRICA HOSP.' )
    AND ( O239378.CATEGORIZACION_LE = 'C2' )
  `;

  try {
    const conn = await odbc.connect('DSN=dwh.dssasur.cl;Uid=ghperez;Pwd=Josefa20');
    const rows = await conn.query(sql);

    function clasificarTipoEspecialidad(row) {
      const esps = [row.ESP1, row.ESP2, row.ESP3, row.ESP4, row.ESP5]
        .filter(v => v !== null && v !== undefined && String(v).trim() !== '')
        .map(v => String(v).trim().toUpperCase());

      if (esps.length === 0) return 'SIN REGISTRO / NO ESPECIFICADO';
      const hasGineco = esps.some(e => e.includes('GINECOLOGIA') || e.includes('OBSTETRICIA'));
      if (hasGineco) return 'MEDICO GINECO-OBSTETRA';
      const allMatrona = esps.every(e => e.includes('MATRON'));
      if (allMatrona) return 'MATRON(A)';
      return 'MEDICO ADULTO Y NIÑO';
    }

    const stats = {
      'MEDICO ADULTO Y NIÑO': { total: 0, le30: 0, gt30: 0, sumMin: 0, minTimes: [], maxTime: -Infinity, minTime: Infinity },
      'MEDICO GINECO-OBSTETRA': { total: 0, le30: 0, gt30: 0, sumMin: 0, minTimes: [], maxTime: -Infinity, minTime: Infinity },
      'MATRON(A)': { total: 0, le30: 0, gt30: 0, sumMin: 0, minTimes: [], maxTime: -Infinity, minTime: Infinity }
    };

    const monthlyStats = {};

    rows.forEach(r => {
      const tipo = clasificarTipoEspecialidad(r);
      const tAtencion = new Date(r.FECHA_INICIO_ATENCION).getTime();
      const tMuestra = new Date(r.FECHA_TOMA_MUESTRA).getTime();
      let diffMin = Math.round((tAtencion - tMuestra) / (1000 * 60));
      if (diffMin < 0) diffMin = 0; // Si fue simultáneo o triage posterior

      if (stats[tipo]) {
        stats[tipo].total++;
        stats[tipo].sumMin += diffMin;
        stats[tipo].minTimes.push(diffMin);
        if (diffMin <= 30) stats[tipo].le30++;
        else stats[tipo].gt30++;
        if (diffMin > stats[tipo].maxTime) stats[tipo].maxTime = diffMin;
        if (diffMin < stats[tipo].minTime) stats[tipo].minTime = diffMin;
      }

      // Mensual
      const monthKey = r.FECHA_INICIO_ATENCION ? String(r.FECHA_INICIO_ATENCION).substring(0, 7) : '2026-XX';
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = { total: 0, le30: 0, gt30: 0, sumMin: 0 };
      }
      monthlyStats[monthKey].total++;
      monthlyStats[monthKey].sumMin += diffMin;
      if (diffMin <= 30) monthlyStats[monthKey].le30++;
      else monthlyStats[monthKey].gt30++;
    });

    console.log('\n======================================================');
    console.log('RESULTADOS POR TIPO DE ATENCIÓN (C2):');
    console.log('======================================================');
    Object.keys(stats).forEach(k => {
      const s = stats[k];
      const pctCumple = s.total > 0 ? ((s.le30 / s.total) * 100).toFixed(2) : '0.00';
      const avgWait = s.total > 0 ? (s.sumMin / s.total).toFixed(1) : '0.0';
      console.log(`\nTipo: ${k}`);
      console.log(`  Total: ${s.total}`);
      console.log(`  <= 30 min (Cumple Meta): ${s.le30} (${pctCumple}%)`);
      console.log(`  > 30 min (Fuera de Meta): ${s.gt30} (${(100 - pctCumple).toFixed(2)}%)`);
      console.log(`  Tiempo Promedio: ${avgWait} min`);
      console.log(`  Tiempo Máx: ${s.maxTime} min`);
    });

    console.log('\n======================================================');
    console.log('EVOLUCIÓN MENSUAL META C2 (<= 30 min):');
    console.log('======================================================');
    Object.keys(monthlyStats).sort().forEach(m => {
      const ms = monthlyStats[m];
      const pct = ((ms.le30 / ms.total) * 100).toFixed(1);
      const avg = (ms.sumMin / ms.total).toFixed(1);
      console.log(`${m}: Total ${ms.total} | <=30m: ${ms.le30} (${pct}%) | >30m: ${ms.gt30} | Promedio: ${avg} min`);
    });

    await conn.close();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testTiempoAtencionPorTipo();
