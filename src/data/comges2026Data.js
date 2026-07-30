// Dataset Oficial COMGES 2026 - Hospital de Villarrica
// Generado dinámicamente desde Orientaciones Técnicas MINSAL 2026, Minuta y PLANILLA COMGES 2026.xlsx

export const COMGES_META = {
  hospital: "Hospital de Villarrica",
  service: "Servicio de Salud Araucanía Sur",
  year: 2026,
  version: "Versión Final Julio 2026 (MINSAL)",
  lastUpdatedMonth: "Junio 2026",
  totalIndicators: 23,
  totalDomains: 6,
  sourceFiles: [
    "Minuta COMGES 2026 FINAL.pdf",
    "Orientaciones Técnicas COMGES 2026_Versión FINAL JULIO.pdf",
    "PLANILLA COMGES 2026.xlsx"
  ]
};

export const COMGES_DOMAINS = [
  {
    "id": "comges-1",
    "code": "COMGES 1",
    "title": "Eficiencia en la gestión de procesos asistenciales, calidad y seguridad del paciente",
    "weight": "18%",
    "color": "#3B82F6",
    "description": "Busca optimizar el uso de recursos asistenciales, reduciendo suspensiones quirúrgicas, mejorando la ambulatorización de procesos y garantizando estándares de calidad e infectovigilancia en la red."
  },
  {
    "id": "comges-2",
    "code": "COMGES 2",
    "title": "Estrategias de prevención, diagnóstico y tratamiento y salud mental en la Red Asistencial",
    "weight": "9%",
    "color": "#10B981",
    "description": "Fomenta la prevención, modelo ECICEP para adultos mayores, procuramiento e incremento de la tasa de donantes efectivos de órganos y tejidos en la red."
  },
  {
    "id": "comges-3",
    "code": "COMGES 3",
    "title": "Gestión de los tiempos de espera",
    "weight": "30%",
    "color": "#F59E0B",
    "description": "Prioriza la reducción de tiempos de espera en consultas médicas, odontológicas e intervenciones quirúrgicas (percentil 75), garantizando el 100% de oportunidad GES y resolución oportuna."
  },
  {
    "id": "comges-4",
    "code": "COMGES 4",
    "title": "Gestión de Riesgos, Recursos Humanos y Financieros",
    "weight": "13%",
    "color": "#8B5CF6",
    "description": "Monitorea la eficiencia en el uso de recursos presupuestarios, gasto en personas naturales, gestión del riesgo de desastres y procedimientos disciplinarios en el establecimiento."
  },
  {
    "id": "comges-5",
    "code": "COMGES 5",
    "title": "Prevención, detección temprana y tratamiento oportuno del cáncer",
    "weight": "17%",
    "color": "#EC4899",
    "description": "Fortalece la atención oncológica integral, cumpliendo las garantías GES oncológicas y priorizando la lista de espera quirúrgica oncológica No GES menor a 90 días."
  },
  {
    "id": "comges-6",
    "code": "COMGES 6",
    "title": "Sistemas de información y Salud Digital",
    "weight": "13%",
    "color": "#06B6D4",
    "description": "Despliega estrategias de Hospital Digital, Registro Clínico Electrónico (RCE) interoperable y tributación a los sistemas de información centrales de listas de espera."
  },
  {
    "id": "monitoreo",
    "code": "MONITOREO",
    "title": "Indicadores de Monitoreo Obligatorio Hospitalario",
    "weight": "Monitoreo",
    "color": "#64748B",
    "description": "Indicadores de seguimiento continuo en el Hospital de Villarrica: producción ambulatoria, ocupación de camas, ausentismo, urgencias, hemodiálisis y tasas de cesáreas."
  }
];

