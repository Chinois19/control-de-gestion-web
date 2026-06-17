import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Target, Users, Clock, FileText, CheckCircle2, AlertTriangle, 
  Activity, BarChart2, PieChart as PieChartIcon, ShieldCheck, TrendingUp
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, LineChart, Line, ReferenceLine, AreaChart, Area, 
  Cell, PieChart, Pie
} from 'recharts';

// Datos Oficiales Ley 18.834 - Hospital Villarrica 2026
const initialLey18834Data = [
  {
    id: 'meta1',
    name: '1. Cumplimiento GES',
    shortName: 'GES',
    desc: 'Porcentaje de cumplimiento de Garantías Explícitas de Salud (GES) en la Red.',
    meta: 100,
    metaLabel: '≥ 99.5%',
    value: 90.1,
    status: 'danger',
    ponderador: 10,
    puntaje: 0,
    icon: <Activity size={20} />,
    color: '#ef4444', // Red
    chartType: 'bar',
    history: [
      { mes: 'Ene', valor: 95 }, { mes: 'Feb', valor: 94 }, { mes: 'Mar', valor: 92 },
      { mes: 'Abr', valor: 91 }, { mes: 'May', valor: 90.1 }
    ],
    insights: 'El indicador se encuentra en riesgo crítico con un 90.1% de cumplimiento (3.387 garantías cumplidas de 3.758). Se requiere priorizar atenciones retrasadas para evitar penalizaciones en el puntaje.'
  },
  {
    id: 'meta2',
    name: '2. Mantenimiento Preventivo',
    shortName: 'Mantención',
    desc: 'Ejecución del Plan Anual de mantenimiento preventivo de equipos médicos, ambulancias, industriales e infraestructura.',
    meta: 90,
    metaLabel: '≥ 90.0%',
    value: 100.0,
    status: 'success',
    ponderador: 10,
    puntaje: 10,
    icon: <ShieldCheck size={20} />,
    color: '#10b981', // Green
    chartType: 'line',
    history: [
      { mes: 'Ene', valor: 100 }, { mes: 'Feb', valor: 100 }, { mes: 'Mar', valor: 100 },
      { mes: 'Abr', valor: 100 }, { mes: 'May', valor: 100 }
    ],
    insights: 'Excelente desempeño. El cumplimiento global de las trazadoras de mantenimiento (equipos, ambulancias e infraestructura) y gasto ejecutado es del 100%.'
  },
  {
    id: 'meta3',
    name: '3. Capacitación Transversal',
    shortName: 'Cap. Transv.',
    desc: 'Funcionarios/as capacitados/as en temáticas transversales relevantes.',
    meta: 5,
    metaLabel: '≥ 5.0%',
    value: 0.0,
    status: 'danger',
    ponderador: 20,
    puntaje: 0,
    icon: <Users size={20} />,
    color: '#f59e0b', // Amber
    chartType: 'area',
    history: [
      { mes: 'Ene', valor: 0 }, { mes: 'Feb', valor: 0 }, { mes: 'Mar', valor: 0 },
      { mes: 'Abr', valor: 0 }, { mes: 'May', valor: 0 }
    ],
    insights: 'Nivel crítico. Actualmente 0 de los 896 funcionarios objetivo han completado capacitaciones transversales. Es urgente iniciar la ejecución del plan de capacitación.'
  },
  {
    id: 'meta4',
    name: '4. Capacitación RCP',
    shortName: 'Cap. RCP',
    desc: 'Funcionarios/as con capacitación actualizada en reanimación cardiopulmonar.',
    meta: 60,
    metaLabel: '≥ 60.0%',
    value: 62.9,
    status: 'success',
    ponderador: 30,
    puntaje: 30,
    icon: <Activity size={20} />,
    color: '#0ea5e9', // Blue
    chartType: 'pie',
    history: [
      { name: 'Capacitados', value: 62.9 },
      { name: 'Pendientes', value: 37.1 }
    ],
    insights: 'El indicador cumple con la meta, alcanzando un 62.9% (564 de 896 funcionarios). Se recomienda mantener la programación para sostener el indicador sobre el 60%.'
  },
  {
    id: 'meta5',
    name: '5. Prevención IAAS',
    shortName: 'Cap. IAAS',
    desc: 'Cobertura de personal de salud con atención clínica directa capacitados en prevención y control de IAAS.',
    meta: 70,
    metaLabel: '≥ 70.0%',
    value: 78.0,
    status: 'success',
    ponderador: 30,
    puntaje: 30,
    icon: <Target size={20} />,
    color: '#8b5cf6', // Purple
    chartType: 'bar',
    history: [
      { mes: 'Ene', valor: 70 }, { mes: 'Feb', valor: 72 }, { mes: 'Mar', valor: 75 },
      { mes: 'Abr', valor: 76 }, { mes: 'May', valor: 78.0 }
    ],
    insights: 'Destacado nivel de cobertura. 551 funcionarios de un universo de 706 cuentan con el curso IAAS aprobado con antigüedad menor a 5 años.'
  }
];

