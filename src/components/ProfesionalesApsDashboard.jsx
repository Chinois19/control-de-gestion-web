import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import {
  ArrowLeft, RefreshCw, AlertTriangle, Users, Clock, Filter,
  Download, ChevronDown, TrendingUp, Activity, Layers, BarChart2, FileText,
  Search, ChevronRight, CheckCircle2, XCircle, Calendar, UserCheck, Shield,
  HeartHandshake, Stethoscope
} from 'lucide-react';

const PROFESION_COLORS = {
  'Enfermera(o)': '#0ea5e9',
  'Kinesiologo': '#10b981',
  'Matron(a)': '#8b5cf6',
  'Psicologia': '#f59e0b',
  'Asistente Social': '#ef4444',
  'Nutricionista': '#ec4899',
  'Tecnologo Medico': '#6366f1',
  'Terapeuta Ocupacional': '#14b8a6',
  'Fonoaudiologo': '#d946ef',
  'Quimico Farmaceutico': '#f97316',
  'Odontólogo': '#eab308',
  'Medico APS': '#3b82f6',
  'Podologa(o)': '#84cc16',
  'Tecnico Enfermeria': '#06b6d4',
  'Tecnico Paramedico': '#64748b',
  'Otros': '#94a3b8'
};

const PALETTE = ['#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6', '#d946ef', '#f97316', '#eab308', '#3b82f6', '#06b6d4'];

const getAgrupacionColor = (agr, index = 0) => {
  if (!agr) return '#94a3b8';
  if (PROFESION_COLORS[agr]) return PROFESION_COLORS[agr];
  return PALETTE[index % PALETTE.length];
};

