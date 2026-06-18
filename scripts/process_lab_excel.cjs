const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx'); // Para leer el diccionario pequeño
const ExcelJS = require('exceljs'); // Para streaming de los pesados

// Archivos de Origen y Destino
const dataDir = path.join(__dirname, '..', 'src', 'data', 'Producción Laboratorio');
const outputFile = path.join(__dirname, '..', 'public', 'data', 'laboratory_cached.json.gz');

async function processExcelFiles() {
  const aggregatedData = {};
  let totalRowsProcessed = 0;
  const seenTomaMuestras = new Set();
  
  // 1. Cargar Diccionario de Homologación primero
  const homologacionMap = {}; // llave: cod_lis -> { glosa_fonasa, cod_fonasa }
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
          glosaFonasa: glosaFonasa.trim(), 
          codFonasa: String(codFonasa).trim() 
        };
      }
    });
    console.log(`✅ Diccionario cargado con ${Object.keys(homologacionMap).length} códigos únicos.\n`);
  } else {
    console.log('⚠️ No se encontró el archivo de homologación. Se intentará deducir de los archivos fuente.');
  }

  // 2. Procesar Archivos de Producción Mensual por Streaming
  const files = fs.readdirSync(dataDir);
  const prodFiles = files.filter(f => f.endsWith('.xlsx') && !f.toLowerCase().includes('homologación'));

  // Para optimización extrema
  const globalDictionary = {};

  for (const file of prodFiles) {
    const filePath = path.join(dataDir, file);
    console.log(`\nProcesando archivo mensual de producción: ${file}...`);
    
    const options = {
      sharedStrings: 'cache',
      worksheets: 'emit'
    };
    
    const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(filePath, options);
    
    for await (const worksheetReader of workbookReader) {
      console.log(` -> Leyendo Hoja: ${worksheetReader.name}`);
      
      let header = null;
      
      for await (const row of worksheetReader) {
        if (!row.hasValues) continue;
        const rowValues = row.values;
        if (!header) {
          header = rowValues;
          continue;
        }

        totalRowsProcessed++;

        const rowObj = {};
        for (let i = 1; i < header.length; i++) {
          const colName = header[i];
          if (colName) {
            rowObj[String(colName).toLowerCase().trim()] = rowValues[i];
          }
        }

        const getVal = (synonyms, fallback) => {
          for (const k of synonyms) {
            if (rowObj[k] !== undefined && rowObj[k] !== null && String(rowObj[k]).trim() !== '') {
              return rowObj[k];
            }
          }
          return fallback;
        };

        let fecha = getVal(['fecha_ejecucion', 'fecha', 'fecha_examen', 'fecha_validacion'], null);
        if (!fecha) fecha = '2026-04-01'; 
        
        if (fecha instanceof Date) {
           fecha = fecha.toISOString().split('T')[0];
        } else if (typeof fecha === 'number') {
           const dateObj = new Date((fecha - (25567 + 2))*86400*1000);
           fecha = dateObj.toISOString().split('T')[0];
        } else if (typeof fecha === 'string' && fecha.includes('/')) {
           const parts = fecha.split('/');
           if (parts.length === 3) fecha = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }

        const cod_lis = String(getVal(['codigo_lis', 'codigo', 'cod_lis', 'id_examen'], 'Sin Codigo')).trim();
        const glosa_lis = getVal(['glosa_lis', 'descripcion_lis', 'examen', 'prestacion_lis'], 'Sin Glosa');
        
        let cod_fonasa = cod_lis;
        let glosa_fonasa = glosa_lis;
        
        if (homologacionMap[cod_lis]) {
          cod_fonasa = homologacionMap[cod_lis].codFonasa;
          glosa_fonasa = homologacionMap[cod_lis].glosaFonasa;
        } else {
          cod_fonasa = String(getVal(['codigo_fonasa', 'prestacion_codigo'], cod_lis));
          glosa_fonasa = getVal(['glosa_fonasa', 'descripcion_fonasa', 'prestacion'], glosa_lis);
        }

        if (!globalDictionary[cod_lis]) {
          globalDictionary[cod_lis] = {
            gl: glosa_lis,
            cf: cod_fonasa,
            gf: glosa_fonasa
          };
        }

        let rawProc = String(getVal(['tipo_atencion'], ''));
        let procedencia = 'atencion_abierta'; // Default
        const pLower = rawProc.toLowerCase();
        if (pLower.includes('urg') || pLower.includes('emergencia') || pLower.includes('sapu') || pLower.includes('sar')) {
          procedencia = 'urgencia';
        } else if (pLower.includes('cerrada') || pLower.includes('hosp') || pLower.includes('uci') || pLower.includes('uti') || pLower.includes('cama') || pLower.includes('pabellon')) {
          procedencia = 'atencion_cerrada';
        }

        const origen = String(getVal(['origen', 'establecimiento', 'comuna', 'establecimiento_procedencia', 'procedencia', 'ubicación'], 'Desconocido'));
        const servicio = String(getVal(['servicio_solicitante', 'servicio'], 'Desconocido'));
        const sexo = String(getVal(['sexo', 'sexo_paciente'], 'Desconocido'));
        const prevision = String(getVal(['prevision', 'aseguradora'], 'FONASA'));
        let seccionRaw = String(getVal(['seccion', 'seccion_laboratorio', 'grupo_pesquisa'], 'General')).trim();
        const seccion = (seccionRaw.toLowerCase() === '(blanco)' || seccionRaw === '') ? 'Exámenes Generales' : seccionRaw;
        
        // Agrupar Edad en Tramos
        let rawEdad = getVal(['edad', 'edad_paciente', 'rango_edad'], 'Desconocido');
        let edadBracket = 'Desconocido';
        if (rawEdad !== 'Desconocido' && rawEdad !== null && rawEdad !== '') {
          const e = parseInt(rawEdad);
          if (!isNaN(e)) {
            if (e < 5) edadBracket = '0-4 años';
            else if (e < 10) edadBracket = '5-9 años';
            else if (e < 15) edadBracket = '10-14 años';
            else if (e < 20) edadBracket = '15-19 años';
            else if (e < 25) edadBracket = '20-24 años';
            else if (e < 30) edadBracket = '25-29 años';
            else if (e < 35) edadBracket = '30-34 años';
            else if (e < 40) edadBracket = '35-39 años';
            else if (e < 45) edadBracket = '40-44 años';
            else if (e < 50) edadBracket = '45-49 años';
            else if (e < 55) edadBracket = '50-54 años';
            else if (e < 60) edadBracket = '55-59 años';
            else if (e < 65) edadBracket = '60-64 años';
            else if (e < 70) edadBracket = '65-69 años';
            else if (e < 75) edadBracket = '70-74 años';
            else if (e < 80) edadBracket = '75-79 años';
            else edadBracket = '80+ años';
          }
        }
        
        const cantidadStr = getVal(['cantidad', 'total', 'volumen', 'cantidad_produccion'], 1);
        const cantidad = isNaN(parseInt(cantidadStr)) ? 1 : parseInt(cantidadStr);

        // Deduplicación excepcional de Toma de Muestra por RUT y Fecha
        const rutStr = String(getVal(['rut'], '')).trim().toUpperCase();
        const codFonasaStr = String(cod_fonasa).trim();
        const isTomaMuestra = codFonasaStr.startsWith('3070') || codFonasaStr.startsWith('03070');
        
        let finalCantidad = cantidad;
        
        if (isTomaMuestra && rutStr) {
          const seenKey = `${rutStr}|${fecha}`;
          if (seenTomaMuestras.has(seenKey)) {
            // Ya se contó una toma de muestra para este paciente en esta fecha, omitimos esta fila
            continue;
          } else {
            seenTomaMuestras.add(seenKey);
            finalCantidad = 1; // La toma de muestra corresponde a exactamente 1
          }
        }

        // Clave Única de Agrupación Compresora (muy reducida)
        const key = `${fecha}|${cod_lis}|${procedencia}|${origen}|${servicio}|${sexo}|${edadBracket}|${prevision}|${seccion}`;

        if (!aggregatedData[key]) {
          aggregatedData[key] = {
            f: fecha,
            cl: cod_lis,
            p: procedencia,
            o: origen,
            s: servicio,
            sx: sexo,
            e: edadBracket,
            pr: prevision,
            sl: seccion,
            c: 0,
            t: 2.0, // TAT
            r: 0    // Rechazos
          };
        }

        aggregatedData[key].c += finalCantidad;
      }
    }
  }

  const outputRecordsCount = Object.keys(aggregatedData).length;
  
  console.log(`Guardando JSON ultra-comprimido (GZIP) de forma progresiva...`);
  const zlib = require('zlib');
  const fileOut = fs.createWriteStream(outputFile);
  const outStream = zlib.createGzip();
  outStream.pipe(fileOut);
  
  outStream.write(`{\n  "lastUpdated": "${new Date().toISOString()}",\n  "total_raw_rows": ${totalRowsProcessed},\n  "dictionary": ${JSON.stringify(globalDictionary)},\n  "records": [\n`);
  
  const keys = Object.keys(aggregatedData);
  for (let i = 0; i < keys.length; i++) {
    const record = aggregatedData[keys[i]];
    outStream.write(JSON.stringify(record));
    if (i < keys.length - 1) {
      outStream.write(',\n');
    }
  }
  
  outStream.write(`\n  ]\n}\n`);
  outStream.end();

  outStream.on('finish', () => {
    console.log(`\n======================================================`);
    console.log(`✅ Procesamiento de Excel Completado.`);
    console.log(`   Total filas crudas leídas: ${totalRowsProcessed.toLocaleString()}`);
    console.log(`   Filas agrupadas generadas (Caché Indexado): ${outputRecordsCount.toLocaleString()}`);
    console.log(`   Archivo guardado en: public/data/laboratory_cached.json.gz`);
    console.log(`======================================================\n`);
  });
}

processExcelFiles().catch(console.error);