export default function HealthGoalsLey18834({ onBack }) {
  const [activeTab, setActiveTab] = useState(initialLey18834Data[0].id);
  const [ley18834Data, setLey18834Data] = useState(initialLey18834Data);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/ley18834_villarrica_raw.json')
      .then(res => res.json())
      .then(data => {
        if (!data || data.length === 0) {
          setLoading(false);
          return;
        }

        const getRow = (indicadorText) => data.find(row => row[2] && row[2].includes(indicadorText));

        const gesRow = getRow("Garantías Explicitas de Salud");
        const mantRow = getRow("Total Trazadoras");
        const transRow = getRow("temáticas transversales relevantes");
        const rcpRow = getRow("reanimación cardiopulmonar");
        const iaasRow = getRow("prevención y control de infecciones");
        
        const parseValue = (val) => val ? parseFloat(val) * 100 : 0;
        const parsePuntaje = (val) => val ? parseFloat(val) * 100 : 0;

        setLey18834Data(prev => prev.map(meta => {
          let newValue = meta.value;
          let newPuntaje = meta.puntaje;

          if (meta.id === 'meta1' && gesRow) {
            newValue = parseValue(gesRow[11]);
            newPuntaje = parsePuntaje(gesRow[12]);
          }
          if (meta.id === 'meta2' && mantRow) {
            newValue = parseValue(mantRow[11]);
            newPuntaje = parsePuntaje(mantRow[12]);
          }
          if (meta.id === 'meta3' && transRow) {
            newValue = parseValue(transRow[11]);
            newPuntaje = parsePuntaje(transRow[12]);
          }
          if (meta.id === 'meta4' && rcpRow) {
            newValue = parseValue(rcpRow[11]);
            newPuntaje = parsePuntaje(rcpRow[12]);
          }
          if (meta.id === 'meta5' && iaasRow) {
            newValue = parseValue(iaasRow[11]);
            newPuntaje = parsePuntaje(iaasRow[12]);
          }
          
          const newStatus = newValue >= meta.meta ? 'success' : newValue >= (meta.meta * 0.8) ? 'warning' : 'danger';
          
          return { ...meta, value: Number(newValue.toFixed(1)), puntaje: newPuntaje, status: newStatus };
        }));
        setLoading(false);
      })
      .catch(e => {
        console.error("Error loading Ley 18834 data:", e);
        setLoading(false);
      });
  }, []);

  const activeMeta = useMemo(() => ley18834Data.find(m => m.id === activeTab), [activeTab, ley18834Data]);
  const cumplimientoGlobal = useMemo(() => ley18834Data.reduce((acc, curr) => acc + curr.puntaje, 0), [ley18834Data]);

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>CUMPLE</span>;
      case 'warning':
        return <span style={{ background: '#fef9c3', color: '#854d0e', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>RIESGO</span>;
      case 'danger':
        return <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>NO CUMPLE</span>;
      default:
        return null;
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 800, color: '#1e293b' }}>{label}</p>
          <p style={{ margin: 0, color: activeMeta.color, fontWeight: 700 }}>
            {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: '0 40px 60px 40px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <button 
            onClick={onBack}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: '#64748b', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', padding: '0 0 16px 0' }}
          >
            <ArrowLeft size={18} />
            Volver al Inicio
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
            Metas Sanitarias <span style={{ color: '#0ea5e9' }}>Ley 18.834</span>
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '1rem', maxWidth: '600px', lineHeight: '1.5' }}>
            Monitoreo oficial de las metas de gestión y atención para el personal regulado bajo el Estatuto Administrativo.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ background: 'white', padding: '12px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Período Vigente</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>2026</span>
          </div>
          <div style={{ background: cumplimientoGlobal >= 90 ? '#dcfce7' : cumplimientoGlobal >= 70 ? '#fef9c3' : '#fee2e2', padding: '12px 20px', borderRadius: '16px', border: `1px solid ${cumplimientoGlobal >= 90 ? '#86efac' : cumplimientoGlobal >= 70 ? '#fde047' : '#fca5a5'}`, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: cumplimientoGlobal >= 90 ? '#166534' : cumplimientoGlobal >= 70 ? '#854d0e' : '#991b1b', textTransform: 'uppercase', letterSpacing: '1px' }}>Cumplimiento Global</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: cumplimientoGlobal >= 90 ? '#14532d' : cumplimientoGlobal >= 70 ? '#713f12' : '#7f1d1d' }}>{cumplimientoGlobal}%</span>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '32px' }}>
        
        {/* SIDEBAR: Lista de Metas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {ley18834Data.map(meta => {
            const isActive = activeTab === meta.id;
            return (
              <motion.button
                key={meta.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(meta.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  background: isActive ? 'linear-gradient(135deg, #f0f9ff, #e0f2fe)' : 'white',
                  border: isActive ? `2px solid ${meta.color}` : '1px solid #e2e8f0',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: isActive ? '0 10px 25px rgba(14, 165, 233, 0.1)' : '0 4px 6px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {isActive && (
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: meta.color }} />
                )}
                <div style={{ 
                  background: isActive ? 'white' : '#f1f5f9', 
                  color: isActive ? meta.color : '#64748b', 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '10px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginRight: '16px',
                  boxShadow: isActive ? '0 4px 10px rgba(0,0,0,0.05)' : 'none'
                }}>
                  {meta.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                    {meta.shortName}
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{meta.value}% <span style={{fontSize:'0.7rem', color:'#94a3b8', marginLeft: '4px'}}>(Pond. {meta.ponderador}%)</span></span>
                    {renderStatusBadge(meta.status)}
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            {/* Tarjeta de Resumen */}
            <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.03, transform: 'scale(3)' }}>
                {activeMeta.icon}
              </div>
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ padding: '8px', background: `${activeMeta.color}15`, color: activeMeta.color, borderRadius: '10px' }}>
                    {activeMeta.icon}
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                    {activeMeta.name}
                  </h2>
                </div>
                
                <p style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.6', margin: '0 0 32px 0', maxWidth: '800px' }}>
                  {activeMeta.desc}
                </p>

                <div style={{ display: 'flex', gap: '40px' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Valor Actual</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '3rem', fontWeight: 900, color: activeMeta.color, letterSpacing: '-1px' }}>{activeMeta.value}%</span>
                    </div>
                  </div>
                  <div style={{ width: '2px', background: '#f1f5f9' }} />
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Meta Exigida</span>
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: '#64748b' }}>{activeMeta.metaLabel}</span>
                  </div>
                  <div style={{ width: '2px', background: '#f1f5f9' }} />
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Estado</span>
                    <div style={{ marginTop: '12px' }}>
                      {renderStatusBadge(activeMeta.status)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fila de Gráficos e Insights */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              
              {/* Gráfico */}
              <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart2 size={18} color={activeMeta.color} />
                  Evolución del Indicador
                </h3>
                <div style={{ height: '280px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {activeMeta.chartType === 'bar' ? (
                      <BarChart data={activeMeta.history} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                        <XAxis dataKey="mes" tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <ReferenceLine y={activeMeta.meta} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Meta', position: 'insideTopLeft', fill: '#ef4444', fontSize: 11, fontWeight: 'bold' }} />
                        <Bar dataKey="valor" fill={activeMeta.color} radius={[6, 6, 0, 0]} />
                      </BarChart>
                    ) : activeMeta.chartType === 'line' ? (
                      <LineChart data={activeMeta.history} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                        <XAxis dataKey="mes" tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <ReferenceLine y={activeMeta.meta} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Meta Máx', position: 'insideTopLeft', fill: '#ef4444', fontSize: 11, fontWeight: 'bold' }} />
                        <Line type="monotone" dataKey="valor" stroke={activeMeta.color} strokeWidth={4} dot={{ r: 6, fill: activeMeta.color, strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 8 }} />
                      </LineChart>
                    ) : activeMeta.chartType === 'area' ? (
                      <AreaChart data={activeMeta.history} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                        <XAxis dataKey="mes" tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} domain={[70, 100]} axisLine={false} tickLine={false} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <ReferenceLine y={activeMeta.meta} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Meta', position: 'insideTopLeft', fill: '#ef4444', fontSize: 11, fontWeight: 'bold' }} />
                        <Area type="monotone" dataKey="valor" stroke={activeMeta.color} strokeWidth={3} fill={`${activeMeta.color}20`} />
                      </AreaChart>
                    ) : (
                      <PieChart>
                        <Pie
                          data={activeMeta.history}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell key="cell-0" fill={activeMeta.color} />
                          <Cell key="cell-1" fill="#e2e8f0" />
                        </Pie>
                        <RechartsTooltip />
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '1.5rem', fontWeight: 900, fill: '#0f172a' }}>
                          {activeMeta.history[0].value}%
                        </text>
                      </PieChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Insights */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={18} color="#f59e0b" />
                    Análisis & Proyección
                  </h3>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                    <p style={{ margin: 0, color: '#334155', fontSize: '0.9rem', lineHeight: '1.6' }}>
                      {activeMeta.insights}
                    </p>
                  </div>
                </div>
              </div>
              
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}
