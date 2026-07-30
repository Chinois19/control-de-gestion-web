// Dataset Oficial COMGES 2026 - Hospital de Villarrica
// Ingesta completa de datos mensuales desde la hoja 'resumen gonzalo' para 3.2 (P75 Médica), 3.3 (P75 Odontológica), 3.4 (P75 Quirúrgica), 5.1 (GES Oncológico) y 4.3 (Gasto Personas Naturales)

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
    "PLANILLA COMGES 2026.xlsx",
    "Videoconferencia COMGES MINSAL 21-07-2026.pdf"
  ]
};

export const REM_CALENDAR = [
  {
    "month": "Enero 2026",
    "open": "Viernes 13 Feb",
    "close": "Viernes 20 Feb",
    "publish": "Martes 24 Feb"
  },
  {
    "month": "Febrero 2026",
    "open": "Viernes 13 Mar",
    "close": "Viernes 20 Mar",
    "publish": "Martes 24 Mar"
  },
  {
    "month": "Marzo 2026",
    "open": "Miércoles 15 Abr",
    "close": "Miércoles 22 Abr",
    "publish": "Viernes 24 Abr"
  },
  {
    "month": "Abril 2026",
    "open": "Viernes 15 May",
    "close": "Lunes 25 May",
    "publish": "Miércoles 27 May"
  },
  {
    "month": "Mayo 2026",
    "open": "Viernes 12 Jun",
    "close": "Viernes 19 Jun",
    "publish": "Martes 23 Jun"
  },
  {
    "month": "Junio 2026",
    "open": "Martes 14 Jul",
    "close": "Miércoles 22 Jul",
    "publish": "Viernes 24 Jul"
  },
  {
    "month": "Julio 2026",
    "open": "Viernes 14 Ago",
    "close": "Viernes 21 Ago",
    "publish": "Martes 25 Ago"
  },
  {
    "month": "Agosto 2026",
    "open": "Lunes 14 Sep",
    "close": "Martes 22 Sep",
    "publish": "Viernes 25 Sep"
  },
  {
    "month": "Septiembre 2026",
    "open": "Jueves 15 Oct",
    "close": "Jueves 22 Oct",
    "publish": "Lunes 26 Oct"
  },
  {
    "month": "Octubre 2026",
    "open": "Viernes 13 Nov",
    "close": "Viernes 20 Nov",
    "publish": "Martes 24 Nov"
  },
  {
    "month": "Noviembre 2026",
    "open": "Martes 15 Dic",
    "close": "Martes 22 Dic",
    "publish": "Jueves 24 Dic"
  },
  {
    "month": "Diciembre 2026",
    "open": "Viernes 15 Ene 2027",
    "close": "Viernes 22 Ene 2027",
    "publish": "Martes 26 Ene 2027"
  }
];

export const REGIONAL_HOSPITALS = [
  {
    "name": "Hospital Dr. Hernán Henríquez Aravena",
    "evalCount": 13,
    "monitoreoCount": 16,
    "referentes": "28 de 29"
  },
  {
    "name": "Hospital Villarrica",
    "evalCount": 11,
    "monitoreoCount": 15,
    "referentes": "26 de 26",
    "highlight": true
  },
  {
    "name": "Hospital Lautaro",
    "evalCount": 11,
    "monitoreoCount": 14,
    "referentes": "24 de 25"
  },
  {
    "name": "Hospital Nueva Imperial",
    "evalCount": 11,
    "monitoreoCount": 15,
    "referentes": "26 de 26"
  },
  {
    "name": "Hospital Pitrufquén",
    "evalCount": 11,
    "monitoreoCount": 14,
    "referentes": "19 de 25"
  },
  {
    "name": "Complejo Asistencial Padre las Casas",
    "evalCount": 12,
    "monitoreoCount": 14,
    "referentes": "23 de 26"
  }
];

