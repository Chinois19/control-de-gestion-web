'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const xlsx = require('xlsx');      // Solo para el diccionario pequeño
const unzipper = require('unzipper');
const sax = require('sax');

// Archivos de Origen y Destino
const dataDir = path.join(__dirname, '..', 'src', 'data', 'Producción Laboratorio');
const outputFile = path.join(__dirname, '..', 'public', 'data', 'laboratory_cached.json.gz');

// ─── Utilidades de fecha ───────────────────────────────────────────────────────
function excelSerialToISO(serial) {
  const dateObj = new Date((serial - (25567 + 2)) * 86400 * 1000);
  return dateObj.toISOString().split('T')[0];
}

function parseRawFecha(val) {
  if (!val && val !== 0) return null;
  if (val instanceof Date) return val.toISOString().split('T')[0];
  if (typeof val === 'number') return excelSerialToISO(val);
  if (typeof val === 'string') {
    if (val.includes('/')) {
      const parts = val.split('/');
      if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(val)) return val.slice(0,10);
  }
  return null;
}

function edadBracketFn(rawEdad) {
  if (rawEdad === 'Desconocido' || rawEdad === null || rawEdad === undefined || rawEdad === '') return 'Desconocido';
  const e = parseInt(rawEdad);
  if (isNaN(e)) return 'Desconocido';
  if (e < 5)  return '0-4 años';
  if (e < 10) return '5-9 años';
  if (e < 15) return '10-14 años';
  if (e < 20) return '15-19 años';
  if (e < 25) return '20-24 años';
  if (e < 30) return '25-29 años';
  if (e < 35) return '30-34 años';
  if (e < 40) return '35-39 años';
  if (e < 45) return '40-44 años';
  if (e < 50) return '45-49 años';
  if (e < 55) return '50-54 años';
  if (e < 60) return '55-59 años';
  if (e < 65) return '60-64 años';
  if (e < 70) return '65-69 años';
  if (e < 75) return '70-74 años';
  if (e < 80) return '75-79 años';
  return '80+ años';
}

// ─── Leer SharedStrings desde ZIP ─────────────────────────────────────────────
function readSharedStrings(zipDirectory) {
  return new Promise((resolve) => {
    const sharedStrings = [];
    const ssEntry = zipDirectory.files.find(f =>
      f.path === 'xl/sharedStrings.xml' || f.path === 'xl/SharedStrings.xml'
    );
    if (!ssEntry) { resolve(sharedStrings); return; }

    const parser = sax.createStream(true, { trim: false });
    let inSi = false, inT = false, currentText = '';

    parser.on('opentag', (node) => {
      if (node.name === 'si') { inSi = true; currentText = ''; }
      if (inSi && node.name === 't') { inT = true; }
    });
    parser.on('text', (text) => {
      if (inSi && inT) currentText += text;
    });
    parser.on('cdata', (cdata) => {
      if (inSi && inT) currentText += cdata;
    });
    parser.on('closetag', (name) => {
      if (name === 't') { inT = false; }
      if (name === 'si') { sharedStrings.push(currentText); inSi = false; currentText = ''; }
    });
    parser.on('end', () => resolve(sharedStrings));
    parser.on('error', () => resolve(sharedStrings)); // Si falla, continuar sin SS

    ssEntry.stream().pipe(parser);
  });
}

// ─── Detectar si una celda es fecha por styleIndex ────────────────────────────
// Formato simplificado: numFmtIds 14-17, 22, 164+ pueden ser fechas
function readStyles(zipDirectory) {
  return new Promise((resolve) => {
    const dateFmtIds = new Set([14,15,16,17,18,19,20,21,22,45,46,47]);
    const cellDateStyleIndices = new Set();

    const stylesEntry = zipDirectory.files.find(f => f.path === 'xl/styles.xml');
    if (!stylesEntry) { resolve(cellDateStyleIndices); return; }

    const parser = sax.createStream(true, {});
    let inCellXfs = false, xfIndex = 0;
    const customDateFmts = new Set();

    parser.on('opentag', (node) => {
      if (node.name === 'numFmt') {
        const id = parseInt(node.attributes.numFmtId || '0');
        const fmt = (node.attributes.formatCode || '').toLowerCase();
        if (fmt.includes('yy') || fmt.includes('dd') || fmt.includes('mm/') || fmt.includes('/mm')) {
          customDateFmts.add(id);
        }
      }
      if (node.name === 'cellXfs') inCellXfs = true;
      if (inCellXfs && node.name === 'xf') {
        const numFmtId = parseInt(node.attributes.numFmtId || '0');
        if (dateFmtIds.has(numFmtId) || customDateFmts.has(numFmtId)) {
          cellDateStyleIndices.add(xfIndex);
        }
        xfIndex++;
      }
    });
    parser.on('closetag', (name) => {
      if (name === 'cellXfs') inCellXfs = false;
    });
    parser.on('end', () => resolve(cellDateStyleIndices));
    parser.on('error', () => resolve(cellDateStyleIndices));

    stylesEntry.stream().pipe(parser);
  });
}

