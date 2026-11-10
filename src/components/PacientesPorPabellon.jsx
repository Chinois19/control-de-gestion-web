import React, { useMemo, useState } from 'react';
import {
  ComposedChart, Line, Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, ReferenceLine, Cell, LabelList
} from 'recharts';
import { Users, CheckCircle, AlertTriangle, Award, Lightbulb, RotateCcw, Info } from 'lucide-react';
import {
  calcularPacientesPorPabellon, resumirPacientesPorPabellon, fechaLocalISO,
  PABELLONES_VALIDOS, META_PACIENTES_17H, META_PACIENTES_20H, FECHA_CAMBIO_URGENCIA
} from '../utils/pacientesPorPabellon';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DIAS_LARGO = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES_LARGO = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const fmt = (n, d = 1) => (Number.isFinite(n) ? n.toLocaleString('es-CL', { maximumFractionDigits: d, minimumFractionDigits: 0 }) : '–');
const fmtFecha = (iso) => {
  if (!iso) return '–';
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
};
const labelMes = (key) => {
  const [y, m] = key.split('-');
  return `${MESES[Number(m) - 1]}-${y.slice(2)}`;
};
const labelMesLargo = (key) => {
  const [y, m] = key.split('-');
  return `${MESES_LARGO[Number(m) - 1]} ${y}`;
};

// Semaforización según piso óptimo MINSAL (5 pac en 08-17h; 6 pac en 08-20h)
const colorPorPacientes = (prom, pisoOptimo = 5) => (
  prom >= pisoOptimo ? '#10b981' : prom >= pisoOptimo - 1 ? '#f59e0b' : '#ef4444'
);

function heatBg(val, pisoOptimo = 5) {
  if (val === null || val === undefined) return '#f1f5f9';
  if (val >= pisoOptimo) return 'rgba(16, 185, 129, 0.25)';
  if (val >= pisoOptimo - 1) return 'rgba(245, 158, 11, 0.25)';
  return 'rgba(239, 68, 68, 0.24)';
}

