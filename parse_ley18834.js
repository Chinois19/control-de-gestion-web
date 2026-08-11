import * as XLSX from 'xlsx';
import * as fs from 'fs';

try {
  const filePath = 'G:\\Unidades compartidas\\ASUR\\METAS 2026\\Ley 18.834\\RESULTADO METAS 18834 2026 OK.xlsx';
  const fileData = fs.readFileSync(filePath);
  const workbook = XLSX.read(fileData, { type: 'buffer' });
  const sheetName = 'H. Villarrica 2026';
  
  if (!workbook.Sheets[sheetName]) {
    console.error(`Sheet ${sheetName} not found. Available sheets:`, workbook.SheetNames);
    process.exit(1);
  }

  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  fs.writeFileSync('public/data/ley18834_villarrica_raw.json', JSON.stringify(data, null, 2), 'utf8');
  console.log('Successfully saved to public/data/ley18834_villarrica_raw.json');
} catch (e) {
  console.error('Error parsing excel:', e);
}
