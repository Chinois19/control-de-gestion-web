// Dataset Oficial Metas Sanitarias Ley 20.707 (Formulación MS 20707-2026)
// Hospital de Villarrica - Año 2026 (Excluyendo filas separadoras de unidades 'Todos')

export const LEY20707_META = {
  title: "Metas Sanitarias Ley 20.707 (2026)",
  subtitle: "Profesionales Médicos, Cirujano-Dentistas, Químico-Farmacéuticos y Bioquímicos",
  hospital: "Hospital de Villarrica",
  service: "Servicio de Salud Araucanía Sur",
  year: 2026,
  sourceFile: "Formulación-MS 20707-2026.xlsx (Junio 2026)",
  totalIndicators: 21
};

export const LEY20707_UNITS = [
  { id: "todas", name: "Todas las Unidades Clínicas", code: "TODAS", color: "#0f172a" },
  { id: "ueh", name: "Unidad de Emergencia Hospitalaria (UEH)", code: "UEH", color: "#ef4444" },
  { id: "pabellon", name: "Unidad de Pabellón y Recuperación", code: "PABELLÓN", color: "#3b82f6" },
  { id: "pediatria", name: "Unidad Pediátrica y Neonatología", code: "PEDIATRÍA", color: "#10b981" },
  { id: "upc", name: "Unidad de Paciente Crítico (UPC)", code: "UPC", color: "#8b5cf6" },
  { id: "ginecologia", name: "Unidad de Ginecología y Obstetricia", code: "GIN-OBS", color: "#ec4899" }
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
    "referent": "Control de Gestión",
    "summaryYTD": {
      "numerator": 1670,
      "denominator": 1717,
      "result": 97.26,
      "resultFormatted": "97.26%",
      "compliance": 100.0,
      "status": "Cumple",
      "statusLabel": "Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 342,
        "denominator": 350,
        "result": 97.71,
        "resultFormatted": "97.71%",
        "compliance": 100.0,
        "status": "Cumple"
      },
      {
        "month": "Febrero",
        "numerator": 332,
        "denominator": 342,
        "result": 97.08,
        "resultFormatted": "97.08%",
        "compliance": 100.0,
        "status": "Cumple"
      },
      {
        "month": "Marzo",
        "numerator": 338,
        "denominator": 344,
        "result": 98.26,
        "resultFormatted": "98.26%",
        "compliance": 100.0,
        "status": "Cumple"
      },
      {
        "month": "Abril",
        "numerator": 327,
        "denominator": 345,
        "result": 94.78,
        "resultFormatted": "94.78%",
        "compliance": 100.0,
        "status": "Cumple"
      },
      {
        "month": "Mayo",
        "numerator": 291,
        "denominator": 301,
        "result": 96.68,
        "resultFormatted": "96.68%",
        "compliance": 100.0,
        "status": "Cumple"
      },
      {
        "month": "Junio",
        "numerator": 281,
        "denominator": 291,
        "result": 96.56,
        "resultFormatted": "96.56%",
        "compliance": 100.0,
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
    "referent": "Control de Gestión",
    "summaryYTD": {
      "numerator": 641,
      "denominator": 1715,
      "result": 37.38,
      "resultFormatted": "37.38%",
      "compliance": 0.0,
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
        "compliance": 74.21,
        "status": "No Cumple"
      },
      {
        "month": "Marzo",
        "numerator": 170,
        "denominator": 305,
        "result": 55.74,
        "resultFormatted": "55.74%",
        "compliance": 65.57,
        "status": "No Cumple"
      },
      {
        "month": "Abril",
        "numerator": 134,
        "denominator": 338,
        "result": 39.64,
        "resultFormatted": "39.64%",
        "compliance": 46.64,
        "status": "No Cumple"
      },
      {
        "month": "Mayo",
        "numerator": 152,
        "denominator": 346,
        "result": 43.93,
        "resultFormatted": "43.93%",
        "compliance": 51.68,
        "status": "No Cumple"
      },
      {
        "month": "Junio",
        "numerator": 118,
        "denominator": 342,
        "result": 34.5,
        "resultFormatted": "34.50%",
        "compliance": 0.0,
        "status": "No Cumple"
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
    "referent": "Capacitación",
    "summaryYTD": {
      "numerator": 15,
      "denominator": 22,
      "result": 68.18,
      "resultFormatted": "68.18%",
      "compliance": 100.0,
      "status": "Cumple",
      "statusLabel": "Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 15,
        "denominator": 22,
        "result": 68.18,
        "resultFormatted": "68.18%",
        "compliance": 100.0,
        "status": "Cumple"
      },
      {
        "month": "Julio",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": null,
        "denominator": null,
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
    "target": "70%",
    "targetVal": "70%",
    "referent": "Capacitación",
    "summaryYTD": {
      "numerator": 19,
      "denominator": 22,
      "result": 86.36,
      "resultFormatted": "86.36%",
      "compliance": 100.0,
      "status": "Cumple",
      "statusLabel": "Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 19,
        "denominator": 22,
        "result": 86.36,
        "resultFormatted": "86.36%",
        "compliance": 100.0,
        "status": "Cumple"
      },
      {
        "month": "Julio",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": null,
        "denominator": null,
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
      "id": "ginecologia",
      "name": "Unidad de Ginecología y Obstetricia",
      "code": "GIN-OBS",
      "color": "#ec4899"
    },
    "weight": "30%",
    "weightVal": 0.3,
    "target": "≥ 80%",
    "targetVal": 0.8,
    "referent": "Calidad",
    "summaryYTD": {
      "numerator": 1989,
      "denominator": 857,
      "result": 70.36,
      "resultFormatted": "70.36%",
      "compliance": 100.0,
      "status": "Cumple",
      "statusLabel": "Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 356,
        "denominator": 148,
        "result": 70.63,
        "resultFormatted": "70.63%",
        "compliance": 100.0,
        "status": "Cumple"
      },
      {
        "month": "Julio",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": null,
        "denominator": null,
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
      "id": "ginecologia",
      "name": "Unidad de Ginecología y Obstetricia",
      "code": "GIN-OBS",
      "color": "#ec4899"
    },
    "weight": "30%",
    "weightVal": 0.3,
    "target": "60%",
    "targetVal": "60%",
    "referent": "Capacitación",
    "summaryYTD": {
      "numerator": 131,
      "denominator": 1861,
      "result": 7.04,
      "resultFormatted": "7.04%",
      "compliance": 0.0,
      "status": "No Cumple",
      "statusLabel": "No Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 26,
        "denominator": 318,
        "result": 8.18,
        "resultFormatted": "8.18%",
        "compliance": 0.0,
        "status": "No Cumple"
      },
      {
        "month": "Julio",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": null,
        "denominator": null,
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
      "id": "ginecologia",
      "name": "Unidad de Ginecología y Obstetricia",
      "code": "GIN-OBS",
      "color": "#ec4899"
    },
    "weight": "30%",
    "weightVal": 0.3,
    "target": "70%",
    "targetVal": "70%",
    "referent": "Capacitación",
    "summaryYTD": {
      "numerator": 15,
      "denominator": 23,
      "result": 65.22,
      "resultFormatted": "65.22%",
      "compliance": 100.0,
      "status": "Cumple",
      "statusLabel": "Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 15,
        "denominator": 23,
        "result": 65.22,
        "resultFormatted": "65.22%",
        "compliance": 100.0,
        "status": "Cumple"
      },
      {
        "month": "Julio",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": null,
        "denominator": null,
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
      "id": "ginecologia",
      "name": "Unidad de Ginecología y Obstetricia",
      "code": "GIN-OBS",
      "color": "#ec4899"
    },
    "weight": "10%",
    "weightVal": 0.1,
    "target": "≥ 95%",
    "targetVal": 0.95,
    "referent": "Calidad",
    "summaryYTD": {
      "numerator": 18,
      "denominator": 23,
      "result": 78.26,
      "resultFormatted": "78.26%",
      "compliance": 100.0,
      "status": "Cumple",
      "statusLabel": "Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 18,
        "denominator": 23,
        "result": 78.26,
        "resultFormatted": "78.26%",
        "compliance": 100.0,
        "status": "Cumple"
      },
      {
        "month": "Julio",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": null,
        "denominator": null,
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
      "id": "pabellon",
      "name": "Unidad de Pabellón y Recuperación",
      "code": "PABELLÓN",
      "color": "#3b82f6"
    },
    "weight": "20%",
    "weightVal": 0.2,
    "target": "60%",
    "targetVal": "60%",
    "referent": "Capacitación",
    "summaryYTD": {
      "numerator": 4,
      "denominator": 6,
      "result": 66.67,
      "resultFormatted": "66.67%",
      "compliance": 100.0,
      "status": "Cumple",
      "statusLabel": "Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 4,
        "denominator": 6,
        "result": 66.67,
        "resultFormatted": "66.67%",
        "compliance": 100.0,
        "status": "Cumple"
      },
      {
        "month": "Julio",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": null,
        "denominator": null,
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
      "id": "pabellon",
      "name": "Unidad de Pabellón y Recuperación",
      "code": "PABELLÓN",
      "color": "#3b82f6"
    },
    "weight": "30%",
    "weightVal": 0.3,
    "target": "70%",
    "targetVal": "70%",
    "referent": "Capacitación",
    "summaryYTD": {
      "numerator": 5,
      "denominator": 6,
      "result": 83.33,
      "resultFormatted": "83.33%",
      "compliance": 100.0,
      "status": "Cumple",
      "statusLabel": "Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 5,
        "denominator": 6,
        "result": 83.33,
        "resultFormatted": "83.33%",
        "compliance": 100.0,
        "status": "Cumple"
      },
      {
        "month": "Julio",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": null,
        "denominator": null,
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
      "id": "pabellon",
      "name": "Unidad de Pabellón y Recuperación",
      "code": "PABELLÓN",
      "color": "#3b82f6"
    },
    "weight": "25%",
    "weightVal": 0.25,
    "target": "≥ 65%",
    "targetVal": 0.65,
    "referent": "Control de Gestión",
    "summaryYTD": {
      "numerator": 3,
      "denominator": 6,
      "result": 50.0,
      "resultFormatted": "50.00%",
      "compliance": 0.0,
      "status": "No Cumple",
      "statusLabel": "No Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 315,
        "denominator": 122,
        "result": 72.08,
        "resultFormatted": "72.08%",
        "compliance": 100.0,
        "status": "Cumple"
      },
      {
        "month": "Febrero",
        "numerator": 257,
        "denominator": 143,
        "result": 64.25,
        "resultFormatted": "64.25%",
        "compliance": 98.85,
        "status": "No Cumple"
      },
      {
        "month": "Marzo",
        "numerator": 313,
        "denominator": 158,
        "result": 66.45,
        "resultFormatted": "66.45%",
        "compliance": 100.0,
        "status": "Cumple"
      },
      {
        "month": "Abril",
        "numerator": 354,
        "denominator": 139,
        "result": 71.81,
        "resultFormatted": "71.81%",
        "compliance": 100.0,
        "status": "Cumple"
      },
      {
        "month": "Mayo",
        "numerator": 395,
        "denominator": 147,
        "result": 72.88,
        "resultFormatted": "72.88%",
        "compliance": 100.0,
        "status": "Cumple"
      },
      {
        "month": "Junio",
        "numerator": 3,
        "denominator": 6,
        "result": 50.0,
        "resultFormatted": "50.00%",
        "compliance": 0.0,
        "status": "No Cumple"
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
    "id": "ley20707-12",
    "code": "Ind Local 2",
    "rawCode": "Ind Local 2",
    "name": "Suspensiones quirúrgicas en cirugías Electivas",
    "formula": "(N° de cirugías mayores electivas suspendidas / N° de cirugías mayores electivas programadas) * 100",
    "dept": "UNIDAD DE PABELLON Y RECUPERACION",
    "deptInfo": {
      "id": "pabellon",
      "name": "Unidad de Pabellón y Recuperación",
      "code": "PABELLÓN",
      "color": "#3b82f6"
    },
    "weight": "25%",
    "weightVal": 0.25,
    "target": "≤ 6.5%",
    "targetVal": 0.065,
    "referent": "Control de Gestión",
    "summaryYTD": {
      "numerator": 131,
      "denominator": 1853,
      "result": 7.07,
      "resultFormatted": "7.07%",
      "compliance": 91.94,
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
        "compliance": 100.0,
        "status": "Cumple"
      },
      {
        "month": "Febrero",
        "numerator": 18,
        "denominator": 284,
        "result": 6.34,
        "resultFormatted": "6.34%",
        "compliance": 100.0,
        "status": "Cumple"
      },
      {
        "month": "Marzo",
        "numerator": 25,
        "denominator": 292,
        "result": 8.56,
        "resultFormatted": "8.56%",
        "compliance": 75.92,
        "status": "No Cumple"
      },
      {
        "month": "Abril",
        "numerator": 28,
        "denominator": 331,
        "result": 8.46,
        "resultFormatted": "8.46%",
        "compliance": 76.84,
        "status": "No Cumple"
      },
      {
        "month": "Mayo",
        "numerator": 16,
        "denominator": 310,
        "result": 5.16,
        "resultFormatted": "5.16%",
        "compliance": 100.0,
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
    "id": "ley20707-13",
    "code": "Meta 2",
    "rawCode": "2",
    "name": "Potenciales Donantes de Órganos para Trasplantes (Muerte encefálica certificada)",
    "formula": "(Número de potenciales donantes entre 6 meses y 78 años registrados en SIDOT / Número de egresos fallecidos por causa neurológica, según CIE -10, entre 6 meses y 78 años reportados por GRD y registrados en SIDOT) x 100",
    "dept": "UNIDAD DE PACIENTE CRITICO",
    "deptInfo": {
      "id": "upc",
      "name": "Unidad de Paciente Crítico (UPC Adulto)",
      "code": "UPC",
      "color": "#8b5cf6"
    },
    "weight": "10%",
    "weightVal": 0.1,
    "target": "Por definir / Pauta",
    "targetVal": null,
    "referent": "Referente ss",
    "summaryYTD": {
      "numerator": 0,
      "denominator": 0,
      "result": null,
      "resultFormatted": "-",
      "compliance": null,
      "status": "Sin Dato",
      "statusLabel": "Evaluación Semestral / En Proceso"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Julio",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": null,
        "denominator": null,
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
      "id": "upc",
      "name": "Unidad de Paciente Crítico (UPC Adulto)",
      "code": "UPC",
      "color": "#8b5cf6"
    },
    "weight": "10%",
    "weightVal": 0.1,
    "target": "≥ 85%",
    "targetVal": 0.85,
    "referent": "Calidad",
    "summaryYTD": {
      "numerator": 8,
      "denominator": 12,
      "result": 66.67,
      "resultFormatted": "66.67%",
      "compliance": 100.0,
      "status": "Cumple",
      "statusLabel": "Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 8,
        "denominator": 12,
        "result": 66.67,
        "resultFormatted": "66.67%",
        "compliance": 100.0,
        "status": "Cumple"
      },
      {
        "month": "Julio",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": null,
        "denominator": null,
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
      "id": "upc",
      "name": "Unidad de Paciente Crítico (UPC Adulto)",
      "code": "UPC",
      "color": "#8b5cf6"
    },
    "weight": "30%",
    "weightVal": 0.3,
    "target": "60%",
    "targetVal": "60%",
    "referent": "Capacitación",
    "summaryYTD": {
      "numerator": 6,
      "denominator": 12,
      "result": 50.0,
      "resultFormatted": "50.00%",
      "compliance": 0.0,
      "status": "No Cumple",
      "statusLabel": "No Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 6,
        "denominator": 12,
        "result": 50.0,
        "resultFormatted": "50.00%",
        "compliance": 0.0,
        "status": "No Cumple"
      },
      {
        "month": "Julio",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": null,
        "denominator": null,
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
      "id": "upc",
      "name": "Unidad de Paciente Crítico (UPC Adulto)",
      "code": "UPC",
      "color": "#8b5cf6"
    },
    "weight": "30%",
    "weightVal": 0.3,
    "target": "70%",
    "targetVal": "70%",
    "referent": "Capacitación",
    "summaryYTD": {
      "numerator": 0,
      "denominator": 0,
      "result": null,
      "resultFormatted": "-",
      "compliance": null,
      "status": "Sin Dato",
      "statusLabel": "Evaluación Semestral / En Proceso"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Julio",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": null,
        "denominator": null,
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
      "id": "upc",
      "name": "Unidad de Paciente Crítico (UPC Adulto)",
      "code": "UPC",
      "color": "#8b5cf6"
    },
    "weight": "20%",
    "weightVal": 0.2,
    "target": "≥ 90%",
    "targetVal": 0.9,
    "referent": "Calidad",
    "summaryYTD": {
      "numerator": 0,
      "denominator": 0,
      "result": null,
      "resultFormatted": "-",
      "compliance": null,
      "status": "Sin Dato",
      "statusLabel": "Evaluación Semestral / En Proceso"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Julio",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": null,
        "denominator": null,
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
      "id": "pediatria",
      "name": "Unidad Pediátrica y Neonatología",
      "code": "PEDIATRÍA",
      "color": "#10b981"
    },
    "weight": "30%",
    "weightVal": 0.3,
    "target": "60%",
    "targetVal": "60%",
    "referent": "Capacitación",
    "summaryYTD": {
      "numerator": 0,
      "denominator": 0,
      "result": null,
      "resultFormatted": "-",
      "compliance": null,
      "status": "Sin Dato",
      "statusLabel": "Evaluación Semestral / En Proceso"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Julio",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": null,
        "denominator": null,
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
      "id": "pediatria",
      "name": "Unidad Pediátrica y Neonatología",
      "code": "PEDIATRÍA",
      "color": "#10b981"
    },
    "weight": "30%",
    "weightVal": 0.3,
    "target": "70%",
    "targetVal": "70%",
    "referent": "Capacitación",
    "summaryYTD": {
      "numerator": 11,
      "denominator": 15,
      "result": 73.33,
      "resultFormatted": "73.33%",
      "compliance": 100.0,
      "status": "Cumple",
      "statusLabel": "Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 11,
        "denominator": 15,
        "result": 73.33,
        "resultFormatted": "73.33%",
        "compliance": 100.0,
        "status": "Cumple"
      },
      {
        "month": "Julio",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": null,
        "denominator": null,
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
      "id": "pediatria",
      "name": "Unidad Pediátrica y Neonatología",
      "code": "PEDIATRÍA",
      "color": "#10b981"
    },
    "weight": "30%",
    "weightVal": 0.3,
    "target": "≥ 70%",
    "targetVal": 0.7,
    "referent": "Capacitación",
    "summaryYTD": {
      "numerator": 13,
      "denominator": 15,
      "result": 86.67,
      "resultFormatted": "86.67%",
      "compliance": 100.0,
      "status": "Cumple",
      "statusLabel": "Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": 13,
        "denominator": 15,
        "result": 86.67,
        "resultFormatted": "86.67%",
        "compliance": 100.0,
        "status": "Cumple"
      },
      {
        "month": "Julio",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": null,
        "denominator": null,
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
      "id": "pediatria",
      "name": "Unidad Pediátrica y Neonatología",
      "code": "PEDIATRÍA",
      "color": "#10b981"
    },
    "weight": "10%",
    "weightVal": 0.1,
    "target": "≥ 95%",
    "targetVal": 0.95,
    "referent": "Calidad",
    "summaryYTD": {
      "numerator": 0,
      "denominator": 0,
      "result": null,
      "resultFormatted": "-",
      "compliance": null,
      "status": "Sin Dato",
      "statusLabel": "Evaluación Semestral / En Proceso"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Julio",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "compliance": null,
        "status": "Sin Dato"
      }
    ]
  }
];
