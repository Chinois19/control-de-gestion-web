const fs = require('fs');
const path = require('path');

const distDataDir = path.join(__dirname, '..', 'dist', 'data');
const MAX_BYTES = 20 * 1024 * 1024; // 20 MiB limit (Cloudflare limit is 25 MiB)

if (fs.existsSync(distDataDir)) {
  const files = fs.readdirSync(distDataDir);
  let cleanedCount = 0;

  files.forEach(file => {
    const filePath = path.join(distDataDir, file);
    const stat = fs.statSync(filePath);

    if (stat.isFile() && stat.size > MAX_BYTES) {
      const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);
      const gzPath = filePath + '.gz';

      // If .gz version exists or file is a giant json, remove the oversized plain json
      if (fs.existsSync(gzPath) || file.endsWith('.json')) {
        fs.unlinkSync(filePath);
        console.log(`[postbuild-clean] Removido archivo excedente (>24MB): ${file} (${sizeMB} MB)`);
        cleanedCount++;
      }
    }
  });

  if (cleanedCount === 0) {
    console.log('[postbuild-clean] Todos los archivos en dist/data cumplen con el límite de 24 MB.');
  }
}
