import { createRequire } from 'module';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = require('path').dirname(__filename);
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const wbPath = path.join(__dirname, '../src/data/COMGES 2026/RESULTADO METAS 19664 2026 formativo.xlsx');
const wb = xlsx.readFile(wbPath);
const res = xlsx.utils.sheet_to_json(wb.Sheets['resumen gonzalo'], { header: 1 });

const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const serialToMonthIndex = {
  46023: 0, // Enero
  46054: 1, // Febrero
  46082: 2, // Marzo
  46113: 3, // Abril
  46143: 4, // Mayo
  46174: 5, // Junio
  46204: 6, // Julio
  46235: 7, // Agosto
  46266: 8, // Septiembre
  46296: 9, // Octubre
  46327: 10, // Noviembre
  46357: 11  // Diciembre
};

const blocks = [
  {
    id: "ley19664-4",
    code: "Meta 4",
    metaId: "4",
    name: "Altas odontológicas de especialidad del nivel secundario por ingreso de tratamiento.",
    formula: "(Número de altas de tratamiento odontológico de especialidades / Número de ingresos a tratamiento odontológico de especialidades) * 100",
    weight: "5%",
    weightVal: 0.05,
    target: "≥ 90.0%",
    targetVal: 0.90,
    isLessOrEqual: false,
    isDays: false
  },
  {
    id: "ley19664-5",
    code: "Meta 5",
    metaId: "5",
    name: "Porcentaje de pacientes con indicación de hospitalización desde UEH, que acceden a cama de dotación en menos de 12 horas. C96/C96+C97+C98+C102",
    formula: "(Número total de pacientes con indicación de hospitalización que espera en UEH en un tiempo menor a 12 horas para acceder a cama de dotación / Número total de pacientes con indicación de hospitalización en UEH) x 100",
    weight: "6%",
    weightVal: 0.06,
    target: "≥ 85.0%",
    targetVal: 0.85,
    isLessOrEqual: false,
    isDays: false
  },
  {
    id: "ley19664-6",
    code: "Meta 6",
    metaId: "6",
    name: "Disminución de los casos en Lista de espera con antigüedad sobre el percentil 75, para intervenciones quirúrgicas (IQ) electivas mayores y menores",
    formula: "(Casos egresados de Lista de Espera IQ sobre P75 / Línea base de casos en Lista de Espera IQ sobre P75) x 100",
    weight: "15%",
    weightVal: 0.15,
    target: "≥ 80.0%",
    targetVal: 0.80,
    isLessOrEqual: false,
    isDays: false
  },
  {
    id: "ley19664-7",
    code: "Meta 7",
    metaId: "7",
    name: "Disminución de los casos en Lista de espera con antigüedad sobre el percentil 75, para Consulta Nueva de Especialidad Médica",
    formula: "(Casos egresados de Lista de Espera CNE Médica sobre P75 / Línea base de casos en Lista de Espera CNE Médica sobre P75) x 100",
    weight: "16%",
    weightVal: 0.16,
    target: "≥ 95.8%",
    targetVal: 0.9576,
    isLessOrEqual: false,
    isDays: false
  },
  {
    id: "ley19664-8",
    code: "Meta 8",
    metaId: "8",
    name: "Disminución de los casos en Lista de espera con antigüedad sobre el percentil 75, para Consulta Nueva de Especialidad Odontológica",
    formula: "(Casos egresados de Lista de Espera CNE Odontológica sobre P75 / Línea base de casos en Lista de Espera CNE Odontológica sobre P75) x 100",
    weight: "20%",
    weightVal: 0.20,
    target: "≥ 80.0%",
    targetVal: 0.80,
    isLessOrEqual: false,
    isDays: false
  },
  {
    id: "ley19664-9",
    code: "Meta 9",
    metaId: "9",
    name: "Reducción del porcentaje global de cesárea en relación a la línea base",
    formula: "(Número total de partos por cesárea en el establecimiento año t / Número total de partos en el establecimiento año t) * 100",
    weight: "6%",
    weightVal: 0.06,
    target: "≤ 39.3%",
    targetVal: 0.393,
    isLessOrEqual: true,
    isDays: false
  },
  {
    id: "ley19664-10",
    code: "Meta 10",
    metaId: "10",
    name: "Disminución del exceso de días de estancias asociados a egresos con estancias prolongadas (outliers superiores)",
    formula: "Sumatoria de días de exceso de estancia asociados a egresos con estancias prolongadas (outliers superiores) respecto a Línea Base 2025 (893 días, meta ≤ 849 días)",
    weight: "6%",
    weightVal: 0.06,
    target: "≤ 849 días (-5% LB)",
    targetVal: 849,
    isLessOrEqual: true,
    isDays: true
  },
  {
    id: "ley19664-11",
    code: "Meta 11",
    metaId: "11",
    name: "Garantías oncológicas exceptuadas transitorias acumuladas sin prestación resueltas",
    formula: "(Número de garantías oncológicas exceptuadas transitorias acumuladas sin prestación de años 2015 al 2024 resueltas / Número total de garantías oncológicas exceptuadas transitorias acumuladas sin prestación del período 2015 al 2024) * 100",
    weight: "20%",
    weightVal: 0.20,
    target: "≥ 80.0%",
    targetVal: 0.80,
    isLessOrEqual: false,
    isDays: false
  },
  {
    id: "ley19664-12",
    code: "Meta 12",
    metaId: "12",
    name: "Porcentaje de Gestión Efectiva para el cumplimiento GES en la Red",
    formula: "((Garantías Cumplidas + Garantías Exceptuadas + Garantías Incumplidas Atendidas) en el año t / ((Garantías Cumplidas + Garantías Exceptuadas + Garantías Incumplidas Atendidas + Garantías Incumplidas No Atendidas) en el año t + Garantías Retrasadas acumuladas)) x 100",
    weight: "6%",
    weightVal: 0.06,
    target: "≥ 99.5%",
    targetVal: 0.995,
    isLessOrEqual: false,
    isDays: false
  }
];

