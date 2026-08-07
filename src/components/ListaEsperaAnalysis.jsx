import React, { useMemo, useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

const PALETTE = [
  '#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6',
  '#ec4899','#14b8a6','#f97316','#84cc16','#06b6d4','#a855f7',
  '#e11d48','#65a30d','#0284c7','#7c3aed','#059669','#d97706',
  '#dc2626','#2563eb','#16a34a','#9333ea','#0891b2','#b45309',
];

/* ── Heatmap cell helper ── */
function heatBg(val, max) {
  if (!val || val === 0) return 'transparent';
  const intensity = Math.sqrt(val / max); // sqrt suaviza la escala
  return `rgba(99,102,241,${0.06 + intensity * 0.55})`;
}
function heatColor(val, max) {
  if (!val || val === 0) return '#94a3b8';
  const intensity = Math.sqrt(val / max);
  return intensity > 0.5 ? '#fff' : '#1e293b';
}

/* ── Flat Bubble Chart (SVG) ── */
function BubbleChart({ data }) {
  const [hov, setHov] = useState(null);
  const W = 1100, H = 520;
  const sorted = [...data].sort((a, b) => b.totalDias - a.totalDias).slice(0, 30);
  const maxDias = sorted[0]?.totalDias || 1;
  const getR = v => 24 + Math.sqrt(v / maxDias) * 76;

  const placed = [];
  sorted.forEach((d, i) => {
    const r = getR(d.totalDias);
    let x, y, tries = 0;
    const angle0 = (i / sorted.length) * Math.PI * 2;
    let dist = 90;
    while (tries < 500) {
      const angle = angle0 + tries * 0.3;
      x = W / 2 + dist * Math.cos(angle);
      y = H / 2 + dist * Math.sin(angle) * 0.82;
      const cx = Math.max(r + 6, Math.min(W - r - 6, x));
      const cy = Math.max(r + 6, Math.min(H - r - 6, y));
      if (placed.every(p => Math.hypot(cx - p.x, cy - p.y) >= p.r + r + 3)) {
        placed.push({ ...d, x: cx, y: cy, r, color: PALETTE[i % PALETTE.length] });
        break;
      }
      dist += 2.5; tries++;
    }
    if (tries === 500) placed.push({ ...d, x: 80 + Math.random() * (W - 160), y: 60 + Math.random() * (H - 120), r, color: PALETTE[i % PALETTE.length] });
  });

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      {placed.map((d, i) => {
        const isH = hov === i;
        const label = d.name.length > 20 ? d.name.substring(0, 18) + '…' : d.name;
        return (
          <g key={i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
            transform={`translate(${d.x},${d.y}) scale(${isH ? 1.06 : 1})`}
            style={{ transition: 'transform 0.15s', transformOrigin: `${d.x}px ${d.y}px`, cursor: 'default' }}>
            <circle cx={0} cy={0} r={d.r}
              fill={d.color} fillOpacity={isH ? 1 : 0.82}
              stroke={isH ? 'white' : 'rgba(255,255,255,0.3)'} strokeWidth={isH ? 2.5 : 1}
              style={{ filter: isH ? `drop-shadow(0 2px 8px ${d.color}66)` : 'none' }} />
            {d.r > 36 && (
              <text textAnchor="middle" fill="white" fontWeight="700" style={{ pointerEvents: 'none' }}>
                <tspan x={0} y={d.r > 52 ? -8 : 4} fontSize={Math.min(12, d.r / 4)}>{label}</tspan>
                {d.r > 52 && <tspan x={0} dy={16} fontSize={Math.min(10, d.r / 5)} fillOpacity={0.85}>{d.pacientes.toLocaleString('es-CL')} pac.</tspan>}
              </text>
            )}
          </g>
        );
      })}
      {hov !== null && placed[hov] && (() => {
        const d = placed[hov];
        const tx = Math.min(d.x + d.r + 8, W - 210);
        const ty = Math.max(8, d.y - 50);
        return (
          <g>
            <rect x={tx} y={ty} width={200} height={80} rx={10} fill="white" stroke="#e2e8f0" strokeWidth={1} style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))' }} />
            <text x={tx+12} y={ty+18} fontSize={10} fontWeight={800} fill="#1e293b">{d.name.length > 28 ? d.name.substring(0, 26)+'…' : d.name}</text>
            <text x={tx+12} y={ty+34} fontSize={10} fill="#475569">Pacientes: <tspan fontWeight={700}>{d.pacientes.toLocaleString('es-CL')}</tspan></text>
            <text x={tx+12} y={ty+50} fontSize={10} fill="#6366f1">Días acumul.: <tspan fontWeight={700}>{d.totalDias.toLocaleString('es-CL')}</tspan></text>
            <text x={tx+12} y={ty+66} fontSize={10} fill="#8b5cf6">Prom./pac.: <tspan fontWeight={700}>{Math.round(d.totalDias / d.pacientes)} días</tspan></text>
          </g>
        );
      })()}
    </svg>
  );
}

