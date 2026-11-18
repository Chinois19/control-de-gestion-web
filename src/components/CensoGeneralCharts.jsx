import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer, ComposedChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, LabelList, Cell
} from 'recharts';

const AXIS_TICK = { fill: '#64748b', fontSize: 12, fontWeight: 500 };
const GRID_COLOR = '#e2e8f0';

const SERIES = [
  { key: 'basicos', short: '403 · Méd.-Quir. Básicos', name: '403 - Área Médico-Quirúrgico Cuidados Básicos', color: '#0284c7' },
  { key: 'medios', short: '404 · Méd.-Quir. Medios', name: '404 - Área Médico-Quirúrgico Cuidados Medios', color: '#1e3a8a' },
  { key: 'mujer', short: '416 · Obstetricia', name: '416 - Área Obstetricia', color: '#e11d48' },
  { key: 'infantil_408', short: '408 · Ped. Médica (<=Jun)', name: '408 - Área Médica Pediátrica Cuidados Medios', color: '#f59e0b' },
  { key: 'infantil_410', short: '410 · Ped. Méd.-Quir. (>=Jul)', name: '410 - Área Médico-Quirúrgica Pediátrica Cuidados Medios', color: '#ea580c' },
  { key: 'neonatologia', short: '413 · Neonatología Bás.', name: '413 - Área Neonatología Cuidados Básicos', color: '#0d9488' },
  { key: 'uci', short: '405 · Intensivos (UCI)', name: '405 - Área Cuidados Intensivos Adultos', color: '#059669' },
  { key: 'uti', short: '406 · Intermedios (UTI)', name: '406 - Área Cuidados Intermedios Adultos', color: '#7c3aed' }
];

const SHORT_BY_NAME = Object.fromEntries(SERIES.map(x => [x.name, x.short]));

const cardStyle = {
  padding: '24px',
  background: '#ffffff',
  boxShadow: '0 10px 40px -10px rgba(0,0,0,0.06)',
  borderRadius: '24px',
  border: '1px solid rgba(0,0,0,0.05)',
  marginBottom: 0
};

const tooltipBox = {
  background: '#ffffff',
  border: '1px solid #cbd5e1',
  borderRadius: '12px',
  padding: '12px 14px',
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)',
  fontSize: '0.8rem',
  color: '#334155',
  minWidth: '190px'
};

const Row = ({ color, label, value, strong }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', padding: '2px 0', fontWeight: strong ? 700 : 500 }}>
    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {color && <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: 'inline-block' }} />}
      {label}
    </span>
    <span style={{ color: '#0f172a' }}>{value}</span>
  </div>
);

/* 1) Egresos por servicio clínico - barras apiladas por mes */
export function EgresosServicioMensualChart({ data = [], serviceCounts = {} }) {
  const maxTotal = Math.max(1, ...data.map(d => d.total || 0));
  const minLabel = maxTotal * 0.055;

  const segLabel = (v) => (v >= minLabel ? v : '');

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const row = payload[0].payload;
    return (
      <div style={tooltipBox}>
        <div style={{ fontWeight: 700, color: '#1a365d', marginBottom: 6, borderBottom: '1px solid #e2e8f0', paddingBottom: 4 }}>{label}</div>
        {[...SERIES].reverse().map(s => (
          <Row key={s.key} color={s.color} label={s.name} value={row[s.key] || 0} />
        ))}
        <div style={{ borderTop: '1px dashed #cbd5e1', marginTop: 6, paddingTop: 6 }}>
          <Row label="Total egresos" value={row.total} strong />
        </div>
      </div>
    );
  };

  return (
    <div className="glass-card chart-container" style={cardStyle}>
      <div style={{ marginBottom: 14 }}>
        <h3 className="c-title" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a365d', margin: 0 }}>
          Egresos por servicio clínico y mes
        </h3>
        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
          Hospital de Villarrica • Egresos netos del período, apilados por servicio
        </span>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {SERIES.map(s => (
          <div key={s.key} title={s.name} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: `3.5px solid ${s.color}`, borderRadius: 12, padding: '7px 12px', minWidth: 135 }}>
            <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{s.short}</div>
            <div style={{ fontSize: '1.12rem', fontWeight: 700, color: s.color }}>{(serviceCounts?.[s.key] || 0).toLocaleString('es-CL')}</div>
          </div>
        ))}
      </div>
      <div style={{ width: '100%', height: 380 }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 24, right: 12, left: 0, bottom: 4 }}>
            <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={AXIS_TICK} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
            <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={44} allowDecimals={false}
              label={{ value: 'Egresos (n)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11, dx: 6 }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.12)' }} />
            {SERIES.map(s => (
              <Bar key={s.key} dataKey={s.key} name={s.name} stackId="egresos" fill={s.color} maxBarSize={64} isAnimationActive={false}>
                <LabelList dataKey={s.key} position="center" formatter={segLabel}
                  style={{ fill: '#ffffff', fontSize: 11, fontWeight: 500 }} />
              </Bar>
            ))}
            <Line dataKey="total" stroke="none" dot={false} activeDot={false} legendType="none" isAnimationActive={false}>
              <LabelList dataKey="total" position="top" offset={8}
                style={{ fill: '#0f172a', fontSize: 13, fontWeight: 600 }} />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* 2) Distribución de egresos por servicio - ranking horizontal */
