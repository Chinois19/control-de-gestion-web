export const LEY18834_META = {
  law: "Ley 18.834",
  title: "Metas Sanitarias Ley N° 18.834 - Año 2026",
  subtitle: "Cumplimiento Institucional del Hospital de Villarrica regulado por la Res. Exenta N° 649 (MINSAL, 2026). Datos oficializados a Junio 2026.",
  resolution: "RES. EXENTA N° 649 (2026)",
  hospital: "Hospital de Villarrica",
  year: "2026",
  lastUpdatedMonth: "Junio",
  totalScore: 70.0
};

export const LEY18834_INDICATORS = [
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
      numerator: "N° de garantías GES cumplidas dentro del plazo legal en el establecimiento (6.399 a Junio).",
      denominator: "N° total de garantías GES vencidas y abiertas evaluadas en el periodo (6.979 a Junio).",
      expression: "(Garantías GES Cumplidas / Total Garantías GES Evaluadas) × 100"
    },
    evalRules: "Evaluación mensual acumulada. Para obtener el 10% de ponderación, el establecimiento debe alcanzar un porcentaje de cumplimiento igual o superior al 99,5%.",
    monthlyData: [
      { month: "Enero", numerator: 2259, denominator: 2377, result: 95.04, resultFormatted: "95.04%", status: "No Cumple" },
      { month: "Febrero", numerator: 2920, denominator: 3095, result: 94.35, resultFormatted: "94.35%", status: "No Cumple" },
      { month: "Marzo", numerator: 3387, denominator: 3758, result: 90.13, resultFormatted: "90.13%", status: "No Cumple" },
      { month: "Abril", numerator: 4820, denominator: 5273, result: 91.41, resultFormatted: "91.41%", status: "No Cumple" },
      { month: "Mayo", numerator: 5821, denominator: 6299, result: 92.41, resultFormatted: "92.41%", status: "No Cumple" },
      { month: "Junio", numerator: 6399, denominator: 6979, result: 91.69, resultFormatted: "91.69%", status: "No Cumple" },
      { month: "Julio", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" },
      { month: "Agosto", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" },
      { month: "Septiembre", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" },
      { month: "Octubre", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" },
      { month: "Noviembre", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" },
      { month: "Diciembre", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" }
    ],
    summaryYTD: {
      numerator: 6399,
      denominator: 6979,
      result: 91.69,
      resultFormatted: "91.69%",
      scoreObtained: 0.0,
      status: "No Cumple",
      observation: "Acumulado a Junio 2026: 91.69% de cumplimiento GES (6.399 garantías cumplidas de 6.979 totales evaluadas vs Meta ≥ 99.5%)."
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
    monthlyData: [
      { month: "Enero", numerator: 45, denominator: 45, result: 100.0, resultFormatted: "100.0%", status: "Cumple" },
      { month: "Febrero", numerator: 45, denominator: 45, result: 100.0, resultFormatted: "100.0%", status: "Cumple" },
      { month: "Marzo", numerator: 50, denominator: 50, result: 100.0, resultFormatted: "100.0%", status: "Cumple" },
      { month: "Abril", numerator: 48, denominator: 48, result: 100.0, resultFormatted: "100.0%", status: "Cumple" },
      { month: "Mayo", numerator: 52, denominator: 52, result: 100.0, resultFormatted: "100.0%", status: "Cumple" },
      { month: "Junio", numerator: 45, denominator: 45, result: 100.0, resultFormatted: "100.0%", status: "Cumple" },
      { month: "Julio", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" },
      { month: "Agosto", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" },
      { month: "Septiembre", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" },
      { month: "Octubre", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" },
      { month: "Noviembre", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" },
      { month: "Diciembre", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" }
    ],
    summaryYTD: {
      numerator: 285,
      denominator: 285,
      result: 100.0,
      resultFormatted: "100.0%",
      scoreObtained: 10.0,
      status: "Cumple",
      observation: "Acumulado a Junio 2026: 100.0% de cumplimiento en trazadoras de mantenimiento e infraestructura (285 actividades ejecutadas de 285 programadas)."
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
    monthlyData: [
      { month: "Enero", numerator: 0, denominator: 896, result: 0.0, resultFormatted: "0.00%", status: "No Cumple" },
      { month: "Febrero", numerator: 0, denominator: 896, result: 0.0, resultFormatted: "0.00%", status: "No Cumple" },
      { month: "Marzo", numerator: 0, denominator: 896, result: 0.0, resultFormatted: "0.00%", status: "No Cumple" },
      { month: "Abril", numerator: 0, denominator: 896, result: 0.0, resultFormatted: "0.00%", status: "No Cumple" },
      { month: "Mayo", numerator: 0, denominator: 896, result: 0.0, resultFormatted: "0.00%", status: "No Cumple" },
      { month: "Junio", numerator: 0, denominator: 896, result: 0.0, resultFormatted: "0.00%", status: "No Cumple" },
      { month: "Julio", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" },
      { month: "Agosto", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" },
      { month: "Septiembre", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" },
      { month: "Octubre", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" },
      { month: "Noviembre", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" },
      { month: "Diciembre", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" }
    ],
    summaryYTD: {
      numerator: 0,
      denominator: 896,
      result: 0.0,
      resultFormatted: "0.00%",
      scoreObtained: 0.0,
      status: "No Cumple",
      observation: "Acumulado a Junio 2026: 0.00% de avance (0 de 896 funcionarios capacitados en temáticas transversales). Requiere ejecución urgente del plan de capacitación."
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
      numerator: "N° de funcionarios/as Ley 18.834 con capacitación vigente en Reanimación Cardiopulmonar (RCP) (553 a Junio).",
      denominator: "N° total de funcionarios/as Ley 18.834 de la dotación objetivo del establecimiento (896 funcionarios).",
      expression: "(Funcionarios Capacitados en RCP / Total Dotación Objetivo Ley 18.834) × 100"
    },
    evalRules: "Evaluación acumulada institucional. Meta MINSAL: alcanzar o superar el 60,0% de la dotación objetivo capacitada en RCP para adjudicarse el 30% de ponderación.",
    monthlyData: [
      { month: "Enero", numerator: 510, denominator: 896, result: 56.92, resultFormatted: "56.92%", status: "En Riesgo" },
      { month: "Febrero", numerator: 525, denominator: 896, result: 58.59, resultFormatted: "58.59%", status: "En Riesgo" },
      { month: "Marzo", numerator: 540, denominator: 896, result: 60.27, resultFormatted: "60.27%", status: "Cumple" },
      { month: "Abril", numerator: 552, denominator: 896, result: 61.61, resultFormatted: "61.61%", status: "Cumple" },
      { month: "Mayo", numerator: 564, denominator: 896, result: 62.95, resultFormatted: "62.95%", status: "Cumple" },
      { month: "Junio", numerator: 553, denominator: 896, result: 61.72, resultFormatted: "61.72%", status: "Cumple" },
      { month: "Julio", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" },
      { month: "Agosto", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" },
      { month: "Septiembre", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" },
      { month: "Octubre", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" },
      { month: "Noviembre", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" },
      { month: "Diciembre", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" }
    ],
    summaryYTD: {
      numerator: 553,
      denominator: 896,
      result: 61.72,
      resultFormatted: "61.72%",
      scoreObtained: 30.0,
      status: "Cumple",
      observation: "Acumulado a Junio 2026: 61.72% de funcionarios vigentes en RCP (553 de 896 funcionarios objetivo vs Meta ≥ 60.0%). Cumplimiento del 30% de ponderación."
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
      numerator: "N° de funcionarios/as clínicos directos capacitados en Prevención y Control de IAAS con antigüedad < 5 años (551 a Junio).",
      denominator: "N° total de funcionarios/as clínicos de atención directa Ley 18.834 del establecimiento (706 funcionarios).",
      expression: "(Funcionarios Clínicos Capacitados en IAAS / Total Dotación Clínica Directa) × 100"
    },
    evalRules: "Evaluación acumulada institucional. Meta MINSAL: alcanzar o superar el 70,0% de cobertura en capacitación de bioseguridad e IAAS para obtener el 30% de ponderación.",
    monthlyData: [
      { month: "Enero", numerator: 494, denominator: 706, result: 69.97, resultFormatted: "69.97%", status: "En Riesgo" },
      { month: "Febrero", numerator: 508, denominator: 706, result: 71.95, resultFormatted: "71.95%", status: "Cumple" },
      { month: "Marzo", numerator: 529, denominator: 706, result: 74.93, resultFormatted: "74.93%", status: "Cumple" },
      { month: "Abril", numerator: 537, denominator: 706, result: 76.06, resultFormatted: "76.06%", status: "Cumple" },
      { month: "Mayo", numerator: 551, denominator: 706, result: 78.05, resultFormatted: "78.05%", status: "Cumple" },
      { month: "Junio", numerator: 551, denominator: 706, result: 78.05, resultFormatted: "78.05%", status: "Cumple" },
      { month: "Julio", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" },
      { month: "Agosto", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" },
      { month: "Septiembre", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" },
      { month: "Octubre", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" },
      { month: "Noviembre", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" },
      { month: "Diciembre", numerator: 0, denominator: 0, result: null, resultFormatted: "-", status: "Pendiente Actualización" }
    ],
    summaryYTD: {
      numerator: 551,
      denominator: 706,
      result: 78.05,
      resultFormatted: "78.05%",
      scoreObtained: 30.0,
      status: "Cumple",
      observation: "Acumulado a Junio 2026: 78.05% de personal clínico capacitado en IAAS (551 de 706 funcionarios vs Meta ≥ 70.0%). Cumplimiento del 30% de ponderación."
    }
  }
];
