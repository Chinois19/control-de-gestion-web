// Dataset Oficial Metas Sanitarias Ley 20.707 (Formulación MS 20707-2026)
// Hospital de Villarrica - Año 2026 (Excluyendo filas separadoras de unidades 'Todos')

export const LEY20707_META = {
  "title": "Metas Sanitarias Ley 20.707 (2026)",
  "subtitle": "Profesionales Médicos, Cirujano-Dentistas, Químico-Farmacéuticos y Bioquímicos",
  "hospital": "Hospital de Villarrica",
  "service": "Servicio de Salud Araucanía Sur",
  "year": 2026,
  "sourceFile": "Formulación-MS 20707-2026.xlsx (Corte a Septiembre 2026)",
  "lastUpdatedMonth": "Septiembre",
  "totalIndicators": 21
};

export const LEY20707_UNITS = [
  {
    "id": "todas",
    "name": "Todas las Unidades Clínicas",
    "code": "TODAS",
    "color": "#0f172a"
  },
  {
    "id": "ueh",
    "name": "Unidad de Emergencia Hospitalaria (UEH)",
    "code": "UEH",
    "color": "#ef4444"
  },
  {
    "id": "pabellon",
    "name": "Unidad de Pabellón y Recuperación",
    "code": "PABELLÓN",
    "color": "#3b82f6"
  },
  {
    "id": "pediatria",
    "name": "Unidad Pediátrica y Neonatología",
    "code": "PEDIATRÍA",
    "color": "#10b981"
  },
  {
    "id": "upc",
    "name": "Unidad de Paciente Crítico (UPC)",
    "code": "UPC",
    "color": "#8b5cf6"
  },
  {
    "id": "ginecologia",
    "name": "Unidad de Ginecología y Obstetricia",
    "code": "GIN-OBS",
    "color": "#ec4899"
  }
];

