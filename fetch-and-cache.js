import fs from 'fs';
import path from 'path';
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
  const dateFields = ['fecha_de_atenci_n', 'fecha_ingreso', 'fecha_egreso', 'fecha', 'fechadocumento'];
  
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

    const res = await fetch('https://redcap.araucaniasur.cl/api/', {
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

    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const lastMonday = new Date(now.setDate(diff));
    lastMonday.setHours(8, 0, 0, 0);

    const cacheData = {
      lastUpdated: lastMonday.toISOString(),
      records: records
    };

    const cacheFilePath = path.join(cacheDir, cacheFileName);
    // Minify JSON to optimize file transfer size
    fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData), 'utf-8');
    console.log(`[${name}] Saved cache to ${cacheFilePath}`);
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
    // Minify JSON to optimize file transfer size
    fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData), 'utf-8');
    console.log(`[${name}] Saved cache to ${cacheFilePath}`);
  } catch (err) {
    console.error(`[${name}] Error caching records:`, err);
  }
}

async function run() {
  console.log("Starting REDCap Unified Cache Engine...");
  
  // 1. Fetch Mammography
  await fetchAndCache(
    "Mammography",
    "63A26E06FF58CE5D39023212C60982A9",
    "mammography_cached.json"
  );

  // 2. Fetch Ultrasounds (Ecografías)
  await fetchAndCache(
    "Ultrasound",
    "121B03A6D600BD61FE94A83A40AA5E48",
    "ultrasound_cached.json"
  );

  // 3. Fetch X-rays (Radiografías)
  await fetchAndCache(
    "Radiology",
    "E9E62174D5E1D60AB3312772AB266774",
    "radiology_cached.json"
  );

  // 4. Fetch TAC (CT Scans)
  await fetchAndCache(
    "Tac",
    "821D14AF67868803621077A65D30545E",
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
    "F03C4EE0F08CD8A846F1621332F966CD",
    "solicitudes_cached.json"
  );

  console.log("REDCap & PythonAnywhere Cache synchronization complete.");
}

run();