export const COMGES_DOMAINS = [
  {
    "id": "comges-1",
    "code": "COMGES 1",
    "title": "Eficiencia en la gestión de procesos asistenciales, calidad y seguridad del paciente",
    "weight": "18%",
    "indWeight": "4.50%",
    "color": "#3B82F6",
    "description": "Optimización del uso de pabellones quirúrgicos electivos y prevención de suspensiones."
  },
  {
    "id": "comges-2",
    "code": "COMGES 2",
    "title": "Estrategias de prevención, diagnóstico y tratamiento en la Red Asistencial",
    "weight": "9%",
    "indWeight": "4.50%",
    "color": "#10B981",
    "description": "Procuramiento y tasa de donantes efectivos en muerte encefálica en la Red Asistencial."
  },
  {
    "id": "comges-3",
    "code": "COMGES 3",
    "title": "Gestión de los tiempos de espera",
    "weight": "30%",
    "indWeight": "4.29%",
    "color": "#F59E0B",
    "description": "Garantías explícitas en salud (GES) y monitoreo del percentil 75 de listas de espera (Médica, Odontológica y Quirúrgica)."
  },
  {
    "id": "comges-4",
    "code": "COMGES 4",
    "title": "Gestión de Riesgos, Recursos Humanos y Financieros",
    "weight": "13%",
    "indWeight": "4.33%",
    "color": "#8B5CF6",
    "description": "Gestión del riesgo de desastres e índice de gasto en personas naturales según glosa autorizada."
  },
  {
    "id": "comges-5",
    "code": "COMGES 5",
    "title": "Prevención, detección temprana y tratamiento oportuno del cáncer",
    "weight": "17%",
    "indWeight": "4.25%",
    "color": "#EC4899",
    "description": "Cumplimiento de garantías GES oncológicas y resolución quirúrgica oncológica No GES < 90 días."
  },
  {
    "id": "comges-6",
    "code": "COMGES 6",
    "title": "Sistemas de información y Salud Digital",
    "weight": "13%",
    "indWeight": "4.33%",
    "color": "#06B6D4",
    "description": "Implementación de estrategias y células de Hospital Digital en establecimientos de la Red."
  },
  {
    "id": "monitoreo",
    "code": "MONITOREO",
    "title": "Indicadores de Monitoreo Obligatorio Hospitalario",
    "weight": "Monitoreo",
    "indWeight": "Monitoreo",
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
    "ponderacion": "4.50%",
    "type": "comges",
    "target": "≤ 6.5%",
    "frequency": "Mensual (Corte semestral MINSAL)",
    "dataSource": "Planilla de Registro Quirúrgico Hospitalario / SIGTE / REM-A08 (Numerador y Denominador)",
    "definition": "Mide el porcentaje de cirugías mayores electivas suspendidas respecto del total de cirugías mayores electivas programadas en tabla quirúrgica del Hospital de Villarrica. Fuente oficial con Ruta REM.",
    "objective": "Aumentar la eficiencia en el uso de los pabellones quirúrgicos electivos y reducir las suspensiones por causas prevenibles.",
    "formula": {
      "numerator": "N° de cirugías mayores electivas suspendidas en el periodo.",
      "denominator": "N° total de cirugías mayores electivas programadas en el periodo.",
      "expression": "(Cirugías Suspendidas / Cirugías Programadas) × 100"
    },
    "evalRules": "Evaluación semestral según tabla de sensibilidad MINSAL (Escala 0 a 4 puntos). Indicador con Ruta REM.",
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
    "ponderacion": "4.50%",
    "type": "comges",
    "target": "Por definir (SSAS / MINSAL)",
    "frequency": "Semestral (Pendiente)",
    "dataSource": "Coordinación Nacional de Procuramiento / Registros SSAS",
    "definition": "Evalúa la detección temprana y notificación oportuna de potenciales donantes en muerte encefálica en Unidades de Paciente Crítico y Urgencia.",
    "objective": "Aumentar la tasa de procuramiento de órganos y tejidos para trasplante en la red asistencial.",
    "formula": {
      "numerator": "N° de donantes efectivos de órganos procurados en el establecimiento.",
      "denominator": "Población asignada (por millón de habitantes) del Servicio de Salud Araucanía Sur.",
      "expression": "(Donantes Efectivos / Población en Millones)"
    },
    "evalRules": "Sin medición acumulada actual. Existen dudas metodológicas para su medición que deben ser aclaradas desde el Servicio de Salud Araucanía Sur que aún no se encuentran definidas y que por ahora se encuentran sin medición con criterios metodológicos por definir.",
    "monthlyData": [],
    "summaryYTD": {
      "numerator": "-",
      "denominator": "-",
      "result": null,
      "resultFormatted": "Sin Medición",
      "status": "Sin Medición",
      "observation": "Sin medición actual. Existen dudas metodológicas por aclarar por parte del Servicio de Salud Araucanía Sur."
    }
  },
  {
    "id": "3.1",
    "code": "COMGES 3.1",
    "domainId": "comges-3",
    "name": "3.1. Cumplimiento de Garantías explícitas en Salud (GES) en la red",
    "ponderacion": "4.29%",
    "type": "comges",
    "target": "≥ 99.5%",
    "frequency": "Mensual",
    "dataSource": "Sistema de Información GES (SIGGES) MINSAL",
    "definition": "Indicador Compuesto y con Requisitos. Mide el cumplimiento de las garantías de oportunidad GES en el Hospital de Villarrica. El incumplimiento técnico del requisito descuenta 1 punto del puntaje obtenido.",
    "objective": "Garantizar la atención dentro de los plazos legales normados para el 100% de las garantías de oportunidad GES vigentes.",
    "formula": {
      "numerator": "N° de garantías GES cumplidas dentro del plazo legal legalmente resueltas.",
      "denominator": "N° total de garantías GES exceptuadas + garantizadas con fecha de vencimiento en el periodo.",
      "expression": "(Garantías Cumplidas / Garantías Totales Vencidas) × 100"
    },
    "evalRules": "Indicador Compuesto con Requisito. Escala de 0 a 4 puntos. Si no cumple requisito, se descuenta 1 punto al resultado principal (mínimo 0 Puntos).",
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
    "ponderacion": "4.29%",
    "type": "comges",
    "target": "≥ 50.0% de avance en resolución P75",
    "frequency": "Mensual (Planilla Resumen)",
    "dataSource": "Repositorio Nacional de Listas de Espera (SIGTE) MINSAL / Hoja 'resumen gonzalo'",
    "definition": "Evalúa la proporción acumulada de resoluciones/egresos de la lista de espera de Consulta Nueva de Especialidad Médica (CNE) respecto a la línea base del P75.",
    "objective": "Reducir la antigüedad y los tiempos de espera de los usuarios en lista de espera médica.",
    "formula": {
      "numerator": "Egresos acumulados de la lista de espera CNE Médica.",
      "denominator": "Línea base institucional de la lista CNE Médica.",
      "expression": "(Egresos CNE Médica / Línea Base P75) × 100"
    },
    "evalRules": "Evaluación mensual según registro de egresos y avance del P75 en planilla oficial.",
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": 489,
        "denominator": 2048,
        "result": 23.88,
        "resultFormatted": "23.88%",
        "status": "No Cumple"
      },
      {
        "month": "Mayo",
        "numerator": 965,
        "denominator": 2075,
        "result": 46.51,
        "resultFormatted": "46.51%",
        "status": "En Riesgo"
      },
      {
        "month": "Junio",
        "numerator": 1104,
        "denominator": 2077,
        "result": 53.15,
        "resultFormatted": "53.15%",
        "status": "Cumple"
      },
      {
        "month": "Julio",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      }
    ],
    "summaryYTD": {
      "numerator": 1104,
      "denominator": 2077,
      "result": 53.15,
      "resultFormatted": "53.15%",
      "status": "Cumple",
      "observation": "Acumulado a Junio 2026: 53.15% de egresos resueltos sobre la línea base (Meta ≥ 50%)."
    }
  },
  {
    "id": "3.3",
    "code": "COMGES 3.3",
    "domainId": "comges-3",
    "name": "3.3. Monitoreo del percentil 75 de la lista de espera de consulta nueva de especialidad odontológica",
    "ponderacion": "4.29%",
    "type": "comges",
    "target": "≥ 50.0% de avance en resolución P75",
    "frequency": "Mensual (Planilla Resumen)",
    "dataSource": "SIGTE / Registro de Especialidades Odontológicas / Hoja 'resumen gonzalo'",
    "definition": "Indicador Compuesto. Mide el avance porcentual acumulado de egresos de la lista de espera odontológica respecto de la línea base.",
    "objective": "Acelerar la resolución diagnóstica y terapéutica odontológica en el nivel secundario.",
    "formula": {
      "numerator": "Egresos acumulados de lista de espera odontológica.",
      "denominator": "Línea base institucional odontológica.",
      "expression": "(Egresos Odontológicos / Línea Base P75) × 100"
    },
    "evalRules": "Indicador Compuesto evaluado mensualmente en la red.",
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": 878,
        "denominator": 1353,
        "result": 64.89,
        "resultFormatted": "64.89%",
        "status": "Cumple"
      },
      {
        "month": "Mayo",
        "numerator": 757,
        "denominator": 1353,
        "result": 55.95,
        "resultFormatted": "55.95%",
        "status": "Cumple"
      },
      {
        "month": "Junio",
        "numerator": 878,
        "denominator": 1353,
        "result": 64.89,
        "resultFormatted": "64.89%",
        "status": "Cumple"
      },
      {
        "month": "Julio",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      }
    ],
    "summaryYTD": {
      "numerator": 878,
      "denominator": 1353,
      "result": 64.89,
      "resultFormatted": "64.89%",
      "status": "Cumple",
      "observation": "Acumulado a Junio 2026: 64.89% de avance en egresos odontológicos (Meta ≥ 50%)."
    }
  },
  {
    "id": "3.4",
    "code": "COMGES 3.4",
    "domainId": "comges-3",
    "name": "3.4. Monitoreo del percentil 75 de la lista de espera de intervenciones quirúrgicas mayores y menores",
    "ponderacion": "4.29%",
    "type": "comges",
    "target": "≥ 50.0% de avance en resolución P75",
    "frequency": "Mensual (Planilla Resumen)",
    "dataSource": "SIGTE / Sistema de Pabellones Quirúrgicos / Hoja 'resumen gonzalo'",
    "definition": "Monitorea el avance de egresos de la lista de espera quirúrgica No GES mayores y menores sobre la línea base comprometida.",
    "objective": "Disminuir los tiempos de espera de intervención quirúrgica de pacientes electivos no GES.",
    "formula": {
      "numerator": "Egresos acumulados de lista de espera quirúrgica No GES.",
      "denominator": "Línea base de la lista de espera quirúrgica P75.",
      "expression": "(Egresos Quirúrgicos / Línea Base P75) × 100"
    },
    "evalRules": "Priorización obligatoria por antigüedad y riesgo biomédico.",
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": 78,
        "denominator": 367,
        "result": 21.25,
        "resultFormatted": "21.25%",
        "status": "No Cumple"
      },
      {
        "month": "Abril",
        "numerator": 107,
        "denominator": 368,
        "result": 29.08,
        "resultFormatted": "29.08%",
        "status": "No Cumple"
      },
      {
        "month": "Mayo",
        "numerator": 153,
        "denominator": 376,
        "result": 40.69,
        "resultFormatted": "40.69%",
        "status": "En Riesgo"
      },
      {
        "month": "Junio",
        "numerator": 196,
        "denominator": 381,
        "result": 51.44,
        "resultFormatted": "51.44%",
        "status": "Cumple"
      },
      {
        "month": "Julio",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      }
    ],
    "summaryYTD": {
      "numerator": 196,
      "denominator": 381,
      "result": 51.44,
      "resultFormatted": "51.44%",
      "status": "Cumple",
      "observation": "Acumulado a Junio 2026: 51.44% de avance de resolución quirúrgica (Meta ≥ 50%)."
    }
  },
  {
    "id": "4.2",
    "code": "COMGES 4.2",
    "domainId": "comges-4",
    "name": "4.2. Implementación del plan gestión del riesgo de desastres",
    "ponderacion": "4.33%",
    "type": "comges",
    "target": "Por definir (SSAS / MINSAL)",
    "frequency": "Semestral (Pendiente)",
    "dataSource": "Unidad de Gestión del Riesgo de Desastres / SSAS",
    "definition": "Indicador con Requisitos. Evalúa el cumplimiento de las actividades, simulacros, mantenimientos críticos de continuidad operativa y capacitaciones del Plan Hospitalario para Emergencias y Desastres.",
    "objective": "Asegurar la resiliencia y la continuidad operacional de la infraestructura hospitalaria ante eventos adversos y catástrofes.",
    "formula": {
      "numerator": "N° de actividades GDR (simulacros, planes de contingencia, comités) ejecutadas.",
      "denominator": "Total de actividades comprometidas en la programación anual GDR.",
      "expression": "(Actividades GDR Realizadas / Actividades Programadas) × 100"
    },
    "evalRules": "Sin medición acumulada actual. Existen dudas metodológicas para su medición que deben ser aclaradas desde el Servicio de Salud Araucanía Sur que aún no se encuentran definidas y que por ahora se encuentran sin medición con criterios metodológicos por definir.",
    "monthlyData": [],
    "summaryYTD": {
      "numerator": "-",
      "denominator": "-",
      "result": null,
      "resultFormatted": "Sin Medición",
      "status": "Sin Medición",
      "observation": "Sin medición actual. Criterios metodológicos por definir por parte del Servicio de Salud Araucanía Sur."
    }
  },
  {
    "id": "4.3",
    "code": "COMGES 4.3",
    "domainId": "comges-4",
    "name": "4.3. Índice del gasto en convenio con personas naturales respecto a la glosa autorizada vigente",
    "ponderacion": "4.33%",
    "type": "comges",
    "target": "≤ 100% del marco presupuestario autorizado",
    "frequency": "Mensual / Trimestral",
    "dataSource": "SIGFE / Subdepartamento de Finanzas y Presupuesto / Hoja 'resumen gonzalo'",
    "definition": "Indicador Compuesto y con Requisitos. Cuantifica el ajuste del gasto ejecutado por contrataciones en honorarios médicos y no médicos (personas naturales) respecto al marco presupuestario vigente.",
    "objective": "Mantener la sostenibilidad financiera y la disciplina presupuestaria en la contratación de personal honorario.",
    "formula": {
      "numerator": "Gasto devengado acumulado en Subtítulo 21 (Honorarios Personas Naturales).",
      "denominator": "Presupuesto o marco vigente autorizador en el periodo.",
      "expression": "(Gasto Honorarios Devengado / Marco Presupuestario Vigente) × 100"
    },
    "evalRules": "Indicador Compuesto con Requisito. Monitoreo estricto del devengamiento presupuestario en SIGFE.",
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": 3223649,
        "denominator": 3876000,
        "result": 83.17,
        "resultFormatted": "83.17%",
        "status": "Cumple"
      },
      {
        "month": "Abril",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Julio",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      }
    ],
    "summaryYTD": {
      "numerator": "$ 3.223.649",
      "denominator": "$ 3.876.000",
      "result": 83.17,
      "resultFormatted": "83.17%",
      "status": "Cumple",
      "observation": "Ejecución presupuestaria al primer trimestre: 83.17% (dentro del marco autorizado)."
    }
  },
  {
    "id": "5.1",
    "code": "COMGES 5.1",
    "domainId": "comges-5",
    "name": "5.1. Nivel de cumplimiento efectivo de garantías GES en problemas de salud oncológicos",
    "ponderacion": "4.25%",
    "type": "comges",
    "target": "≥ 99.5%",
    "frequency": "Mensual",
    "dataSource": "SIGGES MINSAL / Registro Oncológico / Hoja 'resumen gonzalo'",
    "definition": "Indicador Compuesto. Mide en forma específica el cumplimiento de la garantía de oportunidad en los problemas de salud GES del área oncológica en el Hospital de Villarrica.",
    "objective": "Asegurar que ningún paciente con sospecha o confirmación diagnóstica de cáncer sufra retrasos en su tratamiento u oportunidad legal.",
    "formula": {
      "numerator": "N° de garantías GES oncológicas cumplidas en plazo legal.",
      "denominator": "Total de garantías GES oncológicas vencidas en el periodo.",
      "expression": "(Garantías Oncológicas Cumplidas / Garantías Oncológicas Vencidas) × 100"
    },
    "evalRules": "Indicador Compuesto. Cero tolerancia a retrasos no justificados en oportunidad oncológica.",
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 152,
        "denominator": 160,
        "result": 95.0,
        "resultFormatted": "95.00%",
        "status": "En Riesgo"
      },
      {
        "month": "Febrero",
        "numerator": 187,
        "denominator": 199,
        "result": 93.97,
        "resultFormatted": "93.97%",
        "status": "En Riesgo"
      },
      {
        "month": "Marzo",
        "numerator": 208,
        "denominator": 258,
        "result": 80.62,
        "resultFormatted": "80.62%",
        "status": "No Cumple"
      },
      {
        "month": "Abril",
        "numerator": 208,
        "denominator": 285,
        "result": 72.98,
        "resultFormatted": "72.98%",
        "status": "No Cumple"
      },
      {
        "month": "Mayo",
        "numerator": 361,
        "denominator": 431,
        "result": 83.76,
        "resultFormatted": "83.76%",
        "status": "No Cumple"
      },
      {
        "month": "Junio",
        "numerator": 354,
        "denominator": 452,
        "result": 78.32,
        "resultFormatted": "78.32%",
        "status": "No Cumple"
      },
      {
        "month": "Julio",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      }
    ],
    "summaryYTD": {
      "numerator": 354,
      "denominator": 452,
      "result": 78.32,
      "resultFormatted": "78.32%",
      "status": "No Cumple",
      "observation": "Acumulado a Junio 2026: 78.32% vs Meta ≥ 99.5%."
    }
  },
  {
    "id": "5.2",
    "code": "COMGES 5.2",
    "domainId": "comges-5",
    "name": "5.2. Casos oncológicos No GES en lista de espera quirúrgica con espera menor a 90 días",
    "ponderacion": "4.25%",
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
    "ponderacion": "4.33%",
    "type": "comges",
    "target": "Por definir (SSAS / MINSAL)",
    "frequency": "Semestral (Pendiente)",
    "dataSource": "Plataforma Hospital Digital MINSAL / Registro Telemedicina SSAS",
    "definition": "Evalúa la adopción e integración efectiva de las células del Hospital Digital (Dermatología, Nefrología, Diabetes, Oftalmología) para resolución a distancia en el hospital.",
    "objective": "Expandir la capacidad resolutiva especializada mediante herramientas de salud digital y telemedicina.",
    "formula": {
      "numerator": "N° de teleconsultas/interconsultas resueltas por células HD asignadas.",
      "denominator": "Meta programada de consultas digitales para el territorio.",
      "expression": "(Teleconsultas Resueltas / Meta Telemedicina) × 100"
    },
    "evalRules": "Sin medición acumulada actual. Existen dudas metodológicas para su medición que deben ser aclaradas desde el Servicio de Salud Araucanía Sur que aún no se encuentran definidas y que por ahora se encuentran sin medición con criterios metodológicos por definir.",
    "monthlyData": [],
    "summaryYTD": {
      "numerator": "-",
      "denominator": "-",
      "result": null,
      "resultFormatted": "Sin Medición",
      "status": "Sin Medición",
      "observation": "Sin medición actual. Criterios metodológicos por definir por parte del Servicio de Salud Araucanía Sur."
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
    "dataSource": "PLANILLA COMGES 2026.xlsx (Hoja '1,1 AMB CMA') / REM-A08 (Numerador y Denominador)",
    "definition": "Indicador de Monitoreo con Ruta REM. Mide la proporción de cirugías mayores electivas ambulatorizadas (CMA) sobre el total de cirugías mayores electivas realizadas en el Hospital de Villarrica.",
    "objective": "Optimizar el recurso cama hospitalario y favorecer la recuperación precoz del paciente en su entorno familiar.",
    "formula": {
      "numerator": "N° total de Cirugías Mayores Ambulatorias (CMA) realizadas.",
      "denominator": "N° total de Cirugías Mayores Electivas realizadas (CMA + Con Hospitalización).",
      "expression": "(CMA / Total Cirugías Mayores Electivas) × 100"
    },
    "evalRules": "Seguimiento mensual con Ruta REM oficial. Meta institucional ≥ 50%.",
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
    "dataSource": "PLANILLA COMGES 2026.xlsx (Hoja '1,9 ABANDONO URG') / DAU / REM (Numerador y Denominador)",
    "definition": "Indicador Compuesto y de Monitoreo con Ruta REM. Porcentaje de pacientes que se retiran sin atención médica de la UEH tras ingresar a categorización.",
    "objective": "Reducir los tiempos de espera en urgencia para evitar la fuga de pacientes y riesgos clínicos.",
    "formula": {
      "numerator": "N° de personas que se retiran sin atención médica.",
      "denominator": "N° total de consultas/DAU ingresadas en el servicio de urgencia.",
      "expression": "(Abandonos UEH / Total DAU Ingresados) × 100"
    },
    "evalRules": "Indicador Compuesto con Ruta REM oficial.",
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
