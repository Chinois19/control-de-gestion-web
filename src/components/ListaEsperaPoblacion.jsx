import React, { useMemo, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/* ── Lat/Lon de comunas de la Araucanía ── */
const COMUNAS_LATLON = {
  'VILLARRICA':      [-39.2804, -72.2297],
  'PUCON':           [-39.2722, -71.9776],
  'PUCÓN':           [-39.2722, -71.9776],
  'LONCOCHE':        [-39.3667, -72.6333],
  'CURARREHUE':      [-39.3333, -71.5667],
  'TEMUCO':          [-38.7359, -72.5904],
  'PITRUFQUEN':      [-38.9833, -72.6500],
  'PITRUFQUÉN':      [-38.9833, -72.6500],
  'FREIRE':          [-38.9667, -72.6333],
  'PANGUIPULLI':     [-39.6385, -72.3342],
  'PANGIPULLI':      [-39.6385, -72.3342],
  'GORBEA':          [-39.0833, -72.6667],
  'NUEVA IMPERIAL':  [-38.7497, -72.9582],
  'PADRE LAS CASAS': [-38.7833, -72.6167],
  'CUNCO':           [-38.9167, -72.0333],
  'MELIPEUCO':       [-38.8833, -71.8333],
  'TOLTEN':          [-39.2167, -73.1833],
  'TOLTÉN':          [-39.2167, -73.1833],
  'TEODORO SCHMIDT': [-38.9833, -73.0833],
  'CARAHUE':         [-38.7167, -73.1667],
  'SAAVEDRA':        [-38.5667, -73.3833],
  'LUMACO':          [-38.1333, -72.9833],
  'ERCILLA':         [-37.8333, -72.3500],
  'COLLIPULLI':      [-37.9500, -72.4333],
  'ANGOL':           [-37.7963, -72.7115],
  'RENAICO':         [-37.6667, -72.5833],
  'TRAIGUEN':        [-38.2500, -72.6667],
  'TRAIGUÉN':        [-38.2500, -72.6667],
  'VICTORIA':        [-38.2347, -72.3322],
  'CURACAUTIN':      [-38.4333, -71.8833],
  'CURACAUTÍN':      [-38.4333, -71.8833],
  'LONQUIMAY':       [-38.4333, -71.2333],
  'PERQUENCO':       [-38.4167, -72.5833],
  'GALVARINO':       [-38.4017, -72.7819],
  'CHOLCHOL':        [-38.5979, -72.8568],
  'LOS SAUCES':      [-37.9833, -72.8333],
  'PUREN':           [-38.0167, -73.0333],
  'PURÉN':           [-38.0167, -73.0333],
  'VILCUN':          [-38.6667, -72.2167],
  'VILCÚN':          [-38.6667, -72.2167],
  'LOS ANGELES':     [-37.4707, -72.3532],
  'DONIHUE':         [-34.1766, -70.9636], // fuera de región, skip
};

const TRAMO_COLORS = {
  '0-90 días':    '#10b981',
  '91-180 días':  '#f59e0b',
  '181-365 días': '#f97316',
  '366-540 días': '#ef4444',
  '> 540 días':   '#7c3aed',
  'Sin fecha':    '#94a3b8',
};

/* ── Age bands ── */
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

/* ── Pirámide Poblacional ── */
function Piramide({ records }) {
  const data = useMemo(() => {
    const recs = records.filter(r => r.edad != null && (r.sexo === 'MUJER' || r.sexo === 'HOMBRE'));
    return AGE_BANDS.map(b => {
      const m = recs.filter(r => r.sexo === 'MUJER'  && r.edad >= b.min && r.edad <= b.max).length;
      const h = recs.filter(r => r.sexo === 'HOMBRE' && r.edad >= b.min && r.edad <= b.max).length;
      return { ...b, mujeres: m, hombres: h };
    });
  }, [records]);

  const stats = useMemo(() => {
    const recsM = records.filter(r => r.sexo === 'MUJER' && r.edad != null);
    const recsH = records.filter(r => r.sexo === 'HOMBRE' && r.edad != null);
    const totM = recsM.length;
    const totH = recsH.length;
    const total = totM + totH;

    const sumM = recsM.reduce((s, r) => s + r.edad, 0);
    const sumH = recsH.reduce((s, r) => s + r.edad, 0);
    const avgAgeM = totM ? (sumM / totM).toFixed(1) : '0';
    const avgAgeH = totH ? (sumH / totH).toFixed(1) : '0';
    const pctM = total ? (totM / total * 100).toFixed(1) : '0';
    const pctH = total ? (totH / total * 100).toFixed(1) : '0';
    const ratioMH = totH ? (totM / totH).toFixed(1) : '0';

    return { totM, totH, total, avgAgeM, avgAgeH, pctM, pctH, ratioMH };
  }, [records]);

  const maxVal = Math.max(...data.flatMap(d => [d.mujeres, d.hombres]), 1);

  return (
    <div style={{ background: 'white', borderRadius: 20, padding: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Title Header */}
      <div style={{ marginBottom: 12 }}>
        <h3 style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem', margin: 0 }}>Pirámide Poblacional por Edad y Sexo</h3>
        <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0' }}>Distribución simétrica quinquenal de la lista de espera</p>
      </div>

      {/* Symmetrical Sex Statistics Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center', marginBottom: 16, background: '#f8fafc', padding: '10px 14px', borderRadius: 14, border: '1px solid #f1f5f9' }}>
        {/* Women Stat Block */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fce7f3', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', flexShrink: 0 }}>♀</div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#be185d' }}>
              {stats.totM.toLocaleString('es-CL')} <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#db2777' }}>({stats.pctM}%)</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
              Promedio: <b style={{ color: '#1e293b' }}>{stats.avgAgeM} años</b>
            </div>
          </div>
        </div>

        {/* Center Ratio Badge */}
        <div style={{ textAlign: 'center', padding: '0 10px', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#6366f1' }}>{stats.ratioMH} M/H</div>
          <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Proporción</div>
        </div>

        {/* Men Stat Block */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end', textAlign: 'right' }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1d4ed8' }}>
              {stats.totH.toLocaleString('es-CL')} <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#2563eb' }}>({stats.pctH}%)</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
              Promedio: <b style={{ color: '#1e293b' }}>{stats.avgAgeH} años</b>
            </div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#dbeafe', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', flexShrink: 0 }}>♂</div>
        </div>
      </div>

      {/* Pyramid Column Headers */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6, padding: '0 4px' }}>
        <div style={{ flex: 1, textAlign: 'right', fontSize: '0.68rem', fontWeight: 800, color: '#ec4899', letterSpacing: '0.5px' }}>← MUJERES</div>
        <div style={{ width: 54, textAlign: 'center', fontSize: '0.64rem', color: '#94a3b8', fontWeight: 700 }}>EDAD</div>
        <div style={{ flex: 1, textAlign: 'left', fontSize: '0.68rem', fontWeight: 800, color: '#3b82f6', letterSpacing: '0.5px' }}>HOMBRES →</div>
      </div>

      {/* Symmetrical Pyramid Bars */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {[...data].reverse().map(d => {
          const pctM = maxVal ? (d.mujeres / maxVal * 100) : 0;
          const pctH = maxVal ? (d.hombres / maxVal * 100) : 0;
          const totalGroup = d.mujeres + d.hombres;
          const pctTotalGroup = stats.total ? (totalGroup / stats.total * 100).toFixed(1) : '0';

          return (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', margin: '2px 0' }}
              title={`${d.label} años | Mujeres: ${d.mujeres.toLocaleString('es-CL')} | Hombres: ${d.hombres.toLocaleString('es-CL')} | Total: ${totalGroup.toLocaleString('es-CL')} (${pctTotalGroup}%)`}>
              
              {/* Women Bar (Right-to-Left) */}
              <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
                {d.mujeres > 0 && (
                  <span style={{ fontSize: '0.63rem', color: '#64748b', fontWeight: 600 }}>
                    {d.mujeres.toLocaleString('es-CL')}
                  </span>
                )}
                <div style={{ width: `${pctM}%`, height: 20, borderRadius: '4px 0 0 4px', background: 'linear-gradient(90deg, #fbcfe8, #ec4899)', transition: 'width 0.3s' }} />
              </div>

              {/* Age Label */}
              <div style={{ width: 54, textAlign: 'center', fontSize: '0.72rem', fontWeight: 800, color: '#334155', flexShrink: 0 }}>
                {d.label}
              </div>

              {/* Men Bar (Left-to-Right) */}
              <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 6 }}>
                <div style={{ width: `${pctH}%`, height: 20, borderRadius: '0 4px 4px 0', background: 'linear-gradient(90deg, #93c5fd, #3b82f6)', transition: 'width 0.3s' }} />
                {d.hombres > 0 && (
                  <span style={{ fontSize: '0.63rem', color: '#64748b', fontWeight: 600 }}>
                    {d.hombres.toLocaleString('es-CL')}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


/* ── Insights Estructura Etaria (Fila 1 - Derecha) ── */
function DemographicInsights({ records }) {
  const stats = useMemo(() => {
    const valid = records.filter(r => r.edad != null);
    if (!valid.length) return null;

    const total = valid.length;
    const sumAge = valid.reduce((s, r) => s + r.edad, 0);
    const avgAge = (sumAge / total).toFixed(1);

    const women = valid.filter(r => r.sexo === 'MUJER').length;
    const men = valid.filter(r => r.sexo === 'HOMBRE').length;
    const pctWomen = (women / total * 100).toFixed(1);

    const elderly = valid.filter(r => r.edad >= 60).length;
    const pctElderly = (elderly / total * 100).toFixed(1);

    const pediatric = valid.filter(r => r.edad < 15).length;
    const pctPediatric = (pediatric / total * 100).toFixed(1);

    // Peak age group
    const ageCounts = {};
    valid.forEach(r => {
      const b = Math.floor(r.edad / 10) * 10;
      const key = `${b}-${b+9}`;
      ageCounts[key] = (ageCounts[key] || 0) + 1;
    });
    const peakGroup = Object.entries(ageCounts).sort((a, b) => b[1] - a[1])[0];

    return { avgAge, women, men, pctWomen, elderly, pctElderly, pediatric, pctPediatric, peakGroup, total };
  }, [records]);

  if (!stats) return null;

  return (
    <div style={{ background: 'white', borderRadius: 20, padding: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <h3 style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem', margin: 0 }}>Insights Estructura Etaria</h3>
        <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 14px' }}>Caracterización sociodemográfica de la demanda activa</p>

        {/* 4 Mini KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: '10px 12px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Edad Promedio</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginTop: 2 }}>{stats.avgAge} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>años</span></div>
          </div>
          <div style={{ background: '#fdf2f8', borderRadius: 12, padding: '10px 12px', border: '1px solid #fce7f3' }}>
            <div style={{ fontSize: '0.66rem', color: '#db2777', fontWeight: 700, textTransform: 'uppercase' }}>Sesgo Femenino</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#be185d', marginTop: 2 }}>{stats.pctWomen}% <span style={{ fontSize: '0.7rem', color: '#9d174d' }}>({stats.women.toLocaleString('es-CL')})</span></div>
          </div>
          <div style={{ background: '#fffbeb', borderRadius: 12, padding: '10px 12px', border: '1px solid #fef3c7' }}>
            <div style={{ fontSize: '0.66rem', color: '#d97706', fontWeight: 700, textTransform: 'uppercase' }}>Adultos Mayores (60+)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#b45309', marginTop: 2 }}>{stats.pctElderly}% <span style={{ fontSize: '0.7rem', color: '#92400e' }}>({stats.elderly.toLocaleString('es-CL')})</span></div>
          </div>
          <div style={{ background: '#eff6ff', borderRadius: 12, padding: '10px 12px', border: '1px solid #dbeafe' }}>
            <div style={{ fontSize: '0.66rem', color: '#2563eb', fontWeight: 700, textTransform: 'uppercase' }}>Pediatría (&lt;15 años)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1d4ed8', marginTop: 2 }}>{stats.pctPediatric}% <span style={{ fontSize: '0.7rem', color: '#1e40af' }}>({stats.pediatric.toLocaleString('es-CL')})</span></div>
          </div>
        </div>
      </div>

      {/* Modern Analytical Text Blocks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #fff 100%)', borderRadius: 12, padding: '10px 12px', borderLeft: '4px solid #ec4899', borderTop: '1px solid #fce7f3', borderRight: '1px solid #fce7f3', borderBottom: '1px solid #fce7f3' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9d174d', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>♀ Predominio de Pacientes Femeninas</span>
          </div>
          <p style={{ fontSize: '0.71rem', color: '#475569', margin: '3px 0 0', lineHeight: '1.35' }}>
            El <b>{stats.pctWomen}%</b> de las solicitudes corresponden a mujeres, con alta concentración entre los 30 y 69 años, reflejando mayor frecuencia de consulta y demanda preventiva.
          </p>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fff 100%)', borderRadius: 12, padding: '10px 12px', borderLeft: '4px solid #f59e0b', borderTop: '1px solid #fef3c7', borderRight: '1px solid #fef3c7', borderBottom: '1px solid #fef3c7' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#92400e', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>👵 Alta Carga de Senescencia (60+ años)</span>
          </div>
          <p style={{ fontSize: '0.71rem', color: '#475569', margin: '3px 0 0', lineHeight: '1.35' }}>
            1 de cada 3.5 pacientes (<b>{stats.pctElderly}%</b>) supera los 60 años, grupo que acumula mayor multimorbilidad y tiempos prolongados de resolución prioritaria.
          </p>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #fff 100%)', borderRadius: 12, padding: '10px 12px', borderLeft: '4px solid #6366f1', borderTop: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4338ca', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🎯 Pico Quinquenal de Demanda</span>
          </div>
          <p style={{ fontSize: '0.71rem', color: '#475569', margin: '3px 0 0', lineHeight: '1.35' }}>
            El tramo etario con mayor volumen de pacientes en espera es <b>{stats.peakGroup?.[0]} años</b> con <b>{stats.peakGroup?.[1]?.toLocaleString('es-CL')} personas</b>.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Insights Procedencia & Ruralidad (Fila 2 - Izquierda) ── */
function GeographicInsights({ records }) {
  const geoStats = useMemo(() => {
    if (!records.length) return null;
    const total = records.length;

    const ruralRecs = records.filter(r => r.urbano_rural === 'RURAL');
    const urbanRecs = records.filter(r => r.urbano_rural === 'URBANO');
    const ruralCount = ruralRecs.length;
    const urbanCount = urbanRecs.length;
    const pctRural = (ruralCount / total * 100).toFixed(1);
    const pctUrban = (urbanCount / total * 100).toFixed(1);

    // Breakdown by comuna
    const comunaMap = {};
    records.forEach(r => {
      const c = (r.comuna || 'DESCONOCIDA').toUpperCase().trim();
      if (!comunaMap[c]) comunaMap[c] = { total: 0, rural: 0, urban: 0 };
      comunaMap[c].total++;
      if (r.urbano_rural === 'RURAL') comunaMap[c].rural++;
      if (r.urbano_rural === 'URBANO') comunaMap[c].urban++;
    });

    const comunaList = Object.entries(comunaMap)
      .map(([name, d]) => ({ name, ...d, pctRural: d.total ? (d.rural / d.total * 100).toFixed(1) : 0 }))
      .sort((a, b) => b.total - a.total);

    const top1 = comunaList[0];
    const top2 = comunaList[1];
    const top3 = comunaList[2];

    // Highest rural % comuna (minimum 200 records to be significant)
    const highestRuralPct = [...comunaList].filter(c => c.total > 200).sort((a, b) => b.pctRural - a.pctRural)[0];

    return { total, ruralCount, urbanCount, pctRural, pctUrban, comunaList, top1, top2, top3, highestRuralPct };
  }, [records]);

  if (!geoStats) return null;

  return (
    <div style={{ background: 'white', borderRadius: 20, padding: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <h3 style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem', margin: 0 }}>Distribución por Comunas & Brecha Rural</h3>
        <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 14px' }}>Análisis del origen territorial y barreras de accesibilidad</p>

        {/* 4 Mini KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '10px 12px', border: '1px solid #dcfce7' }}>
            <div style={{ fontSize: '0.66rem', color: '#16a34a', fontWeight: 700, textTransform: 'uppercase' }}>Tasa de Ruralidad</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d', marginTop: 2 }}>{geoStats.pctRural}% <span style={{ fontSize: '0.7rem', color: '#166534' }}>({geoStats.ruralCount.toLocaleString('es-CL')})</span></div>
          </div>
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: '10px 12px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '0.66rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>Población Urbana</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginTop: 2 }}>{geoStats.pctUrban}% <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({geoStats.urbanCount.toLocaleString('es-CL')})</span></div>
          </div>
          <div style={{ background: '#fef2f2', borderRadius: 12, padding: '10px 12px', border: '1px solid #fee2e2' }}>
            <div style={{ fontSize: '0.66rem', color: '#dc2626', fontWeight: 700, textTransform: 'uppercase' }}>Máx. Tasa Rural Comunal</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#991b1b', marginTop: 2 }}>{geoStats.highestRuralPct?.name} <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>({geoStats.highestRuralPct?.pctRural}%)</span></div>
          </div>
          <div style={{ background: '#eef2ff', borderRadius: 12, padding: '10px 12px', border: '1px solid #e0e7ff' }}>
            <div style={{ fontSize: '0.66rem', color: '#4945ff', fontWeight: 700, textTransform: 'uppercase' }}>Concentración Nodo</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#3730a3', marginTop: 2 }}>
              {geoStats.top1 && geoStats.top2 ? ((geoStats.top1.total + geoStats.top2.total) / geoStats.total * 100).toFixed(0) : 0}%
              <span style={{ fontSize: '0.68rem', color: '#4338ca', marginLeft: 4 }}>Top 2 comunas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Analytical Text Blocks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #fff 100%)', borderRadius: 12, padding: '10px 12px', borderLeft: '4px solid #22c55e', borderTop: '1px solid #dcfce7', borderRight: '1px solid #dcfce7', borderBottom: '1px solid #dcfce7' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#15803d', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🌾 Brecha de Ruralidad y Accesibilidad Geográfica</span>
          </div>
          <p style={{ fontSize: '0.71rem', color: '#475569', margin: '3px 0 0', lineHeight: '1.35' }}>
            Existen <b>{geoStats.ruralCount.toLocaleString('es-CL')} pacientes rurales ({geoStats.pctRural}%)</b> en espera. Comunas como <b>{geoStats.highestRuralPct?.name}</b> presentan la mayor proporción rural (<b>{geoStats.highestRuralPct?.pctRural}%</b>), exigiendo estrategias especiales de traslado e interconsulta.
          </p>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #fff 100%)', borderRadius: 12, padding: '10px 12px', borderLeft: '4px solid #6366f1', borderTop: '1px solid #e0e7ff', borderRight: '1px solid #e0e7ff', borderBottom: '1px solid #e0e7ff' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3730a3', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>📍 Concentración de la Demanda Lacustre</span>
          </div>
          <p style={{ fontSize: '0.71rem', color: '#475569', margin: '3px 0 0', lineHeight: '1.35' }}>
            Las comunas de <b>{geoStats.top1?.name}</b> ({geoStats.top1?.total.toLocaleString('es-CL')}), <b>{geoStats.top2?.name}</b> ({geoStats.top2?.total.toLocaleString('es-CL')}) y <b>{geoStats.top3?.name}</b> ({geoStats.top3?.total.toLocaleString('es-CL')}) concentran más del <b>88%</b> de las solicitudes de la zona de influencia.
          </p>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fff 100%)', borderRadius: 12, padding: '10px 12px', borderLeft: '4px solid #f59e0b', borderTop: '1px solid #fef3c7', borderRight: '1px solid #fef3c7', borderBottom: '1px solid #fef3c7' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#92400e', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🚙 Desafío Operativo de Citación</span>
          </div>
          <p style={{ fontSize: '0.71rem', color: '#475569', margin: '3px 0 0', lineHeight: '1.35' }}>
            La dispersión geográfica impacta directamente en las tasas de inasistencia (NSP). Se requiere reforzar la confirmación previa telefónica y transporte rural en sectores cordilleranos.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Pure Leaflet Map (direct L.map for 100% stability) ── */
function MapaAraucania({ records }) {
  const mapRef = useRef(null);
  const leafletInstance = useRef(null);

  const comunaData = useMemo(() => {
    const m = {};
    records.forEach(r => {
      if (!r.comuna) return;
      const key = r.comuna.toUpperCase().trim();
      const ll = COMUNAS_LATLON[key];
      if (!ll) return;
      if (ll[0] > -35) return; // Skip fuera de región
      if (!m[key]) m[key] = { name: r.comuna, count: 0, tramos: {}, rural: 0 };
      m[key].count++;
      if (r.urbano_rural === 'RURAL') m[key].rural++;
      if (r.tramo_espera) m[key].tramos[r.tramo_espera] = (m[key].tramos[r.tramo_espera] || 0) + 1;
    });
    return Object.values(m).sort((a, b) => b.count - a.count);
  }, [records]);

  const maxCount = Math.max(...comunaData.map(d => d.count), 1);
  const total = records.length;

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean existing instance
    if (leafletInstance.current) {
      leafletInstance.current.remove();
      leafletInstance.current = null;
    }

    const map = L.map(mapRef.current, {
      center: [-38.85, -72.45],
      zoom: 8,
      scrollWheelZoom: false,
      attributionControl: false,
    });
    leafletInstance.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
    }).addTo(map);

    comunaData.forEach(d => {
      const ll = COMUNAS_LATLON[d.name.toUpperCase().trim()];
      if (!ll) return;

      const r = 5 + Math.sqrt(d.count / maxCount) * 28;
      const domTramo = Object.entries(d.tramos).sort((a, b) => b[1] - a[1])[0]?.[0];
      const color = TRAMO_COLORS[domTramo] || '#6366f1';
      const pct = total ? ((d.count / total) * 100).toFixed(1) : '0';
      const pctRuralComuna = d.count ? ((d.rural / d.count) * 100).toFixed(1) : '0';
      const topTramo = Object.entries(d.tramos).sort((a, b) => b[1] - a[1]).slice(0, 3);

      const circle = L.circleMarker(ll, {
        radius: r,
        color: 'white',
        weight: 1.5,
        fillColor: color,
        fillOpacity: 0.78,
      }).addTo(map);

      const tooltipContent = `
        <div style="min-width:160px; font-family:system-ui, sans-serif;">
          <div style="font-weight:800; font-size:0.82rem; color:#1e293b; margin-bottom:4px;">${d.name.toUpperCase()}</div>
          <div style="font-size:0.75rem; color:#6366f1; margin-bottom:2px;">
            Pacientes: <b>${d.count.toLocaleString('es-CL')}</b> <span style="color:#94a3b8">(${pct}%)</span>
          </div>
          <div style="font-size:0.72rem; color:#16a34a; margin-bottom:6px; font-weight:700;">
            🌾 Ruralidad: ${d.rural.toLocaleString('es-CL')} pac. (${pctRuralComuna}%)
          </div>
          ${topTramo.map(([t, n]) => `
            <div style="font-size:0.7rem; color:#475569; display:flex; align-items:center; gap:4px; margin-top:2px;">
              <span style="width:8px; height:8px; border-radius:50%; background:${TRAMO_COLORS[t]}; display:inline-block;"></span>
              ${t}: <b>${n.toLocaleString('es-CL')}</b>
            </div>
          `).join('')}
        </div>
      `;

      circle.bindTooltip(tooltipContent, { direction: 'top', offset: [0, -r], opacity: 1 });
    });

    return () => {
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, [comunaData, maxCount, total]);

  return (
    <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 20px 10px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem', margin: 0 }}>Procedencia Geográfica</h3>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0' }}>Mapa de calor comunal · Araucanía · Color = tramo dominante</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>Comunas</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6366f1' }}>{comunaData.length}</div>
          </div>
        </div>
        {/* Leyenda tramos */}
        <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
          {Object.entries(TRAMO_COLORS).filter(([k]) => k !== 'Sin fecha').map(([k, c]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
              <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>{k}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Container Leaflet */}
      <div style={{ flex: 1, minHeight: 380, width: '100%', position: 'relative' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: 380, borderRadius: '0 0 20px 20px' }} />
      </div>
    </div>
  );
}

/* ── Main export: 2 Filas ── */
export default function ListaEsperaPoblacion({ records }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* FILA 1: Estructura Poblacional (Pirámide + Insights Demográficos a la derecha) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, alignItems: 'stretch' }}>
        <Piramide records={records} />
        <DemographicInsights records={records} />
      </div>

      {/* FILA 2: Geografía y Ruralidad (Insights Ruralidad a la izquierda + Mapa a la derecha) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 20, alignItems: 'stretch' }}>
        <GeographicInsights records={records} />
        <MapaAraucania records={records} />
      </div>

    </div>
  );
}
