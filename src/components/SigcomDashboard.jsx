import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Select from 'react-select';
import { 
  ChevronLeft, Activity, DollarSign, Users, Package, AlertTriangle, TrendingUp, Layers, ChevronDown, ChevronRight, Lightbulb, Info, ArrowRightLeft, Sparkles
} from 'lucide-react';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, PieChart, Pie, Cell, Sector, BarChart, LabelList, Treemap
} from 'recharts';
import sigcomJson from '../data/sigcom_data.json';
import './SigcomDashboard.css';

const monthsNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const COLORS = ['#00c4cc', '#ff9f00', '#e63956', '#005b9f', '#8f1a52', '#ffc107', '#4dd0e1', '#f06292', '#1976d2', '#ffb300'];

const GROUP_TO_BAND_MAP = {
  "Hospitalización": "Hospitalizacion",
  "UCI": "UCI",
  "UTI": "UTI",
  "Quirófanos No Ambulatorios": "Quirofano no Ambulatorios",
  "Emergencia": "Emergencias",
  "Consulta de Especialidad": "Consultas Especialidad",
  "Cirugía Mayor Ambulatoria": "Cirugia Mayor Ambulatoria"
};

// ─────────────────────────────────────────────────────────────────────────────
// DRILL-DOWN LINE CHART COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const LINE_PALETTE = [
  '#0ea5e9','#10b981','#f59e0b','#e63956','#8b5cf6','#ec4899','#14b8a6',
  '#f97316','#6366f1','#84cc16','#06b6d4','#a855f7','#ef4444','#22c55e'
];

const HIERARCHY_DEF = [
  { id: 'total',     label: 'Costo Total CC',          key: 'totalCost',  color: '#0f172a', bdKey: null,
    children: [
      { id: 'directos',   label: 'Gasto Directo',       key: 'directos',   color: '#0ea5e9', bdKey: null,
        children: [
          { id: 'rrhh',    label: 'Recursos Humanos',    key: 'rrhh',       color: '#00c4cc', bdKey: 'rrhhBreakdown' },
          { id: 'insumos', label: 'Insumos Médicos',     key: 'insumos',    color: '#ff9f00', bdKey: 'insumosBreakdown' },
          { id: 'gg',      label: 'Gastos Generales',    key: 'gg',         color: '#e63956', bdKey: 'ggBreakdown' },
        ]
      },
      { id: 'indirectos', label: 'Gasto Indirecto',    key: 'indirectos', color: '#a855f7', bdKey: null, children: [] },
    ]
  }
];

function flattenHierarchy(nodes, level = 0) {
  const result = [];
  nodes.forEach(n => {
    result.push({ ...n, level });
    if (n._open && n.children && n.children.length) {
      result.push(...flattenHierarchy(n.children, level + 1));
    }
  });
  return result;
}

