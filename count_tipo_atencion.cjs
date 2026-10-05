const odbc = require('odbc');

async function countTiposAtencion() {
  const sql = `
  SELECT 
    O239378.DAU,
    O239491.ESPEC_PROF_ATIENDE_1 as esp1,
    O239491.ESPEC_PROF_ATIENDE_2 as esp2,
    O239491.ESPEC_PROF_ATIENDE_3 as esp3,
    O239491.ESPEC_PROF_ATIENDE_4 as esp4,
    O239491.ESPEC_PROF_ATIENDE_5 as esp5,
    O239491.CATEGORIZACION as cat,
    O239378.CATEGORIZACION_LE as cat_le
  FROM URGENCIA.D_ADMISION O239378, URGENCIA.D_CIERRE_ATENCION O239491, URGENCIA.D_PACIENTE O239642, URGENCIA.D_SIGNOS_VITALES O245244
  WHERE ( ( O239378.DAU = O239642.DAU ) AND ( O239378.DAU = O239491.DAU ) AND ( O239378.DAU = O245244.DAU ) ) 
    AND ( O239491.FECHA_CIERRE_FINAL <= TO_DATE('20270101000000','YYYYMMDDHH24MISS') ) 
    AND ( O239491.FECHA_CIERRE_FINAL >= TO_DATE('20260101000000','YYYYMMDDHH24MISS') ) 
    AND ( O239378.ESTABLECIMIENTO = 'VILLARRICA HOSP.' )
  `;

  try {
    const conn = await odbc.connect('DSN=dwh.dssasur.cl;Uid=ghperez;Pwd=Josefa20');
    console.log('Conectado a Oracle DWH via ODBC. Ejecutando extracción para conteo...');
    const rows = await conn.query(sql);
    console.log(`Total registros recuperados: ${rows.length}`);

    function clasificarTipoEspecialidad(row) {
      const esps = [row.ESP1, row.ESP2, row.ESP3, row.ESP4, row.ESP5]
        .filter(v => v !== null && v !== undefined && String(v).trim() !== '')
        .map(v => String(v).trim().toUpperCase());

      if (esps.length === 0) {
        return 'SIN REGISTRO / NO ESPECIFICADO';
      }

      // Regla 2: MEDICO GINECO-OBSTETRA
      // Basta con que uno de los participantes sea ginecólogo u obstetra
      const hasGineco = esps.some(e => e.includes('GINECOLOGIA') || e.includes('OBSTETRICIA'));
      if (hasGineco) {
        return 'MEDICO GINECO-OBSTETRA';
      }

      // Regla 3: MATRON(A)
      // Exclusivamente se encuentran valores de MATRON(A) en una, dos o más categorías
      // (sin médicos ni ninguna otra especialidad)
      const allMatrona = esps.every(e => e.includes('MATRON'));
      if (allMatrona) {
        return 'MATRON(A)';
      }

      // Regla 1: MEDICO ADULTO Y NIÑO
      // Cualquier combinación del 1 al 5 que integre especialidad médica o medicina general,
      // excluyendo lo referido a ginecología y obstetricia (puede incluir matrona si además hay médico).
      return 'MEDICO ADULTO Y NIÑO';
    }

    const counts = {
      'MEDICO ADULTO Y NIÑO': 0,
      'MEDICO GINECO-OBSTETRA': 0,
      'MATRON(A)': 0,
      'SIN REGISTRO / NO ESPECIFICADO': 0
    };

    const c2Counts = {
      'MEDICO ADULTO Y NIÑO': 0,
      'MEDICO GINECO-OBSTETRA': 0,
      'MATRON(A)': 0,
      'SIN REGISTRO / NO ESPECIFICADO': 0
    };

    rows.forEach(r => {
      const tipo = clasificarTipoEspecialidad(r);
      counts[tipo] = (counts[tipo] || 0) + 1;

      const isC2 = (r.CAT && r.CAT.trim().toUpperCase() === 'C2') || 
                   (r.CAT_LE && r.CAT_LE.trim().toUpperCase() === 'C2');
      if (isC2) {
        c2Counts[tipo] = (c2Counts[tipo] || 0) + 1;
      }
    });

    console.log('\n========================================');
    console.log('CONTEO TOTAL GENERAL 2026:');
    console.log('========================================');
    console.log(JSON.stringify(counts, null, 2));

    console.log('\n========================================');
    console.log('CONTEO SOLO CATEGORIZADOS C2 2026:');
    console.log('========================================');
    console.log(JSON.stringify(c2Counts, null, 2));

    await conn.close();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

countTiposAtencion();