const fmt = (n) => (n || 0).toLocaleString('es-CL');

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.94)',
      backdropFilter: 'blur(10px)',
      color: '#fff',
      padding: '12px 16px',
      borderRadius: '12px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
      border: '1px solid rgba(255,255,255,0.12)',
      fontSize: '0.82rem',
      minWidth: 200
    }}>
      <div style={{ fontWeight: 800, color: '#38bdf8', marginBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 4 }}>
        {label}
      </div>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 4 }}>
          <span style={{ color: entry.color || '#e2e8f0' }}>{entry.name}:</span>
          <span style={{ fontWeight: 700 }}>{fmt(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function ProfesionalesApsDashboard({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [agrupacionFiltro, setAgrupacionFiltro] = useState([]);
  const [profFiltro, setProfFiltro] = useState([]);
  const [tipoConsultaFiltro, setTipoConsultaFiltro] = useState([]);
  const [estadoAtencionFiltro, setEstadoAtencionFiltro] = useState('all'); // all, REALIZADA, NO REALIZADA
  const [previsionFiltro, setPrevisionFiltro] = useState('all');
  const [soloVulnerables, setSoloVulnerables] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Tabs & Pagination
  const [activeTab, setActiveTab] = useState('resumen'); // 'resumen' | 'profesionales' | 'prestaciones' | 'detalle'
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 30;

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Intenta primero cargar la versión comprimida .json.gz
      const resGz = await fetch('data/profesionales_aps_cached.json.gz?' + Date.now());
      if (resGz.ok && typeof DecompressionStream !== 'undefined') {
        const ds = new DecompressionStream('gzip');
        const decompressed = resGz.body.pipeThrough(ds);
        const d = await new Response(decompressed).json();
        setData(d);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn('Fallback a .json sin comprimir para Profesionales APS:', e);
    }

    try {
      const res = await fetch('data/profesionales_aps_cached.json?' + Date.now());
      if (!res.ok) throw new Error('Archivo de datos RUP APS no disponible aún. Ejecute la extracción ODBC.');
      const d = await res.json();
      setData(d);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const baseRecords = useMemo(() => data?.records || [], [data]);

  // Options for filters
  const availableYears = useMemo(() => {
    const years = new Set(baseRecords.map(r => r.fecha_atencion?.substring(0, 4)).filter(Boolean));
    return Array.from(years).sort().reverse();
  }, [baseRecords]);

  const availableAgrupaciones = useMemo(() => {
    const agrs = new Set(baseRecords.map(r => r.agrupacion).filter(Boolean));
    return Array.from(agrs).sort();
  }, [baseRecords]);

  const availableProfesionales = useMemo(() => {
    let recs = baseRecords;
    if (agrupacionFiltro.length > 0) {
      recs = recs.filter(r => agrupacionFiltro.includes(r.agrupacion));
    }
    const profs = new Set(recs.map(r => r.profesional_nombre).filter(Boolean));
    return Array.from(profs).sort();
  }, [baseRecords, agrupacionFiltro]);

  const availableTiposConsulta = useMemo(() => {
    const tipos = new Set(baseRecords.map(r => r.tipo_consulta).filter(Boolean));
    return Array.from(tipos).sort();
  }, [baseRecords]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return baseRecords.filter(r => {
      // Año
      if (selectedYear !== 'all') {
        if (!r.fecha_atencion || !r.fecha_atencion.startsWith(selectedYear)) return false;
      }
      // Mes
      if (selectedMonth !== 'all') {
        if (!r.fecha_atencion || r.fecha_atencion.substring(5, 7) !== selectedMonth) return false;
      }
      // Agrupación
      if (agrupacionFiltro.length > 0 && !agrupacionFiltro.includes(r.agrupacion)) return false;
      // Profesional
      if (profFiltro.length > 0 && !profFiltro.includes(r.profesional_nombre)) return false;
      // Tipo Consulta
      if (tipoConsultaFiltro.length > 0 && !tipoConsultaFiltro.includes(r.tipo_consulta)) return false;
      // Estado Atención
      if (estadoAtencionFiltro !== 'all') {
        const est = (r.estado_atencion || '').toUpperCase();
        if (estadoAtencionFiltro === 'REALIZADA' && !est.includes('REALIZADA')) return false;
        if (estadoAtencionFiltro === 'NO REALIZADA' && est.includes('REALIZADA')) return false;
      }
      // Previsión
      if (previsionFiltro !== 'all') {
        if (!r.prevision || !r.prevision.includes(previsionFiltro)) return false;
      }
      // Vulnerabilidad
      if (soloVulnerables) {
        if (!r.situacion_calle && !r.es_discapacitada && !r.es_sename && !r.es_embarazada) return false;
      }
      // Texto libre
      if (searchTerm.trim()) {
        const s = searchTerm.toLowerCase();
        const prof = (r.profesional_nombre || '').toLowerCase();
        const act = (r.actividad || '').toLowerCase();
        const prest = (r.prestacion_1 || '').toLowerCase();
        const diag = (r.diagnostico_1 || '').toLowerCase();
        const ficha = (r.ficha || '').toLowerCase();
        if (!prof.includes(s) && !act.includes(s) && !prest.includes(s) && !diag.includes(s) && !ficha.includes(s)) {
          return false;
        }
      }
      return true;
    });
  }, [baseRecords, selectedYear, selectedMonth, agrupacionFiltro, profFiltro, tipoConsultaFiltro, estadoAtencionFiltro, previsionFiltro, soloVulnerables, searchTerm]);

  // Executive KPIs
  const kpis = useMemo(() => {
    const total = filteredRecords.length;
    let realizadas = 0;
    const pacientes = new Set();
    const profs = new Set();
    const dias = new Set();

    filteredRecords.forEach(r => {
      const est = (r.estado_atencion || '').toUpperCase();
      if (est.includes('REALIZADA')) realizadas++;
      if (r.ficha || r.cta_cte) pacientes.add(r.ficha || r.cta_cte);
      if (r.profesional_nombre) profs.add(r.profesional_nombre);
      if (r.fecha_atencion) dias.add(r.fecha_atencion);
    });

    const efectividad = total > 0 ? (realizadas / total) * 100 : 0;
    const nspPct = 100 - efectividad;
    const promDiario = dias.size > 0 ? Math.round(realizadas / dias.size) : 0;

    return {
      total,
      realizadas,
      noRealizadas: total - realizadas,
      efectividad,
      nspPct,
      pacientesUnicos: pacientes.size,
      profesionalesActivos: profs.size,
      promDiario,
      diasRegistrados: dias.size
    };
  }, [filteredRecords]);

  // Monthly Evolution Data
  const monthlyData = useMemo(() => {
    const map = {};
    filteredRecords.forEach(r => {
      if (!r.fecha_atencion) return;
      const key = r.fecha_atencion.substring(0, 7); // YYYY-MM
      if (!map[key]) {
        map[key] = { mes: key, Realizadas: 0, 'No Realizadas': 0, Total: 0 };
      }
      const est = (r.estado_atencion || '').toUpperCase();
      if (est.includes('REALIZADA')) {
        map[key].Realizadas++;
      } else {
        map[key]['No Realizadas']++;
      }
      map[key].Total++;
    });

    return Object.keys(map).sort().map(k => ({
      ...map[k],
      label: k
    }));
  }, [filteredRecords]);

  // Distribution by Agrupación
  const agrupacionData = useMemo(() => {
    const map = {};
    filteredRecords.forEach(r => {
      const agr = r.agrupacion || 'Sin Agrupación';
      map[agr] = (map[agr] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredRecords]);

  // Distribution by Tipo Consulta
  const tipoConsultaData = useMemo(() => {
    const map = {};
    filteredRecords.forEach(r => {
      const t = r.tipo_consulta || 'Sin Tipo';
      map[t] = (map[t] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredRecords]);

  // Age Ranges Distribution
  const ageData = useMemo(() => {
    const map = {};
    filteredRecords.forEach(r => {
      const g = r.rango_edad || 'Sin dato';
      map[g] = (map[g] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, count]) => ({
        name: name.replace(/^\([a-z]\)\s*/i, ''),
        count
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredRecords]);

  // Performance by Professional
  const profRanking = useMemo(() => {
    const map = {};
    filteredRecords.forEach(r => {
      const p = r.profesional_nombre || 'Desconocido';
      if (!map[p]) {
        map[p] = {
          nombre: p,
          agrupacion: r.agrupacion || 'Sin estamento',
          policlinico: r.policlinico || '—',
          total: 0,
          realizadas: 0,
          noRealizadas: 0
        };
      }
      map[p].total++;
      const est = (r.estado_atencion || '').toUpperCase();
      if (est.includes('REALIZADA')) {
        map[p].realizadas++;
      } else {
        map[p].noRealizadas++;
      }
    });

    return Object.values(map)
      .map(item => ({
        ...item,
        tasaRealizacion: item.total > 0 ? (item.realizadas / item.total) * 100 : 0
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredRecords]);

  // Top Prestaciones
  const topPrestaciones = useMemo(() => {
    const map = {};
    filteredRecords.forEach(r => {
      const p = r.prestacion_1;
      if (p) {
        map[p] = (map[p] || 0) + 1;
      }
    });
    return Object.entries(map)
      .map(([prestacion, count]) => ({ prestacion, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [filteredRecords]);

  // CSV Export
  const downloadCSV = () => {
    if (!filteredRecords.length) return;
    const headers = [
      'Fecha Atención', 'Agrupación', 'Profesional', 'Policlínico', 'Tipo Consulta',
      'Actividad', 'Prestación', 'Diagnóstico', 'Estado Atención', 'Estado Hora',
      'Rango Edad', 'Edad', 'Sexo', 'Previsión', 'Comuna'
    ];

    const rows = filteredRecords.map(r => [
      r.fecha_atencion || '',
      `"${(r.agrupacion || '').replace(/"/g, '""')}"`,
      `"${(r.profesional_nombre || '').replace(/"/g, '""')}"`,
      `"${(r.policlinico || '').replace(/"/g, '""')}"`,
      `"${(r.tipo_consulta || '').replace(/"/g, '""')}"`,
      `"${(r.actividad || '').replace(/"/g, '""')}"`,
      `"${(r.prestacion_1 || '').replace(/"/g, '""')}"`,
      `"${(r.diagnostico_1 || '').replace(/"/g, '""')}"`,
      r.estado_atencion || '',
      r.estado_hora || '',
      r.rango_edad || '',
      r.edad ?? '',
      r.sexo || '',
      r.prevision || '',
      r.comuna || ''
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `produccion_profesionales_aps_${selectedYear}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination for Detail Table
  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRecords.slice(start, start + rowsPerPage);
  }, [filteredRecords, currentPage]);

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <RefreshCw size={40} className="animate-spin text-cyan-600" style={{ animation: 'spin 1s linear infinite', color: '#0891b2' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Cargando Consultas de Profesionales No Médicos...</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Descomprimiendo caché RUP APS (HOJA_DIARIA Oracle DSSASUR)...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div style={{ padding: '40px', maxWidth: '800px', margin: '40px auto', background: '#fff', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', textAlign: 'center' }}>
        <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>No se pudo conectar a los datos RUP APS</h2>
        <p style={{ color: '#64748b', margin: '12px 0 24px' }}>{error}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button onClick={loadData} style={{ padding: '10px 20px', background: '#0891b2', color: '#fff', borderRadius: '10px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            Reintentar Carga
          </button>
          <button onClick={onBack} style={{ padding: '10px 20px', background: '#f1f5f9', color: '#334155', borderRadius: '10px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            Volver a Atención Abierta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '1440px', margin: '0 auto', paddingBottom: '80px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
              background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px',
              color: '#334155', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
            }}
          >
            <ArrowLeft size={18} /> Volver
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
                Consultas Profesionales No Médicos
              </h1>
              <span style={{
                background: 'rgba(8, 145, 178, 0.12)', color: '#0891b2', padding: '3px 10px',
                borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid rgba(8, 145, 178, 0.25)'
              }}>
                RUP APS
              </span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0' }}>
              Hospital de Villarrica · Fuente: HOJA_DIARIA_APS (Oracle DWH) · Actualizado: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleDateString('es-CL') : '—'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={downloadCSV}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px',
              background: '#0891b2', color: '#fff', border: 'none', borderRadius: '12px',
              fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(8, 145, 178, 0.25)'
            }}
          >
            <Download size={16} /> Exportar CSV ({fmt(filteredRecords.length)})
          </button>
          <button
            onClick={loadData}
            title="Recargar datos"
            style={{
              padding: '9px', background: '#ffffff', border: '1px solid #e2e8f0',
              borderRadius: '12px', color: '#475569', cursor: 'pointer'
            }}
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Main Filter Bar */}
      <div style={{
        background: '#ffffff', padding: '18px 24px', borderRadius: '16px',
        border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14
      }}>
        {/* Año */}
        <div>
          <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
            Año
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}
          >
            <option value="all">Todos los años</option>
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Mes */}
        <div>
          <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
            Mes
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}
          >
            <option value="all">Todos los meses</option>
            <option value="01">Enero</option>
            <option value="02">Febrero</option>
            <option value="03">Marzo</option>
            <option value="04">Abril</option>
            <option value="05">Mayo</option>
            <option value="06">Junio</option>
            <option value="07">Julio</option>
            <option value="08">Agosto</option>
            <option value="09">Septiembre</option>
            <option value="10">Octubre</option>
            <option value="11">Noviembre</option>
            <option value="12">Diciembre</option>
          </select>
        </div>

        {/* Agrupación / Estamento */}
        <div>
          <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
            Estamento / Agrupación
          </label>
          <select
            value={agrupacionFiltro[0] || 'all'}
            onChange={(e) => setAgrupacionFiltro(e.target.value === 'all' ? [] : [e.target.value])}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}
          >
            <option value="all">Todos los estamentos ({availableAgrupaciones.length})</option>
            {availableAgrupaciones.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {/* Profesional */}
        <div>
          <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
            Profesional
          </label>
          <select
            value={profFiltro[0] || 'all'}
            onChange={(e) => setProfFiltro(e.target.value === 'all' ? [] : [e.target.value])}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}
          >
            <option value="all">Todos los profesionales ({availableProfesionales.length})</option>
            {availableProfesionales.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Estado Atención */}
        <div>
          <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
            Estado Atención
          </label>
          <select
            value={estadoAtencionFiltro}
            onChange={(e) => setEstadoAtencionFiltro(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}
          >
            <option value="all">Todas las atenciones</option>
            <option value="REALIZADA">Solo Realizadas</option>
            <option value="NO REALIZADA">No Realizadas / NSP</option>
          </select>
        </div>

        {/* Buscador de texto */}
        <div>
          <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
            Búsqueda rápida
          </label>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 10, top: 11 }} />
            <input
              type="text"
              placeholder="Ficha, prestación, dx..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.84rem', color: '#0f172a' }}
            />
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>
            <span>TOTAL CITAS / HORAS</span>
            <Calendar size={18} color="#0891b2" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: 8 }}>
            {fmt(kpis.total)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
            Programadas y atendidas en el período
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>
            <span>ATENCIONES EFECTIVAS</span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginTop: 8 }}>
            {fmt(kpis.realizadas)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
            {kpis.efectividad.toFixed(1)}% efectividad de atención
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>
            <span>PACIENTES ÚNICOS</span>
            <Users size={18} color="#6366f1" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#6366f1', marginTop: 8 }}>
            {fmt(kpis.pacientesUnicos)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
            Personas distintas beneficiarias
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>
            <span>PROFESIONALES ACTIVOS</span>
            <UserCheck size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', marginTop: 8 }}>
            {fmt(kpis.profesionalesActivos)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
            Con atenciones en la selección
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>
            <span>TASA NO ATENCIÓN (NSP)</span>
            <XCircle size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444', marginTop: 8 }}>
            {kpis.nspPct.toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
            {fmt(kpis.noRealizadas)} horas perdidas / canceladas
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '2px solid #e2e8f0', marginBottom: 24 }}>
        {[
          { id: 'resumen', label: 'Resumen & Distribución', icon: <TrendingUp size={16} /> },
          { id: 'profesionales', label: 'Rendimiento por Profesional', icon: <UserCheck size={16} /> },
          { id: 'prestaciones', label: 'Prestaciones y Diagnósticos', icon: <Activity size={16} /> },
          { id: 'detalle', label: `Detalle Registros (${fmt(filteredRecords.length)})`, icon: <FileText size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px',
              border: 'none', background: 'transparent', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.9rem',
              color: activeTab === tab.id ? '#0891b2' : '#64748b',
              borderBottom: activeTab === tab.id ? '3px solid #0891b2' : '3px solid transparent',
              marginBottom: '-2px', transition: 'all 0.2s ease'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: RESUMEN Y DISTRIBUCION */}
      {activeTab === 'resumen' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Evolución Temporal */}
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>
              📈 Evolución Mensual de Atenciones
            </h3>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={fmt} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="Realizadas" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="No Realizadas" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráficos de Agrupación y Tipos de Consulta */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24 }}>
            {/* Por Estamento */}
            <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>
                🩺 Atenciones por Estamento / Agrupación
              </h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={agrupacionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={50}
                      paddingAngle={3}
                    >
                      {agrupacionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getAgrupacionColor(entry.name, index)} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 12 }}>
                {agrupacionData.slice(0, 8).map((entry, index) => (
                  <span key={entry.name} style={{ fontSize: '0.74rem', color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: getAgrupacionColor(entry.name, index) }}></span>
                    {entry.name} ({fmt(entry.value)})
                  </span>
                ))}
              </div>
            </div>

            {/* Rangos Etarios */}
            <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>
                👥 Distribución por Rango Etario
              </h3>
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <BarChart data={ageData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={fmt} />
                    <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Atenciones" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RENDIMIENTO POR PROFESIONAL */}
      {activeTab === 'profesionales' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Tabla de Rendimiento y Atenciones por Profesional
            </h3>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              {profRanking.length} profesionales con actividad
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '14px 20px' }}>Profesional</th>
                  <th style={{ padding: '14px 16px' }}>Estamento</th>
                  <th style={{ padding: '14px 16px' }}>Policlínico</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>Total Citas</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>Realizadas</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>No Realizadas</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>% Cumplimiento</th>
                </tr>
              </thead>
              <tbody>
                {profRanking.map((p, idx) => (
                  <tr key={p.nombre} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                    <td style={{ padding: '12px 20px', fontWeight: 700, color: '#0f172a' }}>
                      {idx + 1}. {p.nombre}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700,
                        background: `${getAgrupacionColor(p.agrupacion)}18`, color: getAgrupacionColor(p.agrupacion)
                      }}>
                        {p.agrupacion}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{p.policlinico}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{fmt(p.total)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#10b981' }}>{fmt(p.realizadas)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#ef4444' }}>{fmt(p.noRealizadas)}</td>
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                        <div style={{ width: 60, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${p.tasaRealizacion}%`, height: '100%', background: p.tasaRealizacion >= 80 ? '#10b981' : p.tasaRealizacion >= 60 ? '#f59e0b' : '#ef4444' }}></div>
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#0f172a' }}>
                          {p.tasaRealizacion.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PRESTACIONES Y DIAGNOSTICOS */}
      {activeTab === 'prestaciones' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24 }}>
          {/* Top Prestaciones */}
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>
              📋 Top 15 Prestaciones Realizadas
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topPrestaciones.map((pr, i) => (
                <div key={pr.prestacion} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, maxWidth: '75%' }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>
                      {i + 1}
                    </span>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{pr.prestacion}</span>
                  </div>
                  <span style={{ fontWeight: 800, color: '#0284c7' }}>{fmt(pr.count)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tipos de Consulta */}
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>
              🎯 Tipos de Consulta / Actividad
            </h3>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <BarChart data={tipoConsultaData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={fmt} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Atenciones" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DETALLE REGISTROS */}
      {activeTab === 'detalle' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Registro Individual de Atenciones RUP APS
            </h3>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Mostrando {fmt((currentPage - 1) * rowsPerPage + 1)} - {fmt(Math.min(currentPage * rowsPerPage, filteredRecords.length))} de {fmt(filteredRecords.length)} registros
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '12px 16px' }}>Fecha</th>
                  <th style={{ padding: '12px 16px' }}>Estamento</th>
                  <th style={{ padding: '12px 16px' }}>Profesional</th>
                  <th style={{ padding: '12px 16px' }}>Policlínico</th>
                  <th style={{ padding: '12px 16px' }}>Tipo Consulta</th>
                  <th style={{ padding: '12px 16px' }}>Prestación</th>
                  <th style={{ padding: '12px 16px' }}>Edad/Sexo</th>
                  <th style={{ padding: '12px 16px' }}>Previsión</th>
                  <th style={{ padding: '12px 16px' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.map((r, i) => {
                  const est = (r.estado_atencion || '').toUpperCase();
                  const isRealizada = est.includes('REALIZADA');
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                      <td style={{ padding: '10px 16px', whiteSpace: 'nowrap', fontWeight: 600, color: '#0f172a' }}>
                        {r.fecha_atencion || '—'}
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700,
                          background: `${getAgrupacionColor(r.agrupacion)}15`, color: getAgrupacionColor(r.agrupacion)
                        }}>
                          {r.agrupacion || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px', fontWeight: 600, color: '#1e293b' }}>
                        {r.profesional_nombre || '—'}
                      </td>
                      <td style={{ padding: '10px 16px', color: '#64748b' }}>{r.policlinico || '—'}</td>
                      <td style={{ padding: '10px 16px', color: '#334155' }}>{r.tipo_consulta || '—'}</td>
                      <td style={{ padding: '10px 16px', color: '#0284c7', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.prestacion_1 || r.actividad || '—'}
                      </td>
                      <td style={{ padding: '10px 16px', color: '#64748b' }}>
                        {r.edad ? `${r.edad}a` : '—'} {r.sexo ? `(${r.sexo})` : ''}
                      </td>
                      <td style={{ padding: '10px 16px', color: '#64748b' }}>{r.prevision || '—'}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700,
                          background: isRealizada ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          color: isRealizada ? '#10b981' : '#ef4444'
                        }}>
                          {r.estado_atencion || r.estado_hora || '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Página {currentPage} de {totalPages || 1}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => p - 1)}
                style={{
                  padding: '6px 14px', borderRadius: '8px', border: '1px solid #cbd5e1',
                  background: currentPage <= 1 ? '#f1f5f9' : '#ffffff',
                  color: currentPage <= 1 ? '#94a3b8' : '#334155',
                  cursor: currentPage <= 1 ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.8rem'
                }}
              >
                Anterior
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                style={{
                  padding: '6px 14px', borderRadius: '8px', border: '1px solid #cbd5e1',
                  background: currentPage >= totalPages ? '#f1f5f9' : '#ffffff',
                  color: currentPage >= totalPages ? '#94a3b8' : '#334155',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.8rem'
                }}
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
