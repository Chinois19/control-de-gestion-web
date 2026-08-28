import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  ArrowLeft, 
  Download, 
  Filter, 
  Search, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  BarChart2, 
  PieChart as PieIcon, 
  TrendingUp, 
  FileSpreadsheet, 
  RefreshCw,
  Shield,
  Layers,
  UserX,
  Stethoscope,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import * as XLSX from 'xlsx';

const COLOR_CATEGORIES = {
  'C1 - Resucitación': '#ef4444',
  'C2 - Emergencia': '#f97316',
  'C3 - Urgencia': '#eab308',
  'C4 - Urgencia Menor': '#3b82f6',
  'C5 - Sin Urgencia': '#10b981'
};

const PALETTE = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export default function EmergencyDashboard({ onBack }) {
  const [activeTab, setActiveTab] = useState('general'); // general | atencion | abandono | demanda
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ monthlySummary: [], records: [] });
  const [lastUpdated, setLastUpdated] = useState('');

  // Filtros
  const [selectedYear, setSelectedYear] = useState('Todos');
  const [selectedMonth, setSelectedMonth] = useState('Todos');
  const [selectedCat, setSelectedCat] = useState('Todas');
  const [selectedPrevision, setSelectedPrevision] = useState('Todas');
  const [selectedSexo, setSelectedSexo] = useState('Todos');
  const [selectedTipoConsulta, setSelectedTipoConsulta] = useState('Todos');
  const [searchDiag, setSearchDiag] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Intentar primero con versión comprimida .json.gz (4.9 MB)
      const resGz = await fetch('/data/urgencia_cached.json.gz');
      if (resGz.ok && typeof DecompressionStream !== 'undefined') {
        const ds = new DecompressionStream('gzip');
        const decompressed = resGz.body.pipeThrough(ds);
        const json = await new Response(decompressed).json();
        setData(json);
        setLastUpdated(json.lastUpdated ? new Date(json.lastUpdated).toLocaleString() : '');
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn("Fallback a .json sin comprimir para Urgencia:", e);
    }

    try {
      const res = await fetch('/data/urgencia_cached.json');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastUpdated(json.lastUpdated ? new Date(json.lastUpdated).toLocaleString() : '');
      }
    } catch (err) {
      console.error("Error cargando caché de Urgencia:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado de registros detallados
  const filteredRecords = useMemo(() => {
    if (!data.records) return [];
    return data.records.filter(r => {
      if (selectedYear !== 'Todos' && r.year !== parseInt(selectedYear, 10)) return false;
      if (selectedMonth !== 'Todos' && r.month !== parseInt(selectedMonth, 10)) return false;
      if (selectedCat !== 'Todas' && r.categorizacion !== selectedCat) return false;
      if (selectedPrevision !== 'Todas' && r.prevision !== selectedPrevision) return false;
      if (selectedSexo !== 'Todos' && r.sexo !== selectedSexo) return false;
      if (selectedTipoConsulta !== 'Todos' && r.tipo_consulta !== selectedTipoConsulta) return false;
      if (searchDiag.trim() !== '') {
        const query = searchDiag.toLowerCase();
        const diagGroup = (r.diagnostico_grupo || '').toLowerCase();
        const diagDesc = (r.diagnostico_desc || '').toLowerCase();
        const codCie = (r.cod_cie10 || '').toLowerCase();
        if (!diagGroup.includes(query) && !diagDesc.includes(query) && !codCie.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [data.records, selectedYear, selectedMonth, selectedCat, selectedPrevision, selectedSexo, selectedTipoConsulta, searchDiag]);

  // Cálculos KPIs Globales
  const kpis = useMemo(() => {
    const total = filteredRecords.length;
    if (total === 0) {
      return { total: 0, atendidos: 0, abandonos: 0, tasaAbandono: 0, avgWait: 0 };
    }
    const abandonos = filteredRecords.filter(r => r.estado_atencion.includes('Abandono') || r.estado_atencion.includes('Fuga')).length;
    const atendidos = total - abandonos;
    const tasaAbandono = ((abandonos / total) * 100).toFixed(1);
    const sumWait = filteredRecords.reduce((acc, curr) => acc + (curr.tiempo_espera_minutos || 0), 0);
    const avgWait = Math.round(sumWait / total);

    return { total, atendidos, abandonos, tasaAbandono, avgWait };
  }, [filteredRecords]);

  // Resumen mensual para gráfico principal de área / tendencia
  const monthlyTrendData = useMemo(() => {
    const map = {};
    filteredRecords.forEach(r => {
      const monthKey = `${r.year}-${r.month < 10 ? '0' : ''}${r.month}`;
      if (!map[monthKey]) {
        map[monthKey] = { periodo: monthKey, total: 0, atendidos: 0, abandonos: 0, sumWait: 0 };
      }
      map[monthKey].total += 1;
      if (r.estado_atencion.includes('Abandono') || r.estado_atencion.includes('Fuga')) {
        map[monthKey].abandonos += 1;
      } else {
        map[monthKey].atendidos += 1;
      }
      map[monthKey].sumWait += (r.tiempo_espera_minutos || 0);
    });

    return Object.keys(map).sort().map(key => {
      const item = map[key];
      const tasaAbandono = item.total > 0 ? parseFloat(((item.abandonos / item.total) * 100).toFixed(2)) : 0;
      const avgWait = item.total > 0 ? Math.round(item.sumWait / item.total) : 0;
      return {
        periodo: key,
        DemandaTotal: item.total,
        Atendidos: item.atendidos,
        Abandonos: item.abandonos,
        TasaAbandono: tasaAbandono,
        TiempoEspera: avgWait
      };
    });
  }, [filteredRecords]);

  // Distribución por Categorización C1-C5
  const catDistribution = useMemo(() => {
    const counts = {};
    filteredRecords.forEach(r => {
      const cat = r.categorizacion || 'Sin Categorizar';
      if (!counts[cat]) counts[cat] = { count: 0, sumWait: 0 };
      counts[cat].count += 1;
      counts[cat].sumWait += (r.tiempo_espera_minutos || 0);
    });
    return Object.keys(counts).sort().map(cat => ({
      name: cat,
      pacientes: counts[cat].count,
      avgWait: counts[cat].count > 0 ? Math.round(counts[cat].sumWait / counts[cat].count) : 0,
      porcentaje: ((counts[cat].count / (filteredRecords.length || 1)) * 100).toFixed(1)
    }));
  }, [filteredRecords]);

  // Distribución por Procedencia
  const procedenciaData = useMemo(() => {
    const counts = {};
    filteredRecords.forEach(r => {
      const proc = r.procedencia || 'Sin Datos';
      counts[proc] = (counts[proc] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    })).sort((a, b) => b.value - a.value);
  }, [filteredRecords]);

  // Distribución por Sexo
  const sexoData = useMemo(() => {
    const counts = {};
    filteredRecords.forEach(r => {
      const s = r.sexo || 'Sin Registro';
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [filteredRecords]);

  // Pirámide Rango Etario y Sexo
  const piramideEtariaData = useMemo(() => {
    const map = {};
    filteredRecords.forEach(r => {
      const grp = r.grupo_edad || 'Otro';
      if (!map[grp]) map[grp] = { grupo: grp, Masculino: 0, Femenino: 0 };
      if (r.sexo === 'Masculino') map[grp].Masculino += 1;
      else if (r.sexo === 'Femenino') map[grp].Femenino += 1;
    });
    return Object.keys(map).sort().map(k => map[k]);
  }, [filteredRecords]);

  // Distribución por Diagnóstico CIE-10 Grupo
  const diagGroupData = useMemo(() => {
    const counts = {};
    filteredRecords.forEach(r => {
      const d = r.diagnostico_grupo || 'Sin Registro';
      counts[d] = (counts[d] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key,
      total: counts[key]
    })).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [filteredRecords]);

  // Heatmap Día de la semana y Horario
  const diaHorarioMatrix = useMemo(() => {
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const tramos = ['00:00 - 03:59', '04:00 - 07:59', '08:00 - 11:59', '12:00 - 15:59', '16:00 - 19:59', '20:00 - 23:59'];
    const matrix = {};
    dias.forEach(d => {
      matrix[d] = {};
      tramos.forEach(t => { matrix[d][t] = 0; });
    });

    filteredRecords.forEach(r => {
      if (r.dia_semana && r.tramo_horario && matrix[r.dia_semana] && matrix[r.dia_semana][r.tramo_horario] !== undefined) {
        matrix[r.dia_semana][r.tramo_horario] += 1;
      }
    });

    return { dias, tramos, matrix };
  }, [filteredRecords]);

  // Exportar a Excel
  const handleExportExcel = () => {
    const exportData = filteredRecords.map(r => ({
      ID: r.id,
      'Fecha Admisión': r.fecha_admision,
      Año: r.year,
      Mes: r.month,
      'Estado Atención': r.estado_atencion,
      'Categorización': r.categorizacion,
      'Tipo Consulta': r.tipo_consulta,
      Procedencia: r.procedencia,
      'Medio Llegada': r.medio_llegada,
      Previsión: r.prevision,
      Beneficiario: r.beneficiario,
      Sexo: r.sexo,
      'Edad (Años)': r.edad,
      'Grupo Edad': r.grupo_edad,
      'Grupo Diagnóstico CIE-10': r.diagnostico_grupo,
      'CIE-10 Código': r.cod_cie10 || '',
      'Diagnóstico Descripción': r.diagnostico_desc || '',
      'Destino Inmediato': r.destino_inmediato,
      'Tiempo Espera (min)': r.tiempo_espera_minutos,
      'Día Semana': r.dia_semana,
      'Tramo Horario': r.tramo_horario
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Consultas_Urgencia");
    XLSX.writeFile(wb, `Consultas_Urgencia_Villarrica_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="emergency-dashboard" style={{ color: '#1e293b' }}>
      {/* Top Bar Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(16px)', padding: '20px 28px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={onBack} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#475569', fontWeight: 700, fontSize: '0.88rem', transition: 'all 0.2s' }}
          >
            <ArrowLeft size={18} /> Volver
          </button>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity color="#ef4444" size={28} /> Consultas de Urgencia — Hospital de Villarrica
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              Tablero de producción asistencial, categorización (Triage), tiempos de espera y análisis de abandonos.
              {lastUpdated && <span style={{ marginLeft: '12px', color: '#3b82f6', fontWeight: 600 }}>• Actualizado: {lastUpdated}</span>}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={fetchData} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualizar Datos
          </button>
          <button 
            onClick={handleExportExcel} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
          >
            <FileSpreadsheet size={18} /> Exportar Excel
          </button>
        </div>
      </div>

      {/* Control Panel: Navigation Tabs & Filters */}
      <div style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(16px)', padding: '20px 28px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', border: '1px solid rgba(226, 232, 240, 0.8)', marginBottom: '28px' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #f1f5f9', paddingBottom: '14px', marginBottom: '20px' }}>
          {[
            { id: 'general', label: 'Estadísticas Generales', icon: <BarChart2 size={18} /> },
            { id: 'atencion', label: 'Atención & Tiempos de Espera', icon: <Clock size={18} /> },
            { id: 'abandono', label: 'Abandono & Periodos', icon: <UserX size={18} /> },
            { id: 'demanda', label: 'Demanda & Capacidad', icon: <TrendingUp size={18} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #1e3a8a, #3b82f6)' : '#f8fafc',
                color: activeTab === tab.id ? 'white' : '#64748b',
                boxShadow: activeTab === tab.id ? '0 4px 14px rgba(59, 130, 246, 0.3)' : 'none'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Filters Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Año Admisión</label>
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600, color: '#334155', background: 'white' }}>
              <option value="Todos">Todos los años</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Mes</label>
            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600, color: '#334155', background: 'white' }}>
              <option value="Todos">Todos los meses</option>
              {['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map((m, idx) => (
                <option key={idx} value={idx + 1}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Categorización</label>
            <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600, color: '#334155', background: 'white' }}>
              <option value="Todas">Todas las categorías</option>
              {Object.keys(COLOR_CATEGORIES).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Previsión</label>
            <select value={selectedPrevision} onChange={e => setSelectedPrevision(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600, color: '#334155', background: 'white' }}>
              <option value="Todas">Todas las previsiones</option>
              <option value="FONASA - A">FONASA - A</option>
              <option value="FONASA - B">FONASA - B</option>
              <option value="FONASA - C">FONASA - C</option>
              <option value="FONASA - D">FONASA - D</option>
              <option value="ISAPRE">ISAPRE</option>
              <option value="PARTICULAR">PARTICULAR</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Sexo</label>
            <select value={selectedSexo} onChange={e => setSelectedSexo(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600, color: '#334155', background: 'white' }}>
              <option value="Todos">Todos</option>
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Buscador Diagnóstico</label>
            <div style={{ position: 'relative' }}>
              <input 
                placeholder="CIE-10 o nombre..." 
                value={searchDiag}
                onChange={e => setSearchDiag(e.target.value)}
                style={{ width: '100%', padding: '9px 12px 9px 32px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600, color: '#334155', background: 'white' }}
              />
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <div style={{ background: 'white', padding: '22px', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <Users size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Demanda Total Admisión</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>{kpis.total.toLocaleString()}</h3>
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>Consultas registradas</span>
          </div>
        </div>

        <div style={{ background: 'white', padding: '22px', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <CheckCircle size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pacientes Atendidos</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>{kpis.atendidos.toLocaleString()}</h3>
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>{((kpis.atendidos / (kpis.total || 1)) * 100).toFixed(1)}% del total</span>
          </div>
        </div>

        <div style={{ background: 'white', padding: '22px', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
            <UserX size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Abandonos (% Tasa)</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef4444', margin: '2px 0 0 0' }}>{kpis.abandonos.toLocaleString()} <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>({kpis.tasaAbandono}%)</span></h3>
            <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700 }}>Pacientes sin atención final</span>
          </div>
        </div>

        <div style={{ background: 'white', padding: '22px', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
            <Clock size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tiempo Prom. Espera</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>{kpis.avgWait} <span style={{ fontSize: '1rem', fontWeight: 700 }}>min</span></h3>
            <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700 }}>~{(kpis.avgWait / 60).toFixed(1)} horas</span>
          </div>
        </div>
      </div>

      {/* Dynamic Tab Contents */}

      {/* TAB 1: ESTADÍSTICAS GENERALES DE ADMISIÓN */}
      {activeTab === 'general' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Main Trend Line / Area Chart */}
          <div style={{ background: 'white', padding: '28px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 6px 24px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              Demanda Total, Atendidos y Abandonos por Año y Mes — Urgencia Hospital de Villarrica
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '24px' }}>Evolución del flujo asistencial comparativo mensual de admisiones en urgencia.</p>
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDemanda" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAtendidos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAbandonos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="periodo" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="DemandaTotal" name="Demanda Total" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDemanda)" strokeWidth={3} />
                  <Area type="monotone" dataKey="Atendidos" name="Pacientes Atendidos" stroke="#10b981" fillOpacity={1} fill="url(#colorAtendidos)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Abandonos" name="Abandonos" stroke="#ef4444" fillOpacity={1} fill="url(#colorAbandonos)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grid 2 Columns: Donut Sexo & Procedencia */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
            <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 6px 24px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '18px' }}>Distribución Porcentual por Sexo</h3>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sexoData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {sexoData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#ec4899' : '#3b82f6'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 6px 24px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '18px' }}>Origen de Procedencia del Paciente</h3>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={procedenciaData} layout="vertical" margin={{ left: 40, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" fontSize={11} />
                    <YAxis dataKey="name" type="category" fontSize={11} width={130} />
                    <Tooltip />
                    <Bar dataKey="value" name="Pacientes" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Pirámide Demográfica */}
          <div style={{ background: 'white', padding: '28px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 6px 24px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Distribución de Consultantes por Sexo y Rango de Edad</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '20px' }}>Pirámide de demanda de urgencia según grupos etarios normados MINSAL.</p>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={piramideEtariaData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="grupo" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Masculino" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Femenino" fill="#ec4899" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATENCIÓN & TIEMPOS DE ESPERA */}
      {activeTab === 'atencion' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Tarjetas de Tiempos Promedio por C1-C5 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px' }}>
            {catDistribution.map(cat => (
              <div 
                key={cat.name}
                style={{ 
                  background: 'white', 
                  padding: '20px', 
                  borderRadius: '16px', 
                  border: '1px solid #e2e8f0', 
                  borderTop: `5px solid ${COLOR_CATEGORIES[cat.name] || '#64748b'}`,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>{cat.name.split(' - ')[0]}</span>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', margin: '4px 0 10px 0' }}>{cat.name.split(' - ')[1] || cat.name}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: COLOR_CATEGORIES[cat.name] || '#1e293b' }}>{cat.avgWait} <span style={{ fontSize: '0.85rem' }}>min</span></span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{cat.pacientes} pac.</span>
                </div>
              </div>
            ))}
          </div>

          {/* Gráfico Tiempos de Espera vs Categoría */}
          <div style={{ background: 'white', padding: '28px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 6px 24px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              Tiempos Promedios de Espera para Atención Médica por Categorización Inicial (Triage)
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '24px' }}>Comparación de tiempo transcurrido desde la admisión/categorización hasta la consulta.</p>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catDistribution} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={12} label={{ value: 'Minutos Promedio', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => [`${value} minutos`, 'Tiempo Espera Promedio']} />
                  <Bar dataKey="avgWait" name="Tiempo Espera (min)" radius={[8, 8, 0, 0]}>
                    {catDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLOR_CATEGORIES[entry.name] || '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabla Pivote Ejecutiva por Categorización */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 6px 24px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Matriz Consolidada por Categoría de Urgencia</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569', fontWeight: 800 }}>
                    <th style={{ padding: '14px 18px' }}>Categorización</th>
                    <th style={{ padding: '14px 18px' }}>Total Pacientes</th>
                    <th style={{ padding: '14px 18px' }}>% Distribución</th>
                    <th style={{ padding: '14px 18px' }}>Tiempo Espera Promedio (Min)</th>
                    <th style={{ padding: '14px 18px' }}>Tiempo Espera Promedio (Horas)</th>
                  </tr>
                </thead>
                <tbody>
                  {catDistribution.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>
                      <td style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLOR_CATEGORIES[row.name] || '#64748b' }} />
                        {row.name}
                      </td>
                      <td style={{ padding: '14px 18px' }}>{row.pacientes.toLocaleString()}</td>
                      <td style={{ padding: '14px 18px' }}>{row.porcentaje}%</td>
                      <td style={{ padding: '14px 18px', fontWeight: 800, color: '#1e293b' }}>{row.avgWait} min</td>
                      <td style={{ padding: '14px 18px', color: '#64748b' }}>{(row.avgWait / 60).toFixed(1)} hrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ABANDONO & PERIODOS DE ATENCIÓN */}
      {activeTab === 'abandono' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Trend Line for Abandon Rate */}
          <div style={{ background: 'white', padding: '28px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 6px 24px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              % de Abandono Servicio de Urgencia Hospital de Villarrica por Año y Mes
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '24px' }}>Porcentaje de pacientes que abandonaron sin recibir atención médica (fugas de sala de espera).</p>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="periodo" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} unit="%" />
                  <Tooltip formatter={(value) => [`${value}%`, 'Tasa de Abandono']} />
                  <Line type="monotone" dataKey="TasaAbandono" name="% Tasa Abandono" stroke="#ef4444" strokeWidth={3} dot={{ r: 5, fill: '#ef4444' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Matrix Día y Horario de Mayor Abandono */}
          <div style={{ background: 'white', padding: '28px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 6px 24px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Matriz de Carga de Demanda por Día de la Semana y Tramo Horario</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '20px' }}>Volumen de admisiones en box de urgencia según horario punta.</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'center' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 800 }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Tramo Horario \ Día</th>
                    {diaHorarioMatrix.dias.map(d => <th key={d} style={{ padding: '12px' }}>{d}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {diaHorarioMatrix.tramos.map(t => (
                    <tr key={t} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', textAlign: 'left', fontWeight: 700, color: '#334155', background: '#fafafa' }}>{t}</td>
                      {diaHorarioMatrix.dias.map(d => {
                        const val = diaHorarioMatrix.matrix[d][t] || 0;
                        const bgIntensity = Math.min(val / 300, 1);
                        return (
                          <td 
                            key={d} 
                            style={{ 
                              padding: '12px', 
                              fontWeight: 700, 
                              color: bgIntensity > 0.5 ? 'white' : '#1e293b',
                              background: `rgba(59, 130, 246, ${Math.max(bgIntensity, 0.05)})` 
                            }}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DEMANDA & CAPACIDAD */}
      {activeTab === 'demanda' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Top 10 Diagnósticos CIE-10 */}
          <div style={{ background: 'white', padding: '28px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 6px 24px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              Principales Grupos Diagnósticos CIE-10 en Atenciones de Urgencia
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '24px' }}>Clasificación nosológica según la consulta SQL oficial de Discoverer DWH.</p>
            <div style={{ width: '100%', height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diagGroupData} layout="vertical" margin={{ left: 160, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" fontSize={11} />
                  <YAxis dataKey="name" type="category" fontSize={11} width={180} />
                  <Tooltip />
                  <Bar dataKey="total" name="Total Consultas" fill="#06b6d4" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabla Detalle de Registros Filtrados */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 6px 24px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Registro Detallado de Atenciones ({filteredRecords.length.toLocaleString()} resultados)
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Mostrando los primeros 100 registros</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569', fontWeight: 800 }}>
                    <th style={{ padding: '12px 14px' }}>ID DAU</th>
                    <th style={{ padding: '12px 14px' }}>Fecha Admisión</th>
                    <th style={{ padding: '12px 14px' }}>Categoría</th>
                    <th style={{ padding: '12px 14px' }}>Tipo Consulta</th>
                    <th style={{ padding: '12px 14px' }}>Sexo / Edad</th>
                    <th style={{ padding: '12px 14px' }}>Previsión</th>
                    <th style={{ padding: '12px 14px' }}>Grupo Diagnóstico CIE-10</th>
                    <th style={{ padding: '12px 14px' }}>Estado</th>
                    <th style={{ padding: '12px 14px' }}>Tiempo Espera</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.slice(0, 100).map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#3b82f6' }}>{row.id}</td>
                      <td style={{ padding: '10px 14px' }}>{row.fecha_admision}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ background: `${COLOR_CATEGORIES[row.categorizacion] || '#64748b'}20`, color: COLOR_CATEGORIES[row.categorizacion] || '#64748b', padding: '3px 8px', borderRadius: '12px', fontWeight: 800, fontSize: '0.75rem' }}>
                          {row.categorizacion}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>{row.tipo_consulta}</td>
                      <td style={{ padding: '10px 14px' }}>{row.sexo} ({row.edad}a)</td>
                      <td style={{ padding: '10px 14px' }}>{row.prevision}</td>
                      <td style={{ padding: '10px 14px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.diagnostico_grupo}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ color: row.estado_atencion.includes('Abandono') ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                          {row.estado_atencion}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 800 }}>{row.tiempo_espera_minutos} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
