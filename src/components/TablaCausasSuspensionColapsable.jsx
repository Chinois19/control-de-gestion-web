import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, ChevronRight, ChevronUp, Search, Download, 
  FileSpreadsheet, Filter, Layers, Percent, Hash, AlertTriangle,
  HelpCircle, Eye, EyeOff, Sparkles
} from 'lucide-react';
import * as XLSX from 'xlsx';

// Mapeo exhaustivo de motivos conocidos hacia sus Grandes Causas oficiales (MINSAL / REM)
// Para aquellos registros donde causa_suspension viene vacía
export const MOTIVO_TO_GRAN_CAUSA = {
  // Paciente
  'Patología aguda': 'Paciente',
  'Descompensación en pabellón': 'Paciente',
  'Paciente fallece': 'Paciente',
  'No se presenta': 'Paciente',
  'No Se Presenta/No se ubica': 'Paciente',
  'Rechaza operación': 'Paciente',
  'Anticipación de cirugía por agudización de patología': 'Paciente',
  'Falta de ayuno': 'Paciente',
  'Atraso al ingreso': 'Paciente',
  'Sin indicación quirúrgica': 'Paciente',
  'Sin indicación quirúrgica ': 'Paciente',
  'Condiciones clínicas no aptas': 'Paciente',
  'Patología crónica descompensada': 'Paciente',
  'Exámenes alterados no corregidos': 'Paciente',
  'Sin suspensión de anticoagulante u otras drogas proscritas (excluidas)': 'Paciente',
  'Patología no informada, no conocida (alergia al látex)': 'Paciente',
  'Patología no informada, no conocida': 'Paciente',

  // Equipo Quirúrgico
  'Prolongación De Tabla': 'Equipo Quirurgico',
  'Falta/Disponibilidad De Anestesiólogo': 'Equipo Quirurgico',
  'Falta / Disponibilidad De Anestesiólogo': 'Equipo Quirurgico',
  'Falta / disponibilidad de anestesiólogo/a': 'Equipo Quirurgico',
  'Falta/Disponibilidad De Cirujano': 'Equipo Quirurgico',
  'Falta / disponibilidad de cirujano/a': 'Equipo Quirurgico',
  'Falta / disponibilidad profesional no médico': 'Equipo Quirurgico',
  'Falta/Disponibilidad Profesional No Medico': 'Equipo Quirurgico',
  'Falta / disponibilidad de técnico de enfermería de nivel superior o técnico paramédico': 'Equipo Quirurgico',
  'Falta /Disponibilidad De Técnico Paramédico': 'Equipo Quirurgico',
  'Reemplazo por urgencia': 'Equipo Quirurgico',
  'Reemplazado por urgencia': 'Equipo Quirurgico',

  // Administrativas
  'Falta disponibilidad de cama UPC': 'Administrativas',
  'Falta de disponibilidad de cama básica': 'Administrativas',
  'Falta de disponibilidad de cama UTI': 'Administrativas',
  'Error de programación': 'Administrativas',
  'Estudio incompleto': 'Administrativas',
  'Sin cupo en recuperación': 'Administrativas',
  'Sin evaluación de especialista indicada': 'Administrativas',
  'Atraso en el ingreso': 'Administrativas',
  'Documentación incompleta': 'Administrativas',
  'Falta de preparación de piel, intestinal, antibiótica u otra específica': 'Administrativas',
  'Falta de preparación de piel, intestinal, antibiótica, suspensión de anticoagulantes u otra especificada': 'Administrativas',
  'Sin consentimiento informado firmado / Ausencia de tutor legal consignado': 'Administrativas',
  'Sin consentimiento informado firmado / falta de tutor legal consignado': 'Administrativas',

  // Unidades de apoyo logístico
  'Equipamiento no operativo': 'Unidades de apoyo logístico',
  'Equipamiento médico no operativo': 'Unidades de apoyo logístico',
  'Falta de insumos/stock insuficiente': 'Unidades de apoyo logístico',
  'Falta de insumos o stock insuficiente': 'Unidades de apoyo logístico',
  'Instrumental y/o Material con falla de esterilización': 'Unidades de apoyo logístico',
  'Instrumental y/o material con falla de esterilización': 'Unidades de apoyo logístico',
  'Instrumental incompleto o no disponible': 'Unidades de apoyo logístico',
  'Falta de equipo, insumos y/o cajas quirúrgicas por parte de proveedor externo': 'Unidades de apoyo logístico',

  // Unidades de apoyo clínico
  'Falta sangre o hemoderivados': 'Unidades de apoyo clinico',

  // Infraestructura
  'Falla gases clínicos': 'Infraestructura',
  'Falla energía eléctrica': 'Infraestructura',

  // Emergencias
  'Desastres naturales: terremotos, aluviones, tsunamis, inundaciones, erupciones volcánicas, etc.': 'Emergencias'
};