// ─── Parsear hoja con SAX streaming ───────────────────────────────────────────
function parseSheetSax(sheetEntry, sharedStrings, dateStyleIndices, onRow) {
  return new Promise((resolve, reject) => {
    const parser = sax.createStream(true, { trim: false });

    let currentRowCells = {};
    let currentRowNum = 0;
    let currentCell = null;   // { col, type, style }
    let currentCellText = '';
    let inV = false, inIs = false, inT = false;

    // Convertir referencia de celda (ej: "C5") al índice de columna base-0
    function colLetterToIndex(ref) {
      const colStr = ref.replace(/[0-9]/g, '');
      let idx = 0;
      for (let i = 0; i < colStr.length; i++) {
        idx = idx * 26 + (colStr.charCodeAt(i) - 64);
      }
      return idx - 1;
    }

    parser.on('opentag', (node) => {
      if (node.name === 'row') {
        currentRowCells = {};
        currentRowNum = parseInt(node.attributes.r || '0');
      }
      if (node.name === 'c') {
        const ref = node.attributes.r || '';
        const colIdx = colLetterToIndex(ref);
        const t = node.attributes.t || ''; // '' = number, 's' = shared string, 'inlineStr', 'b', 'str'
        const s = parseInt(node.attributes.s || '-1');
        currentCell = { col: colIdx, type: t, style: s };
        currentCellText = '';
        inV = false; inIs = false;
      }
      if (node.name === 'v') { inV = true; currentCellText = ''; }
      if (node.name === 'is') { inIs = true; }
      if (inIs && node.name === 't') { inT = true; currentCellText = ''; }
    });

    parser.on('text', (text) => {
      if (inV || (inIs && inT)) currentCellText += text;
    });

    parser.on('cdata', (cdata) => {
      if (inV || (inIs && inT)) currentCellText += cdata;
    });

    parser.on('closetag', (name) => {
      if (name === 'v') {
        inV = false;
        if (currentCell) {
          let value;
          if (currentCell.type === 's') {
            // Shared string
            const idx = parseInt(currentCellText);
            value = sharedStrings[idx] !== undefined ? sharedStrings[idx] : currentCellText;
          } else if (currentCell.type === 'b') {
            value = currentCellText === '1';
          } else if (currentCell.type === 'str' || currentCell.type === 'e') {
            value = currentCellText;
          } else {
            // Número — puede ser fecha
            const num = parseFloat(currentCellText);
            if (!isNaN(num) && dateStyleIndices.has(currentCell.style)) {
              value = excelSerialToISO(num);
            } else {
              value = isNaN(num) ? currentCellText : num;
            }
          }
          currentRowCells[currentCell.col] = value;
        }
      }
      if (name === 't' && inIs) { inT = false; }
      if (name === 'is') {
        inIs = false;
        if (currentCell) {
          currentRowCells[currentCell.col] = currentCellText;
        }
      }
      if (name === 'c') { currentCell = null; }
      if (name === 'row') {
        // Convertir a array indexado
        if (Object.keys(currentRowCells).length > 0) {
          const maxCol = Math.max(...Object.keys(currentRowCells).map(Number));
          const arr = new Array(maxCol + 1).fill(null);
          for (const [col, val] of Object.entries(currentRowCells)) {
            arr[parseInt(col)] = val;
          }
          onRow(arr, currentRowNum);
        }
      }
    });

    parser.on('end', resolve);
    parser.on('error', reject);

    sheetEntry.stream().pipe(parser);
  });
}

