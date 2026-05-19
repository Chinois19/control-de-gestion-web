import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Filter, 
  Database, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  Activity, 
  ChevronRight,
  ChevronLeft,
  Plus, 
  Minus,
  FileText,
  Clock,
  Layers,
  Heart,
  Eye,
  Settings
} from 'lucide-react';

export default function UltrasoundDashboard({ onBack, initialTab = 'summary', initialFilterNsp = false }) {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab === 'patients' ? 'rem' : initialTab); // 'summary', 'pivot', 'classification', 'rem'
  const [lastUpdated, setLastUpdated] = useState('Nunca');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Filters
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [periodPreset, setPeriodPreset] = useState('2025_2026');
  const [selectedFuncionario, setSelectedFuncionario] = useState('Todas');
  const [selectedEstablecimiento, setSelectedEstablecimiento] = useState('Todas');
  const [selectedRangoEdad, setSelectedRangoEdad] = useState('Todas');
  const [selectedEstadoAtencion, setSelectedEstadoAtencion] = useState(initialFilterNsp ? 'No se presentó' : 'Todas');
  const [selectedProcedencia, setSelectedProcedencia] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Pivot Table Expansion
  const [expandedEstablishments, setExpandedEstablishments] = useState({});

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab === 'patients' ? 'rem' : initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialFilterNsp) {
      setSelectedEstadoAtencion('No se presentó');
    }
  }, [initialFilterNsp]);

  // Load REDCap Ultrasound Data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const response = await fetch('/data/ultrasound_cached.json');
        if (!response.ok) {
          throw new Error('No se pudo cargar el caché de ecografías de REDCap.');
        }
        const data = await response.json();
        
        // Parse dates and clean numbers
        const cleaned = data.records.map((r, idx) => ({
          ...r,
          id: r.record_id || String(idx),
          edad: parseInt(r.edad_en_a_os, 10) || 0,
          fecha: r.fecha_de_atenci_n || 'Sin Fecha',
          estadoAtencion: r.estado_de_atenci_n || 'Se presentó',
          pertinencia: r.pertinencia_en_la_derivaci || 'Sí',
          comuna: (r.bdup_comunanombre || 'Desconocida').trim().toUpperCase(),
          medico: r.funcionario_que_atiende || 'No Informado',
          procedimiento: r.descripci_n_del_ex_men || 'Otros procedimientos'
        }));
        
        setRawData(cleaned);
        
        // Format last updated timestamp
        if (data.lastUpdated) {
          const d = new Date(data.lastUpdated);
          setLastUpdated(d.toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }));
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter Helper: Determine Age Range
  function getAgeRange(age) {
    if (age < 15) return 'Pediátrico (<15)';
    if (age >= 15 && age <= 64) return 'Adulto (15-64)';
    return 'Adulto Mayor (>=65)';
  }

  // Handle Preset Changes
  const handlePeriodPresetChange = (val) => {
    setPeriodPreset(val);
    if (val === '2025') {
      setStartDate('2025-01-01');
      setEndDate('2025-12-31');
    } else if (val === '2026') {
      setStartDate('2026-01-01');
      setEndDate('2026-12-31');
    } else if (val === '2025_2026') {
      setStartDate('2025-01-01');
      setEndDate('2026-12-31');
    } else if (val === 'historico') {
      setStartDate('2018-01-01');
      setEndDate('2026-12-31');
    }
  };

  // Extract Unique Values for Dropdowns
  const uniqueDropdowns = useMemo(() => {
    const establecimientos = new Set();
    const funcionarios = new Set();
    const procedencias = new Set();

    rawData.forEach(r => {
      if (r.establecimiento_de_origen) establecimientos.add(r.establecimiento_de_origen);
      if (r.medico) funcionarios.add(r.medico);
      if (r.procedencia_de_derivaci_n) procedencias.add(r.procedencia_de_derivaci_n);
    });

    return {
      establecimientos: Array.from(establecimientos).sort(),
      funcionarios: Array.from(funcionarios).sort(),
      procedencias: Array.from(procedencias).sort()
    };
  }, [rawData]);

  // Apply Filter Logic to Data
  const filteredData = useMemo(() => {
    return rawData.filter(r => {
      // Date Range Filter
      if (r.fecha !== 'Sin Fecha') {
        if (r.fecha < startDate || r.fecha > endDate) return false;
      } else {
        return false;
      }

      // Dropdown Filters
      if (selectedEstablecimiento !== 'Todas' && r.establecimiento_de_origen !== selectedEstablecimiento) return false;
      if (selectedFuncionario !== 'Todas' && r.medico !== selectedFuncionario) return false;
      if (selectedEstadoAtencion !== 'Todas' && r.estadoAtencion !== selectedEstadoAtencion) return false;
      if (selectedProcedencia !== 'Todas' && r.procedencia_de_derivaci_n !== selectedProcedencia) return false;
      
      // Age range filter
      if (selectedRangoEdad !== 'Todas') {
        const range = getAgeRange(r.edad);
        if (range !== selectedRangoEdad) return false;
      }

      // Text Search query (safe for non-patient terms)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const cc = (r.centro_de_costo_perc || '').toLowerCase();
        const proc = (r.procedimiento || '').toLowerCase();
        const id = String(r.record_id || '').toLowerCase();
        
        if (!cc.includes(query) && !proc.includes(query) && !id.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [rawData, startDate, endDate, selectedEstablecimiento, selectedFuncionario, selectedEstadoAtencion, selectedRangoEdad, selectedProcedencia, searchQuery]);

  // KPIs & Calculations
  const stats = useMemo(() => {
    const total = filteredData.length;
    let presentCount = 0;
    let absentCount = 0;
    let sumAge = 0;
    let urgentCount = 0;
    let openCount = 0;
    let closedCount = 0;
    let nonPertinent = 0;

    filteredData.forEach(r => {
      if (r.estadoAtencion === 'Se presentó') presentCount++;
      else absentCount++;
      
      sumAge += r.edad;

      if (r.procedencia_de_derivaci_n === 'Urgencia') urgentCount++;
      else if (r.procedencia_de_derivaci_n === 'Atención Abierta') openCount++;
      else if (r.procedencia_de_derivaci_n === 'Atención Cerrada') closedCount++;

      if (r.pertinencia === 'No') nonPertinent++;
    });

    const presentPercent = total > 0 ? ((presentCount / total) * 100).toFixed(1) : '0.0';
    const nspPercent = total > 0 ? ((absentCount / total) * 100).toFixed(1) : '0.0';
    const avgAge = total > 0 ? (sumAge / total).toFixed(1) : '0.0';

    // Calculate Ultrasound lost capacity (duration approx. 20 min per exam)
    const totalHoursLost = (absentCount * 20) / 60;

    // Find worst origin centre for NSP
    const nspByCentre = {};
    filteredData.forEach(r => {
      if (r.estadoAtencion === 'No se presentó' && r.establecimiento_de_origen) {
        nspByCentre[r.establecimiento_de_origen] = (nspByCentre[r.establecimiento_de_origen] || 0) + 1;
      }
    });

    let worstEstablishment = 'Ninguno';
    let worstCount = 0;
    Object.entries(nspByCentre).forEach(([centre, cnt]) => {
      if (cnt > worstCount) {
        worstCount = cnt;
        worstEstablishment = centre;
      }
    });

    return {
      total,
      presentCount,
      absentCount,
      presentPercent,
      nspPercent,
      avgAge,
      urgentCount,
      openCount,
      closedCount,
      nonPertinent,
      totalHoursLost,
      worstEstablishment,
      worstCount,
      worstHoursLost: (worstCount * 20) / 60
    };
  }, [filteredData]);

  // Monthly Curve Data (Area Chart)
  const monthlyChartData = useMemo(() => {
    const monthlyMap = {};
    filteredData.forEach(r => {
      if (r.fecha !== 'Sin Fecha') {
        const monthKey = r.fecha.substring(0, 7); // 'YYYY-MM'
        if (!monthlyMap[monthKey]) {
          monthlyMap[monthKey] = { key: monthKey, total: 0, present: 0, absent: 0 };
        }
        monthlyMap[monthKey].total++;
        if (r.estadoAtencion === 'Se presentó') {
          monthlyMap[monthKey].present++;
        } else {
          monthlyMap[monthKey].absent++;
        }
      }
    });

    const sorted = Object.keys(monthlyMap).sort().map(key => {
      const parts = key.split('-');
      const year = parts[0];
      const monthNum = parts[1];
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const label = `${monthNames[parseInt(monthNum, 10) - 1]} ${year}`;
      
      const nspRate = monthlyMap[key].total > 0 ? (monthlyMap[key].absent / monthlyMap[key].total) * 100 : 0;
      
      return {
        key,
        label,
        total: monthlyMap[key].total,
        present: monthlyMap[key].present,
        absent: monthlyMap[key].absent,
        nspRate
      };
    });

    return sorted;
  }, [filteredData]);

  const maxChartVal = useMemo(() => {
    if (monthlyChartData.length === 0) return 100;
    const maxVal = Math.max(...monthlyChartData.map(d => d.total));
    return maxVal > 0 ? maxVal : 100;
  }, [monthlyChartData]);

  // Pivot Table Matrix: Centre vs Month
  const pivotMatrix = useMemo(() => {
    const establishmentsMap = {};
    const monthsSet = new Set();

    filteredData.forEach(r => {
      if (r.establecimiento_de_origen && r.fecha !== 'Sin Fecha') {
        const monthKey = r.fecha.substring(0, 7);
        monthsSet.add(monthKey);

        if (!establishmentsMap[r.establecimiento_de_origen]) {
          establishmentsMap[r.establecimiento_de_origen] = {
            name: r.establecimiento_de_origen,
            total: 0,
            months: {},
            procs: {}
          };
        }

        establishmentsMap[r.establecimiento_de_origen].total++;
        establishmentsMap[r.establecimiento_de_origen].months[monthKey] = 
          (establishmentsMap[r.establecimiento_de_origen].months[monthKey] || 0) + 1;

        // Group by classification
        const procName = r.procedimiento.toLowerCase().includes('abdominal') ? 'Abdominal' :
                         r.procedimiento.toLowerCase().includes('ginec') || r.procedimiento.toLowerCase().includes('transvag') ? 'Gineco-Obstétrica' :
                         r.procedimiento.toLowerCase().includes('tiroid') ? 'Tiroidea' :
                         r.procedimiento.toLowerCase().includes('renal') ? 'Renal' : 'Partes Blandas / Otros';

        establishmentsMap[r.establecimiento_de_origen].procs[procName] = 
          (establishmentsMap[r.establecimiento_de_origen].procs[procName] || 0) + 1;
      }
    });

    const sortedMonths = Array.from(monthsSet).sort();
    const sortedRows = Object.values(establishmentsMap).sort((a, b) => b.total - a.total);

    return {
      columns: sortedMonths,
      rows: sortedRows,
      grandTotal: sortedRows.reduce((sum, r) => sum + r.total, 0)
    };
  }, [filteredData]);

  // Exam Classification & Frequency
  const examCategories = useMemo(() => {
    const counts = {
      abdominal: { label: 'Abdominal / Digestiva', count: 0, list: {} },
      ginec: { label: 'Ginecológica y Obstétrica', count: 0, list: {} },
      renal: { label: 'Renal, Urológica y Pélvica', count: 0, list: {} },
      tiroides: { label: 'Tiroidea y Partes Blandas', count: 0, list: {} }
    };

    filteredData.forEach(r => {
      const p = r.procedimiento.toLowerCase();
      let cat = 'tiroides'; // Default

      if (p.includes('abdominal')) cat = 'abdominal';
      else if (p.includes('obstétr') || p.includes('ginec') || p.includes('transvag') || p.includes('placentar')) cat = 'ginec';
      else if (p.includes('renal') || p.includes('bazo') || p.includes('vejiga') || p.includes('próstat') || p.includes('pélvic')) cat = 'renal';

      counts[cat].count++;
      counts[cat].list[r.procedimiento] = (counts[cat].list[r.procedimiento] || 0) + 1;
    });

    return counts;
  }, [filteredData]);

  // SECURE REM STATIC CALCULATION (fonasa vs isapre/particular, procedencia, operativos)
  const remData = useMemo(() => {
    const isFonasa = (prev) => {
      if (!prev) return false;
      const p = String(prev).trim().toLowerCase();
      if (p === '1') return true;
      if (p === 'a' || p === 'b' || p === 'c' || p === 'd' || p === 'f') return true;
      if (p.includes('fonasa') || p.includes('fonaesa') || p.includes('fonarsa') || p.includes('fonsa')) return true;
      if (p.startsWith('f ') || p.startsWith('f-')) return true;
      return false;
    };

    const isOperativo = (r) => {
      const modal = String(r.modalidad_de_atenci_n || '').toLowerCase();
      const cc = String(r.centro_de_costo_perc || '').toLowerCase();
      const proc = String(r.procedimiento || '').toLowerCase();
      return modal.includes('operativo') || cc.includes('operativo') || proc.includes('operativo');
    };

    const aggregation = {};

    filteredData.forEach(r => {
      // In clinical REM statistics, we register only performed (attended) procedures
      if (r.estadoAtencion !== 'Se presentó') return;

      const procName = r.procedimiento || 'Otros procedimientos';

      if (!aggregation[procName]) {
        aggregation[procName] = {
          name: procName,
          beneficiarios: 0,
          noBeneficiarios: 0,
          atencionCerrada: 0,
          atencionAbierta: 0,
          urgencia: 0,
          operativos: 0,
          total: 0
        };
      }

      const item = aggregation[procName];
      item.total++;

      if (isFonasa(r.bdup_prevision)) {
        item.beneficiarios++;
      } else {
        item.noBeneficiarios++;
      }

      if (r.procedencia_de_derivaci_n === 'Atención Cerrada') {
        item.atencionCerrada++;
      } else if (r.procedencia_de_derivaci_n === 'Atención Abierta') {
        item.atencionAbierta++;
      } else if (r.procedencia_de_derivaci_n === 'Urgencia') {
        item.urgencia++;
      }

      if (isOperativo(r)) {
        item.operativos++;
      }
    });

    return Object.values(aggregation).sort((a, b) => b.total - a.total);
  }, [filteredData]);

  const toggleEstablishment = (name) => {
    setExpandedEstablishments(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  return (
    <div className="ultrasound-portal">
      {/* Header Panel */}
      <header className="portal-header neon-emerald">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button className="circle-back-btn emerald-back" onClick={onBack} title="Volver al portal estratégico">
            <ArrowLeft size={22} />
          </button>
          <div>
            <div className="header-badges">
              <span className="live-status emerald-live"><span className="pulse-dot emerald-dot"></span> REDCap Integrado</span>
              <span className="api-badge emerald-api">API Araucanía Sur</span>
              <span className="update-badge emerald-update">📅 Carga Semanal: {lastUpdated}</span>
            </div>
            <h1 className="portal-title text-glow-emerald">Producción de Ecografías</h1>
            <p className="portal-subtitle">Monitoreo de alta resolución y análisis de derivaciones • Villarrica</p>
          </div>
        </div>
      </header>

      {/* Tabs Menu - Emerald Variant */}
      <div className="portal-tabs emerald-tabs">
        <button className={`portal-tab ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => { setActiveTab('summary'); setCurrentPage(1); }}>
          <Activity size={18} /> Resumen de Capacidad
        </button>
        <button className={`portal-tab ${activeTab === 'pivot' ? 'active' : ''}`} onClick={() => { setActiveTab('pivot'); setCurrentPage(1); }}>
          <Layers size={18} /> Matriz de Derivaciones
        </button>
        <button className={`portal-tab ${activeTab === 'classification' ? 'active' : ''}`} onClick={() => { setActiveTab('classification'); setCurrentPage(1); }}>
          <Heart size={18} /> Clasificación de Exámenes
        </button>
        <button className={`portal-tab ${activeTab === 'rem' ? 'active' : ''}`} onClick={() => { setActiveTab('rem'); setCurrentPage(1); }}>
          <FileText size={18} /> Resumen Mensual (REM)
        </button>
      </div>

      <div className="portal-layout">
        {/* Collapsible Sidebar */}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              boxShadow: '0 4px 16px rgba(16,185,129,0.35)',
              cursor: 'pointer',
              color: 'white',
              flexShrink: 0,
              alignSelf: 'flex-start',
              marginTop: '4px',
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '0.3px',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
            title="Expandir panel de filtros"
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(16,185,129,0.5)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(16,185,129,0.35)'}
          >
            <Filter size={14} />
            Filtros
            <ChevronRight size={14} />
          </button>
        )}
        <aside
          className="portal-sidebar glass-card border-glow-emerald"
          style={{
            width: sidebarCollapsed ? '0px' : undefined,
            padding: sidebarCollapsed ? '0px' : undefined,
            opacity: sidebarCollapsed ? 0 : 1,
            overflow: sidebarCollapsed ? 'hidden' : 'visible',
            transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            border: sidebarCollapsed ? 'none' : undefined,
            boxShadow: sidebarCollapsed ? 'none' : undefined,
            flexShrink: 0,
            marginRight: sidebarCollapsed ? '0px' : undefined
          }}
        >
          <div className="sidebar-section-title text-glow-emerald" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={18} /> <span>Filtros Imagenología</span>
            </div>
            <button
              onClick={() => setSidebarCollapsed(true)}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '6px' }}
              title="Colapsar filtros"
            >
              <ChevronLeft size={16} />
            </button>
          </div>


          <div className="filter-item">
            <label>SELECCIÓN TEMPORAL</label>
            <select value={periodPreset} onChange={(e) => handlePeriodPresetChange(e.target.value)}>
              <option value="2025_2026">Años 2025 y 2026 (Predeterminado)</option>
              <option value="2025">Año 2025</option>
              <option value="2026">Año 2026</option>
              <option value="historico">Histórico Completo (2018-2026)</option>
            </select>
          </div>

          <div className="filter-item" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label>DESDE</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => { setStartDate(e.target.value); setPeriodPreset('custom'); }} 
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-dark)', fontSize: '0.8rem', outline: 'none' }}
              />
            </div>
            <div>
              <label>HASTA</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => { setEndDate(e.target.value); setPeriodPreset('custom'); }} 
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-dark)', fontSize: '0.8rem', outline: 'none' }}
              />
            </div>
          </div>

          <div className="filter-item">
            <label>ORIGEN DEL PACIENTE</label>
            <select value={selectedProcedencia} onChange={(e) => setSelectedProcedencia(e.target.value)}>
              <option value="Todas">Todas las procedencias</option>
              {uniqueDropdowns.procedencias.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>CENTRO DERIVADOR (ESTABLECIMIENTO)</label>
            <select value={selectedEstablecimiento} onChange={(e) => setSelectedEstablecimiento(e.target.value)}>
              <option value="Todas">Todos los centros de la red</option>
              {uniqueDropdowns.establecimientos.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>GRUPO DE EDAD</label>
            <select value={selectedRangoEdad} onChange={(e) => setSelectedRangoEdad(e.target.value)}>
              <option value="Todas">Todos los grupos</option>
              <option value="Pediátrico (<15)">Pediátrico (Menores de 15)</option>
              <option value="Adulto (15-64)">Adulto (Entre 15 y 64 años)</option>
              <option value="Adulto Mayor (>=65)">Adulto Mayor (65 o más años)</option>
            </select>
          </div>

          <div className="filter-item">
            <label>ESTADO DE ASISTENCIA</label>
            <select value={selectedEstadoAtencion} onChange={(e) => setSelectedEstadoAtencion(e.target.value)}>
              <option value="Todas">Todos los estados</option>
              <option value="Se presentó">Se presentó (Atendido)</option>
              <option value="No se presentó">No se presentó (NSP)</option>
            </select>
          </div>

          <div className="filter-item">
            <label>MÉDICO ECOGRAFISTA</label>
            <select value={selectedFuncionario} onChange={(e) => setSelectedFuncionario(e.target.value)}>
              <option value="Todas">Todos los profesionales</option>
              {uniqueDropdowns.funcionarios.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div className="sidebar-stats emerald-stats">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Registros Filtrados</span>
              <span style={{ fontWeight: 800, color: '#10b981' }}>{filteredData.length.toLocaleString()}</span>
            </div>
            <div className="sidebar-progress-bg" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              <div className="sidebar-progress-fill" style={{ width: `${rawData.length > 0 ? (filteredData.length / rawData.length) * 100 : 0}%`, background: 'linear-gradient(90deg, #10b981, #059669)' }}></div>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '6px' }}>
              De un universo total de {rawData.length.toLocaleString()} ecografías
            </p>
          </div>
        </aside>

        {/* Tab Contents View */}
        <main className="portal-content-pane">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '15px' }}>
              <div className="emerald-spinner"></div>
              <p style={{ color: 'rgba(0,0,0,0.5)', fontWeight: 700 }}>Procesando base de datos de ecografías (51,219 registros)...</p>
            </div>
          ) : error ? (
            <div style={{ padding: '40px', background: 'rgba(239, 68, 68, 0.05)', border: '1.5px dashed #ef4444', borderRadius: '20px', color: '#b91c1c', textAlign: 'center' }}>
              <AlertTriangle size={32} style={{ margin: '0 auto 10px auto' }} />
              <h4>Error al inicializar base de datos</h4>
              <p>{error}</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* Tab 1: Summary Panel */}
              {activeTab === 'summary' && (
                <motion.div key="summary" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="tab-pane-layout">
                  {/* Grid KPIs */}
                  <div className="metrics-summary-bar">
                    <div className="metric-box glass-card border-glow-emerald" style={{ borderLeft: '6px solid #10b981' }}>
                      <span className="m-label">TOTAL PROCEDIMIENTOS</span>
                      <h3 className="m-value" style={{ color: '#10b981' }}>{stats.total.toLocaleString()}</h3>
                      <p className="m-desc">Ecografías agendadas</p>
                      <div style={{ fontSize: '0.74rem', fontWeight: '800', marginTop: '8px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Activity size={12} /> Capacidad de Red
                      </div>
                    </div>

                    <div className="metric-box glass-card border-glow-indigo" style={{ borderLeft: '6px solid #6366f1' }}>
                      <span className="m-label">URGENCIA DIRECTA</span>
                      <h3 className="m-value" style={{ color: '#6366f1' }}>{stats.urgentCount.toLocaleString()}</h3>
                      <p className="m-desc">Derivadas desde urgencia</p>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', marginTop: '6px', display: 'inline-block' }}>
                        {stats.total > 0 ? ((stats.urgentCount / stats.total) * 100).toFixed(1) : 0}% de carga
                      </span>
                    </div>

                    <div className="metric-box glass-card border-glow-purple" style={{ borderLeft: '6px solid #a855f7' }}>
                      <span className="m-label">ATENCIÓN CERRADA</span>
                      <h3 className="m-value" style={{ color: '#a855f7' }}>{stats.closedCount.toLocaleString()}</h3>
                      <p className="m-desc">Hospitalizados Villarrica</p>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', marginTop: '6px', display: 'inline-block' }}>
                        {stats.total > 0 ? ((stats.closedCount / stats.total) * 100).toFixed(1) : 0}% de carga
                      </span>
                    </div>

                    <div className="metric-box glass-card border-glow-mint" style={{ borderLeft: '6px solid #34d399' }}>
                      <span className="m-label">PERTINENCIA CLÍNICA</span>
                      <h3 className="m-value" style={{ color: '#34d399' }}>
                        {stats.total > 0 ? (((stats.total - stats.nonPertinent) / stats.total) * 100).toFixed(1) : '100'}%
                      </h3>
                      <p className="m-desc">Protocolos de derivación cumplidos</p>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: stats.nonPertinent > 100 ? '#b91c1c' : '#059669', marginTop: '6px', display: 'inline-block' }}>
                        ⚠️ {stats.nonPertinent.toLocaleString()} alertas de pertinencia
                      </span>
                    </div>
                  </div>

                  {/* Monthly Volume Curved Area Chart */}
                  <div className="glass-card chart-container border-glow-emerald">
                    <div className="chart-header">
                      <div>
                        <h2 className="c-title text-glow-emerald">Volumen Mensual de Ecografías</h2>
                        <p className="c-subtitle">Distribución secuencial de producción y tasa de inasistencia (NSP %)</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div className="legend-item"><span className="legend-color" style={{ background: 'linear-gradient(180deg, #10b981, #34d399)' }}></span> Producción Realizada</div>
                        <div className="legend-item"><span className="legend-color" style={{ background: '#b91c1c' }}></span> Tasa NSP (%)</div>
                      </div>
                    </div>

                    {monthlyChartData.length === 0 ? (
                      <div className="empty-chart">Sin datos disponibles en las fechas seleccionadas</div>
                    ) : (
                      <div style={{ overflowX: 'auto', width: '100%', marginTop: '20px' }}>
                        <div style={{ minWidth: monthlyChartData.length > 10 ? `${monthlyChartData.length * 80}px` : '100%', height: '240px', position: 'relative' }}>
                          <svg viewBox="0 0 1000 220" width="100%" height="100%" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                            {/* Gridlines */}
                            <line x1="0" y1="44" x2="1000" y2="44" stroke="rgba(0,0,0,0.04)" strokeDasharray="4 4" />
                            <line x1="0" y1="110" x2="1000" y2="110" stroke="rgba(0,0,0,0.04)" strokeDasharray="4 4" />
                            <line x1="0" y1="176" x2="1000" y2="176" stroke="rgba(0,0,0,0.04)" strokeDasharray="4 4" />
                            
                            <text x="5" y="38" fill="#94a3b8" fontSize="10" fontWeight="700">MAX VOL</text>
                            <text x="5" y="104" fill="#94a3b8" fontSize="10" fontWeight="700">50% VOL</text>
                            <text x="5" y="170" fill="#94a3b8" fontSize="10" fontWeight="700">20% VOL</text>

                            {(() => {
                              const step = 900 / Math.max(1, monthlyChartData.length - 1);
                              const points = monthlyChartData.map((d, i) => ({
                                x: 50 + i * step,
                                y: 190 - (d.total / maxChartVal) * 150,
                                label: d.label,
                                total: d.total,
                                nsp: d.nspRate
                              }));

                              // Generate curved line (catmull-rom style approximate path)
                              const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                              const areaPath = points.length > 0 ? `${pathData} L ${points[points.length - 1].x} 190 L ${points[0].x} 190 Z` : '';

                              // NSP line path
                              const nspPoints = points.map(p => ({
                                x: p.x,
                                y: 190 - (p.nsp / 100) * 150
                              }));
                              const nspPathData = nspPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                              return (
                                <React.Fragment>
                                  {/* Production Fill Area */}
                                  {areaPath && <path d={areaPath} fill="url(#ultrasoundAreaGrad)" opacity="0.15" />}
                                  {/* Production Line */}
                                  {pathData && <path d={pathData} fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 4px 8px rgba(16,185,129,0.3))' }} />}
                                  
                                  {/* NSP Line */}
                                  {nspPathData && <path d={nspPathData} fill="none" stroke="#b91c1c" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" strokeLinejoin="round" />}

                                  {/* Gradients */}
                                  <defs>
                                    <linearGradient id="ultrasoundAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                    </linearGradient>
                                  </defs>

                                  {/* Interactive Circles & Labels */}
                                  {points.map((p, i) => (
                                    <g key={i} className="chart-interactive-group" style={{ cursor: 'pointer' }}>
                                      {/* Production circle */}
                                      <circle cx={p.x} cy={p.y} r="5" fill="#10b981" stroke="#fff" strokeWidth="2" />
                                      <text x={p.x} y={p.y - 12} fill="#047857" fontSize="9" fontWeight="800" textAnchor="middle">{p.total}</text>
                                      
                                      {/* NSP marker if there is inasistencia */}
                                      {p.nsp > 0 && (
                                        <g>
                                          <circle cx={nspPoints[i].x} cy={nspPoints[i].y} r="3" fill="#b91c1c" />
                                          <text x={nspPoints[i].x} y={nspPoints[i].y - 8} fill="#b91c1c" fontSize="8" fontWeight="700" textAnchor="middle">{p.nsp.toFixed(1)}%</text>
                                        </g>
                                      )}

                                      {/* X Label */}
                                      <text x={p.x} y="206" fill="#64748b" fontSize="9" fontWeight="700" textAnchor="middle">{p.label}</text>
                                    </g>
                                  ))}
                                </React.Fragment>
                              );
                            })()}
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Secondary Insights Grid */}
                  <div className="summary-bottom-row">
                    {/* NSP & Lost capacity */}
                    <div className="glass-card bottom-card border-glow-emerald">
                      <h3 className="bc-title" style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={18} style={{ color: '#10b981' }} /> Impacto del Ausentismo (NSP)
                      </h3>
                      <div className="attendance-gauge" style={{ borderBottomColor: 'rgba(16, 185, 129, 0.1)' }}>
                        <div className="gauge-val" style={{ color: '#10b981' }}>
                          {stats.nspPercent}% <span style={{ fontSize: '1rem', color: '#64748b' }}>inasistencia</span>
                        </div>
                      </div>
                      
                      <div className="bc-divider" />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Horas de Ecógrafo Perdidas</span>
                          <strong style={{ fontSize: '1rem', color: '#b91c1c' }}>{stats.totalHoursLost.toFixed(1)} hrs</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Centro con Mayor NSP</span>
                          <strong style={{ fontSize: '0.82rem', color: '#0f172a', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={stats.worstEstablishment}>
                            {stats.worstEstablishment}
                          </strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Capacidad Ociosa (Centro Crítico)</span>
                          <strong style={{ fontSize: '0.82rem', color: '#b91c1c' }}>{stats.worstHoursLost.toFixed(1)} hrs</strong>
                        </div>
                      </div>
                    </div>

                    {/* Age demographics */}
                    <div className="glass-card bottom-card border-glow-indigo">
                      <h3 className="bc-title" style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={18} style={{ color: '#6366f1' }} /> Perfil Demográfico de Red
                      </h3>
                      <div className="attendance-gauge" style={{ borderBottomColor: 'rgba(99, 102, 241, 0.1)' }}>
                        <div className="gauge-val" style={{ color: '#6366f1' }}>
                          {stats.avgAge} <span style={{ fontSize: '1rem', color: '#64748b' }}>años promedio</span>
                        </div>
                      </div>
                      
                      <div className="bc-divider" />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div className="tamizaje-item">
                          <div className="t-info"><span>Pediátrico (Menores de 15)</span><strong>{((filteredData.filter(d => d.edad < 15).length / (stats.total || 1)) * 100).toFixed(1)}%</strong></div>
                          <div className="t-bar-bg" style={{ height: '6px' }}><div className="t-bar-fill" style={{ width: `${(filteredData.filter(d => d.edad < 15).length / (stats.total || 1)) * 100}%`, background: '#6366f1' }}></div></div>
                        </div>
                        <div className="tamizaje-item">
                          <div className="t-info"><span>Adulto Activo (15 - 64 años)</span><strong>{((filteredData.filter(d => d.edad >= 15 && d.edad <= 64).length / (stats.total || 1)) * 100).toFixed(1)}%</strong></div>
                          <div className="t-bar-bg" style={{ height: '6px' }}><div className="t-bar-fill" style={{ width: `${(filteredData.filter(d => d.edad >= 15 && d.edad <= 64).length / (stats.total || 1)) * 100}%`, background: '#10b981' }}></div></div>
                        </div>
                        <div className="tamizaje-item">
                          <div className="t-info"><span>Adulto Mayor (65 o más)</span><strong>{((filteredData.filter(d => d.edad >= 65).length / (stats.total || 1)) * 100).toFixed(1)}%</strong></div>
                          <div className="t-bar-bg" style={{ height: '6px' }}><div className="t-bar-fill" style={{ width: `${(filteredData.filter(d => d.edad >= 65).length / (stats.total || 1)) * 100}%`, background: '#a855f7' }}></div></div>
                        </div>
                      </div>
                    </div>

                    {/* Operational capacity recommendations */}
                    <div className="glass-card bottom-card border-glow-purple" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.02) 0%, rgba(255,255,255,0) 100%)' }}>
                      <h3 className="bc-title" style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Settings size={18} style={{ color: '#a855f7' }} /> Recomendaciones Operativas
                      </h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '15px' }}>
                        <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.1)', fontSize: '0.8rem', lineHeight: '1.4', color: '#065f46' }}>
                          <strong>Pertinencia en Atención Primaria:</strong> El ecógrafo institucional registra un volumen alto. Optimizar filtros en los CESFAM reduce esperas en listas generales.
                        </div>
                        <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.04)', border: '1px solid rgba(99, 102, 241, 0.1)', fontSize: '0.8rem', lineHeight: '1.4', color: '#3730a3' }}>
                          <strong>Tiempos de Procedimientos:</strong> La duración promedio agendada es de 20 minutos por paciente. En caso de inasistencia, reportar inmediatamente a coordinación.
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 2: Pivot Table Derivations Matrix */}
              {activeTab === 'pivot' && (
                <motion.div key="pivot" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="glass-card pivot-card border-glow-emerald">
                  <div className="pivot-header">
                    <div>
                      <h2 className="pivot-title text-glow-emerald">Matriz de Derivaciones según Establecimiento</h2>
                      <p className="pivot-subtitle">Producción de ecografías estructurada por centros derivadores y periodos de atención</p>
                    </div>
                  </div>

                  <div className="pivot-table-wrapper">
                    <table className="pivot-table">
                      <thead>
                        <tr>
                          <th className="sticky-cell header-cell">Establecimiento</th>
                          {pivotMatrix.columns.map(col => (
                            <th key={col} className="col-header-cell">
                              {col.split('-')[1] === '01' ? `Ene ${col.split('-')[0]}` :
                               col.split('-')[1] === '02' ? 'Feb' :
                               col.split('-')[1] === '03' ? 'Mar' :
                               col.split('-')[1] === '04' ? 'Abr' :
                               col.split('-')[1] === '05' ? 'May' :
                               col.split('-')[1] === '06' ? 'Jun' :
                               col.split('-')[1] === '07' ? 'Jul' :
                               col.split('-')[1] === '08' ? 'Ago' :
                               col.split('-')[1] === '09' ? 'Sep' :
                               col.split('-')[1] === '10' ? 'Oct' :
                               col.split('-')[1] === '11' ? 'Nov' : 'Dic'}
                            </th>
                          ))}
                          <th className="total-header-cell">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pivotMatrix.rows.length === 0 ? (
                          <tr>
                            <td colSpan={pivotMatrix.columns.length + 2} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                              Sin datos disponibles para los filtros seleccionados
                            </td>
                          </tr>
                        ) : (
                          pivotMatrix.rows.map(row => {
                            const isExpanded = !!expandedEstablishments[row.name];
                            return (
                              <React.Fragment key={row.name}>
                                <tr className="main-row">
                                  <td className="sticky-cell est-name-cell" onClick={() => toggleEstablishment(row.name)} style={{ borderLeft: '3px solid #10b981' }}>
                                    <span className="toggle-icon" style={{ color: '#10b981' }}>
                                      {isExpanded ? <Minus size={14} /> : <Plus size={14} />}
                                    </span>
                                    {row.name}
                                  </td>
                                  {pivotMatrix.columns.map(col => {
                                    const val = row.months[col] || 0;
                                    const intensity = val > 0 ? Math.min(0.08 + (val / 400) * 0.72, 0.8) : 0;
                                    return (
                                      <td 
                                        key={col} 
                                        className="data-cell"
                                        style={val > 0 ? { background: `rgba(16, 185, 129, ${intensity})`, color: intensity > 0.45 ? 'white' : 'var(--text-dark)' } : {}}
                                      >
                                        {val > 0 ? val.toLocaleString() : '-'}
                                      </td>
                                    );
                                  })}
                                  <td className="row-total-cell" style={{ fontWeight: 800 }}>
                                    {row.total.toLocaleString()} 
                                    <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, marginLeft: '4px' }}>
                                      ({((row.total / (pivotMatrix.grandTotal || 1)) * 100).toFixed(1)}%)
                                    </span>
                                  </td>
                                </tr>

                                {/* Expansion: Sub-categories per classification */}
                                {isExpanded && (
                                  <React.Fragment>
                                    {Object.entries(row.procs).map(([procName, count]) => (
                                      <tr key={procName} className="sub-row age-group-row">
                                        <td className="sticky-cell est-name-cell indent-1" style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                          🔹 {procName}
                                        </td>
                                        {pivotMatrix.columns.map(col => (
                                          <td key={col} className="data-cell sub-data-cell">-</td>
                                        ))}
                                        <td className="row-total-cell sub-data-cell" style={{ fontWeight: 700, color: '#64748b' }}>
                                          {count.toLocaleString()}
                                        </td>
                                      </tr>
                                    ))}
                                  </React.Fragment>
                                )}
                              </React.Fragment>
                            );
                          })
                        )}
                      </tbody>
                      {pivotMatrix.rows.length > 0 && (
                        <tfoot>
                          <tr className="total-row" style={{ borderTop: '2px solid #10b981' }}>
                            <td className="sticky-cell est-name-cell" style={{ fontWeight: 800 }}>Total General</td>
                            {pivotMatrix.columns.map(col => (
                              <td key={col} className="total-cell">
                                {pivotMatrix.rows.reduce((sum, r) => sum + (r.months[col] || 0), 0).toLocaleString()}
                              </td>
                            ))}
                            <td className="grand-total-cell" style={{ color: '#10b981', fontWeight: 900 }}>
                              {pivotMatrix.grandTotal.toLocaleString()}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </motion.div>
              )}

              {/* Tab 3: Exam Classification Panel */}
              {activeTab === 'classification' && (
                <motion.div key="classification" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="tab-pane-layout">
                  {/* Category cards */}
                  <div className="details-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    {Object.entries(examCategories).map(([key, cat]) => {
                      const icons = {
                        abdominal: <Layers size={24} style={{ color: '#10b981' }} />,
                        ginec: <Heart size={24} style={{ color: '#ec4899' }} />,
                        renal: <Activity size={24} style={{ color: '#6366f1' }} />,
                        tiroides: <Users size={24} style={{ color: '#a855f7' }} />
                      };

                      const borderColors = {
                        abdominal: 'border-glow-emerald',
                        ginec: 'border-glow-pink',
                        renal: 'border-glow-indigo',
                        tiroides: 'border-glow-purple'
                      };

                      return (
                        <div key={key} className={`glass-card detail-sub-card ${borderColors[key]}`} style={{ padding: '24px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <h3 className="bc-title" style={{ fontSize: '1.05rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                              {icons[key]} {cat.label}
                            </h3>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', background: 'rgba(0,0,0,0.04)' }}>
                              {cat.count.toLocaleString()}
                            </span>
                          </div>
                          <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                            Distribución detallada de las prestaciones solicitadas en la red hospitalaria de Villarrica.
                          </p>

                          <div className="bc-divider" style={{ margin: '12px 0' }} />
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                            {Object.entries(cat.list).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([proc, cnt]) => {
                              const share = cat.count > 0 ? (cnt / cat.count) * 100 : 0;
                              return (
                                <div key={proc} style={{ fontSize: '0.74rem', color: '#334155' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: 600 }}>
                                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }} title={proc}>
                                      {proc}
                                    </span>
                                    <span>{cnt.toLocaleString()}</span>
                                  </div>
                                  <div className="t-bar-bg" style={{ height: '4px' }}>
                                    <div className="t-bar-fill" style={{ width: `${share}%`, background: key === 'abdominal' ? '#10b981' : key === 'ginec' ? '#ec4899' : key === 'renal' ? '#6366f1' : '#a855f7' }}></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Tab 4: REM Statistics Table (Secure, No Patient Identifiers) */}
              {activeTab === 'rem' && (
                <motion.div key="rem" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="glass-card border-glow-emerald" style={{ padding: '30px' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                      <div>
                        <h3 className="pivot-title" style={{ color: '#0f172a', margin: 0 }}>Resumen Estadístico Mensual (REM)</h3>
                        <p className="pivot-subtitle" style={{ color: '#64748b', marginTop: '4px' }}>
                          Consolidado de prestaciones realizadas según previsión, procedencia clínica y operativos especiales.
                        </p>
                      </div>
                      <span className="live-status" style={{ background: 'rgba(16, 185, 129, 0.08)', color: '#059669', fontSize: '0.74rem', fontWeight: 800, padding: '6px 14px', borderRadius: '12px' }}>
                        🔒 Datos Anónimos Públicos
                      </span>
                    </div>
                  </div>

                  <div className="pivot-table-wrapper" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                    <table className="pivot-table">
                      <thead>
                        <tr>
                          <th className="sticky-cell" style={{ textAlign: 'left', minWidth: '280px' }}>Tipo de Procedimiento Realizado</th>
                          <th>Beneficiarios (FONASA)</th>
                          <th>No Beneficiarios</th>
                          <th>Atención Cerrada</th>
                          <th>Atención Abierta</th>
                          <th>Urgencia</th>
                          <th style={{ background: 'rgba(168, 85, 247, 0.04)', color: '#a855f7', fontWeight: 800 }}>Operativos</th>
                          <th style={{ background: 'rgba(16, 185, 129, 0.04)', color: '#10b981', fontWeight: 800 }}>Total Realizado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {remData.length === 0 ? (
                          <tr>
                            <td colSpan={8} style={{ textAlign: 'center', padding: '50px', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
                              No hay procedimientos realizados registrados para los filtros seleccionados.
                            </td>
                          </tr>
                        ) : (
                          remData.map(row => (
                            <tr key={row.name} className="main-row">
                              <td className="sticky-cell est-name-cell" style={{ textAlign: 'left', fontWeight: 700, fontSize: '0.8rem', color: '#0f172a' }}>
                                📋 {row.name}
                              </td>
                              <td className="data-cell">{row.beneficiarios.toLocaleString()}</td>
                              <td className="data-cell">{row.noBeneficiarios.toLocaleString()}</td>
                              <td className="data-cell">{row.atencionCerrada.toLocaleString()}</td>
                              <td className="data-cell">{row.atencionAbierta.toLocaleString()}</td>
                              <td className="data-cell">{row.urgencia.toLocaleString()}</td>
                              <td className="data-cell" style={{ fontWeight: 800, color: '#a855f7', background: 'rgba(168, 85, 247, 0.02)' }}>
                                {row.operativos.toLocaleString()}
                              </td>
                              <td className="row-total-cell" style={{ fontWeight: 800, background: 'rgba(16, 185, 129, 0.02)' }}>
                                {row.total.toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                      {remData.length > 0 && (
                        <tfoot>
                          <tr className="total-row">
                            <td className="sticky-cell est-name-cell" style={{ textAlign: 'left', fontWeight: 900 }}>Total General</td>
                            <td className="total-cell" style={{ fontWeight: 800 }}>
                              {remData.reduce((sum, r) => sum + r.beneficiarios, 0).toLocaleString()}
                            </td>
                            <td className="total-cell" style={{ fontWeight: 800 }}>
                              {remData.reduce((sum, r) => sum + r.noBeneficiarios, 0).toLocaleString()}
                            </td>
                            <td className="total-cell" style={{ fontWeight: 800 }}>
                              {remData.reduce((sum, r) => sum + r.atencionCerrada, 0).toLocaleString()}
                            </td>
                            <td className="total-cell" style={{ fontWeight: 800 }}>
                              {remData.reduce((sum, r) => sum + r.atencionAbierta, 0).toLocaleString()}
                            </td>
                            <td className="total-cell" style={{ fontWeight: 800 }}>
                              {remData.reduce((sum, r) => sum + r.urgencia, 0).toLocaleString()}
                            </td>
                            <td className="total-cell" style={{ fontWeight: 900, color: '#a855f7', background: 'rgba(168, 85, 247, 0.04)' }}>
                              {remData.reduce((sum, r) => sum + r.operativos, 0).toLocaleString()}
                            </td>
                            <td className="grand-total-cell" style={{ fontWeight: 900, color: '#10b981', background: 'rgba(16, 185, 129, 0.05)' }}>
                              {remData.reduce((sum, r) => sum + r.total, 0).toLocaleString()}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>

                  {/* Operativos Highlights Card */}
                  <div style={{ marginTop: '24px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div className="glass-card border-glow-purple" style={{ padding: '20px', flex: 1, minWidth: '280px', display: 'flex', alignItems: 'center', gap: '18px', background: 'rgba(168, 85, 247, 0.02)' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifycontent: 'center', color: '#a855f7', flexShrink: 0, paddingLeft: '12px' }}>
                        <Layers size={24} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Contexto de Operativos Clínicos
                        </span>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#475569', lineHeight: '1.4' }}>
                          Se identificaron <strong style={{ color: '#a855f7', fontSize: '0.95rem', fontWeight: 900 }}>{remData.reduce((sum, r) => sum + r.operativos, 0).toLocaleString()} ecografías</strong> realizadas en el marco de operativos especiales de reducción de lista de espera en la red de Villarrica.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Styled JSX block - Cyber Emerald Edition */}
      <style dangerouslySetInnerHTML={{ __html: `
        .ultrasound-portal {
          font-family: 'Inter', sans-serif;
          animation: fadeIn 0.4s ease;
          color: #1e293b;
        }

        /* Header Styles */
        .portal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 20px;
          padding-bottom: 24px;
          border-bottom: 1.5px solid rgba(16, 185, 129, 0.1);
        }

        .portal-title {
          font-size: 2.5rem;
          font-weight: 900;
          letter-spacing: -1px;
          line-height: 1.1;
          color: #0f172a;
        }

        .portal-subtitle {
          color: #64748b;
          font-size: 0.95rem;
          margin-top: 4px;
        }

        .circle-back-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 1px solid rgba(16, 185, 129, 0.2);
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #10b981;
          transition: all 0.2s;
          box-shadow: 0 10px 20px rgba(0,0,0,0.03);
        }

        .circle-back-btn:hover {
          background: rgba(16, 185, 129, 0.05);
          transform: translateX(-3px);
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
        }

        .header-badges {
          display: flex;
          gap: 10px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }

        .live-status {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 6px;
          text-transform: uppercase;
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse-ring 1.8s infinite;
        }

        @keyframes pulse-ring {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .api-badge {
          background: rgba(99, 102, 241, 0.08);
          color: #6366f1;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 20px;
          text-transform: uppercase;
        }

        .update-badge {
          background: rgba(168, 85, 247, 0.08);
          color: #a855f7;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 20px;
        }

        /* Tabs Menu */
        .portal-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 40px;
          border-bottom: 1.5px solid rgba(16, 185, 129, 0.1);
          padding-bottom: 12px;
          overflow-x: auto;
        }

        .portal-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: none;
          border: none;
          font-size: 0.95rem;
          font-weight: 700;
          color: #64748b;
          cursor: pointer;
          border-radius: 10px;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .portal-tab:hover {
          color: #10b981;
          background: rgba(16, 185, 129, 0.03);
        }

        .portal-tab.active {
          color: #10b981;
          border-bottom: 3.5px solid #10b981;
          background: rgba(16, 185, 129, 0.05);
          border-radius: 10px 10px 0 0;
        }

        /* Layout Grid */
        .portal-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 30px;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .portal-layout {
            grid-template-columns: 1fr;
          }
        }

        /* Glass Cards */
        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .border-glow-emerald {
          border: 1px solid rgba(16, 185, 129, 0.2) !important;
          box-shadow: 0 8px 32px 0 rgba(16, 185, 129, 0.03) !important;
        }

        .border-glow-indigo {
          border: 1px solid rgba(99, 102, 241, 0.2) !important;
          box-shadow: 0 8px 32px 0 rgba(99, 102, 241, 0.03) !important;
        }

        .border-glow-purple {
          border: 1px solid rgba(168, 85, 247, 0.2) !important;
          box-shadow: 0 8px 32px 0 rgba(168, 85, 247, 0.03) !important;
        }

        .border-glow-mint {
          border: 1px solid rgba(52, 211, 153, 0.2) !important;
          box-shadow: 0 8px 32px 0 rgba(52, 211, 153, 0.03) !important;
        }

        .border-glow-pink {
          border: 1px solid rgba(236, 72, 153, 0.2) !important;
          box-shadow: 0 8px 32px 0 rgba(236, 72, 153, 0.03) !important;
        }

        /* Sidebar Styling */
        .portal-sidebar {
          padding: 30px;
        }

        .sidebar-section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          font-size: 1rem;
          color: #0f172a;
          margin-bottom: 24px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .filter-item {
          margin-bottom: 20px;
        }

        .filter-item label {
          display: block;
          font-size: 0.72rem;
          font-weight: 800;
          color: #94a3b8;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }

        .filter-item select {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: 1.5px solid rgba(16, 185, 129, 0.15);
          background: white;
          font-weight: 600;
          color: #1e293b;
          outline: none;
          transition: all 0.2s;
        }

        .filter-item select:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .sidebar-stats {
          margin-top: 30px;
          padding-top: 24px;
          border-top: 1.5px solid rgba(16, 185, 129, 0.1);
        }

        .sidebar-progress-bg {
          height: 6px;
          background: rgba(16, 185, 129, 0.08);
          border-radius: 3px;
          overflow: hidden;
        }

        .sidebar-progress-fill {
          height: 100%;
          transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .portal-content-pane {
          min-width: 0;
        }

        .tab-pane-layout {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        /* KPIs Summary Bar */
        .metrics-summary-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .metric-box {
          padding: 24px;
          display: flex;
          flex-direction: column;
        }

        .m-label {
          font-size: 0.72rem;
          font-weight: 800;
          color: #94a3b8;
          letter-spacing: 0.5px;
        }

        .m-value {
          font-size: 2rem;
          font-weight: 900;
          margin: 8px 0 4px 0;
          letter-spacing: -0.5px;
        }

        .m-desc {
          font-size: 0.8rem;
          color: #64748b;
        }

        /* Chart Container */
        .chart-container {
          padding: 30px;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 20px;
        }

        .c-title {
          font-size: 1.4rem;
          font-weight: 800;
        }

        .c-subtitle {
          font-size: 0.85rem;
          color: #64748b;
          margin-top: 4px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 700;
          color: #64748b;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 3px;
        }

        .empty-chart {
          height: 240px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-size: 0.95rem;
          border: 1.5px dashed rgba(16, 185, 129, 0.2);
          border-radius: 20px;
        }

        /* Bottom rows */
        .summary-bottom-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }

        .bottom-card {
          padding: 30px;
        }

        .bc-title {
          font-size: 1.1rem;
          font-weight: 800;
          margin-bottom: 20px;
        }

        .bc-divider {
          height: 1px;
          background: rgba(0,0,0,0.05);
          margin: 20px 0;
        }

        .attendance-gauge {
          padding-bottom: 20px;
          border-bottom: 1.5px solid rgba(0,0,0,0.04);
          margin-bottom: 20px;
          text-align: center;
        }

        .gauge-val {
          font-size: 1.8rem;
          font-weight: 900;
        }

        .tamizaje-item {
          margin-bottom: 14px;
        }

        .t-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .t-bar-bg {
          height: 6px;
          background: rgba(0,0,0,0.04);
          border-radius: 3px;
          overflow: hidden;
        }

        .t-bar-fill {
          height: 100%;
          border-radius: 3px;
        }

        /* Pivot Matrix Tab styling */
        .pivot-card {
          padding: 30px;
        }

        .pivot-header {
          margin-bottom: 30px;
        }

        .pivot-title {
          font-size: 1.4rem;
          font-weight: 800;
        }

        .pivot-subtitle {
          font-size: 0.85rem;
          color: #64748b;
          margin-top: 4px;
        }

        .pivot-table-wrapper {
          overflow-x: auto;
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 4px 12px rgba(0,0,0,0.01);
        }

        .pivot-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.82rem;
        }

        .pivot-table th, .pivot-table td {
          padding: 12px 16px;
          text-align: right;
          border-bottom: 1px solid rgba(0,0,0,0.04);
          font-weight: 600;
        }

        .pivot-table th {
          background: #f8fafc;
          color: #475569;
          font-weight: 700;
        }

        .pivot-table th.sticky-cell, .pivot-table td.sticky-cell {
          position: sticky;
          left: 0;
          text-align: left;
          z-index: 10;
          font-weight: 700;
        }

        .pivot-table th.sticky-cell {
          background: #f8fafc;
        }

        .pivot-table td.sticky-cell {
          background: white;
          color: #0f172a;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pivot-table tr:hover td.sticky-cell {
          background: #f8fafc;
        }

        .pivot-table td.data-cell {
          font-family: 'SF Mono', Courier, monospace;
          font-weight: 700;
        }

        .pivot-table tr.main-row:hover {
          background: rgba(0,0,0,0.01);
        }

        .pivot-table tr.sub-row {
          background: rgba(248, 250, 252, 0.5);
        }

        .pivot-table tr.sub-row td {
          padding: 8px 16px;
          color: #64748b;
        }

        .pivot-table tr.total-row td {
          background: #f8fafc;
          font-weight: 800;
          border-top: 2px solid rgba(16, 185, 129, 0.2);
        }

        .pivot-table td.grand-total-cell {
          background: rgba(16, 185, 129, 0.05) !important;
          font-family: 'SF Mono', Courier, monospace;
        }

        /* Tab 4: Patients list styling */
        .table-wrapper {
          overflow-x: auto;
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.05);
          margin-top: 20px;
        }

        .patients-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }

        .patients-table th {
          background: #f8fafc;
          padding: 14px 16px;
          font-weight: 700;
          color: #475569;
          text-align: left;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        .patients-table td {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(0,0,0,0.04);
          color: #1e293b;
        }

        .patients-table tr:hover {
          background: rgba(16, 185, 129, 0.01);
        }

        .table-pagination-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1.5px solid rgba(16, 185, 129, 0.1);
        }

        .table-pagination-nav button {
          padding: 10px 20px;
          border-radius: 12px;
          border: 1px solid rgba(16, 185, 129, 0.2);
          background: white;
          font-weight: 700;
          color: #10b981;
          cursor: pointer;
          transition: all 0.2s;
        }

        .table-pagination-nav button:hover:not(:disabled) {
          background: rgba(16, 185, 129, 0.05);
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.1);
        }

        .table-pagination-nav button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Detail tab classification grids */
        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 30px;
        }

        .detail-sub-card {
          border-radius: 24px;
        }

        /* Spinner keyframe */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      ` }} />
    </div>
  );
}
