import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Select from 'react-select';
import { 
  ChevronLeft, Activity, DollarSign, Users, Package, AlertTriangle, TrendingUp, Layers, ChevronDown, ChevronRight, Lightbulb
} from 'lucide-react';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, PieChart, Pie, Cell, Sector, BarChart, LabelList
} from 'recharts';
import sigcomJson from '../data/sigcom_data.json';
import './SigcomDashboard.css';

const monthsNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const COLORS = ['#00c4cc', '#ff9f00', '#e63956', '#005b9f', '#8f1a52', '#ffc107', '#4dd0e1', '#f06292', '#1976d2', '#ffb300'];

const BANDAS_MINSAL = {
  "CMA": { limiteInferior: 381104, marcaInferior: 496768, promedio: 728097, marcaSuperior: 1006438, limiteSuperior: 1127771 },
  "Emergencia": { limiteInferior: 65156, marcaInferior: 89189, promedio: 125239, marcaSuperior: 169191, limiteSuperior: 194402 },
  "IQ No Ambulatoria": { limiteInferior: 548153, marcaInferior: 703125, promedio: 1013068, marcaSuperior: 1387839, limiteSuperior: 1550405 },
  "DCO Hospitalizacion": { limiteInferior: 206705, marcaInferior: 246996, promedio: 307432, marcaSuperior: 385894, limiteSuperior: 428159 },
  "DCO UTI": { limiteInferior: 366143, marcaInferior: 515099, promedio: 738531, marcaSuperior: 1009100, limiteSuperior: 1165354 },
  "DCO UCI": { limiteInferior: 514907, marcaInferior: 783687, promedio: 1186857, marcaSuperior: 1667939, limiteSuperior: 1949889 },
  "Consultas especialidad": { limiteInferior: 63376, marcaInferior: 88576, promedio: 138976, marcaSuperior: 198655, limiteSuperior: 225090 }
};

const OPCIONES_BANDAS = [
  { value: 'auto', label: 'Cálculo Automático' },
  ...Object.keys(BANDAS_MINSAL).map(k => ({ value: k, label: `Banda: ${k}` }))
];

