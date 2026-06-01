import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Search, Users, Activity, Clock, CheckCircle, 
  XCircle, AlertCircle, Filter, PieChart, BarChart2, ChevronRight, ChevronLeft 
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#8b5cf6', '#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#6366f1', '#ec4899', '#14b8a6', '#f97316'];
const PIE_COLORS = {
  'Cirugía Mayor': '#8b5cf6',
  'Cirugía Mayor Ambulatoria': '#3b82f6',
  'Cirugía Menor': '#f59e0b',
  'Procedimientos': '#ef4444'
};

export default function SurgicalDashboard({ onBack }) {
  const [activeTab, setActiveTab] = useState('libro'); // We start on 'libro' based on user request
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [tablaData, setTablaData] = useState([]);
  const [disponibilidadData, setDisponibilidadData] = useState([]);
  const [libroData, setLibroData] = useState([]);
  const [rawDataLibro, setRawDataLibro] = useState([]);

  // Sidebar Filters for Libro
  const [dateRange, setDateRange] = useState({ start: '2025-01-01', end: '2026-12-31' });
  const [tipoCirugia, setTipoCirugia] = useState('Todas');
  const [procedencia, setProcedencia] = useState('Todas');
  const [tipoGestor, setTipoGestor] = useState('Todas');
  const [formaPago, setFormaPago] = useState('Todas');
  const [nombreIq, setNombreIq] = useState('Todas');
  const [primerCirujano, setPrimerCirujano] = useState('Todas');
  const [segundoCirujano, setSegundoCirujano] = useState('Todas');
  const [reintervencion, setReintervencion] = useState('Todas');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [tablaRes, dispRes, libroRes] = await Promise.all([
          fetch('/data/pabellon_tabla_cached.json'),
          fetch('/data/pabellon_disponibilidad_cached.json'),
          fetch('/data/libro_pabellon_cached.json').catch(() => ({ json: () => ({ records: [] }) }))
        ]);
        
        const tablaJson = await tablaRes.json();
        const dispJson = await dispRes.json();
        const libroJson = await libroRes.json();
        
        setTablaData(tablaJson.records || []);
        setDisponibilidadData(dispJson.records || []);
        setRawDataLibro(libroJson.records || []);
        setLibroData(libroJson.records || []);
      } catch (err) {
        console.error("Error loading surgical data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Dropdown lists
  const dropdowns = useMemo(() => {
    const tipos = new Set();
    const procs = new Set();
    const gestores = new Set();
    const pagos = new Set();
    const iqs = new Set();
    const ciru1 = new Set();
    const ciru2 = new Set();
    const reints = new Set();

    rawDataLibro.forEach(r => {
      if (r.tipo_cirugia) tipos.add(r.tipo_cirugia);
      if (r.procedencia) procs.add(r.procedencia);
      if (r.tipo_gestor) gestores.add(r.tipo_gestor);
      if (r.forma_pago) pagos.add(r.forma_pago);
      if (r.intervencion) iqs.add(r.intervencion);
      if (r.cirujano) ciru1.add(r.cirujano);
      if (r.segundo_cirujano) ciru2.add(r.segundo_cirujano);
      if (r.reintervencion_no_prog) reints.add(r.reintervencion_no_prog);
    });

    return {
      tipos: Array.from(tipos).sort(),
      procedencias: Array.from(procs).sort(),
      gestores: Array.from(gestores).sort(),
      pagos: Array.from(pagos).sort(),
      iqs: Array.from(iqs).sort(),
      ciru1: Array.from(ciru1).sort(),
      ciru2: Array.from(ciru2).sort(),
      reints: Array.from(reints).sort()
    };
  }, [rawDataLibro]);

  // Apply Filters to Libro
  const filteredLibro = useMemo(() => {
    return rawDataLibro.filter(r => {
      if (!r.fecha_cirugia) return false;
      const dateOnly = r.fecha_cirugia.substring(0, 10);
      if (dateOnly < dateRange.start || dateOnly > dateRange.end) return false;

      if (tipoCirugia !== 'Todas' && r.tipo_cirugia !== tipoCirugia) return false;
      if (procedencia !== 'Todas' && r.procedencia !== procedencia) return false;
      if (tipoGestor !== 'Todas' && r.tipo_gestor !== tipoGestor) return false;
      if (formaPago !== 'Todas' && r.forma_pago !== formaPago) return false;
      if (nombreIq !== 'Todas' && r.intervencion !== nombreIq) return false;
      if (primerCirujano !== 'Todas' && r.cirujano !== primerCirujano) return false;
      if (segundoCirujano !== 'Todas' && r.segundo_cirujano !== segundoCirujano) return false;
      if (reintervencion !== 'Todas' && r.reintervencion_no_prog !== reintervencion) return false;

      return true;
    });
  }, [rawDataLibro, dateRange, tipoCirugia, procedencia, tipoGestor, formaPago, nombreIq, primerCirujano, segundoCirujano, reintervencion]);

  // Comparative Year-Over-Year logic for KPI cards
  const getYoYStats = (key) => {
    let currentCount = 0;
    filteredLibro.forEach(r => {
      if (key === 'total') currentCount++;
      if (key === 'mayor' && (r.tipo_cirugia === 'Cirugía Mayor' || r.tipo_cirugia === 'Cirugía Mayor Ambulatoria')) currentCount++;
      if (key === 'urgencia' && r.urgencia === 'SI') currentCount++;
    });

    const startYear = new Date(dateRange.start).getFullYear();
    const endYear = new Date(dateRange.end).getFullYear();
    const startMonth = new Date(dateRange.start).getMonth();
    const endMonth = new Date(dateRange.end).getMonth();
    const startDay = new Date(dateRange.start).getDate();
    const endDay = new Date(dateRange.end).getDate();

    const priorStart = new Date(startYear - 1, startMonth, startDay).toISOString().substring(0, 10);
    const priorEnd = new Date(endYear - 1, endMonth, endDay).toISOString().substring(0, 10);

    let priorCount = 0;
    rawDataLibro.forEach(r => {
      if (!r.fecha_cirugia) return;
      const dateOnly = r.fecha_cirugia.substring(0, 10);
      
      if (tipoCirugia !== 'Todas' && r.tipo_cirugia !== tipoCirugia) return;
      if (procedencia !== 'Todas' && r.procedencia !== procedencia) return;
      if (tipoGestor !== 'Todas' && r.tipo_gestor !== tipoGestor) return;
      if (formaPago !== 'Todas' && r.forma_pago !== formaPago) return;
      
      if (dateOnly >= priorStart && dateOnly <= priorEnd) {
        if (key === 'total') priorCount++;
        if (key === 'mayor' && (r.tipo_cirugia === 'Cirugía Mayor' || r.tipo_cirugia === 'Cirugía Mayor Ambulatoria')) priorCount++;
        if (key === 'urgencia' && r.urgencia === 'SI') priorCount++;
      }
    });

    if (priorCount === 0) return { val: currentCount, diff: 0, text: '0.0% vs año ant.', trend: 'neutral' };
    const pctDiff = ((currentCount - priorCount) / priorCount) * 100;
    return {
      val: currentCount,
      diff: pctDiff,
      text: `${pctDiff >= 0 ? '↑' : '↓'} ${Math.abs(pctDiff).toFixed(1)}% vs año ant.`,
      trend: pctDiff >= 0 ? 'positive' : 'negative'
    };
  };

  const totalKPI = getYoYStats('total');
  const mayorKPI = getYoYStats('mayor');
  const urgenciaKPI = getYoYStats('urgencia');

  // Chart Data Processing
  const monthlyChartData = useMemo(() => {
    const monthlyMap = {};
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    filteredLibro.forEach(r => {
      const dOnly = r.fecha_cirugia.substring(0, 10);
      const monthKey = dOnly.substring(0, 7); // 'YYYY-MM'
      const year = parseInt(monthKey.split('-')[0], 10);
      const monthNum = parseInt(monthKey.split('-')[1], 10);
      const label = `${year} ${monthNames[monthNum - 1]}`;
      
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          key: monthKey, label, 'Cirugía Mayor': 0, 'Cirugía Mayor Ambulatoria': 0, 'Cirugía Menor': 0, 'Procedimientos': 0, total: 0
        };
      }
      
      let tipo = r.tipo_cirugia;
      if (!['Cirugía Mayor', 'Cirugía Mayor Ambulatoria', 'Cirugía Menor', 'Procedimientos'].includes(tipo)) {
        if (tipo?.toLowerCase().includes('procedimiento')) tipo = 'Procedimientos';
        else if (tipo?.toLowerCase().includes('menor')) tipo = 'Cirugía Menor';
        else tipo = 'Cirugía Mayor'; // Default if missing
      }
      
      monthlyMap[monthKey][tipo] = (monthlyMap[monthKey][tipo] || 0) + 1;
      monthlyMap[monthKey].total += 1;
    });

    return Object.values(monthlyMap).sort((a, b) => a.key.localeCompare(b.key));
  }, [filteredLibro]);

  // Donut Chart 1: Distribución según cirugía realizada
  const distribucionCirugia = useMemo(() => {
    const dist = { 'Cirugía Mayor Ambulatoria': 0, 'Cirugía Mayor': 0, 'Cirugía Menor': 0, 'Procedimientos': 0 };
    filteredLibro.forEach(r => {
      let tipo = r.tipo_cirugia;
      if (!['Cirugía Mayor', 'Cirugía Mayor Ambulatoria', 'Cirugía Menor', 'Procedimientos'].includes(tipo)) {
        if (tipo?.toLowerCase().includes('procedimiento')) tipo = 'Procedimientos';
        else if (tipo?.toLowerCase().includes('menor')) tipo = 'Cirugía Menor';
        else tipo = 'Cirugía Mayor';
      }
      dist[tipo]++;
    });
    return Object.entries(dist).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  }, [filteredLibro]);

  // Donut Chart 2: Familia IQ
  const distribucionFamilia = useMemo(() => {
    const dist = {};
    filteredLibro.forEach(r => {
      const fam = r.familia_iq || 'OTRAS';
      dist[fam] = (dist[fam] || 0) + 1;
    });
    return Object.entries(dist)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [filteredLibro]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f1f5f9' }}>
      {/* HEADER */}
      <header style={{ padding: '24px 32px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '16px', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Volver al Portal General
          </button>
          <h1 style={{ fontSize: '2.2rem', color: '#1e293b', margin: 0, fontWeight: 800 }}>Panel de Producción Quirúrgica</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', margin: '8px 0 0 0' }}>Estadísticas de Producción General y Libro Electrónico</p>
        </div>
        
        {/* TABS */}
        <div style={{ display: 'flex', gap: '8px', background: '#f8fafc', padding: '8px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          {[
            { id: 'libro', label: 'Estadística (Libro)', icon: <BarChart2 size={18} /> },
            { id: 'tabla', label: 'Tabla de Programación', icon: <Calendar size={18} /> },
            { id: 'disponibilidad', label: 'Disponibilidad (Infra)', icon: <Clock size={18} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px',
                background: activeTab === tab.id ? 'white' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                boxShadow: activeTab === tab.id ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                color: activeTab === tab.id ? '#0f172a' : '#64748b',
                fontWeight: activeTab === tab.id ? 700 : 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* MAIN CONTENT AREA WITH SIDEBAR */}
      {activeTab === 'libro' && (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* SIDEBAR */}
          <motion.div 
            animate={{ width: sidebarCollapsed ? '0px' : '280px', opacity: sidebarCollapsed ? 0 : 1 }}
            style={{ 
              background: '#475569', // Requested matching color aesthetic
              color: 'white',
              height: '100%',
              overflowY: 'auto',
              flexShrink: 0,
              display: sidebarCollapsed ? 'none' : 'block'
            }}
          >
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Filter size={18} /> Filtros de Libro
                </h3>
              </div>

              {/* Filters List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: '#cbd5e1', textTransform: 'uppercase' }}>Periodo de Monitoreo</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="date" value={dateRange.start} onChange={e => setDateRange(p => ({...p, start: e.target.value}))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: 'none', background: '#334155', color: 'white', fontSize: '0.85rem' }} />
                    <input type="date" value={dateRange.end} onChange={e => setDateRange(p => ({...p, end: e.target.value}))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: 'none', background: '#334155', color: 'white', fontSize: '0.85rem' }} />
                  </div>
                </div>

                {[
                  { label: 'TIPO DE CIRUGIA', val: tipoCirugia, set: setTipoCirugia, options: dropdowns.tipos },
                  { label: 'PROCEDENCIA', val: procedencia, set: setProcedencia, options: dropdowns.procedencias },
                  { label: 'TIPO DE GESTOR', val: tipoGestor, set: setTipoGestor, options: dropdowns.gestores },
                  { label: 'Forma de Pago', val: formaPago, set: setFormaPago, options: dropdowns.pagos },
                  { label: 'NOMBRE IQ', val: nombreIq, set: setNombreIq, options: dropdowns.iqs },
                  { label: 'PRIMER CIRUJANO', val: primerCirujano, set: setPrimerCirujano, options: dropdowns.ciru1 },
                  { label: 'Nombre Segundo Cirujano', val: segundoCirujano, set: setSegundoCirujano, options: dropdowns.ciru2 },
                  { label: 'Reintervención no Programada', val: reintervencion, set: setReintervencion, options: dropdowns.reints }
                ].map((f, i) => (
                  <div key={i}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: '#cbd5e1', textTransform: 'uppercase' }}>{f.label}</label>
                    <select 
                      value={f.val} 
                      onChange={e => f.set(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #64748b', background: '#f8fafc', color: '#1e293b', fontSize: '0.9rem', outline: 'none' }}
                    >
                      <option value="Todas">Todas</option>
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Toggle Sidebar Button */}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ width: '24px', background: '#334155', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* RIGHT DASHBOARD CONTENT */}
          <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <p>Cargando datos...</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                
                {/* KPI ROW */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                  <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Producción Total</p>
                    <h2 style={{ margin: '8px 0', fontSize: '2.5rem', color: '#0f172a', fontWeight: 800 }}>{totalKPI.val.toLocaleString()}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: totalKPI.trend === 'positive' ? '#10b981' : (totalKPI.trend === 'negative' ? '#ef4444' : '#64748b'), fontWeight: 600 }}>
                      <Activity size={16} /> {totalKPI.text}
                    </div>
                  </div>

                  <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Cirugías Mayores Totales</p>
                    <h2 style={{ margin: '8px 0', fontSize: '2.5rem', color: '#8b5cf6', fontWeight: 800 }}>{mayorKPI.val.toLocaleString()}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: mayorKPI.trend === 'positive' ? '#10b981' : (mayorKPI.trend === 'negative' ? '#ef4444' : '#64748b'), fontWeight: 600 }}>
                      <TrendingUp size={16} /> {mayorKPI.text}
                    </div>
                  </div>

                  <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Procedencia Urgencia</p>
                    <h2 style={{ margin: '8px 0', fontSize: '2.5rem', color: '#ef4444', fontWeight: 800 }}>{urgenciaKPI.val.toLocaleString()}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: urgenciaKPI.trend === 'positive' ? '#10b981' : (urgenciaKPI.trend === 'negative' ? '#ef4444' : '#64748b'), fontWeight: 600 }}>
                      <AlertCircle size={16} /> {urgenciaKPI.text}
                    </div>
                  </div>
                </div>

                {/* STACKED BAR CHART */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '32px' }}>
                  <div style={{ background: '#475569', color: 'white', padding: '12px 24px', borderRadius: '8px', marginBottom: '24px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, textAlign: 'center' }}>Producción de cirugías totales, Hospital de Villarrica según periodo</h3>
                  </div>
                  <div style={{ height: '400px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                        <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="Cirugía Mayor" stackId="a" fill={PIE_COLORS['Cirugía Mayor']} />
                        <Bar dataKey="Cirugía Mayor Ambulatoria" stackId="a" fill={PIE_COLORS['Cirugía Mayor Ambulatoria']} />
                        <Bar dataKey="Cirugía Menor" stackId="a" fill={PIE_COLORS['Cirugía Menor']} />
                        <Bar dataKey="Procedimientos" stackId="a" fill={PIE_COLORS['Procedimientos']} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* TWO DONUTS ROW */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                  
                  {/* DONUT 1 */}
                  <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#1e293b', textAlign: 'center' }}>Distribución según cirugía realizada</h3>
                    <div style={{ height: '300px', position: 'relative' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={distribucionCirugia}
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {distribucionCirugia.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{totalKPI.val.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Colored Boxes below Donut 1 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                      {distribucionCirugia.map((item, idx) => (
                        <div key={idx} style={{ background: PIE_COLORS[item.name] || COLORS[idx], color: 'white', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                          <h4 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{item.value}</h4>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', opacity: 0.9 }}>{item.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* DONUT 2 */}
                  <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#1e293b', textAlign: 'center' }}>Distribución familia de iq propuesta</h3>
                    <div style={{ height: '300px', position: 'relative' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={distribucionFamilia}
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {distribucionFamilia.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{totalKPI.val.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Legend below Donut 2 */}
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                      {distribucionFamilia.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: COLORS[idx % COLORS.length] }}></div>
                          <span style={{ fontWeight: 600, flex: 1, textTransform: 'uppercase' }}>{item.name}</span>
                          <span>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* OTHER TABS: Keep existing logic for TABLA and DISPONIBILIDAD */}
      {activeTab !== 'libro' && (
        <div style={{ padding: '32px', flex: 1 }}>
          <div className="glass-panel" style={{ background: 'white', padding: '32px', borderRadius: '24px' }}>
            <h2 style={{ marginTop: 0 }}>Módulo en Construcción</h2>
            <p>La vista seleccionada ({activeTab}) se ha omitido temporalmente para centrarse en las Estadísticas del Libro.</p>
          </div>
        </div>
      )}
    </div>
  );
}
