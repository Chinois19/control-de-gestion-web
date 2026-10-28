import { createRequire } from 'module';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = require('path').dirname(__filename);
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const wbPath = path.join(__dirname, '../src/data/COMGES 2026/Formulación-MS 20707-2026.xlsx');
const wb = xlsx.readFile(wbPath);
const res = xlsx.utils.sheet_to_json(wb.Sheets['resumen gonzalo'], { header: 1 });

let content = fs.readFileSync(path.join(__dirname, '../src/data/ley20707Data.js'), 'utf-8');
const unitsMatch = content.match(/export const LEY20707_UNITS = (\[[\s\S]*?\]);/);
const LEY20707_UNITS = eval('(' + unitsMatch[1] + ')');

const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const deptMap = {
  "UNIDAD DE EMERGENCIA HOSPITALARIA": { id: "ueh", name: "Unidad de Emergencia Hospitalaria (UEH)", code: "UEH", color: "#ef4444" },
  "UNIDAD DE GINECOLOGÍA Y OBSTETRICIA": { id: "ginecologia", name: "Unidad de Ginecología y Obstetricia", code: "GIN-OBS", color: "#ec4899" },
  "UNIDAD DE PABELLÓN Y RECUPERACIÓN": { id: "pabellon", name: "Unidad de Pabellón y Recuperación", code: "PABELLÓN", color: "#3b82f6" },
  "UNIDAD DE PACIENTE CRÍTICO": { id: "upc", name: "Unidad de Paciente Crítico (UPC)", code: "UPC", color: "#8b5cf6" },
  "UNIDAD PEDIÁTRICA Y NEONATOLOGÍA": { id: "pediatria", name: "Unidad Pediátrica y Neonatología", code: "PEDIATRÍA", color: "#10b981" }
};

// Columns in Formulación-MS 20707-2026.xlsx ('resumen gonzalo'):
// Col 0: MES ('Año 2026' or Excel serial 46023..46357)
// Col 1: N° Indicador (1, 3, 'Ind Local 1', etc. or 'Todos')
// Col 2: Nombre del indicador
// Col 3: Fórmula de cálculo
// Col 4: Meta Suscrita 2026
// Col 5: SERVICIO CLINICO
// Col 6: PONDERACION
// Col 7: Numerador
// Col 8: Denominador
// Col 9: Resultado Indicador
// Col 10: % Cumplimiento Meta
// Col 11: Ponderación Obtenida
// Col 12: Responsable Medicion

const blocks = [];
for (let i = 1; i < res.length; i++) {
  const row = res[i];
  if (!row) continue;
  const mes = String(row[0] || '').trim();
  const metaCode = row[1];
  if (metaCode && String(metaCode).trim() !== 'Todos' && mes.includes('2026')) {
    let endRow = i + 1;
    while (endRow < res.length && res[endRow] && typeof res[endRow][0] === 'number') {
      endRow++;
    }
    blocks.push({
      headerRow: i,
      monthStart: i + 1,
      monthEnd: endRow - 1,
      rawCode: String(metaCode).trim(),
      name: String(row[2] || '').trim(),
      formula: String(row[3] || '').trim(),
      target: row[4],
      dept: String(row[5] || '').trim(),
      weight: row[6],
      referent: String(row[12] || 'Control de Gestión').trim()
    });
  }
}

console.log(`Found ${blocks.length} indicators in Ley 20707.`);

