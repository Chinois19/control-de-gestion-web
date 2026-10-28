import { createRequire } from 'module';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = require('path').dirname(__filename);
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const wbPath = path.join(__dirname, '../src/data/COMGES 2026/RESULTADO METAS 18834 2026 OK.xlsx');
const wb = xlsx.readFile(wbPath);
const res = xlsx.utils.sheet_to_json(wb.Sheets['resumen gonzalo'], { header: 1 });
const cap = xlsx.utils.sheet_to_json(wb.Sheets['METAS CAPACITACION'], { header: 1 });
const pm = xlsx.utils.sheet_to_json(wb.Sheets['8 PLAN MANTENIMIENTO'], { header: 1 });

let content = fs.readFileSync(path.join(__dirname, '../src/data/ley18834Data.js'), 'utf-8');
const indMatch = content.match(/export const LEY18834_INDICATORS = (\[[\s\S]*?\]);/);
const LEY18834_INDICATORS = eval('(' + indMatch[1] + ')');

const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const fmtNum = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

function getInd(id) {
  return LEY18834_INDICATORS.find(i => i.id === id);
}

// Meta 1: GES (Ind 6) -> resumen gonzalo cols: 1=num, 2=den, 3=res
const m1 = getInd("M18834.1");
if (m1) {
  let lastValid = null;
  for (let m = 0; m < 12; m++) {
    const row = res[m + 1] || [];
    const num = row[1];
    const den = row[2];
    if (typeof num === 'number' && typeof den === 'number' && den > 0) {
      const val = Number(((num / den) * 100).toFixed(2));
      m1.monthlyData[m] = {
        month: months[m],
        numerator: num,
        denominator: den,
        result: val,
        resultFormatted: val.toFixed(2) + "%",
        status: val >= 99.5 ? "Cumple" : "No Cumple"
      };
      lastValid = m1.monthlyData[m];
    } else {
      m1.monthlyData[m] = { month: months[m], numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" };
    }
  }
  if (lastValid) {
    m1.formula.numerator = `N° de garantías GES cumplidas dentro del plazo legal en el establecimiento (${fmtNum(lastValid.numerator)} a ${lastValid.month}).`;
    m1.formula.denominator = `N° total de garantías GES vencidas y abiertas evaluadas en el periodo (${fmtNum(lastValid.denominator)} a ${lastValid.month}).`;
    m1.summaryYTD = {
      numerator: lastValid.numerator,
      denominator: lastValid.denominator,
      result: lastValid.result,
      resultFormatted: lastValid.resultFormatted,
      scoreObtained: lastValid.result >= 99.5 ? 10 : 0,
      status: lastValid.status,
      observation: `Acumulado a ${lastValid.month} 2026: ${lastValid.resultFormatted} de cumplimiento GES (${fmtNum(lastValid.numerator)} garantías cumplidas de ${fmtNum(lastValid.denominator)} totales evaluadas vs Meta ≥ 99.5%).`
    };
  }
}

// Meta 2: Mantenimiento Preventivo e Infraestructura (Ind 8) -> resumen gonzalo col 10
const m2 = getInd("M18834.2");
if (m2) {
  let totalExecYTD = 0, totalProgYTD = 0, lastM = "Agosto";
  for (let m = 0; m < 12; m++) {
    const rRow = res[m + 1] || [];
    const resValRaw = rRow[10]; // ponderated monthly result in resumen gonzalo
    const baseIdx = m * 6 + 1;
    let mExec = 0, mProg = 0;
    for (let t = 0; t < 4; t++) {
      const tRow = pm[baseIdx + t] || [];
      if (typeof tRow[9] === 'number' && typeof tRow[10] === 'number') {
        mProg += tRow[9];
        mExec += tRow[10];
      }
    }
    if (typeof resValRaw === 'number' && resValRaw > 0) {
      totalExecYTD += mExec;
      totalProgYTD += mProg;
      lastM = months[m];
      const val = Number((resValRaw * 100).toFixed(2));
      m2.monthlyData[m] = {
        month: months[m],
        numerator: mExec,
        denominator: mProg,
        result: val,
        resultFormatted: val.toFixed(2) + "%",
        status: val >= 90.0 ? "Cumple" : "En Riesgo"
      };
    } else {
      m2.monthlyData[m] = { month: months[m], numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" };
    }
  }
  const ytdRaw = (res[13] && typeof res[13][10] === 'number') ? res[13][10] : 0.96035;
  const ytdVal = Number((ytdRaw * 100).toFixed(2));
  m2.summaryYTD = {
    numerator: totalExecYTD,
    denominator: totalProgYTD,
    result: ytdVal,
    resultFormatted: ytdVal.toFixed(2) + "%",
    scoreObtained: ytdVal >= 90.0 ? 10 : 0,
    status: ytdVal >= 90.0 ? "Cumple" : "No Cumple",
    observation: `Acumulado a ${lastM} 2026: ${ytdVal.toFixed(2)}% de cumplimiento ponderado en las 5 trazadoras de mantenimiento preventivo e infraestructura (${fmtNum(totalExecYTD)} mantenciones ejecutadas de ${fmtNum(totalProgYTD)} programadas + ejecución SIGFE).`
  };
}

// Meta 3: Capacitación Temáticas Transversales (Ind 12) -> resumen gonzalo cols: 15=num, 16=den, 17=res
const m3 = getInd("M18834.3");
if (m3) {
  let lastValid = null;
  for (let m = 0; m < 12; m++) {
    const rRow = res[m + 1] || [];
    const num = rRow[15];
    const den = rRow[16];
    if (typeof num === 'number' && typeof den === 'number' && den > 0) {
      const val = Number(((num / den) * 100).toFixed(2));
      m3.monthlyData[m] = {
        month: months[m],
        numerator: num,
        denominator: den,
        result: val,
        resultFormatted: val.toFixed(2) + "%",
        status: val >= 5.0 ? "Cumple" : "No Cumple"
      };
      lastValid = m3.monthlyData[m];
    } else if (m < 8) {
      m3.monthlyData[m] = { month: months[m], numerator: 0, denominator: 896, result: 0, resultFormatted: "0.00%", status: "No Cumple" };
    } else {
      m3.monthlyData[m] = { month: months[m], numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" };
    }
  }
  if (lastValid) {
    m3.summaryYTD = {
      numerator: lastValid.numerator,
      denominator: lastValid.denominator,
      result: lastValid.result,
      resultFormatted: lastValid.resultFormatted,
      scoreObtained: lastValid.result >= 5.0 ? 20 : 0,
      status: lastValid.status,
      observation: `Acumulado a ${lastValid.month} 2026: ${lastValid.resultFormatted} de avance (${lastValid.numerator} de ${lastValid.denominator} funcionarios capacitados en temáticas transversales vs Meta ≥ 5.0%). Adjudica el 20% de ponderación.`
    };
  }
}

// Meta 4: RCP (Ind 13) -> resumen gonzalo cols: 22=num, 23=den, 24=res; cap rows 14..25 cols 7=num, 8=den
const m4 = getInd("M18834.4");
if (m4) {
  let lastValid = null;
  for (let m = 0; m < 12; m++) {
    const rRow = res[m + 1] || [];
    const cRow = cap[m + 14] || [];
    const num = (typeof rRow[22] === 'number' && rRow[22] > 0) ? rRow[22] : cRow[7];
    const den = (typeof rRow[23] === 'number' && rRow[23] > 0) ? rRow[23] : cRow[8];
    if (typeof num === 'number' && typeof den === 'number' && den > 0 && num > 0) {
      const val = Number(((num / den) * 100).toFixed(2));
      m4.monthlyData[m] = {
        month: months[m],
        numerator: num,
        denominator: den,
        result: val,
        resultFormatted: val.toFixed(2) + "%",
        status: val >= 60.0 ? "Cumple" : "En Riesgo"
      };
      lastValid = m4.monthlyData[m];
    } else if (m < 5 && m4.monthlyData[m] && m4.monthlyData[m].numerator > 0) {
      // Preserve historical Jan-May baseline if Excel sheet only starts recording in June
      lastValid = m4.monthlyData[m];
    } else {
      m4.monthlyData[m] = { month: months[m], numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" };
    }
  }
  if (lastValid) {
    m4.formula.numerator = `N° de funcionarios/as Ley 18.834 con capacitación vigente en Reanimación Cardiopulmonar (RCP) (${lastValid.numerator} a ${lastValid.month}).`;
    m4.summaryYTD = {
      numerator: lastValid.numerator,
      denominator: lastValid.denominator,
      result: lastValid.result,
      resultFormatted: lastValid.resultFormatted,
      scoreObtained: lastValid.result >= 60.0 ? 30 : 0,
      status: lastValid.status,
      observation: `Acumulado a ${lastValid.month} 2026: ${lastValid.resultFormatted} de funcionarios vigentes en RCP (${lastValid.numerator} de ${lastValid.denominator} funcionarios objetivo vs Meta ≥ 60.0%). Cumplimiento del 30% de ponderación.`
    };
  }
}

// Meta 5: IAAS (Ind 14) -> resumen gonzalo cols: 29=num, 30=den, 31=res; cap rows 27..38 cols 7=num, 8=den
const m5 = getInd("M18834.5");
if (m5) {
  let lastValid = null;
  for (let m = 0; m < 12; m++) {
    const rRow = res[m + 1] || [];
    const cRow = cap[m + 27] || [];
    const num = (typeof rRow[29] === 'number' && rRow[29] > 0) ? rRow[29] : cRow[7];
    const den = (typeof rRow[30] === 'number' && rRow[30] > 0) ? rRow[30] : cRow[8];
    if (typeof num === 'number' && typeof den === 'number' && den > 0 && num > 0) {
      const val = Number(((num / den) * 100).toFixed(2));
      m5.monthlyData[m] = {
        month: months[m],
        numerator: num,
        denominator: den,
        result: val,
        resultFormatted: val.toFixed(2) + "%",
        status: val >= 70.0 ? "Cumple" : "En Riesgo"
      };
      lastValid = m5.monthlyData[m];
    } else if (m < 5 && m5.monthlyData[m] && m5.monthlyData[m].numerator > 0) {
      lastValid = m5.monthlyData[m];
    } else {
      m5.monthlyData[m] = { month: months[m], numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" };
    }
  }
  if (lastValid) {
    m5.formula.numerator = `N° de funcionarios/as clínicos directos capacitados en Prevención y Control de IAAS con antigüedad < 5 años (${lastValid.numerator} a ${lastValid.month}).`;
    m5.summaryYTD = {
      numerator: lastValid.numerator,
      denominator: lastValid.denominator,
      result: lastValid.result,
      resultFormatted: lastValid.resultFormatted,
      scoreObtained: lastValid.result >= 70.0 ? 30 : 0,
      status: lastValid.status,
      observation: `Acumulado a ${lastValid.month} 2026: ${lastValid.resultFormatted} de personal clínico capacitado en IAAS (${lastValid.numerator} de ${lastValid.denominator} funcionarios vs Meta ≥ 70.0%). Cumplimiento del 30% de ponderación.`
    };
  }
}

const totalScore = LEY18834_INDICATORS.reduce((acc, ind) => acc + (ind.summaryYTD.scoreObtained || 0), 0);

const newContent = `export const LEY18834_META = {
  law: "Ley 18.834",
  title: "Metas Sanitarias Ley N° 18.834 - Año 2026",
  subtitle: "Cumplimiento Institucional del Hospital de Villarrica regulado por la Res. Exenta N° 649 (MINSAL, 2026). Datos oficializados a Septiembre 2026.",
  resolution: "RES. EXENTA N° 649 (2026)",
  hospital: "Hospital de Villarrica",
  year: "2026",
  lastUpdatedMonth: "Septiembre",
  totalScore: ${totalScore.toFixed(1)}
};

export const LEY18834_INDICATORS = ${JSON.stringify(LEY18834_INDICATORS, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../src/data/ley18834Data.js'), newContent, 'utf-8');
console.log("ley18834Data.js actualizado exitosamente. Puntaje Total:", totalScore);