const LEY19664_INDICATORS = blocks.map(b => {
  // Filter rows belonging to this metaId
  const metaRows = res.filter(r => r && String(r[0]).trim() === b.metaId);
  const totRow = metaRows.find(r => String(r[1] || '').includes('TOTAL')) || [];

  const monthlyData = months.map(mName => ({
    month: mName,
    numerator: null,
    denominator: null,
    result: null,
    resultFormatted: "-",
    status: "Sin Dato"
  }));

  let lastValidMonthRow = null;

  for (const row of metaRows) {
    const mesCell = row[1];
    if (typeof mesCell === 'number' && serialToMonthIndex[mesCell] !== undefined) {
      const mIdx = serialToMonthIndex[mesCell];
      const num = row[5];
      const den = row[6];
      const rawRes = row[7];

      if (b.isDays) {
        if (typeof num === 'number' && num > 0) {
          monthlyData[mIdx] = {
            month: months[mIdx],
            numerator: num,
            denominator: 893,
            result: num,
            resultFormatted: `${num} días`,
            status: num <= 70.75 ? "Cumple" : "No Cumple"
          };
          lastValidMonthRow = monthlyData[mIdx];
        }
        continue;
      }

      if (typeof num === 'number' && typeof den === 'number' && den > 0) {
        const val = Number(((num / den) * 100).toFixed(2));
        const isOk = b.isLessOrEqual ? (val <= b.targetVal * 100 + 0.001) : (val >= b.targetVal * 100 - 0.001);
        monthlyData[mIdx] = {
          month: months[mIdx],
          numerator: num,
          denominator: den,
          result: val,
          resultFormatted: val.toFixed(2) + "%",
          status: isOk ? "Cumple" : "No Cumple"
        };
        lastValidMonthRow = monthlyData[mIdx];
      } else if (typeof rawRes === 'number' && rawRes > 0) {
        const val = Number((rawRes * 100).toFixed(2));
        const isOk = b.isLessOrEqual ? (val <= b.targetVal * 100 + 0.001) : (val >= b.targetVal * 100 - 0.001);
        monthlyData[mIdx] = {
          month: months[mIdx],
          numerator: typeof num === 'number' ? num : null,
          denominator: typeof den === 'number' ? den : null,
          result: val,
          resultFormatted: val.toFixed(2) + "%",
          status: isOk ? "Cumple" : "No Cumple"
        };
        lastValidMonthRow = monthlyData[mIdx];
      }
    }
  }

  let tNum = totRow[5];
  let tDen = totRow[6];
  let tRes = totRow[7];
  let tCompliance = typeof totRow[8] === 'number' ? Number((totRow[8] * 100).toFixed(2)) : null;
  let tScore = typeof totRow[9] === 'number' ? Number((totRow[9] * 100).toFixed(2)) : 0;

  // For Meta 12 (GES), if Septiembre (lastValidMonthRow) has newer cumulative data than the TOTAL AÑO formula (which pointed to July), use Septiembre
  if (b.metaId === "12" && lastValidMonthRow && lastValidMonthRow.numerator > tNum) {
    tNum = lastValidMonthRow.numerator;
    tDen = lastValidMonthRow.denominator;
    tRes = lastValidMonthRow.result / 100;
    tCompliance = lastValidMonthRow.result;
  }

  let summaryYTD;
  if (b.isDays) {
    const val = typeof tNum === 'number' ? tNum : 0;
    const isOk = val <= b.targetVal;
    summaryYTD = {
      numerator: val,
      denominator: typeof tDen === 'number' ? tDen : 893,
      result: val,
      resultFormatted: `${val} días`,
      compliance: tCompliance,
      scoreObtained: tScore,
      status: isOk ? "Cumple" : "No Cumple"
    };
  } else {
    let val = null;
    if (typeof tNum === 'number' && typeof tDen === 'number' && tDen > 0) {
      val = Number(((tNum / tDen) * 100).toFixed(2));
    } else if (typeof tRes === 'number') {
      val = Number((tRes * 100).toFixed(2));
    }
    const isOk = val !== null ? (b.isLessOrEqual ? (val <= b.targetVal * 100 + 0.001) : (val >= b.targetVal * 100 - 0.001)) : false;
    summaryYTD = {
      numerator: typeof tNum === 'number' ? tNum : null,
      denominator: typeof tDen === 'number' ? tDen : null,
      result: val,
      resultFormatted: val !== null ? val.toFixed(2) + "%" : "-",
      compliance: tCompliance,
      scoreObtained: tScore,
      status: isOk ? "Cumple" : (tScore > 0 ? "Cumple Parcial" : "No Cumple")
    };
  }

  return {
    id: b.id,
    code: b.code,
    metaId: b.metaId,
    name: b.name,
    formula: b.formula,
    weight: b.weight,
    weightVal: b.weightVal,
    target: b.target,
    targetVal: b.targetVal,
    isLessOrEqual: b.isLessOrEqual,
    isDays: b.isDays,
    summaryYTD,
    monthlyData
  };
});

