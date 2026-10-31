import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Calendar, Search, Users, Activity, Clock, CheckCircle, XCircle, AlertCircle,
  Filter, BarChart2, ChevronDown, ChevronRight, TrendingUp, RotateCcw, Pin, Repeat,
  MapPin, ShieldCheck, Lightbulb, UserX, Stethoscope, ClipboardList
} from 'lucide-react';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LabelList, BarChart
} from 'recharts';

/* ============================================================
   CONSULTAS Y CONTROLES ODONTOLÓGICOS — Atención Abierta
   Tema visual: mismo del Panel de Producción Quirúrgica
   Fuente: Discoverer / BICS.DWP_F_RCE_ODO_ESPEC (ODBC dwh.dssasur.cl)
   ============================================================ */

const C = { blue: '#1e40af', navy: '#1e3a8a', orange: '#DF6D05', amber: '#F2A400', sky: '#38bdf8', green: '#10b981', red: '#ef4444', violet: '#7c3aed', slate: '#64748b' };
const PALETA = ['#1e40af', '#DF6D05', '#F2A400', '#38bdf8', '#10b981', '#7c3aed', '#ec4899', '#1e3a8a', '#a65103', '#60a5fa', '#14b8a6', '#94a3b8'];
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const fmt = (n) => Math.round(n || 0).toLocaleString('es-CL');
const pctS = (a, b, d = 1) => (b ? ((a / b) * 100).toFixed(d) : '0.0');
const dmy = (iso) => (iso ? iso.split('-').reverse().join('-') : '');
const hoyLocal = () => { const d = new Date(); const p = (x) => String(x).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; };

const cardBox = { background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' };
const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '9px 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', fontSize: '0.85rem' };

/* ---------- Clasificaciones derivadas ---------- */
const tipoG = (r) => {
  const t = (r.tipo || '').toLowerCase();
  const tc = (r.tc_tipo_consulta || '').toUpperCase();
  const prog = (r.tipo_atencion_programada || '').toUpperCase();
  if (tc.includes('URGENCIA') || prog.startsWith('URG')) return 'Urgencia';
  if (t.startsWith('a)')) return 'Consulta Nueva';
  if (t.startsWith('b)') || t.startsWith('c)') || t.startsWith('d)')) return 'Control';
  if (prog.includes('NUEVA')) return 'Consulta Nueva';
  if (prog.startsWith('CONTROL')) return 'Control';
  if (prog.startsWith('PROCED')) return 'Procedimiento';
  return 'Otro';
};
const estadoG = (r, hoy) => {
  const a = (r.estado_atencion || '').toUpperCase();
  const h = (r.estado_hora || '').toUpperCase();
  if (a === 'SE PRESENTO' || a === 'ATENCION INICIADA' || h === 'EJECUTADA') return 'Realizada';
  if (a === 'NO SE PRESENTO' || h === 'NO SE PRESENTO') return 'NSP';
  if (a === 'NO SE ATENDIO' || h === 'NO SE ATENDIO') return 'No atendida (institucional)';
  return r.fecha_atencion && r.fecha_atencion < hoy ? 'Pendiente de cierre' : 'Agendada (futura)';
};
const COMUNAS = [['PUCON', 'Pucón'], ['CURARREHUE', 'Curarrehue'], ['LONCOCHE', 'Loncoche'], ['GORBEA', 'Gorbea'], ['TOLTEN', 'Toltén'], ['FREIRE', 'Freire'], ['PITRUFQUEN', 'Pitrufquén'], ['CUNCO', 'Cunco'], ['VILCUN', 'Vilcún'], ['LAUTARO', 'Lautaro'], ['TEMUCO', 'Temuco'], ['PADRE', 'Padre Las Casas'], ['CARAHUE', 'Carahue'], ['PANGUIPULLI', 'Panguipulli'], ['LANCO', 'Lanco'], ['VILLARRICA', 'Villarrica'], ['LICAN', 'Villarrica'], ['VOLCANES', 'Villarrica']];
const comunaDe = (s) => {
  if (!s) return null;
  const u = s.toUpperCase();
  const f = COMUNAS.find(([k]) => u.includes(k));
  return f ? f[1] : 'Otras comunas / red';
};
const grupoEtario = (r) => {
  if (r.edad == null) return 'Sin dato';
  const e = r.edad / (r.n || 1);
  if (e < 15) return '0-14 años';
  if (e < 20) return '15-19 años';
  if (e < 45) return '20-44 años';
  if (e < 65) return '45-64 años';
  return '65+ años';
};
const condicionesEsp = (r) => {
  const o = [];
  if (r.sename === 'SI') o.push('SENAME');
  if (r.situacion_calle === 'SI') o.push('Situación de calle');
  if (r.discapacitada === 'SI') o.push('Discapacidad');
  if (r.embarazada === 'SI') o.push('Embarazada');
  if (r.prais === 'Si') o.push('PRAIS');
  if (r.pueblo_originario && r.pueblo_originario !== 'NINGUNO') o.push('Pueblo originario');
  return o.length ? o : ['Sin condición especial'];
};

/* ---------- Acumulador de estadísticas ---------- */
const newAcc = () => ({ tot: 0, real: 0, nsp: 0, noAt: 0, pend: 0, fut: 0, nuevaR: 0, ctrlR: 0, otraR: 0, nspNueva: 0, nspCtrl: 0, citNueva: 0, citCtrl: 0, ingreso: 0, alta: 0, enTrat: 0, contra: 0, pertSi: 0, pertNo: 0, acts: 0, ges: 0, sobre: 0, days: new Set() });
const addTo = (s, r) => {
  const w = r.n || 1;
  s.tot += w;
  switch (r._est) {
    case 'Realizada': {
      s.real += w;
      if (r._tipo === 'Consulta Nueva') s.nuevaR += w; else if (r._tipo === 'Control') s.ctrlR += w; else s.otraR += w;
      const a = r.accion_a_tomar || '';
      if (a === 'INGRESO A TRATAMIENTO') s.ingreso += w;
      else if (a === 'ALTA DE TRATAMIENTO') s.alta += w;
      else if (a === 'EN TRATAMIENTO') s.enTrat += w;
      if (r.contrareferir === 'Si') s.contra += w;
      s.acts += (r.actividades || []).length;
      if (r.fecha_atencion) s.days.add(r.fecha_atencion);
      if (r.dg_auge_1 === 'GES') s.ges += w;
      break;
    }
    case 'NSP': s.nsp += w; if (r._tipo === 'Consulta Nueva') s.nspNueva += w; else if (r._tipo === 'Control') s.nspCtrl += w; break;
    case 'No atendida (institucional)': s.noAt += w; break;
    case 'Pendiente de cierre': s.pend += w; break;
    default: s.fut += w;
  }
  if ((r._est === 'Realizada' || r._est === 'NSP' || r._est === 'No atendida (institucional)')) {
    if (r._tipo === 'Consulta Nueva') s.citNueva += w; else if (r._tipo === 'Control') s.citCtrl += w;
  }
  if (r.pertinencia_condicion === 'Si') s.pertSi += w; else if (r.pertinencia_condicion === 'No') s.pertNo += w;
  if (r._est === 'Realizada' && r.estado_hora === 'SOBRECUPO') s.sobre += w;
};
const citados = (s) => s.real + s.nsp + s.noAt;
const groupBy = (recs, keyFn) => {
  const m = new Map();
  recs.forEach((r) => {
    [].concat(keyFn(r)).forEach((k) => {
      const key = k == null || k === '' ? '(sin dato)' : k;
      if (!m.has(key)) m.set(key, newAcc());
      addTo(m.get(key), r);
    });
  });
  return Array.from(m, ([name, s]) => ({ name, ...s }));
};

