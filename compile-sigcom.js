import fs from 'fs';
import path from 'path';
import pkg from 'xlsx';
const { readFile, utils } = pkg;

const SIGCOM_DATA_DIR = path.join(process.cwd(), 'src', 'data', 'SIGCOM');
const OUTPUT_FILE = path.join(process.cwd(), 'src', 'data', 'sigcom_data.json');

const extractMonth = (folderName) => {
  const match = folderName.match(/\((\d+)\)/);
  return match ? parseInt(match[1], 10) : null;
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
      const cuboFile = files.find(f => f.startsWith('Cubo 9') && f.endsWith('.xlsx'));
      const formato4File = files.find(f => f.startsWith('Formato_4') && f.endsWith('.xlsx'));

      if (!cuboFile) continue;

      console.log(`Processing: ${year}-${month}`);

      // 1. Read Production Data
      const productionMap = {}; // ccName -> { 'Egreso': 100, ... }
      if (formato4File) {
        try {
          const f4Path = path.join(monthPath, formato4File);
          const f4Workbook = readFile(f4Path);
          const f4Data = utils.sheet_to_json(f4Workbook.Sheets[f4Workbook.SheetNames[0]], { header: 1 });
          
          for (let i = 2; i < f4Data.length; i++) {
            const row = f4Data[i];
            const cc = row[2];
            const unit = row[4];
            const val = parseFloat(row[5]);
            if (cc && unit && !isNaN(val)) {
              if (!productionMap[cc]) productionMap[cc] = {};
              productionMap[cc][unit] = val;
            }
          }
        } catch (e) {
          console.error(`Error reading Formato 4 for ${year}-${month}`);
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
          const totalVal = rrhhVal + ggVal + insumosVal;

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

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({
    lastUpdated: new Date().toISOString(),
    data: existingData
  }, null, 2));
  console.log(`Compilation complete. Saved ${existingData.length} records.`);
};

compileData();
