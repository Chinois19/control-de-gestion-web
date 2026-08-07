import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  ArrowLeft, RefreshCw, AlertTriangle, Users, Clock, Stethoscope, Filter,
  Download, ChevronDown, TrendingUp, Activity, Layers, BarChart2, FileText,
  PieChart as PieIcon, Video, UserCheck, Calendar, Search, ChevronRight, CheckCircle2, XCircle
} from 'lucide-react';

const COLORS_PIE = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

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

function MultiSelect({ label, options, selected, onChange, color = '#6366f1' }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef();

  useEffect(() => {
    const handleOutside = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
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
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, minWidth: 260, maxHeight: 280,
          overflowY: 'auto', background: 'white', borderRadius: 12, border: '1px solid #e2e8f0',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 999, padding: '6px'
        }}>
          <div onClick={() => onChange([])} style={{
            padding: '7px 12px', borderRadius: 8, cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: 700, color: allSelected ? color : '#64748b',
            background: allSelected ? `${color}12` : 'transparent', marginBottom: 2
          }}>
            Todas ({options.length})
          </div>
          {options.map(opt => {
            const active = selected.includes(opt);
            return (
              <div key={opt} onClick={() => toggle(opt)} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px',
                borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: active ? 700 : 500,
                color: active ? color : '#475569', background: active ? `${color}10` : 'transparent'
              }}>
                <div style={{
                  width: 15, height: 15, borderRadius: 4, border: `2px solid ${active ? color : '#cbd5e1'}`,
                  background: active ? color : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {active && <span style={{ color: 'white', fontSize: 9, fontWeight: 900 }}>✓</span>}
                </div>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ActividadesMedicinaDashboard({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [espFiltro, setEspFiltro] = useState([]);
  const [profFiltro, setProfFiltro] = useState([]);
  const [tipoConsultaFiltro, setTipoConsultaFiltro] = useState([]);
  const [estadoHoraFiltro, setEstadoHoraFiltro] = useState([]);
  const [pertinenciaFiltro, setPertinenciaFiltro] = useState([]);
  const [soloSobrecupo, setSoloSobrecupo] = useState(false);
  const [soloVideoconsulta, setSoloVideoconsulta] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Navigation
  const [activeTab, setActiveTab] = useState('resumen');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;

  const loadData = () => {
    setLoading(true);
    setError(null);
    fetch('/data/actividades_medicina_cached.json?' + Date.now())
      .then(r => {
        if (!r.ok) throw new Error('Archivo de cache no disponible');
        return r.json();
      })
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  };

  useEffect(() => { loadData(); }, []);

  const baseRecords = useMemo(() => data?.records || [], [data]);

  const optsEsp = useMemo(() => [...new Set(baseRecords.map(r => r.especialidad).filter(Boolean))].sort(), [baseRecords]);
  const optsProf = useMemo(() => [...new Set(baseRecords.map(r => r.profesional_nombre).filter(Boolean))].sort(), [baseRecords]);
  const optsTipoConsulta = useMemo(() => [...new Set(baseRecords.map(r => r.tipo_consulta).filter(Boolean))].sort(), [baseRecords]);
  const optsEstadoHora = useMemo(() => [...new Set(baseRecords.map(r => r.estado_hora).filter(Boolean))].sort(), [baseRecords]);
  const optsPertinencia = useMemo(() => [...new Set(baseRecords.map(r => r.pertinencia).filter(Boolean))].sort(), [baseRecords]);

  const records = useMemo(() => {
    let r = baseRecords;
    if (espFiltro.length) r = r.filter(x => espFiltro.includes(x.especialidad));
    if (profFiltro.length) r = r.filter(x => profFiltro.includes(x.profesional_nombre));
    if (tipoConsultaFiltro.length) r = r.filter(x => tipoConsultaFiltro.includes(x.tipo_consulta));
    if (estadoHoraFiltro.length) r = r.filter(x => estadoHoraFiltro.includes(x.estado_hora));
    if (pertinenciaFiltro.length) r = r.filter(x => pertinenciaFiltro.includes(x.pertinencia));
    if (soloSobrecupo) r = r.filter(x => (x.sobrecupo || '').toUpperCase() === 'SI' || (x.sobrecupo || '').toUpperCase() === 'S' || x.sobrecupo === '1');
    if (soloVideoconsulta) r = r.filter(x => (x.videoconsulta || '').toUpperCase() === 'SI' || (x.videoconsulta || '').toUpperCase() === 'S' || x.videoconsulta === '1');
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      r = r.filter(x =>
        (x.profesional_nombre || '').toLowerCase().includes(term) ||
        (x.especialidad || '').toLowerCase().includes(term) ||
        (x.diagnostico_1 || '').toLowerCase().includes(term) ||
        (x.prestacion_1 || '').toLowerCase().includes(term) ||
        (x.policlinico || '').toLowerCase().includes(term) ||
        (x.actividad || '').toLowerCase().includes(term)
      );
    }
    return r;
  }, [baseRecords, espFiltro, profFiltro, tipoConsultaFiltro, estadoHoraFiltro, pertinenciaFiltro, soloSobrecupo, soloVideoconsulta, searchTerm]);

  const kpis = useMemo(() => {
    const total = records.length;
    if (!total) return { total: 0, sobrecupos: 0, pctSobrecupo: 0, video: 0, pctVideo: 0, auge: 0, nuevas: 0, controles: 0 };
    
    const sobrecupos = records.filter(r => (r.sobrecupo || '').toUpperCase() === 'SI' || (r.sobrecupo || '').toUpperCase() === 'S' || r.sobrecupo === '1').length;
    const video = records.filter(r => (r.videoconsulta || '').toUpperCase() === 'SI' || (r.videoconsulta || '').toUpperCase() === 'S' || r.videoconsulta === '1').length;
    const auge = records.filter(r => r.auge_1 || r.problema_salud || r.estado_auge).length;
    const nuevas = records.filter(r => (r.tipo_consulta || '').toUpperCase().includes('NUEVA') || (r.tipo_consulta || '').toUpperCase().includes('PRIMERA')).length;
    const controles = records.filter(r => (r.tipo_consulta || '').toUpperCase().includes('CONTROL')).length;

    return {
      total,
      sobrecupos,
      pctSobrecupo: ((sobrecupos / total) * 100).toFixed(1),
      video,
      pctVideo: ((video / total) * 100).toFixed(1),
      auge,
      nuevas,
      controles
    };
  }, [records]);

  const byEspecialidad = useMemo(() => {
    const m = {};
    records.forEach(r => {
      const e = r.especialidad || 'Sin dato';
      m[e] = (m[e] || 0) + 1;
    });
    return Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({
        name: name.length > 35 ? name.substring(0, 33) + '…' : name,
        fullName: name,
        value,
        pct: kpis.total ? ((value / kpis.total) * 100).toFixed(1) : 0,
        fill: COLORS_PIE[i % COLORS_PIE.length]
      }));
  }, [records, kpis.total]);

  const byProfesional = useMemo(() => {
    const m = {};
    records.forEach(r => {
      const p = r.profesional_nombre || 'Sin profesional';
      if (!m[p]) {
        m[p] = { nombre: p, especialidad: r.especialidad || 'General', atenciones: 0, sobrecupos: 0, video: 0 };
      }
      m[p].atenciones++;
      if ((r.sobrecupo || '').toUpperCase() === 'SI' || r.sobrecupo === '1') m[p].sobrecupos++;
      if ((r.videoconsulta || '').toUpperCase() === 'SI' || r.videoconsulta === '1') m[p].video++;
    });
    return Object.values(m).sort((a, b) => b.atenciones - a.atenciones);
  }, [records]);

  const byTipoConsulta = useMemo(() => {
    const m = {};
    records.forEach(r => {
      const t = r.tipo_consulta || 'No especificado';
      m[t] = (m[t] || 0) + 1;
    });
    return Object.entries(m).map(([name, value], i) => ({
      name, value, fill: COLORS_PIE[i % COLORS_PIE.length]
    }));
  }, [records]);

  const byDiagnostico = useMemo(() => {
    const m = {};
    records.forEach(r => {
      const d = r.diagnostico_1 || r.hip_diagnostica || 'Sin diagnóstico';
      m[d] = (m[d] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 15);
  }, [records]);

  const exportCSV = () => {
    const headers = [
      'Fecha Atención', 'Especialidad', 'Profesional', 'Policlínico', 'Tipo Consulta',
      'Diagnóstico 1', 'Prestación 1', 'Pertinencia', 'Sobrecupo', 'Videoconsulta', 'Estado Hora'
    ];
    const rows = records.map(r => [
      r.fecha_atencion ? String(r.fecha_atencion).substring(0, 10) : '',
      r.especialidad, r.profesional_nombre, r.policlinico, r.tipo_consulta,
      r.diagnostico_1, r.prestacion_1, r.pertinencia, r.sobrecupo, r.videoconsulta, r.estado_hora
    ]);
    const csv = [headers, ...rows].map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `actividades_medicina_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return records.slice(start, start + rowsPerPage);
  }, [records, currentPage]);

  const totalPages = Math.ceil(records.length / rowsPerPage) || 1;

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16, color: '#64748b' }}>
      <div style={{ width: 48, height: 48, border: '4px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ fontWeight: 600 }}>Cargando Actividades de Medicina de Especialidad…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: 650, margin: '80px auto', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 16, padding: 32, textAlign: 'center' }}>
      <AlertTriangle size={44} color="#f97316" style={{ marginBottom: 12 }} />
      <h2 style={{ color: '#9a3412', fontWeight: 800, marginBottom: 8 }}>Datos de Medicina de Especialidad no disponibles</h2>
      <p style={{ color: '#9a3412', marginBottom: 16 }}>
        No se encontró el archivo de cache. Ejecuta la extracción desde la base de datos Oracle con VPN activa:
      </p>
      <code style={{ background: '#fef3c7', padding: '10px 16px', borderRadius: 8, display: 'block', marginBottom: 20, fontWeight: 700, fontSize: '0.9rem' }}>
        node fetch-actividades-medicina.cjs
      </code>
      <p style={{ color: '#78350f', fontSize: '0.85rem' }}>O ejecuta el archivo ejecutable: <b>update-actividades-medicina.bat</b></p>
      <button onClick={loadData} style={{ marginTop: 16, background: '#6366f1', color: 'white', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
        Reintentar conexión
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
            <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Stethoscope color="#6366f1" size={28} /> Actividades Medicina de Especialidad
            </h1>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>
              Hospital de Villarrica · Fuente: HOJA_DIARIA Oracle DWH ·
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

      {/* Multi-Filters bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center', background: 'white', padding: '16px 20px', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
        <MultiSelect label="Especialidad" options={optsEsp} selected={espFiltro} onChange={setEspFiltro} color="#6366f1" />
        <MultiSelect label="Profesional" options={optsProf} selected={profFiltro} onChange={setProfFiltro} color="#0ea5e9" />
        <MultiSelect label="Tipo Consulta" options={optsTipoConsulta} selected={tipoConsultaFiltro} onChange={setTipoConsultaFiltro} color="#10b981" />
        <MultiSelect label="Estado Hora" options={optsEstadoHora} selected={estadoHoraFiltro} onChange={setEstadoHoraFiltro} color="#f59e0b" />
        <MultiSelect label="Pertinencia" options={optsPertinencia} selected={pertinenciaFiltro} onChange={setPertinenciaFiltro} color="#8b5cf6" />

        {/* Toggles */}
        <button
          onClick={() => setSoloSobrecupo(!soloSobrecupo)}
          style={{
            background: soloSobrecupo ? '#fee2e2' : '#f8fafc',
            color: soloSobrecupo ? '#dc2626' : '#64748b',
            border: `1px solid ${soloSobrecupo ? '#fca5a5' : '#e2e8f0'}`,
            borderRadius: 10, padding: '7px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem'
          }}
        >
          🚨 Sobrecupos
        </button>
        <button
          onClick={() => setSoloVideoconsulta(!soloVideoconsulta)}
          style={{
            background: soloVideoconsulta ? '#e0f2fe' : '#f8fafc',
            color: soloVideoconsulta ? '#0284c7' : '#64748b',
            border: `1px solid ${soloVideoconsulta ? '#7dd3fc' : '#e2e8f0'}`,
            borderRadius: 10, padding: '7px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5
          }}
        >
          <Video size={13} /> Videoconsultas
        </button>

        {(espFiltro.length || profFiltro.length || tipoConsultaFiltro.length || estadoHoraFiltro.length || pertinenciaFiltro.length || soloSobrecupo || soloVideoconsulta) && (
          <button onClick={() => { setEspFiltro([]); setProfFiltro([]); setTipoConsultaFiltro([]); setEstadoHoraFiltro([]); setPertinenciaFiltro([]); setSoloSobrecupo(false); setSoloVideoconsulta(false); }}
            style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, padding: '7px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>
            ✕ Limpiar Filtros
          </button>
        )}
      </div>

      {/* KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <KPICard icon={<Activity size={18} />} label="Total Atenciones" value={kpis.total.toLocaleString('es-CL')} color="#6366f1" sub="Registros Hoja Diaria" />
        <KPICard icon={<Stethoscope size={18} />} label="Consultas Nuevas" value={kpis.nuevas.toLocaleString('es-CL')} color="#10b981" sub={`vs ${kpis.controles.toLocaleString('es-CL')} Controles`} />
        <KPICard icon={<AlertTriangle size={18} />} label="Sobrecupos" value={kpis.sobrecupos.toLocaleString('es-CL')} color="#ef4444" sub={`${kpis.pctSobrecupo}% del total`} />
        <KPICard icon={<Video size={18} />} label="Videoconsultas" value={kpis.video.toLocaleString('es-CL')} color="#0ea5e9" sub={`${kpis.pctVideo}% modalidad remota`} />
        <KPICard icon={<UserCheck size={18} />} label="Atenciones GES / AUGE" value={kpis.auge.toLocaleString('es-CL')} color="#8b5cf6" sub="Garantías Explícitas" />
      </div>

      {/* Navigation Tabs Bar */}
      <div style={{ marginBottom: 24, background: '#0f172a', borderRadius: 16, padding: '8px 10px', boxShadow: '0 8px 30px rgba(15,23,42,0.18)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 8 }}>
          <Layers size={17} color="#818cf8" />
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Vistas de Análisis:</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            ['resumen', 'Resumen General', <PieIcon size={14} />],
            ['especialidades', 'Por Especialidad', <BarChart2 size={14} />],
            ['profesionales', 'Por Profesional Médicos', <Users size={14} />],
            ['diagnosticos', 'Diagnósticos Frecuentes', <FileText size={14} />],
            ['registro_clinico', 'Nómina de Registros', <Search size={14} />]
          ].map(([id, label, icon]) => {
            const isActive = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 18px', borderRadius: 11, border: 'none', cursor: 'pointer',
                fontWeight: isActive ? 800 : 600, fontSize: '0.8rem',
                background: isActive ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'rgba(255,255,255,0.06)',
                color: isActive ? '#ffffff' : '#cbd5e1',
                boxShadow: isActive ? '0 4px 14px rgba(99,102,241,0.45)' : 'none',
                transition: 'all 0.2s ease', outline: 'none'
              }}>
                {icon}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab: Resumen */}
      {activeTab === 'resumen' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontWeight: 800, color: '#1e293b', marginBottom: 4, fontSize: '1rem' }}>Producción por Especialidad Médica</h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 16 }}>Volumen acumulado de atenciones por especialidad</p>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={byEspecialidad.slice(0, 10)} layout="vertical" margin={{ left: 10, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip formatter={(val) => [val.toLocaleString('es-CL'), 'Atenciones']} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontWeight: 800, color: '#1e293b', marginBottom: 4, fontSize: '1rem' }}>Distribución por Tipo de Consulta</h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 8 }}>Consultas Nuevas, Controles y Procedimientos</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byTipoConsulta} cx="50%" cy="50%" outerRadius={75} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${Math.round(percent * 100)}%`}>
                  {byTipoConsulta.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(v) => [v.toLocaleString('es-CL'), 'Atenciones']} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
              {byTipoConsulta.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 8, background: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.fill }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>{item.value.toLocaleString('es-CL')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Especialidades */}
      {activeTab === 'especialidades' && (
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 800, color: '#1e293b', marginBottom: 16, fontSize: '1.05rem' }}>Desglose por Especialidad Médica</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc', color: '#475569' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Especialidad</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Atenciones</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>% del Total</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Barra de Rendimiento</th>
                </tr>
              </thead>
              <tbody>
                {byEspecialidad.map((esp, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1e293b' }}>{esp.fullName}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#6366f1' }}>{esp.value.toLocaleString('es-CL')}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#64748b' }}>{esp.pct}%</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ background: '#f1f5f9', borderRadius: 8, height: 8, width: '100%', overflow: 'hidden' }}>
                        <div style={{ width: `${esp.pct}%`, height: '100%', background: esp.fill, borderRadius: 8 }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Profesionales */}
      {activeTab === 'profesionales' && (
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 800, color: '#1e293b', marginBottom: 16, fontSize: '1.05rem' }}>Rendimiento de Profesionales Médicos</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc', color: '#475569' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Profesional</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Especialidad</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Total Atenciones</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Sobrecupos</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Videoconsultas</th>
                </tr>
              </thead>
              <tbody>
                {byProfesional.slice(0, 30).map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1e293b' }}>{p.nombre}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{p.especialidad}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#10b981' }}>{p.atenciones.toLocaleString('es-CL')}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: p.sobrecupos > 0 ? '#ef4444' : '#94a3b8' }}>{p.sobrecupos}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: p.video > 0 ? '#0ea5e9' : '#94a3b8' }}>{p.video}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Diagnósticos */}
      {activeTab === 'diagnosticos' && (
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 800, color: '#1e293b', marginBottom: 16, fontSize: '1.05rem' }}>Top Diagnósticos Frecuentes</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
            {byDiagnostico.map(([diag, count], i) => (
              <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem', maxWidth: '80%' }}>{diag}</span>
                <span style={{ fontWeight: 800, color: '#6366f1', background: '#ede9fe', padding: '4px 12px', borderRadius: 20, fontSize: '0.85rem' }}>{count.toLocaleString('es-CL')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Registro Clínico */}
      {activeTab === 'registro_clinico' && (
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ position: 'relative', width: 320 }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 10 }} />
              <input
                type="text"
                placeholder="Buscar por médico, especialidad, diag..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.83rem', outline: 'none' }}
              />
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
              Mostrando {records.length.toLocaleString('es-CL')} registros
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc', color: '#475569' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Especialidad</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Profesional</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Policlínico</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Tipo Consulta</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Diagnóstico 1</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Prestación 1</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Estado</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Modalidad</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1e293b' }}>{r.especialidad}</td>
                    <td style={{ padding: '10px 12px', color: '#475569' }}>{r.profesional_nombre}</td>
                    <td style={{ padding: '10px 12px', color: '#64748b' }}>{r.policlinico}</td>
                    <td style={{ padding: '10px 12px', color: '#64748b' }}>{r.tipo_consulta}</td>
                    <td style={{ padding: '10px 12px', color: '#334155', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.diagnostico_1}</td>
                    <td style={{ padding: '10px 12px', color: '#334155', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.prestacion_1}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 800, background: '#e0f2fe', color: '#0369a1' }}>
                        {r.estado_atencion || r.estado_hora || 'Atendido'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {((r.videoconsulta || '').toUpperCase() === 'SI' || r.videoconsulta === '1') ? (
                        <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 800, background: '#e0f2fe', color: '#0284c7' }}>Videoconsulta</span>
                      ) : (
                        <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 800, background: '#f1f5f9', color: '#64748b' }}>Presencial</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Página {currentPage} de {totalPages}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '0.8rem', opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                Anterior
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '0.8rem', opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
