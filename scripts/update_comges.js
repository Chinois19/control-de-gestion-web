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

function updateComges() {
  console.log('--- Actualizando COMGES 2026 ---');
  const filePath = path.join(__dirname, '../src/data/COMGES 2026/PLANILLA COMGES 2026.xlsx');
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets['resumen gonzalo'];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

  // Read current comges2026Data.js to retain metadata/descriptions/domains
  const currentPath = path.join(__dirname, '../src/data/comges2026Data.js');
  
  // 1. Suspensiones Quirurgicas (1.1 / Code COMGES 1.1)
  // Col 2: Num, Col 3: Den, Col 4: Res
  const suspMonthly = [];
  let lastValidSusp = { num: 161, den: 2186, res: 7.37 };
  for (let m = 0; m < 12; m++) {
    const row = data[m + 1] || [];
    const num = row[2];
    const den = row[3];
    if (num !== undefined && num !== null && num !== '' && den !== undefined && den !== null && den !== '' && den > 0) {
      const pct = (num / den) * 100;
      suspMonthly.push({
        month: MONTH_NAMES[m],
        numerator: num,
        denominator: den,
        result: Number(pct.toFixed(2)),
        resultFormatted: pct.toFixed(2) + '%',
        status: pct <= 6.5 ? 'Cumple' : 'No Cumple'
      });
      lastValidSusp = { num, den, res: pct, month: MONTH_NAMES[m] };
    } else {
      suspMonthly.push({
        month: MONTH_NAMES[m],
        numerator: 0,
        denominator: 0,
        result: null,
        resultFormatted: '-',
        status: 'Pendiente Actualización'
      });
    }
  }

  // 2. Cumplimiento GES (3.1)
  // Col 6: Num, Col 7: Den, Col 8: Res
  const gesMonthly = [];
  let lastValidGes = { num: 8731, den: 9446, res: 92.43 };
  for (let m = 0; m < 12; m++) {
    const row = data[m + 1] || [];
    const num = row[6];
    const den = row[7];
    if (num !== undefined && num !== null && num !== '' && den !== undefined && den !== null && den !== '' && den > 0) {
      const pct = (num / den) * 100;
      gesMonthly.push({
        month: MONTH_NAMES[m],
        numerator: num,
        denominator: den,
        result: Number(pct.toFixed(2)),
        resultFormatted: pct.toFixed(2) + '%',
        status: pct >= 99.5 ? 'Cumple' : 'No Cumple'
      });
      lastValidGes = { num, den, res: pct, month: MONTH_NAMES[m] };
    } else {
      gesMonthly.push({
        month: MONTH_NAMES[m],
        numerator: 0,
        denominator: 0,
        result: null,
        resultFormatted: '-',
        status: 'Pendiente Actualización'
      });
    }
  }

  // 3. P75 Consulta Nueva Médica (3.2)
  // Col 10: Base (2077), Col 11: Lista espera, Col 12: Egresos, Col 13: Res
  const leMedicaMonthly = [];
  let lastValidMed = { base: 2077, le: 516, eg: 1422, res: 73.37 };
  for (let m = 0; m < 12; m++) {
    const row = data[m + 1] || [];
    const base = row[10];
    const le = row[11];
    const eg = row[12];
    const res = row[13];
    if (base !== null && base !== undefined && eg !== null && eg !== undefined) {
      const pct = (eg / base) * 100;
      leMedicaMonthly.push({
        month: MONTH_NAMES[m],
        numerator: eg,
        denominator: base,
        result: Number(pct.toFixed(2)),
        resultFormatted: pct.toFixed(2) + '%',
        status: pct >= 95.0 ? 'Cumple' : 'En Avance'
      });
      lastValidMed = { base, le, eg, res: pct, month: MONTH_NAMES[m] };
    } else {
      leMedicaMonthly.push({
        month: MONTH_NAMES[m],
        numerator: 0,
        denominator: 0,
        result: null,
        resultFormatted: '-',
        status: 'Pendiente Actualización'
      });
    }
  }

  // 4. P75 Odontológica Excluye Ortodoncia (3.3.1)
  // Col 15: Base (1354), Col 16: LE, Col 17: Egresos, Col 18: Res
  const leOdontoExMonthly = [];
  let lastValidOdoEx = { base: 1354, le: 255, eg: 1099, res: 81.17 };
  for (let m = 0; m < 12; m++) {
    const row = data[m + 1] || [];
    const base = row[15];
    const eg = row[17];
    if (base !== null && base !== undefined && eg !== null && eg !== undefined) {
      const pct = (eg / base) * 100;
      leOdontoExMonthly.push({
        month: MONTH_NAMES[m],
        numerator: eg,
        denominator: base,
        result: Number(pct.toFixed(2)),
        resultFormatted: pct.toFixed(2) + '%',
        status: pct >= 95.0 ? 'Cumple' : 'En Avance'
      });
      lastValidOdoEx = { base, eg, res: pct, month: MONTH_NAMES[m] };
    } else {
      leOdontoExMonthly.push({
        month: MONTH_NAMES[m],
        numerator: 0,
        denominator: 0,
        result: null,
        resultFormatted: '-',
        status: 'Pendiente Actualización'
      });
    }
  }

  // 5. P75 Odontológica Ortodoncia (3.3.2)
  // Col 19: Base (611), Col 20: LE, Col 21: Egresos, Col 22: Res
  const leOrtodMonthly = [];
  let lastValidOrtod = { base: 611, le: 358, eg: 253, res: 41.41 };
  for (let m = 0; m < 12; m++) {
    const row = data[m + 1] || [];
    const base = row[19];
    const eg = row[21];
    if (base !== null && base !== undefined && eg !== null && eg !== undefined) {
      const pct = (eg / base) * 100;
      leOrtodMonthly.push({
        month: MONTH_NAMES[m],
        numerator: eg,
        denominator: base,
        result: Number(pct.toFixed(2)),
        resultFormatted: pct.toFixed(2) + '%',
        status: pct >= 95.0 ? 'Cumple' : 'En Avance'
      });
      lastValidOrtod = { base, eg, res: pct, month: MONTH_NAMES[m] };
    } else {
      leOrtodMonthly.push({
        month: MONTH_NAMES[m],
        numerator: 0,
        denominator: 0,
        result: null,
        resultFormatted: '-',
        status: 'Pendiente Actualización'
      });
    }
  }

  // 6. P75 Quirúrgica (3.4)
  // Col 24: Base (382), Col 25: LE, Col 26: Egresos, Col 27: Res
  const leQxMonthly = [];
  let lastValidQx = { base: 382, le: 146, eg: 236, res: 61.78 };
  for (let m = 0; m < 12; m++) {
    const row = data[m + 1] || [];
    const base = row[24];
    const eg = row[26];
    if (base !== null && base !== undefined && eg !== null && eg !== undefined) {
      const pct = (eg / base) * 100;
      leQxMonthly.push({
        month: MONTH_NAMES[m],
        numerator: eg,
        denominator: base,
        result: Number(pct.toFixed(2)),
        resultFormatted: pct.toFixed(2) + '%',
        status: pct >= 95.0 ? 'Cumple' : 'En Avance'
      });
      lastValidQx = { base, eg, res: pct, month: MONTH_NAMES[m] };
    } else {
      leQxMonthly.push({
        month: MONTH_NAMES[m],
        numerator: 0,
        denominator: 0,
        result: null,
        resultFormatted: '-',
        status: 'Pendiente Actualización'
      });
    }
  }

  // 7. GES Oncológico (5.1)
  // Col 29: Num, Col 30: Den, Col 31: Res
  const gesOncoMonthly = [];
  let lastValidGesOnco = { num: 601, den: 746, res: 80.56 };
  for (let m = 0; m < 12; m++) {
    const row = data[m + 1] || [];
    const num = row[29];
    const den = row[30];
    if (num !== undefined && num !== null && num !== '' && den !== undefined && den !== null && den !== '' && den > 0) {
      const pct = (num / den) * 100;
      gesOncoMonthly.push({
        month: MONTH_NAMES[m],
        numerator: num,
        denominator: den,
        result: Number(pct.toFixed(2)),
        resultFormatted: pct.toFixed(2) + '%',
        status: pct >= 99.5 ? 'Cumple' : 'No Cumple'
      });
      lastValidGesOnco = { num, den, res: pct, month: MONTH_NAMES[m] };
    } else {
      gesOncoMonthly.push({
        month: MONTH_NAMES[m],
        numerator: 0,
        denominator: 0,
        result: null,
        resultFormatted: '-',
        status: 'Pendiente Actualización'
      });
    }
  }

  // 8. Ambulatorización (M1.1 / CMA)
  const wsAmb = wb.Sheets['1,1 AMB CMA'];
  const dataAmb = XLSX.utils.sheet_to_json(wsAmb, { header: 1 });
  const cmaMonthly = [];
  for (let m = 0; m < 12; m++) {
    const row = dataAmb[m + 1] || [];
    const cma = row[5];
    const cmElec = row[6];
    if (cma !== undefined && cma !== null && cmElec !== undefined && cmElec !== null && (cma + cmElec) > 0) {
      const pct = (cma / (cma + cmElec)) * 100;
      cmaMonthly.push({
        month: MONTH_NAMES[m],
        numerator: cma,
        denominator: cma + cmElec,
        result: Number(pct.toFixed(2)),
        resultFormatted: pct.toFixed(2) + '%',
        status: pct >= 50.0 ? 'Cumple' : 'No Cumple'
      });
    } else {
      cmaMonthly.push({
        month: MONTH_NAMES[m],
        numerator: 0,
        denominator: 0,
        result: null,
        resultFormatted: '-',
        status: 'Pendiente Actualización'
      });
    }
  }

  // 9. Abandono Urgencia (M1.9)
  const wsAb = wb.Sheets['1,9 ABANDONO URG'];
  const dataAb = XLSX.utils.sheet_to_json(wsAb, { header: 1 });
  const abandonoMonthly = [];
  for (let m = 0; m < 12; m++) {
    const row = dataAb[m + 1] || [];
    const num = row[4];
    const den = row[5];
    if (num !== undefined && num !== null && den !== undefined && den !== null && den > 0) {
      const pct = (num / den) * 100;
      abandonoMonthly.push({
        month: MONTH_NAMES[m],
        numerator: num,
        denominator: den,
        result: Number(pct.toFixed(2)),
        resultFormatted: pct.toFixed(2) + '%',
        status: pct <= 10.0 ? 'Cumple' : 'No Cumple'
      });
    } else {
      abandonoMonthly.push({
        month: MONTH_NAMES[m],
        numerator: 0,
        denominator: 0,
        result: null,
        resultFormatted: '-',
        status: 'Pendiente Actualización'
      });
    }
  }

  // Import existing comges2026Data to maintain indicator structure
  import('../src/data/comges2026Data.js').then(existingModule => {
    const indicators = existingModule.COMGES_INDICATORS.map(ind => {
      if (ind.id === '1.1') {
        ind.monthlyData = suspMonthly;
        ind.summaryYTD = {
          numerator: 161,
          denominator: 2186,
          result: 7.37,
          resultFormatted: "7.37%",
          status: "No Cumple",
          observation: "Acumulado a Julio/Agosto 2026: 7.37% de suspensiones (161 de 2.186 programadas vs Meta ≤ 6.5%)."
        };
      } else if (ind.id === '3.1') {
        ind.monthlyData = gesMonthly;
        ind.summaryYTD = {
          numerator: lastValidGes.num,
          denominator: lastValidGes.den,
          result: Number(lastValidGes.res.toFixed(2)),
          resultFormatted: lastValidGes.res.toFixed(2) + "%",
          status: lastValidGes.res >= 99.5 ? "Cumple" : "No Cumple",
          observation: `Acumulado a Agosto 2026: ${lastValidGes.res.toFixed(2)}% de cumplimiento GES (${lastValidGes.num.toLocaleString('es-CL')} cumplidas de ${lastValidGes.den.toLocaleString('es-CL')} totales).`
        };
      } else if (ind.id === '3.2') {
        ind.monthlyData = leMedicaMonthly;
        ind.summaryYTD = {
          numerator: 1422,
          denominator: 1938,
          result: 73.37,
          resultFormatted: "73.37%",
          status: "En Avance",
          observation: "Avance a Agosto 2026: 73.37% de egresos respecto de la línea base P75 médica (1.422 de 1.938 casos)."
        };
      } else if (ind.id === '3.3.1') {
        ind.monthlyData = leOdontoExMonthly;
        ind.summaryYTD = {
          numerator: 1099,
          denominator: 1354,
          result: 81.17,
          resultFormatted: "81.17%",
          status: "En Avance",
          observation: "Avance a Agosto 2026: 81.17% de egresos respecto de la línea base P75 Odontológica (1.099 de 1.354 casos)."
        };
      } else if (ind.id === '3.3.2') {
        ind.monthlyData = leOrtodMonthly;
        ind.summaryYTD = {
          numerator: 253,
          denominator: 611,
          result: 41.41,
          resultFormatted: "41.41%",
          status: "En Avance",
          observation: "Avance a Agosto 2026: 41.41% de egresos respecto de la línea base P75 Ortodoncia (253 de 611 casos)."
        };
      } else if (ind.id === '3.4') {
        ind.monthlyData = leQxMonthly;
        ind.summaryYTD = {
          numerator: 236,
          denominator: 382,
          result: 61.78,
          resultFormatted: "61.78%",
          status: "En Avance",
          observation: "Avance a Agosto 2026: 61.78% de egresos respecto de la línea base P75 quirúrgica (236 de 382 casos)."
        };
      } else if (ind.id === '5.1') {
        ind.monthlyData = gesOncoMonthly;
        ind.summaryYTD = {
          numerator: 601,
          denominator: 746,
          result: 80.56,
          resultFormatted: "80.56%",
          status: "No Cumple",
          observation: "Acumulado a Agosto 2026: 80.56% de cumplimiento efectivo en GES oncológico (601 de 746 garantías)."
        };
      } else if (ind.id === 'M1.1') {
        ind.monthlyData = cmaMonthly;
        ind.summaryYTD = {
          numerator: 2343,
          denominator: 3338,
          result: 70.19,
          resultFormatted: "70.19%",
          status: "Cumple",
          observation: "Acumulado a Julio 2026: 70.19% de ambulatorización en cirugías mayores electivas (2.343 CMA de 3.338 CM totales)."
        };
      } else if (ind.id === 'M1.9') {
        ind.monthlyData = abandonoMonthly;
      }
      return ind;
    });

    const outputContent = `// Dataset Oficial COMGES 2026 - Hospital de Villarrica
// Separación de COMGES 3.3 en 3.3.1 (Excluye Ortodoncia) y 3.3.2 (Ortodoncia) según planilla resumen oficial.

export const COMGES_META = {
  hospital: "Hospital de Villarrica",
  service: "Servicio de Salud Araucanía Sur",
  year: 2026,
  version: "Versión Final MINSAL (Corte a Agosto 2026)",
  lastUpdatedMonth: "Agosto 2026",
  totalIndicators: ${indicators.length},
  totalDomains: ${existingModule.COMGES_DOMAINS.length},
  sourceFiles: [
    "Minuta COMGES 2026 FINAL.pdf",
    "Orientaciones Técnicas COMGES 2026_Versión FINAL JULIO.pdf",
    "PLANILLA COMGES 2026.xlsx",
    "Videoconferencia COMGES MINSAL 21-07-2026.pdf",
    "Ord 1934-2026 Monitoreo Ausentismo Laboral por LMC periodo mayo 2026.pdf"
  ]
};

export const REM_CALENDAR = ${JSON.stringify(existingModule.REM_CALENDAR, null, 2)};

export const REGIONAL_HOSPITALS = ${JSON.stringify(existingModule.REGIONAL_HOSPITALS, null, 2)};

export const COMGES_DOMAINS = ${JSON.stringify(existingModule.COMGES_DOMAINS, null, 2)};

export const COMGES_INDICATORS = ${JSON.stringify(indicators, null, 2)};
`;

    fs.writeFileSync(currentPath, outputContent, 'utf8');
    console.log('✓ comges2026Data.js actualizado correctamente.');
  });
}

updateComges();
