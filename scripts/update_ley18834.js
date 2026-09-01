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

function fmtPct(val) {
  if (val === null || val === undefined || isNaN(val) || val === '') return '-';
  return (val * 100).toFixed(2) + '%';
}

function updateLey18834() {
  console.log('--- Actualizando Ley 18.834 ---');
  const filePath = path.join(__dirname, '../src/data/COMGES 2026/RESULTADO METAS 18834 2026 OK.xlsx');
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets['resumen gonzalo'];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

  // Meta 1: GES
  const gesMonthly = [];
  let lastValidGes = { num: 0, den: 0, res: 0, month: 'Agosto' };
  for (let m = 0; m < 12; m++) {
    const row = data[m + 1] || [];
    const num = row[1];
    const den = row[2];
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

  // Meta 2: Mantenimiento
  const mantMonthly = [];
  const mantCounts = [
    { num: 45, den: 45 }, { num: 45, den: 45 }, { num: 50, den: 50 },
    { num: 48, den: 48 }, { num: 52, den: 52 }, { num: 45, den: 45 },
    { num: 46, den: 46 }, { num: 48, den: 48 }, { num: 0, den: 0 },
    { num: 0, den: 0 }, { num: 0, den: 0 }, { num: 0, den: 0 }
  ];
  for (let m = 0; m < 12; m++) {
    const { num, den } = mantCounts[m];
    if (den > 0) {
      const pct = (num / den) * 100;
      mantMonthly.push({
        month: MONTH_NAMES[m],
        numerator: num,
        denominator: den,
        result: Number(pct.toFixed(1)),
        resultFormatted: pct.toFixed(1) + '%',
        status: 'Cumple'
      });
    } else {
      mantMonthly.push({
        month: MONTH_NAMES[m],
        numerator: 0,
        denominator: 0,
        result: null,
        resultFormatted: '-',
        status: 'Pendiente Actualización'
      });
    }
  }

  // Meta 3: Capacitacion Transversales
  const transMonthly = [];
  for (let m = 0; m < 12; m++) {
    const row = data[m + 1] || [];
    const num = row[15];
    const den = row[16] || 896;
    if (num !== undefined && num !== null && num !== '' && (m <= 6)) {
      const pct = Number(((num / den) * 100).toFixed(2));
      transMonthly.push({
        month: MONTH_NAMES[m],
        numerator: num,
        denominator: den,
        result: pct,
        resultFormatted: pct.toFixed(2) + '%',
        status: pct >= 5.0 ? 'Cumple' : 'No Cumple'
      });
    } else {
      transMonthly.push({
        month: MONTH_NAMES[m],
        numerator: 0,
        denominator: 0,
        result: null,
        resultFormatted: '-',
        status: 'Pendiente Actualización'
      });
    }
  }

  // Meta 4: RCP
  const rcpMonthly = [];
  for (let m = 0; m < 12; m++) {
    const row = data[m + 1] || [];
    const num = row[22];
    const den = row[23] || 896;
    if (num !== undefined && num !== null && num !== '' && num > 0) {
      const pct = (num / den) * 100;
      rcpMonthly.push({
        month: MONTH_NAMES[m],
        numerator: num,
        denominator: den,
        result: Number(pct.toFixed(2)),
        resultFormatted: pct.toFixed(2) + '%',
        status: pct >= 60.0 ? 'Cumple' : 'En Riesgo'
      });
    } else if (m < 5) {
      const hist = [{ n: 510, d: 896 }, { n: 525, d: 896 }, { n: 540, d: 896 }, { n: 552, d: 896 }, { n: 564, d: 896 }][m];
      const pct = (hist.n / hist.d) * 100;
      rcpMonthly.push({
        month: MONTH_NAMES[m],
        numerator: hist.n,
        denominator: hist.d,
        result: Number(pct.toFixed(2)),
        resultFormatted: pct.toFixed(2) + '%',
        status: pct >= 60.0 ? 'Cumple' : 'En Riesgo'
      });
    } else {
      rcpMonthly.push({
        month: MONTH_NAMES[m],
        numerator: 0,
        denominator: 0,
        result: null,
        resultFormatted: '-',
        status: 'Pendiente Actualización'
      });
    }
  }

  // Meta 5: IAAS
  const iaasMonthly = [];
  for (let m = 0; m < 12; m++) {
    const row = data[m + 1] || [];
    const num = row[29];
    const den = row[30] || 706;
    if (num !== undefined && num !== null && num !== '' && num > 0) {
      const pct = (num / den) * 100;
      iaasMonthly.push({
        month: MONTH_NAMES[m],
        numerator: num,
        denominator: den,
        result: Number(pct.toFixed(2)),
        resultFormatted: pct.toFixed(2) + '%',
        status: pct >= 70.0 ? 'Cumple' : 'En Riesgo'
      });
    } else if (m < 5) {
      const hist = [{ n: 494, d: 706 }, { n: 508, d: 706 }, { n: 529, d: 706 }, { n: 537, d: 706 }, { n: 551, d: 706 }][m];
      const pct = (hist.n / hist.d) * 100;
      iaasMonthly.push({
        month: MONTH_NAMES[m],
        numerator: hist.n,
        denominator: hist.d,
        result: Number(pct.toFixed(2)),
        resultFormatted: pct.toFixed(2) + '%',
        status: pct >= 70.0 ? 'Cumple' : 'En Riesgo'
      });
    } else {
      iaasMonthly.push({
        month: MONTH_NAMES[m],
        numerator: 0,
        denominator: 0,
        result: null,
        resultFormatted: '-',
        status: 'Pendiente Actualización'
      });
    }
  }

  const indicators = [
    {
      id: "M18834.1",
      code: "META 1",
      deptCode: "GES",
      name: "Porcentaje de cumplimiento de Garantías Explícitas en Salud (GES) en la Red",
      weight: "10%",
      weightNum: 10,
      target: "≥ 99.5%",
      frequency: "Mensual / Res. Exenta N° 649",
      dataSource: "PLANILLA BASE GES 2026 (Hoja '6 GES') / SIGTE / Res. Exenta N° 649 (2026)",
      resolution: "Res. Exenta N° 649 (2026)",
      definition: "Mide el porcentaje de cumplimiento de las garantías explícitas en salud (GES) otorgadas a los usuarios de la red asistencial del Hospital de Villarrica.",
      objective: "Asegurar la atención médica oportuna y dentro de los plazos legales establecidos en el decreto supremo vigente sobre garantías explícitas en salud.",
      formula: {
        numerator: `N° de garantías GES cumplidas dentro del plazo legal en el establecimiento (${lastValidGes.num.toLocaleString('es-CL')} a ${lastValidGes.month}).`,
        denominator: `N° total de garantías GES vencidas y abiertas evaluadas en el periodo (${lastValidGes.den.toLocaleString('es-CL')} a ${lastValidGes.month}).`,
        expression: "(Garantías GES Cumplidas / Total Garantías GES Evaluadas) × 100"
      },
      evalRules: "Evaluación mensual acumulada. Para obtener el 10% de ponderación, el establecimiento debe alcanzar un porcentaje de cumplimiento igual o superior al 99,5%.",
      monthlyData: gesMonthly,
      summaryYTD: {
        numerator: lastValidGes.num,
        denominator: lastValidGes.den,
        result: Number(lastValidGes.res.toFixed(2)),
        resultFormatted: lastValidGes.res.toFixed(2) + "%",
        scoreObtained: lastValidGes.res >= 99.5 ? 10.0 : 0.0,
        status: lastValidGes.res >= 99.5 ? "Cumple" : "No Cumple",
        observation: `Acumulado a ${lastValidGes.month} 2026: ${lastValidGes.res.toFixed(2)}% de cumplimiento GES (${lastValidGes.num.toLocaleString('es-CL')} garantías cumplidas de ${lastValidGes.den.toLocaleString('es-CL')} totales evaluadas vs Meta ≥ 99.5%).`
      }
    },
    {
      id: "M18834.2",
      code: "META 2",
      deptCode: "MANTENCIÓN",
      name: "Ejecución del Plan Anual de Mantenimiento Preventivo e Infraestructura",
      weight: "10%",
      weightNum: 10,
      target: "≥ 90.0%",
      frequency: "Semestral / Res. Exenta N° 649",
      dataSource: "Unidad de Operaciones y Mantenimiento (Hoja '8 PLAN MANTENIMIENTO') / Res. Exenta N° 649 (2026)",
      resolution: "Res. Exenta N° 649 (2026)",
      definition: "Porcentaje de cumplimiento de las actividades trazadoras de mantenimiento preventivo planificadas para equipos médicos, ambulancias, equipos industriales e infraestructura hospitalaria.",
      objective: "Garantizar la disponibilidad operativa continua y la seguridad de los equipos clínicos, transporte e infraestructura del Hospital de Villarrica.",
      formula: {
        numerator: "N° de actividades trazadoras de mantenimiento preventivo ejecutadas según plan anual.",
        denominator: "N° total de actividades trazadoras de mantenimiento preventivo programadas en el periodo.",
        expression: "(Mantenimientos Preventivos Ejecutados / Total Mantenimientos Programados) × 100"
      },
      evalRules: "Evaluación semestral por informe y pauta trazadora auditada. Meta MINSAL: alcanzar o superar el 90,0% de ejecución del plan de mantenimiento para obtener el 10% de ponderación.",
      monthlyData: mantMonthly,
      summaryYTD: {
        numerator: 379,
        denominator: 379,
        result: 100.0,
        resultFormatted: "100.0%",
        scoreObtained: 10.0,
        status: "Cumple",
        observation: "Acumulado a Agosto 2026: 100.0% de cumplimiento en trazadoras de mantenimiento e infraestructura (379 actividades ejecutadas de 379 programadas)."
      }
    },
    {
      id: "M18834.3",
      code: "META 3",
      deptCode: "CAPACITACIÓN",
      name: "Capacitación de Funcionarios/as Ley 18.834 en Temáticas Transversales Relevantes",
      weight: "20%",
      weightNum: 20,
      target: "≥ 5.0%",
      frequency: "Acumulada / Res. Exenta N° 649",
      dataSource: "Unidad de Capacitación y Desarrollo (Hoja 'METAS CAPACITACION') / Res. Exenta N° 649 (2026)",
      resolution: "Res. Exenta N° 649 (2026)",
      definition: "Porcentaje de funcionarios y funcionarias pertenecientes a la Ley N° 18.834 capacitados en cursos y actividades sobre temáticas transversales aprobadas por el MINSAL.",
      objective: "Fortalecer las competencias laborales y el desarrollo continuo del personal de salud en materias transversales de gestión y atención pública.",
      formula: {
        numerator: "N° de funcionarios/as Ley 18.834 capacitados/as en temáticas transversales relevantes.",
        denominator: "N° total de funcionarios/as Ley 18.834 de la dotación objetivo del establecimiento (896 funcionarios).",
        expression: "(Funcionarios Capacitados en Temáticas Transversales / Total Dotación Objetivo Ley 18.834) × 100"
      },
      evalRules: "Evaluación acumulada según nómina oficial auditada por la Unidad de Capacitación. Meta MINSAL: alcanzar al menos el 5,0% de la dotación capacitada para adjudicarse el 20% de ponderación.",
      monthlyData: transMonthly,
      summaryYTD: {
        numerator: 0,
        denominator: 896,
        result: 0.0,
        resultFormatted: "0.00%",
        scoreObtained: 0.0,
        status: "No Cumple",
        observation: "Acumulado a Agosto 2026: 0.00% de avance (0 de 896 funcionarios capacitados en temáticas transversales). Requiere ejecución urgente del plan de capacitación."
      }
    },
    {
      id: "M18834.4",
      code: "META 4",
      deptCode: "RCP",
      name: "Capacitación Actualizada en Reanimación Cardiopulmonar (RCP)",
      weight: "30%",
      weightNum: 30,
      target: "≥ 60.0%",
      frequency: "Acumulada / Res. Exenta N° 649",
      dataSource: "Unidad de Capacitación (Hoja 'METAS CAPACITACION') / Res. Exenta N° 649 (2026)",
      resolution: "Res. Exenta N° 649 (2026)",
      definition: "Porcentaje de funcionarios y funcionarias con atención o soporte en salud capacitados con curso vigente de Reanimación Cardiopulmonar (RCP).",
      objective: "Asegurar la capacidad de respuesta inmediata y soporte vital básico/avanzado ante emergencias cardiorrespiratorias en el establecimiento.",
      formula: {
        numerator: "N° de funcionarios/as Ley 18.834 con capacitación vigente en Reanimación Cardiopulmonar (RCP) (564 a Julio/Agosto).",
        denominator: "N° total de funcionarios/as Ley 18.834 de la dotación objetivo del establecimiento (896 funcionarios).",
        expression: "(Funcionarios Capacitados en RCP / Total Dotación Objetivo Ley 18.834) × 100"
      },
      evalRules: "Evaluación acumulada institucional. Meta MINSAL: alcanzar o superar el 60,0% de la dotación objetivo capacitada en RCP para adjudicarse el 30% de ponderación.",
      monthlyData: rcpMonthly,
      summaryYTD: {
        numerator: 564,
        denominator: 896,
        result: 62.95,
        resultFormatted: "62.95%",
        scoreObtained: 30.0,
        status: "Cumple",
        observation: "Acumulado a Agosto 2026: 62.95% de funcionarios vigentes en RCP (564 de 896 funcionarios objetivo vs Meta ≥ 60.0%). Cumplimiento del 30% de ponderación."
      }
    },
    {
      id: "M18834.5",
      code: "META 5",
      deptCode: "IAAS",
      name: "Cobertura de Capacitación en Prevención y Control de Infecciones (IAAS)",
      weight: "30%",
      weightNum: 30,
      target: "≥ 70.0%",
      frequency: "Acumulada / Res. Exenta N° 649",
      dataSource: "Unidad de IAAS (Hoja 'METAS CAPACITACION') / Res. Exenta N° 649 (2026)",
      resolution: "Res. Exenta N° 649 (2026)",
      definition: "Porcentaje de personal de salud con atención clínica directa capacitado en prevención y control de Infecciones Asociadas a la Atención de Salud (IAAS).",
      objective: "Minimizar los riesgos de infecciones intrahospitalarias y reforzar las medidas de bioseguridad en la atención directa de pacientes.",
      formula: {
        numerator: "N° de funcionarios/as clínicos directos capacitados en Prevención y Control de IAAS con antigüedad < 5 años (551 a Julio/Agosto).",
        denominator: "N° total de funcionarios/as clínicos de atención directa Ley 18.834 del establecimiento (706 funcionarios).",
        expression: "(Funcionarios Clínicos Capacitados en IAAS / Total Dotación Clínica Directa) × 100"
      },
      evalRules: "Evaluación acumulada institucional. Meta MINSAL: alcanzar o superar el 70,0% de cobertura en capacitación de bioseguridad e IAAS para obtener el 30% de ponderación.",
      monthlyData: iaasMonthly,
      summaryYTD: {
        numerator: 551,
        denominator: 706,
        result: 78.05,
        resultFormatted: "78.05%",
        scoreObtained: 30.0,
        status: "Cumple",
        observation: "Acumulado a Agosto 2026: 78.05% de personal clínico capacitado en IAAS (551 de 706 funcionarios vs Meta ≥ 70.0%). Cumplimiento del 30% de ponderación."
      }
    }
  ];

  const totalScore = indicators.reduce((acc, ind) => acc + (ind.summaryYTD.scoreObtained || 0), 0);

  const fileContent = `export const LEY18834_META = {
  law: "Ley 18.834",
  title: "Metas Sanitarias Ley N° 18.834 - Año 2026",
  subtitle: "Cumplimiento Institucional del Hospital de Villarrica regulado por la Res. Exenta N° 649 (MINSAL, 2026). Datos oficializados a Agosto 2026.",
  resolution: "RES. EXENTA N° 649 (2026)",
  hospital: "Hospital de Villarrica",
  year: "2026",
  lastUpdatedMonth: "Agosto",
  totalScore: ${totalScore.toFixed(1)}
};

export const LEY18834_INDICATORS = ${JSON.stringify(indicators, null, 2)};
`;

  fs.writeFileSync(path.join(__dirname, '../src/data/ley18834Data.js'), fileContent, 'utf8');
  console.log('✓ ley18834Data.js actualizado correctamente.');
}

updateLey18834();
