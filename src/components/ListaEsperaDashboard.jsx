import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { ArrowLeft, RefreshCw, AlertTriangle, Users, Clock, Stethoscope, Filter, Download, ChevronDown, TrendingUp, AlertOctagon, MapPin, Activity } from 'lucide-react';
import ListaEsperaAnalysis from './ListaEsperaAnalysis';

const COLORS_TRAMO = {
  '0-90 días':    '#10b981',
  '91-180 días':  '#f59e0b',
  '181-365 días': '#f97316',
  '366-540 días': '#ef4444',
  '> 540 días':   '#7c3aed',
  'Sin fecha':    '#94a3b8',
};

const COLORS_PIE = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6'];

const TRAMOS_ORDER = ['0-90 días','91-180 días','181-365 días','366-540 días','> 540 días','Sin fecha'];

function KPICard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background: 'white', borderRadius: 16, padding: '20px 24px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)', borderLeft: `4px solid ${color}`,
      display: 'flex', flexDirection: 'column', gap: 4
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color }}>
        {icon}
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{sub}</div>}
    </div>
  );
}

const CustomTooltipBar = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <p style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e293b', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: '0.78rem', color: p.fill, margin: 0 }}>{p.name}: <b>{p.value.toLocaleString('es-CL')}</b></p>
      ))}
    </div>
  );
};

