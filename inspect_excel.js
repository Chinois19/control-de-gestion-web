import XLSX from 'xlsx';
import fs from 'fs';

const workbook = XLSX.readFile('G:\\Unidades compartidas\\ASUR\\Acuerdo programacion 2026 ok.xlsx');
const sheet = workbook.Sheets['Hoja1'];
const rawData = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: "" });

console.log("Total rows:", rawData.length);
console.log("Headers:", Object.keys(rawData[0] || {}));

// Save the full JSON so we can load it or read it easily
fs.writeFileSync('public/data/acuerdo_minsal_hoja1.json', JSON.stringify(rawData, null, 2));
console.log("Saved JSON to public/data/acuerdo_minsal_hoja1.json");

// Format and print all rows to the console
console.table(rawData.map(row => ({
  Mes: row[" Mes "] || row["Mes"] || "",
  AcuerdoEgresos: row[" Acuerdo Egresos "] || "",
  Egresos2026: row[" Egresos 2026 "] || "",
  Peso2026: row[" Peso 2026 "] || "",
  AcuerdoCMA: row[" Acuerdo CMA "] || "",
  CMAPeso: row[" Acuerdo Peso GRD CMA "] || "",
  CMA2026: row[" CMA 2026 "] || "",
  MontoEgresos: row[" Monto Egresos "] || "",
  IndiceFuncional: row["1. Indice Funcional"] || "",
  IEMA: row["2. IEMA"] || "",
  Impacto: row["3. Impacto"] || "",
  GesCumpl: row["6.1 % Cumplimiento GES"] || "",
  SuspQca: row["8. % SUSPENSION QCA"] || "",
  MedianaIQ: row["9. MEDIANA IQ"] || "",
  MedianaCNE: row["10. MEDIANA CNE"] || "",
  RegistrosGes: row["11. Registros GES"] || ""
})));