// Resolver Gran Causa oficial
export const resolverGranCausa = (rawCausa, rawMotivo) => {
  const c = (rawCausa || '').trim();
  const m = (rawMotivo || '').trim();
  if (c && c !== 'Vacio' && c !== 'null' && c !== 'undefined') return c;
  if (m && MOTIVO_TO_GRAN_CAUSA[m]) return MOTIVO_TO_GRAN_CAUSA[m];
  if (m.toLowerCase().includes('anestes') || m.toLowerCase().includes('cirujan') || m.toLowerCase().includes('médico') || m.toLowerCase().includes('paramédico') || m.toLowerCase().includes('tabla')) {
    return 'Equipo Quirurgico';
  }
  if (m.toLowerCase().includes('insumo') || m.toLowerCase().includes('instrumental') || m.toLowerCase().includes('equipamiento') || m.toLowerCase().includes('esterilizaci')) {
    return 'Unidades de apoyo logístico';
  }
  if (m.toLowerCase().includes('cama') || m.toLowerCase().includes('programac') || m.toLowerCase().includes('consentimiento') || m.toLowerCase().includes('documentac')) {
    return 'Administrativas';
  }
  if (m.toLowerCase().includes('paciente') || m.toLowerCase().includes('patolog') || m.toLowerCase().includes('ayuno') || m.toLowerCase().includes('rechaza')) {
    return 'Paciente';
  }
  return c || 'Otras / No clasificada';
};

// Paleta de colores e identificadores por Gran Causa
const CAUSA_CONFIG = {
  'Paciente': { 
    color: '#d97706', 
    bg: '#fef3c7', 
    border: '#fde68a', 
    label: 'Paciente',
    desc: 'Factores clínicos agudos, inasistencia, ayuno o rechazo' 
  },
  'Equipo Quirurgico': { 
    color: '#2563eb', 
    bg: '#eff6ff', 
    border: '#bfdbfe', 
    label: 'Equipo Quirúrgico',
    desc: 'Prolongación de tabla, disponibilidad médica/profesional o urgencias' 
  },
  'Administrativas': { 
    color: '#7c3aed', 
    bg: '#f5f3ff', 
    border: '#ddd6fe', 
    label: 'Administrativas',
    desc: 'Disponibilidad de camas, errores de programación o preparación administrativa' 
  },
  'Unidades de apoyo logístico': { 
    color: '#059669', 
    bg: '#ecfdf5', 
    border: '#a7f3d0', 
    label: 'Apoyo Logístico',
    desc: 'Insumos, cajas quirúrgicas, instrumental y esterilización' 
  },
  'Unidades de apoyo clinico': { 
    color: '#0891b2', 
    bg: '#ecfeff', 
    border: '#a5f3fc', 
    label: 'Apoyo Clínico',
    desc: 'Hemoderivados, laboratorio e imagenología' 
  },
  'Infraestructura': { 
    color: '#dc2626', 
    bg: '#fef2f2', 
    border: '#fecaca', 
    label: 'Infraestructura',
    desc: 'Fallas de climatización, energía eléctrica, gases clínicos' 
  },
  'Emergencias': { 
    color: '#e11d48', 
    bg: '#fff1f2', 
    border: '#fecdd3', 
    label: 'Emergencias',
    desc: 'Eventos de fuerza mayor, desastres naturales o emergencias masivas' 
  },
  'Otras / No clasificada': { 
    color: '#64748b', 
    bg: '#f1f5f9', 
    border: '#cbd5e1', 
    label: 'Otras / No Clasificada',
    desc: 'Sin codificación explícita de gran causa' 
  }
};

const MONTH_NAMES = {
  '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr', '05': 'May', '06': 'Jun',
  '07': 'Jul', '08': 'Ago', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic'
};