/* ── MultiSelect dropdown ── */
function MultiSelect({ label, options, selected, onChange, color = '#6366f1' }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef();
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const toggle = v => onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);
  const allSelected = selected.length === 0;
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 8, background: 'white',
        border: `1.5px solid ${selected.length ? color : '#e2e8f0'}`,
        borderRadius: 10, padding: '7px 14px', cursor: 'pointer', fontWeight: 600,
        fontSize: '0.82rem', color: selected.length ? color : '#64748b', whiteSpace: 'nowrap',
        boxShadow: selected.length ? `0 0 0 3px ${color}18` : 'none', transition: 'all 0.2s'
      }}>
        <Filter size={13} />
        {label}{selected.length > 0 && <span style={{ background: color, color: 'white', borderRadius: 20, padding: '1px 7px', fontSize: '0.72rem', fontWeight: 800 }}>{selected.length}</span>}
        <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, minWidth: 240, maxHeight: 280,
          overflowY: 'auto', background: 'white', borderRadius: 12, border: '1px solid #e2e8f0',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 999, padding: '6px'
        }}>
          <div onClick={() => onChange([])} style={{ padding: '7px 12px', borderRadius: 8, cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: 700, color: allSelected ? color : '#64748b',
            background: allSelected ? `${color}12` : 'transparent', marginBottom: 2 }}>Todas</div>
          {options.map(opt => {
            const active = selected.includes(opt);
            return (
              <div key={opt} onClick={() => toggle(opt)} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px',
                borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: active ? 700 : 500,
                color: active ? color : '#475569', background: active ? `${color}10` : 'transparent'
              }}>
                <div style={{ width: 15, height: 15, borderRadius: 4, border: `2px solid ${active ? color : '#cbd5e1'}`,
                  background: active ? color : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {active && <span style={{ color: 'white', fontSize: 9, fontWeight: 900 }}>✓</span>}
                </div>
                {opt}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ListaEsperaDashboard({ onBack, tipo }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState([]);
  const [espFiltro, setEspFiltro] = useState([]);
  const [origenFiltro, setOrigenFiltro] = useState([]);
  const [tramoFiltro, setTramoFiltro] = useState([]);
  const [searchEsp, setSearchEsp] = useState('');
  const [activeTab, setActiveTab] = useState('resumen');
  const [selectedEspecialidad, setSelectedEspecialidad] = useState(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    fetch('/data/lista_espera_cached.json?' + Date.now())
      .then(r => { if (!r.ok) throw new Error('Archivo no encontrado'); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { loadData(); }, []);

  const records = useMemo(() => {
    if (!data?.records) return [];
    let r = data.records;
    if (tipo) r = r.filter(x => x.tipo_lista_espera === tipo);
    if (estadoFiltro.length) r = r.filter(x => estadoFiltro.includes(x.estado_ic));
    if (espFiltro.length) r = r.filter(x => espFiltro.includes(x.especialidad_destino));
    if (origenFiltro.length) r = r.filter(x => origenFiltro.includes(x.establecimiento_origen));
    if (tramoFiltro.length) r = r.filter(x => tramoFiltro.includes(x.tramo_espera));
    return r;
  }, [data, tipo, estadoFiltro, espFiltro, origenFiltro, tramoFiltro]);

  const kpis = useMemo(() => {
    if (!records.length) return {};
    const conFecha = records.filter(r => r.dias_espera !== null);
    const promDias = conFecha.length ? Math.round(conFecha.reduce((a, b) => a + b.dias_espera, 0) / conFecha.length) : 0;
    const criticos = records.filter(r => r.dias_espera > 365).length;
    // Mediana
    let medianaDias = 0;
    if (conFecha.length) {
      const sorted = [...conFecha].sort((a, b) => a.dias_espera - b.dias_espera);
      const mid = Math.floor(sorted.length / 2);
      medianaDias = sorted.length % 2 !== 0
        ? sorted[mid].dias_espera
        : Math.round((sorted[mid - 1].dias_espera + sorted[mid].dias_espera) / 2);
    }
    return {
      total: records.length,
      medicas: records.filter(r => r.tipo_lista_espera === 'Médica').length,
      odont: records.filter(r => r.tipo_lista_espera === 'Odontológica').length,
      promDias,
      medianaDias,
      criticos,
    };
  }, [records]);

  const byTramo = useMemo(() => {
    const m = {};
    TRAMOS_ORDER.forEach(t => m[t] = 0);
    records.forEach(r => { if (m[r.tramo_espera] !== undefined) m[r.tramo_espera]++; });
    return TRAMOS_ORDER.map(t => ({ name: t, value: m[t], fill: COLORS_TRAMO[t] })).filter(x => x.value > 0);
  }, [records]);

  const byEspecialidad = useMemo(() => {
    const m = {};
    records.forEach(r => { const e = r.especialidad_destino || 'Sin dato'; m[e] = (m[e] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 20)
      .map(([name, value]) => ({ name: name.length > 38 ? name.substring(0, 36) + '…' : name, value, fullName: name }))
      .filter(x => !searchEsp || x.fullName.toLowerCase().includes(searchEsp.toLowerCase()));
  }, [records, searchEsp]);

  const byEspecialidadStacked = useMemo(() => {
    if (!records.length) return [];
    const total = records.length;
    const m = {};
    records.forEach(r => {
      const e = r.especialidad_destino || 'Sin dato';
      if (!m[e]) { m[e] = { name: e, total: 0 }; TRAMOS_ORDER.forEach(t => { m[e][t] = 0; }); }
      m[e].total++;
      const t = r.tramo_espera;
      if (t && m[e][t] !== undefined) m[e][t]++;
    });
    return Object.values(m)
      .sort((a, b) => b.total - a.total)
      .slice(0, 20)
      .filter(d => !searchEsp || d.name.toLowerCase().includes(searchEsp.toLowerCase()))
      .map(d => ({ ...d, pct: total ? (d.total / total * 100).toFixed(1) : '0.0', shortName: d.name.length > 32 ? d.name.substring(0, 30) + '…' : d.name }));
  }, [records, searchEsp]);

  const byEstado = useMemo(() => {
    const m = {};
    records.forEach(r => { m[r.estado_ic] = (m[r.estado_ic] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([name, value], i) => ({ name, value, fill: COLORS_PIE[i % COLORS_PIE.length] }));
  }, [records]);

  const byOrigen = useMemo(() => {
    const m = {};
    records.forEach(r => { const o = r.establecimiento_origen || 'Sin dato'; m[o] = (m[o] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 15)
      .map(([name, value]) => ({ name, value }));
  }, [records]);

  const byDiagnostico = useMemo(() => {
    if (!selectedEspecialidad) return [];
    const espRecs = records.filter(r => r.especialidad_destino === selectedEspecialidad);
    const espTotal = espRecs.length;
    const m = {};
    espRecs.forEach(r => {
      const d = r.nom_diagnostico || 'Sin diagnóstico';
      if (!m[d]) { m[d] = { name: d, total: 0 }; TRAMOS_ORDER.forEach(t => { m[d][t] = 0; }); }
      m[d].total++;
      if (r.tramo_espera && m[d][r.tramo_espera] !== undefined) m[d][r.tramo_espera]++;
    });
    return Object.values(m)
      .sort((a, b) => b.total - a.total).slice(0, 20)
      .map(d => ({
        ...d,
        pct: espTotal ? (d.total / espTotal * 100).toFixed(1) : '0.0',
        shortName: d.name.length > 45 ? d.name.substring(0, 43) + '…' : d.name,
      }));
  }, [records, selectedEspecialidad]);

  const insights = useMemo(() => {
    if (!records.length || !kpis.total) return [];
    const ins = [];
    const mayor540 = records.filter(r => r.dias_espera > 540).length;
    const pct540 = Math.round(mayor540 / kpis.total * 100);
    if (pct540 > 0) ins.push({ label: 'Situación Crítica', lucideIcon: <AlertOctagon size={20} color="#ef4444" />, bgColor: '#fee2e2', labelColor: '#dc2626', borderColor: '#fecaca', text: `${mayor540.toLocaleString('es-CL')} pacientes (${pct540}%) llevan más de 540 días en lista de espera.` });
    if (kpis.promDias > kpis.medianaDias * 1.3) ins.push({ label: 'Distribución Asimétrica', lucideIcon: <TrendingUp size={20} color="#8b5cf6" />, bgColor: '#ede9fe', labelColor: '#7c3aed', borderColor: '#ddd6fe', text: `Promedio (${kpis.promDias} días) muy superior a la mediana (${kpis.medianaDias} días) — hay pacientes con esperas extremas que elevan el promedio.` });
    const topEsp = Object.entries(records.reduce((a,r) => { a[r.especialidad_destino]=(a[r.especialidad_destino]||0)+1; return a; }, {})).sort((a,b)=>b[1]-a[1])[0];
    if (topEsp) ins.push({ label: 'Mayor Demanda', lucideIcon: <Activity size={20} color="#0ea5e9" />, bgColor: '#e0f2fe', labelColor: '#0369a1', borderColor: '#bae6fd', text: `${topEsp[0]} concentra la mayor demanda: ${topEsp[1].toLocaleString('es-CL')} pacientes (${Math.round(topEsp[1]/kpis.total*100)}% del total).` });
    const rural = records.filter(r => (r.urbano_rural||'').toUpperCase().includes('RURAL')).length;
    if (rural > 0) ins.push({ label: 'Brecha Territorial', lucideIcon: <MapPin size={20} color="#10b981" />, bgColor: '#d1fae5', labelColor: '#065f46', borderColor: '#a7f3d0', text: `${rural.toLocaleString('es-CL')} pacientes (${Math.round(rural/kpis.total*100)}%) provienen de zonas rurales — posible barrera de acceso.` });
    return ins;
  }, [records, kpis]);

  // Options for multi-selects (from full dataset filtered by tipo only)
  const baseRecords = useMemo(() => {
    if (!data?.records) return [];
    return tipo ? data.records.filter(x => x.tipo_lista_espera === tipo) : data.records;
  }, [data, tipo]);
  const optsEstado = useMemo(() => [...new Set(baseRecords.map(r => r.estado_ic).filter(Boolean))].sort(), [baseRecords]);
  const optsEsp = useMemo(() => [...new Set(baseRecords.map(r => r.especialidad_destino).filter(Boolean))].sort(), [baseRecords]);
  const optsOrigen = useMemo(() => [...new Set(baseRecords.map(r => r.establecimiento_origen).filter(Boolean))].sort(), [baseRecords]);
  const optsTramo = TRAMOS_ORDER.filter(t => baseRecords.some(r => r.tramo_espera === t));
  const hasFilters = estadoFiltro.length || espFiltro.length || origenFiltro.length || tramoFiltro.length;

  const exportCSV = () => {
    const headers = ['N° IC','Establecimiento Origen','Estado','Especialidad','Tipo LE','Sexo','Prevision','Urbano/Rural','PRAIS','Fecha IC','Dias Espera','Tramo Espera','Gestión IC'];
    const rows = records.map(r => [
      r.num_interconsulta, r.establecimiento_origen, r.estado_ic,
      r.especialidad_destino, r.tipo_lista_espera, r.sexo, r.prevision,
      r.urbano_rural, r.prais, r.fecha_ic ? String(r.fecha_ic).substring(0, 10) : '',
      r.dias_espera ?? '', r.tramo_espera, r.gestion_interconsulta
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `lista_espera_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16, color: '#64748b' }}>
      <div style={{ width: 48, height: 48, border: '4px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ fontWeight: 600 }}>Cargando lista de espera…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: 600, margin: '80px auto', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 16, padding: 32, textAlign: 'center' }}>
      <AlertTriangle size={40} color="#f97316" style={{ marginBottom: 12 }} />
      <h2 style={{ color: '#9a3412', fontWeight: 800, marginBottom: 8 }}>Datos no disponibles</h2>
      <p style={{ color: '#9a3412', marginBottom: 16 }}>
        No se encontró el archivo de datos. Debes ejecutar primero el script de extracción:
      </p>
      <code style={{ background: '#fef3c7', padding: '8px 16px', borderRadius: 8, display: 'block', marginBottom: 20, fontWeight: 700 }}>
        node fetch-lista-espera.cjs
      </code>
      <p style={{ color: '#78350f', fontSize: '0.85rem' }}>O haz doble clic en <b>update-lista-espera.bat</b> (con VPN activa)</p>
      <button onClick={loadData} style={{ marginTop: 16, background: '#6366f1', color: 'white', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
        Reintentar
      </button>
    </div>
  );

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto', fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={onBack} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>
            <ArrowLeft size={16} /> Volver
          </button>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>
              Lista de Espera — {tipo ? `Especialidades ${tipo}s` : 'Consultas 2026'}
            </h1>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>
              Establecimiento destino: <b>VILLARRICA HOSP.</b> · FONASA A-B-C-D ·
              Actualizado: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString('es-CL') : '—'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
            <Download size={15} /> Exportar CSV
          </button>
          <button onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#6366f1', color: 'white', border: 'none', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
            <RefreshCw size={15} /> Recargar
          </button>
        </div>
      </div>

      {/* Filtros multi-select */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <MultiSelect label="Estado IC" options={optsEstado} selected={estadoFiltro} onChange={setEstadoFiltro} color="#6366f1" />
        <MultiSelect label="Especialidad" options={optsEsp} selected={espFiltro} onChange={setEspFiltro} color="#0ea5e9" />
        <MultiSelect label="Establecimiento Origen" options={optsOrigen} selected={origenFiltro} onChange={setOrigenFiltro} color="#10b981" />
        <MultiSelect label="Tramo de Espera" options={optsTramo} selected={tramoFiltro} onChange={setTramoFiltro} color="#f59e0b" />
        {hasFilters && (
          <button onClick={() => { setEstadoFiltro([]); setEspFiltro([]); setOrigenFiltro([]); setTramoFiltro([]); }}
            style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 10, padding: '7px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>
            ✕ Limpiar filtros
          </button>
        )}
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <KPICard icon={<Users size={18} />} label="Total en Lista de Espera" value={kpis.total?.toLocaleString('es-CL')} color="#6366f1" sub={tipo ? `${tipo}s · FONASA A-B-C-D` : `${kpis.medicas?.toLocaleString('es-CL')} Médicas · ${kpis.odont?.toLocaleString('es-CL')} Odontológicas`} />
        {!tipo && <KPICard icon={<Stethoscope size={18} />} label="Especialidades Médicas" value={kpis.medicas?.toLocaleString('es-CL')} color="#0ea5e9" sub={`${kpis.total ? Math.round(kpis.medicas / kpis.total * 100) : 0}% del total`} />}
        {!tipo && <KPICard icon={<Stethoscope size={18} />} label="Especialidades Odontológicas" value={kpis.odont?.toLocaleString('es-CL')} color="#10b981" sub={`${kpis.total ? Math.round(kpis.odont / kpis.total * 100) : 0}% del total`} />}
        <KPICard icon={<Clock size={18} />} label="Espera Promedio" value={`${kpis.promDias?.toLocaleString('es-CL')} días`} color="#f59e0b" sub="Media aritmética con fecha IC" />
        <KPICard icon={<Clock size={18} />} label="Mediana de Espera" value={`${kpis.medianaDias?.toLocaleString('es-CL')} días`} color="#8b5cf6" sub="50% espera menos que esto" />
        <KPICard icon={<AlertTriangle size={18} />} label="Espera > 365 días" value={kpis.criticos?.toLocaleString('es-CL')} color="#ef4444" sub={`${kpis.total ? Math.round((kpis.criticos || 0) / kpis.total * 100) : 0}% del total`} />
      </div>

      {/* Insights rediseñados */}
      {insights.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 12, marginBottom: 24 }}>
          {insights.map((ins, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: 14, padding: '16px 18px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${ins.borderColor || '#e2e8f0'}`,
              display: 'flex', alignItems: 'flex-start', gap: 14, transition: 'box-shadow 0.2s'
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: ins.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {ins.lucideIcon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: ins.labelColor, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 3 }}>{ins.label}</div>
                <div style={{ fontSize: '0.83rem', color: '#475569', lineHeight: 1.5, fontWeight: 500 }}>{ins.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f1f5f9', borderRadius: 12, padding: 4, flexWrap: 'wrap' }}>
        {[['resumen','Resumen'],['especialidades','Por Especialidad'],['diagnosticos','Diagnósticos por Especialidad'],['analisis_volumen','Análisis de Volumen'],['origen','Por Establecimiento'],['tramos','Tramos de Espera']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.82rem',
            background: activeTab === id ? 'white' : 'transparent',
            color: activeTab === id ? '#1e293b' : '#64748b',
            boxShadow: activeTab === id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s'
          }}>{label}</button>
        ))}
      </div>

      {/* Tab: Resumen */}
      {activeTab === 'resumen' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontWeight: 800, color: '#1e293b', marginBottom: 4, fontSize: '1rem' }}>Tramos de Espera</h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 16 }}>Distribución de pacientes por tiempo de espera acumulado desde fecha IC</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byTramo.map(d => ({ ...d, pct: kpis.total ? Math.round(d.value/kpis.total*100) : 0 }))} layout="vertical" margin={{ left: 10, right: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0];
                  return <div style={{ background:'white', border:'1px solid #e2e8f0', borderRadius:10, padding:'10px 14px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }}>
                    <p style={{ fontWeight:700, fontSize:'0.82rem', color:'#1e293b', marginBottom:4 }}>{label}</p>
                    <p style={{ fontSize:'0.78rem', margin:0 }}>Pacientes: <b>{d.value.toLocaleString('es-CL')}</b></p>
                    <p style={{ fontSize:'0.78rem', margin:0, color:'#6366f1' }}>Participación: <b>{d.payload.pct}%</b></p>
                  </div>;
                }} />
                <Bar dataKey="value" name="Pacientes" radius={[0,6,6,0]}
                  label={{ content: (props) => {
                    const { x, y, width, height, value } = props;
                    if (!value) return null;
                    const pct = kpis.total ? Math.round(value / kpis.total * 100) : 0;
                    return <text x={x + width + 8} y={y + height / 2 + 4} fill="#475569" fontSize={11} fontWeight={600}>{value.toLocaleString('es-CL')} ({pct}%)</text>;
                  }}}>
                  {byTramo.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontWeight: 800, color: '#1e293b', marginBottom: 4, fontSize: '1rem' }}>Estado de Interconsulta</h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 8 }}>Distribución según estado administrativo de la IC en el sistema</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={byEstado} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value"
                  label={({ name, value, percent }) => `${Math.round(percent*100)}%`} labelLine={false}>
                  {byEstado.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(v, name) => [`${v.toLocaleString('es-CL')} (${kpis.total ? Math.round(v/kpis.total*100) : 0}%)`, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:8 }}>
              {byEstado.map((e,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 10px', borderRadius:8, background:'#f8fafc' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:10, height:10, borderRadius:'50%', background:e.fill }} />
                    <span style={{ fontSize:'0.8rem', fontWeight:600, color:'#475569' }}>{e.name}</span>
                  </div>
                  <div style={{ display:'flex', gap:12 }}>
                    <span style={{ fontSize:'0.8rem', fontWeight:700, color:'#1e293b' }}>{e.value.toLocaleString('es-CL')}</span>
                    <span style={{ fontSize:'0.8rem', fontWeight:700, color:e.fill, minWidth:36, textAlign:'right' }}>{kpis.total ? Math.round(e.value/kpis.total*100) : 0}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Especialidades — Stacked Bar Chart con tramos */}
      {activeTab === 'especialidades' && (
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ fontWeight: 800, color: '#1e293b', fontSize: '1rem', margin: 0 }}>Top 20 Especialidades</h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0' }}>Barra segmentada por tramo de espera · Clic para ver diagnósticos</p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              {TRAMOS_ORDER.filter(t => t !== 'Sin fecha').map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS_TRAMO[t] }} />
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{t}</span>
                </div>
              ))}
              <input value={searchEsp} onChange={e => setSearchEsp(e.target.value)} placeholder="Buscar…"
                style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '5px 10px', fontSize: '0.8rem', outline: 'none', width: 160 }} />
            </div>
          </div>

          {/* Custom SVG stacked bars */}
          <div style={{ overflowY: 'auto', maxHeight: 680 }}>
            {byEspecialidadStacked.map((d, i) => {
              const maxVal = byEspecialidadStacked[0]?.total || 1;
              const BAR_W = 560; // px inner bar area
              const totalW = Math.round((d.total / maxVal) * BAR_W);
              const tramos = TRAMOS_ORDER.filter(t => t !== 'Sin fecha');
              return (
                <div key={d.name} onClick={() => { setSelectedEspecialidad(d.name); setActiveTab('diagnosticos'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', cursor: 'pointer', borderRadius: 8,
                    transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  {/* Name */}
                  <div style={{ width: 240, textAlign: 'right', fontSize: '0.78rem', fontWeight: 600, color: '#475569',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 0 }}>
                    {d.shortName}
                  </div>
                  {/* Stacked bar */}
                  <div style={{ flex: 1, height: 26, display: 'flex', borderRadius: 5, overflow: 'hidden', background: '#f1f5f9' }}>
                    {tramos.map(t => {
                      const segW = d.total > 0 ? (d[t] / d.total) * totalW : 0;
                      if (segW < 1) return null;
                      return (
                        <div key={t} title={`${t}: ${d[t].toLocaleString('es-CL')} pac.`}
                          style={{ width: segW, background: COLORS_TRAMO[t], height: '100%',
                            transition: 'opacity 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'} />
                      );
                    })}
                  </div>
                  {/* Label */}
                  <div style={{ width: 110, fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', flexShrink: 0 }}>
                    {d.total.toLocaleString('es-CL')}
                    <span style={{ color: '#6366f1', marginLeft: 4, fontWeight: 800 }}>({d.pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Diagnósticos por Especialidad */}
      {activeTab === 'diagnosticos' && (
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, flexWrap:'wrap', gap:12 }}>
            <div>
              <h3 style={{ fontWeight:800, color:'#1e293b', fontSize:'1rem', margin:0 }}>Diagnósticos más frecuentes</h3>
              {selectedEspecialidad && <p style={{ fontSize:'0.82rem', color:'#6366f1', margin:'4px 0 0', fontWeight:700 }}>Especialidad: {selectedEspecialidad}</p>}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <select value={selectedEspecialidad || ''} onChange={e => setSelectedEspecialidad(e.target.value || null)}
                style={{ border:'1px solid #e2e8f0', borderRadius:8, padding:'6px 12px', fontSize:'0.82rem', outline:'none', maxWidth:300 }}>
                <option value=''>— Selecciona especialidad —</option>
                {byEspecialidad.map(e => <option key={e.fullName} value={e.fullName}>{e.fullName}</option>)}
              </select>
              <button onClick={() => { setSelectedEspecialidad(null); setActiveTab('especialidades'); }}
                style={{ background:'#f1f5f9', border:'none', borderRadius:8, padding:'6px 14px', cursor:'pointer', fontWeight:600, fontSize:'0.82rem', color:'#475569' }}>← Volver</button>
            </div>
          </div>
          {!selectedEspecialidad ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'#94a3b8' }}>
              <p style={{ fontSize:'1rem' }}>Selecciona una especialidad del menú o haz clic en una barra del tab «Por Especialidad»</p>
            </div>
          ) : byDiagnostico.length === 0 ? (
            <p style={{ color:'#94a3b8', textAlign:'center', padding:'40px 0' }}>No hay diagnósticos registrados para esta especialidad.</p>
          ) : (
            <div style={{ overflowY: 'auto', maxHeight: 620 }}>
              {byDiagnostico.map((d, i) => {
                const maxVal = byDiagnostico[0]?.total || 1;
                const BAR_W = 500;
                const totalW = Math.round((d.total / maxVal) * BAR_W);
                const tramos = TRAMOS_ORDER.filter(t => t !== 'Sin fecha');
                return (
                  <div key={d.name}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0',
                      borderRadius: 8, transition: 'background 0.15s', cursor: 'default' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ width: 280, textAlign: 'right', fontSize: '0.76rem', fontWeight: 600, color: '#475569',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 0 }}>
                      {d.shortName}
                    </div>
                    <div style={{ flex: 1, height: 24, display: 'flex', borderRadius: 4, overflow: 'hidden', background: '#f1f5f9' }}>
                      {tramos.map(t => {
                        const segW = d.total > 0 ? (d[t] / d.total) * totalW : 0;
                        if (segW < 1) return null;
                        return (
                          <div key={t} title={`${t}: ${d[t].toLocaleString('es-CL')} pac.`}
                            style={{ width: segW, background: COLORS_TRAMO[t], height: '100%', transition: 'opacity 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'} />
                        );
                      })}
                    </div>
                    <div style={{ width: 100, fontSize: '0.76rem', fontWeight: 700, color: '#1e293b', flexShrink: 0 }}>
                      {d.total.toLocaleString('es-CL')}
                      <span style={{ color: '#0ea5e9', marginLeft: 4, fontWeight: 800 }}>({d.pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {/* Tab: Análisis de Volumen */}
      {activeTab === 'analisis_volumen' && (
        <ListaEsperaAnalysis records={records} />
      )}

      {/* Tab: Origen */}
      {activeTab === 'origen' && (
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 800, color: '#1e293b', marginBottom: 20, fontSize: '1rem' }}>Top 15 Establecimientos de Origen</h3>
          <ResponsiveContainer width="100%" height={480}>
            <BarChart data={byOrigen} layout="vertical" margin={{ left: 10, right: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="name" width={240} tick={{ fontSize: 11, fill: '#475569' }} />
              <Tooltip content={<CustomTooltipBar />} />
              <Bar dataKey="value" name="Pacientes" fill="#0ea5e9" radius={[0, 6, 6, 0]} label={{ position: 'right', fontSize: 11, fill: '#475569', formatter: v => v.toLocaleString('es-CL') }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tab: Tramos detallado */}
      {activeTab === 'tramos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {TRAMOS_ORDER.filter(t => byTramo.find(x => x.name === t)).map(tramo => {
            const item = byTramo.find(x => x.name === tramo);
            const pct = kpis.total ? Math.round(item.value / kpis.total * 100) : 0;
            return (
              <div key={tramo} style={{ background: 'white', borderRadius: 14, padding: '18px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: COLORS_TRAMO[tramo], flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.92rem' }}>{tramo}</span>
                    <span style={{ fontWeight: 800, color: COLORS_TRAMO[tramo], fontSize: '1.1rem' }}>{item.value.toLocaleString('es-CL')}</span>
                  </div>
                  <div style={{ background: '#f1f5f9', borderRadius: 8, height: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: COLORS_TRAMO[tramo], borderRadius: 8, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
                <div style={{ width: 48, textAlign: 'right', fontWeight: 700, color: '#94a3b8', fontSize: '0.88rem' }}>{pct}%</div>
              </div>
            );
          })}
          <div style={{ background: '#f8fafc', borderRadius: 14, padding: '16px 24px', border: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, color: '#475569' }}>Total general</span>
            <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#1e293b' }}>{kpis.total?.toLocaleString('es-CL')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
