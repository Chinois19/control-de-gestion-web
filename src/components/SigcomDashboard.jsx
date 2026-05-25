import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Activity, DollarSign, Stethoscope, Bed, Scissors, Building2, ChevronLeft, Lightbulb, TrendingUp, AlertTriangle
} from 'lucide-react';
import {
  ComposedChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area
} from 'recharts';
import sigcomJson from '../data/sigcom_data.json';
import './SigcomDashboard.css';

const monthsNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const AREAS = [
  { id: 'cma', label: 'CMA (Ambulatoria)', icon: <Activity size={20} /> },
  { id: 'hospitalizados', label: 'Hospitalizados & UPC', icon: <Bed size={20} /> },
  { id: 'quirurgica', label: 'Pabellón Quirúrgico', icon: <Scissors size={20} /> },
  { id: 'consultas', label: 'Consultas de Especialidad', icon: <Stethoscope size={20} /> },
  { id: 'otros', label: 'Apoyo y Otros', icon: <Building2 size={20} /> }
];

const MINSAL_PROMEDIOS = {
  'cma': 880000,
  'hospitalizados': 350000,
  'quirurgica': 1200000,
  'consultas': 45000,
  'otros': 150000
};

export default function SigcomDashboard({ onBack }) {
  const [selectedArea, setSelectedArea] = useState('cma');
  const [startMonth, setStartMonth] = useState('2025-01');
  const [endMonth, setEndMonth] = useState('2026-12');
  
  const rawData = sigcomJson.data || [];
  
  // Custom Formatter
  const formatCLP = (val) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);
  const formatMill = (val) => (val / 1000000).toFixed(0) + 'M';

  // Process Data Based on Filters
  const { chartData, insumosData, insights, totalCosto, totalProd } = useMemo(() => {
    // 1. Filter by Area & Years
    const filtered = rawData.filter(d => {
      // Area mapping
      const cc = d.costCenter.toUpperCase();
      let key = 'otros';
      if (cc.includes('HOSPITALIZACIÓN') || cc.includes('UNIDAD DE') || cc.includes('EMERGENCIA') || cc.includes('CRÍTICOS')) key = 'hospitalizados';
      else if (cc.includes('AMBULATORIA') || cc.includes('AMBULATORIO')) key = 'cma';
      else if (cc.includes('QUIRÓFANO') || cc.includes('CIRUGÍA')) key = 'quirurgica';
      else if (cc.includes('CONSULTA') || cc.includes('PROGRAMA')) key = 'consultas';

      const dTime = `${d.year}-${String(d.month).padStart(2, '0')}`;
      return key === selectedArea && dTime >= startMonth && dTime <= endMonth;
    });

    // 2. Aggregate Monthly
    const monthlyMap = {};
    const insumosMap = {};
    let tCost = 0;
    let tProd = 0;
    let maxMonthCost = { name: '', val: 0 };

    filtered.forEach(item => {
      const timeKey = `${item.year}-${item.month}`;
      if (!monthlyMap[timeKey]) {
        monthlyMap[timeKey] = {
          timeKey,
          year: item.year,
          month: item.month,
          name: `${monthsNames[item.month - 1]} ${item.year.toString().slice(2)}`,
          insumos: 0, rrhh: 0, gg: 0,
          totalCost: 0, totalProd: 0
        };
      }
      
      monthlyMap[timeKey].insumos += item.insumos || 0;
      monthlyMap[timeKey].rrhh += item.rrhh || 0;
      monthlyMap[timeKey].gg += item.gastosGenerales || 0;
      monthlyMap[timeKey].totalCost += item.total || 0;
      monthlyMap[timeKey].totalProd += item.productionTotal || 0;

      tCost += item.total || 0;
      tProd += item.productionTotal || 0;

      if (item.insumosBreakdown) {
        Object.entries(item.insumosBreakdown).forEach(([k, v]) => {
          insumosMap[k] = (insumosMap[k] || 0) + v;
        });
      }
    });

    const cData = Object.values(monthlyMap).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    // 3. Process Bandas MINSAL and Max Costs
    const promNacional = MINSAL_PROMEDIOS[selectedArea] || 150000;
    let overLimitCount = 0;

    cData.forEach(d => {
      d.costoUnitario = d.totalProd > 0 ? (d.totalCost / d.totalProd) : 0;
      d.promedio = promNacional;
      d.limiteSuperior = promNacional * 1.35;
      d.limiteInferior = promNacional * 0.65;
      
      if (d.costoUnitario > d.limiteSuperior) overLimitCount++;
      if (d.totalCost > maxMonthCost.val) {
        maxMonthCost = { name: d.name, val: d.totalCost };
      }
    });

    // 4. Sort Insumos
    const topInsumos = Object.entries(insumosMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const highestInsumo = topInsumos.length > 0 ? topInsumos[0] : null;

    // 5. Generate AI-like Insights
    const avgCost = tProd > 0 ? (tCost / tProd) : 0;
    const generatedInsights = [];
    
    if (avgCost > promNacional) {
      generatedInsights.push({ type: 'warning', text: `El costo promedio del período (${formatCLP(avgCost)}) supera el promedio nacional esperado (${formatCLP(promNacional)}).` });
    } else {
      generatedInsights.push({ type: 'success', text: `Eficiencia operativa: El costo promedio se mantiene dentro o bajo el rango del promedio nacional MINSAL.` });
    }

    if (overLimitCount > 0) {
      generatedInsights.push({ type: 'alert', text: `Alerta de Costos: En ${overLimitCount} meses el costo unitario sobrepasó el Límite Superior MINSAL.` });
    }

    if (highestInsumo) {
      generatedInsights.push({ type: 'info', text: `Principal gasto en insumos: ${highestInsumo[0]} representa un desembolso de ${formatCLP(highestInsumo[1])}.` });
    }

    if (maxMonthCost.val > 0) {
      generatedInsights.push({ type: 'info', text: `Peak de gasto en ${maxMonthCost.name} con un total asignado de ${formatCLP(maxMonthCost.val)}.` });
    }

    return { chartData: cData, insumosData: topInsumos, insights: generatedInsights, totalCosto: tCost, totalProd: tProd };
  }, [rawData, selectedArea, startMonth, endMonth]);

  return (
    <div className="sigcom-dashboard" style={{ display: 'flex', flexDirection: 'column' }}>
      
      {/* Main Content Area */}
      <div className="sigcom-main" style={{ padding: '2rem 3rem' }}>
        
        {/* Top Header */}
        <div className="sigcom-header" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {onBack && (
              <button onClick={onBack} style={{ background: 'white', border: '1px solid #eee', padding: '12px', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <ChevronLeft size={24} color="#1e293b" />
              </button>
            )}
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, color: 'var(--text-dark)', letterSpacing: '-0.5px' }}>
                Panel de Eficiencia y Costeo
              </h1>
              <p style={{ color: 'var(--text-secondary)', margin: '0.2rem 0 0 0', fontSize: '1.1rem', fontWeight: 500 }}>
                Control de Gestión Institucional
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', textAlign: 'right' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Total Costo Asignado</p>
              <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-color)' }}>{formatCLP(totalCosto)}</h2>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Producción Total</p>
              <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#8b5cf6' }}>{new Intl.NumberFormat('es-CL').format(totalProd)}</h2>
            </div>
          </div>
        </div>

        {/* Floating Filter Bar (Mammography Style) */}
        <div style={{ display: 'flex', gap: '30px', padding: '20px 30px', background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', marginBottom: '2rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Área Clínica</span>
            <select 
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 700, color: '#1e293b', fontSize: '1rem', minWidth: '220px', outline: 'none', cursor: 'pointer' }}
            >
              {AREAS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Desde</span>
            <input 
              type="month" 
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
              style={{ padding: '11px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 700, color: '#1e293b', fontSize: '1rem', outline: 'none', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Hasta</span>
            <input 
              type="month" 
              value={endMonth}
              onChange={(e) => setEndMonth(e.target.value)}
              style={{ padding: '11px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 700, color: '#1e293b', fontSize: '1rem', outline: 'none', cursor: 'pointer' }}
            />
          </div>

        </div>

        {/* Insights Panel (Neumorphic Dark) */}
        <div className="insights-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Lightbulb size={28} color="#fbbf24" />
            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Insights Descriptivos del Período</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {insights.map((ins, idx) => (
              <div key={idx} className="insight-item">
                <div className="insight-icon">
                  {ins.type === 'alert' || ins.type === 'warning' ? <AlertTriangle size={20} color="#f87171" /> : <TrendingUp size={20} color="#34d399" />}
                </div>
                <p style={{ margin: 0, lineHeight: '1.5', fontSize: '1rem', color: 'rgba(255,255,255,0.9)' }}>
                  {ins.text}
                </p>
              </div>
            ))}
            {insights.length === 0 && <p style={{ opacity: 0.6 }}>No hay datos suficientes para generar insights en este período.</p>}
          </div>
        </div>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          
          {/* Banda MINSAL Chart */}
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#1e293b', fontWeight: 800, fontSize: '1.2rem' }}>Banda de Costos MINSAL (Tendencia)</h3>
              <span style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>
                Costo Unitario Promedio: {formatCLP(totalProd > 0 ? totalCosto/totalProd : 0)}
              </span>
            </div>
            <div style={{ width: '100%', height: '350px' }}>
              <ResponsiveContainer>
                <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 0, left: 20 }}>
                  <defs>
                    <linearGradient id="colorCosto" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.4} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis tickFormatter={(v) => '$' + (v/1000).toFixed(0) + 'k'} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                    formatter={(val) => formatCLP(val)} 
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  
                  <Area type="monotone" dataKey="costoUnitario" name="Costo Real Unitario" stroke="#0ea5e9" strokeWidth={4} fillOpacity={1} fill="url(#colorCosto)" />
                  <Line type="step" dataKey="promedio" name="Promedio MINSAL" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                  <Line type="step" dataKey="limiteSuperior" name="Límite Superior" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="step" dataKey="limiteInferior" name="Límite Inferior" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            
            {/* Stacked Direct Costs */}
            <div className="glass-panel">
              <h3 style={{ margin: '0 0 20px 0', color: '#1e293b', fontWeight: 800, fontSize: '1.2rem' }}>Estructura de Costos Directos</h3>
              <div style={{ width: '100%', height: '400px' }}>
                <ResponsiveContainer>
                  <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.4} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis yAxisId="left" tickFormatter={formatMill} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                      formatter={(val, name) => [name === 'Total Producción' ? val : formatCLP(val), name]} 
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar yAxisId="left" dataKey="insumos" name="Insumos" stackId="a" fill="#38bdf8" radius={[0, 0, 6, 6]} />
                    <Bar yAxisId="left" dataKey="rrhh" name="Recursos Humanos" stackId="a" fill="#1e293b" />
                    <Bar yAxisId="left" dataKey="gg" name="Gastos Generales" stackId="a" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="totalProd" name="Total Producción" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Insumos Breakdown Table */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#1e293b', fontWeight: 800, fontSize: '1.2rem' }}>Desglose de Insumos</h3>
              <div className="insumos-list" style={{ flex: 1, overflowY: 'auto' }}>
                {insumosData.map(([name, val], idx) => (
                  <div key={idx} className="insumo-row" style={{ padding: '16px 24px', fontSize: '1rem' }}>
                    <span style={{ color: '#334155', fontWeight: 600, flex: 1 }}>
                      {name}
                    </span>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>
                      {formatCLP(val)}
                    </span>
                  </div>
                ))}
                {insumosData.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '2rem', fontSize: '0.9rem' }}>
                    Sin datos de insumos en el período.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