export function EgresosServicioRanking({ segments = [], total = 0 }) {
  const rows = useMemo(
    () => segments
      .filter(s => s.key !== 'none')
      .map(s => ({
        name: s.name,
        shortName: SHORT_BY_NAME[s.name] || SERIES.find(x => x.key === s.key)?.short || s.name,
        value: s.value,
        percent: parseFloat(s.percent),
        color: s.color
      }))
      .sort((a, b) => b.value - a.value),
    [segments]
  );

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const r = payload[0].payload;
    return (
      <div style={tooltipBox}>
        <div style={{ fontWeight: 700, color: '#1a365d', marginBottom: 4 }}>{r.name}</div>
        <Row label="Egresos" value={r.value.toLocaleString('es-CL')} />
        <Row label="% del total" value={`${r.percent.toFixed(1)}%`} />
      </div>
    );
  };

  const renderEndLabel = (props) => {
    const { x, y, width, height, index } = props;
    const r = rows[index];
    if (!r) return null;
    return (
      <text x={x + width + 8} y={y + height / 2} dy={4} fontSize={12} fill="#334155" fontWeight={500}>
        {r.value.toLocaleString('es-CL')}
        <tspan fill="#64748b" dx={6}>({r.percent.toFixed(1)}%)</tspan>
      </text>
    );
  };

  return (
    <div className="glass-card chart-container" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: 12 }}>
        <h3 className="c-title" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a365d', margin: 0 }}>
          Distribución de egresos por servicio
        </h3>
        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
          Total del período: <strong style={{ color: '#0f172a', fontWeight: 600 }}>{total.toLocaleString('es-CL')}</strong> egresos
        </span>
      </div>
      <div style={{ width: '100%', flex: 1, minHeight: 330 }}>
        <ResponsiveContainer>
          <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 110, left: 4, bottom: 4 }}>
            <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} width={350} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.12)' }} />
            <Bar dataKey="value" barSize={22} radius={[0, 6, 6, 0]} isAnimationActive={false}>
              {rows.map((r, i) => <Cell key={i} fill={r.color} />)}
              <LabelList content={renderEndLabel} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* 3) Tendencia ingresos vs egresos - agregación seleccionable */
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function mondayKey(dateKey) {
  const d = new Date(dateKey + 'T12:00:00');
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return { key: `${y}-${m}-${dd}`, label: `${dd}/${m}` };
}