/* ---------- Filtros del menú lateral ---------- */
const FILTROS = [
  { id: 'tipoG', label: 'Tipo de atención', get: (r) => r._tipo },
  { id: 'est', label: 'Estado de la cita', get: (r) => r._est },
  { id: 'esp', label: 'Especialidad', get: (r) => r.especialidad_poli },
  { id: 'sub', label: 'Sub-especialidad', get: (r) => r.sub_especialidad_poli },
  { id: 'poli', label: 'Policlínico', get: (r) => r.policlinico },
  { id: 'prof', label: 'Profesional', get: (r) => r.profesional },
  { id: 'accion', label: 'Acción a tomar', get: (r) => r.accion_a_tomar },
  { id: 'comuna', label: 'Comuna de origen (derivación)', get: (r) => r._comuna },
  { id: 'estab', label: 'Establecimiento de origen', get: (r) => r.ic_estab_origen },
  { id: 'pert', label: 'Pertinencia condición clínica', get: (r) => r.pertinencia_condicion },
  { id: 'ges', label: 'GES', get: (r) => r.dg_auge_1 },
  { id: 'contra', label: 'Contrarreferir', get: (r) => r.contrareferir },
  { id: 'prior', label: 'Prioridad', get: (r) => r.prioridad_destino },
  { id: 'prev', label: 'Previsión', get: (r) => r.prevision },
  { id: 'sexo', label: 'Sexo', get: (r) => r.sexo },
  { id: 'edad', label: 'Grupo etario', get: (r) => r._edadG },
  { id: 'cond', label: 'Condición especial', get: (r) => r._cond },
  { id: 'nac', label: 'Nacionalidad', get: (r) => r.nacionalidad },
  { id: 'prog', label: 'Tipo atención programada', get: (r) => r.tipo_atencion_programada }
];

