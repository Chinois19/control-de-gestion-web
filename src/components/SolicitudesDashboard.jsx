import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Users, Calendar, CheckCircle, AlertCircle, TrendingUp, RefreshCw, Filter, ChevronLeft, ChevronRight, BarChart2, PieChart, Clock
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const COLORS = ['#2ecc71', '#e74c3c', '#f1c40f', '#3498db', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];

export default function SolicitudesDashboard({ onBack }) {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('Nunca');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [periodPreset, setPeriodPreset] = useState('2025_2026');
  
  const [selectedTipo, setSelectedTipo] = useState('Todas');
  const [selectedServicio, setSelectedServicio] = useState('Todas');

  useEffect(() => {
    fetchData();
  }, []);

  const handlePresetChange = (preset) => {
    setPeriodPreset(preset);
    if (preset === '2025_2026') {
      setStartDate('2025-01-01');
      setEndDate('2026-12-31');
    } else if (preset === '2025') {
      setStartDate('2025-01-01');
      setEndDate('2025-12-31');
    } else if (preset === '2026') {
      setStartDate('2026-01-01');
      setEndDate('2026-12-31');
    } else if (preset === 'historico') {
      setStartDate('2018-01-01');
      setEndDate('2026-12-31');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/data/solicitudes_cached.json');
      if (!response.ok) {
        throw new Error('No se pudo encontrar el archivo de datos local.');
      }
      const data = await response.json();
      setRawData(data.records || []);
      
      if (data.lastUpdated) {
        const date = new Date(data.lastUpdated);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        setLastUpdated(date.toLocaleDateString('es-ES', options));
      }
    } catch (err) {
      console.warn("Local cache load failed", err);
      setError('No se pudo conectar a la base de datos ni cargar el archivo semanal.');
    } finally {
      setLoading(false);
    }
  };

  const processedData = useMemo(() => {
    return rawData.map(record => {
      let year = 'N/A';
      let monthName = 'N/A';
      let monthIndex = -1;
      let yearMonthKey = 'N/A';

      if (record.fechadocumento) {
        const dateParts = record.fechadocumento.split('-');
        if (dateParts.length === 3) {
          year = dateParts[0];
          monthIndex = parseInt(dateParts[1]) - 1;
          const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
          monthName = months[monthIndex] || 'N/A';
          yearMonthKey = `${year}-${dateParts[1]}`;
        }
      }

      return {
        ...record,
        recordId: record.record_id,
        fecha: record.fechadocumento || 'N/A',
        year,
        monthName,
        monthIndex,
        yearMonthKey,
        tipo: record.tipo_solicitud || 'N/A',
        servicio: record.servicio_dpto || 'N/A',
        dias: parseInt(record.diasderespuesta) || 0
      };
    });
  }, [rawData]);

  const filtersList = useMemo(() => {
    const tipos = [...new Set(processedData.map(d => d.tipo))].filter(t => t !== 'N/A').sort();
    const servicios = [...new Set(processedData.map(d => d.servicio))].filter(s => s !== 'N/A').sort();
    return { tipos, servicios };
  }, [processedData]);

  const filteredData = useMemo(() => {
    return processedData.filter(item => {
      if (item.fecha !== 'N/A') {
        if (startDate && item.fecha < startDate) return false;
        if (endDate && item.fecha > endDate) return false;
      }
      
      if (selectedTipo !== 'Todas' && item.tipo !== selectedTipo) return false;
      if (selectedServicio !== 'Todas' && item.servicio !== selectedServicio) return false;
      
      return true;
    });
  }, [processedData, startDate, endDate, selectedTipo, selectedServicio]);

  const stats = useMemo(() => {
    const total = filteredData.length;
    let sumDias = 0;
    let countDias = 0;

    const tiposCount = {};
    const serviciosCount = {};
    const monthlyTotalMap = {};

    filteredData.forEach(d => {
      if (d.dias > 0) {
        sumDias += d.dias;
        countDias++;
      }
      tiposCount[d.tipo] = (tiposCount[d.tipo] || 0) + 1;
      serviciosCount[d.servicio] = (serviciosCount[d.servicio] || 0) + 1;

      if (d.yearMonthKey !== 'N/A') {
        monthlyTotalMap[d.yearMonthKey] = (monthlyTotalMap[d.yearMonthKey] || 0) + 1;
      }
    });

    const avgDias = countDias > 0 ? (sumDias / countDias).toFixed(1) : 0;

    const tiposData = Object.entries(tiposCount).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
    const serviciosData = Object.entries(serviciosCount).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 10);
    
    const sortedKeys = Object.keys(monthlyTotalMap).sort();
    const timelineData = sortedKeys.map(key => {
      const parts = key.split('-');
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const mIdx = parseInt(parts[1]) - 1;
      return {
        key,
        name: `${months[mIdx]} ${parts[0].slice(2)}`,
        Total: monthlyTotalMap[key]
      };
    });

    return {
      total,
      avgDias,
      tiposData,
      serviciosData,
      timelineData
    };
  }, [filteredData]);

  if (loading) {
    return (
      <div className="loader-container">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}>
          <RefreshCw size={54} color="var(--primary-accent)" />
        </motion.div>
        <h3>Conectando al repositorio de REDCap...</h3>
        <p>Procesando solicitudes ciudadanas en tiempo real.</p>
        <style jsx>{`
          .loader-container { height: 70vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; color: var(--text-dark); }
          .loader-container h3 { font-size: 1.6rem; font-weight: 700; }
          .loader-container p { color: #888; }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-view glass-card">
        <AlertCircle size={64} color="#e74c3c" />
        <h2>Error al Conectar con REDCap</h2>
        <p>No se pudo establecer la sincronización segura. Mensaje técnico: <code>{error}</code></p>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="dashboard-btn" onClick={onBack}><ArrowLeft size={18} /> Volver</button>
          <button className="dashboard-btn primary" onClick={fetchData}><RefreshCw size={18} /> Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mammo-portal" style={{ color: 'var(--text-dark)' }}>
      <header className="portal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button className="circle-back-btn" onClick={onBack} title="Volver al panel superior">
            <ArrowLeft size={22} />
          </button>
          <div>
            <div className="header-badges">
              <span className="live-status"><span className="pulse-dot"></span> REDCap Activo</span>
              <span className="api-badge">OIRS Hospital Villarrica</span>
              <span className="update-badge">📅 Carga: {lastUpdated}</span>
            </div>
            <h1 className="portal-title">Solicitudes Ciudadanas OIRS</h1>
            <p className="portal-subtitle">Monitoreo dinámico e insights de Ley de Transparencia y Participación</p>
          </div>
        </div>
      </header>

      <div className="portal-layout" style={{ display: 'flex', gap: '24px', marginTop: '20px' }}>
        
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 16px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #3498db, #2980b9)', border: 'none',
              boxShadow: '0 4px 16px rgba(52, 152, 219, 0.35)', cursor: 'pointer', color: 'white',
              flexShrink: 0, alignSelf: 'flex-start', marginTop: '4px', fontSize: '0.82rem',
              fontWeight: 700, letterSpacing: '0.3px', transition: 'all 0.2s', whiteSpace: 'nowrap'
            }}
          >
            <Filter size={16} /> Filtros <ChevronRight size={14} />
          </button>
        )}

        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.aside 
              className="filters-sidebar glass-card"
              initial={{ opacity: 0, x: -50, width: 0 }}
              animate={{ opacity: 1, x: 0, width: '320px' }}
              exit={{ opacity: 0, x: -50, width: 0 }}
              style={{ padding: '24px', flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Filter size={18} color="var(--primary-accent)" /> Panel de Filtros
                </h3>
                <button 
                  onClick={() => setSidebarCollapsed(true)} 
                  style={{ background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#666' }}
                  title="Ocultar panel de filtros"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>

              <div className="filter-group">
                <label>Periodo de Análisis</label>
                <div className="preset-buttons" style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <button className={`preset-btn ${periodPreset === '2025_2026' ? 'active' : ''}`} onClick={() => handlePresetChange('2025_2026')}>25-26</button>
                  <button className={`preset-btn ${periodPreset === '2025' ? 'active' : ''}`} onClick={() => handlePresetChange('2025')}>2025</button>
                  <button className={`preset-btn ${periodPreset === '2026' ? 'active' : ''}`} onClick={() => handlePresetChange('2026')}>2026</button>
                  <button className={`preset-btn ${periodPreset === 'historico' ? 'active' : ''}`} onClick={() => handlePresetChange('historico')}>Histórico</button>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.7rem', color: '#888', marginBottom: '4px', display: 'block' }}>Desde</span>
                    <input type="date" className="filter-select" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPeriodPreset('custom'); }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.7rem', color: '#888', marginBottom: '4px', display: 'block' }}>Hasta</span>
                    <input type="date" className="filter-select" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPeriodPreset('custom'); }} />
                  </div>
                </div>
              </div>

              <div className="filter-group">
                <label>Tipo de Solicitud</label>
                <select className="filter-select" value={selectedTipo} onChange={(e) => setSelectedTipo(e.target.value)}>
                  <option value="Todas">Todas las solicitudes</option>
                  {filtersList.tipos.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="filter-group">
                <label>Servicio o Departamento</label>
                <select className="filter-select" value={selectedServicio} onChange={(e) => setSelectedServicio(e.target.value)}>
                  <option value="Todas">Todos los servicios</option>
                  {filtersList.servicios.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(0,0,0,0.05)', fontSize: '0.75rem', color: '#888', textAlign: 'center' }}>
                Mostrando {filteredData.length} registros
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <div className="portal-content" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="kpi-grid">
            <div className="kpi-card glass-card">
              <div className="kpi-icon" style={{ background: 'rgba(52, 152, 219, 0.1)', color: '#3498db' }}><Users size={24} /></div>
              <div className="kpi-info">
                <h3>Total Solicitudes</h3>
                <div className="kpi-value">{stats.total.toLocaleString('es-CL')}</div>
                <div className="kpi-trend">En el periodo seleccionado</div>
              </div>
            </div>
            <div className="kpi-card glass-card">
              <div className="kpi-icon" style={{ background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c' }}><Clock size={24} /></div>
              <div className="kpi-info">
                <h3>Promedio Respuesta</h3>
                <div className="kpi-value">{stats.avgDias} <span style={{ fontSize: '1rem', color: '#666' }}>días</span></div>
                <div className="kpi-trend">Tiempo promedio de resolución</div>
              </div>
            </div>
            <div className="kpi-card glass-card">
              <div className="kpi-icon" style={{ background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71' }}><CheckCircle size={24} /></div>
              <div className="kpi-info">
                <h3>Más Frecuente</h3>
                <div className="kpi-value" style={{ fontSize: '1.4rem' }}>{stats.tiposData[0]?.name || 'N/A'}</div>
                <div className="kpi-trend">{stats.tiposData[0]?.value || 0} casos registrados</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Distribución por Tipo de Solicitud</h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie data={stats.tiposData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                      {stats.tiposData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Top 10 Servicios más Solicitados</h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.serviciosData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="value" fill="var(--primary-accent)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Evolución de Solicitudes en el Tiempo</h3>
            <div style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.timelineData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#666' }} dy={10} />
                  <YAxis tick={{ fontSize: 12, fill: '#666' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="Total" stroke="#3498db" strokeWidth={3} dot={{ r: 4, fill: '#3498db', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
      <style jsx>{`
        .portal-header { margin-bottom: 0; }
        .header-badges { display: flex; gap: 10px; margin-bottom: 12px; }
        .header-badges span { padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
        .live-status { background: rgba(46, 204, 113, 0.15); color: #2ecc71; display: flex; align-items: center; gap: 6px; }
        .pulse-dot { width: 8px; height: 8px; background: #2ecc71; border-radius: 50%; box-shadow: 0 0 10px #2ecc71; animation: pulse 1.5s infinite; }
        .api-badge { background: rgba(52, 152, 219, 0.15); color: #3498db; }
        .update-badge { background: rgba(243, 156, 18, 0.15); color: #f39c12; }
        
        .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .kpi-card { padding: 24px; display: flex; align-items: center; gap: 20px; border-radius: 20px; }
        .kpi-icon { width: 60px; height: 60px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .kpi-info h3 { font-size: 0.85rem; color: #888; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px; }
        .kpi-value { font-size: 2rem; font-weight: 800; color: var(--text-dark); margin-bottom: 4px; line-height: 1.1; }
        .kpi-trend { font-size: 0.75rem; color: #666; font-weight: 600; }
        
        .filter-group { display: flex; flexDirection: column; gap: 8px; }
        .filter-group label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #888; letter-spacing: 0.5px; }
        .filter-select { width: 100%; padding: 10px 12px; border: 1px solid rgba(0,0,0,0.1); border-radius: 10px; font-size: 0.9rem; font-family: inherit; background: white; outline: none; transition: border-color 0.2s; }
        .filter-select:focus { border-color: var(--primary-accent); }
        .preset-btn { flex: 1; padding: 6px; font-size: 0.7rem; font-weight: 700; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: white; cursor: pointer; transition: all 0.2s; color: #666; }
        .preset-btn.active { background: var(--primary-accent); color: white; border-color: var(--primary-accent); }
        .preset-btn:hover:not(.active) { background: rgba(0,0,0,0.02); }
        
        .error-view { max-width: 650px; margin: 60px auto; padding: 40px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 24px; border-radius: 30px; box-shadow: 0 30px 70px rgba(0,0,0,0.15); }
        .error-view h2 { font-size: 2rem; font-weight: 800; color: #2c3e50; }
        .error-view p { color: #555; line-height: 1.6; }
        .dashboard-btn { display: flex; align-items: center; gap: 10px; padding: 12px 24px; border: 1px solid #ddd; background: white; border-radius: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .dashboard-btn.primary { background: var(--primary-accent); color: white; border-color: var(--primary-accent); }
        .dashboard-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }

        @keyframes pulse { 0% { transform: scale(0.95); opacity: 0.8; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.8; } }
      `}</style>
    </div>
  );
}