export function TendenciaIngresosEgresos({ data = [], servicios = [], selected, onChange }) {
  const [modo, setModo] = useState('semanal');

  const chartData = useMemo(() => {
    if (modo === 'diario') {
      return data.map((d, i) => {
        const win = data.slice(Math.max(0, i - 6), i + 1);
        const avg = (k) => win.reduce((s, x) => s + x[k], 0) / win.length;
        return {
          label: d.label,
          ingresos: d.ingresos,
          egresos: d.egresos,
          ingresosMA: parseFloat(avg('ingresos').toFixed(2)),
          egresosMA: parseFloat(avg('egresos').toFixed(2))
        };
      });
    }
    const groups = new Map();
    data.forEach(d => {
      let key, label;
      if (modo === 'semanal') {
        ({ key, label } = mondayKey(d.dateKey));
        label = `Sem ${label}`;
      } else {
        key = d.dateKey.substring(0, 7);
        label = `${MESES[parseInt(d.dateKey.substring(5, 7), 10) - 1]} ${d.dateKey.substring(2, 4)}`;
      }
      if (!groups.has(key)) groups.set(key, { key, label, ingresos: 0, egresos: 0 });
      const g = groups.get(key);
      g.ingresos += d.ingresos;
      g.egresos += d.egresos;
    });
    return [...groups.values()].sort((a, b) => a.key.localeCompare(b.key));
  }, [data, modo]);

  const resumen = useMemo(() => {
    const ing = data.reduce((s, d) => s + d.ingresos, 0);
    const egr = data.reduce((s, d) => s + d.egresos, 0);
    const dias = Math.max(1, data.length);
    return { ing, egr, balance: ing - egr, ingDia: ing / dias, egrDia: egr / dias };
  }, [data]);

  const showDots = chartData.length <= 40;
  const isDiario = modo === 'diario';
  const unidad = modo === 'diario' ? 'día' : modo === 'semanal' ? 'semana' : 'mes';

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const row = payload[0].payload;
    const bal = row.ingresos - row.egresos;
    return (
      <div style={tooltipBox}>
        <div style={{ fontWeight: 700, color: '#1a365d', marginBottom: 6, borderBottom: '1px solid #e2e8f0', paddingBottom: 4 }}>{label}</div>
        <Row color="#059669" label={`Ingresos (${unidad})`} value={row.ingresos} />
        <Row color="#0284c7" label={`Egresos (${unidad})`} value={row.egresos} />
        {isDiario && (
          <>
            <Row color="#059669" label="Ingresos prom. 7 días" value={row.ingresosMA} />
            <Row color="#0284c7" label="Egresos prom. 7 días" value={row.egresosMA} />
          </>
        )}
        <div style={{ borderTop: '1px dashed #cbd5e1', marginTop: 6, paddingTop: 6 }}>
          <Row label="Balance neto" value={`${bal >= 0 ? '+' : ''}${bal}`} strong />
        </div>
      </div>
    );
  };

  const toggleBtn = (id, text) => (
    <button
      key={id}
      type="button"
      onClick={() => setModo(id)}
      style={{
        padding: '6px 14px', fontSize: '0.78rem', fontWeight: modo === id ? 700 : 500, cursor: 'pointer',
        borderRadius: 8, border: modo === id ? '1px solid #1a365d' : '1px solid #cbd5e1',
        background: modo === id ? '#1a365d' : '#ffffff', color: modo === id ? '#ffffff' : '#475569'
      }}
    >{text}</button>
  );

  const kpi = (label, value, color) => (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '8px 14px', minWidth: 130 }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '1.15rem', fontWeight: 600, color }}>{value}</div>
    </div>
  );

  return (
    <div className="glass-card chart-container" style={{ ...cardStyle, marginTop: 30, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
        <div>
          <h2 className="c-title" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a365d', margin: 0 }}>
            Tendencia de ingresos y egresos
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0', fontWeight: 500 }}>
            {isDiario
              ? 'Valores diarios (línea tenue) y promedio móvil de 7 días (línea gruesa)'
              : `Total de admisiones y altas netas por ${unidad}`}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {toggleBtn('diario', 'Diario')}
            {toggleBtn('semanal', 'Semanal')}
            {toggleBtn('mensual', 'Mensual')}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        {kpi('Ingresos período', resumen.ing.toLocaleString('es-CL'), '#059669')}
        {kpi('Egresos período', resumen.egr.toLocaleString('es-CL'), '#0284c7')}
        {kpi('Balance neto', `${resumen.balance >= 0 ? '+' : ''}${resumen.balance.toLocaleString('es-CL')}`, resumen.balance >= 0 ? '#059669' : '#b91c1c')}
        {kpi('Prom. ingresos/día', resumen.ingDia.toFixed(1), '#059669')}
        {kpi('Prom. egresos/día', resumen.egrDia.toFixed(1), '#0284c7')}
      </div>

      {data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#64748b', fontWeight: 600 }}>
          Sin registros de ingresos o egresos en este rango de fechas
        </div>
      ) : (
        <div style={{ width: '100%', height: 340 }}>
          <ResponsiveContainer>
            <ComposedChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={AXIS_TICK} axisLine={{ stroke: '#cbd5e1' }} tickLine={false}
                interval="preserveStartEnd" minTickGap={isDiario ? 40 : 18} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={44} allowDecimals={false}
                label={{ value: `Pacientes por ${unidad}`, angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11, dx: 6 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" align="right" iconType="plainline"
                wrapperStyle={{ fontSize: 12, color: '#475569', paddingBottom: 8 }} />
              {isDiario ? (
                <>
                  <Line type="monotone" dataKey="ingresos" name="Ingresos (diario)" stroke="#059669" strokeOpacity={0.3} strokeWidth={1.2} dot={false} isAnimationActive={false} legendType="none" />
                  <Line type="monotone" dataKey="egresos" name="Egresos (diario)" stroke="#0284c7" strokeOpacity={0.3} strokeWidth={1.2} dot={false} isAnimationActive={false} legendType="none" />
                  <Line type="monotone" dataKey="ingresosMA" name="Ingresos (prom. 7 días)" stroke="#059669" strokeWidth={3} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="egresosMA" name="Egresos (prom. 7 días)" stroke="#0284c7" strokeWidth={3} dot={false} isAnimationActive={false} />
                </>
              ) : (
                <>
                  <Line type="monotone" dataKey="ingresos" name="Ingresos (admisiones)" stroke="#059669" strokeWidth={2.5}
                    dot={showDots ? { r: 3.5, fill: '#059669', stroke: '#fff', strokeWidth: 1.5 } : false} activeDot={{ r: 5 }} isAnimationActive={false} />
                  <Line type="monotone" dataKey="egresos" name="Egresos (altas netas)" stroke="#0284c7" strokeWidth={2.5}
                    dot={showDots ? { r: 3.5, fill: '#0284c7', stroke: '#fff', strokeWidth: 1.5 } : false} activeDot={{ r: 5 }} isAnimationActive={false} />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/* 4) Evolución mensual de indicador clínico (Tab 2) — soporta múltiples servicios y comparación de 2 indicadores con doble eje Y */
export function EvolucionIndicadorChart({
  points = [],
  title,
  unit,
  color = '#0d9488',
  formatValue,
  series = [],
  secondaryTitle,
  secondaryUnit,
  secondaryColor = '#e11d48',
  secondaryFormatValue
}) {
  const fmt = formatValue || ((v) => `${v}`);
  const fmt2 = secondaryFormatValue || ((v) => `${v}`);
  const hasMultipleSeries = Array.isArray(series) && series.length > 0;
  const hasSecondaryAxis = hasMultipleSeries && series.some(s => s.yAxisId === 'right');

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const row = payload[0].payload;
    return (
      <div style={{ ...tooltipBox, minWidth: 230 }}>
        <div style={{ fontWeight: 700, color: '#1a365d', marginBottom: 6, borderBottom: '1px solid #e2e8f0', paddingBottom: 4 }}>
          {row.fullLabel || row.label}
        </div>
        {hasMultipleSeries ? (
          series.map(s => {
            const val = row[s.dataKey];
            if (val === undefined || val === null) return null;
            const formatter = s.formatValue || (s.yAxisId === 'right' ? fmt2 : fmt);
            return (
              <Row
                key={s.dataKey}
                color={s.color}
                label={s.name}
                value={formatter(val)}
                strong={!s.dashed}
              />
            );
          })
        ) : (
          <Row color={color} label={title} value={fmt(row.val)} strong />
        )}
        {!hasSecondaryAxis && row.estabCamas !== undefined && (
          <div style={{ borderTop: '1px dashed #cbd5e1', marginTop: 4, paddingTop: 4 }}>
            <Row color="#94a3b8" label="Total días-cama disp. (mes)" value={`${Number(row.estabCamas).toLocaleString('es-CL')} días-cama`} />
          </div>
        )}
      </div>
    );
  };

  const makeBadgeLabel = (lineColor, formatter) => (props) => {
    const { x, y, value } = props;
    if (value === undefined || value === null) return null;
    const txt = String(formatter(value)).replace(/\s*(camas|días-cama|días|pac\.)$/i, '').trim();
    return (
      <text
        x={x}
        y={y - 10}
        textAnchor="middle"
        fill={lineColor}
        stroke="#ffffff"
        strokeWidth={3.5}
        paintOrder="stroke"
        fontSize={10.5}
        fontWeight={750}
      >
        {txt}
      </text>
    );
  };

  return (
    <div style={{ width: '100%', marginTop: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 8, fontSize: '0.74rem', color: '#475569', fontWeight: 600 }}>
        {hasMultipleSeries ? (
          series.map(s => (
            <span key={s.dataKey} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 16,
                height: 0,
                borderTop: s.dashed ? `2.5px dashed ${s.color}` : `3px solid ${s.color}`,
                display: 'inline-block'
              }} />
              <span style={{ color: s.color, fontWeight: 700 }}>{s.name}</span>
            </span>
          ))
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 14, height: 3, background: color, borderRadius: 2, display: 'inline-block' }} />
            <span style={{ color, fontWeight: 700 }}>{title}</span>
          </span>
        )}
        {!hasSecondaryAxis && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, background: 'rgba(148,163,184,0.35)', border: '1px solid #94a3b8', borderRadius: 2, display: 'inline-block' }} />
            <span style={{ color: '#64748b' }}>Total días-cama disp. (mes)</span>
          </span>
        )}
      </div>
      <div style={{ width: '100%', height: 325 }}>
        <ResponsiveContainer>
          <ComposedChart data={points} margin={{ top: 24, right: 18, left: 6, bottom: 4 }}>
            <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={AXIS_TICK} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
            <YAxis
              yAxisId="left"
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              width={54}
              domain={['auto', 'auto']}
              padding={{ top: 26, bottom: 10 }}
              label={{ value: unit ? `${title} (${unit})` : title || '', angle: -90, position: 'insideLeft', fill: color, fontSize: 10.5, fontWeight: 700, dx: 4 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: hasSecondaryAxis ? secondaryColor : '#94a3b8', fontSize: 11, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              width={56}
              domain={hasSecondaryAxis ? ['auto', 'auto'] : [0, (dataMax) => Math.ceil((dataMax || 100) * 1.18)]}
              padding={hasSecondaryAxis ? { top: 26, bottom: 10 } : undefined}
              label={{
                value: hasSecondaryAxis
                  ? (secondaryUnit ? `${secondaryTitle} (${secondaryUnit})` : secondaryTitle || '')
                  : 'Días-Cama',
                angle: 90,
                position: 'insideRight',
                fill: hasSecondaryAxis ? secondaryColor : '#94a3b8',
                fontSize: 10.5,
                fontWeight: hasSecondaryAxis ? 700 : 500,
                dx: -2
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            {!hasSecondaryAxis && (
              <Bar
                yAxisId="right"
                dataKey="estabCamas"
                name="Total días-cama disp. (mes)"
                fill="#94a3b8"
                fillOpacity={0.18}
                stroke="#94a3b8"
                strokeOpacity={0.32}
                barSize={32}
                radius={[6, 6, 0, 0]}
                isAnimationActive={false}
              />
            )}
            {hasMultipleSeries ? (
              series.map((s) => {
                const showLabels = points.length <= 15 && series.length <= 3;
                const formatter = s.formatValue || (s.yAxisId === 'right' ? fmt2 : fmt);
                return (
                  <Line
                    key={s.dataKey}
                    yAxisId={s.yAxisId || 'left'}
                    type="monotone"
                    dataKey={s.dataKey}
                    name={s.name}
                    stroke={s.color}
                    strokeWidth={s.dashed ? 2.5 : 3}
                    strokeDasharray={s.dashed ? '6 4' : undefined}
                    dot={{ r: s.dashed ? 3.8 : 4.5, fill: s.color, stroke: '#ffffff', strokeWidth: 2 }}
                    activeDot={{ r: 6.5, fill: s.color, stroke: '#ffffff', strokeWidth: 2 }}
                    isAnimationActive={false}
                  >
                    {showLabels && <LabelList dataKey={s.dataKey} content={makeBadgeLabel(s.color, formatter)} />}
                  </Line>
                );
              })
            ) : (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="val"
                name={title}
                stroke={color}
                strokeWidth={3}
                dot={{ r: 4.5, fill: color, stroke: '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: 6.5, fill: color, stroke: '#ffffff', strokeWidth: 2 }}
                isAnimationActive={false}
              >
                {points.length <= 15 && <LabelList dataKey="val" content={makeBadgeLabel(color, fmt)} />}
              </Line>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