const totalScore = Number(LEY19664_INDICATORS.reduce((acc, i) => acc + (i.summaryYTD.scoreObtained || 0), 0).toFixed(2));

const LEY19664_META = {
  title: "Metas Sanitarias Ley 19.664 (2026 Formativo)",
  subtitle: "Personal de Profesionales de la Salud Regidos por la Ley N° 19.664",
  hospital: "Hospital de Villarrica",
  service: "Servicio de Salud Araucanía Sur",
  year: 2026,
  sourceFile: "RESULTADO METAS 19664 2026 formativo.xlsx (resumen gonzalo)",
  lastUpdatedMonth: "Septiembre",
  totalIndicators: LEY19664_INDICATORS.length,
  totalScore
};

const newContent = `// Dataset Oficial Metas Sanitarias Ley 19.664 (Año 2026 Formativo)
// Hospital de Villarrica - Servicio de Salud Araucanía Sur (Fuente: RESULTADO METAS 19664 2026 formativo.xlsx)

export const LEY19664_META = ${JSON.stringify(LEY19664_META, null, 2)};

export const LEY19664_INDICATORS = ${JSON.stringify(LEY19664_INDICATORS, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../src/data/ley19664Data.js'), newContent, 'utf-8');
console.log("ley19664Data.js actualizado exitosamente. Total Indicadores:", LEY19664_INDICATORS.length, "Puntaje Ponderado:", totalScore + "%");
