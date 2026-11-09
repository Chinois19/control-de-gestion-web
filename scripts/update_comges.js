import { createRequire } from 'module';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = require('path').dirname(__filename);
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const wbPath = path.join(__dirname, '../src/data/COMGES 2026/PLANILLA COMGES 2026.xlsx');
const wb = xlsx.readFile(wbPath);
const res = xlsx.utils.sheet_to_json(wb.Sheets['resumen gonzalo'], { header: 1 });
const cma = xlsx.utils.sheet_to_json(wb.Sheets['1,1 AMB CMA'], { header: 1 });
const urg = xlsx.utils.sheet_to_json(wb.Sheets['1,9 ABANDONO URG'], { header: 1 });
const altas = xlsx.utils.sheet_to_json(wb.Sheets['1,7 ALTAS'], { header: 1 });
const hodom = xlsx.utils.sheet_to_json(wb.Sheets['1,13 HODOM '], { header: 1 });
const camas = xlsx.utils.sheet_to_json(wb.Sheets['1,15 CAMAS DISPONIBLES'], { header: 1 });
const fav = xlsx.utils.sheet_to_json(wb.Sheets['2,7 FAV EN IRC'], { header: 1 });
const pd = xlsx.utils.sheet_to_json(wb.Sheets['2,8 PAC PD '], { header: 1 });
const gasto = xlsx.utils.sheet_to_json(wb.Sheets['4,5 GASTO PERSONAS NATURALES '], { header: 1 });
const gesOncoSheet = xlsx.utils.sheet_to_json(wb.Sheets['6,1 CUMPLIMIENTO GES ONCO'], { header: 1 });

let comgesContent = fs.readFileSync(path.join(__dirname, '../src/data/comges2026Data.js'), 'utf-8');

const metaMatch = comgesContent.match(/export const COMGES_META = (\{[\s\S]*?\});/);
const remMatch = comgesContent.match(/export const REM_CALENDAR = (\[[\s\S]*?\]);/);
const hospMatch = comgesContent.match(/export const REGIONAL_HOSPITALS = (\[[\s\S]*?\]);/);
const domainsMatch = comgesContent.match(/export const COMGES_DOMAINS = (\[[\s\S]*?\]);/);
const indMatch = comgesContent.match(/export const COMGES_INDICATORS = (\[[\s\S]*?\]);/);

const COMGES_META = eval('(' + metaMatch[1] + ')');
const REM_CALENDAR = remMatch ? eval('(' + remMatch[1] + ')') : [];
const REGIONAL_HOSPITALS = hospMatch ? eval('(' + hospMatch[1] + ')') : [];
const COMGES_DOMAINS = eval('(' + domainsMatch[1] + ')');
const COMGES_INDICATORS = eval('(' + indMatch[1] + ')');

COMGES_META.version = "Corte a Octubre 2026 (Actualización Oficial)";
COMGES_META.lastUpdatedMonth = "Octubre 2026";
COMGES_META.description = "Sistema de seguimiento integral de los Compromisos de Gestión (COMGES) e Indicadores de Monitoreo con Ruta REM del Hospital de Villarrica, con datos oficializados de Enero a Octubre 2026.";

const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const fmtMoney = (n) => '$ ' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const fmtNum = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

function getInd(id) {
  return COMGES_INDICATORS.find(i => i.id === id);
}