const LEY20707_INDICATORS = blocks.map((b, idx) => {
  const isLessOrEqual = b.name.toLowerCase().includes('suspensiones') || b.target <= 0.1;
  // Ind Local 1 (Ambulatorización CMA) has Numerador = CMA and Denominador = CM Hospitalizada in Excel, so total surgeries = num + den
  const isAdditiveDen = b.rawCode === 'Ind Local 1' || b.name.toLowerCase().includes('ambulatorización');
  const hRow = res[b.headerRow] || [];

  const monthlyData = [];
  for (let m = 0; m < 12; m++) {
    const rIdx = b.monthStart + m;
    const row = (rIdx <= b.monthEnd) ? res[rIdx] : null;
    const rawNum = row ? row[7] : null;
    const rawDen = row ? row[8] : null;
    const rawRes = row ? row[9] : null;

    if (typeof rawNum === 'number' && typeof rawDen === 'number' && (rawDen > 0 || (isAdditiveDen && rawNum + rawDen > 0))) {
      const num = rawNum;
      const den = isAdditiveDen ? (rawNum + rawDen) : rawDen;
      const val = Number(((num / den) * 100).toFixed(2));
      let comp;
      if (isLessOrEqual) {
        comp = val <= b.target * 100 ? 100 : Number(((b.target * 100 / val) * 100).toFixed(1));
      } else {
        comp = Number(((val / (b.target * 100)) * 100).toFixed(1));
      }
      const isOk = isLessOrEqual ? (val <= b.target * 100 + 0.001) : (val >= b.target * 100 - 0.001);
      monthlyData.push({
        month: months[m],
        numerator: num,
        denominator: den,
        result: val,
        resultFormatted: val.toFixed(2) + "%",
        compliance: comp,
        status: isOk ? "Cumple" : "No Cumple"
      });
    } else if (typeof rawRes === 'number' && rawRes > 0) {
      const val = Number((rawRes * 100).toFixed(2));
      const comp = Number(((val / (b.target * 100)) * 100).toFixed(1));
      const isOk = isLessOrEqual ? (val <= b.target * 100 + 0.001) : (val >= b.target * 100 - 0.001);
      monthlyData.push({
        month: months[m],
        numerator: typeof rawNum === 'number' ? rawNum : 0,
        denominator: typeof rawDen === 'number' ? rawDen : 0,
        result: val,
        resultFormatted: val.toFixed(2) + "%",
        compliance: comp,
        status: isOk ? "Cumple" : "No Cumple"
      });
    } else {
      monthlyData.push({
        month: months[m],
        numerator: 0,
        denominator: 0,
        result: null,
        resultFormatted: "-",
        compliance: null,
        status: "Sin Dato"
      });
    }
  }

  let ytdNum = hRow[7];
  let ytdDen = hRow[8];
  let ytdRes = hRow[9];
  let ytdComp = hRow[10];
  let ytdScore = typeof hRow[11] === 'number' ? Number((hRow[11] * 100).toFixed(2)) : null;

  let summaryYTD;
  if (typeof ytdNum === 'number' && typeof ytdDen === 'number' && (ytdDen > 0 || (isAdditiveDen && ytdNum + ytdDen > 0))) {
    const effDen = isAdditiveDen ? (ytdNum + ytdDen) : ytdDen;
    const val = Number(((ytdNum / effDen) * 100).toFixed(2));
    const comp = typeof ytdComp === 'number' ? Number((ytdComp * 100).toFixed(1)) : Number(((val / (b.target * 100)) * 100).toFixed(1));
    const isOk = isLessOrEqual ? (val <= b.target * 100 + 0.001) : (val >= b.target * 100 - 0.001);
    summaryYTD = {
      numerator: ytdNum,
      denominator: effDen,
      result: val,
      resultFormatted: val.toFixed(2) + "%",
      compliance: comp,
      scoreObtained: ytdScore,
      status: isOk ? "Cumple" : "No Cumple",
      statusLabel: isOk ? "Cumple" : "No Cumple"
    };
  } else if (typeof ytdRes === 'number') {
    const val = Number((ytdRes * 100).toFixed(2));
    const comp = typeof ytdComp === 'number' ? Number((ytdComp * 100).toFixed(1)) : Number(((val / (b.target * 100)) * 100).toFixed(1));
    const isOk = isLessOrEqual ? (val <= b.target * 100 + 0.001) : (val >= b.target * 100 - 0.001);
    summaryYTD = {
      numerator: typeof ytdNum === 'number' ? ytdNum : null,
      denominator: typeof ytdDen === 'number' ? ytdDen : null,
      result: val,
      resultFormatted: val.toFixed(2) + "%",
      compliance: comp,
      scoreObtained: ytdScore,
      status: isOk ? "Cumple" : "No Cumple",
      statusLabel: isOk ? "Cumple" : "No Cumple"
    };
  } else {
    summaryYTD = {
      numerator: null,
      denominator: null,
      result: null,
      resultFormatted: "-",
      compliance: null,
      scoreObtained: 0,
      status: "Sin Dato",
      statusLabel: "Sin Dato"
    };
  }

  const codeDisplay = b.rawCode.startsWith('Ind') ? b.rawCode : `Meta ${b.rawCode}`;
  const weightFormatted = Math.round(b.weight * 100) + "%";
  const targetPct = Number((b.target * 100).toFixed(1));
  const targetStr = Number.isInteger(targetPct) ? `${targetPct}%` : `${targetPct.toFixed(1)}%`;
  const targetFormatted = (isLessOrEqual ? "≤ " : "≥ ") + targetStr;

  return {
    id: `ley20707-${idx + 1}`,
    code: codeDisplay,
    rawCode: b.rawCode,
    name: b.name,
    formula: b.formula,
    dept: b.dept,
    deptInfo: deptMap[b.dept] || { id: "todas", name: b.dept, code: b.dept, color: "#64748b" },
    weight: weightFormatted,
    weightVal: b.weight,
    target: targetFormatted,
    targetVal: b.target,
    isLessOrEqual,
    referent: b.referent,
    summaryYTD,
    monthlyData
  };
});

const LEY20707_META = {
  title: "Metas Sanitarias Ley 20.707 (2026)",
  subtitle: "Profesionales Médicos, Cirujano-Dentistas, Químico-Farmacéuticos y Bioquímicos",
  hospital: "Hospital de Villarrica",
  service: "Servicio de Salud Araucanía Sur",
  year: 2026,
  sourceFile: "Formulación-MS 20707-2026.xlsx (Corte a Septiembre 2026)",
  lastUpdatedMonth: "Septiembre",
  totalIndicators: LEY20707_INDICATORS.length
};

const newContent = `// Dataset Oficial Metas Sanitarias Ley 20.707 (Formulación MS 20707-2026)
// Hospital de Villarrica - Año 2026 (Excluyendo filas separadoras de unidades 'Todos')

export const LEY20707_META = ${JSON.stringify(LEY20707_META, null, 2)};

export const LEY20707_UNITS = ${JSON.stringify(LEY20707_UNITS, null, 2)};

export const LEY20707_INDICATORS = ${JSON.stringify(LEY20707_INDICATORS, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../src/data/ley20707Data.js'), newContent, 'utf-8');
console.log("ley20707Data.js actualizado exitosamente.");
