const fs = require('fs');
let lines = fs.readFileSync('src/components/ActividadesMedicinaDashboard.jsx', 'utf8').split('\n');

// Current situation:
// Line 1058 (idx 1057): '      )}'  <- closes resumen tab correctly
// Line 1059 (idx 1058): '        <div style={{ display: flex ...'  <- NSP content WITHOUT wrapper
// The NSP tab content has no {activeTab === 'nsp' && ( wrapper
// Also the file has a duplicate close at bottom (two ); } pairs)

// Step 1: Insert the NSP tab opening at index 1058
const nspOpen = [
  '',
  '      {/* Tab: Análisis NSP */}',
  "      {activeTab === 'nsp' && ("
];
lines.splice(1058, 0, ...nspOpen);

// Step 2: Remove the premature ');\n}' at old lines 1189-1190 (now shifted +3 = 1192-1193)
// After the 3-line splice, what was 1188-1193 is now 1191-1196
// old: 1188='  );', 1189='}', 1190='    </div>', 1191='  );', 1192='}', 1193=''
// we want to remove lines at new indices 1191-1192 ('  );' and '}') - the first duplicate pair

console.log('Before fix, lines around 1190-1200:');
lines.slice(1188, 1200).forEach((l, i) => console.log((1189 + i) + ': ' + JSON.stringify(l)));

// Remove the first ); } pair (indices 1191 and 1192, 0-based)
lines.splice(1191, 2);

console.log('\nAfter fix, last 8 lines:');
lines.slice(-8).forEach((l, i) => console.log((lines.length - 7 + i) + ': ' + JSON.stringify(l)));

fs.writeFileSync('src/components/ActividadesMedicinaDashboard.jsx', lines.join('\n'), 'utf8');
console.log('\nDone. Total lines:', lines.length);