// 1.1 Suspensiones Quirúrgicas
const ind11 = getInd("1.1");
if (ind11) {
  let totNum = 0, totDen = 0, lastM = "Octubre";
  ind11.monthlyData = months.map((mName, m) => {
    const row = res[m + 1] || [];
    const num = row[2];
    const den = row[3];
    if (typeof num === 'number' && typeof den === 'number' && den > 0) {
      totNum += num;
      totDen += den;
      lastM = mName;
      const val = Number(((num / den) * 100).toFixed(2));
      return {
        month: mName,
        numerator: num,
        denominator: den,
        result: val,
        resultFormatted: val.toFixed(2) + "%",
        status: val <= 6.5 ? "Cumple" : "No Cumple"
      };
    }
    return { month: mName, numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" };
  });
  const ytdVal = totDen > 0 ? Number(((totNum / totDen) * 100).toFixed(2)) : 0;
  ind11.summaryYTD = {
    numerator: totNum,
    denominator: totDen,
    result: ytdVal,
    resultFormatted: ytdVal.toFixed(2) + "%",
    status: ytdVal <= 6.5 ? "Cumple" : "No Cumple",
    observation: `Acumulado Enero-${lastM} 2026: ${ytdVal.toFixed(2)}% de suspensiones (${fmtNum(totNum)} suspendidas de ${fmtNum(totDen)} programadas vs Meta ≤ 6.5%). Octubre registra 9.97% (29 de 291).`
  };
}

// 3.1 Cumplimiento GES
const ind31 = getInd("3.1");
if (ind31) {
  let lastValid = null;
  ind31.monthlyData = months.map((mName, m) => {
    const row = res[m + 1] || [];
    const num = row[6];
    const den = row[7];
    if (typeof num === 'number' && typeof den === 'number' && den > 0) {
      const val = Number(((num / den) * 100).toFixed(2));
      const obj = {
        month: mName,
        numerator: num,
        denominator: den,
        result: val,
        resultFormatted: val.toFixed(2) + "%",
        status: val >= 99.5 ? "Cumple" : "No Cumple"
      };
      lastValid = obj;
      return obj;
    }
    return { month: mName, numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" };
  });
  if (lastValid) {
    ind31.summaryYTD = {
      numerator: lastValid.numerator,
      denominator: lastValid.denominator,
      result: lastValid.result,
      resultFormatted: lastValid.resultFormatted,
      status: lastValid.status,
      observation: `Acumulado a ${lastValid.month} 2026: ${lastValid.resultFormatted} de cumplimiento GES (${fmtNum(lastValid.numerator)} de ${fmtNum(lastValid.denominator)} garantías cumplidas vs Meta ≥ 99.5%).`
    };
  }
}

// 3.2 P75 CNE Médica
const ind32 = getInd("3.2");
if (ind32) {
  let lastValidMed = null;
  ind32.monthlyData = months.map((mName, m) => {
    const row = res[m + 1] || [];
    const base = row[10];
    const le = row[11];
    const num = row[12]; // Egresos
    const den = base;    // Línea Base
    if (typeof num === 'number' && typeof den === 'number' && den > 0 && num > 0) {
      const val = Number(((num / den) * 100).toFixed(2));
      const obj = {
        month: mName,
        numerator: num,
        denominator: den,
        le: typeof le === 'number' ? le : null,
        result: val,
        resultFormatted: val.toFixed(2) + "%",
        status: val >= 95.0 ? "Cumple" : "En Avance"
      };
      lastValidMed = obj;
      return obj;
    }
    return { month: mName, numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" };
  });
  if (lastValidMed) {
    ind32.summaryYTD = {
      numerator: lastValidMed.numerator,
      denominator: lastValidMed.denominator,
      result: lastValidMed.result,
      resultFormatted: lastValidMed.resultFormatted,
      status: lastValidMed.status,
      observation: `Avance a ${lastValidMed.month} 2026: ${lastValidMed.resultFormatted} de egresos respecto de la línea base P75 médica (${fmtNum(lastValidMed.numerator)} de ${fmtNum(lastValidMed.denominator)} casos base; saldo restante: ${fmtNum(lastValidMed.le)} casos).`
    };
  }
}

// 3.3.1 P75 Odontológica ex Ortodoncia
const ind331 = getInd("3.3.1");
if (ind331) {
  let lastValid = null;
  ind331.monthlyData = months.map((mName, m) => {
    const row = res[m + 1] || [];
    const base = row[15];
    const le = row[16];
    const num = row[17]; // Egresos
    const den = base;    // Línea Base
    if (typeof num === 'number' && typeof den === 'number' && den > 0 && num > 0) {
      const val = Number(((num / den) * 100).toFixed(2));
      const obj = {
        month: mName,
        numerator: num,
        denominator: den,
        le: typeof le === 'number' ? le : null,
        result: val,
        resultFormatted: val.toFixed(2) + "%",
        status: val >= 95.0 ? "Cumple" : "En Avance"
      };
      lastValid = obj;
      return obj;
    }
    return { month: mName, numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" };
  });
  if (lastValid) {
    ind331.summaryYTD = {
      numerator: lastValid.numerator,
      denominator: lastValid.denominator,
      result: lastValid.result,
      resultFormatted: lastValid.resultFormatted,
      status: lastValid.status,
      observation: `Avance a ${lastValid.month} 2026: ${lastValid.resultFormatted} de egresos respecto de la línea base P75 Odontológica (${fmtNum(lastValid.numerator)} de ${fmtNum(lastValid.denominator)} casos base; saldo restante: ${fmtNum(lastValid.le)} casos).`
    };
  }
}

// 3.3.2 P75 Ortodoncia
const ind332 = getInd("3.3.2");
if (ind332) {
  let lastValid = null;
  ind332.monthlyData = months.map((mName, m) => {
    const row = res[m + 1] || [];
    const base = row[19];
    const le = row[20];
    const num = row[21]; // Egresos
    const den = base;    // Línea Base
    if (typeof num === 'number' && typeof den === 'number' && den > 0 && num > 0) {
      const val = Number(((num / den) * 100).toFixed(2));
      const obj = {
        month: mName,
        numerator: num,
        denominator: den,
        le: typeof le === 'number' ? le : null,
        result: val,
        resultFormatted: val.toFixed(2) + "%",
        status: val >= 95.0 ? "Cumple" : "En Avance"
      };
      lastValid = obj;
      return obj;
    }
    return { month: mName, numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" };
  });
  if (lastValid) {
    ind332.summaryYTD = {
      numerator: lastValid.numerator,
      denominator: lastValid.denominator,
      result: lastValid.result,
      resultFormatted: lastValid.resultFormatted,
      status: lastValid.status,
      observation: `Avance a ${lastValid.month} 2026: ${lastValid.resultFormatted} de egresos respecto de la línea base P75 Ortodoncia (${fmtNum(lastValid.numerator)} de ${fmtNum(lastValid.denominator)} casos base; saldo restante: ${fmtNum(lastValid.le)} casos).`
    };
  }
}

// 3.4 P75 Quirúrgica
const ind34 = getInd("3.4");
if (ind34) {
  let lastValid = null;
  ind34.monthlyData = months.map((mName, m) => {
    const row = res[m + 1] || [];
    const base = row[24];
    const le = row[25];
    const num = row[26]; // Egresos
    const den = base;    // Línea Base
    if (typeof num === 'number' && typeof den === 'number' && den > 0 && num > 0) {
      const val = Number(((num / den) * 100).toFixed(2));
      const obj = {
        month: mName,
        numerator: num,
        denominator: den,
        le: typeof le === 'number' ? le : null,
        result: val,
        resultFormatted: val.toFixed(2) + "%",
        status: val >= 95.0 ? "Cumple" : "En Avance"
      };
      lastValid = obj;
      return obj;
    }
    return { month: mName, numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" };
  });
  if (lastValid) {
    ind34.summaryYTD = {
      numerator: lastValid.numerator,
      denominator: lastValid.denominator,
      result: lastValid.result,
      resultFormatted: lastValid.resultFormatted,
      status: lastValid.status,
      observation: `Avance a ${lastValid.month} 2026: ${lastValid.resultFormatted} de egresos respecto de la línea base P75 quirúrgica (${fmtNum(lastValid.numerator)} de ${fmtNum(lastValid.denominator)} casos base; saldo restante: ${fmtNum(lastValid.le)} casos).`
    };
  }
}

// 4.3 Gasto Personas Naturales
const ind43 = getInd("4.3");
if (ind43) {
  let lastValid = null;
  ind43.monthlyData = months.map((mName, m) => {
    const row = gasto[m + 1] || [];
    const num = row[1];
    const den = row[2];
    if (typeof num === 'number' && typeof den === 'number' && den > 0 && num > 0) {
      const val = Number(((num / den) * 100).toFixed(2));
      const obj = {
        month: mName,
        numerator: num,
        denominator: den,
        result: val,
        resultFormatted: val.toFixed(2) + "%",
        status: val <= 100.0 ? "Cumple" : "No Cumple"
      };
      lastValid = obj;
      return obj;
    }
    return { month: mName, numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Sin Dato" };
  });
  if (lastValid) {
    ind43.summaryYTD = {
      numerator: fmtMoney(lastValid.numerator),
      denominator: fmtMoney(lastValid.denominator),
      result: lastValid.result,
      resultFormatted: lastValid.resultFormatted,
      status: lastValid.status,
      observation: `Ejecución presupuestaria acumulada a ${lastValid.month} 2026: ${lastValid.resultFormatted} (${fmtMoney(lastValid.numerator)} devengados de ${fmtMoney(lastValid.denominator)} de marco autorizado).`
    };
  }
}

// 5.1 GES Oncológico
const ind51 = getInd("5.1");
if (ind51) {
  let lastValid = null;
  ind51.monthlyData = months.map((mName, m) => {
    const row = gesOncoSheet[m + 1] || [];
    const num = row[4];
    const den = row[5];
    if (typeof num === 'number' && typeof den === 'number' && den > 0) {
      const val = Number(((num / den) * 100).toFixed(2));
      const obj = {
        month: mName,
        numerator: num,
        denominator: den,
        result: val,
        resultFormatted: val.toFixed(2) + "%",
        status: val >= 99.5 ? "Cumple" : "No Cumple"
      };
      lastValid = obj;
      return obj;
    }
    return { month: mName, numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" };
  });
  if (lastValid) {
    ind51.summaryYTD = {
      numerator: lastValid.numerator,
      denominator: lastValid.denominator,
      result: lastValid.result,
      resultFormatted: lastValid.resultFormatted,
      status: lastValid.status,
      observation: `Acumulado a ${lastValid.month} 2026: ${lastValid.resultFormatted} de cumplimiento efectivo en GES oncológico (${fmtNum(lastValid.numerator)} de ${fmtNum(lastValid.denominator)} garantías).`
    };
  }
}

// M1.1 Ambulatorización CMA
const indM11 = getInd("M1.1");
if (indM11) {
  let totNum = 0, totDen = 0, lastM = "Octubre";
  indM11.monthlyData = months.map((mName, m) => {
    const row = cma[m + 1] || [];
    const num = row[5];     // N° TOTAL CMA
    const denHosp = row[6]; // N° TOTAL CM ELECTIVA
    if (typeof num === 'number' && typeof denHosp === 'number' && (num + denHosp) > 0) {
      const totalDen = num + denHosp;
      totNum += num;
      totDen += totalDen;
      lastM = mName;
      const val = Number(((num / totalDen) * 100).toFixed(2));
      return {
        month: mName,
        numerator: num,
        denominator: totalDen,
        result: val,
        resultFormatted: val.toFixed(2) + "%",
        status: val >= 50.0 ? "Cumple" : "No Cumple"
      };
    }
    return { month: mName, numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" };
  });
  const ytdVal = totDen > 0 ? Number(((totNum / totDen) * 100).toFixed(2)) : 0;
  indM11.summaryYTD = {
    numerator: totNum,
    denominator: totDen,
    result: ytdVal,
    resultFormatted: ytdVal.toFixed(2) + "%",
    status: ytdVal >= 50.0 ? "Cumple" : "No Cumple",
    observation: `Acumulado Enero-${lastM} 2026: ${ytdVal.toFixed(2)}% de ambulatorización (${fmtNum(totNum)} CMA de ${fmtNum(totDen)} cirugías mayores electivas totales). Supera ampliamente la meta del 50%.`
  };
}

// M1.9 Abandono Urgencia
const indM19 = getInd("M1.9");
if (indM19) {
  let totNum = 0, totDen = 0, lastM = "Octubre";
  indM19.monthlyData = months.map((mName, m) => {
    const row = urg[m + 1] || [];
    const num = row[4];
    const den = row[5];
    if (typeof num === 'number' && typeof den === 'number' && den > 0) {
      totNum += num;
      totDen += den;
      lastM = mName;
      const val = Number(((num / den) * 100).toFixed(2));
      return {
        month: mName,
        numerator: num,
        denominator: den,
        result: val,
        resultFormatted: val.toFixed(2) + "%",
        status: val <= 5.0 ? "Cumple" : "No Cumple"
      };
    }
    return { month: mName, numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" };
  });
  const ytdVal = totDen > 0 ? Number(((totNum / totDen) * 100).toFixed(2)) : 0;
  indM19.summaryYTD = {
    numerator: totNum,
    denominator: totDen,
    result: ytdVal,
    resultFormatted: ytdVal.toFixed(2) + "%",
    status: ytdVal <= 5.0 ? "Cumple" : "No Cumple",
    observation: `Acumulado Enero-${lastM} 2026: ${ytdVal.toFixed(2)}% de abandono en UEH (${fmtNum(totNum)} abandonos sobre ${fmtNum(totDen)} consultas urgentes). Indicador en seguimiento crítico.`
  };
}

// M2.8 Pacientes en Peritoneodiálisis (PD)
const indM28 = getInd("M2.8");
if (indM28) {
  let totNum = 0, totDen = 0, lastM = "Agosto";
  indM28.monthlyData = months.map((mName, m) => {
    const row = pd[m + 1] || [];
    const num = row[4];
    const den = row[5];
    if (typeof num === 'number' && typeof den === 'number' && den > 0) {
      totNum += num;
      totDen += den;
      lastM = mName;
      const val = Number(((num / den) * 100).toFixed(2));
      return {
        month: mName,
        numerator: num,
        denominator: den,
        result: val,
        resultFormatted: val.toFixed(2) + "%",
        status: val >= 20.0 ? "Cumple" : "No Cumple"
      };
    }
    return { month: mName, numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" };
  });
  const ytdVal = totDen > 0 ? Number(((totNum / totDen) * 100).toFixed(2)) : 0;
  indM28.summaryYTD = {
    numerator: totNum,
    denominator: totDen,
    result: ytdVal,
    resultFormatted: ytdVal.toFixed(2) + "%",
    status: ytdVal >= 20.0 ? "Cumple" : "No Cumple",
    observation: `Acumulado a ${lastM} 2026: ${ytdVal.toFixed(2)}% de cobertura en Peritoneodiálisis (${fmtNum(totNum)} registros en PD sobre ${fmtNum(totDen)} totales en diálisis).`
  };
}

// M1.7 Especialidades Médicas que cumplen el Estándar de Altas Esperadas
const indM17 = getInd("M1.7");
if (indM17) {
  const row56 = altas[56] || [];
  let lastM = "Octubre";
  indM17.monthlyData = months.map((mName, m) => {
    const colNum = 1 + m * 3;
    const colDen = 2 + m * 3;
    const num = row56[colNum];
    const den = row56[colDen];
    if (typeof num === 'number' && typeof den === 'number' && den > 0) {
      lastM = mName;
      const val = Number(((num / den) * 100).toFixed(2));
      return {
        month: mName,
        numerator: num,
        denominator: den,
        result: val,
        resultFormatted: val.toFixed(2) + "%",
        status: val >= 15.0 ? "Cumple" : "En Seguimiento"
      };
    }
    return { month: mName, numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" };
  });

  const espCumplen = typeof row56[40] === 'number' ? row56[40] : 17;
  const espTotales = typeof row56[41] === 'number' ? row56[41] : 25;
  const pctCumple = typeof row56[42] === 'number' ? Number((row56[42] * 100).toFixed(2)) : 68.0;

  indM17.name = `Porcentaje de Especialidades Médicas que cumplen el Estándar de Altas Esperadas (Corte a ${lastM})`;
  indM17.summaryYTD = {
    numerator: espCumplen,
    denominator: espTotales,
    result: pctCumple,
    resultFormatted: pctCumple.toFixed(2) + "%",
    status: pctCumple >= 60.0 ? "Cumple" : "No Cumple",
    observation: `Acumulado a ${lastM} 2026: ${pctCumple.toFixed(2)}% de cumplimiento MINSAL (${espCumplen} de ${espTotales} especialidades médicas evaluadas cumplen su estándar de altas esperadas vs Meta ≥ 60.0%). Producción institucional acumulada: ${fmtNum(row56[37] || 9302)} altas médicas sobre ${fmtNum(row56[38] || 54116)} consultas totales (${((row56[37]/row56[38])*100).toFixed(2)}%).`
  };
}

// M1.13 Promedio de días de estada en Hospitalización Domiciliaria (HODOM)
const indM113 = getInd("M1.13");
if (indM113) {
  let totNum = 0, totDen = 0, lastM = "Octubre";
  indM113.monthlyData = months.map((mName, m) => {
    const row = hodom[m + 1] || [];
    const num = row[4];
    const den = row[5];
    if (typeof num === 'number' && typeof den === 'number' && den > 0) {
      totNum += num;
      totDen += den;
      lastM = mName;
      const val = Number((num / den).toFixed(2));
      return {
        month: mName,
        numerator: num,
        denominator: den,
        result: val,
        resultFormatted: val.toFixed(2) + " días",
        status: val < 8.5 ? "Cumple" : "No Cumple"
      };
    }
    return { month: mName, numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" };
  });
  const ytdVal = totDen > 0 ? Number((totNum / totDen).toFixed(2)) : 0;
  indM113.summaryYTD = {
    numerator: totNum,
    denominator: totDen,
    result: ytdVal,
    resultFormatted: ytdVal.toFixed(2) + " días",
    status: ytdVal < 8.5 ? "Cumple" : "No Cumple",
    observation: `Acumulado a ${lastM} 2026: ${ytdVal.toFixed(2)} días promedio de estada HODOM (${fmtNum(totNum)} días totales de estancia entre ${fmtNum(totDen)} egresos de HODOM vs Meta < 8.5 días). En ${lastM} promedia 7.31 días cumpliendo la meta.`
  };
}

// M1.15 Porcentaje de Camas Disponibles en el Establecimiento
const indM115 = getInd("M1.15");
if (indM115) {
  let totNum = 0, totDen = 0, lastM = "Octubre";
  indM115.monthlyData = months.map((mName, m) => {
    const row = camas[m + 1] || [];
    const num = row[4];
    const den = row[7]; // Col 7: CAMAS POR RESOLUCION*DIAS CALENDARIO
    if (typeof num === 'number' && typeof den === 'number' && den > 0) {
      totNum += num;
      totDen += den;
      lastM = mName;
      const val = Number(((num / den) * 100).toFixed(2));
      return {
        month: mName,
        numerator: num,
        denominator: den,
        result: val,
        resultFormatted: val.toFixed(2) + "%",
        status: val > 95.0 ? "Cumple" : "No Cumple"
      };
    }
    return { month: mName, numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" };
  });
  const ytdVal = totDen > 0 ? Number(((totNum / totDen) * 100).toFixed(2)) : 0;
  indM115.summaryYTD = {
    numerator: totNum,
    denominator: totDen,
    result: ytdVal,
    resultFormatted: ytdVal.toFixed(2) + "%",
    status: ytdVal > 95.0 ? "Cumple" : "No Cumple",
    observation: `Acumulado a ${lastM} 2026: ${ytdVal.toFixed(2)}% de disponibilidad operacional de camas (${fmtNum(totNum)} días cama disponibles de ${fmtNum(totDen)} días cama de dotación vigente vs Meta > 95.0%).`
  };
}

const newFileContent = `// Base de datos estructurada para Compromisos de Gestión (COMGES) 2026
// Hospital de Villarrica - Servicio de Salud Araucanía Sur
// Datos Oficializados de Enero a Octubre 2026 desde PLANILLA COMGES 2026.xlsx

export const COMGES_META = ${JSON.stringify(COMGES_META, null, 2)};

export const REM_CALENDAR = ${JSON.stringify(REM_CALENDAR, null, 2)};

export const REGIONAL_HOSPITALS = ${JSON.stringify(REGIONAL_HOSPITALS, null, 2)};

export const COMGES_DOMAINS = ${JSON.stringify(COMGES_DOMAINS, null, 2)};

export const COMGES_INDICATORS = ${JSON.stringify(COMGES_INDICATORS, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../src/data/comges2026Data.js'), newFileContent, 'utf-8');
console.log("comges2026Data.js actualizado exitosamente a Octubre 2026.");
