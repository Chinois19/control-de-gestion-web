import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to check if a date string is in the 2025-2026 range
function isDateIn2025_2026(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const cleanStr = dateStr.trim();
  
  // Format check for YYYY-MM-DD (REDCap default)
  if (/^\d{4}-\d{2}-\d{2}/.test(cleanStr)) {
    const year = parseInt(cleanStr.substring(0, 4), 10);
    return year === 2025 || year === 2026;
  }
  
  // Format check for DD-MM-YYYY (Censo / Cuadratura default)
  if (/^\d{2}-\d{2}-\d{4}/.test(cleanStr)) {
    const year = parseInt(cleanStr.substring(6, 10), 10);
    return year === 2025 || year === 2026;
  }

  // Fallback parsing
  try {
    const d = new Date(cleanStr);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      return year === 2025 || year === 2026;
    }
  } catch (e) {}

  return false;
}

// Helper to filter records array to only include years 2025 and 2026
function filterRecordsForYears(records, name) {
  const dateFields = ['fecha_de_atenci_n', 'fecha_ingreso', 'fecha_egreso', 'fecha', 'fechadocumento', 'fecha_programacion'];
  
  const filtered = records.filter(r => {
    // If no fields, keep by default so we don't lose data
    if (!r || typeof r !== 'object') return false;
    
    // Check if any of the common date fields belong to 2025 or 2026
    for (const field of dateFields) {
      if (r[field] && isDateIn2025_2026(r[field])) {
        return true;
      }
    }
    
    // Fallback: If it's a record with absolutely no date fields, we keep it to be safe
    const hasAnyDateField = dateFields.some(field => Object.prototype.hasOwnProperty.call(r, field));
    return !hasAnyDateField;
  });

  console.log(`[${name}] Filtered from ${records.length} to ${filtered.length} records (Years 2025-2026).`);
  return filtered;
}

