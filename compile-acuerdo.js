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

  // Compile 'nomina registros' sheet if present
  const nominaSheetName = 'nomina registros';
  if (workbook.SheetNames.includes(nominaSheetName)) {
    console.log(`Found '${nominaSheetName}' sheet. Compiling detailed records...`);
    const nominaSheet = workbook.Sheets[nominaSheetName];
    const rawNomina = XLSX.utils.sheet_to_json(nominaSheet);
    
    // Helper to convert excel serial date to month name
    const getMonthNameFromSerial = (serial) => {
      if (!serial) return 'Desconocido';
      const num = parseInt(serial);
      if (isNaN(num)) return 'Desconocido';
      const date = new Date(Math.round((num - 25569) * 86400 * 1000));
      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      return monthNames[date.getMonth()] || 'Desconocido';
    };

    const cleanedNomina = rawNomina.map(row => {
      return {
        mesDigitacion: getMonthNameFromSerial(row['Fec Dig Ini Go'] || row['Fecha Carga']),
        rangoDias: (row['Rango dias'] || '').toString().trim(),
        problema: (row['Problema Generico'] || '').toString().trim(),
        etapa: (row['Est Salud'] || '').toString().trim()
      };
    }).filter(row => row.mesDigitacion !== 'Desconocido' && row.rangoDias);

    const nominaDestPath = path.join(__dirname, 'public', 'data', 'nomina_registros_ges.json');
    fs.writeFileSync(nominaDestPath, JSON.stringify(cleanedNomina, null, 2), 'utf-8');
    console.log(`Successfully compiled and saved ${cleanedNomina.length} nomina rows to ${nominaDestPath}`);
  } else {
    console.log(`Warning: Sheet '${nominaSheetName}' not found in the workbook.`);
  }

} catch (err) {
  console.error("Error compiling Acuerdo Programación:", err.message);
  process.exit(1);
}
