// Dataset Oficial Metas Sanitarias Ley 19.664 (Año 2026 Formativo)
// Hospital de Villarrica - Servicio de Salud Araucanía Sur (Fuente: RESULTADO METAS 19664 2026 formativo.xlsx)

export const LEY19664_META = {
  title: "Metas Sanitarias Ley 19.664 (2026 Formativo)",
  subtitle: "Personal de Profesionales de la Salud Regidos por la Ley N° 19.664",
  hospital: "Hospital de Villarrica",
  service: "Servicio de Salud Araucanía Sur",
  year: 2026,
  sourceFile: "RESULTADO METAS 19664 2026 formativo.xlsx (resumen gonzalo)",
  lastUpdatedMonth: "Julio / Agosto",
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
      "numerator": 1253,
      "denominator": 1470,
      "result": 85.24,
      "resultFormatted": "85.24%",
      "status": "No Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 253,
        "denominator": 232,
        "result": 109.05,
        "resultFormatted": "109.05%",
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
        "result": 127.17,
        "resultFormatted": "127.17%",
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
        "numerator": 168,
        "denominator": 163,
        "result": 103.07,
        "resultFormatted": "103.07%",
        "status": "Cumple"
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
    "formula": "(Número total de pacientes con indicación de hospitalización que espera en UEH en un tiempo menor a 12 horas para acceder a cama de dotación / Número total de pacientes con indicación de hospitalización en UEH) x 100",
    "weight": "10%",
    "weightVal": 0.1,
    "target": "≥ 85.0%",
    "targetVal": 0.85,
    "summaryYTD": {
      "numerator": 955,
      "denominator": 2154,
      "result": 44.34,
      "resultFormatted": "44.34%",
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
        "denominator": 343,
        "result": 34.4,
        "resultFormatted": "34.40%",
        "status": "No Cumple"
      },
      {
        "month": "Julio",
        "numerator": 81,
        "denominator": 301,
        "result": 26.91,
        "resultFormatted": "26.91%",
        "status": "No Cumple"
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
    "formula": "((Número total de partos por cesárea en el establecimiento año t / Número total de partos en el establecimiento año t) / (Número total de partos por cesárea en el establecimiento año t-1 / Número total de partos en el establecimiento año t-1)) * 100",
    "weight": "35%",
    "weightVal": 0.35,
    "target": "≤ 30.0%",
    "targetVal": 0.3,
    "summaryYTD": {
      "numerator": 219,
      "denominator": 381,
      "result": 57.48,
      "resultFormatted": "57.48%",
      "status": "No Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 219,
        "denominator": 381,
        "result": 57.48,
        "resultFormatted": "57.48%",
        "status": "No Cumple"
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
        "numerator": 219,
        "denominator": 381,
        "result": 57.48,
        "resultFormatted": "57.48%",
        "status": "No Cumple"
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
    "id": "ley19664-7",
    "code": "Meta 7",
    "metaId": "7",
    "name": "Porcentaje de egresos con estadía prolongada (Outliers Superiores)",
    "formula": "(Número de egresos con estadía prolongada (outliers superiores) en el año t / Número total de egresos en el año t) * 100",
    "weight": "20%",
    "weightVal": 0.2,
    "target": "≤ 3.0%",
    "targetVal": 0.03,
    "summaryYTD": {
      "numerator": 1422,
      "denominator": 1938,
      "result": 73.37,
      "resultFormatted": "73.37%",
      "status": "No Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 1422,
        "denominator": 1938,
        "result": 73.37,
        "resultFormatted": "73.37%",
        "status": "No Cumple"
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
        "numerator": 1422,
        "denominator": 1938,
        "result": 73.37,
        "resultFormatted": "73.37%",
        "status": "No Cumple"
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
    "metaId": "11",
    "name": "Garantías oncológicas exceptuadas transitorias acumuladas sin prestación resueltas",
    "formula": "(Número de garantías oncológicas exceptuadas transitorias acumuladas sin prestación de años 2015 al 2024 resueltas / Número total de garantías oncológicas exceptuadas transitorias acumuladas sin prestación del período 2015 al 2024) *100",
    "weight": "20%",
    "weightVal": 0.2,
    "target": "≥ 100.0%",
    "targetVal": 1,
    "summaryYTD": {
      "numerator": null,
      "denominator": null,
      "result": 100,
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
    "metaId": "12",
    "name": "Porcentaje de Gestión Efectiva para el cumplimiento Ges en la Red",
    "formula": "((Garantías Cumplidas + Garantías Exceptuadas + Garantías Incumplidas Atendidas) en el año t / (Garantías Cumplidas + Garantías Exceptuadas + Garantías Incumplidas Atendidas + Garantías Incumplidas No Atendidas) en el año t + Garantías Retrasadas acumuladas)) x 100",
    "weight": "10%",
    "weightVal": 0.1,
    "target": "≥ 99.5%",
    "targetVal": 0.995,
    "summaryYTD": {
      "numerator": 7628,
      "denominator": 8345,
      "result": 91.41,
      "resultFormatted": "91.41%",
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
        "numerator": 7628,
        "denominator": 8345,
        "result": 91.41,
        "resultFormatted": "91.41%",
        "status": "No Cumple"
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
