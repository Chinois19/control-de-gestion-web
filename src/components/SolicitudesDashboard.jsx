import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Users, Calendar, CheckCircle, AlertCircle, TrendingUp, RefreshCw, Filter, ChevronLeft, ChevronRight, BarChart2, PieChart, Clock, MessageSquare, AlertTriangle, Lightbulb, TrendingDown, Scale, ShieldAlert, Award
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, LabelList
} from 'recharts';

const COLORS = ['#e74c3c', '#2ecc71', '#3498db', '#f1c40f', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];
const TIPO_COLORS = {
  'RECLAMOS': '#e74c3c',
  'FELICITACIONES': '#2ecc71',
  'SUGERENCIAS': '#f1c40f',
  'SOLICITUDES': '#3498db',
  'CONSULTAS': '#9b59b6'
};

const GESTION_COLORS = {
  'Respuesta dentro del plazo legal': '#2ecc71',
  'Respuesta fuera del plazo legal': '#e74c3c',
  'Sin respuesta, dentro del plazo legal': '#3498db',
  'Sin respuesta, fuera del plazo legal': '#f1c40f'
};

// Función auxiliar para contar días hábiles chilenos (Lunes a Viernes)
const getChileanWorkingDays = (startDateStr, endDateStr) => {
  if (!startDateStr) return 0;
  const start = new Date(startDateStr);
  const end = endDateStr ? new Date(endDateStr) : new Date('2026-05-25'); // usar fecha de hoy en el contexto local (May 25, 2026)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  
  let count = 0;
  let cur = new Date(start);
  cur.setHours(0,0,0,0);
  end.setHours(0,0,0,0);
  
  while (cur < end) {
    cur.setDate(cur.getDate() + 1);
    const day = cur.getDay();
    if (day !== 0 && day !== 6) { // Excluir Sábados (6) y Domingos (0)
      count++;
    }
  }
  return count;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '12px 16px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)' }}>
        <p className="label" style={{ fontWeight: 800, color: '#2c3e50', marginBottom: '8px', fontSize: '0.9rem' }}>{label}</p>
        {payload.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', marginBottom: '4px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: entry.color }} />
            <span style={{ color: '#555', fontWeight: 600 }}>{entry.name}:</span>
            <span style={{ color: '#2c3e50', fontWeight: 800 }}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function SolicitudesDashboard({ onBack }) {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('Nunca');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('generales');
  
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [periodPreset, setPeriodPreset] = useState('2025_2026');
  
  const [selectedTipo, setSelectedTipo] = useState('Todas');
  const [selectedServicio, setSelectedServicio] = useState('Todas');
  const [trendTipo, setTrendTipo] = useState('Todas');

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
      if (!response.ok) throw new Error('No se pudo encontrar el archivo de datos local.');
      const data = await response.json();
      setRawData(data.records || []);
      
      if (data.lastUpdated) {
        const date = new Date(data.lastUpdated);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        setLastUpdated(date.toLocaleDateString('es-ES', options));
      }
    } catch (err) {
      console.warn("Local cache load failed", err);
      setError('No se pudo conectar a la base de datos ni cargar el archivo.');
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
      let epochDate = 0;

      if (record.fechadocumento) {
        const dateParts = record.fechadocumento.split('-');
        if (dateParts.length === 3) {
          year = dateParts[0];
          monthIndex = parseInt(dateParts[1]) - 1;
          const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
          monthName = months[monthIndex] || 'N/A';
          yearMonthKey = `${year}-${dateParts[1]}`;
          epochDate = new Date(record.fechadocumento).getTime();
        }
      }

      const tipo = record.tipo_solicitud?.toUpperCase() || 'N/A';
      const respondida = !!record.fecharespuesta;
      const diasHabiles = getChileanWorkingDays(record.fechadocumento, record.fecharespuesta);

      // Determinación de la Categoría de Plazo de Gestión OIRS Chile (15 días hábiles)
      let plazoCategory = 'N/A';
      if (tipo === 'RECLAMOS') {
        if (respondida) {
          if (diasHabiles <= 15) {
            plazoCategory = 'Respuesta dentro del plazo legal';
          } else {
            plazoCategory = 'Respuesta fuera del plazo legal';
          }
        } else {
          const diasTranscurridos = getChileanWorkingDays(record.fechadocumento, null);
          if (diasTranscurridos <= 15) {
            plazoCategory = 'Sin respuesta, dentro del plazo legal';
          } else {
            plazoCategory = 'Sin respuesta, fuera del plazo legal';
          }
        }
      }

      return {
        ...record,
        recordId: record.record_id,
        fecha: record.fechadocumento || 'N/A',
        epochDate,
        year,
        monthName,
        monthIndex,
        yearMonthKey,
        tipo: tipo,
        dimension: record.reclamos || 'Sin Especificar',
        servicio: record.servicio_dpto || 'Sin Especificar',
        dias: parseInt(record.diasderespuesta) || diasHabiles || 0,
        respondida,
        plazoCategory
      };
    });
  }, [rawData]);

  const filtersList = useMemo(() => {
    const tipos = [...new Set(processedData.map(d => d.tipo))].filter(t => t !== 'N/A').sort();
    const servicios = [...new Set(processedData.map(d => d.servicio))].filter(s => s !== 'N/A').sort();
    return { tipos, servicios };
  }, [processedData]);

  const calculateStats = (dataArray) => {
    const total = dataArray.length;
    let sumDias = 0;
    let countRespondidas = 0;
    let countUnanswered = 0;
    let countFueraPlazo = 0;

    const tiposCount = {};

    dataArray.forEach(d => {
      if (d.respondida) {
        sumDias += d.dias;
        countRespondidas++;
      } else {
        countUnanswered++;
      }
      // Considerar fuera de plazo general (dias > 15 hábiles)
      if (d.dias > 15) {
        countFueraPlazo++;
      }
      tiposCount[d.tipo] = (tiposCount[d.tipo] || 0) + 1;
    });

    const avgDias = countRespondidas > 0 ? (sumDias / countRespondidas).toFixed(1) : 0;

    return { total, avgDias, countUnanswered, countFueraPlazo, tiposCount, countRespondidas };
  };

  const { 
    filteredData, previousPeriodStats, currentStats, timelineChartData, stackedBarData, 
    dimensionTableData, dimensionBarData, servicioTableData, servicioBarData, monthsList,
    reclamosGestionData, gestionKPIs, serviceRanking, dimensionRanking
  } = useMemo(() => {
    
    // Periodo Actual
    const startEpoch = new Date(startDate).getTime();
    const endEpoch = new Date(endDate).getTime() + 86400000;
    
    const currentData = processedData.filter(item => {
      if (item.epochDate === 0) return false;
      if (item.epochDate < startEpoch || item.epochDate >= endEpoch) return false;
      if (selectedTipo !== 'Todas' && item.tipo !== selectedTipo) return false;
      if (selectedServicio !== 'Todas' && item.servicio !== selectedServicio) return false;
      return true;
    });

    // Periodo Anterior
    const periodLength = endEpoch - startEpoch;
    const prevStartEpoch = startEpoch - periodLength;
    const prevEndEpoch = startEpoch;

    const prevData = processedData.filter(item => {
      if (item.epochDate === 0) return false;
      if (item.epochDate < prevStartEpoch || item.epochDate >= prevEndEpoch) return false;
      if (selectedTipo !== 'Todas' && item.tipo !== selectedTipo) return false;
      if (selectedServicio !== 'Todas' && item.servicio !== selectedServicio) return false;
      return true;
    });

    const cStats = calculateStats(currentData);
    const pStats = calculateStats(prevData);

    // Eje de meses
    const monthlyMap = {};
    const monthsSet = new Set();
    
    currentData.forEach(d => {
      if (d.yearMonthKey === 'N/A') return;
      monthsSet.add(d.yearMonthKey);
      if (!monthlyMap[d.yearMonthKey]) {
        monthlyMap[d.yearMonthKey] = { key: d.yearMonthKey, name: `${d.monthName} ${d.year.slice(2)}`, Total: 0, RECLAMOS: 0, FELICITACIONES: 0, SUGERENCIAS: 0, SOLICITUDES: 0, CONSULTAS: 0 };
      }
      monthlyMap[d.yearMonthKey].Total += 1;
      monthlyMap[d.yearMonthKey][d.tipo] = (monthlyMap[d.yearMonthKey][d.tipo] || 0) + 1;
    });

    const sortedKeys = Array.from(monthsSet).sort();
    const timelineData = sortedKeys.map(key => monthlyMap[key]);
    
    const trendFiltered = timelineData.map(month => {
      return {
        ...month,
        Value: trendTipo === 'Todas' ? month.Total : (month[trendTipo] || 0)
      }
    });

    // Filtro específico para RECLAMOS en Matriz y Top 10
    const reclamosData = currentData.filter(d => d.tipo === 'RECLAMOS');
    
    // Dimensiones Reclamos
    const dimMap = {};
    const dimTotalCount = {};
    reclamosData.forEach(d => {
      const dim = d.dimension;
      if (!dimMap[dim]) dimMap[dim] = {};
      dimMap[dim][d.yearMonthKey] = (dimMap[dim][d.yearMonthKey] || 0) + 1;
      dimTotalCount[dim] = (dimTotalCount[dim] || 0) + 1;
    });
    const dimBar = Object.entries(dimTotalCount).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 10);
    const dimTable = Object.entries(dimTotalCount).map(([name, total]) => {
      const row = { name, total };
      sortedKeys.forEach(k => { row[k] = dimMap[name]?.[k] || 0; });
      return row;
    }).sort((a,b) => b.total - a.total);

    // Servicios Reclamos
    const servMap = {};
    const servTotalCount = {};
    reclamosData.forEach(d => {
      const serv = d.servicio;
      if (!servMap[serv]) servMap[serv] = {};
      servMap[serv][d.yearMonthKey] = (servMap[serv][d.yearMonthKey] || 0) + 1;
      servTotalCount[serv] = (servTotalCount[serv] || 0) + 1;
    });
    const servBar = Object.entries(servTotalCount).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 10);
    const servTable = Object.entries(servTotalCount).map(([name, total]) => {
      const row = { name, total };
      sortedKeys.forEach(k => { row[k] = servMap[name]?.[k] || 0; });
      return row;
    }).sort((a,b) => b.total - a.total);

    const mList = sortedKeys.map(k => {
      const parts = k.split('-');
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return { key: k, label: `${months[parseInt(parts[1])-1]} ${parts[0]}` };
    });

    // ----------------------------------------------------
    // PROCESAMIENTO GESTIÓN DE PLAZOS (NUEVA PESTAÑA)
    // ----------------------------------------------------
    const gKPIs = {
      'Respuesta dentro del plazo legal': 0,
      'Respuesta fuera del plazo legal': 0,
      'Sin respuesta, dentro del plazo legal': 0,
      'Sin respuesta, fuera del plazo legal': 0,
      totalReclamos: reclamosData.length
    };

    const serviceGestObj = {};
    const dimGestObj = {};

    reclamosData.forEach(r => {
      const cat = r.plazoCategory;
      if (gKPIs[cat] !== undefined) {
        gKPIs[cat]++;
      }

      // Por Servicio
      const sName = r.servicio;
      if (!serviceGestObj[sName]) {
        serviceGestObj[sName] = { name: sName, total: 0, 'Respuesta dentro del plazo legal': 0, 'Respuesta fuera del plazo legal': 0, 'Sin respuesta, dentro del plazo legal': 0, 'Sin respuesta, fuera del plazo legal': 0 };
      }
      serviceGestObj[sName].total++;
      if (serviceGestObj[sName][cat] !== undefined) {
        serviceGestObj[sName][cat]++;
      }

      // Por Tipo de Reclamo (Dimensión)
      const dName = r.dimension;
      if (!dimGestObj[dName]) {
        dimGestObj[dName] = { name: dName, total: 0, 'Respuesta dentro del plazo legal': 0, 'Respuesta fuera del plazo legal': 0, 'Sin respuesta, dentro del plazo legal': 0, 'Sin respuesta, fuera del plazo legal': 0 };
      }
      dimGestObj[dName].total++;
      if (dimGestObj[dName][cat] !== undefined) {
        dimGestObj[dName][cat]++;
      }
    });

    // Convertir a arreglos para gráficos y tablas
    const servRank = Object.values(serviceGestObj).map(s => {
      const cumplimiento = s.total > 0 ? (((s['Respuesta dentro del plazo legal'] + s['Sin respuesta, dentro del plazo legal']) / s.total) * 100).toFixed(1) : 0;
      return { ...s, complianceRate: parseFloat(cumplimiento) };
    }).sort((a, b) => b.complianceRate - a.complianceRate);

    const dimRank = Object.values(dimGestObj).map(d => {
      const cumplimiento = d.total > 0 ? (((d['Respuesta dentro del plazo legal'] + d['Sin respuesta, dentro del plazo legal']) / d.total) * 100).toFixed(1) : 0;
      return { ...d, complianceRate: parseFloat(cumplimiento) };
    }).sort((a, b) => b.complianceRate - a.complianceRate);

    return {
      filteredData: currentData,
      previousPeriodStats: pStats,
      currentStats: cStats,
      timelineChartData: trendFiltered,
      stackedBarData: timelineData,
      dimensionTableData: dimTable,
      dimensionBarData: dimBar,
      servicioTableData: servTable,
      servicioBarData: servBar,
      monthsList: mList,
      gestionKPIs: gKPIs,
      serviceRanking: servRank,
      dimensionRanking: dimRank
    };
  }, [processedData, startDate, endDate, selectedTipo, selectedServicio, trendTipo]);

  const renderDiff = (current, previous) => {
    if (!previous || previous === 0) return <span style={{ color: '#888', fontSize: '0.75rem' }}>N/A vs ant.</span>;
    const diff = ((current - previous) / previous) * 100;
    const isPositive = diff > 0;
    const isNeutral = diff === 0;
    const color = isPositive ? '#e74c3c' : (isNeutral ? '#888' : '#2ecc71'); // Un aumento en reclamos es malo (rojo)
    const Icon = isPositive ? TrendingUp : TrendingDown;
    
    return (
      <span style={{ color, fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
        {!isNeutral && <Icon size={14} />}
        {Math.abs(diff).toFixed(1)}% vs ant.
      </span>
    );
  };

  const renderDiffPositiveIsGood = (current, previous) => {
    if (!previous || previous === 0) return <span style={{ color: '#888', fontSize: '0.75rem' }}>N/A vs ant.</span>;
    const diff = ((current - previous) / previous) * 100;
    const isPositive = diff > 0;
    const color = isPositive ? '#2ecc71' : '#e74c3c'; 
    const Icon = isPositive ? TrendingUp : TrendingDown;
    return (
      <span style={{ color, fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Icon size={14} /> {Math.abs(diff).toFixed(1)}% vs ant.
      </span>
    );
  };

  const pieData = Object.entries(currentStats.tiposCount).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

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
            </motion.aside>
          )}
        </AnimatePresence>

        <div className="portal-content" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="custom-tabs glass-card" style={{ display: 'flex', padding: '8px', borderRadius: '16px', gap: '8px', overflowX: 'auto' }}>
            <button className={`tab-btn ${activeTab === 'generales' ? 'active' : ''}`} onClick={() => setActiveTab('generales')}>
              <PieChart size={18} /> Estadísticas Generales
            </button>
            <button className={`tab-btn ${activeTab === 'tendencias' ? 'active' : ''}`} onClick={() => setActiveTab('tendencias')}>
              <TrendingUp size={18} /> Líneas de Tendencia
            </button>
            <button className={`tab-btn ${activeTab === 'gestion' ? 'active' : ''}`} onClick={() => setActiveTab('gestion')}>
              <Scale size={18} /> Gestión de Reclamos
            </button>
            <button className={`tab-btn ${activeTab === 'dimensiones' ? 'active' : ''}`} onClick={() => setActiveTab('dimensiones')}>
              <AlertTriangle size={18} /> Reclamos por Dimensión
            </button>
            <button className={`tab-btn ${activeTab === 'servicios' ? 'active' : ''}`} onClick={() => setActiveTab('servicios')}>
              <Users size={18} /> Reclamos por Servicio
            </button>
          </div>

          <div className="kpi-grid">
            <div className="kpi-card glass-card">
              <div className="kpi-icon" style={{ background: 'rgba(52, 152, 219, 0.1)', color: '#3498db' }}><MessageSquare size={24} /></div>
              <div className="kpi-info">
                <h3>Total Solicitudes</h3>
                <div className="kpi-value">{currentStats.total.toLocaleString('es-CL')}</div>
                <div className="kpi-trend">{renderDiff(currentStats.total, previousPeriodStats.total)}</div>
              </div>
            </div>
            <div className="kpi-card glass-card">
              <div className="kpi-icon" style={{ background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c' }}><AlertTriangle size={24} /></div>
              <div className="kpi-info">
                <h3>Reclamos</h3>
                <div className="kpi-value">{currentStats.tiposCount['RECLAMOS'] || 0}</div>
                <div className="kpi-trend">{renderDiff(currentStats.tiposCount['RECLAMOS'] || 0, previousPeriodStats.tiposCount['RECLAMOS'] || 0)}</div>
              </div>
            </div>
            <div className="kpi-card glass-card">
              <div className="kpi-icon" style={{ background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71' }}><CheckCircle size={24} /></div>
              <div className="kpi-info">
                <h3>Felicitaciones</h3>
                <div className="kpi-value">{currentStats.tiposCount['FELICITACIONES'] || 0}</div>
                <div className="kpi-trend">{renderDiffPositiveIsGood(currentStats.tiposCount['FELICITACIONES'] || 0, previousPeriodStats.tiposCount['FELICITACIONES'] || 0)}</div>
              </div>
            </div>
            <div className="kpi-card glass-card">
              <div className="kpi-icon" style={{ background: 'rgba(241, 196, 15, 0.1)', color: '#f1c40f' }}><Lightbulb size={24} /></div>
              <div className="kpi-info">
                <h3>Sugerencias</h3>
                <div className="kpi-value">{currentStats.tiposCount['SUGERENCIAS'] || 0}</div>
                <div className="kpi-trend">{renderDiff(currentStats.tiposCount['SUGERENCIAS'] || 0, previousPeriodStats.tiposCount['SUGERENCIAS'] || 0)}</div>
              </div>
            </div>
          </div>

          {activeTab === 'generales' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="tab-pane">
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Evolución de Solicitudes (Apiladas por Tipo)</h3>
                  <div style={{ height: '350px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stackedBarData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#666' }} dy={10} />
                        <YAxis tick={{ fontSize: 12, fill: '#666' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        {filtersList.tipos.map((tipo, idx) => (
                          <Bar key={tipo} dataKey={tipo} stackId="a" fill={TIPO_COLORS[tipo] || COLORS[idx % COLORS.length]}>
                            <LabelList dataKey={tipo} position="center" fill="#fff" style={{ fontWeight: 'bold', fontSize: '10px' }} formatter={(val) => val > 0 ? val : ''} />
                          </Bar>
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', textAlign: 'center' }}>Distribución por Tipo</h3>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={120} paddingAngle={2} dataKey="value" stroke="none">
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={TIPO_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none', marginTop: '-15px' }}>
                      <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: 600, letterSpacing: '1px' }}>TOTAL</div>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-dark)', lineHeight: 1 }}>{currentStats.total.toLocaleString('es-CL')}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}><Lightbulb size={20} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '8px', color: '#f39c12' }}/> Principales Insights de Gestión</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.5)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: 700, marginBottom: '8px' }}>GESTIÓN DE RESPUESTAS</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3498db', marginBottom: '4px' }}>{currentStats.avgDias} días</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>Promedio de días hábiles de resolución para solicitudes del periodo.</div>
                  </div>
                  <div style={{ background: 'rgba(231,76,60,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(231,76,60,0.1)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#c0392b', fontWeight: 700, marginBottom: '8px' }}>FUERA DEL PLAZO LEGAL {'>'} 15 DÍAS</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#e74c3c', marginBottom: '4px' }}>{currentStats.countFueraPlazo} casos</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>Solicitudes que excedieron el plazo legal de respuesta ({((currentStats.countFueraPlazo/currentStats.total)*100).toFixed(1)}%).</div>
                  </div>
                  <div style={{ background: 'rgba(243,156,18,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(243,156,18,0.1)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#d35400', fontWeight: 700, marginBottom: '8px' }}>SIN FECHA DE RESPUESTA</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f39c12', marginBottom: '4px' }}>{currentStats.countUnanswered} casos</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>Solicitudes actualmente en proceso o sin cierre registrado en el periodo.</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'tendencias' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="tab-pane glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Línea de Tendencia Evolutiva</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>Filtrar serie:</span>
                  <select className="filter-select" style={{ width: '200px', padding: '6px 12px' }} value={trendTipo} onChange={(e) => setTrendTipo(e.target.value)}>
                    <option value="Todas">Todas las solicitudes</option>
                    {filtersList.tipos.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              
              <div style={{ height: '450px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineChartData} margin={{ top: 30, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#666' }} dy={10} />
                    <YAxis tick={{ fontSize: 12, fill: '#666' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                    <Legend />
                    <Line name={trendTipo === 'Todas' ? 'Total Solicitudes' : trendTipo} type="monotone" dataKey="Value" stroke={trendTipo === 'Todas' ? '#3498db' : TIPO_COLORS[trendTipo]} strokeWidth={4} dot={{ r: 5, fill: trendTipo === 'Todas' ? '#3498db' : TIPO_COLORS[trendTipo], strokeWidth: 2 }} activeDot={{ r: 8 }}>
                      <LabelList dataKey="Value" position="top" style={{ fill: '#2c3e50', fontWeight: 800, fontSize: '12px' }} dy={-10} />
                    </Line>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {activeTab === 'gestion' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="tab-pane" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="glass-card" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><Scale color="var(--primary-accent)" /> Control de Plazos y Cumplimiento Legal (15 Días Hábiles)</h2>
                
                {/* Indicadores de Gestión OIRS específicos */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ background: 'rgba(46, 204, 113, 0.08)', border: '1px solid rgba(46,204,113,0.15)', padding: '16px', borderRadius: '16px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#27ae60', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Respuesta en Plazo</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2ecc71', margin: '4px 0' }}>{gestionKPIs['Respuesta dentro del plazo legal']} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>casos</span></div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{(((gestionKPIs['Respuesta dentro del plazo legal'] || 0) / (gestionKPIs.totalReclamos || 1)) * 100).toFixed(1)}% del total reclamos.</div>
                  </div>
                  <div style={{ background: 'rgba(231, 76, 60, 0.08)', border: '1px solid rgba(231,76,60,0.15)', padding: '16px', borderRadius: '16px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c0392b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Respuesta fuera de Plazo</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#e74c3c', margin: '4px 0' }}>{gestionKPIs['Respuesta fuera del plazo legal']} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>casos</span></div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{(((gestionKPIs['Respuesta fuera del plazo legal'] || 0) / (gestionKPIs.totalReclamos || 1)) * 100).toFixed(1)}% del total reclamos.</div>
                  </div>
                  <div style={{ background: 'rgba(52, 152, 219, 0.08)', border: '1px solid rgba(52,152,219,0.15)', padding: '16px', borderRadius: '16px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2980b9', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pte. dentro de Plazo</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3498db', margin: '4px 0' }}>{gestionKPIs['Sin respuesta, dentro del plazo legal']} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>casos</span></div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{(((gestionKPIs['Sin respuesta, dentro del plazo legal'] || 0) / (gestionKPIs.totalReclamos || 1)) * 100).toFixed(1)}% del total reclamos.</div>
                  </div>
                  <div style={{ background: 'rgba(241, 196, 15, 0.08)', border: '1px solid rgba(241,196,15,0.15)', padding: '16px', borderRadius: '16px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d35400', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pte. fuera de Plazo</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f1c40f', margin: '4px 0' }}>{gestionKPIs['Sin respuesta, fuera del plazo legal']} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>casos</span></div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{(((gestionKPIs['Sin respuesta, fuera del plazo legal'] || 0) / (gestionKPIs.totalReclamos || 1)) * 100).toFixed(1)}% del total reclamos.</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                  <div style={{ height: '400px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', fontWeight: 700 }}>Distribución de Cumplimiento por Servicio</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={serviceRanking.slice(0,8)} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#666' }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Respuesta dentro del plazo legal" stackId="a" fill={GESTION_COLORS['Respuesta dentro del plazo legal']}>
                          <LabelList dataKey="Respuesta dentro del plazo legal" position="center" fill="#fff" style={{ fontWeight: 'bold', fontSize: '9px' }} formatter={(val) => val > 0 ? val : ''} />
                        </Bar>
                        <Bar dataKey="Sin respuesta, dentro del plazo legal" stackId="a" fill={GESTION_COLORS['Sin respuesta, dentro del plazo legal']}>
                          <LabelList dataKey="Sin respuesta, dentro del plazo legal" position="center" fill="#fff" style={{ fontWeight: 'bold', fontSize: '9px' }} formatter={(val) => val > 0 ? val : ''} />
                        </Bar>
                        <Bar dataKey="Respuesta fuera del plazo legal" stackId="a" fill={GESTION_COLORS['Respuesta fuera del plazo legal']}>
                          <LabelList dataKey="Respuesta fuera del plazo legal" position="center" fill="#fff" style={{ fontWeight: 'bold', fontSize: '9px' }} formatter={(val) => val > 0 ? val : ''} />
                        </Bar>
                        <Bar dataKey="Sin respuesta, fuera del plazo legal" stackId="a" fill={GESTION_COLORS['Sin respuesta, fuera del plazo legal']}>
                          <LabelList dataKey="Sin respuesta, fuera del plazo legal" position="center" fill="#fff" style={{ fontWeight: 'bold', fontSize: '9px' }} formatter={(val) => val > 0 ? val : ''} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                    <div style={{ border: '1px solid rgba(0,0,0,0.05)', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(5px)' }}>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#27ae60', display: 'flex', alignItems: 'center', gap: '8px' }}><Award size={18} /> Mayor Cumplimiento de Plazo</h4>
                      <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-dark)' }}>{serviceRanking[0]?.name || 'N/A'}</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#666' }}>Tasa de cumplimiento legal de **{serviceRanking[0]?.complianceRate || 0}%** en el periodo.</p>
                    </div>
                    <div style={{ border: '1px solid rgba(231,76,60,0.1)', padding: '16px', borderRadius: '16px', background: 'rgba(231,76,60,0.02)' }}>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#c0392b', display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldAlert size={18} /> Crítico en Cumplimiento de Plazo</h4>
                      <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-dark)' }}>{serviceRanking[serviceRanking.length - 1]?.name || 'N/A'}</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#666' }}>Tasa de cumplimiento legal de **{serviceRanking[serviceRanking.length - 1]?.complianceRate || 0}%** en el periodo.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabla descriptora de cumplimiento por servicio */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', fontWeight: 700 }}>Tabla Descriptora y Porcentajes de Cumplimiento por Servicio Involucrado</h3>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Servicio</th>
                      <th>Total Reclamos</th>
                      <th style={{ color: '#27ae60' }}>Resp. en Plazo %</th>
                      <th style={{ color: '#c0392b' }}>Resp. Fuera %</th>
                      <th style={{ color: '#2980b9' }}>Pte. en Plazo %</th>
                      <th style={{ color: '#d35400' }}>Pte. Fuera %</th>
                      <th style={{ background: '#f5f5f5' }}>Tasa Cumplimiento Legal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceRanking.map(s => (
                      <tr key={s.name}>
                        <td style={{ textAlign: 'left', fontWeight: 700 }}>{s.name}</td>
                        <td style={{ fontWeight: 700 }}>{s.total}</td>
                        <td style={{ color: '#2ecc71', fontWeight: 600 }}>{(((s['Respuesta dentro del plazo legal'] || 0) / s.total) * 100).toFixed(1)}%</td>
                        <td style={{ color: '#e74c3c', fontWeight: 600 }}>{(((s['Respuesta fuera del plazo legal'] || 0) / s.total) * 100).toFixed(1)}%</td>
                        <td style={{ color: '#3498db', fontWeight: 600 }}>{(((s['Sin respuesta, dentro del plazo legal'] || 0) / s.total) * 100).toFixed(1)}%</td>
                        <td style={{ color: '#f1c40f', fontWeight: 600 }}>{(((s['Sin respuesta, fuera del plazo legal'] || 0) / s.total) * 100).toFixed(1)}%</td>
                        <td style={{ fontWeight: 800, background: '#fafafa', color: s.complianceRate >= 80 ? '#27ae60' : (s.complianceRate >= 50 ? '#f39c12' : '#c0392b') }}>{s.complianceRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tabla descriptora de cumplimiento por tipo de reclamo */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', fontWeight: 700 }}>Tabla Descriptora y Porcentajes de Cumplimiento por Dimensión del Reclamo</h3>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Dimensión</th>
                      <th>Total Reclamos</th>
                      <th style={{ color: '#27ae60' }}>Resp. en Plazo %</th>
                      <th style={{ color: '#c0392b' }}>Resp. Fuera %</th>
                      <th style={{ color: '#2980b9' }}>Pte. en Plazo %</th>
                      <th style={{ color: '#d35400' }}>Pte. Fuera %</th>
                      <th style={{ background: '#f5f5f5' }}>Tasa Cumplimiento Legal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dimensionRanking.slice(0, 15).map(d => (
                      <tr key={d.name}>
                        <td style={{ textAlign: 'left', fontWeight: 700 }}>{d.name}</td>
                        <td style={{ fontWeight: 700 }}>{d.total}</td>
                        <td style={{ color: '#2ecc71', fontWeight: 600 }}>{(((d['Respuesta dentro del plazo legal'] || 0) / d.total) * 100).toFixed(1)}%</td>
                        <td style={{ color: '#e74c3c', fontWeight: 600 }}>{(((d['Respuesta fuera del plazo legal'] || 0) / d.total) * 100).toFixed(1)}%</td>
                        <td style={{ color: '#3498db', fontWeight: 600 }}>{(((d['Sin respuesta, dentro del plazo legal'] || 0) / d.total) * 100).toFixed(1)}%</td>
                        <td style={{ color: '#f1c40f', fontWeight: 600 }}>{(((d['Sin respuesta, fuera del plazo legal'] || 0) / d.total) * 100).toFixed(1)}%</td>
                        <td style={{ fontWeight: 800, background: '#fafafa', color: d.complianceRate >= 80 ? '#27ae60' : (d.complianceRate >= 50 ? '#f39c12' : '#c0392b') }}>{d.complianceRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'dimensiones' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="tab-pane">
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><AlertTriangle color="#e74c3c" /> Análisis Exclusivo de Reclamos por Dimensión</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                <div className="glass-card" style={{ padding: '24px', overflowX: 'auto' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Matriz de Reclamos por Mes</h3>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>Dimensión</th>
                        {monthsList.map(m => <th key={m.key}>{m.label}</th>)}
                        <th>TOTAL</th>
                        <th>Peso %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dimensionTableData.map(row => (
                        <tr key={row.name}>
                          <td style={{ textAlign: 'left', fontWeight: 600 }}>{row.name}</td>
                          {monthsList.map(m => <td key={m.key}>{row[m.key]}</td>)}
                          <td style={{ fontWeight: 800 }}>{row.total}</td>
                          <td style={{ fontWeight: 800, color: 'var(--primary-accent)' }}>{((row.total / currentStats.tiposCount['RECLAMOS']) * 100).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Top 10 Dimensiones Más Reclamadas</h3>
                  <div style={{ height: '500px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dimensionBarData} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 10, fill: '#555' }} />
                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="value" fill="#e74c3c" radius={[0, 4, 4, 0]}>
                          <LabelList dataKey="value" position="right" style={{ fill: '#e74c3c', fontWeight: 800, fontSize: '12px' }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'servicios' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="tab-pane">
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><Users color="#3498db" /> Análisis Exclusivo de Reclamos por Servicio</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                <div className="glass-card" style={{ padding: '24px', overflowX: 'auto' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Matriz de Reclamos por Servicio</h3>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>Servicio Involucrado</th>
                        {monthsList.map(m => <th key={m.key}>{m.label}</th>)}
                        <th>TOTAL</th>
                        <th>Peso %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {servicioTableData.map(row => (
                        <tr key={row.name}>
                          <td style={{ textAlign: 'left', fontWeight: 600 }}>{row.name}</td>
                          {monthsList.map(m => <td key={m.key}>{row[m.key]}</td>)}
                          <td style={{ fontWeight: 800 }}>{row.total}</td>
                          <td style={{ fontWeight: 800, color: 'var(--primary-accent)' }}>{((row.total / currentStats.tiposCount['RECLAMOS']) * 100).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Top 10 Servicios Más Reclamados</h3>
                  <div style={{ height: '500px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={servicioBarData} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 10, fill: '#555' }} />
                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="value" fill="#3498db" radius={[0, 4, 4, 0]}>
                          <LabelList dataKey="value" position="right" style={{ fill: '#3498db', fontWeight: 800, fontSize: '12px' }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

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
        
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .kpi-card { padding: 20px; display: flex; align-items: center; gap: 16px; border-radius: 20px; }
        .kpi-icon { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .kpi-info h3 { font-size: 0.8rem; color: #888; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px; }
        .kpi-value { font-size: 1.8rem; font-weight: 800; color: var(--text-dark); margin-bottom: 4px; line-height: 1.1; }
        
        .filter-group { display: flex; flexDirection: column; gap: 8px; }
        .filter-group label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #888; letter-spacing: 0.5px; }
        .filter-select { width: 100%; padding: 10px 12px; border: 1px solid rgba(0,0,0,0.1); border-radius: 10px; font-size: 0.9rem; font-family: inherit; background: white; outline: none; transition: border-color 0.2s; }
        .filter-select:focus { border-color: var(--primary-accent); }
        .preset-btn { flex: 1; padding: 6px; font-size: 0.7rem; font-weight: 700; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: white; cursor: pointer; transition: all 0.2s; color: #666; }
        .preset-btn.active { background: var(--primary-accent); color: white; border-color: var(--primary-accent); }
        .preset-btn:hover:not(.active) { background: rgba(0,0,0,0.02); }
        
        .custom-tabs { background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); }
        .tab-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border: none; background: transparent; border-radius: 12px; font-weight: 700; font-size: 0.9rem; color: #666; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .tab-btn:hover { background: rgba(0,0,0,0.03); }
        .tab-btn.active { background: white; color: var(--primary-accent); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

        .custom-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        .custom-table th { background: rgba(0,0,0,0.02); padding: 12px 8px; font-weight: 700; color: #555; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px; border-bottom: 2px solid rgba(0,0,0,0.05); text-align: center; }
        .custom-table td { padding: 12px 8px; border-bottom: 1px solid rgba(0,0,0,0.05); text-align: center; color: #444; }
        .custom-table tr:hover td { background: rgba(0,0,0,0.01); }

        .error-view { max-width: 650px; margin: 60px auto; padding: 40px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 24px; border-radius: 30px; box-shadow: 0 30px 70px rgba(0,0,0,0.15); }
        .dashboard-btn { display: flex; align-items: center; gap: 10px; padding: 12px 24px; border: 1px solid #ddd; background: white; border-radius: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .dashboard-btn.primary { background: var(--primary-accent); color: white; border-color: var(--primary-accent); }

        @keyframes pulse { 0% { transform: scale(0.95); opacity: 0.8; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.8; } }
      `}</style>
    </div>
  );
}
