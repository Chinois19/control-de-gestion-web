import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, ChevronRight, ChevronUp, Search, Download, 
  Layers, Percent, Hash, AlertTriangle, HelpCircle, Sparkles, Activity
} from 'lucide-react';
import * as XLSX from 'xlsx';

const MONTH_NAMES = {
  '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr', '05': 'May', '06': 'Jun',
  '07': 'Jul', '08': 'Ago', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic'
};

// Paleta de colores temáticos por Especialidad
const ESPECIALIDAD_COLORS = [
  '#1e40af', '#0284c7', '#059669', '#d97706', '#7c3aed', 
  '#dc2626', '#db2777', '#0891b2', '#4f46e5', '#ca8a04',
  '#65a30d', '#9333ea', '#ea580c', '#0d9488', '#e11d48'
];

export default function TablaEspecialidadesSuspensionColapsable({ data = [] }) {
  const [expandedEsps, setExpandedEsps] = useState({});
  const [collapsedYears, setCollapsedYears] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [tipoCirugiaFilter, setTipoCirugiaFilter] = useState('todos');
  const [displayMode, setDisplayMode] = useState('both'); // 'count' | 'pct' | 'both'

  // Filtrar exclusivamente pacientes suspendidos y según tipo_cirugia si está activo
  const suspData = useMemo(() => {
    return data.filter(r => {
      if (r.estado !== 'Suspendido') return false;
      if (r.eliminada === true || r.eliminada === 'true') return false;
      if (tipoCirugiaFilter !== 'todos' && r.tipo_cirugia !== tipoCirugiaFilter) return false;
      return true;
    });
  }, [data, tipoCirugiaFilter]);

  // Lista de tipos de cirugía presentes en el dataset para el filtro rápido
  const availableTiposCirugia = useMemo(() => {
    const tipos = new Set();
    data.forEach(r => {
      if (r.estado === 'Suspendido' && r.tipo_cirugia) {
        tipos.add(r.tipo_cirugia);
      }
    });
    return Array.from(tipos).sort();
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

  // Construir matriz jerárquica: Especialidad -> Cirugía (IQ Propuesta) -> Totales por Mes y Año
  const { matrix, grandTotal, totalsByMonth, totalsByYear, totalUniqueIqsCount } = useMemo(() => {
    const root = {};
    let gTotal = 0;
    const mTotals = {};
    const yTotals = {};
    const uniqueIqs = new Set();

    allMonthsList.forEach(m => { mTotals[m] = 0; });
    sortedYears.forEach(y => { yTotals[y] = 0; });

    suspData.forEach(r => {
      const esp = (r.especialidad || 'Sin Especialidad Asignada').trim();
      const iq = (r.intervencion_propuesta || 'Sin Intervención Propuesta Registrada').trim();
      const tipoCirugia = r.tipo_cirugia || '';
      const mKey = r.fecha_programacion ? r.fecha_programacion.substring(0, 7) : null;
      const yrKey = mKey ? mKey.split('-')[0] : null;

      uniqueIqs.add(`${esp}|||${iq}`);
      gTotal++;

      if (mKey && mTotals[mKey] !== undefined) mTotals[mKey]++;
      if (yrKey && yTotals[yrKey] !== undefined) yTotals[yrKey]++;

      if (!root[esp]) {
        root[esp] = {
          name: esp,
          total: 0,
          months: {},
          years: {},
          iqs: {}
        };
      }
      root[esp].total++;
      if (mKey) {
        root[esp].months[mKey] = (root[esp].months[mKey] || 0) + 1;
      }
      if (yrKey) {
        root[esp].years[yrKey] = (root[esp].years[yrKey] || 0) + 1;
      }

      if (!root[esp].iqs[iq]) {
        root[esp].iqs[iq] = {
          name: iq,
          tipoCirugia,
          total: 0,
          months: {},
          years: {}
        };
      }
      root[esp].iqs[iq].total++;
      if (mKey) {
        root[esp].iqs[iq].months[mKey] = (root[esp].iqs[iq].months[mKey] || 0) + 1;
      }
      if (yrKey) {
        root[esp].iqs[iq].years[yrKey] = (root[esp].iqs[iq].years[yrKey] || 0) + 1;
      }
    });

    // Ordenar especialidades por volumen total descendente
    const sortedEsps = Object.values(root).sort((a, b) => b.total - a.total);
    sortedEsps.forEach((esp, idx) => {
      esp.color = ESPECIALIDAD_COLORS[idx % ESPECIALIDAD_COLORS.length];
      esp.sortedIqs = Object.values(esp.iqs).sort((a, b) => b.total - a.total);
    });

    return {
      matrix: sortedEsps,
      grandTotal: gTotal,
      totalsByMonth: mTotals,
      totalsByYear: yTotals,
      totalUniqueIqsCount: uniqueIqs.size
    };
  }, [suspData, allMonthsList, sortedYears]);

  // Manejo de expansión individual de Especialidad
  const toggleEsp = (espName) => {
    setExpandedEsps(prev => ({
      ...prev,
      [espName]: prev[espName] === undefined ? false : !prev[espName]
    }));
  };

  // Expandir todas / Colapsar todas
  const expandAll = () => {
    const all = {};
    matrix.forEach(e => { all[e.name] = true; });
    setExpandedEsps(all);
  };

  const collapseAll = () => {
    const all = {};
    matrix.forEach(e => { all[e.name] = false; });
    setExpandedEsps(all);
  };

  // Toggle colapsar meses de un año individual
  const toggleYearMonths = (yr) => {
    setCollapsedYears(prev => ({
      ...prev,
      [yr]: !prev[yr]
    }));
  };

  // Filtrado si el usuario escribe en el buscador
  const filteredMatrix = useMemo(() => {
    if (!searchQuery.trim()) return matrix;
    const q = searchQuery.toLowerCase().trim();

    return matrix.map(esp => {
      const matchEsp = esp.name.toLowerCase().includes(q);
      const matchingIqs = esp.sortedIqs.filter(iq => iq.name.toLowerCase().includes(q));

      if (matchEsp || matchingIqs.length > 0) {
        return {
          ...esp,
          sortedIqs: matchEsp ? esp.sortedIqs : matchingIqs,
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
    const headerRow = ['Especialidad Quirúrgica', 'Intervención Propuesta (IQ)', 'Tipo de Cirugía'];
    sortedYears.forEach(yr => {
      const months = yearMonthsMap[yr] || [];
      months.forEach(m => {
        const mNum = m.split('-')[1];
        headerRow.push(`${MONTH_NAMES[mNum] || mNum} ${yr}`);
      });
      headerRow.push(`Subtotal ${yr}`);
    });
    headerRow.push('Total Acumulado');
    headerRow.push('% s/ Total General');
    headerRow.push('% s/ Especialidad (Subtotal)');
    rows.push(headerRow);

    // Fila 2: Total General de la institución
    const totalRow = ['TOTAL GENERAL INSTITUCIONAL', 'Todas las cirugías', 'Todas'];
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
    matrix.forEach(esp => {
      // Fila Especialidad
      const espRow = [esp.name, `SUBTOTAL ${esp.name.toUpperCase()}`, 'Todos'];
      sortedYears.forEach(yr => {
        const months = yearMonthsMap[yr] || [];
        months.forEach(m => {
          espRow.push(esp.months[m] || 0);
        });
        espRow.push(esp.years[yr] || 0);
      });
      espRow.push(esp.total);
      espRow.push(grandTotal > 0 ? `${((esp.total / grandTotal) * 100).toFixed(1)}%` : '0%');
      espRow.push('100.0%');
      rows.push(espRow);

      // Filas Intervenciones Propuestas
      esp.sortedIqs.forEach(iq => {
        const iqRow = [esp.name, iq.name, iq.tipoCirugia || ''];
        sortedYears.forEach(yr => {
          const months = yearMonthsMap[yr] || [];
          months.forEach(m => {
            iqRow.push(iq.months[m] || 0);
          });
          iqRow.push(iq.years[yr] || 0);
        });
        iqRow.push(iq.total);
        iqRow.push(grandTotal > 0 ? `${((iq.total / grandTotal) * 100).toFixed(1)}%` : '0%');
        iqRow.push(esp.total > 0 ? `${((iq.total / esp.total) * 100).toFixed(1)}%` : '0%');
        rows.push(iqRow);
      });
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Suspensiones_Especialidad_IQ');
    XLSX.writeFile(wb, `Suspensiones_Especialidades_e_IQ_${new Date().toISOString().substring(0, 10)}.xlsx`);
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
            <div style={{ background: '#f0fdf4', padding: '8px', borderRadius: '12px', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                Matriz Colapsable: Suspensiones por Especialidad e Intervención Quirúrgica Propuesta
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Especialidades y cirugías suspendidas en filas con subtotales y porcentajes × Meses y años en columnas
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
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Especialidades:</span>
            <span style={{ fontSize: '1rem', fontWeight: 900, color: '#1e40af' }}>{matrix.length}</span>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Cirugías Distintas:</span>
            <span style={{ fontSize: '1rem', fontWeight: 900, color: '#059669' }}>{totalUniqueIqsCount}</span>
          </div>
        </div>
      </div>

      {/* TOOLBAR: BUSCADOR, TIPO CIRUGÍA Y ACCIONES */}
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
            placeholder="Buscar especialidad o intervención propuesta..."
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

        {/* FILTRO RÁPIDO POR TIPO DE CIRUGÍA */}
        {availableTiposCirugia.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Tipo:</span>
            <button
              onClick={() => setTipoCirugiaFilter('todos')}
              style={{
                padding: '5px 10px',
                borderRadius: '8px',
                border: 'none',
                background: tipoCirugiaFilter === 'todos' ? '#1e40af' : 'white',
                color: tipoCirugiaFilter === 'todos' ? 'white' : '#475569',
                fontSize: '0.72rem',
                fontWeight: tipoCirugiaFilter === 'todos' ? 800 : 600,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              Todos
            </button>
            {availableTiposCirugia.map(tipo => (
              <button
                key={tipo}
                onClick={() => setTipoCirugiaFilter(tipo)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: tipoCirugiaFilter === tipo ? '#1e40af' : 'white',
                  color: tipoCirugiaFilter === tipo ? 'white' : '#475569',
                  fontSize: '0.72rem',
                  fontWeight: tipoCirugiaFilter === tipo ? 800 : 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                {tipo}
              </button>
            ))}
          </div>
        )}

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
            title="Desplegar todas las intervenciones propuestas"
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
            title="Colapsar a solo especialidades"
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
                    minWidth: '360px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Especialidad e Intervención Propuesta (Filas)
                    </span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.85, fontWeight: 500 }}>
                      Especialidad → Cirugías IQ
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
                  % s/ Especialidad
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
                        key={`esp-col-yr-${yr}`}
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
                    <React.Fragment key={`esp-hdr-months-${yr}`}>
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
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
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
                      <td key={`esp-tot-cell-yr-${yr}`} style={{ padding: '10px 12px', textAlign: 'right', background: '#1e293b', borderRight: '1px solid rgba(255,255,255,0.15)' }}>
                        {renderCellContent(totalsByYear[yr], grandTotal, true)}
                      </td>
                    );
                  }

                  return (
                    <React.Fragment key={`esp-tot-cells-${yr}`}>
                      {months.map(mKey => (
                        <td key={`esp-tot-m-${mKey}`} style={{ padding: '10px 10px', textAlign: 'right', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
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

              {/* FILAS DE ESPECIALIDADES Y CIRUGÍAS (IQ) */}
              {filteredMatrix.map(esp => {
                const isExpanded = esp.isForceExpanded || (expandedEsps[esp.name] ?? false);
                const pctOfGrandTotal = grandTotal > 0 ? ((esp.total / grandTotal) * 100).toFixed(1) : '0.0';

                return (
                  <React.Fragment key={`esp-group-${esp.name}`}>
                    {/* FILA DE ESPECIALIDAD (SUBTOTAL) */}
                    <tr
                      style={{
                        background: '#f8fafc',
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
                          background: '#f8fafc',
                          borderRight: '2px solid #cbd5e1',
                          borderLeft: `5px solid ${esp.color}`
                        }}
                      >
                        <div
                          onClick={() => toggleEsp(esp.name)}
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
                                background: esp.color,
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
                                {esp.name}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: esp.color, fontWeight: 700, marginLeft: '8px' }}>
                                ({esp.sortedIqs.length} cirugías)
                              </span>
                            </div>
                          </div>

                          <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                            {isExpanded ? 'Ocultar cirugías' : 'Ver cirugías (+)'}
                          </span>
                        </div>
                      </td>

                      {/* VALORES MENSUALES / ANUALES DE LA ESPECIALIDAD (SUBTOTAL) */}
                      {sortedYears.map(yr => {
                        const months = yearMonthsMap[yr] || [];
                        const isCollapsed = collapsedYears[yr] === true;

                        if (isCollapsed) {
                          return (
                            <td
                              key={`esp-val-yr-${esp.name}-${yr}`}
                              style={{
                                padding: '10px 12px',
                                textAlign: 'right',
                                fontWeight: 800,
                                color: '#0f172a',
                                background: 'rgba(0,0,0,0.02)',
                                borderRight: '1px solid #e2e8f0'
                              }}
                            >
                              {renderCellContent(esp.years[yr], totalsByYear[yr], true)}
                            </td>
                          );
                        }

                        return (
                          <React.Fragment key={`esp-cells-${esp.name}-${yr}`}>
                            {months.map(mKey => (
                              <td
                                key={`esp-m-${esp.name}-${mKey}`}
                                style={{
                                  padding: '10px 10px',
                                  textAlign: 'right',
                                  fontWeight: 700,
                                  color: '#0f172a',
                                  borderRight: '1px solid #e2e8f0'
                                }}
                              >
                                {renderCellContent(esp.months[mKey], totalsByMonth[mKey])}
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
                              {renderCellContent(esp.years[yr], totalsByYear[yr], true)}
                            </td>
                          </React.Fragment>
                        );
                      })}

                      {/* TOTAL DE LA ESPECIALIDAD */}
                      <td
                        style={{
                          padding: '11px 14px',
                          textAlign: 'right',
                          fontWeight: 900,
                          fontSize: '0.88rem',
                          color: esp.color,
                          background: 'rgba(0,0,0,0.02)',
                          borderRight: '1px solid #cbd5e1'
                        }}
                      >
                        {esp.total.toLocaleString()}
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
                            <div style={{ width: `${Math.min(parseFloat(pctOfGrandTotal), 100)}%`, height: '100%', background: esp.color }} />
                          </div>
                        </div>
                      </td>

                      {/* % SOBRE SU PROPIA ESPECIALIDAD (100%) */}
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

                    {/* FILAS DE CIRUGÍAS (IQ PROPUESTA) ANIDADAS */}
                    {isExpanded && esp.sortedIqs.map((iq, iIdx) => {
                      const iqPctOfTotal = grandTotal > 0 ? ((iq.total / grandTotal) * 100).toFixed(1) : '0.0';
                      const iqPctOfEsp = esp.total > 0 ? ((iq.total / esp.total) * 100).toFixed(1) : '0.0';

                      return (
                        <tr
                          key={`iq-${esp.name}-${iq.name}`}
                          style={{
                            background: iIdx % 2 === 0 ? '#ffffff' : '#fafafa',
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'background 0.1s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                          onMouseLeave={(e) => e.currentTarget.style.background = iIdx % 2 === 0 ? '#ffffff' : '#fafafa'}
                        >
                          <td
                            style={{
                              padding: '8px 18px 8px 36px',
                              position: 'sticky',
                              left: 0,
                              zIndex: 20,
                              background: iIdx % 2 === 0 ? '#ffffff' : '#fafafa',
                              borderRight: '2px solid #cbd5e1',
                              borderLeft: `5px solid ${esp.color}33`
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontFamily: 'monospace' }}>└─</span>
                              <span style={{ color: '#334155', fontWeight: 600, fontSize: '0.78rem', flex: 1 }} title={iq.name}>
                                {iq.name}
                              </span>
                              {iq.tipoCirugia && (
                                <span style={{
                                  fontSize: '0.66rem',
                                  padding: '2px 6px',
                                  borderRadius: '5px',
                                  background: '#e0f2fe',
                                  color: '#0369a1',
                                  fontWeight: 700,
                                  whiteSpace: 'nowrap'
                                }}>
                                  {iq.tipoCirugia}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* VALORES MENSUALES / ANUALES POR CIRUGÍA ESPECÍFICA */}
                          {sortedYears.map(yr => {
                            const months = yearMonthsMap[yr] || [];
                            const isCollapsed = collapsedYears[yr] === true;

                            if (isCollapsed) {
                              return (
                                <td
                                  key={`iq-val-yr-${iq.name}-${yr}`}
                                  style={{
                                    padding: '8px 12px',
                                    textAlign: 'right',
                                    color: '#475569',
                                    fontWeight: 600,
                                    borderRight: '1px solid #f1f5f9'
                                  }}
                                >
                                  {renderCellContent(iq.years[yr], totalsByYear[yr])}
                                </td>
                              );
                            }

                            return (
                              <React.Fragment key={`iq-cells-${iq.name}-${yr}`}>
                                {months.map(mKey => (
                                  <td
                                    key={`iq-m-${iq.name}-${mKey}`}
                                    style={{
                                      padding: '8px 10px',
                                      textAlign: 'right',
                                      color: '#475569',
                                      borderRight: '1px solid #f1f5f9'
                                    }}
                                  >
                                    {renderCellContent(iq.months[mKey], totalsByMonth[mKey])}
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
                                  {renderCellContent(iq.years[yr], totalsByYear[yr], true)}
                                </td>
                              </React.Fragment>
                            );
                          })}

                          {/* TOTAL DE LA CIRUGÍA ESPECÍFICA */}
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
                            {iq.total.toLocaleString()}
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
                            {iqPctOfTotal}%
                          </td>

                          {/* % SOBRE LA ESPECIALIDAD (SUBTOTAL) */}
                          <td
                            style={{
                              padding: '8px 14px',
                              textAlign: 'right',
                              fontWeight: 700,
                              color: esp.color,
                              fontSize: '0.74rem'
                            }}
                          >
                            <span style={{ background: '#f8fafc', padding: '2px 6px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                              {iqPctOfEsp}%
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

      {/* FOOTER INFORMATIVO */}
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
            <strong>Criterio de Agrupación:</strong> Las intervenciones corresponden a la <code>intervencion_propuesta</code> registrada en la programación quirúrgica. El <em>% s/ Especialidad</em> mide la concentración de suspensiones de esa cirugía dentro de su especialidad clínica.
          </span>
        </div>
        <div style={{ fontWeight: 600 }}>
          Mostrando {filteredMatrix.length} especialidades y {filteredMatrix.reduce((acc, e) => acc + e.sortedIqs.length, 0)} cirugías propuestas
        </div>
      </div>
    </div>
  );
}
