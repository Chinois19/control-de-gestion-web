const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Este script está diseñado para leer archivos inmensos (millones de filas)
// línea por línea usando Streams para no colapsar la memoria RAM.

const sigcomDir = path.join(__dirname, 'src', 'data', 'SIGCOM');
const outputFile = path.join(__dirname, '..', 'public', 'data', 'laboratory_cached.json.gz');

async function processAllCSV() {
  const aggregatedData = {};
  let totalRowsProcessed = 0;

  async function processFile(filePath) {
    return new Promise((resolve, reject) => {
      console.log(`Procesando archivo: ${filePath}`);
      const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
      const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

      let isHeader = true;
      let headerMap = {};
      
      // Diccionario de Mapeo Semántico Backend
      const getIndex = (headers, synonyms) => {
        return headers.findIndex(h => synonyms.includes(h.toLowerCase().trim()));
      };

      rl.on('line', (line) => {
        if (!line.trim()) return;

        const cols = line.split(';'); // Asumiendo formato CSV separado por punto y coma (o coma, ajustar si es necesario)
        if (cols.length < 2) return;

        if (isHeader) {
          isHeader = false;
          const h = cols.map(c => c.toLowerCase().trim());
          headerMap = {
            fecha: getIndex(h, ['fecha_ejecucion', 'fecha', 'fecha_examen']),
            codigo_lis: getIndex(h, ['codigo_lis', 'codigo', 'cod_lis']),
            glosa_lis: getIndex(h, ['glosa_lis', 'descripcion_lis', 'examen']),
            codigo_fonasa: getIndex(h, ['codigo_fonasa', 'prestacion_codigo']),
            glosa_fonasa: getIndex(h, ['glosa_fonasa', 'descripcion_fonasa', 'prestacion']),
            procedencia: getIndex(h, ['procedencia', 'tipo_atencion']),
            origen: getIndex(h, ['origen', 'establecimiento', 'comuna', 'dsm']),
            servicio: getIndex(h, ['servicio_solicitante', 'servicio']),
            sexo: getIndex(h, ['sexo', 'sexo_paciente']),
            edad: getIndex(h, ['edad', 'edad_paciente', 'rango_edad']),
            cantidad: getIndex(h, ['cantidad', 'total', 'volumen']),
            prevision: getIndex(h, ['prevision', 'aseguradora'])
          };
          return;
        }

        totalRowsProcessed++;
        
        // Extracción Segura
        const getValue = (idx, fallback) => (idx !== -1 && cols[idx]) ? cols[idx].trim() : fallback;
        
        let fecha = getValue(headerMap.fecha, '2026-04-01');
        // Si la fecha viene vacía, aplicar regla de imputación a inicio de mes o fallback
        if (!fecha) fecha = '2026-04-01'; 

        const cod_lis = getValue(headerMap.codigo_lis, 'Sin Codigo');
        const glosa_lis = getValue(headerMap.glosa_lis, 'Sin Glosa');
        const cod_fonasa = getValue(headerMap.codigo_fonasa, cod_lis);
        const glosa_fonasa = getValue(headerMap.glosa_fonasa, glosa_lis);
        const procedencia = getValue(headerMap.procedencia, 'Desconocida');
        const origen = getValue(headerMap.origen, 'Desconocido');
        const servicio = getValue(headerMap.servicio, 'Desconocido');
        const sexo = getValue(headerMap.sexo, 'Desconocido');
        const edad = getValue(headerMap.edad, 'Desconocido');
        const prevision = getValue(headerMap.prevision, 'FONASA');
        
        const cantidadStr = getValue(headerMap.cantidad, '1');
        const cantidad = isNaN(parseInt(cantidadStr)) ? 1 : parseInt(cantidadStr);

        // Clave Única de Agrupación para evitar archivos masivos (Comprimir data de millones de filas a miles)
        const key = `${fecha}|${cod_lis}|${cod_fonasa}|${procedencia}|${origen}|${servicio}|${sexo}|${edad}|${prevision}`;

        if (!aggregatedData[key]) {
          aggregatedData[key] = {
            fecha_ejecucion: fecha,
            codigo_lis: cod_lis,
            glosa_lis: glosa_lis,
            codigo_fonasa: cod_fonasa,
            glosa_fonasa: glosa_fonasa,
            procedencia: procedencia,
            origen: origen,
            servicio_solicitante: servicio,
            sexo_paciente: sexo,
            edad_paciente: edad,
            prevision: prevision,
            seccion_laboratorio: 'General', // Esto puede ser derivado después o de otra columna
            cantidad_produccion: 0,
            tat_promedio_horas: 2.0, // Mock o extraer si existe
            muestras_rechazadas: 0
          };
        }

        aggregatedData[key].cantidad_produccion += cantidad;
      });

      rl.on('close', () => {
        resolve();
      });

      rl.on('error', (err) => {
        reject(err);
      });
    });
  }

  // Búsqueda recursiva de archivos CSV en la carpeta SIGCOM
  async function findAndProcessFiles(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (let entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await findAndProcessFiles(fullPath);
      } else if (entry.name.endsWith('.csv') || entry.name.endsWith('.txt')) {
        await processFile(fullPath);
      }
    }
  }

  await findAndProcessFiles(sigcomDir);

  const outputRecords = Object.values(aggregatedData);
  
  const finalJson = {
    lastUpdated: new Date().toISOString(),
    total_raw_rows: totalRowsProcessed,
    records: outputRecords
  };

  const zlib = require('zlib');
  const compressed = zlib.gzipSync(JSON.stringify(finalJson));
  fs.writeFileSync(outputFile, compressed);
  console.log(`\n======================================================`);
  console.log(`✅ Procesamiento Completado.`);
  console.log(`   Total filas crudas leídas: ${totalRowsProcessed.toLocaleString()}`);
  console.log(`   Filas agrupadas generadas (Caché Indexado): ${outputRecords.length.toLocaleString()}`);
  console.log(`   Archivo guardado en: ${outputFile}`);
  console.log(`======================================================`);
}

processAllCSV().catch(console.error);
