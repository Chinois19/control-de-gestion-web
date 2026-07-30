// Dataset Oficial COMGES 2026 - Hospital de Villarrica
// Filtrado exclusivo para los 11 indicadores oficiales aplicables al Hospital de Villarrica + Monitoreo Hospitalario

export const COMGES_META = {
  hospital: "Hospital de Villarrica",
  service: "Servicio de Salud Araucanía Sur",
  year: 2026,
  version: "Versión Final Julio 2026 (MINSAL)",
  lastUpdatedMonth: "Junio 2026",
  totalIndicators: 11,
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
    "weight": "Dominio 1",
    "color": "#3B82F6",
    "description": "Optimización del uso de pabellones quirúrgicos electivos y prevención de suspensiones."
  },
  {
    "id": "comges-2",
    "code": "COMGES 2",
    "title": "Estrategias de prevención, diagnóstico y tratamiento en la Red Asistencial",
    "weight": "Dominio 2",
    "color": "#10B981",
    "description": "Procuramiento y tasa de donantes efectivos en muerte encefálica en la Red Asistencial."
  },
  {
    "id": "comges-3",
    "code": "COMGES 3",
    "title": "Gestión de los tiempos de espera",
    "weight": "Dominio 3",
    "color": "#F59E0B",
    "description": "Garantías explícitas en salud (GES) y monitoreo del percentil 75 de listas de espera (Médica, Odontológica y Quirúrgica)."
  },
  {
    "id": "comges-4",
    "code": "COMGES 4",
    "title": "Gestión de Riesgos, Recursos Humanos y Financieros",
    "weight": "Dominio 4",
    "color": "#8B5CF6",
    "description": "Gestión del riesgo de desastres e índice de gasto en personas naturales según glosa autorizada."
  },
  {
    "id": "comges-5",
    "code": "COMGES 5",
    "title": "Prevención, detección temprana y tratamiento oportuno del cáncer",
    "weight": "Dominio 5",
    "color": "#EC4899",
    "description": "Cumplimiento de garantías GES oncológicas y resolución quirúrgica oncológica No GES < 90 días."
  },
  {
    "id": "comges-6",
    "code": "COMGES 6",
    "title": "Sistemas de información y Salud Digital",
    "weight": "Dominio 6",
    "color": "#06B6D4",
    "description": "Implementación de estrategias y células de Hospital Digital en establecimientos de la Red."
  },
  {
    "id": "monitoreo",
    "code": "MONITOREO",
    "title": "Indicadores de Monitoreo Obligatorio Hospitalario",
    "weight": "Monitoreo",
    "color": "#64748B",
    "description": "Indicadores de seguimiento continuo en el Hospital de Villarrica (CMA, Abandono Urgencia, Ausentismo)."
  }
];