/* ---------- Componentes UI ---------- */
function Kpi({ icon, label, value, sub, color = C.blue }) {
  return (
    <div style={{ ...cardBox, padding: '18px 20px', borderLeft: `5px solid ${color}`, flex: '1 1 190px', minWidth: 190 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color, fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>{icon} {label}</div>
      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 2px' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}
function Card({ title, sub, children, style }) {
  return (
    <div style={{ ...cardBox, ...style }}>
      <h3 style={{ margin: '0 0 2px', fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>{title}</h3>
      {sub && <p style={{ margin: '0 0 14px', fontSize: '0.78rem', color: '#64748b' }}>{sub}</p>}
      {!sub && <div style={{ height: 12 }} />}
      {children}
    </div>
  );
}
function RankTable({ columns, rows, max = 14 }) {
  return (
    <div style={{ overflow: 'auto', maxHeight: 420 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
          <tr style={{ background: C.blue, color: 'white' }}>
            {columns.map((c, i) => <th key={c.key} style={{ padding: '9px 12px', textAlign: i === 0 ? 'left' : 'right', whiteSpace: 'nowrap', borderRadius: i === 0 ? '6px 0 0 6px' : i === columns.length - 1 ? '0 6px 6px 0' : 0 }}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, max).map((r, i) => (
            <tr key={r.name} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 ? '#f8fafc' : 'white' }}>
              {columns.map((c, j) => {
                const v = c.render ? c.render(r) : r[c.key];
                const hot = c.hot && c.hot(r);
                return <td key={c.key} style={{ padding: '8px 12px', textAlign: j === 0 ? 'left' : 'right', fontWeight: j === 0 ? 700 : 800, color: hot ? C.orange : j === 0 ? '#0f172a' : C.blue, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={typeof v === 'string' ? v : undefined}>{v}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function HBar({ rows, color = C.blue, valueKey = 'value', height, unit = '' }) {
  return (
    <ResponsiveContainer width="100%" height={height || Math.max(240, rows.length * 30)}>
      <BarChart data={rows} layout="vertical" margin={{ left: 10, right: 40 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
        <RTooltip formatter={(v) => `${fmt(v)}${unit}`} />
        <Bar dataKey={valueKey} fill={color} radius={[0, 6, 6, 0]}>
          <LabelList dataKey={valueKey} position="right" formatter={(v) => `${fmt(v)}${unit}`} style={{ fontSize: 10, fontWeight: 700, fill: color }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
function FilterGroup({ def, options, selected, onChange }) {
  const [open, setOpen] = useState(['tipoG', 'est', 'esp'].includes(def.id));
  const [q, setQ] = useState('');
  const shown = options.filter((o) => o.value.toLowerCase().includes(q.toLowerCase()));
  const toggle = (v) => onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  return (
    <div style={{ borderBottom: '1px solid #f1f5f9', padding: '6px 0' }}>
      <button id={`odo-filter-${def.id}`} onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '5px 0', color: selected.length ? C.blue : '#334155', fontWeight: 700, fontSize: '0.82rem' }}>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span style={{ flex: 1, textAlign: 'left' }}>{def.label}</span>
        {selected.length > 0 && <span style={{ background: C.blue, color: 'white', borderRadius: 10, padding: '0 8px', fontSize: '0.7rem' }}>{selected.length}</span>}
      </button>
      {open && (
        <div style={{ marginTop: 4 }}>
          {options.length > 8 && <input style={{ ...inputStyle, marginBottom: 6 }} placeholder="Buscar…" value={q} onChange={(e) => setQ(e.target.value)} />}
          <div style={{ maxHeight: 180, overflowY: 'auto' }}>
            {shown.map((o) => (
              <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 2px', fontSize: '0.78rem', cursor: 'pointer', color: '#334155', fontWeight: selected.includes(o.value) ? 700 : 400 }}>
                <input type="checkbox" checked={selected.includes(o.value)} onChange={() => toggle(o.value)} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={o.value}>{o.value}</span>
                <span style={{ color: '#94a3b8' }}>{fmt(o.count)}</span>
              </label>
            ))}
            {!shown.length && <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Sin opciones</div>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   COMPONENTE PRINCIPAL
   ============================================================ */
export default function ConsultasOdontologicasDashboard({ onBack }) {
  const hoy = useMemo(hoyLocal, []);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('resumen');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [sel, setSel] = useState({});
  const [pinned, setPinned] = useState(true);
  const [hovered, setHovered] = useState(false);
  const isExpanded = pinned || hovered;

  const loadData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('data/consultas_odontologicas_cached.json.gz?' + Date.now());
      if (!res.ok) throw new Error('Datos no disponibles aún. Ejecute: node fetch-consultas-odontologicas.cjs');
      const buf = new Uint8Array(await res.arrayBuffer());
      // 0x1f 0x8b = gzip. Si el servidor ya lo descomprimió (Content-Encoding), llega como JSON plano.
      const esGzip = buf.length > 2 && buf[0] === 0x1f && buf[1] === 0x8b;
      let text;
      if (esGzip) {
        if (typeof DecompressionStream === 'undefined') throw new Error('El navegador no soporta descompresión gzip.');
        const stream = new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'));
        text = await new Response(stream).text();
      } else {
        text = new TextDecoder('utf-8').decode(buf);
      }
      setData(JSON.parse(text));
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, []);

  const records = useMemo(() => (data?.records || []).filter((r) => r.fecha_atencion).map((r) => ({
    ...r, _tipo: tipoG(r), _est: estadoG(r, hoy), _comuna: comunaDe(r.ic_estab_origen), _edadG: grupoEtario(r), _cond: condicionesEsp(r)
  })), [data, hoy]);

  const [minF, maxF] = useMemo(() => {
    let mn = '9999', mx = '0000';
    records.forEach((r) => { if (r.fecha_atencion < mn) mn = r.fecha_atencion; if (r.fecha_atencion > mx) mx = r.fecha_atencion; });
    return mn === '9999' ? ['', ''] : [mn, mx];
  }, [records]);

  useEffect(() => {
    if (maxF && !desde && !hasta) {
      const tope = maxF < hoy ? maxF : hoy;
      setDesde(tope.substring(0, 4) + '-01-01'); setHasta(tope);
    }
  }, [maxF, hoy, desde, hasta]);

  const baseFiltered = useMemo(() => records.filter((r) => (!desde || r.fecha_atencion >= desde) && (!hasta || r.fecha_atencion <= hasta)), [records, desde, hasta]);
  const filtered = useMemo(() => baseFiltered.filter((r) => FILTROS.every((d) => {
    const s = sel[d.id]; if (!s || !s.length) return true;
    return [].concat(d.get(r) || '(sin dato)').some((v) => s.includes(v));
  })), [baseFiltered, sel]);

  const optionsByFilter = useMemo(() => {
    const out = {};
    FILTROS.forEach((d) => {
      const m = new Map();
      baseFiltered.forEach((r) => [].concat(d.get(r) || '(sin dato)').forEach((v) => m.set(v, (m.get(v) || 0) + (r.n || 1))));
      out[d.id] = Array.from(m, ([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count);
    });
    return out;
  }, [baseFiltered]);

  const activeFilterCount = Object.values(sel).reduce((s, a) => s + (a?.length || 0), 0);
  const clearAll = () => { setSel({}); if (maxF) { const t = maxF < hoy ? maxF : hoy; setDesde(t.substring(0, 4) + '-01-01'); setHasta(t); } };

  /* ---------- Estadísticas ---------- */
  const T = useMemo(() => { const s = newAcc(); filtered.forEach((r) => addTo(s, r)); return s; }, [filtered]);
  const cit = citados(T);
  const nspRate = +pctS(T.nsp, cit);
  const ratioCN = T.nuevaR ? T.ctrlR / T.nuevaR : 0;

  const byMonth = useMemo(() => groupBy(filtered, (r) => r.fecha_atencion.substring(0, 7)).sort((a, b) => a.name.localeCompare(b.name)).map((g) => ({
    ...g, mes: `${MESES[parseInt(g.name.substring(5), 10) - 1]} ${g.name.substring(2, 4)}`,
    nspPct: +pctS(g.nsp, citados(g)), ratio: g.nuevaR ? +(g.ctrlR / g.nuevaR).toFixed(2) : 0
  })), [filtered]);
  const byEsp = useMemo(() => groupBy(filtered, (r) => r.especialidad_poli).sort((a, b) => b.real - a.real), [filtered]);
  const byProf = useMemo(() => groupBy(filtered, (r) => r.profesional).filter((g) => g.real + g.nsp > 0).sort((a, b) => b.real - a.real), [filtered]);
  const byPoli = useMemo(() => groupBy(filtered, (r) => r.policlinico).sort((a, b) => b.real - a.real), [filtered]);
  const byDow = useMemo(() => { const g = groupBy(filtered, (r) => DIAS[new Date(r.fecha_atencion + 'T00:00:00').getDay()]); return [1, 2, 3, 4, 5, 6, 0].map((d) => g.find((x) => x.name === DIAS[d])).filter(Boolean); }, [filtered]);
  const byPrev = useMemo(() => groupBy(filtered, (r) => r.prevision).sort((a, b) => citados(b) - citados(a)).slice(0, 6), [filtered]);
  const byEdad = useMemo(() => groupBy(filtered, (r) => r._edadG).sort((a, b) => a.name.localeCompare(b.name)), [filtered]);
  const byComuna = useMemo(() => groupBy(filtered.filter((r) => r._comuna), (r) => r._comuna).sort((a, b) => b.tot - a.tot), [filtered]);
  const byEstab = useMemo(() => groupBy(filtered.filter((r) => r.ic_estab_origen), (r) => r.ic_estab_origen).sort((a, b) => b.tot - a.tot), [filtered]);
  const byCond = useMemo(() => groupBy(filtered, (r) => r._cond).filter((g) => g.name !== 'Sin condición especial').sort((a, b) => b.real - a.real), [filtered]);
  const byAccion = useMemo(() => { const m = new Map(); filtered.filter((r) => r._est === 'Realizada').forEach((r) => { const k = r.accion_a_tomar || '(sin registro)'; m.set(k, (m.get(k) || 0) + (r.n || 1)); }); return Array.from(m, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value); }, [filtered]);
  const actividades = useMemo(() => { const m = new Map(); filtered.filter((r) => r._est === 'Realizada').forEach((r) => (r.actividades || []).forEach(([c, p]) => { const k = p || c; m.set(k, (m.get(k) || 0) + 1); })); return Array.from(m, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 14); }, [filtered]);
  const byPrior = useMemo(() => groupBy(filtered.filter((r) => r.prioridad_destino), (r) => `Prioridad ${r.prioridad_destino}`).sort((a, b) => a.name.localeCompare(b.name)), [filtered]);
  const estadoPie = useMemo(() => [
    { name: 'Realizadas', value: T.real, color: C.green }, { name: 'NSP', value: T.nsp, color: C.red },
    { name: 'No atendidas (institucional)', value: T.noAt, color: C.orange }, { name: 'Pendientes de cierre', value: T.pend, color: C.amber },
    { name: 'Agenda futura', value: T.fut, color: C.sky }].filter((x) => x.value > 0), [T]);

  /* ---------- Insights automáticos ---------- */
  const insights = useMemo(() => {
    const out = [];
    if (!T.tot) return out;
    out.push({ key: 'nsp', icon: <UserX size={16} />, color: nspRate > 12 ? '#fca5a5' : '#86efac', text: `Inasistencia (NSP): ${nspRate}% de las ${fmt(cit)} citas con resultado (${fmt(T.nsp)} horas perdidas). ${T.nspNueva ? `En consultas nuevas el NSP es ${pctS(T.nspNueva, T.citNueva)}% y en controles ${pctS(T.nspCtrl, T.citCtrl)}%.` : ''}` });
    const espNsp = byEsp.filter((g) => citados(g) >= 50).map((g) => ({ n: g.name, p: g.nsp / citados(g), v: g.nsp })).sort((a, b) => b.p - a.p)[0];
    if (espNsp) out.push({ key: 'espNsp', icon: <AlertCircle size={16} />, color: '#fcd34d', text: `Mayor NSP por especialidad: ${espNsp.n} con ${(espNsp.p * 100).toFixed(1)}% (${fmt(espNsp.v)} horas). Foco prioritario de recordatorio y sobreagendamiento.` });
    out.push({ key: 'ratio', icon: <Repeat size={16} />, color: '#93c5fd', text: `Se realizan ${ratioCN.toFixed(2)} controles por cada consulta nueva (${fmt(T.ctrlR)} controles / ${fmt(T.nuevaR)} nuevas): refleja la carga de tratamientos en curso frente al ingreso de nuevos casos.` });
    const espRatio = byEsp.filter((g) => g.nuevaR >= 20).map((g) => ({ n: g.name, r: g.ctrlR / g.nuevaR })).sort((a, b) => b.r - a.r)[0];
    if (espRatio) out.push({ key: 'espRatio', icon: <TrendingUp size={16} />, color: '#93c5fd', text: `${espRatio.n} concentra la mayor relación control/nueva (${espRatio.r.toFixed(1)}): tratamientos largos que limitan cupos de ingreso.` });
    if (T.ingreso) out.push({ key: 'flujo', icon: <ClipboardList size={16} />, color: '#86efac', text: `Flujo clínico: ${fmt(T.ingreso)} ingresos a tratamiento vs ${fmt(T.alta)} altas (altas/ingresos ${pctS(T.alta, T.ingreso, 0)}%). ${T.alta < T.ingreso ? 'Se ingresa más de lo que se egresa: la cartera en tratamiento sigue creciendo.' : 'Se egresa al menos lo que se ingresa: la cartera se estabiliza.'}` });
    const pe = T.pertSi + T.pertNo;
    if (pe) out.push({ key: 'pert', icon: <ShieldCheck size={16} />, color: T.pertNo ? '#fcd34d' : '#86efac', text: `Pertinencia de la derivación: ${pctS(T.pertSi, pe)}% pertinente (${fmt(T.pertNo)} no pertinentes sobre ${fmt(pe)} evaluadas). Retroalimentar a la red APS de origen.` });
    if (byComuna.length) { const top = byComuna[0]; const tot = byComuna.reduce((s, g) => s + g.tot, 0); out.push({ key: 'terr', icon: <MapPin size={16} />, color: '#93c5fd', text: `Territorio: ${top.name} origina ${pctS(top.tot, tot, 0)}% de las derivaciones con origen informado${byComuna[1] ? `, seguida de ${byComuna[1].name} (${pctS(byComuna[1].tot, tot, 0)}%)` : ''}.` }); }
    if (T.pend) out.push({ key: 'pend', icon: <Clock size={16} />, color: '#fcd34d', text: `Calidad de registro: ${fmt(T.pend)} citas con fecha pasada siguen "asignadas" sin cierre. Se excluyen del cálculo de NSP; conviene regularizarlas en el RCE.` });
    if (T.noAt) out.push({ key: 'noAt', icon: <XCircle size={16} />, color: '#fca5a5', text: `${fmt(T.noAt)} citas "no se atendió" (${pctS(T.noAt, cit)}%): pérdida de capacidad atribuible a la gestión institucional (ausencia del profesional, suspensiones).` });
    const META = { nsp: ['#dc2626', 'Inasistencia'], espNsp: ['#d97706', 'Foco NSP'], ratio: ['#7c3aed', 'Control / nueva'], espRatio: ['#2563eb', 'Cupos de ingreso'], flujo: ['#059669', 'Flujo clínico'], pert: ['#059669', 'Pertinencia'], terr: ['#2563eb', 'Territorio'], pend: ['#d97706', 'Calidad de registro'], noAt: ['#dc2626', 'Capacidad perdida'] };
    out.forEach((o) => { const m = META[o.key] || ['#2563eb', 'Insight']; o.accent = m[0]; o.title = m[1]; });
    return out;
  }, [T, byEsp, byComuna, nspRate, cit, ratioCN]);

  /* Tarjetas de insight contextuales: se ubican junto al gráfico que ayudan a leer */
  const InsRow = ({ keys }) => {
    const items = keys.map((k) => insights.find((i) => i.key === k)).filter(Boolean);
    if (!items.length) return null;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {items.map((i) => (
          <div key={i.key} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'white', borderRadius: 16, padding: '14px 16px', borderLeft: '5px solid ' + i.accent, boxShadow: '0 4px 14px rgba(15,23,42,0.07)', fontSize: '0.88rem', lineHeight: 1.5, color: '#334155' }}>
            <span style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 10, background: i.accent + '22', color: i.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i.icon}</span>
            <div><div style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', color: i.accent, marginBottom: 2 }}>{i.title}</div>{i.text}</div>
          </div>
        ))}
      </div>
    );
  };

  /* ---------- Fecha de actualización (siempre visible) ---------- */
  const updated = useMemo(() => {
    if (!data?.lastUpdated) return null;
    const d = new Date(data.lastUpdated); const p = (x) => String(x).padStart(2, '0');
    let h = d.getHours(); const ap = h >= 12 ? 'p. m.' : 'a. m.'; h = h % 12 || 12;
    return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()}, ${p(h)}:${p(d.getMinutes())} ${ap}`;
  }, [data]);

  const TABS = [
    { id: 'resumen', label: 'Resumen e Insights', icon: <Lightbulb size={18} /> },
    { id: 'nsp', label: 'NSP y Asistencia', icon: <UserX size={18} /> },
    { id: 'flujo', label: 'Control / Nueva y Flujo', icon: <Repeat size={18} /> },
    { id: 'territorio', label: 'Pertinencia y Territorio', icon: <MapPin size={18} /> },
    { id: 'produccion', label: 'Producción y Rendimiento', icon: <Stethoscope size={18} /> }
  ];

  const pill = (n, tot) => `${fmt(n)} (${pctS(n, tot)}%)`;
  const colsEsp = [
    { key: 'name', label: 'Especialidad' },
    { key: 'real', label: 'Realizadas', render: (r) => fmt(r.real) },
    { key: 'nuevaR', label: 'Nuevas', render: (r) => fmt(r.nuevaR) },
    { key: 'ctrlR', label: 'Controles', render: (r) => fmt(r.ctrlR) },
    { key: 'ratio', label: 'Control/Nueva', render: (r) => (r.nuevaR ? (r.ctrlR / r.nuevaR).toFixed(1) : '—') },
    { key: 'nsp', label: 'NSP', render: (r) => fmt(r.nsp) },
    { key: 'nspp', label: '% NSP', render: (r) => `${pctS(r.nsp, citados(r))}%`, hot: (r) => citados(r) >= 30 && r.nsp / citados(r) * 100 > nspRate }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F4F4F4', margin: '-100px -40px', padding: '100px 0 40px', color: '#1e293b' }}>
      {/* HEADER */}
      <header style={{ padding: '24px 32px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <button id="odo-back-btn" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', marginBottom: 16, fontWeight: 600 }}>
            <ArrowLeft size={16} /> Volver a Atención Abierta
          </button>
          <h1 style={{ fontSize: '2.2rem', color: '#1e293b', margin: 0, fontWeight: 800 }}>Consultas y Controles Odontológicos</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
            <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0 }}>Especialidades odontológicas · Hospital de Villarrica</p>
            <span id="odo-last-update" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 14px', borderRadius: 999, background: '#ecfdf5', color: '#065f46', border: '1.5px solid #a7f3d0', fontSize: '0.82rem', fontWeight: 700, boxShadow: '0 2px 6px rgba(16,185,129,0.1)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              Actualizado: {updated || 'sin registro'} (Extracción ODBC Discoverer)
            </span>

          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, background: '#2d334a', padding: 12, borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', flexWrap: 'wrap' }}>
          {TABS.map((tab) => (
            <button id={`odo-tab-${tab.id}`} key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', background: activeTab === tab.id ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent', border: 'none', borderRadius: 14, boxShadow: activeTab === tab.id ? '0 4px 15px rgba(99,102,241,0.4)' : 'none', color: activeTab === tab.id ? 'white' : '#94a3b8', fontWeight: activeTab === tab.id ? 700 : 600, cursor: 'pointer', transition: 'all 0.3s ease' }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </header>

      {loading && <div style={{ padding: 80, textAlign: 'center', color: '#64748b', fontWeight: 600 }}>Cargando datos odontológicos…</div>}
      {error && <div style={{ margin: 32, padding: 24, borderRadius: 14, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', display: 'flex', gap: 10, alignItems: 'center' }}><AlertCircle /> {error}</div>}

      {!loading && !error && (
        <div style={{ display: 'flex', flex: 1, alignItems: 'flex-start', gap: 20, padding: '24px 32px 0 20px' }}>
          {/* SIDEBAR DE FILTROS */}
          <motion.aside id="odo-sidebar" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} initial={false}
            animate={{ width: isExpanded ? 310 : 64 }} transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            style={{ position: 'sticky', top: 90, flexShrink: 0, height: 'calc(100vh - 120px)', background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)', borderRadius: 24, border: '1px solid rgba(226,232,240,0.9)', boxShadow: isExpanded ? '0 25px 50px -12px rgba(15,23,42,0.25), 0 0 0 1px rgba(30,64,175,0.2)' : '0 10px 30px -5px rgba(15,23,42,0.12)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 5 }}>
            <div style={{ padding: isExpanded ? '16px 18px' : '16px 0', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: isExpanded ? 'space-between' : 'center', background: isExpanded ? 'linear-gradient(135deg, #f8fafc, #f1f5f9)' : 'transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, #1e40af, #1e3a8a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(30,64,175,0.3)', position: 'relative' }}>
                  <Filter size={18} />
                  {!isExpanded && activeFilterCount > 0 && <span style={{ position: 'absolute', top: -6, right: -6, background: C.orange, color: 'white', borderRadius: 10, fontSize: '0.65rem', padding: '0 6px', fontWeight: 800 }}>{activeFilterCount}</span>}
                </div>
                {isExpanded && <div><h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Filtros</h3>
                  <span style={{ fontSize: '0.7rem', color: activeFilterCount ? C.blue : '#94a3b8', fontWeight: 700 }}>{activeFilterCount ? `${activeFilterCount} activo${activeFilterCount > 1 ? 's' : ''}` : 'Sin filtros'}</span></div>}
              </div>
              {isExpanded && <div style={{ display: 'flex', gap: 6 }}>
                {activeFilterCount > 0 && <button id="odo-clear-filters" onClick={clearAll} style={{ padding: '6px 10px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: 'none', color: C.red, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><RotateCcw size={12} /> Limpiar</button>}
                <button id="odo-pin" onClick={() => setPinned(!pinned)} title={pinned ? 'Desfijar menú' : 'Fijar menú abierto'} style={{ width: 32, height: 32, borderRadius: 10, background: pinned ? C.blue : '#f1f5f9', border: '1px solid #e2e8f0', color: pinned ? 'white' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Pin size={14} style={{ transform: pinned ? 'rotate(45deg)' : 'none' }} /></button>
              </div>}
            </div>
            {isExpanded && (
              <div style={{ overflowY: 'auto', padding: '14px 18px 24px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={14} color={C.blue} /> Fecha de atención</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <label style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Desde<input id="odo-desde" type="date" style={inputStyle} min={minF} max={maxF} value={desde} onChange={(e) => setDesde(e.target.value)} /></label>
                  <label style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Hasta<input id="odo-hasta" type="date" style={inputStyle} min={minF} max={maxF} value={hasta} onChange={(e) => setHasta(e.target.value)} /></label>
                </div>
                <div style={{ display: 'flex', gap: 10, margin: '6px 0 10px', flexWrap: 'wrap' }}>
                  {[['Año en curso', () => { const t = maxF < hoy ? maxF : hoy; setDesde(t.substring(0, 4) + '-01-01'); setHasta(t); }], ['Año anterior', () => { const y = parseInt((maxF < hoy ? maxF : hoy).substring(0, 4), 10) - 1; setDesde(`${y}-01-01`); setHasta(`${y}-12-31`); }], ['Todo', () => { setDesde(minF); setHasta(maxF); }]].map(([l, fn]) => (
                    <button key={l} onClick={fn} style={{ background: 'none', border: 'none', color: C.blue, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, padding: 0 }}>{l}</button>
                  ))}
                </div>
                {FILTROS.map((d) => <FilterGroup key={d.id} def={d} options={optionsByFilter[d.id] || []} selected={sel[d.id] || []} onChange={(v) => setSel((s) => ({ ...s, [d.id]: v }))} />)}
              </div>
            )}
          </motion.aside>

          {/* CONTENIDO */}
          <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
              Período analizado: <b style={{ color: '#0f172a' }}>{dmy(desde)} al {dmy(hasta)}</b> · {fmt(T.tot)} citas en la vista{activeFilterCount ? ` (${activeFilterCount} filtro${activeFilterCount > 1 ? 's' : ''} aplicado${activeFilterCount > 1 ? 's' : ''})` : ''}
            </div>

            {/* ---------- TAB: RESUMEN ---------- */}
            {activeTab === 'resumen' && (<>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Kpi icon={<CheckCircle size={15} />} label="Atenciones realizadas" value={fmt(T.real)} sub={`${pctS(T.real, cit)}% de las citas con resultado`} color={C.green} />
                <Kpi icon={<Users size={15} />} label="Consultas nuevas" value={fmt(T.nuevaR)} sub={`${pctS(T.nuevaR, T.real)}% de lo realizado`} color={C.blue} />
                <Kpi icon={<Repeat size={15} />} label="Controles" value={fmt(T.ctrlR)} sub={`${pctS(T.ctrlR, T.real)}% de lo realizado`} color={C.amber} />
                <Kpi icon={<TrendingUp size={15} />} label="Controles por consulta nueva" value={ratioCN.toFixed(2)} sub="Sobre atenciones realizadas" color={C.violet} />
                <Kpi icon={<UserX size={15} />} label="Tasa NSP" value={`${nspRate}%`} sub={`${fmt(T.nsp)} inasistencias`} color={C.red} />
              </div>
              <InsRow keys={['nsp']} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24 }}>
                <Card title="Producción mensual y tasa NSP" sub="Barras: atenciones realizadas por tipo · Línea: % NSP">
                  <ResponsiveContainer width="100%" height={320}>
                    <ComposedChart data={byMonth}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="l" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="r" orientation="right" unit="%" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <RTooltip /><Legend />
                      <Bar yAxisId="l" dataKey="nuevaR" name="Consultas nuevas" stackId="a" fill={C.blue} />
                      <Bar yAxisId="l" dataKey="ctrlR" name="Controles" stackId="a" fill={C.amber} />
                      <Bar yAxisId="l" dataKey="otraR" name="Otras" stackId="a" fill={C.sky} />
                      <Line yAxisId="r" type="monotone" dataKey="nspPct" name="% NSP" stroke={C.red} strokeWidth={3} dot={{ r: 3 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Card>
                <Card title="Estado de las citas" sub="Citas agendadas en el período seleccionado">
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart><Pie data={estadoPie} dataKey="value" nameKey="name" innerRadius={70} outerRadius={115} paddingAngle={2}>{estadoPie.map((p) => <Cell key={p.name} fill={p.color} />)}</Pie><RTooltip formatter={(v) => fmt(v)} /><Legend /></PieChart>
                  </ResponsiveContainer>
                </Card>
              </div>
              <InsRow keys={['pend', 'noAt']} />
              <InsRow keys={['espNsp']} />
              <Card title="Resumen por especialidad" sub="Realizadas, relación control/nueva y NSP (naranjo = NSP sobre el promedio)"><RankTable columns={colsEsp} rows={byEsp} max={14} /></Card>
            </>)}

            {/* ---------- TAB: NSP ---------- */}
            {activeTab === 'nsp' && (<>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Kpi icon={<UserX size={15} />} label="Tasa NSP" value={`${nspRate}%`} sub={`${fmt(T.nsp)} de ${fmt(cit)} citas`} color={C.red} />
                <Kpi icon={<Users size={15} />} label="NSP consulta nueva" value={`${pctS(T.nspNueva, T.citNueva)}%`} sub={`${fmt(T.nspNueva)} horas de ingreso perdidas`} color={C.orange} />
                <Kpi icon={<Repeat size={15} />} label="NSP controles" value={`${pctS(T.nspCtrl, T.citCtrl)}%`} sub={`${fmt(T.nspCtrl)} controles perdidos`} color={C.amber} />
                <Kpi icon={<XCircle size={15} />} label="No atendidas (institucional)" value={fmt(T.noAt)} sub={`${pctS(T.noAt, cit)}% de las citas`} color={C.violet} />
                <Kpi icon={<Clock size={15} />} label="Pendientes de cierre" value={fmt(T.pend)} sub="Fecha pasada, sin registro de resultado" color={C.slate} />
                <Kpi icon={<Calendar size={15} />} label="Sobrecupos realizados" value={fmt(T.sobre)} sub={`${pctS(T.sobre, T.real)}% de lo realizado`} color={C.sky} />
              </div>
              <InsRow keys={['pend']} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24 }}>
                <Card title="Evolución mensual del NSP" sub="Barras: horas NSP · Línea: % NSP sobre citas con resultado">
                  <ResponsiveContainer width="100%" height={320}>
                    <ComposedChart data={byMonth}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="l" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="r" orientation="right" unit="%" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <RTooltip /><Legend />
                      <Bar yAxisId="l" dataKey="nsp" name="NSP" fill={C.red} radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="l" dataKey="noAt" name="No atendidas (inst.)" fill={C.violet} radius={[4, 4, 0, 0]} />
                      <Line yAxisId="r" type="monotone" dataKey="nspPct" name="% NSP" stroke={C.orange} strokeWidth={3} dot={{ r: 3 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Card>
                <Card title="NSP por día de la semana" sub="¿Qué días se pierden más horas?">
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={byDow.map((g) => ({ ...g, pct: +pctS(g.nsp, citados(g)) }))}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis unit="%" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <RTooltip formatter={(v) => `${v}%`} /><Bar dataKey="pct" name="% NSP" fill={C.red} radius={[6, 6, 0, 0]}><LabelList dataKey="pct" position="top" formatter={(v) => `${v}%`} style={{ fontSize: 11, fontWeight: 700 }} /></Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>
              <InsRow keys={['espNsp', 'noAt']} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24 }}>
                <Card title="NSP por especialidad" sub="Ordenado por horas perdidas">
                  <RankTable rows={[...byEsp].sort((a, b) => b.nsp - a.nsp)} columns={[{ key: 'name', label: 'Especialidad' }, { key: 'cit', label: 'Citas', render: (r) => fmt(citados(r)) }, { key: 'nsp', label: 'NSP', render: (r) => fmt(r.nsp) }, { key: 'p', label: '% NSP', render: (r) => `${pctS(r.nsp, citados(r))}%`, hot: (r) => citados(r) >= 30 && r.nsp / citados(r) * 100 > nspRate }, { key: 'na', label: 'No atend.', render: (r) => fmt(r.noAt) }]} />
                </Card>
                <Card title="NSP por perfil de paciente" sub="Grupo etario y previsión">
                  <RankTable rows={[...byEdad, ...byPrev]} max={20} columns={[{ key: 'name', label: 'Segmento' }, { key: 'cit', label: 'Citas', render: (r) => fmt(citados(r)) }, { key: 'nsp', label: 'NSP', render: (r) => fmt(r.nsp) }, { key: 'p', label: '% NSP', render: (r) => `${pctS(r.nsp, citados(r))}%`, hot: (r) => citados(r) >= 30 && r.nsp / citados(r) * 100 > nspRate }]} />
                </Card>
              </div>
            </>)}

            {/* ---------- TAB: FLUJO ---------- */}
            {activeTab === 'flujo' && (<>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Kpi icon={<Repeat size={15} />} label="Controles por consulta nueva" value={ratioCN.toFixed(2)} sub={`${fmt(T.ctrlR)} controles / ${fmt(T.nuevaR)} nuevas`} color={C.violet} />
                <Kpi icon={<ClipboardList size={15} />} label="Ingresos a tratamiento" value={fmt(T.ingreso)} sub={`${pctS(T.ingreso, T.nuevaR, 0)}% de las consultas nuevas`} color={C.blue} />
                <Kpi icon={<CheckCircle size={15} />} label="Altas de tratamiento" value={fmt(T.alta)} sub={`Altas/ingresos: ${pctS(T.alta, T.ingreso, 0)}%`} color={C.green} />
                <Kpi icon={<Activity size={15} />} label="En tratamiento (controles)" value={fmt(T.enTrat)} sub="Atenciones de seguimiento" color={C.amber} />
                <Kpi icon={<ShieldCheck size={15} />} label="Contrarreferencias" value={fmt(T.contra)} sub={`${pctS(T.contra, T.real)}% de lo realizado`} color={C.sky} />
              </div>
              <InsRow keys={['ratio']} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24 }}>
                <Card title="Relación control / consulta nueva por mes" sub="Barras: nuevas y controles · Línea: controles por cada nueva">
                  <ResponsiveContainer width="100%" height={320}>
                    <ComposedChart data={byMonth}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="l" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <RTooltip /><Legend />
                      <Bar yAxisId="l" dataKey="nuevaR" name="Nuevas" fill={C.blue} /><Bar yAxisId="l" dataKey="ctrlR" name="Controles" fill={C.amber} />
                      <Line yAxisId="r" type="monotone" dataKey="ratio" name="Control/Nueva" stroke={C.violet} strokeWidth={3} dot={{ r: 3 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Card>
                <Card title="Acciones clínicas registradas" sub="Sobre atenciones realizadas"><HBar rows={byAccion} color={C.blue} height={320} /></Card>
              </div>
              <InsRow keys={['espRatio', 'flujo']} />
              <Card title="Flujo clínico por especialidad" sub="Ingresos, altas, relación control/nueva y contrarreferencia (naranjo = sobre el promedio institucional)">
                <RankTable rows={byEsp} max={14} columns={[
                  { key: 'name', label: 'Especialidad' },
                  { key: 'nuevaR', label: 'Nuevas', render: (r) => fmt(r.nuevaR) },
                  { key: 'ctrlR', label: 'Controles', render: (r) => fmt(r.ctrlR) },
                  { key: 'ratio', label: 'Control/Nueva', render: (r) => (r.nuevaR ? (r.ctrlR / r.nuevaR).toFixed(1) : '—'), hot: (r) => r.nuevaR >= 20 && r.ctrlR / r.nuevaR > ratioCN },
                  { key: 'ingreso', label: 'Ingresos', render: (r) => fmt(r.ingreso) },
                  { key: 'alta', label: 'Altas', render: (r) => fmt(r.alta) },
                  { key: 'ai', label: 'Altas/Ingresos', render: (r) => (r.ingreso ? `${pctS(r.alta, r.ingreso, 0)}%` : '—') },
                  { key: 'contra', label: 'Contrarref.', render: (r) => `${fmt(r.contra)} (${pctS(r.contra, r.real, 0)}%)` }
                ]} />
              </Card>
            </>)}

            {/* ---------- TAB: TERRITORIO ---------- */}
            {activeTab === 'territorio' && (<>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Kpi icon={<ShieldCheck size={15} />} label="Pertinencia de derivación" value={`${pctS(T.pertSi, T.pertSi + T.pertNo)}%`} sub={`${fmt(T.pertNo)} no pertinentes de ${fmt(T.pertSi + T.pertNo)} evaluadas`} color={C.green} />
                <Kpi icon={<MapPin size={15} />} label="Comuna principal de origen" value={byComuna[0]?.name || '—'} sub={byComuna[0] ? `${fmt(byComuna[0].tot)} derivaciones` : ''} color={C.blue} />
                <Kpi icon={<MapPin size={15} />} label="Con origen informado" value={`${pctS(byComuna.reduce((s, g) => s + g.tot, 0), filtered.reduce((s, r) => s + (r._tipo === 'Consulta Nueva' ? (r.n || 1) : 0), 0), 0)}%`} sub="Sobre consultas nuevas en la vista" color={C.sky} />
                <Kpi icon={<AlertCircle size={15} />} label="GES" value={fmt(T.ges)} sub={`${pctS(T.ges, T.real)}% de lo realizado`} color={C.orange} />
              </div>
              <InsRow keys={['pert']} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24 }}>
                <Card title="Origen de la demanda por comuna" sub="Establecimiento que deriva (interconsulta), agrupado por comuna"><HBar rows={byComuna.map((g) => ({ name: g.name, value: g.tot }))} color={C.blue} /></Card>
                <Card title="Origen por establecimiento de la red" sub="Top 12 establecimientos derivadores"><HBar rows={byEstab.slice(0, 12).map((g) => ({ name: g.name, value: g.tot }))} color={C.orange} /></Card>
              </div>
              <InsRow keys={['terr']} />
              <Card title="Desempeño territorial por establecimiento de origen" sub="Pertinencia, NSP y contrarreferencia de los pacientes según quién deriva">
                <RankTable rows={byEstab} max={16} columns={[
                  { key: 'name', label: 'Establecimiento de origen' },
                  { key: 'tot', label: 'Citas', render: (r) => fmt(r.tot) },
                  { key: 'real', label: 'Realizadas', render: (r) => fmt(r.real) },
                  { key: 'pn', label: 'Pert. No', render: (r) => `${fmt(r.pertNo)} (${pctS(r.pertNo, r.pertSi + r.pertNo, 0)}%)`, hot: (r) => r.pertNo > 0 && r.pertNo / (r.pertSi + r.pertNo) > T.pertNo / Math.max(1, T.pertSi + T.pertNo) },
                  { key: 'nsp', label: '% NSP', render: (r) => `${pctS(r.nsp, citados(r))}%`, hot: (r) => citados(r) >= 30 && r.nsp / citados(r) * 100 > nspRate },
                  { key: 'contra', label: 'Contrarref.', render: (r) => fmt(r.contra) }
                ]} />
              </Card>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24 }}>
                <Card title="Atenciones a poblaciones con condición especial" sub="Realizadas · un paciente puede tener más de una condición"><HBar rows={byCond.map((g) => ({ name: g.name, value: g.real }))} color={C.violet} /></Card>
                <Card title="Prioridad de derivación" sub="Prioridad destino registrada en la interconsulta"><HBar rows={byPrior.map((g) => ({ name: g.name, value: g.tot }))} color={C.amber} height={200} /></Card>
              </div>
            </>)}

            {/* ---------- TAB: PRODUCCIÓN ---------- */}
            {activeTab === 'produccion' && (<>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Kpi icon={<CheckCircle size={15} />} label="Atenciones realizadas" value={fmt(T.real)} sub={`${fmt(T.acts)} prestaciones registradas`} color={C.green} />
                <Kpi icon={<Calendar size={15} />} label="Días con producción" value={fmt(T.days.size)} sub={`${(T.real / Math.max(1, T.days.size)).toFixed(1)} atenciones por día`} color={C.blue} />
                <Kpi icon={<Users size={15} />} label="Profesionales activos" value={fmt(byProf.length)} sub={`${(T.real / Math.max(1, byProf.length)).toFixed(0)} atenciones por profesional`} color={C.violet} />
                <Kpi icon={<Stethoscope size={15} />} label="Prestaciones por atención" value={(T.acts / Math.max(1, T.real)).toFixed(2)} sub="Actividades registradas por atención" color={C.amber} />
              </div>
              <Card title="Rendimiento por profesional" sub="Ordenado por atenciones realizadas (naranjo = NSP sobre el promedio)">
                <RankTable rows={byProf} max={20} columns={[
                  { key: 'name', label: 'Profesional' },
                  { key: 'real', label: 'Realizadas', render: (r) => fmt(r.real) },
                  { key: 'nuevaR', label: 'Nuevas', render: (r) => fmt(r.nuevaR) },
                  { key: 'ctrlR', label: 'Controles', render: (r) => fmt(r.ctrlR) },
                  { key: 'days', label: 'Días', render: (r) => fmt(r.days.size) },
                  { key: 'pd', label: 'Atenc./día', render: (r) => (r.real / Math.max(1, r.days.size)).toFixed(1) },
                  { key: 'ap', label: 'Prest./atención', render: (r) => (r.acts / Math.max(1, r.real)).toFixed(1) },
                  { key: 'nsp', label: '% NSP', render: (r) => `${pctS(r.nsp, citados(r))}%`, hot: (r) => citados(r) >= 30 && r.nsp / citados(r) * 100 > nspRate }
                ]} />
              </Card>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24 }}>
                <Card title="Producción por policlínico" sub="Atenciones realizadas"><HBar rows={byPoli.slice(0, 12).map((g) => ({ name: g.name, value: g.real }))} color={C.blue} /></Card>
                <Card title="Prestaciones más registradas" sub="Actividades de las atenciones realizadas"><HBar rows={actividades} color={C.orange} /></Card>
              </div>
            </>)}
          </main>
        </div>
      )}
    </div>
  );
}