export const COMGES_INDICATORS = [
  {
    "id": "1.1",
    "code": "COMGES 1.1",
    "domainId": "comges-1",
    "name": "Suspensiones quirúrgicas en cirugía mayor electiva",
    "ponderacion": "4.5%",
    "type": "comges",
    "target": "≤ 6.5%",
    "frequency": "Mensual (Corte de evaluación semestral)",
    "dataSource": "Planilla de Registro Quirúrgico Hospitalario / SIGTE / REM-A08",
    "definition": "Mide el porcentaje de cirugías mayores electivas suspendidas respecto del total de cirugías mayores electivas programadas en tabla quirúrgica del Hospital de Villarrica. El propósito es promover la eficiencia del uso de pabellones y la disminución de suspensiones atribuibles al establecimiento.",
    "objective": "Aumentar la eficiencia en el uso de los pabellones quirúrgicos electivos y reducir las suspensiones por causas prevenibles.",
    "formula": {
      "numerator": "N° de cirugías mayores electivas suspendidas en el periodo.",
      "denominator": "N° total de cirugías mayores electivas programadas en el periodo.",
      "expression": "(Cirugías Suspendidas / Cirugías Programadas) × 100"
    },
    "evalRules": "Evaluación semestral con tabla de sensibilidad MINSAL. Se evalúa el porcentaje acumulado. Se penalizan suspensiones atribuibles a gestión del hospital (causales de equipo médico, tabla sobreprogramada, falta de insumos o preparación previa).",
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 18,
        "denominator": 318,
        "result": 5.66,
        "resultFormatted": "5.66%",
        "status": "Cumple"
      },
      {
        "month": "Febrero",
        "numerator": 18,
        "denominator": 284,
        "result": 6.34,
        "resultFormatted": "6.34%",
        "status": "Cumple"
      },
      {
        "month": "Marzo",
        "numerator": 25,
        "denominator": 292,
        "result": 8.56,
        "resultFormatted": "8.56%",
        "status": "No Cumple"
      },
      {
        "month": "Abril",
        "numerator": 28,
        "denominator": 331,
        "result": 8.46,
        "resultFormatted": "8.46%",
        "status": "No Cumple"
      },
      {
        "month": "Mayo",
        "numerator": 16,
        "denominator": 310,
        "result": 5.16,
        "resultFormatted": "5.16%",
        "status": "Cumple"
      },
      {
        "month": "Junio",
        "numerator": 26,
        "denominator": 318,
        "result": 8.18,
        "resultFormatted": "8.18%",
        "status": "No Cumple"
      },
      {
        "month": "Julio",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Pendiente Actualización"
      },
      {
        "month": "Agosto",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Pendiente Actualización"
      },
      {
        "month": "Septiembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Pendiente Actualización"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Pendiente Actualización"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Pendiente Actualización"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Pendiente Actualización"
      }
    ],
    "summaryYTD": {
      "numerator": 131,
      "denominator": 1853,
      "result": 7.07,
      "resultFormatted": "7.07%",
      "status": "No Cumple",
      "observation": "Acumulado a Junio 2026: 7.07% vs Meta ≤ 6.5%. Requiere reforzar gestión de suspensión en los meses de invierno."
    }
  },
  {
    "id": "1.2",
    "code": "COMGES 1.2",
    "domainId": "comges-1",
    "name": "Derivaciones en APS al nivel secundario respecto a las consultas totales",
    "ponderacion": "4.5%",
    "type": "comges",
    "target": "Cumplimiento del estándar o mapa de derivación en red",
    "frequency": "Trimestral / Semestral",
    "dataSource": "Sistema de Referencia y Contrarreferencia (SIC-RCE) / REM-A27",
    "definition": "Evalúa la efectividad y pertinencia diagnóstica en las derivaciones generadas desde la Atención Primaria de Salud hacia las especialidades del nivel secundario en el Hospital de Villarrica.",
    "objective": "Fortalecer la resolutividad de la Atención Primaria y optimizar el flujo de usuarios hacia la atención especializada.",
    "formula": {
      "numerator": "N° de interconsultas/derivaciones pertinentes de APS al nivel secundario.",
      "denominator": "N° total de consultas/interconsultas evaluadas.",
      "expression": "(Interconsultas Pertinentes / Interconsultas Totales) × 100"
    },
    "evalRules": "Corte de evaluación en 1° y 2° Semestre. Requisito de auditoría periódica de pertinencia por comités de especialidad.",
    "monthlyData": [],
    "summaryYTD": {
      "numerator": "-",
      "denominator": "-",
      "result": 92.4,
      "resultFormatted": "92.4%",
      "status": "Cumple",
      "observation": "Proceso de derivación articulado con la red APS del Nodo Lacustre."
    }
  },
  {
    "id": "1.3",
    "code": "COMGES 1.3",
    "domainId": "comges-1",
    "name": "Cumplimiento de la tasa de donación de sangre y colectas móviles",
    "ponderacion": "4.5%",
    "type": "comges",
    "target": "≥ 100% de la meta proyectada de donación voluntaria",
    "frequency": "Mensual",
    "dataSource": "Sistema Informático del Banco de Sangre / UMT Hospital de Villarrica",
    "definition": "Monitorea la captación de donantes altruistas y altruistas repetidos de sangre en la Unidad de Medicina Transfusional (UMT) del Hospital de Villarrica.",
    "objective": "Asegurar la suficiencia y seguridad de componentes sanguíneos para procedimientos quirúrgicos, urgencias y pacientes críticos.",
    "formula": {
      "numerator": "N° de donantes altruistas de sangre efectivamente fidelizados y donaciones concretadas.",
      "denominator": "Meta comprometida de donaciones según programación anual.",
      "expression": "(Donantes Efectivos / Meta Programada) × 100"
    },
    "evalRules": "Evaluación continua por volumen de donantes altruistas efectivos registrados en UMT.",
    "monthlyData": [],
    "summaryYTD": {
      "numerator": 450,
      "denominator": 460,
      "result": 97.8,
      "resultFormatted": "97.8%",
      "status": "Cumple",
      "observation": "Buena adherencia en campañas comunitarias y colectas móviles."
    }
  },
  {
    "id": "1.4",
    "code": "COMGES 1.4",
    "domainId": "comges-1",
    "name": "Cumplimiento del proceso de acreditación de calidad en Salud",
    "ponderacion": "4.5%",
    "type": "comges",
    "target": "100% de cumplimiento de etapas institucionales y reacreditación",
    "frequency": "Semestral",
    "dataSource": "Superintendencia de Salud / Unidad de Calidad y Seguridad del Paciente",
    "definition": "Evalúa el estado de cumplimiento de los estándares institucionales de acreditación en calidad y seguridad de la atención vigentes por la Superintendencia de Salud.",
    "objective": "Garantizar una atención de salud segura, previniendo eventos adversos y manteniendo la condición de reacreditación.",
    "formula": {
      "numerator": "N° de características obligatorias y generales verificadas y aprobadas.",
      "denominator": "Total de características evaluables del estándar hospitalario.",
      "expression": "(Características Aprobadas / Características Evaluables) × 100"
    },
    "evalRules": "Monitoreo del 100% de informes de autoevaluación y cumplimiento de pautas de cotejo institucionales.",
    "monthlyData": [],
    "summaryYTD": {
      "numerator": 30,
      "denominator": 30,
      "result": 100,
      "resultFormatted": "100%",
      "status": "Cumple",
      "observation": "Establecimiento acreditado con estándar institucional en regla."
    }
  },
  {
    "id": "2.1",
    "code": "COMGES 2.1",
    "domainId": "comges-2",
    "name": "Ingresos a la Estrategia ECICEP de personas de 65 años o más",
    "ponderacion": "4.5%",
    "type": "comges",
    "target": "≥ 60% de cobertura en mayores de 65 años",
    "frequency": "Semestral",
    "dataSource": "Ficha Clínica Electrónica / REM-A01 / Registro ECICEP",
    "definition": "Mide el ingreso de personas mayores de 65 años o más a la Estrategia de Cuidado Integral Centrado en las Personas (ECICEP) para el manejo multimórbido.",
    "objective": "Promover la atención integral y coordinada de pacientes mayores multimórbidos en la red asistencial.",
    "formula": {
      "numerator": "N° de personas de 65 años o más con plan de cuidado integral consensuado ECICEP activo.",
      "denominator": "Total de población de 65 años o más bajo control de salud en el territorio.",
      "expression": "(Personas en ECICEP 65+ / Población Mayor Bajo Control) × 100"
    },
    "evalRules": "Corte de evaluación en Junio y Diciembre según pauta MINSAL.",
    "monthlyData": [],
    "summaryYTD": {
      "numerator": 1840,
      "denominator": 2900,
      "result": 63.4,
      "resultFormatted": "63.4%",
      "status": "Cumple",
      "observation": "Supera la meta del 60% en articulación con el policlínico de especialidades."
    }
  },
  {
    "id": "2.2",
    "code": "COMGES 2.2",
    "domainId": "comges-2",
    "name": "Tasa de donantes efectivos en muerte encefálica PMP generados en la Red",
    "ponderacion": "4.5%",
    "type": "comges",
    "target": "≥ Meta PMP asignada por la Coordinación Nacional de Procuramiento",
    "frequency": "Mensual / Semestral",
    "dataSource": "Coordinación Nacional de Procuramiento / Pesquisa Potenciales Donantes",
    "definition": "Evalúa la detección temprana y notificación oportuna de potenciales donantes en muerte encefálica en Unidades de Paciente Crítico y Urgencia del Hospital de Villarrica.",
    "objective": "Aumentar la tasa nacional de procuramiento de órganos y tejidos para trasplante.",
    "formula": {
      "numerator": "N° de donantes efectivos de órganos procurados en el establecimiento.",
      "denominator": "Población asignada (por millón de habitantes) del Servicio de Salud.",
      "expression": "(Donantes Efectivos / Población en Millones)"
    },
    "evalRules": "Evaluación semestral combinada con el indicador de pesquisa de potenciales donantes.",
    "monthlyData": [],
    "summaryYTD": {
      "numerator": 2,
      "denominator": 2,
      "result": 100,
      "resultFormatted": "100%",
      "status": "Cumple",
      "observation": "Protocolo de procuramiento activo en UPC con pesquisa oportuna."
    }
  },
  {
    "id": "3.1",
    "code": "COMGES 3.1",
    "domainId": "comges-3",
    "name": "Cumplimiento de Garantías Explícitas en Salud (GES) en la Red",
    "ponderacion": "5.0%",
    "type": "comges",
    "target": "≥ 99.5%",
    "frequency": "Mensual",
    "dataSource": "Sistema de Información GES (SIGGES) MINSAL",
    "definition": "Mide el grado de cumplimiento de las garantías de oportunidad GES de todas las patologías GES atendidas en el Hospital de Villarrica. Las garantías no cumplidas representan retrasos o incumplimientos legales sancionados por la Ley 19.966.",
    "objective": "Garantizar la atención dentro de los plazos legales normados para el 100% de las garantías de oportunidad GES vigentes.",
    "formula": {
      "numerator": "N° de garantías GES cumplidas dentro del plazo legal legalmente resueltas.",
      "denominator": "N° total de garantías GES exceptuadas + garantizadas con fecha de vencimiento en el periodo.",
      "expression": "(Garantías Cumplidas / Garantías Totales Vencidas) × 100"
    },
    "evalRules": "Evaluación mensual y corte semestral acumulado. Meta estricta de 99.5%. Se descuentan excepciones normadas.",
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 2259,
        "denominator": 2377,
        "result": 95.04,
        "resultFormatted": "95.04%",
        "status": "En Riesgo"
      },
      {
        "month": "Febrero",
        "numerator": 2920,
        "denominator": 3095,
        "result": 94.35,
        "resultFormatted": "94.35%",
        "status": "No Cumple"
      },
      {
        "month": "Marzo",
        "numerator": 3387,
        "denominator": 3758,
        "result": 90.13,
        "resultFormatted": "90.13%",
        "status": "No Cumple"
      },
      {
        "month": "Abril",
        "numerator": 4820,
        "denominator": 5273,
        "result": 91.41,
        "resultFormatted": "91.41%",
        "status": "No Cumple"
      },
      {
        "month": "Mayo",
        "numerator": 5821,
        "denominator": 6299,
        "result": 92.41,
        "resultFormatted": "92.41%",
        "status": "No Cumple"
      },
      {
        "month": "Junio",
        "numerator": 6399,
        "denominator": 6979,
        "result": 91.69,
        "resultFormatted": "91.69%",
        "status": "No Cumple"
      },
      {
        "month": "Julio",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Pendiente Actualización"
      },
      {
        "month": "Agosto",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Pendiente Actualización"
      },
      {
        "month": "Septiembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Pendiente Actualización"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Pendiente Actualización"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Pendiente Actualización"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Pendiente Actualización"
      }
    ],
    "summaryYTD": {
      "numerator": 6399,
      "denominator": 6979,
      "result": 92.41,
      "resultFormatted": "92.41%",
      "status": "No Cumple",
      "observation": "Acumulado a Junio 2026: 92.41% vs Meta ≥ 99.5%. Se requiere gestión acelerada de garantías exceptuadas y agendamientos en vencimiento."
    }
  },
  {
    "id": "3.2",
    "code": "COMGES 3.2",
    "domainId": "comges-3",
    "name": "Monitoreo del percentil 75 de la lista de espera de Consulta Nueva Médica",
    "ponderacion": "5.0%",
    "type": "comges",
    "target": "Reducción o mantención del Percentil 75 respecto al año base",
    "frequency": "Mensual / Semestral",
    "dataSource": "Repositorio Nacional de Listas de Espera (SIGTE) MINSAL",
    "definition": "Evalúa la reducción de los días de espera para el 75% de las personas que aguardan por una Consulta Nueva de Especialidad Médica (CNE) en el establecimiento.",
    "objective": "Reducir la antigüedad y los tiempos de espera de los usuarios en lista de espera médica.",
    "formula": {
      "numerator": "Percentil 75 de días de espera de las solicitudes de CNE activas al corte de evaluación.",
      "denominator": "Percentil 75 comprometido como línea base institucional.",
      "expression": "Percentil 75 (días de espera calculados)"
    },
    "evalRules": "Se exige disminución o no incremento del P75 de la lista médica en el semestre.",
    "monthlyData": [],
    "summaryYTD": {
      "numerator": "-",
      "denominator": "-",
      "result": 185,
      "resultFormatted": "185 días",
      "status": "Cumple",
      "observation": "Comportamiento alineado con la meta de reducción de la mediana y P75 de espera médica."
    }
  },
  {
    "id": "3.3",
    "code": "COMGES 3.3",
    "domainId": "comges-3",
    "name": "Monitoreo del percentil 75 de la lista de espera de Consulta Nueva Odontológica",
    "ponderacion": "4.0%",
    "type": "comges",
    "target": "Reducción del Percentil 75 de espera odontológica",
    "frequency": "Semestral",
    "dataSource": "SIGTE / Registro de Especialidades Odontológicas",
    "definition": "Mide los días de espera del percentil 75 de solicitudes activas para atención con especialidades odontológicas (Ortodoncia, Endodoncia, Cirugía Maxilofacial).",
    "objective": "Acelerar la resolución diagnóstica y terapéutica odontológica en el nivel secundario.",
    "formula": {
      "numerator": "Percentil 75 de días acumulados en lista de espera odontológica.",
      "denominator": "Línea base institucional de esperas odontológicas.",
      "expression": "Percentil 75 Odontológico (Días)"
    },
    "evalRules": "Evaluación semestral de disminución porcentual sobre el P75 de la red.",
    "monthlyData": [],
    "summaryYTD": {
      "numerator": "-",
      "denominator": "-",
      "result": 140,
      "resultFormatted": "140 días",
      "status": "Cumple",
      "observation": "Avance sostenido en resolución de interconsultas maxilofaciales."
    }
  },
  {
    "id": "3.4",
    "code": "COMGES 3.4",
    "domainId": "comges-3",
    "name": "Monitoreo del percentil 75 de lista de espera de Intervenciones Quirúrgicas",
    "ponderacion": "5.0%",
    "type": "comges",
    "target": "Reducción del Percentil 75 quirúrgico No GES",
    "frequency": "Mensual / Semestral",
    "dataSource": "SIGTE / Sistema de Gestión de Pabellones Quirúrgicos",
    "definition": "Monitorea la antigüedad en días de espera del percentil 75 de pacientes en lista de espera quirúrgica no GES mayores y menores.",
    "objective": "Disminuir los tiempos de espera de intervención quirúrgica de pacientes electivos no GES.",
    "formula": {
      "numerator": "Percentil 75 de días transcurridos desde el ingreso del paciente a la lista quirúrgica.",
      "denominator": "Meta de días establecida por el MINSAL.",
      "expression": "Percentil 75 Quirúrgico (Días)"
    },
    "evalRules": "Requisito obligatorio de priorización por antigüedad y riesgo biomédico.",
    "monthlyData": [],
    "summaryYTD": {
      "numerator": "-",
      "denominator": "-",
      "result": 220,
      "resultFormatted": "220 días",
      "status": "En Riesgo",
      "observation": "Mayor presión en traumatología y cirugía general; plan de extensión horaria activado."
    }
  },
  {
    "id": "3.5",
    "code": "COMGES 3.5",
    "domainId": "comges-3",
    "name": "Resolución de casos en Lista de Espera No GES prioritarios",
    "ponderacion": "4.0%",
    "type": "comges",
    "target": "≥ 90% de egresos por causales de resolución médica o quirúrgica",
    "frequency": "Semestral",
    "dataSource": "SIGTE MINSAL / Ficha Clínica / Auditoría de Egresos LE",
    "definition": "Mide el porcentaje de pacientes egresados de la lista de espera por atención realizada o resolución efectiva, auditando las causales administrativas de egreso.",
    "objective": "Asegurar la transparencia y calidad técnica de la gestión de la lista de espera.",
    "formula": {
      "numerator": "N° de pacientes egresados de LE con atención realizada o causal médica válida.",
      "denominator": "Total de egresos registrados en el periodo.",
      "expression": "(Egresos Válidos / Total Egresos LE) × 100"
    },
    "evalRules": "Auditoría obligatoria aleatoria del 10% de los egresos administrativos (causal 7 u 8).",
    "monthlyData": [],
    "summaryYTD": {
      "numerator": 1250,
      "denominator": 1320,
      "result": 94.7,
      "resultFormatted": "94.7%",
      "status": "Cumple",
      "observation": "Auditoría de egresos con tasa de concordancia clínica superior al 94%."
    }
  },
  {
    "id": "3.6",
    "code": "COMGES 3.6",
    "domainId": "comges-3",
    "name": "Estrategia de Egreso Transitorio en GES y monitoreo de excepciones",
    "ponderacion": "3.5%",
    "type": "comges",
    "target": "100% de apego a la norma técnica de egresos y excepciones GES",
    "frequency": "Semestral",
    "dataSource": "SIGGES / Registros de Auditoría de Garantías de Oportunidad",
    "definition": "Monitorea la aplicación rigurosa de las causales normadas de excepción y egreso transitorio GES (inasistencias, rechazos de atención, inasistencias justificadas).",
    "objective": "Evitar el mal uso de excepciones GES y resguardar la exigibilidad legal de las garantías.",
    "formula": {
      "numerator": "N° de egresos/excepciones GES auditados y justificados documentalmente.",
      "denominator": "Total de casos exceptuados o egresados transitoriamente.",
      "expression": "(Excepciones Justificadas / Total Excepciones) × 100"
    },
    "evalRules": "Revisión documental periódica por la Unidad de Garantías en Salud del hospital.",
    "monthlyData": [],
    "summaryYTD": {
      "numerator": 310,
      "denominator": 310,
      "result": 100,
      "resultFormatted": "100%",
      "status": "Cumple",
      "observation": "100% de expedientes respaldados con contactabilidad verificada."
    }
  },
  {
    "id": "4.1",
    "code": "COMGES 4.1",
    "domainId": "comges-4",
    "name": "Cumplimiento de requerimientos de gestión de personas y procedimientos disciplinarios",
    "ponderacion": "4.5%",
    "type": "comges",
    "target": "100% de sustanciación oportuna de sumarios y procedimientos disciplinarios",
    "frequency": "Semestral",
    "dataSource": "Unidad de Jurídica / Gestión de Personas / Sistema SIAPER Contraloría",
    "definition": "Mide la eficiencia en los plazos de tramitación y término de procedimientos disciplinarios (sumarios administrativos e investigaciones sumarias) en el establecimiento.",
    "objective": "Fortalecer la probidad, transparencia y cumplimiento de los plazos legales en la gestión disciplinaria.",
    "formula": {
      "numerator": "N° de procedimientos disciplinarios afines terminados o en plazo legal vigentes.",
      "denominator": "Total de procedimientos disciplinarios instruidos y tramitados.",
      "expression": "(Sumarios en Plazo / Total Sumarios) × 100"
    },
    "evalRules": "Evaluación semestral según reporte jurídico institucional.",
    "monthlyData": [],
    "summaryYTD": {
      "numerator": 18,
      "denominator": 18,
      "result": 100,
      "resultFormatted": "100%",
      "status": "Cumple",
      "observation": "Procedimientos disciplinarios al día sin observaciones de Contraloría."
    }
  },
  {
    "id": "4.2",
    "code": "COMGES 4.2",
    "domainId": "comges-4",
    "name": "Implementación del plan de gestión del riesgo de desastres (GDR)",
    "ponderacion": "4.5%",
    "type": "comges",
    "target": "≥ 90% de ejecución de las fases del Plan de Emergencias y Desastres",
    "frequency": "Semestral",
    "dataSource": "Unidad de Gestión del Riesgo de Desastres Hospitalario / Depto. Salud Ocupacional",
    "definition": "Evalúa el cumplimiento de las actividades, simulacros, mantenimientos críticos de continuidad operativa y capacitaciones del Plan Hospitalario para Emergencias y Desastres.",
    "objective": "Asegurar la resiliencia y la continuidad operacional de la infraestructura hospitalaria ante eventos adversos y catástrofes.",
    "formula": {
      "numerator": "N° de actividades GDR (simulacros, planes de contingencia, comités) ejecutadas.",
      "denominator": "Total de actividades comprometidas en la programación anual GDR.",
      "expression": "(Actividades GDR Realizadas / Actividades Programadas) × 100"
    },
    "evalRules": "Pauta de cotejo semestral MINSAL/SENAPRED.",
    "monthlyData": [],
    "summaryYTD": {
      "numerator": 14,
      "denominator": 15,
      "result": 93.3,
      "resultFormatted": "93.3%",
      "status": "Cumple",
      "observation": "Simulacros de evacuación y plan de contingencia de invierno validados."
    }
  },
  {
    "id": "4.3",
    "code": "COMGES 4.3",
    "domainId": "comges-4",
    "name": "Índice del gasto en convenio con personas naturales respecto a la glosa autorizada",
    "ponderacion": "4.0%",
    "type": "comges",
    "target": "≤ 100% de la marco presupuestario o glosa presupuestaria autorizada",
    "frequency": "Mensual / Trimestral",
    "dataSource": "SIGFE / Subdepartamento de Finanzas y Presupuesto",
    "definition": "Cuantifica el ajuste del gasto ejecutado por contrataciones en honorarios médicos y no médicos (personas naturales) respecto al marco presupuestario vigente asignado por el Servicio de Salud.",
    "objective": "Mantener la sostenibilidad financiera y la disciplina presupuestaria en la contratación de personal honorario.",
    "formula": {
      "numerator": "Gasto devengado acumulado en Subtítulo 21 (Honorarios Personas Naturales).",
      "denominator": "Presupuesto o marco vigente autorizador en el periodo.",
      "expression": "(Gasto Honorarios Devengado / Marco Presupuestario Vigente) × 100"
    },
    "evalRules": "Evaluación mensual y trimestral del devengamiento financiero en SIGFE.",
    "monthlyData": [],
    "summaryYTD": {
      "numerator": "$ 480.000.000",
      "denominator": "$ 510.000.000",
      "result": 94.1,
      "resultFormatted": "94.1%",
      "status": "Cumple",
      "observation": "Ejecución presupuestaria dentro de la glosa autorizada sin sobregiros."
    }
  },
  {
    "id": "5.1",
    "code": "COMGES 5.1",
    "domainId": "comges-5",
    "name": "Nivel de cumplimiento efectivo de garantías GES en problemas de salud oncológicos",
    "ponderacion": "8.5%",
    "type": "comges",
    "target": "100% de cumplimiento en oportunidad de garantías oncológicas GES",
    "frequency": "Mensual",
    "dataSource": "SIGGES MINSAL / Registro Oncológico Hospitalario",
    "definition": "Mide en forma específica el cumplimiento de la garantía de oportunidad en los problemas de salud GES del área oncológica (Cáncer gástrico, mama, cervicouterino, colon, próstata, leucemias, etc.).",
    "objective": "Asegurar que ningún paciente con sospecha o confirmación diagnóstica de cáncer sufra retrasos en su tratamiento u oportunidad legal.",
    "formula": {
      "numerator": "N° de garantías GES oncológicas cumplidas en plazo legal.",
      "denominator": "Total de garantías GES oncológicas vencidas en el periodo.",
      "expression": "(Garantías Oncológicas Cumplidas / Garantías Oncológicas Vencidas) × 100"
    },
    "evalRules": "Cero tolerancia a retrasos no justificados en confirmación o inicio de tratamiento oncológico.",
    "monthlyData": [],
    "summaryYTD": {
      "numerator": 412,
      "denominator": 420,
      "result": 98.1,
      "resultFormatted": "98.1%",
      "status": "Cumple",
      "observation": "Monitoreo semanal del comité oncológico hospitalario."
    }
  },
  {
    "id": "5.2",
    "code": "COMGES 5.2",
    "domainId": "comges-5",
    "name": "Casos oncológicos No GES en lista de espera quirúrgica con espera menor a 90 días",
    "ponderacion": "8.5%",
    "type": "comges",
    "target": "≥ 95% de casos quirúrgicos oncológicos No GES operados < 90 días",
    "frequency": "Mensual",
    "dataSource": "SIGTE / Registro de Cirugía Oncológica Hospitalaria",
    "definition": "Evalúa el porcentaje de pacientes diagnósticos con patologías quirúrgicas oncológicas no GES intervenidos oportunamente dentro de un plazo máximo recomendado de 90 días desde su indicación.",
    "objective": "Priorizar la resolución quirúrgica oncológica para evitar la progresión de la enfermedad.",
    "formula": {
      "numerator": "N° de casos quirúrgicos oncológicos No GES resueltos o en espera con < 90 días.",
      "denominator": "Total de casos quirúrgicos oncológicos No GES en la lista.",
      "expression": "(Casos Quirúrgicos Oncológicos < 90 días / Total Casos Oncológicos) × 100"
    },
    "evalRules": "Priorización obligatoria en asignación de horas de tabla de pabellón electivo.",
    "monthlyData": [],
    "summaryYTD": {
      "numerator": 88,
      "denominator": 90,
      "result": 97.7,
      "resultFormatted": "97.7%",
      "status": "Cumple",
      "observation": "Cumplimiento destacado en priorización de biopsias y cirugías resectivas."
    }
  },
  {
    "id": "6.1",
    "code": "COMGES 6.1",
    "domainId": "comges-6",
    "name": "Nivel de implementación de estrategias y células de Hospital Digital",
    "ponderacion": "6.5%",
    "type": "comges",
    "target": "≥ 90% de avance en implementación de células de telemedicina",
    "frequency": "Semestral",
    "dataSource": "Plataforma Hospital Digital MINSAL / Registro Telemedicina Hospitalario",
    "definition": "Evalúa la adopción e integración efectiva de las células del Hospital Digital (Dermatología, Nefrología, Diabetes, Oftalmología) para resolución a distancia.",
    "objective": "Expandir la capacidad resolutiva especializada mediante herramientas de salud digital y telemedicina.",
    "formula": {
      "numerator": "N° de teleconsultas/interconsultas resueltas por células HD asignadas.",
      "denominator": "Meta programada de consultas digitales para el territorio.",
      "expression": "(Teleconsultas Resueltas / Meta Telemedicina) × 100"
    },
    "evalRules": "Verificación de operatividad tecnológica y respuesta asistencial en plataforma HD.",
    "monthlyData": [],
    "summaryYTD": {
      "numerator": 720,
      "denominator": 750,
      "result": 96.0,
      "resultFormatted": "96.0%",
      "status": "Cumple",
      "observation": "Alta oportunidad de respuesta en célula de teledermatología y diabetología."
    }
  },
  {
    "id": "6.2",
    "code": "COMGES 6.2",
    "domainId": "comges-6",
    "name": "Integración y Registro Clínico Electrónico (RCE) interoperable",
    "ponderacion": "6.5%",
    "type": "comges",
    "target": "≥ 98% de completitud de datos y calidad de registros en RCE",
    "frequency": "Mensual",
    "dataSource": "Sistema RCE Hospitalario / Repositorio Nacional de Salud (RNS)",
    "definition": "Mide la calidad, obligatoriedad e interoperabilidad del registro clínico electrónico en atenciones ambulatorias, de urgencia y hospitalización del hospital.",
    "objective": "Asegurar la continuidad de la información médica del paciente mediante registros digitales estandarizados.",
    "formula": {
      "numerator": "N° de atenciones clínicas registradas con datos obligatorios completos en RCE.",
      "denominator": "N° total de atenciones clínicas realizadas en el establecimiento.",
      "expression": "(Atenciones Completas en RCE / Total Atenciones) × 100"
    },
    "evalRules": "Auditorías aleatorias mensuales por la Unidad de Informática Médica.",
    "monthlyData": [],
    "summaryYTD": {
      "numerator": 18450,
      "denominator": 18700,
      "result": 98.6,
      "resultFormatted": "98.6%",
      "status": "Cumple",
      "observation": "Firma electrónica avanzada y RCE operativo en el 100% de los servicios."
    }
  },
  {
    "id": "M1.1",
    "code": "MONITOREO 1.1",
    "domainId": "monitoreo",
    "name": "Ambulatorización de Cirugías Mayores Electivas (CMA)",
    "ponderacion": "Monitoreo",
    "type": "monitoreo",
    "target": "≥ 50.0%",
    "frequency": "Mensual",
    "dataSource": "PLANILLA COMGES 2026.xlsx (Hoja '1,1 AMB CMA') / REM-A08",
    "definition": "Mide la proporción de cirugías mayores electivas ambulatorizadas (CMA, donde el paciente ingresa y egresa el mismo día) sobre el total de cirugías mayores electivas realizadas en el Hospital de Villarrica.",
    "objective": "Optimizar el recurso cama hospitalario y favorecer la recuperación precoz del paciente en su entorno familiar.",
    "formula": {
      "numerator": "N° total de Cirugías Mayores Ambulatorias (CMA) realizadas.",
      "denominator": "N° total de Cirugías Mayores Electivas realizadas (CMA + Con Hospitalización).",
      "expression": "(CMA / Total Cirugías Mayores Electivas) × 100"
    },
    "evalRules": "Seguimiento mensual. Meta institucional: lograr o superar el 50% de ambulatorización en procedimientos candidatos.",
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 315,
        "denominator": 437,
        "result": 72.08,
        "resultFormatted": "72.08%",
        "status": "Cumple"
      },
      {
        "month": "Febrero",
        "numerator": 257,
        "denominator": 400,
        "result": 64.25,
        "resultFormatted": "64.25%",
        "status": "Cumple"
      },
      {
        "month": "Marzo",
        "numerator": 313,
        "denominator": 471,
        "result": 66.45,
        "resultFormatted": "66.45%",
        "status": "Cumple"
      },
      {
        "month": "Abril",
        "numerator": 354,
        "denominator": 493,
        "result": 71.81,
        "resultFormatted": "71.81%",
        "status": "Cumple"
      },
      {
        "month": "Mayo",
        "numerator": 395,
        "denominator": 542,
        "result": 72.88,
        "resultFormatted": "72.88%",
        "status": "Cumple"
      },
      {
        "month": "Junio",
        "numerator": 356,
        "denominator": 504,
        "result": 70.63,
        "resultFormatted": "70.63%",
        "status": "Cumple"
      },
      {
        "month": "Julio",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Pendiente Actualización"
      },
      {
        "month": "Agosto",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Pendiente Actualización"
      },
      {
        "month": "Septiembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Pendiente Actualización"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Pendiente Actualización"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Pendiente Actualización"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Pendiente Actualización"
      }
    ],
    "summaryYTD": {
      "numerator": 1974,
      "denominator": 2833,
      "result": 69.68,
      "resultFormatted": "69.68%",
      "status": "Cumple",
      "observation": "Excelente desempeño a Junio 2026: 69.68% de ambulatorización (Meta ≥ 50%)."
    }
  },
  {
    "id": "M1.9",
    "code": "MONITOREO 1.9",
    "domainId": "monitoreo",
    "name": "Personas que abandonan durante el proceso de atención en urgencia (UEH)",
    "ponderacion": "Monitoreo",
    "type": "monitoreo",
    "target": "< 10.0%",
    "frequency": "Mensual",
    "dataSource": "PLANILLA COMGES 2026.xlsx (Hoja '1,9 ABANDONO URG') / DAU Urgencias",
    "definition": "Porcentaje de pacientes que, habiendo ingresado y categorizado en la Unidad de Emergencia Hospitalaria (UEH), se retiran antes de recibir la atención médica completa.",
    "objective": "Reducir los tiempos de espera en urgencia para evitar la fuga de pacientes y riesgos clínicos.",
    "formula": {
      "numerator": "N° de personas que se retiran sin atención médica.",
      "denominator": "N° total de consultas/DAU ingresadas en el servicio de urgencia.",
      "expression": "(Abandonos UEH / Total DAU Ingresados) × 100"
    },
    "evalRules": "Evaluación mensual. Nivel crítico cuando supera el 10%.",
    "monthlyData": [],
    "summaryYTD": {
      "numerator": 3810,
      "denominator": 19400,
      "result": 19.64,
      "resultFormatted": "19.64%",
      "status": "No Cumple",
      "observation": "Tasa de abandono en urgencia alta (19.64% acumulada). Se requiere reforzar categorización C3/C4 y derivación oportuna."
    }
  },
  {
    "id": "M4.6",
    "code": "MONITOREO 4.6",
    "domainId": "monitoreo",
    "name": "Índice de Ausentismo Laboral por Licencia Médica",
    "ponderacion": "Monitoreo",
    "type": "monitoreo",
    "target": "≤ 14.0 días por funcionario",
    "frequency": "Mensual",
    "dataSource": "PLANILLA COMGES 2026.xlsx (Hoja '4,6 IND AUSENTISMO') / SIRH",
    "definition": "Mide el promedio de días de ausentismo por licencia médica por funcionario contratado u honorario en la dotación del hospital.",
    "objective": "Promover la salud laboral, ambientes de trabajo seguros y disminuir el reemplazo de personal.",
    "formula": {
      "numerator": "Días totales de licencias médicas del periodo.",
      "denominator": "Dotación total de funcionarios del establecimiento.",
      "expression": "(Días Licencias / Dotación Funcional)"
    },
    "evalRules": "Seguimiento mensual por Subdirección de Gestión de Personas.",
    "monthlyData": [],
    "summaryYTD": {
      "numerator": "-",
      "denominator": "-",
      "result": 12.8,
      "resultFormatted": "12.8 días",
      "status": "Cumple",
      "observation": "Ausentismo laboral bajo control dentro de los márgenes institucionales."
    }
  }
];
