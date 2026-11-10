import React, { useMemo, useState } from 'react';
import {
  ComposedChart, Line, Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, ReferenceLine, Cell, LabelList
} from 'recharts';
import { RefreshCw, Timer, CheckCircle, AlertTriangle, Lightbulb, RotateCcw, Info } from 'lucide-react';
import {
  calcularRecambios, resumirRecambios, fechaLocalISO,
  PABELLONES_VALIDOS, UMBRAL_IDEAL_MIN, UMBRAL_ACEPTABLE_MAX_MIN, TOPE_COLACION_MIN, FECHA_CAMBIO_URGENCIA
} from '../utils/recambio';

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

// Estándar MINSAL: <= 15 min Ideal (verde), 16–20 min Aceptable (ámbar), > 20 min Crítico (rojo)
const colorPorMin = (min, idealMax = UMBRAL_IDEAL_MIN, aceptableMax = UMBRAL_ACEPTABLE_MAX_MIN) => (
  min <= idealMax ? '#10b981' : min <= aceptableMax ? '#f59e0b' : '#ef4444'
);

function heatBg(min, idealMax = UMBRAL_IDEAL_MIN, aceptableMax = UMBRAL_ACEPTABLE_MAX_MIN) {
  if (min === null || min === undefined) return '#f1f5f9';
  if (min <= idealMax) return 'rgba(16, 185, 129, 0.24)';
  if (min <= aceptableMax) return 'rgba(245, 158, 11, 0.26)';
  const excess = Math.min(1, (min - aceptableMax) / 25);
  return `rgba(239, 68, 68, ${(0.22 + excess * 0.22).toFixed(2)})`;
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

export default function TiempoRecambio({ tablaData = [], disponibilidadData = [], loading = false }) {
  const [tipoDia, setTipoDia] = useState('habiles'); // habiles | no_habiles | todos
  const [esUrgencia, setEsUrgencia] = useState('electivo'); // electivo | urgencia | todos
  const [modoTransicion, setModoTransicion] = useState('acotados'); // acotados (<=180m) | misma_jornada | todos
  const [pabellones, setPabellones] = useState(PABELLONES_VALIDOS);
  const [desde, setDesde] = useState('2026-01-01');
  const [hasta, setHasta] = useState('');

  const idealMax = UMBRAL_IDEAL_MIN; // 15 min
  const aceptableMax = UMBRAL_ACEPTABLE_MAX_MIN; // 20 min

  const todosRecambios = useMemo(() => calcularRecambios(tablaData, disponibilidadData, { esUrgencia }), [tablaData, disponibilidadData, esUrgencia]);

  const rango = useMemo(() => {
    if (!todosRecambios.length) return { min: '2026-01-01', max: '2026-12-31' };
    return { min: todosRecambios[0].fecha, max: todosRecambios[todosRecambios.length - 1].fecha };
  }, [todosRecambios]);

  const d1 = desde || '2026-01-01';
  const d2 = hasta || rango.max;

  const filtradas = useMemo(() => todosRecambios.filter((f) => {
    if (!pabellones.includes(f.pabellon)) return false;
    if (f.fecha < d1 || f.fecha > d2) return false;
    const finde = f.diaSemana === 0 || f.diaSemana === 6;
    if (tipoDia === 'habiles' && finde) return false;
    if (tipoDia === 'no_habiles' && !finde) return false;
    if (modoTransicion === 'misma_jornada' && !f.mismaJornada) return false;
    if (modoTransicion === 'acotados' && f.recambio > TOPE_COLACION_MIN) return false;
    return true;
  }), [todosRecambios, pabellones, d1, d2, tipoDia, modoTransicion]);

  const kpi = useMemo(() => resumirRecambios(filtradas, idealMax, aceptableMax), [filtradas, idealMax, aceptableMax]);

  const agrupar = (clave, etiqueta, ordenFn) => {
    const m = new Map();
    for (const f of filtradas) {
      const k = clave(f);
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(f);
    }
    const arr = [...m.entries()].map(([k, rows]) => {
      const r = resumirRecambios(rows, idealMax, aceptableMax);
      return {
        key: k,
        name: etiqueta(k),
        promedio: Number(r.promedio.toFixed(1)),
        mediana: Number(r.mediana.toFixed(1)),
        pctIdeal: Number(r.pctIdeal.toFixed(1)),
        pctAceptable: Number(r.pctAceptable.toFixed(1)),
        pctCritico: Number(r.pctCritico.toFixed(1)),
        pctDentroAceptable: Number(r.pctDentroAceptable.toFixed(1)),
        n: r.n,
        dias: r.diasEvaluados,
        totalMin: r.totalMin
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
    () => agrupar((f) => f.especialidad || 'Sin especialidad', (k) => k, (a, b) => b.promedio - a.promedio).filter((e) => e.n >= 10).slice(0, 10),
    [filtradas]
  );

  const tramos = useMemo(() => {
    const def = [
      { name: '≤ 15 min (Ideal)', f: (f) => f.recambio <= 15, color: '#10b981' },
      { name: '16–20 min (Aceptable)', f: (f) => f.recambio > 15 && f.recambio <= 20, color: '#f59e0b' },
      { name: '21–30 min (Crítico mod.)', f: (f) => f.recambio > 20 && f.recambio <= 30, color: '#f97316' },
      { name: '31–45 min (Crítico)', f: (f) => f.recambio > 30 && f.recambio <= 45, color: '#ef4444' },
      { name: '46–60 min (Crítico alto)', f: (f) => f.recambio > 45 && f.recambio <= 60, color: '#dc2626' },
      { name: '> 60 min (Crítico severo)', f: (f) => f.recambio > 60, color: '#991b1b' }
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
      cel.get(k).push(f.recambio);
    }
    return {
      meses,
      pabs,
      valor: (p, m) => {
        const a = cel.get(`${p}|${m}`);
        return a ? { v: a.reduce((s, x) => s + x, 0) / a.length, n: a.length } : null;
      }
    };
  }, [filtradas]);

  // Insights focalizados para cada gráfica
  const insightMensual = useMemo(() => {
    if (porMes.length < 2) return null;
    const a = porMes[porMes.length - 1];
    const b = porMes[porMes.length - 2];
    const delta = a.promedio - b.promedio;
    const parcial = a.dias < 10;
    return {
      tono: parcial ? 'azul' : delta > 0 ? 'rojo' : 'verde',
      texto: `En ${labelMesLargo(a.key)}${parcial ? ` (mes en curso, ${a.n} recambios)` : ''} el recambio promedia ${fmt(a.promedio)} min (${delta > 0 ? '+' : ''}${fmt(delta)} min respecto a ${labelMesLargo(b.key)}, que cerró en ${fmt(b.promedio)} min), con un ${fmt(a.pctCritico, 0)}% de transiciones en rango crítico (> 20 min).`
    };
  }, [porMes]);

  const insightPabellon = useMemo(() => {
    if (porPabellon.length < 2) return null;
    const ord = [...porPabellon].sort((a, b) => a.promedio - b.promedio);
    const mejor = ord[0];
    const peor = ord[ord.length - 1];
    return {
      tono: peor.promedio > aceptableMax ? 'rojo' : 'verde',
      texto: `${mejor.name} lidera la agilidad con ${fmt(mejor.promedio)} min promedio (${fmt(mejor.pctIdeal, 0)}% ideal ≤ 15 min y ${fmt(mejor.pctDentroAceptable, 0)}% ≤ 20 min). En contraste, ${peor.name} registra ${fmt(peor.promedio)} min promedio y ${fmt(peor.pctCritico, 0)}% de recambios críticos (> 20 min).`
    };
  }, [porPabellon, aceptableMax]);

  const insightDia = useMemo(() => {
    const valid = porDia.filter((d) => d.n >= 5);
    if (valid.length < 2) return null;
    const ord = [...valid].sort((a, b) => b.promedio - a.promedio);
    const lento = ord[0];
    const rapido = ord[ord.length - 1];
    return {
      tono: 'ambar',
      texto: `El día con recambios más prolongados es el ${DIAS_LARGO[lento.key]} (${fmt(lento.promedio)} min promedio, ${fmt(lento.pctCritico, 0)}% > 20 min), mientras que el flujo más ágil se logra el ${DIAS_LARGO[rapido.key]} (${fmt(rapido.promedio)} min promedio).`
    };
  }, [porDia]);

  const insightDistribucion = useMemo(() => {
    if (!filtradas.length) return null;
    return {
      tono: kpi.pctDentroAceptable >= 60 ? 'verde' : 'ambar',
      texto: `El ${fmt(kpi.pctIdeal, 1)}% de las transiciones cumple el ideal MINSAL (≤ 15 min) y un ${fmt(kpi.pctAceptable, 1)}% adicional está en el rango mínimo aceptable (16–20 min), sumando ${fmt(kpi.pctDentroAceptable, 1)}% dentro de norma (≤ 20 min) frente a ${fmt(kpi.pctCritico, 1)}% en tramo crítico (> 20 min).`
    };
  }, [filtradas.length, kpi]);

  const insightHeatmap = useMemo(() => {
    const mismaEsp = filtradas.filter((f) => f.mismaEspecialidad);
    const distintaEsp = filtradas.filter((f) => !f.mismaEspecialidad);
    if (mismaEsp.length >= 10 && distintaEsp.length >= 10) {
      const promMisma = mismaEsp.reduce((s, x) => s + x.recambio, 0) / mismaEsp.length;
      const promDistinta = distintaEsp.reduce((s, x) => s + x.recambio, 0) / distintaEsp.length;
      return {
        tono: 'azul',
        texto: `Efecto continuidad de tabla: cuando se mantiene la misma especialidad entre cirugías consecutivas el recambio promedia ${fmt(promMisma)} min, pero al cambiar de especialidad dentro del mismo pabellón sube a ${fmt(promDistinta)} min (+${fmt(promDistinta - promMisma)} min por cambio de equipo/instrumental).`
      };
    }
    return null;
  }, [filtradas]);

  const insightEspecialidad = useMemo(() => {
    if (porEspecialidad.length < 2) return null;
    const masLenta = porEspecialidad[0];
    const masRapida = porEspecialidad[porEspecialidad.length - 1];
    return {
      tono: 'ambar',
      texto: `Las transiciones más extensas se concentran en ${masLenta.name} (${fmt(masLenta.promedio)} min promedio, ${fmt(masLenta.pctCritico, 0)}% > 20 min), mientras que ${masRapida.name} logra los recambios más breves (${fmt(masRapida.promedio)} min promedio, ${fmt(masRapida.pctDentroAceptable, 0)}% ≤ 20 min).`
    };
  }, [porEspecialidad]);

  const togglePab = (p) => setPabellones((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p].sort((a, b) => a - b)));
  const limpiar = () => {
    setTipoDia('habiles');
    setEsUrgencia('electivo');
    setModoTransicion('acotados');
    setPabellones(PABELLONES_VALIDOS);
    setDesde('2026-01-01');
    setHasta('');
  };

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>Cargando datos de tiempo de recambio…</div>;
  }
  if (!todosRecambios.length) {
    return <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>No hay datos suficientes en la tabla quirúrgica para calcular el tiempo de recambio.</div>;
  }

  const ayerDate = new Date();
  ayerDate.setDate(ayerDate.getDate() - 1);
  const ayer = fechaLocalISO(ayerDate);

  return (
    <div style={{ padding: '24px 32px 48px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* DEFINICIÓN Y CRITERIO MINSAL */}
      <div style={{ ...card, background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)', borderColor: '#c7d2fe', flexDirection: 'row', gap: '14px', alignItems: 'flex-start' }}>
        <Info size={22} color="#4f46e5" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.86rem', color: '#312e81', lineHeight: 1.55 }}>
          <strong>Tiempo de recambio entre pacientes</strong> = hora de ingreso a pabellón del paciente siguiente (<code>hora_ingreso_cirugia</code>) − hora de salida de pabellón del paciente anterior (<code>hora_salida_cirugia</code>).
          <br />
          <strong>Criterio Ministerial (MINSAL):</strong>{' '}
          <span style={{ color: '#047857', fontWeight: 800 }}>Ideal: ≤ 15 min</span> ·{' '}
          <span style={{ color: '#b45309', fontWeight: 800 }}>Mínimo aceptable: 15 a 20 min</span> ·{' '}
          <span style={{ color: '#b91c1c', fontWeight: 800 }}>Crítico (gestión local): &gt; 20 min</span>.
          Se evalúan los <strong>pabellones electivos (1 a 7)</strong> hasta el {fmtFecha(ayer)}, excluyendo urgencia (pabellón 6 hasta el 30-09-2026 y pabellón 2 desde el {fmtFecha(FECHA_CAMBIO_URGENCIA)}).
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
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Tipo de transición</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <Chip active={modoTransicion === 'acotados'} onClick={() => setModoTransicion('acotados')}>Continuos (≤ 3 h)</Chip>
            <Chip active={modoTransicion === 'misma_jornada'} onClick={() => setModoTransicion('misma_jornada')}>Mismo bloque (AM/PM)</Chip>
            <Chip active={modoTransicion === 'todos'} onClick={() => setModoTransicion('todos')}>Todos</Chip>
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
        <div style={{ ...card, textAlign: 'center', color: '#64748b', fontWeight: 600 }}>No hay eventos de recambio con los filtros seleccionados.</div>
      ) : (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <KPI
              icon={<RefreshCw size={16} />}
              label="Tiempo promedio de recambio"
              value={`${fmt(kpi.promedio)} min`}
              sub={`Mediana ${fmt(kpi.mediana, 0)} min · ${fmt(kpi.n, 0)} transiciones en ${fmt(kpi.diasEvaluados, 0)} pabellón-días`}
              color={colorPorMin(kpi.promedio, idealMax, aceptableMax)}
            />
            <KPI
              icon={<CheckCircle size={16} />}
              label="Recambio Ideal MINSAL (≤ 15 min)"
              value={`${fmt(kpi.pctIdeal)}%`}
              sub={`${fmt(kpi.ideales, 0)} de ${fmt(kpi.n, 0)} recambios en estándar óptimo`}
              color="#10b981"
            />
            <KPI
              icon={<Timer size={16} />}
              label="Mínimo Aceptable (15–20 min)"
              value={`${fmt(kpi.pctAceptable)}%`}
              sub={`${fmt(kpi.aceptables, 0)} casos · Total ≤ 20 min: ${fmt(kpi.pctDentroAceptable)}%`}
              color="#f59e0b"
            />
            <KPI
              icon={<AlertTriangle size={16} />}
              label="Tiempo Crítico (> 20 min)"
              value={`${fmt(kpi.pctCritico)}%`}
              sub={`${fmt(kpi.criticos, 0)} recambios requieren gestión local`}
              color="#ef4444"
            />
          </div>

          {/* TENDENCIA MENSUAL + POR PABELLÓN (con insights integrados en cada gráfica) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
            <div style={card}>
              <h3 style={cardTitle}>Evolución mensual del tiempo de recambio</h3>
              <p style={cardSub}>Minutos promedio de recambio (barras) y % en rango crítico &gt; 20 min (línea).</p>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={porMes} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="l" tick={{ fontSize: 11 }} unit=" m" />
                  <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                  <RechartsTooltip formatter={(v, n) => (n.includes('%') ? `${v}%` : `${v} min`)} />
                  <Legend />
                  <ReferenceLine yAxisId="l" y={idealMax} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Ideal 15m', fontSize: 10, fill: '#059669', position: 'insideBottomRight' }} />
                  <ReferenceLine yAxisId="l" y={aceptableMax} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Crítico >20m', fontSize: 10, fill: '#ef4444', position: 'insideTopRight' }} />
                  <Bar yAxisId="l" dataKey="promedio" name="Min promedio recambio" radius={[6, 6, 0, 0]}>
                    {porMes.map((e, i) => <Cell key={i} fill={colorPorMin(e.promedio, idealMax, aceptableMax)} />)}
                  </Bar>
                  <Line yAxisId="r" type="monotone" dataKey="pctCritico" name="% Crítico (> 20 min)" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
              {insightMensual && (
                <ChartInsight tono={insightMensual.tono} titulo="Análisis de tendencia">
                  {insightMensual.texto}
                </ChartInsight>
              )}
            </div>

            <div style={card}>
              <h3 style={cardTitle}>Tiempo promedio de recambio por pabellón</h3>
              <p style={cardSub}>Comparativa entre pabellones electivos según umbrales MINSAL (15 y 20 min).</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={porPabellon} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit=" m" />
                  <RechartsTooltip formatter={(v, n, p) => [`${v} min (mediana ${p.payload.mediana}m) · Ideal ≤15m: ${p.payload.pctIdeal}% · Crítico >20m: ${p.payload.pctCritico}%`, 'Promedio']} />
                  <ReferenceLine y={idealMax} stroke="#10b981" strokeDasharray="4 4" />
                  <ReferenceLine y={aceptableMax} stroke="#ef4444" strokeDasharray="4 4" />
                  <Bar dataKey="promedio" radius={[6, 6, 0, 0]}>
                    {porPabellon.map((e, i) => <Cell key={i} fill={colorPorMin(e.promedio, idealMax, aceptableMax)} />)}
                    <LabelList dataKey="promedio" position="top" style={{ fontSize: 11, fontWeight: 700, fill: '#334155' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {insightPabellon && (
                <ChartInsight tono={insightPabellon.tono} titulo="Foco por quirófano">
                  {insightPabellon.texto}
                </ChartInsight>
              )}
            </div>
          </div>

          {/* DÍA DE LA SEMANA + DISTRIBUCIÓN POR TRAMOS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
            <div style={card}>
              <h3 style={cardTitle}>Por día de la semana</h3>
              <p style={cardSub}>Minutos promedio de recambio según el día.</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={porDia} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit=" m" />
                  <RechartsTooltip formatter={(v, n, p) => [`${v} min (mediana ${p.payload.mediana}m) · Crítico >20m: ${p.payload.pctCritico}% · ${p.payload.n} recambios`, 'Promedio']} />
                  <ReferenceLine y={idealMax} stroke="#10b981" strokeDasharray="4 4" />
                  <ReferenceLine y={aceptableMax} stroke="#ef4444" strokeDasharray="4 4" />
                  <Bar dataKey="promedio" radius={[6, 6, 0, 0]}>
                    {porDia.map((e, i) => <Cell key={i} fill={colorPorMin(e.promedio, idealMax, aceptableMax)} />)}
                    <LabelList dataKey="promedio" position="top" style={{ fontSize: 11, fontWeight: 700, fill: '#334155' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {insightDia && (
                <ChartInsight tono={insightDia.tono} titulo="Comportamiento semanal">
                  {insightDia.texto}
                </ChartInsight>
              )}
            </div>

            <div style={card}>
              <h3 style={cardTitle}>Distribución según estándar MINSAL</h3>
              <p style={cardSub}>Proporción de recambios en tramo Ideal (≤ 15m), Aceptable (16–20m) y Crítico (&gt; 20m).</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={tramos} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9.5 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip formatter={(v, n, p) => [`${v} recambios (${p.payload.pct}%)`, 'Transiciones']} />
                  <Bar dataKey="n" radius={[6, 6, 0, 0]}>
                    {tramos.map((e, i) => <Cell key={i} fill={e.color} />)}
                    <LabelList dataKey="pct" position="top" formatter={(v) => `${v}%`} style={{ fontSize: 11, fontWeight: 700, fill: '#334155' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {insightDistribucion && (
                <ChartInsight tono={insightDistribucion.tono} titulo="Cumplimiento normativo">
                  {insightDistribucion.texto}
                </ChartInsight>
              )}
            </div>
          </div>

          {/* MAPA DE CALOR + ESPECIALIDAD */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
            <div style={card}>
              <h3 style={cardTitle}>Mapa de calor: pabellón × mes</h3>
              <p style={cardSub}>Verde ≤ 15 min (ideal) · Ámbar 16–20 min (aceptable) · Rojo &gt; 20 min (crítico).</p>
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
                            <td key={m} title={c ? `${c.n} recambios` : 'sin datos'} style={{ textAlign: 'center', padding: '8px 6px', borderRadius: '6px', background: heatBg(c ? c.v : null, idealMax, aceptableMax), fontWeight: 700, color: '#1e293b' }}>
                              {c ? fmt(c.v, 0) : '–'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {insightHeatmap && (
                <ChartInsight tono={insightHeatmap.tono} titulo="Continuidad de especialidad">
                  {insightHeatmap.texto}
                </ChartInsight>
              )}
            </div>

            {porEspecialidad.length > 0 && (
              <div style={card}>
                <h3 style={cardTitle}>Tiempo promedio de recambio por especialidad</h3>
                <p style={cardSub}>Especialidades con al menos 10 transiciones evaluadas en el período.</p>
                <ResponsiveContainer width="100%" height={Math.max(220, porEspecialidad.length * 32)}>
                  <BarChart data={porEspecialidad} layout="vertical" margin={{ top: 5, right: 45, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} unit=" m" />
                    <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 11 }} />
                    <RechartsTooltip formatter={(v, n, p) => [`${v} min (mediana ${p.payload.mediana}m) · ≤20m: ${p.payload.pctDentroAceptable}% · Crítico >20m: ${p.payload.pctCritico}%`, 'Promedio']} />
                    <ReferenceLine x={idealMax} stroke="#10b981" strokeDasharray="4 4" />
                    <ReferenceLine x={aceptableMax} stroke="#ef4444" strokeDasharray="4 4" />
                    <Bar dataKey="promedio" radius={[0, 6, 6, 0]}>
                      {porEspecialidad.map((e, i) => <Cell key={i} fill={colorPorMin(e.promedio, idealMax, aceptableMax)} />)}
                      <LabelList dataKey="promedio" position="right" style={{ fontSize: 11, fontWeight: 700, fill: '#334155' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                {insightEspecialidad && (
                  <ChartInsight tono={insightEspecialidad.tono} titulo="Foco por especialidad">
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
