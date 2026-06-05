const fs = require('fs');
const oldC = fs.readFileSync('src/components/SurgicalDashboard_old.jsx', 'utf8');
const newC = fs.readFileSync('src/components/SurgicalDashboard.jsx', 'utf8');

const tStart = oldC.indexOf('{activeTab === \'tabla\' &&');
const dStart = oldC.indexOf('{activeTab === \'disponibilidad\' &&');
const lStart = oldC.indexOf('{activeTab === \'libro\' &&');

if (tStart === -1 || dStart === -1 || lStart === -1) {
  console.log('Could not find markers');
  process.exit(1);
}

const tablaStr = oldC.substring(tStart, dStart);
const dispStr = oldC.substring(dStart, lStart);

const targetReplace = `{/* OTHER TABS: Keep existing logic for TABLA and DISPONIBILIDAD */}
      {activeTab !== 'libro' && (
        <div style={{ padding: '32px', flex: 1 }}>
          <div className="glass-panel" style={{ background: 'white', padding: '32px', borderRadius: '24px' }}>
            <h2 style={{ marginTop: 0 }}>Módulo en Construcción</h2>
            <p>La vista seleccionada ({activeTab}) se ha omitido temporalmente para centrarse en las Estadísticas del Libro.</p>
          </div>
        </div>
      )}`;

const toReplace = `<div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
${tablaStr}
${dispStr}
</div>`;

const newOut = newC.replace(targetReplace, toReplace);
fs.writeFileSync('src/components/SurgicalDashboard.jsx', newOut, 'utf8');
console.log('Merged successfully');
