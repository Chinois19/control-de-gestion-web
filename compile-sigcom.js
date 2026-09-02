import fs from 'fs';
import path from 'path';
import pkg from 'xlsx';
const { readFile, utils } = pkg;

const G_DRIVE_SIGCOM_DIR = 'G:\\Unidades compartidas\\ASUR\\SIGCOM';
const LOCAL_SIGCOM_DIR = path.join(process.cwd(), 'src', 'data', 'SIGCOM');

const syncFromGDrive = () => {
  if (!fs.existsSync(G_DRIVE_SIGCOM_DIR)) {
    console.log('G Drive SIGCOM directory not detected. Using local SIGCOM data.');
    return;
  }
  console.log('G Drive SIGCOM directory detected. Syncing new files to local repository...');
  
  if (!fs.existsSync(LOCAL_SIGCOM_DIR)) {
    fs.mkdirSync(LOCAL_SIGCOM_DIR, { recursive: true });
  }

  const gAgrupaciones = path.join(G_DRIVE_SIGCOM_DIR, 'Agrupaciones SIGCOM.xlsx');
  const lAgrupaciones = path.join(LOCAL_SIGCOM_DIR, 'Agrupaciones SIGCOM.xlsx');
  if (fs.existsSync(gAgrupaciones)) {
    try {
      fs.copyFileSync(gAgrupaciones, lAgrupaciones);
      console.log('Synced Agrupaciones SIGCOM.xlsx');
    } catch (e) {
      console.error('Failed to sync Agrupaciones SIGCOM.xlsx:', e.message);
    }
  }

  const years = ['SIGCOM 2025', 'SIGCOM 2026'];
  for (const year of years) {
    const gYearPath = path.join(G_DRIVE_SIGCOM_DIR, year);
    const lYearPath = path.join(LOCAL_SIGCOM_DIR, year);
    if (!fs.existsSync(gYearPath)) continue;

    if (!fs.existsSync(lYearPath)) {
      fs.mkdirSync(lYearPath, { recursive: true });
    }

    const months = fs.readdirSync(gYearPath);
    for (const month of months) {
      const gMonthPath = path.join(gYearPath, month);
      const lMonthPath = path.join(lYearPath, month);
      if (!fs.statSync(gMonthPath).isDirectory()) continue;

      if (!fs.existsSync(lMonthPath)) {
        fs.mkdirSync(lMonthPath, { recursive: true });
      }

      const files = fs.readdirSync(gMonthPath);
      for (const file of files) {
        const gFilePath = path.join(gMonthPath, file);
        const lFilePath = path.join(lMonthPath, file);
        if (fs.statSync(gFilePath).isFile()) {
          let shouldCopy = false;
          if (!fs.existsSync(lFilePath)) {
            shouldCopy = true;
          } else {
            const gStat = fs.statSync(gFilePath);
            const lStat = fs.statSync(lFilePath);
            if (gStat.size !== lStat.size || gStat.mtimeMs > lStat.mtimeMs) {
              shouldCopy = true;
            }
          }
          if (shouldCopy) {
            try {
              fs.copyFileSync(gFilePath, lFilePath);
              console.log(`Synced file: ${year}/${month}/${file}`);
            } catch (e) {
              console.error(`Failed to sync file ${file}:`, e.message);
            }
          }
        }
      }
    }
  }
};

syncFromGDrive();

const SIGCOM_DATA_DIR = LOCAL_SIGCOM_DIR;
const OUTPUT_FILE = path.join(process.cwd(), 'src', 'data', 'sigcom_data.json');
const AGRUPACIONES_FILE = path.join(SIGCOM_DATA_DIR, 'Agrupaciones SIGCOM.xlsx');

const extractMonth = (folderName) => {
  const match = folderName.match(/\((\d+)\)/);
  return match ? parseInt(match[1], 10) : null;
};

const cleanName = (name) => {
  return String(name)
    .replace(/^\d+\s*/, '') // remove leading numbers
    .replace(/\s*\(.*?\)/g, '') // remove anything in parentheses
    .trim();
};

