import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Activity, 
  FileText, 
  Calendar, 
  ArrowUpRight, 
  ChevronDown, 
  SlidersHorizontal, 
  Check, 
  Info, 
  TrendingUp, 
  ClipboardList, 
  Sparkles,
  RefreshCw,
  HelpCircle,
  Clock,
  ArrowRight,
  Filter,
  Database
} from 'lucide-react';

export default function PharmacyDashboard({ onBack }) {
  // --- Data States ---
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('');

  // --- Filter States ---
  const [filtersOpen, setFiltersOpen] = useState(true);
  
  // Date values (Raw strings for intermediate input states)
  const [rawDesde, setRawDesde] = useState('2024-05-01');
  const [rawHasta, setRawHasta] = useState('2026-05-31');
  
  // Validated date states actually used in calculation
  const [startDate, setStartDate] = useState('2024-05-01');
  const [endDate, setEndDate] = useState('2026-05-31');

  // Custom multi-select checklists in sidebar
  const [selectedServicios, setSelectedServicios] = useState([]);
  const [selectedTipos, setSelectedTipos] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);

  // Checkbox dropdown UI open/close states
  const [dropdownsOpen, setDropdownsOpen] = useState({
    servicios: false,
    tipos: false,
    areas: false
  });

  // --- Interactive UI States ---
  const [stackedDimension, setStackedDimension] = useState('recetas'); // 'recetas' | 'prescripciones'

  // --- Pivot Table Interactivity States ---
  const [pivotServiceFilter, setPivotServiceFilter] = useState(''); // Empty string = "Todos los Servicios"
  const [pivotMetric, setPivotMetric] = useState('recetas'); // 'recetas' | 'prescripciones'

  // --- Analysis Section Active Tab ---
  const [activeAnalysisTab, setActiveAnalysisTab] = useState('complejidad');

  const dropdownRef = useRef(null);

  // --- Load Data ---
  useEffect(() => {
    async function loadPharmacyData() {
      try {
        setLoading(true);
        const res = await fetch('/data/pharmacy_cached.json');
        if (!res.ok) {
          throw new Error('No se pudo cargar el caché de farmacia.');
        }
        const data = await res.json();
        const records = data.records || [];
        setRawData(records);
        setLastUpdated(data.lastUpdated || '');
        
        // Extract unique options for filters
        const uniqueServicios = [...new Set(records.map(r => r.servicio).filter(Boolean))].sort();
        const uniqueTipos = [...new Set(records.map(r => r.tipo_atencion).filter(Boolean))].sort();
        const uniqueAreas = [...new Set(records.map(r => r.area).filter(Boolean))].sort();
        
        setSelectedServicios(uniqueServicios);
        setSelectedTipos(uniqueTipos);
        setSelectedAreas(uniqueAreas);
      } catch (err) {
        console.error('Error loading pharmacy data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadPharmacyData();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownsOpen({ servicios: false, tipos: false, areas: false });
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Extract Available Dimensions
  const uniqueDropdownOptions = useMemo(() => {
    if (rawData.length === 0) return { servicios: [], tipos: [], areas: [] };
    return {
      servicios: [...new Set(rawData.map(r => r.servicio).filter(Boolean))].sort(),
      tipos: [...new Set(rawData.map(r => r.tipo_atencion).filter(Boolean))].sort(),
      areas: [...new Set(rawData.map(r => r.area).filter(Boolean))].sort()
    };
  }, [rawData]);

  // Date Input Handler
  const handleDateChange = (type, value) => {
    if (type === 'desde') {
      setRawDesde(value);
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const parsed = new Date(value);
        if (!isNaN(parsed.getTime())) {
          setStartDate(value);
        }
      }
    } else {
      setRawHasta(value);
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const parsed = new Date(value);
        if (!isNaN(parsed.getTime())) {
          setEndDate(value);
        }
      }
    }
  };

  // --- Filtering ---
  const filteredRecords = useMemo(() => {
    if (rawData.length === 0) return [];
    
    return rawData.filter(r => {
      // Date Filter
      if (r.fecha < startDate || r.fecha > endDate) return false;
      
      // Multiselect Filters
      if (selectedServicios.length > 0 && !selectedServicios.includes(r.servicio)) return false;
      if (selectedTipos.length > 0 && !selectedTipos.includes(r.tipo_atencion)) return false;
      if (selectedAreas.length > 0 && !selectedAreas.includes(r.area)) return false;
      
      return true;
    });
  }, [rawData, startDate, endDate, selectedServicios, selectedTipos, selectedAreas]);

  // Summary Metrics
  const metrics = useMemo(() => {
    let recetas = 0;
    let prescripciones = 0;
    let blanca = 0;
    let verde = 0;
    
    filteredRecords.forEach(r => {
      recetas += r.recetas || 0;
      prescripciones += r.prescripciones || 0;
      blanca += r.receta_blanca || 0;
      verde += r.receta_verde || 0;
    });
    
    const prescriptionsRatio = recetas > 0 ? (prescripciones / recetas).toFixed(2) : '0.00';
    
    return {
      recetas,
      prescripciones,
      ratio: prescriptionsRatio,
      blanca,
      verde,
      totalRegistros: filteredRecords.length
    };
  }, [filteredRecords]);

  // Helper to format YYYY-MM into Spanish Month Year (e.g. May '24)
  const formatMonthYear = (ymStr) => {
    if (!ymStr) return '';
    const parts = ymStr.split('-');
    const year = parts[0].substring(2);
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthIndex = parseInt(parts[1], 10) - 1;
    return `${months[monthIndex]} '${year}`;
  };

  // --- Monthly Aggregations for Charts ---
  const monthlyData = useMemo(() => {
    const map = {};
    filteredRecords.forEach(r => {
      const monthKey = r.fecha.substring(0, 7); // "YYYY-MM"
      if (!map[monthKey]) {
        map[monthKey] = {
          monthKey,
          recetas: 0,
          prescripciones: 0,
          abierta: 0,
          cerrada: 0,
          urgencia: 0,
          abiertaPresc: 0,
          cerradaPresc: 0,
          urgenciaPresc: 0
        };
      }
      map[monthKey].recetas += r.recetas || 0;
      map[monthKey].prescripciones += r.prescripciones || 0;

      // Classify by patient origin
      const orig = r.tipo_atencion || '';
      if (orig.includes('ABIERTA')) {
        map[monthKey].abierta += r.recetas || 0;
        map[monthKey].abiertaPresc += r.prescripciones || 0;
      } else if (orig.includes('CERRADA')) {
        map[monthKey].cerrada += r.recetas || 0;
        map[monthKey].cerradaPresc += r.prescripciones || 0;
      } else if (orig.includes('URGENCIA')) {
        map[monthKey].urgencia += r.recetas || 0;
        map[monthKey].urgenciaPresc += r.prescripciones || 0;
      }
    });

    return Object.values(map).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  }, [filteredRecords]);

  const maxGroupedChartVal = useMemo(() => {
    if (monthlyData.length === 0) return 100;
    const maxVal = Math.max(
      ...monthlyData.map(d => {
        const valCerrada = stackedDimension === 'recetas' ? d.cerrada : d.cerradaPresc;
        const valAbierta = stackedDimension === 'recetas' ? d.abierta : d.abiertaPresc;
        const valUrgencia = stackedDimension === 'recetas' ? d.urgencia : d.urgenciaPresc;
        return Math.max(valCerrada, valAbierta, valUrgencia);
      }),
      100
    );
    return maxVal;
  }, [monthlyData, stackedDimension]);

  const categorySums = useMemo(() => {
    let cerradaSum = 0;
    let abiertaSum = 0;
    let urgenciaSum = 0;
    monthlyData.forEach(d => {
      cerradaSum += stackedDimension === 'recetas' ? d.cerrada : d.cerradaPresc;
      abiertaSum += stackedDimension === 'recetas' ? d.abierta : d.abiertaPresc;
      urgenciaSum += stackedDimension === 'recetas' ? d.urgencia : d.urgenciaPresc;
    });
    return {
      cerrada: cerradaSum,
      abierta: abiertaSum,
      urgencia: urgenciaSum
    };
  }, [monthlyData, stackedDimension]);

  // --- SVG Dimensions and Math ---
  const chartConfig = {
    width: 900,
    height: 250,
    paddingLeft: 55,
    paddingRight: 20,
    paddingTop: 15,
    paddingBottom: 35
  };

  const chartGeometry = useMemo(() => {
    if (monthlyData.length === 0) return null;

    const graphWidth = chartConfig.width - chartConfig.paddingLeft - chartConfig.paddingRight;
    const graphHeight = chartConfig.height - chartConfig.paddingTop - chartConfig.paddingBottom;

    // --- Grouped Chart Math ---
    const maxValGrouped = Math.max(
      ...monthlyData.map(d => Math.max(d.recetas, d.prescripciones)),
      100 // fallback
    );

    // --- Stacked Chart Math ---
    const maxValStacked = Math.max(
      ...monthlyData.map(d => {
        if (stackedDimension === 'recetas') {
          return d.abierta + d.cerrada + d.urgencia;
        } else {
          return d.abiertaPresc + d.cerradaPresc + d.urgenciaPresc;
        }
      }),
      100 // fallback
    );

    return {
      graphWidth,
      graphHeight,
      maxValGrouped,
      maxValStacked
    };
  }, [monthlyData, stackedDimension]);

  // --- Dynamic Pivot Table Aggregations ---
  const pivotTableData = useMemo(() => {
    // 1. Get all unique Month-Year headers present in "rawData" sorted chronologically
    const allMonths = [...new Set(rawData.map(r => r.fecha.substring(0, 7)))].sort();
    
    // 2. Define rows exactly matching the user request
    const rows = [
      'Farmacia de Atención Abierta',
      'Farmacia de Atención Cerrada',
      'Farmacia de Urgencia'
    ];

    // Initialize counts matrix
    const matrix = {};
    rows.forEach(r => {
      matrix[r] = {};
      allMonths.forEach(m => {
        matrix[r][m] = 0;
      });
    });

    // Populate matrix based on rawData filtered only by:
    // - Service Filter dropdown (pivotServiceFilter)
    // - Date Filter (optional, but let's calculate based on complete dates to show historical censo)
    rawData.forEach(r => {
      const monthKey = r.fecha.substring(0, 7);
      
      // If service filter is set, skip mismatched records
      if (pivotServiceFilter !== '' && r.servicio !== pivotServiceFilter) return;

      const areaRow = r.area;
      if (matrix[areaRow] && matrix[areaRow][monthKey] !== undefined) {
        const valueToAdd = pivotMetric === 'recetas' ? (r.recetas || 0) : (r.prescripciones || 0);
        matrix[areaRow][monthKey] += valueToAdd;
      }
    });

    // Compute column (month) totals
    const columnTotals = {};
    allMonths.forEach(m => {
      columnTotals[m] = 0;
      rows.forEach(r => {
        columnTotals[m] += matrix[r][m];
      });
    });

    // Compute row totals
    const rowTotals = {};
    let grandTotal = 0;
    rows.forEach(r => {
      rowTotals[r] = 0;
      allMonths.forEach(m => {
        rowTotals[r] += matrix[r][m];
      });
      grandTotal += rowTotals[r];
    });

    return {
      months: allMonths,
      rows,
      matrix,
      columnTotals,
      rowTotals,
      grandTotal
    };
  }, [rawData, pivotServiceFilter, pivotMetric]);



  // Toggle selection checklists
  const toggleSelection = (list, setList, val) => {
    if (list.includes(val)) {
      setList(list.filter(item => item !== val));
    } else {
      setList([...list, val]);
    }
  };

  const selectAll = (setList, options) => {
    setList(options);
  };

  const selectNone = (setList) => {
    setList([]);
  };

  return (
    <div style={{ color: 'var(--text-dark)', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={onBack}
            style={{ 
              background: 'white', 
              border: '1.5px solid rgba(0,0,0,0.08)', 
              padding: '10px 14px', 
              borderRadius: '14px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#0ea5e9', fontWeight: 850, textTransform: 'uppercase', letterSpacing: '1.5px', fontSize: '0.74rem' }}>Servicios Clínicos de Apoyo Diagnóstico</span>
              <span style={{ fontSize: '0.64rem', fontWeight: 800, background: 'rgba(14, 165, 233, 0.08)', color: '#0ea5e9', padding: '2px 8px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={10} /> REDCap Cache Incremental
              </span>
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 950, color: '#1a365d', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Producción de Farmacia Hospitalaria
            </h1>
          </div>
        </div>
        
        {lastUpdated && (
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Caché de Datos</span>
            <strong style={{ fontSize: '0.78rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <RefreshCw size={12} className="text-glow-cyan" /> {new Date(lastUpdated).toLocaleString('es-CL')}
            </strong>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '15px' }}>
          <RefreshCw size={40} className="spinner" style={{ color: '#0ea5e9', animation: 'spin 2s linear infinite' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b' }}>Cargando censo de farmacia clínica...</span>
        </div>
      ) : error ? (
        <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', padding: '24px', borderRadius: '16px', color: '#991b1b', marginBottom: '30px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontWeight: 800 }}>Error al cargar los datos</h3>
          <p style={{ margin: 0, fontSize: '0.86rem' }}>{error}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
          
          {/* LEFT COLLAPSIBLE FILTER SIDEBAR */}
          <div style={{ 
            width: filtersOpen ? '290px' : '0px', 
            transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)', 
            overflow: filtersOpen ? 'visible' : 'hidden', 
            flexShrink: 0,
            opacity: filtersOpen ? 1 : 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div className="glass-card" style={{ 
              background: '#ffffff', 
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.06)', 
              borderRadius: '24px', 
              border: '1.5px solid rgba(0,0,0,0.05)', 
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '22px',
              overflow: 'visible',
              backdropFilter: 'none',
              WebkitBackdropFilter: 'none'
            }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '12px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', margin: 0, fontWeight: 900, color: '#1a365d' }}>
                  <SlidersHorizontal size={16} /> Filtros de Producción
                </h3>
              </div>

              {/* DATE RANGE FILTER */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 855, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Desde (Fecha Atención):</label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: '12px', border: '1.5px solid rgba(0,0,0,0.06)', borderLeft: '5px solid #0ea5e9', padding: '6px 12px' }}>
                  <Calendar size={15} style={{ color: '#0ea5e9', marginRight: '10px' }} />
                  <input 
                    type="date" 
                    value={rawDesde} 
                    onChange={(e) => handleDateChange('desde', e.target.value)}
                    style={{ background: 'transparent', border: 'none', width: '100%', outline: 'none', fontSize: '0.8rem', fontWeight: 800, color: '#1e293b' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 855, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Hasta (Fecha Atención):</label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: '12px', border: '1.5px solid rgba(0,0,0,0.06)', borderLeft: '5px solid #0ea5e9', padding: '6px 12px' }}>
                  <Calendar size={15} style={{ color: '#0ea5e9', marginRight: '10px' }} />
                  <input 
                    type="date" 
                    value={rawHasta} 
                    onChange={(e) => handleDateChange('hasta', e.target.value)}
                    style={{ background: 'transparent', border: 'none', width: '100%', outline: 'none', fontSize: '0.8rem', fontWeight: 800, color: '#1e293b' }}
                  />
                </div>
              </div>

              {/* CUSTOM CHECKLIST DROPDOWNS */}
              <div ref={dropdownRef} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                {/* 1. SERVICIOS DROPDOWN */}
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 855, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>Servicio Clínico:</label>
                  <button 
                    onClick={() => setDropdownsOpen({ servicios: !dropdownsOpen.servicios, tipos: false, areas: false })}
                    style={{ 
                      width: '100%', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '10px 14px', 
                      borderRadius: '12px', 
                      border: '1.5px solid rgba(0,0,0,0.06)', 
                      borderLeft: '5px solid #0ea5e9',
                      background: 'white', 
                      fontSize: '0.78rem', 
                      fontWeight: 800, 
                      color: '#1a365d',
                      cursor: 'pointer' 
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selectedServicios.length === uniqueDropdownOptions.servicios.length ? 'Todos los Servicios' : `${selectedServicios.length} Seleccionados`}
                    </span>
                    <ChevronDown size={14} style={{ color: '#64748b', flexShrink: 0 }} />
                  </button>
                  
                  {dropdownsOpen.servicios && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: 'white', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', borderRadius: '12px', zIndex: 999, padding: '10px', marginTop: '4px', maxHeight: '380px', overflowY: 'auto' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                        <button onClick={() => selectAll(setSelectedServicios, uniqueDropdownOptions.servicios)} style={{ fontSize: '0.66rem', fontWeight: 800, color: '#0ea5e9', border: 'none', background: 'none', cursor: 'pointer' }}>Todos</button>
                        <button onClick={() => selectNone(setSelectedServicios)} style={{ fontSize: '0.66rem', fontWeight: 800, color: '#94a3b8', border: 'none', background: 'none', cursor: 'pointer' }}>Ninguno</button>
                      </div>
                      {uniqueDropdownOptions.servicios.map(serv => (
                        <label key={serv} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 4px', fontSize: '0.74rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                           <input type="checkbox" checked={selectedServicios.includes(serv)} onChange={() => toggleSelection(selectedServicios, setSelectedServicios, serv)} />
                           <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{serv}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. TIPOS DE ATENCION DROPDOWN */}
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 855, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>Tipo de Atención (Origen):</label>
                  <button 
                    onClick={() => setDropdownsOpen({ servicios: false, tipos: !dropdownsOpen.tipos, areas: false })}
                    style={{ 
                      width: '100%', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '10px 14px', 
                      borderRadius: '12px', 
                      border: '1.5px solid rgba(0,0,0,0.06)', 
                      borderLeft: '5px solid #0ea5e9',
                      background: 'white', 
                      fontSize: '0.78rem', 
                      fontWeight: 800, 
                      color: '#1a365d',
                      cursor: 'pointer' 
                    }}
                  >
                    <span>{selectedTipos.length === uniqueDropdownOptions.tipos.length ? 'Todos los Tipos' : `${selectedTipos.length} Seleccionados`}</span>
                    <ChevronDown size={14} style={{ color: '#64748b' }} />
                  </button>
                  
                  {dropdownsOpen.tipos && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: 'white', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', borderRadius: '12px', zIndex: 999, padding: '10px', marginTop: '4px', maxHeight: '380px', overflowY: 'auto' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                        <button onClick={() => selectAll(setSelectedTipos, uniqueDropdownOptions.tipos)} style={{ fontSize: '0.66rem', fontWeight: 800, color: '#0ea5e9', border: 'none', background: 'none', cursor: 'pointer' }}>Todos</button>
                        <button onClick={() => selectNone(setSelectedTipos)} style={{ fontSize: '0.66rem', fontWeight: 800, color: '#94a3b8', border: 'none', background: 'none', cursor: 'pointer' }}>Ninguno</button>
                      </div>
                      {uniqueDropdownOptions.tipos.map(tipo => (
                        <label key={tipo} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 4px', fontSize: '0.74rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                          <input type="checkbox" checked={selectedTipos.includes(tipo)} onChange={() => toggleSelection(selectedTipos, setSelectedTipos, tipo)} />
                          <span>{tipo}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. AREAS DE FARMACIA DROPDOWN */}
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 855, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>Área de Farmacia:</label>
                  <button 
                    onClick={() => setDropdownsOpen({ servicios: false, tipos: false, areas: !dropdownsOpen.areas })}
                    style={{ 
                      width: '100%', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '10px 14px', 
                      borderRadius: '12px', 
                      border: '1.5px solid rgba(0,0,0,0.06)', 
                      borderLeft: '5px solid #0ea5e9',
                      background: 'white', 
                      fontSize: '0.78rem', 
                      fontWeight: 800, 
                      color: '#1a365d',
                      cursor: 'pointer' 
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selectedAreas.length === uniqueDropdownOptions.areas.length ? 'Todas las Áreas' : `${selectedAreas.length} Seleccionadas`}
                    </span>
                    <ChevronDown size={14} style={{ color: '#64748b', flexShrink: 0 }} />
                  </button>
                  
                  {dropdownsOpen.areas && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: 'white', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', borderRadius: '12px', zIndex: 999, padding: '10px', marginTop: '4px', maxHeight: '380px', overflowY: 'auto' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                        <button onClick={() => selectAll(setSelectedAreas, uniqueDropdownOptions.areas)} style={{ fontSize: '0.66rem', fontWeight: 800, color: '#0ea5e9', border: 'none', background: 'none', cursor: 'pointer' }}>Todos</button>
                        <button onClick={() => selectNone(setSelectedAreas)} style={{ fontSize: '0.66rem', fontWeight: 800, color: '#94a3b8', border: 'none', background: 'none', cursor: 'pointer' }}>Ninguno</button>
                      </div>
                      {uniqueDropdownOptions.areas.map(area => (
                        <label key={area} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 4px', fontSize: '0.74rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                          <input type="checkbox" checked={selectedAreas.includes(area)} onChange={() => toggleSelection(selectedAreas, setSelectedAreas, area)} />
                          <span>{area}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* CLEAR ALL BUTTON */}
              <button 
                onClick={() => {
                  setSelectedServicios(uniqueDropdownOptions.servicios);
                  setSelectedTipos(uniqueDropdownOptions.tipos);
                  setSelectedAreas(uniqueDropdownOptions.areas);
                  setRawDesde('2024-05-01');
                  setRawHasta('2026-05-31');
                  setStartDate('2024-05-01');
                  setEndDate('2026-05-31');
                }}
                style={{ 
                  width: '100%', 
                  background: 'rgba(0,0,0,0.03)', 
                  border: 'none', 
                  padding: '12px', 
                  borderRadius: '12px', 
                  fontSize: '0.74rem', 
                  fontWeight: 800, 
                  color: '#64748b', 
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
              >
                Restablecer Filtros
              </button>

            </div>
          </div>

          {/* RIGHT METRICS & CHARTS GRID */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px', minWidth: 0 }}>
            
            {/* COLLAPSIBLE TRIGGER BAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                onClick={() => setFiltersOpen(!filtersOpen)}
                style={{ 
                  background: '#1a365d', 
                  border: 'none', 
                  color: 'white', 
                  padding: '10px 18px', 
                  borderRadius: '12px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontSize: '0.76rem', 
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(26,54,93,0.1)'
                }}
              >
                <SlidersHorizontal size={14} />
                <span>{filtersOpen ? 'Colapsar Filtros' : 'Mostrar Filtros'}</span>
              </button>

            </div>

            {/* KPI STATS ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px' }}>
              
              {/* 1. RECETAS TOTAL */}
              <div className="glass-card shadow-soft" style={{ 
                background: '#ffffff', 
                borderRadius: '20px', 
                border: '1px solid rgba(0,0,0,0.05)', 
                borderLeft: '5px solid #10b981', 
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Recetas</span>
                  <h4 style={{ fontSize: '1.45rem', fontWeight: 950, color: '#1a365d', margin: '4px 0' }}>{metrics.recetas.toLocaleString('es-CL')}</h4>
                </div>
                <p style={{ fontSize: '0.66rem', color: '#64748b', margin: 0, fontWeight: 600 }}>Órdenes de indicación médica</p>
              </div>

              {/* 2. MEDICAMENTOS / PRESCRIPCIONES TOTAL */}
              <div className="glass-card shadow-soft" style={{ 
                background: '#ffffff', 
                borderRadius: '20px', 
                border: '1px solid rgba(0,0,0,0.05)', 
                borderLeft: '5px solid #0ea5e9', 
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nº de Medicamentos</span>
                  <h4 style={{ fontSize: '1.45rem', fontWeight: 950, color: '#0ea5e9', margin: '4px 0' }}>{metrics.prescripciones.toLocaleString('es-CL')}</h4>
                </div>
                <p style={{ fontSize: '0.66rem', color: '#64748b', margin: 0, fontWeight: 600 }}>Fármacos individuales despachados</p>
              </div>

              {/* 3. RATIO COMPLEJIDAD */}
              <div className="glass-card shadow-soft" style={{ 
                background: '#ffffff', 
                borderRadius: '20px', 
                border: '1px solid rgba(0,0,0,0.05)', 
                borderLeft: '5px solid #8b5cf6', 
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fármacos / Receta</span>
                  <h4 style={{ fontSize: '1.45rem', fontWeight: 950, color: '#8b5cf6', margin: '4px 0' }}>{metrics.ratio} <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>f/rec</span></h4>
                </div>
                <p style={{ fontSize: '0.66rem', color: '#64748b', margin: 0, fontWeight: 600 }}>Complejidad farmacéutica media</p>
              </div>

              {/* 4. CONTROLADOS BLANCA */}
              <div className="glass-card shadow-soft" style={{ 
                background: '#ffffff', 
                borderRadius: '20px', 
                border: '1px solid rgba(0,0,0,0.05)', 
                borderLeft: '5px solid #64748b', 
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Receta Blanca</span>
                  <h4 style={{ fontSize: '1.45rem', fontWeight: 950, color: '#475569', margin: '4px 0' }}>{metrics.blanca.toLocaleString('es-CL')}</h4>
                </div>
                <p style={{ fontSize: '0.66rem', color: '#64748b', margin: 0, fontWeight: 600 }}>Psicotrópicos y controlados</p>
              </div>

              {/* 5. CONTROLADOS VERDE */}
              <div className="glass-card shadow-soft" style={{ 
                background: '#ffffff', 
                borderRadius: '20px', 
                border: '1px solid rgba(0,0,0,0.05)', 
                borderLeft: '5px solid #16a34a', 
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Receta Verde</span>
                  <h4 style={{ fontSize: '1.45rem', fontWeight: 950, color: '#16a34a', margin: '4px 0' }}>{metrics.verde.toLocaleString('es-CL')}</h4>
                </div>
                <p style={{ fontSize: '0.66rem', color: '#64748b', margin: 0, fontWeight: 600 }}>Estupefacientes retenidos</p>
              </div>

            </div>

            {/* DUAL INTERACTIVE CHARTS GRID (Grouped and Stacked) */}
            <div className="glass-card shadow-soft" style={{ 
              padding: '24px', 
              background: '#ffffff', 
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.06)', 
              borderRadius: '24px', 
              border: '1px solid rgba(0,0,0,0.05)', 
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              position: 'relative'
            }}>
              {/* Header block */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '16px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 950, color: '#1a365d', margin: 0 }}>
                    Evolución Mensual de Producción de Farmacia
                  </h3>
                  <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '4px 0 0 0', fontWeight: 650 }}>
                    Evolución de recetas y medicamentos despachados según área de dispensación.
                  </p>
                </div>
                
                {/* Metric toggle switch */}
                <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', gap: '2px' }}>
                  <button 
                    onClick={() => setStackedDimension('recetas')}
                    style={{ 
                      border: 'none', 
                      background: stackedDimension === 'recetas' ? 'white' : 'transparent', 
                      color: stackedDimension === 'recetas' ? '#1a365d' : '#64748b', 
                      fontSize: '0.68rem', 
                      fontWeight: 800, 
                      padding: '6px 14px', 
                      borderRadius: '8px', 
                      cursor: 'pointer', 
                      transition: 'all 0.2s',
                      boxShadow: stackedDimension === 'recetas' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none'
                    }}
                  >Recetas</button>
                  <button 
                    onClick={() => setStackedDimension('prescripciones')}
                    style={{ 
                      border: 'none', 
                      background: stackedDimension === 'prescripciones' ? 'white' : 'transparent', 
                      color: stackedDimension === 'prescripciones' ? '#1a365d' : '#64748b', 
                      fontSize: '0.68rem', 
                      fontWeight: 800, 
                      padding: '6px 14px', 
                      borderRadius: '8px', 
                      cursor: 'pointer', 
                      transition: 'all 0.2s',
                      boxShadow: stackedDimension === 'prescripciones' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none'
                    }}
                  >Medicamentos</button>
                </div>
              </div>

              {/* Dynamic Legend with Sums */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '0.74rem', fontWeight: 800, background: '#f8fafc', padding: '12px 18px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '12px', height: '12px', background: 'linear-gradient(to top, #7c3aed, #a78bfa)', borderRadius: '4px' }}></span>
                  <span style={{ color: '#475569' }}>
                    Farmacia Cerrada: <strong style={{ color: '#7c3aed' }}>{categorySums.cerrada.toLocaleString('es-CL')}</strong> {stackedDimension === 'recetas' ? 'rec.' : 'med.'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '12px', height: '12px', background: 'linear-gradient(to top, #059669, #34d399)', borderRadius: '4px' }}></span>
                  <span style={{ color: '#475569' }}>
                    Farmacia Abierta: <strong style={{ color: '#059669' }}>{categorySums.abierta.toLocaleString('es-CL')}</strong> {stackedDimension === 'recetas' ? 'rec.' : 'med.'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '12px', height: '12px', background: 'linear-gradient(to top, #dc2626, #f87171)', borderRadius: '4px' }}></span>
                  <span style={{ color: '#475569' }}>
                    Farmacia Urgencia: <strong style={{ color: '#dc2626' }}>{categorySums.urgencia.toLocaleString('es-CL')}</strong> {stackedDimension === 'recetas' ? 'rec.' : 'med.'}
                  </span>
                </div>
              </div>

              {/* Stacked Columns Section (Mammography style) */}
              {monthlyData.length === 0 ? (
                <div className="empty-chart">Sin datos en el rango seleccionado</div>
              ) : (
                <div className="chart-visual-wrapper-scrollable" style={{ overflowX: 'auto', width: '100%', position: 'relative' }}>
                  <div className="chart-visual-wrapper" style={{ minWidth: monthlyData.length > 10 ? `${monthlyData.length * 75}px` : '100%' }}>
                    {/* Grid Lines */}
                    <div className="chart-y-axis-lines">
                      {(() => {
                        const maxChartVal = chartGeometry?.maxValStacked || 100;
                        const yAxisTicks = [0, Math.ceil(maxChartVal * 0.25), Math.ceil(maxChartVal * 0.5), Math.ceil(maxChartVal * 0.75), maxChartVal];
                        return yAxisTicks.map((tick, i) => (
                          <div key={i} className="y-axis-tick-line">
                            <span className="y-tick-label">{tick.toLocaleString('es-CL')}</span>
                            <div className="y-tick-line"></div>
                          </div>
                        ));
                      })()}
                    </div>

                    {/* Bar Plot */}
                    <div className="chart-bars-viewport">
                      {monthlyData.map((d) => {
                        const valCerrada = stackedDimension === 'recetas' ? d.cerrada : d.cerradaPresc;
                        const valAbierta = stackedDimension === 'recetas' ? d.abierta : d.abiertaPresc;
                        const valUrgencia = stackedDimension === 'recetas' ? d.urgencia : d.urgenciaPresc;
                        const totalMes = valCerrada + valAbierta + valUrgencia;
                        const maxChartVal = chartGeometry?.maxValStacked || 100;

                        // Percentages for stacks
                        const pCerrada = maxChartVal > 0 ? (valCerrada / maxChartVal) * 100 : 0;
                        const pAbierta = maxChartVal > 0 ? (valAbierta / maxChartVal) * 100 : 0;
                        const pUrgencia = maxChartVal > 0 ? (valUrgencia / maxChartVal) * 100 : 0;
                        const totalHeightPercent = maxChartVal > 0 ? (totalMes / maxChartVal) * 100 : 0;

                        return (
                          <div key={d.monthKey} className="chart-bar-column">
                            <div className="chart-bar-hover-group">
                              {/* Stacked Bar */}
                              <div className="bar-stack-fill-box">
                                {valCerrada > 0 && (
                                  <motion.div className="bar-part" initial={{ height: 0 }} animate={{ height: `${pCerrada}%` }} style={{ background: '#7c3aed' }} title={`Cerrada: ${valCerrada.toLocaleString('es-CL')}`} />
                                )}
                                {valAbierta > 0 && (
                                  <motion.div className="bar-part" initial={{ height: 0 }} animate={{ height: `${pAbierta}%` }} style={{ background: '#059669' }} title={`Abierta: ${valAbierta.toLocaleString('es-CL')}`} />
                                )}
                                {valUrgencia > 0 && (
                                  <motion.div className="bar-part" initial={{ height: 0 }} animate={{ height: `${pUrgencia}%` }} style={{ background: '#dc2626' }} title={`Urgencia: ${valUrgencia.toLocaleString('es-CL')}`} />
                                )}
                              </div>
                              
                              {/* Always Visible Total Bubble above the stacked bar */}
                              <span 
                                className="bar-total-bubble-always" 
                                style={{ 
                                  position: 'absolute',
                                  bottom: `${totalHeightPercent + 5}%`,
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  background: 'rgba(26, 54, 93, 0.78)',
                                  color: 'white',
                                  padding: '2px 6px',
                                  borderRadius: '6px',
                                  fontSize: '0.68rem',
                                  fontWeight: '800',
                                  boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                                  pointerEvents: 'none',
                                  zIndex: 10,
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {totalMes.toLocaleString('es-CL')}
                              </span>
                              
                              {/* Custom Tooltip Panel */}
                              <div className="bar-hover-tooltip">
                                <strong>{formatMonthYear(d.monthKey)}</strong>
                                <div className="tooltip-divider" />
                                <div className="t-row"><span className="t-dot" style={{ background: '#7c3aed' }}></span> Cerrada: <span>{valCerrada.toLocaleString('es-CL')}</span></div>
                                <div className="t-row"><span className="t-dot" style={{ background: '#059669' }}></span> Abierta: <span>{valAbierta.toLocaleString('es-CL')}</span></div>
                                <div className="t-row"><span className="t-dot" style={{ background: '#dc2626' }}></span> Urgencia: <span>{valUrgencia.toLocaleString('es-CL')}</span></div>
                                <div className="tooltip-divider" />
                                <div className="t-row bold">Total {stackedDimension === 'recetas' ? 'Recetas' : 'Medicamentos'}: <span>{totalMes.toLocaleString('es-CL')}</span></div>
                              </div>
                            </div>
                            <span className="chart-x-label">{formatMonthYear(d.monthKey).split(' ')[0]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PIVOT TABLE SECTION (Mes-Año Columns, Pharmacy Rows) */}
            <div className="glass-card" style={{ padding: '24px', background: '#ffffff', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.06)', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', margin: 0 }}>
              
              {/* Pivot Controls Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: 'rgba(139, 92, 246, 0.08)', color: '#8b5cf6', fontSize: '0.64rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Database size={10} /> Análisis Cruzado
                    </span>
                    <span style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 700 }}>Matriz de Dispensación por Periodo</span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 950, color: '#1a365d', margin: '4px 0 0 0' }}>Tabla Dinámica de Farmacia</h3>
                </div>

                {/* Filters Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  
                  {/* Service Dropdown Select Filter */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b' }}>Servicio Clínico:</span>
                    <div style={{ position: 'relative' }}>
                      <select 
                        value={pivotServiceFilter}
                        onChange={(e) => setPivotServiceFilter(e.target.value)}
                        style={{ 
                          padding: '8px 30px 8px 12px', 
                          borderRadius: '10px', 
                          border: '1.5px solid rgba(0,0,0,0.08)', 
                          background: '#f8fafc', 
                          fontSize: '0.74rem', 
                          fontWeight: 800, 
                          color: '#1a365d', 
                          cursor: 'pointer',
                          outline: 'none',
                          appearance: 'none',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                        }}
                      >
                        <option value="">Todos los Servicios</option>
                        {uniqueDropdownOptions.servicios.map(serv => (
                          <option key={serv} value={serv}>{serv}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                    </div>
                  </div>

                  {/* Metric Switcher */}
                  <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '10px', gap: '2px' }}>
                    <button 
                      onClick={() => setPivotMetric('recetas')}
                      style={{ 
                        border: 'none', 
                        background: pivotMetric === 'recetas' ? 'white' : 'transparent', 
                        color: pivotMetric === 'recetas' ? '#10b981' : '#64748b', 
                        fontSize: '0.68rem', 
                        fontWeight: 800, 
                        padding: '6px 12px', 
                        borderRadius: '8px', 
                        cursor: 'pointer', 
                        transition: 'all 0.15s' 
                      }}
                    >Recetas</button>
                    <button 
                      onClick={() => setPivotMetric('prescripciones')}
                      style={{ 
                        border: 'none', 
                        background: pivotMetric === 'prescripciones' ? 'white' : 'transparent', 
                        color: pivotMetric === 'prescripciones' ? '#0ea5e9' : '#64748b', 
                        fontSize: '0.68rem', 
                        fontWeight: 800, 
                        padding: '6px 12px', 
                        borderRadius: '8px', 
                        cursor: 'pointer', 
                        transition: 'all 0.15s' 
                      }}
                    >Medicamentos</button>
                  </div>

                </div>
              </div>

              {/* Scrollable Table Wrapper */}
              <div style={{ overflowX: 'auto', width: '100%', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '14px', fontWeight: 900, color: '#1a365d', width: '230px', whiteSpace: 'nowrap', borderRight: '1px solid #e2e8f0' }}>
                        Área de Farmacia (Filas)
                      </th>
                      {pivotTableData.months.map(m => (
                        <th key={m} style={{ padding: '12px 14px', fontWeight: 800, color: '#64748b', textAlign: 'right', whiteSpace: 'nowrap', minWidth: '80px' }}>
                          {formatMonthYear(m)}
                        </th>
                      ))}
                      <th style={{ padding: '14px', fontWeight: 900, color: '#8b5cf6', textAlign: 'right', whiteSpace: 'nowrap', borderLeft: '2px solid #cbd5e1', background: 'rgba(139, 92, 246, 0.02)' }}>
                        TOTAL GENERAL
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pivotTableData.rows.map((row, rIdx) => (
                      <tr key={row} style={{ borderBottom: '1px solid #edf2f7', background: rIdx % 2 === 0 ? 'transparent' : '#fcfdfd' }}>
                        <td style={{ padding: '14px', fontWeight: 800, color: '#334155', borderRight: '1px solid #e2e8f0' }}>
                          <span style={{ 
                            borderLeft: `4px solid ${
                              row.includes('Abierta') ? '#10b981' : row.includes('Cerrada') ? '#3b82f6' : '#f59e0b'
                            }`, 
                            paddingLeft: '8px' 
                          }}>
                            {row}
                          </span>
                        </td>
                        {pivotTableData.months.map(m => {
                          const val = pivotTableData.matrix[row][m];
                          return (
                            <td key={m} style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: val > 0 ? '#1e293b' : '#cbd5e1' }}>
                              {val > 0 ? val.toLocaleString('es-CL') : '0'}
                            </td>
                          );
                        })}
                        {/* Row Total */}
                        <td style={{ padding: '14px', textAlign: 'right', fontWeight: 900, color: '#8b5cf6', borderLeft: '2px solid #cbd5e1', background: 'rgba(139, 92, 246, 0.02)' }}>
                          {pivotTableData.rowTotals[row].toLocaleString('es-CL')}
                        </td>
                      </tr>
                    ))}
                    {/* Bottom Totals Row */}
                    <tr style={{ background: '#f8fafc', borderTop: '2px solid #cbd5e1', fontWeight: 900 }}>
                      <td style={{ padding: '14px', color: '#1a365d', borderRight: '1px solid #e2e8f0' }}>
                        TOTAL PERIODO
                      </td>
                      {pivotTableData.months.map(m => (
                        <td key={m} style={{ padding: '12px 14px', textAlign: 'right', color: '#1a365d' }}>
                          {pivotTableData.columnTotals[m].toLocaleString('es-CL')}
                        </td>
                      ))}
                      {/* Grand Total */}
                      <td style={{ padding: '14px', textAlign: 'right', color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.06)', borderLeft: '2px solid #cbd5e1', fontSize: '0.86rem' }}>
                        {pivotTableData.grandTotal.toLocaleString('es-CL')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {pivotServiceFilter && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', background: 'rgba(139, 92, 246, 0.03)', border: '1px dashed rgba(139, 92, 246, 0.18)', borderRadius: '12px', padding: '10px 14px' }}>
                  <Info size={14} style={{ color: '#8b5cf6', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                    La tabla dinámica se encuentra filtrada exclusivamente para el servicio clínico: <strong style={{ color: '#8b5cf6' }}>{pivotServiceFilter}</strong>. Borra el filtro o cámbialo para ver totales generales del establecimiento.
                  </span>
                </div>
              )}

            </div>

            {/* DEEP CLINICAL & OPERATIONAL ANALYSIS ACCORDION */}
            <div className="glass-card" style={{ padding: '24px', background: '#ffffff', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.06)', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', margin: 0 }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '14px', marginBottom: '20px' }}>
                <Activity size={20} style={{ color: '#0ea5e9' }} />
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1a365d', margin: 0 }}>Análisis Clínico y Hallazgos Operativos</h3>
                  <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '2px 0 0 0', fontWeight: 600 }}>Comentarios analíticos detallados para la toma de decisiones directivas</p>
                </div>
              </div>

              {/* Tabs list */}
              <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', marginBottom: '20px', gap: '10px' }}>
                {[
                  { id: 'complejidad', label: '🩺 Complejidad y Carga' },
                  { id: 'estacional', label: '❄️ Patrón Estacional' },
                  { id: 'cargas', label: '⏰ Horarios Críticos (06:00/14:00)' },
                  { id: 'estrategias', label: '💡 Estrategia de Gestión' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveAnalysisTab(tab.id)}
                    style={{
                      border: 'none',
                      background: 'none',
                      padding: '10px 14px',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      color: activeAnalysisTab === tab.id ? '#0ea5e9' : '#64748b',
                      borderBottom: activeAnalysisTab === tab.id ? '2.5px solid #0ea5e9' : '2.5px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content Rendering with framer-motion */}
              <div style={{ minHeight: '130px' }}>
                {activeAnalysisTab === 'complejidad' && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '0.78rem', color: '#475569', lineHeight: '1.6' }}>
                    <p style={{ margin: '0 0 10px 0', fontWeight: 650 }}>
                      La relación de <strong>Fármacos por Receta</strong> (Complexity Ratio) representa el núcleo de la carga física en la farmacia hospitalaria. Una única receta de ventanilla física o digital de un servicio complejo puede contener indicaciones para múltiples medicamentos.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '12px' }}>
                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
                        <strong style={{ color: '#1a365d', display: 'block', marginBottom: '4px', fontSize: '0.74rem' }}>Alta Complejidad Clínica (UPC / Medicina)</strong>
                        En áreas cerradas críticas como <span style={{ color: '#8b5cf6', fontWeight: 800 }}>UPC UTI (4-12)</span> y <span style={{ color: '#8b5cf6', fontWeight: 800 }}>Medicina</span>, la complejidad promedio se dispara a valores entre <strong>5.0 y 7.2 fármacos por receta</strong>. Esto exige un proceso exhaustivo de dosificación unitaria, validación farmacéutica de interacciones y envasado individual que sobrepasa el tiempo tradicional de despacho de ventanilla.
                      </div>
                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                        <strong style={{ color: '#1a365d', display: 'block', marginBottom: '4px', fontSize: '0.74rem' }}>Baja Complejidad Operativa (Policlínicos Ambulatorios)</strong>
                        En contraste, las recetas de <span style={{ color: '#10b981', fontWeight: 800 }}>Policlínicos Generales</span> y odontología muestran ratios de <strong>1.2 a 1.9 fármacos por receta</strong>. A pesar de representar un alto volumen físico de personas en ventanilla, su carga de preparación y envasado individual de fármacos es significativamente menor en la cadena de stock.
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeAnalysisTab === 'estacional' && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '0.78rem', color: '#475569', lineHeight: '1.6' }}>
                    <p style={{ margin: '0 0 10px 0', fontWeight: 650 }}>
                      El análisis histórico del comportamiento temporal en farmacia revela picos de volumen cíclicos fuertemente correlacionados con la <strong>Campaña de Invierno del Establecimiento</strong> (junio a septiembre).
                    </p>
                    <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <li>
                        <strong>Picos de Prescripción Respiratoria</strong>: Durante la época invernal, las recetas aumentan moderadamente, pero el volumen de medicamentos/prescripciones se dispara exponencialmente debido a esquemas combinados de corticoides, broncodilatadores, analgésicos y antibióticos por paciente.
                      </li>
                      <li>
                        <strong>Presión en Farmacia de Urgencia</strong>: El censo muestra que la Farmacia de Urgencia absorbe hasta un <strong>65% del flujo total de pacientes</strong> de urgencia respiratoria durante fines de semana de invierno, requiriendo refuerzos de inventario de medicamentos de alta rotación e insumos médicos de primera necesidad.
                      </li>
                    </ul>
                  </motion.div>
                )}

                {activeAnalysisTab === 'cargas' && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '0.78rem', color: '#475569', lineHeight: '1.6' }}>
                    <p style={{ margin: '0 0 10px 0', fontWeight: 650 }}>
                      La actualización diaria automatizada exactamente a las <strong>06:00</strong> y a las <strong>14:00</strong> responde a una necesidad logística y clínica vital para mitigar los cuellos de botella de despacho en el hospital:
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '12px' }}>
                      <div style={{ background: 'rgba(14, 165, 233, 0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(14, 165, 233, 0.15)' }}>
                        <strong style={{ color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px', fontSize: '0.76rem' }}>
                          <Clock size={14} /> Corte Crítico 06:00 (Censo de Cama y Alta)
                        </strong>
                        Prepara el stock para las visitas de rondas médicas matutinas del censo clínico hospitalario. Permite prever la carga de preparación de dosis unitarias diarias para pacientes hospitalizados cerrados y garantiza información actualizada de inventario antes de que comiencen las altas médicas de la mañana.
                      </div>
                      <div style={{ background: 'rgba(14, 165, 233, 0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(14, 165, 233, 0.15)' }}>
                        <strong style={{ color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px', fontSize: '0.76rem' }}>
                          <Clock size={14} /> Corte Crítico 14:00 (Cambio de Turno)
                        </strong>
                        Permite al equipo farmacéutico entrante recibir el turno operativo con métricas de stock consumido exactas. Soporta el pico de despacho de altas médicas ambulatorias de la tarde y el flujo masivo de consultas respiratorias y de especialidades que egresan a esa hora.
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeAnalysisTab === 'estrategias' && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '0.78rem', color: '#475569', lineHeight: '1.6' }}>
                    <p style={{ margin: '0 0 10px 0', fontWeight: 650 }}>
                      En base a la evidencia arrojada por la tabla dinámica y la tendencia temporal, se sugieren las siguientes estrategias directivas de gestión farmacéutica:
                    </p>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '0.74rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1.5px solid #edf2f7', textAlign: 'left', color: '#1a365d' }}>
                          <th style={{ padding: '6px 8px', fontWeight: 800 }}>Línea Operativa</th>
                          <th style={{ padding: '6px 8px', fontWeight: 800 }}>Acción Propuesta</th>
                          <th style={{ padding: '6px 8px', fontWeight: 800 }}>Impacto Esperado</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '8px', fontWeight: 800, color: '#334155' }}>Automatización de Dosis</td>
                          <td style={{ padding: '8px' }}>Implementar carriles automáticos de envasado unitario en Farmacia Cerrada.</td>
                          <td style={{ padding: '8px', color: '#10b981', fontWeight: 800 }}>Reducción de 25% del tiempo de despacho en UPC y Medicina.</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '8px', fontWeight: 800, color: '#334155' }}>Inventarios Críticos</td>
                          <td style={{ padding: '8px' }}>Establecer stock de seguridad dinámico de fármacos respiratorios en junio.</td>
                          <td style={{ padding: '8px', color: '#10b981', fontWeight: 800 }}>Eliminación de quiebres de stock durante el pico de Campaña Invierno.</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '8px', fontWeight: 800, color: '#334155' }}>Farmacéuticos Clínicos</td>
                          <td style={{ padding: '8px' }}>Desplegar farmacéuticos en salas de hospitalizados para validar recetas al pie de cama.</td>
                          <td style={{ padding: '8px', color: '#10b981', fontWeight: 800 }}>Mitigación de errores de prescripción en un 18%.</td>
                        </tr>
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </div>

            </div>

            <style jsx>{`
              .chart-container {
                padding: 30px;
                border-radius: 32px;
                background: #ffffff;
                border: 1px solid rgba(0,0,0,0.05);
              }

              .chart-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                flex-wrap: wrap;
                gap: 15px;
                margin-bottom: 40px;
              }

              .c-title {
                font-size: 1.4rem;
                font-weight: 800;
                color: #1a365d;
              }

              .c-subtitle {
                font-size: 0.85rem;
                color: #64748b;
                margin-top: 4px;
              }

              .chart-legend {
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
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
                height: 300px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #999;
                font-size: 0.95rem;
                border: 1.5px dashed #e2e8f0;
                border-radius: 20px;
              }

              .chart-visual-wrapper {
                position: relative;
                height: 350px;
                margin-top: 20px;
              }

              .chart-y-axis-lines {
                position: absolute;
                width: 100%;
                height: calc(100% - 45px);
                display: flex;
                flex-direction: column-reverse;
                justify-content: space-between;
                z-index: 1;
              }

              .y-axis-tick-line {
                display: flex;
                align-items: center;
                width: 100%;
              }

              .y-tick-label {
                width: 50px;
                font-size: 0.75rem;
                color: #94a3b8;
                font-weight: 700;
                text-align: right;
                padding-right: 12px;
              }

              .y-tick-line {
                flex: 1;
                height: 1px;
                background: #e2e8f0;
              }

              .chart-bars-viewport {
                position: absolute;
                left: 50px;
                width: calc(100% - 50px);
                height: 100%;
                display: flex;
                align-items: flex-end;
                justify-content: space-around;
                z-index: 2;
              }

              .chart-bar-column {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 45px;
                height: 100%;
                justify-content: flex-end;
              }

              .chart-bar-hover-group {
                width: 100%;
                height: calc(100% - 45px);
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
                align-items: center;
                position: relative;
                cursor: pointer;
              }

              .bar-stack-fill-box {
                width: 24px;
                height: 100%;
                display: flex;
                flex-direction: column-reverse;
                border-radius: 6px;
                overflow: hidden;
                background: rgba(0,0,0,0.02);
              }

              .bar-part {
                width: 100%;
                transition: height 0.6s cubic-bezier(0.16, 1, 0.3, 1);
              }

              .chart-x-label {
                font-size: 0.72rem;
                font-weight: 700;
                color: #94a3b8;
                text-transform: capitalize;
                margin-top: 10px;
                height: 20px;
              }

              /* Chart Tooltip - Shifted to hang from top to prevent clipping */
              .bar-hover-tooltip {
                position: absolute;
                top: 8px;
                background: rgba(15, 23, 42, 0.95);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.08);
                color: white;
                padding: 16px;
                border-radius: 12px;
                width: 200px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.35);
                z-index: 100;
                display: flex;
                flex-direction: column;
                gap: 6px;
                pointer-events: none;
                opacity: 0;
                transform: translateY(-10px);
                transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
                font-size: 0.8rem;
              }

              .chart-bar-hover-group:hover .bar-hover-tooltip {
                opacity: 1;
                transform: translateY(0);
              }

              .tooltip-divider {
                height: 1px;
                background: rgba(255,255,255,0.15);
                margin: 4px 0;
              }

              .t-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                opacity: 0.85;
              }

              .t-row.bold {
                font-weight: 800;
                opacity: 1;
              }

              .t-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                display: inline-block;
                margin-right: 6px;
              }
            `}</style>

          </div>

        </div>
      )}

    </div>
  );
}