/* ── Expandable row ── */
function EspRow({ esp, years, grandTotal, allRecords, colMax }) {
  const [open, setOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({});

  const espRecords = allRecords.filter(r => r.especialidad_destino === esp.name);
  const total = esp.total;
  const pct = grandTotal ? ((total / grandTotal) * 100).toFixed(1) : '0.0';
  const avgDias = esp.avgDias;

  const groups = useMemo(() => {
    const m = {};
    espRecords.forEach(r => {
      const cod3 = (r.cod_diagno || 'S/C').substring(0, 3).toUpperCase();
      if (!m[cod3]) m[cod3] = { cod: cod3, nameCount: {}, recs: [] };
      m[cod3].recs.push(r);
      const n = r.nom_diagnostico || 'Sin diagnóstico';
      m[cod3].nameCount[n] = (m[cod3].nameCount[n] || 0) + 1;
    });
    return Object.values(m).map(g => {
      const names = Object.keys(g.nameCount);
      const shortest = names.reduce((a, b) => a.length <= b.length ? a : b, names[0] || g.cod);
      const diagMap = {};
      g.recs.forEach(r => {
        const key = `${(r.cod_diagno || 'S/C').toUpperCase()} — ${r.nom_diagnostico || 'Sin diagnóstico'}`;
        if (!diagMap[key]) diagMap[key] = { byYear: {}, total: 0, totalDias: 0 };
        diagMap[key].total++;
        if (r.dias_espera != null) diagMap[key].totalDias += r.dias_espera;
        const yr = r.fecha_ic ? new Date(r.fecha_ic).getFullYear() : 'S/F';
        diagMap[key].byYear[yr] = (diagMap[key].byYear[yr] || 0) + 1;
      });
      const byYear = {};
      let grpTotal = 0, grpDias = 0;
      g.recs.forEach(r => {
        const yr = r.fecha_ic ? new Date(r.fecha_ic).getFullYear() : 'S/F';
        byYear[yr] = (byYear[yr] || 0) + 1;
        grpTotal++;
        if (r.dias_espera != null) grpDias += r.dias_espera;
      });
      return { cod: g.cod, displayName: shortest, byYear, grpTotal, avgDias: grpTotal ? Math.round(grpDias / grpTotal) : null, diags: Object.entries(diagMap).sort((a, b) => b[1].total - a[1].total) };
    }).sort((a, b) => b.grpTotal - a.grpTotal);
  }, [espRecords]);

  /* Styles */
  const stickyName = {
    position: 'sticky', left: 0, zIndex: 2,
    padding: '6px 10px', borderBottom: '1px solid #f1f5f9',
    textAlign: 'left', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b',
    whiteSpace: 'nowrap', background: '#f8fafc',
    boxShadow: '2px 0 6px rgba(0,0,0,0.05)',
  };
  const tdR = { padding: '6px 10px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', fontSize: '0.79rem', whiteSpace: 'nowrap', transition: 'background 0.2s' };

  return (
    <>
      {/* Specialty row */}
      <tr style={{ cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        <td style={stickyName}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {open ? <ChevronDown size={14} color="#6366f1" /> : <ChevronRight size={14} color="#94a3b8" />}
            {esp.name}
          </div>
        </td>
        {years.map(yr => {
          const v = esp.byYear[yr] || 0;
          const bg = heatBg(v, colMax[yr] || 1);
          return <td key={yr} style={{ ...tdR, background: bg, color: heatColor(v, colMax[yr] || 1), fontWeight: v ? 700 : 400 }}>
            {v || ''}
          </td>;
        })}
        <td style={{ ...tdR, fontWeight: 800, color: '#1e293b', background: '#eef2ff' }}>{total.toLocaleString('es-CL')}</td>
        <td style={{ ...tdR, fontWeight: 700, color: '#6366f1', background: '#eef2ff' }}>{pct}%</td>
        <td style={{ ...tdR, fontWeight: 700, color: '#f59e0b', background: '#fffbeb' }}>{avgDias != null ? `${avgDias}d` : '—'}</td>
      </tr>

      {/* CIE-10 groups */}
      {open && groups.map(grp => {
        const grpOpen = openGroups[grp.cod];
        const stickyGrp = { ...stickyName, paddingLeft: 32, fontWeight: 600, fontSize: '0.78rem', color: '#4338ca', background: '#fafafa' };
        return (
          <React.Fragment key={grp.cod}>
            <tr style={{ cursor: 'pointer' }} onClick={() => setOpenGroups(p => ({ ...p, [grp.cod]: !p[grp.cod] }))}>
              <td style={stickyGrp}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {grpOpen ? <ChevronDown size={12} color="#8b5cf6" /> : <ChevronRight size={12} color="#c4b5fd" />}
                  <span style={{ background: '#ede9fe', color: '#6d28d9', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 800 }}>{grp.cod}</span>
                  <span>{grp.displayName.length > 50 ? grp.displayName.substring(0, 48) + '…' : grp.displayName}</span>
                </div>
              </td>
              {years.map(yr => {
                const v = grp.byYear[yr] || 0;
                const bg = heatBg(v, colMax[yr] || 1);
                return <td key={yr} style={{ ...tdR, fontSize: '0.76rem', background: bg, color: heatColor(v, colMax[yr] || 1), fontWeight: v ? 600 : 400 }}>
                  {v || ''}
                </td>;
              })}
              <td style={{ ...tdR, fontWeight: 700, fontSize: '0.76rem', color: '#6366f1', background: '#f5f3ff' }}>{grp.grpTotal.toLocaleString('es-CL')}</td>
              <td style={{ ...tdR, fontSize: '0.76rem', color: '#8b5cf6', background: '#f5f3ff' }}>{total ? ((grp.grpTotal / total) * 100).toFixed(1) : 0}%</td>
              <td style={{ ...tdR, fontSize: '0.76rem', color: '#f59e0b', background: '#fffbeb' }}>{grp.avgDias != null ? `${grp.avgDias}d` : '—'}</td>
            </tr>

            {grpOpen && grp.diags.map(([key, dg]) => {
              const diagAvg = dg.total ? Math.round(dg.totalDias / dg.total) : null;
              const stickyDiag = { ...stickyName, paddingLeft: 58, fontWeight: 500, fontSize: '0.73rem', color: '#64748b', background: '#fdfcff' };
              return (
                <tr key={key} style={{ background: '#fdfcff' }}>
                  <td style={stickyDiag}>↳ {key.length > 70 ? key.substring(0, 68) + '…' : key}</td>
                  {years.map(yr => {
                    const v = dg.byYear[yr] || 0;
                    const bg = heatBg(v, colMax[yr] || 1);
                    return <td key={yr} style={{ ...tdR, fontSize: '0.73rem', background: bg, color: heatColor(v, colMax[yr] || 1), fontWeight: v ? 600 : 400 }}>
                      {v || ''}
                    </td>;
                  })}
                  <td style={{ ...tdR, fontSize: '0.73rem', fontWeight: 600, color: '#475569', background: '#f5f3ff' }}>{dg.total.toLocaleString('es-CL')}</td>
                  <td style={{ ...tdR, fontSize: '0.73rem', color: '#a78bfa', background: '#f5f3ff' }}>{total ? ((dg.total / total) * 100).toFixed(1) : 0}%</td>
                  <td style={{ ...tdR, fontSize: '0.73rem', color: '#f59e0b', background: '#fffbeb' }}>{diagAvg != null ? `${diagAvg}d` : '—'}</td>
                </tr>
              );
            })}
          </React.Fragment>
        );
      })}
    </>
  );
}

/* ── Main Export ── */
export default function ListaEsperaAnalysis({ records }) {
  const years = useMemo(() => {
    const ys = new Set();
    records.forEach(r => { if (r.fecha_ic) { const y = new Date(r.fecha_ic).getFullYear(); if (!isNaN(y)) ys.add(y); } });
    return Array.from(ys).sort();
  }, [records]);

  const bubbleData = useMemo(() => {
    const m = {};
    records.forEach(r => {
      const e = r.especialidad_destino || 'Sin dato';
      if (!m[e]) m[e] = { name: e, totalDias: 0, pacientes: 0 };
      m[e].pacientes++;
      if (r.dias_espera != null) m[e].totalDias += r.dias_espera;
    });
    return Object.values(m).filter(d => d.totalDias > 0).sort((a, b) => b.totalDias - a.totalDias);
  }, [records]);

  const tableEsps = useMemo(() => {
    const m = {};
    records.forEach(r => {
      const e = r.especialidad_destino || 'Sin dato';
      if (!m[e]) m[e] = { name: e, byYear: {}, total: 0, totalDias: 0 };
      const yr = r.fecha_ic ? new Date(r.fecha_ic).getFullYear() : 'S/F';
      m[e].byYear[yr] = (m[e].byYear[yr] || 0) + 1;
      m[e].total++;
      if (r.dias_espera != null) m[e].totalDias += r.dias_espera;
    });
    return Object.values(m).map(e => ({ ...e, avgDias: e.total ? Math.round(e.totalDias / e.total) : null }))
      .sort((a, b) => b.total - a.total);
  }, [records]);

  /* Max value per year column (for heatmap scaling per column) */
  const colMax = useMemo(() => {
    const m = {};
    years.forEach(yr => {
      m[yr] = Math.max(...tableEsps.map(e => e.byYear[yr] || 0), 1);
    });
    return m;
  }, [tableEsps, years]);

  const grandTotal = useMemo(() => tableEsps.reduce((s, e) => s + e.total, 0), [tableEsps]);
  const yearTotals = useMemo(() => {
    const t = {}; let td = 0, tn = 0;
    tableEsps.forEach(e => { Object.entries(e.byYear).forEach(([yr, v]) => { t[yr] = (t[yr] || 0) + v; }); td += e.totalDias; tn += e.total; });
    return { ...t, _avgDias: tn ? Math.round(td / tn) : 0 };
  }, [tableEsps]);

  const thS = { padding: '10px 10px', fontWeight: 800, fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.3px', background: '#f1f5f9', borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap', textAlign: 'right' };
  const thSticky = { ...thS, textAlign: 'left', paddingLeft: 10, position: 'sticky', left: 0, zIndex: 11, minWidth: 220, boxShadow: '2px 0 6px rgba(0,0,0,0.06)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Bubble Chart ── */}
      <div style={{ background: 'white', borderRadius: 20, padding: '24px 24px 16px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontWeight: 800, color: '#1e293b', margin: '0 0 4px', fontSize: '1rem' }}>Volumen de Espera por Especialidad</h3>
        <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 12px' }}>
          Cada círculo representa una especialidad. Tamaño proporcional a los <b>días de espera acumulados</b>. Pasa el cursor para ver detalles.
        </p>
        <BubbleChart data={bubbleData} />
        <div style={{ display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
          {bubbleData.slice(0, 8).map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: PALETTE[i % PALETTE.length] }} />
              <span style={{ fontSize: '0.71rem', color: '#64748b', fontWeight: 600 }}>{d.name.length > 24 ? d.name.substring(0, 22) + '…' : d.name}</span>
            </div>
          ))}
          {bubbleData.length > 8 && <span style={{ fontSize: '0.71rem', color: '#94a3b8' }}>+{bubbleData.length - 8} más</span>}
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h3 style={{ fontWeight: 800, color: '#1e293b', margin: '0 0 4px', fontSize: '1rem' }}>Pacientes en Espera por Especialidad y Año IC</h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>Expande cada fila → grupo diagnóstico CIE-10 → diagnóstico específico. Intensidad = volumen relativo por año.</p>
          </div>
          {/* Heatmap legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Pocos</span>
            {[0.08, 0.22, 0.38, 0.54, 0.70].map((op, i) => (
              <div key={i} style={{ width: 16, height: 16, borderRadius: 3, background: `rgba(99,102,241,${op})` }} />
            ))}
            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Muchos</span>
          </div>
        </div>
        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 620 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                <th style={thSticky}>Especialidad / Diagnóstico</th>
                {years.map(yr => <th key={yr} style={thS}>{yr}</th>)}
                <th style={{ ...thS, background: '#e0e7ff', color: '#4338ca' }}>Total</th>
                <th style={{ ...thS, background: '#e0e7ff', color: '#4338ca' }}>%</th>
                <th style={{ ...thS, background: '#fef3c7', color: '#92400e' }}>Prom. días</th>
              </tr>
            </thead>
            <tbody>
              {tableEsps.map(esp => (
                <EspRow key={esp.name} esp={esp} years={years} grandTotal={grandTotal} allRecords={records} colMax={colMax} />
              ))}
              <tr style={{ background: '#1e293b', position: 'sticky', bottom: 0 }}>
                <td style={{ padding: '10px 10px', fontWeight: 800, color: 'white', fontSize: '0.82rem', position: 'sticky', left: 0, background: '#1e293b', zIndex: 2 }}>TOTAL GENERAL</td>
                {years.map(yr => <td key={yr} style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#94a3b8', fontSize: '0.79rem' }}>{(yearTotals[yr] || 0).toLocaleString('es-CL')}</td>)}
                <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 900, color: '#a5b4fc', fontSize: '0.88rem' }}>{grandTotal.toLocaleString('es-CL')}</td>
                <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 800, color: '#a5b4fc', fontSize: '0.82rem' }}>100%</td>
                <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 800, color: '#fbbf24', fontSize: '0.82rem' }}>{yearTotals._avgDias}d</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
