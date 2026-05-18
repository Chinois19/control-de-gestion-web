import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Activity, 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  AlertTriangle,
  Map,
  TrendingUp,
  Download,
  Filter,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronRight,
  PieChart,
  BarChart2,
  FileText,
  Clock
} from 'lucide-react';

export default function MammographyDashboard({ onBack, initialTab = 'summary', initialFilterNsp = false }) {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab === 'patients' ? 'rem' : initialTab); // 'summary', 'pivot', 'details', 'results', 'rem'
  const [lastUpdated, setLastUpdated] = useState('Nunca');
  
  // Dynamic Date Range Filter States (default 2025 and 2026)
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [periodPreset, setPeriodPreset] = useState('2025_2026');
  
  // Other Filter States
  const [selectedFuncionario, setSelectedFuncionario] = useState('Todas');
  const [selectedEstablecimiento, setSelectedEstablecimiento] = useState('Todas');
  const [selectedRangoEdad, setSelectedRangoEdad] = useState('Todas');
  const [selectedEstadoAtencion, setSelectedEstadoAtencion] = useState(initialFilterNsp ? 'No se presentó' : 'Todas'); // Default 'Todas'

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
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State (No longer used for Patient List, but kept to avoid any reference errors)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Pivot Table Expansion State
  const [expandedEstablishments, setExpandedEstablishments] = useState({});

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
      // Fetch from local weekly cache (public/data/mammography_cached.json)
      const response = await fetch('/data/mammography_cached.json');
      if (!response.ok) {
        throw new Error('No se pudo encontrar el archivo de datos local.');
      }
      const data = await response.json();
      setRawData(data.records || []);
      
      if (data.lastUpdated) {
        const date = new Date(data.lastUpdated);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        setLastUpdated(date.toLocaleDateString('es-ES', options));
      }
    } catch (err) {
      console.warn("Local cache load failed, trying backup API direct load...", err);
      // Fallback: If local cache fails, try the proxy API (admin environment fallback)
      try {
        const formData = new FormData();
        formData.append('token', '63A26E06FF58CE5D39023212C60982A9');
        formData.append('content', 'record');
        formData.append('format', 'json');
        formData.append('type', 'flat');
        formData.append('rawOrLabel', 'label');
        formData.append('returnFormat', 'json');

        const apiResponse = await fetch('/api-redcap', {
          method: 'POST',
          body: formData
        });
        if (!apiResponse.ok) throw new Error('Error al conectar con la base de datos REDCap.');
        const records = await apiResponse.json();
        setRawData(records);
        setLastUpdated('Cargado dinámicamente ahora (Sin cache semanal)');
      } catch (apiErr) {
        setError('No se pudo conectar a la base de datos ni cargar el archivo semanal. Por favor contacte a Control de Gestión.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Process and map raw data
  const processedData = useMemo(() => {
    return rawData.map(record => {
      const age = parseInt(record.edad_en_a_os) || 0;
      
      // Calculate Age Groups (matching Power Query M formula)
      let ageGroup = "Otros rangos de edad";
      if (age >= 50 && age <= 69) {
        ageGroup = "50 a 69 años";
      }

      // Concatenate full name - BLOCKED FOR PRIVACY (ANONYMIZED)
      const fullName = `Registro #${record.record_id}`;

      // Parse Date of Attention
      let year = 'N/A';
      let monthName = 'N/A';
      let monthIndex = -1;
      let yearMonthKey = 'N/A';

      if (record.fecha_de_atenci_n) {
        const dateParts = record.fecha_de_atenci_n.split('-');
        if (dateParts.length === 3) {
          year = dateParts[0];
          monthIndex = parseInt(dateParts[1]) - 1;
          const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
          monthName = months[monthIndex] || 'N/A';
          yearMonthKey = `${year}-${dateParts[1]}`;
        }
      }

      // Checkbox variables mapping (Seleccionados vs No seleccionados)
      const bilateral = record.descripci_n_del_ex_men___1 === "Seleccionados";
      const unilateral = record.descripci_n_del_ex_men___2 === "Seleccionados";
      const complementaria = record.descripci_n_del_ex_men___3 === "Seleccionados";
      const marcacion = record.descripci_n_del_ex_men___4 === "Seleccionados";
      const piezaOperatoria = record.descripci_n_del_ex_men___5 === "Seleccionados";
      const bilateral3d = record.descripci_n_del_ex_men___6 === "Seleccionados";
      const unilateral3d = record.descripci_n_del_ex_men___7 === "Seleccionados";
      const biopsia = record.descripci_n_del_ex_men___8 === "Seleccionados";

      // Focalización and Magnificación mappings
      const focalizacionCCD = record.tipo_de_proyecc___1 === "Seleccionados";
      const focalizacionCCI = record.tipo_de_proyecc___2 === "Seleccionados";
      const focalizacionOMLD = record.tipo_de_proyecc___3 === "Seleccionados";
      const focalizacionOMLI = record.tipo_de_proyecc___4 === "Seleccionados";
      const magnificacionCCD = record.tipo_de_proyecc___5 === "Seleccionados";
      const magnificacionCCI = record.tipo_de_proyecc___6 === "Seleccionados";
      const magnificacionOMLD = record.tipo_de_proyecc___7 === "Seleccionados";
      const magnificacionOMLI = record.tipo_de_proyecc___8 === "Seleccionados";

      const hasFocalizacion = focalizacionCCD || focalizacionCCI || focalizacionOMLD || focalizacionOMLI;
      const hasMagnificacion = magnificacionCCD || magnificacionCCI || magnificacionOMLD || magnificacionOMLI;

      return {
        ...record,
        recordId: record.record_id,
        rutPaciente: '[PROTEGIDO]',
        nombreCompleto: fullName,
        sexo: record.bdup_sexo || 'N/A',
        prevision: record.bdup_prevision || 'N/A',
        comuna: '[PROTEGIDO]',
        telefono: '[PROTEGIDO]',
        ficha: '[PROTEGIDO]',
        edad: age,
        grupoEdad: ageGroup,
        fechaAtencion: record.fecha_de_atenci_n || 'N/A',
        year,
        monthName,
        monthIndex,
        yearMonthKey,
        procedencia: record.procedencia_de_derivaci_n || 'N/A',
        establecimiento: record.establecimiento_de_origen || 'Otros Establecimientos de la Red',
        estadoAtencion: record.estado_de_atenci_n || 'N/A',
        modalidadAtencion: record.modalidad_de_atenci_n || 'N/A',
        funcionario: record.funcionario_que_atiende || 'N/A',
        birads: record.birads || 'Pendiente resultado',
        pertinencia: record.pertinencia_en_la_derivaci || 'N/A',
        bilateral,
        unilateral,
        complementaria,
        marcacion,
        piezaOperatoria,
        bilateral3d,
        unilateral3d,
        biopsia,
        focalizacionCCD,
        focalizacionCCI,
        hasFocalizacion,
        hasMagnificacion
      };
    });
  }, [rawData]);

  // Extract unique filter lists dynamically
  const filtersList = useMemo(() => {
    const funcionarios = [...new Set(processedData.map(d => d.funcionario))].filter(Boolean).sort();
    const establecimientos = [...new Set(processedData.map(d => d.establecimiento))].filter(Boolean).sort();
    const estados = [...new Set(processedData.map(d => d.estadoAtencion))].filter(Boolean).sort();
    
    return { funcionarios, establecimientos, estados };
  }, [processedData]);

  // Apply filters
  const filteredData = useMemo(() => {
    return processedData.filter(item => {
      // Date Range Filter
      if (item.fechaAtencion !== 'N/A') {
        if (startDate && item.fechaAtencion < startDate) return false;
        if (endDate && item.fechaAtencion > endDate) return false;
      }
      
      if (selectedFuncionario !== 'Todas' && item.funcionario !== selectedFuncionario) return false;
      if (selectedEstablecimiento !== 'Todas' && item.establecimiento !== selectedEstablecimiento) return false;
      if (selectedRangoEdad !== 'Todas' && item.grupoEdad !== selectedRangoEdad) return false;
      if (selectedEstadoAtencion !== 'Todas' && item.estadoAtencion !== selectedEstadoAtencion) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.recordId.toString().includes(query) ||
          item.establecimiento.toLowerCase().includes(query) ||
          item.birads.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [processedData, startDate, endDate, selectedFuncionario, selectedEstablecimiento, selectedRangoEdad, selectedEstadoAtencion, searchQuery]);

  // Calculations for KPI Cards
  const stats = useMemo(() => {
    const total = filteredData.length;
    let bilaterales = 0;
    let complementarias = 0;
    let marcaciones = 0;
    let unilaterales = 0;
    let sumAge = 0;
    let presentCount = 0;
    let absentCount = 0;
    let biradsPendientes = 0;

    filteredData.forEach(d => {
      if (d.bilateral) bilaterales++;
      if (d.complementaria) complementarias++;
      if (d.marcacion) marcaciones++;
      if (d.unilateral) unilaterales++;
      if (d.edad) sumAge += d.edad;
      if (d.estadoAtencion === 'Se presentó') presentCount++;
      if (d.estadoAtencion === 'No se presentó') absentCount++;
      if (d.birads === 'Pendiente resultado') biradsPendientes++;
    });

    const avgAge = total > 0 ? (sumAge / total).toFixed(1) : 0;
    const presentPercent = total > 0 ? ((presentCount / total) * 100).toFixed(1) : 0;

    return {
      total,
      bilaterales,
      complementarias,
      marcaciones,
      unilaterales,
      avgAge,
      presentPercent,
      absentCount,
      biradsPendientes
    };
  }, [filteredData]);

  // YoY calculation helper
  const getYoYStats = (key) => {
    let currentCount = 0;
    filteredData.forEach(d => {
      if (key === 'bilateral' && d.bilateral) currentCount++;
      if (key === 'complementaria' && d.complementaria) currentCount++;
      if (key === 'marcacion' && d.marcacion) currentCount++;
      if (key === 'unilateral' && d.unilateral) currentCount++;
    });

    const startYear = new Date(startDate).getFullYear();
    const endYear = new Date(endDate).getFullYear();
    const startMonth = new Date(startDate).getMonth();
    const endMonth = new Date(endDate).getMonth();
    const startDay = new Date(startDate).getDate();
    const endDay = new Date(endDate).getDate();

    const priorStart = new Date(startYear - 1, startMonth, startDay);
    const priorEnd = new Date(endYear - 1, endMonth, endDay);

    let priorCount = 0;
    processedData.forEach(d => {
      if (!d.fechaAtencion || d.fechaAtencion === 'N/A') return;
      // Filter out records that are NOT "Se presentó" for YoY if the main filter is "Se presentó"
      if (selectedEstadoAtencion !== 'Todas' && d.estadoAtencion !== selectedEstadoAtencion) return;
      
      const dDate = new Date(d.fechaAtencion);
      if (dDate >= priorStart && dDate <= priorEnd) {
        if (key === 'bilateral' && d.bilateral) priorCount++;
        if (key === 'complementaria' && d.complementaria) priorCount++;
        if (key === 'marcacion' && d.marcacion) priorCount++;
        if (key === 'unilateral' && d.unilateral) priorCount++;
      }
    });

    if (priorCount === 0) return { diff: 0, text: '0.0% vs año ant.', trend: 'neutral' };
    const pctDiff = ((currentCount - priorCount) / priorCount) * 100;
    const diffText = `${pctDiff >= 0 ? '↑' : '↓'} ${Math.abs(pctDiff).toFixed(1)}% vs año ant.`;
    return {
      diff: pctDiff,
      text: diffText,
      trend: pctDiff >= 0 ? 'positive' : 'negative'
    };
  };

  // Monthly NSP Trend Rate calculation
  const nspTrendData = useMemo(() => {
    const monthlyTotalMap = {};
    const monthlyNspMap = {};

    processedData.forEach(d => {
      if (d.fechaAtencion === 'N/A') return;
      if (startDate && d.fechaAtencion < startDate) return;
      if (endDate && d.fechaAtencion > endDate) return;
      if (selectedFuncionario !== 'Todas' && d.funcionario !== selectedFuncionario) return;
      if (selectedEstablecimiento !== 'Todas' && d.establecimiento !== selectedEstablecimiento) return;
      if (selectedRangoEdad !== 'Todas' && d.grupoEdad !== selectedRangoEdad) return;

      const ym = d.yearMonthKey;
      monthlyTotalMap[ym] = (monthlyTotalMap[ym] || 0) + 1;
      if (d.estadoAtencion === 'No se presentó') {
        monthlyNspMap[ym] = (monthlyNspMap[ym] || 0) + 1;
      }
    });

    const sortedKeys = Object.keys(monthlyTotalMap).sort();
    return sortedKeys.map(key => {
      const total = monthlyTotalMap[key] || 0;
      const nsp = monthlyNspMap[key] || 0;
      const rate = total > 0 ? (nsp / total) * 100 : 0;
      
      const parts = key.split('-');
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const mIdx = parseInt(parts[1]) - 1;
      const monthLabel = months[mIdx] || 'N/A';

      return {
        key,
        label: `${monthLabel} ${parts[0].slice(2)}`,
        total,
        nsp,
        rate
      };
    });
  }, [processedData, startDate, endDate, selectedFuncionario, selectedEstablecimiento, selectedRangoEdad]);

  // Dynamic NSP Insights (Hours lost, worst performing center, etc.)
  const nspInsights = useMemo(() => {
    const nspRecords = filteredData.filter(d => d.estadoAtencion === 'No se presentó');
    const totalNsp = nspRecords.length;
    
    // Standard slot is 30 minutes (0.5 hours)
    const slotDuration = 0.5;
    const totalHoursLost = totalNsp * slotDuration;

    // Group by establishment to find which one loses the most hours
    const estMap = {};
    nspRecords.forEach(d => {
      const est = d.establecimiento || 'Otros Establecimientos';
      estMap[est] = (estMap[est] || 0) + 1;
    });

    let worstEstablishment = 'Ninguno';
    let worstCount = 0;
    Object.entries(estMap).forEach(([est, count]) => {
      if (count > worstCount) {
        worstCount = count;
        worstEstablishment = est;
      }
    });

    const worstHoursLost = worstCount * slotDuration;

    return {
      totalNsp,
      totalHoursLost,
      worstEstablishment,
      worstCount,
      worstHoursLost
    };
  }, [filteredData]);

  // Clinical severity data for the new results tab
  const clinicalResults = useMemo(() => {
    let biradsPendientes = 0;
    let biradsNormales = 0; 
    let biradsSeguimiento = 0; 
    let biradsSospechosos = 0; 
    
    const agePyramid = {
      '<40': 0,
      '40-49': 0,
      '50-59': 0,
      '60-69': 0,
      '70+': 0
    };

    const comunasMap = {};

    filteredData.forEach(d => {
      const b = d.birads || '';
      if (b === 'Pendiente resultado') {
        biradsPendientes++;
      } else if (b.includes('Birads - 1') || b.includes('Birads - 2')) {
        biradsNormales++;
      } else if (b.includes('Birads - 3')) {
        biradsSeguimiento++;
      } else if (b.includes('Birads - 4') || b.includes('Birads - 5') || b.includes('Birads - 6')) {
        biradsSospechosos++;
        
        const age = d.edad;
        if (age < 40) agePyramid['<40']++;
        else if (age >= 40 && age <= 49) agePyramid['40-49']++;
        else if (age >= 50 && age <= 59) agePyramid['50-59']++;
        else if (age >= 60 && age <= 69) agePyramid['60-69']++;
        else agePyramid['70+']++;

        const com = d.comuna !== '[PROTEGIDO]' && d.comuna !== 'N/A' ? d.comuna : (d.establecimiento.includes('Pucón') ? 'Pucón' : d.establecimiento.includes('Loncoche') ? 'Loncoche' : 'Villarrica');
        comunasMap[com] = (comunasMap[com] || 0) + 1;
      }
    });

    return {
      biradsPendientes,
      biradsNormales,
      biradsSeguimiento,
      biradsSospechosos,
      agePyramid,
      comunas: Object.entries(comunasMap).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count)
    };
  }, [filteredData]);

  // Aggregate monthly production for the stacked bar chart
  const chartData = useMemo(() => {
    const monthlyMap = {};
    
    filteredData.forEach(d => {
      if (d.yearMonthKey === 'N/A') return;
      
      if (!monthlyMap[d.yearMonthKey]) {
        monthlyMap[d.yearMonthKey] = {
          key: d.yearMonthKey,
          label: `${d.monthName} ${d.year}`,
          bilaterales: 0,
          complementarias: 0,
          unilaterales: 0,
          marcaciones: 0,
          total: 0,
          sortKey: `${d.year}-${String(d.monthIndex + 1).padStart(2, '0')}`
        };
      }
      
      if (d.bilateral) monthlyMap[d.yearMonthKey].bilaterales++;
      if (d.complementaria) monthlyMap[d.yearMonthKey].complementarias++;
      if (d.unilateral) monthlyMap[d.yearMonthKey].unilaterales++;
      if (d.marcacion) monthlyMap[d.yearMonthKey].marcaciones++;
      monthlyMap[d.yearMonthKey].total++;
    });

    return Object.values(monthlyMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [filteredData]);

  // Pivot Table calculations (Establishments vs YearMonth)
  const pivotData = useMemo(() => {
    const columns = [...new Set(filteredData.map(d => d.yearMonthKey))].filter(c => c !== 'N/A').sort();
    
    const rowsMap = {};
    filteredData.forEach(d => {
      if (d.establecimiento === 'N/A') return;
      
      const est = d.establecimiento;
      if (!rowsMap[est]) {
        rowsMap[est] = {
          name: est,
          months: {},
          ageGroups: {
            "50 a 69 años": {},
            "Otros rangos de edad": {}
          },
          total: 0
        };
      }
      
      // Update month totals
      const ym = d.yearMonthKey;
      if (ym !== 'N/A') {
        rowsMap[est].months[ym] = (rowsMap[est].months[ym] || 0) + 1;
        rowsMap[est].total++;

        // Update sub-age groups
        const ag = d.grupoEdad;
        rowsMap[est].ageGroups[ag][ym] = (rowsMap[est].ageGroups[ag][ym] || 0) + 1;
      }
    });

    return {
      columns,
      rows: Object.values(rowsMap).sort((a, b) => b.total - a.total)
    };
  }, [filteredData]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, selectedFuncionario, selectedEstablecimiento, selectedRangoEdad, selectedEstadoAtencion, searchQuery]);

  const grandTotal = useMemo(() => {
    return pivotData.rows.reduce((acc, row) => acc + row.total, 0);
  }, [pivotData]);

  // SECURE REM MAMMO CALCULATION
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
      const modal = String(r.modalidadAtencion || '').toLowerCase();
      const cc = String(r.centro_de_costo_perc || '').toLowerCase();
      return modal.includes('operativo') || cc.includes('operativo');
    };

    const categories = [
      { key: 'bilateral', label: 'Mamografía Bilateral' },
      { key: 'unilateral', label: 'Mamografía Unilateral' },
      { key: 'complementaria', label: 'Mamografía Complementaria' },
      { key: 'marcacion', label: 'Marcación Mamaria' },
      { key: 'piezaOperatoria', label: 'Marcación Pieza Operatoria' },
      { key: 'bilateral3d', label: 'Mamografía Bilateral 3D' },
      { key: 'unilateral3d', label: 'Mamografía Unilateral 3D' },
      { key: 'biopsia', label: 'Biopsia Core / Estereotáxica' }
    ];

    const aggregation = {};
    categories.forEach(c => {
      aggregation[c.key] = {
        name: c.label,
        beneficiarios: 0,
        noBeneficiarios: 0,
        atencionCerrada: 0,
        atencionAbierta: 0,
        urgencia: 0,
        operativos: 0,
        total: 0
      };
    });

    filteredData.forEach(r => {
      // REM statistics only count presented (realized) procedures
      if (r.estadoAtencion !== 'Se presentó') return;

      const fonasa = isFonasa(r.prevision);
      const cerrado = r.procedencia === 'Atención Cerrada';
      const abierto = r.procedencia === 'Atención Abierta';
      const urg = r.procedencia === 'Urgencia';
      const op = isOperativo(r);

      categories.forEach(c => {
        if (r[c.key]) {
          const item = aggregation[c.key];
          item.total++;
          if (fonasa) item.beneficiarios++;
          else item.noBeneficiarios++;

          if (cerrado) item.atencionCerrada++;
          else if (abierto) item.atencionAbierta++;
          else if (urg) item.urgencia++;

          if (op) item.operativos++;
        }
      });
    });

    return Object.values(aggregation).filter(item => item.total > 0 || ['Mamografía Bilateral', 'Mamografía Unilateral', 'Mamografía Complementaria'].includes(item.name));
  }, [filteredData]);

  // Paginated Patient Grid
  const paginatedGridData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const toggleEstablishment = (name) => {
    setExpandedEstablishments(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleExportCSV = () => {
    const headers = ['Record ID', 'Edad', 'Rango Edad', 'Fecha Atención', 'Establecimiento', 'Funcionario', 'Bilateral', 'Unilateral', 'Complementaria', 'Marcación', 'BIRADS', 'Estado'];
    const rows = filteredData.map(d => [
      d.recordId,
      d.edad,
      d.grupoEdad,
      d.fechaAtencion,
      d.establecimiento,
      d.funcionario,
      d.bilateral ? 'Sí' : 'No',
      d.unilateral ? 'Sí' : 'No',
      d.complementaria ? 'Sí' : 'No',
      d.marcacion ? 'Sí' : 'No',
      d.birads,
      d.estadoAtencion
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Produccion_Mamografias_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="loader-container">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}>
          <RefreshCw size={54} color="var(--primary-accent)" />
        </motion.div>
        <h3>Conectando al repositorio de REDCap...</h3>
        <p>Procesando estadísticas y registros clínicos en tiempo real.</p>
        <style jsx>{`
          .loader-container {
            height: 70vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 20px;
            color: var(--text-dark);
          }
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
        <p>No se pudo establecer la sincronización segura con el proyecto. Mensaje técnico: <code>{error}</code></p>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="dashboard-btn" onClick={onBack}><ArrowLeft size={18} /> Volver</button>
          <button className="dashboard-btn primary" onClick={fetchData}><RefreshCw size={18} /> Reintentar Conexión</button>
        </div>
        <style jsx>{`
          .error-view {
            max-width: 650px;
            margin: 60px auto;
            padding: 40px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 24px;
            border-radius: 30px;
            box-shadow: 0 30px 70px rgba(0,0,0,0.15);
          }
          .error-view h2 { font-size: 2rem; font-weight: 800; color: #2c3e50; }
          .error-view p { color: #555; line-height: 1.6; }
          .dashboard-btn {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 24px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 14px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
          }
          .dashboard-btn.primary { background: var(--primary-accent); color: white; border-color: var(--primary-accent); }
          .dashboard-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        `}</style>
      </div>
    );
  }

  // Max value calculation for scaling chart bars
  const maxChartVal = chartData.length > 0 ? Math.max(...chartData.map(c => c.total)) : 100;
  const yAxisTicks = [0, Math.ceil(maxChartVal * 0.25), Math.ceil(maxChartVal * 0.5), Math.ceil(maxChartVal * 0.75), maxChartVal];

  return (
    <div className="mammo-portal" style={{ color: 'var(--text-dark)' }}>
      {/* Header */}
      <header className="portal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button className="circle-back-btn" onClick={onBack} title="Volver al panel superior">
            <ArrowLeft size={22} />
          </button>
          <div>
            <div className="header-badges">
              <span className="live-status"><span className="pulse-dot"></span> REDCap Activo</span>
              <span className="api-badge">API Hospital Villarrica</span>
              <span className="update-badge">📅 Carga Semanal: {lastUpdated}</span>
            </div>
            <h1 className="portal-title">Producción de Mamografías</h1>
            <p className="portal-subtitle">Monitoreo dinámico e insights estratégicos clínicos • Años 2018-2026</p>
          </div>
        </div>
        {/* Botones de Sincronizar y Exportar CSV eliminados por requerimiento */}
      </header>

      {/* Tabs Menu */}
      <div className="portal-tabs">
        <button className={`portal-tab ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>
          <BarChart2 size={18} /> Resumen de Producción
        </button>
        <button className={`portal-tab ${activeTab === 'pivot' ? 'active' : ''}`} onClick={() => setActiveTab('pivot')}>
          <FileText size={18} /> Producción según establecimiento
        </button>
        <button className={`portal-tab ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>
          <PieChart size={18} /> Proyecciones y Calidad
        </button>
        <button className={`portal-tab ${activeTab === 'results' ? 'active' : ''}`} onClick={() => setActiveTab('results')}>
          <AlertCircle size={18} /> Monitoreo de Resultados
        </button>
        <button className={`portal-tab ${activeTab === 'rem' ? 'active' : ''}`} onClick={() => setActiveTab('rem')}>
          <FileText size={18} /> Resumen Mensual (REM)
        </button>
      </div>

      {/* Main Grid: Sidebar + Content */}
      <div className="portal-layout">
        {/* Sidebar Filters */}
        <aside className="portal-sidebar glass-card">
          <div className="sidebar-section-title">
            <Filter size={18} /> <span>Filtros Asistenciales</span>
          </div>

          <div className="filter-item">
            <label>PERIODO RÁPIDO</label>
            <select value={periodPreset} onChange={(e) => handlePresetChange(e.target.value)}>
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
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 600, outline: 'none' }}
              />
            </div>
            <div>
              <label>HASTA</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => { setEndDate(e.target.value); setPeriodPreset('custom'); }} 
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 600, outline: 'none' }}
              />
            </div>
          </div>

          <div className="filter-item">
            <label>ESTABLECIMIENTO DE ORIGEN</label>
            <select value={selectedEstablecimiento} onChange={(e) => setSelectedEstablecimiento(e.target.value)}>
              <option value="Todas">Todos los centros</option>
              {filtersList.establecimientos.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          <div className="filter-item">
            <label>RANGOS DE EDAD</label>
            <select value={selectedRangoEdad} onChange={(e) => setSelectedRangoEdad(e.target.value)}>
              <option value="Todas">Todos los rangos</option>
              <option value="50 a 69 años">50 a 69 años (Tamizaje Objetivo)</option>
              <option value="Otros rangos de edad">Otros rangos de edad</option>
            </select>
          </div>

          <div className="filter-item">
            <label>ESTADO DE LA ATENCIÓN</label>
            <select value={selectedEstadoAtencion} onChange={(e) => setSelectedEstadoAtencion(e.target.value)}>
              <option value="Todas">Todos los estados</option>
              {filtersList.estados.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="filter-item">
            <label>PROFESIONAL QUE ATIENDE</label>
            <select value={selectedFuncionario} onChange={(e) => setSelectedFuncionario(e.target.value)}>
              <option value="Todas">Todos los profesionales</option>
              {filtersList.funcionarios.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="sidebar-stats">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#666' }}>Registros Filtrados</span>
              <span style={{ fontWeight: 700, color: 'var(--primary-accent)' }}>{filteredData.length}</span>
            </div>
            <div className="sidebar-progress-bg">
              <div className="sidebar-progress-fill" style={{ width: `${rawData.length > 0 ? (filteredData.length / rawData.length) * 100 : 0}%` }}></div>
            </div>
            <p style={{ fontSize: '0.7rem', color: '#999', marginTop: '6px' }}>De un universo total de {rawData.length} registros</p>
          </div>
        </aside>

        {/* Dynamic Content Pane */}
        <main className="portal-content-pane">
          <AnimatePresence mode="wait">
            
            {/* Tab 1: Summary Panel */}
            {activeTab === 'summary' && (
              <motion.div key="summary" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="tab-pane-layout">
                {/* Metrics Indicator Bar */}
                <div className="metrics-summary-bar">
                  {(() => {
                    const yoyBilateral = getYoYStats('bilateral');
                    const yoyComplementaria = getYoYStats('complementaria');
                    const yoyMarcacion = getYoYStats('marcacion');
                    const yoyUnilateral = getYoYStats('unilateral');

                    return (
                      <>
                        <div className="metric-box glass-card border-blue" style={{ borderLeft: '6px solid #1a365d' }}>
                          <span className="m-label">MX. BILATERALES</span>
                          <h3 className="m-value">{stats.bilaterales.toLocaleString()}</h3>
                          <p className="m-desc">Tamizaje de mama</p>
                          <div className={`yoy-indicator ${yoyBilateral.trend}`} style={{ fontSize: '0.74rem', fontWeight: '800', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', color: yoyBilateral.trend === 'positive' ? '#2e7d32' : '#c62828' }}>
                            {yoyBilateral.text}
                          </div>
                        </div>

                        <div className="metric-box glass-card border-red" style={{ borderLeft: '6px solid #b91c1c' }}>
                          <span className="m-label">PROYECCIONES COMPLEMENTARIAS</span>
                          <h3 className="m-value">{stats.complementarias.toLocaleString()}</h3>
                          <p className="m-desc">Estudios detallados de mama</p>
                          <div className={`yoy-indicator ${yoyComplementaria.trend}`} style={{ fontSize: '0.74rem', fontWeight: '800', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', color: yoyComplementaria.trend === 'positive' ? '#2e7d32' : '#c62828' }}>
                            {yoyComplementaria.text}
                          </div>
                        </div>

                        <div className="metric-box glass-card border-purple" style={{ borderLeft: '6px solid #6b21a8' }}>
                          <span className="m-label">MARCACIONES</span>
                          <h3 className="m-value">{stats.marcaciones.toLocaleString()}</h3>
                          <p className="m-desc">Preoperatorias de lesión</p>
                          <div className={`yoy-indicator ${yoyMarcacion.trend}`} style={{ fontSize: '0.74rem', fontWeight: '800', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', color: yoyMarcacion.trend === 'positive' ? '#2e7d32' : '#c62828' }}>
                            {yoyMarcacion.text}
                          </div>
                        </div>

                        <div className="metric-box glass-card border-lightblue" style={{ borderLeft: '6px solid #0284c7' }}>
                          <span className="m-label">MX. UNILATERALES</span>
                          <h3 className="m-value">{stats.unilaterales.toLocaleString()}</h3>
                          <p className="m-desc">Procedimientos localizados</p>
                          <div className={`yoy-indicator ${yoyUnilateral.trend}`} style={{ fontSize: '0.74rem', fontWeight: '800', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', color: yoyUnilateral.trend === 'positive' ? '#2e7d32' : '#c62828' }}>
                            {yoyUnilateral.text}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Main Production Bar Chart */}
                <div className="glass-card chart-container">
                  <div className="chart-header">
                    <div>
                      <h2 className="c-title">Procedimientos Mamografías Hospital de Villarrica</h2>
                      <p className="c-subtitle">Distribución mensual de atenciones según tipo de procedimiento realizado</p>
                    </div>
                    <div className="chart-legend">
                      <div className="legend-item"><span className="legend-color" style={{ background: '#1a365d' }}></span> Mx. Bilateral</div>
                      <div className="legend-item"><span className="legend-color" style={{ background: '#b91c1c' }}></span> Complementaria</div>
                      <div className="legend-item"><span className="legend-color" style={{ background: '#0284c7' }}></span> Mx. Unilateral</div>
                      <div className="legend-item"><span className="legend-color" style={{ background: '#6b21a8' }}></span> Marcación</div>
                    </div>
                  </div>

                  {chartData.length === 0 ? (
                    <div className="empty-chart">Sin registros de atención con las fechas seleccionadas</div>
                  ) : (
                    <div className="chart-visual-wrapper-scrollable" style={{ overflowX: 'auto', width: '100%', position: 'relative' }}>
                      <div className="chart-visual-wrapper" style={{ minWidth: chartData.length > 10 ? `${chartData.length * 75}px` : '100%' }}>
                        {/* Grid Lines */}
                        <div className="chart-y-axis-lines">
                          {yAxisTicks.map((tick, i) => (
                            <div key={i} className="y-axis-tick-line">
                              <span className="y-tick-label">{tick}</span>
                              <div className="y-tick-line"></div>
                            </div>
                          ))}
                        </div>

                        {/* Bar Plot */}
                        <div className="chart-bars-viewport">
                          {chartData.map((month, idx) => {
                            // Percentages for stacks
                            const pBilateral = (month.bilaterales / maxChartVal) * 100;
                            const pComplementaria = (month.complementarias / maxChartVal) * 100;
                            const pUnilateral = (month.unilaterales / maxChartVal) * 100;
                            const pMarcacion = (month.marcaciones / maxChartVal) * 100;
                            const totalHeightPercent = ((month.total / maxChartVal) * 100);

                            return (
                              <div key={month.key} className="chart-bar-column">
                                <div className="chart-bar-hover-group">
                                  {/* Stacked Bar */}
                                  <div className="bar-stack-fill-box">
                                    {month.marcaciones > 0 && (
                                      <motion.div className="bar-part" initial={{ height: 0 }} animate={{ height: `${pMarcacion}%` }} style={{ background: '#6b21a8' }} title={`Marcaciones: ${month.marcaciones}`} />
                                    )}
                                    {month.unilaterales > 0 && (
                                      <motion.div className="bar-part" initial={{ height: 0 }} animate={{ height: `${pUnilateral}%` }} style={{ background: '#0284c7' }} title={`Unilaterales: ${month.unilaterales}`} />
                                    )}
                                    {month.complementarias > 0 && (
                                      <motion.div className="bar-part" initial={{ height: 0 }} animate={{ height: `${pComplementaria}%` }} style={{ background: '#b91c1c' }} title={`Proyecciones: ${month.complementarias}`} />
                                    )}
                                    {month.bilaterales > 0 && (
                                      <motion.div className="bar-part" initial={{ height: 0 }} animate={{ height: `${pBilateral}%` }} style={{ background: '#1a365d' }} title={`Bilaterales: ${month.bilaterales}`} />
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
                                    {month.total}
                                  </span>
                                  
                                  {/* Custom Tooltip Panel */}
                                  <div className="bar-hover-tooltip">
                                    <strong>{month.label}</strong>
                                    <div className="tooltip-divider" />
                                    <div className="t-row"><span className="t-dot" style={{ background: '#1a365d' }}></span> Mx. Bilaterales: <span>{month.bilaterales}</span></div>
                                    <div className="t-row"><span className="t-dot" style={{ background: '#b91c1c' }}></span> Proyecciones: <span>{month.complementarias}</span></div>
                                    <div className="t-row"><span className="t-dot" style={{ background: '#0284c7' }}></span> Mx. Unilaterales: <span>{month.unilaterales}</span></div>
                                    <div className="t-row"><span className="t-dot" style={{ background: '#6b21a8' }}></span> Marcaciones: <span>{month.marcaciones}</span></div>
                                    <div className="tooltip-divider" />
                                    <div className="t-row bold">Total Atendidos: <span>{month.total}</span></div>
                                  </div>
                                </div>
                                <span className="chart-x-label">{month.label.split(' ')[0]}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Secondary Cards: Age Grouping, BIRADS, and Attendance */}
                <div className="summary-bottom-row">
                  <div className="glass-card bottom-card">
                    <h3 className="bc-title"><Users size={18} /> Cumplimiento de Tamizaje de Edad</h3>
                    <div className="attendance-gauge">
                      <div className="gauge-val">{stats.avgAge} <span style={{ fontSize: '1rem', color: '#666' }}>años promedio</span></div>
                    </div>
                    <div className="bc-divider" />
                    <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '15px' }}>
                      Las políticas del Ministerio de Salud priorizan el tamizaje preventivo en mujeres de <strong>50 a 69 años</strong> para reducir mortalidad por cáncer de mama.
                    </p>
                    <div className="tamizaje-item">
                      <div className="t-info"><span>Tamizaje Objetivo (50 - 69 años)</span><span>{((filteredData.filter(d => d.grupoEdad === '50 a 69 años').length / (stats.total || 1)) * 100).toFixed(1)}%</span></div>
                      <div className="t-bar-bg"><div className="t-bar-fill" style={{ width: `${(filteredData.filter(d => d.grupoEdad === '50 a 69 años').length / (stats.total || 1)) * 100}%` }}></div></div>
                    </div>
                  </div>

                  <div className="glass-card bottom-card">
                    <h3 className="bc-title"><CheckCircle size={18} /> Efectividad de Asistencia</h3>
                    <div className="attendance-gauge">
                      <div className="gauge-val">{stats.presentPercent}% <span style={{ fontSize: '1rem', color: '#666' }}>de asistencia</span></div>
                    </div>
                    <div className="bc-divider" />
                    <div className="attendance-split">
                      <div className="split-side text-green">
                        <span>Asistieron</span>
                        <h4>{filteredData.filter(d => d.estadoAtencion === 'Se presentó').length} pacientes</h4>
                      </div>
                      <div className="split-divider" />
                      <div className="split-side text-red">
                        <span>No se presentaron (NSP)</span>
                        <h4>{stats.absentCount} pacientes</h4>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card bottom-card">
                    <h3 className="bc-title"><AlertCircle size={18} /> Control de Alertas Clínicas</h3>
                    <div className="alerts-status-box">
                      <div className="a-status-icon"><AlertCircle size={32} color="#fff" /></div>
                      <div>
                        <h4>{stats.biradsPendientes} Pendientes BIRADS</h4>
                        <p>Exámenes que requieren análisis e informe de resultado urgente en el centro médico.</p>
                      </div>
                    </div>
                    <div className="bc-divider" />
                    <div className="tamizaje-item">
                      <div className="t-info"><span>BIRADS Altamente Sospechosos (BIRADS 4/5)</span><span>{filteredData.filter(d => d.birads.includes('Birads - 4') || d.birads.includes('Birads - 5')).length} casos</span></div>
                    </div>
                  </div>
                </div>

                {/* Curve of Non-Attendance Trend (NSP %) */}
                <div id="nsp-trend-section" className="glass-card nsp-trend-card" style={{ marginTop: '24px', padding: '24px' }}>
                  <div className="chart-header" style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={20} style={{ color: '#b91c1c' }} />
                      <div>
                        <h2 className="c-title" style={{ fontSize: '1.1rem', fontWeight: 700 }}>Curva de Tendencia de Inasistencias (NSP %)</h2>
                        <p className="c-subtitle" style={{ fontSize: '0.8rem', color: '#64748b' }}>Porcentaje mensual de inasistencias en la red de derivación</p>
                      </div>
                    </div>
                  </div>
                  
                  {nspTrendData.length === 0 ? (
                    <div className="empty-chart" style={{ padding: '30px', textAlign: 'center', color: '#999' }}>Sin registros de inasistencias en este periodo</div>
                  ) : (
                    <div>
                      {/* SVG line chart */}
                      <div style={{ width: '100%', height: '180px', position: 'relative' }}>
                        <svg viewBox="0 0 1000 180" width="100%" height="100%" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                          {/* Grid horizontal guidelines */}
                          <line x1="0" y1="36" x2="1000" y2="36" stroke="#e2e8f0" strokeDasharray="4 4" />
                          <line x1="0" y1="90" x2="1000" y2="90" stroke="#e2e8f0" strokeDasharray="4 4" />
                          <line x1="0" y1="144" x2="1000" y2="144" stroke="#e2e8f0" strokeDasharray="4 4" />
                          
                          {/* Y-axis percentage labels */}
                          <text x="5" y="30" fill="#94a3b8" fontSize="10" fontWeight="600">80% NSP</text>
                          <text x="5" y="84" fill="#94a3b8" fontSize="10" fontWeight="600">50% NSP</text>
                          <text x="5" y="138" fill="#94a3b8" fontSize="10" fontWeight="600">20% NSP</text>

                          {/* Line and Area Path */}
                          {(() => {
                            const paddingX = 50;
                            const widthScale = 900 / Math.max(1, nspTrendData.length - 1);
                            const points = nspTrendData.map((d, i) => {
                              const x = paddingX + i * widthScale;
                              // Scale rate from 0-100% to height 180. 100% NSP is y=20, 0% NSP is y=160.
                              const y = 160 - (d.rate / 100) * 140;
                              return { x, y, label: d.label, rate: d.rate };
                            });

                            const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                            const areaPath = points.length > 0 
                              ? `${linePath} L ${points[points.length - 1].x} 160 L ${points[0].x} 160 Z`
                              : '';

                            return (
                              <>
                                {/* Area Gradient Fill */}
                                {areaPath && (
                                  <path d={areaPath} fill="url(#nspAreaGrad)" opacity="0.15" />
                                )}
                                
                                {/* Line Path */}
                                {linePath && (
                                  <path d={linePath} fill="none" stroke="#b91c1c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                )}

                                {/* Gradient Definition */}
                                <defs>
                                  <linearGradient id="nspAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#b91c1c" />
                                    <stop offset="100%" stopColor="#b91c1c" stopOpacity="0" />
                                  </linearGradient>
                                </defs>

                                {/* Data Circles and Value Labels */}
                                {points.map((p, i) => (
                                  <g key={i}>
                                    <circle cx={p.x} cy={p.y} r="5" fill="#b91c1c" stroke="#fff" strokeWidth="2" />
                                    <text x={p.x} y={p.y - 10} fill="#b91c1c" fontSize="10" fontWeight="700" textAnchor="middle">
                                      {p.rate.toFixed(1)}%
                                    </text>
                                    <text x={p.x} y="174" fill="#64748b" fontSize="9" fontWeight="600" textAnchor="middle">
                                      {p.label}
                                    </text>
                                  </g>
                                ))}
                              </>
                            );
                          })()}
                        </svg>
                      </div>
                      
                      {/* Grid for NSP Insights and Management Box */}
                      <div className="nsp-insights-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '24px' }}>
                        
                        {/* Left column: Dynamic NSP Metric Cards */}
                        <div className="nsp-metrics-col" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          
                          {/* Card 1: Hours Lost */}
                          <div className="nsp-insight-card" style={{ padding: '16px', background: 'rgba(185, 28, 28, 0.03)', border: '1px solid rgba(185, 28, 28, 0.08)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div className="insight-icon-circle" style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(185, 28, 28, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#b91c1c' }}>
                              <Clock size={20} style={{ margin: 'auto' }} />
                            </div>
                            <div>
                              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Horas Clínicas Perdidas</span>
                              <h4 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#b91c1c', margin: '2px 0 0 0' }}>
                                {nspInsights.totalHoursLost.toFixed(1)} <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b' }}>horas</span>
                              </h4>
                              <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '2px 0 0 0' }}>
                                Equivale a {nspInsights.totalNsp} citas de 30 min no aprovechadas
                              </p>
                            </div>
                          </div>

                          {/* Card 2: Worst Performing Center */}
                          <div className="nsp-insight-card" style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.02)', border: '1px solid rgba(15, 23, 42, 0.06)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div className="insight-icon-circle" style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#0f172a' }}>
                              <AlertCircle size={20} style={{ margin: 'auto' }} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Establecimiento Crítico</span>
                              <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0f172a', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={nspInsights.worstEstablishment}>
                                {nspInsights.worstEstablishment}
                              </h4>
                              <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '2px 0 0 0' }}>
                                Mayor pérdida con <strong>{nspInsights.worstHoursLost.toFixed(1)} hrs</strong> ({nspInsights.worstCount} inasistencias)
                              </p>
                            </div>
                          </div>

                        </div>

                        {/* Right column: Clinical Management Recommendations */}
                        <div className="nsp-management-col" style={{ display: 'flex', flexDirection: 'column' }}>
                          <div style={{ flex: 1, padding: '20px', background: 'rgba(185, 28, 28, 0.04)', border: '1px solid rgba(185, 28, 28, 0.12)', borderRadius: '12px', fontSize: '0.82rem', color: '#7f1d1d', lineHeight: '1.5' }}>
                            <strong style={{ fontSize: '0.88rem', display: 'block', marginBottom: '6px' }}>Análisis de Gestión Clínica:</strong>
                            El ausentismo representa una pérdida directa en la capacidad operativa del mamógrafo. En el período seleccionado, las inasistencias restaron <strong>{nspInsights.totalHoursLost.toFixed(1)} horas</strong> de atención especializada. El <strong>{nspInsights.worstEstablishment}</strong> se identifica como el centro de mayor ausentismo, con <strong>{nspInsights.worstHoursLost.toFixed(1)} horas perdidas</strong>.
                            <div style={{ margin: '8px 0 0 0', paddingLeft: '12px', borderLeft: '2px solid rgba(185, 28, 28, 0.3)', color: '#991b1b', fontStyle: 'italic' }}>
                              Se sugiere implementar un canal automatizado de recordatorios vía mensajería móvil 72 horas previas para contener la brecha de ausentismo detectada.
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Tab 2: Pivot Table Panel */}
            {activeTab === 'pivot' && (
              <motion.div key="pivot" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="glass-card pivot-card">
                <div className="pivot-header">
                  <div>
                    <h2 className="pivot-title">Programación de Pacientes según Establecimiento de Origen</h2>
                    <p className="pivot-subtitle">Frecuencias agrupadas por centros derivadores, rango etario y meses de atención</p>
                  </div>
                </div>

                <div className="pivot-table-wrapper">
                  <table className="pivot-table">
                    <thead>
                      <tr>
                        <th className="sticky-cell header-cell">Establecimiento</th>
                        {pivotData.columns.map(col => (
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
                      {pivotData.rows.length === 0 ? (
                        <tr>
                          <td colSpan={pivotData.columns.length + 2} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                            Sin datos disponibles para los filtros seleccionados
                          </td>
                        </tr>
                      ) : (
                        pivotData.rows.map(row => {
                          const isExpanded = !!expandedEstablishments[row.name];
                          
                          return (
                            <React.Fragment key={row.name}>
                              {/* Main Establishment Row */}
                              <tr className="main-row">
                                <td className="sticky-cell est-name-cell" onClick={() => toggleEstablishment(row.name)}>
                                  <span className="toggle-icon">{isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
                                  {row.name}
                                </td>
                                {pivotData.columns.map(col => {
                                  const val = row.months[col] || 0;
                                  // Map background color depending on patient volumes (Heatmap effect)
                                  const opacity = val > 0 ? Math.min(0.1 + (val / 300) * 0.7, 0.8) : 0;
                                  const bgStyle = val > 0 ? { background: `rgba(26, 54, 93, ${opacity})`, color: opacity > 0.4 ? 'white' : 'var(--text-dark)' } : {};

                                  return (
                                    <td key={col} className="data-cell" style={bgStyle}>
                                      {val > 0 ? val : '-'}
                                    </td>
                                  );
                                })}
                                <td className="row-total-cell" style={{ fontWeight: 800 }}>
                                  {row.total} <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>({((row.total / (grandTotal || 1)) * 100).toFixed(1)}%)</span>
                                </td>
                              </tr>

                              {/* Expanded Age Groups Sub-Rows */}
                              {isExpanded && (
                                <>
                                  <tr className="sub-row age-group-row">
                                    <td className="sticky-cell est-name-cell indent-1">50 a 69 años</td>
                                    {pivotData.columns.map(col => {
                                      const val = row.ageGroups["50 a 69 años"][col] || 0;
                                      return (
                                        <td key={col} className="data-cell sub-data-cell">
                                          {val > 0 ? val : '-'}
                                        </td>
                                      );
                                    })}
                                    <td className="row-total-cell sub-data-cell" style={{ fontWeight: 700 }}>
                                      {(() => {
                                        const sub = Object.values(row.ageGroups["50 a 69 años"]).reduce((a, b) => a + b, 0);
                                        return (
                                          <>
                                            {sub} <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500 }}>({((sub / (row.total || 1)) * 100).toFixed(1)}%)</span>
                                          </>
                                        );
                                      })()}
                                    </td>
                                  </tr>
                                  <tr className="sub-row age-group-row">
                                    <td className="sticky-cell est-name-cell indent-1">Otros rangos de edad</td>
                                    {pivotData.columns.map(col => {
                                      const val = row.ageGroups["Otros rangos de edad"][col] || 0;
                                      return (
                                        <td key={col} className="data-cell sub-data-cell">
                                          {val > 0 ? val : '-'}
                                        </td>
                                      );
                                    })}
                                    <td className="row-total-cell sub-data-cell" style={{ fontWeight: 700 }}>
                                      {(() => {
                                        const sub = Object.values(row.ageGroups["Otros rangos de edad"]).reduce((a, b) => a + b, 0);
                                        return (
                                          <>
                                            {sub} <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500 }}>({((sub / (row.total || 1)) * 100).toFixed(1)}%)</span>
                                          </>
                                        );
                                      })()}
                                    </td>
                                  </tr>
                                </>
                              )}
                            </React.Fragment>
                          );
                        })
                      )}
                    </tbody>
                    {/* Grand Totals Footer */}
                    {pivotData.rows.length > 0 && (
                      <tfoot>
                        <tr className="total-row">
                          <td className="sticky-cell est-name-cell">Total General</td>
                          {pivotData.columns.map(col => {
                            const sum = pivotData.rows.reduce((acc, row) => acc + (row.months[col] || 0), 0);
                            return (
                              <td key={col} className="total-cell">{sum}</td>
                            );
                          })}
                          <td className="grand-total-cell">
                            {pivotData.rows.reduce((acc, row) => acc + row.total, 0)}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </motion.div>
            )}

            {/* Tab 3: Projections and Quality Panel */}
            {activeTab === 'details' && (
              <motion.div key="details" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="tab-pane-layout">
                <div className="details-grid">
                  {/* Focalizaciones Panel */}
                  <div className="glass-card detail-sub-card">
                    <h3 className="bc-title"><PieChart size={18} /> Focalizaciones Especiales (CCD)</h3>
                    <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '20px' }}>Porcentaje de exámenes que requirieron focalización digital de la mama derecha o izquierda para aclarar hallazgos clínicos.</p>
                    
                    <div className="quality-chart-box">
                      <div className="custom-pie-chart">
                        <svg viewBox="0 0 100 100" width="100%" height="100%">
                          {/* Focalización Pie Chart representation */}
                          {(() => {
                            const selected = filteredData.filter(d => d.hasFocalizacion).length;
                            const total = stats.total || 1;
                            const pct = (selected / total) * 100;
                            const strokeDash = `${pct} ${100 - pct}`;
                            return (
                              <>
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f0f0f0" strokeWidth="15" />
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1a365d" strokeWidth="15" strokeDasharray={strokeDash} strokeDashoffset="25" transform="rotate(-90 50 50)" />
                                <text x="50" y="55" textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--text-dark)">{pct.toFixed(1)}%</text>
                              </>
                            );
                          })()}
                        </svg>
                      </div>
                      
                      <div className="quality-legend">
                        <div className="t-row"><span className="t-dot" style={{ background: '#1a365d' }}></span> Con Focalización: <strong>{filteredData.filter(d => d.hasFocalizacion).length} casos</strong></div>
                        <div className="t-row"><span className="t-dot" style={{ background: '#f0f0f0' }}></span> Sin Focalización: <strong>{filteredData.filter(d => !d.hasFocalizacion).length} casos</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* Magnificaciones Panel */}
                  <div className="glass-card detail-sub-card">
                    <h3 className="bc-title"><PieChart size={18} /> Magnificaciones Realizadas</h3>
                    <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '20px' }}>Pacientes sometidos a magnificación óptica para el análisis exhaustivo de microcalcificaciones o nódulos sospechosos.</p>
                    
                    <div className="quality-chart-box">
                      <div className="custom-pie-chart">
                        <svg viewBox="0 0 100 100" width="100%" height="100%">
                          {/* Magnificación Pie Chart representation */}
                          {(() => {
                            const selected = filteredData.filter(d => d.hasMagnificacion).length;
                            const total = stats.total || 1;
                            const pct = (selected / total) * 100;
                            const strokeDash = `${pct} ${100 - pct}`;
                            return (
                              <>
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f0f0f0" strokeWidth="15" />
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#b91c1c" strokeWidth="15" strokeDasharray={strokeDash} strokeDashoffset="25" transform="rotate(-90 50 50)" />
                                <text x="50" y="55" textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--text-dark)">{pct.toFixed(1)}%</text>
                              </>
                            );
                          })()}
                        </svg>
                      </div>
                      
                      <div className="quality-legend">
                        <div className="t-row"><span className="t-dot" style={{ background: '#b91c1c' }}></span> Con Magnificación: <strong>{filteredData.filter(d => d.hasMagnificacion).length} casos</strong></div>
                        <div className="t-row"><span className="t-dot" style={{ background: '#f0f0f0' }}></span> Sin Magnificación: <strong>{filteredData.filter(d => !d.hasMagnificacion).length} casos</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* Pertinencia Panel */}
                  <div className="glass-card detail-sub-card" style={{ gridColumn: 'span 2' }}>
                    <h3 className="bc-title"><TrendingUp size={18} /> Pertinencia clínica de derivaciones</h3>
                    <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '20px' }}>Evaluación sobre la justificación del examen según los protocolos de pertinencia vigentes.</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
                      <div>
                        <div className="tamizaje-item">
                          <div className="t-info"><span>Derivación Pertinente (Sí)</span><span>{((filteredData.filter(d => d.pertinencia === 'Sí').length / (stats.total || 1)) * 100).toFixed(1)}%</span></div>
                          <div className="t-bar-bg"><div className="t-bar-fill" style={{ width: `${(filteredData.filter(d => d.pertinencia === 'Sí').length / (stats.total || 1)) * 100}%` }}></div></div>
                        </div>
                        <div className="tamizaje-item" style={{ marginTop: '20px' }}>
                          <div className="t-info"><span>Derivación No Pertinente (No)</span><span>{((filteredData.filter(d => d.pertinencia === 'No').length / (stats.total || 1)) * 100).toFixed(1)}%</span></div>
                          <div className="t-bar-bg"><div className="t-bar-fill" style={{ width: `${(filteredData.filter(d => d.pertinencia === 'No').length / (stats.total || 1)) * 100}%`, background: '#e74c3c' }}></div></div>
                        </div>
                      </div>
                      
                      <div className="pertinencia-insights" style={{ background: 'rgba(0,0,0,0.02)', padding: '24px', borderRadius: '20px', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        <strong>Recomendaciones para Control de Gestión:</strong>
                        <ul style={{ paddingLeft: '20px', marginTop: '10px', color: '#555' }}>
                          <li>Un {((filteredData.filter(d => d.pertinencia === 'Sí').length / (stats.total || 1)) * 100).toFixed(1)}% de las solicitudes están debidamente protocolizadas.</li>
                          <li>Es prioritario capacitar a los médicos de los CESFAM con mayor tasa de solicitudes "no pertinentes" para maximizar el uso eficiente de las horas del ecógrafo y mamógrafo institucional.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 4: Results Severity Panel (Monitoreo de Resultados) */}
            {activeTab === 'results' && (
              <motion.div key="results" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="tab-pane-layout">
                {/* 1. Metric Badges */}
                <div className="metrics-summary-bar">
                  <div className="metric-box glass-card border-red" style={{ borderLeft: '6px solid #b91c1c' }}>
                    <span className="m-label" style={{ color: '#b91c1c' }}>🚨 CASOS CRÍTICOS SOSPECHOSOS</span>
                    <h3 className="m-value">{clinicalResults.biradsSospechosos}</h3>
                    <p className="m-desc">BIRADS 4 / 5 / 6 Detectados</p>
                  </div>
                  <div className="metric-box glass-card border-orange" style={{ borderLeft: '6px solid #ea580c' }}>
                    <span className="m-label" style={{ color: '#ea580c' }}>⏳ PENDIENTES DE RESULTADO</span>
                    <h3 className="m-value">{clinicalResults.biradsPendientes}</h3>
                    <p className="m-desc">Exámenes sin informe BIRADS</p>
                  </div>
                  <div className="metric-box glass-card border-purple" style={{ borderLeft: '6px solid #6b21a8' }}>
                    <span className="m-label" style={{ color: '#6b21a8' }}>🔍 EN SEGUIMIENTO CLÍNICO</span>
                    <h3 className="m-value">{clinicalResults.biradsSeguimiento}</h3>
                    <p className="m-desc">BIRADS 3 (Probablemente benigno)</p>
                  </div>
                  <div className="metric-box glass-card border-green" style={{ borderLeft: '6px solid #16a34a' }}>
                    <span className="m-label" style={{ color: '#16a34a' }}>✅ NORMALES / BENIGNOS</span>
                    <h3 className="m-value">{clinicalResults.biradsNormales}</h3>
                    <p className="m-desc">BIRADS 1 y BIRADS 2</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
                  {/* 2. Age Pyramid Panel */}
                  <div className="glass-card detail-sub-card" style={{ padding: '24px' }}>
                    <h3 className="bc-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={18} /> Pirámide de Casos Críticos por Edad</h3>
                    <p style={{ color: '#666', fontSize: '0.82rem', marginBottom: '20px' }}>Distribución por rangos etarios de pacientes con BIRADS de sospecha alta (BIRADS 4/5/6)</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                      {Object.entries(clinicalResults.agePyramid).map(([range, count]) => {
                        const totalCrit = Math.max(1, Object.values(clinicalResults.agePyramid).reduce((a,b)=>a+b, 0));
                        const pct = (count / totalCrit) * 100;
                        return (
                          <div key={range} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ width: '60px', fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>{range}</span>
                            <div style={{ flex: 1, height: '24px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: '#b91c1c', borderRadius: '6px', transition: 'width 0.5s' }} />
                              <span style={{ position: 'absolute', right: '10px', top: '3px', fontSize: '0.75rem', fontWeight: 700, color: pct > 30 ? '#fff' : '#475569' }}>{count} casos</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Geographical Distribution Panel */}
                  <div className="glass-card detail-sub-card" style={{ padding: '24px' }}>
                    <h3 className="bc-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Map size={18} /> Casos Críticos por Comuna</h3>
                    <p style={{ color: '#666', fontSize: '0.82rem', marginBottom: '20px' }}>Comunas de origen de las pacientes con hallazgos de alta sospecha de malignidad</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                      {clinicalResults.comunas.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#999', padding: '30px', fontSize: '0.85rem' }}>No hay casos críticos registrados en este periodo</div>
                      ) : (
                        clinicalResults.comunas.map(com => {
                          const maxCom = Math.max(1, clinicalResults.comunas[0]?.count || 1);
                          const pct = (com.count / maxCom) * 100;
                          return (
                            <div key={com.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ width: '100px', fontSize: '0.8rem', fontWeight: 600, color: '#334155', textTransform: 'capitalize' }}>{com.name}</span>
                              <div style={{ flex: 1, height: '24px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: '#0f172a', borderRadius: '6px', transition: 'width 0.5s' }} />
                                <span style={{ position: 'absolute', right: '10px', top: '3px', fontSize: '0.75rem', fontWeight: 700, color: pct > 30 ? '#fff' : '#475569' }}>{com.count} casos</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Protocol GES / Breast Cancer Referral Protocol */}
                <div className="glass-card" style={{ marginTop: '24px', padding: '24px', background: 'linear-gradient(to right, rgba(185, 28, 28, 0.05), rgba(30, 41, 59, 0.02))', borderLeft: '6px solid #b91c1c' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#991b1b', marginBottom: '8px' }}>Garantía Explícita en Salud (GES): Cáncer de Mama</h3>
                  <p style={{ fontSize: '0.86rem', color: '#334155', lineHeight: '1.6' }}>
                    Toda paciente con resultado de mamografía sospechosa (BIRADS 4 o 5) ingresa inmediatamente al protocolo del <strong>Programa Nacional de Cáncer de Mama (GES)</strong>. Este tablero estratégico ayuda al equipo de derivación a monitorear la oportunidad diagnóstica: el plazo máximo garantizado para la confirmación diagnóstica mediante biopsia es de <strong>30 días</strong> desde la sospecha fundada. La inmediatez en el análisis clínico y contacto de la paciente es fundamental para salvaguardar el pronóstico clínico.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Tab 5: REM Statistics Table (Secure, No Patient Identifiers) */}
            {activeTab === 'rem' && (
              <motion.div key="rem" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="glass-card" style={{ padding: '30px', borderRadius: '24px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                      <h3 className="pivot-title" style={{ color: '#0f172a', margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Resumen Estadístico Mensual (REM)</h3>
                      <p className="pivot-subtitle" style={{ color: '#64748b', marginTop: '4px', fontSize: '0.86rem' }}>
                        Consolidado de prestaciones de mamografías realizadas según previsión, procedencia clínica y operativos especiales.
                      </p>
                    </div>
                    <span className="live-status" style={{ background: 'rgba(26, 54, 93, 0.05)', color: 'var(--primary-accent)', fontSize: '0.74rem', fontWeight: 800, padding: '6px 14px', borderRadius: '12px', border: '1px solid rgba(26,54,93,0.1)' }}>
                      🔒 Datos Anónimos Públicos
                    </span>
                  </div>
                </div>

                <div className="pivot-table-wrapper" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.02)', overflowX: 'auto' }}>
                  <table className="pivot-table">
                    <thead>
                      <tr>
                        <th className="sticky-cell" style={{ textAlign: 'left', minWidth: '280px' }}>Tipo de Procedimiento Realizado</th>
                        <th>Beneficiarios (FONASA)</th>
                        <th>No Beneficiarios</th>
                        <th>Atención Cerrada</th>
                        <th>Atención Abierta</th>
                        <th>Urgencia</th>
                        <th style={{ background: 'rgba(107, 33, 168, 0.04)', color: '#6b21a8', fontWeight: 800 }}>Operativos</th>
                        <th style={{ background: 'var(--primary-accent-rgba, rgba(26, 54, 93, 0.04))', color: 'var(--primary-accent)', fontWeight: 800 }}>Total Realizado</th>
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
                            <td className="data-cell" style={{ fontWeight: 800, color: '#6b21a8', background: 'rgba(107, 33, 168, 0.02)' }}>
                              {row.operativos.toLocaleString()}
                            </td>
                            <td className="row-total-cell" style={{ fontWeight: 800, background: 'rgba(26, 54, 93, 0.02)' }}>
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
                          <td className="total-cell" style={{ fontWeight: 900, color: '#6b21a8', background: 'rgba(107, 33, 168, 0.04)' }}>
                            {remData.reduce((sum, r) => sum + r.operativos, 0).toLocaleString()}
                          </td>
                          <td className="grand-total-cell" style={{ fontWeight: 900, color: 'var(--primary-accent)', background: 'rgba(26, 54, 93, 0.05)' }}>
                            {remData.reduce((sum, r) => sum + r.total, 0).toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>

                {/* Operativos Highlights Card */}
                <div style={{ marginTop: '24px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <div className="glass-card border-glow-purple" style={{ padding: '20px', flex: 1, minWidth: '280px', display: 'flex', alignItems: 'center', gap: '18px', background: 'rgba(107, 33, 168, 0.02)', borderLeft: '4px solid #6b21a8', borderRadius: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(107, 33, 168, 0.1)', display: 'flex', alignItems: 'center', justifycontent: 'center', color: '#6b21a8', flexShrink: 0, paddingLeft: '12px' }}>
                      <Clock size={24} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#6b21a8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Contexto de Operativos Clínicos
                      </span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#475569', lineHeight: '1.4' }}>
                        Se identificaron <strong style={{ color: '#6b21a8', fontSize: '0.95rem', fontWeight: 900 }}>{remData.reduce((sum, r) => sum + r.operativos, 0).toLocaleString()} mamografías</strong> realizadas en el marco de operativos especiales de reducción de lista de espera en la red de Villarrica.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      <style jsx>{`
        .mammo-portal {
          padding: 0;
          font-family: 'Inter', sans-serif;
        }

        .portal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .circle-back-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 1px solid #e2e8f0;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-dark);
          transition: all 0.2s;
          box-shadow: 0 10px 20px rgba(0,0,0,0.03);
        }

        .circle-back-btn:hover {
          background: #f7fafc;
          transform: translateX(-3px);
        }

        .header-badges {
          display: flex;
          gap: 10px;
          margin-bottom: 8px;
        }

        .live-status {
          background: rgba(76, 175, 80, 0.1);
          color: #2e7d32;
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
          background: #4caf50;
          border-radius: 50%;
          animation: pulse-ring 1.8s infinite;
        }

        @keyframes pulse-ring {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(76, 175, 80, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
        }

        .api-badge {
          background: #f1f5f9;
          color: #475569;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 20px;
          text-transform: uppercase;
        }

        .update-badge {
          background: rgba(26, 54, 93, 0.08);
          color: var(--primary-accent);
          font-size: 0.72rem;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 6px;
          text-transform: uppercase;
        }

        .portal-title {
          font-size: 2.5rem;
          font-weight: 900;
          letter-spacing: -1px;
          line-height: 1.1;
        }

        .portal-subtitle {
          color: #64748b;
          font-size: 0.95rem;
          margin-top: 4px;
        }

        .header-action-group {
          display: flex;
          gap: 12px;
        }

        .h-action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 14px;
          font-weight: 700;
          border: 1px solid #e2e8f0;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
        }

        .h-action-btn.primary {
          background: var(--primary-accent);
          color: white;
          border-color: var(--primary-accent);
        }

        .h-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-soft);
        }

        .portal-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 40px;
          border-bottom: 2px solid #e2e8f0;
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

        .portal-tab.active {
          color: var(--primary-accent);
          background: rgba(26, 54, 93, 0.05);
        }

        .portal-tab:hover {
          color: var(--text-dark);
          background: rgba(0,0,0,0.02);
        }

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

        .portal-sidebar {
          padding: 30px;
          border-radius: 24px;
        }

        .sidebar-section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          font-size: 1rem;
          color: var(--text-dark);
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
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          background: white;
          font-weight: 600;
          color: var(--text-dark);
          outline: none;
          transition: border 0.2s;
        }

        .filter-item select:focus {
          border-color: var(--primary-accent);
        }

        .sidebar-stats {
          margin-top: 30px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        }

        .sidebar-progress-bg {
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
        }

        .sidebar-progress-fill {
          height: 100%;
          background: var(--primary-accent);
          transition: width 0.6s ease-out;
        }

        .portal-content-pane {
          min-width: 0;
        }

        .tab-pane-layout {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .metrics-summary-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .metric-box {
          padding: 24px;
          border-radius: 20px;
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

        .chart-container {
          padding: 30px;
          border-radius: 32px;
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
          width: 40px;
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
          left: 40px;
          width: calc(100% - 40px);
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

        .bar-total-bubble {
          position: absolute;
          bottom: calc(var(--stack-height, 0) + 12px);
          background: white;
          border: 1px solid #e2e8f0;
          padding: 2px 6px;
          border-radius: 20px;
          font-size: 0.65rem;
          font-weight: 800;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .chart-bar-hover-group:hover .bar-total-bubble {
          opacity: 1;
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

        .summary-bottom-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .bottom-card {
          padding: 24px;
          border-radius: 24px;
        }

        .bc-title {
          font-size: 1.1rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bc-divider {
          height: 1px;
          background: #cbd5e1;
          margin: 16px 0;
          opacity: 0.5;
        }

        .attendance-gauge {
          padding: 15px 0;
          display: flex;
          align-items: center;
        }

        .gauge-val {
          font-size: 2.2rem;
          font-weight: 900;
          letter-spacing: -1px;
          color: var(--primary-accent);
        }

        .tamizaje-item {
          margin-top: 10px;
        }

        .t-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.82rem;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .t-bar-bg {
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .t-bar-fill {
          height: 100%;
          background: var(--primary-accent);
          border-radius: 4px;
        }

        .attendance-split {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .split-side {
          flex: 1;
        }

        .split-side span {
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .split-side h4 {
          font-size: 1.2rem;
          font-weight: 800;
          margin-top: 4px;
        }

        .split-divider {
          width: 1px;
          height: 40px;
          background: #e2e8f0;
          margin: 0 20px;
        }

        .text-green { color: #2e7d32; }
        .text-red { color: #c62828; }

        .alerts-status-box {
          display: flex;
          align-items: center;
          gap: 16px;
          background: #c62828;
          color: white;
          padding: 20px;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(198,40,40,0.15);
          margin-top: 16px;
        }

        .alerts-status-box h4 {
          font-size: 1.1rem;
          font-weight: 800;
        }

        .alerts-status-box p {
          font-size: 0.75rem;
          opacity: 0.8;
          margin-top: 4px;
          line-height: 1.4;
        }

        /* Tab 2: Pivot Table Styles */
        .pivot-card {
          padding: 40px;
          border-radius: 32px;
        }

        .pivot-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .pivot-title {
          font-size: 1.5rem;
          font-weight: 800;
        }

        .pivot-subtitle {
          color: #64748b;
          font-size: 0.85rem;
          margin-top: 4px;
        }

        .pivot-table-wrapper {
          overflow-x: auto;
          border: 1px solid #cbd5e1;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.02);
        }

        .pivot-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.82rem;
          text-align: left;
        }

        .pivot-table th {
          background: #f8fafc;
          padding: 14px 16px;
          font-weight: 800;
          color: #475569;
          border-bottom: 2px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          text-align: center;
          white-space: nowrap;
        }

        .pivot-table th.sticky-cell {
          text-align: left;
          position: sticky;
          left: 0;
          z-index: 10;
          background: #f8fafc;
          border-right: 2px solid #cbd5e1;
        }

        .pivot-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          text-align: center;
          font-weight: 600;
        }

        .pivot-table td.sticky-cell {
          text-align: left;
          position: sticky;
          left: 0;
          background: white;
          z-index: 10;
          border-right: 2px solid #cbd5e1;
          cursor: pointer;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pivot-table tr.main-row:hover td {
          background: #f1f5f9 !important;
        }

        .pivot-table td.est-name-cell {
          white-space: nowrap;
        }

        .toggle-icon {
          display: inline-flex;
          align-items: center;
          color: #94a3b8;
        }

        .data-cell {
          transition: all 0.2s;
        }

        .row-total-cell {
          background: #f8fafc;
          font-weight: 800;
          color: var(--text-dark);
        }

        /* Expanded Sub Row */
        .sub-row {
          background: rgba(248, 250, 252, 0.4);
        }

        .sub-row td {
          padding: 8px 16px;
          font-size: 0.78rem;
          color: #64748b;
        }

        .sub-row td.sticky-cell {
          background: rgba(248, 250, 252, 0.95);
        }

        .indent-1 {
          padding-left: 36px !important;
        }

        .total-row {
          background: #f1f5f9;
          font-weight: 900;
        }

        .total-row td {
          padding: 14px 16px;
          border-top: 2px solid #cbd5e1;
          color: var(--text-dark);
          font-weight: 800;
        }

        .total-row td.sticky-cell {
          background: #f1f5f9;
          font-weight: 900;
        }

        .grand-total-cell {
          background: #e2e8f0;
          font-weight: 900;
          font-size: 0.9rem;
        }

        /* Tab 3: Details Pane */
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        @media (max-width: 768px) {
          .details-grid {
            grid-template-columns: 1fr;
          }
        }

        .detail-sub-card {
          padding: 30px;
          border-radius: 24px;
        }

        .quality-chart-box {
          display: flex;
          align-items: center;
          gap: 40px;
          margin-top: 20px;
        }

        .custom-pie-chart {
          width: 140px;
          height: 140px;
        }

        .quality-legend {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }

        /* Grid View and Pagination */
        .table-pagination-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }

        .table-pagination-nav button {
          padding: 10px 20px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: white;
          font-weight: 700;
          cursor: pointer;
        }

        .table-pagination-nav button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        @keyframes highlight-pulse {
          0% { box-shadow: 0 0 0 0 rgba(185, 28, 28, 0.4); border-color: rgba(185, 28, 28, 0.8); }
          70% { box-shadow: 0 0 0 20px rgba(185, 28, 28, 0); border-color: rgba(185, 28, 28, 0.2); }
          100% { box-shadow: 0 0 0 0 rgba(185, 28, 28, 0); border-color: transparent; }
        }
        .search-highlight-pulse {
          animation: highlight-pulse 1.5s ease-out 2;
          border: 2px solid #b91c1c !important;
          background: rgba(185, 28, 28, 0.02) !important;
          scroll-margin-top: 100px;
        }
      `}</style>
    </div>
  );
}