async function fetchAndCache(name, token, cacheFileName) {
  try {
    console.log(`Fetching live records from REDCap for ${name}...`);
    const formData = new URLSearchParams();
    formData.append('token', token);
    formData.append('content', 'record');
    formData.append('format', 'json');
    formData.append('type', 'flat');
    formData.append('rawOrLabel', 'label');
    formData.append('returnFormat', 'json');

    const res = await fetch('https://redcap.ssasur.cl/api/', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.statusText}`);
    }

    const rawRecords = await res.json();
    console.log(`[${name}] Successfully fetched ${rawRecords.length} records.`);

    // Filter only 2025-2026 records to optimize size
    const records = filterRecordsForYears(rawRecords, name);

    // Create the cached JSON object
    const cacheDir = path.join(__dirname, 'public', 'data');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const cacheData = {
      lastUpdated: new Date().toISOString(),
      records: records
    };

    const cacheFilePath = path.join(cacheDir, cacheFileName);
    const jsonStr = JSON.stringify(cacheData);
    fs.writeFileSync(cacheFilePath, jsonStr, 'utf-8');
    const gzFilePath = cacheFilePath + '.gz';
    fs.writeFileSync(gzFilePath, zlib.gzipSync(Buffer.from(jsonStr), { level: 9 }));
    console.log(`[${name}] Saved cache to ${cacheFilePath} and ${gzFilePath}`);
  } catch (err) {
    console.error(`[${name}] Error caching records:`, err);
  }
}

async function fetchAndCacheBasicAuth(name, url, username, password, cacheFileName) {
  try {
    console.log(`Fetching live records for ${name} from ${url}...`);
    const auth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': auth
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    }

    const rawRecords = await res.json();
    console.log(`[${name}] Successfully fetched ${rawRecords.length} records.`);

    // Filter only 2025-2026 records to optimize size
    const records = filterRecordsForYears(rawRecords, name);

    // Create the cached JSON object
    const cacheDir = path.join(__dirname, 'public', 'data');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const cacheData = {
      lastUpdated: new Date().toISOString(),
      records: records
    };

    const cacheFilePath = path.join(cacheDir, cacheFileName);
    const jsonStr = JSON.stringify(cacheData);
    fs.writeFileSync(cacheFilePath, jsonStr, 'utf-8');
    const gzFilePath = cacheFilePath + '.gz';
    fs.writeFileSync(gzFilePath, zlib.gzipSync(Buffer.from(jsonStr), { level: 9 }));
    console.log(`[${name}] Saved cache to ${cacheFilePath} and ${gzFilePath}`);
  } catch (err) {
    console.error(`[${name}] Error caching records:`, err);
  }
}

async function fetchAndCachePabellonDisponibilidad(name, url, username, password, cacheFileName) {
  try {
    console.log(`Fetching live records for ${name} from ${url}...`);
    const auth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': auth
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    }

    const payload = await res.json();
    const rawRecords = payload.datos || [];
    console.log(`[${name}] Successfully fetched ${rawRecords.length} records.`);

    // Filter only 2025-2026 records to optimize size
    const records = filterRecordsForYears(rawRecords, name);

    // Create the cached JSON object
    const cacheDir = path.join(__dirname, 'public', 'data');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const cacheData = {
      lastUpdated: new Date().toISOString(),
      records: records,
      fecha_actualizacion_fuente: payload.fecha_actualizacion || null
    };

    const cacheFilePath = path.join(cacheDir, cacheFileName);
    const jsonStr = JSON.stringify(cacheData);
    fs.writeFileSync(cacheFilePath, jsonStr, 'utf-8');
    const gzFilePath = cacheFilePath + '.gz';
    fs.writeFileSync(gzFilePath, zlib.gzipSync(Buffer.from(jsonStr), { level: 9 }));
    console.log(`[${name}] Saved cache to ${cacheFilePath} and ${gzFilePath}`);
  } catch (err) {
    console.error(`[${name}] Error caching records:`, err);
  }
}


async function run() {
  console.log("Starting REDCap Unified Cache Engine...");
  
  // 1. Fetch Mammography
  await fetchAndCache(
    "Mammography",
    "EB30192BE832D3E92F986A8D1478A906",
    "mammography_cached.json"
  );

  // 2. Fetch Ultrasounds (Ecografías)
  await fetchAndCache(
    "Ultrasound",
    "7BA4AD386CF539488A31BF4624CC27C6",
    "ultrasound_cached.json"
  );

  // 3. Fetch X-rays (Radiografías)
  await fetchAndCache(
    "Radiology",
    "8106B1DDF15F2B9D8B2CE1D07C7881F8",
    "radiology_cached.json"
  );

  // 4. Fetch TAC (CT Scans)
  await fetchAndCache(
    "Tac",
    "0957B5863F00E8C40DEE3780C39C54AA",
    "tac_cached.json"
  );

  // 5. Fetch Endoscopy (Procedimientos Endoscópicos)
  await fetchAndCache(
    "Endoscopy",
    "52E9850D1CA5A94014A883632F434EB6",
    "endoscopy_cached.json"
  );

  // 6. Fetch Censo (Atención Cerrada)
  await fetchAndCacheBasicAuth(
    "Censo",
    "https://controgestion.pythonanywhere.com/api/exportarDataRegistroCenso/",
    "admin",
    "Controldegestion2025",
    "censo_cached.json"
  );

  // 7. Fetch Cuadratura Camas (Atención Cerrada)
  await fetchAndCacheBasicAuth(
    "Cuadratura Camas",
    "https://controgestion.pythonanywhere.com/api/exportarDataCuadraturaCamas/",
    "admin",
    "Controldegestion2025",
    "cuadratura_cached.json"
  );

  // 8. Fetch Solicitudes Ciudadanas
  await fetchAndCache(
    "Solicitudes Ciudadanas",
    "A6E96C6D4C69EEC32B9EB08512171F17",
    "solicitudes_cached.json"
  );

  // 9. Fetch Pabellon - Disponibilidad
  await fetchAndCachePabellonDisponibilidad(
    "Disponibilidad Pabellon",
    "https://pabellonhospitalvillarrica.pythonanywhere.com/pabellon/exportar_disponibilidad/",
    "admin",
    "Controldegestion2025",
    "pabellon_disponibilidad_cached.json"
  );

  // 10. Fetch Pabellon - Tabla Quirurgica
  await fetchAndCacheBasicAuth(
    "Tabla Quirurgica",
    "https://pabellonhospitalvillarrica.pythonanywhere.com/pabellon/exportar_data/",
    "admin",
    "Controldegestion2025",
    "pabellon_tabla_cached.json"
  );

  console.log("REDCap & PythonAnywhere Cache synchronization complete.");
}

run();
