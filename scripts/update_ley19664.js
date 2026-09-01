import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function updateLey19664() {
  console.log('--- Actualizando Ley 19.664 ---');
  const filePath = path.join(__dirname, '../src/data/COMGES 2026/RESULTADO METAS 19664 2026 formativo.xlsx');
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets['resumen gonzalo'];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

  // Map rows by indicator number (Col 0)
  const indRows = {};
  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    if (row && row[0] !== undefined && row[0] !== null) {
      const indId = row[0];
      if (!indRows[indId]) indRows[indId] = [];
      indRows[indId].push(row);
    }
  }

  const indicatorsDef = [
    {
      id: "ley19664-4",
      code: "Meta 4",
      metaId: 4,
      name: "Altas odontológicas de especialidad del nivel secundario por ingreso de tratamiento.",
      formula: "(Número de altas de tratamiento odontológico de especialidades /Número de ingresos a tratamiento odontológico de especialidades) *112",
      weight: "5%",
      weightVal: 0.05,
      target: "≥ 95.0%",
      targetVal: 0.95,
      evalFn: (res) => res >= 95.0,
      formatVal: (num, den, res) => {
        if (num === null || den === null || res === null || res === '' || isNaN(res)) return { res: null, fmt: '-', status: 'Sin Dato' };
        const pct = (num / den) * 100;
        return {
          res: Number(pct.toFixed(2)),
          fmt: pct.toFixed(2) + '%',
          status: pct >= 95.0 ? 'Cumple' : 'No Cumple'
        };
      }
    },
    {
      id: "ley19664-5",
      code: "Meta 5",
      metaId: 5,
      name: "Porcentaje de pacientes con indicación de hospitalización desde UEH, que acceden a cama de dotación en menos de 12 horas. C96/C96+C97+C98+C102",
      formula: "(Número total de pacientes con indicación de hospitalización que espera en UEH en un tiempo menor a 12 horas para acceder a cama de dotación / Número total de pacientes con indicación de hospitalización en UEH) x 100",
      weight: "10%",
      weightVal: 0.10,
      target: "≥ 85.0%",
      targetVal: 0.85,
      evalFn: (res) => res >= 85.0,
      formatVal: (num, den, res) => {
        if (num === null || den === null || num === 0 || den === 0 || isNaN(res) || res === '') return { res: null, fmt: '-', status: 'Sin Dato' };
        const pct = (num / den) * 100;
        return {
          res: Number(pct.toFixed(2)),
          fmt: pct.toFixed(2) + '%',
          status: pct >= 85.0 ? 'Cumple' : 'No Cumple'
        };
      }
    },
    {
      id: "ley19664-6",
      code: "Meta 6",
      metaId: 6,
      name: "Reducción del porcentaje global de cesárea en relación la línea base",
      formula: "((Número total de partos por cesárea en el establecimiento año t / Número total de partos en el establecimiento año t) / (Número total de partos por cesárea en el establecimiento año t-1 / Número total de partos en el establecimiento año t-1)) * 100",
      weight: "35%",
      weightVal: 0.35,
      target: "≤ 30.0%",
      targetVal: 0.30,
      evalFn: (res) => res <= 30.0,
      formatVal: (num, den, res) => {
        if (num === null || den === null || den === 0 || isNaN(res) || res === '') return { res: null, fmt: '-', status: 'Sin Dato' };
        const pct = (num / den) * 100;
        return {
          res: Number(pct.toFixed(2)),
          fmt: pct.toFixed(2) + '%',
          status: pct <= 30.0 ? 'Cumple' : 'No Cumple'
        };
      }
    },
    {
      id: "ley19664-7",
      code: "Meta 7",
      metaId: 7,
      name: "Porcentaje de egresos con estadía prolongada (Outliers Superiores)",
      formula: "(Número de egresos con estadía prolongada (outliers superiores) en el año t / Número total de egresos en el año t) * 100",
      weight: "20%",
      weightVal: 0.20,
      target: "≤ 3.0%",
      targetVal: 0.03,
      evalFn: (res) => res <= 3.0,
      formatVal: (num, den, res) => {
        if (num === null || den === null || den === 0 || isNaN(res) || res === '') return { res: null, fmt: '-', status: 'Sin Dato' };
        const pct = (num / den) * 100;
        return {
          res: Number(pct.toFixed(2)),
          fmt: pct.toFixed(2) + '%',
          status: pct <= 3.0 ? 'Cumple' : 'No Cumple'
        };
      }
    },
    {
      id: "ley19664-8",
      code: "Meta 8",
      metaId: 11, // in raw Excel it's coded 11
      name: "Garantías oncológicas exceptuadas transitorias acumuladas sin prestación resueltas",
      formula: "(Número de garantías oncológicas exceptuadas transitorias acumuladas sin prestación de años 2015 al 2024 resueltas / Número total de garantías oncológicas exceptuadas transitorias acumuladas sin prestación del período 2015 al 2024) *100",
      weight: "20%",
      weightVal: 0.20,
      target: "≥ 100.0%",
      targetVal: 1.0,
      evalFn: (res) => res >= 100.0,
      formatVal: (num, den, res) => {
        if (res === 1 || res === 100 || res === '100%') {
          return { res: 100.0, fmt: '100.00%', status: 'Cumple' };
        }
        return { res: null, fmt: '-', status: 'Sin Dato' };
      }
    },
    {
      id: "ley19664-9",
      code: "Meta 9",
      metaId: 12, // in raw Excel it's coded 12
      name: "Porcentaje de Gestión Efectiva para el cumplimiento Ges en la Red",
      formula: "((Garantías Cumplidas + Garantías Exceptuadas + Garantías Incumplidas Atendidas) en el año t / (Garantías Cumplidas + Garantías Exceptuadas + Garantías Incumplidas Atendidas + Garantías Incumplidas No Atendidas) en el año t + Garantías Retrasadas acumuladas)) x 100",
      weight: "10%",
      weightVal: 0.10,
      target: "≥ 99.5%",
      targetVal: 0.995,
      evalFn: (res) => res >= 99.5,
      formatVal: (num, den, res) => {
        if (num === null || den === null || den === 0 || isNaN(res) || res === '') return { res: null, fmt: '-', status: 'Sin Dato' };
        const pct = (num / den) * 100;
        return {
          res: Number(pct.toFixed(2)),
          fmt: pct.toFixed(2) + '%',
          status: pct >= 99.5 ? 'Cumple' : 'No Cumple'
        };
      }
    }
  ];

  const processedIndicators = indicatorsDef.map(def => {
    const rawList = indRows[def.metaId] || [];
    const monthlyData = [];
    let lastValid = null;

    for (let m = 0; m < 12; m++) {
      const monthRow = rawList[m] || [];
      const num = monthRow[6] !== undefined ? monthRow[6] : null;
      const den = monthRow[7] !== undefined ? monthRow[7] : null;
      const rawRes = monthRow[8] !== undefined ? monthRow[8] : null;

      const evalRes = def.formatVal(num, den, rawRes);
      monthlyData.push({
        month: MONTH_NAMES[m],
        numerator: num,
        denominator: den,
        result: evalRes.res,
        resultFormatted: evalRes.fmt,
        status: evalRes.status
      });

      if (evalRes.res !== null) {
        lastValid = { num, den, res: evalRes.res, fmt: evalRes.fmt, status: evalRes.status, month: MONTH_NAMES[m] };
      }
    }

    // Check year total row (row 12 in rawList)
    const totalRow = rawList[12] || [];
    const totalNum = totalRow[6] !== undefined && totalRow[6] !== null ? totalRow[6] : (lastValid ? lastValid.num : null);
    const totalDen = totalRow[7] !== undefined && totalRow[7] !== null ? totalRow[7] : (lastValid ? lastValid.den : null);
    let totalRes = totalRow[8] !== undefined && totalRow[8] !== null && totalRow[8] !== '' ? totalRow[8] : null;
    
    let summaryYTD = null;
    if (def.metaId === 11) { // Meta 8 onco
      summaryYTD = {
        numerator: null,
        denominator: null,
        result: 100.0,
        resultFormatted: "100.00%",
        status: "Cumple"
      };
    } else if (totalNum !== null && totalDen !== null && totalDen > 0) {
      const pct = Number(((totalNum / totalDen) * 100).toFixed(2));
      summaryYTD = {
        numerator: totalNum,
        denominator: totalDen,
        result: pct,
        resultFormatted: pct + "%",
        status: def.evalFn(pct) ? "Cumple" : "No Cumple"
      };
    } else if (lastValid) {
      summaryYTD = {
        numerator: lastValid.num,
        denominator: lastValid.den,
        result: lastValid.res,
        resultFormatted: lastValid.fmt,
        status: lastValid.status
      };
    } else {
      summaryYTD = {
        numerator: null,
        denominator: null,
        result: null,
        resultFormatted: "-",
        status: "Sin Dato"
      };
    }

    return {
      id: def.id,
      code: def.code,
      metaId: String(def.metaId),
      name: def.name,
      formula: def.formula,
      weight: def.weight,
      weightVal: def.weightVal,
      target: def.target,
      targetVal: def.targetVal,
      summaryYTD,
      monthlyData
    };
  });

  const fileContent = `// Dataset Oficial Metas Sanitarias Ley 19.664 (Año 2026 Formativo)
// Hospital de Villarrica - Servicio de Salud Araucanía Sur (Fuente: RESULTADO METAS 19664 2026 formativo.xlsx)

export const LEY19664_META = {
  title: "Metas Sanitarias Ley 19.664 (2026 Formativo)",
  subtitle: "Personal de Profesionales de la Salud Regidos por la Ley N° 19.664",
  hospital: "Hospital de Villarrica",
  service: "Servicio de Salud Araucanía Sur",
  year: 2026,
  sourceFile: "RESULTADO METAS 19664 2026 formativo.xlsx (resumen gonzalo)",
  lastUpdatedMonth: "Julio / Agosto",
  totalIndicators: 6
};

export const LEY19664_INDICATORS = ${JSON.stringify(processedIndicators, null, 2)};
`;

  fs.writeFileSync(path.join(__dirname, '../src/data/ley19664Data.js'), fileContent, 'utf8');
  console.log('✓ ley19664Data.js actualizado correctamente.');
}

updateLey19664();
