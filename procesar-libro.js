import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXCEL_PATH = path.join(__dirname, 'src/data/Producción quirúrgica/Libro de Pabellón Electrónico.xlsx');
const OUTPUT_PATH = path.join(__dirname, 'public/data/libro_pabellon_cached.json');

console.log('⏳ Iniciando el procesamiento local del Libro de Pabellón...');
console.time('TiempoTotal');

if (!fs.existsSync(EXCEL_PATH)) {
  console.error('❌ No se encontró el archivo Excel en la ruta:', EXCEL_PATH);
  process.exit(1);
}

// 1. Leer el archivo Excel
console.log('📊 Leyendo el archivo Excel (esto puede tomar unos segundos)...');
const workbook = xlsx.readFile(EXCEL_PATH);

// 2. Extraer la hoja 'Consulta1'
const sheetName = 'Consulta1';
if (!workbook.Sheets[sheetName]) {
  console.error(`❌ No se encontró la hoja '${sheetName}' en el Excel.`);
  process.exit(1);
}

// Convertir a JSON crudo
console.log('🔄 Convirtiendo a JSON...');
const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: false });

console.log(`✅ Se encontraron ${rawData.length} registros totales en el Excel.`);

// 3. Limpiar y filtrar datos
const cleanedData = [];

rawData.forEach(row => {
  if (!row['NUM LE'] && !row['Rut del Paciente']) return;

  cleanedData.push({
    num_le: row['NUM LE'],
    fecha_cirugia: row['Fecha de cirugía'],
    paciente: row['Nombre Completo del Paciente'],
    rut: row['Rut del Paciente'],
    edad: row['EDAD DEL PACIENTE'],
    sexo: row['SEXO DEL PACIENTE'],
    prevision: row['Previsión del paciente'],
    especialidad: row['ESPECIALIDAD ORIGEN'],
    cirujano: row['Nombre Primer Cirujano'] || row['Rut Cirujano'],
    intervencion: row['NOMBRE DE LA INTERVENCIÓN'],
    estado: row['ESTADO DE ATENCIÓN'],
    tipo_cirugia: row['Tipo cirugia'],
    tipo_actividad: row['LISTA PROCEDIMIENTOS. TIPO DE ACTIVIDAD'],
    urgencia: row['PROCEDENCIA URGENCIA'] ? 'SI' : 'NO',
    mai: row['Beneficiarios MAI'] ? 'SI' : 'NO',
    menor_15: (parseInt(row['EDAD DEL PACIENTE']) < 15) ? 'SI' : 'NO',
    duracion: row['Duración IQ']
  });
});

fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ records: cleanedData }), 'utf8');

console.log(`✅ ¡Éxito! Se ha guardado el archivo JSON optimizado (${cleanedData.length} registros) en: public/data/libro_pabellon_cached.json`);
console.timeEnd('TiempoTotal');