const compileData = () => {
  let existingData = [];
  
  console.log('Forcing full rebuild with Production and Detailed Insumos...');

  const years = ['SIGCOM 2025', 'SIGCOM 2026'];
  for (const yearFolder of years) {
    const yearPath = path.join(SIGCOM_DATA_DIR, yearFolder);
    if (!fs.existsSync(yearPath)) continue;

    const year = parseInt(yearFolder.replace('SIGCOM ', ''), 10);
    const months = fs.readdirSync(yearPath);

    for (const monthFolder of months) {
      const monthPath = path.join(yearPath, monthFolder);
      if (!fs.statSync(monthPath).isDirectory()) continue;

      const month = extractMonth(monthFolder);
      if (!month) continue;

      const files = fs.readdirSync(monthPath);
      const monthStr = month.toString().padStart(2, '0');
      const cuboFile = files.find(f => f.startsWith('Cubo 9') && f.includes(`_${monthStr}_`) && (f.endsWith('.xlsx') || f.endsWith('.xls')));
      const formato4File = files.find(f => (f.startsWith('Formato_4') || f.startsWith('Planilla_4')) && (f.endsWith('.xlsx') || f.endsWith('.xls')));

      if (!cuboFile) continue;

      console.log(`Processing: ${year}-${month}`);

      // 1. Read Production Data
      const productionMap = {}; // ccName -> { 'Egreso': 100, ... }
      if (formato4File) {
        try {
          const f4Path = path.join(monthPath, formato4File);
          const f4Workbook = readFile(f4Path);
          const f4Data = utils.sheet_to_json(f4Workbook.Sheets[f4Workbook.SheetNames[0]], { header: 1 });
          
          // Auto-detect column layout:
          // Formato_4 (.xlsx): fila 1=header, datos desde fila 2: col2=CC, col4=unidad, col5=valor
          // Planilla_4 (.xls): sin header, datos desde fila 0:  col1=CC, col3=unidad, col4=valor
          const isPlanilla4 = formato4File.startsWith('Planilla_4');
          const startRow = isPlanilla4 ? 0 : 2;
          const ccCol    = isPlanilla4 ? 1 : 2;
          const unitCol  = isPlanilla4 ? 3 : 4;
          const valCol   = isPlanilla4 ? 4 : 5;

          if (isPlanilla4) {
            console.log(`  → Planilla_4 layout detectado (startRow=${startRow}, cc=col${ccCol}, unit=col${unitCol}, val=col${valCol})`);
          }

          for (let i = startRow; i < f4Data.length; i++) {
            const row = f4Data[i];
            const cc = row[ccCol];
            const unit = row[unitCol];
            const val = parseFloat(row[valCol]);
            if (cc && unit && !isNaN(val) && val > 0) {
              if (!productionMap[cc]) productionMap[cc] = {};
              productionMap[cc][unit] = (productionMap[cc][unit] || 0) + val;
            }
          }
        } catch (e) {
          console.error(`Error reading Formato 4 for ${year}-${month}:`, e.message);
        }
      }

      // 2. Read Cost Data
      const filePath = path.join(monthPath, cuboFile);
      try {
        const workbook = readFile(filePath);
        const data = utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });

        const ccNames = data[1] || [];
        
        let rrhhRow = data.find(row => row[1] === 'RECURSO HUMANO');
        let ggRow = data.find(row => row[1] === 'Bienes y Servicios de Consumo' || row[1] === 'GASTOS GENERALES' || row[1] === 'BIENES Y SERVICIOS DE CONSUMO');
        
        let insumosIndex = data.findIndex(row => row[1] === 'INSUMOS');
        let directosIndex = data.findIndex(row => row[1] === 'DIRECTOS');
        
        const insumosRow = data[insumosIndex];
        const directosRow = data[directosIndex];
        const indirectosRow = data.find(row => row[1] === 'INDIRECTOS');
        const totalGeneralRow = data.find(row => row[1] === 'TOTAL GENERAL');
        
        // Extract sub-insumos
        const detailedInsumosRows = [];
        if (insumosIndex > -1 && directosIndex > insumosIndex) {
          for (let i = insumosIndex + 1; i < directosIndex; i++) {
            if (data[i] && data[i][1]) {
              detailedInsumosRows.push(data[i]);
            }
          }
        }

        const getVal = (row, colIdx) => row ? (parseFloat(row[colIdx]) || 0) : 0;

        for (let col = 2; col < ccNames.length; col++) {
          const cc = ccNames[col];
          if (!cc) continue;

          const rrhhVal = getVal(rrhhRow, col);
          const ggVal = getVal(ggRow, col);
          const insumosVal = getVal(insumosRow, col);
          const directosVal = getVal(directosRow, col) || (rrhhVal + ggVal + insumosVal);
          const indirectosVal = getVal(indirectosRow, col);
          const totalVal = getVal(totalGeneralRow, col) || (directosVal + indirectosVal);

          if (totalVal > 0 || (productionMap[cc] && Object.keys(productionMap[cc]).length > 0)) {
            
            const insumosBreakdown = {};
            detailedInsumosRows.forEach(r => {
              const val = getVal(r, col);
              if (val > 0) insumosBreakdown[r[1]] = val;
            });

            // Find the primary production metric (Egreso, Intervencion, Consulta)
            const prodObj = productionMap[cc] || {};
            let prodTotal = 0;
            // Common primary metrics for MINSAL bands:
            if (prodObj['Egreso']) prodTotal = prodObj['Egreso'];
            else if (prodObj['DCO']) prodTotal = prodObj['DCO'];
            else if (prodObj['Intervenciones Quirurgicas'] || prodObj['Intervención Quirúrgica']) prodTotal = prodObj['Intervenciones Quirurgicas'] || prodObj['Intervención Quirúrgica'];
            else if (prodObj['Consulta']) prodTotal = prodObj['Consulta'];
            else {
              // fallback: sum of whatever is there
              prodTotal = Object.values(prodObj).reduce((a, b) => a + b, 0);
            }

            existingData.push({
              id: `${year}-${month}-${col}`,
              year,
              month,
              costCenter: cc,
              rrhh: rrhhVal,
              gastosGenerales: ggVal,
              insumos: insumosVal,
              directos: directosVal,
              indirectos: indirectosVal,
              total: totalVal,
              productionDetails: prodObj,
              productionTotal: prodTotal,
              insumosBreakdown
            });
          }
        }
      } catch (err) {
        console.error(`Failed to process ${filePath}:`, err.message);
      }
    }
  }

  // 3. Read Agrupaciones & Bands
  let groupings = {};
  let bands = {};

  if (fs.existsSync(AGRUPACIONES_FILE)) {
    try {
      console.log('Reading Agrupaciones SIGCOM Excel...');
      const workbook = readFile(AGRUPACIONES_FILE);
      
      // Parse Agrupaciones CC
      const sheetCC = workbook.Sheets['Agrupaciones CC'];
      if (sheetCC) {
        const dataCC = utils.sheet_to_json(sheetCC, { header: 1 });
        let currentGroup = null;
        for (const row of dataCC) {
          if (!row || row.length === 0) continue;
          const col0 = String(row[0]).trim();
          const col1 = String(row[1]).trim();
          
          if (col0 === 'Cod') {
            currentGroup = col1;
            groupings[currentGroup] = [];
          } else if (currentGroup && row[0] !== undefined) {
            const code = parseInt(row[0], 10);
            const rawName = String(row[1]).trim();
            const clean = cleanName(rawName);
            groupings[currentGroup].push({ code, name: rawName, cleanName: clean });
          }
        }
        console.log(`Parsed ${Object.keys(groupings).length} groups from Excel.`);
      }

      // Parse Banda de costos
      const sheetBands = workbook.Sheets['Banda de costos '];
      if (sheetBands) {
        const dataBands = utils.sheet_to_json(sheetBands, { header: 1 });
        for (let i = 1; i < dataBands.length; i++) {
          const row = dataBands[i];
          if (!row || row.length === 0) continue;
          const name = String(row[0]).trim();
          const promedio = parseFloat(row[1]);
          const limiteInferior = parseFloat(row[2]);
          const marcaInferior = parseFloat(row[3]);
          let marcaSuperior = parseFloat(row[4]);
          const limiteSuperior = parseFloat(row[5]);

          // Typo correction for UTI marcaSuperior (e.g. 9100 -> 910000)
          if (name === 'UTI' && marcaSuperior === 9100) {
            marcaSuperior = 910000;
          }

          bands[name] = {
            promedio,
            limiteInferior,
            marcaInferior,
            marcaSuperior,
            limiteSuperior
          };
        }
        console.log(`Parsed bands for: ${Object.keys(bands).join(', ')}`);
      }
    } catch (err) {
      console.error('Failed to parse Agrupaciones SIGCOM.xlsx:', err.message);
    }
  } else {
    console.warn('Agrupaciones SIGCOM.xlsx file not found in SIGCOM directory.');
  }

  // Save everything to output file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({
    lastUpdated: new Date().toISOString(),
    groupings,
    bands,
    data: existingData
  }, null, 2));
  console.log(`Compilation complete. Saved ${existingData.length} records to ${OUTPUT_FILE}`);
};

compileData();
