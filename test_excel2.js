import pkg from 'xlsx';
const { readFile, utils } = pkg;

const path = 'C:\\Users\\gonza\\OneDrive\\Aplicaciones Antigravity\\Control de Gestion Web\\src\\data\\SIGCOM\\SIGCOM 2026\\(1) Enero\\Formato_4_Producción_CC_Finales.xlsx';
try {
  const workbook = readFile(path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = utils.sheet_to_json(sheet, { header: 1 });
  
  console.log('Formato 4 first 10 rows:');
  console.log(data.slice(0, 10));
} catch (error) {
  console.error(error);
}
