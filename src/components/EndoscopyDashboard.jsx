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
  Settings,
  Sparkles
} from 'lucide-react';

export default function EndoscopyDashboard({ onBack, initialTab = 'summary', initialFilterNsp = false }) {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab === 'patients' ? 'rem' : initialTab); // 'summary', 'pivot', 'classification', 'rem'
  const [lastUpdated, setLastUpdated] = useState('Nunca');
  const [currentPage, setCurrentPage] = useState(1);
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
  
  // Pagination for REM rows
  const [remPage, setRemPage] = useState(1);
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

  // Load REDCap Endoscopy Data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const response = await fetch('/data/endoscopy_cached.json');
        if (!response.ok) {
          throw new Error('No se pudo cargar el caché de procedimientos endoscópicos de REDCap.');
        }
        const data = await response.json();
        
        // Parse dates and clean numbers
        const cleaned = data.records.map((r, idx) => {
          let examsCount = 0;
          const examsList = [];
          
          // Loop through all 7 description columns to count all exams in this single visit
          for (let i = 1; i <= 7; i++) {
            const key = i === 1 ? 'descripci_n_del_ex_men' : (i <= 3 ? `descripci_n_del_ex_men_${i}` : `examen${i}`);
            if (r[key] && r[key].toString().trim() !== '') {
              examsCount++;
              examsList.push(r[key].toString().trim());
            }
          }

          return {
            ...r,
            id: r.record_id || String(idx),
            edad: parseInt(r.edad_en_a_os, 10) || 0,
            fecha: r.fecha_de_atenci_n || 'Sin Fecha',
            estadoAtencion: r.estado_de_atenci_n || 'Se presentó',
            biopsia: r.biopsia || 'No',
            testUreasa: r.test_de_ureasa || 'No',
            resultadoTest: r.resultado_del_test || 'Pendiente',
            complicaciones: r.complicaciones_en_el_exame || 'Ninguna',
            catbiopsia: r.catbiopsia || 'Otros',
            diagnostico: r.diagnostico_posterior_al_e || '',
            prevision: (r.bdup_prevision || 'SIN PREVISION').trim(),
            sexo: r.bdup_sexo || 'FEMENINO',
            medico: r.funcionario_que_atiende || 'No Informado',
            examsCount,
            examsList
          };
        });
        
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
        const id = String(r.record_id || '').toLowerCase();
        const diag = (r.diagnostico || '').toLowerCase();
        const hasExamMatch = r.examsList.some(exam => exam.toLowerCase().includes(query));
        
        if (!cc.includes(query) && !id.includes(query) && !diag.includes(query) && !hasExamMatch) {
          return false;
        }
      }

      return true;
    });
  }, [rawData, startDate, endDate, selectedEstablecimiento, selectedFuncionario, selectedEstadoAtencion, selectedRangoEdad, selectedProcedencia, searchQuery]);

  // KPIs & Calculations
  const stats = useMemo(() => {
    const total = filteredData.length;
    let totalExams = 0;
    let presentCount = 0;
    let absentCount = 0;
    let biopsyCount = 0;
    let ureasaCount = 0;
    let ureasaPositive = 0;
    let ureasaNegative = 0;
    let biopsyMalignant = 0;
    let biopsyBenign = 0;
    let complicationCount = 0;
    let sumAge = 0;

    filteredData.forEach(r => {
      totalExams += r.examsCount;
      if (r.estadoAtencion === 'Se presentó') {
        presentCount++;
        if (r.biopsia === 'Sí') {
          biopsyCount++;
          if (r.catbiopsia === 'Maligna') biopsyMalignant++;
          else if (r.catbiopsia === 'Benigna') biopsyBenign++;
        }
        if (r.testUreasa === 'Sí') {
          ureasaCount++;
          if (r.resultadoTest === 'Positivo') ureasaPositive++;
          else if (r.resultadoTest === 'Negativo') ureasaNegative++;
        }
        if (r.complicaciones && r.complicaciones !== 'Ninguna') {
          complicationCount++;
        }
      } else {
        absentCount++;
      }
      
      sumAge += r.edad;
    });

    const presentPercent = total > 0 ? ((presentCount / total) * 100).toFixed(1) : '0.0';
    const nspPercent = total > 0 ? ((absentCount / total) * 100).toFixed(1) : '0.0';
    const avgAge = total > 0 ? (sumAge / total).toFixed(1) : '0.0';

    const biopsyRate = presentCount > 0 ? ((biopsyCount / presentCount) * 100).toFixed(1) : '0.0';
    const ureasaRate = presentCount > 0 ? ((ureasaCount / presentCount) * 100).toFixed(1) : '0.0';
    const ureasaPositiveRate = ureasaCount > 0 ? ((ureasaPositive / ureasaCount) * 100).toFixed(1) : '0.0';
    const biopsyMalignantRate = biopsyCount > 0 ? ((biopsyMalignant / biopsyCount) * 100).toFixed(1) : '0.0';

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
      totalExams,
      presentCount,
      absentCount,
      biopsyCount,
      ureasaCount,
      ureasaPositive,
      ureasaNegative,
      biopsyMalignant,
      biopsyBenign,
      complicationCount,
      presentPercent,
      nspPercent,
      avgAge,
      biopsyRate,
      ureasaRate,
      ureasaPositiveRate,
      biopsyMalignantRate,
      worstEstablishment,
      worstCount
    };
  }, [filteredData]);

  // YoY calculation helper
  const getYoYStats = (key) => {
    let currentCount = 0;
    filteredData.forEach(r => {
      if (key === 'total') currentCount++;
      if (key === 'real' && r.estadoAtencion === 'Se presentó') currentCount++;
      if (key === 'biopsy' && r.estadoAtencion === 'Se presentó' && r.biopsia === 'Sí') currentCount++;
      if (key === 'ureasa' && r.estadoAtencion === 'Se presentó' && r.testUreasa === 'Sí') currentCount++;
    });

    const startYear = new Date(startDate).getFullYear();
    const endYear = new Date(endDate).getFullYear();
    const startMonth = new Date(startDate).getMonth();
    const endMonth = new Date(endDate).getMonth();
    const startDay = new Date(startDate).getDate();
    const endDay = new Date(endDate).getDate();

    const priorStart = new Date(startYear - 1, startMonth, startDay).toISOString().substring(0, 10);
    const priorEnd = new Date(endYear - 1, endMonth, endDay).toISOString().substring(0, 10);

    let priorCount = 0;
    rawData.forEach(r => {
      if (!r.fecha || r.fecha === 'Sin Fecha') return;
      if (selectedEstablecimiento !== 'Todas' && r.establecimiento_de_origen !== selectedEstablecimiento) return;
      if (selectedFuncionario !== 'Todas' && r.medico !== selectedFuncionario) return;
      if (selectedEstadoAtencion !== 'Todas' && r.estadoAtencion !== selectedEstadoAtencion) return;
      if (selectedProcedencia !== 'Todas' && r.procedencia_de_derivaci_n !== selectedProcedencia) return;

      if (r.fecha >= priorStart && r.fecha <= priorEnd) {
        if (key === 'total') priorCount++;
        if (key === 'real' && r.estadoAtencion === 'Se presentó') priorCount++;
        if (key === 'biopsy' && r.estadoAtencion === 'Se presentó' && r.biopsia === 'Sí') priorCount++;
        if (key === 'ureasa' && r.estadoAtencion === 'Se presentó' && r.testUreasa === 'Sí') priorCount++;
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

  // Monthly Curve Data (Area Chart)
  const monthlyChartData = useMemo(() => {
    const monthlyMap = {};
    filteredData.forEach(r => {
      if (r.fecha !== 'Sin Fecha') {
        const monthKey = r.fecha.substring(0, 7); // 'YYYY-MM'
        if (!monthlyMap[monthKey]) {
          monthlyMap[monthKey] = { key: monthKey, total: 0, exams: 0, present: 0, absent: 0 };
        }
        monthlyMap[monthKey].total += r.examsCount;
        monthlyMap[monthKey].exams += r.examsCount;
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
      
      const denominator = monthlyMap[key].present + monthlyMap[key].absent;
      const nspRate = denominator > 0 ? (monthlyMap[key].absent / denominator) * 100 : 0;
      
      return {
        key,
        label,
        total: monthlyMap[key].total,
        exams: monthlyMap[key].exams,
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

  // Pivot Table Matrix: Centre vs Month (Based on true Exams Production)
  const pivotMatrix = useMemo(() => {
    const establishmentsMap = {};
    const monthsSet = new Set();

    filteredData.forEach(r => {
      if (r.establecimiento_de_origen && r.fecha !== 'Sin Fecha' && r.examsCount > 0) {
        const monthKey = r.fecha.substring(0, 7);
        monthsSet.add(monthKey);

        if (!establishmentsMap[r.establecimiento_de_origen]) {
          establishmentsMap[r.establecimiento_de_origen] = {
            name: r.establecimiento_de_origen,
            totalExams: 0,
            months: {},
            categories: {}
          };
        }

        const est = establishmentsMap[r.establecimiento_de_origen];
        est.totalExams += r.examsCount;
        est.months[monthKey] = (est.months[monthKey] || 0) + r.examsCount;

        // Categorize each exam
        r.examsList.forEach(exam => {
          const p = exam.toLowerCase();
          let cat = 'Otros';
          if (p.includes('endoscopia digestiva alta') || p.includes('alta') || p.includes('gastroduodenoscop')) cat = 'Endoscopía Alta';
          else if (p.includes('colonoscop') || p.includes('sigmoidoscop') || p.includes('baja')) cat = 'Colonoscopía';
          else if (p.includes('cistoscop') || p.includes('uretrocistoscop') || p.includes('prostáti') || p.includes('vesical')) cat = 'Urología';
          
          est.categories[cat] = (est.categories[cat] || 0) + 1;
        });
      }
    });

    const sortedMonths = Array.from(monthsSet).sort();
    const sortedRows = Object.values(establishmentsMap).sort((a, b) => b.totalExams - a.totalExams);

    return {
      columns: sortedMonths,
      rows: sortedRows,
      grandTotal: sortedRows.reduce((sum, r) => sum + r.totalExams, 0)
    };
  }, [filteredData]);

  // Exam Classification & Frequency
  const examCategories = useMemo(() => {
    const counts = {
      high_endoscopy: { label: 'Endoscopías Digestivas Altas', count: 0, list: {} },
      colonoscopy: { label: 'Colonoscopías y Procedimientos Colon', count: 0, list: {} },
      urology: { label: 'Procedimientos Urológicos y Cistoscopías', count: 0, list: {} },
      others: { label: 'Otros Procedimientos Menores', count: 0, list: {} }
    };

    filteredData.forEach(r => {
      r.examsList.forEach(exam => {
        const p = exam.toLowerCase();
        let cat = 'others';

        if (p.includes('endoscopia digestiva alta') || p.includes('alta') || p.includes('gastroduodenoscop')) {
          cat = 'high_endoscopy';
        } else if (p.includes('colonoscop') || p.includes('sigmoidoscop') || p.includes('endoscopía digestiva baja') || p.includes('baja') || p.includes('polipectomía') || p.includes('mucosectomía') || p.includes('pólipo')) {
          cat = 'colonoscopy';
        } else if (p.includes('cistoscop') || p.includes('uretrocistoscop') || p.includes('prostáti') || p.includes('vesical') || p.includes('sonda vesical') || p.includes('uroflujometría')) {
          cat = 'urology';
        }

        counts[cat].count++;
        counts[cat].list[exam] = (counts[cat].list[exam] || 0) + 1;
      });
    });

    return counts;
  }, [filteredData]);

  // SECURE REM STATIC CALCULATION
  const remData = useMemo(() => {
    const isFonasa = (prev) => {
      if (!prev) return false;
      const p = prev.toLowerCase().trim();
      return p.includes('fonasa') || p === 'b' || p === 'fonsas' || p === 'c' || p === 'd' || p === 'a' || p === 'f';
    };

    const isConvenioOrNoInstitucional = (rec) => {
      const modal = String(rec.modalidad_de_atenci_n || '').toLowerCase();
      const cc = String(rec.centro_de_costo_perc || '').toLowerCase();
      return !modal.includes('institucional') || modal.includes('convenio') || cc.includes('631') || cc.includes('convenio');
    };

    const aggregation = {};

    filteredData.forEach(r => {
      // In clinical REM statistics, we register only performed (attended) procedures
      if (r.estadoAtencion !== 'Se presentó') return;

      r.examsList.forEach(exam => {
        if (!aggregation[exam]) {
          aggregation[exam] = {
            name: exam,
            beneficiarios: 0,
            noBeneficiarios: 0,
            atencionCerrada: 0,
            atencionAbierta: 0,
            urgencia: 0,
            convenios: 0,
            total: 0
          };
        }

        const item = aggregation[exam];
        item.total++;

        if (isFonasa(r.prevision)) {
          item.beneficiarios++;
        } else {
          item.noBeneficiarios++;
        }

        if (r.procedencia_de_derivaci_n === 'Atención Cerrada') {
          item.atencionCerrada++;
        } else if (r.procedencia_de_derivaci_n === 'Atención Abierta') {
          item.atencionAbierta++;
        } else if (r.procedencia_de_derivaci_n === 'Urgencia' || r.procedencia_de_derivaci_n === 'Emergencia') {
          item.urgencia++;
        }

        if (isConvenioOrNoInstitucional(r)) {
          item.convenios++;
        }
      });
    });

    return Object.values(aggregation).sort((a, b) => b.total - a.total);
  }, [filteredData]);

  // Paginated REM rows
  const paginatedRemData = useMemo(() => {
    const startIdx = (remPage - 1) * itemsPerPage;
    return remData.slice(startIdx, startIdx + itemsPerPage);
  }, [remData, remPage]);

  const totalRemPages = Math.ceil(remData.length / itemsPerPage) || 1;

  return (
    <div className="portal-content-pane animated fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button 
          onClick={onBack}
          style={{
            background: 'white',
            border: '1px solid rgba(0,0,0,0.06)',
            padding: '12px 24px',
            borderRadius: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 700,
            boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
          onMouseOut={(e) => e.currentTarget.style.background = 'white'}
        >
          <ArrowLeft size={18} /> Volver a Especialidades
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '6px 14px', borderRadius: '30px', fontSize: '0.78rem', fontWeight: 800 }}>
            <Database size={14} /> REDCAP INTEGRADO
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', padding: '6px 14px', borderRadius: '30px', fontSize: '0.78rem', fontWeight: 800 }}>
            API ARAUCANÍA SUR
          </div>
          <div style={{ background: '#f1f5f9', color: '#64748b', padding: '6px 14px', borderRadius: '30px', fontSize: '0.78rem', fontWeight: 800 }}>
            📅 Carga Semanal: {lastUpdated}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '50px' }}>
        <span style={{ color: '#8b5cf6', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>Área de Procedimientos Clínicos</span>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-1.5px', marginTop: '6px', color: '#0f172a' }}>Producción Endoscópica</h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: '8px' }}>Monitoreo integral de endoscopías, colonoscopías, cistoscopías y tomas de biopsia correspondientes al Hospital de Villarrica.</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '20px' }}>
          <div className="purple-spinner"></div>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748b' }}>Procesando {rawData.length || '...'} registros de REDCap...</span>
        </div>
      ) : error ? (
        <div style={{ background: '#fef2f2', border: '1px dashed #fca5a5', padding: '40px', borderRadius: '30px', textAlign: 'center', color: '#b91c1c' }}>
          <AlertTriangle size={48} style={{ margin: '0 auto 20px auto' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Error al inicializar base de datos</h3>
          <p style={{ marginTop: '8px', fontSize: '0.95rem' }}>{error}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: sidebarCollapsed ? 'auto 1fr' : '320px 1fr', gap: '40px', alignItems: 'start', transition: 'grid-template-columns 0.35s ease' }}>
          
          {/* Advanced Filtering Panel */}
          {sidebarCollapsed ? (
            <button
              onClick={() => setSidebarCollapsed(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '16px',
                borderRadius: '24px',
                background: 'white',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                cursor: 'pointer',
                color: '#8b5cf6',
                fontWeight: 700,
                fontSize: '0.88rem',
                transition: 'all 0.2s',
                width: 'fit-content'
              }}
              title="Expandir panel de filtros"
            >
              <Filter size={18} />
              <ChevronRight size={16} />
            </button>
          ) : (
            <div
              style={{
                background: 'white',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: '32px',
                padding: '30px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.03)',
                transition: 'all 0.35s ease',
                width: '320px',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1.5px solid rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Filter size={18} color="#8b5cf6" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Filtros Endoscopía</h3>
                </div>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '6px' }}
                  title="Colapsar filtros"
                >
                  <ChevronLeft size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Selección Temporal</label>
                  <select 
                    value={periodPreset} 
                    onChange={(e) => handlePeriodPresetChange(e.target.value)}
                    className="filter-select"
                  >
                    <option value="2025_2026">Años 2025 y 2026 (Predeterminado)</option>
                    <option value="2025">Sólo Año 2025</option>
                    <option value="2026">Sólo Año 2026</option>
                    <option value="historico">Histórico Completo</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Desde</label>
                    <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPeriodPreset('custom'); }} className="filter-input-date" />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Hasta</label>
                    <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPeriodPreset('custom'); }} className="filter-input-date" />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Médico Tratante</label>
                  <select 
                    value={selectedFuncionario} 
                    onChange={(e) => setSelectedFuncionario(e.target.value)}
                    className="filter-select"
                  >
                    <option value="Todas">Todos los facultativos ({uniqueDropdowns.funcionarios.length})</option>
                    {uniqueDropdowns.funcionarios.map(fn => <option key={fn} value={fn}>{fn}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Establecimiento Origen</label>
                  <select 
                    value={selectedEstablecimiento} 
                    onChange={(e) => setSelectedEstablecimiento(e.target.value)}
                    className="filter-select"
                  >
                    <option value="Todas">Todos los centros derivadores ({uniqueDropdowns.establecimientos.length})</option>
                    {uniqueDropdowns.establecimientos.map(est => <option key={est} value={est}>{est}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Estado Asistencial</label>
                  <select 
                    value={selectedEstadoAtencion} 
                    onChange={(e) => setSelectedEstadoAtencion(e.target.value)}
                    className="filter-select"
                  >
                    <option value="Todas">Todos los estados</option>
                    <option value="Se presentó">Se presentó (Atendido)</option>
                    <option value="No se presentó">No se presentó (NSP)</option>
                    <option value="No se atendió">No se atendió (Reagendado)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Rango de Edad</label>
                  <select 
                    value={selectedRangoEdad} 
                    onChange={(e) => setSelectedRangoEdad(e.target.value)}
                    className="filter-select"
                  >
                    <option value="Todas">Todas las edades</option>
                    <option value="Pediátrico (<15)">Pediátrico (&lt;15 años)</option>
                    <option value="Adulto (15-64)">Adulto (15-64 años)</option>
                    <option value="Adulto Mayor (>=65)">Adulto Mayor (&ge;65 años)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Procedencia</label>
                  <select 
                    value={selectedProcedencia} 
                    onChange={(e) => setSelectedProcedencia(e.target.value)}
                    className="filter-select"
                  >
                    <option value="Todas">Todas las procedencias</option>
                    {uniqueDropdowns.procedencias.map(pr => <option key={pr} value={pr}>{pr}</option>)}
                  </select>
                </div>

                <div style={{ marginTop: '10px', paddingTop: '16px', borderTop: '1.5px solid rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(139,92,246,0.05)', padding: '12px 16px', borderRadius: '14px', fontSize: '0.8rem', color: '#64748b', fontWeight: 600, border: '1px solid rgba(139,92,246,0.1)' }}>
                    <Users size={16} color="#8b5cf6" />
                    <span>Cohorte activa: <strong>{filteredData.length.toLocaleString('es-CL')}</strong> atenciones</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Interactive Portal Content Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Custom high fidelity tab buttons */}
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.02)', padding: '6px', borderRadius: '18px', border: '1px solid rgba(0,0,0,0.03)', width: 'fit-content' }}>
              {[
                { id: 'summary', label: 'Resumen de Capacidad', icon: <Activity size={16} /> },
                { id: 'pivot', label: 'Matriz de Derivaciones', icon: <Layers size={16} /> },
                { id: 'classification', label: 'Clasificación de Exámenes', icon: <Heart size={16} /> },
                { id: 'rem', label: 'Resumen Mensual (REM)', icon: <FileText size={16} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    borderRadius: '14px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    background: activeTab === tab.id ? 'white' : 'transparent',
                    color: activeTab === tab.id ? '#8b5cf6' : '#64748b',
                    boxShadow: activeTab === tab.id ? '0 10px 25px rgba(139,92,246,0.1)' : 'none'
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* TAB PANELS CONTAINER */}
            <div className="tab-pane-layout">
              
              {activeTab === 'summary' && (
                <>
                  {/* KPIs ROW WITH CUSTOM BORDERS & YoY TRENDS */}
                  <div className="metrics-summary-bar">
                    
                    <div className="metric-box glass-card border-purple">
                      <span className="m-label">TOTAL PROCEDIMIENTOS</span>
                      <span className="m-value">{stats.total.toLocaleString('es-CL')}</span>
                      <span className="m-desc">Atenciones agendadas</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '0.78rem', fontWeight: 800, color: getYoYStats('total').trend === 'positive' ? '#10b981' : '#ef4444' }}>
                        {getYoYStats('total').text}
                      </div>
                    </div>

                    <div className="metric-box glass-card border-violet">
                      <span className="m-label">PRODUCCIÓN REAL EXÁMENES</span>
                      <span className="m-value">{stats.presentCount.toLocaleString('es-CL')}</span>
                      <span className="m-desc">Asistieron a examen ({stats.presentPercent}%)</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '0.78rem', fontWeight: 800, color: getYoYStats('real').trend === 'positive' ? '#10b981' : '#ef4444' }}>
                        {getYoYStats('real').text}
                      </div>
                    </div>

                    <div className="metric-box glass-card border-pink">
                      <span className="m-label">BIOPSIAS TOMADAS</span>
                      <span className="m-value">{stats.biopsyCount.toLocaleString('es-CL')}</span>
                      <span className="m-desc">Tasa biopsias: {stats.biopsyRate}%</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '0.78rem', fontWeight: 800, color: getYoYStats('biopsy').trend === 'positive' ? '#10b981' : '#ef4444' }}>
                        {getYoYStats('biopsy').text}
                      </div>
                    </div>

                    <div className="metric-box glass-card border-emerald">
                      <span className="m-label">TEST UREASA (H. PYLORI)</span>
                      <span className="m-value">{stats.ureasaCount.toLocaleString('es-CL')}</span>
                      <span className="m-desc">Tasa test: {stats.ureasaRate}%</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '0.78rem', fontWeight: 800, color: getYoYStats('ureasa').trend === 'positive' ? '#10b981' : '#ef4444' }}>
                        {getYoYStats('ureasa').text}
                      </div>
                    </div>

                  </div>

                  {/* TREND CHART PANEL */}
                  <div className="chart-container glass-card">
                    <div className="chart-header">
                      <div>
                        <span className="c-title">Volumen de Producción Mensual y Tasa NSP</span>
                        <p className="c-subtitle">Comportamiento temporal de exámenes realizados y porcentaje de inasistencia (NSP) por mes.</p>
                      </div>
                      <div style={{ display: 'flex', gap: '20px' }}>
                        <div className="legend-item"><div className="legend-color" style={{ background: '#8b5cf6' }}></div> Exámenes Realizados</div>
                        <div className="legend-item"><div className="legend-color" style={{ background: '#fca5a5' }}></div> Tasa NSP (%)</div>
                      </div>
                    </div>

                    {monthlyChartData.length === 0 ? (
                      <div className="empty-chart">No hay suficientes datos temporales para el rango seleccionado.</div>
                    ) : (
                      <div style={{ height: '260px', display: 'flex', alignItems: 'end', gap: '12px', paddingBottom: '30px', borderBottom: '1px solid rgba(0,0,0,0.04)', position: 'relative' }}>
                        {monthlyChartData.map((d, idx) => {
                          const heightPct = `${(d.total / maxChartVal) * 80 + 10}%`;
                          return (
                            <div key={idx} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'end', alignItems: 'center', position: 'relative' }}>
                              
                              {/* Hover data popover */}
                              <div className="chart-tooltip" style={{ opacity: 0, position: 'absolute', bottom: '100%', background: 'var(--text-dark)', color: 'white', padding: '6px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, whiteSpace: 'nowrap', zIndex: 100 }}>
                                {d.total} Proc. ({d.nspRate.toFixed(1)}% NSP)
                              </div>

                              {/* Performance bar */}
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: heightPct }}
                                transition={{ delay: idx * 0.05, duration: 0.6 }}
                                style={{
                                  width: '100%',
                                  background: 'linear-gradient(180deg, #a855f7 0%, #8b5cf6 100%)',
                                  borderRadius: '8px 8px 0 0',
                                  position: 'relative',
                                  boxShadow: '0 4px 15px rgba(139,92,246,0.15)'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.filter = 'brightness(1.1)';
                                  e.currentTarget.previousSibling.style.opacity = 1;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.filter = 'none';
                                  e.currentTarget.previousSibling.style.opacity = 0;
                                }}
                              />

                              {/* NSP indicator line dots */}
                              <div style={{
                                width: '8px',
                                height: '8px',
                                background: '#ef4444',
                                borderRadius: '50%',
                                border: '2px solid white',
                                position: 'absolute',
                                bottom: `${d.nspRate}%`,
                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                zIndex: 10
                              }} />

                              {/* Label */}
                              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', marginTop: '12px', whiteSpace: 'nowrap', position: 'absolute', top: '100%' }}>{d.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* TWO-COLUMN LOWER DATA INSIGHTS */}
                  <div className="summary-bottom-row">
                    
                    <div className="bottom-card glass-card">
                      <span className="bc-title">Perfil Operacional Clínico</span>
                      
                      <div className="attendance-gauge">
                        <span className="gauge-val" style={{ color: '#10b981' }}>{stats.presentPercent}%</span>
                        <p style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', marginTop: '4px' }}>TASA DE ASISTENCIA GLOBAL</p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        
                        <div className="tamizaje-item">
                          <div className="t-info">
                            <span>Test de Ureasa H. Pylori (+)</span>
                            <span style={{ color: '#ef4444' }}>{stats.ureasaPositiveRate}%</span>
                          </div>
                          <div className="t-bar-bg">
                            <div className="t-bar-fill" style={{ width: `${stats.ureasaPositiveRate}%`, background: '#ef4444' }}></div>
                          </div>
                        </div>

                        <div className="tamizaje-item">
                          <div className="t-info">
                            <span>Biopsias Oncológicas Malignas</span>
                            <span style={{ color: '#d97706' }}>{stats.biopsyMalignantRate}%</span>
                          </div>
                          <div className="t-bar-bg">
                            <div className="t-bar-fill" style={{ width: `${stats.biopsyMalignantRate}%`, background: '#d97706' }}></div>
                          </div>
                        </div>

                        <div className="tamizaje-item">
                          <div className="t-info">
                            <span>Tasa de Complicaciones</span>
                            <span style={{ color: '#6b7280' }}>{((stats.complicationCount / (stats.presentCount || 1)) * 100).toFixed(2)}%</span>
                          </div>
                          <div className="t-bar-bg">
                            <div className="t-bar-fill" style={{ width: `${(stats.complicationCount / (stats.presentCount || 1)) * 100}%`, background: '#6b7280' }}></div>
                          </div>
                        </div>

                      </div>
                    </div>

                    <div className="bottom-card glass-card">
                      <span className="bc-title">Alerta de Ausentismo (Críticos NSP)</span>
                      
                      <div className="attendance-gauge">
                        <span className="gauge-val" style={{ color: '#ef4444' }}>{stats.nspPercent}%</span>
                        <p style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', marginTop: '4px' }}>TASA NSP TOTAL DEL PERIODO</p>
                      </div>

                      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '20px', padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <AlertTriangle size={24} color="#d97706" style={{ flexShrink: 0 }} />
                        <div style={{ fontSize: '0.8rem', color: '#b45309', lineHeight: '1.4' }}>
                          Establecimiento con mayor NSP: <br />
                          <strong>{stats.worstEstablishment}</strong> ({stats.worstCount} inasistencias).
                        </div>
                      </div>

                      <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: '1.6', marginTop: '16px' }}>
                        Las inasistencias (NSP) reducen la eficiencia en pabellón de procedimientos. Se aconseja activar recordatorios automáticos 48 horas antes de la citación para pacientes derivados de centros críticos.
                      </p>
                    </div>

                  </div>

                </>
              )}

              {activeTab === 'pivot' && (
                <div className="pivot-card glass-card">
                  <div className="pivot-header">
                    <span className="pivot-title">Matriz de Derivación: Centro Origen vs Mes de Atención</span>
                    <p className="pivot-subtitle">Muestra la cantidad total de procedimientos endoscópicos realizados distribuidos por mes.</p>
                  </div>

                  <div className="pivot-table-wrapper">
                    <table className="pivot-table">
                      <thead>
                        <tr>
                          <th className="sticky-cell">Centro de Origen</th>
                          {pivotMatrix.columns.map(col => <th key={col}>{col}</th>)}
                          <th style={{ background: 'rgba(139,92,246,0.05)', color: '#8b5cf6' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pivotMatrix.rows.map(row => {
                          const isExpanded = expandedEstablishments[row.name];
                          return (
                            <React.Fragment key={row.name}>
                              <tr className="main-row">
                                <td 
                                  className="sticky-cell" 
                                  onClick={() => setExpandedEstablishments({ ...expandedEstablishments, [row.name]: !isExpanded })}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <ChevronRight size={14} style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: '0.2s', color: '#8b5cf6' }} />
                                    {row.name}
                                  </div>
                                </td>
                                {pivotMatrix.columns.map(col => (
                                  <td key={col} className="data-cell">{row.months[col] || '-'}</td>
                                ))}
                                <td className="grand-total-cell">{row.totalExams}</td>
                              </tr>
                              
                              {/* Sub-row detailing procedure category distribution */}
                              {isExpanded && (
                                <tr className="sub-row">
                                  <td className="sticky-cell" style={{ paddingLeft: '32px', fontSize: '0.78rem', color: '#64748b' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                      {Object.entries(row.categories).map(([cat, cnt]) => (
                                        <div key={cat}>• {cat}: <strong>{cnt}</strong> exam.</div>
                                      ))}
                                    </div>
                                  </td>
                                  <td colSpan={pivotMatrix.columns.length + 1} style={{ fontSize: '0.78rem', color: '#64748b', textAlign: 'left', fontStyle: 'italic', padding: '12px 16px' }}>
                                    Desglose de producción realizado en la red. Expansión categorizada de especialidades endoscópicas.
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                        <tr className="total-row">
                          <td className="sticky-cell">Total General</td>
                          {pivotMatrix.columns.map(col => {
                            const sum = pivotMatrix.rows.reduce((s, r) => s + (r.months[col] || 0), 0);
                            return <td key={col} className="data-cell">{sum}</td>;
                          })}
                          <td className="grand-total-cell" style={{ background: '#8b5cf6', color: 'white' }}>{pivotMatrix.grandTotal}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'classification' && (
                <div className="details-grid">
                  
                  {/* Detailed procedures breakdown */}
                  <div className="detail-sub-card glass-card" style={{ padding: '30px', gridColumn: 'span 2' }}>
                    <div style={{ marginBottom: '24px' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>Desglose de Procedimientos de Especialidad</span>
                      <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>Volumen de producción clasificado por categorías clínicas de apoyo.</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                      {Object.entries(examCategories).map(([key, cat]) => (
                        <div key={key} style={{ padding: '20px', background: 'rgba(0,0,0,0.01)', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.02)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1a365d' }}>{cat.label}</span>
                            <span style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800 }}>
                              {cat.count} realizados
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {Object.entries(cat.list).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([exam, cnt]) => {
                              const pct = cat.count > 0 ? ((cnt / cat.count) * 100).toFixed(1) : 0;
                              return (
                                <div key={exam} style={{ fontSize: '0.78rem', color: '#475569' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: 600 }}>
                                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '80%' }}>{exam}</span>
                                    <span>{cnt} ({pct}%)</span>
                                  </div>
                                  <div className="t-bar-bg"><div className="t-bar-fill" style={{ width: `${pct}%`, background: '#8b5cf6' }}></div></div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right hand pathology columns */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    
                    {/* Oncology biopsy analysis */}
                    <div className="detail-sub-card glass-card" style={{ padding: '30px' }}>
                      <div style={{ marginBottom: '20px' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800 }}>Mapeo Oncológico (Biopsias)</span>
                        <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>Clasificación diagnóstica de las biopsias procesadas en el periodo.</p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                          { label: 'Biopsias Benignas', val: stats.biopsyBenign, color: '#10b981' },
                          { label: 'Biopsias Malignas (Cáncer)', val: stats.biopsyMalignant, color: '#ef4444' },
                          { label: 'Resultados Pendientes', val: stats.biopsyCount - stats.biopsyBenign - stats.biopsyMalignant, color: '#6b7280' }
                        ].map((b, idx) => {
                          const pct = stats.biopsyCount > 0 ? ((b.val / stats.biopsyCount) * 100).toFixed(1) : 0;
                          return (
                            <div key={idx} style={{ fontSize: '0.78rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '4px' }}>
                                <span>{b.label}</span>
                                <span style={{ color: b.color }}>{b.val} ({pct}%)</span>
                              </div>
                              <div className="t-bar-bg"><div className="t-bar-fill" style={{ width: `${pct}%`, background: b.color }}></div></div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* H. Pylori Infection Stats */}
                    <div className="detail-sub-card glass-card" style={{ padding: '30px' }}>
                      <div style={{ marginBottom: '20px' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800 }}>Helicobacter pylori (Ureasa)</span>
                        <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>Estudio epidemiológico de infecciones detectadas mediante test rápido de Ureasa.</p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                          { label: 'Test Ureasa Positivos', val: stats.ureasaPositive, color: '#ef4444' },
                          { label: 'Test Ureasa Negativos', val: stats.ureasaNegative, color: '#10b981' },
                          { label: 'Test Ureasa Pendientes', val: stats.ureasaCount - stats.ureasaPositive - stats.ureasaNegative, color: '#6b7280' }
                        ].map((u, idx) => {
                          const pct = stats.ureasaCount > 0 ? ((u.val / stats.ureasaCount) * 100).toFixed(1) : 0;
                          return (
                            <div key={idx} style={{ fontSize: '0.78rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '4px' }}>
                                <span>{u.label}</span>
                                <span style={{ color: u.color }}>{u.val} ({pct}%)</span>
                              </div>
                              <div className="t-bar-bg"><div className="t-bar-fill" style={{ width: `${pct}%`, background: u.color }}></div></div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {activeTab === 'rem' && (
                <div className="glass-card" style={{ padding: '30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                      <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>Resumen Estadístico Mensual (REM)</span>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                        Cruce y consolidación de prestaciones realizadas según previsión, derivación clínica y convenios.
                      </p>
                    </div>

                    <div className="smart-search-bar" style={{ maxWidth: '300px', margin: 0 }}>
                      <Search size={18} color="#999" />
                      <input 
                        placeholder="Filtrar por procedimiento..." 
                        value={searchQuery} 
                        onChange={(e) => { setSearchQuery(e.target.value); setRemPage(1); }} 
                        style={{ padding: '10px' }}
                      />
                    </div>
                  </div>

                  <div className="pivot-table-wrapper">
                    <table className="pivot-table">
                      <thead>
                        <tr>
                          <th className="sticky-cell" style={{ textAlign: 'left', minWidth: '280px' }}>Procedimiento Realizado</th>
                          <th>Beneficiarios (FONASA)</th>
                          <th>No Beneficiarios</th>
                          <th>Atención Cerrada</th>
                          <th>Atención Abierta</th>
                          <th>Urgencia / Emergencia</th>
                          <th style={{ background: 'rgba(168, 85, 247, 0.04)', color: '#a855f7', fontWeight: 800 }}>Convenios / No Inst.</th>
                          <th style={{ background: 'rgba(79, 70, 229, 0.04)', color: '#4f46e5', fontWeight: 800 }}>Total Realizado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedRemData.length === 0 ? (
                          <tr>
                            <td colSpan={8} style={{ textAlign: 'center', padding: '50px', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
                              No hay procedimientos realizados registrados para los filtros seleccionados.
                            </td>
                          </tr>
                        ) : (
                          paginatedRemData.map(row => (
                            <tr key={row.name} className="main-row">
                              <td className="sticky-cell est-name-cell" style={{ textAlign: 'left', fontWeight: 700, fontSize: '0.8rem', color: '#0f172a' }}>
                                🔬 {row.name}
                              </td>
                              <td className="data-cell">{row.beneficiarios.toLocaleString('es-CL')}</td>
                              <td className="data-cell">{row.noBeneficiarios.toLocaleString('es-CL')}</td>
                              <td className="data-cell">{row.atencionCerrada.toLocaleString('es-CL')}</td>
                              <td className="data-cell">{row.atencionAbierta.toLocaleString('es-CL')}</td>
                              <td className="data-cell">{row.urgencia.toLocaleString('es-CL')}</td>
                              <td className="data-cell" style={{ fontWeight: 800, color: '#a855f7', background: 'rgba(168, 85, 247, 0.02)' }}>
                                {row.convenios.toLocaleString('es-CL')}
                              </td>
                              <td className="row-total-cell" style={{ fontWeight: 800, background: 'rgba(79, 70, 229, 0.02)' }}>
                                {row.total.toLocaleString('es-CL')}
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
                              {remData.reduce((sum, r) => sum + r.beneficiarios, 0).toLocaleString('es-CL')}
                            </td>
                            <td className="total-cell" style={{ fontWeight: 800 }}>
                              {remData.reduce((sum, r) => sum + r.noBeneficiarios, 0).toLocaleString('es-CL')}
                            </td>
                            <td className="total-cell" style={{ fontWeight: 800 }}>
                              {remData.reduce((sum, r) => sum + r.atencionCerrada, 0).toLocaleString('es-CL')}
                            </td>
                            <td className="total-cell" style={{ fontWeight: 800 }}>
                              {remData.reduce((sum, r) => sum + r.atencionAbierta, 0).toLocaleString('es-CL')}
                            </td>
                            <td className="total-cell" style={{ fontWeight: 800 }}>
                              {remData.reduce((sum, r) => sum + r.urgencia, 0).toLocaleString('es-CL')}
                            </td>
                            <td className="total-cell" style={{ fontWeight: 900, color: '#a855f7', background: 'rgba(168, 85, 247, 0.04)' }}>
                              {remData.reduce((sum, r) => sum + r.convenios, 0).toLocaleString('es-CL')}
                            </td>
                            <td className="grand-total-cell" style={{ fontWeight: 900, color: '#4f46e5', background: 'rgba(79, 70, 229, 0.05)' }}>
                              {remData.reduce((sum, r) => sum + r.total, 0).toLocaleString('es-CL')}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>

                  <div className="table-pagination-nav">
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>
                      Mostrando página <strong>{remPage}</strong> de <strong>{totalRemPages}</strong> (<strong>{remData.length.toLocaleString('es-CL')}</strong> prestaciones encontradas)
                    </span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button disabled={remPage === 1} onClick={() => setRemPage(remPage - 1)}>Anterior</button>
                      <button disabled={remPage === totalRemPages} onClick={() => setRemPage(remPage + 1)}>Siguiente</button>
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* Embedded High Fidelity Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .border-purple { border-left: 6px solid #8b5cf6 !important; }
        .border-violet { border-left: 6px solid #a855f7 !important; }
        .border-pink { border-left: 6px solid #ec4899 !important; }
        .border-emerald { border-left: 6px solid #10b981 !important; }

        .filter-select, .filter-input-date {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          background: #ffffff;
          font-weight: 700;
          font-size: 0.8rem;
          color: #1e293b;
          outline: none;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }

        .filter-select:hover, .filter-input-date:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
        }

        .filter-select:focus, .filter-input-date:focus {
          border-color: #8b5cf6;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.12);
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 32px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.02);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s;
        }

        .glass-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 30px 60px rgba(139, 92, 246, 0.08);
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

        /* Chart Styling */
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
          border: 1.5px dashed rgba(168, 85, 247, 0.2);
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
          border-top: 2px solid rgba(168, 85, 247, 0.2);
        }

        .pivot-table td.grand-total-cell {
          background: rgba(168, 85, 247, 0.05) !important;
          font-family: 'SF Mono', Courier, monospace;
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

        .table-pagination-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1.5px solid rgba(168, 85, 247, 0.1);
        }

        .table-pagination-nav button {
          padding: 10px 20px;
          border-radius: 12px;
          border: 1px solid rgba(168, 85, 247, 0.2);
          background: white;
          font-weight: 700;
          color: #8b5cf6;
          cursor: pointer;
          transition: all 0.2s;
        }

        .table-pagination-nav button:hover:not(:disabled) {
          background: rgba(168, 85, 247, 0.05);
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.1);
        }

        .table-pagination-nav button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Spinner keyframe */
        .purple-spinner {
          border: 4px solid rgba(168, 85, 247, 0.1);
          border-top: 4px solid #8b5cf6;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
        }

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
