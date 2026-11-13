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

    // Discard deleted records (especialmente en Tabla Quirúrgica / Pabellón)
    if (r.eliminada === true || r.eliminada === 'true' || r.eliminada === 1) {
      return false;
    }
    
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

  console.log(`[${name}] Filtered from ${records.length} to ${filtered.length} records (Years 2025-2026, sin eliminadas).`);
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

    // Enrich Tabla Quirurgica with Fonasa validation
    if (name === 'Tabla Quirurgica') {
      enrichPabellonWithFonasa(records);
    }

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

// Helper to enrich Pabellon records with Tipo de Actividad Fonasa and Tipo de Cirugía Validada
function enrichPabellonWithFonasa(records) {
  try {
    const mapPath = path.join(__dirname, 'public', 'data', 'fonasa_actividad_map.json');
    if (!fs.existsSync(mapPath)) return;
    const fonasaMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

    records.forEach(r => {
      let code = null;
      if (r.codigo_iq) {
        const m = String(r.codigo_iq).match(/^(\d{6,8})/);
        if (m) code = m[1];
      }
      if (!code && r.intervencion_propuesta) {
        const m = String(r.intervencion_propuesta).match(/^(\d{6,8})/);
        if (m) code = m[1];
      }
      if (!code && r.codigo_iq) {
        const m = String(r.codigo_iq).match(/\b(\d{7}|\d{6})\b/);
        if (m) code = m[1];
      }
      if (!code && r.intervencion_propuesta) {
        const m = String(r.intervencion_propuesta).match(/\b(\d{7}|\d{6})\b/);
        if (m) code = m[1];
      }

      const actFonasa = code ? fonasaMap[code] : null;

      if (!actFonasa) {
        r.tipo_actividad_fonasa = 'Sin codificar Fonasa';
        r.tipo_cirugia_validada = 'Sin codificar Fonasa';
      } else if (actFonasa === 'Cirugía Menor') {
        r.tipo_actividad_fonasa = 'Cirugía Menor';
        r.tipo_cirugia_validada = 'Cirugía Menor';
      } else if (actFonasa === 'Procedimientos') {
        r.tipo_actividad_fonasa = 'Procedimientos';
        r.tipo_cirugia_validada = 'Procedimientos';
      } else if (actFonasa === 'Cirugía Mayor') {
        r.tipo_actividad_fonasa = 'Cirugía Mayor';
        const rawTipo = String(r.tipo_cirugia || '').trim();
        r.tipo_cirugia_validada = rawTipo === 'Mayor' ? 'Cirugía Mayor' : 'Cirugía Mayor Ambulatoria';
      } else {
        r.tipo_actividad_fonasa = actFonasa;
        r.tipo_cirugia_validada = actFonasa;
      }

      // Calculate Tipo de Horario según REM
      r.tipo_horario = calculateTipoHorario(r);
    });
    console.log(`[Tabla Quirurgica] Enriched ${records.length} records with Tipo de Cirugía Validada (Fonasa) y Tipo de Horario.`);
  } catch (err) {
    console.error(`[Tabla Quirurgica] Warning: Could not enrich with Fonasa validation:`, err);
  }
}

const CHILEAN_HOLIDAYS = new Set([
  // 2024
  '2024-01-01', '2024-03-29', '2024-03-30', '2024-05-01', '2024-05-21', '2024-06-09',
  '2024-06-20', '2024-06-29', '2024-07-16', '2024-08-15', '2024-09-18', '2024-09-19',
  '2024-09-20', '2024-10-12', '2024-10-27', '2024-10-31', '2024-11-01', '2024-12-08', '2024-12-25',
  // 2025
  '2025-01-01', '2025-04-18', '2025-04-19', '2025-05-01', '2025-05-21', '2025-06-20',
  '2025-06-29', '2025-07-16', '2025-08-15', '2025-09-18', '2025-09-19', '2025-10-12',
  '2025-10-31', '2025-11-01', '2025-11-16', '2025-12-08', '2025-12-14', '2025-12-25',
  // 2026
  '2026-01-01', '2026-04-03', '2026-04-04', '2026-05-01', '2026-05-21', '2026-06-21',
  '2026-06-29', '2026-07-16', '2026-08-15', '2026-09-18', '2026-09-19', '2026-10-12',
  '2026-10-31', '2026-11-01', '2026-12-08', '2026-12-25',
  // 2027
  '2027-01-01', '2027-03-26', '2027-03-27', '2027-05-01', '2027-05-21', '2027-06-21',
  '2027-06-29', '2027-07-16', '2027-08-15', '2027-09-18', '2027-09-19', '2027-10-12',
  '2027-10-31', '2027-11-01', '2027-12-08', '2027-12-25'
]);

function calculateTipoHorario(r) {
  if (!r.fecha_programacion) return 'Horario hábil';
  const dateStr = String(r.fecha_programacion).split('T')[0];
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const dayOfWeek = dt.getDay(); // 0 = Domingo, 6 = Sábado

  // 3. Sábado, domingo y festivos
  if (dayOfWeek === 0 || dayOfWeek === 6 || CHILEAN_HOLIDAYS.has(dateStr)) {
    return 'Sábado, domingo y festivos';
  }

  // Determine time of entry to pabellon
  let timeStr = r.hora_ingreso_cirugia || r.hora_inicio_cirugia;
  
  if (!timeStr) {
    if (r.hora_suspension && /^\d{1,2}:\d{2}/.test(r.hora_suspension)) {
      timeStr = r.hora_suspension;
    } else {
      return 'Horario hábil';
    }
  }

  const [hh, mm] = String(timeStr).split(':').map(Number);
  const totalMin = hh * 60 + (mm || 0);

  // Lunes a Jueves: 08:00 a 17:00 inclusive (480 a 1020)
  if (dayOfWeek >= 1 && dayOfWeek <= 4) {
    if (totalMin >= 480 && totalMin <= 1020) {
      return 'Horario hábil';
    } else {
      return 'Horario inhábil de lunes a viernes';
    }
  }

  // Viernes: 08:00 a 16:00 inclusive (480 a 960)
  if (dayOfWeek === 5) {
    if (totalMin >= 480 && totalMin <= 960) {
      return 'Horario hábil';
    } else {
      return 'Horario inhábil de lunes a viernes';
    }
  }

  return 'Horario hábil';
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

    // Enrich Tabla Quirurgica with Fonasa validation
    if (name === 'Tabla Quirurgica') {
      enrichPabellonWithFonasa(records);
    }

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

    // Enrich Tabla Quirurgica with Fonasa validation
    if (name === 'Tabla Quirurgica') {
      enrichPabellonWithFonasa(records);
    }

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
    "1926DE43A5EBD333717A1E1662E626A5",
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
