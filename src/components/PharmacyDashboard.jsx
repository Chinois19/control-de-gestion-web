import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ChevronLeft, 
  Activity, 
  FileText, 
  Calendar, 
  ArrowUpRight, 
  ChevronDown, 
  ChevronRight, 
  SlidersHorizontal, 
  Check, 
  Info, 
  Download, 
  LayoutGrid, 
  TrendingUp, 
  ClipboardList, 
  Sparkles,
  RefreshCw,
  HelpCircle
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

  // Custom multi-select checklists
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
  const [hoveredService, setHoveredService] = useState(null);
  const [hoveredTrendNode, setHoveredTrendNode] = useState(null);
  const [trendDimension, setTrendDimension] = useState('ambos'); // 'recetas' | 'prescripciones' | 'ambos'
  const [donutDimension, setDonutDimension] = useState('recetas'); // 'recetas' | 'prescripciones'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Refs for tracking dimension options
  const dropdownRef = useRef(null);

  // --- 1. Load Data ---
  useEffect(() => {
    async function loadPharmacyData() {
      try {
        setLoading(true);
        const res = await fetch('/data/pharmacy_cached.json');
        if (!res.ok) {
          throw new Error('No se pudo cargar el caché de farmacia.');
        }
        const data = await res.json();
        setRawData(data.records || []);
        setLastUpdated(data.lastUpdated || '');
        
        // Extract unique options for filters
        const uniqueServicios = [...new Set(data.records.map(r => r.servicio).filter(Boolean))].sort();
        const uniqueTipos = [...new Set(data.records.map(r => r.tipo_atencion).filter(Boolean))].sort();
        const uniqueAreas = [...new Set(data.records.map(r => r.area).filter(Boolean))].sort();
        
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

  // --- 2. Extract Available Dimensions for Checklist Menus ---
  const uniqueDropdownOptions = useMemo(() => {
    if (rawData.length === 0) return { servicios: [], tipos: [], areas: [] };
    return {
      servicios: [...new Set(rawData.map(r => r.servicio).filter(Boolean))].sort(),
      tipos: [...new Set(rawData.map(r => r.tipo_atencion).filter(Boolean))].sort(),
      areas: [...new Set(rawData.map(r => r.area).filter(Boolean))].sort()
    };
  }, [rawData]);

  // --- 3. Date Input Validation Handler ---
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

  // --- 4. Filtering and Metric Calculation ---
  const filteredRecords = useMemo(() => {
    if (rawData.length === 0) return [];
    
    return rawData.filter(r => {
      // Date Filter
      if (r.fecha < startDate || r.fecha > endDate) return false;
      
      // Multiselect Filters
      if (selectedServicios.length > 0 && !selectedServicios.includes(r.servicio)) return false;
      if (selectedTipos.length > 0 && !selectedTipos.includes(r.tipo_atencion)) return false;
      if (selectedAreas.length > 0 && !selectedAreas.includes(r.area)) return false;
      
      // Search Box Filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesServ = r.servicio?.toLowerCase().includes(query);
        const matchesArea = r.area?.toLowerCase().includes(query);
        const matchesTipo = r.tipo_atencion?.toLowerCase().includes(query);
        const matchesFecha = r.fecha.includes(query);
        if (!matchesServ && !matchesArea && !matchesTipo && !matchesFecha) return false;
      }
      
      return true;
    });
  }, [rawData, startDate, endDate, selectedServicios, selectedTipos, selectedAreas, searchQuery]);

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

  // --- 5. Donut Chart Aggregation (Servicios) ---
  const serviceDistribution = useMemo(() => {
    const counts = {};
    filteredRecords.forEach(r => {
      const key = r.servicio || 'Sin servicio';
      const val = donutDimension === 'recetas' ? (r.recetas || 0) : (r.prescripciones || 0);
      if (!counts[key]) counts[key] = 0;
      counts[key] += val;
    });
    
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    
    const colors = [
      '#0284c7', '#1e3a8a', '#f43f5e', '#f59e0b', '#10b981', 
      '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#64748b'
    ];
    
    return Object.entries(counts)
      .map(([name, value], idx) => ({
        key: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        name,
        value,
        percent: total > 0 ? ((value / total) * 100).toFixed(1) : '0.0',
        color: colors[idx % colors.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredRecords, donutDimension]);

  // SVG path generator helper for Donut slices
  const donutSegments = useMemo(() => {
    let accumulatedAngle = 0;
    const total = serviceDistribution.reduce((sum, s) => sum + s.value, 0);
    
    return serviceDistribution.map(seg => {
      const angle = total > 0 ? (seg.value / total) * 360 : 0;
      
      // Calculate SVG Arc coordinates
      const x1 = 150 + 100 * Math.cos((accumulatedAngle - 90) * Math.PI / 180);
      const y1 = 150 + 100 * Math.sin((accumulatedAngle - 90) * Math.PI / 180);
      
      accumulatedAngle += angle;
      
      const x2 = 150 + 100 * Math.cos((accumulatedAngle - 90) * Math.PI / 180);
      const y2 = 150 + 100 * Math.sin((accumulatedAngle - 90) * Math.PI / 180);
      
      const largeArc = angle > 180 ? 1 : 0;
      const pathData = `M 150 150 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`;
      
      return {
        ...seg,
        pathData
      };
    });
  }, [serviceDistribution]);

  // --- 6. Time Trend Aggregation (Intelligent Grouping) ---
  const trendData = useMemo(() => {
    const dailyMap = {};
    filteredRecords.forEach(r => {
      const d = r.fecha;
      if (!dailyMap[d]) {
        dailyMap[d] = { recetas: 0, prescripciones: 0 };
      }
      dailyMap[d].recetas += r.recetas || 0;
      dailyMap[d].prescripciones += r.prescripciones || 0;
    });
    
    const dates = Object.keys(dailyMap).sort();
    
    // Decidir si agrupamos por Día o por Mes para un rendimiento máximo
    const uniqueDays = dates.length;
    
    if (uniqueDays > 45) {
      // Agrupación mensual
      const monthlyMap = {};
      dates.forEach(d => {
        const monthKey = d.substring(0, 7); // 'YYYY-MM'
        if (!monthlyMap[monthKey]) {
          monthlyMap[monthKey] = { recetas: 0, prescripciones: 0, label: '' };
        }
        monthlyMap[monthKey].recetas += dailyMap[d].recetas;
        monthlyMap[monthKey].prescripciones += dailyMap[d].prescripciones;
      });
      
      return Object.entries(monthlyMap)
        .map(([key, val]) => {
          const parts = key.split('-');
          const year = parts[0].substring(2);
          const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
          const monthIndex = parseInt(parts[1], 10) - 1;
          val.label = `${months[monthIndex]} '${year}`;
          val.rawDate = key;
          return val;
        })
        .sort((a, b) => (a.rawDate > b.rawDate ? 1 : -1));
    } else {
      // Agrupación diaria
      return dates.map(d => {
        const parts = d.split('-');
        const label = `${parts[2]}/${parts[1]}`;
        return {
          label,
          rawDate: d,
          recetas: dailyMap[d].recetas,
          prescripciones: dailyMap[d].prescripciones
        };
      });
    }
  }, [filteredRecords]);

  // SVG geometry for Trend chart
  const trendPoints = useMemo(() => {
    if (trendData.length === 0) return { recetas: [], prescripciones: [] };
    
    const maxVal = Math.max(
      ...trendData.map(d => Math.max(d.recetas, d.prescripciones)),
      10 // Fallback
    );
    
    const width = 850;
    const height = 180;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 20;
    
    const graphWidth = width - paddingLeft - paddingRight;
    const graphHeight = height - paddingTop - paddingBottom;
    
    const getX = (idx) => {
      if (trendData.length <= 1) return paddingLeft + graphWidth / 2;
      return paddingLeft + (idx / (trendData.length - 1)) * graphWidth;
    };
    
    const getY = (val) => {
      return height - paddingBottom - (val / maxVal) * graphHeight;
    };
    
    const ptsRecetas = trendData.map((d, i) => ({
      x: getX(i),
      y: getY(d.recetas),
      value: d.recetas,
      date: d.label,
      rawDate: d.rawDate,
      prescripciones: d.prescripciones
    }));
    
    const ptsPrescripciones = trendData.map((d, i) => ({
      x: getX(i),
      y: getY(d.prescripciones),
      value: d.prescripciones,
      date: d.label,
      rawDate: d.rawDate,
      recetas: d.recetas
    }));
    
    return {
      recetas: ptsRecetas,
      prescripciones: ptsPrescripciones,
      maxY: maxVal,
      getYZero: getY(0)
    };
  }, [trendData]);

  // --- 7. Table Pagination and Search ---
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredRecords.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredRecords, currentPage]);

  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);

  // --- 8. Export CSV Handler ---
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;
    
    // CSV Header row
    const headers = ['FECHA', 'SERVICIO', 'RECETAS', 'PRESCRIPCIONES', 'RECETA BLANCA', 'RECETA VERDE', 'TIPO ATENCION', 'AREA'];
    const rows = filteredRecords.map(r => [
      r.fecha,
      r.servicio,
      r.recetas,
      r.prescripciones,
      r.receta_blanca,
      r.receta_verde,
      r.tipo_atencion,
      r.area
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.map(val => `"${val}"`).join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `produccion_farmacia_${startDate}_a_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle checklist utilities
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '20px' }}>
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
              <span style={{ color: '#0ea5e9', fontWeight: 850, textTransform: 'uppercase', letterSpacing: '1.5px', fontSize: '0.74rem' }}>Servicios Clínicos de Apoyo</span>
              <span style={{ fontSize: '0.64rem', fontWeight: 800, background: 'rgba(14, 165, 233, 0.08)', color: '#0ea5e9', padding: '2px 8px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={10} /> Live REDCap Cache
              </span>
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 950, color: '#1a365d', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Control de Producción de Farmacia
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
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b' }}>Cargando 43,943 registros del censo de farmacia...</span>
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
            overflow: 'hidden', 
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
              gap: '22px'
            }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '12px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', margin: 0, fontWeight: 900, color: '#1a365d' }}>
                  <SlidersHorizontal size={16} /> Filtros de Producción
                </h3>
              </div>

              {/* DATE RANGE FILTER (VERTICALLY STACKED & Accent lines) */}
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
                <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: '12px', border: '1.5px solid rgba(0,0,0,0.06)', borderLeft: '5px solid #10b981', padding: '6px 12px' }}>
                  <Calendar size={15} style={{ color: '#10b981', marginRight: '10px' }} />
                  <input 
                    type="date" 
                    value={rawHasta} 
                    onChange={(e) => handleDateChange('hasta', e.target.value)}
                    style={{ background: 'transparent', border: 'none', width: '100%', outline: 'none', fontSize: '0.8rem', fontWeight: 800, color: '#1e293b' }}
                  />
                </div>
              </div>

              {/* CUSTOM CHECKLIST DROPDOWNS REF SECTION */}
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
                      borderLeft: '5px solid #8b5cf6',
                      background: 'white', 
                      fontSize: '0.78rem', 
                      fontWeight: 800, 
                      color: '#1a365d',
                      cursor: 'pointer' 
                    }}
                  >
                    <span>{selectedServicios.length === uniqueDropdownOptions.servicios.length ? 'Todos los Servicios' : `${selectedServicios.length} Seleccionados`}</span>
                    <ChevronDown size={14} style={{ color: '#64748b' }} />
                  </button>
                  
                  {dropdownsOpen.servicios && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: 'white', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', borderRadius: '12px', zIndex: 120, padding: '10px', marginTop: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                        <button onClick={() => selectAll(setSelectedServicios, uniqueDropdownOptions.servicios)} style={{ fontSize: '0.66rem', fontWeight: 800, color: '#0ea5e9', border: 'none', background: 'none', cursor: 'pointer' }}>Todos</button>
                        <button onClick={() => selectNone(setSelectedServicios)} style={{ fontSize: '0.66rem', fontWeight: 800, color: '#94a3b8', border: 'none', background: 'none', cursor: 'pointer' }}>Ninguno</button>
                      </div>
                      {uniqueDropdownOptions.servicios.map(serv => (
                        <label key={serv} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 4px', fontSize: '0.74rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                          <input type="checkbox" checked={selectedServicios.includes(serv)} onChange={() => toggleSelection(selectedServicios, setSelectedServicios, serv)} />
                          {serv}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. TIPOS DE ATENCION DROPDOWN */}
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 855, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>Tipo de Atención:</label>
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
                      borderLeft: '5px solid #f59e0b',
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
                    <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: 'white', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', borderRadius: '12px', zIndex: 120, padding: '10px', marginTop: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                        <button onClick={() => selectAll(setSelectedTipos, uniqueDropdownOptions.tipos)} style={{ fontSize: '0.66rem', fontWeight: 800, color: '#0ea5e9', border: 'none', background: 'none', cursor: 'pointer' }}>Todos</button>
                        <button onClick={() => selectNone(setSelectedTipos)} style={{ fontSize: '0.66rem', fontWeight: 800, color: '#94a3b8', border: 'none', background: 'none', cursor: 'pointer' }}>Ninguno</button>
                      </div>
                      {uniqueDropdownOptions.tipos.map(tipo => (
                        <label key={tipo} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 4px', fontSize: '0.74rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                          <input type="checkbox" checked={selectedTipos.includes(tipo)} onChange={() => toggleSelection(selectedTipos, setSelectedTipos, tipo)} />
                          {tipo}
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
                      borderLeft: '5px solid #f43f5e',
                      background: 'white', 
                      fontSize: '0.78rem', 
                      fontWeight: 800, 
                      color: '#1a365d',
                      cursor: 'pointer' 
                    }}
                  >
                    <span>{selectedAreas.length === uniqueDropdownOptions.areas.length ? 'Todas las Áreas' : `${selectedAreas.length} Seleccionadas`}</span>
                    <ChevronDown size={14} style={{ color: '#64748b' }} />
                  </button>
                  
                  {dropdownsOpen.areas && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: 'white', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', borderRadius: '12px', zIndex: 120, padding: '10px', marginTop: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                        <button onClick={() => selectAll(setSelectedAreas, uniqueDropdownOptions.areas)} style={{ fontSize: '0.66rem', fontWeight: 800, color: '#0ea5e9', border: 'none', background: 'none', cursor: 'pointer' }}>Todos</button>
                        <button onClick={() => selectNone(setSelectedAreas)} style={{ fontSize: '0.66rem', fontWeight: 800, color: '#94a3b8', border: 'none', background: 'none', cursor: 'pointer' }}>Ninguno</button>
                      </div>
                      {uniqueDropdownOptions.areas.map(area => (
                        <label key={area} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 4px', fontSize: '0.74rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                          <input type="checkbox" checked={selectedAreas.includes(area)} onChange={() => toggleSelection(selectedAreas, setSelectedAreas, area)} />
                          {area}
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
                <span>{filtersOpen ? 'Colapsar Panel de Filtros' : 'Mostrar Panel de Filtros'}</span>
              </button>

              <button 
                onClick={handleExportCSV}
                style={{ 
                  background: '#ffffff', 
                  border: '1.5px solid rgba(26, 54, 93, 0.15)', 
                  color: '#1a365d', 
                  padding: '10px 18px', 
                  borderRadius: '12px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontSize: '0.76rem', 
                  fontWeight: 800,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(26,54,93,0.02)'}
                onMouseOut={(e) => e.currentTarget.style.background = '#ffffff'}
              >
                <Download size={14} />
                <span>Exportar CSV de Filtros</span>
              </button>
            </div>

            {/* KPI STATS ROW (5 cards) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
              
              {/* 1. RECETAS TOTAL */}
              <div className="glass-card shadow-soft" style={{ 
                background: '#ffffff', 
                borderRadius: '20px', 
                border: '1px solid rgba(0,0,0,0.05)', 
                borderLeft: '5px solid #10b981', 
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Recetas Emitidas</span>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: 950, color: '#1a365d', margin: '4px 0' }}>{metrics.recetas.toLocaleString()}</h4>
                </div>
                <p style={{ fontSize: '0.66rem', color: '#64748b', margin: 0, fontWeight: 600 }}>Hojas de indicación clínica</p>
              </div>

              {/* 2. PRESCRIPCIONES TOTAL */}
              <div className="glass-card shadow-soft" style={{ 
                background: '#ffffff', 
                borderRadius: '20px', 
                border: '1px solid rgba(0,0,0,0.05)', 
                borderLeft: '5px solid #0ea5e9', 
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Prescripciones</span>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: 950, color: '#1a365d', margin: '4px 0' }}>{metrics.prescripciones.toLocaleString()}</h4>
                </div>
                <p style={{ fontSize: '0.66rem', color: '#64748b', margin: 0, fontWeight: 600 }}>Fármacos individuales dispensados</p>
              </div>

              {/* 3. RATIO COMPLEJIDAD */}
              <div className="glass-card shadow-soft" style={{ 
                background: '#ffffff', 
                borderRadius: '20px', 
                border: '1px solid rgba(0,0,0,0.05)', 
                borderLeft: '5px solid #8b5cf6', 
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Prescripciones / Receta</span>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: 950, color: '#8b5cf6', margin: '4px 0' }}>{metrics.ratio} <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>farm/rec</span></h4>
                </div>
                <p style={{ fontSize: '0.66rem', color: '#64748b', margin: 0, fontWeight: 600 }}>Complejidad terapéutica media</p>
              </div>

              {/* 4. CONTROLADOS BLANCA */}
              <div className="glass-card shadow-soft" style={{ 
                background: '#ffffff', 
                borderRadius: '20px', 
                border: '1px solid rgba(0,0,0,0.05)', 
                borderLeft: '5px solid #4b5563', 
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Controlados Blanca</span>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: 950, color: '#1f2937', margin: '4px 0' }}>{metrics.blanca.toLocaleString()}</h4>
                </div>
                <p style={{ fontSize: '0.66rem', color: '#64748b', margin: 0, fontWeight: 600 }}>Psicotrópicos retenidos</p>
              </div>

              {/* 5. CONTROLADOS VERDE */}
              <div className="glass-card shadow-soft" style={{ 
                background: '#ffffff', 
                borderRadius: '20px', 
                border: '1px solid rgba(0,0,0,0.05)', 
                borderLeft: '5px solid #16a34a', 
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Controlados Verde</span>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: 950, color: '#16a34a', margin: '4px 0' }}>{metrics.verde.toLocaleString()}</h4>
                </div>
                <p style={{ fontSize: '0.66rem', color: '#64748b', margin: 0, fontWeight: 600 }}>Estupefacientes controlados</p>
              </div>

            </div>

            {/* DUAL CHARTS FIRST ROW (Trend & Distribution) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '30px', alignItems: 'stretch' }}>
              
              {/* LEFT: TREND DUAL DIMENSION LINE/AREA CHART */}
              <div className="glass-card chart-container" style={{ padding: '24px', background: '#ffffff', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.06)', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', margin: 0, position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '14px', marginBottom: '20px' }}>
                  <div>
                    <h3 className="c-title" style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1a365d', margin: 0 }}>Tendencia de Producción Temporal</h3>
                    <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '2px 0 0 0', fontWeight: 600 }}>
                      Monitoreo dinámico {trendData.length > 45 ? 'mensual' : 'diario'} de prescripciones vs recetas emitidas
                    </p>
                  </div>
                  
                  {/* Selector de Dimensión de Tendencia */}
                  <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '10px', gap: '2px' }}>
                    <button 
                      onClick={() => setTrendDimension('ambos')}
                      style={{ border: 'none', background: trendDimension === 'ambos' ? 'white' : 'transparent', color: trendDimension === 'ambos' ? '#1a365d' : '#64748b', fontSize: '0.68rem', fontWeight: 800, padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s' }}
                    >Ambos</button>
                    <button 
                      onClick={() => setTrendDimension('recetas')}
                      style={{ border: 'none', background: trendDimension === 'recetas' ? 'white' : 'transparent', color: trendDimension === 'recetas' ? '#10b981' : '#64748b', fontSize: '0.68rem', fontWeight: 800, padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s' }}
                    >Recetas</button>
                    <button 
                      onClick={() => setTrendDimension('prescripciones')}
                      style={{ border: 'none', background: trendDimension === 'prescripciones' ? 'white' : 'transparent', color: trendDimension === 'prescripciones' ? '#0ea5e9' : '#64748b', fontSize: '0.68rem', fontWeight: 800, padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s' }}
                    >Prescripciones</button>
                  </div>
                </div>

                {trendData.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
                    No hay datos disponibles para el rango seleccionado
                  </div>
                ) : (
                  <div style={{ position: 'relative', width: '100%', marginTop: '10px' }}>
                    <svg viewBox="0 0 850 220" width="100%" height="220" style={{ overflow: 'visible' }}>
                      <defs>
                        {/* Area Gradients */}
                        <linearGradient id="recetasGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="prescripcionesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Y-Axis Gridlines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
                        const yVal = trendPoints.getYZero - r * (trendPoints.getYZero - 20);
                        const labelVal = Math.round(r * trendPoints.maxY);
                        return (
                          <g key={idx}>
                            <line x1="40" y1={yVal} x2="830" y2={yVal} stroke="rgba(0,0,0,0.04)" strokeDasharray="3,3" />
                            <text x="32" y={yVal + 3.5} fill="#94a3b8" fontSize="8" fontWeight="800" textAnchor="end">{labelVal.toLocaleString()}</text>
                          </g>
                        );
                      })}

                      {/* Area Paths (Filled from zero line) */}
                      {trendDimension !== 'prescripciones' && (
                        <path 
                          d={`M ${trendPoints.recetas[0].x} ${trendPoints.getYZero} L ${trendPoints.recetas.map(p => `${p.x} ${p.y}`).join(' L ')} L ${trendPoints.recetas[trendPoints.recetas.length - 1].x} ${trendPoints.getYZero} Z`} 
                          fill="url(#recetasGrad)"
                        />
                      )}
                      {trendDimension !== 'recetas' && (
                        <path 
                          d={`M ${trendPoints.prescripciones[0].x} ${trendPoints.getYZero} L ${trendPoints.prescripciones.map(p => `${p.x} ${p.y}`).join(' L ')} L ${trendPoints.prescripciones[trendPoints.prescripciones.length - 1].x} ${trendPoints.getYZero} Z`} 
                          fill="url(#prescripcionesGrad)"
                        />
                      )}

                      {/* Stroke Lines */}
                      {trendDimension !== 'prescripciones' && (
                        <path 
                          d={trendPoints.recetas.map(p => `${p.x} ${p.y}`).join(' L ')} 
                          fill="none" 
                          stroke="#10b981" 
                          strokeWidth="2.5" 
                          strokeLinecap="round" 
                        />
                      )}
                      {trendDimension !== 'recetas' && (
                        <path 
                          d={trendPoints.prescripciones.map(p => `${p.x} ${p.y}`).join(' L ')} 
                          fill="none" 
                          stroke="#0ea5e9" 
                          strokeWidth="2.5" 
                          strokeLinecap="round" 
                        />
                      )}

                      {/* Points / Hover Trigger Areas */}
                      {trendData.map((d, i) => {
                        const pr = trendPoints.recetas[i];
                        const pp = trendPoints.prescripciones[i];
                        const triggerX = pr.x;
                        const triggerWidth = Math.max(15, 800 / trendData.length);
                        
                        // Decide if we should render date label
                        const labelStep = Math.max(1, Math.round(trendData.length / 8));
                        const shouldRenderLabel = i % labelStep === 0 || i === trendData.length - 1;

                        return (
                          <g key={i} className="chart-badge-group">
                            {shouldRenderLabel && (
                              <React.Fragment>
                                {trendDimension !== 'prescripciones' && <circle cx={pr.x} cy={pr.y} r="4" fill="#10b981" stroke="#fff" strokeWidth="1.5" />}
                                {trendDimension !== 'recetas' && <circle cx={pp.x} cy={pp.y} r="4" fill="#0ea5e9" stroke="#fff" strokeWidth="1.5" />}
                                <text x={pr.x} y="208" fill="#64748b" fontSize="8" fontWeight="800" textAnchor="middle">{d.label}</text>
                              </React.Fragment>
                            )}

                            {/* Large Invisible Hover Capture Area */}
                            <rect 
                              x={triggerX - triggerWidth/2}
                              y="10"
                              width={triggerWidth}
                              height="180"
                              fill="transparent"
                              style={{ cursor: 'pointer' }}
                              onMouseEnter={() => setHoveredTrendNode({ ...d, idx: i, x: triggerX })}
                              onMouseLeave={() => setHoveredTrendNode(null)}
                            />
                          </g>
                        );
                      })}

                    </svg>

                    {/* Interactive Trend Tooltip */}
                    <AnimatePresence>
                      {hoveredTrendNode && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute-chart-tooltip glass-card"
                          style={{ 
                            position: 'absolute',
                            left: `${Math.min(Math.max(hoveredTrendNode.x - 110, 10), 600)}px`,
                            top: '55px',
                            padding: '16px',
                            background: 'rgba(255, 255, 255, 0.98)',
                            border: '2px solid #1a365d',
                            borderRadius: '16px',
                            boxShadow: '0 10px 30px rgba(26, 54, 93, 0.1)',
                            zIndex: 100,
                            width: '220px',
                            pointerEvents: 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '6px' }}>
                            <Calendar size={14} style={{ color: '#1a365d' }} />
                            <span style={{ fontWeight: 800, fontSize: '0.86rem', color: '#1a365d' }}>Período: {hoveredTrendNode.label}</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Recetas:</span>
                              <strong style={{ color: '#10b981' }}>{hoveredTrendNode.recetas.toLocaleString()} rec.</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Prescripciones:</span>
                              <strong style={{ color: '#0ea5e9' }}>{hoveredTrendNode.prescripciones.toLocaleString()} farm.</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(0,0,0,0.08)', paddingTop: '6px', marginTop: '4px', fontWeight: 800 }}>
                              <span>Promedio Fárm/Rec:</span>
                              <span style={{ color: '#8b5cf6' }}>
                                {hoveredTrendNode.recetas > 0 ? (hoveredTrendNode.prescripciones / hoveredTrendNode.recetas).toFixed(2) : '0.00'}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                )}
              </div>

              {/* RIGHT: INTERACTIVE SERVICE DONUT CHART (With Synced Side List Legend) */}
              <div className="glass-card chart-container" style={{ padding: '24px', background: '#ffffff', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.06)', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', margin: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 className="c-title" style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1a365d', margin: 0 }}>Distribución por Servicio</h3>
                    <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '2px 0 0 0', fontWeight: 600 }}>Carga por especialidad médica</p>
                  </div>
                  
                  {/* Selector de Dimensión del Donut */}
                  <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '10px', gap: '2px' }}>
                    <button 
                      onClick={() => setDonutDimension('recetas')}
                      style={{ border: 'none', background: donutDimension === 'recetas' ? 'white' : 'transparent', color: donutDimension === 'recetas' ? '#10b981' : '#64748b', fontSize: '0.66rem', fontWeight: 800, padding: '4px 10px', borderRadius: '7px', cursor: 'pointer', transition: 'all 0.15s' }}
                    >Recetas</button>
                    <button 
                      onClick={() => setDonutDimension('prescripciones')}
                      style={{ border: 'none', background: donutDimension === 'prescripciones' ? 'white' : 'transparent', color: donutDimension === 'prescripciones' ? '#0ea5e9' : '#64748b', fontSize: '0.66rem', fontWeight: 800, padding: '4px 10px', borderRadius: '7px', cursor: 'pointer', transition: 'all 0.15s' }}
                    >Prescripciones</button>
                  </div>
                </div>

                {serviceDistribution.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px', color: '#64748b', fontSize: '0.82rem', fontWeight: 600, flex: 1 }}>
                    Sin datos
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flex: 1 }}>
                    
                    {/* SVG Donut Circle Left */}
                    <div style={{ width: '200px', height: '200px', position: 'relative', flexShrink: 0 }}>
                      <svg width="100%" height="100%" viewBox="0 0 300 300" style={{ overflow: 'visible' }}>
                        {donutSegments.map((seg, idx) => (
                          <g key={idx}>
                            <path 
                              d={seg.pathData} 
                              fill={seg.color}
                              onMouseEnter={() => setHoveredService(seg.key)}
                              onMouseLeave={() => setHoveredService(null)}
                              style={{
                                opacity: hoveredService && hoveredService !== seg.key ? 0.25 : 1,
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: hoveredService === seg.key ? 'scale(1.04)' : 'scale(1)',
                                transformOrigin: '150px 150px'
                              }}
                            />
                          </g>
                        ))}
                        <circle cx="150" cy="150" r="66" fill="#ffffff" />
                        
                        {/* Centered Donut Text */}
                        {hoveredService && donutSegments.find(s => s.key === hoveredService) ? (() => {
                          const activeSeg = donutSegments.find(s => s.key === hoveredService);
                          return (
                            <React.Fragment>
                              <text x="150" y="132" fill="#64748b" fontSize="7.5" fontWeight="900" textAnchor="middle" textTransform="uppercase">
                                {activeSeg.name.substring(0, 16)}
                              </text>
                              <text x="150" y="156" fill={activeSeg.color} fontSize="18" fontWeight="950" textAnchor="middle">
                                {activeSeg.value.toLocaleString()}
                              </text>
                              <text x="150" y="174" fill="#64748b" fontSize="8.5" fontWeight="800" textAnchor="middle">
                                {activeSeg.percent}% del total
                              </text>
                            </React.Fragment>
                          );
                        })() : (
                          <React.Fragment>
                            <text x="150" y="138" fill="#64748b" fontSize="8" fontWeight="800" textAnchor="middle" textTransform="uppercase">
                              Total {donutDimension === 'recetas' ? 'Recetas' : 'Prescrip.'}
                            </text>
                            <text x="150" y="166" fill="#1a365d" fontSize="19" fontWeight="950" textAnchor="middle">
                              {(donutDimension === 'recetas' ? metrics.recetas : metrics.prescripciones).toLocaleString()}
                            </text>
                          </React.Fragment>
                        )}
                      </svg>
                    </div>

                    {/* Interactive Side Legend List Right */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, maxHeight: '220px', overflowY: 'auto', paddingRight: '5px' }}>
                      {donutSegments.map((seg, idx) => {
                        const isHovered = hoveredService === seg.key;
                        const isDimmed = hoveredService && hoveredService !== seg.key;
                        
                        return (
                          <div 
                            key={idx}
                            onMouseEnter={() => setHoveredService(seg.key)}
                            onMouseLeave={() => setHoveredService(null)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '5px 8px',
                              borderRadius: '8px',
                              background: isHovered ? 'rgba(0,0,0,0.03)' : 'transparent',
                              opacity: isDimmed ? 0.4 : 1,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              borderLeft: isHovered ? `3.5px solid ${seg.color}` : '3.5px solid transparent'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', marginRight: '5px' }}>
                              <span style={{ width: '8px', height: '8px', background: seg.color, borderRadius: '50%', flexShrink: 0 }}></span>
                              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{seg.name}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                              <strong style={{ fontSize: '0.76rem', fontWeight: 900, color: '#1e293b' }}>{seg.value.toLocaleString()}</strong>
                              <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#64748b', background: 'rgba(0,0,0,0.04)', padding: '1px 5px', borderRadius: '4px' }}>{seg.percent}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                )}
              </div>

            </div>

            {/* CLINICAL EXPLANATORY NORMATIVE CARD */}
            <div className="glass-card shadow-soft" style={{ padding: '24px', background: 'rgba(14, 165, 233, 0.03)', borderRadius: '24px', border: '1.5px dashed rgba(14, 165, 233, 0.22)', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px', margin: 0 }}>
              <div>
                <h4 style={{ fontSize: '0.96rem', fontWeight: 900, color: '#1a365d', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 10px 0' }}>
                  <HelpCircle size={18} style={{ color: '#0ea5e9' }} /> Receta vs Prescripción: Dimensión de Análisis
                </h4>
                <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: '1.6', fontWeight: 600, margin: 0 }}>
                  Para una farmacia hospitalaria, planificar basándose únicamente en el conteo de recetas es insuficiente. Un paciente crónico o de alta complejidad puede egresar con una única receta física, pero que incluye múltiples medicamentos prescritos. 
                </p>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.76rem', color: '#475569', fontWeight: 650, justifyContent: 'center' }}>
                <li>
                  <strong>Número de Recetas (Dimensión Operativa):</strong> Representa el número total de pacientes atendidos en ventanilla o egresados con orden de alta. Mide el flujo físico de personas y el tiempo de despacho en ventanilla.
                </li>
                <li>
                  <strong>Número de Prescripciones (Dimensión Farmacéutica):</strong> Representa la suma total de medicamentos individuales preparados. Mide la carga real de envasado, dosificación unitaria, inventario de drogas y facturación.
                </li>
              </ul>
            </div>

            {/* RAW DATA TABLE WITH LIVE SEARCH BOX */}
            <div className="glass-card" style={{ padding: '24px', background: '#ffffff', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.06)', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1a365d', margin: 0 }}>Registros de Actividad Diaria</h3>
                  <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '2px 0 0 0', fontWeight: 600 }}>Censo completo de dispensación según filtros</p>
                </div>
                
                {/* Search Box inside table header */}
                <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1.5px solid rgba(0,0,0,0.06)', borderRadius: '12px', padding: '6px 14px', width: '280px' }}>
                  <Search size={16} style={{ color: '#94a3b8', marginRight: '8px' }} />
                  <input 
                    type="text" 
                    placeholder="Buscar fecha, servicio o área..." 
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.8rem', fontWeight: 700, color: '#1a365d', width: '100%' }}
                  />
                </div>
              </div>

              {filteredRecords.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px', color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
                  No se encontraron registros coincidentes
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                        <th style={{ padding: '12px', fontWeight: 800, color: '#64748b' }}>Fecha de Atención</th>
                        <th style={{ padding: '12px', fontWeight: 800, color: '#64748b' }}>Servicio Clínico</th>
                        <th style={{ padding: '12px', fontWeight: 800, color: '#64748b' }}>Área de Farmacia</th>
                        <th style={{ padding: '12px', fontWeight: 800, color: '#64748b' }}>Tipo de Atención</th>
                        <th style={{ padding: '12px', fontWeight: 800, color: '#10b981', textAlign: 'right' }}>Recetas</th>
                        <th style={{ padding: '12px', fontWeight: 800, color: '#0ea5e9', textAlign: 'right' }}>Prescripciones</th>
                        <th style={{ padding: '12px', fontWeight: 800, color: '#8b5cf6', textAlign: 'right' }}>Fárm/Rec Ratio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRecords.map((r, idx) => {
                        const ratio = r.recetas > 0 ? (r.prescripciones / r.recetas).toFixed(1) : '0.0';
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }} className="hover-row">
                            <td style={{ padding: '12px', fontWeight: 800, color: '#1a365d' }}>{r.fecha}</td>
                            <td style={{ padding: '12px', fontWeight: 800, color: '#334155' }}>
                              <span style={{ fontSize: '0.64rem', fontWeight: 900, background: 'rgba(139, 92, 246, 0.06)', color: '#8b5cf6', padding: '2px 8px', borderRadius: '10px' }}>
                                {r.servicio}
                              </span>
                            </td>
                            <td style={{ padding: '12px', fontWeight: 650, color: '#475569' }}>{r.area}</td>
                            <td style={{ padding: '12px', fontWeight: 800 }}>
                              <span style={{ fontSize: '0.64rem', fontWeight: 900, background: r.tipo_atencion.includes('ABIERTA') ? 'rgba(16, 163, 74, 0.06)' : 'rgba(2, 132, 199, 0.06)', color: r.tipo_atencion.includes('ABIERTA') ? '#16a34a' : '#0284c7', padding: '2px 8px', borderRadius: '10px' }}>
                                {r.tipo_atencion}
                              </span>
                            </td>
                            <td style={{ padding: '12px', fontWeight: 900, color: '#10b981', textAlign: 'right' }}>{r.recetas.toLocaleString()}</td>
                            <td style={{ padding: '12px', fontWeight: 900, color: '#0ea5e9', textAlign: 'right' }}>{r.prescripciones.toLocaleString()}</td>
                            <td style={{ padding: '12px', fontWeight: 800, color: '#8b5cf6', textAlign: 'right' }}>{ratio}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  {/* Pagination Controls */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>
                      Mostrando {Math.min(filteredRecords.length, (currentPage - 1) * rowsPerPage + 1)}-{Math.min(filteredRecords.length, currentPage * rowsPerPage)} de {filteredRecords.length.toLocaleString()} registros
                    </span>
                    
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        style={{ border: '1.5px solid rgba(0,0,0,0.06)', background: 'white', color: currentPage === 1 ? '#cbd5e1' : '#1a365d', padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                      >Anterior</button>
                      
                      <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#1a365d', padding: '0 8px' }}>
                        Pág {currentPage} de {Math.max(1, totalPages)}
                      </span>
                      
                      <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        style={{ border: '1.5px solid rgba(0,0,0,0.06)', background: 'white', color: currentPage === totalPages ? '#cbd5e1' : '#1a365d', padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                      >Siguiente</button>
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
