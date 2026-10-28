// Dataset Oficial Metas Sanitarias Ley 19.664 (Año 2026 Formativo)
// Hospital de Villarrica - Servicio de Salud Araucanía Sur (Fuente: RESULTADO METAS 19664 2026 formativo.xlsx)

export const LEY19664_META = {
  "title": "Metas Sanitarias Ley 19.664 (2026 Formativo)",
  "subtitle": "Personal de Profesionales de la Salud Regidos por la Ley N° 19.664",
  "hospital": "Hospital de Villarrica",
  "service": "Servicio de Salud Araucanía Sur",
  "year": 2026,
  "sourceFile": "RESULTADO METAS 19664 2026 formativo.xlsx (resumen gonzalo)",
  "lastUpdatedMonth": "Septiembre",
  "totalIndicators": 9,
  "totalScore": 37.01
};

export const LEY19664_INDICATORS = [
  {
    "id": "ley19664-4",
    "code": "Meta 4",
    "metaId": "4",
    "name": "Altas odontológicas de especialidad del nivel secundario por ingreso de tratamiento.",
    "formula": "(Número de altas de tratamiento odontológico de especialidades / Número de ingresos a tratamiento odontológico de especialidades) * 100",
    "weight": "5%",
    "weightVal": 0.05,
    "target": "≥ 90.0%",
    "targetVal": 0.9,
    "isLessOrEqual": false,
    "isDays": false,
    "summaryYTD": {
      "numerator": 1452,
      "denominator": 1697,
      "result": 85.56,
      "resultFormatted": "85.56%",
      "compliance": 95.07,
      "scoreObtained": 4.75,
      "status": "Cumple Parcial"
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
        "numerator": 199,
        "denominator": 227,
        "result": 87.67,
        "resultFormatted": "87.67%",
        "status": "No Cumple"
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
    "weight": "6%",
    "weightVal": 0.06,
    "target": "≥ 85.0%",
    "targetVal": 0.85,
    "isLessOrEqual": false,
    "isDays": false,
    "summaryYTD": {
      "numerator": 1188,
      "denominator": 2794,
      "result": 42.52,
      "resultFormatted": "42.52%",
      "compliance": 50.02,
      "scoreObtained": 0,
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
        "denominator": 347,
        "result": 43.8,
        "resultFormatted": "43.80%",
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
        "denominator": 292,
        "result": 27.74,
        "resultFormatted": "27.74%",
        "status": "No Cumple"
      },
      {
        "month": "Agosto",
        "numerator": 118,
        "denominator": 335,
        "result": 35.22,
        "resultFormatted": "35.22%",
        "status": "No Cumple"
      },
      {
        "month": "Septiembre",
        "numerator": 115,
        "denominator": 313,
        "result": 36.74,
        "resultFormatted": "36.74%",
        "status": "No Cumple"
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
    "id": "ley19664-6",
    "code": "Meta 6",
    "metaId": "6",
    "name": "Disminución de los casos en Lista de espera con antigüedad sobre el percentil 75, para intervenciones quirúrgicas (IQ) electivas mayores y menores",
    "formula": "(Casos egresados de Lista de Espera IQ sobre P75 / Línea base de casos en Lista de Espera IQ sobre P75) x 100",
    "weight": "15%",
    "weightVal": 0.15,
    "target": "≥ 80.0%",
    "targetVal": 0.8,
    "isLessOrEqual": false,
    "isDays": false,
    "summaryYTD": {
      "numerator": 376,
      "denominator": 670,
      "result": 56.12,
      "resultFormatted": "56.12%",
      "compliance": 70.15,
      "scoreObtained": 0,
      "status": "No Cumple"
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
        "numerator": 300,
        "denominator": 670,
        "result": 44.78,
        "resultFormatted": "44.78%",
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
        "numerator": 376,
        "denominator": 670,
        "result": 56.12,
        "resultFormatted": "56.12%",
        "status": "No Cumple"
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
    "name": "Disminución de los casos en Lista de espera con antigüedad sobre el percentil 75, para Consulta Nueva de Especialidad Médica",
    "formula": "(Casos egresados de Lista de Espera CNE Médica sobre P75 / Línea base de casos en Lista de Espera CNE Médica sobre P75) x 100",
    "weight": "16%",
    "weightVal": 0.16,
    "target": "≥ 95.8%",
    "targetVal": 0.9576,
    "isLessOrEqual": false,
    "isDays": false,
    "summaryYTD": {
      "numerator": 1422,
      "denominator": 1938,
      "result": 73.37,
      "resultFormatted": "73.37%",
      "compliance": 76.62,
      "scoreObtained": 12.26,
      "status": "Cumple Parcial"
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
        "numerator": 1422,
        "denominator": 1938,
        "result": 73.37,
        "resultFormatted": "73.37%",
        "status": "No Cumple"
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
    "name": "Disminución de los casos en Lista de espera con antigüedad sobre el percentil 75, para Consulta Nueva de Especialidad Odontológica",
    "formula": "(Casos egresados de Lista de Espera CNE Odontológica sobre P75 / Línea base de casos en Lista de Espera CNE Odontológica sobre P75) x 100",
    "weight": "20%",
    "weightVal": 0.2,
    "target": "≥ 80.0%",
    "targetVal": 0.8,
    "isLessOrEqual": false,
    "isDays": false,
    "summaryYTD": {
      "numerator": 947,
      "denominator": 1651,
      "result": 57.36,
      "resultFormatted": "57.36%",
      "compliance": 71.7,
      "scoreObtained": 0,
      "status": "No Cumple"
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
        "numerator": 947,
        "denominator": 1651,
        "result": 57.36,
        "resultFormatted": "57.36%",
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
    "id": "ley19664-9",
    "code": "Meta 9",
    "metaId": "9",
    "name": "Reducción del porcentaje global de cesárea en relación a la línea base",
    "formula": "(Número total de partos por cesárea en el establecimiento año t / Número total de partos en el establecimiento año t) * 100",
    "weight": "6%",
    "weightVal": 0.06,
    "target": "≤ 39.3%",
    "targetVal": 0.393,
    "isLessOrEqual": true,
    "isDays": false,
    "summaryYTD": {
      "numerator": 345,
      "denominator": 737,
      "result": 46.81,
      "resultFormatted": "46.81%",
      "compliance": -120.28,
      "scoreObtained": 0,
      "status": "No Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 26,
        "denominator": 68,
        "result": 38.24,
        "resultFormatted": "38.24%",
        "status": "Cumple"
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
        "numerator": 42,
        "denominator": 81,
        "result": 51.85,
        "resultFormatted": "51.85%",
        "status": "No Cumple"
      },
      {
        "month": "Agosto",
        "numerator": 28,
        "denominator": 62,
        "result": 45.16,
        "resultFormatted": "45.16%",
        "status": "No Cumple"
      },
      {
        "month": "Septiembre",
        "numerator": 44,
        "denominator": 101,
        "result": 43.56,
        "resultFormatted": "43.56%",
        "status": "No Cumple"
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
    "id": "ley19664-10",
    "code": "Meta 10",
    "metaId": "10",
    "name": "Disminución del exceso de días de estancias asociados a egresos con estancias prolongadas (outliers superiores)",
    "formula": "Sumatoria de días de exceso de estancia asociados a egresos con estancias prolongadas (outliers superiores) respecto a Línea Base 2025 (893 días, meta ≤ 849 días)",
    "weight": "6%",
    "weightVal": 0.06,
    "target": "≤ 849 días (-5% LB)",
    "targetVal": 849,
    "isLessOrEqual": true,
    "isDays": true,
    "summaryYTD": {
      "numerator": 991,
      "denominator": 893,
      "result": 991,
      "resultFormatted": "991 días",
      "compliance": -4454.55,
      "scoreObtained": 0,
      "status": "No Cumple"
    },
    "monthlyData": [
      {
        "month": "Enero",
        "numerator": 140,
        "denominator": 893,
        "result": 140,
        "resultFormatted": "140 días",
        "status": "No Cumple"
      },
      {
        "month": "Febrero",
        "numerator": 214,
        "denominator": 893,
        "result": 214,
        "resultFormatted": "214 días",
        "status": "No Cumple"
      },
      {
        "month": "Marzo",
        "numerator": 50,
        "denominator": 893,
        "result": 50,
        "resultFormatted": "50 días",
        "status": "Cumple"
      },
      {
        "month": "Abril",
        "numerator": 153,
        "denominator": 893,
        "result": 153,
        "resultFormatted": "153 días",
        "status": "No Cumple"
      },
      {
        "month": "Mayo",
        "numerator": 78,
        "denominator": 893,
        "result": 78,
        "resultFormatted": "78 días",
        "status": "No Cumple"
      },
      {
        "month": "Junio",
        "numerator": 124,
        "denominator": 893,
        "result": 124,
        "resultFormatted": "124 días",
        "status": "No Cumple"
      },
      {
        "month": "Julio",
        "numerator": 91,
        "denominator": 893,
        "result": 91,
        "resultFormatted": "91 días",
        "status": "No Cumple"
      },
      {
        "month": "Agosto",
        "numerator": 141,
        "denominator": 893,
        "result": 141,
        "resultFormatted": "141 días",
        "status": "No Cumple"
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
    "id": "ley19664-11",
    "code": "Meta 11",
    "metaId": "11",
    "name": "Garantías oncológicas exceptuadas transitorias acumuladas sin prestación resueltas",
    "formula": "(Número de garantías oncológicas exceptuadas transitorias acumuladas sin prestación de años 2015 al 2024 resueltas / Número total de garantías oncológicas exceptuadas transitorias acumuladas sin prestación del período 2015 al 2024) * 100",
    "weight": "20%",
    "weightVal": 0.2,
    "target": "≥ 80.0%",
    "targetVal": 0.8,
    "isLessOrEqual": false,
    "isDays": false,
    "summaryYTD": {
      "numerator": 3,
      "denominator": 3,
      "result": 100,
      "resultFormatted": "100.00%",
      "compliance": 100,
      "scoreObtained": 20,
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
        "numerator": 3,
        "denominator": 3,
        "result": 100,
        "resultFormatted": "100.00%",
        "status": "Cumple"
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
    "id": "ley19664-12",
    "code": "Meta 12",
    "metaId": "12",
    "name": "Porcentaje de Gestión Efectiva para el cumplimiento GES en la Red",
    "formula": "((Garantías Cumplidas + Garantías Exceptuadas + Garantías Incumplidas Atendidas) en el año t / ((Garantías Cumplidas + Garantías Exceptuadas + Garantías Incumplidas Atendidas + Garantías Incumplidas No Atendidas) en el año t + Garantías Retrasadas acumuladas)) x 100",
    "weight": "6%",
    "weightVal": 0.06,
    "target": "≥ 99.5%",
    "targetVal": 0.995,
    "isLessOrEqual": false,
    "isDays": false,
    "summaryYTD": {
      "numerator": 9817,
      "denominator": 10487,
      "result": 93.61,
      "resultFormatted": "93.61%",
      "compliance": 93.61,
      "scoreObtained": 0,
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
        "numerator": 8731,
        "denominator": 9446,
        "result": 92.43,
        "resultFormatted": "92.43%",
        "status": "No Cumple"
      },
      {
        "month": "Septiembre",
        "numerator": 9817,
        "denominator": 10487,
        "result": 93.61,
        "resultFormatted": "93.61%",
        "status": "No Cumple"
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
  }
];
