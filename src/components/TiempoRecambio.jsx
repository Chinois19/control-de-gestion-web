import React, { useMemo, useState } from 'react';
import {
  ComposedChart, Line, Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, ReferenceLine, Cell, LabelList
} from 'recharts';
import { RefreshCw, Timer, CheckCircle, AlertTriangle, Clock, Lightbulb, RotateCcw, Info } from 'lucide-react';
import {
  calcularRecambios, resumirRecambios, fechaLocalISO,
  PABELLONES_VALIDOS, UMBRAL_RECAMBIO_DEFECTO_MIN, TOPE_COLACION_MIN, FECHA_CAMBIO_URGENCIA
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

const colorPorMin = (min, umbral) => (min > umbral ? '#ef4444' : min > umbral * 0.66 ? '#f59e0b' : '#10b981');

function heatBg(min, umbral) {
  if (min === null || min === undefined) return '#f1f5f9';
  const t = Math.min(1, min / Math.max(1, umbral * 1.5));
  const r = t < 0.5 ? Math.round(16 + (245 - 16) * (t / 0.5)) : Math.round(245 + (239 - 245) * ((t - 0.5) / 0.5));
  const g = t < 0.5 ? Math.round(185 + (158 - 185) * (t / 0.5)) : Math.round(158 + (68 - 158) * ((t - 0.5) / 0.5));
  const b = t < 0.5 ? Math.round(129 + (11 - 129) * (t / 0.5)) : Math.round(11 + (68 - 11) * ((t - 0.5) / 0.5));
  return `rgba(${r}, ${g}, ${b}, 0.28)`;
}

const card = { background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px 22px', boxShadow: '0 2px 10px rgba(15,23,42,0.04)' };
const cardTitle = { margin: '0 0 4px 0', fontSize: '1.02rem', fontWeight: 800, color: '#1e293b' };
const cardSub = { margin: '0 0 14px 0', fontSize: '0.8rem', color: '#64748b' };

function KPI({ icon, label, value, sub, color = '#6366f1' }) {
  return (
    <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '6px', borderTop: `4px solid ${color}` }}>
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
  const [modoTransicion, setModoTransicion] = useState('acotados'); // acotados (<=180m) | misma_jornada | todos
  const [pabellones, setPabellones] = useState(PABELLONES_VALIDOS);
  const [umbral, setUmbral] = useState(UMBRAL_RECAMBIO_DEFECTO_MIN);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const todosRecambios = useMemo(() => calcularRecambios(tablaData, disponibilidadData), [tablaData, disponibilidadData]);

  const rango = useMemo(() => {
    if (!todosRecambios.length) return { min: '', max: '' };
    return { min: todosRecambios[0].fecha, max: todosRecambios[todosRecambios.length - 1].fecha };
  }, [todosRecambios]);

  const d1 = desde || rango.min;
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

  const kpi = useMemo(() => resumirRecambios(filtradas, umbral), [filtradas, umbral]);

  const agrupar = (clave, etiqueta, ordenFn) => {
    const m = new Map();
    for (const f of filtradas) {
      const k = clave(f);
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(f);
    }
    const arr = [...m.entries()].map(([k, rows]) => {
      const r = resumirRecambios(rows, umbral);
      return {
        key: k,
        name: etiqueta(k),
        promedio: Number(r.promedio.toFixed(1)),
        mediana: Number(r.mediana.toFixed(1)),
        pctSobreUmbral: Number(r.pctSobreUmbral.toFixed(1)),
        pctDentroMeta: Number(r.pctDentroMeta.toFixed(1)),
        n: r.n,
        dias: r.diasEvaluados,
        totalMin: r.totalMin
      };
    });
    return ordenFn ? arr.sort(ordenFn) : arr;
  };

  const porMes = useMemo(() => agrupar((f) => f.mesKey, labelMes, (a, b) => (a.key < b.key ? -1 : 1)), [filtradas, umbral]);
  const porPabellon = useMemo(() => agrupar((f) => f.pabellon, (k) => `Pab. ${k}`, (a, b) => a.key - b.key), [filtradas, umbral]);
  const porDia = useMemo(() => {
    const ordenDias = [1, 2, 3, 4, 5, 6, 0];
    return agrupar((f) => f.diaSemana, (k) => DIAS[k], (a, b) => ordenDias.indexOf(a.key) - ordenDias.indexOf(b.key));
  }, [filtradas, umbral]);
  const porEspecialidad = useMemo(
    () => agrupar((f) => f.especialidad || 'Sin especialidad', (k) => k, (a, b) => b.promedio - a.promedio).filter((e) => e.n >= 10).slice(0, 10),
    [filtradas, umbral]
  );

  const tramos = useMemo(() => {
    const def = [
      { name: '0–10 min', f: (f) => f.recambio <= 10, color: '#10b981' },
      { name: '11–20 min', f: (f) => f.recambio > 10 && f.recambio <= 20, color: '#84cc16' },
      { name: '21–30 min', f: (f) => f.recambio > 20 && f.recambio <= 30, color: '#eab308' },
      { name: '31–45 min', f: (f) => f.recambio > 30 && f.recambio <= 45, color: '#f97316' },
      { name: '46–60 min', f: (f) => f.recambio > 45 && f.recambio <= 60, color: '#ef4444' },
      { name: '> 60 min', f: (f) => f.recambio > 60, color: '#b91c1c' }
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

  const insights = useMemo(() => {
    if (!filtradas.length) return [];
    const out = [];

    out.push({
      tono: kpi.promedio <= umbral ? 'verde' : 'ambar',
      texto: `El tiempo promedio de recambio es de ${fmt(kpi.promedio)} min (mediana de ${fmt(kpi.mediana, 0)} min) en ${fmt(kpi.n, 0)} transiciones evaluadas; el ${fmt(kpi.pctDentroMeta, 0)}% de los recambios se realiza en ≤ ${umbral} min.`
    });

    const pabOrd = [...porPabellon].sort((a, b) => a.promedio - b.promedio);
    if (pabOrd.length > 1) {
      const masRapido = pabOrd[0];
      const masLento = pabOrd[pabOrd.length - 1];
      out.push({
        tono: 'verde',
        texto: `${masRapido.name} registra el recambio más ágil: ${fmt(masRapido.promedio)} min promedio (${fmt(masRapido.pctDentroMeta, 0)}% dentro de ≤ ${umbral} min en ${masRapido.n} recambios).`
      });
      out.push({
        tono: 'rojo',
        texto: `${masLento.name} presenta el mayor tiempo de recambio: ${fmt(masLento.promedio)} min promedio y ${fmt(masLento.pctSobreUmbral, 0)}% de sus transiciones superan los ${umbral} min.`
      });
    }

    const diaOrd = [...porDia].filter((d) => d.n >= 5).sort((a, b) => b.promedio - a.promedio);
    if (diaOrd.length > 1) {
      out.push({
        tono: 'ambar',
        texto: `Por día de la semana, el recambio más prolongado ocurre el ${DIAS_LARGO[diaOrd[0].key]} (${fmt(diaOrd[0].promedio)} min promedio) y el más rápido el ${DIAS_LARGO[diaOrd[diaOrd.length - 1].key]} (${fmt(diaOrd[diaOrd.length - 1].promedio)} min).`
      });
    }

    if (porMes.length >= 2) {
      const a = porMes[porMes.length - 1];
      const b = porMes[porMes.length - 2];
      const delta = a.promedio - b.promedio;
      const parcial = a.dias < 10;
      out.push({
        tono: parcial ? 'azul' : delta > 0 ? 'rojo' : 'verde',
        texto: `${labelMesLargo(a.key)}${parcial ? ` (mes en curso, ${a.n} recambios)` : ''} promedia ${fmt(a.promedio)} min por recambio, ${delta > 0 ? 'mayor' : 'menor'} que ${labelMesLargo(b.key)} (${fmt(b.promedio)} min): ${delta > 0 ? '+' : ''}${fmt(delta)} min.`
      });
    }

    const mismaEsp = filtradas.filter((f) => f.mismaEspecialidad);
    const distintaEsp = filtradas.filter((f) => !f.mismaEspecialidad);
    if (mismaEsp.length >= 10 && distintaEsp.length >= 10) {
      const promMisma = mismaEsp.reduce((s, x) => s + x.recambio, 0) / mismaEsp.length;
      const promDistinta = distintaEsp.reduce((s, x) => s + x.recambio, 0) / distintaEsp.length;
      out.push({
        tono: 'azul',
        texto: `Cuando se mantiene la misma especialidad entre cirugías consecutivas el recambio promedia ${fmt(promMisma)} min, mientras que al cambiar de especialidad sube a ${fmt(promDistinta)} min.`
      });
    }

    if (porEspecialidad.length > 1) {
      const masLenta = porEspecialidad[0];
      const masRapida = porEspecialidad[porEspecialidad.length - 1];
      out.push({
        tono: 'ambar',
        texto: `Por especialidad, los recambios más extensos se observan en ${masLenta.name} (${fmt(masLenta.promedio)} min promedio) y los más breves en ${masRapida.name} (${fmt(masRapida.promedio)} min).`
      });
    }

    return out;
  }, [filtradas, porPabellon, porDia, porMes, porEspecialidad, kpi, umbral]);

  const togglePab = (p) => setPabellones((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p].sort((a, b) => a - b)));
  const limpiar = () => {
    setTipoDia('habiles');
    setModoTransicion('acotados');
    setPabellones(PABELLONES_VALIDOS);
    setUmbral(UMBRAL_RECAMBIO_DEFECTO_MIN);
    setDesde('');
    setHasta('');
  };

  const tonoColor = { rojo: '#ef4444', verde: '#10b981', ambar: '#f59e0b', azul: '#6366f1' };

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
      {/* DEFINICIÓN */}
      <div style={{ ...card, background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)', borderColor: '#c7d2fe', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        <Info size={22} color="#4f46e5" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.86rem', color: '#312e81', lineHeight: 1.55 }}>
          <strong>Tiempo de recambio entre pacientes</strong> = hora de ingreso a pabellón del paciente siguiente (<code>hora_ingreso_cirugia</code>) − hora de salida de pabellón del paciente anterior (<code>hora_salida_cirugia</code>), medido en minutos dentro del mismo pabellón y día.
          Ej.: si un paciente sale de pabellón a las 14:00 hrs y el siguiente ingresa a las 14:30 hrs, el tiempo de recambio es de <strong>30 minutos</strong>.
          Se evalúan exclusivamente los <strong>pabellones electivos (1 a 7)</strong> en días cerrados (hasta el {fmtFecha(ayer)}), excluyendo el pabellón de urgencia (pabellón 6 hasta el 30-09-2026 y pabellón 2 desde el {fmtFecha(FECHA_CAMBIO_URGENCIA)}).
        </div>
      </div>

      {/* FILTROS */}
      <div style={{ ...card, display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end' }}>
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
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Tipo de transición</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <Chip active={modoTransicion === 'acotados'} onClick={() => setModoTransicion('acotados')}>Continuos (≤ 3 h)</Chip>
            <Chip active={modoTransicion === 'misma_jornada'} onClick={() => setModoTransicion('misma_jornada')}>Mismo bloque (AM/PM)</Chip>
            <Chip active={modoTransicion === 'todos'} onClick={() => setModoTransicion('todos')}>Todos</Chip>
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
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Meta Recambio (min)</div>
          <input type="number" min={5} step={5} value={umbral} onChange={(e) => setUmbral(Math.max(5, Number(e.target.value) || 0))} style={{ width: '90px', padding: '6px 8px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontWeight: 700 }} />
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
              sub={`${fmt(kpi.n, 0)} recambios en ${fmt(kpi.diasEvaluados, 0)} pabellón-días`}
              color={colorPorMin(kpi.promedio, umbral)}
            />
            <KPI
              icon={<Timer size={16} />}
              label="Mediana de recambio"
              value={`${fmt(kpi.mediana, 0)} min`}
              sub="50% de los pacientes ingresa dentro de este tiempo"
              color="#6366f1"
            />
            <KPI
              icon={<CheckCircle size={16} />}
              label={`Recambios oportunos (≤ ${umbral} min)`}
              value={`${fmt(kpi.pctDentroMeta)}%`}
              sub={`${fmt(kpi.dentroMeta, 0)} de ${fmt(kpi.n, 0)} transiciones`}
              color="#10b981"
            />
            <KPI
              icon={<AlertTriangle size={16} />}
              label={`Recambio prolongado (> ${umbral} min)`}
              value={`${fmt(kpi.pctSobreUmbral)}%`}
              sub={`${fmt(kpi.sobreUmbral, 0)} transiciones · ${fmt(kpi.totalMin / 60, 0)} h totales en recambios`}
              color="#ef4444"
            />
          </div>

          {/* INSIGHTS */}
          <div style={card}>
            <h3 style={{ ...cardTitle, display: 'flex', alignItems: 'center', gap: '8px' }}><Lightbulb size={18} color="#f59e0b" /> Principales insights</h3>
            <p style={cardSub}>Hallazgos calculados automáticamente según los filtros seleccionados.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '10px' }}>
              {insights.map((it, i) => (
                <div key={i} style={{ borderLeft: `4px solid ${tonoColor[it.tono]}`, background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '0.86rem', color: '#334155', lineHeight: 1.5 }}>
                  {it.texto}
                </div>
              ))}
            </div>
          </div>

          {/* TENDENCIA MENSUAL + POR PABELLÓN */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
            <div style={card}>
              <h3 style={cardTitle}>Evolución mensual del tiempo de recambio</h3>
              <p style={cardSub}>Minutos promedio de recambio (barras) y % de recambios prolongados &gt; {umbral} min (línea).</p>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={porMes} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="l" tick={{ fontSize: 11 }} unit=" m" />
                  <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                  <RechartsTooltip formatter={(v, n) => (n.includes('%') ? `${v}%` : `${v} min`)} />
                  <Legend />
                  <ReferenceLine yAxisId="l" y={umbral} stroke="#ef4444" strokeDasharray="4 4" label={{ value: `meta ${umbral}m`, fontSize: 10, fill: '#ef4444', position: 'insideTopRight' }} />
                  <Bar yAxisId="l" dataKey="promedio" name="Min promedio recambio" radius={[6, 6, 0, 0]}>
                    {porMes.map((e, i) => <Cell key={i} fill={colorPorMin(e.promedio, umbral)} />)}
                  </Bar>
                  <Line yAxisId="r" type="monotone" dataKey="pctSobreUmbral" name={`% > ${umbral} min`} stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div style={card}>
              <h3 style={cardTitle}>Tiempo promedio de recambio por pabellón</h3>
              <p style={cardSub}>Comparativa entre pabellones electivos (minutos promedio entre salida e ingreso).</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={porPabellon} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit=" m" />
                  <RechartsTooltip formatter={(v, n, p) => [`${v} min (mediana ${p.payload.mediana}m) · ${p.payload.pctDentroMeta}% ≤ ${umbral}m · ${p.payload.n} recambios`, 'Promedio']} />
                  <ReferenceLine y={umbral} stroke="#ef4444" strokeDasharray="4 4" />
                  <Bar dataKey="promedio" radius={[6, 6, 0, 0]}>
                    {porPabellon.map((e, i) => <Cell key={i} fill={colorPorMin(e.promedio, umbral)} />)}
                    <LabelList dataKey="promedio" position="top" style={{ fontSize: 11, fontWeight: 700, fill: '#334155' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DÍA DE LA SEMANA + DISTRIBUCIÓN POR TRAMOS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
            <div style={card}>
              <h3 style={cardTitle}>Por día de la semana</h3>
              <p style={cardSub}>Minutos promedio de recambio según el día.</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={porDia} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit=" m" />
                  <RechartsTooltip formatter={(v, n, p) => [`${v} min (mediana ${p.payload.mediana}m) · ${p.payload.n} recambios`, 'Promedio']} />
                  <ReferenceLine y={umbral} stroke="#ef4444" strokeDasharray="4 4" />
                  <Bar dataKey="promedio" radius={[6, 6, 0, 0]}>
                    {porDia.map((e, i) => <Cell key={i} fill={colorPorMin(e.promedio, umbral)} />)}
                    <LabelList dataKey="promedio" position="top" style={{ fontSize: 11, fontWeight: 700, fill: '#334155' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={card}>
              <h3 style={cardTitle}>Distribución de tiempos de recambio</h3>
              <p style={cardSub}>Proporción de transiciones entre pacientes según duración en minutos.</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={tramos} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip formatter={(v, n, p) => [`${v} recambios (${p.payload.pct}%)`, 'Transiciones']} />
                  <Bar dataKey="n" radius={[6, 6, 0, 0]}>
                    {tramos.map((e, i) => <Cell key={i} fill={e.color} />)}
                    <LabelList dataKey="pct" position="top" formatter={(v) => `${v}%`} style={{ fontSize: 11, fontWeight: 700, fill: '#334155' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* MAPA DE CALOR */}
          <div style={card}>
            <h3 style={cardTitle}>Mapa de calor: pabellón × mes</h3>
            <p style={cardSub}>Minutos promedio de recambio entre pacientes. Más verde = recambio más ágil; más rojo = mayor espera entre cirugías.</p>
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
                          <td key={m} title={c ? `${c.n} recambios` : 'sin datos'} style={{ textAlign: 'center', padding: '8px 6px', borderRadius: '6px', background: heatBg(c ? c.v : null, umbral), fontWeight: 700, color: '#1e293b' }}>
                            {c ? fmt(c.v, 0) : '–'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* POR ESPECIALIDAD */}
          {porEspecialidad.length > 0 && (
            <div style={card}>
              <h3 style={cardTitle}>Tiempo promedio de recambio por especialidad</h3>
              <p style={cardSub}>Especialidades con al menos 10 transiciones evaluadas en el período.</p>
              <ResponsiveContainer width="100%" height={Math.max(220, porEspecialidad.length * 34)}>
                <BarChart data={porEspecialidad} layout="vertical" margin={{ top: 5, right: 45, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} unit=" m" />
                  <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 11 }} />
                  <RechartsTooltip formatter={(v, n, p) => [`${v} min (mediana ${p.payload.mediana}m) · ${p.payload.pctDentroMeta}% ≤ ${umbral}m · ${p.payload.n} recambios`, 'Promedio']} />
                  <ReferenceLine x={umbral} stroke="#ef4444" strokeDasharray="4 4" />
                  <Bar dataKey="promedio" radius={[0, 6, 6, 0]}>
                    {porEspecialidad.map((e, i) => <Cell key={i} fill={colorPorMin(e.promedio, umbral)} />)}
                    <LabelList dataKey="promedio" position="right" style={{ fontSize: 11, fontWeight: 700, fill: '#334155' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}

