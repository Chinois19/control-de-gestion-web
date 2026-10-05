const odbc = require('odbc');

async function countTiposAtencionPorSelectorDemanda() {
  const sql = `
  SELECT 
    O239378.DAU,
    O239378.CATEGORIZACION_LE as selector_demanda,
    O239491.ESPEC_PROF_ATIENDE_1 as esp1,
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

    const c2SelectorCounts = {
      'MEDICO ADULTO Y NIÑO': 0,
      'MEDICO GINECO-OBSTETRA': 0,
      'MATRON(A)': 0
    };

    let totalC2Selector = 0;

    rows.forEach(r => {
      const catLE = (r.SELECTOR_DEMANDA || '').trim().toUpperCase();
      if (catLE === 'C2') {
        totalC2Selector++;
        const tipo = clasificarTipoEspecialidad(r);
        if (c2SelectorCounts[tipo] !== undefined) {
          c2SelectorCounts[tipo]++;
        }
      }
    });

    console.log('===============================================================');
    console.log(`TOTAL C2 POR 'RESULTADO APLICACIÓN PROTOCOLO SELECTOR DE DEMANDA' (CATEGORIZACION_LE): ${totalC2Selector}`);
    console.log('===============================================================');
    console.log(JSON.stringify(c2SelectorCounts, null, 2));

    await conn.close();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

countTiposAtencionPorSelectorDemanda();
