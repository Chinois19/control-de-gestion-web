import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

    const records = await res.json();
    console.log(`[${name}] Successfully fetched ${records.length} records.`);

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
    fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData, null, 2), 'utf-8');
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

    const records = await res.json();
    console.log(`[${name}] Successfully fetched ${records.length} records.`);

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
    fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData, null, 2), 'utf-8');
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

  console.log("REDCap & PythonAnywhere Cache synchronization complete.");
}

run();

