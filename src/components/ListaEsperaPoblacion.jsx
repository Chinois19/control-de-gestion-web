import React, { useMemo, useState } from 'react';

/* ── Coordenadas SVG aproximadas de comunas de la Araucanía (IX Región) ── */
/* Sistema: origin top-left, W=520, H=620, latlon aproximado mapeado a SVG */
const COMUNAS_MAP = {
  'VILLARRICA':       { x: 320, y: 390, alias: ['VILLARRICA'] },
  'PUCON':            { x: 355, y: 415, alias: ['PUCON','PUCÓN'] },
  'LONCOCHE':         { x: 275, y: 340, alias: ['LONCOCHE'] },
  'CURARREHUE':       { x: 395, y: 430, alias: ['CURARREHUE'] },
  'TEMUCO':           { x: 200, y: 250, alias: ['TEMUCO'] },
  'PITRUFQUEN':       { x: 235, y: 310, alias: ['PITRUFQUEN','PITRUFQUÉN'] },
  'FREIRE':           { x: 215, y: 335, alias: ['FREIRE'] },
  'PANGIPULLI':       { x: 340, y: 360, alias: ['PANGIPULLI','PANGUIPULLI'] },
  'DONIHUE':          { x: 155, y: 195, alias: ['DONIHUE'] },
  'GORBEA':           { x: 240, y: 285, alias: ['GORBEA'] },
  'NUEVA IMPERIAL':   { x: 175, y: 285, alias: ['NUEVA IMPERIAL'] },
  'PADRE LAS CASAS':  { x: 205, y: 265, alias: ['PADRE LAS CASAS'] },
  'CUNCO':            { x: 280, y: 295, alias: ['CUNCO'] },
  'MELIPEUCO':        { x: 305, y: 340, alias: ['MELIPEUCO'] },
  'TOLTEN':           { x: 195, y: 370, alias: ['TOLTEN','TOLTÉN'] },
  'TEODORO SCHMIDT':  { x: 175, y: 350, alias: ['TEODORO SCHMIDT'] },
  'SAAVEDRA':         { x: 140, y: 310, alias: ['SAAVEDRA'] },
  'CARAHUE':          { x: 155, y: 330, alias: ['CARAHUE'] },
  'LUMACO':           { x: 145, y: 225, alias: ['LUMACO'] },
  'ERCILLA':          { x: 155, y: 185, alias: ['ERCILLA'] },
  'COLLIPULLI':       { x: 165, y: 165, alias: ['COLLIPULLI'] },
  'ANGOL':            { x: 140, y: 145, alias: ['ANGOL'] },
  'RENAICO':          { x: 130, y: 130, alias: ['RENAICO'] },
  'TRAIGUEN':         { x: 160, y: 148, alias: ['TRAIGUEN'] },
  'VICTORIA':         { x: 185, y: 138, alias: ['VICTORIA'] },
  'CURACAUTIN':       { x: 230, y: 180, alias: ['CURACAUTIN','CURACAUTÍN'] },
  'LONQUIMAY':        { x: 300, y: 210, alias: ['LONQUIMAY'] },
  'PERQUENCO':        { x: 195, y: 210, alias: ['PERQUENCO'] },
  'GALVARINO':        { x: 175, y: 235, alias: ['GALVARINO'] },
  'CHOLCHOL':         { x: 165, y: 255, alias: ['CHOLCHOL'] },
  'PUENTE ALTO':      { x: 95, y: 140, alias: ['PUENTE ALTO'] },
  'LOS SAUCES':       { x: 140, y: 168, alias: ['LOS SAUCES'] },
  'PUREN':            { x: 130, y: 190, alias: ['PUREN','PURÉN'] },
  'LICANTEN':         { x: 120, y: 205, alias: ['LICANTEN'] },
  'TOLTÉN':           { x: 195, y: 370, alias: [] },
  'VILCUN':           { x: 250, y: 265, alias: ['VILCUN','VILCÚN'] },
};

/* Normalize commune name to match map key */
function normalizeComuna(raw) {
  if (!raw) return null;
  const upper = raw.toUpperCase().trim();
  for (const [key, val] of Object.entries(COMUNAS_MAP)) {
    if (key === upper || val.alias.includes(upper)) return key;
  }
  return null;
}

/* ── Age bands for pyramid ── */
const AGE_BANDS = [
  { label: '0-9',   min: 0,  max: 9  },
  { label: '10-19', min: 10, max: 19 },
  { label: '20-29', min: 20, max: 29 },
  { label: '30-39', min: 30, max: 39 },
  { label: '40-49', min: 40, max: 49 },
  { label: '50-59', min: 50, max: 59 },
  { label: '60-69', min: 60, max: 69 },
  { label: '70-79', min: 70, max: 79 },
  { label: '80-89', min: 80, max: 89 },
  { label: '90+',   min: 90, max: 200 },
];

