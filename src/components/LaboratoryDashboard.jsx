import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Filter, Database, TrendingUp, Users, 
  AlertTriangle, CheckCircle, Search, Activity, ChevronRight, 
  ChevronLeft, FileText, Clock, Layers, ShieldCheck, 
  HelpCircle, RefreshCw, Info, Stethoscope, Briefcase, FileSignature
} from 'lucide-react';

// Custom Checklist Dropdown Component (Accessibilidad a11y + Búsqueda Interna)
function ChecklistDropdown({ label, options, selectedValues, onChange, countsMap }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const listRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setActiveSuggestionIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && listRef.current) {
      listRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleOption = (val) => {
    if (selectedValues.includes(val)) {
      if (selectedValues.length > 1) {
        onChange(selectedValues.filter(v => v !== val));
      }
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev < options.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestionIndex > -1 && options[activeSuggestionIndex]) {
        toggleOption(options[activeSuggestionIndex]);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (activeSuggestionIndex > -1 && listRef.current) {
      const activeEl = listRef.current.children[activeSuggestionIndex];
      if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [activeSuggestionIndex]);

  return (
    <div className="custom-dropdown-container" style={{ position: 'relative' }} ref={containerRef}>
      <label className="dropdown-label">{label}</label>
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)} 
        onKeyDown={handleKeyDown}
        className={`dropdown-trigger-btn ${isOpen ? 'active' : ''}`}
      >
        <span className="trigger-text">
          {selectedValues.length === options.length 
            ? `Todos` 
            : selectedValues.length === 1 
              ? selectedValues[0] 
              : `${selectedValues.length} seleccionados`}
        </span>
        <ChevronRight size={16} className={`arrow-icon ${isOpen ? 'rotated' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              className="dropdown-menu-list"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="dropdown-actions-row">
                <button type="button" onClick={() => onChange(options)} className="action-btn">Todos</button>
                <span className="divider">|</span>
                <button type="button" onClick={() => onChange([options[0] || ''])} className="action-btn">Limpiar</button>
              </div>
              <div className="options-scroll-box" ref={listRef} tabIndex={0} onKeyDown={handleKeyDown}>
                {options.map((opt, idx) => {
                  const isChecked = selectedValues.includes(opt);
                  const count = countsMap ? countsMap[opt] || 0 : null;
                  const isActive = idx === activeSuggestionIndex;
                  return (
                    <label key={opt} className={`option-item-row ${isChecked ? 'selected' : ''} ${isActive ? 'keyboard-active' : ''}`}>
                      <input type="checkbox" checked={isChecked} onChange={() => toggleOption(opt)} className="option-checkbox" tabIndex={-1} />
                      <span className="option-name-label">{opt}</span>
                      {count !== null && <span className="option-count-badge">{count.toLocaleString('es-CL')}</span>}
                    </label>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const getPreviousYearStr = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().split('T')[0];
};

export default function LaboratoryDashboard({ onBack }) {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary'); 
  const [lastUpdated, setLastUpdated] = useState('Nunca');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Advanced Filters
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-03-31');
  const [selectedSections, setSelectedSections] = useState([]);
  const [selectedProcedencias, setSelectedProcedencias] = useState([]);
  const [selectedEdades, setSelectedEdades] = useState([]);
  const [selectedSexos, setSelectedSexos] = useState([]);
  const [selectedServicios, setSelectedServicios] = useState([]);
  const [selectedOrigenes, setSelectedOrigenes] = useState([]);
  const [selectedFonasas, setSelectedFonasas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 450);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [hoveredDonutSegment, setHoveredDonutSegment] = useState(null);

  useEffect(() => {
    async function fetchLabData() {
      try {
        setLoading(true);
        const response = await fetch('/data/laboratory_cached.json.gz');
        if (!response.ok) throw new Error('Error al cargar datos del laboratorio.');
        const ds = new DecompressionStream('gzip');
        const decompressedStream = response.body.pipeThrough(ds);
        const data = await new Response(decompressedStream).json();
        
        const dictionary = data.dictionary || {};
        
        const mappedRecords = (data.records || []).map(r => {
           // Si viene con el formato ultra-comprimido (claves cortas)
           if (r.f !== undefined) {
             const dictEntry = dictionary[r.cl] || {};
             return {
               fecha_ejecucion: r.f,
               codigo_lis: r.cl,
               glosa_lis: dictEntry.gl || 'Sin Glosa',
               codigo_fonasa: dictEntry.cf || r.cl,
               glosa_fonasa: dictEntry.gf || 'Sin Glosa Fonasa',
               procedencia: r.p || 'Desconocida',
               origen: r.o || 'Desconocido',
               servicio_solicitante: r.s || 'Desconocido',
               sexo_paciente: r.sx || 'Desconocido',
               edad_paciente: r.e || 'Desconocido',
               prevision: r.pr || 'FONASA',
               seccion_laboratorio: r.sl || 'General',
               cantidad_produccion: r.c || 1,
               tat_promedio_horas: r.t || 2.0,
               muestras_rechazadas: r.r || 0
             };
           }
           return r; // Fallback para el formato anterior
        });

        setRawData(mappedRecords);
        
        if (data.lastUpdated) {
          const d = new Date(data.lastUpdated);
          setLastUpdated(d.toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }));
        }
        
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchLabData();
  }, []);

  // 1. MOTOR DE INGESTIÓN Y RESILIENCIA DE DATOS
  const normalizedData = useMemo(() => {
    return rawData.map(record => {
      let fecha = record.fecha_ejecucion || record.fecha_examen || record.fecha;
      if (!fecha) fecha = '2026-04-01'; 

      return {
        ...record,
        procedencia: record.procedencia || 'Desconocida',
        origen: record.origen || 'Desconocido',
        servicio_solicitante: record.servicio_solicitante || 'Desconocido',
        sexo_paciente: record.sexo_paciente || 'Desconocido',
        edad_paciente: record.edad_paciente || 'Desconocido',
        fecha_ejecucion: fecha
      };
    });
  }, [rawData]);

  const uniqueSections = useMemo(() => Array.from(new Set(normalizedData.map(r => r.seccion_laboratorio))).sort(), [normalizedData]);
  const uniqueProcedencias = useMemo(() => Array.from(new Set(normalizedData.map(r => r.procedencia))).sort(), [normalizedData]);
  const uniqueEdades = useMemo(() => Array.from(new Set(normalizedData.map(r => r.edad_paciente))).sort(), [normalizedData]);
  const uniqueSexos = useMemo(() => Array.from(new Set(normalizedData.map(r => r.sexo_paciente))).sort(), [normalizedData]);
  const uniqueServicios = useMemo(() => Array.from(new Set(normalizedData.map(r => r.servicio_solicitante))).sort(), [normalizedData]);
  const uniqueOrigenes = useMemo(() => Array.from(new Set(normalizedData.map(r => r.origen))).sort(), [normalizedData]);
  const uniqueFonasas = useMemo(() => Array.from(new Set(normalizedData.map(r => r.glosa_fonasa))).sort(), [normalizedData]);

  useEffect(() => {
    if (uniqueSections.length > 0 && selectedSections.length === 0) setSelectedSections(uniqueSections);
    if (uniqueProcedencias.length > 0 && selectedProcedencias.length === 0) setSelectedProcedencias(uniqueProcedencias);
    if (uniqueEdades.length > 0 && selectedEdades.length === 0) setSelectedEdades(uniqueEdades);
    if (uniqueSexos.length > 0 && selectedSexos.length === 0) setSelectedSexos(uniqueSexos);
    if (uniqueServicios.length > 0 && selectedServicios.length === 0) setSelectedServicios(uniqueServicios);
    if (uniqueOrigenes.length > 0 && selectedOrigenes.length === 0) setSelectedOrigenes(uniqueOrigenes);
    if (uniqueFonasas.length > 0 && selectedFonasas.length === 0) setSelectedFonasas(uniqueFonasas);
  }, [uniqueSections, uniqueProcedencias, uniqueEdades, uniqueSexos, uniqueServicios, uniqueOrigenes, uniqueFonasas, selectedSections.length, selectedProcedencias.length, selectedEdades.length, selectedSexos.length, selectedServicios.length, selectedOrigenes.length, selectedFonasas.length]);

  const procedenciaTranslation = {
    'atencion_abierta': 'Atención Abierta',
    'atencion_cerrada': 'Atención Cerrada',
    'urgencia': 'Urgencia',
    'Desconocida': 'Desconocida'
  };

  const filteredData = useMemo(() => {
    const secSet = new Set(selectedSections);
    const procSet = new Set(selectedProcedencias);
    const edaSet = new Set(selectedEdades);
    const sexSet = new Set(selectedSexos);
    const servSet = new Set(selectedServicios);
    const origSet = new Set(selectedOrigenes);
    const fonasaSet = new Set(selectedFonasas);
    const query = debouncedSearch.trim().toLowerCase();

    return normalizedData.filter(r => {
      const recordDate = r.fecha_ejecucion;
      if (recordDate < startDate || recordDate > endDate) return false;
      if (!secSet.has(r.seccion_laboratorio)) return false;
      if (!procSet.has(r.procedencia)) return false;
      if (!edaSet.has(r.edad_paciente)) return false;
      if (!sexSet.has(r.sexo_paciente)) return false;
      if (!servSet.has(r.servicio_solicitante)) return false;
      if (!origSet.has(r.origen)) return false;
      if (!fonasaSet.has(r.glosa_fonasa)) return false;
      
      if (query) {
        const prestFonasa = (r.glosa_fonasa || '').toLowerCase();
        const codeFonasa = (r.codigo_fonasa || '').toLowerCase();
        const prestLis = (r.glosa_lis || '').toLowerCase();
        const codeLis = (r.codigo_lis || '').toLowerCase();
        if (!prestFonasa.includes(query) && !codeFonasa.includes(query) && !prestLis.includes(query) && !codeLis.includes(query)) return false;
      }
      return true;
    });
  }, [normalizedData, startDate, endDate, selectedSections, selectedProcedencias, selectedEdades, selectedSexos, selectedServicios, selectedOrigenes, selectedFonasas, debouncedSearch]);

  const previousData = useMemo(() => {
    const prevStart = getPreviousYearStr(startDate);
    const prevEnd = getPreviousYearStr(endDate);
    const secSet = new Set(selectedSections);
    const procSet = new Set(selectedProcedencias);
    const edaSet = new Set(selectedEdades);
    const sexSet = new Set(selectedSexos);
    const servSet = new Set(selectedServicios);
    const origSet = new Set(selectedOrigenes);
    const fonasaSet = new Set(selectedFonasas);
    
    return normalizedData.filter(r => {
      const recordDate = r.fecha_ejecucion;
      if (recordDate < prevStart || recordDate > prevEnd) return false;
      if (!secSet.has(r.seccion_laboratorio)) return false;
      if (!procSet.has(r.procedencia)) return false;
      if (!edaSet.has(r.edad_paciente)) return false;
      if (!sexSet.has(r.sexo_paciente)) return false;
      if (!servSet.has(r.servicio_solicitante)) return false;
      if (!origSet.has(r.origen)) return false;
      if (!fonasaSet.has(r.glosa_fonasa)) return false;
      return true;
    });
  }, [normalizedData, startDate, endDate, selectedSections, selectedProcedencias, selectedEdades, selectedSexos, selectedServicios, selectedOrigenes, selectedFonasas]);

  const computeStats = (dataset) => {
    let totalExams = 0;
    let totalRejected = 0;
    let weightedTATSum = 0;
    let urgenciaExams = 0;
    let urgenciaWeightedTAT = 0;

    dataset.forEach(r => {
      totalExams += r.cantidad_produccion;
      totalRejected += r.muestras_rechazadas;
      weightedTATSum += (r.tat_promedio_horas * r.cantidad_produccion);

      if (r.procedencia === 'urgencia') {
        urgenciaExams += r.cantidad_produccion;
        urgenciaWeightedTAT += (r.tat_promedio_horas * r.cantidad_produccion);
      }
    });

    const avgTAT = totalExams > 0 ? (weightedTATSum / totalExams) : 0;
    const avgUrgTAT = urgenciaExams > 0 ? (urgenciaWeightedTAT / urgenciaExams) : 0;
    const rejectRate = totalExams > 0 ? ((totalRejected / totalExams) * 100) : 0;
    const pertinencia = totalExams > 0 ? Math.min(100, Math.max(85, 100 - (rejectRate * 2.5) - (avgTAT * 0.05))) : 100;

    return { totalExams, avgTAT, avgUrgTAT, rejectRate, pertinencia };
  };

  const currentStats = useMemo(() => computeStats(filteredData), [filteredData]);
  const previousStats = useMemo(() => computeStats(previousData), [previousData]);

  const calcYoY = (curr, prev) => {
    if (prev === 0 && curr > 0) return 100;
    if (prev === 0) return 0;
    return ((curr - prev) / prev) * 100;
  };

  const yoyExams = calcYoY(currentStats.totalExams, previousStats.totalExams);
  const yoyTAT = calcYoY(currentStats.avgTAT, previousStats.avgTAT);
  const yoyReject = currentStats.rejectRate - previousStats.rejectRate; 
  const yoyPert = currentStats.pertinencia - previousStats.pertinencia; 

  const tatLimit = 2.0; 
  const rejectLimit = 1.0; 
  const isTATAlert = currentStats.avgUrgTAT > tatLimit;
  const isRejectAlert = currentStats.rejectRate > rejectLimit;

  const stackedChartData = useMemo(() => {
    const monthMap = {};
    filteredData.forEach(r => {
      const monthStr = r.fecha_ejecucion.substring(0, 7);
      if (!monthMap[monthStr]) {
        monthMap[monthStr] = { month: monthStr, total: 0, desglose: { 'atencion_abierta': 0, 'atencion_cerrada': 0, 'urgencia': 0 }};
      }
      monthMap[monthStr].total += r.cantidad_produccion;
      if (monthMap[monthStr].desglose[r.procedencia] !== undefined) {
        monthMap[monthStr].desglose[r.procedencia] += r.cantidad_produccion;
      }
    });

    return Object.values(monthMap).sort((a,b) => a.month.localeCompare(b.month));
  }, [filteredData]);

  const procColors = {
    'atencion_abierta': '#3b82f6', 
    'atencion_cerrada': '#10b981', 
    'urgencia': '#ef4444'          
  };

  const historicTableData = useMemo(() => {
    const months = Array.from(new Set(filteredData.map(r => r.fecha_ejecucion.substring(0, 7)))).sort();
    
    const rowMap = {};
    filteredData.forEach(r => {
      const key = `${r.codigo_lis} - ${r.codigo_fonasa}`;
      if (!rowMap[key]) {
        rowMap[key] = { key, codeLis: r.codigo_lis, glosaLis: r.glosa_lis, codeFonasa: r.codigo_fonasa, glosaFonasa: r.glosa_fonasa, months: {}, total: 0 };
        months.forEach(m => rowMap[key].months[m] = 0);
      }
      const mStr = r.fecha_ejecucion.substring(0, 7);
      rowMap[key].months[mStr] += r.cantidad_produccion;
      rowMap[key].total += r.cantidad_produccion;
    });

    return { months, rows: Object.values(rowMap).sort((a,b) => b.total - a.total) };
  }, [filteredData]);

  // REM 03 Matrix 
  const remMatrix = useMemo(() => {
    const matrix = {};
    let gBase = 0, gMai = 0, gNoBen = 0, gCer = 0, gAbi = 0, gUrg = 0, gPuc = 0;

    filteredData.forEach(r => {
      const codeLis = r.codigo_lis;
      if (!matrix[codeLis]) {
        matrix[codeLis] = {
          codeLis, 
          glosaLis: r.glosa_lis || '', 
          codeFonasa: r.codigo_fonasa || '', 
          glosaFonasa: r.glosa_fonasa || '',
          baseTotal: 0, mai: 0, noBen: 0, cer: 0, abi: 0, urg: 0, pucon: 0
        };
      }
      
      const c = matrix[codeLis];
      const isPucon = r.origen && r.origen.includes('Pucón');
      const isFonasa = r.prevision === 'FONASA';

      if (isPucon) {
        c.pucon += r.cantidad_produccion;
        gPuc += r.cantidad_produccion;
      } else {
        c.baseTotal += r.cantidad_produccion;
        gBase += r.cantidad_produccion;
        
        if (isFonasa) { c.mai += r.cantidad_produccion; gMai += r.cantidad_produccion; }
        else { c.noBen += r.cantidad_produccion; gNoBen += r.cantidad_produccion; }

        if (r.procedencia === 'atencion_cerrada') { c.cer += r.cantidad_produccion; gCer += r.cantidad_produccion; }
        else if (r.procedencia === 'atencion_abierta') { c.abi += r.cantidad_produccion; gAbi += r.cantidad_produccion; }
        else if (r.procedencia === 'urgencia') { c.urg += r.cantidad_produccion; gUrg += r.cantidad_produccion; }
      }
    });

    const sectionGroups = { 
      'MATRIZ DE PRODUCCIÓN FONASA': Object.values(matrix).sort((a,b) => a.codeFonasa.localeCompare(b.codeFonasa)) 
    };

    return { sectionGroups, totals: { gBase, gMai, gNoBen, gCer, gAbi, gUrg, gPuc } };
  }, [filteredData]);

  const remCoherence = (remMatrix.totals.gCer + remMatrix.totals.gAbi + remMatrix.totals.gUrg) === (remMatrix.totals.gMai + remMatrix.totals.gNoBen);

  const insightsData = useMemo(() => {
    let topRejectionSec = ''; let maxRej = 0;
    let highTatAlert = currentStats.avgUrgTAT > tatLimit ? currentStats.avgUrgTAT : 0;
    
    const secTotals = {};
    const secRej = {};
    filteredData.forEach(r => {
      secTotals[r.seccion_laboratorio] = (secTotals[r.seccion_laboratorio]||0) + r.cantidad_produccion;
      secRej[r.seccion_laboratorio] = (secRej[r.seccion_laboratorio]||0) + r.muestras_rechazadas;
    });

    Object.keys(secTotals).forEach(k => {
      const rate = (secRej[k] / secTotals[k]) * 100;
      if (rate > maxRej) { maxRej = rate; topRejectionSec = k; }
    });

    const segments = Object.entries(secTotals).map(([label, count]) => ({
      label, count, percent: currentStats.totalExams > 0 ? (count / currentStats.totalExams) * 100 : 0
    })).sort((a,b) => b.count - a.count);

    return { segments, topRejectionSec, maxRej, highTatAlert };
  }, [filteredData, currentStats]);

  const insightColors = ['#3b82f6', '#8b5cf6', '#10b981', '#ec4899', '#f59e0b', '#64748b'];

  return (
    <div className="lab-dashboard-content animated fadeIn">
      <div className="dashboard-header-container">
        <button onClick={onBack} className="back-navigator-btn">
          <ArrowLeft size={18} /> Volver a Apoyo Diagnóstico
        </button>
        <div className="badges-flex-container">
          <div className="pill-badge redcap-connected"><Database size={14} /> LIS INTEGRADO</div>
          <div className="pill-badge minsal-standard"><ShieldCheck size={14} /> HOMOLOGACIÓN FONASA</div>
        </div>
      </div>

      <div className="dashboard-intro-block">
        <span className="section-meta-indicator">Control de Gestión MINSAL</span>
        <h1 className="main-dashboard-title">Producción Laboratorio Clínico</h1>
        <p className="main-dashboard-desc">
          Analítica sanitaria basada en la regla Pucón y estructura estricta REM 03.
        </p>
      </div>

      {loading ? (
        <div className="loading-state-block">
          <div className="circular-spinner"></div>
          <span className="loading-text">Cargando y normalizando glosas...</span>
        </div>
      ) : (
        <div className={`workspace-split-layout ${sidebarCollapsed ? 'sidebar-minified' : ''}`}>
          
          <div className="sidebar-filter-panel" style={sidebarCollapsed ? { width: 'fit-content', border: 'none', background: 'transparent', boxShadow: 'none' } : {}}>
            <div className="sidebar-header-row" style={{ padding: sidebarCollapsed ? '15px' : '20px 24px' }}>
              {!sidebarCollapsed && <div className="title-box"><Filter size={18} color="#1e293b" /><h3 className="sidebar-title">Filtros de Producción</h3></div>}
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="collapse-arrow-btn">
                {sidebarCollapsed ? <Filter size={18} /> : <ChevronLeft size={18} />}
              </button>
            </div>

            {!sidebarCollapsed && (
              <div className="sidebar-scrollable-fields">
                <div className="date-range-filter-box">
                  <label className="dropdown-label">BUSCADOR INTELIGENTE (CÓD / GLOSA):</label>
                  <div className="search-input-wrapper" style={{ marginBottom: '16px' }}>
                    <Search size={16} className="search-icon-inside" />
                    <input type="text" placeholder="Ej: '0301045' o 'Glucosa'..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-field"/>
                  </div>
                  
                  <label className="dropdown-label">DESDE (FECHA ATENCIÓN):</label>
                  <div className="date-input-wrapper-cyan">
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="date-picker-input-cyan"/>
                  </div>
                  
                  <label className="dropdown-label" style={{marginTop: '12px'}}>HASTA (FECHA ATENCIÓN):</label>
                  <div className="date-input-wrapper-cyan">
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="date-picker-input-cyan"/>
                  </div>
                </div>

                <ChecklistDropdown label="SECCIÓN DEL LABORATORIO:" options={uniqueSections} selectedValues={selectedSections} onChange={setSelectedSections} />
                <ChecklistDropdown label="PROCEDENCIA OPERATIVA (ORIGEN):" options={uniqueProcedencias} selectedValues={selectedProcedencias} onChange={setSelectedProcedencias} />
                <ChecklistDropdown label="ESTABLECIMIENTO DE ORIGEN:" options={uniqueOrigenes} selectedValues={selectedOrigenes} onChange={setSelectedOrigenes} />
                <ChecklistDropdown label="DESC. FONASA:" options={uniqueFonasas} selectedValues={selectedFonasas} onChange={setSelectedFonasas} />
                <ChecklistDropdown label="SERVICIO SOLICITANTE:" options={uniqueServicios} selectedValues={selectedServicios} onChange={setSelectedServicios} />
                
                <ChecklistDropdown label="SEXO:" options={uniqueSexos} selectedValues={selectedSexos} onChange={setSelectedSexos} />
                <ChecklistDropdown label="EDAD (TRAMO):" options={uniqueEdades} selectedValues={selectedEdades} onChange={setSelectedEdades} />



                <div className="filter-summary-actions">
                  <button type="button" onClick={() => { 
                    setStartDate('2026-01-01'); setEndDate('2026-03-31'); 
                    setSelectedSections(uniqueSections); setSelectedProcedencias(uniqueProcedencias); 
                    setSelectedOrigenes(uniqueOrigenes); setSelectedServicios(uniqueServicios);
                    setSelectedSexos(uniqueSexos); setSelectedEdades(uniqueEdades);
                    setSelectedFonasas(uniqueFonasas);
                    setSearchQuery(''); setDebouncedSearch('');
                  }} className="reset-filters-btn">
                    Restablecer Filtros
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="dashboard-core-panels">
            <div className="tab-navigation-bar">
              <button onClick={() => setActiveTab('summary')} className={`tab-link-btn ${activeTab === 'summary' ? 'active' : ''}`}>
                <TrendingUp size={16} /> Estadísticas de Producción
              </button>
              <button onClick={() => setActiveTab('insights')} className={`tab-link-btn ${activeTab === 'insights' ? 'active' : ''}`}>
                <Activity size={16} /> Insights Clínicos
              </button>
              <button onClick={() => setActiveTab('rem_03')} className={`tab-link-btn ${activeTab === 'rem_03' ? 'active' : ''}`}>
                <FileText size={16} /> Matriz REM 03 Oficial
              </button>
            </div>

            {activeTab === 'summary' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="tab-content-area">
                
                <div className="directiva-kpi-grid">
                  <motion.div whileHover={{ scale: 1.02 }} className="kpi-card premium-white-card">
                    <div className="kpi-header"><Layers size={16}/> VOLUMEN EXÁMENES</div>
                    <div className="kpi-value font-outfit">{currentStats.totalExams.toLocaleString('es-CL')}</div>
                    <div className="kpi-yoy">
                      <span className={`yoy-pill ${yoyExams >= 0 ? 'pos' : 'neg'}`}>
                        {yoyExams >= 0 ? '+' : ''}{yoyExams.toFixed(1)}% YoY
                      </span>
                      vs mismo periodo año ant.
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} className={`kpi-card premium-white-card ${isTATAlert ? 'alert-border' : ''}`}>
                    <div className="kpi-header"><Clock size={16}/> TAT URGENCIA (HRS)</div>
                    <div className="kpi-value font-outfit">{currentStats.avgUrgTAT.toFixed(2)}</div>
                    <div className="kpi-yoy">
                      <span className={`yoy-pill ${yoyTAT <= 0 ? 'pos' : 'neg'}`}>
                        {yoyTAT > 0 ? '+' : ''}{yoyTAT.toFixed(1)}% YoY
                      </span>
                      {isTATAlert ? <span className="alert-text">Excede límite 2.0h</span> : 'Dentro de norma'}
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} className={`kpi-card premium-white-card ${isRejectAlert ? 'alert-border' : ''}`}>
                    <div className="kpi-header"><AlertTriangle size={16}/> RECHAZO MUESTRAS</div>
                    <div className="kpi-value font-outfit">{currentStats.rejectRate.toFixed(2)}%</div>
                    <div className="kpi-yoy">
                      <span className={`yoy-pill ${yoyReject <= 0 ? 'pos' : 'neg'}`}>
                        {yoyReject > 0 ? '+' : ''}{yoyReject.toFixed(2)}% YoY
                      </span>
                      Umbral de control: 1.0%
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} className="kpi-card premium-white-card">
                    <div className="kpi-header"><ShieldCheck size={16}/> IDONEIDAD CLÍNICA</div>
                    <div className="kpi-value font-outfit">{currentStats.pertinencia.toFixed(1)}%</div>
                    <div className="kpi-yoy">
                      <span className={`yoy-pill ${yoyPert >= 0 ? 'pos' : 'neg'}`}>
                        {yoyPert >= 0 ? '+' : ''}{yoyPert.toFixed(1)}% YoY
                      </span>
                      Pertinencia preanalítica
                    </div>
                  </motion.div>
                </div>

                <div className="premium-white-card chart-container-box">
                  <h4 className="card-title">Evolución Cronológica de Producción por Procedencia</h4>
                  <div className="svg-chart-container">
                    {stackedChartData.length === 0 ? <div className="empty-chart">No hay datos.</div> : (
                      <svg width="100%" height="280" viewBox="0 0 800 280" preserveAspectRatio="none">
                        <line x1="40" y1="240" x2="760" y2="240" stroke="#e2e8f0" strokeWidth="2" />
                        {stackedChartData.map((data, idx) => {
                          const maxTotal = Math.max(...stackedChartData.map(d => d.total)) || 100;
                          const barW = 40;
                          const gap = (720 - (stackedChartData.length * barW)) / (stackedChartData.length + 1);
                          const startX = 40 + gap + idx * (barW + gap);
                          const totalH = 180;
                          let accY = 0;

                          return (
                            <g key={data.month}>
                              {Object.entries(data.desglose).map(([proc, amt]) => {
                                if (!procColors[proc]) return null;
                                const h = (amt / maxTotal) * totalH;
                                const y = 240 - accY - h;
                                accY += h;
                                return (
                                  <motion.rect 
                                    key={proc} x={startX} y={y} width={barW} height={h} fill={procColors[proc]} rx={2}
                                    initial={{ scaleY: 0, originY: '240px' }} animate={{ scaleY: 1 }} transition={{ duration: 0.6, type: 'spring', bounce: 0.2 }}
                                    whileHover={{ opacity: 0.8 }}
                                  />
                                );
                              })}
                              <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                                <rect x={startX - 10} y={240 - accY - 26} width="60" height="20" rx="10" fill="#0f172a" />
                                <text x={startX + barW/2} y={240 - accY - 12} fill="white" fontSize="11" fontWeight="700" textAnchor="middle" className="font-outfit">
                                  {data.total >= 1000 ? `${(data.total/1000).toFixed(1)}k` : data.total}
                                </text>
                              </motion.g>
                              <text x={startX + barW/2} y="260" fill="#64748b" fontSize="12" fontWeight="600" textAnchor="middle">{data.month}</text>
                            </g>
                          );
                        })}
                      </svg>
                    )}
                  </div>
                  <div className="chart-legend-box">
                    {Object.entries(procColors).map(([proc, col]) => (
                      <div key={proc} className="legend-item"><div className="legend-dot" style={{background: col}}></div>{procedenciaTranslation[proc]}</div>
                    ))}
                  </div>
                </div>

                <div className="premium-white-card table-container-box">
                  <h4 className="card-title">Avance Histórico por Homologación LIS / Fonasa</h4>
                  <div className="table-scroll-wrapper">
                    <table className="dense-historic-table">
                      <thead>
                        <tr>
                          <th className="sticky-left">Código LIS</th>
                          <th>Glosa LIS</th>
                          <th>Desc. Fonasa</th>
                          <th>Cod. Fonasa</th>
                          {historicTableData.months.map(m => <th key={m}>{m}</th>)}
                          <th className="total-col">TOTAL ACUMULADO</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historicTableData.rows.map(row => (
                          <tr key={row.key}>
                            <td className="sticky-left code-cell">{row.codeLis}</td>
                            <td className="glosa-cell">{row.glosaLis}</td>
                            <td className="glosa-cell">{row.glosaFonasa}</td>
                            <td className="code-cell">{row.codeFonasa}</td>
                            {historicTableData.months.map(m => <td key={m} className="num-cell">{row.months[m].toLocaleString()}</td>)}
                            <td className="num-cell total-col fw-bold">{row.total.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </motion.div>
            )}

            {activeTab === 'insights' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="tab-content-area">
                <div className="insights-white-cards-grid">
                  <div className="insight-white-card">
                    <div className="iwc-header"><Stethoscope size={18} /> Carga Analítica Mayoritaria</div>
                    <div className="iwc-big-num font-outfit">{insightsData.segments.length > 0 ? insightsData.segments[0].percent.toFixed(1) : 0}%</div>
                    <div className="iwc-subtext">del volumen de exámenes.</div>
                    <div className="iwc-divider"></div>
                    <p className="iwc-desc">
                      La sección de <strong>{insightsData.segments.length > 0 ? insightsData.segments[0].label : 'N/A'}</strong> representa la mayor carga productiva del laboratorio.
                    </p>
                  </div>

                  <div className="insight-white-card">
                    <div className="iwc-header"><FileSignature size={18} /> Protocolos Preanalíticos</div>
                    <div className="iwc-big-num font-outfit">{insightsData.maxRej.toFixed(2)}%</div>
                    <div className="iwc-subtext">tasa máxima de rechazo.</div>
                    <div className="iwc-divider"></div>
                    <p className="iwc-desc">
                      <strong>{insightsData.topRejectionSec || 'N/A'}</strong> es la sección que lidera los rechazos. Se requiere capacitación en técnica de flebotomía.
                    </p>
                  </div>

                  <div className="insight-white-card alert-theme">
                    <div className="iwc-header"><AlertTriangle size={18} /> Alertas de Tiempo (TAT)</div>
                    <div className="iwc-big-num font-outfit">{insightsData.highTatAlert ? `${insightsData.highTatAlert.toFixed(1)}h` : 'OK'}</div>
                    <div className="iwc-subtext">{insightsData.highTatAlert ? 'excede límite crítico' : 'en cumplimiento estándar'}</div>
                    <div className="iwc-divider"></div>
                    <p className="iwc-desc">
                      {insightsData.highTatAlert 
                        ? 'El TAT de Urgencia se encuentra sobre el umbral de 2 horas. Requiere intervención en flujos de triage.' 
                        : 'Los tiempos de respuesta de urgencia se mantienen estables.'}
                    </p>
                  </div>
                </div>

                <div className="premium-white-card donut-insight-container" style={{ padding: '24px' }}>
                  <h4 className="card-title" style={{ marginBottom: '20px' }}>Distribución por Macro-Categorías Analíticas</h4>
                  <div className="horizontal-bars-layout" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {(() => {
                      const topSegments = insightsData.segments.slice(0, 8);
                      const othersCount = insightsData.segments.slice(8).reduce((acc, seg) => acc + seg.count, 0);
                      const displaySegments = [...topSegments];
                      if (othersCount > 0) {
                        displaySegments.push({
                          label: 'OTROS EXÁMENES MENORES',
                          count: othersCount,
                          percent: (othersCount / currentStats.totalExams) * 100
                        });
                      }
                      
                      const maxVal = Math.max(...displaySegments.map(s => s.count), 1);
                      
                      return displaySegments.map((seg, idx) => (
                        <div key={seg.label} className="hbar-row" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>
                              {seg.label}
                            </span>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.74rem', fontWeight: 900, color: '#0ea5e9', fontFamily: 'Outfit, sans-serif' }}>{seg.count.toLocaleString()}</span>
                              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', minWidth: '45px', textAlign: 'right' }}>{seg.percent.toFixed(1)}%</span>
                            </div>
                          </div>
                          <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(seg.count / maxVal) * 100}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              style={{ height: '100%', background: insightColors[idx % insightColors.length], borderRadius: '4px' }}
                            />
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'rem_03' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="tab-content-area">
                <div className="rem-rules-banner">
                  <Info size={20} color="#0ea5e9" className="flex-shrink-0" />
                  <div>
                    <strong>ESTRUCTURA REM SERIES BS MINSAL 2026:</strong> Cumplimiento estricto. <br/>
                    <span className="pucon-rule-text"><strong>REGLA EXCEPCIONAL PUCÓN:</strong> Orígenes 'DSM Pucón' y 'Hospital Pucón' han sido deducidos automáticamente de MAI/NoBen/Procedencia y alojados solo en columna Convenio.</span>
                  </div>
                </div>

                <div className="premium-white-card rem-matrix-container">
                  <div className="table-scroll-wrapper">
                    <table className="rem-strict-table">
                      <thead>
                        <tr>
                          <th className="sticky-left" rowSpan="2">Cod Fonasa</th>
                          <th rowSpan="2">Desc. Fonasa</th>
                          <th rowSpan="2" className="bg-slate">TOTAL BASE</th>
                          <th colSpan="2" className="bg-slate">Beneficiarios</th>
                          <th colSpan="3" className="bg-slate">Procedencia (Distribución Base)</th>
                          <th rowSpan="2" className="bg-pucon text-pucon">Convenio Pucón</th>
                        </tr>
                        <tr>
                          <th className="sub-th">MAI</th>
                          <th className="sub-th">No Ben.</th>
                          <th className="sub-th">Cerrada</th>
                          <th className="sub-th">Abierta</th>
                          <th className="sub-th">Urgencia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(remMatrix.sectionGroups).map(([sec, rows]) => (
                          <React.Fragment key={sec}>
                            <tr className="section-divider-row">
                              <td colSpan="9">{sec}</td>
                            </tr>
                            {rows.map(r => (
                              <tr key={r.codeLis}>
                                <td className="sticky-left code-font">{r.codeFonasa}</td>
                                <td className="glosa-font">{r.glosaFonasa}</td>
                                <td className="num-cell fw-900">{r.baseTotal}</td>
                                <td className="num-cell">{r.mai}</td>
                                <td className="num-cell">{r.noBen}</td>
                                <td className="num-cell">{r.cer}</td>
                                <td className="num-cell">{r.abi}</td>
                                <td className="num-cell">{r.urg}</td>
                                <td className="num-cell bg-pucon fw-bold">{r.pucon}</td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                        <tr className="grand-total-row">
                          <td colSpan="2" className="sticky-left text-right">TOTAL GENERAL MÓDULO</td>
                          <td className="num-cell font-outfit">{remMatrix.totals.gBase.toLocaleString()}</td>
                          <td className="num-cell font-outfit">{remMatrix.totals.gMai.toLocaleString()}</td>
                          <td className="num-cell font-outfit">{remMatrix.totals.gNoBen.toLocaleString()}</td>
                          <td className="num-cell font-outfit">{remMatrix.totals.gCer.toLocaleString()}</td>
                          <td className="num-cell font-outfit">{remMatrix.totals.gAbi.toLocaleString()}</td>
                          <td className="num-cell font-outfit">{remMatrix.totals.gUrg.toLocaleString()}</td>
                          <td className="num-cell font-outfit text-pucon">{remMatrix.totals.gPuc.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className={`rem-validation-box ${remCoherence ? 'valid' : 'invalid'}`}>
                  {remCoherence ? <ShieldCheck size={24}/> : <AlertTriangle size={24}/>}
                  <div>
                    <h5 className="val-title">{remCoherence ? 'CUADRATURA ESTRICTA CUMPLIDA' : 'ERROR DE CUADRATURA'}</h5>
                    <span className="val-desc">La sumatoria de Procedencia Física equivale matemáticamente al despiece de Beneficiarios MAI.</span>
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .lab-dashboard-content { width: 100%; color: #0f172a; font-family: 'Inter', sans-serif; }
        .font-outfit { font-family: 'Outfit', sans-serif !important; }
        .dashboard-header-container { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .back-navigator-btn { background: white; border: 1px solid #e2e8f0; padding: 10px 20px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.02); color: #475569; }
        .badges-flex-container { display: flex; gap: 10px; }
        .pill-badge { padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 6px; }
        .redcap-connected { background: #eff6ff; color: #3b82f6; }
        .minsal-standard { background: #f0fdf4; color: #10b981; }
        .dashboard-intro-block { margin-bottom: 30px; }
        .section-meta-indicator { color: #3b82f6; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px; }
        .main-dashboard-title { font-size: 2.5rem; font-weight: 800; margin: 4px 0; letter-spacing: -1px; }
        .main-dashboard-desc { color: #64748b; font-size: 1rem; max-width: 700px; }
        
        .workspace-split-layout { display: grid; grid-template-columns: 320px 1fr; gap: 30px; }
        .sidebar-minified { grid-template-columns: auto 1fr; }
        .sidebar-filter-panel { background: white; border-radius: 20px; padding: 24px; border: 1px solid #f1f5f9; box-shadow: 0 10px 40px rgba(0,0,0,0.03); max-height: calc(100vh - 100px); overflow-y: auto; }
        .sidebar-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; position: sticky; top: 0; background: white; z-index: 10; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; }
        .title-box { display: flex; align-items: center; }
        .sidebar-title { font-size: 1.05rem; font-weight: 700; margin-left: 8px; }
        .collapse-arrow-btn { background: #f8fafc; border: none; padding: 6px; border-radius: 8px; cursor: pointer; }
        
        .sidebar-scrollable-fields { display: flex; flex-direction: column; gap: 14px; padding-bottom: 20px; }
        .date-range-filter-box, .custom-dropdown-container, .text-search-filter-box { display: flex; flex-direction: column; }
        .dropdown-label { font-size: 0.72rem; font-weight: 800; color: #475569; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px; }
        .date-inputs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .date-field-label { font-size: 0.65rem; color: #94a3b8; margin-bottom: 4px; font-weight: 600;}
        .dropdown-trigger-btn { width: 100%; padding: 10px 14px; background: white; border: 1px solid #e2e8f0; border-left: 4px solid #06b6d4; border-radius: 8px; font-size: 0.85rem; font-weight: 600; outline: none; box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
        .date-picker-input-cyan { width: 100%; padding: 10px 14px; background: white; border: 1px solid #e2e8f0; border-left: 4px solid #06b6d4; border-radius: 8px; font-size: 0.85rem; font-weight: 600; outline: none; box-shadow: 0 1px 2px rgba(0,0,0,0.02); color: #0f172a; }
        
        .search-input-wrapper { position: relative; display: flex; align-items: center; }
        .search-icon-inside { position: absolute; left: 12px; color: #94a3b8; pointer-events: none; }
        .search-field { width: 100%; padding: 10px; padding-left: 36px; background: white; border: 1px solid #e2e8f0; border-left: 4px solid #06b6d4; border-radius: 8px; font-size: 0.85rem; font-weight: 500; outline: none; }
        
        .reset-filters-btn { background: #f1f5f9; color: #475569; border: none; padding: 10px; border-radius: 10px; font-weight: 700; cursor: pointer; width: 100%; margin-top: 10px; }
        
        .tab-navigation-bar { display: flex; gap: 10px; margin-bottom: 24px; }
        .tab-link-btn { padding: 12px 20px; border-radius: 12px; border: none; font-weight: 600; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 8px; background: transparent; color: #64748b; }
        .tab-link-btn.active { background: white; color: #0f172a; box-shadow: 0 4px 15px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; }
        
        .tab-content-area { display: flex; flex-direction: column; gap: 24px; }
        .premium-white-card { background: white; border-radius: 20px; padding: 24px; border: 1px solid #f1f5f9; box-shadow: 0 10px 40px rgba(0,0,0,0.02); }
        .card-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 20px; }
        
        .directiva-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .kpi-card { display: flex; flex-direction: column; }
        .kpi-header { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; font-weight: 700; color: #64748b; }
        .kpi-value { font-size: 2.2rem; font-weight: 800; margin: 12px 0 8px 0; color: #0f172a; }
        .kpi-yoy { font-size: 0.75rem; color: #94a3b8; display: flex; align-items: center; gap: 8px; }
        .yoy-pill { padding: 4px 8px; border-radius: 6px; font-weight: 700; }
        .yoy-pill.pos { background: #f0fdf4; color: #16a34a; }
        .yoy-pill.neg { background: #fef2f2; color: #dc2626; }
        .alert-border { border: 2px solid #ef4444; }
        .alert-text { color: #ef4444; font-weight: 700; }
        
        .svg-chart-container { width: 100%; position: relative; }
        .chart-legend-box { display: flex; gap: 16px; margin-top: 16px; justify-content: center; }
        .legend-item { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 600; color: #475569; }
        .legend-dot { width: 10px; height: 10px; border-radius: 3px; }
        
        .table-scroll-wrapper { overflow-x: auto; max-height: 500px; overflow-y: auto; border-radius: 12px; border: 1px solid #f1f5f9; }
        .dense-historic-table, .rem-strict-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8rem; }
        th { background: #f8fafc; padding: 12px; font-weight: 700; color: #475569; border-bottom: 2px solid #e2e8f0; position: sticky; top: 0; z-index: 10; white-space: nowrap; }
        td { padding: 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a; }
        .sticky-left { position: sticky; left: 0; background: white; z-index: 11; box-shadow: 2px 0 5px rgba(0,0,0,0.02); }
        th.sticky-left { z-index: 12; background: #f8fafc; }
        .num-cell { text-align: right; font-variant-numeric: tabular-nums; }
        .total-col { background: #f8fafc; }
        .fw-bold { font-weight: 700; }
        .fw-900 { font-weight: 900; }
        
        .insights-white-cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .insight-white-card { background: white; border-radius: 20px; padding: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; }
        .iwc-header { display: flex; align-items: center; gap: 8px; font-size: 1rem; font-weight: 800; color: #0f172a; }
        .iwc-big-num { font-size: 2.5rem; font-weight: 800; color: #dc2626; margin-top: 16px; }
        .insight-white-card:not(.alert-theme) .iwc-big-num { color: #0f172a; }
        .iwc-subtext { font-size: 0.85rem; font-weight: 600; color: #64748b; margin-top: -4px; }
        .iwc-divider { height: 1px; background: #e2e8f0; margin: 16px 0; }
        .iwc-desc { font-size: 0.85rem; color: #475569; line-height: 1.5; }
        .insight-white-card.alert-theme { background: #b91c1c; color: white; border: none; }
        .insight-white-card.alert-theme .iwc-header, .insight-white-card.alert-theme .iwc-subtext, .insight-white-card.alert-theme .iwc-desc { color: #f8fafc; }
        .insight-white-card.alert-theme .iwc-big-num { color: white; }
        
        .donut-flex-layout { display: flex; align-items: center; gap: 40px; }
        .donut-svg-wrapper { position: relative; width: 200px; height: 200px; }
        .donut-center-info { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; }
        .donut-label { font-size: 0.65rem; font-weight: 800; color: #64748b; }
        .donut-val { font-size: 1.5rem; font-weight: 800; color: #0f172a; }
        .donut-legend-rows { display: flex; flex-direction: column; gap: 12px; flex: 1; }
        .legend-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: #f8fafc; border-radius: 12px; }
        .l-left { display: flex; align-items: center; gap: 8px; }
        .l-dot { width: 12px; height: 12px; border-radius: 4px; }
        .l-text { font-size: 0.85rem; font-weight: 600; }
        .l-right { font-weight: 800; }
        
        .rem-rules-banner { display: flex; gap: 12px; background: #f0f9ff; padding: 16px; border-radius: 16px; border: 1px solid #bae6fd; font-size: 0.85rem; color: #0369a1; line-height: 1.5; }
        .pucon-rule-text { color: #b91c1c; }
        .bg-slate { background: #f1f5f9; text-align: center; }
        .bg-pucon { background: #fef2f2 !important; }
        .text-pucon { color: #dc2626; }
        .sub-th { font-size: 0.7rem; text-transform: uppercase; text-align: right; }
        .code-font { font-family: monospace; font-size: 0.8rem; min-width: 60px; }
        .glosa-font { font-weight: 600; min-width: 150px; }
        .section-divider-row td { background: #f8fafc; font-weight: 800; color: #3b82f6; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px; padding: 16px 12px; }
        .grand-total-row td { background: #0f172a !important; color: white !important; font-weight: 800; font-size: 1rem; }
        .rem-validation-box { display: flex; align-items: center; gap: 16px; padding: 20px; border-radius: 16px; margin-top: 16px; }
        .rem-validation-box.valid { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; }
        .rem-validation-box.invalid { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }
        .val-title { font-weight: 800; font-size: 1rem; margin: 0 0 4px 0; }
        .val-desc { font-size: 0.85rem; opacity: 0.9; }

        .keyboard-active { background-color: rgba(59, 130, 246, 0.1); border-radius: 6px; outline: 1px solid #3b82f6; }
        .dropdown-search-box { padding: 8px; border-bottom: 1px solid #e2e8f0; }
        .dropdown-search-input { width: 100%; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.8rem; outline: none; }
        .dropdown-search-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); }

        .animated { animation-duration: 0.4s; animation-fill-mode: both; }
        .fadeIn { animation-name: fadeInKf; }
        @keyframes fadeInKf { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .dropdown-menu-list { position: absolute; top: calc(100% + 6px); left: 0; width: 100%; background: white; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); z-index: 110; padding: 8px; }
        .dropdown-actions-row { display: flex; padding: 4px 8px; font-size: 0.72rem; }
        .action-btn { background: none; border: none; color: #3b82f6; font-weight: 700; cursor: pointer; }
        .options-scroll-box { max-height: 150px; overflow-y: auto; display: flex; flex-direction: column; }
        .option-item-row { display: flex; align-items: center; padding: 6px; font-size: 0.8rem; }
      `}} />
    </div>
  );
}