export default function TablaCausasSuspensionColapsable({ data = [] }) {
  const [expandedCausas, setExpandedCausas] = useState({});
  const [collapsedYears, setCollapsedYears] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [displayMode, setDisplayMode] = useState('both'); // 'count' | 'pct' | 'both'

  // Filtrar exclusivamente pacientes suspendidos
  const suspData = useMemo(() => {
    return data.filter(r => r.estado === 'Suspendido' && r.eliminada !== true && r.eliminada !== 'true');
  }, [data]);

  // Estructurar mapa de años y meses disponibles cronológicamente
  const { yearMonthsMap, sortedYears, allMonthsList } = useMemo(() => {
    const yrMap = {};
    const allM = new Set();

    suspData.forEach(r => {
      if (r.fecha_programacion) {
        const mKey = r.fecha_programacion.substring(0, 7); // 'YYYY-MM'
        const yr = mKey.split('-')[0];
        if (!yrMap[yr]) yrMap[yr] = new Set();
        yrMap[yr].add(mKey);
        allM.add(mKey);
      }
    });

    const sYears = Object.keys(yrMap).sort();
    const cleanMap = {};
    sYears.forEach(yr => {
      cleanMap[yr] = Array.from(yrMap[yr]).sort();
    });

    return {
      yearMonthsMap: cleanMap,
      sortedYears: sYears,
      allMonthsList: Array.from(allM).sort()
    };
  }, [suspData]);

  // Construir matriz jerárquica: Gran Causa -> Causa Específica -> Totales por Mes y Año
  const { matrix, grandTotal, totalsByMonth, totalsByYear, totalSpecificCausesCount } = useMemo(() => {
    const root = {};
    let gTotal = 0;
    const mTotals = {};
    const yTotals = {};
    let specCausesSet = new Set();

    allMonthsList.forEach(m => { mTotals[m] = 0; });
    sortedYears.forEach(y => { yTotals[y] = 0; });

    suspData.forEach(r => {
      const granCausa = resolverGranCausa(r.causa_suspension, r.motivo_suspension);
      const motivo = (r.motivo_suspension || 'Sin Motivo Especificado').trim();
      const mKey = r.fecha_programacion ? r.fecha_programacion.substring(0, 7) : null;
      const yrKey = mKey ? mKey.split('-')[0] : null;

      specCausesSet.add(`${granCausa}|||${motivo}`);
      gTotal++;

      if (mKey && mTotals[mKey] !== undefined) mTotals[mKey]++;
      if (yrKey && yTotals[yrKey] !== undefined) yTotals[yrKey]++;

      if (!root[granCausa]) {
        root[granCausa] = {
          name: granCausa,
          total: 0,
          months: {},
          years: {},
          motivos: {}
        };
      }
      root[granCausa].total++;
      if (mKey) {
        root[granCausa].months[mKey] = (root[granCausa].months[mKey] || 0) + 1;
      }
      if (yrKey) {
        root[granCausa].years[yrKey] = (root[granCausa].years[yrKey] || 0) + 1;
      }

      if (!root[granCausa].motivos[motivo]) {
        root[granCausa].motivos[motivo] = {
          name: motivo,
          total: 0,
          months: {},
          years: {}
        };
      }
      root[granCausa].motivos[motivo].total++;
      if (mKey) {
        root[granCausa].motivos[motivo].months[mKey] = (root[granCausa].motivos[motivo].months[mKey] || 0) + 1;
      }
      if (yrKey) {
        root[granCausa].motivos[motivo].years[yrKey] = (root[granCausa].motivos[motivo].years[yrKey] || 0) + 1;
      }
    });

    // Ordenar grandes causas por volumen total descendente
    const sortedCausas = Object.values(root).sort((a, b) => b.total - a.total);
    sortedCausas.forEach(c => {
      c.sortedMotivos = Object.values(c.motivos).sort((a, b) => b.total - a.total);
    });

    return {
      matrix: sortedCausas,
      grandTotal: gTotal,
      totalsByMonth: mTotals,
      totalsByYear: yTotals,
      totalSpecificCausesCount: specCausesSet.size
    };
  }, [suspData, allMonthsList, sortedYears]);

  // Manejo de expansión individual de Gran Causa
  const toggleCausa = (causaName) => {
    setExpandedCausas(prev => ({
      ...prev,
      [causaName]: prev[causaName] === undefined ? false : !prev[causaName]
    }));
  };

  // Expandir todas / Colapsar todas
  const expandAll = () => {
    const all = {};
    matrix.forEach(c => { all[c.name] = true; });
    setExpandedCausas(all);
  };

  const collapseAll = () => {
    const all = {};
    matrix.forEach(c => { all[c.name] = false; });
    setExpandedCausas(all);
  };

  // Toggle colapsar meses de un año individual
  const toggleYearMonths = (yr) => {
    setCollapsedYears(prev => ({
      ...prev,
      [yr]: !prev[yr]
    }));
  };

  // Filtrado de filas si el usuario escribe en el buscador
  const filteredMatrix = useMemo(() => {
    if (!searchQuery.trim()) return matrix;
    const q = searchQuery.toLowerCase().trim();

    return matrix.map(causa => {
      const matchCausa = causa.name.toLowerCase().includes(q);
      const matchingMotivos = causa.sortedMotivos.filter(m => m.name.toLowerCase().includes(q));

      if (matchCausa || matchingMotivos.length > 0) {
        return {
          ...causa,
          sortedMotivos: matchCausa ? causa.sortedMotivos : matchingMotivos,
          isForceExpanded: true
        };
      }
      return null;
    }).filter(Boolean);
  }, [matrix, searchQuery]);

  // Formateador de celda según el displayMode elegido
  const renderCellContent = (count = 0, colTotal = 0, isRowTotal = false) => {
    if (count === 0) {
      return <span style={{ color: '#cbd5e1' }}>-</span>;
    }

    const pctOfCol = colTotal > 0 ? ((count / colTotal) * 100).toFixed(1) : '0.0';

    if (displayMode === 'count') {
      return <span style={{ fontWeight: 600 }}>{count.toLocaleString()}</span>;
    }
    if (displayMode === 'pct') {
      return (
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af' }}>
          {pctOfCol}%
        </span>
      );
    }
    // 'both'
    return (
      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.15 }}>
        <span style={{ fontWeight: 700 }}>{count.toLocaleString()}</span>
        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
          {pctOfCol}%
        </span>
      </div>
    );
  };

  // Exportar matriz a Excel (.xlsx)
  const handleExportExcel = () => {
    const rows = [];

    // Fila 1: Encabezados superiores
    const headerRow = ['Gran Causa de Suspensión', 'Causa Específica (Motivo)'];
    sortedYears.forEach(yr => {
      const months = yearMonthsMap[yr] || [];
      months.forEach(m => {
        const mNum = m.split('-')[1];
        headerRow.push(`${MONTH_NAMES[mNum] || mNum} ${yr}`);
      });
      headerRow.push(`Subtotal ${yr}`);
    });
    headerRow.push('Total General Acumulado');
    headerRow.push('% s/ Total General');
    headerRow.push('% s/ Gran Causa (Subtotal)');
    rows.push(headerRow);

    // Fila 2: Total General de la institución
    const totalRow = ['TOTAL GENERAL INSTITUCIONAL', 'Todas las causas'];
    sortedYears.forEach(yr => {
      const months = yearMonthsMap[yr] || [];
      months.forEach(m => {
        totalRow.push(totalsByMonth[m] || 0);
      });
      totalRow.push(totalsByYear[yr] || 0);
    });
    totalRow.push(grandTotal);
    totalRow.push('100.0%');
    totalRow.push('100.0%');
    rows.push(totalRow);

    // Filas de datos
    matrix.forEach(causa => {
      // Fila Gran Causa
      const causaRow = [causa.name, `SUBTOTAL ${causa.name.toUpperCase()}`];
      sortedYears.forEach(yr => {
        const months = yearMonthsMap[yr] || [];
        months.forEach(m => {
          causaRow.push(causa.months[m] || 0);
        });
        causaRow.push(causa.years[yr] || 0);
      });
      causaRow.push(causa.total);
      causaRow.push(grandTotal > 0 ? `${((causa.total / grandTotal) * 100).toFixed(1)}%` : '0%');
      causaRow.push('100.0%');
      rows.push(causaRow);

      // Filas Causas Específicas
      causa.sortedMotivos.forEach(motivo => {
        const motivoRow = [causa.name, motivo.name];
        sortedYears.forEach(yr => {
          const months = yearMonthsMap[yr] || [];
          months.forEach(m => {
            motivoRow.push(motivo.months[m] || 0);
          });
          motivoRow.push(motivo.years[yr] || 0);
        });
        motivoRow.push(motivo.total);
        motivoRow.push(grandTotal > 0 ? `${((motivo.total / grandTotal) * 100).toFixed(1)}%` : '0%');
        motivoRow.push(causa.total > 0 ? `${((motivo.total / causa.total) * 100).toFixed(1)}%` : '0%');
        rows.push(motivoRow);
      });
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Suspensiones_Causas');
    XLSX.writeFile(wb, `Suspensiones_Grandes_y_Especificas_${new Date().toISOString().substring(0, 10)}.xlsx`);
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '24px',
      border: '1px solid #e2e8f0',
      padding: '24px 28px',
      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
      marginBottom: '32px'
    }}>
      {/* HEADER PRINCIPAL */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '12px', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                Matriz Colapsable: Grandes Causas y Causas Específicas de Suspensión
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Filas jerárquicas con subtotales por gran causa y desglose por causa específica × Meses y años en columnas
              </p>
            </div>
          </div>
        </div>

        {/* METRICS SUMMARY PILLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Total Suspensiones:</span>
            <span style={{ fontSize: '1rem', fontWeight: 900, color: '#ef4444' }}>{grandTotal.toLocaleString()}</span>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Grandes Causas:</span>
            <span style={{ fontSize: '1rem', fontWeight: 900, color: '#1e40af' }}>{matrix.length}</span>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Causas Específicas:</span>
            <span style={{ fontSize: '1rem', fontWeight: 900, color: '#059669' }}>{totalSpecificCausesCount}</span>
          </div>
        </div>
      </div>

      {/* TOOLBAR: ACCIONES, BUSCADOR Y MODOS */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        padding: '14px 18px',
        background: '#f8fafc',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        marginBottom: '20px'
      }}>
        {/* BUSCADOR RÁPIDO */}
        <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Buscar causa o motivo específico..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              background: 'white',
              fontSize: '0.82rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', fontSize: '0.85rem' }}
            >
              ✕
            </button>
          )}
        </div>

        {/* SELECTOR DE MODO DE VISUALIZACIÓN */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', padding: '0 8px', textTransform: 'uppercase' }}>Ver:</span>
          {[
            { id: 'count', label: 'N° Casos', icon: <Hash size={13} /> },
            { id: 'pct', label: '% Mes', icon: <Percent size={13} /> },
            { id: 'both', label: 'N° y %', icon: <Sparkles size={13} /> }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setDisplayMode(mode.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: displayMode === mode.id ? '#1e40af' : 'transparent',
                color: displayMode === mode.id ? 'white' : '#475569',
                fontSize: '0.75rem',
                fontWeight: displayMode === mode.id ? 800 : 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {mode.icon}
              {mode.label}
            </button>
          ))}
        </div>

        {/* ACCIONES DE EXPANSIÓN Y EXPORTACIÓN */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={expandAll}
            title="Desplegar todas las causas específicas"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              background: 'white',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              color: '#334155',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <ChevronDown size={14} /> Expandir Todo
          </button>

          <button
            onClick={collapseAll}
            title="Colapsar a solo grandes causas"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              background: 'white',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              color: '#334155',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <ChevronUp size={14} /> Colapsar Todo
          </button>

          <button
            onClick={handleExportExcel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              background: 'linear-gradient(135deg, #059669, #047857)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.2)'
            }}
          >
            <Download size={14} /> Exportar Excel
          </button>
        </div>
      </div>

      {/* TABLA PRINCIPAL CON STICKY HEADERS Y COLUMNAS */}
      {filteredMatrix.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
          <AlertTriangle size={32} color="#f59e0b" style={{ margin: '0 auto 12px auto' }} />
          <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>
            No se encontraron suspensiones registradas
          </h4>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
            {searchQuery ? 'Prueba con otro término de búsqueda o limpia los filtros del menú lateral.' : 'No existen registros de suspensiones para el rango de fechas y filtros seleccionados.'}
          </p>
        </div>
      ) : (
        <div style={{
          overflowX: 'auto',
          maxHeight: '620px',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.02)',
          position: 'relative'
        }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.78rem' }}>
            {/* ENCABEZADOS DE TABLA */}
            <thead style={{ position: 'sticky', top: 0, zIndex: 40, background: '#1e3a8a', color: 'white' }}>
              {/* FILA 1 DE ENCABEZADOS: AÑOS Y TOTALES */}
              <tr>
                <th
                  rowSpan={2}
                  style={{
                    padding: '12px 18px',
                    textAlign: 'left',
                    position: 'sticky',
                    left: 0,
                    zIndex: 50,
                    background: '#1e3a8a',
                    borderRight: '2px solid rgba(255,255,255,0.25)',
                    borderBottom: '1px solid rgba(255,255,255,0.25)',
                    minWidth: '340px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Causas de Suspensión (Filas)
                    </span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.85, fontWeight: 500 }}>
                      Grandes Causas → Específicas
                    </span>
                  </div>
                </th>

                {sortedYears.map(yr => {
                  const months = yearMonthsMap[yr] || [];
                  const isCollapsed = collapsedYears[yr] === true;
                  const colSpan = isCollapsed ? 1 : months.length + 1;

                  return (
                    <th
                      key={yr}
                      colSpan={colSpan}
                      style={{
                        padding: '10px 14px',
                        textAlign: 'center',
                        background: '#1e40af',
                        borderRight: '1px solid rgba(255,255,255,0.25)',
                        borderBottom: '1px solid rgba(255,255,255,0.2)',
                        fontWeight: 800
                      }}
                    >
                      <div
                        onClick={() => toggleYearMonths(yr)}
                        title="Haz click para expandir o colapsar meses de este año"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          background: 'rgba(255,255,255,0.12)',
                          padding: '4px 12px',
                          borderRadius: '8px'
                        }}
                      >
                        <span style={{ fontSize: '0.85rem' }}>Año {yr}</span>
                        <span style={{ fontSize: '0.68rem', opacity: 0.9, fontWeight: 600 }}>
                          {isCollapsed ? `Ver ${months.length} meses (+)` : 'Colapsar meses (−)'}
                        </span>
                      </div>
                    </th>
                  );
                })}

                <th
                  rowSpan={2}
                  style={{
                    padding: '12px 14px',
                    textAlign: 'right',
                    background: '#0f172a',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    borderBottom: '1px solid rgba(255,255,255,0.25)',
                    minWidth: '95px',
                    fontWeight: 800
                  }}
                >
                  Total Susp.
                </th>

                <th
                  rowSpan={2}
                  style={{
                    padding: '12px 14px',
                    textAlign: 'right',
                    background: '#0f172a',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    borderBottom: '1px solid rgba(255,255,255,0.25)',
                    minWidth: '110px',
                    fontWeight: 800
                  }}
                >
                  % s/ Total Gral
                </th>

                <th
                  rowSpan={2}
                  style={{
                    padding: '12px 14px',
                    textAlign: 'right',
                    background: '#0f172a',
                    borderBottom: '1px solid rgba(255,255,255,0.25)',
                    minWidth: '110px',
                    fontWeight: 800
                  }}
                >
                  % s/ Gran Causa
                </th>
              </tr>

              {/* FILA 2 DE ENCABEZADOS: MESES INDIVIDUALES Y TOTALES ANUALES */}
              <tr>
                {sortedYears.map(yr => {
                  const months = yearMonthsMap[yr] || [];
                  const isCollapsed = collapsedYears[yr] === true;

                  if (isCollapsed) {
                    return (
                      <th
                        key={`col-yr-${yr}`}
                        style={{
                          padding: '8px 12px',
                          textAlign: 'right',
                          background: '#1d4ed8',
                          borderRight: '1px solid rgba(255,255,255,0.25)',
                          borderBottom: '1px solid rgba(255,255,255,0.25)',
                          fontWeight: 800,
                          fontSize: '0.72rem'
                        }}
                      >
                        Total {yr}
                      </th>
                    );
                  }

                  return (
                    <React.Fragment key={`hdr-months-${yr}`}>
                      {months.map(mKey => {
                        const mNum = mKey.split('-')[1];
                        return (
                          <th
                            key={mKey}
                            style={{
                              padding: '8px 10px',
                              textAlign: 'right',
                              background: '#2563eb',
                              borderRight: '1px solid rgba(255,255,255,0.15)',
                              borderBottom: '1px solid rgba(255,255,255,0.25)',
                              fontWeight: 700,
                              fontSize: '0.72rem'
                            }}
                          >
                            {MONTH_NAMES[mNum] || mNum}
                          </th>
                        );
                      })}
                      <th
                        style={{
                          padding: '8px 12px',
                          textAlign: 'right',
                          background: '#1d4ed8',
                          borderRight: '1px solid rgba(255,255,255,0.25)',
                          borderBottom: '1px solid rgba(255,255,255,0.25)',
                          fontWeight: 800,
                          fontSize: '0.72rem'
                        }}
                      >
                        Total {yr}
                      </th>
                    </React.Fragment>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {/* FILA 1 DE TOTALES INSTITUCIONALES (GLOBAL) */}
              <tr style={{ background: '#0f172a', color: 'white', fontWeight: 800, borderBottom: '2px solid #334155' }}>
                <td
                  style={{
                    padding: '12px 18px',
                    position: 'sticky',
                    left: 0,
                    zIndex: 30,
                    background: '#0f172a',
                    color: 'white',
                    borderRight: '2px solid rgba(255,255,255,0.25)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                    <span style={{ fontSize: '0.82rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                      TOTAL GENERAL DE SUSPENSIONES
                    </span>
                  </div>
                </td>

                {sortedYears.map(yr => {
                  const months = yearMonthsMap[yr] || [];
                  const isCollapsed = collapsedYears[yr] === true;

                  if (isCollapsed) {
                    return (
                      <td key={`tot-cell-yr-${yr}`} style={{ padding: '10px 12px', textAlign: 'right', background: '#1e293b', borderRight: '1px solid rgba(255,255,255,0.15)' }}>
                        {renderCellContent(totalsByYear[yr], grandTotal, true)}
                      </td>
                    );
                  }

                  return (
                    <React.Fragment key={`tot-cells-${yr}`}>
                      {months.map(mKey => (
                        <td key={`tot-m-${mKey}`} style={{ padding: '10px 10px', textAlign: 'right', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                          {renderCellContent(totalsByMonth[mKey], grandTotal)}
                        </td>
                      ))}
                      <td style={{ padding: '10px 12px', textAlign: 'right', background: '#1e293b', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                        {renderCellContent(totalsByYear[yr], grandTotal, true)}
                      </td>
                    </React.Fragment>
                  );
                })}

                <td style={{ padding: '12px 14px', textAlign: 'right', background: '#020617', color: '#f87171', fontWeight: 900, fontSize: '0.92rem', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                  {grandTotal.toLocaleString()}
                </td>
                <td style={{ padding: '12px 14px', textAlign: 'right', background: '#020617', fontWeight: 900, borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                  100.0%
                </td>
                <td style={{ padding: '12px 14px', textAlign: 'right', background: '#020617', color: '#94a3b8' }}>
                  -
                </td>
              </tr>

              {/* FILAS DE GRANDES CAUSAS Y CAUSAS ESPECÍFICAS */}
              {filteredMatrix.map(causa => {
                const conf = CAUSA_CONFIG[causa.name] || CAUSA_CONFIG['Otras / No clasificada'];
                const isExpanded = causa.isForceExpanded || (expandedCausas[causa.name] ?? true);
                const pctOfGrandTotal = grandTotal > 0 ? ((causa.total / grandTotal) * 100).toFixed(1) : '0.0';

                return (
                  <React.Fragment key={`group-${causa.name}`}>
                    {/* FILA DE GRAN CAUSA (SUBTOTAL) */}
                    <tr
                      style={{
                        background: conf.bg,
                        borderBottom: '1px solid #e2e8f0',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td
                        style={{
                          padding: '11px 18px',
                          position: 'sticky',
                          left: 0,
                          zIndex: 25,
                          background: conf.bg,
                          borderRight: '2px solid #cbd5e1',
                          borderLeft: `5px solid ${conf.color}`
                        }}
                      >
                        <div
                          onClick={() => toggleCausa(causa.name)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '6px',
                                background: conf.color,
                                color: 'white',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.8rem',
                                fontWeight: 900
                              }}
                            >
                              {isExpanded ? '−' : '+'}
                            </span>
                            <div>
                              <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.84rem' }}>
                                {conf.label}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: conf.color, fontWeight: 700, marginLeft: '8px' }}>
                                ({causa.sortedMotivos.length} motivos)
                              </span>
                            </div>
                          </div>

                          <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                            {isExpanded ? 'Ocultar detalles' : 'Ver específicos'}
                          </span>
                        </div>
                      </td>

                      {/* VALORES MENSUALES / ANUALES DE LA GRAN CAUSA (SUBTOTAL) */}
                      {sortedYears.map(yr => {
                        const months = yearMonthsMap[yr] || [];
                        const isCollapsed = collapsedYears[yr] === true;

                        if (isCollapsed) {
                          return (
                            <td
                              key={`causa-yr-${causa.name}-${yr}`}
                              style={{
                                padding: '10px 12px',
                                textAlign: 'right',
                                fontWeight: 800,
                                color: '#0f172a',
                                background: 'rgba(0,0,0,0.02)',
                                borderRight: '1px solid #e2e8f0'
                              }}
                            >
                              {renderCellContent(causa.years[yr], totalsByYear[yr], true)}
                            </td>
                          );
                        }

                        return (
                          <React.Fragment key={`causa-cells-${causa.name}-${yr}`}>
                            {months.map(mKey => (
                              <td
                                key={`causa-m-${causa.name}-${mKey}`}
                                style={{
                                  padding: '10px 10px',
                                  textAlign: 'right',
                                  fontWeight: 700,
                                  color: '#0f172a',
                                  borderRight: '1px solid #e2e8f0'
                                }}
                              >
                                {renderCellContent(causa.months[mKey], totalsByMonth[mKey])}
                              </td>
                            ))}
                            <td
                              style={{
                                padding: '10px 12px',
                                textAlign: 'right',
                                fontWeight: 800,
                                color: '#0f172a',
                                background: 'rgba(0,0,0,0.03)',
                                borderRight: '1px solid #cbd5e1'
                              }}
                            >
                              {renderCellContent(causa.years[yr], totalsByYear[yr], true)}
                            </td>
                          </React.Fragment>
                        );
                      })}

                      {/* TOTAL DE LA GRAN CAUSA */}
                      <td
                        style={{
                          padding: '11px 14px',
                          textAlign: 'right',
                          fontWeight: 900,
                          fontSize: '0.88rem',
                          color: conf.color,
                          background: 'rgba(0,0,0,0.02)',
                          borderRight: '1px solid #cbd5e1'
                        }}
                      >
                        {causa.total.toLocaleString()}
                      </td>

                      {/* % SOBRE EL TOTAL GENERAL */}
                      <td
                        style={{
                          padding: '11px 14px',
                          textAlign: 'right',
                          fontWeight: 800,
                          color: '#0f172a',
                          background: 'rgba(0,0,0,0.02)',
                          borderRight: '1px solid #cbd5e1'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <span>{pctOfGrandTotal}%</span>
                          <div style={{ width: '36px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(parseFloat(pctOfGrandTotal), 100)}%`, height: '100%', background: conf.color }} />
                          </div>
                        </div>
                      </td>

                      {/* % SOBRE SU PROPIA GRAN CAUSA (100%) */}
                      <td
                        style={{
                          padding: '11px 14px',
                          textAlign: 'right',
                          fontWeight: 700,
                          color: '#64748b'
                        }}
                      >
                        <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem' }}>
                          Subtotal (100%)
                        </span>
                      </td>
                    </tr>

                    {/* FILAS DE CAUSAS ESPECÍFICAS ANIDADAS */}
                    {isExpanded && causa.sortedMotivos.map((motivo, mIdx) => {
                      const motivoPctOfTotal = grandTotal > 0 ? ((motivo.total / grandTotal) * 100).toFixed(1) : '0.0';
                      const motivoPctOfCausa = causa.total > 0 ? ((motivo.total / causa.total) * 100).toFixed(1) : '0.0';

                      return (
                        <tr
                          key={`motivo-${causa.name}-${motivo.name}`}
                          style={{
                            background: mIdx % 2 === 0 ? '#ffffff' : '#fafafa',
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'background 0.1s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                          onMouseLeave={(e) => e.currentTarget.style.background = mIdx % 2 === 0 ? '#ffffff' : '#fafafa'}
                        >
                          <td
                            style={{
                              padding: '8px 18px 8px 36px',
                              position: 'sticky',
                              left: 0,
                              zIndex: 20,
                              background: mIdx % 2 === 0 ? '#ffffff' : '#fafafa',
                              borderRight: '2px solid #cbd5e1',
                              borderLeft: `5px solid ${conf.color}33`
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontFamily: 'monospace' }}>└─</span>
                              <span style={{ color: '#334155', fontWeight: 600, fontSize: '0.78rem' }} title={motivo.name}>
                                {motivo.name}
                              </span>
                            </div>
                          </td>

                          {/* VALORES MENSUALES / ANUALES POR MOTIVO ESPECÍFICO */}
                          {sortedYears.map(yr => {
                            const months = yearMonthsMap[yr] || [];
                            const isCollapsed = collapsedYears[yr] === true;

                            if (isCollapsed) {
                              return (
                                <td
                                  key={`motivo-yr-${motivo.name}-${yr}`}
                                  style={{
                                    padding: '8px 12px',
                                    textAlign: 'right',
                                    color: '#475569',
                                    fontWeight: 600,
                                    borderRight: '1px solid #f1f5f9'
                                  }}
                                >
                                  {renderCellContent(motivo.years[yr], totalsByYear[yr])}
                                </td>
                              );
                            }

                            return (
                              <React.Fragment key={`motivo-cells-${motivo.name}-${yr}`}>
                                {months.map(mKey => (
                                  <td
                                    key={`motivo-m-${motivo.name}-${mKey}`}
                                    style={{
                                      padding: '8px 10px',
                                      textAlign: 'right',
                                      color: '#475569',
                                      borderRight: '1px solid #f1f5f9'
                                    }}
                                  >
                                    {renderCellContent(motivo.months[mKey], totalsByMonth[mKey])}
                                  </td>
                                ))}
                                <td
                                  style={{
                                    padding: '8px 12px',
                                    textAlign: 'right',
                                    fontWeight: 700,
                                    color: '#334155',
                                    background: 'rgba(0,0,0,0.015)',
                                    borderRight: '1px solid #cbd5e1'
                                  }}
                                >
                                  {renderCellContent(motivo.years[yr], totalsByYear[yr], true)}
                                </td>
                              </React.Fragment>
                            );
                          })}

                          {/* TOTAL DEL MOTIVO ESPECÍFICO */}
                          <td
                            style={{
                              padding: '8px 14px',
                              textAlign: 'right',
                              fontWeight: 700,
                              color: '#0f172a',
                              background: 'rgba(0,0,0,0.015)',
                              borderRight: '1px solid #cbd5e1'
                            }}
                          >
                            {motivo.total.toLocaleString()}
                          </td>

                          {/* % SOBRE TOTAL GENERAL */}
                          <td
                            style={{
                              padding: '8px 14px',
                              textAlign: 'right',
                              color: '#475569',
                              fontWeight: 600,
                              fontSize: '0.74rem',
                              borderRight: '1px solid #cbd5e1'
                            }}
                          >
                            {motivoPctOfTotal}%
                          </td>

                          {/* % SOBRE LA GRAN CAUSA (SUBTOTAL) */}
                          <td
                            style={{
                              padding: '8px 14px',
                              textAlign: 'right',
                              fontWeight: 700,
                              color: conf.color,
                              fontSize: '0.74rem'
                            }}
                          >
                            <span style={{ background: `${conf.bg}`, padding: '2px 6px', borderRadius: '6px', border: `1px solid ${conf.border}` }}>
                              {motivoPctOfCausa}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* FOOTER INFORMATIVO Y REGLAS DE NEGOCIO */}
      <div style={{
        marginTop: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '0.72rem',
        color: '#64748b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={14} color="#3b82f6" />
          <span>
            <strong>Criterio Normativo:</strong> Los porcentajes <em>% s/ Total Gral</em> calculan la fracción respecto al universo total de cirugías suspendidas. El <em>% s/ Gran Causa</em> refleja la concentración relativa de cada motivo específico dentro de su familia causal (subtotal).
          </span>
        </div>
        <div style={{ fontWeight: 600 }}>
          Mostrando {filteredMatrix.length} familias causales y {filteredMatrix.reduce((acc, c) => acc + c.sortedMotivos.length, 0)} motivos específicos
        </div>
      </div>
    </div>
  );
}