/* ── Population Pyramid ── */
function Piramide({ records }) {
  const data = useMemo(() => {
    const recs = records.filter(r => r.edad != null && (r.sexo === 'MUJER' || r.sexo === 'HOMBRE'));
    return AGE_BANDS.map(b => {
      const m = recs.filter(r => r.sexo === 'MUJER' && r.edad >= b.min && r.edad <= b.max).length;
      const h = recs.filter(r => r.sexo === 'HOMBRE' && r.edad >= b.min && r.edad <= b.max).length;
      return { ...b, mujeres: m, hombres: h };
    });
  }, [records]);

  const maxVal = Math.max(...data.flatMap(d => [d.mujeres, d.hombres])) || 1;
  const total = records.filter(r => r.sexo === 'MUJER' || r.sexo === 'HOMBRE').length;
  const totM = data.reduce((s, d) => s + d.mujeres, 0);
  const totH = data.reduce((s, d) => s + d.hombres, 0);

  const BAR_MAX = 160; // px each side
  const ROW_H = 36;
  const LABEL_W = 44;
  const svgW = BAR_MAX * 2 + LABEL_W + 24;
  const svgH = AGE_BANDS.length * ROW_H + 36;

  return (
    <div style={{ background: 'white', borderRadius: 20, padding: '20px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <h3 style={{ fontWeight: 800, color: '#1e293b', fontSize: '1rem', margin: 0 }}>Pirámide Poblacional</h3>
          <p style={{ fontSize: '0.77rem', color: '#94a3b8', margin: '2px 0 0' }}>Distribución por edad y sexo de pacientes en lista de espera</p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ec4899' }}>{totM.toLocaleString('es-CL')}</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Mujeres ({total ? Math.round(totM/total*100) : 0}%)</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#3b82f6' }}>{totH.toLocaleString('es-CL')}</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Hombres ({total ? Math.round(totH/total*100) : 0}%)</div>
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4, paddingLeft: 4 }}>
        <div style={{ width: BAR_MAX, textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#ec4899' }}>← MUJER</div>
        <div style={{ width: LABEL_W, textAlign: 'center', fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>Edad</div>
        <div style={{ width: BAR_MAX, textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#3b82f6' }}>HOMBRE →</div>
      </div>

      {[...data].reverse().map((d, i) => {
        const wM = Math.round((d.mujeres / maxVal) * BAR_MAX);
        const wH = Math.round((d.hombres / maxVal) * BAR_MAX);
        const pctM = total ? (d.mujeres / total * 100).toFixed(1) : '0';
        const pctH = total ? (d.hombres / total * 100).toFixed(1) : '0';
        return (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}
            title={`${d.label} años | Mujeres: ${d.mujeres.toLocaleString('es-CL')} (${pctM}%) | Hombres: ${d.hombres.toLocaleString('es-CL')} (${pctH}%)`}>
            {/* Mujer bar (RTL) */}
            <div style={{ width: BAR_MAX, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}>
              {d.mujeres > 0 && <span style={{ fontSize: '0.64rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{d.mujeres.toLocaleString('es-CL')}</span>}
              <div style={{ width: wM, height: 22, borderRadius: '4px 0 0 4px', background: 'linear-gradient(90deg, #f9a8d4, #ec4899)', transition: 'width 0.4s' }} />
            </div>
            {/* Label */}
            <div style={{ width: LABEL_W, textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#475569', flexShrink: 0 }}>{d.label}</div>
            {/* Hombre bar (LTR) */}
            <div style={{ width: BAR_MAX, display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: wH, height: 22, borderRadius: '0 4px 4px 0', background: 'linear-gradient(90deg, #93c5fd, #3b82f6)', transition: 'width 0.4s' }} />
              {d.hombres > 0 && <span style={{ fontSize: '0.64rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{d.hombres.toLocaleString('es-CL')}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Mapa de Comunas Araucanía ── */
function MapaAraucania({ records }) {
  const [hov, setHov] = useState(null);

  const comunaData = useMemo(() => {
    const m = {};
    records.forEach(r => {
      const key = normalizeComuna(r.comuna);
      if (!key) return;
      if (!m[key]) m[key] = 0;
      m[key]++;
    });
    return m;
  }, [records]);

  const maxCount = Math.max(...Object.values(comunaData), 1);
  const total = records.length;

  // Bubble radius: 6 to 36
  const getR = count => 6 + Math.sqrt(count / maxCount) * 30;

  const comunasConDatos = Object.entries(COMUNAS_MAP)
    .map(([key, val]) => ({ key, ...val, count: comunaData[key] || 0 }))
    .filter(d => d.count > 0)
    .sort((a, b) => b.count - a.count);

  const topComunas = comunasConDatos.slice(0, 5);

  return (
    <div style={{ background: 'white', borderRadius: 20, padding: '20px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <h3 style={{ fontWeight: 800, color: '#1e293b', fontSize: '1rem', margin: 0 }}>Procedencia Geográfica</h3>
          <p style={{ fontSize: '0.77rem', color: '#94a3b8', margin: '2px 0 0' }}>Comunas de origen de los pacientes en lista de espera · Araucanía</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Comunas con datos</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6366f1' }}>{comunasConDatos.length}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* SVG Map */}
        <div style={{ flex: 1, position: 'relative' }}>
          <svg width="100%" viewBox="60 110 360 340" style={{ display: 'block', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', borderRadius: 12 }}>
            {/* Region outline (simplified polygon) */}
            <polygon points="140,120 230,115 320,130 400,155 420,200 410,260 390,320 350,390 310,430 260,440 200,430 160,410 130,370 110,310 100,240 105,180 120,145"
              fill="rgba(226,232,240,0.6)" stroke="#cbd5e1" strokeWidth="1.5" />

            {/* Bubbles */}
            {comunasConDatos.map(d => {
              const r = getR(d.count);
              const isH = hov === d.key;
              const pct = total ? (d.count / total * 100).toFixed(1) : '0';
              return (
                <g key={d.key} onMouseEnter={() => setHov(d.key)} onMouseLeave={() => setHov(null)}>
                  <circle cx={d.x} cy={d.y} r={isH ? r + 3 : r}
                    fill={isH ? '#4f46e5' : '#6366f1'} fillOpacity={isH ? 0.9 : 0.65}
                    stroke="white" strokeWidth={isH ? 2.5 : 1.5}
                    style={{ transition: 'all 0.15s', cursor: 'default', filter: isH ? 'drop-shadow(0 2px 6px rgba(99,102,241,0.5))' : 'none' }} />
                  {r > 14 && (
                    <text x={d.x} y={d.y + 4} textAnchor="middle" fill="white" fontSize={r > 22 ? 9 : 7} fontWeight="700" style={{ pointerEvents: 'none' }}>
                      {d.count > 999 ? `${(d.count/1000).toFixed(1)}k` : d.count}
                    </text>
                  )}
                  {/* Tooltip */}
                  {isH && (
                    <g>
                      <rect x={d.x + r + 4} y={d.y - 28} width={130} height={54} rx={6}
                        fill="white" stroke="#e2e8f0" strokeWidth={1}
                        style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.12))' }} />
                      <text x={d.x + r + 10} y={d.y - 14} fontSize={9} fontWeight={800} fill="#1e293b">{d.key}</text>
                      <text x={d.x + r + 10} y={d.y + 2} fontSize={8.5} fill="#6366f1">Pacientes: <tspan fontWeight={700}>{d.count.toLocaleString('es-CL')}</tspan></text>
                      <text x={d.x + r + 10} y={d.y + 16} fontSize={8.5} fill="#94a3b8">% del total: <tspan fontWeight={700} fill="#475569">{pct}%</tspan></text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Labels for top communes */}
            {topComunas.map(d => (
              <text key={`lbl-${d.key}`} x={d.x} y={d.y + getR(d.count) + 11}
                textAnchor="middle" fill="#334155" fontSize={7.5} fontWeight={600}
                style={{ pointerEvents: 'none' }}>
                {d.key.length > 12 ? d.key.substring(0, 10) + '…' : d.key}
              </text>
            ))}
          </svg>

          {/* Scale legend */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8, justifyContent: 'center' }}>
            {[['< 100', 8], ['100-500', 14], ['> 500', 22]].map(([lbl, r]) => (
              <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: r*2, height: r*2, borderRadius: '50%', background: '#6366f1', opacity: 0.65, flexShrink: 0 }} />
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 8 }}>Top comunas</div>
          {comunasConDatos.slice(0, 12).map((d, i) => {
            const pct = total ? (d.count / total * 100).toFixed(1) : '0';
            return (
              <div key={d.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', width: 14, textAlign: 'right', fontWeight: 700 }}>{i+1}</span>
                  <span style={{ fontSize: '0.73rem', color: '#1e293b', fontWeight: 600 }}>{d.key.length > 16 ? d.key.substring(0,14)+'…' : d.key}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.73rem', fontWeight: 800, color: '#6366f1' }}>{d.count.toLocaleString('es-CL')}</div>
                  <div style={{ fontSize: '0.64rem', color: '#94a3b8' }}>{pct}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Main export ── */
export default function ListaEsperaPoblacion({ records }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Piramide records={records} />
      <MapaAraucania records={records} />
    </div>
  );
}