export const COMGES_INDICATORS = [
  {
    "id": "1.1",
    "code": "COMGES 1.1",
    "domainId": "comges-1",
    "name": "1.1. Suspensiones quirúrgicas en cirugía mayores electivas",
    "ponderacion": "Aplicable Hospital Villarrica",
    "type": "comges",
    "target": "≤ 6.5%",
    "frequency": "Mensual (Corte semestral MINSAL)",
    "dataSource": "Planilla de Registro Quirúrgico Hospitalario / SIGTE / REM-A08",
    "definition": "Mide el porcentaje de cirugías mayores electivas suspendidas respecto del total de cirugías mayores electivas programadas en tabla quirúrgica del Hospital de Villarrica.",
    "objective": "Aumentar la eficiencia en el uso de los pabellones quirúrgicos electivos y reducir las suspensiones por causas prevenibles.",
    "formula": {
      "numerator": "N° de cirugías mayores electivas suspendidas en el periodo.",
      "denominator": "N° total de cirugías mayores electivas programadas en el periodo.",
      "expression": "(Cirugías Suspendidas / Cirugías Programadas) × 100"
    },
    "evalRules": "Evaluación semestral según tabla de sensibilidad MINSAL. Se evalúa el porcentaje acumulado.",
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
      "observation": "Acumulado a Junio 2026: 7.07% vs Meta ≤ 6.5%."
    }
  },
  {
    "id": "2.2",
    "code": "COMGES 2.2",
    "domainId": "comges-2",
    "name": "2.2. Tasa de donantes efectivos en muerte encefálica por millón de población (PMP) generados por Servicio de Salud",
    "ponderacion": "Aplicable Hospital Villarrica",
    "type": "comges",
    "target": "≥ Meta PMP asignada por Coordinación Nacional de Procuramiento",
    "frequency": "Mensual / Semestral",
    "dataSource": "Coordinación Nacional de Procuramiento / Registros UPC Hospital Villarrica",
    "definition": "Evalúa la detección temprana y notificación oportuna de potenciales donantes en muerte encefálica en Unidades de Paciente Crítico y Urgencia del Hospital de Villarrica.",
    "objective": "Aumentar la tasa de procuramiento de órganos y tejidos para trasplante en la red asistencial.",
    "formula": {
      "numerator": "N° de donantes efectivos de órganos procurados en el establecimiento.",
      "denominator": "Población asignada (por millón de habitantes) del Servicio de Salud.",
      "expression": "(Donantes Efectivos / Población en Millones)"
    },
    "evalRules": "Evaluación semestral combinada con el reporte de pesquisa de potenciales donantes.",
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
    "name": "3.1. Cumplimiento de Garantías explícitas en Salud (GES) en la red",
    "ponderacion": "Aplicable Hospital Villarrica",
    "type": "comges",
    "target": "≥ 99.5%",
    "frequency": "Mensual",
    "dataSource": "Sistema de Información GES (SIGGES) MINSAL",
    "definition": "Mide el grado de cumplimiento de las garantías de oportunidad GES de todas las patologías GES atendidas en el Hospital de Villarrica. Las garantías no cumplidas representan retrasos legales sancionados por la Ley 19.966.",
    "objective": "Garantizar la atención dentro de los plazos legales normados para el 100% de las garantías de oportunidad GES vigentes.",
    "formula": {
      "numerator": "N° de garantías GES cumplidas dentro del plazo legal legalmente resueltas.",
      "denominator": "N° total de garantías GES exceptuadas + garantizadas con fecha de vencimiento en el periodo.",
      "expression": "(Garantías Cumplidas / Garantías Totales Vencidas) × 100"
    },
    "evalRules": "Evaluación mensual estricta. Meta: 99.5%. Se descuentan excepciones normadas.",
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
      "observation": "Acumulado a Junio 2026: 92.41% vs Meta ≥ 99.5%."
    }
  },
  {
    "id": "3.2",
    "code": "COMGES 3.2",
    "domainId": "comges-3",
    "name": "3.2. Monitoreo del percentil 75 de la lista de espera de consulta nueva de especialidad médica",
    "ponderacion": "Aplicable Hospital Villarrica",
    "type": "comges",
    "target": "Reducción o mantención del Percentil 75 respecto al año base",
    "frequency": "Mensual / Semestral",
    "dataSource": "Repositorio Nacional de Listas de Espera (SIGTE) MINSAL",
    "definition": "Evalúa la reducción de los días de espera para el 75% de las personas que aguardan por una Consulta Nueva de Especialidad Médica (CNE) en el Hospital de Villarrica.",
    "objective": "Reducir la antigüedad y los tiempos de espera de los usuarios en lista de espera médica.",
    "formula": {
      "numerator": "Percentil 75 de días de espera de las solicitudes de CNE activas al corte de evaluación.",
      "denominator": "Percentil 75 comprometido como línea base institucional.",
      "expression": "Percentil 75 (días de espera calculados)"
    },
    "evalRules": "Evaluación de disminución porcentual sobre el P75 de la lista médica.",
    "monthlyData": [],
    "summaryYTD": {
      "numerator": "-",
      "denominator": "-",
      "result": 185,
      "resultFormatted": "185 días",
      "status": "Cumple",
      "observation": "Comportamiento alineado con la meta de reducción de esperas médicas."
    }
  },
  {
    "id": "3.3",
    "code": "COMGES 3.3",
    "domainId": "comges-3",
    "name": "3.3. Monitoreo del percentil 75 de la lista de espera de consulta nueva de especialidad odontológica",
    "ponderacion": "Aplicable Hospital Villarrica",
    "type": "comges",
    "target": "Reducción del Percentil 75 de espera odontológica",
    "frequency": "Semestral",
    "dataSource": "SIGTE / Registro de Especialidades Odontológicas",
    "definition": "Mide los días de espera del percentil 75 de solicitudes activas para atención con especialidades odontológicas (Ortodoncia, Endodoncia, Cirugía Maxilofacial) en el hospital.",
    "objective": "Acelerar la resolución diagnóstica y terapéutica odontológica en el nivel secundario.",
    "formula": {
      "numerator": "Percentil 75 de días acumulados en lista de espera odontológica.",
      "denominator": "Línea base institucional de esperas odontológicas.",
      "expression": "Percentil 75 Odontológico (Días)"
    },
    "evalRules": "Evaluación semestral de disminución porcentual del P75 odontológico.",
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
    "name": "3.4. Monitoreo del percentil 75 de la lista de espera de intervenciones quirúrgicas mayores y menores",
    "ponderacion": "Aplicable Hospital Villarrica",
    "type": "comges",
    "target": "Reducción del Percentil 75 quirúrgico No GES",
    "frequency": "Mensual / Semestral",
    "dataSource": "SIGTE / Sistema de Gestión de Pabellones Quirúrgicos",
    "definition": "Monitorea la antigüedad en días de espera del percentil 75 de pacientes en lista de espera quirúrgica no GES mayores y menores en el establecimiento.",
    "objective": "Disminuir los tiempos de espera de intervención quirúrgica de pacientes electivos no GES.",
    "formula": {
      "numerator": "Percentil 75 de días transcurridos desde el ingreso del paciente a la lista quirúrgica.",
      "denominator": "Meta de días establecida por el MINSAL.",
      "expression": "Percentil 75 Quirúrgico (Días)"
    },
    "evalRules": "Priorización obligatoria por antigüedad y riesgo biomédico.",
    "monthlyData": [],
    "summaryYTD": {
      "numerator": "-",
      "denominator": "-",
      "result": 220,
      "resultFormatted": "220 días",
      "status": "En Riesgo",
      "observation": "Plan de extensión horaria activado en tabla quirúrgica."
    }
  },
  {
    "id": "4.2",
    "code": "COMGES 4.2",
    "domainId": "comges-4",
    "name": "4.2. Implementación del plan gestión del riesgo de desastres",
    "ponderacion": "Aplicable Hospital Villarrica",
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
      "observation": "Simulacros de evacuación y plan de contingencia validados."
    }
  },
  {
    "id": "4.3",
    "code": "COMGES 4.3",
    "domainId": "comges-4",
    "name": "4.3. Índice del gasto en convenio con personas naturales respecto a la glosa autorizada vigente",
    "ponderacion": "Aplicable Hospital Villarrica",
    "type": "comges",
    "target": "≤ 100% del marco presupuestario autorizado",
    "frequency": "Mensual / Trimestral",
    "dataSource": "SIGFE / Subdepartamento de Finanzas y Presupuesto",
    "definition": "Cuantifica el ajuste del gasto ejecutado por contrataciones en honorarios médicos y no médicos (personas naturales) respecto al marco presupuestario vigente asignado.",
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
    "name": "5.1. Nivel de cumplimiento efectivo de garantías GES en problemas de salud oncológicos",
    "ponderacion": "Aplicable Hospital Villarrica",
    "type": "comges",
    "target": "100% de cumplimiento en oportunidad de garantías oncológicas GES",
    "frequency": "Mensual",
    "dataSource": "SIGGES MINSAL / Registro Oncológico Hospitalario",
    "definition": "Mide en forma específica el cumplimiento de la garantía de oportunidad en los problemas de salud GES del área oncológica en el Hospital de Villarrica.",
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
    "name": "5.2. Casos oncológicos No GES en lista de espera quirúrgica con espera menor a 90 días",
    "ponderacion": "Aplicable Hospital Villarrica",
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
    "name": "6.1. Nivel de implementación de estrategias y/o células de Hospital Digital en establecimientos del Servicio de Salud",
    "ponderacion": "Aplicable Hospital Villarrica",
    "type": "comges",
    "target": "≥ 90% de avance en implementación de células de telemedicina",
    "frequency": "Semestral",
    "dataSource": "Plataforma Hospital Digital MINSAL / Registro Telemedicina Hospitalario",
    "definition": "Evalúa la adopción e integración efectiva de las células del Hospital Digital (Dermatología, Nefrología, Diabetes, Oftalmología) para resolución a distancia en el hospital.",
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
      "observation": "Tasa de abandono en urgencia acumulada 19.64%."
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
