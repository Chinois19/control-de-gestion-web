import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip as LTooltip } from 'react-leaflet';
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
  'PITRUFQUEN':      [-38.9833, -72.6500],
  'DONIHUE':         [-34.1766, -70.9636], // fuera de región, skip
};

function getLatLon(rawComuna) {
  if (!rawComuna) return null;
  const key = rawComuna.toUpperCase().trim();
  return COMUNAS_LATLON[key] || null;
}

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

  const maxVal = Math.max(...data.flatMap(d => [d.mujeres, d.hombres]), 1);
  const totM = data.reduce((s, d) => s + d.mujeres, 0);
  const totH = data.reduce((s, d) => s + d.hombres, 0);
  const total = totM + totH;
  const BAR_MAX = 140;
  const LABEL_W = 46;

  return (
    <div style={{ background: 'white', borderRadius: 20, padding: '20px 20px 16px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <h3 style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem', margin: 0 }}>Pirámide Poblacional</h3>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0' }}>Distribución por edad y sexo en lista de espera</p>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ec4899' }}>{totM.toLocaleString('es-CL')}</div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>Mujeres ({total ? Math.round(totM/total*100) : 0}%)</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#3b82f6' }}>{totH.toLocaleString('es-CL')}</div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>Hombres ({total ? Math.round(totH/total*100) : 0}%)</div>
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 5 }}>
        <div style={{ width: BAR_MAX, textAlign: 'center', fontSize: '0.68rem', fontWeight: 700, color: '#ec4899' }}>← MUJER</div>
        <div style={{ width: LABEL_W, textAlign: 'center', fontSize: '0.64rem', color: '#94a3b8', fontWeight: 600 }}>Edad</div>
        <div style={{ width: BAR_MAX, textAlign: 'center', fontSize: '0.68rem', fontWeight: 700, color: '#3b82f6' }}>HOMBRE →</div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {[...data].reverse().map(d => {
          const wM = Math.round((d.mujeres / maxVal) * BAR_MAX);
          const wH = Math.round((d.hombres / maxVal) * BAR_MAX);
          const pctM = total ? (d.mujeres / total * 100).toFixed(1) : '0';
          const pctH = total ? (d.hombres / total * 100).toFixed(1) : '0';
          return (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}
              title={`${d.label} años | Mujeres: ${d.mujeres.toLocaleString('es-CL')} (${pctM}%) | Hombres: ${d.hombres.toLocaleString('es-CL')} (${pctH}%)`}>
              {/* Mujer bar RTL */}
              <div style={{ width: BAR_MAX, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 3 }}>
                {d.mujeres > 0 && <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{d.mujeres.toLocaleString('es-CL')}</span>}
                <div style={{ width: wM, height: 20, borderRadius: '4px 0 0 4px', background: 'linear-gradient(90deg, #fbcfe8, #ec4899)' }} />
              </div>
              <div style={{ width: LABEL_W, textAlign: 'center', fontSize: '0.68rem', fontWeight: 700, color: '#475569', flexShrink: 0 }}>{d.label}</div>
              {/* Hombre bar LTR */}
              <div style={{ width: BAR_MAX, display: 'flex', alignItems: 'center', gap: 3 }}>
                <div style={{ width: wH, height: 20, borderRadius: '0 4px 4px 0', background: 'linear-gradient(90deg, #93c5fd, #3b82f6)' }} />
                {d.hombres > 0 && <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{d.hombres.toLocaleString('es-CL')}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Mapa Leaflet de comunas ── */
function MapaAraucania({ records }) {
  const comunaData = useMemo(() => {
    const m = {};
    records.forEach(r => {
      if (!r.comuna) return;
      const key = r.comuna.toUpperCase().trim();
      const ll = COMUNAS_LATLON[key];
      if (!ll) return;
      // skip Donihue (fuera de región, lat > -35)
      if (ll[0] > -35) return;
      if (!m[r.comuna.toUpperCase().trim()]) m[key] = { name: r.comuna, count: 0, tramos: {} };
      m[key].count++;
      if (r.tramo_espera) m[key].tramos[r.tramo_espera] = (m[key].tramos[r.tramo_espera] || 0) + 1;
    });
    return Object.values(m).sort((a, b) => b.count - a.count);
  }, [records]);

  const maxCount = Math.max(...comunaData.map(d => d.count), 1);
  const total = records.length;
  const getRadius = count => 5 + Math.sqrt(count / maxCount) * 28;

  // Color by dominant tramo
  const getDomColor = tramos => {
    if (!tramos || Object.keys(tramos).length === 0) return '#6366f1';
    const dom = Object.entries(tramos).sort((a, b) => b[1] - a[1])[0][0];
    return TRAMO_COLORS[dom] || '#6366f1';
  };

  return (
    <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 20px 10px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem', margin: 0 }}>Procedencia Geográfica</h3>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0' }}>Comunas de origen · Araucanía · Color = tramo de espera dominante</p>
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

      {/* Mapa */}
      <div style={{ flex: 1, minHeight: 360 }}>
        <MapContainer
          center={[-38.85, -72.45]}
          zoom={8}
          style={{ width: '100%', height: '100%', minHeight: 360 }}
          scrollWheelZoom={false}
          attributionControl={false}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          {comunaData.map(d => {
            const ll = COMUNAS_LATLON[d.name.toUpperCase().trim()];
            if (!ll) return null;
            const r = getRadius(d.count);
            const pct = total ? (d.count / total * 100).toFixed(1) : '0';
            const color = getDomColor(d.tramos);
            const topTramo = Object.entries(d.tramos).sort((a,b)=>b[1]-a[1]).slice(0,3);
            return (
              <CircleMarker
                key={d.name}
                center={ll}
                radius={r}
                pathOptions={{ color: 'white', weight: 1.5, fillColor: color, fillOpacity: 0.78 }}>
                <LTooltip direction="top" offset={[0, -r]} opacity={1}>
                  <div style={{ minWidth: 160 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#1e293b', marginBottom: 4 }}>{d.name.toUpperCase()}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6366f1' }}>
                      Pacientes: <b>{d.count.toLocaleString('es-CL')}</b> <span style={{ color: '#94a3b8' }}>({pct}%)</span>
                    </div>
                    {topTramo.map(([t, n]) => (
                      <div key={t} style={{ fontSize: '0.7rem', color: '#475569', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: TRAMO_COLORS[t], display: 'inline-block', flexShrink: 0 }} />
                        {t}: <b>{n.toLocaleString('es-CL')}</b>
                      </div>
                    ))}
                  </div>
                </LTooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

/* ── Main export: 2 columnas ── */
export default function ListaEsperaPoblacion({ records }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 20, alignItems: 'stretch' }}>
      <Piramide records={records} />
      <MapaAraucania records={records} />
    </div>
  );
}