const card = { background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px 22px', boxShadow: '0 2px 10px rgba(15,23,42,0.04)', display: 'flex', flexDirection: 'column' };
const cardTitle = { margin: '0 0 4px 0', fontSize: '1.02rem', fontWeight: 800, color: '#1e293b' };
const cardSub = { margin: '0 0 14px 0', fontSize: '0.8rem', color: '#64748b' };

const tonoColor = { rojo: '#ef4444', verde: '#10b981', ambar: '#f59e0b', azul: '#6366f1' };
const tonoBg = { rojo: '#fef2f2', verde: '#ecfdf5', ambar: '#fffbeb', azul: '#eef2ff' };

function ChartInsight({ tono = 'azul', titulo, children }) {
  if (!children) return null;
  const c = tonoColor[tono] || '#6366f1';
  const bg = tonoBg[tono] || '#eef2ff';
  return (
    <div style={{
      marginTop: '14px',
      padding: '11px 14px',
      borderRadius: '12px',
      background: bg,
      borderLeft: `4px solid ${c}`,
      display: 'flex',
      gap: '10px',
      alignItems: 'flex-start',
      fontSize: '0.82rem',
      color: '#1e293b',
      lineHeight: 1.5
    }}>
      <Lightbulb size={16} color={c} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div>
        {titulo && <strong style={{ color: '#0f172a', marginRight: '6px' }}>{titulo}:</strong>}
        {children}
      </div>
    </div>
  );
}

function KPI({ icon, label, value, sub, color = '#6366f1' }) {
  return (
    <div style={{ ...card, gap: '6px', borderTop: `4px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color, fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{sub}</div>}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '6px 14px', borderRadius: '999px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
        border: `1.5px solid ${active ? '#4f46e5' : '#cbd5e1'}`,
        background: active ? '#eef2ff' : 'white', color: active ? '#4338ca' : '#64748b'
      }}
    >
      {children}
    </button>
  );
}

export default function PacientesPorPabellon({ tablaData = [], disponibilidadData = [], loading = false }) {
  const [tipoDia, setTipoDia] = useState('habiles'); // habiles | no_habiles | todos
  const [esUrgencia, setEsUrgencia] = useState('electivo'); // electivo | urgencia | todos
  const [filtroRegimen, setFiltroRegimen] = useState('todos'); // todos | 17h | 20h
  const [pabellones, setPabellones] = useState(PABELLONES_VALIDOS);
  const [desde, setDesde] = useState('2026-01-01');
  const [hasta, setHasta] = useState('');

  // Piso de referencia visual según filtro de régimen activo (5 pac para 08-17h, 6 pac para 08-20h)
  const pisoRef = filtroRegimen === '20h' ? META_PACIENTES_20H.min : META_PACIENTES_17H.min;
  const techoRef = filtroRegimen === '20h' ? META_PACIENTES_20H.max : META_PACIENTES_17H.max;

  const todas = useMemo(() => calcularPacientesPorPabellon(tablaData, disponibilidadData, { esUrgencia }), [tablaData, disponibilidadData, esUrgencia]);

  const rango = useMemo(() => {
    if (!todas.length) return { min: '2026-01-01', max: '2026-12-31' };
    return { min: todas[0].fecha, max: todas[todas.length - 1].fecha };
  }, [todas]);

  const d1 = desde || '2026-01-01';
  const d2 = hasta || rango.max;

  const filtradas = useMemo(() => todas.filter((f) => {
    if (!pabellones.includes(f.pabellon)) return false;
    if (f.fecha < d1 || f.fecha > d2) return false;
    const finde = f.diaSemana === 0 || f.diaSemana === 6;
    if (tipoDia === 'habiles' && finde) return false;
    if (tipoDia === 'no_habiles' && !finde) return false;
    if (filtroRegimen !== 'todos' && f.regimen !== filtroRegimen) return false;
    return true;
  }), [todas, pabellones, d1, d2, tipoDia, filtroRegimen]);

  const kpi = useMemo(() => resumirPacientesPorPabellon(filtradas), [filtradas]);

  const agrupar = (clave, etiqueta, ordenFn) => {
    const m = new Map();
    for (const f of filtradas) {
      const k = clave(f);
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(f);
    }
    const arr = [...m.entries()].map(([k, rows]) => {
      const r = resumirPacientesPorPabellon(rows);
      return {
        key: k,
        name: etiqueta(k),
        promedio: Number(r.promedio.toFixed(2)),
        promedioProgramados: Number(r.promedioProgramados.toFixed(2)),
        mediana: Number(r.mediana.toFixed(1)),
        pctCumplenNorma: Number(r.pctCumplenNorma.toFixed(1)),
        pctBajo: Number(r.pctBajo.toFixed(1)),
        pctOptimo: Number(r.pctOptimo.toFixed(1)),
        pctDestacado: Number(r.pctDestacado.toFixed(1)),
        pctCMA: Number(r.pctCMA.toFixed(1)),
        n: r.nDiasPabellon,
        totalPacientes: r.totalPacientes,
        dias: r.diasCalendario
      };
    });
    return ordenFn ? arr.sort(ordenFn) : arr;
  };

  const porMes = useMemo(() => agrupar((f) => f.mesKey, labelMes, (a, b) => (a.key < b.key ? -1 : 1)), [filtradas]);
  const porPabellon = useMemo(() => agrupar((f) => f.pabellon, (k) => `Pab. ${k}`, (a, b) => a.key - b.key), [filtradas]);
  const porDia = useMemo(() => {
    const ordenDias = [1, 2, 3, 4, 5, 6, 0];
    return agrupar((f) => f.diaSemana, (k) => DIAS[k], (a, b) => ordenDias.indexOf(a.key) - ordenDias.indexOf(b.key));
  }, [filtradas]);
  const porEspecialidad = useMemo(
    () => agrupar((f) => f.especialidad || 'Sin especialidad', (k) => k, (a, b) => b.promedio - a.promedio).filter((e) => e.n >= 8).slice(0, 10),
    [filtradas]
  );

  // Distribución según norma MINSAL de su respectivo bloque horario + desglose por cantidad
  const tramos = useMemo(() => {
    const def = [
      { name: '1–2 pac (Muy bajo)', f: (f) => f.nPacientes <= 2, color: '#dc2626' },
      { name: '3–4 pac (Bajo 17h)', f: (f) => f.nPacientes >= 3 && f.nPacientes <= 4, color: '#f97316' },
      { name: '5 pac (Óptimo 17h / Bajo 20h)', f: (f) => f.nPacientes === 5, color: '#eab308' },
      { name: '6 pac (Óptimo 17h y 20h)', f: (f) => f.nPacientes === 6, color: '#10b981' },
      { name: '7–8 pac (Destacado 17h / Óptimo 20h)', f: (f) => f.nPacientes >= 7 && f.nPacientes <= 8, color: '#059669' },
      { name: '9+ pac (Sobresaliente)', f: (f) => f.nPacientes >= 9, color: '#4f46e5' }
    ];
    return def.map((t) => {
      const n = filtradas.filter(t.f).length;
      return { name: t.name, n, pct: filtradas.length ? Number(((n / filtradas.length) * 100).toFixed(1)) : 0, color: t.color };
    });
  }, [filtradas]);

  const heat = useMemo(() => {
    const meses = [...new Set(filtradas.map((f) => f.mesKey))].sort();
    const pabs = [...new Set(filtradas.map((f) => f.pabellon))].sort((a, b) => a - b);
    const cel = new Map();
    for (const f of filtradas) {
      const k = `${f.pabellon}|${f.mesKey}`;
      if (!cel.has(k)) cel.set(k, []);
      cel.get(k).push(f.nPacientes);
    }
    return {
      meses,
      pabs,
      valor: (p, m) => {
        const a = cel.get(`${p}|${m}`);
        return a ? { v: a.reduce((s, x) => s + x, 0) / a.length, n: a.length, total: a.reduce((s, x) => s + x, 0) } : null;
      }
    };
  }, [filtradas]);

  // Insights focalizados bajo la norma MINSAL (08:00–17:00 => 5–6 pac; 08:00–20:00 => 6–8 pac)
  const insightMensual = useMemo(() => {
    if (porMes.length < 2) return null;
    const a = porMes[porMes.length - 1];
    const b = porMes[porMes.length - 2];
    const delta = a.promedio - b.promedio;
    const parcial = a.dias < 10;
    return {
      tono: parcial ? 'azul' : a.promedio >= pisoRef ? 'verde' : 'ambar',
      texto: `En ${labelMesLargo(a.key)}${parcial ? ` (mes en curso, ${a.n} pabellón-días)` : ''} se promedian ${fmt(a.promedio, 2)} pacientes intervenidos (${fmt(a.promedioProgramados, 2)} programados en tabla), ${delta >= 0 ? '+' : ''}${fmt(delta, 2)} pac/día respecto a ${labelMesLargo(b.key)} (${fmt(b.promedio, 2)}). El ${fmt(a.pctCumplenNorma, 0)}% de las jornadas alcanzó la norma MINSAL de su horario.`
    };
  }, [porMes, pisoRef]);

  const insightPabellon = useMemo(() => {
    if (porPabellon.length < 2) return null;
    const pabOrd = [...porPabellon].sort((a, b) => b.promedio - a.promedio);
    const mayor = pabOrd[0];
    const menor = pabOrd[pabOrd.length - 1];
    return {
      tono: mayor.promedio >= pisoRef ? 'verde' : 'ambar',
      texto: `${mayor.name} lidera el rendimiento con ${fmt(mayor.promedio, 2)} pacientes intervenidos/día (${fmt(mayor.promedioProgramados, 2)} programados; ${fmt(mayor.pctCumplenNorma, 0)}% de días cumple norma MINSAL). En cambio, ${menor.name} promedia ${fmt(menor.promedio, 2)} pacientes/día (${fmt(menor.pctBajo, 0)}% de jornadas bajo el estándar de programación).`
    };
  }, [porPabellon, pisoRef]);

  const insightDia = useMemo(() => {
    const diaOrd = [...porDia].filter((d) => d.n >= 5).sort((a, b) => b.promedio - a.promedio);
    if (diaOrd.length < 2) return null;
    return {
      tono: 'ambar',
      texto: `Por día de la semana, el mayor rendimiento se alcanza los ${DIAS_LARGO[diaOrd[0].key]} (${fmt(diaOrd[0].promedio, 2)} pac/pabellón, ${fmt(diaOrd[0].pctCumplenNorma, 0)}% en norma MINSAL) y el menor los ${DIAS_LARGO[diaOrd[diaOrd.length - 1].key]} (${fmt(diaOrd[diaOrd.length - 1].promedio, 2)} pac/pabellón).`
    };
  }, [porDia]);

  const insightDistribucion = useMemo(() => {
    if (!kpi.nDiasPabellon) return null;
    return {
      tono: kpi.pctCumplenNorma >= 50 ? 'verde' : 'rojo',
      texto: `Brecha Programación vs Resolución: en tabla se programaron ${fmt(kpi.promedioProgramados, 2)} pac/día (${fmt(kpi.pctCumplenNormaProgramada, 1)}% de jornadas cumplía la meta MINSAL al programar), pero tras las ${fmt(kpi.totalSuspendidos, 0)} suspensiones el rendimiento efectivo bajó a ${fmt(kpi.promedio, 2)} pac/día (${fmt(kpi.pctCumplenNorma, 1)}% en norma: ${fmt(kpi.pctOptimo, 1)}% óptimo y ${fmt(kpi.pctDestacado, 1)}% sobre el óptimo).`
    };
  }, [kpi]);

  const insightHeatmap = useMemo(() => {
    if (!kpi.nDiasPabellon) return null;
    return {
      tono: 'azul',
      texto: `Comparativa por régimen horario MINSAL: en pabellones de 08:00 a 17:00 (${kpi.n17h} jornadas, meta 5–6 pac) el promedio es de ${fmt(kpi.prom17h, 2)} pac/día (${fmt(kpi.pctCumple17h, 1)}% cumple ≥ 5 pac), mientras que en pabellones extendidos de 08:00 a 20:00 (${kpi.n20h} jornadas, meta 6–8 pac) el promedio es de ${fmt(kpi.prom20h, 2)} pac/día (${fmt(kpi.pctCumple20h, 1)}% cumple ≥ 6 pac).`
    };
  }, [kpi]);

  const insightEspecialidad = useMemo(() => {
    if (porEspecialidad.length < 2) return null;
    const topEsp = porEspecialidad[0];
    const lowEsp = porEspecialidad[porEspecialidad.length - 1];
    return {
      tono: 'ambar',
      texto: `Efecto case-mix por especialidad: ${topEsp.name} alcanza ${fmt(topEsp.promedio, 2)} pac/día (${fmt(topEsp.pctCumplenNorma, 0)}% de días cumple o supera el óptimo MINSAL, con ${fmt(topEsp.pctCMA, 0)}% CMA), mientras que ${lowEsp.name} promedia ${fmt(lowEsp.promedio, 2)} pac/día debido a cirugías de mayor duración.`
    };
  }, [porEspecialidad]);

  const togglePab = (p) => setPabellones((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p].sort((a, b) => a - b)));
  const limpiar = () => {
    setTipoDia('habiles');
    setEsUrgencia('electivo');
    setFiltroRegimen('todos');
    setPabellones(PABELLONES_VALIDOS);
    setDesde('2026-01-01');
    setHasta('');
  };

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>Cargando datos de pacientes por pabellón…</div>;
  }
  if (!todas.length) {
    return <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>No hay datos suficientes en la tabla quirúrgica para calcular el rendimiento por pabellón.</div>;
  }

  const ayerDate = new Date();
  ayerDate.setDate(ayerDate.getDate() - 1);
  const ayer = fechaLocalISO(ayerDate);

  return (
    <div style={{ padding: '24px 32px 48px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* DEFINICIÓN Y NORMA MINISTERIAL */}
      <div style={{ ...card, background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)', borderColor: '#c7d2fe', flexDirection: 'row', gap: '14px', alignItems: 'flex-start' }}>
        <Info size={22} color="#4f46e5" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.86rem', color: '#312e81', lineHeight: 1.55 }}>
          <strong>Número promedio de pacientes por pabellón</strong> = pacientes intervenidos (y programados) por cada jornada de pabellón electivo.
          <br />
          <strong>Norma Ministerial (MINSAL) según horario del pabellón:</strong>{' '}
          • <strong>Pabellón 08:00 a 17:00 hrs:</strong> <span style={{ color: '#047857', fontWeight: 800 }}>Óptimo 5 a 6 pacientes</span> (<span style={{ color: '#4338ca', fontWeight: 800 }}>&gt; 6 destacado</span> · <span style={{ color: '#b91c1c', fontWeight: 800 }}>&lt; 5 bajo en programación</span>).{' '}
          • <strong>Pabellón 08:00 a 20:00 hrs:</strong> <span style={{ color: '#047857', fontWeight: 800 }}>Óptimo 6 a 8 casos</span> (<span style={{ color: '#4338ca', fontWeight: 800 }}>&gt; 8 destacado</span> · <span style={{ color: '#b91c1c', fontWeight: 800 }}>&lt; 6 bajo en programación</span>).
          <br />
          Se evalúan pabellones electivos (1 a 7) en jornadas completas hasta el {fmtFecha(ayer)}, excluyendo urgencia (pabellón 6 hasta el 30-09-2026 y pabellón 2 desde el {fmtFecha(FECHA_CAMBIO_URGENCIA)}).
        </div>
      </div>

      {/* FILTROS */}
      <div style={{ ...card, flexDirection: 'row', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Pabellón</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {PABELLONES_VALIDOS.map((p) => <Chip key={p} active={pabellones.includes(p)} onClick={() => togglePab(p)}>{p}</Chip>)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Régimen Horario MINSAL</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <Chip active={filtroRegimen === 'todos'} onClick={() => setFiltroRegimen('todos')}>Todos</Chip>
            <Chip active={filtroRegimen === '17h'} onClick={() => setFiltroRegimen('17h')}>08:00–17:00 (Óptimo 5–6)</Chip>
            <Chip active={filtroRegimen === '20h'} onClick={() => setFiltroRegimen('20h')}>08:00–20:00 (Óptimo 6–8)</Chip>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Es Urgencia</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <Chip active={esUrgencia === 'todos'} onClick={() => setEsUrgencia('todos')}>Todos</Chip>
            <Chip active={esUrgencia === 'electivo'} onClick={() => setEsUrgencia('electivo')}>Electivo (No)</Chip>
            <Chip active={esUrgencia === 'urgencia'} onClick={() => setEsUrgencia('urgencia')}>Urgencia (Sí)</Chip>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Tipo de día</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <Chip active={tipoDia === 'habiles'} onClick={() => setTipoDia('habiles')}>Lun–Vie</Chip>
            <Chip active={tipoDia === 'no_habiles'} onClick={() => setTipoDia('no_habiles')}>Sáb–Dom</Chip>
            <Chip active={tipoDia === 'todos'} onClick={() => setTipoDia('todos')}>Todos</Chip>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Período</span>
            <Chip active={d1 === '2026-01-01'} onClick={() => { setDesde('2026-01-01'); setHasta(''); }}>Año 2026</Chip>
            <Chip active={d1 === rango.min && rango.min < '2026-01-01'} onClick={() => { setDesde(rango.min); setHasta(''); }}>Histórico</Chip>
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input type="date" value={d1} min={rango.min} max={rango.max} onChange={(e) => setDesde(e.target.value)} style={{ padding: '6px 8px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }} />
            <span style={{ color: '#94a3b8' }}>→</span>
            <input type="date" value={d2} min={rango.min} max={rango.max} onChange={(e) => setHasta(e.target.value)} style={{ padding: '6px 8px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }} />
          </div>
        </div>
        <button type="button" onClick={limpiar} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 700, color: '#64748b' }}>
          <RotateCcw size={14} /> Restablecer
        </button>
      </div>

      {!filtradas.length ? (
        <div style={{ ...card, textAlign: 'center', color: '#64748b', fontWeight: 600 }}>No hay pabellón-días con los filtros seleccionados.</div>
      ) : (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <KPI
              icon={<Users size={16} />}
              label="Promedio pacientes / pabellón"
              value={`${fmt(kpi.promedio, 2)}`}
              sub={`Programados: ${fmt(kpi.promedioProgramados, 2)} pac/día · ${fmt(kpi.totalPacientes, 0)} cirugías en ${fmt(kpi.nDiasPabellon, 0)} jornadas`}
              color={colorPorPacientes(kpi.promedio, pisoRef)}
            />
            <KPI
              icon={<CheckCircle size={16} />}
              label="En Rango Óptimo MINSAL"
              value={`${fmt(kpi.pctOptimo)}%`}
              sub={`${fmt(kpi.optimos, 0)} jornadas (5–6 pac en 17h · 6–8 pac en 20h)`}
              color="#10b981"
            />
            <KPI
              icon={<Award size={16} />}
              label="Sobre el Óptimo (> 6 / > 8 pac)"
              value={`${fmt(kpi.pctDestacado)}%`}
              sub={`${fmt(kpi.destacados, 0)} jornadas destacadas · Total cumple norma: ${fmt(kpi.pctCumplenNorma)}%`}
              color="#6366f1"
            />
            <KPI
              icon={<AlertTriangle size={16} />}
              label="Bajo en Programación (< 5 / < 6 pac)"
              value={`${fmt(kpi.pctBajo)}%`}
              sub={`${fmt(kpi.bajos, 0)} de ${fmt(kpi.nDiasPabellon, 0)} jornadas bajo el estándar MINSAL`}
              color="#ef4444"
            />
          </div>

          {/* TENDENCIA MENSUAL + POR PABELLÓN (con insights integrados) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
            <div style={card}>
              <h3 style={cardTitle}>Evolución mensual de pacientes por pabellón</h3>
              <p style={cardSub}>Promedio de pacientes intervenidos (barras) y % de jornadas que cumplen la norma MINSAL de su horario (línea).</p>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={porMes} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="l" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                  <RechartsTooltip formatter={(v, n) => (n.includes('%') ? `${v}%` : `${v} pac/día`)} />
                  <Legend />
                  <ReferenceLine yAxisId="l" y={pisoRef} stroke="#10b981" strokeDasharray="4 4" label={{ value: `Mín. óptimo (${pisoRef})`, fontSize: 10, fill: '#059669', position: 'insideBottomRight' }} />
                  <ReferenceLine yAxisId="l" y={techoRef} stroke="#6366f1" strokeDasharray="4 4" label={{ value: `Tope óptimo (${techoRef})`, fontSize: 10, fill: '#4f46e5', position: 'insideTopRight' }} />
                  <Bar yAxisId="l" dataKey="promedio" name="Intervenidos prom. / pab" radius={[6, 6, 0, 0]}>
                    {porMes.map((e, i) => <Cell key={i} fill={colorPorPacientes(e.promedio, pisoRef)} />)}
                  </Bar>
                  <Line yAxisId="r" type="monotone" dataKey="pctCumplenNorma" name="% cumple norma MINSAL" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
              {insightMensual && (
                <ChartInsight tono={insightMensual.tono} titulo="Tendencia mensual">
                  {insightMensual.texto}
                </ChartInsight>
              )}
            </div>

            <div style={card}>
              <h3 style={cardTitle}>Promedio de pacientes por pabellón</h3>
              <p style={cardSub}>Comparativa de pacientes intervenidos vs. piso óptimo MINSAL ({pisoRef}–{techoRef} pac/día).</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={porPabellon} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip formatter={(v, n, p) => [`${v} intervenidos/día (programados: ${p.payload.promedioProgramados}) · Cumple norma: ${p.payload.pctCumplenNorma}% · Bajo: ${p.payload.pctBajo}%`, 'Promedio']} />
                  <ReferenceLine y={pisoRef} stroke="#10b981" strokeDasharray="4 4" />
                  <ReferenceLine y={techoRef} stroke="#6366f1" strokeDasharray="4 4" />
                  <Bar dataKey="promedio" radius={[6, 6, 0, 0]}>
                    {porPabellon.map((e, i) => <Cell key={i} fill={colorPorPacientes(e.promedio, pisoRef)} />)}
                    <LabelList dataKey="promedio" position="top" style={{ fontSize: 11, fontWeight: 700, fill: '#334155' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {insightPabellon && (
                <ChartInsight tono={insightPabellon.tono} titulo="Rendimiento por quirófano">
                  {insightPabellon.texto}
                </ChartInsight>
              )}
            </div>
          </div>

          {/* DÍA DE LA SEMANA + DISTRIBUCIÓN DE VOLUMEN DIARIO */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
            <div style={card}>
              <h3 style={cardTitle}>Por día de la semana</h3>
              <p style={cardSub}>Promedio de pacientes intervenidos por pabellón según el día.</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={porDia} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip formatter={(v, n, p) => [`${v} pac/día (programados: ${p.payload.promedioProgramados}) · Cumple norma: ${p.payload.pctCumplenNorma}%`, 'Promedio']} />
                  <ReferenceLine y={pisoRef} stroke="#10b981" strokeDasharray="4 4" />
                  <Bar dataKey="promedio" radius={[6, 6, 0, 0]}>
                    {porDia.map((e, i) => <Cell key={i} fill={colorPorPacientes(e.promedio, pisoRef)} />)}
                    <LabelList dataKey="promedio" position="top" style={{ fontSize: 11, fontWeight: 700, fill: '#334155' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {insightDia && (
                <ChartInsight tono={insightDia.tono} titulo="Productividad semanal">
                  {insightDia.texto}
                </ChartInsight>
              )}
            </div>

            <div style={card}>
              <h3 style={cardTitle}>Distribución de jornadas según norma MINSAL</h3>
              <p style={cardSub}>Frecuencia de pabellón-días por tramo de resolución (Bajo &lt;5, Óptimo 5–6 / 6–8, Destacado &gt;6 / &gt;8).</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={tramos} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9.5 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip formatter={(v, n, p) => [`${v} pabellón-días (${p.payload.pct}%)`, 'Jornadas']} />
                  <Bar dataKey="n" radius={[6, 6, 0, 0]}>
                    {tramos.map((e, i) => <Cell key={i} fill={e.color} />)}
                    <LabelList dataKey="pct" position="top" formatter={(v) => `${v}%`} style={{ fontSize: 11, fontWeight: 700, fill: '#334155' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {insightDistribucion && (
                <ChartInsight tono={insightDistribucion.tono} titulo="Programación vs resolución efectiva">
                  {insightDistribucion.texto}
                </ChartInsight>
              )}
            </div>
          </div>

          {/* MAPA DE CALOR + ESPECIALIDAD */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
            <div style={card}>
              <h3 style={cardTitle}>Mapa de calor: pabellón × mes</h3>
              <p style={cardSub}>Verde ≥ {pisoRef} pac/día (óptimo) · Ámbar {pisoRef - 1}–{pisoRef - 0.1} pac · Rojo &lt; {pisoRef - 1} pac (bajo en programación).</p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'separate', borderSpacing: '4px', fontSize: '0.8rem', width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '6px 10px', color: '#64748b' }}>Pabellón</th>
                      {heat.meses.map((m) => <th key={m} style={{ padding: '6px 8px', color: '#64748b', fontWeight: 700 }}>{labelMes(m)}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {heat.pabs.map((p) => (
                      <tr key={p}>
                        <td style={{ padding: '6px 10px', fontWeight: 800, color: '#334155' }}>Pab. {p}</td>
                        {heat.meses.map((m) => {
                          const c = heat.valor(p, m);
                          return (
                            <td key={m} title={c ? `${c.total} pacientes en ${c.n} días` : 'sin datos'} style={{ textAlign: 'center', padding: '8px 6px', borderRadius: '6px', background: heatBg(c ? c.v : null, pisoRef), fontWeight: 700, color: '#1e293b' }}>
                              {c ? fmt(c.v, 1) : '–'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {insightHeatmap && (
                <ChartInsight tono={insightHeatmap.tono} titulo="Desempeño según régimen 08–17h vs 08–20h">
                  {insightHeatmap.texto}
                </ChartInsight>
              )}
            </div>

            {porEspecialidad.length > 0 && (
              <div style={card}>
                <h3 style={cardTitle}>Promedio de pacientes por pabellón-día según especialidad</h3>
                <p style={cardSub}>Especialidades con al menos 8 jornadas evaluadas (comparado con piso óptimo de {pisoRef} pac/día).</p>
                <ResponsiveContainer width="100%" height={Math.max(220, porEspecialidad.length * 32)}>
                  <BarChart data={porEspecialidad} layout="vertical" margin={{ top: 5, right: 45, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 11 }} />
                    <RechartsTooltip formatter={(v, n, p) => [`${v} intervenidos/día (prog: ${p.payload.promedioProgramados}) · Cumple norma: ${p.payload.pctCumplenNorma}% · ${p.payload.pctCMA}% CMA`, 'Promedio']} />
                    <ReferenceLine x={pisoRef} stroke="#10b981" strokeDasharray="4 4" />
                    <ReferenceLine x={techoRef} stroke="#6366f1" strokeDasharray="4 4" />
                    <Bar dataKey="promedio" radius={[0, 6, 6, 0]}>
                      {porEspecialidad.map((e, i) => <Cell key={i} fill={colorPorPacientes(e.promedio, pisoRef)} />)}
                      <LabelList dataKey="promedio" position="right" style={{ fontSize: 11, fontWeight: 700, fill: '#334155' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                {insightEspecialidad && (
                  <ChartInsight tono={insightEspecialidad.tono} titulo="Complejidad y rotación por especialidad">
                    {insightEspecialidad.texto}
                  </ChartInsight>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
