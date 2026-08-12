import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LabelList, LineChart, Line, ReferenceLine, Dot
} from 'recharts';
import {
  ArrowLeft, RefreshCw, AlertTriangle, Users, Clock, Stethoscope, Filter,
  Download, ChevronDown, TrendingUp, Activity, Layers, BarChart2, FileText,
  PieChart as PieIcon, Video, UserCheck, Calendar, Search, ChevronRight, CheckCircle2, XCircle, ChevronUp, Timer, ArrowLeftRight
} from 'lucide-react';

const COLORS_PIE = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const TIPO_CONSULTA_COLORS = {
  'CONSULTA Y CONTROL': '#6366f1',
  'SALUD MENTAL ESPECIALIDAD/ENLACE': '#10b981',
  'ATENCION A HOSPITALIZADOS': '#f59e0b',
  'MEDICINA COMPLEMENTARIA Y PRACTICAS DE BIENESTAR DE LA SALUD  INDIVIDUAL': '#8b5cf6',
  'SALUD MENTAL ESPECIALIDAD': '#0ea5e9',
  'TELEMEDICINA CONTROL': '#ec4899',
  'ATENCION TELEFONICA - CONTROL': '#14b8a6',
  'CONSULTORIAS DE MEDICOS ESPECIALISTAS OTORGADAS': '#f97316',
  'CONSULTA ABREVIADA POR ATENCION REMOTA': '#06b6d4',
  'Sin dato': '#94a3b8',
  'Otros': '#64748b'
};

const getTipoColor = (tipo, index) => {
  if (TIPO_CONSULTA_COLORS[tipo]) return TIPO_CONSULTA_COLORS[tipo];
  return COLORS_PIE[index % COLORS_PIE.length];
};

function MonthlyEvolutionTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const rowData = payload[0]?.payload;
  const monthTotal = rowData?.total || payload.reduce((acc, p) => acc + (p.name !== 'Total Mes' ? (Number(p.value) || 0) : 0), 0);

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(8px)',
      color: 'white',
      padding: '14px 18px',
      borderRadius: 14,
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.15)',
      fontSize: '0.82rem',
      minWidth: 280,
      maxWidth: 380
    }}>
      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#38bdf8', marginBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>📅 {label}</span>
        <span style={{ fontSize: '0.75rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 10px', borderRadius: 10, fontWeight: 800 }}>
          Total: {monthTotal.toLocaleString('es-CL')}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
        {payload.map((entry, index) => {
          if (entry.name === 'Total Mes' || !entry.value) return null;
          const val = Number(entry.value) || 0;
          const pct = monthTotal ? ((val / monthTotal) * 100).toFixed(1) : 0;
          return (
            <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: entry.color, flexShrink: 0 }} />
                <span style={{ color: '#e2e8f0', fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {entry.name}
                </span>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.82rem' }}>
                  {val.toLocaleString('es-CL')}
                </span>
                <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.72rem', marginLeft: 6 }}>
                  ({pct}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KPICard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background: 'white', borderRadius: 16, padding: '20px 24px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)', borderLeft: `4px solid ${color}`,
      display: 'flex', flexDirection: 'column', gap: 4
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color }}>
        {icon}
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{sub}</div>}
    </div>
  );
}

