import pkg from 'xlsx';
const { readFile, utils } = pkg;

const path = 'C:\\Users\\gonza\\OneDrive\\Aplicaciones Antigravity\\Control de Gestion Web\\src\\data\\SIGCOM\\SIGCOM 2026\\(1) Enero\\Cubo 9_2026_01_121121_Hospital de Villarrica.xlsx';
try {
  const workbook = readFile(path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = utils.sheet_to_json(sheet, { header: 1 });
  
  console.log('Column B (Index 1) values:');
  const colB = data.map(r => r[1]).filter(Boolean);
  console.log(colB);

  // Check how TOTAL is written
  console.log('Total row:', data.find(r => r[1] === 'TOTAL' || r[1] === 'Total' || r[1] === 'total'));
  
} catch (error) {
  console.error(error);
}
