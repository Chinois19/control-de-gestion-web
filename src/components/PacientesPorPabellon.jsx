import React, { useMemo, useState } from 'react';
import {
  ComposedChart, Line, Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, ReferenceLine, Cell, LabelList
} from 'recharts';
import { Users, Activity, CheckCircle, AlertTriangle, Lightbulb, RotateCcw, Info } from 'lucide-react';
import {
  calcularPacientesPorPabellon, resumirPacientesPorPabellon, fechaLocalISO,
  PABELLONES_VALIDOS, META_PACIENTES_DEFECTO, FECHA_CAMBIO_URGENCIA
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

const colorPorPacientes = (prom, meta) => (prom >= meta ? '#10b981' : prom >= meta * 0.75 ? '#f59e0b' : '#ef4444');

function heatBg(val, meta) {
  if (val === null || val === undefined) return '#f1f5f9';
  const ratio = Math.min(1, Math.max(0, (val - 1.5) / Math.max(1, meta - 1)));
  const r = ratio < 0.5 ? Math.round(239 + (245 - 239) * (ratio / 0.5)) : Math.round(245 + (16 - 245) * ((ratio - 0.5) / 0.5));
  const g = ratio < 0.5 ? Math.round(68 + (158 - 68) * (ratio / 0.5)) : Math.round(158 + (185 - 158) * ((ratio - 0.5) / 0.5));
  const b = ratio < 0.5 ? Math.round(68 + (11 - 68) * (ratio / 0.5)) : Math.round(11 + (129 - 11) * ((ratio - 0.5) / 0.5));
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

export default function PacientesPorPabellon({ tablaData = [], disponibilidadData = [], loading = false }) {
  const [tipoDia, setTipoDia] = useState('habiles'); // habiles | no_habiles | todos
  const [pabellones, setPabellones] = useState(PABELLONES_VALIDOS);
  const [meta, setMeta] = useState(META_PACIENTES_DEFECTO);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const todas = useMemo(() => calcularPacientesPorPabellon(tablaData, disponibilidadData), [tablaData, disponibilidadData]);

  const rango = useMemo(() => {
    if (!todas.length) return { min: '', max: '' };
    return { min: todas[0].fecha, max: todas[todas.length - 1].fecha };
  }, [todas]);

  const d1 = desde || rango.min;
  const d2 = hasta || rango.max;

  const filtradas = useMemo(() => todas.filter((f) => {
    if (!pabellones.includes(f.pabellon)) return false;
    if (f.fecha < d1 || f.fecha > d2) return false;
    const finde = f.diaSemana === 0 || f.diaSemana === 6;
    if (tipoDia === 'habiles' && finde) return false;
    if (tipoDia === 'no_habiles' && !finde) return false;
    return true;
  }), [todas, pabellones, d1, d2, tipoDia]);

  const kpi = useMemo(() => resumirPacientesPorPabellon(filtradas, meta), [filtradas, meta]);

  const agrupar = (clave, etiqueta, ordenFn) => {
    const m = new Map();
    for (const f of filtradas) {
      const k = clave(f);
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(f);
    }
    const arr = [...m.entries()].map(([k, rows]) => {
      const r = resumirPacientesPorPabellon(rows, meta);
      return {
        key: k,
        name: etiqueta(k),
        promedio: Number(r.promedio.toFixed(2)),
        mediana: Number(r.mediana.toFixed(1)),
        pctCumplenMeta: Number(r.pctCumplenMeta.toFixed(1)),
        pctCMA: Number(r.pctCMA.toFixed(1)),
        n: r.nDiasPabellon,
        totalPacientes: r.totalPacientes,
        dias: r.diasCalendario
      };
    });
    return ordenFn ? arr.sort(ordenFn) : arr;
  };

  const porMes = useMemo(() => agrupar((f) => f.mesKey, labelMes, (a, b) => (a.key < b.key ? -1 : 1)), [filtradas, meta]);
  const porPabellon = useMemo(() => agrupar((f) => f.pabellon, (k) => `Pab. ${k}`, (a, b) => a.key - b.key), [filtradas, meta]);
  const porDia = useMemo(() => {
    const ordenDias = [1, 2, 3, 4, 5, 6, 0];
    return agrupar((f) => f.diaSemana, (k) => DIAS[k], (a, b) => ordenDias.indexOf(a.key) - ordenDias.indexOf(b.key));
  }, [filtradas, meta]);
  const porEspecialidad = useMemo(
    () => agrupar((f) => f.especialidad || 'Sin especialidad', (k) => k, (a, b) => b.promedio - a.promedio).filter((e) => e.n >= 8).slice(0, 10),
    [filtradas, meta]
  );

  const tramos = useMemo(() => {
    const def = [
      { name: '1 paciente', f: (f) => f.nPacientes === 1, color: '#ef4444' },
      { name: '2 pacientes', f: (f) => f.nPacientes === 2, color: '#f97316' },
      { name: '3 pacientes', f: (f) => f.nPacientes === 3, color: '#eab308' },
      { name: '4 pacientes', f: (f) => f.nPacientes === 4, color: '#84cc16' },
      { name: '5 pacientes', f: (f) => f.nPacientes === 5, color: '#10b981' },
      { name: '6+ pacientes', f: (f) => f.nPacientes >= 6, color: '#059669' }
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

  // Insights focalizados para cada gráfica
  const insightMensual = useMemo(() => {
    if (porMes.length < 2) return null;
    const a = porMes[porMes.length - 1];
    const b = porMes[porMes.length - 2];
    const delta = a.promedio - b.promedio;
    const parcial = a.dias < 10;
    return {
      tono: parcial ? 'azul' : delta >= 0 ? 'verde' : 'rojo',
      texto: `${labelMesLargo(a.key)}${parcial ? ` (mes en curso, ${a.n} pabellón-días)` : ''} promedia ${fmt(a.promedio, 2)} pacientes/pabellón, ${delta >= 0 ? 'superando' : 'por debajo de'} ${labelMesLargo(b.key)} (${fmt(b.promedio, 2)}): ${delta >= 0 ? '+' : ''}${fmt(delta, 2)} pacientes por jornada.`
    };
  }, [porMes]);

  const insightPabellon = useMemo(() => {
    if (porPabellon.length < 2) return null;
    const pabOrd = [...porPabellon].sort((a, b) => b.promedio - a.promedio);
    const mayor = pabOrd[0];
    const menor = pabOrd[pabOrd.length - 1];
    return {
      tono: 'verde',
      texto: `${mayor.name} lidera el rendimiento diario con ${fmt(mayor.promedio, 2)} pacientes/día (${fmt(mayor.pctCumplenMeta, 0)}% de sus jornadas alcanza ≥ ${meta} pacientes), mientras que ${menor.name} registra ${fmt(menor.promedio, 2)} pacientes/día por cirugías de mayor extensión.`
    };
  }, [porPabellon, meta]);

  const insightDia = useMemo(() => {
    const diaOrd = [...porDia].filter((d) => d.n >= 5).sort((a, b) => b.promedio - a.promedio);
    if (diaOrd.length < 2) return null;
    return {
      tono: 'ambar',
      texto: `La mayor productividad por quirófano se alcanza los ${DIAS_LARGO[diaOrd[0].key]} (${fmt(diaOrd[0].promedio, 2)} pacientes/pabellón) y la menor los ${DIAS_LARGO[diaOrd[diaOrd.length - 1].key]} (${fmt(diaOrd[diaOrd.length - 1].promedio, 2)} pacientes/pabellón).`
    };
  }, [porDia]);

  const insightDistribucion = useMemo(() => {
    if (!kpi.nDiasPabellon) return null;
    const potencial = (kpi.totalPacientes + kpi.totalSuspendidos) / kpi.nDiasPabellon;
    const perdidaPorDia = kpi.totalSuspendidos / kpi.nDiasPabellon;
    return {
      tono: 'azul',
      texto: `El ${fmt(kpi.pctCumplenMeta, 1)}% de las jornadas resuelve ≥ ${meta} pacientes. En estos pabellón-días hubo ${fmt(kpi.totalSuspendidos, 0)} suspensiones (~${fmt(perdidaPorDia, 2)} pac/día); sin suspensiones el rendimiento potencial alcanzaría ${fmt(potencial, 2)} pacientes/pabellón.`
    };
  }, [kpi, meta]);

  const insightHeatmap = useMemo(() => {
    if (!heat.pabs.length || !heat.meses.length) return null;
    let best = null;
    for (const p of heat.pabs) {
      for (const m of heat.meses) {
        const c = heat.valor(p, m);
        if (c && c.n >= 4 && (!best || c.v > best.v)) {
          best = { p, m, v: c.v, n: c.n, total: c.total };
        }
      }
    }
    if (!best) return null;
    return {
      tono: 'verde',
      texto: `El pico mensual de productividad en la matriz corresponde a Pab. ${best.p} en ${labelMesLargo(best.m)}, alcanzando ${fmt(best.v, 2)} pacientes/día (${best.total} cirugías en ${best.n} jornadas).`
    };
  }, [heat]);

  const insightEspecialidad = useMemo(() => {
    if (porEspecialidad.length < 2) return null;
    const topEsp = porEspecialidad[0];
    const lowEsp = porEspecialidad[porEspecialidad.length - 1];
    return {
      tono: 'ambar',
      texto: `Efecto case-mix: ${topEsp.name} alcanza la mayor rotación con ${fmt(topEsp.promedio, 2)} pacientes/día (${fmt(topEsp.pctCMA, 0)}% ambulatoria), mientras que ${lowEsp.name} promedia ${fmt(lowEsp.promedio, 2)} pacientes/día por mayor duración quirúrgica por caso.`
    };
  }, [porEspecialidad]);

  const togglePab = (p) => setPabellones((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p].sort((a, b) => a - b)));
  const limpiar = () => {
    setTipoDia('habiles');
    setPabellones(PABELLONES_VALIDOS);
    setMeta(META_PACIENTES_DEFECTO);
    setDesde('');
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
      {/* DEFINICIÓN */}
      <div style={{ ...card, background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)', borderColor: '#c7d2fe', flexDirection: 'row', gap: '14px', alignItems: 'flex-start' }}>
        <Info size={22} color="#4f46e5" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.86rem', color: '#312e81', lineHeight: 1.55 }}>
          <strong>Número promedio de pacientes por pabellón</strong> = total de pacientes efectivamente intervenidos dividido por el total de jornadas de pabellón electivo con actividad quirúrgica (<code>pacientes / pabellón-día</code>).
          Permite evaluar la productividad diaria, la intensidad de rotación de quirófanos y el impacto del tipo de cirugía (ambulatoria vs. mayor complejidad) y de las suspensiones en el rendimiento diario.
          Se evalúan exclusivamente los <strong>pabellones electivos (1 a 7)</strong> en días cerrados (hasta el {fmtFecha(ayer)}), excluyendo el pabellón de urgencia (pabellón 6 hasta el 30-09-2026 y pabellón 2 desde el {fmtFecha(FECHA_CAMBIO_URGENCIA)}).
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
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Tipo de día</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <Chip active={tipoDia === 'habiles'} onClick={() => setTipoDia('habiles')}>Lun–Vie</Chip>
            <Chip active={tipoDia === 'no_habiles'} onClick={() => setTipoDia('no_habiles')}>Sáb–Dom</Chip>
            <Chip active={tipoDia === 'todos'} onClick={() => setTipoDia('todos')}>Todos</Chip>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Período</div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input type="date" value={d1} min={rango.min} max={rango.max} onChange={(e) => setDesde(e.target.value)} style={{ padding: '6px 8px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }} />
            <span style={{ color: '#94a3b8' }}>→</span>
            <input type="date" value={d2} min={rango.min} max={rango.max} onChange={(e) => setHasta(e.target.value)} style={{ padding: '6px 8px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Referencia / Meta (pac/día)</div>
          <input type="number" min={1} max={12} step={0.5} value={meta} onChange={(e) => setMeta(Math.max(1, Number(e.target.value) || 1))} style={{ width: '90px', padding: '6px 8px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontWeight: 700 }} />
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
              sub={`Mediana ${fmt(kpi.mediana, 0)} pac/día · Máx ${kpi.maxPacientes} pac/día`}
              color={colorPorPacientes(kpi.promedio, meta)}
            />
            <KPI
              icon={<Activity size={16} />}
              label="Total pacientes intervenidos"
              value={fmt(kpi.totalPacientes, 0)}
              sub={`en ${fmt(kpi.nDiasPabellon, 0)} pabellón-días (${fmt(kpi.diasCalendario, 0)} días calendario)`}
              color="#6366f1"
            />
            <KPI
              icon={<CheckCircle size={16} />}
              label={`Jornadas sobre referencia (≥ ${meta} pac)`}
              value={`${fmt(kpi.pctCumplenMeta)}%`}
              sub={`${fmt(kpi.cumplenMeta, 0)} de ${fmt(kpi.nDiasPabellon, 0)} pabellón-días`}
              color="#10b981"
            />
            <KPI
              icon={<AlertTriangle size={16} />}
              label="Jornadas de baja rotación (≤ 2 pac)"
              value={`${fmt(kpi.pctBajaProduccion)}%`}
              sub={`${fmt(kpi.bajaProduccion, 0)} pabellón-días con 1 o 2 cirugías`}
              color="#f59e0b"
            />
          </div>

          {/* TENDENCIA MENSUAL + POR PABELLÓN (con insights integrados) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
            <div style={card}>
              <h3 style={cardTitle}>Evolución mensual de pacientes por pabellón</h3>
              <p style={cardSub}>Promedio de pacientes por pabellón-día (barras) y % de jornadas con ≥ {meta} pacientes (línea).</p>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={porMes} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="l" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                  <RechartsTooltip formatter={(v, n) => (n.includes('%') ? `${v}%` : `${v} pac/día`)} />
                  <Legend />
                  <ReferenceLine yAxisId="l" y={meta} stroke="#10b981" strokeDasharray="4 4" label={{ value: `meta ${meta}`, fontSize: 10, fill: '#059669', position: 'insideTopRight' }} />
                  <Bar yAxisId="l" dataKey="promedio" name="Pacientes promedio / pabellón" radius={[6, 6, 0, 0]}>
                    {porMes.map((e, i) => <Cell key={i} fill={colorPorPacientes(e.promedio, meta)} />)}
                  </Bar>
                  <Line yAxisId="r" type="monotone" dataKey="pctCumplenMeta" name={`% días ≥ ${meta} pac`} stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} />
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
              <p style={cardSub}>Rendimiento diario comparativo entre los pabellones electivos.</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={porPabellon} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip formatter={(v, n, p) => [`${v} pac/día (${p.payload.totalPacientes} cirugías en ${p.payload.n} días · ${p.payload.pctCumplenMeta}% ≥ ${meta} pac)`, 'Promedio']} />
                  <ReferenceLine y={meta} stroke="#10b981" strokeDasharray="4 4" />
                  <Bar dataKey="promedio" radius={[6, 6, 0, 0]}>
                    {porPabellon.map((e, i) => <Cell key={i} fill={colorPorPacientes(e.promedio, meta)} />)}
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
                  <RechartsTooltip formatter={(v, n, p) => [`${v} pac/día (${p.payload.totalPacientes} cirugías en ${p.payload.n} pabellón-días)`, 'Promedio']} />
                  <ReferenceLine y={meta} stroke="#10b981" strokeDasharray="4 4" />
                  <Bar dataKey="promedio" radius={[6, 6, 0, 0]}>
                    {porDia.map((e, i) => <Cell key={i} fill={colorPorPacientes(e.promedio, meta)} />)}
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
              <h3 style={cardTitle}>Distribución de jornadas según N° de pacientes</h3>
              <p style={cardSub}>Frecuencia de pabellón-días que resolvieron 1, 2, 3, 4, 5 o 6+ pacientes.</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={tramos} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip formatter={(v, n, p) => [`${v} pabellón-días (${p.payload.pct}%)`, 'Jornadas']} />
                  <Bar dataKey="n" radius={[6, 6, 0, 0]}>
                    {tramos.map((e, i) => <Cell key={i} fill={e.color} />)}
                    <LabelList dataKey="pct" position="top" formatter={(v) => `${v}%`} style={{ fontSize: 11, fontWeight: 700, fill: '#334155' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {insightDistribucion && (
                <ChartInsight tono={insightDistribucion.tono} titulo="Aprovechamiento y efecto suspensiones">
                  {insightDistribucion.texto}
                </ChartInsight>
              )}
            </div>
          </div>

          {/* MAPA DE CALOR + ESPECIALIDAD */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
            <div style={card}>
              <h3 style={cardTitle}>Mapa de calor: pabellón × mes</h3>
              <p style={cardSub}>Promedio de pacientes por pabellón-día en cada mes. Más verde = mayor rotación de pacientes por jornada.</p>
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
                            <td key={m} title={c ? `${c.total} pacientes en ${c.n} días` : 'sin datos'} style={{ textAlign: 'center', padding: '8px 6px', borderRadius: '6px', background: heatBg(c ? c.v : null, meta), fontWeight: 700, color: '#1e293b' }}>
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
                <ChartInsight tono={insightHeatmap.tono} titulo="Máxima rotación mensual">
                  {insightHeatmap.texto}
                </ChartInsight>
              )}
            </div>

            {porEspecialidad.length > 0 && (
              <div style={card}>
                <h3 style={cardTitle}>Promedio de pacientes por pabellón-día según especialidad</h3>
                <p style={cardSub}>Especialidades con al menos 8 jornadas evaluadas (refleja la rotación propia de cada especialidad).</p>
                <ResponsiveContainer width="100%" height={Math.max(220, porEspecialidad.length * 32)}>
                  <BarChart data={porEspecialidad} layout="vertical" margin={{ top: 5, right: 45, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 11 }} />
                    <RechartsTooltip formatter={(v, n, p) => [`${v} pac/día (${p.payload.totalPacientes} cirugías en ${p.payload.n} días · ${p.payload.pctCMA}% CMA)`, 'Promedio']} />
                    <ReferenceLine x={meta} stroke="#10b981" strokeDasharray="4 4" />
                    <Bar dataKey="promedio" radius={[0, 6, 6, 0]}>
                      {porEspecialidad.map((e, i) => <Cell key={i} fill={colorPorPacientes(e.promedio, meta)} />)}
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
