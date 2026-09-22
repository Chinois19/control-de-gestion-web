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
  ChevronRight,
  Target,
  Award,
  AlertCircle
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
  Legend,
  ReferenceLine,
  LabelList
} from 'recharts';
import * as XLSX from 'xlsx';

const COLOR_CATEGORIES = {
  'C1 - Resucitación': '#ef4444',
  'C2 - Emergencia': '#f97316',
  'C3 - Urgencia': '#eab308',
  'C4 - Urgencia Menor': '#3b82f6',
  'C5 - Sin Urgencia': '#10b981'
};

const COLOR_ESPECIALIDADES = {
  'MEDICO ADULTO Y NIÑO': '#2563eb',
  'MEDICO GINECO-OBSTETRA': '#ec4899',
  'MATRON(A)': '#8b5cf6',
  'SIN REGISTRO / NO ESPECIFICADO': '#94a3b8'
};

export default function EmergencyDashboard({ onBack }) {
  const [activeTab, setActiveTab] = useState('general'); // Por defecto 'general' (Estadísticas Generales primera que todos los tabs)
  const [loading, setLoading] = useState(true);
  const [generalData, setGeneralData] = useState({ records: [] });
  const [tiemposData, setTiemposData] = useState({ records: [] });
  const [lastUpdated, setLastUpdated] = useState('');

  // Filtros Globales (Tab General, Abandono, Demanda)
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('Todos');
  const [selectedCat, setSelectedCat] = useState('Todas');
  const [selectedPrevision, setSelectedPrevision] = useState('Todas');
  const [selectedSexo, setSelectedSexo] = useState('Todos');
  const [selectedTipoConsulta, setSelectedTipoConsulta] = useState('Todos');
  const [searchDiag, setSearchDiag] = useState('');

  // Filtros Específicos para TAB 2: ATENCIÓN & TIEMPOS DE ESPERA (META C2)
  const [atencionYear, setAtencionYear] = useState('2026');
  const [atencionMonth, setAtencionMonth] = useState('Todos');
  const [atencionCat, setAtencionCat] = useState('C2'); // Selector de Demanda (por defecto C2)
  const [atencionEspecialidad, setAtencionEspecialidad] = useState('MEDICO ADULTO Y NIÑO'); // Excluye Gineco/Obstetricia y Matronas por defecto
  const [atencionTipoEdad, setAtencionTipoEdad] = useState('Todos'); // 'Todos' | 'Adulto' | 'Infantil'
  const [atencionRango, setAtencionRango] = useState('Todos'); // Todos | Menor o igual a 30 minutos | Mayor a 30 Min.
  const [atencionSearchDau, setAtencionSearchDau] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);

    // 1. Cargar datos generales de urgencia
    const loadGeneral = async () => {
      try {
        const resGz = await fetch('data/urgencia_cached.json.gz?' + Date.now());
        if (resGz.ok && typeof DecompressionStream !== 'undefined') {
          const ds = new DecompressionStream('gzip');
          const decompressed = resGz.body.pipeThrough(ds);
          return await new Response(decompressed).json();
        }
      } catch (e) {}
      try {
        const res = await fetch('data/urgencia_cached.json?' + Date.now());
        if (res.ok) return await res.json();
      } catch (e) {}
      return { records: [] };
    };

    // 2. Cargar datos enriquecidos de tiempos y meta C2
    const loadTiempos = async () => {
      try {
        const resGz = await fetch('data/urgencia_tiempos_c2_cached.json.gz?' + Date.now());
        if (resGz.ok && typeof DecompressionStream !== 'undefined') {
          const ds = new DecompressionStream('gzip');
          const decompressed = resGz.body.pipeThrough(ds);
          return await new Response(decompressed).json();
        }
      } catch (e) {}
      try {
        const res = await fetch('data/urgencia_tiempos_c2_cached.json?' + Date.now());
        if (res.ok) return await res.json();
      } catch (e) {}
      return { records: [] };
    };

    try {
      const [genJson, tiemposJson] = await Promise.all([loadGeneral(), loadTiempos()]);
      setGeneralData(genJson);
      setTiemposData(tiemposJson);
      setLastUpdated(tiemposJson.lastUpdated ? new Date(tiemposJson.lastUpdated).toLocaleString() : (genJson.lastUpdated ? new Date(genJson.lastUpdated).toLocaleString() : ''));
    } catch (err) {
      console.error("Error al cargar datos de urgencia:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado de registros para pestañas generales (1, 3 y 4)
  const filteredRecords = useMemo(() => {
    if (!generalData.records) return [];
    return generalData.records.filter(r => {
      if (selectedYear !== 'Todos' && r.year !== parseInt(selectedYear, 10)) return false;
      if (selectedMonth !== 'Todos' && r.month !== parseInt(selectedMonth, 10)) return false;
      
      // Manejo flexible de categorización (ej: 'C3' o 'C3 - Urgencia')
      if (selectedCat !== 'Todas') {
        const rCat = (r.categorizacion || '').trim();
        const sCat = selectedCat.trim();
        const matchesCat = rCat === sCat || sCat.startsWith(rCat + ' ') || rCat.startsWith(sCat.split(' ')[0]);
        if (!matchesCat) return false;
      }

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
  }, [generalData.records, selectedYear, selectedMonth, selectedCat, selectedPrevision, selectedSexo, selectedTipoConsulta, searchDiag]);

  // KPIs Pestañas Generales
  const kpis = useMemo(() => {
    const total = filteredRecords.length;
    if (total === 0) {
      return { total: 0, atendidos: 0, abandonos: 0, tasaAbandono: '0.0', avgWait: 0 };
    }
    const abandonos = filteredRecords.filter(r => {
      const est = (r.estado_atencion || '').toUpperCase();
      return est.includes('ABANDONO') || est.includes('FUGA');
    }).length;
    const atendidos = total - abandonos;
    const tasaAbandono = ((abandonos / total) * 100).toFixed(1);
    const sumWait = filteredRecords.reduce((acc, curr) => acc + (curr.tiempo_espera_minutos || 0), 0);
    const avgWait = Math.round(sumWait / total);

    return { total, atendidos, abandonos, tasaAbandono, avgWait };
  }, [filteredRecords]);

  // Resumen mensual general
  const monthlyTrendData = useMemo(() => {
    const map = {};
    filteredRecords.forEach(r => {
      const monthKey = `${r.year}-${r.month < 10 ? '0' : ''}${r.month}`;
      if (!map[monthKey]) {
        map[monthKey] = { periodo: monthKey, total: 0, atendidos: 0, abandonos: 0, sumWait: 0 };
      }
      map[monthKey].total += 1;
      const est = (r.estado_atencion || '').toUpperCase();
      if (est.includes('ABANDONO') || est.includes('FUGA')) {
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


  // =========================================================================
  // TAB 2: CÁLCULOS EXCLUSIVOS META SANITARIA C2 Y TIEMPOS DE ESPERA
  // =========================================================================
  const filteredTiemposRecords = useMemo(() => {
    if (!tiemposData.records) return [];
    return tiemposData.records.filter(r => {
      if (atencionYear !== 'Todos' && r.year !== parseInt(atencionYear, 10)) return false;
      if (atencionMonth !== 'Todos' && r.month !== parseInt(atencionMonth, 10)) return false;
      if (atencionCat !== 'Todas' && r.selector_demanda !== atencionCat) return false;
      if (atencionEspecialidad !== 'Todas' && r.tipo_especialidad !== atencionEspecialidad) return false;
      
      // Filtro de Edad en formato Adulto / Infantil
      if (atencionTipoEdad !== 'Todos') {
        const isAdulto = r.tipo_consulta === 'ADULTO' || (r.edad !== null && r.edad >= 15);
        if (atencionTipoEdad === 'Adulto' && !isAdulto) return false;
        if (atencionTipoEdad === 'Infantil' && isAdulto) return false;
      }

      if (atencionRango !== 'Todos' && r.rango_espera !== atencionRango) return false;
      if (atencionSearchDau.trim() !== '') {
        const q = atencionSearchDau.trim().toLowerCase();
        const dau = String(r.dau || '').toLowerCase();
        if (!dau.includes(q)) return false;
      }
      return true;
    });
  }, [tiemposData.records, atencionYear, atencionMonth, atencionCat, atencionEspecialidad, atencionTipoEdad, atencionRango, atencionSearchDau]);

  // KPIs de la Meta C2
  const atencionKpis = useMemo(() => {
    const total = filteredTiemposRecords.length;
    if (total === 0) {
      return { total: 0, cumple: 0, fuera: 0, pctCumplimiento: '0.0', avgWait: 0, maxWait: 0, adultTotal: 0, adultPct: '0.0', infTotal: 0, infPct: '0.0' };
    }
    const cumple = filteredTiemposRecords.filter(r => r.cumple_meta_30m === true).length;
    const fuera = total - cumple;
    const pctCumplimiento = ((cumple / total) * 100).toFixed(1);
    const sumWait = filteredTiemposRecords.reduce((acc, curr) => acc + (curr.tiempo_espera_minutos || 0), 0);
    const avgWait = (sumWait / total).toFixed(1);
    const maxWait = Math.max(...filteredTiemposRecords.map(r => r.tiempo_espera_minutos || 0));

    // Adulto vs Infantil
    const adultRecs = filteredTiemposRecords.filter(r => r.tipo_consulta === 'ADULTO' || (r.edad !== null && r.edad >= 15));
    const adultCumple = adultRecs.filter(r => r.cumple_meta_30m).length;
    const adultPct = adultRecs.length > 0 ? ((adultCumple / adultRecs.length) * 100).toFixed(1) : '0.0';

    const infRecs = filteredTiemposRecords.filter(r => r.tipo_consulta === 'INFANTIL' || (r.edad !== null && r.edad < 15));
    const infCumple = infRecs.filter(r => r.cumple_meta_30m).length;
    const infPct = infRecs.length > 0 ? ((infCumple / infRecs.length) * 100).toFixed(1) : '0.0';

    return { 
      total, 
      cumple, 
      fuera, 
      pctCumplimiento, 
      avgWait, 
      maxWait,
      adultTotal: adultRecs.length,
      adultPct,
      infTotal: infRecs.length,
      infPct
    };
  }, [filteredTiemposRecords]);

  // Matriz / Tabla Pivote: Rangos de Tiempo en Filas y Meses en Columnas
  const atencionMonthlyPivot = useMemo(() => {
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    // Meses presentes en los datos filtrados (o del año seleccionado)
    const presentMonthsSet = new Set();
    filteredTiemposRecords.forEach(r => {
      if (r.month) presentMonthsSet.add(r.month);
    });
    
    let activeMonths = Array.from(presentMonthsSet).sort((a, b) => a - b);
    if (activeMonths.length === 0) {
      activeMonths = atencionYear === '2026' ? [1,2,3,4,5,6,7,8,9] : [1,2,3,4,5,6,7,8,9,10,11,12];
    }

    const monthTotals = {};
    activeMonths.forEach(m => {
      monthTotals[m] = {
        total: 0,
        cumple: 0,   // Menor o igual a 30 minutos
        fuera: 0,    // Mayor a 30 Min.
        sumWait: 0
      };
    });

    let granTotal = 0;
    let granCumple = 0;
    let granFuera = 0;

    filteredTiemposRecords.forEach(r => {
      if (!r.month || !monthTotals[r.month]) return;
      monthTotals[r.month].total++;
      granTotal++;
      if (r.cumple_meta_30m) {
        monthTotals[r.month].cumple++;
        granCumple++;
      } else {
        monthTotals[r.month].fuera++;
        granFuera++;
      }
      monthTotals[r.month].sumWait += (r.tiempo_espera_minutos || 0);
    });

    // Construcción de filas de la tabla
    const rowMenor30 = {
      label: '1) Menor o igual a 30 minutos',
      isMeta: true,
      months: activeMonths.map(m => {
        const item = monthTotals[m];
        const pct = item.total > 0 ? ((item.cumple / item.total) * 100).toFixed(1) : '0.0';
        return { month: m, count: item.cumple, pct: parseFloat(pct) };
      }),
      totalCount: granCumple,
      totalPct: granTotal > 0 ? parseFloat(((granCumple / granTotal) * 100).toFixed(1)) : 0
    };

    const rowMayor30 = {
      label: '2) Mayor a 30 Min.',
      isMeta: false,
      months: activeMonths.map(m => {
        const item = monthTotals[m];
        const pct = item.total > 0 ? ((item.fuera / item.total) * 100).toFixed(1) : '0.0';
        return { month: m, count: item.fuera, pct: parseFloat(pct) };
      }),
      totalCount: granFuera,
      totalPct: granTotal > 0 ? parseFloat(((granFuera / granTotal) * 100).toFixed(1)) : 0
    };

    const rowTotales = {
      label: 'Total General de Atenciones',
      isTotal: true,
      months: activeMonths.map(m => {
        const item = monthTotals[m];
        return { month: m, count: item.total, pct: 100 };
      }),
      totalCount: granTotal,
      totalPct: 100
    };

    const rowPctCumplimiento = {
      label: '% Cumplimiento Meta C2 (≤ 30 min)',
      isPctRow: true,
      months: activeMonths.map(m => {
        const item = monthTotals[m];
        const pct = item.total > 0 ? parseFloat(((item.cumple / item.total) * 100).toFixed(1)) : 0;
        return { month: m, count: item.cumple, pct };
      }),
      totalCount: granCumple,
      totalPct: granTotal > 0 ? parseFloat(((granCumple / granTotal) * 100).toFixed(1)) : 0
    };

    // Datos formateados para el gráfico de líneas mensual con etiquetas y meta >= 90%
    const chartData = activeMonths.map(m => {
      const item = monthTotals[m];
      const pct = item.total > 0 ? parseFloat(((item.cumple / item.total) * 100).toFixed(1)) : 0;
      const label = atencionYear !== 'Todos' ? `${monthNames[m - 1]}` : `${monthNames[m - 1]}`;
      return {
        month: m,
        mesLabel: label,
        total: item.total,
        cumple: item.cumple,
        fuera: item.fuera,
        pctCumple: pct,
        pctLabel: `${pct}%`,
        metaBase: 90
      };
    });

    return {
      activeMonths,
      monthNames,
      rows: [rowMenor30, rowMayor30, rowTotales, rowPctCumplimiento],
      chartData,
      granTotal,
      granCumple,
      granFuera,
      granPct: granTotal > 0 ? ((granCumple / granTotal) * 100).toFixed(1) : '0.0'
    };
  }, [filteredTiemposRecords, atencionYear]);

  // Exportar a Excel
  const handleExportExcel = () => {
    if (activeTab === 'atencion') {
      const exportData = filteredTiemposRecords.map(r => ({
        DAU: r.dau,
        'Año': r.year,
        'Mes': r.month,
        'Fecha Admisión': r.fecha_admision,
        'Fecha Toma Muestra (Triage)': r.fecha_toma_muestra,
        'Fecha y Hora Inicio Atención': r.fecha_inicio_atencion,
        'Fecha Cierre Final': r.fecha_cierre_final,
        'Resultado Protocolo Selector Demanda': r.selector_demanda,
        'Categorización Cierre': r.categorizacion_urgencia,
        'Tipo Especialidad': r.tipo_especialidad,
        'Tiempo Espera (min)': r.tiempo_espera_minutos,
        'Rango Tiempo Espera': r.rango_espera,
        'Cumple Meta (≤ 30 min)': r.cumple_meta_30m ? 'SÍ' : 'NO',
        'Edad': r.edad,
        'Sexo': r.sexo,
        'Previsión': r.prevision,
        'Destino Inmediato': r.destino_inmediato,
        'Espec Prof 1': r.esp_1,
        'Espec Prof 2': r.esp_2,
        'Espec Prof 3': r.esp_3
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Meta_C2_Tiempos_Espera");
      XLSX.writeFile(wb, `Meta_C2_Tiempos_Espera_Villarrica_${new Date().toISOString().split('T')[0]}.xlsx`);
      return;
    }

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
      'Tiempo Espera (min)': r.tiempo_espera_minutos
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
              Monitoreo analítico de demanda asistencial, tiempos de espera, clasificación Triage y cumplimiento de Metas Sanitarias.
              {lastUpdated && <span style={{ marginLeft: '12px', color: '#3b82f6', fontWeight: 600 }}>• Actualizado: {lastUpdated}</span>}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={fetchAllData} 
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
            { id: 'atencion', label: 'Atención & Tiempos de Espera (Meta C2)', icon: <Clock size={18} /> },
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
        {activeTab !== 'atencion' ? (
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
        ) : (
          /* FILTROS EXCLUSIVOS DE LA PESTAÑA ATENCIÓN & TIEMPOS DE ESPERA (META C2) */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px', background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Año Atención</label>
              <select value={atencionYear} onChange={e => setAtencionYear(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600, color: '#334155', background: 'white' }}>
                <option value="Todos">Todos los años</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Mes</label>
              <select value={atencionMonth} onChange={e => setAtencionMonth(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600, color: '#334155', background: 'white' }}>
                <option value="Todos">Todos los meses</option>
                {['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map((m, idx) => (
                  <option key={idx} value={idx + 1}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Protocolo Selector Demanda</label>
              <select value={atencionCat} onChange={e => setAtencionCat(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '2px solid #3b82f6', fontSize: '0.85rem', fontWeight: 800, color: '#1d4ed8', background: '#eff6ff' }}>
                <option value="C2">C2 (Emergencia - Meta)</option>
                <option value="Todas">Todas las categorías</option>
                <option value="C1">C1 (Resucitación)</option>
                <option value="C3">C3 (Urgencia)</option>
                <option value="C4">C4 (Urgencia Menor)</option>
                <option value="C5">C5 (No Urgente)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Tipo Especialidad</label>
              <select value={atencionEspecialidad} onChange={e => setAtencionEspecialidad(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600, color: '#334155', background: 'white' }}>
                <option value="MEDICO ADULTO Y NIÑO">MEDICO ADULTO Y NIÑO (Por Defecto)</option>
                <option value="Todas">Todas las especialidades (Incluye Matronas/Gineco)</option>
                <option value="MEDICO GINECO-OBSTETRA">MEDICO GINECO-OBSTETRA</option>
                <option value="MATRON(A)">MATRON(A)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Edad (Adulto / Infantil)</label>
              <select value={atencionTipoEdad} onChange={e => setAtencionTipoEdad(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600, color: '#334155', background: 'white' }}>
                <option value="Todos">Todos (Adultos e Infantiles)</option>
                <option value="Adulto">Adulto (≥ 15 años)</option>
                <option value="Infantil">Infantil (&lt; 15 años)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Rango de Tiempo de Espera</label>
              <select value={atencionRango} onChange={e => setAtencionRango(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600, color: '#334155', background: 'white' }}>
                <option value="Todos">Todos los rangos</option>
                <option value="Menor o igual a 30 minutos">1) Menor o igual a 30 minutos (Cumple)</option>
                <option value="Mayor a 30 Min.">2) Mayor a 30 Min. (Excedido)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Buscador DAU</label>
              <div style={{ position: 'relative' }}>
                <input 
                  placeholder="Número DAU..." 
                  value={atencionSearchDau}
                  onChange={e => setAtencionSearchDau(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px 9px 32px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600, color: '#334155', background: 'white' }}
                />
                <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards Banner (Para Pestañas 1, 3 y 4) */}
      {activeTab !== 'atencion' && (
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
      )}

      {/* Dynamic Tab Contents */}

      {/* TAB 1: ESTADÍSTICAS GENERALES DE ADMISIÓN */}
      {activeTab === 'general' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '28px' }}>
            <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 6px 24px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Distribución por Procedencia</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '20px' }}>Lugar de derivación o llegada del usuario</p>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={procedenciaData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                      {procedenciaData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 6px 24px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Pirámide Etaria y Sexo</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '20px' }}>Distribución de pacientes por tramo de edad y género</p>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={piramideEtariaData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="grupo" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Masculino" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Femenino" fill="#ec4899" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ATENCIÓN & TIEMPOS DE ESPERA (REHECHO COMPLETO - META SANITARIA C2) */}
      {/* ========================================================================= */}
      {activeTab === 'atencion' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Header Banner Informativo de la Meta Sanitaria */}
          <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)', borderRadius: '20px', padding: '24px 32px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 30px rgba(30, 58, 138, 0.2)' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '10px' }}>
                <Target size={14} color="#facc15" /> META SANITARIA MINSAL • ATENCIÓN DE URGENCIA
              </div>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
                Evaluación Tiempos de Espera Pacientes C2 (Selector de Demanda)
              </h2>
              <p style={{ margin: 0, fontSize: '0.86rem', opacity: 0.85, maxWidth: '880px' }}>
                Monitoreo del tiempo transcurrido entre la <strong>Fecha Toma Muestra 1 (Triage)</strong> y la <strong>Fecha y Hora de Inicio de Atención</strong>. Excluye por defecto pacientes gineco-obstétricos y atenciones de matronas (incluye <strong>Médico Adulto y Niño</strong>). Línea de base meta sanitaria: <strong>≥ 90%</strong> atendidos antes o a los 30 minutos.
              </p>
            </div>
            <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.1)', padding: '16px 24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800, opacity: 0.8 }}>Cumplimiento Global C2</span>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: parseFloat(atencionKpis.pctCumplimiento) >= 90 ? '#4ade80' : '#f87171' }}>
                {atencionKpis.pctCumplimiento}%
              </div>
              <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Línea Base Meta: ≥ 90.0%</span>
            </div>
          </div>

          {/* Tarjetas KPI Ejecutivas de la Meta C2 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
            <div style={{ background: 'white', padding: '22px', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Atenciones Filtradas</span>
                <Users size={18} color="#2563eb" />
              </div>
              <h3 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>{atencionKpis.total.toLocaleString()}</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>Selector Demanda: {atencionCat}</p>
            </div>

            <div style={{ background: 'white', padding: '22px', borderRadius: '18px', border: '1px solid #e2e8f0', borderLeft: '5px solid #10b981', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>≤ 30 Minutos (Cumplen)</span>
                <CheckCircle size={18} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#059669', margin: 0 }}>{atencionKpis.cumple.toLocaleString()}</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem', color: '#10b981', fontWeight: 700 }}>{atencionKpis.pctCumplimiento}% dentro de norma (Meta ≥ 90%)</p>
            </div>

            <div style={{ background: 'white', padding: '22px', borderRadius: '18px', border: '1px solid #e2e8f0', borderLeft: '5px solid #ef4444', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase' }}>&gt; 30 Minutos (Excedidos)</span>
                <AlertCircle size={18} color="#ef4444" />
              </div>
              <h3 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#dc2626', margin: 0 }}>{atencionKpis.fuera.toLocaleString()}</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem', color: '#ef4444', fontWeight: 700 }}>
                {atencionKpis.total > 0 ? ((atencionKpis.fuera / atencionKpis.total) * 100).toFixed(1) : 0}% fuera del estándar
              </p>
            </div>

            <div style={{ background: 'white', padding: '22px', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Tiempo Promedio Espera</span>
                <Clock size={18} color="#f59e0b" />
              </div>
              <h3 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>{atencionKpis.avgWait} <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>min</span></h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>Espera máxima observada: {atencionKpis.maxWait} min</p>
            </div>
          </div>

          {/* INSIGHTS EJECUTIVOS DESTACADOS */}
          <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '24px 28px', boxShadow: '0 4px 16px rgba(16, 185, 129, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <Award size={22} color="#059669" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#065f46', margin: 0 }}>
                Principales Insights del Indicador y Meta Sanitaria C2
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
              <div style={{ background: 'white', padding: '16px 20px', borderRadius: '14px', border: '1px solid #d1fae5' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>Cumplimiento Superior a la Línea Base</span>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: '#1e293b', lineHeight: '1.4' }}>
                  El porcentaje acumulado alcanza un <strong>{atencionKpis.pctCumplimiento}%</strong>, superando holgadamente la línea de base reglamentaria del <strong>≥ 90.0%</strong> para pacientes C2 atendidos antes o a los 30 minutos.
                </p>
              </div>

              <div style={{ background: 'white', padding: '16px 20px', borderRadius: '14px', border: '1px solid #d1fae5' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>Comportamiento Adulto vs Infantil</span>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: '#1e293b', lineHeight: '1.4' }}>
                  Pacientes <strong>Adultos</strong>: <strong>{atencionKpis.adultPct}%</strong> de cumplimiento ({atencionKpis.adultTotal.toLocaleString()} casos). Pacientes <strong>Infantiles</strong>: <strong>{atencionKpis.infPct}%</strong> de cumplimiento ({atencionKpis.infTotal.toLocaleString()} casos). Ambos tramos superan el 90%.
                </p>
              </div>

              <div style={{ background: 'white', padding: '16px 20px', borderRadius: '14px', border: '1px solid #d1fae5' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase' }}>Tiempos de Respuesta en Box</span>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: '#1e293b', lineHeight: '1.4' }}>
                  El tiempo medio de atención médica efectiva tras el Triage es de apenas <strong>{atencionKpis.avgWait} minutos</strong>. La exclusión por defecto de atenciones obstétricas/matronas permite aislar fielmente el desempeño del estamento médico general y de especialidad.
                </p>
              </div>
            </div>
          </div>

          {/* GRÁFICO DE LÍNEAS: PORCENTAJE MENSUAL DE CUMPLIMIENTO CON ETIQUETAS Y LÍNEA BASE >= 90% */}
          <div style={{ background: 'white', padding: '26px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 6px 24px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Evolución Mensual % de Cumplimiento Meta C2 (≤ 30 Minutos)
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
                  Porcentaje dentro de cada mes con etiquetas de valores directos y línea de base en ≥ 90% (Pacientes C2 atendidos antes de los 30 min).
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#f8fafc', padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.8rem', fontWeight: 700 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#2563eb' }} /> % Cumplimiento Real
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626' }}>
                  <div style={{ width: '18px', height: '3px', background: '#dc2626', borderTop: '1px dashed #dc2626' }} /> Línea Base Meta (≥ 90%)
                </div>
              </div>
            </div>

            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={atencionMonthlyPivot.chartData} margin={{ top: 25, right: 40, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="mesLabel" fontSize={12} stroke="#64748b" tickMargin={10} />
                  <YAxis domain={[80, 100]} unit="%" fontSize={12} stroke="#64748b" tickCount={5} />
                  <Tooltip 
                    formatter={(val, name) => [
                      name === 'metaBase' ? '90.0% (Línea Base Exigida)' : `${val}%`, 
                      name === 'metaBase' ? 'Estándar Minsal' : '% Cumplimiento Meta C2'
                    ]} 
                    contentStyle={{ borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} 
                  />
                  <ReferenceLine 
                    y={90} 
                    stroke="#dc2626" 
                    strokeDasharray="4 4" 
                    strokeWidth={2}
                    label={{ 
                      value: 'Línea de Base Meta: ≥ 90%', 
                      position: 'insideBottomRight', 
                      fill: '#dc2626', 
                      fontSize: 12, 
                      fontWeight: 800 
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pctCumple" 
                    name="% Cumplimiento C2" 
                    stroke="#2563eb" 
                    strokeWidth={3} 
                    dot={{ r: 6, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }} 
                    activeDot={{ r: 9, fill: '#1d4ed8' }} 
                  >
                    <LabelList 
                      dataKey="pctLabel" 
                      position="top" 
                      offset={12} 
                      style={{ fontSize: '11px', fontWeight: 800, fill: '#1e3a8a' }} 
                    />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TABLA MATRIZ PIVOTE: RANGOS EN FILAS Y MESES EN COLUMNAS CON PORCENTAJES */}
          <div style={{ background: 'white', padding: '26px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 6px 24px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Matriz de Distribución de Tiempos de Espera por Rangos y Meses
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
                  Rangos de tiempo en filas, meses en columnas y totales consolidados con sus porcentajes relativos por mes y a la fecha.
                </p>
              </div>
              <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '6px 14px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 800, border: '1px solid #bfdbfe' }}>
                Selector: {atencionCat} • Especialidad: {atencionEspecialidad}
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', color: '#334155', fontWeight: 800 }}>
                    <th style={{ padding: '14px 18px', textAlign: 'left', minWidth: '240px' }}>Rango de Tiempo de Espera</th>
                    {atencionMonthlyPivot.activeMonths.map(m => (
                      <th key={m} style={{ padding: '14px 12px', textAlign: 'center', minWidth: '90px' }}>
                        {atencionMonthlyPivot.monthNames[m - 1]}
                      </th>
                    ))}
                    <th style={{ padding: '14px 18px', textAlign: 'center', minWidth: '130px', background: '#e0f2fe', color: '#0369a1', borderLeft: '2px solid #bae6fd' }}>
                      Total General
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {atencionMonthlyPivot.rows.map((row, idx) => {
                    const isPct = row.isPctRow;
                    const isTotal = row.isTotal;
                    const isCumple = row.isMeta;

                    let bgRow = idx % 2 === 0 ? 'white' : '#fcfdfd';
                    if (isTotal) bgRow = '#f1f5f9';
                    if (isPct) bgRow = '#f0fdf4';

                    let textColor = '#0f172a';
                    if (isCumple) textColor = '#059669';
                    if (isPct) textColor = '#15803d';

                    return (
                      <tr key={idx} style={{ borderBottom: isTotal || isPct ? '2px solid #cbd5e1' : '1px solid #f1f5f9', background: bgRow }}>
                        <td style={{ padding: '14px 18px', fontWeight: isTotal || isPct ? 800 : 700, color: textColor, borderRight: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isCumple && <CheckCircle size={15} color="#10b981" />}
                            {!isCumple && !isTotal && !isPct && <AlertCircle size={15} color="#ef4444" />}
                            {isPct && <Award size={16} color="#15803d" />}
                            {row.label}
                          </div>
                        </td>

                        {row.months.map(mCell => (
                          <td key={mCell.month} style={{ padding: '12px 10px', textAlign: 'center', fontWeight: isTotal || isPct ? 800 : 600, color: textColor }}>
                            {isPct ? (
                              <span style={{ 
                                padding: '4px 8px', 
                                borderRadius: '10px', 
                                background: mCell.pct >= 90 ? '#dcfce7' : '#fee2e2', 
                                color: mCell.pct >= 90 ? '#15803d' : '#b91c1c', 
                                fontWeight: 800,
                                fontSize: '0.82rem'
                              }}>
                                {mCell.pct}%
                              </span>
                            ) : isTotal ? (
                              <span style={{ fontWeight: 800, color: '#0f172a' }}>{mCell.count.toLocaleString()}</span>
                            ) : (
                              <div>
                                <span style={{ fontWeight: 800, color: isCumple ? '#059669' : '#dc2626' }}>{mCell.count}</span>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
                                  ({mCell.pct}%)
                                </div>
                              </div>
                            )}
                          </td>
                        ))}

                        <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 900, background: isPct ? '#dcfce7' : '#f0f9ff', color: isPct ? '#15803d' : '#0369a1', borderLeft: '2px solid #bae6fd' }}>
                          {isPct ? (
                            <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#15803d' }}>
                              {row.totalPct}%
                            </span>
                          ) : isTotal ? (
                            <span style={{ fontSize: '0.95rem', color: '#0369a1' }}>
                              {row.totalCount.toLocaleString()}
                            </span>
                          ) : (
                            <div>
                              <span style={{ fontSize: '0.95rem', color: isCumple ? '#059669' : '#dc2626' }}>{row.totalCount.toLocaleString()}</span>
                              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>
                                ({row.totalPct}%)
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: ABANDONO & PERIODOS DE ATENCIÓN */}
      {activeTab === 'abandono' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
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
                        <span style={{ color: (row.estado_atencion || '').toUpperCase().includes('ABANDONO') ? '#ef4444' : '#10b981', fontWeight: 700 }}>
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