// ─── Procesar un archivo .xlsx completo ───────────────────────────────────────
async function processXlsxFile(filePath, fileName, aggregatedData, globalDictionary, seenTomaMuestras, homologacionMap) {
  console.log(`\nProcesando archivo mensual de producción: ${fileName}...`);
  let totalRows = 0;

  let zipDir;
  try {
    zipDir = await unzipper.Open.file(filePath);
  } catch (e) {
    console.error(`  ❌ No se pudo abrir el ZIP: ${e.message}`);
    return 0;
  }

  // Leer SharedStrings y Styles en paralelo
  const [sharedStrings, dateStyleIndices] = await Promise.all([
    readSharedStrings(zipDir),
    readStyles(zipDir)
  ]);
  console.log(`  -> SharedStrings: ${sharedStrings.length} entradas`);

  // Encontrar la primera hoja
  const sheetsEntry = zipDir.files.find(f => /^xl\/worksheets\/sheet\d+\.xml$/.test(f.path));
  if (!sheetsEntry) {
    console.warn(`  ⚠️  No se encontró hoja en ${fileName}`);
    return 0;
  }
  console.log(`  -> Leyendo Hoja: ${sheetsEntry.path}`);

  let header = null;

  await parseSheetSax(sheetsEntry, sharedStrings, dateStyleIndices, (rowArr, rowNum) => {
    if (!header) {
      header = rowArr.map(v => (v !== null && v !== undefined) ? String(v).toLowerCase().trim() : null);
      return;
    }

    if (!rowArr.some(v => v !== null && v !== undefined && v !== '')) return;
    totalRows++;

    // Función helper para buscar valor por sinónimos
    const getVal = (synonyms, fallback) => {
      for (const k of synonyms) {
        const idx = header.findIndex(h => h === k);
        if (idx !== -1 && rowArr[idx] !== null && rowArr[idx] !== undefined && String(rowArr[idx]).trim() !== '') {
          return rowArr[idx];
        }
      }
      return fallback;
    };

    let fecha = getVal(['fecha_ejecucion','fecha','fecha_examen','fecha_validacion'], null);
    fecha = parseRawFecha(fecha) || '2026-04-01';

    const cod_lis = String(getVal(['codigo_lis','codigo','cod_lis','id_examen'], 'Sin Codigo')).trim();
    const glosa_lis = String(getVal(['glosa_lis','descripcion_lis','examen','prestacion_lis'], 'Sin Glosa'));

    let cod_fonasa, glosa_fonasa;
    if (homologacionMap[cod_lis]) {
      cod_fonasa = homologacionMap[cod_lis].codFonasa;
      glosa_fonasa = homologacionMap[cod_lis].glosaFonasa;
    } else {
      cod_fonasa = String(getVal(['codigo_fonasa','prestacion_codigo'], cod_lis));
      glosa_fonasa = String(getVal(['glosa_fonasa','descripcion_fonasa','prestacion'], glosa_lis));
    }

    if (!globalDictionary[cod_lis]) {
      globalDictionary[cod_lis] = { gl: glosa_lis, cf: cod_fonasa, gf: glosa_fonasa };
    }

    const rawProc = String(getVal(['tipo_atencion'], ''));
    const pLower = rawProc.toLowerCase();
    let procedencia = 'atencion_abierta';
    if (pLower.includes('urg') || pLower.includes('emergencia') || pLower.includes('sapu') || pLower.includes('sar')) {
      procedencia = 'urgencia';
    } else if (pLower.includes('cerrada') || pLower.includes('hosp') || pLower.includes('uci') || pLower.includes('uti') || pLower.includes('cama') || pLower.includes('pabellon')) {
      procedencia = 'atencion_cerrada';
    }

    const origen = String(getVal(['origen','establecimiento','comuna','establecimiento_procedencia','procedencia','ubicación'], 'Desconocido'));
    const servicio = String(getVal(['servicio_solicitante','servicio'], 'Desconocido'));
    const sexo = String(getVal(['sexo','sexo_paciente'], 'Desconocido'));
    const prevision = String(getVal(['prevision','aseguradora'], 'FONASA'));
    const seccionRaw = String(getVal(['seccion','seccion_laboratorio','grupo_pesquisa'], 'General')).trim();
    const seccion = (seccionRaw.toLowerCase() === '(blanco)' || seccionRaw === '') ? 'Exámenes Generales' : seccionRaw;

    const rawEdad = getVal(['edad','edad_paciente','rango_edad'], 'Desconocido');
    const edadBracket = edadBracketFn(rawEdad);

    const cantidadRaw = getVal(['cantidad','total','volumen','cantidad_produccion'], 1);
    const cantidad = isNaN(parseInt(cantidadRaw)) ? 1 : parseInt(cantidadRaw);

    // Deduplicación Toma de Muestra
    const rutStr = String(getVal(['rut'], '')).trim().toUpperCase();
    const codFonasaStr = String(cod_fonasa).trim();
    const isTomaMuestra = codFonasaStr.startsWith('3070') || codFonasaStr.startsWith('03070');

    let finalCantidad = cantidad;
    if (isTomaMuestra && rutStr) {
      const seenKey = `${rutStr}|${fecha}`;
      if (seenTomaMuestras.has(seenKey)) return;
      seenTomaMuestras.add(seenKey);
      finalCantidad = 1;
    }

    const key = `${fecha}|${cod_lis}|${procedencia}|${origen}|${servicio}|${sexo}|${edadBracket}|${prevision}|${seccion}`;
    if (!aggregatedData[key]) {
      aggregatedData[key] = { f: fecha, cl: cod_lis, p: procedencia, o: origen, s: servicio, sx: sexo, e: edadBracket, pr: prevision, sl: seccion, c: 0, t: 2.0, r: 0 };
    }
    aggregatedData[key].c += finalCantidad;
  });

  console.log(`  ✅ ${fileName}: ${totalRows.toLocaleString()} filas procesadas.`);
  return totalRows;
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function processExcelFiles() {
  const aggregatedData = {};
  let totalRowsProcessed = 0;
  const seenTomaMuestras = new Set();
  const globalDictionary = {};

  // 1. Cargar Diccionario de Homologación (pequeño, usar xlsx normal)
  const homologacionMap = {};
  const homologacionFile = path.join(dataDir, 'homologación estadistica.xlsx');

  if (fs.existsSync(homologacionFile)) {
    console.log('Cargando Diccionario de Homologación Oficial...');
    const hWb = xlsx.readFile(homologacionFile);
    const hSheet = hWb.Sheets[hWb.SheetNames[0]];
    const hData = xlsx.utils.sheet_to_json(hSheet);
    hData.forEach(row => {
      const codLis = row['Codigo_LIS'] || row['codigo'] || '';
      const glosaFonasa = row['Descripciòn Fonasa'] || row['Descripción Fonasa'] || row['glosa_fonasa'] || '';
      const codFonasa = row['Código Fonasa'] || row['codigo_fonasa'] || '';
      if (codLis) {
        homologacionMap[String(codLis).trim()] = {
          glosaFonasa: String(glosaFonasa).trim(),
          codFonasa: String(codFonasa).trim()
        };
      }
    });
    console.log(`✅ Diccionario cargado con ${Object.keys(homologacionMap).length} códigos únicos.\n`);
  } else {
    console.log('⚠️ No se encontró el archivo de homologación. Se intentará deducir de los archivos fuente.');
  }

  // 2. Procesar archivos de producción mensual
  const files = fs.readdirSync(dataDir);
  const prodFiles = files.filter(f => f.endsWith('.xlsx') && !f.toLowerCase().includes('homologación'));

  for (const file of prodFiles) {
    const filePath = path.join(dataDir, file);
    const rows = await processXlsxFile(filePath, file, aggregatedData, globalDictionary, seenTomaMuestras, homologacionMap);
    totalRowsProcessed += rows;
  }

  // 3. Guardar resultado comprimido GZIP
  const outputRecordsCount = Object.keys(aggregatedData).length;
  console.log(`\nGuardando JSON ultra-comprimido (GZIP) de forma progresiva...`);

  await new Promise((resolve, reject) => {
    const fileOut = fs.createWriteStream(outputFile);
    const outStream = zlib.createGzip();
    outStream.pipe(fileOut);

    outStream.write(`{\n  "lastUpdated": "${new Date().toISOString()}",\n  "total_raw_rows": ${totalRowsProcessed},\n  "dictionary": ${JSON.stringify(globalDictionary)},\n  "records": [\n`);

    const keys = Object.keys(aggregatedData);
    for (let i = 0; i < keys.length; i++) {
      outStream.write(JSON.stringify(aggregatedData[keys[i]]));
      if (i < keys.length - 1) outStream.write(',\n');
    }

    outStream.write(`\n  ]\n}\n`);
    outStream.end();

    fileOut.on('finish', resolve);
    fileOut.on('error', reject);
  });

  console.log(`\n======================================================`);
  console.log(`✅ Procesamiento de Excel Completado.`);
  console.log(`   Total filas crudas leídas: ${totalRowsProcessed.toLocaleString()}`);
  console.log(`   Filas agrupadas generadas (Caché Indexado): ${outputRecordsCount.toLocaleString()}`);
  console.log(`   Archivo guardado en: public/data/laboratory_cached.json.gz`);
  console.log(`======================================================\n`);
}

processExcelFiles().catch(console.error);
