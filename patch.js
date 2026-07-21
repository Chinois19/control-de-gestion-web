
const fs = require('fs');
let code = fs.readFileSync('src/components/SurgicalDashboard.jsx', 'utf-8');

// 1. Add crrData state
code = code.replace(
  'const [tablaData, setTablaData] = useState([]);',
  'const [tablaData, setTablaData] = useState([]);\n  const [crrData, setCrrData] = useState([]);'
);

// 2. Fetch crrData
code = code.replace(
  '        const [tablaRes, dispRes, libroRes, grdRes] = await Promise.all([',
  '        const [tablaRes, dispRes, libroRes, grdRes, crrRes] = await Promise.all(['
);
code = code.replace(
  '          fetch(\'/data/valorizacion_grd.json\').catch(() => ({ json: () => ([]) }))',
  '          fetch(\'/data/valorizacion_grd.json\').catch(() => ({ json: () => ([]) })),\n          fetch(\'/data/subconjunto_crr_mapped.json\').catch(() => ({ json: () => ({ records: [] }) }))'
);

code = code.replace(
  '        const grdJson = await grdRes.json();',
  '        const grdJson = await grdRes.json();\n        const crrJson = await crrRes.json();'
);

code = code.replace(
  '        setTablaData(tablaJson.records || []);',
  '        setTablaData(tablaJson.records || []);\n        setCrrData(crrJson.records || []);'
);

// 3. Define currentTablaData
code = code.replace(
  '  // Compute Unique Filters for Tabla',
  '  const currentTablaData = activeTab === \'informe-crr\' ? crrData : tablaData;\n\n  // Compute Unique Filters for Tabla'
);

// 4. Update tablaData references to currentTablaData in useMemos
code = code.replace(/tablaData\.forEach/g, 'currentTablaData.forEach');
code = code.replace(/return tablaData\.filter/g, 'return currentTablaData.filter');
code = code.replace(/\[tablaData\]/g, '[currentTablaData]');
code = code.replace(/\[tablaData,/g, '[currentTablaData,');

// 5. Add button to UI
code = code.replace(
  '        </button>\\n      </div>',
  '        </button>\n        <button\n          onClick={() => setActiveTab(\'informe-crr\')}\n          style={{ padding: \'8px 16px\', background: activeTab === \'informe-crr\' ? \'white\' : \'transparent\', color: activeTab === \'informe-crr\' ? \'#3b82f6\' : \'#64748b\', border: \'none\', borderRadius: \'8px\', cursor: \'pointer\', fontWeight: 600, fontSize: \'0.875rem\', boxShadow: activeTab === \'informe-crr\' ? \'0 2px 4px rgba(0,0,0,0.05)\' : \'none\', transition: \'all 0.2s\' }}\n        >\n          Informe CRR (Temp)\n        </button>\n      </div>'
);

// 6. Sidebar render condition
code = code.replace(
  '// Sidebar for \\'tabla\\'',
  '// Sidebar for \\'tabla\\' and \\'informe-crr\\''
);
code = code.replace(
  'if (activeTab === \\'tabla\\') {',
  'if (activeTab === \'tabla\' || activeTab === \'informe-crr\') {'
);

fs.writeFileSync('src/components/SurgicalDashboard.jsx', code);
console.log('Patched Successfully');

