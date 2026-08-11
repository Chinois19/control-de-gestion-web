const fs = require('fs');
let f = fs.readFileSync('src/components/LaboratoryDashboard.jsx', 'utf8');
f = f.replace(/\\\`/g, '`').replace(/\\\$\{/g, '${');
fs.writeFileSync('src/components/LaboratoryDashboard.jsx', f);