function MultiSelect({ label, options, selected, onChange, color = '#6366f1' }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef();

  useEffect(() => {
    const handleOutside = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const toggle = v => onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);
  const allSelected = selected.length === 0;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 8, background: 'white',
        border: `1.5px solid ${selected.length ? color : '#e2e8f0'}`,
        borderRadius: 10, padding: '7px 14px', cursor: 'pointer', fontWeight: 600,
        fontSize: '0.82rem', color: selected.length ? color : '#64748b', whiteSpace: 'nowrap',
        boxShadow: selected.length ? `0 0 0 3px ${color}18` : 'none', transition: 'all 0.2s'
      }}>
        <Filter size={13} />
        {label}{selected.length > 0 && <span style={{ background: color, color: 'white', borderRadius: 20, padding: '1px 7px', fontSize: '0.72rem', fontWeight: 800 }}>{selected.length}</span>}
        <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, minWidth: 260, maxHeight: 280,
          overflowY: 'auto', background: 'white', borderRadius: 12, border: '1px solid #e2e8f0',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 999, padding: '6px'
        }}>
          <div onClick={() => onChange([])} style={{
            padding: '7px 12px', borderRadius: 8, cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: 700, color: allSelected ? color : '#64748b',
            background: allSelected ? `${color}12` : 'transparent', marginBottom: 2
          }}>
            Todas ({options.length})
          </div>
          {options.map(opt => {
            const active = selected.includes(opt);
            return (
              <div key={opt} onClick={() => toggle(opt)} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px',
                borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: active ? 700 : 500,
                color: active ? color : '#475569', background: active ? `${color}10` : 'transparent'
              }}>
                <div style={{
                  width: 15, height: 15, borderRadius: 4, border: `2px solid ${active ? color : '#cbd5e1'}`,
                  background: active ? color : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {active && <span style={{ color: 'white', fontSize: 9, fontWeight: 900 }}>✓</span>}
                </div>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ActividadesMedicinaDashboard({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [espFiltro, setEspFiltro] = useState([]);
  const [profFiltro, setProfFiltro] = useState([]);
  const [tipoConsultaFiltro, setTipoConsultaFiltro] = useState([]);
  const [estadoHoraFiltro, setEstadoHoraFiltro] = useState([]);
  const [pertinenciaFiltro, setPertinenciaFiltro] = useState([]);
  const [soloSobrecupo, setSoloSobrecupo] = useState(false);
  const [soloVideoconsulta, setSoloVideoconsulta] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Navigation
  const [activeTab, setActiveTab] = useState('resumen');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;

  // Indicadores de Gestión
  const [selectedIndicator, setSelectedIndicator] = useState('nsp');

  // Monthly Evolution Chart State
  const [chartMode, setChartMode] = useState('stacked'); // 'stacked' | 'grouped'
  const [startDateFilter, setStartDateFilter] = useState('2025-01'); // '2025-01' | 'all'

  // Pivot table: set of expanded especialidad rows
  const [pivotExpandedEsps, setPivotExpandedEsps] = useState(new Set());
  // Pivot table: set of expanded tipo-consulta rows (key = 'esp|||tipo')
  const [pivotExpandedTipos, setPivotExpandedTipos] = useState(new Set());

  const loadData = () => {
    setLoading(true);
    setError(null);
    fetch('data/actividades_medicina_cached.json?' + Date.now())
      .then(r => {
        if (!r.ok) throw new Error('Archivo de cache no disponible');
        return r.json();
      })
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  };

  useEffect(() => { loadData(); }, []);

  const baseRecords = useMemo(() => data?.records || [], [data]);

  const optsEsp = useMemo(() => [...new Set(baseRecords.map(r => r.especialidad).filter(Boolean))].sort(), [baseRecords]);
  const optsProf = useMemo(() => [...new Set(baseRecords.map(r => r.profesional_nombre).filter(Boolean))].sort(), [baseRecords]);
  const optsTipoConsulta = useMemo(() => [...new Set(baseRecords.map(r => r.tipo_consulta).filter(Boolean))].sort(), [baseRecords]);
  const optsEstadoHora = useMemo(() => [...new Set(baseRecords.map(r => r.estado_hora).filter(Boolean))].sort(), [baseRecords]);
  const optsPertinencia = useMemo(() => [...new Set(baseRecords.map(r => r.pertinencia).filter(Boolean))].sort(), [baseRecords]);

  const records = useMemo(() => {
    let r = baseRecords;
    if (espFiltro.length) r = r.filter(x => espFiltro.includes(x.especialidad));
    if (profFiltro.length) r = r.filter(x => profFiltro.includes(x.profesional_nombre));
    if (tipoConsultaFiltro.length) r = r.filter(x => tipoConsultaFiltro.includes(x.tipo_consulta));
    if (estadoHoraFiltro.length) r = r.filter(x => estadoHoraFiltro.includes(x.estado_hora));
    if (pertinenciaFiltro.length) r = r.filter(x => pertinenciaFiltro.includes(x.pertinencia));
    if (soloSobrecupo) r = r.filter(x => (x.sobrecupo || '').toUpperCase() === 'SI' || (x.sobrecupo || '').toUpperCase() === 'S' || x.sobrecupo === '1');
    if (soloVideoconsulta) r = r.filter(x => (x.videoconsulta || '').toUpperCase() === 'SI' || (x.videoconsulta || '').toUpperCase() === 'S' || x.videoconsulta === '1');
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      r = r.filter(x =>
        (x.profesional_nombre || '').toLowerCase().includes(term) ||
        (x.especialidad || '').toLowerCase().includes(term) ||
        (x.diagnostico_1 || '').toLowerCase().includes(term) ||
        (x.prestacion_1 || '').toLowerCase().includes(term) ||
        (x.policlinico || '').toLowerCase().includes(term) ||
        (x.actividad || '').toLowerCase().includes(term)
      );
    }
    return r;
  }, [baseRecords, espFiltro, profFiltro, tipoConsultaFiltro, estadoHoraFiltro, pertinenciaFiltro, soloSobrecupo, soloVideoconsulta, searchTerm]);

  const kpis = useMemo(() => {
    const total = records.length;
    if (!total) return { total: 0, sobrecupos: 0, pctSobrecupo: 0, video: 0, pctVideo: 0, auge: 0, nuevas: 0, controles: 0 };
    
    const sobrecupos = records.filter(r => (r.sobrecupo || '').toUpperCase() === 'SI' || (r.sobrecupo || '').toUpperCase() === 'S' || r.sobrecupo === '1').length;
    const video = records.filter(r => (r.videoconsulta || '').toUpperCase() === 'SI' || (r.videoconsulta || '').toUpperCase() === 'S' || r.videoconsulta === '1').length;
    const auge = records.filter(r => r.auge_1 || r.problema_salud || r.estado_auge).length;
    const nuevas = records.filter(r => (r.tipo_consulta || '').toUpperCase().includes('NUEVA') || (r.tipo_consulta || '').toUpperCase().includes('PRIMERA')).length;
    const controles = records.filter(r => (r.tipo_consulta || '').toUpperCase().includes('CONTROL')).length;

    return {
      total,
      sobrecupos,
      pctSobrecupo: ((sobrecupos / total) * 100).toFixed(1),
      video,
      pctVideo: ((video / total) * 100).toFixed(1),
      auge,
      nuevas,
      controles
    };
  }, [records]);

  // Only production records: SE PRESENTO (estado_atencion) = EJECUTADA (estado_hora)
  const productionRecords = useMemo(() =>
    records.filter(r =>
      (r.estado_atencion || '').toUpperCase().trim() === 'SE PRESENTO' ||
      (r.estado_hora || '').toUpperCase().trim() === 'EJECUTADA'
    ),
  [records]);

  const monthlyEvolution = useMemo(() => {
    let source = productionRecords;
    if (startDateFilter === '2025-01') {
      source = productionRecords.filter(r => r.fecha_atencion && String(r.fecha_atencion).substring(0, 10) >= '2025-01-01');
    }

    const monthMap = {};
    const tipoTotals = {};

    source.forEach(r => {
      if (!r.fecha_atencion) return;
      const ym = String(r.fecha_atencion).substring(0, 7);
      const t = r.tipo_consulta || 'Sin dato';
      tipoTotals[t] = (tipoTotals[t] || 0) + 1;
      if (!monthMap[ym]) monthMap[ym] = { total: 0 };
      monthMap[ym][t] = (monthMap[ym][t] || 0) + 1;
      monthMap[ym].total += 1;
    });

    const sortedMonths = Object.keys(monthMap).sort();

    // Select top 7 tipo_consulta categories across filtered period, group rest into 'Otros'
    const topTipos = Object.entries(tipoTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(x => x[0]);

    if (Object.keys(tipoTotals).length > 7) {
      topTipos.push('Otros');
    }

    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const chartData = sortedMonths.map(ym => {
      const year = ym.substring(0, 4);
      const monthNum = parseInt(ym.substring(5, 7), 10);
      const monthLabel = `${monthNames[monthNum - 1]} ${year}`;

      const row = {
        ym,
        monthLabel,
        total: monthMap[ym].total
      };

      topTipos.forEach(tipo => {
        if (tipo === 'Otros') {
          let otrosSum = 0;
          Object.keys(monthMap[ym]).forEach(t => {
            if (t !== 'total' && !topTipos.includes(t)) {
              otrosSum += monthMap[ym][t];
            }
          });
          row[tipo] = otrosSum;
        } else {
          row[tipo] = monthMap[ym][tipo] || 0;
        }
      });

      return row;
    });

    return {
      chartData,
      tipoKeys: topTipos,
      totalPeriodo: source.length,
      avgMonthly: sortedMonths.length ? Math.round(source.length / sortedMonths.length) : 0
    };
  }, [productionRecords, startDateFilter]);

  // ── Pivot Table: Especialidad × Tipo Consulta × Month ──────────────────────
  const pivotData = useMemo(() => {
    // Source: SE PRESENTO records within the selected date range
    let source = productionRecords;
    if (startDateFilter === '2025-01') {
      source = productionRecords.filter(r => r.fecha_atencion && String(r.fecha_atencion).substring(0, 10) >= '2025-01-01');
    }

    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // Collect all months present
    const monthSet = new Set();
    source.forEach(r => { if (r.fecha_atencion) monthSet.add(String(r.fecha_atencion).substring(0, 7)); });
    const months = [...monthSet].sort();
    const monthLabels = months.map(ym => {
      const mn = parseInt(ym.substring(5, 7), 10);
      return { ym, label: `${monthNames[mn - 1]} ${ym.substring(0, 4)}`, year: ym.substring(0, 4) };
    });

    // Unique years for year-total columns
    const years = [...new Set(months.map(ym => ym.substring(0, 4)))].sort();

    // Map: esp -> tipo -> actividad -> ym -> count
    const espMap = {};
    const grandTotal = { byMonth: {}, byYear: {}, total: 0 };
    source.forEach(r => {
      const esp = r.especialidad || 'Sin especialidad';
      const tipo = r.tipo_consulta || 'Sin tipo';
      // Level 3: actividad (Oracle field, available after re-extraction)
      const act = r.actividad || r.diagnostico_1 || 'Sin actividad';
      const ym = r.fecha_atencion ? String(r.fecha_atencion).substring(0, 7) : null;
      if (!ym) return;
      const year = ym.substring(0, 4);

      if (!espMap[esp]) espMap[esp] = { esp, tipos: {}, byMonth: {}, byYear: {}, total: 0 };
      const espNode = espMap[esp];
      espNode.byMonth[ym] = (espNode.byMonth[ym] || 0) + 1;
      espNode.byYear[year] = (espNode.byYear[year] || 0) + 1;
      espNode.total += 1;

      if (!espNode.tipos[tipo]) espNode.tipos[tipo] = { tipo, actividades: {}, byMonth: {}, byYear: {}, total: 0 };
      const tipoNode = espNode.tipos[tipo];
      tipoNode.byMonth[ym] = (tipoNode.byMonth[ym] || 0) + 1;
      tipoNode.byYear[year] = (tipoNode.byYear[year] || 0) + 1;
      tipoNode.total += 1;

      if (!tipoNode.actividades[act]) tipoNode.actividades[act] = { act, byMonth: {}, byYear: {}, total: 0 };
      const actNode = tipoNode.actividades[act];
      actNode.byMonth[ym] = (actNode.byMonth[ym] || 0) + 1;
      actNode.byYear[year] = (actNode.byYear[year] || 0) + 1;
      actNode.total += 1;

      grandTotal.byMonth[ym] = (grandTotal.byMonth[ym] || 0) + 1;
      grandTotal.byYear[year] = (grandTotal.byYear[year] || 0) + 1;
      grandTotal.total += 1;
    });

    // Sort especialidades by total desc; tipos within each esp by total desc; actividades within each tipo by total desc
    const espRows = Object.values(espMap).sort((a, b) => b.total - a.total);
    espRows.forEach(e => {
      e.tipoRows = Object.values(e.tipos).sort((a, b) => b.total - a.total);
      e.tipoRows.forEach(t => {
        t.actRows = Object.values(t.actividades).sort((a, b) => b.total - a.total);
      });
    });

    // Compute heatmap max per-month across all cells (for intensity scaling)
    const allMonthValues = [];
    espRows.forEach(e => {
      months.forEach(ym => { if (e.byMonth[ym]) allMonthValues.push(e.byMonth[ym]); });
    });
    const maxMonthVal = allMonthValues.length ? Math.max(...allMonthValues) : 1;

    // Build interleaved columns: months + year-total inserted after last month of each year
    const columns = [];
    months.forEach((ym, i) => {
      const year = ym.substring(0, 4);
      const mn = parseInt(ym.substring(5, 7), 10);
      const label = `${monthNames[mn - 1]} ${year}`;
      const isNewYear = i === 0 || months[i - 1].substring(0, 4) !== year;
      columns.push({ type: 'month', ym, label, year, isNewYear });
      // If next month belongs to a different year (or this is the last month), insert year total
      const nextYm = months[i + 1];
      if (!nextYm || nextYm.substring(0, 4) !== year) {
        columns.push({ type: 'yearTotal', year, label: `Total ${year}` });
      }
    });

    return { espRows, months, monthLabels, columns, years, grandTotal, maxMonthVal };
  }, [productionRecords, startDateFilter]);

  // ─── Indicadores de Gestión Data ────────────────────────────────────────────
  const indicadoresData = useMemo(() => {
    const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const source = baseRecords.filter(r => {
      const ym = r.fecha_atencion ? String(r.fecha_atencion).substring(0, 7) : null;
      return ym && ym >= '2025-01';
    });

    const isNSP = r => {
      const ea = (r.estado_atencion || '').toUpperCase();
      const eh = (r.estado_hora || '').toUpperCase();
      return ea.includes('NO SE PRESENTO') || ea.includes('NO SE PRESENT\u00d3') || eh.includes('NO SE PRESENTO') || eh.includes('NO SE PRESENT\u00d3');
    };

    // Months present in the dataset
    const months = [...new Set(source.map(r => String(r.fecha_atencion).substring(0, 7)))].sort();

    // ── NSP ──────────────────────────────────────────────────────────────────
    const totalCitados = source.length;
    const totalNSP = source.filter(isNSP).length;
    const pctNSP = totalCitados ? parseFloat(((totalNSP / totalCitados) * 100).toFixed(1)) : 0;

    const nspTrend = months.map(ym => {
      const mn = parseInt(ym.substring(5, 7), 10);
      const yr = ym.substring(0, 4);
      const recs = source.filter(r => String(r.fecha_atencion).substring(0, 7) === ym);
      const nsp = recs.filter(isNSP).length;
      return { label: `${monthNames[mn - 1]} ${yr}`, value: recs.length ? parseFloat(((nsp / recs.length) * 100).toFixed(1)) : 0, nsp, total: recs.length };
    });

    // ── Pertinencia ──────────────────────────────────────────────────────────
    // Only records that have a pertinencia value (S or N)
    const withPert = source.filter(r => r.pertinencia && (r.pertinencia.toUpperCase() === 'S' || r.pertinencia.toUpperCase() === 'N'));
    const pertS = withPert.filter(r => r.pertinencia.toUpperCase() === 'S').length;
    const pctPert = withPert.length ? parseFloat(((pertS / withPert.length) * 100).toFixed(1)) : 0;

    const pertTrend = months.map(ym => {
      const mn = parseInt(ym.substring(5, 7), 10);
      const yr = ym.substring(0, 4);
      const recs = withPert.filter(r => String(r.fecha_atencion).substring(0, 7) === ym);
      const s = recs.filter(r => r.pertinencia.toUpperCase() === 'S').length;
      return { label: `${monthNames[mn - 1]} ${yr}`, value: recs.length ? parseFloat(((s / recs.length) * 100).toFixed(1)) : 0, pertS: s, total: recs.length };
    });
    // ── Pertinencia según Tiempo (MINSAL) ────────────────────────────────────
    // MINSAL: % de derivaciones pertinentes (S) atendidas dentro del tiempo
    // establecido según clasificación de urgencia (TIEMPO_ESTABLECIDO_PERTINENCIA).
    // Meta: ≥ 80% de pertinentes deben tener tiempo establecido registrado.
    const withPertTiempo = withPert.filter(r =>
      r.pertinencia.toUpperCase() === 'S' && r.tiempo_establecido_pertinencia
    );
    const pctPertTiempo = withPert.length ? parseFloat(((withPertTiempo.length / withPert.length) * 100).toFixed(1)) : 0;
    const tiempoMap = {};
    withPert.forEach(r => {
      const t = (r.tiempo_establecido_pertinencia || 'Sin categoría').toUpperCase().trim() || 'Sin categoría';
      if (!tiempoMap[t]) tiempoMap[t] = { total: 0, pertS: 0 };
      tiempoMap[t].total += 1;
      if (r.pertinencia.toUpperCase() === 'S') tiempoMap[t].pertS += 1;
    });
    const pertTiempoByCategoria = Object.entries(tiempoMap)
      .map(([cat, d]) => ({ cat, total: d.total, pertS: d.pertS, pct: d.total ? parseFloat(((d.pertS / d.total) * 100).toFixed(1)) : 0 }))
      .sort((a, b) => b.total - a.total);
    const pertTiempoTrend = months.map(ym => {
      const mn = parseInt(ym.substring(5, 7), 10); const yr = ym.substring(0, 4);
      const recs = withPert.filter(r => String(r.fecha_atencion).substring(0, 7) === ym);
      const n = recs.filter(r => r.pertinencia.toUpperCase() === 'S' && r.tiempo_establecido_pertinencia).length;
      return { label: `${monthNames[mn - 1]} ${yr}`, value: recs.length ? parseFloat(((n / recs.length) * 100).toFixed(1)) : 0, n, total: recs.length };
    });

    // ── Altas (MINSAL) ───────────────────────────────────────────────────────
    // MINSAL: % de pacientes atendidos en especialidad que reciben alta médica
    // (resolución del problema, sin seguimiento en especialidad).
    // Campo fuente: accion_a_tomar contiene "ALTA" / total atenciones ejecutadas.
    // Meta MINSAL referencial: ≥ 30% (varía por especialidad, Circular MINSAL A15/17).
    const ejecutados = source.filter(r =>
      (r.estado_atencion || '').toUpperCase().trim() === 'SE PRESENTO' ||
      (r.estado_hora || '').toUpperCase().trim() === 'EJECUTADA'
    );
    const conAlta = ejecutados.filter(r => (r.accion_a_tomar || '').toUpperCase().includes('ALTA'));
    const pctAltas = ejecutados.length ? parseFloat(((conAlta.length / ejecutados.length) * 100).toFixed(1)) : 0;
    const altasTrend = months.map(ym => {
      const mn = parseInt(ym.substring(5, 7), 10); const yr = ym.substring(0, 4);
      const ejec = ejecutados.filter(r => String(r.fecha_atencion).substring(0, 7) === ym);
      const n = ejec.filter(r => (r.accion_a_tomar || '').toUpperCase().includes('ALTA')).length;
      return { label: `${monthNames[mn - 1]} ${yr}`, value: ejec.length ? parseFloat(((n / ejec.length) * 100).toFixed(1)) : 0, n, total: ejec.length };
    });
    const espAltaMap = {};
    ejecutados.forEach(r => {
      const esp = r.especialidad || 'Sin especialidad';
      if (!espAltaMap[esp]) espAltaMap[esp] = { total: 0, altas: 0 };
      espAltaMap[esp].total += 1;
      if ((r.accion_a_tomar || '').toUpperCase().includes('ALTA')) espAltaMap[esp].altas += 1;
    });
    const altasByEsp = Object.entries(espAltaMap)
      .map(([esp, d]) => ({ esp, total: d.total, altas: d.altas, pct: d.total ? parseFloat(((d.altas / d.total) * 100).toFixed(1)) : 0 }))
      .filter(x => x.total >= 10).sort((a, b) => b.pct - a.pct);

    // ── Contrarreferencia (MINSAL) ───────────────────────────────────────────
    // MINSAL: % de pacientes en especialidad que son contrarreferidos al nivel
    // primario (APS), indicando resolución en secundario y continuidad en APS.
    // Campo: contrareferir = 'S' / total ejecutados.
    // Meta MINSAL referencial: ≥ 20% (Circular N°A15/17 MINSAL).
    const isContraref = r => {
      const v = (r.contrareferir || '').toUpperCase().trim();
      return v === 'S' || v === 'SI' || v === '1';
    };
    const conContraref = ejecutados.filter(isContraref);
    const pctContraref = ejecutados.length ? parseFloat(((conContraref.length / ejecutados.length) * 100).toFixed(1)) : 0;
    const contrarefTrend = months.map(ym => {
      const mn = parseInt(ym.substring(5, 7), 10); const yr = ym.substring(0, 4);
      const ejec = ejecutados.filter(r => String(r.fecha_atencion).substring(0, 7) === ym);
      const n = ejec.filter(isContraref).length;
      return { label: `${monthNames[mn - 1]} ${yr}`, value: ejec.length ? parseFloat(((n / ejec.length) * 100).toFixed(1)) : 0, n, total: ejec.length };
    });
    const espContrarefMap = {};
    ejecutados.forEach(r => {
      const esp = r.especialidad || 'Sin especialidad';
      if (!espContrarefMap[esp]) espContrarefMap[esp] = { total: 0, cr: 0 };
      espContrarefMap[esp].total += 1;
      if (isContraref(r)) espContrarefMap[esp].cr += 1;
    });
    const contrarefByEsp = Object.entries(espContrarefMap)
      .map(([esp, d]) => ({ esp, total: d.total, cr: d.cr, pct: d.total ? parseFloat(((d.cr / d.total) * 100).toFixed(1)) : 0 }))
      .filter(x => x.total >= 10).sort((a, b) => b.pct - a.pct);

    // ── Insights por especialidad NSP / Pertinencia ──────────────────────────
    const espNspMap = {};
    source.forEach(r => {
      const esp = r.especialidad || 'Sin especialidad';
      if (!espNspMap[esp]) espNspMap[esp] = { total: 0, nsp: 0 };
      espNspMap[esp].total += 1;
      if (isNSP(r)) espNspMap[esp].nsp += 1;
    });
    const nspByEsp = Object.entries(espNspMap)
      .map(([esp, d]) => ({ esp, total: d.total, nsp: d.nsp, pct: d.total ? parseFloat(((d.nsp / d.total) * 100).toFixed(1)) : 0 }))
      .filter(x => x.total >= 10).sort((a, b) => b.pct - a.pct);

    const espPertMap = {};
    withPert.forEach(r => {
      const esp = r.especialidad || 'Sin especialidad';
      if (!espPertMap[esp]) espPertMap[esp] = { total: 0, pertS: 0 };
      espPertMap[esp].total += 1;
      if (r.pertinencia.toUpperCase() === 'S') espPertMap[esp].pertS += 1;
    });
    const pertByEsp = Object.entries(espPertMap)
      .map(([esp, d]) => ({ esp, total: d.total, pertS: d.pertS, pct: d.total ? parseFloat(((d.pertS / d.total) * 100).toFixed(1)) : 0 }))
      .filter(x => x.total >= 5).sort((a, b) => a.pct - b.pct);

    return {
      nsp: { pct: pctNSP, total: totalCitados, n: totalNSP, trend: nspTrend, byEsp: nspByEsp },
      pertinencia: { pct: pctPert, total: withPert.length, n: pertS, trend: pertTrend, byEsp: pertByEsp },
      pertinenciaTiempo: { pct: pctPertTiempo, total: withPert.length, n: withPertTiempo.length, trend: pertTiempoTrend, byCategoria: pertTiempoByCategoria },
      altas: { pct: pctAltas, total: ejecutados.length, n: conAlta.length, trend: altasTrend, byEsp: altasByEsp },
      contrarreferencia: { pct: pctContraref, total: ejecutados.length, n: conContraref.length, trend: contrarefTrend, byEsp: contrarefByEsp }
    };
  }, [baseRecords]);


  const exportCSV = () => {
    const headers = ['Fecha Atención','Especialidad','Profesional','Tipo Consulta','Actividad','Diagnóstico 1','Estado Atención','Estado Hora','Sobrecupo','Videoconsulta'];
    const rows = baseRecords.map(r => [
      r.fecha_atencion ? String(r.fecha_atencion).substring(0, 10) : '',
      r.especialidad, r.profesional_nombre, r.tipo_consulta, r.actividad,
      r.diagnostico_1, r.estado_atencion, r.estado_hora, r.sobrecupo, r.videoconsulta
    ]);
    const csv = [headers, ...rows].map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `actividades_medicina_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16, color: '#64748b' }}>
      <div style={{ width: 48, height: 48, border: '4px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ fontWeight: 600 }}>Cargando Actividades de Medicina de Especialidad…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: 650, margin: '80px auto', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 16, padding: 32, textAlign: 'center' }}>
      <AlertTriangle size={44} color="#f97316" style={{ marginBottom: 12 }} />
      <h2 style={{ color: '#9a3412', fontWeight: 800, marginBottom: 8 }}>Datos de Medicina de Especialidad no disponibles</h2>
      <p style={{ color: '#9a3412', marginBottom: 16 }}>
        No se encontró el archivo de cache. Ejecuta la extracción desde la base de datos Oracle con VPN activa:
      </p>
      <code style={{ background: '#fef3c7', padding: '10px 16px', borderRadius: 8, display: 'block', marginBottom: 20, fontWeight: 700, fontSize: '0.9rem' }}>
        node fetch-actividades-medicina.cjs
      </code>
      <p style={{ color: '#78350f', fontSize: '0.85rem' }}>O ejecuta el archivo ejecutable: <b>update-actividades-medicina.bat</b></p>
      <button onClick={loadData} style={{ marginTop: 16, background: '#6366f1', color: 'white', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
        Reintentar conexión
      </button>
    </div>
  );

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto', fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={onBack} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>
            <ArrowLeft size={16} /> Volver
          </button>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Stethoscope color="#6366f1" size={28} /> Actividades Medicina de Especialidad
            </h1>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>
              Hospital de Villarrica · Fuente: HOJA_DIARIA Oracle DWH ·
              Actualizado: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString('es-CL') : '—'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
            <Download size={15} /> Exportar CSV
          </button>
          <button onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#6366f1', color: 'white', border: 'none', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
            <RefreshCw size={15} /> Recargar
          </button>
        </div>
      </div>

      {/* Multi-Filters bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center', background: 'white', padding: '16px 20px', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
        <MultiSelect label="Especialidad" options={optsEsp} selected={espFiltro} onChange={setEspFiltro} color="#6366f1" />
        <MultiSelect label="Profesional" options={optsProf} selected={profFiltro} onChange={setProfFiltro} color="#0ea5e9" />
        <MultiSelect label="Tipo Consulta" options={optsTipoConsulta} selected={tipoConsultaFiltro} onChange={setTipoConsultaFiltro} color="#10b981" />
        <MultiSelect label="Estado Hora" options={optsEstadoHora} selected={estadoHoraFiltro} onChange={setEstadoHoraFiltro} color="#f59e0b" />
        <MultiSelect label="Pertinencia" options={optsPertinencia} selected={pertinenciaFiltro} onChange={setPertinenciaFiltro} color="#8b5cf6" />

        {/* Toggles */}
        <button
          onClick={() => setSoloSobrecupo(!soloSobrecupo)}
          style={{
            background: soloSobrecupo ? '#fee2e2' : '#f8fafc',
            color: soloSobrecupo ? '#dc2626' : '#64748b',
            border: `1px solid ${soloSobrecupo ? '#fca5a5' : '#e2e8f0'}`,
            borderRadius: 10, padding: '7px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem'
          }}
        >
          🚨 Sobrecupos
        </button>
        <button
          onClick={() => setSoloVideoconsulta(!soloVideoconsulta)}
          style={{
            background: soloVideoconsulta ? '#e0f2fe' : '#f8fafc',
            color: soloVideoconsulta ? '#0284c7' : '#64748b',
            border: `1px solid ${soloVideoconsulta ? '#7dd3fc' : '#e2e8f0'}`,
            borderRadius: 10, padding: '7px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5
          }}
        >
          <Video size={13} /> Videoconsultas
        </button>

        {(espFiltro.length || profFiltro.length || tipoConsultaFiltro.length || estadoHoraFiltro.length || pertinenciaFiltro.length || soloSobrecupo || soloVideoconsulta) && (
          <button onClick={() => { setEspFiltro([]); setProfFiltro([]); setTipoConsultaFiltro([]); setEstadoHoraFiltro([]); setPertinenciaFiltro([]); setSoloSobrecupo(false); setSoloVideoconsulta(false); }}
            style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, padding: '7px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>
            ✕ Limpiar Filtros
          </button>
        )}
      </div>

      {/* KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <KPICard icon={<Activity size={18} />} label="Total Atenciones" value={kpis.total.toLocaleString('es-CL')} color="#6366f1" sub="Registros Hoja Diaria" />
        <KPICard icon={<Stethoscope size={18} />} label="Consultas Nuevas" value={kpis.nuevas.toLocaleString('es-CL')} color="#10b981" sub={`vs ${kpis.controles.toLocaleString('es-CL')} Controles`} />
        <KPICard icon={<AlertTriangle size={18} />} label="Sobrecupos" value={kpis.sobrecupos.toLocaleString('es-CL')} color="#ef4444" sub={`${kpis.pctSobrecupo}% del total`} />
        <KPICard icon={<Video size={18} />} label="Videoconsultas" value={kpis.video.toLocaleString('es-CL')} color="#0ea5e9" sub={`${kpis.pctVideo}% modalidad remota`} />
        <KPICard icon={<UserCheck size={18} />} label="Atenciones GES / AUGE" value={kpis.auge.toLocaleString('es-CL')} color="#8b5cf6" sub="Garantías Explícitas" />
      </div>

      {/* Navigation Tabs Bar */}
      <div style={{ marginBottom: 24, background: '#0f172a', borderRadius: 16, padding: '8px 10px', boxShadow: '0 8px 30px rgba(15,23,42,0.18)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 8 }}>
          <Layers size={17} color="#818cf8" />
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Vistas de Análisis:</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            ['resumen', 'Resumen General', <PieIcon size={14} />],
            ['indicadores', 'Indicadores de Gestión', <BarChart2 size={14} />]
          ].map(([id, label, icon]) => {
            const isActive = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 18px', borderRadius: 11, border: 'none', cursor: 'pointer',
                fontWeight: isActive ? 800 : 600, fontSize: '0.8rem',
                background: isActive ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'rgba(255,255,255,0.06)',
                color: isActive ? '#ffffff' : '#cbd5e1',
                boxShadow: isActive ? '0 4px 14px rgba(99,102,241,0.45)' : 'none',
                transition: 'all 0.2s ease', outline: 'none'
              }}>
                {icon}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab: Resumen */}
      {activeTab === 'resumen' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Main Chart: Evolución Mensual por Tipo de Consulta */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 14 }}>
              <div>
                <h3 style={{ fontWeight: 800, color: '#1e293b', margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrendingUp size={20} color="#6366f1" /> Evolución Mensual de Actividades por Tipo de Consulta
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0', fontWeight: 500 }}>
                  Comportamiento mes a mes desde Enero 2025 hasta la fecha · Colores por Tipo de Consulta · Pasa el cursor para ver desglose (N y %)
                </p>
              </div>

              {/* Chart Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', background: '#f1f5f9', padding: 3, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <button
                    onClick={() => setStartDateFilter('2025-01')}
                    style={{
                      padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      fontWeight: startDateFilter === '2025-01' ? 800 : 600, fontSize: '0.78rem',
                      background: startDateFilter === '2025-01' ? '#ffffff' : 'transparent',
                      color: startDateFilter === '2025-01' ? '#4f46e5' : '#64748b',
                      boxShadow: startDateFilter === '2025-01' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    📅 Ene 2025 - Hoy
                  </button>
                  <button
                    onClick={() => setStartDateFilter('all')}
                    style={{
                      padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      fontWeight: startDateFilter === 'all' ? 800 : 600, fontSize: '0.78rem',
                      background: startDateFilter === 'all' ? '#ffffff' : 'transparent',
                      color: startDateFilter === 'all' ? '#4f46e5' : '#64748b',
                      boxShadow: startDateFilter === 'all' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    Histórico Completo
                  </button>
                </div>

                <div style={{ display: 'flex', background: '#f1f5f9', padding: 3, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <button
                    onClick={() => setChartMode('stacked')}
                    style={{
                      padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      fontWeight: chartMode === 'stacked' ? 800 : 600, fontSize: '0.78rem',
                      background: chartMode === 'stacked' ? '#6366f1' : 'transparent',
                      color: chartMode === 'stacked' ? '#ffffff' : '#64748b',
                      boxShadow: chartMode === 'stacked' ? '0 2px 6px rgba(99,102,241,0.35)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    Apiladas (Acumulado)
                  </button>
                  <button
                    onClick={() => setChartMode('grouped')}
                    style={{
                      padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      fontWeight: chartMode === 'grouped' ? 800 : 600, fontSize: '0.78rem',
                      background: chartMode === 'grouped' ? '#6366f1' : 'transparent',
                      color: chartMode === 'grouped' ? '#ffffff' : '#64748b',
                      boxShadow: chartMode === 'grouped' ? '0 2px 6px rgba(99,102,241,0.35)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    Agrupadas (Comparativo)
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 20, background: '#f8fafc', padding: '10px 16px', borderRadius: 12, border: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Total Período Seleccionado: <strong style={{ color: '#1e293b' }}>{monthlyEvolution.totalPeriodo.toLocaleString('es-CL')}</strong>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Promedio Mensual: <strong style={{ color: '#6366f1' }}>{monthlyEvolution.avgMonthly.toLocaleString('es-CL')}</strong> atenciones/mes
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Meses Visualizados: <strong style={{ color: '#0ea5e9' }}>{monthlyEvolution.chartData.length}</strong>
              </div>
            </div>

            {/* Recharts BarChart */}
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={monthlyEvolution.chartData} margin={{ top: 25, right: 20, left: 10, bottom: 25 }} barCategoryGap="3%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="monthLabel"
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  angle={-25}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                />
                <Tooltip content={<MonthlyEvolutionTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 14, fontSize: 11, fontWeight: 600 }} />

                {monthlyEvolution.tipoKeys.map((tipo, idx) => (
                  <Bar
                    key={tipo}
                    dataKey={tipo}
                    name={tipo}
                    fill={getTipoColor(tipo, idx)}
                    stackId={chartMode === 'stacked' ? 'a' : undefined}
                    radius={chartMode === 'stacked' && idx === monthlyEvolution.tipoKeys.length - 1 ? [4, 4, 0, 0] : (chartMode === 'grouped' ? [4, 4, 0, 0] : undefined)}
                  />
                ))}

                {/* Show total count on top of stacked bars */}
                {chartMode === 'stacked' && (
                  <Bar dataKey="total" name="Total Mes" fill="transparent" isAnimationActive={false}>
                    <LabelList
                      dataKey="total"
                      position="top"
                      formatter={val => val ? val.toLocaleString('es-CL') : ''}
                      style={{ fill: '#1e293b', fontWeight: 800, fontSize: 10 }}
                    />
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pivot Table: Especialidad × Tipo Consulta × Mes */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontWeight: 800, color: '#1e293b', margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Layers size={18} color="#6366f1" /> Producción por Especialidad · Tipo de Consulta · Actividad × Mes
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 0' }}>
                  Solo atenciones con estado <strong style={{ color: '#10b981' }}>SE PRESENTÓ</strong> · 3 niveles: Especialidad → Tipo Consulta → Actividad · Intensidad de celda = volumen relativo
                </p>
              </div>
              <button
                onClick={() => { setPivotExpandedEsps(new Set()); setPivotExpandedTipos(new Set()); }}
                style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Colapsar todo
              </button>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', tableLayout: 'auto' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: 'white' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'left', position: 'sticky', left: 0, background: '#0f172a', zIndex: 2, minWidth: 220, borderRight: '1px solid rgba(255,255,255,0.1)' }}>Especialidad / Tipo Consulta / Actividad</th>
                    {pivotData.columns.map((col, i) => {
                      if (col.type === 'month') return (
                        <th key={col.ym} style={{
                          padding: '6px 8px', fontWeight: 700, textAlign: 'right', whiteSpace: 'nowrap', minWidth: 62,
                          borderLeft: col.isNewYear && i > 0 ? '2px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.08)',
                          fontSize: '0.7rem', color: '#cbd5e1'
                        }}>{col.label}</th>
                      );
                      // yearTotal column
                      return (
                        <th key={`yr-h-${col.year}`} style={{
                          padding: '6px 10px', fontWeight: 800, textAlign: 'right',
                          background: '#1e293b', borderLeft: '2px solid #4f46e5',
                          whiteSpace: 'nowrap', fontSize: '0.72rem', color: '#a5b4fc'
                        }}>{col.label}</th>
                      );
                    })}
                    <th style={{ padding: '6px 10px', fontWeight: 800, textAlign: 'right', background: '#1e293b', borderLeft: '2px solid #6366f1', whiteSpace: 'nowrap', fontSize: '0.72rem', color: '#a5b4fc' }}>Total</th>
                    <th style={{ padding: '6px 10px', fontWeight: 800, textAlign: 'right', background: '#1e293b', borderLeft: '1px solid rgba(255,255,255,0.12)', whiteSpace: 'nowrap', fontSize: '0.72rem', color: '#fbbf24' }}>% Tabla</th>
                  </tr>
                </thead>
                <tbody>
                  {pivotData.espRows.map((espRow, ei) => {
                    const isExpanded = pivotExpandedEsps.has(espRow.esp);
                    const toggleEsp = () => setPivotExpandedEsps(prev => {
                      const next = new Set(prev);
                      if (next.has(espRow.esp)) next.delete(espRow.esp); else next.add(espRow.esp);
                      return next;
                    });
                    const espPct = pivotData.grandTotal.total ? ((espRow.total / pivotData.grandTotal.total) * 100).toFixed(1) : '0.0';
                    return (
                      <React.Fragment key={espRow.esp}>
                        {/* Especialidad Row */}
                        <tr
                          onClick={toggleEsp}
                          style={{ cursor: 'pointer', background: ei % 2 === 0 ? '#f8fafc' : '#ffffff', borderBottom: '1px solid #e2e8f0' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f0f7ff'}
                          onMouseLeave={e => e.currentTarget.style.background = ei % 2 === 0 ? '#f8fafc' : '#ffffff'}
                        >
                          <td style={{
                            padding: '9px 14px', fontWeight: 800, color: '#1e293b',
                            position: 'sticky', left: 0, background: 'inherit', zIndex: 1,
                            borderRight: '1px solid #e2e8f0',
                            display: 'flex', alignItems: 'center', gap: 7
                          }}>
                            <span style={{
                              width: 18, height: 18, borderRadius: 5, background: isExpanded ? '#6366f1' : '#e2e8f0',
                              color: isExpanded ? 'white' : '#64748b',
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0, fontSize: 10, fontWeight: 900, transition: 'all 0.15s'
                            }}>
                              {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                            </span>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{espRow.esp}</span>
                          </td>
                          {pivotData.columns.map(col => {
                            if (col.type === 'month') {
                              const val = espRow.byMonth[col.ym] || 0;
                              const intensity = pivotData.maxMonthVal ? val / pivotData.maxMonthVal : 0;
                              // 40% more transparent: base 0.048, scale 0.33 (was 0.08+0.55)
                              const bg = intensity > 0 ? `rgba(99,102,241,${(0.048 + intensity * 0.33).toFixed(3)})` : 'transparent';
                              return (
                                <td key={col.ym} style={{ padding: '7px 8px', textAlign: 'right', fontWeight: val > 0 ? 700 : 400, color: intensity > 0.65 ? '#312e81' : '#475569', background: bg, transition: 'background 0.1s', whiteSpace: 'nowrap' }}>
                                  {val > 0 ? val.toLocaleString('es-CL') : <span style={{ color: '#e2e8f0' }}>—</span>}
                                </td>
                              );
                            }
                            // yearTotal column
                            return (
                              <td key={`${espRow.esp}-yr-${col.year}`} style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 800, color: '#4f46e5', borderLeft: '2px solid #ede9fe', background: '#f5f3ff', whiteSpace: 'nowrap' }}>
                                {(espRow.byYear[col.year] || 0).toLocaleString('es-CL')}
                              </td>
                            );
                          })}
                          <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 900, color: '#1e293b', borderLeft: '2px solid #c7d2fe', background: '#eef2ff', whiteSpace: 'nowrap' }}>
                            {espRow.total.toLocaleString('es-CL')}
                          </td>
                          <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 800, color: '#b45309', borderLeft: '1px solid #fde68a', background: '#fffbeb', whiteSpace: 'nowrap' }}>
                            {espPct}%
                          </td>
                        </tr>

                        {/* Tipo Consulta Rows (expanded) */}
                        {isExpanded && espRow.tipoRows.map((tipoRow, ti) => {
                          const tipoKey = `${espRow.esp}|||${tipoRow.tipo}`;
                          const isTipoExpanded = pivotExpandedTipos.has(tipoKey);
                          const toggleTipo = (e) => {
                            e.stopPropagation();
                            setPivotExpandedTipos(prev => {
                              const next = new Set(prev);
                              if (next.has(tipoKey)) next.delete(tipoKey); else next.add(tipoKey);
                              return next;
                            });
                          };
                          const tipoPct = pivotData.grandTotal.total ? ((tipoRow.total / pivotData.grandTotal.total) * 100).toFixed(1) : '0.0';
                          return (
                            <React.Fragment key={tipoKey}>
                              {/* Tipo Row */}
                              <tr
                                onClick={toggleTipo}
                                style={{ background: '#f0f9ff', borderBottom: '1px solid #e0f2fe', cursor: 'pointer' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#e0f7ff'}
                                onMouseLeave={e => e.currentTarget.style.background = '#f0f9ff'}
                              >
                                <td style={{
                                  padding: '7px 14px 7px 34px', fontWeight: 700, color: '#0369a1',
                                  position: 'sticky', left: 0, background: 'inherit', zIndex: 1,
                                  borderRight: '1px solid #e2e8f0',
                                  display: 'flex', alignItems: 'center', gap: 6,
                                  fontSize: '0.73rem'
                                }}>
                                  <span style={{
                                    width: 15, height: 15, borderRadius: 4, background: isTipoExpanded ? '#0ea5e9' : '#bae6fd',
                                    color: isTipoExpanded ? 'white' : '#0369a1',
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0, transition: 'all 0.15s'
                                  }}>
                                    {isTipoExpanded ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
                                  </span>
                                  <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: getTipoColor(tipoRow.tipo, ti), flexShrink: 0 }} />
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tipoRow.tipo}</span>
                                </td>
                                {pivotData.columns.map(col => {
                                  if (col.type === 'month') {
                                    const val = tipoRow.byMonth[col.ym] || 0;
                                    const intensity = pivotData.maxMonthVal ? val / pivotData.maxMonthVal : 0;
                                    const bg = intensity > 0 ? `rgba(14,165,233,${(0.03 + intensity * 0.27).toFixed(3)})` : 'transparent';
                                    return (
                                      <td key={col.ym} style={{ padding: '6px 8px', textAlign: 'right', fontWeight: val > 0 ? 600 : 400, color: intensity > 0.65 ? '#075985' : '#64748b', background: bg, fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                                        {val > 0 ? val.toLocaleString('es-CL') : <span style={{ color: '#e2e8f0' }}>—</span>}
                                      </td>
                                    );
                                  }
                                  return (
                                    <td key={`${tipoRow.tipo}-yr-${col.year}`} style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 700, color: '#0369a1', borderLeft: '2px solid #bae6fd', background: '#f0f9ff', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                                      {(tipoRow.byYear[col.year] || 0).toLocaleString('es-CL')}
                                    </td>
                                  );
                                })}
                                <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 800, color: '#0369a1', borderLeft: '2px solid #bae6fd', background: '#e0f2fe', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                                  {tipoRow.total.toLocaleString('es-CL')}
                                </td>
                                <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 700, color: '#92400e', borderLeft: '1px solid #fde68a', background: '#fefce8', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                                  {tipoPct}%
                                </td>
                              </tr>

                              {/* Actividad / Prestación Rows (expanded from tipo) */}
                              {isTipoExpanded && tipoRow.actRows.map((actRow, ai) => {
                                const actPct = pivotData.grandTotal.total ? ((actRow.total / pivotData.grandTotal.total) * 100).toFixed(2) : '0.00';
                                return (
                                  <tr key={`${tipoKey}-${actRow.act}`} style={{ background: '#f8fffe', borderBottom: '1px solid #e0fdf4' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#ccfbf1'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#f8fffe'}
                                  >
                                    <td style={{
                                      padding: '5px 14px 5px 58px', fontWeight: 500, color: '#047857',
                                      position: 'sticky', left: 0, background: 'inherit', zIndex: 1,
                                      borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 260,
                                      fontSize: '0.68rem', fontStyle: 'italic'
                                    }}>
                                      <span style={{ display: 'inline-block', width: 4, height: 4, borderRadius: '50%', background: '#10b981', marginRight: 7, flexShrink: 0, verticalAlign: 'middle' }} />
                                      {actRow.act}
                                    </td>
                                    {pivotData.columns.map(col => {
                                      if (col.type === 'month') {
                                        const val = actRow.byMonth[col.ym] || 0;
                                        const intensity = pivotData.maxMonthVal ? val / pivotData.maxMonthVal : 0;
                                        const bg = intensity > 0 ? `rgba(16,185,129,${(0.04 + intensity * 0.22).toFixed(3)})` : 'transparent';
                                        return (
                                          <td key={col.ym} style={{ padding: '5px 8px', textAlign: 'right', fontWeight: val > 0 ? 500 : 400, color: intensity > 0.65 ? '#065f46' : '#6b7280', background: bg, fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
                                            {val > 0 ? val.toLocaleString('es-CL') : <span style={{ color: '#d1fae5' }}>—</span>}
                                          </td>
                                        );
                                      }
                                      return (
                                        <td key={`${actRow.act}-yr-${col.year}`} style={{ padding: '5px 10px', textAlign: 'right', fontWeight: 600, color: '#047857', borderLeft: '2px solid #a7f3d0', background: '#ecfdf5', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
                                          {(actRow.byYear[col.year] || 0).toLocaleString('es-CL')}
                                        </td>
                                      );
                                    })}
                                    <td style={{ padding: '5px 10px', textAlign: 'right', fontWeight: 700, color: '#047857', borderLeft: '2px solid #a7f3d0', background: '#d1fae5', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
                                      {actRow.total.toLocaleString('es-CL')}
                                    </td>
                                    <td style={{ padding: '5px 10px', textAlign: 'right', fontWeight: 600, color: '#78350f', borderLeft: '1px solid #fde68a', background: '#fffbeb', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
                                      {actPct}%
                                    </td>
                                  </tr>
                                );
                              })}
                            </React.Fragment>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}

                  {/* Grand Total Row */}
                  <tr style={{ background: '#0f172a', borderTop: '2px solid #6366f1' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 900, color: '#ffffff', position: 'sticky', left: 0, background: '#0f172a', zIndex: 1, borderRight: '1px solid rgba(255,255,255,0.15)', fontSize: '0.8rem' }}>
                      🏥 TOTAL GENERAL
                    </td>
                    {pivotData.columns.map(col => {
                      if (col.type === 'month') return (
                        <td key={`grand-${col.ym}`} style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 800, color: '#e2e8f0', borderLeft: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap', fontSize: '0.76rem' }}>
                          {(pivotData.grandTotal.byMonth[col.ym] || 0).toLocaleString('es-CL')}
                        </td>
                      );
                      return (
                        <td key={`grand-yr-${col.year}`} style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 900, color: '#a5b4fc', borderLeft: '2px solid #6366f1', background: '#1e1b4b', whiteSpace: 'nowrap', fontSize: '0.76rem' }}>
                          {(pivotData.grandTotal.byYear[col.year] || 0).toLocaleString('es-CL')}
                        </td>
                      );
                    })}
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 900, color: '#ffffff', borderLeft: '2px solid #818cf8', background: '#312e81', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                      {pivotData.grandTotal.total.toLocaleString('es-CL')}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 900, color: '#fbbf24', borderLeft: '1px solid rgba(255,255,255,0.12)', background: '#1c1917', whiteSpace: 'nowrap', fontSize: '0.76rem' }}>
                      100%
                    </td>
                  </tr>
                </tbody>

              </table>
            </div>
          </div>
        </div>
      )}


      {/* Tab: Indicadores de Gestión */}
      {activeTab === 'indicadores' && (() => {
        const indicators = [
          {
            key: 'nsp',
            title: '% No Se Presentó (NSP)',
            shortTitle: '% NSP',
            icon: XCircle,
            color: '#ef4444',
            colorBg: '#fef2f2',
            borderColor: '#fca5a5',
            definition: 'Porcentaje de pacientes citados que no asistieron a su consulta médica de especialidad en el período evaluado.',
            formula: 'N° NSP / Total Citados × 100',
            value: `${indicadoresData.nsp.pct}%`,
            sub: `${indicadoresData.nsp.n.toLocaleString('es-CL')} NSP de ${indicadoresData.nsp.total.toLocaleString('es-CL')} citas`,
            trend: indicadoresData.nsp.trend,
            metaLabel: 'Umbral crítico: 20%',
            isGood: (v) => v < 20
          },
          {
            key: 'pertinencia',
            title: '% Pertinencia de Consulta',
            shortTitle: '% Pertinencia',
            icon: CheckCircle2,
            color: '#10b981',
            colorBg: '#f0fdf4',
            borderColor: '#6ee7b7',
            definition: 'Porcentaje de consultas evaluadas en las que el profesional confirmó que la derivación fue pertinente (campo Pertinencia = S).',
            formula: 'N° Pertinentes (S) / Total Evaluados × 100',
            value: `${indicadoresData.pertinencia.pct}%`,
            sub: `${indicadoresData.pertinencia.n.toLocaleString('es-CL')} pertinentes de ${indicadoresData.pertinencia.total.toLocaleString('es-CL')} evaluados`,
            trend: indicadoresData.pertinencia.trend,
            metaLabel: 'Meta: ≥ 80%',
            isGood: (v) => v >= 80
          },
          {
            key: 'pertinenciaTiempo',
            title: '% Pertinencia según Tiempo Establecido',
            shortTitle: '% Pert. Tiempo',
            icon: Timer,
            color: '#f59e0b',
            colorBg: '#fffbeb',
            borderColor: '#fde68a',
            definition: 'MINSAL: % de derivaciones pertinentes (S) con tiempo establecido de atención registrado según urgencia (TIEMPO_ESTABLECIDO_PERTINENCIA).',
            formula: 'N° Pertinentes con Tiempo / Total Evaluados × 100',
            value: `${indicadoresData.pertinenciaTiempo?.pct ?? 0}%`,
            sub: `${(indicadoresData.pertinenciaTiempo?.n ?? 0).toLocaleString('es-CL')} con tiempo de ${(indicadoresData.pertinenciaTiempo?.total ?? 0).toLocaleString('es-CL')} evaluados`,
            trend: indicadoresData.pertinenciaTiempo?.trend ?? [],
            metaLabel: 'Meta: ≥ 80% con tiempo establecido',
            isGood: (v) => v >= 80,
            extraData: indicadoresData.pertinenciaTiempo?.byCategoria ?? []
          },
          {
            key: 'altas',
            title: '% Altas Médicas de Especialidad',
            shortTitle: '% Altas',
            icon: ArrowLeftRight,
            color: '#6366f1',
            colorBg: '#f0f0ff',
            borderColor: '#a5b4fc',
            definition: 'MINSAL (Circular A15/17): % de pacientes atendidos en especialidad que reciben alta médica (resolución sin seguimiento en secundario). Fuente: campo ACCION_A_TOMAR.',
            formula: 'N° Altas / Total Ejecutados × 100',
            value: `${indicadoresData.altas?.pct ?? 0}%`,
            sub: `${(indicadoresData.altas?.n ?? 0).toLocaleString('es-CL')} altas de ${(indicadoresData.altas?.total ?? 0).toLocaleString('es-CL')} ejecutados`,
            trend: indicadoresData.altas?.trend ?? [],
            metaLabel: 'Meta MINSAL referencial: ≥ 30%',
            isGood: (v) => v >= 30,
            byEsp: indicadoresData.altas?.byEsp ?? []
          },
          {
            key: 'contrarreferencia',
            title: '% Contrarreferencia a APS',
            shortTitle: '% Contrarreferencia',
            icon: ChevronRight,
            color: '#0ea5e9',
            colorBg: '#f0f9ff',
            borderColor: '#7dd3fc',
            definition: 'MINSAL (Circular N°A15/17): % de pacientes contrarreferidos al nivel primario (APS) indicando resolución en secundario y continuidad en APS. Fuente: campo CONTRAREFERIR.',
            formula: 'N° Contrarreferidos (S) / Total Ejecutados × 100',
            value: `${indicadoresData.contrarreferencia?.pct ?? 0}%`,
            sub: `${(indicadoresData.contrarreferencia?.n ?? 0).toLocaleString('es-CL')} contrarreferidos de ${(indicadoresData.contrarreferencia?.total ?? 0).toLocaleString('es-CL')} ejecutados`,
            trend: indicadoresData.contrarreferencia?.trend ?? [],
            metaLabel: 'Meta MINSAL referencial: ≥ 20%',
            isGood: (v) => v >= 20,
            byEsp: indicadoresData.contrarreferencia?.byEsp ?? []
          }
        ];

        const active = indicators.find(i => i.key === selectedIndicator) || indicators[0];
        const ActiveIcon = active.icon;
        const trendData = active.trend;
        const lastVal = trendData.length ? trendData[trendData.length - 1].value : 0;
        const good = active.isGood(lastVal);
        const maxVal = trendData.length ? Math.max(...trendData.map(d => d.value)) : 0;
        const minVal = trendData.length ? Math.min(...trendData.map(d => d.value)) : 0;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BarChart2 size={22} color="#6366f1" />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#1e293b' }}>Indicadores de Gestión Clínica</h2>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>Haz clic en un indicador para ver su evolución mensual · Datos desde Ene 2025</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }}>

              {/* LEFT: Indicator cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {indicators.map(ind => {
                  const IndIcon = ind.icon;
                  const isActive = ind.key === selectedIndicator;
                  const indLastVal = ind.trend.length ? ind.trend[ind.trend.length - 1].value : 0;
                  const indGood = ind.isGood(indLastVal);
                  return (
                    <div
                      key={ind.key}
                      onClick={() => setSelectedIndicator(ind.key)}
                      style={{
                        background: isActive ? ind.colorBg : '#ffffff',
                        border: isActive ? `2.5px solid ${ind.color}` : '1.5px solid #e2e8f0',
                        borderLeft: `5px solid ${ind.color}`,
                        borderRadius: 12,
                        padding: '12px 14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isActive ? `0 4px 16px ${ind.color}22` : '0 1px 4px rgba(0,0,0,0.04)',
                        transform: isActive ? 'scale(1.01)' : 'scale(1)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ background: isActive ? ind.color : '#f1f5f9', color: isActive ? 'white' : '#64748b', width: 30, height: 30, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IndIcon size={15} />
                          </div>
                          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: isActive ? '#1e293b' : '#475569' }}>{ind.shortTitle}</span>
                        </div>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: indGood ? '#dcfce7' : '#fef2f2', color: indGood ? '#15803d' : '#dc2626' }}>
                          {indGood ? '✅ OK' : '⚠️ Alerta'}
                        </span>
                      </div>
                      <div style={{ fontSize: '2.2rem', fontWeight: 900, color: ind.color, lineHeight: 1, marginBottom: 4 }}>{ind.value}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 10 }}>{ind.sub}</div>
                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 }}>Definición</div>
                        <div style={{ fontSize: '0.72rem', color: '#475569', lineHeight: 1.4, marginBottom: 8 }}>{ind.definition}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Fórmula:</span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: ind.color, fontStyle: 'italic' }}>{ind.formula}</span>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 4, fontStyle: 'italic' }}>{ind.metaLabel}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RIGHT: Chart panel */}
              <div style={{ background: 'white', borderRadius: 18, padding: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: `1.5px solid ${active.borderColor}`, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div style={{ background: active.color, color: 'white', width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ActiveIcon size={16} />
                      </div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#1e293b' }}>Evolución Mensual: {active.shortTitle}</h3>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>{active.formula} · {active.metaLabel}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: active.color }}>{active.value}</div>
                    <div style={{ fontSize: '0.72rem', color: good ? '#15803d' : '#dc2626', fontWeight: 700 }}>
                      {good ? '✅ Dentro del umbral' : '⚠️ Fuera del umbral'}
                    </div>
                  </div>
                </div>

                {/* Line Chart */}
                <div style={{ minHeight: 300 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData} margin={{ top: 20, right: 24, left: 0, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} angle={-35} textAnchor="end" height={55} interval={0} />
                      <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: '#64748b' }} domain={[dataMin => Math.max(0, Math.floor(dataMin - 5)), dataMax => Math.min(100, Math.ceil(dataMax + 5))]} />
                      {active.key === 'nsp' && <ReferenceLine y={20} stroke="#ef444488" strokeDasharray="6 3" label={{ value: 'Umbral 20%', position: 'right', fontSize: 10, fill: '#ef4444', fontWeight: 700 }} />}
                      {active.key === 'pertinencia' && <ReferenceLine y={80} stroke="#10b98188" strokeDasharray="6 3" label={{ value: 'Meta 80%', position: 'right', fontSize: 10, fill: '#10b981', fontWeight: 700 }} />}
                      {active.key === 'pertinenciaTiempo' && <ReferenceLine y={80} stroke="#f59e0b88" strokeDasharray="6 3" label={{ value: 'Meta 80%', position: 'right', fontSize: 10, fill: '#f59e0b', fontWeight: 700 }} />}
                      {active.key === 'altas' && <ReferenceLine y={30} stroke="#6366f188" strokeDasharray="6 3" label={{ value: 'Meta 30%', position: 'right', fontSize: 10, fill: '#6366f1', fontWeight: 700 }} />}
                      {active.key === 'contrarreferencia' && <ReferenceLine y={20} stroke="#0ea5e988" strokeDasharray="6 3" label={{ value: 'Meta 20%', position: 'right', fontSize: 10, fill: '#0ea5e9', fontWeight: 700 }} />}
                      <Tooltip
                        formatter={(v) => [`${v}%`, active.shortTitle]}
                        contentStyle={{ background: 'rgba(15,23,42,0.95)', border: `1px solid ${active.color}55`, borderRadius: 12, color: 'white', fontSize: '0.82rem' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name={active.shortTitle}
                        stroke={active.color}
                        strokeWidth={3}
                        dot={{ fill: active.color, r: 5, strokeWidth: 2, stroke: 'white' }}
                        activeDot={{ r: 7, stroke: active.color, strokeWidth: 2, fill: 'white' }}
                        label={({ x, y, value }) => (
                          <text x={x} y={y - 10} textAnchor="middle" fill={active.color} fontSize={9} fontWeight={700}>{`${value}%`}</text>
                        )}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Stats summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                  {[
                    { label: 'Valor Actual', val: active.value, color: active.color },
                    { label: 'Máximo registrado', val: `${maxVal}%`, color: '#f59e0b' },
                    { label: 'Mínimo registrado', val: `${minVal}%`, color: '#6366f1' }
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center', background: '#f8fafc', borderRadius: 10, padding: '10px 8px' }}>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 900, color: s.color }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                {/* INSIGHTS: Por especialidad o por categoría según indicador */}
                {(() => {
                  // Determine insight rows and labels per indicator
                  let insightRows = [];
                  let insightTitle = '';
                  let labelFn = () => '';
                  let alertFn = () => false;
                  let barMaxRef = 100;

                  if (active.key === 'nsp') {
                    insightRows = (indicadoresData.nsp.byEsp || []).slice(0, 5);
                    insightTitle = 'Especialidades con mayor tasa NSP (críticas)';
                    labelFn = row => `${row.nsp} NSP de ${row.total}`;
                    alertFn = v => v >= 20;
                    barMaxRef = 50;
                  } else if (active.key === 'pertinencia') {
                    insightRows = (indicadoresData.pertinencia.byEsp || []).slice(0, 5);
                    insightTitle = 'Especialidades con menor pertinencia (bajo umbral)';
                    labelFn = row => `${row.pertS} pertinentes de ${row.total}`;
                    alertFn = v => v < 80;
                  } else if (active.key === 'pertinenciaTiempo') {
                    insightRows = (indicadoresData.pertinenciaTiempo.byCategoria || []).slice(0, 6).map(r => ({ ...r, esp: r.cat }));
                    insightTitle = 'Distribución por Tiempo Establecido de Pertinencia';
                    labelFn = row => `${row.pertS} pertinentes de ${row.total}`;
                    alertFn = v => v < 80;
                  } else if (active.key === 'altas') {
                    insightRows = (indicadoresData.altas.byEsp || []).slice(0, 5);
                    insightTitle = 'Especialidades con mayor % de Altas';
                    labelFn = row => `${row.altas} altas de ${row.total}`;
                    alertFn = v => v < 30;
                    barMaxRef = 100;
                  } else if (active.key === 'contrarreferencia') {
                    insightRows = (indicadoresData.contrarreferencia.byEsp || []).slice(0, 5);
                    insightTitle = 'Especialidades con mayor % Contrarreferencia a APS';
                    labelFn = row => `${row.cr} contrarreferidos de ${row.total}`;
                    alertFn = v => v < 20;
                  }

                  if (!insightRows.length) return null;
                  return (
                    <div style={{ marginTop: 20, borderTop: '1px solid #f1f5f9', paddingTop: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <AlertTriangle size={16} color="#f59e0b" />
                        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1e293b' }}>{insightTitle}</span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>· Top 5</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {insightRows.map((row, i) => {
                          const isAlert = alertFn(row.pct);
                          const barWidth = Math.min(row.pct / barMaxRef * 100, 100);
                          const barColor = isAlert ? '#f59e0b' : active.color;
                          const label = row.esp ? (row.esp.length > 48 ? row.esp.substring(0, 46) + '…' : row.esp) : '';
                          return (
                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10, alignItems: 'center', padding: '8px 12px', borderRadius: 10, background: isAlert ? '#fffbeb' : `${active.color}08`, border: `1px solid ${barColor}33` }}>
                              <div>
                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b' }}>{i + 1}. {label}</span>
                                <div style={{ marginTop: 4, height: 5, borderRadius: 4, background: '#e2e8f0', overflow: 'hidden' }}>
                                  <div style={{ width: `${barWidth}%`, height: '100%', background: barColor, borderRadius: 4, transition: 'width 0.4s' }} />
                                </div>
                              </div>
                              <span style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap' }}>{labelFn(row)}</span>
                              <span style={{ fontSize: '1rem', fontWeight: 900, color: barColor, minWidth: 48, textAlign: 'right' }}>{row.pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
