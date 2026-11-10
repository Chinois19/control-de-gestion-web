import React, { useMemo, useState } from 'react';
import {
  ComposedChart, Line, Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, ReferenceLine, Cell, LabelList
} from 'recharts';
import { Timer, AlertTriangle, Clock, CalendarCheck, Lightbulb, RotateCcw, Info } from 'lucide-react';
import {
  calcularSubprogramacion, resumir, minutosAHHMM, fechaLocalISO,
  PABELLONES_VALIDOS, UMBRAL_DEFECTO_MIN, FECHA_CAMBIO_URGENCIA
} from '../utils/subprogramacion';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DIAS_LARGO = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const fmt = (n, d = 1) => (Number.isFinite(n) ? n.toLocaleString('es-CL', { maximumFractionDigits: d, minimumFractionDigits: 0 }) : '–');
const fmtFecha = (iso) => { const [y, m, d] = iso.split('-'); return `${d}-${m}-${y}`; };
const labelMes = (key) => { const [y, m] = key.split('-'); return `${MESES[Number(m) - 1]}-${y.slice(2)}`; };
const MESES_LARGO = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const labelMesLargo = (key) => { const [y, m] = key.split('-'); return `${MESES_LARGO[Number(m) - 1]} ${y}`; };

const colorPorMin = (min, umbral) => (min >= umbral ? '#ef4444' : min >= umbral / 2 ? '#f59e0b' : '#10b981');

