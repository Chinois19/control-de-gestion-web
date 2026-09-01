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

const DEPT_MAP = {
  "UNIDAD DE EMERGENCIA HOSPITALARIA": { id: "ueh", name: "Unidad de Emergencia Hospitalaria (UEH)", code: "UEH", color: "#ef4444" },
  "UNIDAD DE GINECOLOGIA Y OBSTETRICIA": { id: "ginecologia", name: "Unidad de Ginecología y Obstetricia", code: "GIN-OBS", color: "#ec4899" },
  "UNIDAD DE PABELLON Y RECUPERACION": { id: "pabellon", name: "Unidad de Pabellón y Recuperación", code: "PABELLÓN", color: "#3b82f6" },
  "UNIDAD DE PACIENTE CRITICO": { id: "upc", name: "Unidad de Paciente Crítico (UPC)", code: "UPC", color: "#8b5cf6" },
  "UNIDAD PEDIATRICA": { id: "pediatria", name: "Unidad Pediátrica y Neonatología", code: "PEDIATRÍA", color: "#10b981" }
};

function updateLey20707() {
  console.log('--- Actualizando Ley 20.707 ---');
  const filePath = path.join(__dirname, '../src/data/COMGES 2026/Formulación-MS 20707-2026.xlsx');
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets['resumen gonzalo'];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

  const blocks = [];
  let currentBlock = null;

  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    if (!row || row.length === 0) continue;
    const mes = row[0];
    const code = row[1];
    const name = row[2];
    const formula = row[3];
    const target = row[4];
    const dept = (row[5] || '').trim();
    const weight = row[6];
    const referent = row[12];

    if (mes === 'Año 2026' || mes === 'año 2026') {
      if (code === 'Todos') continue;
      currentBlock = {
        headerRow: row,
        code,
        name,
        formula,
        target,
        dept,
        weight,
        referent,
        months: []
      };
      blocks.push(currentBlock);
    } else if (currentBlock && typeof mes === 'number') {
      currentBlock.months.push(row);
    }
  }

  const processedIndicators = blocks.map((b, idx) => {
    const indId = `ley20707-${idx + 1}`;
    const rawCode = String(b.code);
    const codeLabel = rawCode.startsWith('Ind Local') ? rawCode : `Meta ${rawCode}`;
    const deptInfo = DEPT_MAP[b.dept] || { id: "general", name: b.dept, code: "GEN", color: "#64748b" };

    const targetVal = typeof b.target === 'number' ? b.target : (parseFloat(String(b.target).replace('%', '')) / 100 || 0.9);
    const weightVal = typeof b.weight === 'number' ? b.weight : (parseFloat(String(b.weight).replace('%', '')) / 100 || 0.1);
    const targetFormatted = typeof b.target === 'number' ? `≥ ${(b.target * 100).toFixed(0)}%` : String(b.target);
    const weightFormatted = `${(weightVal * 100).toFixed(0)}%`;

    const monthlyData = [];
    let lastValidMonth = null;

    for (let m = 0; m < 12; m++) {
      const row = b.months[m] || [];
      const num = row[7] !== undefined && row[7] !== null ? row[7] : null;
      const den = row[8] !== undefined && row[8] !== null ? row[8] : null;
      const rawRes = row[9] !== undefined && row[9] !== null && row[9] !== '' ? row[9] : null;

      let res = null;
      let resFormatted = '-';
      let compliance = null;
      let status = 'Sin Dato';

      if (num !== null && den !== null && den > 0) {
        res = Number(((num / den) * 100).toFixed(2));
        resFormatted = `${res.toFixed(2)}%`;
        const cmpVal = (res / (targetVal * 100)) * 100;
        compliance = Number(cmpVal.toFixed(1));
        status = res >= (targetVal * 100) ? 'Cumple' : 'No Cumple';

        // Special case: Suspensiones (Ind Local 2) where target is <=
        if (rawCode === 'Ind Local 2' || b.name.includes('Suspensiones')) {
          status = res <= (targetVal * 100) ? 'Cumple' : 'No Cumple';
        }

        lastValidMonth = { num, den, res, resFormatted, compliance, status, month: MONTH_NAMES[m] };
      } else if (rawRes !== null && typeof rawRes === 'number') {
        res = Number((rawRes * 100).toFixed(2));
        resFormatted = `${res.toFixed(2)}%`;
        compliance = 100.0;
        status = 'Cumple';
        lastValidMonth = { num: 0, den: 0, res, resFormatted, compliance, status, month: MONTH_NAMES[m] };
      }

      monthlyData.push({
        month: MONTH_NAMES[m],
        numerator: num !== null ? num : 0,
        denominator: den !== null ? den : 0,
        result: res,
        resultFormatted: resFormatted,
        compliance,
        status
      });
    }

    // YTD Summary from headerRow
    const hRow = b.headerRow;
    const ytdNum = hRow[7] !== undefined && hRow[7] !== null ? hRow[7] : (lastValidMonth ? lastValidMonth.num : 0);
    const ytdDen = hRow[8] !== undefined && hRow[8] !== null ? hRow[8] : (lastValidMonth ? lastValidMonth.den : 0);
    let ytdRes = null;
    let ytdResFormatted = '-';
    let ytdCompliance = 0;
    let ytdStatus = 'Sin Dato';

    if (ytdNum !== null && ytdDen !== null && ytdDen > 0) {
      ytdRes = Number(((ytdNum / ytdDen) * 100).toFixed(2));
      ytdResFormatted = `${ytdRes.toFixed(2)}%`;
      ytdCompliance = Number(((ytdRes / (targetVal * 100)) * 100).toFixed(1));
      ytdStatus = ytdRes >= (targetVal * 100) ? 'Cumple' : 'No Cumple';

      if (rawCode === 'Ind Local 2' || b.name.includes('Suspensiones')) {
        ytdStatus = ytdRes <= (targetVal * 100) ? 'Cumple' : 'No Cumple';
      }
    } else if (lastValidMonth) {
      ytdRes = lastValidMonth.res;
      ytdResFormatted = lastValidMonth.resFormatted;
      ytdCompliance = lastValidMonth.compliance;
      ytdStatus = lastValidMonth.status;
    }

    return {
      id: indId,
      code: codeLabel,
      rawCode,
      name: b.name,
      formula: b.formula,
      dept: b.dept,
      deptInfo,
      weight: weightFormatted,
      weightVal,
      target: targetFormatted,
      targetVal,
      referent: b.referent || "Control de Gestión",
      summaryYTD: {
        numerator: ytdNum,
        denominator: ytdDen,
        result: ytdRes,
        resultFormatted: ytdResFormatted,
        compliance: ytdCompliance,
        status: ytdStatus,
        statusLabel: ytdStatus
      },
      monthlyData
    };
  });

  const fileContent = `// Dataset Oficial Metas Sanitarias Ley 20.707 (Formulación MS 20707-2026)
// Hospital de Villarrica - Año 2026 (Excluyendo filas separadoras de unidades 'Todos')

export const LEY20707_META = {
  title: "Metas Sanitarias Ley 20.707 (2026)",
  subtitle: "Profesionales Médicos, Cirujano-Dentistas, Químico-Farmacéuticos y Bioquímicos",
  hospital: "Hospital de Villarrica",
  service: "Servicio de Salud Araucanía Sur",
  year: 2026,
  sourceFile: "Formulación-MS 20707-2026.xlsx (Corte a Julio / Agosto 2026)",
  totalIndicators: ${processedIndicators.length}
};

export const LEY20707_UNITS = [
  { id: "todas", name: "Todas las Unidades Clínicas", code: "TODAS", color: "#0f172a" },
  { id: "ueh", name: "Unidad de Emergencia Hospitalaria (UEH)", code: "UEH", color: "#ef4444" },
  { id: "pabellon", name: "Unidad de Pabellón y Recuperación", code: "PABELLÓN", color: "#3b82f6" },
  { id: "pediatria", name: "Unidad Pediátrica y Neonatología", code: "PEDIATRÍA", color: "#10b981" },
  { id: "upc", name: "Unidad de Paciente Crítico (UPC)", code: "UPC", color: "#8b5cf6" },
  { id: "ginecologia", name: "Unidad de Ginecología y Obstetricia", code: "GIN-OBS", color: "#ec4899" }
];

export const LEY20707_INDICATORS = ${JSON.stringify(processedIndicators, null, 2)};
`;

  fs.writeFileSync(path.join(__dirname, '../src/data/ley20707Data.js'), fileContent, 'utf8');
  console.log('✓ ley20707Data.js actualizado correctamente.');
}

updateLey20707();