function CostDrilldownChart({ chartData, globalRrhhBreakdown, globalGgBreakdown, globalInsumosBreakdown, totalProd = 0 }) {
  const fmtCLP = v => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(v);
  const fmtM = v => {
    if (!v && v !== 0) return '$0';
    if (Math.abs(v) >= 1e9) return `$${(v/1e9).toFixed(1)}B`;
    if (Math.abs(v) >= 1e6) return `$${(v/1e6).toFixed(1)}M`;
    if (Math.abs(v) >= 1e3) return `$${(v/1e3).toFixed(0)}k`;
    return `$${v.toFixed(0)}`;
  };
  const fmtDec = v => new Intl.NumberFormat('es-CL', { maximumFractionDigits: 1 }).format(v);

  // openIds: set of node ids that are expanded in tree
  const [openIds, setOpenIds] = React.useState(new Set(['total', 'directos', 'insumos']));
  // activeLines: set of leaf/branch node ids shown as lines
  const [activeLines, setActiveLines] = React.useState(new Set(['total']));
  // Mode: 'gasto' ($ total) vs 'unitario' ($ / prod)
  const [metricMode, setMetricMode] = React.useState('gasto');
  // Show combined sum line
  const [showCombinedSum, setShowCombinedSum] = React.useState(true);

  // Build the breakdown keys universe from global breakdowns
  const bdSources = { rrhhBreakdown: globalRrhhBreakdown, insumosBreakdown: globalInsumosBreakdown, ggBreakdown: globalGgBreakdown };

  // Recursively build node tree with _open flag
  function buildTree(defs) {
    return defs.map(d => ({
      ...d,
      _open: openIds.has(d.id),
      children: d.children ? buildTree(d.children) : []
    }));
  }

  // Build sub-items for breakdown categories dynamically
  function getSubItems(node) {
    if (!node.bdKey) return [];
    const src = bdSources[node.bdKey] || {};
    return Object.entries(src)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([name], i) => ({
        id: `${node.id}__${name}`,
        label: name.length > 32 ? name.substring(0, 32) + '…' : name,
        labelFull: name,
        key: null,
        bdKey: null,
        bdParent: node.bdKey,
        bdName: name,
        color: LINE_PALETTE[(i + 4) % LINE_PALETTE.length],
        children: []
      }));
  }

  // Toggle open/close of a node
  const toggleOpen = (node) => {
    const subs = node.children && node.children.length ? node.children : (node.bdKey ? getSubItems(node) : []);
    if (subs.length === 0) return;

    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(node.id)) {
        const removeIds = new Set();
        const collect = (n) => { 
          removeIds.add(n.id); 
          (n.children || []).forEach(collect); 
          getSubItems(n).forEach(collect); 
        };
        collect(node);
        removeIds.forEach(id => next.delete(id));
      } else {
        next.add(node.id);
      }
      return next;
    });
  };

  // Toggle a line active/inactive
  const toggleLine = (id) => {
    setActiveLines(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all or clear
  const selectAll = (nodeList) => {
    setActiveLines(new Set(nodeList.map(n => n.id)));
  };
  const clearAll = () => {
    setActiveLines(new Set());
  };

  // Collect all visible flat nodes
  const tree = buildTree(HIERARCHY_DEF);
  const buildVisible = (nodes, level = 0) => {
    const result = [];
    nodes.forEach(node => {
      const subs = node.children && node.children.length ? node.children : (node.bdKey ? getSubItems(node) : []);
      const hasChildren = subs.length > 0;
      result.push({ ...node, level, hasChildren, _subItems: subs });
      if (openIds.has(node.id)) {
        result.push(...buildVisible(subs, level + 1));
      }
    });
    return result;
  };
  const visibleNodes = buildVisible(tree);

  // Build chart series
  const lineColorMap = {};
  visibleNodes.forEach((n, i) => { lineColorMap[n.id] = n.color || LINE_PALETTE[i % LINE_PALETTE.length]; });

  const chartSeries = [...activeLines].map(id => {
    const node = visibleNodes.find(n => n.id === id);
    if (!node) return null;
    return { id, label: node.label, labelFull: node.labelFull || node.label, color: lineColorMap[id] || '#888', node };
  }).filter(Boolean);

  // Calculate value for a single node in a month record
  const getNodeValueInMonth = (node, monthRecord, isUnitario = false) => {
    let val = 0;
    if (node.key) {
      val = monthRecord[node.key] || 0;
    } else if (node.bdParent && node.bdName) {
      const bd = monthRecord[node.bdParent] || {};
      val = bd[node.bdName] || 0;
    }
    if (isUnitario) {
      const prod = monthRecord.totalProd || 0;
      return prod > 0 ? (val / prod) : 0;
    }
    return val;
  };

  // Build chart data points with dynamic sum curve
  const enrichedData = chartData.map(d => {
    const point = { name: d.name, totalProd: d.totalProd || 0 };
    let sumGastoThisMonth = 0;
    let sumUnitarioThisMonth = 0;

    chartSeries.forEach(s => {
      const rawGasto = getNodeValueInMonth(s.node, d, false);
      const rawUnitario = getNodeValueInMonth(s.node, d, true);

      point[`${s.id}_gasto`] = rawGasto;
      point[`${s.id}_unitario`] = rawUnitario;
      point[s.id] = metricMode === 'unitario' ? rawUnitario : rawGasto;

      sumGastoThisMonth += rawGasto;
      sumUnitarioThisMonth += rawUnitario;
    });

    point.__combined_sum__ = metricMode === 'unitario' ? sumUnitarioThisMonth : sumGastoThisMonth;
    point.__combined_gasto__ = sumGastoThisMonth;
    point.__combined_unitario__ = sumUnitarioThisMonth;

    return point;
  });

  // Calculate Global Summary Stats for Active Selection
  const totalProductionOverall = chartData.reduce((acc, d) => acc + (d.totalProd || 0), 0);
  
  let totalSelectedGasto = 0;
  chartSeries.forEach(s => {
    chartData.forEach(d => {
      totalSelectedGasto += getNodeValueInMonth(s.node, d, false);
    });
  });

  const avgMonthlyGasto = chartData.length > 0 ? (totalSelectedGasto / chartData.length) : 0;
  const overallUnitCost = totalProductionOverall > 0 ? (totalSelectedGasto / totalProductionOverall) : 0;
  
  const peakMonthlyValue = enrichedData.reduce((max, pt) => {
    const val = showCombinedSum && chartSeries.length > 1 ? pt.__combined_sum__ : (chartSeries.length === 1 ? pt[chartSeries[0].id] : pt.__combined_sum__);
    return Math.max(max, val || 0);
  }, 0);

  const totalForNode = (node) => {
    if (node.key) return chartData.reduce((a, d) => a + (d[node.key] || 0), 0);
    if (node.bdParent && node.bdName) {
      return chartData.reduce((a, d) => {
        const bd = d[node.bdParent] || {};
        return a + (bd[node.bdName] || 0);
      }, 0);
    }
    return 0;
  };

  return (
    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px -2px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '1.5rem' }}>
      
      {/* HEADER WITH CONTROLS */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
              Explorador Multivariable de Costos y Tendencias
            </h3>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', fontWeight: 700, border: '1px solid #a7f3d0' }}>
              Interactiva Multi-Selección
            </span>
          </div>
          <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
            Seleccione casillas (checkboxes) para cruzar y sumar ítems simultáneamente (ej: Medicamentos + Equipos Menores + Horas Extras).
          </p>
        </div>

        {/* CONTROLS (Gasto vs Costo Unitario & Curva Sumatoria) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Switch Mode */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <button
              onClick={() => setMetricMode('gasto')}
              style={{
                border: 'none',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: metricMode === 'gasto' ? 'white' : 'transparent',
                color: metricMode === 'gasto' ? '#0f172a' : '#64748b',
                boxShadow: metricMode === 'gasto' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              $ Gasto Total
            </button>
            <button
              onClick={() => setMetricMode('unitario')}
              style={{
                border: 'none',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: metricMode === 'unitario' ? 'white' : 'transparent',
                color: metricMode === 'unitario' ? '#0f172a' : '#64748b',
                boxShadow: metricMode === 'unitario' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              $ Costo Unitario
            </button>
          </div>

          {/* Toggle Combined Curve */}
          {chartSeries.length > 1 && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#334155', cursor: 'pointer', background: '#f8fafc', padding: '5px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <input
                type="checkbox"
                checked={showCombinedSum}
                onChange={(e) => setShowCombinedSum(e.target.checked)}
                style={{ accentColor: '#4338ca', cursor: 'pointer' }}
              />
              Ver Curva Sumatoria Total
            </label>
          )}
        </div>
      </div>

      {/* KPI METRIC CARDS FOR ACTIVE SELECTION */}
      {chartSeries.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', padding: '1rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
          
          <div style={{ background: 'white', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              {chartSeries.length > 1 ? `Gasto Sumado (${chartSeries.length} Ítems)` : 'Gasto Total Ítem'}
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '3px' }}>
              {fmtCLP(totalSelectedGasto)}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
              Acumulado en el periodo seleccionado
            </span>
          </div>

          <div style={{ background: 'white', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Costo Unitario Promedio
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7', marginTop: '3px' }}>
              {fmtCLP(overallUnitCost)}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
              Gasto sumado / {totalProductionOverall.toLocaleString('es-CL')} producciones
            </span>
          </div>

          <div style={{ background: 'white', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Promedio Mensual
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a', marginTop: '3px' }}>
              {fmtCLP(avgMonthlyGasto)}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
              Gasto mensual ponderado
            </span>
          </div>

          <div style={{ background: 'white', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Pico Máximo Mensual
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706', marginTop: '3px' }}>
              {metricMode === 'unitario' ? fmtCLP(peakMonthlyValue) : fmtCLP(peakMonthlyValue)}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
              Mes de mayor concentración
            </span>
          </div>

        </div>
      )}

      {/* MAIN BODY: TREE ON LEFT, CHART ON RIGHT */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', minHeight: '460px' }}>

        {/* LEFT: Hierarchy tree with multi-select checkboxes */}
        <div style={{ borderRight: '1px solid #f1f5f9', padding: '0.75rem 0', overflowY: 'auto', maxHeight: '560px', background: '#fafbfc' }}>
          
          <div style={{ padding: '0 1rem 0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
              CONCEPTOS & DESGLOSES
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={clearAll}
                style={{ border: 'none', background: 'transparent', color: '#64748b', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
              >
                Desmarcar todo
              </button>
            </div>
          </div>

          {visibleNodes.map(node => {
            const isChecked = activeLines.has(node.id);
            const isOpen = openIds.has(node.id);
            const total = totalForNode(node);
            const unitCost = totalProductionOverall > 0 ? (total / totalProductionOverall) : 0;

            return (
              <div
                key={node.id}
                style={{
                  paddingLeft: `${10 + node.level * 16}px`,
                  paddingRight: '12px',
                  paddingTop: '6px',
                  paddingBottom: '6px',
                  background: isChecked ? `${(node.color || '#888')}14` : 'transparent',
                  borderLeft: isChecked ? `3px solid ${node.color || '#888'}` : '3px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {/* Expand toggle */}
                  <span
                    onClick={(e) => { e.stopPropagation(); toggleOpen(node); }}
                    style={{
                      fontSize: '0.65rem',
                      color: node.hasChildren ? '#64748b' : 'transparent',
                      cursor: node.hasChildren ? 'pointer' : 'default',
                      minWidth: '14px',
                      userSelect: 'none',
                      transition: 'transform 0.2s',
                      display: 'inline-block',
                      transform: isOpen ? 'rotate(90deg)' : 'none'
                    }}
                  >
                    ▶
                  </span>

                  {/* Checkbox for Multi-selection */}
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleLine(node.id)}
                    style={{
                      cursor: 'pointer',
                      accentColor: node.color || '#0ea5e9',
                      width: '14px',
                      height: '14px',
                      flexShrink: 0
                    }}
                  />

                  {/* Color pill + label + quick stats */}
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, cursor: 'pointer' }}
                    onClick={() => toggleLine(node.id)}
                  >
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.76rem', fontWeight: isChecked ? 700 : 500, color: isChecked ? '#0f172a' : '#475569', lineHeight: 1.2, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} title={node.labelFull || node.label}>
                        {node.label}
                      </div>
                      {total > 0 && (
                        <div style={{ fontSize: '0.66rem', color: '#94a3b8', marginTop: '1px', display: 'flex', gap: '8px' }}>
                          <span>{fmtM(total)}</span>
                          {unitCost > 0 && <span style={{ color: '#0284c7' }}>CU: {fmtM(unitCost)}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT: Line chart */}
        <div style={{ padding: '1.25rem 1.25rem 1rem', display: 'flex', flexDirection: 'column' }}>
          
          {enrichedData.length > 0 && (chartSeries.length > 0) ? (
            <div style={{ flex: 1, minHeight: '440px' }}>
              <ResponsiveContainer width="100%" height={440}>
                <ComposedChart data={enrichedData} margin={{ top: 32, right: 30, left: 15, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis 
                    tickFormatter={fmtM} 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    width={76} 
                    label={{ value: metricMode === 'unitario' ? 'Costo Unitario ($ / prod)' : 'Gasto Total ($)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10, dy: 60 }}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === '__combined_sum__') {
                        return [fmtCLP(value), `SUMA COMBINADA (${chartSeries.length} ÍTEMS)`];
                      }
                      const s = chartSeries.find(item => item.id === name);
                      return [fmtCLP(value), s ? (s.labelFull || s.label) : name];
                    }}
                    contentStyle={{ fontSize: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}
                  />
                  <Legend 
                    formatter={(value) => {
                      if (value === '__combined_sum__') return `SUMA COMBINADA SELECCIONADA`;
                      const s = chartSeries.find(item => item.id === value);
                      return s ? (s.labelFull || s.label) : value;
                    }} 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
                  />

                  {/* Individual Lines for each selected node */}
                  {chartSeries.map((s) => (
                    <Line
                      key={s.id}
                      type="monotone"
                      dataKey={s.id}
                      name={s.id}
                      stroke={s.color}
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: s.color }}
                      activeDot={{ r: 6 }}
                      connectNulls
                      animationDuration={400}
                    >
                      <LabelList
                        dataKey={s.id}
                        position="top"
                        offset={8}
                        formatter={(v) => {
                          if (!v || v === 0) return '';
                          if (Math.abs(v) >= 1e9) return `$${(v/1e9).toFixed(1).replace('.', ',')}B`;
                          if (Math.abs(v) >= 1e6) return `$${(v/1e6).toFixed(1).replace('.', ',')}M`;
                          return `$${Math.round(v).toLocaleString('es-CL')}`;
                        }}
                        style={{ fontSize: '9px', fill: s.color, fontWeight: 700, opacity: 0.85 }}
                      />
                    </Line>
                  ))}

                  {/* Combined Sum Curve (Strong highlighted line when > 1 item) */}
                  {chartSeries.length > 1 && showCombinedSum && (
                    <Line
                      key="__combined_sum__"
                      type="monotone"
                      dataKey="__combined_sum__"
                      name="__combined_sum__"
                      stroke="#4338ca"
                      strokeWidth={4}
                      strokeDasharray="4 2"
                      dot={{ r: 5, fill: '#4338ca', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 8 }}
                      connectNulls
                      animationDuration={400}
                    >
                      <LabelList
                        dataKey="__combined_sum__"
                        position="top"
                        offset={10}
                        formatter={(v) => {
                          if (!v || v === 0) return '';
                          if (Math.abs(v) >= 1e9) return `Σ $${(v/1e9).toFixed(1).replace('.', ',')}B`;
                          if (Math.abs(v) >= 1e6) return `Σ $${(v/1e6).toFixed(1).replace('.', ',')}M`;
                          return `Σ $${Math.round(v).toLocaleString('es-CL')}`;
                        }}
                        style={{ fontSize: '10px', fill: '#4338ca', fontWeight: 800 }}
                      />
                    </Line>
                  )}

                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', color: '#94a3b8', gap: '8px' }}>
              <Activity size={32} color="#cbd5e1" />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Seleccione uno o más casilleros a la izquierda</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Puede combinar múltiples ítems de Insumos, RRHH y Gastos Generales.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function SigcomDashboard({ onBack }) {
  const groupings = useMemo(() => sigcomJson.groupings || {}, []);
  const bands = useMemo(() => sigcomJson.bands || {}, []);
  const rawData = useMemo(() => sigcomJson.data || [], []);

  // Analysis Modes: 'agrupacion' (default) or 'personalizado'
  const [analysisMode, setAnalysisMode] = useState('agrupacion');
  
  // Group selection state - CMA default
  const [selectedAgrupacion, setSelectedAgrupacion] = useState('Cirugía Mayor Ambulatoria');
  
  // Custom selection states
  const [selectedCCs, setSelectedCCs] = useState([]);
  const [selectedBanda, setSelectedBanda] = useState({ value: 'auto', label: 'Cálculo Automático' });
  
  // Date range states
  const [startMonth, setStartMonth] = useState('2025-01');
  const [endMonth, setEndMonth] = useState('2026-12');

  // Selected Cost Type filter: 'directos' (default), 'indirectos', 'rrhh', 'insumos', 'gg'
  const [selectedCostType, setSelectedCostType] = useState('directos');

  const costTypeOptions = useMemo(() => [
    { value: 'directos', label: 'Gasto Directo' },
    { value: 'indirectos', label: 'Gasto Indirecto' },
    { value: 'rrhh', label: 'Personal (RRHH)' },
    { value: 'insumos', label: 'Insumos Médicos' },
    { value: 'gg', label: 'Gastos Generales (GG)' }
  ], []);
  
  // UI Panels states
  const [activeTab, setActiveTab] = useState('eficiencia'); // 'categorias' or 'eficiencia'
  const [expandedRows, setExpandedRows] = useState({});
  const [activeChartNode, setActiveChartNode] = useState(null); // { type, data, label }
  
  // List of all CC options for custom selection
  const allCCs = useMemo(() => {
    const centers = new Set();
    rawData.forEach(d => {
      if (d.costCenter) centers.add(d.costCenter);
    });
    return Array.from(centers).sort().map(cc => ({ value: cc, label: cc }));
  }, [rawData]);

  // Options for custom bands selector
  const customBandOptions = useMemo(() => {
    const list = [{ value: 'auto', label: 'Cálculo Automático' }];
    Object.keys(bands).forEach(k => {
      list.push({ value: k, label: `Banda: ${k}` });
    });
    return list;
  }, [bands]);

  // Initialize selected CCs when switching to personalizado
  useEffect(() => {
    if (analysisMode === 'personalizado' && selectedCCs.length === 0) {
      // Pre-populate with CCs from the current active group
      const groupItems = groupings[selectedAgrupacion] || [];
      const groupCCs = groupItems
        .map(item => allCCs.find(cc => cc.value.toUpperCase() === item.cleanName.toUpperCase()))
        .filter(Boolean);
      
      if (groupCCs.length > 0) {
        setSelectedCCs(groupCCs);
      } else if (allCCs.length > 0) {
        setSelectedCCs([allCCs[0]]);
      }
    }
  }, [analysisMode, selectedAgrupacion, groupings, allCCs]);

  // Clean names helper for comparison
  const cleanName = (name) => {
    return String(name)
      .replace(/^\d+\s*/, '')
      .replace(/\s*\(.*?\)/g, '')
      .trim()
      .toUpperCase();
  };

  // Determine band status for a cost center
  const getCCStatus = (ccName, directUnitCost, prod) => {
    if (!prod || prod === 0) return { text: 'Sin Producción', color: '#94a3b8', bg: '#f1f5f9' };
    
    // Find CC's group
    let groupName = null;
    Object.entries(groupings).forEach(([gName, items]) => {
      const match = items.find(item => cleanName(item.cleanName) === cleanName(ccName));
      if (match) groupName = gName;
    });
    
    if (!groupName) return { text: 'Sin Agrupación', color: '#64748b', bg: '#f1f5f9' };

    // Bands are only represented for direct costs of 7 specific groups
    const allowedGroupsForBands = [
      "Hospitalización", "UCI", "UTI", "Quirófanos No Ambulatorios", 
      "Emergencia", "Consulta de Especialidad", "Cirugía Mayor Ambulatoria"
    ];
    if (!allowedGroupsForBands.includes(groupName)) {
      return { text: 'Sin Banda Ref.', color: '#64748b', bg: '#f1f5f9', groupName };
    }
    
    const bandKey = GROUP_TO_BAND_MAP[groupName];
    const band = bandKey ? bands[bandKey] : null;
    
    if (!band) return { text: 'Sin Banda Ref.', color: '#64748b', bg: '#f1f5f9', groupName };
    
    if (directUnitCost <= band.limiteInferior) {
      return { text: 'Bajo Límite Inf.', color: '#0ea5e9', bg: '#e0f2fe', groupName, band };
    } else if (directUnitCost <= band.marcaInferior) {
      return { text: 'Eficiente Bajo', color: '#059669', bg: '#d1fae5', groupName, band };
    } else if (directUnitCost <= band.marcaSuperior) {
      return { text: 'Eficiente', color: '#16a34a', bg: '#dcfce7', groupName, band };
    } else if (directUnitCost <= band.limiteSuperior) {
      return { text: 'Sobre Marca', color: '#d97706', bg: '#fef3c7', groupName, band };
    } else {
      return { text: 'Excedido (Crítico)', color: '#dc2626', bg: '#fee2e2', groupName, band };
    }
  };

  const formatCLP = (val) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);
  const formatCompact = (val) => new Intl.NumberFormat('es-CL', { notation: 'compact', maximumFractionDigits: 1 }).format(val);

  // Core Data calculations
  const { chartData, kpis, insights, tableData, activeBandaObj, globalInsumosBreakdown, globalRrhhBreakdown, globalGgBreakdown, ccStatusList, activeBandName } = useMemo(() => {
    // 1. Determine active cost centers
    let activeCCNames = [];
    if (analysisMode === 'agrupacion') {
      const groupItems = groupings[selectedAgrupacion] || [];
      activeCCNames = groupItems.map(item => item.cleanName.toUpperCase());
    } else {
      activeCCNames = selectedCCs.map(cc => cc.value.toUpperCase());
    }

    // 2. Filter raw data
    const filtered = rawData.filter(d => {
      const dTime = `${d.year}-${String(d.month).padStart(2, '0')}`;
      return activeCCNames.includes(d.costCenter.toUpperCase()) && dTime >= startMonth && dTime <= endMonth;
    });

    const monthlyMap = {};
    let totalCost = 0, totalRRHH = 0, totalGG = 0, totalInsumos = 0, totalProd = 0, totalDirectos = 0, totalIndirectos = 0;
    
    const ccMap = {};
    const globalInsumosBreakdown = {};
    const globalRrhhBreakdown = {};
    const globalGgBreakdown = {};

    const mergeBreakdown = (target, src) => {
      if (!src) return;
      Object.entries(src).forEach(([k, v]) => { target[k] = (target[k] || 0) + v; });
    };

    filtered.forEach(item => {
      // Monthly aggregation
      const timeKey = `${item.year}-${item.month}`;
      if (!monthlyMap[timeKey]) {
        monthlyMap[timeKey] = {
          timeKey, year: item.year, month: item.month, name: `${monthsNames[item.month - 1]} ${item.year.toString().slice(2)}`,
          insumos: 0, rrhh: 0, gg: 0, directos: 0, indirectos: 0, totalCost: 0, totalProd: 0,
          insumosBreakdown: {}, rrhhBreakdown: {}, ggBreakdown: {}
        };
      }
      monthlyMap[timeKey].insumos += item.insumos || 0;
      monthlyMap[timeKey].rrhh += item.rrhh || 0;
      monthlyMap[timeKey].gg += item.gastosGenerales || 0;
      monthlyMap[timeKey].directos += item.directos || ((item.rrhh || 0) + (item.insumos || 0) + (item.gastosGenerales || 0));
      monthlyMap[timeKey].indirectos += item.indirectos || 0;
      monthlyMap[timeKey].totalCost += item.total || 0;
      monthlyMap[timeKey].totalProd += item.productionTotal || 0;
      mergeBreakdown(monthlyMap[timeKey].insumosBreakdown, item.insumosBreakdown);
      mergeBreakdown(monthlyMap[timeKey].rrhhBreakdown, item.rrhhBreakdown);
      mergeBreakdown(monthlyMap[timeKey].ggBreakdown, item.ggBreakdown);

      // Globals
      totalInsumos += item.insumos || 0;
      totalRRHH += item.rrhh || 0;
      totalGG += item.gastosGenerales || 0;
      totalDirectos += item.directos || ((item.rrhh || 0) + (item.insumos || 0) + (item.gastosGenerales || 0));
      totalIndirectos += item.indirectos || 0;
      totalCost += item.total || 0;
      totalProd += item.productionTotal || 0;
      mergeBreakdown(globalInsumosBreakdown, item.insumosBreakdown);
      mergeBreakdown(globalRrhhBreakdown, item.rrhhBreakdown);
      mergeBreakdown(globalGgBreakdown, item.ggBreakdown);

      // CC Aggregation
      if (!ccMap[item.costCenter]) {
        ccMap[item.costCenter] = {
          id: item.costCenter, label: item.costCenter, type: 'cc',
          total: 0, rrhh: 0, gg: 0, insumos: 0, directos: 0, indirectos: 0, prod: 0,
          insumosBreakdown: {}, rrhhBreakdown: {}, ggBreakdown: {}
        };
      }
      ccMap[item.costCenter].total += item.total || 0;
      ccMap[item.costCenter].rrhh += item.rrhh || 0;
      ccMap[item.costCenter].gg += item.gastosGenerales || 0;
      ccMap[item.costCenter].insumos += item.insumos || 0;
      ccMap[item.costCenter].directos += item.directos || ((item.rrhh || 0) + (item.insumos || 0) + (item.gastosGenerales || 0));
      ccMap[item.costCenter].indirectos += item.indirectos || 0;
      ccMap[item.costCenter].prod += item.productionTotal || 0;
      mergeBreakdown(ccMap[item.costCenter].insumosBreakdown, item.insumosBreakdown);
      mergeBreakdown(ccMap[item.costCenter].rrhhBreakdown, item.rrhhBreakdown);
      mergeBreakdown(ccMap[item.costCenter].ggBreakdown, item.ggBreakdown);
    });

    const cData = Object.values(monthlyMap).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    const avgCostoUnitario = totalProd > 0 ? totalDirectos / totalProd : 0;
    const promNacionalAuto = avgCostoUnitario > 0 ? avgCostoUnitario : 150000;
    
    // Resolve active band key
    let activeBandKey = null;
    if (analysisMode === 'agrupacion') {
      activeBandKey = GROUP_TO_BAND_MAP[selectedAgrupacion] || null;
    } else {
      if (selectedBanda && selectedBanda.value !== 'auto') {
        activeBandKey = selectedBanda.value;
      } else {
        // Auto detect based on custom selection names
        const labels = selectedCCs.map(cc => cc.label.toLowerCase());
        if (labels.some(l => l.includes('ambulat'))) activeBandKey = 'Cirugia Mayor Ambulatoria';
        else if (labels.some(l => l.includes('urgencia') || l.includes('emergencia'))) activeBandKey = 'Emergencias';
        else if (labels.some(l => l.includes('uti'))) activeBandKey = 'UTI';
        else if (labels.some(l => l.includes('uci'))) activeBandKey = 'UCI';
        else if (labels.some(l => l.includes('hospitalizaci'))) activeBandKey = 'Hospitalizacion';
        else if (labels.some(l => l.includes('consulta') || l.includes('especialidad'))) activeBandKey = 'Consultas Especialidad';
        else if (labels.some(l => l.includes('iq') || l.includes('quirófano') || l.includes('quirofano'))) activeBandKey = 'Quirofano no Ambulatorios';
      }
    }

    const bandasObj = activeBandKey ? bands[activeBandKey] : null;

    // Apply bands values to chart (costoUnitario is relative to selectedCostType)
    cData.forEach(d => {
      let costValue = 0;
      if (selectedCostType === 'directos') costValue = d.directos;
      else if (selectedCostType === 'indirectos') costValue = d.indirectos;
      else if (selectedCostType === 'rrhh') costValue = d.rrhh;
      else if (selectedCostType === 'insumos') costValue = d.insumos;
      else if (selectedCostType === 'gg') costValue = d.gg;

      d.costoUnitario = d.totalProd > 0 ? (costValue / d.totalProd) : 0;
      
      if (selectedCostType === 'directos' && bandasObj) {
        d.promedio = bandasObj.promedio;
        d.marcaSuperior = bandasObj.marcaSuperior;
        d.limiteSuperior = bandasObj.limiteSuperior;
        d.marcaInferior = bandasObj.marcaInferior;
        d.limiteInferior = bandasObj.limiteInferior;
      } else {
        d.promedio = undefined;
        d.marcaSuperior = undefined;
        d.limiteSuperior = undefined;
        d.marcaInferior = undefined;
        d.limiteInferior = undefined;
      }
    });

    let selectedTotalCost = 0;
    if (selectedCostType === 'directos') selectedTotalCost = totalDirectos;
    else if (selectedCostType === 'indirectos') selectedTotalCost = totalIndirectos;
    else if (selectedCostType === 'rrhh') selectedTotalCost = totalRRHH;
    else if (selectedCostType === 'insumos') selectedTotalCost = totalInsumos;
    else if (selectedCostType === 'gg') selectedTotalCost = totalGG;

    const selectedUnitCost = totalProd > 0 ? selectedTotalCost / totalProd : 0;

    const kpisObj = { 
      totalCost, totalRRHH, totalGG, totalInsumos, totalProd, 
      unitCost: avgCostoUnitario, totalDirectos, totalIndirectos,
      selectedTotalCost, selectedUnitCost 
    };
    const activePromedio = bandasObj ? bandasObj.promedio : promNacionalAuto;

    // Generate insights
    const genInsights = [];
    if (avgCostoUnitario > activePromedio * 1.1) {
      const pct = (((avgCostoUnitario - activePromedio) / activePromedio) * 100).toFixed(0);
      genInsights.push({ type: 'warning', text: `Costo directo unitario (${formatCLP(avgCostoUnitario)}) supera la referencia estándar en ${pct}%.`});
    } else if (avgCostoUnitario > 0) {
      genInsights.push({ type: 'success', text: `Eficiencia dentro del margen de referencia. Costo unitario directo: ${formatCLP(avgCostoUnitario)}.`});
    } else {
      genInsights.push({ type: 'info', text: 'Seleccione un rango con datos activos para calcular eficiencia.' });
    }
    
    if (totalInsumos > totalRRHH) {
      genInsights.push({ type: 'info', text: 'El mayor peso del gasto directo se concentra en Insumos.'});
    } else if (totalRRHH > 0) {
      genInsights.push({ type: 'info', text: 'El mayor peso del gasto directo se concentra en Personal (RRHH).'});
    }

    const tData = Object.values(ccMap).sort((a, b) => b.total - a.total);

    // Calculate individual CC status lists based on direct unit cost
    const ccStatusList = tData.map(item => {
      const unitCost = item.prod > 0 ? item.directos / item.prod : 0;
      const statusInfo = getCCStatus(item.label, unitCost, item.prod);
      return {
        ...item,
        unitCost,
        status: statusInfo
      };
    });

    return { 
      chartData: cData, 
      kpis: kpisObj, 
      insights: genInsights, 
      tableData: tData, 
      activeBandaObj: selectedCostType === 'directos' ? bandasObj : null, 
      globalInsumosBreakdown, globalRrhhBreakdown, globalGgBreakdown,
      ccStatusList,
      activeBandName: selectedCostType === 'directos' ? (activeBandKey || 'Cálculo Automático') : 'No aplicable (solo costo directo)'
    };
  }, [rawData, analysisMode, selectedAgrupacion, selectedCCs, startMonth, endMonth, selectedBanda, groupings, bands, selectedCostType]);

  // Prior Period Calculation for Insights
  const priorPeriodData = useMemo(() => {
    let activeCCNames = [];
    if (analysisMode === 'agrupacion') {
      const groupItems = groupings[selectedAgrupacion] || [];
      activeCCNames = groupItems.map(item => item.cleanName.toUpperCase());
    } else {
      activeCCNames = selectedCCs.map(cc => cc.value.toUpperCase());
    }

    const startParts = startMonth.split('-');
    const endParts = endMonth.split('-');
    if (startParts.length !== 2 || endParts.length !== 2) return null;
    
    const startYear = parseInt(startParts[0], 10);
    const startMonthNum = parseInt(startParts[1], 10);
    const endYear = parseInt(endParts[0], 10);
    const endMonthNum = parseInt(endParts[1], 10);

    const priorStartMonth = `${startYear - 1}-${String(startMonthNum).padStart(2, '0')}`;
    const priorEndMonth = `${endYear - 1}-${String(endMonthNum).padStart(2, '0')}`;

    const filteredPrior = rawData.filter(d => {
      const dTime = `${d.year}-${String(d.month).padStart(2, '0')}`;
      return activeCCNames.includes(d.costCenter.toUpperCase()) && dTime >= priorStartMonth && dTime <= priorEndMonth;
    });

    let totalCost = 0, totalRRHH = 0, totalGG = 0, totalInsumos = 0, totalProd = 0, totalDirectos = 0, totalIndirectos = 0;
    
    filteredPrior.forEach(item => {
      totalInsumos += item.insumos || 0;
      totalRRHH += item.rrhh || 0;
      totalGG += item.gastosGenerales || 0;
      totalDirectos += item.directos || ((item.rrhh || 0) + (item.insumos || 0) + (item.gastosGenerales || 0));
      totalIndirectos += item.indirectos || 0;
      totalCost += item.total || 0;
      totalProd += item.productionTotal || 0;
    });

    const unitCost = totalProd > 0 ? (totalDirectos / totalProd) : 0;

    let selectedTotalCostPrior = 0;
    if (selectedCostType === 'directos') selectedTotalCostPrior = totalDirectos;
    else if (selectedCostType === 'indirectos') selectedTotalCostPrior = totalIndirectos;
    else if (selectedCostType === 'rrhh') selectedTotalCostPrior = totalRRHH;
    else if (selectedCostType === 'insumos') selectedTotalCostPrior = totalInsumos;
    else if (selectedCostType === 'gg') selectedTotalCostPrior = totalGG;

    const selectedUnitCost = totalProd > 0 ? (selectedTotalCostPrior / totalProd) : 0;

    return {
      totalCost, totalRRHH, totalGG, totalInsumos, totalDirectos, totalIndirectos, totalProd, unitCost,
      selectedTotalCost: selectedTotalCostPrior, selectedUnitCost,
      periodLabel: `${monthsNames[startMonthNum - 1]} ${String(startYear - 1).slice(2)} - ${monthsNames[endMonthNum - 1]} ${String(endYear - 1).slice(2)}`
    };
  }, [rawData, analysisMode, selectedAgrupacion, selectedCCs, startMonth, endMonth, groupings, selectedCostType]);

  // Set default active node (Global view) whenever selection updates
  useEffect(() => {
    if (tableData.length > 0) {
      setActiveChartNode({ type: 'global', data: kpis, label: 'Visión Global (Grupo/Selección)' });
    } else {
      setActiveChartNode(null);
    }
    setExpandedRows({});
  }, [tableData]);

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRowClick = (nodeType, data, label) => {
    setActiveChartNode({ type: nodeType, data, label });
  };

  // Resolve current data to prevent stale charts
  const dynamicData = useMemo(() => {
    if (!activeChartNode) return { inner: [], outer: [] };
    
    let data = activeChartNode.data;
    let nodeType = activeChartNode.type;

    if (nodeType === 'global') {
      data = kpis;
    } else if (nodeType === 'insumos') {
      data = globalInsumosBreakdown;
    } else if (nodeType === 'cc') {
      const currentCC = tableData.find(item => item.label === activeChartNode.label);
      if (currentCC) {
        data = currentCC;
      }
    }

    if (nodeType === 'global' || nodeType === 'cc') {
      const rrhh = data.rrhh || data.totalRRHH || 0;
      const insumos = data.insumos || data.totalInsumos || 0;
      const gg = data.gg || data.totalGG || data.gastosGenerales || 0;
      const directos = data.directos || data.totalDirectos || (rrhh + insumos + gg);
      const indirectos = data.indirectos || data.totalIndirectos || 0;

      const inner = [
        { name: 'Gasto Directo', value: directos, fill: '#0ea5e9' },
        { name: 'Gasto Indirecto', value: indirectos, fill: '#a855f7' }
      ].filter(d => d.value > 0);

      const outer = [
        { name: 'RRHH', value: rrhh, fill: '#00c4cc' },
        { name: 'Insumos', value: insumos, fill: '#ff9f00' },
        { name: 'Gastos Generales', value: gg, fill: '#e63956' },
        { name: 'Costos Indirectos', value: indirectos, fill: '#c084fc' }
      ].filter(d => d.value > 0);

      return { inner, outer };
    }
    
    if (nodeType === 'insumos') {
      const total = Object.values(data).reduce((a, b) => a + b, 0);
      const inner = [{ name: 'Insumos', value: total, fill: '#10b981' }];
      
      const outer = Object.entries(data)
        .map(([name, value], i) => ({ name: name.substring(0, 25), value, fill: COLORS[i % COLORS.length] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 12);
      return { inner, outer };
    }
    return { inner: [], outer: [] };
  }, [activeChartNode, kpis, globalInsumosBreakdown, tableData]);

  // Variables for dynamic left panel display
  const activeLabel = activeChartNode?.label || 'Visión Global';
  const isGlobalActive = activeChartNode?.type === 'global';
  const isCCActive = activeChartNode?.type === 'cc';

  const activeRRHH = isGlobalActive ? kpis.totalRRHH : (activeChartNode?.data?.rrhh || 0);
  const activeGG = isGlobalActive ? kpis.totalGG : (activeChartNode?.data?.gg || activeChartNode?.data?.gastosGenerales || 0);
  const activeInsumos = isGlobalActive ? kpis.totalInsumos : (activeChartNode?.data?.insumos || 0);
  const activeDirectos = isGlobalActive ? kpis.totalDirectos : (activeChartNode?.data?.directos || 0);
  const activeIndirectos = isGlobalActive ? kpis.totalIndirectos : (activeChartNode?.data?.indirectos || 0);
  const activeTotal = isGlobalActive ? kpis.totalCost : (activeChartNode?.data?.total || 0);
  const activeInsumosBreakdown = isGlobalActive ? globalInsumosBreakdown : (activeChartNode?.data?.insumosBreakdown || {});
  const costUnitarioLabelMap = {
    directos: 'Costo Unit. Directo Real',
    indirectos: 'Costo Unit. Indirecto Real',
    rrhh: 'Costo Unit. Personal (RRHH) Real',
    insumos: 'Costo Unit. Insumos Real',
    gg: 'Costo Unit. Gastos Gen. (GG) Real'
  };
  const activeCostUnitarioLabel = costUnitarioLabelMap[selectedCostType] || 'Costo Unitario Real';

  const getColStyle = (colType, isHeader = false, isRowSelected = false) => {
    const isSelected = selectedCostType === colType;
    if (isSelected) {
      return {
        background: isRowSelected ? '#bae6fd' : (isHeader ? '#dbeafe' : '#eff6ff'),
        boxShadow: 'inset 0 0 0 1px #3b82f6',
        fontWeight: isHeader ? 800 : 700
      };
    }
    if (colType === 'directos') {
      return { background: isRowSelected ? 'rgba(22,163,74,0.1)' : '#f0fdf4' };
    }
    if (colType === 'indirectos') {
      return { background: isRowSelected ? 'rgba(124,58,237,0.1)' : '#faf5ff' };
    }
    return isRowSelected ? { background: '#e0f2fe' } : {};
  };

  return (
    <div className="sigcom-dashboard" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
      
      {/* Compact Header */}
      <div style={{ padding: '1.2rem 2.5rem', background: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {onBack && (
              <button onClick={onBack} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronLeft size={20} color="#0f172a" />
              </button>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 850, margin: 0, color: '#0f172a', letterSpacing: '-0.5px' }}>SIGCOM Costeo & Bandas</h1>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', background: '#e0f2fe', color: '#0369a1', borderRadius: '20px' }}>Cubo 9</span>
              </div>
              <p style={{ color: '#64748b', margin: '0.1rem 0 0 0', fontSize: '0.85rem', fontWeight: 500 }}>Control de Gestión Integrado Hospitalario</p>
            </div>
          </div>

          {/* Mode Segmented Control & Filters */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            
            {/* Segmented Control */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <button 
                onClick={() => { setAnalysisMode('agrupacion'); }}
                style={{ 
                  padding: '6px 12px', border: 'none', borderRadius: '7px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                  background: analysisMode === 'agrupacion' ? 'white' : 'transparent',
                  color: analysisMode === 'agrupacion' ? '#0f172a' : '#64748b',
                  boxShadow: analysisMode === 'agrupacion' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                Agrupación SIGCOM
              </button>
              <button 
                onClick={() => { setAnalysisMode('personalizado'); }}
                style={{ 
                  padding: '6px 12px', border: 'none', borderRadius: '7px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                  background: analysisMode === 'personalizado' ? 'white' : 'transparent',
                  color: analysisMode === 'personalizado' ? '#0f172a' : '#64748b',
                  boxShadow: analysisMode === 'personalizado' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                Personalizado
              </button>
            </div>

            {/* Dynamic Dropdowns based on Mode */}
            {analysisMode === 'agrupacion' ? (
              <div style={{ width: '220px' }}>
                <Select
                  options={Object.keys(groupings).map(g => ({ value: g, label: g }))}
                  value={{ value: selectedAgrupacion, label: selectedAgrupacion }}
                  onChange={(opt) => setSelectedAgrupacion(opt.value)}
                  placeholder="Seleccione Agrupación..."
                  styles={{ control: (base) => ({ ...base, borderRadius: '8px', minHeight: '38px', borderColor: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600 }) }}
                />
              </div>
            ) : (
              <>
                <div style={{ width: '220px' }}>
                  <Select
                    isMulti
                    options={allCCs}
                    value={selectedCCs}
                    onChange={setSelectedCCs}
                    placeholder="Seleccione CC..."
                    styles={{ control: (base) => ({ ...base, borderRadius: '8px', minHeight: '38px', borderColor: '#cbd5e1', fontSize: '0.85rem' }) }}
                  />
                </div>
                <div style={{ width: '180px' }}>
                  <Select
                    options={customBandOptions}
                    value={selectedBanda}
                    onChange={setSelectedBanda}
                    placeholder="Banda de Costos..."
                    styles={{ control: (base) => ({ ...base, borderRadius: '8px', minHeight: '38px', borderColor: '#cbd5e1', fontSize: '0.85rem' }) }}
                  />
                </div>
              </>
            )}

            {/* Expense Type Select Filter */}
            <div style={{ width: '190px' }}>
              <Select
                options={costTypeOptions}
                value={costTypeOptions.find(o => o.value === selectedCostType)}
                onChange={(opt) => setSelectedCostType(opt.value)}
                placeholder="Tipo de Gasto..."
                styles={{ control: (base) => ({ ...base, borderRadius: '8px', minHeight: '38px', borderColor: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600 }) }}
              />
            </div>

            {/* Date Picker inputs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input 
                type="month" 
                value={startMonth} 
                onChange={(e) => setStartMonth(e.target.value)} 
                style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }} 
              />
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>a</span>
              <input 
                type="month" 
                value={endMonth} 
                onChange={(e) => setEndMonth(e.target.value)} 
                style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }} 
              />
            </div>
            
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div style={{ padding: '1.5rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* KPI Cards & Insights & Band Details Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          
          {/* KPIs and Band Info Banner */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Band Info Banner */}
            <div style={{ 
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', borderRadius: '12px', padding: '12px 20px', 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Info size={16} color="#38bdf8" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  Referencia Minsal Activa: <strong style={{ color: '#38bdf8' }}>{activeBandName}</strong>
                </span>
              </div>
              {activeBandaObj ? (
                <div style={{ display: 'flex', gap: '15px', fontSize: '0.75rem', opacity: 0.9 }}>
                  <span>Min: <strong>{formatCLP(activeBandaObj.limiteInferior)}</strong></span>
                  <span>Promedio: <strong>{formatCLP(activeBandaObj.promedio)}</strong></span>
                  <span>Max: <strong>{formatCLP(activeBandaObj.limiteSuperior)}</strong></span>
                </div>
              ) : (
                <span style={{ fontSize: '0.75rem', opacity: 0.8, fontStyle: 'italic', color: '#94a3b8' }}>Banda de costos no aplicable a este grupo</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              {[
                { 
                  label: `Gasto ${selectedCostType === 'directos' ? 'Directo' : selectedCostType === 'indirectos' ? 'Indirecto' : selectedCostType === 'rrhh' ? 'Personal (RRHH)' : selectedCostType === 'insumos' ? 'Insumos' : 'Gastos Generales (GG)'} Selecc.`, 
                  val: formatCLP(isGlobalActive ? kpis.selectedTotalCost : (
                    selectedCostType === 'directos' ? (activeChartNode?.data?.directos || 0) :
                    selectedCostType === 'indirectos' ? (activeChartNode?.data?.indirectos || 0) :
                    selectedCostType === 'rrhh' ? (activeChartNode?.data?.rrhh || 0) :
                    selectedCostType === 'insumos' ? (activeChartNode?.data?.insumos || 0) :
                    selectedCostType === 'gg' ? (activeChartNode?.data?.gg || activeChartNode?.data?.gastosGenerales || 0) : 0
                  )), 
                  desc: `Costo Total CC: ${formatCompact(isGlobalActive ? kpis.totalCost : (activeChartNode?.data?.total || 0))}`, 
                  icon: DollarSign, 
                  color: '#8b5cf6' 
                },
                { 
                  label: 'Producción Total', 
                  val: (isGlobalActive ? kpis.totalProd : (activeChartNode?.data?.prod || activeChartNode?.data?.productionTotal || 0)).toLocaleString('es-CL'), 
                  desc: 'Unidades de producción total', 
                  icon: Activity, 
                  color: '#0ea5e9' 
                },
                { 
                  label: `Costo Unitario [${selectedCostType === 'directos' ? 'Directo' : selectedCostType === 'indirectos' ? 'Indirecto' : selectedCostType === 'rrhh' ? 'RRHH' : selectedCostType === 'insumos' ? 'Insumos' : 'GG'}]`, 
                  val: formatCLP(isGlobalActive ? kpis.selectedUnitCost : (
                    (activeChartNode?.data?.prod || activeChartNode?.data?.productionTotal || 0) > 0 ? (
                      (selectedCostType === 'directos' ? (activeChartNode?.data?.directos || 0) :
                       selectedCostType === 'indirectos' ? (activeChartNode?.data?.indirectos || 0) :
                       selectedCostType === 'rrhh' ? (activeChartNode?.data?.rrhh || 0) :
                       selectedCostType === 'insumos' ? (activeChartNode?.data?.insumos || 0) :
                       selectedCostType === 'gg' ? (activeChartNode?.data?.gg || activeChartNode?.data?.gastosGenerales || 0) : 0) / 
                       (activeChartNode?.data?.prod || activeChartNode?.data?.productionTotal || 0)
                    ) : 0
                  )), 
                  desc: `Gasto por unidad de producción`, 
                  icon: Layers, 
                  color: '#10b981' 
                }
              ].map((kpi, idx) => (
                <div key={idx} style={{ flex: 1, background: 'white', borderRadius: '12px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '5px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '8px', borderRadius: '8px', background: `${kpi.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <kpi.icon size={18} color={kpi.color} />
                    </div>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{kpi.label}</p>
                  </div>
                  <h3 style={{ margin: '5px 0 0 0', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{kpi.val}</h3>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500 }}>{kpi.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Insights Box */}
          <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '12px', padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Lightbulb size={16} color="#ca8a04" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ca8a04', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Insights de Eficiencia</span>
            </div>
            {insights.map((ins, i) => (
              <p key={i} style={{ margin: '0 0 6px 0', fontSize: '0.8rem', color: '#854d0e', lineHeight: '1.4', fontWeight: 500 }}>• {ins.text}</p>
            ))}
          </div>

        </div>

        {/* COMPARATIVE INTERANNUAL INSIGHTS (Requirement 7 & 8) */}
        {priorPeriodData && priorPeriodData.totalCost > 0 && (
          <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 10px 25px rgba(15,23,42,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={18} color="#38bdf8" />
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, letterSpacing: '-0.3px' }}>
                  Análisis Comparativo Interanual <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}>(Mismo Periodo Año Anterior)</span>
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', borderRadius: '20px', border: '1px solid rgba(56,189,248,0.3)' }}>
                Comparando vs {priorPeriodData.periodLabel}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.2rem' }}>
              {[
                { 
                  label: 'Costo Total CC', 
                  current: kpis.totalCost, 
                  prior: priorPeriodData.totalCost, 
                  isCost: true, 
                  invertColor: true 
                },
                { 
                  label: 'Gastos Directos', 
                  current: kpis.totalDirectos, 
                  prior: priorPeriodData.totalDirectos, 
                  isCost: true, 
                  invertColor: true 
                },
                { 
                  label: 'Gastos Indirectos', 
                  current: kpis.totalIndirectos, 
                  prior: priorPeriodData.totalIndirectos, 
                  isCost: true, 
                  invertColor: true 
                },
                { 
                  label: selectedCostType === 'insumos' ? 'Insumos Médicos' : selectedCostType === 'gg' ? 'Gastos Gen. (GG)' : 'Personal (RRHH)', 
                  current: selectedCostType === 'insumos' ? kpis.totalInsumos : selectedCostType === 'gg' ? kpis.totalGG : kpis.totalRRHH, 
                  prior: selectedCostType === 'insumos' ? priorPeriodData.totalInsumos : selectedCostType === 'gg' ? priorPeriodData.totalGG : priorPeriodData.totalRRHH, 
                  isCost: true, 
                  invertColor: true 
                },
                { 
                  label: 'Producción', 
                  current: kpis.totalProd, 
                  prior: priorPeriodData.totalProd, 
                  isCost: false, 
                  invertColor: false 
                },
                { 
                  label: `Costo Unit. [${selectedCostType === 'directos' ? 'Dir.' : selectedCostType === 'indirectos' ? 'Indir.' : selectedCostType.toUpperCase()}]`, 
                  current: isGlobalActive ? kpis.selectedUnitCost : (
                    (activeChartNode?.data?.prod || activeChartNode?.data?.productionTotal || 0) > 0 ? (
                      (selectedCostType === 'directos' ? (activeChartNode?.data?.directos || 0) :
                       selectedCostType === 'indirectos' ? (activeChartNode?.data?.indirectos || 0) :
                       selectedCostType === 'rrhh' ? (activeChartNode?.data?.rrhh || 0) :
                       selectedCostType === 'insumos' ? (activeChartNode?.data?.insumos || 0) :
                       selectedCostType === 'gg' ? (activeChartNode?.data?.gg || activeChartNode?.data?.gastosGenerales || 0) : 0) / 
                       (activeChartNode?.data?.prod || activeChartNode?.data?.productionTotal || 0)
                    ) : 0
                  ), 
                  prior: priorPeriodData.selectedUnitCost, 
                  isCost: true, 
                  invertColor: true 
                }
              ].map((item, idx) => {
                const diffVal = item.current - item.prior;
                const pct = item.prior > 0 ? (diffVal / item.prior) * 100 : 0;
                
                // Color logic: if it's a cost, a reduction is good (green), an increase is bad (red)
                // If it's production, an increase is good (green), a decrease is bad (red)
                const isGreen = item.invertColor ? pct < 0 : pct > 0;
                const badgeColor = isGreen ? '#10b981' : '#f43f5e';
                const badgeBg = isGreen ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)';
                
                return (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                        {item.isCost ? formatCompact(item.current) : item.current.toLocaleString('es-CL')}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        vs {item.isCost ? formatCompact(item.prior) : item.prior.toLocaleString('es-CL')}
                      </span>
                    </div>
                    <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '12px', fontSize: '0.68rem', fontWeight: 700, color: badgeColor, background: badgeBg }}>
                      {pct === 0 ? 'Sin cambios' : `${pct > 0 ? '▲' : '▼'} ${Math.abs(pct).toFixed(1)}%`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 1.- STACKED MONTHLY COST BREAKDOWN (Requirement 5 & 8) */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Evolución Mensual de Estructura de Gastos Directos</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Muestra los componentes del costo directo (RRHH, Insumos, Gastos Generales). Cifra al tope indica el total directo.</p>
            </div>
            <div style={{ display: 'flex', gap: '15px', fontSize: '0.75rem', fontWeight: 600 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00c4cc' }} />
                <span>Recursos Humanos</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff9f00' }} />
                <span>Insumos</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#e63956' }} />
                <span>Gastos Generales</span>
              </div>
            </div>
          </div>
          
          <div style={{ height: '260px' }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 25, right: 10, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={5} />
                <YAxis tickFormatter={(v) => '$' + (v/1000000).toFixed(0) + 'M'} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} width={60} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                  formatter={(val, name, props) => [formatCLP(val), name]}
                  cursor={{fill: '#f1f5f9'}} 
                />
                <Bar dataKey="rrhh" name="Recursos Humanos" stackId="a" fill="#00c4cc" radius={[0, 0, 4, 4]}>
                  <LabelList dataKey="rrhh" position="inside" formatter={(v) => v > 80000000 ? formatCompact(v) : ''} fill="#fff" fontSize={9} fontWeight={700} />
                </Bar>
                <Bar dataKey="insumos" name="Insumos" stackId="a" fill="#ff9f00">
                  <LabelList dataKey="insumos" position="inside" formatter={(v) => v > 80000000 ? formatCompact(v) : ''} fill="#fff" fontSize={9} fontWeight={700} />
                </Bar>
                <Bar dataKey="gg" name="Gastos Generales" stackId="a" fill="#e63956" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="gg" position="inside" formatter={(v) => v > 80000000 ? formatCompact(v) : ''} fill="#fff" fontSize={9} fontWeight={700} />
                  {/* Shows the sum of direct costs at the top of the stack */}
                  <LabelList dataKey="directos" position="top" formatter={(v) => formatCompact(v)} style={{ fill: '#334155', fontSize: 10, fontWeight: 800 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2.- EVOLUTION OF UNIT COST VS MINSAL BANDS (Requirement 6 & 8) */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                Evolución de Costo Unitario {selectedCostType === 'directos' ? 'vs Banda Minsal' : `[${costTypeOptions.find(o => o.value === selectedCostType)?.label}]`}
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                {selectedCostType === 'directos' 
                  ? 'Compara el costo unitario directo real con las bandas de referencia oficiales del Ministerio de Salud.'
                  : `Muestra la evolución del costo unitario del componente de gasto seleccionado: ${costTypeOptions.find(o => o.value === selectedCostType)?.label}.`
                }
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {(!activeBandaObj || selectedCostType !== 'directos') && (
                <span style={{ fontSize: '0.72rem', color: '#ca8a04', background: '#fef9c3', padding: '4px 10px', borderRadius: '20px', fontWeight: 700, border: '1px solid #fef08a' }}>
                  {selectedCostType !== 'directos' ? 'Bandas no aplicables (solo costo directo)' : 'Sin banda regulada para este grupo'}
                </span>
              )}
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Valores en pesos chilenos ($) por producción</span>
            </div>
          </div>

          <div style={{ height: '240px' }}>
            <ResponsiveContainer>
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                <defs>
                  <linearGradient id="colorCostoSmall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={5} />
                <YAxis tickFormatter={(v) => '$' + (v/1000).toFixed(0) + 'k'} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} width={60} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #cbd5e1' }} formatter={(val) => formatCLP(val)} />
                <Area type="monotone" dataKey="costoUnitario" name={activeCostUnitarioLabel} stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorCostoSmall)" />
                {selectedCostType === 'directos' && activeBandaObj && (
                  <>
                    <Line type="step" dataKey="limiteSuperior" name="Límite Sup (Crítico)" stroke="#dc2626" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                    <Line type="step" dataKey="marcaSuperior" name="Marca Sup (Alerta)" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="3 3" />
                    <Line type="step" dataKey="promedio" name="Estándar Minsal" stroke="#10b981" strokeWidth={3} dot={false} />
                    <Line type="step" dataKey="marcaInferior" name="Marca Inf" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
                    <Line type="step" dataKey="limiteInferior" name="Límite Inf" stroke="#dc2626" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3.- DRILL-DOWN LINE CHART */}
        <CostDrilldownChart 
          chartData={chartData} 
          globalRrhhBreakdown={globalRrhhBreakdown} 
          globalGgBreakdown={globalGgBreakdown} 
          globalInsumosBreakdown={globalInsumosBreakdown} 
          totalProd={kpis.totalProd || 0}
        />
        <div style={{ display: 'none' }}>
          
          {/* Left: Cost Layer Explorer */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>Explorador de Capas de Costos</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>Navegue por las capas analíticas desde el costo total hasta el desglose directo e indirecto.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Capa 1: Costo Total */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', background: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Capa 1: Costo Total CC</span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{formatCLP(activeTotal)}</span>
                </div>
                <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', marginTop: '8px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${activeTotal > 0 ? (activeDirectos / activeTotal) * 100 : 0}%`, background: '#0ea5e9' }} />
                  <div style={{ width: `${activeTotal > 0 ? (activeIndirectos / activeTotal) * 100 : 0}%`, background: '#a855f7' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>
                  <span>Directos: {formatCompact(activeDirectos)} ({(activeTotal > 0 ? (activeDirectos / activeTotal * 100) : 0).toFixed(0)}%)</span>
                  <span>Indirectos: {formatCompact(activeIndirectos)} ({(activeTotal > 0 ? (activeIndirectos / activeTotal * 100) : 0).toFixed(0)}%)</span>
                </div>
              </div>

              {/* Capa 2: Gasto Directo Desglosado */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0ea5e9', display: 'block', marginBottom: '10px' }}>Capa 2: Componentes del Gasto Directo</span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Recursos Humanos (RRHH)', val: activeRRHH, color: '#00c4cc' },
                    { label: 'Insumos Médicos', val: activeInsumos, color: '#ff9f00' },
                    { label: 'Gastos Generales (GG)', val: activeGG, color: '#e63956' }
                  ].map((layer, idx) => {
                    const pct = activeDirectos > 0 ? (layer.val / activeDirectos) * 100 : 0;
                    return (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                          <span style={{ fontWeight: 500, color: '#475569' }}>{layer.label}</span>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatCLP(layer.val)} <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500 }}>({pct.toFixed(0)}%)</span></span>
                        </div>
                        <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', marginTop: '4px' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: layer.color, borderRadius: '2px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Capa 3: Detalle de Insumos */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => toggleRow('active-insumos-layer')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {expandedRows['active-insumos-layer'] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ff9f00' }}>Capa 3: Sub-Distribución de Insumos</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>{formatCLP(activeInsumos)}</span>
                </div>

                <AnimatePresence>
                  {expandedRows['active-insumos-layer'] && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', marginTop: '10px' }}>
                      <div style={{ maxHeight: '120px', overflowY: 'auto', paddingRight: '5px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {Object.entries(activeInsumosBreakdown).length > 0 ? (
                          Object.entries(activeInsumosBreakdown).sort((a,b) => b[1]-a[1]).map(([name, val], i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', padding: '4px 8px', background: '#fafafa', borderRadius: '4px' }}>
                              <span style={{ color: '#475569' }}>{name}</span>
                              <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatCLP(val)}</span>
                            </div>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>Sin detalle disponible</span>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

          {/* Right: TreeMap (Poco común / Visual) */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>Distribución de Insumos (TreeMap)</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>Representación jerárquica del gasto de insumos. Tamaño indica la proporción del gasto.</p>
            </div>

            <div style={{ flex: 1, minHeight: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {Object.entries(activeInsumosBreakdown).length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <Treemap
                    data={Object.entries(activeInsumosBreakdown).map(([name, value]) => ({ name: name.substring(0, 20), size: value }))}
                    dataKey="size"
                    stroke="#fff"
                    fill="#ff9f00"
                    animationDuration={600}
                  >
                    <Tooltip formatter={(value) => formatCLP(value)} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  </Treemap>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', gap: '8px' }}>
                  <Activity size={32} color="#e2e8f0" />
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Sin datos de insumos para graficar</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* 4.- DETAILED TABLE OF GROUPED COST CENTERS (Requirement 3, 4, 8) */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>Desglose Analítico por Centro de Costo</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>Detalle de costos directos (RRHH, Insumos, GG), total directos, indirectos, costo total, costo unitario directo y semáforo de banda.</p>
            </div>
            {!isGlobalActive && (
              <button
                onClick={() => handleRowClick('global', kpis, 'Visión Global (Grupo/Selección)')}
                style={{ background: '#f1f5f9', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', color: '#0284c7' }}
              >
                ← Restablecer Vista Global
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem', minWidth: '950px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '2px solid #e2e8f0', fontWeight: 700 }}>
                  <th style={{ padding: '12px 15px', position: 'sticky', left: 0, background: '#f8fafc', zIndex: 2, boxShadow: '2px 0 5px rgba(0,0,0,0.02)' }}>Centro de Costo</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right', ...getColStyle('rrhh', true) }}>RRHH (Directo)</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right', ...getColStyle('insumos', true) }}>Insumos (Directo)</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right', ...getColStyle('gg', true) }}>Gastos Gen. (Directo)</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 800, ...getColStyle('directos', true) }}>Total Directos</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right', ...getColStyle('indirectos', true) }}>Costos Indirectos</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 800 }}>Costo Total CC</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right' }}>Producción</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 800 }}>Costo Unit. Dir.</th>
                  <th style={{ padding: '12px 15px', textAlign: 'center' }}>Semáforo Banda</th>
                </tr>
              </thead>
              <tbody>
                {ccStatusList.length > 0 ? (
                  ccStatusList.map((item, idx) => {
                    const isSelected = isCCActive && activeLabel === item.label;
                    return (
                      <tr 
                        key={idx}
                        onClick={() => handleRowClick('cc', item, item.label)}
                        style={{ 
                          borderBottom: '1px solid #e2e8f0', cursor: 'pointer',
                          background: isSelected ? '#e0f2fe' : 'transparent',
                          fontWeight: isSelected ? 600 : 400,
                          transition: 'background 0.1s'
                        }}
                        className="cc-table-row"
                      >
                        <td style={{ 
                          padding: '12px 15px', color: '#0f172a', fontWeight: isSelected ? 800 : 600, 
                          position: 'sticky', left: 0, background: isSelected ? '#e0f2fe' : 'white', 
                          zIndex: 1, boxShadow: '2px 0 5px rgba(0,0,0,0.02)' 
                        }}>
                          {item.label}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'right', color: '#475569', ...getColStyle('rrhh', false, isSelected) }}>
                          {formatCLP(item.rrhh)}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'right', color: '#475569', ...getColStyle('insumos', false, isSelected) }}>
                          {formatCLP(item.insumos)}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'right', color: '#475569', ...getColStyle('gg', false, isSelected) }}>
                          {formatCLP(item.gg)}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'right', color: '#16a34a', fontWeight: 700, ...getColStyle('directos', false, isSelected) }}>
                          {formatCLP(item.directos)}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'right', color: '#7c3aed', ...getColStyle('indirectos', false, isSelected) }}>
                          {formatCLP(item.indirectos)}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'right', color: '#0f172a', fontWeight: 700 }}>
                          {formatCLP(item.total)}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'right', color: '#334155', fontWeight: 600 }}>
                          {item.prod > 0 ? item.prod.toLocaleString('es-CL') : '—'}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'right', color: '#0f172a', fontWeight: 800 }}>
                          {item.prod > 0 ? formatCLP(item.unitCost) : '—'}
                        </td>
                        <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                          <span style={{ 
                            padding: '4px 10px', borderRadius: '12px', fontSize: '0.68rem', fontWeight: 800,
                            color: item.status.color, background: item.status.bg, display: 'inline-block', minWidth: '95px', textAlign: 'center'
                          }}>
                            {item.status.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="10" style={{ padding: '40px 10px', textAlign: 'center', color: '#94a3b8' }}>
                      Sin datos en el rango seleccionado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