export default function SigcomDashboard({ onBack }) {
  const [selectedCCs, setSelectedCCs] = useState([]);
  const [startMonth, setStartMonth] = useState('2025-01');
  const [endMonth, setEndMonth] = useState('2026-12');
  const [selectedBanda, setSelectedBanda] = useState(OPCIONES_BANDAS[0]); // Por defecto: Cálculo Automático
  
  // Table state
  const [expandedRows, setExpandedRows] = useState({});
  const [activeChartNode, setActiveChartNode] = useState(null); // Determines what the dynamic chart shows
  const [pieActiveIndex, setPieActiveIndex] = useState(0);

  const rawData = sigcomJson.data || [];

  const allCCs = useMemo(() => {
    const centers = new Set();
    rawData.forEach(d => {
      if (d.costCenter) centers.add(d.costCenter);
    });
    return Array.from(centers).sort().map(cc => ({ value: cc, label: cc }));
  }, [rawData]);

  useEffect(() => {
    if (allCCs.length > 0 && selectedCCs.length === 0) {
      setSelectedCCs([allCCs[0]]);
    }
  }, [allCCs]);

  const formatCLP = (val) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);
  const formatCompact = (val) => new Intl.NumberFormat('es-CL', { notation: 'compact', maximumFractionDigits: 1 }).format(val);

  const { chartData, kpis, insights, tableData, activeBandas } = useMemo(() => {
    const selectedLabels = selectedCCs.map(cc => cc.value);
    
    const filtered = rawData.filter(d => {
      const dTime = `${d.year}-${String(d.month).padStart(2, '0')}`;
      return selectedLabels.includes(d.costCenter) && dTime >= startMonth && dTime <= endMonth;
    });

    const monthlyMap = {};
    let totalCost = 0, totalRRHH = 0, totalGG = 0, totalInsumos = 0, totalProd = 0;
    
    // For the hierarchical table
    const ccMap = {};
    const globalInsumosBreakdown = {};

    filtered.forEach(item => {
      // Monthly aggregation for top chart
      const timeKey = `${item.year}-${item.month}`;
      if (!monthlyMap[timeKey]) {
        monthlyMap[timeKey] = {
          timeKey, year: item.year, month: item.month, name: `${monthsNames[item.month - 1]} ${item.year.toString().slice(2)}`,
          insumos: 0, rrhh: 0, gg: 0, totalCost: 0, totalProd: 0
        };
      }
      monthlyMap[timeKey].insumos += item.insumos || 0;
      monthlyMap[timeKey].rrhh += item.rrhh || 0;
      monthlyMap[timeKey].gg += item.gastosGenerales || 0;
      monthlyMap[timeKey].totalCost += item.total || 0;
      monthlyMap[timeKey].totalProd += item.productionTotal || 0;

      // Globals
      totalInsumos += item.insumos || 0;
      totalRRHH += item.rrhh || 0;
      totalGG += item.gastosGenerales || 0;
      totalCost += item.total || 0;
      totalProd += item.productionTotal || 0;

      // CC Aggregation for table
      if (!ccMap[item.costCenter]) {
        ccMap[item.costCenter] = {
          id: item.costCenter,
          label: item.costCenter,
          type: 'cc',
          total: 0, rrhh: 0, gg: 0, insumos: 0, prod: 0,
          insumosBreakdown: {}
        };
      }
      ccMap[item.costCenter].total += item.total || 0;
      ccMap[item.costCenter].rrhh += item.rrhh || 0;
      ccMap[item.costCenter].gg += item.gastosGenerales || 0;
      ccMap[item.costCenter].insumos += item.insumos || 0;
      ccMap[item.costCenter].prod += item.productionTotal || 0;

      if (item.insumosBreakdown) {
        Object.entries(item.insumosBreakdown).forEach(([k, v]) => {
          globalInsumosBreakdown[k] = (globalInsumosBreakdown[k] || 0) + v;
          ccMap[item.costCenter].insumosBreakdown[k] = (ccMap[item.costCenter].insumosBreakdown[k] || 0) + v;
        });
      }
    });

    const cData = Object.values(monthlyMap).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    const avgCostoUnitario = totalProd > 0 ? totalCost / totalProd : 0;
    const promNacionalAuto = avgCostoUnitario > 0 ? avgCostoUnitario : 150000;
    
    // Auto-detectar la banda correcta si está en 'auto'
    const activeBandKey = (() => {
      if (selectedBanda && selectedBanda.value !== 'auto') return selectedBanda.value;
      const labels = selectedCCs.map(cc => cc.label.toLowerCase());
      if (labels.some(l => l.includes('ambulat'))) return 'CMA';
      if (labels.some(l => l.includes('urgencia') || l.includes('emergencia'))) return 'Emergencia';
      if (labels.some(l => l.includes('uti'))) return 'DCO UTI';
      if (labels.some(l => l.includes('uci'))) return 'DCO UCI';
      if (labels.some(l => l.includes('hospitalizaci'))) return 'DCO Hospitalizacion';
      if (labels.some(l => l.includes('consulta') || l.includes('especialidad'))) return 'Consultas especialidad';
      if (labels.some(l => l.includes('iq') || l.includes('quirófano') || l.includes('quirofano'))) return 'IQ No Ambulatoria';
      return null;
    })();

    const bandasObj = activeBandKey ? BANDAS_MINSAL[activeBandKey] : null;

    cData.forEach(d => {
      d.costoUnitario = d.totalProd > 0 ? (d.totalCost / d.totalProd) : 0;
      
      if (bandasObj) {
        d.promedio = bandasObj.promedio;
        d.marcaSuperior = bandasObj.marcaSuperior;
        d.limiteSuperior = bandasObj.limiteSuperior;
        d.marcaInferior = bandasObj.marcaInferior;
        d.limiteInferior = bandasObj.limiteInferior;
      } else {
        d.promedio = promNacionalAuto;
        d.marcaSuperior = promNacionalAuto * 1.15;
        d.limiteSuperior = promNacionalAuto * 1.35;
        d.marcaInferior = promNacionalAuto * 0.85;
        d.limiteInferior = promNacionalAuto * 0.65;
      }
    });

    const kpisObj = { totalCost, totalRRHH, totalGG, totalInsumos, totalProd, unitCost: avgCostoUnitario };
    const activePromedio = bandasObj ? bandasObj.promedio : promNacionalAuto;

    const genInsights = [];
    if (kpisObj.unitCost > activePromedio * 1.1) {
      genInsights.push({ type: 'warning', text: `Costo promedio unitario (${formatCLP(kpisObj.unitCost)}) supera la referencia estándar en 10%.`});
    } else {
      genInsights.push({ type: 'success', text: `Eficiencia dentro del margen de referencia. Costo unitario: ${formatCLP(kpisObj.unitCost)}.`});
    }
    if (totalInsumos > totalRRHH) {
      genInsights.push({ type: 'info', text: 'El mayor peso del gasto directo se concentra en Insumos.'});
    }

    const tData = Object.values(ccMap).sort((a, b) => b.total - a.total);

    return { chartData: cData, kpis: kpisObj, insights: genInsights, tableData: tData, activeBandas: bandasObj || null, globalInsumosBreakdown };
  }, [rawData, selectedCCs, startMonth, endMonth, selectedBanda]);

  // Set default active node if nothing is selected
  useEffect(() => {
    if (!activeChartNode && tableData.length > 0) {
      setActiveChartNode({ type: 'global', data: kpis, label: 'Visión Global (Centros Seleccionados)' });
    }
  }, [tableData, activeChartNode, kpis]);

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRowClick = (nodeType, data, label) => {
    setActiveChartNode({ type: nodeType, data, label });
    setPieActiveIndex(0);
  };

  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, percent, value, name } = props;
    return (
      <g>
        <text x={cx} y={cy - 10} textAnchor="middle" fill="#0f172a" fontSize={14} fontWeight={700}>
          {name.length > 20 ? name.substring(0, 20) + '...' : name}
        </text>
        <text x={cx} y={cy + 15} textAnchor="middle" fill={fill} fontSize={20} fontWeight={800}>
          {(percent * 100).toFixed(1)}%
        </text>
        <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 10} startAngle={startAngle} endAngle={endAngle} fill={fill} />
        <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 12} outerRadius={outerRadius + 15} fill={fill} />
      </g>
    );
  };

  const getDynamicChartData = () => {
    if (!activeChartNode) return { inner: [], outer: [] };
    
    if (activeChartNode.type === 'global' || activeChartNode.type === 'cc') {
      const data = activeChartNode.data;
      const rrhh = data.rrhh || data.totalRRHH || 0;
      const insumos = data.insumos || data.totalInsumos || 0;
      const gg = data.gg || data.totalGG || 0;

      const inner = [
        { name: 'Directos', value: rrhh + insumos, fill: '#00c4cc' },
        { name: 'Indirectos', value: gg, fill: '#e63956' }
      ].filter(d => d.value > 0);

      const outer = [
        { name: 'RRHH', value: rrhh, fill: '#4dd0e1' },
        { name: 'Insumos', value: insumos, fill: '#ffc107' },
        { name: 'Gastos Gen.', value: gg, fill: '#f06292' }
      ].filter(d => d.value > 0);

      return { inner, outer };
    }
    
    if (activeChartNode.type === 'insumos') {
      const data = activeChartNode.data;
      const total = Object.values(data).reduce((a, b) => a + b, 0);
      const inner = [{ name: 'Insumos', value: total, fill: '#10b981' }];
      
      const outer = Object.entries(data)
        .map(([name, value], i) => ({ name: name.substring(0,25), value, fill: COLORS[i % COLORS.length] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 12);
      return { inner, outer };
    }
    return { inner: [], outer: [] };
  };

  const dynamicData = getDynamicChartData();

  return (
    <div className="sigcom-dashboard" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
      
      {/* Compact Header */}
      <div style={{ padding: '1.5rem 3rem', background: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {onBack && (
              <button onClick={onBack} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                <ChevronLeft size={20} color="#0f172a" />
              </button>
            )}
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Análisis de Costos (Cubo 9)</h1>
              <p style={{ color: '#64748b', margin: '0.1rem 0 0 0', fontSize: '0.9rem', fontWeight: 500 }}>Control Dinámico e Insights</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ width: '280px' }}>
              <Select
                isMulti
                options={allCCs}
                value={selectedCCs}
                onChange={setSelectedCCs}
                placeholder="Seleccione CC..."
                styles={{ control: (base) => ({ ...base, borderRadius: '8px', minHeight: '38px' }) }}
              />
            </div>
            <div style={{ width: '250px' }}>
              <Select
                options={OPCIONES_BANDAS}
                value={selectedBanda}
                onChange={setSelectedBanda}
                placeholder="Referencia MINSAL..."
                styles={{ control: (base) => ({ ...base, borderRadius: '8px', minHeight: '38px' }) }}
              />
            </div>
            <input type="month" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc' }} />
            <input type="month" value={endMonth} onChange={(e) => setEndMonth(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc' }} />
          </div>
        </div>
      </div>

      <div style={{ padding: '1.5rem 3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* KPI Cards & Insights in one line */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            {[
              { label: 'Costo Total', val: formatCompact(kpis.totalCost), icon: DollarSign, color: '#8b5cf6' },
              { label: 'Producción', val: kpis.totalProd.toLocaleString('es-CL'), icon: Activity, color: '#0ea5e9' },
              { label: 'Costo Unitario', val: formatCLP(kpis.unitCost), icon: Layers, color: '#10b981' }
            ].map((kpi, idx) => (
              <div key={idx} style={{ flex: 1, background: 'white', borderRadius: '12px', padding: '15px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #e2e8f0' }}>
                <div style={{ padding: '10px', borderRadius: '10px', background: `${kpi.color}15` }}>
                  <kpi.icon size={20} color={kpi.color} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{kpi.label}</p>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{kpi.val}</h3>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '12px', padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
              <Lightbulb size={16} color="#ca8a04" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ca8a04' }}>Insights</span>
            </div>
            {insights.map((ins, i) => (
              <p key={i} style={{ margin: '0 0 4px 0', fontSize: '0.8rem', color: '#854d0e', lineHeight: '1.3' }}>• {ins.text}</p>
            ))}
          </div>

        </div>

        {/* Bandas MINSAL Compact */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Evolución: Costo Unitario vs Referencia</h3>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer>
              <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="colorCostoSmall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={5} />
                <YAxis tickFormatter={(v) => '$' + (v/1000).toFixed(0) + 'k'} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} width={60} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} formatter={(val) => formatCLP(val)} />
                <Area type="monotone" dataKey="costoUnitario" name="Costo Real" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorCostoSmall)" />
                <Line type="step" dataKey="limiteSuperior" name="Límite Sup (Rojo)" stroke="#dc2626" strokeWidth={2} dot={false} strokeDasharray="3 3" />
                <Line type="step" dataKey="marcaSuperior" name="Marca Sup (Ambar)" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="3 3" />
                <Line type="step" dataKey="promedio" name="Promedio Nac." stroke="#10b981" strokeWidth={3} dot={false} />
                <Line type="step" dataKey="marcaInferior" name="Marca Inf (Ambar)" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="3 3" />
                <Line type="step" dataKey="limiteInferior" name="Límite Inf (Rojo)" stroke="#dc2626" strokeWidth={2} dot={false} strokeDasharray="3 3" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stacked Bar Chart por Mes */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Evolución Mensual: Costos Directos e Indirectos</h3>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={5} />
                <YAxis tickFormatter={(v) => '$' + (v/1000000).toFixed(0) + 'M'} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} width={60} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} formatter={(val) => formatCLP(val)} cursor={{fill: '#f1f5f9'}} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="rrhh" name="Recursos Humanos (Directo)" stackId="a" fill="#00c4cc" radius={[0, 0, 4, 4]}>
                  <LabelList dataKey="rrhh" position="inside" formatter={(v) => v > 0 ? formatCompact(v) : ''} fill="#fff" fontSize={10} fontWeight={600} />
                </Bar>
                <Bar dataKey="insumos" name="Insumos (Directo)" stackId="a" fill="#ff9f00">
                  <LabelList dataKey="insumos" position="inside" formatter={(v) => v > 0 ? formatCompact(v) : ''} fill="#fff" fontSize={10} fontWeight={600} />
                </Bar>
                <Bar dataKey="gg" name="Gastos Generales (Indirecto)" stackId="a" fill="#e63956" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="gg" position="inside" formatter={(v) => v > 0 ? formatCompact(v) : ''} fill="#fff" fontSize={10} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Drill-down Table & Dynamic Chart */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          
          {/* Tabla de Totales Consolidados */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Desglose Total (Selección)</h3>
              <button 
                onClick={() => handleRowClick('global', kpis, 'Visión Global')}
                style={{ background: '#f1f5f9', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: '#475569' }}
              >
                Ver Gráfico Global
              </button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '400px' }}>
              <div 
                style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', background: activeChartNode?.type === 'global' ? '#f8fafc' : 'white' }}
                onClick={() => handleRowClick('global', kpis, 'Visión Global')}
              >
                <span style={{ fontWeight: 700, color: '#0f172a' }}>Recursos Humanos (Directo)</span>
                <span style={{ fontWeight: 800, color: '#0ea5e9', fontSize: '1.05rem' }}>{formatCLP(kpis.totalRRHH)}</span>
              </div>
              <div 
                style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', background: activeChartNode?.type === 'global' ? '#f8fafc' : 'white' }}
                onClick={() => handleRowClick('global', kpis, 'Visión Global')}
              >
                <span style={{ fontWeight: 700, color: '#0f172a' }}>Gastos Generales (Indirecto)</span>
                <span style={{ fontWeight: 800, color: '#f59e0b', fontSize: '1.05rem' }}>{formatCLP(kpis.totalGG)}</span>
              </div>
              <div 
                style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', background: expandedRows['global-insumos'] || activeChartNode?.type === 'insumos' ? '#f8fafc' : 'white' }}
                onClick={() => { toggleRow('global-insumos'); handleRowClick('insumos', globalInsumosBreakdown, 'Desglose de Insumos'); }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button style={{ background: 'none', border: 'none', padding: 0, marginRight: '10px', cursor: 'pointer' }}>
                    {expandedRows['global-insumos'] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>Insumos (Directo - Click para ver)</span>
                </div>
                <span style={{ fontWeight: 800, color: '#10b981', fontSize: '1.05rem' }}>{formatCLP(kpis.totalInsumos)}</span>
              </div>
              
              <AnimatePresence>
                {expandedRows['global-insumos'] && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', background: '#fafafa' }}>
                    {Object.entries(globalInsumosBreakdown).sort((a,b) => b[1]-a[1]).map(([name, val], i) => (
                      <div key={i} style={{ padding: '10px 20px 10px 45px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid #e2e8f0' }}>
                        <span style={{ color: '#475569', fontWeight: 500 }}>{name.length > 50 ? name.substring(0,50)+'...' : name}</span>
                        <span style={{ color: '#0f172a', fontWeight: 700 }}>{formatCLP(val)}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Dynamic Chart Area */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Composición Gráfica</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#0ea5e9', fontWeight: 600 }}>{activeChartNode?.label || 'Seleccione un elemento'}</p>
            </div>
            
            <div style={{ flex: 1, position: 'relative' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeChartNode?.label || 'empty'}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  style={{ width: '100%', height: '100%' }}
                >
                  {dynamicData.outer.length > 0 ? (
                    activeChartNode?.type === 'insumos_old' ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dynamicData.outer} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3}/>
                          <XAxis type="number" tickFormatter={formatCompact} tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                          <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                          <Tooltip formatter={(val) => formatCLP(val)} contentStyle={{borderRadius: '8px', fontSize: '11px'}} />
                          <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} animationDuration={1000} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <ResponsiveContainer width="100%" height={380}>
                        <PieChart>
                          <Tooltip formatter={(val) => formatCLP(val)} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                          <Pie
                            data={dynamicData.inner}
                            dataKey="value"
                            nameKey="name"
                            cx="50%" cy="50%"
                            innerRadius={0}
                            outerRadius={65}
                            animationDuration={1000}
                          >
                            {dynamicData.inner.map((entry, index) => (
                              <Cell key={`inner-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Pie
                            data={dynamicData.outer}
                            dataKey="value"
                            nameKey="name"
                            cx="50%" cy="50%"
                            innerRadius={75}
                            outerRadius={115}
                            label={({ name, percent }) => percent > 0.05 ? `${name}` : ''}
                            labelLine={true}
                            animationDuration={1000}
                          >
                            {dynamicData.outer.map((entry, index) => (
                              <Cell key={`outer-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    )
                  ) : (
                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                      Sin datos para mostrar
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
