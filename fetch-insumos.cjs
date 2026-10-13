/**
 * fetch-insumos.cjs
 * Descarga los datos de insumos quirurgicos desde la API de pabellon
 * y los guarda en /public/data/insumos_cirugias_cached.json (+ .gz)
 * incluyendo la fecha de la ultima actualizacion (lastUpdated).
 *
 * Uso: node fetch-insumos.cjs
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const URL_DATA = 'https://pabellonhospitalvillarrica.pythonanywhere.com/pabellon/exportar_insumos_cirugias/';
const USERNAME = 'admin';
const PASSWORD = 'Controldegestion2025';
const OUTPUT_FILE = path.join(__dirname, 'public', 'data', 'insumos_cirugias_cached.json');

async function main() {
  console.log('Descargando datos de insumos (Basic Auth)...');
  const auth = 'Basic ' + Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
  const res = await fetch(URL_DATA, { headers: { Authorization: auth, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Error HTTP ${res.status} ${res.statusText}`);

  const parsed = await res.json();
  const records = Array.isArray(parsed) ? parsed : (parsed.data || parsed.records || parsed.insumos_cirugias || []);
  console.log('Registros recibidos: ' + records.length);
  if (!records.length) throw new Error('La API no devolvio registros; no se sobrescribe el cache.');

  const outDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const payload = {
    lastUpdated: new Date().toISOString(),
    fecha_actualizacion_fuente: parsed.fecha_actualizacion || null,
    records
  };
  const jsonStr = JSON.stringify(payload);
  fs.writeFileSync(OUTPUT_FILE, jsonStr, 'utf8');
  fs.writeFileSync(OUTPUT_FILE + '.gz', zlib.gzipSync(Buffer.from(jsonStr), { level: 9 }));

  console.log('Guardado en: ' + OUTPUT_FILE + ' (' + (fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2) + ' MB)');
  const costTotal = records.reduce((s, r) => s + (Number(r.total) || 0), 0);
  console.log('Costo total: $' + Math.round(costTotal).toLocaleString('es-CL'));
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
