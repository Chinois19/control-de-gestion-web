/**
 * fetch-insumos.cjs
 * Descarga los datos de insumos quirurgicos desde la API de pabellon
 * y los guarda en /public/data/insumos_cirugias_cached.json
 *
 * Uso: node fetch-insumos.cjs
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://pabellonhospitalvillarrica.pythonanywhere.com';
const LOGIN_PATH = '/accounts/login/';
const DATA_PATH = '/pabellon/exportar_insumos_cirugias/';
const OUTPUT_FILE = path.join(__dirname, 'public', 'data', 'insumos_cirugias_cached.json');

function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const mod = options.protocol === 'http:' ? http : https;
    const req = mod.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function extractCsrf(html) {
  const match = html.match(/name="csrfmiddlewaretoken"\s+value="([^"]+)"/);
  return match ? match[1] : null;
}

function parseCookies(setCookieHeader) {
  if (!setCookieHeader) return '';
  const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  return cookies.map(c => c.split(';')[0]).join('; ');
}

async function main() {
  console.log('Iniciando sesion en pabellonhospitalvillarrica.pythonanywhere.com...');
  const urlObj = new URL(BASE_URL + LOGIN_PATH);

  const getRes = await makeRequest({
    protocol: urlObj.protocol,
    hostname: urlObj.hostname,
    path: urlObj.pathname,
    method: 'GET',
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ControlGestion/1.0)', 'Accept': 'text/html' }
  });

  const csrf = extractCsrf(getRes.body);
  if (!csrf) { console.error('No se pudo extraer el token CSRF.'); process.exit(1); }
  const sessionCookieGet = parseCookies(getRes.headers['set-cookie']);
  console.log('Token CSRF obtenido.');

  const formBody = `username=admin&password=Controldegestion2025&csrfmiddlewaretoken=${encodeURIComponent(csrf)}&next=/`;
  const postRes = await makeRequest({
    protocol: urlObj.protocol,
    hostname: urlObj.hostname,
    path: urlObj.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(formBody),
      'Referer': BASE_URL + LOGIN_PATH,
      'Cookie': sessionCookieGet,
      'User-Agent': 'Mozilla/5.0 (compatible; ControlGestion/1.0)',
    }
  }, formBody);

  const sessionCookiePost = parseCookies(postRes.headers['set-cookie']) || sessionCookieGet;
  if (postRes.statusCode !== 302 && postRes.statusCode !== 200) { console.error('Login fallo HTTP ' + postRes.statusCode); process.exit(1); }
  console.log('Login exitoso.');

  console.log('Descargando datos de insumos...');
  const dataRes = await makeRequest({
    protocol: urlObj.protocol,
    hostname: urlObj.hostname,
    path: DATA_PATH,
    method: 'GET',
    headers: { 'Cookie': sessionCookiePost, 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0 (compatible; ControlGestion/1.0)' }
  });

  if (dataRes.statusCode !== 200) { console.error('Error HTTP ' + dataRes.statusCode); console.error(dataRes.body.substring(0, 500)); process.exit(1); }

  let parsed;
  try { parsed = JSON.parse(dataRes.body); } catch (e) { console.error('Respuesta no es JSON valido:'); console.error(dataRes.body.substring(0, 300)); process.exit(1); }

  const records = Array.isArray(parsed) ? parsed : (parsed.data || parsed.records || []);
  console.log('Registros recibidos: ' + records.length);

  const outDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(records, null, 2), 'utf8');

  const fileSizeKB = (fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1);
  console.log('Guardado en: ' + OUTPUT_FILE);
  console.log('Tamano: ' + fileSizeKB + ' KB');

  const costTotal = records.reduce((s, r) => s + (Number(r.total) || 0), 0);
  console.log('Costo total: $' + Math.round(costTotal).toLocaleString('es-CL'));
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
