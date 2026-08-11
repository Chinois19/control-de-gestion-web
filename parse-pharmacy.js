import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Helper to parse double quote escaped values in CSV

function normalizeDate(dateStr) {
  if (!dateStr) return '';
  // Expected format: D-MM-YYYY or DD-MM-YYYY
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return dateStr;
}

function run() {
  const csvPath = path.join(__dirname, 'public', 'data', 'pharmacy_raw.csv');
  const jsonOutputPath = path.join(__dirname, 'public', 'data', 'pharmacy_cached.json');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found at ${csvPath}`);
    return;
  }
  
  console.log(`Parsing pharmacy CSV from ${csvPath}...`);
  const fileContent = fs.readFileSync(csvPath, 'latin1'); // Read with latin1 to preserve raw byte representations
  const lines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  if (lines.length === 0) {
    console.error('CSV file is empty');
    return;
  }
  
  const rawHeaders = parseCSVLine(lines[0]);
  console.log('Detected raw headers:', rawHeaders);
  
  // Map raw headers to clean keys
  const headerMap = {
    'FECHA DE ATENCI"N': 'fecha',
    'FECHA DE ATENCION': 'fecha',
    'FECHA DE ATENCI\uFFFD"N': 'fecha',
    'SERVICIO DE ATENCI"N': 'servicio',
    'SERVICIO DE ATENCION': 'servicio',
    'SERVICIO DE ATENCI\uFFFD"N': 'servicio',
    'N DE RECETAS': 'recetas',
    'N\uFFFD DE RECETAS': 'recetas',
    'Nº DE RECETAS': 'recetas',
    'N PRESCRIPCIONES': 'prescripciones',
    'N\uFFFD PRESCRIPCIONES': 'prescripciones',
    'Nº PRESCRIPCIONES': 'prescripciones',
    'Controlados (Receta Blanca)': 'receta_blanca',
    'Controlados (Receta verde)': 'receta_verde',
    'TIPO DE ATENCI"N': 'tipo_atencion',
    'TIPO DE ATENCION': 'tipo_atencion',
    'TIPO DE ATENCI\uFFFD"N': 'tipo_atencion',
    '?REA': 'area',
    '\uFFFDAREA': 'area',
    'ÁREA': 'area'
  };
  
  const cleanHeaders = rawHeaders.map(h => {
    // Exact match in map
    if (headerMap[h]) return headerMap[h];
    
    // Fuzzy matching
    const upper = h.toUpperCase();
    if (upper.includes('FECHA')) return 'fecha';
    if (upper.includes('SERVICIO')) return 'servicio';
    if (upper.includes('RECETAS')) return 'recetas';
    if (upper.includes('PRESCRIP')) return 'prescripciones';
    if (upper.includes('BLANCA')) return 'receta_blanca';
    if (upper.includes('VERDE')) return 'receta_verde';
    if (upper.includes('TIPO')) return 'tipo_atencion';
    if (upper.includes('REA') || upper.includes('AREA')) return 'area';
    
    return h.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  });
  
  console.log('Mapped headers:', cleanHeaders);
  
  const dateIdx = cleanHeaders.indexOf('fecha');
  if (dateIdx === -1) {
    console.error("Error: 'fecha' column not found in CSV headers");
    return;
  }

  // Determine current month in YYYY-MM format
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentYearMonth = `${currentYear}-${currentMonth}`; // e.g. "2026-05"
  
  let historicalRecords = [];
  let isIncremental = false;

  // Load existing cache if available
  if (fs.existsSync(jsonOutputPath)) {
    try {
      const existingCache = JSON.parse(fs.readFileSync(jsonOutputPath, 'utf-8'));
      if (existingCache && Array.isArray(existingCache.records)) {
        // Filter out all records belonging to the current month
        historicalRecords = existingCache.records.filter(r => r.fecha && !r.fecha.startsWith(currentYearMonth));
        isIncremental = true;
        console.log(`Incremental load active. Loaded ${historicalRecords.length} historical records (excluding ${currentYearMonth}).`);
      }
    } catch (e) {
      console.warn("Could not read existing cache file or it is invalid. Performing full load.", e);
    }
  }

  const currentMonthRecords = [];
  let skippedRowsCount = 0;
  
  for (let i = 1; i < lines.length; i++) {
    const rowValues = parseCSVLine(lines[i]);
    if (rowValues.length !== rawHeaders.length) {
      // Skip empty or malformed rows
      continue;
    }

    const rawDateVal = rowValues[dateIdx].replace(/^"|"$/g, '').trim();
    const normalizedDateVal = normalizeDate(rawDateVal);

    // If incremental, skip rows that are NOT in the current month
    if (isIncremental && !normalizedDateVal.startsWith(currentYearMonth)) {
      skippedRowsCount++;
      continue;
    }
    
    const record = {};
    cleanHeaders.forEach((header, idx) => {
      let val = rowValues[idx];
      
      // Clean string value
      val = val.replace(/^"|"$/g, '').trim();
      
      if (header === 'fecha') {
        record[header] = normalizedDateVal;
      } else if (header === 'recetas' || header === 'prescripciones' || header === 'receta_blanca' || header === 'receta_verde') {
        record[header] = parseInt(val, 10) || 0;
      } else {
        // Robust clean categories to bypass encoding corruption
        const upperVal = val.toUpperCase();
        
        if (header === 'tipo_atencion') {
          if (upperVal.includes('ABIERTA')) {
            val = 'ATENCIÓN ABIERTA';
          } else if (upperVal.includes('CERRADA')) {
            val = 'ATENCIÓN CERRADA';
          } else if (upperVal.includes('URGENCIA')) {
            val = 'ATENCIÓN DE URGENCIA';
          } else {
            val = val.replace(/ATENCI"N/gi, 'ATENCIÓN').replace(/ATENCION/gi, 'ATENCIÓN');
          }
        } else if (header === 'area') {
          if (upperVal.includes('ABIERTA')) {
            val = 'Farmacia de Atención Abierta';
          } else if (upperVal.includes('CERRADA')) {
            val = 'Farmacia de Atención Cerrada';
          } else if (upperVal.includes('URGENCIA')) {
            val = 'Farmacia de Urgencia';
          } else {
            val = val.replace(/Atencin/gi, 'Atención').replace(/Atencion/gi, 'Atención');
          }
        } else if (header === 'servicio') {
          // Clean up service names
          val = val
            .replace(/Ã³/g, 'ó')
            .replace(/Ã©/g, 'é')
            .replace(/Ã\x93/g, 'Ó')
            .replace(/Ã\x89/g, 'É')
            .replace(/Ã\xAD/g, 'í')
            .replace(/Ã\x9D/g, 'Í')
            .replace(/RecuperaciÃ³n|Recuperacion|Recuperacin/gi, 'Recuperación')
            .replace(/PediatrÃa|Pediatria/gi, 'Pediatría')
            .replace(/FisiopatologÃa|Fisiopatologia/gi, 'Fisiopatología')
            .replace(/AtenciÃ³n|Atencin|Atencion/gi, 'Atención')
            .replace(/CirugÃa|Cirugia/gi, 'Cirugía')
            .replace(/GinecologÃa|Ginecologia/gi, 'Ginecología')
            .replace(/AnestesiÃ³n|Anestesia/gi, 'Anestesia');
        }
        record[header] = val;
      }
    });
    
    currentMonthRecords.push(record);
  }
  
  console.log(`Parsed ${currentMonthRecords.length} records for the current month (${currentYearMonth}). Skipped ${skippedRowsCount} historical rows.`);
  
  const mergedRecords = [...historicalRecords, ...currentMonthRecords];
  console.log(`Merged database contains ${mergedRecords.length} total records.`);
  
  const outputData = {
    lastUpdated: new Date().toISOString(),
    records: mergedRecords
  };
  
  fs.writeFileSync(jsonOutputPath, JSON.stringify(outputData, null, 2), 'utf-8');
  console.log(`Saved clean cache to ${jsonOutputPath}`);
}

run();
