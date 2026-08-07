import React, { useMemo, useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

const PALETTE = [
  '#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6',
  '#ec4899','#14b8a6','#f97316','#84cc16','#06b6d4','#a855f7',
  '#e11d48','#65a30d','#0284c7','#7c3aed','#059669','#d97706',
  '#dc2626','#2563eb','#16a34a','#9333ea','#0891b2','#b45309',
];

/* ── Bubble Chart (SVG custom) ── */
function BubbleChart({ data, width = 600, height = 500 }) {
  const sorted = [...data].sort((a, b) => b.totalDias - a.totalDias).slice(0, 28);
  const maxDias = sorted[0]?.totalDias || 1;
  const MIN_R = 28, MAX_R = 90;
  const getR = v => MIN_R + Math.sqrt(v / maxDias) * (MAX_R - MIN_R);

  // Simple spiral placement
  const placed = [];
  sorted.forEach((d, i) => {
    const r = getR(d.totalDias);
    let x, y, tries = 0;
    const angle0 = (i / sorted.length) * Math.PI * 2;
    let dist = MAX_R * 1.2;
    while (tries < 400) {
      const angle = angle0 + tries * 0.35;
      x = width / 2 + dist * Math.cos(angle);
      y = height / 2 + dist * Math.sin(angle) * 0.85;
      const cx = Math.max(r + 4, Math.min(width - r - 4, x));
      const cy = Math.max(r + 4, Math.min(height - r - 4, y));
      const ok = placed.every(p => {
        const dx = cx - p.x, dy = cy - p.y;
        return Math.sqrt(dx*dx + dy*dy) >= p.r + r + 4;
      });
      if (ok) { placed.push({ ...d, x: cx, y: cy, r, color: PALETTE[i % PALETTE.length] }); break; }
      dist += 2; tries++;
    }
    if (tries === 400) placed.push({ ...d, x: Math.random()*width*0.8+width*0.1, y: Math.random()*height*0.8+height*0.1, r, color: PALETTE[i % PALETTE.length] });
  });

  const [hov, setHov] = useState(null);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        {placed.map((d, i) => (
          <radialGradient key={i} id={`bg${i}`} cx="35%" cy="35%">
            <stop offset="0%" stopColor="white" stopOpacity="0.35" />
            <stop offset="100%" stopColor={d.color} stopOpacity="1" />
          </radialGradient>
        ))}
      </defs>
      {placed.map((d, i) => {
        const label = d.name.length > 18 ? d.name.substring(0, 16) + '…' : d.name;
        const isHov = hov === i;
        const dias = d.totalDias.toLocaleString('es-CL');
        const pac = d.pacientes.toLocaleString('es-CL');
        return (
          <g key={i} style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}>
            <circle cx={d.x} cy={d.y} r={d.r + (isHov ? 4 : 0)}
              fill={`url(#bg${i})`} stroke={d.color} strokeWidth={isHov ? 2.5 : 1}
              style={{ filter: isHov ? `drop-shadow(0 0 8px ${d.color}88)` : 'none', transition: 'all 0.2s' }} />
            {d.r > 38 && (
              <text x={d.x} y={d.y - 6} textAnchor="middle" fontSize={Math.min(11, d.r / 4.5)}
                fontWeight="700" fill="white" style={{ pointerEvents: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                {label}
              </text>
            )}
            {d.r > 38 && (
              <text x={d.x} y={d.y + 10} textAnchor="middle" fontSize={Math.min(10, d.r / 5)}
                fill="rgba(255,255,255,0.9)" style={{ pointerEvents: 'none' }}>
                {pac} pac.
              </text>
            )}
            {isHov && (
              <g>
                <rect x={d.x + d.r + 6} y={d.y - 36} width={200} height={72} rx={8}
                  fill="white" stroke="#e2e8f0" strokeWidth={1}
                  style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.15))' }} />
                <text x={d.x + d.r + 14} y={d.y - 18} fontSize={10} fontWeight="700" fill="#1e293b">{d.name}</text>
                <text x={d.x + d.r + 14} y={d.y - 2} fontSize={10} fill="#475569">Pacientes: <tspan fontWeight="700">{pac}</tspan></text>
                <text x={d.x + d.r + 14} y={d.y + 14} fontSize={10} fill="#6366f1">Días acumulados: <tspan fontWeight="700">{dias}</tspan></text>
                <text x={d.x + d.r + 14} y={d.y + 30} fontSize={10} fill="#8b5cf6">Promedio/pac.: <tspan fontWeight="700">{Math.round(d.totalDias/d.pacientes)} días</tspan></text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ── Expandable Table ── */
function EspRow({ esp, years, grandTotal, allRecords }) {
  const [open, setOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({});

  const espRecords = allRecords.filter(r => r.especialidad_destino === esp.name);
  const total = esp.total;
  const pct = grandTotal ? ((total / grandTotal) * 100).toFixed(1) : '0.0';

  // CIE-10 groups by first 3 chars of cod_diagno
  const groups = useMemo(() => {
    const m = {};
    espRecords.forEach(r => {
      const cod = (r.cod_diagno || 'S/C').substring(0, 3).toUpperCase();
      if (!m[cod]) m[cod] = { cod, diags: {} };
      const diag = r.nom_diagnostico || 'Sin diagnóstico';
      if (!m[cod].diags[diag]) m[cod].diags[diag] = {};
      const yr = r.fecha_ic ? new Date(r.fecha_ic).getFullYear() : 'S/F';
      m[cod].diags[diag][yr] = (m[cod].diags[diag][yr] || 0) + 1;
    });
    return Object.values(m).sort((a,b) => {
      const ta = Object.values(a.diags).reduce((s,d)=>s+Object.values(d).reduce((x,v)=>x+v,0),0);
      const tb = Object.values(b.diags).reduce((s,d)=>s+Object.values(d).reduce((x,v)=>x+v,0),0);
      return tb - ta;
    });
  }, [espRecords]);

  const tdStyle = { padding: '6px 10px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', fontSize: '0.8rem', color: '#475569' };
  const tdStyleL = { ...tdStyle, textAlign: 'left' };

  return (
    <>
      {/* Specialty row */}
      <tr style={{ background: '#f8fafc', cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        <td style={{ ...tdStyleL, paddingLeft: 12, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
          {open ? <ChevronDown size={14} color="#6366f1" /> : <ChevronRight size={14} color="#94a3b8" />}
          <span style={{ fontSize: '0.82rem' }}>{esp.name}</span>
        </td>
        {years.map(yr => <td key={yr} style={tdStyle}>{(esp.byYear[yr] || 0).toLocaleString('es-CL') || '—'}</td>)}
        <td style={{ ...tdStyle, fontWeight: 800, color: '#1e293b', background: '#f1f5f9' }}>{total.toLocaleString('es-CL')}</td>
        <td style={{ ...tdStyle, fontWeight: 700, color: '#6366f1', background: '#f1f5f9' }}>{pct}%</td>
      </tr>

      {/* CIE-10 group rows */}
      {open && groups.map(grp => {
        const grpByYear = {};
        let grpTotal = 0;
        Object.values(grp.diags).forEach(d => Object.entries(d).forEach(([yr, v]) => { grpByYear[yr]=(grpByYear[yr]||0)+v; grpTotal+=v; }));
        const grpOpen = openGroups[grp.cod];
        return (
          <React.Fragment key={grp.cod}>
            <tr style={{ background: '#fff', cursor: 'pointer' }} onClick={() => setOpenGroups(p => ({ ...p, [grp.cod]: !p[grp.cod] }))}>
              <td style={{ ...tdStyleL, paddingLeft: 36, color: '#6366f1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                {grpOpen ? <ChevronDown size={12} color="#8b5cf6" /> : <ChevronRight size={12} color="#c4b5fd" />}
                <span style={{ fontSize: '0.77rem', fontFamily: 'monospace', background: '#ede9fe', padding: '1px 6px', borderRadius: 4 }}>{grp.cod}</span>
              </td>
              {years.map(yr => <td key={yr} style={{ ...tdStyle, fontSize: '0.77rem' }}>{(grpByYear[yr] || 0) || '—'}</td>)}
              <td style={{ ...tdStyle, fontWeight: 700, fontSize: '0.77rem', color: '#6366f1', background: '#faf5ff' }}>{grpTotal.toLocaleString('es-CL')}</td>
              <td style={{ ...tdStyle, fontSize: '0.77rem', color: '#8b5cf6', background: '#faf5ff' }}>{total ? ((grpTotal/total)*100).toFixed(1) : 0}%</td>
            </tr>

            {/* Specific diagnoses */}
            {grpOpen && Object.entries(grp.diags).sort((a,b)=>Object.values(b[1]).reduce((x,v)=>x+v,0)-Object.values(a[1]).reduce((x,v)=>x+v,0)).map(([diag, byYr]) => {
              const diagTotal = Object.values(byYr).reduce((s,v)=>s+v,0);
              return (
                <tr key={diag} style={{ background: '#fdfcff' }}>
                  <td style={{ ...tdStyleL, paddingLeft: 60, color: '#64748b', fontSize: '0.74rem' }}>↳ {diag.length > 60 ? diag.substring(0,58)+'…' : diag}</td>
                  {years.map(yr => <td key={yr} style={{ ...tdStyle, fontSize: '0.74rem', color: '#94a3b8' }}>{(byYr[yr] || 0) || '—'}</td>)}
                  <td style={{ ...tdStyle, fontSize: '0.74rem', fontWeight: 600, color: '#475569', background: '#faf5ff' }}>{diagTotal.toLocaleString('es-CL')}</td>
                  <td style={{ ...tdStyle, fontSize: '0.74rem', color: '#a78bfa', background: '#faf5ff' }}>{total ? ((diagTotal/total)*100).toFixed(1) : 0}%</td>
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
    return Object.values(m).filter(d => d.totalDias > 0).sort((a,b)=>b.totalDias-a.totalDias);
  }, [records]);

  const tableEsps = useMemo(() => {
    const m = {};
    records.forEach(r => {
      const e = r.especialidad_destino || 'Sin dato';
      if (!m[e]) m[e] = { name: e, byYear: {}, total: 0 };
      const yr = r.fecha_ic ? new Date(r.fecha_ic).getFullYear() : 'S/F';
      m[e].byYear[yr] = (m[e].byYear[yr] || 0) + 1;
      m[e].total++;
    });
    return Object.values(m).sort((a,b) => b.total - a.total);
  }, [records]);

  const grandTotal = useMemo(() => tableEsps.reduce((s,e)=>s+e.total,0), [tableEsps]);

  const yearTotals = useMemo(() => {
    const t = {};
    tableEsps.forEach(e => Object.entries(e.byYear).forEach(([yr,v])=>{ t[yr]=(t[yr]||0)+v; }));
    return t;
  }, [tableEsps]);

  const thStyle = { padding: '10px 10px', fontWeight: 800, fontSize: '0.78rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.3px', background: '#f1f5f9', borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap', textAlign: 'right' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20, alignItems: 'start' }}>

      {/* ── Bubble Chart Panel ── */}
      <div style={{ background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontWeight: 800, color: '#1e293b', margin: '0 0 4px', fontSize: '1rem' }}>Volumen de Espera por Especialidad</h3>
        <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 16px' }}>
          Cada círculo representa una especialidad. Tamaño proporcional a los <b>días de espera acumulados</b> (suma de días de todos sus pacientes)
        </p>
        <BubbleChart data={bubbleData} width={580} height={480} />
        <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
          {bubbleData.slice(0,6).map((d,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:4 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:PALETTE[i%PALETTE.length] }} />
              <span style={{ fontSize:'0.72rem', color:'#64748b', fontWeight:600 }}>{d.name.length>22?d.name.substring(0,20)+'…':d.name}</span>
            </div>
          ))}
          {bubbleData.length > 6 && <span style={{ fontSize:'0.72rem', color:'#94a3b8' }}>+{bubbleData.length-6} más</span>}
        </div>
      </div>

      {/* ── Table Panel ── */}
      <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 12px', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ fontWeight: 800, color: '#1e293b', margin: '0 0 4px', fontSize: '1rem' }}>Pacientes en Espera por Especialidad y Año IC</h3>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
            Expande cada fila para ver agrupación por código CIE-10 y diagnóstico específico
          </p>
        </div>
        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 560 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                <th style={{ ...thStyle, textAlign: 'left', paddingLeft: 12, minWidth: 200 }}>Especialidad / CIE-10</th>
                {years.map(yr => <th key={yr} style={thStyle}>{yr}</th>)}
                <th style={{ ...thStyle, background: '#e0e7ff', color: '#4338ca' }}>Total</th>
                <th style={{ ...thStyle, background: '#e0e7ff', color: '#4338ca' }}>% Total</th>
              </tr>
            </thead>
            <tbody>
              {tableEsps.map(esp => (
                <EspRow key={esp.name} esp={esp} years={years} grandTotal={grandTotal} allRecords={records} />
              ))}
              {/* Grand total row */}
              <tr style={{ background: '#1e293b', position: 'sticky', bottom: 0 }}>
                <td style={{ padding: '10px 12px', fontWeight: 800, color: 'white', fontSize: '0.82rem' }}>TOTAL GENERAL</td>
                {years.map(yr => <td key={yr} style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#94a3b8', fontSize: '0.8rem' }}>{(yearTotals[yr]||0).toLocaleString('es-CL')}</td>)}
                <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 900, color: '#a5b4fc', fontSize: '0.88rem' }}>{grandTotal.toLocaleString('es-CL')}</td>
                <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 800, color: '#a5b4fc', fontSize: '0.82rem' }}>100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