export const LEY20707_INDICATORS = [
  {
    "id": "ley20707-1",
    "code": "Meta 1",
    "rawCode": "1",
    "name": "Usuarios categorizados C2 o ESI2 atendidos oportunamente en las Unidades de Emergencia Hospitalaria (UEH)",
    "formula": "(Número de usuarios categorizados C2-ES12 con primera atención médica dentro de los 30 minutos desde la categorización en UEH/ Número de usuarios Categorizados C2-ES12 en UEH) x 100",
    "dept": "UNIDAD DE EMERGENCIA HOSPITALARIA",
    "deptInfo": {
      "id": "ueh",
      "name": "Unidad de Emergencia Hospitalaria (UEH)",
      "code": "UEH",
      "color": "#ef4444"
    },
    "weight": "10%",
    "weightVal": 0.1,
    "target": "≥ 90%",
    "targetVal": 0.9,
    "isLessOrEqual": false,
    "referent": "Control de Gestión",
    "summaryYTD": {
      "numerator": 2817,
      "denominator": 2933,
      "result": 96.05,
      "resultFormatted": "96.05%",
      "compliance": 100,
      "scoreObtained": 10,
      "status": "Cumple",
      "statusLabel": "Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 350,
        "denominator": 350,
        "result": 100,
        "resultFormatted": "100.00%",
        "compliance": 111.1,
        "status": "Cumple"
      },
      {
        "month": "Febrero",
        "numerator": 337,
        "denominator": 342,
        "result": 98.54,
        "resultFormatted": "98.54%",
        "compliance": 109.5,
        "status": "Cumple"
      },
      {
        "month": "Marzo",
        "numerator": 345,
        "denominator": 344,
        "result": 100.29,
        "resultFormatted": "100.29%",
        "compliance": 111.4,
        "status": "Cumple"
      },
      {
        "month": "Abril",
        "numerator": 336,
        "denominator": 345,
        "result": 97.39,
        "resultFormatted": "97.39%",
        "compliance": 108.2,
        "status": "Cumple"
      },
      {
        "month": "Mayo",
        "numerator": 297,
        "denominator": 301,
        "result": 98.67,
        "resultFormatted": "98.67%",
        "compliance": 109.6,
        "status": "Cumple"
      },
      {
        "month": "Junio",
        "numerator": 285,
        "denominator": 291,
        "result": 97.94,
        "resultFormatted": "97.94%",
        "compliance": 108.8,
        "status": "Cumple"
      },
      {
        "month": "Julio",
        "numerator": 273,
        "denominator": 271,
        "result": 100.74,
        "resultFormatted": "100.74%",
        "compliance": 111.9,
        "status": "Cumple"
      },
      {
        "month": "Agosto",
        "numerator": 370,
        "denominator": 373,
        "result": 99.2,
        "resultFormatted": "99.20%",
        "compliance": 110.2,
        "status": "Cumple"
      },
      {
        "month": "Septiembre",
        "numerator": 224,
        "denominator": 316,
        "result": 70.89,
        "resultFormatted": "70.89%",
        "compliance": 78.8,
        "status": "No Cumple"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      }
    ]
  },
  {
    "id": "ley20707-2",
    "code": "Meta 3",
    "rawCode": "3",
    "name": "Pacientes con indicación de hospitalización desde Unidad de Emergencia Hospitalaria (UEH), que acceden a cama de dotación en menos de 12 horas",
    "formula": "(Número total de pacientes con indicación de hospitalización que espera en (JEH en un tiempo menor a 12 horas para acceder a cama de dotación / Número total de pacientes con indicación de hospitalización en UEH) x 100",
    "dept": "UNIDAD DE EMERGENCIA HOSPITALARIA",
    "deptInfo": {
      "id": "ueh",
      "name": "Unidad de Emergencia Hospitalaria (UEH)",
      "code": "UEH",
      "color": "#ef4444"
    },
    "weight": "10%",
    "weightVal": 0.1,
    "target": "≥ 85%",
    "targetVal": 0.85,
    "isLessOrEqual": false,
    "referent": "Control de Gestión",
    "summaryYTD": {
      "numerator": 1188,
      "denominator": 2794,
      "result": 42.52,
      "resultFormatted": "42.52%",
      "compliance": 50,
      "scoreObtained": 0,
      "status": "No Cumple",
      "statusLabel": "No Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 136,
        "denominator": 261,
        "result": 52.11,
        "resultFormatted": "52.11%",
        "compliance": 61.3,
        "status": "No Cumple"
      },
      {
        "month": "Febrero",
        "numerator": 164,
        "denominator": 260,
        "result": 63.08,
        "resultFormatted": "63.08%",
        "compliance": 74.2,
        "status": "No Cumple"
      },
      {
        "month": "Marzo",
        "numerator": 170,
        "denominator": 305,
        "result": 55.74,
        "resultFormatted": "55.74%",
        "compliance": 65.6,
        "status": "No Cumple"
      },
      {
        "month": "Abril",
        "numerator": 134,
        "denominator": 338,
        "result": 39.64,
        "resultFormatted": "39.64%",
        "compliance": 46.6,
        "status": "No Cumple"
      },
      {
        "month": "Mayo",
        "numerator": 152,
        "denominator": 347,
        "result": 43.8,
        "resultFormatted": "43.80%",
        "compliance": 51.5,
        "status": "No Cumple"
      },
      {
        "month": "Junio",
        "numerator": 118,
        "denominator": 343,
        "result": 34.4,
        "resultFormatted": "34.40%",
        "compliance": 40.5,
        "status": "No Cumple"
      },
      {
        "month": "Julio",
        "numerator": 81,
        "denominator": 292,
        "result": 27.74,
        "resultFormatted": "27.74%",
        "compliance": 32.6,
        "status": "No Cumple"
      },
      {
        "month": "Agosto",
        "numerator": 118,
        "denominator": 335,
        "result": 35.22,
        "resultFormatted": "35.22%",
        "compliance": 41.4,
        "status": "No Cumple"
      },
      {
        "month": "Septiembre",
        "numerator": 115,
        "denominator": 313,
        "result": 36.74,
        "resultFormatted": "36.74%",
        "compliance": 43.2,
        "status": "No Cumple"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      }
    ]
  },
  {
    "id": "ley20707-3",
    "code": "Meta 9",
    "rawCode": "9",
    "name": "Capacitación actualizada en Reanimación Cardiopulmonar (RCP)",
    "formula": "(Número de profesionales funcionarios/as con capacitación actualizada en RCP/ Número total de profesionales funcionarios/as en dotación) x 100",
    "dept": "UNIDAD DE EMERGENCIA HOSPITALARIA",
    "deptInfo": {
      "id": "ueh",
      "name": "Unidad de Emergencia Hospitalaria (UEH)",
      "code": "UEH",
      "color": "#ef4444"
    },
    "weight": "40%",
    "weightVal": 0.4,
    "target": "≥ 60%",
    "targetVal": 0.6,
    "isLessOrEqual": false,
    "referent": "Capacitación",
    "summaryYTD": {
      "numerator": 5,
      "denominator": 5,
      "result": 100,
      "resultFormatted": "100.00%",
      "compliance": 100,
      "scoreObtained": 40,
      "status": "Cumple",
      "statusLabel": "Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Julio",
        "numerator": 5,
        "denominator": 5,
        "result": 100,
        "resultFormatted": "100.00%",
        "compliance": 166.7,
        "status": "Cumple"
      },
      {
        "month": "Agosto",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      }
    ]
  },
  {
    "id": "ley20707-4",
    "code": "Meta 10",
    "rawCode": "10",
    "name": "Cobertura de profesionales funcionarios/as en prevención y control de Infecciones Asociadas a la Atención de Salud (IAAS).",
    "formula": "(Número de profesionales funcionarios/as con curso de prevención y control de IAAS aprobado con antigüedad menor a 5 años/ Número total de profesionales funcionarios/as en dotación) x 100",
    "dept": "UNIDAD DE EMERGENCIA HOSPITALARIA",
    "deptInfo": {
      "id": "ueh",
      "name": "Unidad de Emergencia Hospitalaria (UEH)",
      "code": "UEH",
      "color": "#ef4444"
    },
    "weight": "40%",
    "weightVal": 0.4,
    "target": "≥ NaN%",
    "targetVal": "70%",
    "isLessOrEqual": false,
    "referent": "Capacitación",
    "summaryYTD": {
      "numerator": 3,
      "denominator": 5,
      "result": 60,
      "resultFormatted": "60.00%",
      "compliance": 85.7,
      "scoreObtained": 34.29,
      "status": "No Cumple",
      "statusLabel": "No Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Julio",
        "numerator": 3,
        "denominator": 5,
        "result": 60,
        "resultFormatted": "60.00%",
        "compliance": null,
        "status": "No Cumple"
      },
      {
        "month": "Agosto",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      }
    ]
  },
  {
    "id": "ley20707-5",
    "code": "Meta 8",
    "rawCode": "8",
    "name": "Evaluación de riesgo de enfermedad tromboembólica (ETE) en pacientes quirúrgicos",
    "formula": "(Número de pacientes quirúrgicos hospitalizados con evaluación de riesgo de ETE / Número pacientes quirúrgicos hospitalizados) x100",
    "dept": "UNIDAD DE GINECOLOGIA Y OBSTETRICIA",
    "deptInfo": {
      "id": "todas",
      "name": "UNIDAD DE GINECOLOGIA Y OBSTETRICIA",
      "code": "UNIDAD DE GINECOLOGIA Y OBSTETRICIA",
      "color": "#64748b"
    },
    "weight": "30%",
    "weightVal": 0.3,
    "target": "≥ 80%",
    "targetVal": 0.8,
    "isLessOrEqual": false,
    "referent": "Calidad",
    "summaryYTD": {
      "numerator": 25,
      "denominator": 26,
      "result": 96.15,
      "resultFormatted": "96.15%",
      "compliance": 100,
      "scoreObtained": 30,
      "status": "Cumple",
      "statusLabel": "Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 25,
        "denominator": 26,
        "result": 96.15,
        "resultFormatted": "96.15%",
        "compliance": 120.2,
        "status": "Cumple"
      },
      {
        "month": "Julio",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      }
    ]
  },
  {
    "id": "ley20707-6",
    "code": "Meta 9",
    "rawCode": "9",
    "name": "Capacitación actualizada en Reanimación Cardiopulmonar (RCP)",
    "formula": "(Número de profesionales funcionarios/as con capacitación actualizada en RCP/ Número total de profesionales funcionarios/as en dotación) x 100",
    "dept": "UNIDAD DE GINECOLOGIA Y OBSTETRICIA",
    "deptInfo": {
      "id": "todas",
      "name": "UNIDAD DE GINECOLOGIA Y OBSTETRICIA",
      "code": "UNIDAD DE GINECOLOGIA Y OBSTETRICIA",
      "color": "#64748b"
    },
    "weight": "30%",
    "weightVal": 0.3,
    "target": "≥ NaN%",
    "targetVal": "60%",
    "isLessOrEqual": false,
    "referent": "Capacitación",
    "summaryYTD": {
      "numerator": 14,
      "denominator": 15,
      "result": 93.33,
      "resultFormatted": "93.33%",
      "compliance": 100,
      "scoreObtained": 30,
      "status": "No Cumple",
      "statusLabel": "No Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Julio",
        "numerator": 14,
        "denominator": 15,
        "result": 93.33,
        "resultFormatted": "93.33%",
        "compliance": null,
        "status": "No Cumple"
      },
      {
        "month": "Agosto",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      }
    ]
  },
  {
    "id": "ley20707-7",
    "code": "Meta 10",
    "rawCode": "10",
    "name": "Cobertura de profesionales funcionarios/as en prevención y control de Infecciones Asociadas a la Atención de Salud (IAAS).",
    "formula": "(Número de profesionales funcionarios/as con curso de prevención y control de IAAS aprobado con antigüedad menor a 5 años/ Número total de profesionales funcionarios/as en dotación) x 100",
    "dept": "UNIDAD DE GINECOLOGIA Y OBSTETRICIA",
    "deptInfo": {
      "id": "todas",
      "name": "UNIDAD DE GINECOLOGIA Y OBSTETRICIA",
      "code": "UNIDAD DE GINECOLOGIA Y OBSTETRICIA",
      "color": "#64748b"
    },
    "weight": "30%",
    "weightVal": 0.3,
    "target": "≥ NaN%",
    "targetVal": "70%",
    "isLessOrEqual": false,
    "referent": "Capacitación",
    "summaryYTD": {
      "numerator": 12,
      "denominator": 15,
      "result": 80,
      "resultFormatted": "80.00%",
      "compliance": 100,
      "scoreObtained": 30,
      "status": "No Cumple",
      "statusLabel": "No Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Julio",
        "numerator": 12,
        "denominator": 15,
        "result": 80,
        "resultFormatted": "80.00%",
        "compliance": null,
        "status": "No Cumple"
      },
      {
        "month": "Agosto",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      }
    ]
  },
  {
    "id": "ley20707-8",
    "code": "Ind Local 5",
    "rawCode": "Ind Local 5",
    "name": "Porcentaje entrega de turno médico con registro según protocolo.",
    "formula": "(Número de entregas de turno médico con registro según protocolo/ Número total de entregas de turno médico del periodo) *100",
    "dept": "UNIDAD DE GINECOLOGIA Y OBSTETRICIA",
    "deptInfo": {
      "id": "todas",
      "name": "UNIDAD DE GINECOLOGIA Y OBSTETRICIA",
      "code": "UNIDAD DE GINECOLOGIA Y OBSTETRICIA",
      "color": "#64748b"
    },
    "weight": "10%",
    "weightVal": 0.1,
    "target": "≥ 95%",
    "targetVal": 0.95,
    "isLessOrEqual": false,
    "referent": "Calidad",
    "summaryYTD": {
      "numerator": 54,
      "denominator": 54,
      "result": 100,
      "resultFormatted": "100.00%",
      "compliance": 100,
      "scoreObtained": 10,
      "status": "Cumple",
      "statusLabel": "Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 54,
        "denominator": 54,
        "result": 100,
        "resultFormatted": "100.00%",
        "compliance": 105.3,
        "status": "Cumple"
      },
      {
        "month": "Julio",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      }
    ]
  },
  {
    "id": "ley20707-9",
    "code": "Meta 9",
    "rawCode": "9",
    "name": "Capacitación actualizada en Reanimación Cardiopulmonar (RCP)",
    "formula": "(Número de profesionales funcionarios/as con capacitación actualizada en RCP/ Número total de profesionales funcionarios/as en dotación) x 100",
    "dept": "UNIDAD DE PABELLON Y RECUPERACION",
    "deptInfo": {
      "id": "todas",
      "name": "UNIDAD DE PABELLON Y RECUPERACION",
      "code": "UNIDAD DE PABELLON Y RECUPERACION",
      "color": "#64748b"
    },
    "weight": "20%",
    "weightVal": 0.2,
    "target": "≥ NaN%",
    "targetVal": "60%",
    "isLessOrEqual": false,
    "referent": "Capacitación",
    "summaryYTD": {
      "numerator": 18,
      "denominator": 24,
      "result": 75,
      "resultFormatted": "75.00%",
      "compliance": 100,
      "scoreObtained": 20,
      "status": "No Cumple",
      "statusLabel": "No Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Julio",
        "numerator": 18,
        "denominator": 24,
        "result": 75,
        "resultFormatted": "75.00%",
        "compliance": null,
        "status": "No Cumple"
      },
      {
        "month": "Agosto",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      }
    ]
  },
  {
    "id": "ley20707-10",
    "code": "Meta 10",
    "rawCode": "10",
    "name": "Cobertura de profesionales funcionarios/as en prevención y control de Infecciones Asociadas a la Atención de Salud (IAAS).",
    "formula": "(Número de profesionales funcionarios/as con curso de prevención y control de IAAS aprobado con antigüedad menor a 5 años/ Número total de profesionales funcionarios/as en dotación) x 100",
    "dept": "UNIDAD DE PABELLON Y RECUPERACION",
    "deptInfo": {
      "id": "todas",
      "name": "UNIDAD DE PABELLON Y RECUPERACION",
      "code": "UNIDAD DE PABELLON Y RECUPERACION",
      "color": "#64748b"
    },
    "weight": "30%",
    "weightVal": 0.3,
    "target": "≥ NaN%",
    "targetVal": "70%",
    "isLessOrEqual": false,
    "referent": "Capacitación",
    "summaryYTD": {
      "numerator": 15,
      "denominator": 24,
      "result": 62.5,
      "resultFormatted": "62.50%",
      "compliance": 89.3,
      "scoreObtained": 26.79,
      "status": "No Cumple",
      "statusLabel": "No Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Julio",
        "numerator": 15,
        "denominator": 24,
        "result": 62.5,
        "resultFormatted": "62.50%",
        "compliance": null,
        "status": "No Cumple"
      },
      {
        "month": "Agosto",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      }
    ]
  },
  {
    "id": "ley20707-11",
    "code": "Ind Local 1",
    "rawCode": "Ind Local 1",
    "name": "Ambulatorización de cirugías mayores electivas.",
    "formula": "(N° de cirugías mayores electivas ambulatorias / N° total de cirugías mayores electivas realizadas) * 100",
    "dept": "UNIDAD DE PABELLON Y RECUPERACION",
    "deptInfo": {
      "id": "todas",
      "name": "UNIDAD DE PABELLON Y RECUPERACION",
      "code": "UNIDAD DE PABELLON Y RECUPERACION",
      "color": "#64748b"
    },
    "weight": "25%",
    "weightVal": 0.25,
    "target": "≥ 65%",
    "targetVal": 0.65,
    "isLessOrEqual": false,
    "referent": "Control de Gestión",
    "summaryYTD": {
      "numerator": 3083,
      "denominator": 4352,
      "result": 70.84,
      "resultFormatted": "70.84%",
      "compliance": 100,
      "scoreObtained": 25,
      "status": "Cumple",
      "statusLabel": "Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 315,
        "denominator": 437,
        "result": 72.08,
        "resultFormatted": "72.08%",
        "compliance": 110.9,
        "status": "Cumple"
      },
      {
        "month": "Febrero",
        "numerator": 257,
        "denominator": 400,
        "result": 64.25,
        "resultFormatted": "64.25%",
        "compliance": 98.8,
        "status": "No Cumple"
      },
      {
        "month": "Marzo",
        "numerator": 313,
        "denominator": 471,
        "result": 66.45,
        "resultFormatted": "66.45%",
        "compliance": 102.2,
        "status": "Cumple"
      },
      {
        "month": "Abril",
        "numerator": 354,
        "denominator": 493,
        "result": 71.81,
        "resultFormatted": "71.81%",
        "compliance": 110.5,
        "status": "Cumple"
      },
      {
        "month": "Mayo",
        "numerator": 395,
        "denominator": 542,
        "result": 72.88,
        "resultFormatted": "72.88%",
        "compliance": 112.1,
        "status": "Cumple"
      },
      {
        "month": "Junio",
        "numerator": 356,
        "denominator": 504,
        "result": 70.63,
        "resultFormatted": "70.63%",
        "compliance": 108.7,
        "status": "Cumple"
      },
      {
        "month": "Julio",
        "numerator": 353,
        "denominator": 491,
        "result": 71.89,
        "resultFormatted": "71.89%",
        "compliance": 110.6,
        "status": "Cumple"
      },
      {
        "month": "Agosto",
        "numerator": 398,
        "denominator": 536,
        "result": 74.25,
        "resultFormatted": "74.25%",
        "compliance": 114.2,
        "status": "Cumple"
      },
      {
        "month": "Septiembre",
        "numerator": 342,
        "denominator": 478,
        "result": 71.55,
        "resultFormatted": "71.55%",
        "compliance": 110.1,
        "status": "Cumple"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      }
    ]
  },
  {
    "id": "ley20707-12",
    "code": "Ind Local 2",
    "rawCode": "Ind Local 2",
    "name": "Suspensiones quirúrgicas en cirugías Electivas",
    "formula": "(N° de cirugías mayores electivas suspendidas / N° de cirugías mayores electivas programadas) * 100",
    "dept": "UNIDAD DE PABELLON Y RECUPERACION",
    "deptInfo": {
      "id": "todas",
      "name": "UNIDAD DE PABELLON Y RECUPERACION",
      "code": "UNIDAD DE PABELLON Y RECUPERACION",
      "color": "#64748b"
    },
    "weight": "25%",
    "weightVal": 0.25,
    "target": "≤ 6.5%",
    "targetVal": 0.065,
    "isLessOrEqual": true,
    "referent": "Control de Gestión",
    "summaryYTD": {
      "numerator": 216,
      "denominator": 2785,
      "result": 7.76,
      "resultFormatted": "7.76%",
      "compliance": 83.8,
      "scoreObtained": 20.95,
      "status": "No Cumple",
      "statusLabel": "No Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 18,
        "denominator": 318,
        "result": 5.66,
        "resultFormatted": "5.66%",
        "compliance": 100,
        "status": "Cumple"
      },
      {
        "month": "Febrero",
        "numerator": 18,
        "denominator": 284,
        "result": 6.34,
        "resultFormatted": "6.34%",
        "compliance": 100,
        "status": "Cumple"
      },
      {
        "month": "Marzo",
        "numerator": 25,
        "denominator": 292,
        "result": 8.56,
        "resultFormatted": "8.56%",
        "compliance": 75.9,
        "status": "No Cumple"
      },
      {
        "month": "Abril",
        "numerator": 28,
        "denominator": 331,
        "result": 8.46,
        "resultFormatted": "8.46%",
        "compliance": 76.8,
        "status": "No Cumple"
      },
      {
        "month": "Mayo",
        "numerator": 16,
        "denominator": 310,
        "result": 5.16,
        "resultFormatted": "5.16%",
        "compliance": 100,
        "status": "Cumple"
      },
      {
        "month": "Junio",
        "numerator": 26,
        "denominator": 318,
        "result": 8.18,
        "resultFormatted": "8.18%",
        "compliance": 79.5,
        "status": "No Cumple"
      },
      {
        "month": "Julio",
        "numerator": 30,
        "denominator": 333,
        "result": 9.01,
        "resultFormatted": "9.01%",
        "compliance": 72.1,
        "status": "No Cumple"
      },
      {
        "month": "Agosto",
        "numerator": 23,
        "denominator": 310,
        "result": 7.42,
        "resultFormatted": "7.42%",
        "compliance": 87.6,
        "status": "No Cumple"
      },
      {
        "month": "Septiembre",
        "numerator": 32,
        "denominator": 289,
        "result": 11.07,
        "resultFormatted": "11.07%",
        "compliance": 58.7,
        "status": "No Cumple"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      }
    ]
  },
  {
    "id": "ley20707-13",
    "code": "Meta 2",
    "rawCode": "2",
    "name": "Potenciales Donantes de Órganos para Trasplantes (Muerte encefálica certificada)",
    "formula": "(Número de potenciales donantes entre 6 meses y 78 años registrados en SIDOT / Número de egresos fallecidos por causa neurológica, según CIE -10, entre 6 meses y 78 años reportados por GRD y registrados en SIDOT) x 100",
    "dept": "UNIDAD DE PACIENTE CRITICO",
    "deptInfo": {
      "id": "todas",
      "name": "UNIDAD DE PACIENTE CRITICO",
      "code": "UNIDAD DE PACIENTE CRITICO",
      "color": "#64748b"
    },
    "weight": "10%",
    "weightVal": 0.1,
    "target": "≥ 100%",
    "targetVal": 1,
    "isLessOrEqual": false,
    "referent": "Referente ss",
    "summaryYTD": {
      "numerator": null,
      "denominator": null,
      "result": null,
      "resultFormatted": "-",
      "compliance": null,
      "scoreObtained": 0,
      "status": "Sin Dato",
      "statusLabel": "Sin Dato"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Julio",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      }
    ]
  },
  {
    "id": "ley20707-14",
    "code": "Meta 7",
    "rawCode": "7",
    "name": "Pacientes con Catéter Urinario Permanente (CUP) que cumplen con los criterios de indicación médica de acuerdo con las directrices institucionales locales",
    "formula": "(Número de pacientes con CUP que cumplen con los criterios de indicación médica de acuerdo con las directrices institucionales locales / Número Total de pacientes con CUP) x100",
    "dept": "UNIDAD DE PACIENTE CRITICO",
    "deptInfo": {
      "id": "todas",
      "name": "UNIDAD DE PACIENTE CRITICO",
      "code": "UNIDAD DE PACIENTE CRITICO",
      "color": "#64748b"
    },
    "weight": "10%",
    "weightVal": 0.1,
    "target": "≥ 85%",
    "targetVal": 0.85,
    "isLessOrEqual": false,
    "referent": "Calidad",
    "summaryYTD": {
      "numerator": null,
      "denominator": null,
      "result": null,
      "resultFormatted": "-",
      "compliance": null,
      "scoreObtained": 0,
      "status": "Sin Dato",
      "statusLabel": "Sin Dato"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Julio",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      }
    ]
  },
  {
    "id": "ley20707-15",
    "code": "Meta 9",
    "rawCode": "9",
    "name": "Capacitación actualizada en Reanimación Cardiopulmonar (RCP)",
    "formula": "(Número de profesionales funcionarios/as con capacitación actualizada en RCP/ Número total de profesionales funcionarios/as en dotación) x 100",
    "dept": "UNIDAD DE PACIENTE CRITICO",
    "deptInfo": {
      "id": "todas",
      "name": "UNIDAD DE PACIENTE CRITICO",
      "code": "UNIDAD DE PACIENTE CRITICO",
      "color": "#64748b"
    },
    "weight": "30%",
    "weightVal": 0.3,
    "target": "≥ NaN%",
    "targetVal": "60%",
    "isLessOrEqual": false,
    "referent": "Capacitación",
    "summaryYTD": {
      "numerator": 8,
      "denominator": 11,
      "result": 72.73,
      "resultFormatted": "72.73%",
      "compliance": 100,
      "scoreObtained": 30,
      "status": "No Cumple",
      "statusLabel": "No Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Julio",
        "numerator": 8,
        "denominator": 11,
        "result": 72.73,
        "resultFormatted": "72.73%",
        "compliance": null,
        "status": "No Cumple"
      },
      {
        "month": "Agosto",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      }
    ]
  },
  {
    "id": "ley20707-16",
    "code": "Meta 10",
    "rawCode": "10",
    "name": "Cobertura de profesionales funcionarios/as en prevención y control de Infecciones Asociadas a la Atención de Salud (IAAS).",
    "formula": "(Número de profesionales funcionarios/as con curso de prevención y control de IAAS aprobado con antigüedad menor a 5 años/ Número total de profesionales funcionarios/as en dotación) x 100",
    "dept": "UNIDAD DE PACIENTE CRITICO",
    "deptInfo": {
      "id": "todas",
      "name": "UNIDAD DE PACIENTE CRITICO",
      "code": "UNIDAD DE PACIENTE CRITICO",
      "color": "#64748b"
    },
    "weight": "30%",
    "weightVal": 0.3,
    "target": "≥ NaN%",
    "targetVal": "70%",
    "isLessOrEqual": false,
    "referent": "Capacitación",
    "summaryYTD": {
      "numerator": 6,
      "denominator": 11,
      "result": 54.55,
      "resultFormatted": "54.55%",
      "compliance": 77.9,
      "scoreObtained": 23.38,
      "status": "No Cumple",
      "statusLabel": "No Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Julio",
        "numerator": 6,
        "denominator": 11,
        "result": 54.55,
        "resultFormatted": "54.55%",
        "compliance": null,
        "status": "No Cumple"
      },
      {
        "month": "Agosto",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      }
    ]
  },
  {
    "id": "ley20707-17",
    "code": "Ind Local 4",
    "rawCode": "Ind Local 4",
    "name": "Porcentaje de pacientes ingresados a UPC con correcta aplicación de criterios de ingreso.",
    "formula": "(Número de pacientes ingresados a UPC que cumplen con los criterios de ingreso / Número de pacientes ingresados a UPC) × 100",
    "dept": "UNIDAD DE PACIENTE CRITICO",
    "deptInfo": {
      "id": "todas",
      "name": "UNIDAD DE PACIENTE CRITICO",
      "code": "UNIDAD DE PACIENTE CRITICO",
      "color": "#64748b"
    },
    "weight": "20%",
    "weightVal": 0.2,
    "target": "≥ 90%",
    "targetVal": 0.9,
    "isLessOrEqual": false,
    "referent": "Calidad",
    "summaryYTD": {
      "numerator": 60,
      "denominator": 60,
      "result": 100,
      "resultFormatted": "100.00%",
      "compliance": 100,
      "scoreObtained": 20,
      "status": "Cumple",
      "statusLabel": "Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 60,
        "denominator": 60,
        "result": 100,
        "resultFormatted": "100.00%",
        "compliance": 111.1,
        "status": "Cumple"
      },
      {
        "month": "Julio",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      }
    ]
  },
  {
    "id": "ley20707-18",
    "code": "Meta 9",
    "rawCode": "9",
    "name": "Capacitación actualizada en Reanimación Cardiopulmonar (RCP)",
    "formula": "(Número de profesionales funcionarios/as con capacitación actualizada en RCP/ Número total de profesionales funcionarios/as en dotación) x 100",
    "dept": "UNIDAD PEDIATRICA",
    "deptInfo": {
      "id": "todas",
      "name": "UNIDAD PEDIATRICA",
      "code": "UNIDAD PEDIATRICA",
      "color": "#64748b"
    },
    "weight": "30%",
    "weightVal": 0.3,
    "target": "≥ NaN%",
    "targetVal": "60%",
    "isLessOrEqual": false,
    "referent": "Capacitación",
    "summaryYTD": {
      "numerator": 7,
      "denominator": 7,
      "result": 100,
      "resultFormatted": "100.00%",
      "compliance": 100,
      "scoreObtained": 30,
      "status": "No Cumple",
      "statusLabel": "No Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Julio",
        "numerator": 7,
        "denominator": 7,
        "result": 100,
        "resultFormatted": "100.00%",
        "compliance": null,
        "status": "No Cumple"
      },
      {
        "month": "Agosto",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      }
    ]
  },
  {
    "id": "ley20707-19",
    "code": "Meta 10",
    "rawCode": "10",
    "name": "Cobertura de profesionales funcionarios/as en prevención y control de Infecciones Asociadas a la Atención de Salud (IAAS).",
    "formula": "(Número de profesionales funcionarios/as con curso de prevención y control de IAAS aprobado con antigüedad menor a 5 años/ Número total de profesionales funcionarios/as en dotación) x 100",
    "dept": "UNIDAD PEDIATRICA",
    "deptInfo": {
      "id": "todas",
      "name": "UNIDAD PEDIATRICA",
      "code": "UNIDAD PEDIATRICA",
      "color": "#64748b"
    },
    "weight": "30%",
    "weightVal": 0.3,
    "target": "≥ NaN%",
    "targetVal": "70%",
    "isLessOrEqual": false,
    "referent": "Capacitación",
    "summaryYTD": {
      "numerator": 4,
      "denominator": 7,
      "result": 57.14,
      "resultFormatted": "57.14%",
      "compliance": 81.6,
      "scoreObtained": 24.49,
      "status": "No Cumple",
      "statusLabel": "No Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Julio",
        "numerator": 4,
        "denominator": 7,
        "result": 57.14,
        "resultFormatted": "57.14%",
        "compliance": null,
        "status": "No Cumple"
      },
      {
        "month": "Agosto",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      }
    ]
  },
  {
    "id": "ley20707-20",
    "code": "Ind Local 3",
    "rawCode": "Ind Local 3",
    "name": "Capacitación en Reanimación Neonatal",
    "formula": "(Número de profesionales funcionario/as con capacitación actualizada en Reanimación Neonatal / Número total de profesionales funcionario/as en dotación) × 100",
    "dept": "UNIDAD PEDIATRICA",
    "deptInfo": {
      "id": "todas",
      "name": "UNIDAD PEDIATRICA",
      "code": "UNIDAD PEDIATRICA",
      "color": "#64748b"
    },
    "weight": "30%",
    "weightVal": 0.3,
    "target": "≥ 70%",
    "targetVal": 0.7,
    "isLessOrEqual": false,
    "referent": "Capacitación",
    "summaryYTD": {
      "numerator": 5,
      "denominator": 7,
      "result": 71.43,
      "resultFormatted": "71.43%",
      "compliance": 100,
      "scoreObtained": 30,
      "status": "Cumple",
      "statusLabel": "Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Julio",
        "numerator": 5,
        "denominator": 7,
        "result": 71.43,
        "resultFormatted": "71.43%",
        "compliance": 102,
        "status": "Cumple"
      },
      {
        "month": "Agosto",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      }
    ]
  },
  {
    "id": "ley20707-21",
    "code": "Ind Local 5",
    "rawCode": "Ind Local 5",
    "name": "Porcentaje entrega de turno médico con registro según protocolo.",
    "formula": "(Número de entregas de turno médico con registro según protocolo/ Número total de entregas de turno médico del periodo) *100",
    "dept": "UNIDAD PEDIATRICA",
    "deptInfo": {
      "id": "todas",
      "name": "UNIDAD PEDIATRICA",
      "code": "UNIDAD PEDIATRICA",
      "color": "#64748b"
    },
    "weight": "10%",
    "weightVal": 0.1,
    "target": "≥ 95%",
    "targetVal": 0.95,
    "isLessOrEqual": false,
    "referent": "Calidad",
    "summaryYTD": {
      "numerator": 54,
      "denominator": 54,
      "result": 100,
      "resultFormatted": "100.00%",
      "compliance": 100,
      "scoreObtained": 10,
      "status": "Cumple",
      "statusLabel": "Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 54,
        "denominator": 54,
        "result": 100,
        "resultFormatted": "100.00%",
        "compliance": 105.3,
        "status": "Cumple"
      },
      {
        "month": "Julio",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": 0,
        "denominator": 0,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      }
    ]
  }
];
