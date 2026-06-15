import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const excelPath = 'G:\\Unidades compartidas\\ASUR\\Acuerdo programacion 2026 ok.xlsx';
  console.log(`Reading Excel file from: ${excelPath}`);
  
  if (!fs.existsSync(excelPath)) {
    throw new Error(`El archivo no existe en la ruta: ${excelPath}`);
  }

  const workbook = XLSX.readFile(excelPath);
  const sheetName = 'Hoja1';
  
  if (!workbook.SheetNames.includes(sheetName)) {
    throw new Error(`No se encontró la hoja '${sheetName}' en el archivo Excel.`);
  }

  const sheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: "" });
  
  // Clean keys (trim spaces)
  const cleanedData = rawData.map(row => {
    const newRow = {};
    for (const key in row) {
      newRow[key.trim()] = row[key];
    }
    return newRow;
  });

  const destPath = path.join(__dirname, 'public', 'data', 'acuerdo_minsal_hoja1.json');
  fs.writeFileSync(destPath, JSON.stringify(cleanedData, null, 2), 'utf-8');
  console.log(`Successfully compiled and saved ${cleanedData.length} rows to ${destPath}`);
} catch (err) {
  console.error("Error compiling Acuerdo Programación:", err.message);
  process.exit(1);
}