function heatBg(min, umbral) {
  if (min === null || min === undefined) return '#f1f5f9';
  const t = Math.min(1, min / (umbral * 1.5));
  const r = t < 0.5 ? Math.round(16 + (245 - 16) * (t / 0.5)) : Math.round(245 + (239 - 245) * ((t - 0.5) / 0.5));
  const g = t < 0.5 ? Math.round(185 + (158 - 185) * (t / 0.5)) : Math.round(158 + (68 - 158) * ((t - 0.5) / 0.5));
  const b = t < 0.5 ? Math.round(129 + (11 - 129) * (t / 0.5)) : Math.round(11 + (68 - 11) * ((t - 0.5) / 0.5));
  return `rgba(${r}, ${g}, ${b}, 0.28)`;
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

export default function SubprogramacionDiaria({ tablaData = [], disponibilidadData = [], loading = false }) {
  const [tipoDia, setTipoDia] = useState('habiles'); // habiles | no_habiles | todos
  const [esUrgencia, setEsUrgencia] = useState('electivo'); // electivo | urgencia | todos
  const [pabellones, setPabellones] = useState(PABELLONES_VALIDOS);
  const [umbral, setUmbral] = useState(UMBRAL_DEFECTO_MIN);
  const [desde, setDesde] = useState('2026-01-01');
  const [hasta, setHasta] = useState('');

  const todas = useMemo(() => calcularSubprogramacion(tablaData, disponibilidadData, { esUrgencia }), [tablaData, disponibilidadData, esUrgencia]);

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
    return true;
  }), [todas, pabellones, d1, d2, tipoDia]);

  const evaluadas = filtradas;
  const kpi = useMemo(() => resumir(filtradas, umbral), [filtradas, umbral]);

  const agrupar = (clave, etiqueta, ordenFn) => {
    const m = new Map();
    for (const f of evaluadas) {
      const k = clave(f);
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(f);
    }
    const arr = [...m.entries()].map(([k, rows]) => {
      const r = resumir(rows, umbral);
      return { key: k, name: etiqueta(k), promedio: Number(r.promedio.toFixed(1)), pctCriticos: Number(r.pctCriticos.toFixed(1)), n: r.n, dias: new Set(rows.map((x) => x.fecha)).size, totalMin: r.totalMin };
    });
    return ordenFn ? arr.sort(ordenFn) : arr;
  };

  const porMes = useMemo(() => agrupar((f) => f.mesKey, labelMes, (a, b) => (a.key < b.key ? -1 : 1)), [evaluadas, umbral]);
  const porPabellon = useMemo(() => agrupar((f) => f.pabellon, (k) => `Pab. ${k}`, (a, b) => a.key - b.key), [evaluadas, umbral]);
  const porDia = useMemo(() => {
    const ordenDias = [1, 2, 3, 4, 5, 6, 0];
    return agrupar((f) => f.diaSemana, (k) => DIAS[k], (a, b) => ordenDias.indexOf(a.key) - ordenDias.indexOf(b.key));
  }, [evaluadas, umbral]);
  const porEspecialidad = useMemo(
    () => agrupar((f) => f.especialidad || 'Sin especialidad', (k) => k, (a, b) => b.promedio - a.promedio).filter((e) => e.n >= 8).slice(0, 10),
    [evaluadas, umbral]
  );

  const tramos = useMemo(() => {
    const def = [
      { name: 'Sobretiempo', f: (f) => f.sobretiempo > 0, color: '#6366f1' },
      { name: '0–15 min', f: (f) => f.sobretiempo === 0 && f.subprogramacion <= 15, color: '#10b981' },
      { name: '16–30 min', f: (f) => f.subprogramacion > 15 && f.subprogramacion <= 30, color: '#84cc16' },
      { name: '31–59 min', f: (f) => f.subprogramacion > 30 && f.subprogramacion < 60, color: '#f59e0b' },
      { name: '60–120 min', f: (f) => f.subprogramacion >= 60 && f.subprogramacion <= 120, color: '#f97316' },
      { name: '> 120 min', f: (f) => f.subprogramacion > 120, color: '#ef4444' }
    ];
    return def.map((t) => {
      const n = evaluadas.filter(t.f).length;
      return { name: t.name, n, pct: evaluadas.length ? Number(((n / evaluadas.length) * 100).toFixed(1)) : 0, color: t.color };
    });
  }, [evaluadas]);

  const heat = useMemo(() => {
    const meses = [...new Set(evaluadas.map((f) => f.mesKey))].sort();
    const pabs = [...new Set(evaluadas.map((f) => f.pabellon))].sort((a, b) => a - b);
    const cel = new Map();
    for (const f of evaluadas) {
      const k = `${f.pabellon}|${f.mesKey}`;
      if (!cel.has(k)) cel.set(k, []);
      cel.get(k).push(f.subprogramacion);
    }
    return { meses, pabs, valor: (p, m) => { const a = cel.get(`${p}|${m}`); return a ? { v: a.reduce((s, x) => s + x, 0) / a.length, n: a.length } : null; } };
  }, [evaluadas]);

  // Insights contextualizados para cada gráfica
  const insightMensual = useMemo(() => {
    if (porMes.length < 2) return null;
    const a = porMes[porMes.length - 1];
    const b = porMes[porMes.length - 2];
    const delta = a.promedio - b.promedio;
    const parcial = a.dias < 10;
    return {
      tono: parcial ? 'azul' : delta > 0 ? 'rojo' : 'verde',
      texto: `${labelMesLargo(a.key)}${parcial ? ` (mes en curso, ${a.dias} días evaluados)` : ''} registra ${fmt(a.promedio)} min promedio, ${delta > 0 ? 'peor' : 'mejor'} que ${labelMesLargo(b.key)} (${fmt(b.promedio)} min): ${delta > 0 ? '+' : ''}${fmt(delta)} min (${fmt(a.pctCriticos, 0)}% de días con subprogramación ≥ ${umbral} min).`
    };
  }, [porMes, umbral]);

  const insightPabellon = useMemo(() => {
    if (porPabellon.length < 2) return null;
    const pabOrd = [...porPabellon].sort((a, b) => b.promedio - a.promedio);
    const peor = pabOrd[0];
    const mejor = pabOrd[pabOrd.length - 1];
    return {
      tono: peor.promedio >= umbral ? 'rojo' : 'ambar',
      texto: `${peor.name} presenta la mayor subprogramación (${fmt(peor.promedio)} min promedio y ${fmt(peor.pctCriticos, 0)}% de jornadas ≥ ${umbral} min), mientras que ${mejor.name} logra el mejor aprovechamiento al cierre (${fmt(mejor.promedio)} min promedio y solo ${fmt(mejor.pctCriticos, 0)}% con subprogramación).`
    };
  }, [porPabellon, umbral]);

  const insightDia = useMemo(() => {
    const diaOrd = [...porDia].filter((d) => d.n >= 5).sort((a, b) => b.promedio - a.promedio);
    if (diaOrd.length < 2) return null;
    return {
      tono: 'ambar',
      texto: `El día con mayor brecha al cierre es el ${DIAS_LARGO[diaOrd[0].key]} (${fmt(diaOrd[0].promedio)} min promedio, ${fmt(diaOrd[0].pctCriticos, 0)}% ≥ ${umbral} min), mientras que la menor subprogramación se registra el ${DIAS_LARGO[diaOrd[diaOrd.length - 1].key]} (${fmt(diaOrd[diaOrd.length - 1].promedio)} min).`
    };
  }, [porDia, umbral]);

  const insightDistribucion = useMemo(() => {
    if (!evaluadas.length) return null;
    const sobre = evaluadas.filter((f) => f.sobretiempo > 0);
    const promSobre = sobre.length ? sobre.reduce((s, f) => s + f.sobretiempo, 0) / sobre.length : 0;
    const horas = kpi.totalMin / 60;
    return {
      tono: 'azul',
      texto: `Se acumularon ${fmt(horas, 0)} h de pabellón sin usar al cierre (~${fmt(horas / 8, 0)} jornadas de 8 h). A la vez, el ${fmt((sobre.length / evaluadas.length) * 100, 0)}% de los días terminó con sobretiempo (${fmt(promSobre, 0)} min promedio), mostrando coexistencia de subprogramación y extensión horaria.`
    };
  }, [evaluadas, kpi]);

  const insightHeatmap = useMemo(() => {
    if (!heat.pabs.length || !heat.meses.length) return null;
    let maxVal = -1;
    let maxCell = null;
    for (const p of heat.pabs) {
      for (const m of heat.meses) {
        const c = heat.valor(p, m);
        if (c && c.n >= 3 && c.v > maxVal) {
          maxVal = c.v;
          maxCell = { p, m, v: c.v, n: c.n };
        }
      }
    }
    if (!maxCell) return null;
    return {
      tono: maxCell.v >= umbral ? 'rojo' : 'ambar',
      texto: `El mayor foco mensual en la matriz se observa en Pab. ${maxCell.p} durante ${labelMesLargo(maxCell.m)} con ${fmt(maxCell.v, 0)} min promedio de subprogramación al cierre (${maxCell.n} jornadas evaluadas).`
    };
  }, [heat, umbral]);

  const insightEspecialidad = useMemo(() => {
    if (!porEspecialidad.length) return null;
    const e = porEspecialidad[0];
    const mejor = porEspecialidad[porEspecialidad.length - 1];
    return {
      tono: 'ambar',
      texto: `Por especialidad del último paciente, la mayor holgura al cierre corresponde a ${e.name} (${fmt(e.promedio)} min promedio en ${e.n} días, ${fmt(e.pctCriticos, 0)}% ≥ ${umbral} min), frente a ${mejor.name} con ${fmt(mejor.promedio)} min promedio.`
    };
  }, [porEspecialidad, umbral]);

  const togglePab = (p) => setPabellones((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p].sort((a, b) => a - b)));
  const limpiar = () => { setTipoDia('habiles'); setEsUrgencia('electivo'); setPabellones(PABELLONES_VALIDOS); setUmbral(UMBRAL_DEFECTO_MIN); setDesde('2026-01-01'); setHasta(''); };

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>Cargando datos de subprogramación…</div>;
  }
  if (!todas.length) {
    return <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>No hay datos de disponibilidad o de tabla quirúrgica para calcular el indicador.</div>;
  }

  const ayerDate = new Date();
  ayerDate.setDate(ayerDate.getDate() - 1);
  const ayer = fechaLocalISO(ayerDate);

  return (
    <div style={{ padding: '24px 32px 48px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* DEFINICIÓN */}
      <div style={{ ...card, background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)', borderColor: '#c7d2fe', flexDirection: 'row', gap: '14px', alignItems: 'flex-start' }}>
        <Info size={22} color="#4f46e5" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.86rem', color: '#312e81', lineHeight: 1.55 }}>
          <strong>Subprogramación diaria</strong> = hora de término de la disponibilidad del pabellón − hora de salida de pabellón del último paciente intervenido ese día (minutos).
          Ej.: disponibilidad hasta 17:00 y último paciente fuera a las 16:00 → 60 min; a las 16:30 → 30 min.
          Un pabellón-día se clasifica como <strong>Pabellón con Subprogramación</strong> si alcanza o supera <strong>{umbral} min</strong> ({'>='} {umbral} min). Si el último paciente salió después del cierre se registra como sobretiempo (subprogramación 0).
          Solo se evalúan jornadas completas (se excluyen días sin cirugías o con disponibilidad/cirugías solo AM hasta las 13:00) y días cerrados (hasta el {fmtFecha(ayer)}).
          Pabellones 1 a 7 excluyendo estrictamente el de urgencia (pabellón 6 hasta el 30-09-2026; pabellón 2 desde el {fmtFecha(FECHA_CAMBIO_URGENCIA)}).
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
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Umbral Subprogramación (min)</div>
          <input type="number" min={0} step={5} value={umbral} onChange={(e) => setUmbral(Math.max(0, Number(e.target.value) || 0))} style={{ width: '90px', padding: '6px 8px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontWeight: 700 }} />
        </div>
        <button type="button" onClick={limpiar} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 700, color: '#64748b' }}>
          <RotateCcw size={14} /> Restablecer
        </button>
      </div>

      {!evaluadas.length ? (
        <div style={{ ...card, textAlign: 'center', color: '#64748b', fontWeight: 600 }}>No hay pabellón-días evaluables con los filtros actuales.</div>
      ) : (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <KPI icon={<Timer size={16} />} label="Subprogramación promedio" value={`${fmt(kpi.promedio)} min`} sub={`por pabellón-día · ${fmt(kpi.n, 0)} días evaluados`} color={colorPorMin(kpi.promedio, umbral)} />
            <KPI icon={<AlertTriangle size={16} />} label={`Pabellones con Subprogramación (≥ ${umbral} min)`} value={`${fmt(kpi.pctCriticos)}%`} sub={`${fmt(kpi.criticos, 0)} de ${fmt(kpi.n, 0)} pabellón-días`} color="#ef4444" />
            <KPI icon={<Clock size={16} />} label="Horas subprogramadas" value={`${fmt(kpi.totalMin / 60, 0)} h`} sub={`tiempo disponible sin usar al cierre`} color="#f59e0b" />
            <KPI icon={<CalendarCheck size={16} />} label="Con sobretiempo" value={`${fmt(kpi.n ? (kpi.conSobretiempo / kpi.n) * 100 : 0)}%`} sub={`${fmt(kpi.conSobretiempo, 0)} días terminaron después del cierre`} color="#6366f1" />
          </div>

          {/* TENDENCIA + PABELLÓN (con insights integrados) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
            <div style={card}>
              <h3 style={cardTitle}>Evolución mensual</h3>
              <p style={cardSub}>Minutos promedio de subprogramación (barras) y % de pabellones con subprogramación (línea).</p>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={porMes} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="l" tick={{ fontSize: 11 }} unit=" m" />
                  <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                  <RechartsTooltip formatter={(v, n) => (n === '% con subprogramación' ? `${v}%` : `${v} min`)} />
                  <Legend />
                  <ReferenceLine yAxisId="l" y={umbral} stroke="#ef4444" strokeDasharray="4 4" label={{ value: `umbral ${umbral}m`, fontSize: 10, fill: '#ef4444', position: 'insideTopRight' }} />
                  <Bar yAxisId="l" dataKey="promedio" name="Min promedio" radius={[6, 6, 0, 0]}>
                    {porMes.map((e, i) => <Cell key={i} fill={colorPorMin(e.promedio, umbral)} />)}
                  </Bar>
                  <Line yAxisId="r" type="monotone" dataKey="pctCriticos" name="% con subprogramación" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
              {insightMensual && (
                <ChartInsight tono={insightMensual.tono} titulo="Tendencia mensual">
                  {insightMensual.texto}
                </ChartInsight>
              )}
            </div>

            <div style={card}>
              <h3 style={cardTitle}>Por pabellón</h3>
              <p style={cardSub}>Minutos promedio de subprogramación por pabellón.</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={porPabellon} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit=" m" />
                  <RechartsTooltip formatter={(v, n, p) => [`${v} min · ${p.payload.pctCriticos}% con subprogramación · ${p.payload.n} días`, 'Promedio']} />
                  <ReferenceLine y={umbral} stroke="#ef4444" strokeDasharray="4 4" />
                  <Bar dataKey="promedio" radius={[6, 6, 0, 0]}>
                    {porPabellon.map((e, i) => <Cell key={i} fill={colorPorMin(e.promedio, umbral)} />)}
                    <LabelList dataKey="promedio" position="top" style={{ fontSize: 11, fontWeight: 700, fill: '#334155' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {insightPabellon && (
                <ChartInsight tono={insightPabellon.tono} titulo="Desempeño por quirófano">
                  {insightPabellon.texto}
                </ChartInsight>
              )}
            </div>
          </div>

          {/* DÍA SEMANA + DISTRIBUCIÓN */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
            <div style={card}>
              <h3 style={cardTitle}>Por día de la semana</h3>
              <p style={cardSub}>Minutos promedio de subprogramación según el día.</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={porDia} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit=" m" />
                  <RechartsTooltip formatter={(v, n, p) => [`${v} min · ${p.payload.pctCriticos}% con subprogramación · ${p.payload.n} días`, 'Promedio']} />
                  <ReferenceLine y={umbral} stroke="#ef4444" strokeDasharray="4 4" />
                  <Bar dataKey="promedio" radius={[6, 6, 0, 0]}>
                    {porDia.map((e, i) => <Cell key={i} fill={colorPorMin(e.promedio, umbral)} />)}
                    <LabelList dataKey="promedio" position="top" style={{ fontSize: 11, fontWeight: 700, fill: '#334155' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {insightDia && (
                <ChartInsight tono={insightDia.tono} titulo="Patrón semanal">
                  {insightDia.texto}
                </ChartInsight>
              )}
            </div>

            <div style={card}>
              <h3 style={cardTitle}>Distribución de pabellón-días</h3>
              <p style={cardSub}>Cuántos días terminaron en cada tramo de subprogramación.</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={tramos} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip formatter={(v, n, p) => [`${v} días (${p.payload.pct}%)`, 'Pabellón-días']} />
                  <Bar dataKey="n" radius={[6, 6, 0, 0]}>
                    {tramos.map((e, i) => <Cell key={i} fill={e.color} />)}
                    <LabelList dataKey="pct" position="top" formatter={(v) => `${v}%`} style={{ fontSize: 11, fontWeight: 700, fill: '#334155' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {insightDistribucion && (
                <ChartInsight tono={insightDistribucion.tono} titulo="Balance capacidad vs sobretiempo">
                  {insightDistribucion.texto}
                </ChartInsight>
              )}
            </div>
          </div>

          {/* MAPA DE CALOR + ESPECIALIDAD */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
            <div style={card}>
              <h3 style={cardTitle}>Mapa de calor: pabellón × mes</h3>
              <p style={cardSub}>Minutos promedio de subprogramación. Más rojo = más tiempo sin usar al cierre.</p>
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
                            <td key={m} title={c ? `${c.n} días` : 'sin datos'} style={{ textAlign: 'center', padding: '8px 6px', borderRadius: '6px', background: heatBg(c ? c.v : null, umbral), fontWeight: 700, color: '#1e293b' }}>
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
                <ChartInsight tono={insightHeatmap.tono} titulo="Foco crítico mensual">
                  {insightHeatmap.texto}
                </ChartInsight>
              )}
            </div>

            {porEspecialidad.length > 0 && (
              <div style={card}>
                <h3 style={cardTitle}>Por especialidad del último paciente</h3>
                <p style={cardSub}>Top 10 con al menos 8 días evaluados. Indica qué especialidad cierra el día con más tiempo sin usar.</p>
                <ResponsiveContainer width="100%" height={Math.max(220, porEspecialidad.length * 32)}>
                  <BarChart data={porEspecialidad} layout="vertical" margin={{ top: 5, right: 40, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} unit=" m" />
                    <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 11 }} />
                    <RechartsTooltip formatter={(v, n, p) => [`${v} min · ${p.payload.pctCriticos}% con subprogramación · ${p.payload.n} días`, 'Promedio']} />
                    <ReferenceLine x={umbral} stroke="#ef4444" strokeDasharray="4 4" />
                    <Bar dataKey="promedio" radius={[0, 6, 6, 0]}>
                      {porEspecialidad.map((e, i) => <Cell key={i} fill={colorPorMin(e.promedio, umbral)} />)}
                      <LabelList dataKey="promedio" position="right" style={{ fontSize: 11, fontWeight: 700, fill: '#334155' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                {insightEspecialidad && (
                  <ChartInsight tono={insightEspecialidad.tono} titulo="Foco por especialidad al cierre">
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
