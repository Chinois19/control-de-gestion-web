// Dataset Oficial Metas Sanitarias Ley 19.664 (Año 2026 Formativo)
// Hospital de Villarrica - Servicio de Salud Araucanía Sur (Fuente: RESULTADO METAS 19664 2026 formativo.xlsx)

export const LEY19664_META = {
  title: "Metas Sanitarias Ley 19.664 (2026 Formativo)",
  subtitle: "Personal de Profesionales de la Salud Regidos por la Ley N° 19.664",
  hospital: "Hospital de Villarrica",
  service: "Servicio de Salud Araucanía Sur",
  year: 2026,
  sourceFile: "RESULTADO METAS 19664 2026 formativo.xlsx (resumen gonzalo)",
  totalIndicators: 6
};

export const LEY19664_INDICATORS = [
  {
    "id": "ley19664-4",
    "code": "Meta 4",
    "metaId": "4",
    "name": "Altas odontológicas de especialidad del nivel secundario por ingreso de tratamiento.",
    "formula": "(Número de altas de tratamiento odontológico de especialidades /Número de ingresos a tratamiento odontológico de especialidades) *112",
    "weight": "5%",
    "weightVal": 0.05,
    "target": "≥ 95.0%",
    "targetVal": 0.95,
    "summaryYTD": {
      "numerator": 1085,
      "denominator": 1307,
      "result": 83.01,
      "resultFormatted": "83.01%",
      "status": "No Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 253,
        "denominator": 232,
        "result": 1.09,
        "resultFormatted": "1.09",
        "status": "Cumple"
      },
      {
        "month": "Febrero",
        "numerator": 139,
        "denominator": 253,
        "result": 54.94,
        "resultFormatted": "54.94%",
        "status": "No Cumple"
      },
      {
        "month": "Marzo",
        "numerator": 180,
        "denominator": 248,
        "result": 72.58,
        "resultFormatted": "72.58%",
        "status": "No Cumple"
      },
      {
        "month": "Abril",
        "numerator": 220,
        "denominator": 173,
        "result": 1.27,
        "resultFormatted": "1.27",
        "status": "Cumple"
      },
      {
        "month": "Mayo",
        "numerator": 137,
        "denominator": 188,
        "result": 72.87,
        "resultFormatted": "72.87%",
        "status": "No Cumple"
      },
      {
        "month": "Junio",
        "numerator": 156,
        "denominator": 213,
        "result": 73.24,
        "resultFormatted": "73.24%",
        "status": "No Cumple"
      },
      {
        "month": "Julio",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      }
    ]
  },
  {
    "id": "ley19664-5",
    "code": "Meta 5",
    "metaId": "5",
    "name": "Porcentaje de pacientes con indicación de hospitalización desde UEH, que acceden a cama de dotación en menos de 12 horas. C96/C96+C97+C98+C102",
    "formula": "[(N° total de pacientes con indicación de hospitalización que espera en UEH T´< 12 horas para acceder a cama de dotación en año t / N° total de pacientes con indicación de hospitalización en UEH en año t) x 100]",
    "weight": "6%",
    "weightVal": 0.06,
    "target": "≥ 85.0%",
    "targetVal": 0.85,
    "summaryYTD": {
      "numerator": 874,
      "denominator": 1852,
      "result": 47.19,
      "resultFormatted": "47.19%",
      "status": "No Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 136,
        "denominator": 261,
        "result": 52.11,
        "resultFormatted": "52.11%",
        "status": "No Cumple"
      },
      {
        "month": "Febrero",
        "numerator": 164,
        "denominator": 260,
        "result": 63.08,
        "resultFormatted": "63.08%",
        "status": "No Cumple"
      },
      {
        "month": "Marzo",
        "numerator": 170,
        "denominator": 305,
        "result": 55.74,
        "resultFormatted": "55.74%",
        "status": "No Cumple"
      },
      {
        "month": "Abril",
        "numerator": 134,
        "denominator": 338,
        "result": 39.64,
        "resultFormatted": "39.64%",
        "status": "No Cumple"
      },
      {
        "month": "Mayo",
        "numerator": 152,
        "denominator": 346,
        "result": 43.93,
        "resultFormatted": "43.93%",
        "status": "No Cumple"
      },
      {
        "month": "Junio",
        "numerator": 118,
        "denominator": 342,
        "result": 34.5,
        "resultFormatted": "34.50%",
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
    ]
  },
  {
    "id": "ley19664-6",
    "code": "Meta 6",
    "metaId": "6",
    "name": "Reducción del porcentaje global de cesárea en relación la línea base",
    "formula": "(Número de cesáreas del periodo t / Número total de partos del periodo t)*112",
    "weight": "6%",
    "weightVal": 0.06,
    "target": "≤ 37.9%",
    "targetVal": 0.379,
    "summaryYTD": {
      "numerator": 231,
      "denominator": 493,
      "result": 46.86,
      "resultFormatted": "46.86%",
      "status": "No Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 26,
        "denominator": 68,
        "result": 38.24,
        "resultFormatted": "38.24%",
        "status": "No Cumple"
      },
      {
        "month": "Febrero",
        "numerator": 37,
        "denominator": 75,
        "result": 49.33,
        "resultFormatted": "49.33%",
        "status": "No Cumple"
      },
      {
        "month": "Marzo",
        "numerator": 39,
        "denominator": 84,
        "result": 46.43,
        "resultFormatted": "46.43%",
        "status": "No Cumple"
      },
      {
        "month": "Abril",
        "numerator": 39,
        "denominator": 93,
        "result": 41.94,
        "resultFormatted": "41.94%",
        "status": "No Cumple"
      },
      {
        "month": "Mayo",
        "numerator": 35,
        "denominator": 77,
        "result": 45.45,
        "resultFormatted": "45.45%",
        "status": "No Cumple"
      },
      {
        "month": "Junio",
        "numerator": 55,
        "denominator": 96,
        "result": 57.29,
        "resultFormatted": "57.29%",
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
    ]
  },
  {
    "id": "ley19664-7",
    "code": "Meta 7",
    "metaId": "7",
    "name": "Porcentaje de egresos con estadía prolongada (Outliers Superiores)",
    "formula": "(Número de egresos con estadías prolongadas (outliers superiores) en el periodo/ Número total de egresos codificados en el periodo) *112",
    "weight": "43%",
    "weightVal": 0.43,
    "target": "≤ 5.0% Exceso",
    "targetVal": 0.05,
    "summaryYTD": {
      "numerator": 77,
      "denominator": 3268,
      "result": 2.36,
      "resultFormatted": "2.36%",
      "status": "Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 11,
        "denominator": 534,
        "result": 2.06,
        "resultFormatted": "2.06%",
        "status": "Cumple"
      },
      {
        "month": "Febrero",
        "numerator": 14,
        "denominator": 511,
        "result": 2.74,
        "resultFormatted": "2.74%",
        "status": "Cumple"
      },
      {
        "month": "Marzo",
        "numerator": 12,
        "denominator": 603,
        "result": 1.99,
        "resultFormatted": "1.99%",
        "status": "Cumple"
      },
      {
        "month": "Abril",
        "numerator": 13,
        "denominator": 565,
        "result": 2.3,
        "resultFormatted": "2.30%",
        "status": "Cumple"
      },
      {
        "month": "Mayo",
        "numerator": 13,
        "denominator": 528,
        "result": 2.46,
        "resultFormatted": "2.46%",
        "status": "Cumple"
      },
      {
        "month": "Junio",
        "numerator": 14,
        "denominator": 527,
        "result": 2.66,
        "resultFormatted": "2.66%",
        "status": "Cumple"
      },
      {
        "month": "Julio",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      }
    ]
  },
  {
    "id": "ley19664-8",
    "code": "Meta 8",
    "metaId": "8",
    "name": "Garantías oncológicas exceptuadas transitorias acumuladas sin prestación resueltas",
    "formula": "(Número de garantías oncológicas exceptuadas transitorias acumuladas sin prestación de años 2015 al 2024 resueltas / Número total de garantías\noncológicas exceptuadas transitorias acumuladas sin prestación del período 2015 al 2024) *100.",
    "weight": "10%",
    "weightVal": 0.1,
    "target": "≥ 80.0%",
    "targetVal": 0.8,
    "summaryYTD": {
      "numerator": null,
      "denominator": null,
      "result": 100.0,
      "resultFormatted": "100.00%",
      "status": "Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Febrero",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Marzo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Abril",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Mayo",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Junio",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Julio",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Agosto",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Septiembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Octubre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Noviembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      },
      {
        "month": "Diciembre",
        "numerator": null,
        "denominator": null,
        "result": null,
        "resultFormatted": "-",
        "status": "Sin Dato"
      }
    ]
  },
  {
    "id": "ley19664-9",
    "code": "Meta 9",
    "metaId": "9",
    "name": "Porcentaje de Gestión Efectiva para el cumplimiento Ges en la Red",
    "formula": "((Garantías Cumplidas + Garantías Exceptuadas + Garantías Incumplidas Atendidas) en el año t / (Garantías Cumplidas + Garantías Exceptuadas + Garantías Incumplidas Atendidas + Garantías Incumplidas No Atendidas) en el año t + Garantías Retrasadas acumuladas)) x 112",
    "weight": "6%",
    "weightVal": 0.06,
    "target": "100.0%",
    "targetVal": 1.0,
    "summaryYTD": {
      "numerator": 6399,
      "denominator": 6979,
      "result": 91.69,
      "resultFormatted": "91.69%",
      "status": "No Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 2259,
        "denominator": 2377,
        "result": 95.04,
        "resultFormatted": "95.04%",
        "status": "No Cumple"
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
    ]
  }
];
