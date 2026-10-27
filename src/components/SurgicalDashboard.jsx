import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Calendar, Search, Users, Activity, Clock, CheckCircle, FileText,
  XCircle, AlertCircle, Filter, PieChart, BarChart2, ChevronRight, ChevronLeft, ChevronDown, TrendingUp, RotateCcw, Pin, DollarSign, Package, TrendingDown, Award, Hash
} from 'lucide-react';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, LabelList, Label, ReferenceLine,
  Treemap, AreaChart, Area, BarChart, LineChart
} from 'recharts';

import TablaCausasSuspensionColapsable, { resolverGranCausa } from './TablaCausasSuspensionColapsable';
import TablaEspecialidadesSuspensionColapsable from './TablaEspecialidadesSuspensionColapsable';

const COLORS = ['#1e40af', '#DF6D05', '#F2A400', '#38bdf8', '#EAE6E1', '#1e3a8a', '#a65103', '#b37800', '#60a5fa'];
const PIE_COLORS = {
  'Cirugía Mayor': '#1e40af',
  'Cirugía Mayor Ambulatoria': '#DF6D05',
  'Cirugía Menor': '#F2A400',
  'Procedimientos': '#38bdf8'
};

const MultiSearchableSelect = ({ value = [], options = [], onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getOptVal = (o) => (typeof o === 'object' && o !== null ? (o.id ?? o.value) : o);
  const getOptLabel = (o) => (typeof o === 'object' && o !== null ? (o.label ?? o.name ?? o.id) : String(o));

  const filtered = options.filter(o => getOptLabel(o).toLowerCase().includes(search.toLowerCase()));
  const isAll = value.length === 0;
  
  const getSelectedLabel = (valItem) => {
    const matched = options.find(o => String(getOptVal(o)) === String(valItem));
    return matched ? getOptLabel(matched) : valItem;
  };

  const displayText = isAll 
    ? "Todas" 
    : (value.length === 1 ? getSelectedLabel(value[0]) : `${value.length} seleccionadas`);

  const toggleOption = (o) => {
    const val = String(getOptVal(o));
    if (value.map(String).includes(val)) onChange(value.filter(v => String(v) !== val));
    else onChange([...value, val]);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayText}</span>
        <ChevronDown size={14} color="#64748b" />
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '4px', zIndex: 50, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxHeight: '280px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '6px', padding: '4px 8px' }}>
              <Search size={14} color="#64748b" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar..."
                style={{ border: 'none', background: 'transparent', outline: 'none', padding: '4px 8px', width: '100%', fontSize: '0.85rem' }}
              />
            </div>
          </div>
          <div style={{ overflowY: 'auto', padding: '4px' }}>
            <div
              onClick={() => { onChange([]); setIsOpen(false); setSearch(""); }}
              style={{ padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '6px', background: isAll ? '#f1f5f9' : 'transparent', fontWeight: isAll ? 700 : 400, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = isAll ? '#f1f5f9' : 'transparent'}
            >
              <input type="checkbox" checked={isAll} readOnly style={{ cursor: 'pointer' }} />
              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Todas</span>
            </div>

            {filtered.length === 0 ? <div style={{ padding: '8px', fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center' }}>Sin resultados</div> : null}
            {filtered.map((o, idx) => {
              const val = String(getOptVal(o));
              const label = getOptLabel(o);
              const isSelected = value.map(String).includes(val);
              return (
                <div
                  key={idx}
                  onClick={() => toggleOption(o)}
                  style={{ padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '6px', background: isSelected ? '#f1f5f9' : 'transparent', fontWeight: isSelected ? 700 : 400, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = isSelected ? '#f1f5f9' : 'transparent'}
                >
                  <input type="checkbox" checked={isSelected} readOnly style={{ cursor: 'pointer' }} />
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const PivotTable = ({ data, totalCirugias }) => {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const { tree, months, grandTotal, years, monthsByYear } = useMemo(() => {
    const t = { total: 0, months: {}, children: {} };
    const mSet = new Set();

    data.forEach(r => {
      if (!r.fecha_cirugia) return;
      const mKey = r.fecha_cirugia.substring(0, 7);
      mSet.add(mKey);

      const fam = r.familia_iq || 'SIN FAMILIA';
      const int = r.intervencion || 'SIN INTERVENCION';
      const cir = r.cirujano || 'SIN CIRUJANO';

      t.total++;
      t.months[mKey] = (t.months[mKey] || 0) + 1;

      if (!t.children[fam]) t.children[fam] = { type: 'fam', id: fam, total: 0, months: {}, children: {} };
      t.children[fam].total++;
      t.children[fam].months[mKey] = (t.children[fam].months[mKey] || 0) + 1;

      const intId = `${fam}||${int}`;
      if (!t.children[fam].children[int]) t.children[fam].children[int] = { type: 'int', id: intId, total: 0, months: {}, children: {} };
      t.children[fam].children[int].total++;
      t.children[fam].children[int].months[mKey] = (t.children[fam].children[int].months[mKey] || 0) + 1;

      const cirId = `${fam}||${int}||${cir}`;
      if (!t.children[fam].children[int].children[cir]) t.children[fam].children[int].children[cir] = { type: 'cir', id: cirId, total: 0, months: {} };
      t.children[fam].children[int].children[cir].total++;
      t.children[fam].children[int].children[cir].months[mKey] = (t.children[fam].children[int].children[cir].months[mKey] || 0) + 1;
    });

    const sortedMonths = Array.from(mSet).sort();
    const uniqueYears = [...new Set(sortedMonths.map(m => m.substring(0, 4)))].sort();
    const mByYear = {};
    uniqueYears.forEach(y => {
      mByYear[y] = sortedMonths.filter(m => m.startsWith(y));
    });

    return { tree: t, months: sortedMonths, grandTotal: t.total, years: uniqueYears, monthsByYear: mByYear };
  }, [data]);

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const formatMonth = (mk) => {
    const [y, m] = mk.split('-');
    return `${monthNames[parseInt(m) - 1]} ${y}`;
  };

  const getCellColor = (val, max) => {
    if (!val || val === 0 || !max || max === 0) return 'transparent';
    const intensity = val / max;
    return `rgba(30, 64, 175, ${intensity * 0.50})`; // Stronger gradient so low values look white
  };

  const renderRow = (node, name, level) => {
    const isExpanded = expandedRows[node.id];
    const hasChildren = node.children && Object.keys(node.children).length > 0;
    const maxInRow = Math.max(...months.map(m => node.months[m] || 0));

    const rowBg = isExpanded ? '#e2e8f0' : (level === 0 ? '#f8fafc' : level === 1 ? '#ffffff' : '#fcfcfc');
    const borderB = isExpanded ? '2px solid #cbd5e1' : '1px solid #e2e8f0';
    const textWeight = isExpanded ? 800 : (level === 0 ? 700 : level === 1 ? 600 : 400);

    return (
      <React.Fragment key={node.id}>
        <tr style={{ background: rowBg, borderBottom: borderB, transition: 'all 0.2s' }}>
          <td style={{ padding: '8px 12px', paddingLeft: `${12 + level * 24}px`, position: 'sticky', left: 0, background: rowBg, zIndex: 10, borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '350px', transition: 'all 0.2s' }}>
            {hasChildren ? (
              <button onClick={() => toggleRow(node.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 800, marginRight: '8px', color: '#64748b' }}>
                {isExpanded ? '−' : '+'}
              </button>
            ) : <span style={{ display: 'inline-block', width: '20px' }}></span>}
            <span style={{ fontWeight: textWeight, color: '#0f172a', fontSize: '0.85rem' }}>{name}</span>
          </td>

          {years.map(y => {
            const rowYearTotal = monthsByYear[y].reduce((sum, m) => sum + (node.months[m] || 0), 0);
            return (
              <React.Fragment key={y}>
                {monthsByYear[y].map(m => {
                  const val = node.months[m] || 0;
                  return (
                    <td key={m} style={{ padding: '8px 12px', textAlign: 'right', fontSize: '0.85rem', color: '#0f172a', background: getCellColor(val, maxInRow), transition: 'all 0.2s' }}>
                      {val > 0 ? val : ''}
                    </td>
                  );
                })}
                <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', background: '#f1f5f9', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                  {rowYearTotal > 0 ? rowYearTotal : ''}
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', background: '#f8fafc', borderRight: '1px solid #e2e8f0' }}>
                  {(() => {
                    const grandYearTotal = monthsByYear[y].reduce((sum, m) => sum + (tree.months?.[m] || 0), 0);
                    return grandYearTotal > 0 && rowYearTotal > 0 ? ((rowYearTotal / grandYearTotal) * 100).toFixed(1) + '%' : '';
                  })()}
                </td>
              </React.Fragment>
            );
          })}

          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, fontSize: '0.85rem', background: '#f1f5f9' }}>{node.total}</td>
          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, fontSize: '0.85rem', background: '#e2e8f0', color: '#0f172a' }}>
            {totalCirugias > 0 ? ((node.total / totalCirugias) * 100).toFixed(1) + '%' : '0%'}
          </td>
        </tr>
        {isExpanded && hasChildren && Object.entries(node.children).sort((a, b) => b[1].total - a[1].total).map(([cName, cNode]) => renderRow(cNode, cName, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div style={{ overflow: 'auto', maxHeight: '600px', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', background: 'white' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 20, background: '#1e40af', color: 'white' }}>
          {/* Year Header Row */}
          <tr>
            <th rowSpan={2} style={{ padding: '12px', position: 'sticky', left: 0, zIndex: 30, background: '#1e40af', borderRight: '1px solid rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>Familia / Intervención / Cirujano</th>
            {years.map(y => (
              <th key={y} colSpan={monthsByYear[y].length + 2} style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.2)', fontWeight: 800 }}>{y}</th>
            ))}
            <th rowSpan={2} style={{ padding: '12px', textAlign: 'right', background: '#1e3a8a', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>Total General</th>
            <th rowSpan={2} style={{ padding: '12px', textAlign: 'right', background: '#172554', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>% del Total</th>
          </tr>
          {/* Month Header Row */}
          <tr>
            {years.map(y => (
              <React.Fragment key={y}>
                {monthsByYear[y].map(m => (
                  <th key={m} style={{ padding: '8px 12px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: '0.85rem', background: '#2563eb', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>{formatMonth(m).split(' ')[0]}</th>
                ))}
                <th style={{ padding: '8px 12px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: '0.85rem', background: '#1e3a8a', borderRight: '1px solid rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>Total {y}</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: '0.85rem', background: '#172554', borderRight: '1px solid rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>% {y}</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(tree.children || {}).sort((a, b) => b[1].total - a[1].total).map(([name, node]) => renderRow(node, name, 0))}
        </tbody>
        <tfoot style={{ position: 'sticky', bottom: 0, background: '#f1f5f9', fontWeight: 800, zIndex: 20, boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}>
          <tr>
            <td style={{ padding: '12px', position: 'sticky', left: 0, background: '#f1f5f9', borderRight: '1px solid #e2e8f0' }}>TOTAL GENERAL</td>
            {years.map(y => {
              const rowYearTotal = monthsByYear[y].reduce((sum, m) => sum + (tree.months?.[m] || 0), 0);
              return (
                <React.Fragment key={y}>
                  {monthsByYear[y].map(m => (
                    <td key={m} style={{ padding: '12px', textAlign: 'right' }}>{tree.months?.[m] || 0}</td>
                  ))}
                  <td style={{ padding: '12px', textAlign: 'right', background: '#e2e8f0', borderRight: '1px solid #cbd5e1' }}>{rowYearTotal}</td>
                  <td style={{ padding: '12px', textAlign: 'right', background: '#e2e8f0', borderRight: '1px solid #cbd5e1' }}>100%</td>
                </React.Fragment>
              );
            })}
            <td style={{ padding: '12px', textAlign: 'right', background: '#e2e8f0' }}>{grandTotal}</td>
            <td style={{ padding: '12px', textAlign: 'right', background: '#cbd5e1' }}>100%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

const PivotTableTabla = ({ data }) => {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const { tree, months, grandTotal, years, monthsByYear } = useMemo(() => {
    const t = { total: 0, sumDur: 0, months: {}, children: {} };
    const mSet = new Set();

    data.forEach(r => {
      if (r.estado !== 'Intervenido') return;
      if (!r.fecha_programacion) return;
      
      const mKey = r.fecha_programacion.substring(0, 7);
      mSet.add(mKey);

      const int = r.intervencion_propuesta || 'SIN INTERVENCION';
      const cir = r.cirujano || 'SIN CIRUJANO';
      const mod = r.modalidad || 'SIN MODALIDAD';
      const dur = parseFloat(r.duracion_iq) || 0;

      t.total++;
      t.sumDur += dur;
      if (!t.months[mKey]) t.months[mKey] = { total: 0, sumDur: 0 };
      t.months[mKey].total++;
      t.months[mKey].sumDur += dur;

      if (!t.children[int]) t.children[int] = { type: 'int', id: int, total: 0, sumDur: 0, months: {}, children: {} };
      t.children[int].total++;
      t.children[int].sumDur += dur;
      if (!t.children[int].months[mKey]) t.children[int].months[mKey] = { total: 0, sumDur: 0 };
      t.children[int].months[mKey].total++;
      t.children[int].months[mKey].sumDur += dur;

      const cirId = `${int}||${cir}`;
      if (!t.children[int].children[cir]) t.children[int].children[cir] = { type: 'cir', id: cirId, total: 0, sumDur: 0, months: {}, children: {} };
      t.children[int].children[cir].total++;
      t.children[int].children[cir].sumDur += dur;
      if (!t.children[int].children[cir].months[mKey]) t.children[int].children[cir].months[mKey] = { total: 0, sumDur: 0 };
      t.children[int].children[cir].months[mKey].total++;
      t.children[int].children[cir].months[mKey].sumDur += dur;

      const modId = `${int}||${cir}||${mod}`;
      if (!t.children[int].children[cir].children[mod]) t.children[int].children[cir].children[mod] = { type: 'mod', id: modId, total: 0, sumDur: 0, months: {} };
      t.children[int].children[cir].children[mod].total++;
      t.children[int].children[cir].children[mod].sumDur += dur;
      if (!t.children[int].children[cir].children[mod].months[mKey]) t.children[int].children[cir].children[mod].months[mKey] = { total: 0, sumDur: 0 };
      t.children[int].children[cir].children[mod].months[mKey].total++;
      t.children[int].children[cir].children[mod].months[mKey].sumDur += dur;
    });

    const sortedMonths = Array.from(mSet).sort();
    const uniqueYears = [...new Set(sortedMonths.map(m => m.substring(0, 4)))].sort();
    const mByYear = {};
    uniqueYears.forEach(y => {
      mByYear[y] = sortedMonths.filter(m => m.startsWith(y));
    });

    return { tree: t, months: sortedMonths, grandTotal: t.total, years: uniqueYears, monthsByYear: mByYear };
  }, [data]);

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const formatMonth = (mk) => monthNames[parseInt(mk.split('-')[1]) - 1];

  const renderCell = (node, mKey, isYearTotal = false, isGrandTotal = false) => {
    const d = mKey ? node.months[mKey] : node;
    const bg = isGrandTotal ? '#e2e8f0' : isYearTotal ? '#f1f5f9' : 'transparent';
    const borderR = isGrandTotal || isYearTotal ? '#cbd5e1' : '#e2e8f0';
    const borderB = '#f1f5f9';
    
    if (!d || d.total === 0) return (
      <React.Fragment key={mKey||(isGrandTotal ? 'gt' : 'yt')}>
        <td style={{ padding: '8px', borderBottom: `1px solid ${borderB}`, borderRight: `1px solid ${borderB}`, background: bg }}></td>
        <td style={{ padding: '8px', borderBottom: `1px solid ${borderB}`, borderRight: `1px solid ${borderR}`, background: bg }}></td>
      </React.Fragment>
    );
    
    const tProm = d.total > 0 ? (d.sumDur / d.total).toFixed(2) : '-';
    return (
      <React.Fragment key={mKey||(isGrandTotal ? 'gt' : 'yt')}>
        <td style={{ padding: '8px', textAlign: 'center', borderBottom: `1px solid ${borderB}`, borderRight: `1px solid ${borderB}`, color: isYearTotal || isGrandTotal ? '#0f172a' : '#64748b', fontWeight: isYearTotal || isGrandTotal ? 700 : 400, background: bg }}>{d.total}</td>
        <td style={{ padding: '8px', textAlign: 'center', borderBottom: `1px solid ${borderB}`, borderRight: `1px solid ${borderR}`, color: '#0f766e', fontWeight: 700, background: bg }}>{tProm}</td>
      </React.Fragment>
    );
  };

  const sortedInts = Object.keys(tree.children).sort((a,b) => tree.children[b].total - tree.children[a].total);

  const getYearlyTotal = (node, y) => {
    return monthsByYear[y].reduce((acc, m) => {
      const mData = node.months[m];
      if (mData) { acc.total += mData.total; acc.sumDur += mData.sumDur; }
      return acc;
    }, { total: 0, sumDur: 0 });
  };

  const renderDataCells = (node) => {
    return (
      <React.Fragment>
        {years.map(y => (
          <React.Fragment key={y}>
            {monthsByYear[y].map(m => renderCell(node, m))}
            {renderCell(getYearlyTotal(node, y), null, true, false)}
          </React.Fragment>
        ))}
        {renderCell(node, null, false, true)}
      </React.Fragment>
    );
  };

  const renderTfootCells = () => {
    return (
      <React.Fragment>
        {years.map(y => (
          <React.Fragment key={y}>
            {monthsByYear[y].map(m => {
              const d = tree.months[m];
              if (!d || d.total === 0) return <React.Fragment key={m}><td style={{ background: '#1d4ed8', borderRight: '1px solid rgba(255,255,255,0.2)' }}></td><td style={{ background: '#1d4ed8', borderRight: '1px solid rgba(255,255,255,0.2)' }}></td></React.Fragment>;
              return (
                <React.Fragment key={m}>
                  <td style={{ background: '#1d4ed8', color: 'white', padding: '8px', textAlign: 'center', fontWeight: 700, borderRight: '1px solid rgba(255,255,255,0.2)' }}>{d.total}</td>
                  <td style={{ background: '#1d4ed8', color: 'white', padding: '8px', textAlign: 'center', fontWeight: 700, borderRight: '1px solid rgba(255,255,255,0.2)' }}>{(d.sumDur/d.total).toFixed(2)}</td>
                </React.Fragment>
              );
            })}
            {/* Year Total for TFoot */}
            {(() => {
              const yt = getYearlyTotal(tree, y);
              return (
                <React.Fragment key={`ft-yt-${y}`}>
                  <td style={{ background: '#2563eb', color: 'white', padding: '8px', textAlign: 'center', fontWeight: 800, borderRight: '1px solid rgba(255,255,255,0.2)' }}>{yt.total}</td>
                  <td style={{ background: '#2563eb', color: 'white', padding: '8px', textAlign: 'center', fontWeight: 800, borderRight: '1px solid rgba(255,255,255,0.2)' }}>{yt.total > 0 ? (yt.sumDur/yt.total).toFixed(2) : '-'}</td>
                </React.Fragment>
              );
            })()}
          </React.Fragment>
        ))}
        {/* Grand Total for TFoot */}
        <td style={{ background: '#1e3a8a', color: 'white', padding: '8px', textAlign: 'center', fontWeight: 900, borderRight: '1px solid rgba(255,255,255,0.2)' }}>{tree.total}</td>
        <td style={{ background: '#1e3a8a', color: 'white', padding: '8px', textAlign: 'center', fontWeight: 900, borderRight: '1px solid rgba(255,255,255,0.2)' }}>{(tree.sumDur/tree.total).toFixed(2)}</td>
      </React.Fragment>
    );
  };

  return (
    <div style={{ overflow: 'auto', maxHeight: '550px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', position: 'relative' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.75rem' }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 30 }}>
          <tr>
            <th style={{ position: 'sticky', left: 0, zIndex: 40, background: '#1d4ed8', color: 'white', padding: '8px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)', minWidth: '300px' }}>Year</th>
            {years.map(y => (
              <th key={y} colSpan={(monthsByYear[y].length * 2) + 2} style={{ background: '#1d4ed8', color: 'white', padding: '8px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)' }}>{y}</th>
            ))}
            <th colSpan="2" rowSpan="2" style={{ background: '#2563eb', color: 'white', padding: '8px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Total General</th>
          </tr>
          <tr>
            <th style={{ position: 'sticky', left: 0, zIndex: 40, background: '#1d4ed8', color: 'white', padding: '8px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Month</th>
            {years.map(y => (
              <React.Fragment key={`m-hdr-${y}`}>
                {monthsByYear[y].map(m => (
                  <th key={m} colSpan="2" style={{ background: '#3b82f6', color: 'white', padding: '8px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)' }}>{formatMonth(m)}</th>
                ))}
                <th colSpan="2" style={{ background: '#2563eb', color: 'white', padding: '8px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Total {y}</th>
              </React.Fragment>
            ))}
          </tr>
          <tr>
            <th style={{ position: 'sticky', left: 0, zIndex: 40, background: '#1d4ed8', color: 'white', padding: '8px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)', boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }}>codigo_iq</th>
            {years.map(y => (
              <React.Fragment key={`col-hdr-${y}`}>
                {monthsByYear[y].map(m => (
                  <React.Fragment key={`hdr-${m}`}>
                    <th style={{ background: '#3b82f6', color: 'white', padding: '8px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)', minWidth: '40px' }}>N°</th>
                    <th style={{ background: '#3b82f6', color: 'white', padding: '8px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)', minWidth: '50px' }}>t Prom</th>
                  </React.Fragment>
                ))}
                <th style={{ background: '#2563eb', color: 'white', padding: '8px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)', minWidth: '40px' }}>N°</th>
                <th style={{ background: '#2563eb', color: 'white', padding: '8px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)', minWidth: '50px' }}>t Prom</th>
              </React.Fragment>
            ))}
            <th style={{ background: '#1e3a8a', color: 'white', padding: '8px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)', minWidth: '40px' }}>N°</th>
            <th style={{ background: '#1e3a8a', color: 'white', padding: '8px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)', minWidth: '50px' }}>t Prom</th>
          </tr>
        </thead>
        <tbody>
          {sortedInts.map(intKey => {
            const intNode = tree.children[intKey];
            const isIntExp = expandedRows[intNode.id];
            
            return (
              <React.Fragment key={intNode.id}>
                {/* INT ROW */}
                <tr style={{ background: '#f8fafc' }}>
                  <td style={{ position: 'sticky', left: 0, zIndex: 10, padding: '8px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '8px', boxShadow: '2px 0 5px rgba(0,0,0,0.05)' }}>
                    <div onClick={() => toggleRow(intNode.id)} style={{ cursor: 'pointer', border: '1px solid #94a3b8', borderRadius: '4px', minWidth: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', marginTop: '2px', background: 'white' }}>
                      {isIntExp ? '-' : '+'}
                    </div>
                    <span style={{ fontWeight: 700, color: '#0f172a', flex: 1, border: '1px solid #cbd5e1', padding: '4px', borderRadius: '4px', background: 'white' }}>{intKey}</span>
                  </td>
                  {renderDataCells(intNode)}
                </tr>
                
                {/* CIRUJANOS ROWS */}
                {isIntExp && Object.keys(intNode.children).sort((a,b)=>intNode.children[b].total - intNode.children[a].total).map(cirKey => {
                  const cirNode = intNode.children[cirKey];
                  const isCirExp = expandedRows[cirNode.id];
                  
                  return (
                    <React.Fragment key={cirNode.id}>
                      <tr style={{ background: 'white' }}>
                        <td style={{ position: 'sticky', left: 0, zIndex: 10, padding: '8px 8px 8px 32px', background: 'white', borderBottom: '1px solid #f1f5f9', borderRight: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '2px 0 5px rgba(0,0,0,0.02)' }}>
                          <div onClick={() => toggleRow(cirNode.id)} style={{ cursor: 'pointer', border: '1px solid #94a3b8', borderRadius: '4px', minWidth: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                            {isCirExp ? '-' : '+'}
                          </div>
                          <span style={{ fontWeight: 600, color: '#334155' }}>{cirKey}</span>
                        </td>
                        {renderDataCells(cirNode)}
                      </tr>

                      {/* MODALIDAD ROWS */}
                      {isCirExp && Object.keys(cirNode.children).sort((a,b)=>cirNode.children[b].total - cirNode.children[a].total).map(modKey => {
                        const modNode = cirNode.children[modKey];
                        return (
                          <tr key={modNode.id} style={{ background: 'white' }}>
                            <td style={{ position: 'sticky', left: 0, zIndex: 10, padding: '8px 8px 8px 64px', background: 'white', borderBottom: '1px solid #f1f5f9', borderRight: '1px solid #e2e8f0', color: '#64748b', boxShadow: '2px 0 5px rgba(0,0,0,0.02)' }}>{modKey}</td>
                            {renderDataCells(modNode)}
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            );
          })}
        </tbody>
        <tfoot style={{ position: 'sticky', bottom: 0, zIndex: 30 }}>
          <tr>
            <td style={{ position: 'sticky', left: 0, zIndex: 40, background: '#1d4ed8', color: 'white', padding: '8px', fontWeight: 700, borderRight: '1px solid rgba(255,255,255,0.2)', boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }}>Total General</td>
            {renderTfootCells()}
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

const TopSuspensionesGRD = ({ data, grdData }) => {
  const suspMap = {};
  data.forEach(r => {
    if (r.estado === 'Suspendido' && !(r.tipo_paciente === 'Condicional' && r.cirugia_realizada !== 'Si')) {
      const code = r.codigo_iq || r.intervencion_propuesta || 'SIN CODIGO';
      if (!suspMap[code]) suspMap[code] = 0;
      suspMap[code]++;
    }
  });

  const allSusp = Object.entries(suspMap).map(([code, count]) => ({ code, count }));
  const getGrdMatch = (code) => {
    const codePrefix = code.split('-')[0].trim();
    if (codePrefix) {
      const exactMatch = grdData.find(g => String(g['__EMPTY']) === String(codePrefix));
      if (exactMatch) return exactMatch;
    }
    const txt = code.toLowerCase();
    const fuzzMatch = grdData.find(g => {
      const proc = (g['Procedimiento principal'] || '').toLowerCase();
      if (txt.includes('faco') && txt.includes('catarata') && proc.includes('catarata')) return true;
      if (txt.includes('colecistectomía') && txt.includes('laparo') && proc.includes('colecistectomia laparoscopica')) return true;
      return false;
    });
    return fuzzMatch || null;
  };

  const allRows = allSusp.map(item => {
    const match = getGrdMatch(item.code);
    const pesoMedio = match ? match['Peso Medio GRD'] : 0;
    const valorUnitario = match ? match[' Valorización unitaria promedio FONASA '] : 0;
    const pxq = item.count * valorUnitario;
    
    return {
      ...item,
      grd: match ? match['Procedimiento principal'] : 'Sin homologación',
      pesoMedio,
      valorUnitario,
      pxq
    };
  }).sort((a, b) => b.pxq - a.pxq);

  const totalSuspensionsCount = allRows.reduce((sum, r) => sum + r.count, 0);
  const homologatedRows = allRows.filter(r => r.grd !== 'Sin homologación');
  const unhomologatedRows = allRows.filter(r => r.grd === 'Sin homologación');
  const tableRows = [...homologatedRows];
  
  if (unhomologatedRows.length > 0) {
    const remainingCount = unhomologatedRows.reduce((sum, r) => sum + r.count, 0);
    const remainingPxq = unhomologatedRows.reduce((sum, r) => sum + r.pxq, 0);
    tableRows.push({
      code: 'Otros códigos quirúrgicos',
      count: remainingCount,
      grd: '-',
      pesoMedio: null,
      valorUnitario: null,
      pxq: remainingPxq,
      isGrouped: true
    });
  }

  return (
    <div style={{ marginTop: '24px', background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '16px', fontWeight: 800 }}>Impacto Financiero de Suspensiones (Valorización GRD)</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: '#64748b' }}>Intervención Suspendida (Código IQ)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: '#64748b' }}>Cant. Suspendidas</th>
              <th style={{ padding: '12px', textAlign: 'right', color: '#64748b' }}>% Total Susp.</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#64748b' }}>Procedimiento GRD Homologado</th>
              <th style={{ padding: '12px', textAlign: 'right', color: '#64748b' }}>Peso Medio</th>
              <th style={{ padding: '12px', textAlign: 'right', color: '#64748b' }}>Valor Unitario</th>
              <th style={{ padding: '12px', textAlign: 'right', color: '#b91c1c', fontWeight: 'bold' }}>Pérdida Financiera (PxQ)</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: row.isGrouped ? '#f8fafc' : 'transparent' }}>
                <td style={{ padding: '12px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: row.isGrouped ? 700 : 400, fontStyle: row.isGrouped ? 'italic' : 'normal' }} title={row.code}>{row.code}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700 }}>{row.count}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700 }}>{totalSuspensionsCount > 0 ? ((row.count / totalSuspensionsCount) * 100).toFixed(1) : 0}%</td>
                <td style={{ padding: '12px', color: row.grd === 'Sin homologación' ? '#94a3b8' : 'inherit' }}>{row.grd}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{row.pesoMedio ? row.pesoMedio.toFixed(4) : '-'}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{row.valorUnitario ? `$${Math.round(row.valorUnitario).toLocaleString()}` : '-'}</td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#b91c1c', fontWeight: 700 }}>{row.pxq ? `$${Math.round(row.pxq).toLocaleString()}` : '-'}</td>
              </tr>
            ))}
            <tr style={{ background: '#fef2f2', borderTop: '2px solid #fecaca' }}>
              <td colSpan={6} style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: '#7f1d1d' }}>Pérdida Financiera Total Estimada:</td>
              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: '#7f1d1d' }}>
                ${Math.round(tableRows.reduce((sum, row) => sum + row.pxq, 0)).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};


/* ==========================================================================
   COMPONENTE: TABLA DINÁMICA DE SUSPENSIONES (Collapsible 4 Levels & Months)
   ========================================================================== */
const TablaDinamicaSuspensiones = ({ data = [] }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [expandedYears, setExpandedYears] = useState({});
  const [maxDepthLevel, setMaxDepthLevel] = useState(1);

  const suspData = useMemo(() => {
    return data.filter(r => r.estado === 'Suspendido');
  }, [data]);

  const { yearMonthsMap, monthNames, totalGeneralSusp } = useMemo(() => {
    const map = {};
    const mNames = {
      '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr', '05': 'May', '06': 'Jun',
      '07': 'Jul', '08': 'Ago', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic'
    };
    let totalCount = 0;

    suspData.forEach(r => {
      totalCount++;
      if (r.fecha_programacion) {
        const d = r.fecha_programacion.substring(0, 10);
        const parts = d.split('-');
        if (parts.length >= 2) {
          const yr = parts[0];
          if (!map[yr]) map[yr] = new Set();
          map[yr].add(d.substring(0, 7));
        }
      }
    });

    const sortedYears = Object.keys(map).sort();
    const resultYrMap = {};
    sortedYears.forEach(yr => {
      resultYrMap[yr] = Array.from(map[yr]).sort();
    });

    return { yearMonthsMap: resultYrMap, monthNames: mNames, totalGeneralSusp: totalCount };
  }, [suspData]);

  const treeData = useMemo(() => {
    const root = {};

    suspData.forEach(r => {
      const esp = r.especialidad || 'Sin Especialidad';
      const cir = r.intervencion_propuesta || 'Sin Intervención Especificada';
      const med = r.cirujano || 'Sin Médico Asignado';
      const causaStr = `${r.causa_suspension || 'Sin Causa'} - ${r.motivo_suspension || 'Sin Motivo'}`;
      const monthKey = r.fecha_programacion ? r.fecha_programacion.substring(0, 7) : '2025-01';

      if (!root[esp]) root[esp] = { name: esp, level: 1, id: `esp:${esp}`, count: 0, months: {}, children: {} };
      root[esp].count++;
      root[esp].months[monthKey] = (root[esp].months[monthKey] || 0) + 1;

      if (!root[esp].children[cir]) root[esp].children[cir] = { name: cir, level: 2, id: `esp:${esp}|cir:${cir}`, count: 0, months: {}, children: {} };
      root[esp].children[cir].count++;
      root[esp].children[cir].months[monthKey] = (root[esp].children[cir].months[monthKey] || 0) + 1;

      if (!root[esp].children[cir].children[med]) root[esp].children[cir].children[med] = { name: med, level: 3, id: `esp:${esp}|cir:${cir}|med:${med}`, count: 0, months: {}, children: {} };
      root[esp].children[cir].children[med].count++;
      root[esp].children[cir].children[med].months[monthKey] = (root[esp].children[cir].children[med].months[monthKey] || 0) + 1;

      if (!root[esp].children[cir].children[med].children[causaStr]) root[esp].children[cir].children[med].children[causaStr] = { name: causaStr, level: 4, id: `esp:${esp}|cir:${cir}|med:${med}|cau:${causaStr}`, count: 0, months: {}, children: null };
      root[esp].children[cir].children[med].children[causaStr].count++;
      root[esp].children[cir].children[med].children[causaStr].months[monthKey] = (root[esp].children[cir].children[med].children[causaStr].months[monthKey] || 0) + 1;
    });

    return root;
  }, [suspData]);

  const visibleRows = useMemo(() => {
    const rows = [];
    const sortedEsps = Object.values(treeData).sort((a, b) => b.count - a.count);

    const traverse = (node, parentNode = null) => {
      rows.push({
        ...node,
        parentCount: parentNode ? parentNode.count : totalGeneralSusp,
        parentName: parentNode ? parentNode.name : 'Total General'
      });
      const isExpanded = expandedRows.has(node.id) || node.level < maxDepthLevel;
      if (isExpanded && node.children) {
        const childrenArr = Object.values(node.children).sort((a, b) => b.count - a.count);
        childrenArr.forEach(child => traverse(child, node));
      }
    };

    sortedEsps.forEach(espNode => traverse(espNode, null));
    return rows;
  }, [treeData, expandedRows, maxDepthLevel, totalGeneralSusp]);

  const toggleRow = (id) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleYear = (yr) => {
    setExpandedYears(prev => ({ ...prev, [yr]: prev[yr] === false ? true : false }));
  };

  const setLevelDepth = (level) => {
    setMaxDepthLevel(level);
    if (level === 1) {
      setExpandedRows(new Set());
    } else {
      const newExpanded = new Set();
      const addLevels = (obj, targetLevel) => {
        Object.values(obj).forEach(node => {
          if (node.level < targetLevel) {
            newExpanded.add(node.id);
            if (node.children) addLevels(node.children, targetLevel);
          }
        });
      };
      addLevels(treeData, level);
      setExpandedRows(newExpanded);
    }
  };

  const years = Object.keys(yearMonthsMap);

  return (
    <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', marginBottom: '32px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="#1e40af" />
            Tabla Dinámica Jerárquica de Suspensiones
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
            Desglose colapsable: Especialidad → Cirugía Suspendida → Médico → Causa / Motivo
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', background: '#f8fafc', padding: '6px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', padding: '0 6px', textTransform: 'uppercase' }}>Niveles:</span>
          <button onClick={() => setLevelDepth(1)} style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: maxDepthLevel === 1 ? 800 : 600, borderRadius: '8px', border: 'none', background: maxDepthLevel === 1 ? '#1e40af' : 'transparent', color: maxDepthLevel === 1 ? 'white' : '#475569', cursor: 'pointer', transition: 'all 0.2s' }}>1. Especialidad</button>
          <button onClick={() => setLevelDepth(2)} style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: maxDepthLevel === 2 ? 800 : 600, borderRadius: '8px', border: 'none', background: maxDepthLevel === 2 ? '#1e40af' : 'transparent', color: maxDepthLevel === 2 ? 'white' : '#475569', cursor: 'pointer', transition: 'all 0.2s' }}>2. Cirugía</button>
          <button onClick={() => setLevelDepth(3)} style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: maxDepthLevel === 3 ? 800 : 600, borderRadius: '8px', border: 'none', background: maxDepthLevel === 3 ? '#1e40af' : 'transparent', color: maxDepthLevel === 3 ? 'white' : '#475569', cursor: 'pointer', transition: 'all 0.2s' }}>3. Médico</button>
          <button onClick={() => setLevelDepth(4)} style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: maxDepthLevel === 4 ? 800 : 600, borderRadius: '8px', border: 'none', background: maxDepthLevel === 4 ? '#1e40af' : 'transparent', color: maxDepthLevel === 4 ? 'white' : '#475569', cursor: 'pointer', transition: 'all 0.2s' }}>4. Causa</button>
        </div>
      </div>

      <div style={{ overflowX: 'auto', maxHeight: '550px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.8rem' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 30, background: '#1e40af', color: 'white' }}>
            <tr>
              <th rowSpan={2} style={{ padding: '12px 16px', textAlign: 'left', position: 'sticky', left: 0, zIndex: 40, background: '#1e40af', borderRight: '1px solid rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.2)', minWidth: '320px' }}>
                Categoría Jerárquica (Filas)
              </th>
              {years.map(yr => {
                const months = yearMonthsMap[yr] || [];
                const isExpanded = expandedYears[yr] !== false;
                const colSpan = isExpanded ? months.length + 1 : 1;
                return (
                  <th key={yr} colSpan={colSpan} style={{ padding: '10px 14px', textAlign: 'center', background: '#1e3a8a', borderRight: '1px solid rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.2)', fontWeight: 800 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => toggleYear(yr)}>
                      <span>Año {yr}</span>
                      <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '6px' }}>
                        {isExpanded ? 'Colapsar meses' : 'Ver meses (+)'}
                      </span>
                    </div>
                  </th>
                );
              })}
              <th rowSpan={2} style={{ padding: '12px', textAlign: 'right', background: '#172554', borderRight: '1px solid rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.2)', minWidth: '90px' }}>Total Susp.</th>
              <th rowSpan={2} style={{ padding: '12px', textAlign: 'right', background: '#172554', borderBottom: '1px solid rgba(255,255,255,0.2)', minWidth: '100px' }}>% Total / Subt.</th>
            </tr>
            <tr>
              {years.map(yr => {
                const months = yearMonthsMap[yr] || [];
                const isExpanded = expandedYears[yr] !== false;
                if (isExpanded) {
                  return (
                    <React.Fragment key={`hdr-m-${yr}`}>
                      {months.map(mKey => {
                        const mNum = mKey.split('-')[1];
                        return (
                          <th key={mKey} style={{ padding: '8px 10px', textAlign: 'right', background: '#2563eb', borderRight: '1px solid rgba(255,255,255,0.15)', borderBottom: '1px solid rgba(255,255,255,0.2)', fontSize: '0.75rem', fontWeight: 600 }}>
                            {monthNames[mNum] || mNum}
                          </th>
                        );
                      })}
                      <th style={{ padding: '8px 10px', textAlign: 'right', background: '#1d4ed8', borderRight: '1px solid rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.2)', fontWeight: 800 }}>Total {yr}</th>
                    </React.Fragment>
                  );
                } else {
                  return (
                    <th key={`hdr-tot-${yr}`} style={{ padding: '8px 10px', textAlign: 'right', background: '#1d4ed8', borderRight: '1px solid rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.2)', fontWeight: 800 }}>Total {yr}</th>
                  );
                }
              })}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map(row => {
              const hasChildren = row.children && Object.keys(row.children).length > 0;
              const isRowExpanded = expandedRows.has(row.id) || row.level < maxDepthLevel;
              const indent = (row.level - 1) * 22;
              
              const parentCount = row.parentCount || totalGeneralSusp;
              const pctVal = parentCount > 0 ? ((row.count / parentCount) * 100).toFixed(1) : '0.0';
              const pctOfTotal = totalGeneralSusp > 0 ? ((row.count / totalGeneralSusp) * 100).toFixed(1) : '0.0';
              const isLevel1 = row.level === 1;

              const levelBg = row.level === 1 ? '#f8fafc' : row.level === 2 ? '#ffffff' : row.level === 3 ? '#fafafa' : '#f1f5f9';
              const levelFontWeight = row.level === 1 ? 800 : row.level === 2 ? 700 : row.level === 3 ? 600 : 500;
              const levelColor = row.level === 1 ? '#0f172a' : row.level === 2 ? '#1e3a8a' : row.level === 3 ? '#334155' : '#64748b';

              return (
                <tr key={row.id} style={{ background: levelBg, borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 16px', position: 'sticky', left: 0, background: levelBg, zIndex: 20, borderRight: '1px solid #e2e8f0' }}>
                    <div style={{ paddingLeft: `${indent}px`, display: 'flex', alignItems: 'center', gap: '8px', cursor: hasChildren ? 'pointer' : 'default' }} onClick={() => hasChildren && toggleRow(row.id)}>
                      {hasChildren ? (
                        <span style={{ fontSize: '0.75rem', width: '16px', height: '16px', borderRadius: '4px', background: '#e2e8f0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#1e40af', fontWeight: 900 }}>
                          {isRowExpanded ? '−' : '+'}
                        </span>
                      ) : (
                        <span style={{ width: '16px' }} />
                      )}
                      <span style={{ fontWeight: levelFontWeight, color: levelColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '380px' }} title={row.name}>
                        {row.name}
                      </span>
                    </div>
                  </td>

                  {years.map(yr => {
                    const months = yearMonthsMap[yr] || [];
                    const isExpanded = expandedYears[yr] !== false;
                    
                    let yrSum = 0;
                    months.forEach(mKey => { yrSum += (row.months[mKey] || 0); });

                    if (isExpanded) {
                      return (
                        <React.Fragment key={`cell-grp-${yr}-${row.id}`}>
                          {months.map(mKey => {
                            const val = row.months[mKey] || 0;
                            return (
                              <td key={`c-${mKey}`} style={{ padding: '8px 10px', textAlign: 'right', color: val > 0 ? '#0f172a' : '#cbd5e1', fontWeight: val > 0 ? 600 : 400, borderRight: '1px solid #f1f5f9' }}>
                                {val > 0 ? val : '-'}
                              </td>
                            );
                          })}
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: '#1e40af', background: 'rgba(30,64,175,0.03)', borderRight: '1px solid #e2e8f0' }}>
                            {yrSum > 0 ? yrSum : '-'}
                          </td>
                        </React.Fragment>
                      );
                    } else {
                      return (
                        <td key={`c-tot-${yr}`} style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: '#1e40af', background: 'rgba(30,64,175,0.03)', borderRight: '1px solid #e2e8f0' }}>
                          {yrSum > 0 ? yrSum : '-'}
                        </td>
                      );
                    }
                  })}

                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 900, color: '#0f172a', background: 'rgba(241,245,249,0.5)', borderRight: '1px solid #e2e8f0' }}>
                    {row.count}
                  </td>

                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 800 }}>
                    <span 
                      title={isLevel1 ? `${pctVal}% del total general` : `${pctVal}% del subtotal de ${row.parentName} (${pctOfTotal}% del total)`}
                      style={{ 
                        background: isLevel1 ? 'rgba(30,64,175,0.08)' : 'rgba(16,185,129,0.1)', 
                        color: isLevel1 ? '#1e40af' : '#047857',
                        padding: '2px 8px', 
                        borderRadius: '10px', 
                        fontSize: '0.75rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {pctVal}% {!isLevel1 && <span style={{ fontSize: '0.65rem', opacity: 0.85, fontWeight: 700 }}>(subt.)</span>}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot style={{ position: 'sticky', bottom: 0, zIndex: 30, background: '#1e3a8a', color: 'white' }}>
            <tr>
              <td style={{ padding: '12px 16px', position: 'sticky', left: 0, zIndex: 40, background: '#1e3a8a', fontWeight: 900, borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                TOTAL GENERAL DE SUSPENSIONES
              </td>
              {years.map(yr => {
                const months = yearMonthsMap[yr] || [];
                const isExpanded = expandedYears[yr] !== false;
                
                let yrTotal = 0;
                suspData.forEach(r => {
                  if (r.fecha_programacion && r.fecha_programacion.startsWith(yr)) yrTotal++;
                });

                if (isExpanded) {
                  return (
                    <React.Fragment key={`tf-${yr}`}>
                      {months.map(mKey => {
                        let mTotal = 0;
                        suspData.forEach(r => {
                          if (r.fecha_programacion && r.fecha_programacion.startsWith(mKey)) mTotal++;
                        });
                        return (
                          <td key={`tf-${mKey}`} style={{ padding: '10px', textAlign: 'right', fontWeight: 800, borderRight: '1px solid rgba(255,255,255,0.15)' }}>
                            {mTotal}
                          </td>
                        );
                      })}
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: 900, background: '#172554', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                        {yrTotal}
                      </td>
                    </React.Fragment>
                  );
                } else {
                  return (
                    <td key={`tf-tot-${yr}`} style={{ padding: '10px', textAlign: 'right', fontWeight: 900, background: '#172554', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                      {yrTotal}
                    </td>
                  );
                }
              })}
              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 900, fontSize: '0.95rem', background: '#0f172a', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                {totalGeneralSusp}
              </td>
              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 900, fontSize: '0.95rem', background: '#0f172a' }}>
                100.0%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

/* ==========================================================================
   COMPONENTE: PANEL DE ANÁLISIS DE HALLAZGOS ESTADÍSTICOS DEL PACIENTE SUSPENDIDO
   ========================================================================== */
const AnalisisHallazgosSuspensiones = ({ data = [] }) => {
  const stats = useMemo(() => {
    const susp = data.filter(r => r.estado === 'Suspendido');
    const total = susp.length;
    if (total === 0) return null;

    const prioMap = {};
    let infantiles = 0;
    let adultos = 0;
    let mayores = 0;
    let sumEdad = 0;
    let validEdadCount = 0;

    let masculino = 0;
    let femenino = 0;

    const cirugiasMap = {};
    let electiva = 0;
    let urgencia = 0;
    let ambulatoria = 0;
    let hospitalizado = 0;

    susp.forEach(r => {
      const p = r.priorizacion || 'No Especificada';
      prioMap[p] = (prioMap[p] || 0) + 1;

      const age = parseInt(r.edad, 10);
      if (!isNaN(age)) {
        sumEdad += age;
        validEdadCount++;
        if (age < 18) infantiles++;
        else if (age < 60) adultos++;
        else mayores++;
      }

      const s = String(r.sexo || '').toUpperCase();
      if (s.startsWith('M')) masculino++;
      else if (s.startsWith('F')) femenino++;

      const cir = r.intervencion_propuesta || 'Sin Nombre';
      cirugiasMap[cir] = (cirugiasMap[cir] || 0) + 1;

      const proc = (r.procedencia || '').toLowerCase();
      if (proc.includes('urg')) urgencia++;
      else electiva++;

      const mod = (r.modalidad || r.tipo_cirugia || '').toLowerCase();
      if (mod.includes('amb')) ambulatoria++;
      else hospitalizado++;
    });

    const topPrio = Object.entries(prioMap)
      .map(([name, count]) => ({ name, count, pct: ((count / total) * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count);

    const topCirugias = Object.entries(cirugiasMap)
      .map(([name, count]) => ({ name, count, pct: ((count / total) * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const avgAge = validEdadCount > 0 ? (sumEdad / validEdadCount).toFixed(1) : 0;

    return {
      total,
      topPrio,
      avgAge,
      infantiles,
      adultos,
      mayores,
      masculino,
      femenino,
      topCirugias,
      electiva,
      urgencia,
      ambulatoria,
      hospitalizado
    };
  }, [data]);

  if (!stats) return null;

  return (
    <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #0f172a)', borderRadius: '20px', padding: '24px', color: 'white', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.2)', marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '14px' }}>
        <TrendingUp size={24} color="#38bdf8" />
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>
            Análisis de Hallazgos Estadísticos del Paciente Suspendido
          </h3>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#93c5fd' }}>
            Perfil del paciente, origen de programación, prioridad clínica y cirugías de mayor impacto
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div style={{ background: 'rgba(255,255,255,0.07)', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Origen y Prioridad Clínica
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stats.topPrio.map((p, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                  <span style={{ fontWeight: 800, color: '#60a5fa' }}>{p.count} ({p.pct}%)</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.15)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ background: '#38bdf8', height: '100%', width: `${p.pct}%`, borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.07)', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Perfil Sociodemográfico
          </h4>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '14px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 900, color: '#60a5fa' }}>{stats.avgAge}</span>
            <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>años edad promedio</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px', textAlign: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '8px', borderRadius: '10px' }}>
              <span style={{ display: 'block', fontSize: '0.65rem', opacity: 0.7, textTransform: 'uppercase' }}>Mayor (60+)</span>
              <strong style={{ fontSize: '1.1rem', color: '#fcd34d' }}>{stats.mayores}</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '8px', borderRadius: '10px' }}>
              <span style={{ display: 'block', fontSize: '0.65rem', opacity: 0.7, textTransform: 'uppercase' }}>Adulto (18-59)</span>
              <strong style={{ fontSize: '1.1rem', color: '#60a5fa' }}>{stats.adultos}</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '8px', borderRadius: '10px' }}>
              <span style={{ display: 'block', fontSize: '0.65rem', opacity: 0.7, textTransform: 'uppercase' }}>Infantil (&lt;18)</span>
              <strong style={{ fontSize: '1.1rem', color: '#f472b6' }}>{stats.infantiles}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.8rem', opacity: 0.9, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
            <span>Masculino: <strong>{stats.masculino}</strong></span>
            <span>Femenino: <strong>{stats.femenino}</strong></span>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.07)', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', fontWeight: 800, color: '#fcd34d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Top Intervenciones Suspendidas
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stats.topCirugias.map((c, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '8px' }}>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }} title={c.name}>
                  {idx + 1}. {c.name}
                </span>
                <span style={{ fontWeight: 800, color: '#fcd34d', whiteSpace: 'nowrap' }}>
                  {c.count} ({c.pct}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   COMPONENTE: ANÁLISIS AVANZADO DE CIRUJANOS, ANESTESIÓLOGOS Y CAUSAS
   ========================================================================== */
const AnalisisCirujanosYCausas = ({ data = [] }) => {
  const [viewMode, setViewMode] = useState('cirujano');
  const [selectedProf, setSelectedProf] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { totalGeneral, profList, causeList, paretoData, kpis } = useMemo(() => {
    const susp = data.filter(r => r.estado === 'Suspendido');
    const totalGeneral = susp.length;

    const isGestionHospitalaria = (causaStr = '', motivoStr = '') => {
      const c = (causaStr + ' ' + motivoStr).toLowerCase();
      return c.includes('tabla') || c.includes('tiempo') || c.includes('examen') || 
             c.includes('insumo') || c.includes('pabellon') || c.includes('cama') || 
             c.includes('administrativ') || c.includes('personal') || c.includes('equipo') ||
             c.includes('anestesi') || c.includes('cirujan');
    };

    let totalEvitable = 0;
    const profMap = {};
    const causaMap = {};

    susp.forEach(r => {
      const cir = r.cirujano || r.primer_cirujano || 'Sin Médico Asignado';
      const ane = (r.anestesista || r.anestesiologo || '').trim() || 'Sin Anestesiólogo Especificado';
      const causa = r.causa_suspension || 'Sin Causa Especificada';
      const motivo = r.motivo_suspension || '';
      const esp = r.especialidad || 'General';
      const evitable = isGestionHospitalaria(causa, motivo);
      if (evitable) totalEvitable++;

      const targetProfKey = viewMode === 'anestesiologo' ? ane : cir;

      if (!profMap[targetProfKey]) {
        profMap[targetProfKey] = {
          name: targetProfKey,
          especialidad: esp,
          total: 0,
          evitableCount: 0,
          causas: {},
          intervenciones: {}
        };
      }
      profMap[targetProfKey].total++;
      if (evitable) profMap[targetProfKey].evitableCount++;
      
      profMap[targetProfKey].causas[causa] = (profMap[targetProfKey].causas[causa] || 0) + 1;

      const int = r.intervencion_propuesta || 'No Especificada';
      profMap[targetProfKey].intervenciones[int] = (profMap[targetProfKey].intervenciones[int] || 0) + 1;

      if (!causaMap[causa]) {
        causaMap[causa] = { name: causa, total: 0, isEvitable: evitable, profesionales: {}, especialidades: {} };
      }
      causaMap[causa].total++;
      causaMap[causa].profesionales[targetProfKey] = (causaMap[causa].profesionales[targetProfKey] || 0) + 1;
      causaMap[causa].especialidades[esp] = (causaMap[causa].especialidades[esp] || 0) + 1;
    });

    const profList = Object.values(profMap).sort((a, b) => b.total - a.total);
    const causeList = Object.values(causaMap).sort((a, b) => b.total - a.total);

    let accum = 0;
    const paretoData = causeList.slice(0, 10).map(c => {
      accum += c.total;
      return {
        name: c.name.length > 25 ? c.name.substring(0, 25) + '...' : c.name,
        fullName: c.name,
        total: c.total,
        pct: totalGeneral > 0 ? parseFloat(((c.total / totalGeneral) * 100).toFixed(1)) : 0,
        accumPct: totalGeneral > 0 ? parseFloat(((accum / totalGeneral) * 100).toFixed(1)) : 0
      };
    });

    const pctEvitableGlobal = totalGeneral > 0 ? ((totalEvitable / totalGeneral) * 100).toFixed(1) : '0.0';
    const topProf = profList[0] ? profList[0].name : 'N/A';
    const topCausa = causeList[0] ? causeList[0].name : 'N/A';

    return {
      suspData: susp,
      totalGeneral,
      profList,
      causeList,
      paretoData,
      kpis: { totalGeneral, totalEvitable, pctEvitableGlobal, topProf, topCausa }
    };
  }, [data, viewMode]);

  const filteredProfList = useMemo(() => {
    if (!searchQuery) return profList;
    return profList.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.especialidad.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [profList, searchQuery]);

  if (totalGeneral === 0) return null;

  return (
    <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', marginBottom: '32px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={24} color="#1e40af" />
            Análisis Impacto por Cirujano, Anestesiólogo & Causas
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            Evaluación de peso porcentual de suspensiones e indicadores de evitabilidad para toma de decisiones
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', background: '#f8fafc', padding: '6px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <button
            onClick={() => { setViewMode('cirujano'); setSelectedProf(null); }}
            style={{
              padding: '8px 16px', fontSize: '0.8rem', fontWeight: viewMode === 'cirujano' ? 800 : 600,
              borderRadius: '10px', border: 'none',
              background: viewMode === 'cirujano' ? 'linear-gradient(135deg, #1e40af, #1d4ed8)' : 'transparent',
              color: viewMode === 'cirujano' ? 'white' : '#475569', cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: viewMode === 'cirujano' ? '0 4px 12px rgba(30, 64, 175, 0.25)' : 'none'
            }}
          >
            👨‍⚕️ Por Cirujano
          </button>
          <button
            onClick={() => { setViewMode('anestesiologo'); setSelectedProf(null); }}
            style={{
              padding: '8px 16px', fontSize: '0.8rem', fontWeight: viewMode === 'anestesiologo' ? 800 : 600,
              borderRadius: '10px', border: 'none',
              background: viewMode === 'anestesiologo' ? 'linear-gradient(135deg, #0d9488, #0f766e)' : 'transparent',
              color: viewMode === 'anestesiologo' ? 'white' : '#475569', cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: viewMode === 'anestesiologo' ? '0 4px 12px rgba(13, 148, 136, 0.25)' : 'none'
            }}
          >
            💉 Por Anestesiólogo
          </button>
          <button
            onClick={() => { setViewMode('causa'); setSelectedProf(null); }}
            style={{
              padding: '8px 16px', fontSize: '0.8rem', fontWeight: viewMode === 'causa' ? 800 : 600,
              borderRadius: '10px', border: 'none',
              background: viewMode === 'causa' ? 'linear-gradient(135deg, #ea580c, #c2410c)' : 'transparent',
              color: viewMode === 'causa' ? 'white' : '#475569', cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: viewMode === 'causa' ? '0 4px 12px rgba(234, 88, 12, 0.25)' : 'none'
            }}
          >
            ⚠️ Matriz & Pareto de Causas
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', borderLeft: '5px solid #1e40af' }}>
          <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Total Suspensiones</p>
          <h4 style={{ margin: '4px 0 0 0', fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>{kpis.totalGeneral}</h4>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Registros analizados</span>
        </div>
        <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', borderLeft: '5px solid #ea580c' }}>
          <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Causas de Gestión Evitables</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <h4 style={{ margin: '4px 0 0 0', fontSize: '1.8rem', fontWeight: 900, color: '#ea580c' }}>{kpis.totalEvitable}</h4>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ea580c' }}>({kpis.pctEvitableGlobal}%)</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Atribuibles a gestión hospitalaria</span>
        </div>
        <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', borderLeft: '5px solid #0d9488' }}>
          <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Top Profesional Afectado</p>
          <h4 style={{ margin: '4px 0 0 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={kpis.topProf}>{kpis.topProf}</h4>
          <span style={{ fontSize: '0.72rem', color: '#0d9488', fontWeight: 700 }}>Mayor volumen acumulado</span>
        </div>
        <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', borderLeft: '5px solid #8b5cf6' }}>
          <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Causa Frecuente #1</p>
          <h4 style={{ margin: '4px 0 0 0', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={kpis.topCausa}>{kpis.topCausa}</h4>
          <span style={{ fontSize: '0.72rem', color: '#8b5cf6', fontWeight: 700 }}>Foco de gestión prioritario</span>
        </div>
      </div>

      {(viewMode === 'cirujano' || viewMode === 'anestesiologo') && (
        <div>
          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={`Buscar ${viewMode === 'cirujano' ? 'cirujano' : 'anestesiólogo'}...`}
                style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
              Mostrando {filteredProfList.length} profesionales
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px', maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
            {filteredProfList.map(prof => {
              const pctOfAll = totalGeneral > 0 ? ((prof.total / totalGeneral) * 100).toFixed(1) : '0.0';
              const pctEvit = prof.total > 0 ? ((prof.evitableCount / prof.total) * 100).toFixed(1) : '0.0';

              const sortedCausas = Object.entries(prof.causas)
                .map(([cName, cCount]) => ({ name: cName, count: cCount, pctOfProf: ((cCount / prof.total) * 100).toFixed(1) }))
                .sort((a, b) => b.count - a.count);

              const isSelected = selectedProf === prof.name;

              return (
                <motion.div
                  key={prof.name}
                  whileHover={{ y: -2 }}
                  onClick={() => setSelectedProf(isSelected ? null : prof.name)}
                  style={{
                    background: isSelected ? '#f0f9ff' : '#ffffff',
                    border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '18px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ flex: 1, paddingRight: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{prof.name}</h4>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{prof.especialidad}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ background: '#1e40af', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 900 }}>
                        {prof.total} cx
                      </span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>
                        {pctOfAll}% del total
                      </p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '14px', background: '#f8fafc', padding: '8px 12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '4px' }}>
                      <span style={{ color: '#475569', fontWeight: 700 }}>Causas de Gestión Evitables</span>
                      <span style={{ color: '#ea580c', fontWeight: 800 }}>{pctEvit}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pctEvit}%`, height: '100%', background: 'linear-gradient(90deg, #f97316, #ea580c)', borderRadius: '3px' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                      Peso Porcentual por Causa (Subtotal):
                    </p>
                    {sortedCausas.slice(0, 3).map(c => (
                      <div key={c.name} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                          <span style={{ color: '#334155', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px' }} title={c.name}>
                            {c.name}
                          </span>
                          <span style={{ fontWeight: 800, color: '#0f172a' }}>
                            {c.count} ({c.pctOfProf}%)
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${c.pctOfProf}%`, height: '100%', background: '#3b82f6', borderRadius: '2px' }} />
                        </div>
                      </div>
                    ))}
                    {sortedCausas.length > 3 && (
                      <span style={{ fontSize: '0.7rem', color: '#1e40af', fontWeight: 700, marginTop: '2px' }}>
                        + {sortedCausas.length - 3} causas más...
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'causa' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              Gráfico de Pareto 80/20 de Causas de Suspensión
            </h4>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.78rem', color: '#64748b' }}>
              Barras: Volumen por Causa | Línea: % Acumulado para identificar las causas críticas
            </p>
            <div style={{ height: '380px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={paretoData} margin={{ top: 20, right: 20, left: -10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" interval={0} angle={-25} textAnchor="end" tick={{ fontSize: 10, fill: '#475569' }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} unit="%" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <RechartsTooltip formatter={(val, name) => [name === 'accumPct' ? `${val}%` : val, name === 'accumPct' ? '% Acumulado' : 'Total Suspensiones']} />
                  <Bar yAxisId="left" dataKey="total" fill="#1e40af" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="total" position="top" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#1e40af' }} />
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="accumPct" stroke="#ea580c" strokeWidth={3} dot={{ r: 4, fill: '#ea580c' }} />
                  <ReferenceLine yAxisId="right" y={80} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Regla 80%', fill: '#ef4444', fontSize: 10, fontWeight: 800 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              Matriz de Concentración y Evitabilidad
            </h4>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.78rem', color: '#64748b' }}>
              Desglose de causas y su distribución relativa
            </p>
            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '380px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ background: '#1e40af', color: 'white', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px', borderRadius: '6px 0 0 6px' }}>Causa de Suspensión</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>% Total</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', borderRadius: '0 6px 6px 0' }}>Origen</th>
                  </tr>
                </thead>
                <tbody>
                  {causeList.map((c, i) => {
                    const pct = totalGeneral > 0 ? ((c.total / totalGeneral) * 100).toFixed(1) : '0.0';
                    return (
                      <tr key={c.name} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }}>{c.name}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 800, color: '#1e40af' }}>{c.total}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 800, color: '#475569' }}>{pct}%</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <span style={{
                            fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '8px',
                            background: c.isEvitable ? 'rgba(234, 88, 12, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                            color: c.isEvitable ? '#ea580c' : '#2563eb'
                          }}>
                            {c.isEvitable ? 'Gestión' : 'Paciente'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================
   INSUMOS Y COSTEO DASHBOARD
   ============================================================ */
const INSUMOS_COLORS = [
  '#10b981','#059669','#047857','#065f46','#34d399','#6ee7b7',
  '#14b8a6','#0d9488','#0891b2','#0284c7','#7c3aed','#a855f7',
  '#e11d48','#f59e0b','#84cc16','#ef4444'
];
const formatCLP = (v) => {
  if (v === null || v === undefined || isNaN(v)) return '$0';
  return `$${Math.round(Number(v) || 0).toLocaleString('es-CL')}`;
};

function InsumosCosteoDashboard({
  rawDataLibro,
  insumosData,
  insumosLoading,
  insumosLastUpdated,
  insumosError
}) {
  // Filter states
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [selectedEspecialidades, setSelectedEspecialidades] = useState([]);
  const [selectedCirujanos, setSelectedCirujanos] = useState([]);
  const [selectedTiposPaciente, setSelectedTiposPaciente] = useState([]);
  const [selectedTiposCirugia, setSelectedTiposCirugia] = useState([]);
  const [insumosSearch, setInsumosSearch] = useState('');
  const [drillOpen, setDrillOpen] = useState(new Set());

  // Enriched data: incorporates all new variables from the updated API query
  const enrichedData = useMemo(() => {
    return (insumosData || []).map(item => {
      const total = Number(item.total) || 0;
      const precio_compra = Number(item.precio_compra) || Number(item.precio_unitario) || 0;
      const cantidad = Number(item.cantidad) || 0;
      const fecha = item.fecha_programacion ? String(item.fecha_programacion).substring(0, 10) : '';
      const especialidad = item.especialidad && item.especialidad.trim() ? item.especialidad.trim() : 'Sin Especialidad';
      const cirujano = item.cirujano && item.cirujano.trim() ? item.cirujano.trim() : 'Sin Cirujano';
      const tipo_cirugia = item.tipo_cirugia && item.tipo_cirugia.trim() ? item.tipo_cirugia.trim() : 'Sin Tipo';
      const tipo_paciente = item.tipo_paciente && item.tipo_paciente.trim() ? item.tipo_paciente.trim() : 'Sin Clasificación';
      const intervencion = item.intervencion && item.intervencion.trim() ? item.intervencion.trim() : 'Sin Intervención';
      const surgeryId = item.id_cirugia ? String(item.id_cirugia) : [fecha, cirujano, intervencion, item.edad || '', item.sexo || ''].join('__');

      return {
        ...item,
        total,
        precio_compra,
        cantidad,
        fecha,
        especialidad,
        cirujano,
        tipo_cirugia,
        tipo_paciente,
        intervencion,
        surgeryId
      };
    });
  }, [insumosData]);

  // Options for all filters
  const filterOptions = useMemo(() => {
    const especialidades = new Set();
    const cirujanos = new Set();
    const tiposPaciente = new Set();
    const tiposCirugia = new Set();
    let minDate = '';
    let maxDate = '';

    enrichedData.forEach(r => {
      if (r.especialidad) especialidades.add(r.especialidad);
      if (r.cirujano) cirujanos.add(r.cirujano);
      if (r.tipo_paciente) tiposPaciente.add(r.tipo_paciente);
      if (r.tipo_cirugia) tiposCirugia.add(r.tipo_cirugia);
      if (r.fecha) {
        if (!minDate || r.fecha < minDate) minDate = r.fecha;
        if (!maxDate || r.fecha > maxDate) maxDate = r.fecha;
      }
    });

    return {
      especialidades: Array.from(especialidades).sort(),
      cirujanos: Array.from(cirujanos).sort(),
      tiposPaciente: Array.from(tiposPaciente).sort(),
      tiposCirugia: Array.from(tiposCirugia).sort(),
      minDate,
      maxDate
    };
  }, [enrichedData]);

  // Apply filters
  const filtered = useMemo(() => {
    return enrichedData.filter(r => {
      if (fechaDesde && r.fecha && r.fecha < fechaDesde) return false;
      if (fechaHasta && r.fecha && r.fecha > fechaHasta) return false;
      if (selectedEspecialidades.length > 0 && !selectedEspecialidades.includes(r.especialidad)) return false;
      if (selectedCirujanos.length > 0 && !selectedCirujanos.includes(r.cirujano)) return false;
      if (selectedTiposPaciente.length > 0 && !selectedTiposPaciente.includes(r.tipo_paciente)) return false;
      if (selectedTiposCirugia.length > 0 && !selectedTiposCirugia.includes(r.tipo_cirugia)) return false;
      if (insumosSearch.trim()) {
        const q = insumosSearch.trim().toLowerCase();
        const matchDesc = (r.descripcion || '').toLowerCase().includes(q);
        const matchIq = (r.intervencion || '').toLowerCase().includes(q);
        const matchCir = (r.cirujano || '').toLowerCase().includes(q);
        if (!matchDesc && !matchIq && !matchCir) return false;
      }
      return true;
    });
  }, [enrichedData, fechaDesde, fechaHasta, selectedEspecialidades, selectedCirujanos, selectedTiposPaciente, selectedTiposCirugia, insumosSearch]);

  // Reset all filters
  const hasActiveFilters = Boolean(
    fechaDesde || fechaHasta ||
    selectedEspecialidades.length > 0 ||
    selectedCirujanos.length > 0 ||
    selectedTiposPaciente.length > 0 ||
    selectedTiposCirugia.length > 0 ||
    insumosSearch.trim()
  );

  const handleClearFilters = () => {
    setFechaDesde('');
    setFechaHasta('');
    setSelectedEspecialidades([]);
    setSelectedCirujanos([]);
    setSelectedTiposPaciente([]);
    setSelectedTiposCirugia([]);
    setInsumosSearch('');
  };

  // KPIs
  const kpis = useMemo(() => {
    const totalCosto = filtered.reduce((s, r) => s + r.total, 0);
    const totalRegistros = filtered.length;
    const uniqueSurgeries = new Set(filtered.map(r => r.surgeryId));
    const totalCirugias = uniqueSurgeries.size;
    const costoPromedioCirugia = totalCirugias > 0 ? Math.round(totalCosto / totalCirugias) : 0;
    const especialidadesUnicas = new Set(filtered.map(r => r.especialidad)).size;

    const insumoMap = new Map();
    filtered.forEach(r => {
      const key = r.descripcion || 'Sin descripción';
      insumoMap.set(key, (insumoMap.get(key) || 0) + r.total);
    });
    const sortedInsumos = [...insumoMap.entries()].sort((a, b) => b[1] - a[1]);
    const topInsumo = sortedInsumos.length > 0 ? sortedInsumos[0][0] : '-';
    const topInsumoCosto = sortedInsumos.length > 0 ? sortedInsumos[0][1] : 0;

    return {
      totalCosto,
      totalRegistros,
      totalCirugias,
      costoPromedioCirugia,
      especialidadesUnicas,
      topInsumo,
      topInsumoCosto
    };
  }, [filtered]);

  // Chart 1: Costo Promedio por Especialidad
  const especialidadPromedios = useMemo(() => {
    const map = new Map();
    filtered.forEach(r => {
      if (!map.has(r.especialidad)) {
        map.set(r.especialidad, { totalCost: 0, surgeries: new Set() });
      }
      const entry = map.get(r.especialidad);
      entry.totalCost += r.total;
      entry.surgeries.add(r.surgeryId);
    });

    return [...map.entries()]
      .map(([name, data]) => {
        const nSurgeries = data.surgeries.size || 1;
        const promedio = Math.round(data.totalCost / nSurgeries);
        return {
          name,
          promedio,
          totalCost: data.totalCost,
          nSurgeries
        };
      })
      .sort((a, b) => b.promedio - a.promedio);
  }, [filtered]);

  // Chart 2: Top 10 Cirugías por Costo Promedio de Insumos
  const topCirugiasPromedio = useMemo(() => {
    const map = new Map();
    filtered.forEach(r => {
      const key = r.intervencion || 'Sin Intervención';
      if (!map.has(key)) {
        map.set(key, { totalCost: 0, surgeries: new Set() });
      }
      const entry = map.get(key);
      entry.totalCost += r.total;
      entry.surgeries.add(r.surgeryId);
    });

    return [...map.entries()]
      .map(([fullName, data]) => {
        const nSurgeries = data.surgeries.size || 1;
        const promedio = Math.round(data.totalCost / nSurgeries);
        return {
          fullName,
          name: fullName.length > 38 ? fullName.substring(0, 36) + '…' : fullName,
          promedio,
          totalCost: data.totalCost,
          nSurgeries
        };
      })
      .sort((a, b) => b.promedio - a.promedio)
      .slice(0, 10);
  }, [filtered]);

  // Drill-down Table: Especialidad → Cirugía → Insumos (con división Pareto 90% / 10%)
  const drilldownData = useMemo(() => {
    const especMap = new Map();

    filtered.forEach(r => {
      const espec = r.especialidad;
      if (!especMap.has(espec)) {
        especMap.set(espec, {
          totalCost: 0,
          surgeries: new Set(),
          cirugiasMap: new Map()
        });
      }
      const eData = especMap.get(espec);
      eData.totalCost += r.total;
      eData.surgeries.add(r.surgeryId);

      const cKey = r.intervencion || 'Sin Intervención';
      if (!eData.cirugiasMap.has(cKey)) {
        eData.cirugiasMap.set(cKey, {
          totalCost: 0,
          surgeries: new Set(),
          insumosMap: new Map()
        });
      }
      const cData = eData.cirugiasMap.get(cKey);
      cData.totalCost += r.total;
      cData.surgeries.add(r.surgeryId);

      // Insumos grouping by descripcion
      const iKey = r.descripcion || 'Sin descripción';
      if (!cData.insumosMap.has(iKey)) {
        cData.insumosMap.set(iKey, {
          descripcion: iKey,
          codigo: r.codigo_insumo || '',
          cantidad: 0,
          total: 0,
          precio_compra: r.precio_compra
        });
      }
      const iData = cData.insumosMap.get(iKey);
      iData.cantidad += r.cantidad;
      iData.total += r.total;
    });

    return [...especMap.entries()]
      .sort((a, b) => b[1].totalCost - a[1].totalCost)
      .map(([espec, eData]) => {
        const totalCirugiasEspecialidad = eData.surgeries.size;
        const costoPromedioEspecialidad = totalCirugiasEspecialidad > 0
          ? Math.round(eData.totalCost / totalCirugiasEspecialidad)
          : 0;

        const cirugias = [...eData.cirugiasMap.entries()]
          .sort((a, b) => b[1].totalCost - a[1].totalCost)
          .map(([cirugiaName, cData]) => {
            const totalCirugiasCirugia = cData.surgeries.size;
            const costoPromedioCirugia = totalCirugiasCirugia > 0
              ? Math.round(cData.totalCost / totalCirugiasCirugia)
              : 0;

            // Insumos list sorted by quantity (usage)
            const sortedInsumos = [...cData.insumosMap.values()]
              .sort((a, b) => b.cantidad - a.cantidad);

            const totalQuantity = sortedInsumos.reduce((s, i) => s + i.cantidad, 0);

            // Separate into top 90% most used and bottom 10% least used
            let cumulativeQty = 0;
            const top90Insumos = [];
            const bottom10Insumos = [];

            sortedInsumos.forEach(item => {
              if (totalQuantity === 0 || (cumulativeQty / totalQuantity) < 0.90 || top90Insumos.length === 0) {
                top90Insumos.push(item);
                cumulativeQty += item.cantidad;
              } else {
                bottom10Insumos.push(item);
              }
            });

            return {
              cirugiaName,
              totalCost: cData.totalCost,
              totalCirugias: totalCirugiasCirugia,
              costoPromedio: costoPromedioCirugia,
              totalInsumosCount: sortedInsumos.length,
              top90Insumos,
              bottom10Insumos
            };
          });

        return {
          especialidad: espec,
          totalCost: eData.totalCost,
          totalCirugias: totalCirugiasEspecialidad,
          costoPromedio: costoPromedioEspecialidad,
          cirugias
        };
      });
  }, [filtered]);

  const toggleDrill = (key) => {
    setDrillOpen(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Styles
  const S = {
    page: { padding: '32px', background: '#f0fdf4', minHeight: '100vh' },
    header: { marginBottom: '24px' },
    title: { fontSize: '1.8rem', fontWeight: 800, color: '#064e3b', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' },
    subtitle: { color: '#6b7280', fontSize: '0.95rem', marginTop: '6px' },
    filterCard: { background: 'white', borderRadius: '16px', padding: '20px 24px', border: '1.5px solid #d1fae5', boxShadow: '0 4px 20px rgba(16,185,129,0.06)', marginBottom: '24px' },
    filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'flex-end' },
    filterGroup: { display: 'flex', flexDirection: 'column' },
    filterLabel: { fontSize: '0.74rem', fontWeight: 700, color: '#047857', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' },
    input: { padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #a7f3d0', background: 'white', fontSize: '0.85rem', outline: 'none', color: '#064e3b', width: '100%' },
    kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' },
    kpiCard: { background: 'white', borderRadius: '16px', padding: '20px', border: '1.5px solid #d1fae5', boxShadow: '0 4px 20px rgba(16,185,129,0.08)', display: 'flex', flexDirection: 'column', gap: '6px' },
    kpiLabel: { fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' },
    kpiValue: { fontSize: '1.55rem', fontWeight: 900, color: '#064e3b', lineHeight: 1.15 },
    kpiSub: { fontSize: '0.72rem', color: '#10b981', fontWeight: 600 },
    chartGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' },
    card: { background: 'white', borderRadius: '18px', padding: '24px', border: '1.5px solid #d1fae5', boxShadow: '0 4px 20px rgba(16,185,129,0.06)' },
    cardTitle: { fontSize: '0.95rem', fontWeight: 700, color: '#064e3b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
    tableWrap: { overflowX: 'auto', borderRadius: '14px', border: '1.5px solid #d1fae5', background: 'white' },
    thead: { background: 'linear-gradient(135deg, #064e3b, #065f46)', color: 'white', fontSize: '0.78rem', fontWeight: 700 },
    th: { padding: '14px 18px', textAlign: 'left', whiteSpace: 'nowrap' },
    td: { padding: '11px 18px', borderBottom: '1px solid #ecfdf5' },
  };

  if (insumosLoading) return (
    <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ textAlign: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
          style={{ width: 56, height: 56, border: '4px solid #d1fae5', borderTopColor: '#10b981', borderRadius: '50%', margin: '0 auto 16px' }} />
        <p style={{ color: '#10b981', fontWeight: 700, fontSize: '1rem' }}>Cargando datos de insumos y costeo...</p>
      </div>
    </div>
  );

  if (insumosError) return (
    <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '40px', border: '2px solid #fecaca', textAlign: 'center', maxWidth: '500px' }}>
        <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
        <h3 style={{ color: '#ef4444', marginTop: 0 }}>Error al cargar insumos</h3>
        <p style={{ color: '#6b7280' }}>{insumosError}</p>
        <p style={{ color: '#9ca3af', fontSize: '0.82rem' }}>Verifica la conexión a la API de pabellón.</p>
      </div>
    </div>
  );

  if (enrichedData.length === 0 && !insumosLoading) return (
    <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '40px', border: '2px solid #d1fae5', textAlign: 'center', maxWidth: '500px' }}>
        <Package size={48} color="#10b981" style={{ marginBottom: '16px' }} />
        <h3 style={{ color: '#064e3b', marginTop: 0 }}>Sin datos de insumos</h3>
        <p style={{ color: '#6b7280' }}>No se encontraron registros de insumos quirúrgicos.</p>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <h2 style={S.title}>
          <div style={{ width: 44, height: 44, borderRadius: '14px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(16,185,129,0.35)' }}>
            <DollarSign size={24} color="white" />
          </div>
          Insumos y Costeo Quirúrgico
        </h2>
        <p style={S.subtitle}>
          Visualización descriptiva de costos de insumos por especialidad, cirujano y procedimiento · {enrichedData.length.toLocaleString('es-CL')} registros totales cargados
          {insumosLastUpdated && (
            <span style={{ marginLeft: 10, padding: '3px 10px', borderRadius: '999px', background: '#d1fae5', color: '#047857', fontWeight: 700, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
              Última actualización: {new Date(insumosLastUpdated).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </p>
      </div>

      {/* Filter Panel */}
      <div style={S.filterCard}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#064e3b', fontSize: '0.88rem' }}>
            <Filter size={16} color="#10b981" /> Filtros de Análisis
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                style={{ padding: '6px 12px', borderRadius: '8px', border: '1.5px solid #fca5a5', background: '#fff1f2', color: '#dc2626', fontWeight: 700, cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <XCircle size={14} /> Limpiar filtros
              </button>
            )}
            <span style={{ background: '#ecfdf5', color: '#047857', borderRadius: '20px', padding: '4px 12px', fontSize: '0.78rem', fontWeight: 700, border: '1px solid #a7f3d0' }}>
              {filtered.length.toLocaleString('es-CL')} de {enrichedData.length.toLocaleString('es-CL')} registros
            </span>
          </div>
        </div>

        <div style={S.filterGrid}>
          {/* Fecha Desde */}
          <div style={S.filterGroup}>
            <div style={S.filterLabel}>📅 Fecha Intervención Desde</div>
            <input
              type="date"
              style={S.input}
              value={fechaDesde}
              onChange={e => setFechaDesde(e.target.value)}
            />
          </div>

          {/* Fecha Hasta */}
          <div style={S.filterGroup}>
            <div style={S.filterLabel}>📅 Fecha Intervención Hasta</div>
            <input
              type="date"
              style={S.input}
              value={fechaHasta}
              onChange={e => setFechaHasta(e.target.value)}
            />
          </div>

          {/* Especialidad */}
          <div style={S.filterGroup}>
            <div style={S.filterLabel}>🏥 Especialidad</div>
            <MultiSearchableSelect
              value={selectedEspecialidades}
              options={filterOptions.especialidades}
              onChange={setSelectedEspecialidades}
            />
          </div>

          {/* Cirujano */}
          <div style={S.filterGroup}>
            <div style={S.filterLabel}>👨‍⚕️ Cirujano</div>
            <MultiSearchableSelect
              value={selectedCirujanos}
              options={filterOptions.cirujanos}
              onChange={setSelectedCirujanos}
            />
          </div>

          {/* Tipo Paciente */}
          <div style={S.filterGroup}>
            <div style={S.filterLabel}>👥 Tipo de Paciente</div>
            <MultiSearchableSelect
              value={selectedTiposPaciente}
              options={filterOptions.tiposPaciente}
              onChange={setSelectedTiposPaciente}
            />
          </div>

          {/* Tipo Cirugia */}
          <div style={S.filterGroup}>
            <div style={S.filterLabel}>🔪 Tipo de Cirugía</div>
            <MultiSearchableSelect
              value={selectedTiposCirugia}
              options={filterOptions.tiposCirugia}
              onChange={setSelectedTiposCirugia}
            />
          </div>

          {/* Buscador de insumo / cirugía */}
          <div style={{ ...S.filterGroup, gridColumn: 'span 2' }}>
            <div style={S.filterLabel}>🔍 Buscar Insumo o Intervención</div>
            <input
              style={S.input}
              placeholder="Ej: gasa, prótesis, colecistectomía, Franz..."
              value={insumosSearch}
              onChange={e => setInsumosSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* KPI Cards (Valores no resumidos) */}
      <div style={S.kpiGrid}>
        {[
          {
            icon: <DollarSign size={20} color="#10b981" />,
            label: 'Costo Total Acumulado',
            value: formatCLP(kpis.totalCosto),
            sub: `${kpis.totalRegistros.toLocaleString('es-CL')} líneas de insumos`
          },
          {
            icon: <CheckCircle size={20} color="#059669" />,
            label: 'Cirugías Realizadas',
            value: kpis.totalCirugias.toLocaleString('es-CL'),
            sub: 'intervenciones únicas costeadas'
          },
          {
            icon: <TrendingUp size={20} color="#047857" />,
            label: 'Costo Promedio / Cirugía',
            value: formatCLP(kpis.costoPromedioCirugia),
            sub: 'gasto medio en insumos por cirugía'
          },
          {
            icon: <Activity size={20} color="#065f46" />,
            label: 'Especialidades Activas',
            value: kpis.especialidadesUnicas,
            sub: 'especialidades quirúrgicas'
          },
          {
            icon: <Award size={20} color="#10b981" />,
            label: 'Insumo de Mayor Costo',
            value: formatCLP(kpis.topInsumoCosto),
            sub: kpis.topInsumo.length > 28 ? kpis.topInsumo.substring(0, 26) + '…' : kpis.topInsumo
          },
        ].map((k, i) => (
          <motion.div key={i} style={S.kpiCard} whileHover={{ y: -3, boxShadow: '0 8px 30px rgba(16,185,129,0.18)' }} transition={{ duration: 0.2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              {k.icon}
              <span style={S.kpiLabel}>{k.label}</span>
            </div>
            <div style={S.kpiValue}>{k.value}</div>
            <div style={S.kpiSub}>{k.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts con Costos Promedios de Insumos */}
      <div style={S.chartGrid}>
        {/* Chart 1: Costo Promedio por Especialidad */}
        <div style={S.card}>
          <div style={S.cardTitle}>
            <BarChart2 size={18} color="#10b981" /> Costo Promedio de Insumos por Especialidad
          </div>
          <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '14px' }}>
            Calculado dividiendo el costo total de insumos entre el total de cirugías realizadas en cada especialidad.
          </div>
          {especialidadPromedios.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={especialidadPromedios} layout="vertical" margin={{ top: 0, right: 35, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ecfdf5" />
                <XAxis type="number" tickFormatter={formatCLP} tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 10, fill: '#374151' }} />
                <RechartsTooltip
                  formatter={(v, name, item) => [
                    formatCLP(v),
                    'Costo Promedio'
                  ]}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    if (!item) return label;
                    return `${label} (${item.nSurgeries} cirugías · Total: ${formatCLP(item.totalCost)})`;
                  }}
                  contentStyle={{ borderRadius: '10px', fontSize: '0.82rem', border: '1px solid #d1fae5', background: 'white' }}
                />
                <Bar dataKey="promedio" radius={[0, 6, 6, 0]}>
                  {especialidadPromedios.map((_, i) => (
                    <Cell key={i} fill={INSUMOS_COLORS[i % INSUMOS_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Sin datos disponibles</div>
          )}
        </div>

        {/* Chart 2: Top 10 Cirugías por Costo Promedio */}
        <div style={S.card}>
          <div style={S.cardTitle}>
            <TrendingUp size={18} color="#059669" /> Top 10 Cirugías por Costo Promedio de Insumos
          </div>
          <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '14px' }}>
            Intervenciones que en promedio requieren mayor gasto de insumos quirúrgicos por cada procedimiento.
          </div>
          {topCirugiasPromedio.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topCirugiasPromedio} layout="vertical" margin={{ top: 0, right: 35, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ecfdf5" />
                <XAxis type="number" tickFormatter={formatCLP} tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis type="category" dataKey="name" width={175} tick={{ fontSize: 9.5, fill: '#374151' }} />
                <RechartsTooltip
                  formatter={(v) => [formatCLP(v), 'Costo Promedio']}
                  labelFormatter={(l, payload) => {
                    const item = payload?.[0]?.payload;
                    if (!item) return l;
                    return `${item.fullName} (${item.nSurgeries} cirugías · Total: ${formatCLP(item.totalCost)})`;
                  }}
                  contentStyle={{ borderRadius: '10px', fontSize: '0.82rem', border: '1px solid #d1fae5', background: 'white' }}
                />
                <Bar dataKey="promedio" radius={[0, 6, 6, 0]}>
                  {topCirugiasPromedio.map((_, i) => (
                    <Cell key={i} fill={INSUMOS_COLORS[(i + 3) % INSUMOS_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Sin datos disponibles</div>
          )}
        </div>
      </div>

      {/* Tabla Desglose: Especialidad → Cirugía → Insumos con 90% más usados y 10% menos usados */}
      <div style={{ ...S.card, marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={S.cardTitle}>
            <Users size={18} color="#059669" /> Desglose Detallado por Especialidad → Cirugía → Insumos
          </div>
          <div style={{ fontSize: '0.78rem', color: '#047857', background: '#ecfdf5', padding: '6px 14px', borderRadius: '10px', fontWeight: 600, border: '1px solid #a7f3d0' }}>
            💡 Haz clic en una fila para desplegar cirugías e insumos (segmentados en el 90% más utilizado y 10% ocasional)
          </div>
        </div>

        <div style={S.tableWrap}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={S.thead}>
              <tr>
                <th style={{ ...S.th, width: '45%' }}>Especialidad / Cirugía / Insumo</th>
                <th style={{ ...S.th, textAlign: 'center', width: '18%' }}>Total Cirugías Registradas</th>
                <th style={{ ...S.th, textAlign: 'right', width: '18%' }}>Costo Promedio / Cirugía</th>
                <th style={{ ...S.th, textAlign: 'right', width: '19%' }}>Costo Total Acumulado</th>
              </tr>
            </thead>
            <tbody>
              {drilldownData.map((espec) => {
                const espKey = `espec-${espec.especialidad}`;
                const espOpen = drillOpen.has(espKey);

                return (
                  <React.Fragment key={espKey}>
                    {/* Fila Nivel 1: Especialidad */}
                    <tr
                      style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', cursor: 'pointer', borderBottom: '2px solid #a7f3d0' }}
                      onClick={() => toggleDrill(espKey)}
                    >
                      <td style={{ ...S.td, fontWeight: 800, color: '#064e3b', fontSize: '0.88rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <motion.span animate={{ rotate: espOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronRight size={16} color="#10b981" />
                          </motion.span>
                          🏥 {espec.especialidad}
                          <span style={{ marginLeft: '8px', background: '#10b981', color: 'white', borderRadius: '20px', padding: '2px 10px', fontSize: '0.72rem', fontWeight: 700 }}>
                            {espec.cirugias.length} tipos de intervención
                          </span>
                        </div>
                      </td>
                      <td style={{ ...S.td, textAlign: 'center', fontWeight: 800, color: '#064e3b', fontSize: '0.88rem' }}>
                        {espec.totalCirugias.toLocaleString('es-CL')}
                      </td>
                      <td style={{ ...S.td, textAlign: 'right', fontWeight: 800, color: '#047857', fontSize: '0.88rem' }}>
                        {formatCLP(espec.costoPromedio)}
                      </td>
                      <td style={{ ...S.td, textAlign: 'right', fontWeight: 900, color: '#064e3b', fontSize: '0.92rem' }}>
                        {formatCLP(espec.totalCost)}
                      </td>
                    </tr>

                    {/* Fila Nivel 2: Cirugías dentro de la Especialidad */}
                    {espOpen && espec.cirugias.map((cir, ci) => {
                      const cirKey = `cir-${espec.especialidad}-${ci}`;
                      const cirOpen = drillOpen.has(cirKey);

                      return (
                        <React.Fragment key={cirKey}>
                          <tr
                            style={{ background: ci % 2 === 0 ? '#f7fdf9' : '#ffffff', cursor: 'pointer', borderBottom: '1px solid #e2e8f0' }}
                            onClick={() => toggleDrill(cirKey)}
                          >
                            <td style={{ ...S.td, paddingLeft: '36px', color: '#065f46', fontWeight: 700, fontSize: '0.82rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <motion.span animate={{ rotate: cirOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                                  <ChevronRight size={13} color="#34d399" />
                                </motion.span>
                                🔪 {cir.cirugiaName}
                                <span style={{ marginLeft: '6px', background: '#ecfdf5', color: '#059669', borderRadius: '20px', padding: '1px 8px', fontSize: '0.7rem', fontWeight: 700, border: '1px solid #a7f3d0' }}>
                                  {cir.totalInsumosCount} insumos
                                </span>
                              </div>
                            </td>
                            <td style={{ ...S.td, textAlign: 'center', fontWeight: 700, color: '#065f46', fontSize: '0.82rem' }}>
                              {cir.totalCirugias.toLocaleString('es-CL')}
                            </td>
                            <td style={{ ...S.td, textAlign: 'right', fontWeight: 700, color: '#059669', fontSize: '0.82rem' }}>
                              {formatCLP(cir.costoPromedio)}
                            </td>
                            <td style={{ ...S.td, textAlign: 'right', fontWeight: 800, color: '#065f46', fontSize: '0.85rem' }}>
                              {formatCLP(cir.totalCost)}
                            </td>
                          </tr>

                          {/* Fila Nivel 3: Insumos de la Cirugía con 90% más utilizados arriba y 10% abajo */}
                          {cirOpen && (
                            <>
                              {/* Subsección 1: 90% Insumos más utilizados */}
                              {cir.top90Insumos.length > 0 && (
                                <tr style={{ background: '#ecfdf5' }}>
                                  <td colSpan={4} style={{ padding: '8px 18px 8px 56px', fontSize: '0.75rem', fontWeight: 800, color: '#047857', borderBottom: '1px solid #d1fae5' }}>
                                    🟢 90% DE INSUMOS MÁS UTILIZADOS (Mayor rotación habitual · {cir.top90Insumos.length} insumos)
                                  </td>
                                </tr>
                              )}

                              {cir.top90Insumos.map((ins, ii) => (
                                <tr key={`top-${ii}`} style={{ background: ii % 2 === 0 ? '#fafdfb' : '#ffffff', fontSize: '0.78rem' }}>
                                  <td style={{ ...S.td, paddingLeft: '68px', color: '#1f2937' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                                      <span style={{ fontWeight: 600 }}>{ins.descripcion}</span>
                                      {ins.codigo && (
                                        <span style={{ color: '#9ca3af', fontSize: '0.7rem' }}>({ins.codigo})</span>
                                      )}
                                    </div>
                                  </td>
                                  <td style={{ ...S.td, textAlign: 'center', color: '#4b5563', fontSize: '0.78rem' }}>
                                    <span style={{ fontWeight: 700, color: '#064e3b' }}>{ins.cantidad.toLocaleString('es-CL')}</span> unid.
                                    <span style={{ color: '#9ca3af', fontSize: '0.72rem', marginLeft: '4px' }}>
                                      ({(ins.cantidad / (cir.totalCirugias || 1)).toFixed(1)}/cirugía)
                                    </span>
                                  </td>
                                  <td style={{ ...S.td, textAlign: 'right', color: '#4b5563', fontSize: '0.78rem' }}>
                                    P. Compra: {formatCLP(ins.precio_compra)}
                                  </td>
                                  <td style={{ ...S.td, textAlign: 'right', fontWeight: 700, color: '#065f46', fontSize: '0.82rem' }}>
                                    {formatCLP(ins.total)}
                                  </td>
                                </tr>
                              ))}

                              {/* Subsección 2: 10% Insumos menos utilizados */}
                              {cir.bottom10Insumos.length > 0 && (
                                <tr style={{ background: '#fffbeb' }}>
                                  <td colSpan={4} style={{ padding: '8px 18px 8px 56px', fontSize: '0.75rem', fontWeight: 800, color: '#b45309', borderBottom: '1px solid #fef3c7', borderTop: '1px solid #fde68a' }}>
                                    🟡 10% DE INSUMOS MENOS UTILIZADOS (Uso ocasional / complementario · {cir.bottom10Insumos.length} insumos)
                                  </td>
                                </tr>
                              )}

                              {cir.bottom10Insumos.map((ins, ii) => (
                                <tr key={`bot-${ii}`} style={{ background: ii % 2 === 0 ? '#fffdf7' : '#ffffff', fontSize: '0.78rem' }}>
                                  <td style={{ ...S.td, paddingLeft: '68px', color: '#4b5563' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
                                      <span>{ins.descripcion}</span>
                                      {ins.codigo && (
                                        <span style={{ color: '#9ca3af', fontSize: '0.7rem' }}>({ins.codigo})</span>
                                      )}
                                    </div>
                                  </td>
                                  <td style={{ ...S.td, textAlign: 'center', color: '#6b7280', fontSize: '0.78rem' }}>
                                    <span style={{ fontWeight: 700, color: '#92400e' }}>{ins.cantidad.toLocaleString('es-CL')}</span> unid.
                                    <span style={{ color: '#9ca3af', fontSize: '0.72rem', marginLeft: '4px' }}>
                                      ({(ins.cantidad / (cir.totalCirugias || 1)).toFixed(1)}/cirugía)
                                    </span>
                                  </td>
                                  <td style={{ ...S.td, textAlign: 'right', color: '#6b7280', fontSize: '0.78rem' }}>
                                    P. Compra: {formatCLP(ins.precio_compra)}
                                  </td>
                                  <td style={{ ...S.td, textAlign: 'right', fontWeight: 600, color: '#b45309', fontSize: '0.82rem' }}>
                                    {formatCLP(ins.total)}
                                  </td>
                                </tr>
                              ))}
                            </>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: 'linear-gradient(135deg, #064e3b, #065f46)', color: 'white' }}>
                <td style={{ ...S.td, fontWeight: 800, color: 'white', fontSize: '0.92rem' }}>
                  TOTAL GENERAL ({drilldownData.length} especialidades)
                </td>
                <td style={{ ...S.td, textAlign: 'center', fontWeight: 900, color: 'white', fontSize: '0.92rem' }}>
                  {kpis.totalCirugias.toLocaleString('es-CL')} cirugías
                </td>
                <td style={{ ...S.td, textAlign: 'right', fontWeight: 900, color: '#a7f3d0', fontSize: '0.92rem' }}>
                  {formatCLP(kpis.costoPromedioCirugia)}
                </td>
                <td style={{ ...S.td, textAlign: 'right', fontWeight: 900, color: 'white', fontSize: '1.05rem' }}>
                  {formatCLP(kpis.totalCosto)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function SurgicalDashboard({ onBack }) {
  const [activeTab, setActiveTab] = useState('libro');
  const [tablaSubTab, setTablaSubTab] = useState('resumen');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  const [tablaData, setTablaData] = useState([]);
  const [disponibilidadData, setDisponibilidadData] = useState([]);
  const [libroData, setLibroData] = useState([]);
  const [rawDataLibro, setRawDataLibro] = useState([]);
  const [grdData, setGrdData] = useState([]);

  // Sidebar Filters for Libro
  const [dateRange, setDateRange] = useState({ start: '2025-01-01', end: '2026-12-31' });
  const [tipoCirugia, setTipoCirugia] = useState([]);
  const [tipoPaciente, setTipoPaciente] = useState([]);
  const [procedencia, setProcedencia] = useState([]);
  const [tipoGestor, setTipoGestor] = useState([]);
  const [formaPago, setFormaPago] = useState([]);
  const [nombreIq, setNombreIq] = useState([]);
  const [primerCirujano, setPrimerCirujano] = useState([]);
  const [segundoCirujano, setSegundoCirujano] = useState([]);
  const [anestesiologo, setAnestesiologo] = useState([]);
  const [reintervencion, setReintervencion] = useState([]);
  const [libroPabellonTabla, setLibroPabellonTabla] = useState([]);
  const [libroPabellonCrr, setLibroPabellonCrr] = useState([]);
  const [pieMode, setPieMode] = useState('cirugia');
  const [viewMode, setViewMode] = useState('cirugias'); // 'cirugias' | 'pacientes'
  const [showPivotTable, setShowPivotTable] = useState(false);
  const [showAuditoriaModal, setShowAuditoriaModal] = useState(false);

  // Sidebar Filters for Tabla
  const [tablaFechaProg, setTablaFechaProg] = useState([]);
  const [tablaTipoCirugia, setTablaTipoCirugia] = useState([]);
  const [tablaTipoPaciente, setTablaTipoPaciente] = useState([]);
  const [tablaPriorizacion, setTablaPriorizacion] = useState([]);
  const [tablaPabellonCrr, setTablaPabellonCrr] = useState([]);
  const [tablaIntervencion, setTablaIntervencion] = useState([]);
  const [tablaCirujano, setTablaCirujano] = useState([]);
  const [tablaAnestesista, setTablaAnestesista] = useState([]);
  const [tablaPabellon, setTablaPabellon] = useState([]);
  const [tablaModalidad, setTablaModalidad] = useState([]);
  const [tablaCausaSuspension, setTablaCausaSuspension] = useState([]);
  const [tablaMotivoSuspension, setTablaMotivoSuspension] = useState([]);
  const [tablaLastUpdated, setTablaLastUpdated] = useState(null);
  const [dispLastUpdated, setDispLastUpdated] = useState(null);
  const [libroLastUpdated, setLibroLastUpdated] = useState(null);

  // Insumos y Costeo state
  const [insumosData, setInsumosData] = useState([]);
  const [insumosLoading, setInsumosLoading] = useState(false);
  const [insumosError, setInsumosError] = useState(null);
  const [insumosLastUpdated, setInsumosLastUpdated] = useState(null);
  const [insumosEspecialidad, setInsumosEspecialidad] = useState([]);
  const [insumosSearch, setInsumosSearch] = useState('');
  const [insumosDrillOpen, setInsumosDrillOpen] = useState(new Set());

  // Sidebar Filters for Indicadores de Gestión
  const [dateRangeIndicadores, setDateRangeIndicadores] = useState({ start: '2026-01-01', end: '2026-12-31' });
  const [indicadorPabellon, setIndicadorPabellon] = useState(['1', '2', '3', '4', '5']); // Por defecto excluye 6 y 7
  const [indicadorCumplimiento, setIndicadorCumplimiento] = useState([]);
  const [indicadorTipoDia, setIndicadorTipoDia] = useState('habiles'); // 'habiles', 'no_habiles', 'todos'
  const [indicadorSearch, setIndicadorSearch] = useState('');

  // Floating Sidebar state
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(false);
  const isExpanded = sidebarHovered || sidebarPinned;

  const activeFilterCount = useMemo(() => {
    if (activeTab === 'libro') {
      return [tipoCirugia, tipoPaciente, procedencia, tipoGestor, formaPago, nombreIq, primerCirujano, segundoCirujano, anestesiologo, reintervencion, libroPabellonTabla, libroPabellonCrr]
        .filter(arr => Array.isArray(arr) && arr.length > 0).length;
    } else if (activeTab === 'tabla') {
      return [tablaFechaProg, tablaTipoCirugia, tablaTipoPaciente, tablaPriorizacion, tablaPabellonCrr, tablaIntervencion, tablaCirujano, tablaAnestesista, tablaPabellon, tablaModalidad, tablaCausaSuspension, tablaMotivoSuspension]
        .filter(arr => Array.isArray(arr) && arr.length > 0).length;
    } else if (activeTab === 'disponibilidad') {
      let count = 0;
      if (dateRangeIndicadores.start !== '2026-01-01' || dateRangeIndicadores.end !== '2026-12-31') count++;
      if (indicadorPabellon.length !== 5 || !['1', '2', '3', '4', '5'].every(p => indicadorPabellon.includes(p))) count++;
      if (indicadorCumplimiento.length > 0) count++;
      if (indicadorTipoDia !== 'habiles') count++;
      if (indicadorSearch) count++;
      return count;
    }
    return 0;
  }, [activeTab, tipoCirugia, tipoPaciente, procedencia, tipoGestor, formaPago, nombreIq, primerCirujano, segundoCirujano, anestesiologo, reintervencion, libroPabellonTabla, libroPabellonCrr, tablaFechaProg, tablaTipoCirugia, tablaTipoPaciente, tablaPriorizacion, tablaPabellonCrr, tablaIntervencion, tablaCirujano, tablaAnestesista, tablaPabellon, tablaModalidad, tablaCausaSuspension, tablaMotivoSuspension, dateRangeIndicadores, indicadorPabellon, indicadorCumplimiento, indicadorTipoDia, indicadorSearch]);

  const clearAllFilters = () => {
    if (activeTab === 'libro') {
      setTipoCirugia([]); setTipoPaciente([]); setProcedencia([]); setTipoGestor([]); setFormaPago([]);
      setNombreIq([]); setPrimerCirujano([]); setSegundoCirujano([]); setAnestesiologo([]); setReintervencion([]);
      setLibroPabellonTabla([]); setLibroPabellonCrr([]);
    } else if (activeTab === 'tabla') {
      setTablaFechaProg([]); setTablaTipoCirugia([]); setTablaTipoPaciente([]); setTablaPriorizacion([]); setTablaPabellonCrr([]);
      setTablaIntervencion([]); setTablaCirujano([]); setTablaAnestesista([]); setTablaPabellon([]); setTablaModalidad([]);
      setTablaCausaSuspension([]); setTablaMotivoSuspension([]);
    } else if (activeTab === 'disponibilidad') {
      setDateRangeIndicadores({ start: '2026-01-01', end: '2026-12-31' });
      setIndicadorPabellon(['1', '2', '3', '4', '5']);
      setIndicadorCumplimiento([]);
      setIndicadorTipoDia('habiles');
      setIndicadorSearch('');
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const fetchJsonWithGz = async (basePath) => {
          try {
            const resGz = await fetch(`${basePath}.gz?` + Date.now());
            if (resGz.ok && typeof DecompressionStream !== 'undefined') {
              const ds = new DecompressionStream('gzip');
              const decompressed = resGz.body.pipeThrough(ds);
              return await new Response(decompressed).json();
            }
          } catch (e) {
            // fallback
          }
          try {
            const res = await fetch(basePath);
            if (res.ok) return await res.json();
          } catch (e) {
            console.warn(`No se pudo cargar ${basePath}:`, e);
          }
          return { records: [] };
        };

        const [tablaJson, dispJson, libroJson, grdJson] = await Promise.all([
          fetchJsonWithGz('/data/pabellon_tabla_cached.json'),
          fetchJsonWithGz('/data/pabellon_disponibilidad_cached.json'),
          fetchJsonWithGz('/data/libro_pabellon_cached.json'),
          fetch('/data/valorizacion_grd.json').catch(() => ({ json: () => ([]) })).then(r => r.json ? r.json() : r).catch(() => [])
        ]);

        const normalizeDate = (dStr) => {
          if (!dStr) return null;
          if (/^\d{4}-\d{2}-\d{2}/.test(dStr)) return dStr.substring(0, 10);
          const parts = String(dStr).trim().split('/');
          if (parts.length === 3) {
            let [m, d, y] = parts;
            if (y.length === 2) y = '20' + y;
            return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
          }
          const dt = new Date(dStr);
          if (isNaN(dt.getTime())) return null;
          const y = dt.getFullYear();
          const m = String(dt.getMonth() + 1).padStart(2, '0');
          const day = String(dt.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        };

        // Clean RUT helper for matching
        const cleanRut = (r) => String(r || '').replace(/[^0-9kK]/g, '').toUpperCase();
        const getRutBody = (r) => {
          const c = cleanRut(r);
          return c.length > 1 ? c.slice(0, -1) : c;
        };
        const cleanStr = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

        // Build lookup index from tablaData
        const tablaByLeFecha = new Map();
        const tablaByRutFecha = new Map();
        const tablaByRutBodyFecha = new Map();
        const tablaByLe = new Map();
        const tablaByRutList = new Map();
        const tablaByDate = new Map();

        (tablaJson.records || []).forEach(t => {
          if (t.eliminada === true || t.eliminada === 'true') return;
          const le = String(t.id_lista_espera || '').trim();
          const f = (t.fecha_programacion || '').substring(0, 10);
          const r = cleanRut(t.rut);
          const rBody = getRutBody(t.rut);

          if (le && le !== '0' && le !== 'null' && le !== 'undefined') {
            if (f) tablaByLeFecha.set(le + '_' + f, t);
            if (!tablaByLe.has(le)) tablaByLe.set(le, t);
          }
          if (r && f) {
            tablaByRutFecha.set(r + '_' + f, t);
          }
          if (rBody && f && rBody.length >= 6) {
            tablaByRutBodyFecha.set(rBody + '_' + f, t);
          }
          if (r && r.length >= 6) {
            if (!tablaByRutList.has(r)) tablaByRutList.set(r, []);
            tablaByRutList.get(r).push(t);
          }
          if (f) {
            if (!tablaByDate.has(f)) tablaByDate.set(f, []);
            tablaByDate.get(f).push(t);
          }
        });

        const normalizedLibro = (libroJson.records || []).map(r => {
          const fNorm = normalizeDate(r.fecha_cirugia);
          const le = String(r.num_le || '').trim();
          const rClean = cleanRut(r._rut_raw || r.rut);
          const rBody = getRutBody(r._rut_raw || r.rut);

          let match = null;
          // Estrategia 1: ID Lista de Espera + Fecha
          if (le && fNorm && tablaByLeFecha.has(le + '_' + fNorm)) {
            match = tablaByLeFecha.get(le + '_' + fNorm);
          // Estrategia 2: RUT Exacto + Fecha
          } else if (rClean && fNorm && tablaByRutFecha.has(rClean + '_' + fNorm)) {
            match = tablaByRutFecha.get(rClean + '_' + fNorm);
          // Estrategia 3: Cuerpo del RUT (ignora errores de dígito verificador) + Fecha
          } else if (rBody && fNorm && tablaByRutBodyFecha.has(rBody + '_' + fNorm)) {
            match = tablaByRutBodyFecha.get(rBody + '_' + fNorm);
          // Estrategia 4: Emparejamiento Clínico Independiente de LE: RUT + ventana temporal (+/- 7 días de reprogramación)
          } else if (rClean && rClean.length >= 6 && fNorm && tablaByRutList.has(rClean)) {
            const cands = tablaByRutList.get(rClean);
            const near = cands.find(c => {
              const cf = (c.fecha_programacion || '').substring(0, 10);
              return Math.abs(new Date(cf) - new Date(fNorm)) <= 7 * 86400000;
            });
            if (near) match = near;
          // Estrategia 5: ID Lista de Espera transversal
          } else if (le && tablaByLe.has(le)) {
            match = tablaByLe.get(le);
          // Estrategia 6: Coincidencia fonética/apellidos en la misma fecha (corrige errores tipográficos de digitación en Tabla)
          } else if (fNorm && tablaByDate.has(fNorm)) {
            const lName = cleanStr(r.paciente);
            const candidates = tablaByDate.get(fNorm);
            for (const c of candidates) {
              const cPat = cleanStr(c.apellido_paterno);
              const cMat = cleanStr(c.apellido_materno);
              if (cPat && cPat.length >= 4 && lName.includes(cPat)) {
                if (!cMat || cMat.length < 4 || lName.includes(cMat)) {
                  match = c;
                  break;
                }
              }
            }
          }

          const pabellonTabla = match ? String(match.pabellon || '').trim() : 'Fuera de Pabellón Central';
          const pabellonCrr = match
            ? (match.pabellon_crr === 'Si' ? 'CRR' : (match.pabellon_crr === 'No' ? 'No CRR' : 'Sin Clasificar'))
            : 'Fuera de Pabellón Central';

          return {
            ...r,
            fecha_cirugia: fNorm,
            pabellon_tabla: pabellonTabla,
            pabellon_crr: pabellonCrr
          };
        });

        setTablaData(tablaJson.records || []);
        setTablaLastUpdated(tablaJson.lastUpdated || null);
        setDisponibilidadData(dispJson.records || []);
        setDispLastUpdated(dispJson.lastUpdated || dispJson.fecha_actualizacion_fuente || null);
        setRawDataLibro(normalizedLibro);
        setLibroData(normalizedLibro);
        setLibroLastUpdated(libroJson.lastUpdated || null);
        setGrdData(grdJson || []);
      } catch (err) {
        console.error("Error loading surgical data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Load insumos data (fetched on demand when tab is opened)
  useEffect(() => {
    if (activeTab !== 'insumos') return;
    if (insumosData.length > 0) return; // already loaded
    async function loadInsumos() {
      setInsumosLoading(true);
      setInsumosError(null);
      try {
        // Try local pre-exported JSON first
        const localRes = await fetch('/data/insumos_cirugias_cached.json?v=' + Date.now()).catch(() => null);
        if (localRes && localRes.ok) {
          const localJson = await localRes.json();
          const arr = Array.isArray(localJson)
            ? localJson
            : (localJson.records || localJson.insumos_cirugias || localJson.data || []);
          setInsumosData(arr);
          setInsumosLastUpdated(localJson.lastUpdated || null);
          return;
        }
        // Fallback: fetch directly from pythonanywhere API
        // Step 1: get CSRF token from login page
        const loginPageRes = await fetch('https://pabellonhospitalvillarrica.pythonanywhere.com/accounts/login/', {
          credentials: 'include',
          mode: 'cors'
        }).catch(() => null);
        let csrf = '';
        if (loginPageRes && loginPageRes.ok) {
          const loginHtml = await loginPageRes.text();
          const csrfMatch = loginHtml.match(/csrfmiddlewaretoken[^>]*value="([^"]+)"/);
          csrf = csrfMatch ? csrfMatch[1] : '';
        }
        // Step 2: login
        if (csrf) {
          await fetch('https://pabellonhospitalvillarrica.pythonanywhere.com/accounts/login/', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Referer': 'https://pabellonhospitalvillarrica.pythonanywhere.com/' },
            body: `username=admin&password=Controldegestion2025&csrfmiddlewaretoken=${csrf}&next=/`
          }).catch(() => {});
        }
        // Step 3: fetch data
        const dataRes = await fetch('https://pabellonhospitalvillarrica.pythonanywhere.com/pabellon/exportar_insumos_cirugias/', {
          credentials: 'include',
          mode: 'cors'
        });
        if (!dataRes.ok) throw new Error(`API respondió ${dataRes.status}. Por favor ejecuta el script de exportación para generar /data/insumos_cirugias_cached.json`);
        const json = await dataRes.json();
        const arr = Array.isArray(json)
          ? json
          : (json.insumos_cirugias || json.data || []);
        setInsumosData(arr);
      } catch (err) {
        setInsumosError(`Error al cargar insumos: ${err.message}`);
      } finally {
        setInsumosLoading(false);
      }
    }
    loadInsumos();
  }, [activeTab]);

  // Dropdown lists
  const dropdowns = useMemo(() => {
    const tipos = new Set();
    const tipoPac = new Set();
    const procs = new Set();
    const gestores = new Set();
    const pagos = new Set();
    const iqs = new Set();
    const ciru1 = new Set();
    const ciru2 = new Set();
    const anestes = new Set();
    const reints = new Set();
    const pabTabla = new Set();
    const crrSet = new Set();

    rawDataLibro.forEach(r => {
      if (r.tipo_cirugia) tipos.add(r.tipo_cirugia);
      if (r.tipo_paciente) tipoPac.add(r.tipo_paciente);
      if (r.procedencia) procs.add(r.procedencia);
      if (r.tipo_gestor) gestores.add(r.tipo_gestor);
      if (r.forma_pago) pagos.add(r.forma_pago);
      if (r.intervencion) iqs.add(r.intervencion);
      if (r.cirujano) ciru1.add(r.cirujano);
      if (r.segundo_cirujano) ciru2.add(r.segundo_cirujano);
      if (r.anestesiologo) anestes.add(r.anestesiologo);
      if (r.reintervencion_no_prog) reints.add(r.reintervencion_no_prog);
      if (r.pabellon_tabla) pabTabla.add(r.pabellon_tabla);
      if (r.pabellon_crr) crrSet.add(r.pabellon_crr);
    });

    const customPabOrder = ['1', '2', '3', '4', '5', '6', '7', 'Fuera de Pabellón Central'];
    const sortedPabs = Array.from(pabTabla).sort((a, b) => {
      const idxA = customPabOrder.indexOf(a);
      const idxB = customPabOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    return {
      tipos: Array.from(tipos).sort(),
      tipoPacientes: Array.from(tipoPac).sort().filter(Boolean),
      procedencias: Array.from(procs).sort(),
      gestores: Array.from(gestores).sort(),
      pagos: Array.from(pagos).sort(),
      iqs: Array.from(iqs).sort(),
      ciru1: Array.from(ciru1).sort(),
      cirus2: Array.from(ciru2).sort().filter(Boolean),
      anestes: Array.from(anestes).sort().filter(Boolean),
      reints: Array.from(reints).sort().filter(Boolean),
      pabellonesTabla: sortedPabs,
      crrOptions: Array.from(crrSet).sort()
    };
  }, [rawDataLibro]);

  const tablaDropdowns = useMemo(() => {
    const fechas = new Set();
    const tipos = new Set();
    const tipoPacientes = new Set();
    const prios = new Set();
    const crrs = new Set();
    const ints = new Set();
    const cirus = new Set();
    const anestesistas = new Set();
    const pabs = new Set();
    const mods = new Set();
    const causas = new Set();
    const motivos = new Set();

    tablaData.forEach(r => {
      if (r.fecha_programacion) fechas.add(r.fecha_programacion.split('-')[0]);
      if (r.tipo_cirugia) tipos.add(r.tipo_cirugia);
      if (r.tipo_paciente) tipoPacientes.add(r.tipo_paciente);
      if (r.priorizacion) prios.add(r.priorizacion);
      if (r.pabellon_crr) crrs.add(r.pabellon_crr);
      if (r.intervencion_propuesta) ints.add(r.intervencion_propuesta);
      if (r.cirujano) cirus.add(r.cirujano);
      const ane = (r.anestesista || r.anestesiologo || '').trim();
      if (ane && ane !== '0' && ane !== '.') anestesistas.add(ane);
      if (r.pabellon) pabs.add(String(r.pabellon));
      if (r.modalidad) mods.add(r.modalidad);

      if (r.estado === 'Suspendido' || r.motivo_suspension || r.causa_suspension) {
        const gc = resolverGranCausa(r.causa_suspension, r.motivo_suspension);
        if (gc) causas.add(gc);
        const mot = (r.motivo_suspension || '').trim();
        if (mot) {
          if (tablaCausaSuspension.length === 0 || tablaCausaSuspension.includes(gc)) {
            motivos.add(mot);
          }
        }
      }
    });

    return {
      fechas: Array.from(fechas).sort().filter(Boolean),
      tipos: Array.from(tipos).sort().filter(Boolean),
      tipoPacientes: Array.from(tipoPacientes).sort().filter(Boolean),
      prios: Array.from(prios).sort().filter(Boolean),
      crrs: Array.from(crrs).sort().filter(Boolean),
      ints: Array.from(ints).sort().filter(Boolean),
      cirus: Array.from(cirus).sort().filter(Boolean),
      anestesistas: Array.from(anestesistas).sort().filter(Boolean),
      pabs: Array.from(pabs).sort((a, b) => a.localeCompare(b)).filter(Boolean),
      mods: Array.from(mods).sort().filter(Boolean),
      causas: Array.from(causas).sort().filter(Boolean),
      motivos: Array.from(motivos).sort().filter(Boolean),
    };
  }, [tablaData, tablaCausaSuspension]);

  // Dropdowns for Indicadores de Gestión
  const indicadorDropdowns = useMemo(() => {
    return {
      pabs: [
        { id: '1', label: 'Pabellón 1' },
        { id: '2', label: 'Pabellón 2' },
        { id: '3', label: 'Pabellón 3' },
        { id: '4', label: 'Pabellón 4' },
        { id: '5', label: 'Pabellón 5' },
        { id: '6', label: 'Pabellón 6 (Urgencia)' },
        { id: '7', label: 'Pabellón 7 (Cirugía Menor)' }
      ],
      pabValues: ['1', '2', '3', '4', '5', '6', '7'],
      cumplimientos: ['Cumple norma (≤ 15 min)', 'Con retraso (> 15 min)'],
      tiposDia: [
        { id: 'habiles', label: 'Días Hábiles (Lunes a Viernes)' },
        { id: 'no_habiles', label: 'Días No Hábiles (Fines de Semana)' },
        { id: 'todos', label: 'Todos los Días (Lunes a Domingo)' }
      ]
    };
  }, []);

  // Apply Filters to Tabla
  const filteredTabla = useMemo(() => {
    return tablaData.filter(r => {
      if (r.eliminada === true || r.eliminada === "true") return false;
      if (r.tipo_paciente === 'Condicional' && r.cirugia_realizada !== 'Si') return false; // Exclude condicionales no realizados
      if (!r.fecha_programacion) return false;
      const dateOnly = r.fecha_programacion.substring(0, 10);
      if (dateOnly < dateRange.start || dateOnly > dateRange.end) return false;

      if (tablaFechaProg.length > 0 && !tablaFechaProg.includes(r.fecha_programacion.split('-')[0])) return false;
      if (tablaTipoCirugia.length > 0 && !tablaTipoCirugia.includes(r.tipo_cirugia)) return false;
      if (tablaTipoPaciente.length > 0 && !tablaTipoPaciente.includes(r.tipo_paciente)) return false;
      if (tablaPriorizacion.length > 0 && !tablaPriorizacion.includes(r.priorizacion)) return false;
      if (tablaPabellonCrr.length > 0 && !tablaPabellonCrr.includes(r.pabellon_crr)) return false;
      if (tablaIntervencion.length > 0 && !tablaIntervencion.includes(r.intervencion_propuesta)) return false;
      if (tablaCirujano.length > 0 && !tablaCirujano.includes(r.cirujano)) return false;
      const ane = (r.anestesista || r.anestesiologo || '').trim();
      if (tablaAnestesista.length > 0 && !tablaAnestesista.includes(ane)) return false;
      if (tablaPabellon.length > 0 && !tablaPabellon.includes(String(r.pabellon))) return false;
      if (tablaModalidad.length > 0 && !tablaModalidad.includes(r.modalidad)) return false;
      if (tablaCausaSuspension.length > 0) {
        const gc = resolverGranCausa(r.causa_suspension, r.motivo_suspension);
        if (!tablaCausaSuspension.includes(gc)) return false;
      }
      if (tablaMotivoSuspension.length > 0) {
        const mot = (r.motivo_suspension || '').trim();
        if (!tablaMotivoSuspension.includes(mot)) return false;
      }

      return true;
    });
  }, [tablaData, dateRange, tablaFechaProg, tablaTipoCirugia, tablaTipoPaciente, tablaPriorizacion, tablaPabellonCrr, tablaIntervencion, tablaCirujano, tablaAnestesista, tablaPabellon, tablaModalidad, tablaCausaSuspension, tablaMotivoSuspension]);

  // Compute stats and YoY for Tabla
  const getTablaYoYStats = (key) => {
    let currentCount = 0;
    filteredTabla.forEach(r => {
      if (key === 'programados') currentCount++;
      if (key === 'intervenidos' && r.estado === 'Intervenido') currentCount++;
      if (key === 'suspendidos' && r.estado === 'Suspendido') currentCount++;
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
    tablaData.forEach(r => {
      if (r.eliminada === true || r.eliminada === "true") return;
      if (!r.fecha_programacion) return;
      const dateOnly = r.fecha_programacion.substring(0, 10);
      if (dateOnly < priorStart || dateOnly > priorEnd) return;

      if (tablaFechaProg.length > 0 && !tablaFechaProg.includes(r.fecha_programacion.split('-')[0])) return;
      if (tablaTipoCirugia.length > 0 && !tablaTipoCirugia.includes(r.tipo_cirugia)) return;
      if (tablaTipoPaciente.length > 0 && !tablaTipoPaciente.includes(r.tipo_paciente)) return;
      if (tablaPriorizacion.length > 0 && !tablaPriorizacion.includes(r.priorizacion)) return;
      if (tablaPabellonCrr.length > 0 && !tablaPabellonCrr.includes(r.pabellon_crr)) return;
      if (tablaIntervencion.length > 0 && !tablaIntervencion.includes(r.intervencion_propuesta)) return;
      if (tablaCirujano.length > 0 && !tablaCirujano.includes(r.cirujano)) return;
      const ane = (r.anestesista || r.anestesiologo || '').trim();
      if (tablaAnestesista.length > 0 && !tablaAnestesista.includes(ane)) return;
      if (tablaPabellon.length > 0 && !tablaPabellon.includes(String(r.pabellon))) return;
      if (tablaModalidad.length > 0 && !tablaModalidad.includes(r.modalidad)) return;

      if (key === 'programados') priorCount++;
      if (key === 'intervenidos' && r.estado === 'Intervenido') priorCount++;
      if (key === 'suspendidos' && r.estado === 'Suspendido') priorCount++;
    });

    if (priorCount === 0) return { val: currentCount, prior: 0, diff: 0, text: '0.0% vs año ant.', trend: 'neutral' };
    const pctDiff = ((currentCount - priorCount) / priorCount) * 100;
    const isGood = key === 'suspendidos' ? pctDiff <= 0 : pctDiff >= 0;

    return {
      val: currentCount,
      prior: priorCount,
      diff: pctDiff,
      text: `${pctDiff >= 0 ? '↑' : '↓'} ${Math.abs(pctDiff).toFixed(1)}% vs año ant.`,
      trend: isGood ? 'positive' : 'negative'
    };
  };

  const tablaProgKPI = getTablaYoYStats('programados');
  const tablaIntKPI = getTablaYoYStats('intervenidos');
  const tablaSuspKPI = getTablaYoYStats('suspendidos');

  const currentSuspPct = tablaProgKPI.val > 0 ? (tablaSuspKPI.val / tablaProgKPI.val) * 100 : 0;
  const priorSuspPct = tablaProgKPI.prior > 0 ? (tablaSuspKPI.prior / tablaProgKPI.prior) * 100 : 0;
  
  let suspPctDiff = currentSuspPct - priorSuspPct;
  let suspPctTrend = suspPctDiff <= 0 ? 'positive' : 'negative';
  let suspPctText = priorSuspPct === 0 ? '0.0% vs año ant.' : `${suspPctDiff >= 0 ? '↑' : '↓'} ${Math.abs(suspPctDiff).toFixed(1)}% vs año ant.`;

  // Helper to parse HH:MM to minutes
  const parseTimeToMinutes = (tStr) => {
    if (!tStr) return null;
    const match = String(tStr).match(/(\d{1,2}):(\d{2})/);
    if (!match) return null;
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  };

  // Motor de cálculo: Retraso en Primera Hora (Replicación exacta de la fórmula requerida)
  const indicadoresGestionData = useMemo(() => {
    if (!disponibilidadData.length || !tablaData.length) {
      return {
        totalRetrasoMinutos: 0,
        totalHorasRetraso: '0',
        pabellonesEvaluados: 0,
        cumplenNorma15m: 0,
        noCumplenNorma15m: 0,
        pctCumplimientoNorma: '0.0%',
        promedioRetrasoMinutos: '0.0',
        monthlyTrend: [],
        pabellonStats: [],
        casosDetalle: []
      };
    }

    // Indizar cirugías por fecha_programacion y pabellon
    const cirugiasIndex = new Map();
    tablaData.forEach(c => {
      if (c.eliminada === true || c.eliminada === "true") return;
      if (!c.fecha_programacion || !c.pabellon) return;
      const dOnly = c.fecha_programacion.substring(0, 10);
      const key = `${dOnly}_${c.pabellon}`;
      if (!cirugiasIndex.has(key)) cirugiasIndex.set(key, []);
      cirugiasIndex.get(key).push(c);
    });

    let totalMinutos = 0;
    const casos = [];

    // Recorrer disponibilidad de pabellones
    disponibilidadData.forEach(pabellon => {
      if (pabellon.estado_pabellon === false) return; // Pabellón inhabilitado o cerrado
      if (!pabellon.fecha) return;
      const fechaPab = pabellon.fecha.substring(0, 10);

      // Filtro de periodo de monitoreo (por defecto 2026 en este tablero)
      if (fechaPab < dateRangeIndicadores.start || fechaPab > dateRangeIndicadores.end) return;

      // Filtro de días hábiles vs no hábiles
      const diaObj = new Date(fechaPab + 'T12:00:00');
      const diaSem = diaObj.getDay();
      const isFinDeSemana = (diaSem === 0 || diaSem === 6);
      if (indicadorTipoDia === 'habiles' && isFinDeSemana) return;
      if (indicadorTipoDia === 'no_habiles' && !isFinDeSemana) return;

      const numPab = pabellon.numero_pabellon || pabellon.n_pabellon;
      if (!numPab) return;

      // Filtro de pabellón seleccionado (por defecto excluye 6 y 7)
      if (indicadorPabellon.length > 0 && !indicadorPabellon.includes(String(numPab))) return;

      const key = `${fechaPab}_${numPab}`;
      const cirugiasDia = cirugiasIndex.get(key) || [];
      // Filtrar cirugías con programación en jornada AM que efectivamente ingresaron a pabellón
      const cirugiasAM = cirugiasDia.filter(c => c.jornada === 'AM' && c.hora_ingreso_cirugia && c.hora_ingreso_cirugia.trim() !== '');
      if (cirugiasAM.length === 0) return;

      // Obtener el primer paciente efectivamente iniciado en el proceso de intervención
      // (Si el paciente de orden 1 se suspendió, se toma la siguiente cirugía iniciada por orden)
      let primeraCirugia = cirugiasAM
        .filter(c => (c.cirugia_realizada && String(c.cirugia_realizada).toLowerCase() === 'si') || (c.estado && String(c.estado).toLowerCase() === 'intervenido'))
        .sort((a, b) => (a.orden_cirugia || 999) - (b.orden_cirugia || 999) || String(a.hora_ingreso_cirugia || '').localeCompare(String(b.hora_ingreso_cirugia || '')))[0];

      if (!primeraCirugia) {
        primeraCirugia = cirugiasAM.sort((a, b) => (a.orden_cirugia || 999) - (b.orden_cirugia || 999) || String(a.hora_ingreso_cirugia || '').localeCompare(String(b.hora_ingreso_cirugia || '')))[0];
      }
      if (!primeraCirugia) return;

      if (primeraCirugia && primeraCirugia.hora_ingreso_cirugia) {
        // La hora de inicio es la que dice la tabla de disponibilidad de ese pabellón ese día
        const horaInicioVal = pabellon.horario_am_inicio || pabellon.horario_habil_am_inicio || '08:00';
        const horaIngresoVal = primeraCirugia.hora_ingreso_cirugia;

        const minInicio = parseTimeToMinutes(horaInicioVal) ?? 480;
        const minIngreso = parseTimeToMinutes(horaIngresoVal) ?? 480;

        const diferencia = minIngreso - minInicio;
        // Retraso acumulado: minutos que exceden la tolerancia normativa (15 min)
        const retrasoExcedente = diferencia > 15 ? (diferencia - 15) : 0;
        totalMinutos += Math.round(retrasoExcedente);

        const cumpleNorma = diferencia <= 15;
        const retrasoMin = Math.max(0, Math.round(diferencia));

        // Filtro de cumplimiento si está activo
        if (indicadorCumplimiento.length > 0) {
          const cat = cumpleNorma ? 'Cumple norma (≤ 15 min)' : 'Con retraso (> 15 min)';
          if (!indicadorCumplimiento.includes(cat)) return;
        }

        // Búsqueda de texto libre si está activa
        if (indicadorSearch) {
          const q = indicadorSearch.toLowerCase();
          const matchP = String(primeraCirugia.nombre_paciente || '').toLowerCase().includes(q);
          const matchC = String(primeraCirugia.cirujano || '').toLowerCase().includes(q);
          const matchE = String(primeraCirugia.especialidad || '').toLowerCase().includes(q);
          const matchI = String(primeraCirugia.intervencion_propuesta || '').toLowerCase().includes(q);
          if (!matchP && !matchC && !matchE && !matchI) return;
        }

        casos.push({
          id: `${fechaPab}_${numPab}_${primeraCirugia.id || Math.random()}`,
          fecha: fechaPab,
          pabellon: numPab,
          horaApertura: horaInicioVal,
          horaIngreso: horaIngresoVal,
          diferencia,
          retrasoMinutos: retrasoExcedente,
          cumpleNorma,
          paciente: `${primeraCirugia.nombre_paciente || ''} ${primeraCirugia.apellido_paterno || ''}`.trim() || 'Sin Nombre',
          cirujano: primeraCirugia.cirujano || 'Sin cirujano',
          especialidad: primeraCirugia.especialidad || 'Sin especialidad',
          intervencion: primeraCirugia.intervencion_propuesta || 'Sin intervención',
          orden: primeraCirugia.orden_cirugia || 1,
          estado: primeraCirugia.estado || (primeraCirugia.cirugia_realizada === 'Si' ? 'Realizada' : 'Pendiente')
        });
      }
    });

    // Ordenar casos por fecha descendente
    casos.sort((a, b) => b.fecha.localeCompare(a.fecha) || a.pabellon - b.pabellon);

    const totalCasos = casos.length;
    const cumplen = casos.filter(c => c.cumpleNorma).length;
    const noCumplen = totalCasos - cumplen;
    const pctCumplimiento = totalCasos > 0 ? ((cumplen / totalCasos) * 100).toFixed(1) : '0.0';
    const promRetraso = totalCasos > 0 ? (totalMinutos / totalCasos).toFixed(1) : '0.0';
    const totalDiferenciaReal = casos.reduce((acc, c) => acc + Math.max(0, c.diferencia), 0);
    const promTiempoInicio = totalCasos > 0 ? (totalDiferenciaReal / totalCasos).toFixed(1) : '0.0';

    // Agrupación mensual
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthlyMap = {};
    casos.forEach(c => {
      const mKey = c.fecha.substring(0, 7);
      if (!monthlyMap[mKey]) {
        const [y, m] = mKey.split('-');
        monthlyMap[mKey] = {
          key: mKey,
          mes: `${monthNames[parseInt(m, 10) - 1]} ${y}`,
          totalCasos: 0,
          cumplen: 0,
          noCumplen: 0,
          minutosRetraso: 0,
          minutosInicioReal: 0
        };
      }
      monthlyMap[mKey].totalCasos++;
      if (c.cumpleNorma) monthlyMap[mKey].cumplen++;
      else monthlyMap[mKey].noCumplen++;
      monthlyMap[mKey].minutosRetraso += c.retrasoMinutos;
      monthlyMap[mKey].minutosInicioReal += Math.max(0, c.diferencia);
    });

    const monthlyTrend = Object.values(monthlyMap)
      .sort((a, b) => a.key.localeCompare(b.key))
      .map(m => ({
        ...m,
        pctCumplimiento: m.totalCasos > 0 ? parseFloat(((m.cumplen / m.totalCasos) * 100).toFixed(1)) : 0,
        promRetrasoMin: m.totalCasos > 0 ? parseFloat((m.minutosRetraso / m.totalCasos).toFixed(1)) : 0,
        promTiempoInicioMin: m.totalCasos > 0 ? parseFloat((m.minutosInicioReal / m.totalCasos).toFixed(1)) : 0
      }));

    // Agrupación por Pabellón
    const pabMap = {};
    casos.forEach(c => {
      const p = String(c.pabellon);
      if (!pabMap[p]) {
        pabMap[p] = {
          pabellon: `Pabellón ${p}`,
          pNum: c.pabellon,
          totalCasos: 0,
          cumplen: 0,
          noCumplen: 0,
          minutosRetraso: 0
        };
      }
      pabMap[p].totalCasos++;
      if (c.cumpleNorma) pabMap[p].cumplen++;
      else pabMap[p].noCumplen++;
      pabMap[p].minutosRetraso += c.retrasoMinutos;
    });

    const pabellonStats = Object.values(pabMap)
      .sort((a, b) => a.pNum - b.pNum)
      .map(p => ({
        ...p,
        pctCumplimiento: p.totalCasos > 0 ? parseFloat(((p.cumplen / p.totalCasos) * 100).toFixed(1)) : 0,
        promRetrasoMin: p.totalCasos > 0 ? parseFloat((p.minutosRetraso / p.totalCasos).toFixed(1)) : 0
      }));

    return {
      totalRetrasoMinutos: totalMinutos,
      totalHorasRetraso: (totalMinutos / 60).toFixed(1),
      pabellonesEvaluados: totalCasos,
      cumplenNorma15m: cumplen,
      noCumplenNorma15m: noCumplen,
      pctCumplimientoNorma: `${pctCumplimiento}%`,
      promedioRetrasoMinutos: promRetraso,
      promedioTiempoInicioMin: promTiempoInicio,
      monthlyTrend,
      pabellonStats,
      casosDetalle: casos
    };
  }, [disponibilidadData, tablaData, dateRangeIndicadores, indicadorPabellon, indicadorCumplimiento, indicadorTipoDia, indicadorSearch]);

  // Chart Data Processing for Tabla
  const tablaChartData = useMemo(() => {
    const monthlyMap = {};
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    filteredTabla.forEach(r => {
      const dOnly = r.fecha_programacion.substring(0, 10);
      const monthKey = dOnly.substring(0, 7);
      const year = parseInt(monthKey.split('-')[0], 10);
      const monthNum = parseInt(monthKey.split('-')[1], 10);
      const label = `${monthNames[monthNum - 1]} ${year}`;
      
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          key: monthKey, label, Programados: 0, Intervenidos: 0, Suspendidos: 0, Pendientes: 0
        };
      }
      
      monthlyMap[monthKey].Programados += 1;
      if (r.estado === 'Intervenido') {
        monthlyMap[monthKey].Intervenidos += 1;
      } else if (r.estado === 'Suspendido') {
        monthlyMap[monthKey].Suspendidos += 1;
      } else {
        monthlyMap[monthKey].Pendientes += 1;
      }
    });

    const sortedData = Object.values(monthlyMap).sort((a, b) => a.key.localeCompare(b.key));
    
    sortedData.forEach(d => {
      d.pctSuspensiones = d.Programados > 0 ? parseFloat(((d.Suspendidos / d.Programados) * 100).toFixed(1)) : 0;
    });

    return sortedData;
  }, [filteredTabla]);

  // Calculate Tabla Insights
  const tablaInsights = useMemo(() => {
    let suspendidos = 0;
    const causasMap = {};
    const especialidadesMap = {}; // { esp: { prog: 0, susp: 0 } }
    const motivosMap = {};
    const causeMotivoMap = {};

    filteredTabla.forEach(r => {
      const isSuspended = r.estado === 'Suspendido';
      const esp = r.especialidad || 'Sin Especialidad';
      
      if (!especialidadesMap[esp]) especialidadesMap[esp] = { prog: 0, susp: 0 };
      especialidadesMap[esp].prog++;
      if (isSuspended) especialidadesMap[esp].susp++;

      if (isSuspended) {
        suspendidos++;
        const causa = r.causa_suspension || 'Sin Causa Registrada';
        causasMap[causa] = (causasMap[causa] || 0) + 1;
        const motivo = r.motivo_suspension || 'Sin Motivo Registrado';
        motivosMap[motivo] = (motivosMap[motivo] || 0) + 1;

        if (!causeMotivoMap[causa]) causeMotivoMap[causa] = {};
        causeMotivoMap[causa][motivo] = (causeMotivoMap[causa][motivo] || 0) + 1;
      }
    });

    const sunburstCausas = [];
    const sunburstMotivos = [];

    Object.keys(causeMotivoMap).forEach(causa => {
      let causaTotal = 0;
      Object.keys(causeMotivoMap[causa]).forEach(motivo => {
        const count = causeMotivoMap[causa][motivo];
        causaTotal += count;
        sunburstMotivos.push({ name: motivo, value: count, parent: causa });
      });
      sunburstCausas.push({ name: causa, value: causaTotal });
    });

    const especialidadesArray = Object.entries(especialidadesMap).map(([name, data]) => ({
      name,
      prog: data.prog,
      susp: data.susp,
      prob: suspendidos > 0 ? parseFloat(((data.susp / suspendidos) * 100).toFixed(1)) : 0
    })).filter(x => x.susp > 0).sort((a,b) => b.susp - a.susp);

    return {
      sunburstCausas,
      sunburstMotivos,
      topEspProb: especialidadesArray.slice(0, 10)
    };
  }, [filteredTabla]);

  // Apply Filters to Libro
  const filteredLibro = useMemo(() => {
    return rawDataLibro.filter(r => {
      if (!r.fecha_cirugia) return false;
      const dateOnly = r.fecha_cirugia.substring(0, 10);
      if (dateOnly < dateRange.start || dateOnly > dateRange.end) return false;

      if (tipoCirugia.length > 0 && !tipoCirugia.includes(r.tipo_cirugia)) return false;
      if (tipoPaciente.length > 0 && !tipoPaciente.includes(r.tipo_paciente)) return false;
      if (procedencia.length > 0 && !procedencia.includes(r.procedencia)) return false;
      if (tipoGestor.length > 0 && !tipoGestor.includes(r.tipo_gestor)) return false;
      if (formaPago.length > 0 && !formaPago.includes(r.forma_pago)) return false;
      if (nombreIq.length > 0 && !nombreIq.includes(r.intervencion)) return false;
      if (primerCirujano.length > 0 && !primerCirujano.includes(r.cirujano)) return false;
      if (segundoCirujano.length > 0 && !segundoCirujano.includes(r.segundo_cirujano)) return false;
      if (anestesiologo.length > 0 && !anestesiologo.includes(r.anestesiologo)) return false;
      if (reintervencion.length > 0 && !reintervencion.includes(r.reintervencion_no_prog)) return false;
      if (libroPabellonTabla.length > 0 && !libroPabellonTabla.includes(r.pabellon_tabla)) return false;
      if (libroPabellonCrr.length > 0 && !libroPabellonCrr.includes(r.pabellon_crr)) return false;

      return true;
    });
  }, [rawDataLibro, dateRange, tipoCirugia, tipoPaciente, procedencia, tipoGestor, formaPago, nombreIq, primerCirujano, segundoCirujano, anestesiologo, reintervencion, libroPabellonTabla, libroPabellonCrr]);

  // View Mode: 'cirugias' (totalidad de intervenciones) vs 'pacientes' (1 caso / evento quirúrgico por paciente)
  // Al ver por paciente, se deduplica por evento (num_le) priorizando siempre la cirugía principal (marcada al 100%)
  const displayLibro = useMemo(() => {
    if (viewMode === 'cirugias') return filteredLibro;
    const map = new Map();
    filteredLibro.forEach(r => {
      const existing = map.get(r.num_le);
      if (!existing) {
        map.set(r.num_le, r);
      } else if (!existing.es_intervencion_principal && r.es_intervencion_principal) {
        map.set(r.num_le, r);
      }
    });
    return Array.from(map.values());
  }, [filteredLibro, viewMode]);

  // Surgical Density Ratio (Promedio de Cirugías por Paciente/Evento Quirúrgico)
  const surgicalDensity = useMemo(() => {
    const totalCir = filteredLibro.length;
    const uniqueEvents = new Set(filteredLibro.map(r => r.num_le)).size;
    if (uniqueEvents === 0) return { ratio: '1.00', totalCir: 0, totalPac: 0, multiEvents: 0 };
    return {
      ratio: (totalCir / uniqueEvents).toFixed(2),
      totalCir,
      totalPac: uniqueEvents
    };
  }, [filteredLibro]);

  // Comparative Year-Over-Year logic for KPI cards (dynamically adapts to viewMode)
  const getYoYStats = (key) => {
    let currentCount = 0;
    displayLibro.forEach(r => {
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

    const priorList = rawDataLibro.filter(r => {
      if (!r.fecha_cirugia) return false;
      const dateOnly = r.fecha_cirugia.substring(0, 10);
      if (dateOnly < priorStart || dateOnly > priorEnd) return false;

      if (tipoCirugia.length > 0 && !tipoCirugia.includes(r.tipo_cirugia)) return false;
      if (tipoPaciente.length > 0 && !tipoPaciente.includes(r.tipo_paciente)) return false;
      if (procedencia.length > 0 && !procedencia.includes(r.procedencia)) return false;
      if (tipoGestor.length > 0 && !tipoGestor.includes(r.tipo_gestor)) return false;
      if (formaPago.length > 0 && !formaPago.includes(r.forma_pago)) return false;
      if (nombreIq.length > 0 && !nombreIq.includes(r.intervencion)) return false;
      if (primerCirujano.length > 0 && !primerCirujano.includes(r.cirujano)) return false;
      if (segundoCirujano.length > 0 && !segundoCirujano.includes(r.segundo_cirujano)) return false;
      if (anestesiologo.length > 0 && !anestesiologo.includes(r.anestesiologo)) return false;
      if (reintervencion.length > 0 && !reintervencion.includes(r.reintervencion_no_prog)) return false;
      if (libroPabellonTabla.length > 0 && !libroPabellonTabla.includes(r.pabellon_tabla)) return false;
      if (libroPabellonCrr.length > 0 && !libroPabellonCrr.includes(r.pabellon_crr)) return false;

      return true;
    });

    const priorDisplay = (() => {
      if (viewMode === 'cirugias') return priorList;
      const map = new Map();
      priorList.forEach(r => {
        const existing = map.get(r.num_le);
        if (!existing) {
          map.set(r.num_le, r);
        } else if (!existing.es_intervencion_principal && r.es_intervencion_principal) {
          map.set(r.num_le, r);
        }
      });
      return Array.from(map.values());
    })();

    let priorCount = 0;
    priorDisplay.forEach(r => {
      if (key === 'total') priorCount++;
      if (key === 'mayor' && (r.tipo_cirugia === 'Cirugía Mayor' || r.tipo_cirugia === 'Cirugía Mayor Ambulatoria')) priorCount++;
      if (key === 'urgencia' && r.urgencia === 'SI') priorCount++;
    });

    if (priorCount === 0) return { val: currentCount, diff: 0, text: '0.0% vs año ant.', trend: 'neutral' };
    const pctDiff = ((currentCount - priorCount) / priorCount) * 100;
    return {
      val: currentCount,
      prior: priorCount,
      diff: pctDiff,
      text: `${pctDiff >= 0 ? '↑' : '↓'} ${Math.abs(pctDiff).toFixed(1)}% vs año ant.`,
      trend: pctDiff >= 0 ? 'positive' : 'negative'
    };
  };

  const totalKPI = getYoYStats('total');
  const mayorKPI = getYoYStats('mayor');
  const urgenciaKPI = getYoYStats('urgencia');

  const procedenciaStats = useMemo(() => {
    let urg = 0, elec = 0, urgDiferida = 0;
    let tUrg = 0, tUrgDif = 0, tElec = 0;

    displayLibro.forEach(r => {
      if (r.urgencia === 'SI') urg++;
      else elec++;

      const t = String(r.tipo_iq || '').toUpperCase();
      if (t.includes('DIFERIDA')) {
        urgDiferida++;
        tUrgDif++;
      } else if (t.includes('URGENCIA')) {
        tUrg++;
      } else {
        tElec++;
      }
    });

    return { urgencia: urg, electiva: elec, tUrg, tUrgDif, tElec };
  }, [displayLibro]);

  // Chart Data Processing
  const monthlyChartData = useMemo(() => {
    const monthlyMap = {};
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    displayLibro.forEach(r => {
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

    const sortedData = Object.values(monthlyMap).sort((a, b) => a.key.localeCompare(b.key));

    // Calculate projection (Moving Average)
    sortedData.forEach((d, i) => {
      if (i === 0) d.proyeccion = d.total;
      else if (i === 1) d.proyeccion = Math.round((sortedData[0].total + d.total) / 2);
      else d.proyeccion = Math.round((sortedData[i - 2].total + sortedData[i - 1].total + d.total) / 3);
    });

    return sortedData;
  }, [displayLibro]);

  // Donut Chart 1: Distribución según cirugía realizada
  const distribucionCirugia = useMemo(() => {
    const dist = { 'Cirugía Mayor Ambulatoria': 0, 'Cirugía Mayor': 0, 'Cirugía Menor': 0, 'Procedimientos': 0 };
    displayLibro.forEach(r => {
      let tipo = r.tipo_cirugia;
      if (!['Cirugía Mayor', 'Cirugía Mayor Ambulatoria', 'Cirugía Menor', 'Procedimientos'].includes(tipo)) {
        if (tipo?.toLowerCase().includes('procedimiento')) tipo = 'Procedimientos';
        else if (tipo?.toLowerCase().includes('menor')) tipo = 'Cirugía Menor';
        else tipo = 'Cirugía Mayor';
      }
      dist[tipo]++;
    });
    return Object.entries(dist).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  }, [displayLibro]);

  // Donut Chart 2: Familia IQ
  const distribucionFamilia = useMemo(() => {
    const dist = {};
    displayLibro.forEach(r => {
      const fam = r.familia_iq || 'OTRAS';
      dist[fam] = (dist[fam] || 0) + 1;
    });
    return Object.entries(dist)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [displayLibro]);

  // Insights Clínicos (Ambulatorización, GES, Espera, Gestor)
  const insights = useMemo(() => {
    let cma = 0, cm = 0, total = 0, ges = 0, diasTotal = 0, diasCount = 0;
    let gestorInst = 0, gestorComp = 0;

    const topFamiliesCMA = {};
    const topFamiliesCM = {};

    distribucionCirugia.forEach(item => {
      if (item.name === 'Cirugía Mayor Ambulatoria') cma = item.value;
      if (item.name === 'Cirugía Mayor') cm = item.value;
    });

    displayLibro.forEach(r => {
      total++;
      if (r.ges && r.ges !== 'NO GES' && r.ges !== 'NO' && r.ges !== '') ges++;
      if (r.dias_espera && !isNaN(parseInt(r.dias_espera))) {
        diasTotal += parseInt(r.dias_espera);
        diasCount++;
      }

      const gestor = String(r.tipo_gestor || '').toUpperCase();
      if (gestor.includes('INSTITUCIONAL') || gestor === 'NO DEFINIDO') gestorInst++;
      else gestorComp++;

      const t = r.tipo_cirugia;
      const f = r.familia_iq || 'SIN FAMILIA';
      if (t === 'Cirugía Mayor Ambulatoria') topFamiliesCMA[f] = (topFamiliesCMA[f] || 0) + 1;
      if (t === 'Cirugía Mayor') topFamiliesCM[f] = (topFamiliesCM[f] || 0) + 1;
    });

    const topCMA = Object.entries(topFamiliesCMA).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];
    const topCM = Object.entries(topFamiliesCM).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];

    const indiceAmbulatorizacion = (cma + cm) > 0 ? ((cma / (cma + cm)) * 100).toFixed(1) : 0;
    const porcentajeCMA = total > 0 ? ((cma / total) * 100).toFixed(1) : 0;
    const porcentajeGES = total > 0 ? ((ges / total) * 100).toFixed(1) : 0;
    const porcentajeInst = total > 0 ? ((gestorInst / total) * 100).toFixed(1) : 0;
    const promedioEspera = diasCount > 0 ? Math.round(diasTotal / diasCount) : 0;

    return { cma, cm, indiceAmbulatorizacion, porcentajeCMA, porcentajeGES, promedioEspera, porcentajeInst, gestorComp, topCMA, topCM };
  }, [distribucionCirugia, displayLibro]);

  // Auditoría Crítica: Casos registrados como 'Intervenido' en Tabla de Pabellón que NO figuran cerrados en Discoverer
  const auditoriaCasos = useMemo(() => {
    if (!tablaData.length || !rawDataLibro.length) return [];

    const cleanRut = (r) => String(r || '').replace(/[^0-9kK]/g, '').toUpperCase();
    const getRutBody = (r) => {
      const c = cleanRut(r);
      return c.length > 1 ? c.slice(0, -1) : c;
    };
    const cleanStr = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

    // Indizar Libro por múltiples llaves
    const lByLe = new Set();
    const lByRutFecha = new Set();
    const lByRutBodyFecha = new Set();
    const lByRutList = new Map();
    const lByFecha = new Map();

    rawDataLibro.forEach(l => {
      const le = String(l.num_le || '').trim();
      const f = (l.fecha_cirugia || '').substring(0, 10);
      const r = cleanRut(l._rut_raw || l.rut);
      const rb = getRutBody(l._rut_raw || l.rut);

      if (le && le !== '0') lByLe.add(le);
      if (r && f) lByRutFecha.add(r + '_' + f);
      if (rb && rb.length >= 6 && f) lByRutBodyFecha.add(rb + '_' + f);
      if (r && r.length >= 6) {
        if (!lByRutList.has(r)) lByRutList.set(r, []);
        lByRutList.get(r).push(l);
      }
      if (f) {
        if (!lByFecha.has(f)) lByFecha.set(f, []);
        lByFecha.get(f).push({ ...l, pNorm: cleanStr(l.paciente) });
      }
    });

    const discrepancias = [];

    tablaData.forEach(t => {
      if (t.eliminada === true || t.eliminada === 'true') return;
      const f = (t.fecha_programacion || '').substring(0, 10);
      if (f < dateRange.start || f > dateRange.end) return;
      const est = (t.estado || '').toLowerCase();
      if (!est.includes('intervenido')) return;

      const le = String(t.id_lista_espera || '').trim();
      const r = cleanRut(t.rut);
      const rb = getRutBody(t.rut);

      // Evaluar coincidencia
      let match = false;
      // 1. LE exacta
      if (le && le !== '0' && lByLe.has(le)) match = true;
      // 2. RUT exacto en misma fecha
      else if (r && f && lByRutFecha.has(r + '_' + f)) match = true;
      // 3. Cuerpo de RUT en misma fecha
      else if (rb && rb.length >= 6 && f && lByRutBodyFecha.has(rb + '_' + f)) match = true;
      // 4. RUT en ventana temporal de reprogramación (+/- 7 días)
      else if (r && r.length >= 6 && lByRutList.has(r)) {
        const cands = lByRutList.get(r);
        const near = cands.some(c => {
          const cf = (c.fecha_cirugia || '').substring(0, 10);
          return Math.abs(new Date(cf) - new Date(f)) <= 7 * 86400000;
        });
        if (near) match = true;
      }
      // 5. Apellidos coincidentes en la misma fecha
      else if (f && lByFecha.has(f)) {
        const tPat = cleanStr(t.apellido_paterno);
        const tMat = cleanStr(t.apellido_materno);
        const cands = lByFecha.get(f);
        for (const c of cands) {
          if (tPat && tPat.length >= 4 && c.pNorm.includes(tPat)) {
            if (!tMat || tMat.length < 4 || c.pNorm.includes(tMat)) {
              match = true;
              break;
            }
          }
        }
      }

      if (!match) {
        discrepancias.push({
          id: t.id,
          fecha: f,
          pabellon: t.pabellon || 'S/I',
          rut: t.rut || 'S/RUT',
          paciente: [t.nombre_paciente, t.apellido_paterno, t.apellido_materno].filter(Boolean).join(' ') || 'SIN NOMBRE',
          id_lista_espera: le || '0',
          procedencia: t.procedencia || 'Electiva',
          tipo_cirugia: t.tipo_cirugia || 'Mayor',
          especialidad: t.especialidad || 'Sin Especialidad',
          cirujano: t.cirujano || 'Sin Cirujano',
          intervencion: t.intervencion_propuesta || t.diagnostico || 'Sin Detalle'
        });
      }
    });

    return discrepancias;
  }, [tablaData, rawDataLibro, dateRange]);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    if (percent < 0.05) return null;
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontWeight="bold" fontSize="11">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const renderCenterLabel = ({ viewBox }) => {
    const { cx, cy } = viewBox;
    return (
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
        <tspan x={cx} dy="-8" fontSize="1.8rem" fontWeight="900" fill="#0f172a">{totalKPI.val.toLocaleString()}</tspan>
        <tspan x={cx} dy="20" fontSize="0.82rem" fontWeight="600" fill="#64748b">{viewMode === 'cirugias' ? 'Cirugías' : 'Pacientes'}</tspan>
      </text>
    );
  };

  const renderCustomLegend = (props) => {
    const { payload } = props;
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.65rem', width: '90%', maxWidth: '300px' }}>
          {payload.map((entry, index) => (
            <li key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', backgroundColor: entry.color, borderRadius: '2px', display: 'inline-block', flexShrink: 0 }}></span>
              <span style={{ color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>{entry.value}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const currentTabUpdatedDate = useMemo(() => {
    let rawDate = null;
    let label = '';

    if (activeTab === 'libro') {
      rawDate = libroLastUpdated;
      label = 'Libro Electrónico';
    } else if (activeTab === 'tabla') {
      rawDate = tablaLastUpdated;
      label = 'Programación de Tabla';
    } else if (activeTab === 'disponibilidad') {
      rawDate = dispLastUpdated || tablaLastUpdated;
      label = 'Indicadores de Gestión';
    } else if (activeTab === 'insumos') {
      rawDate = insumosLastUpdated;
      label = 'Insumos y Costeo';
    }

    if (!rawDate) {
      rawDate = tablaLastUpdated || dispLastUpdated || libroLastUpdated || insumosLastUpdated;
      label = 'Base Quirúrgica';
    }

    if (!rawDate) return null;

    const d = new Date(rawDate);
    let formatted = String(rawDate);
    if (!isNaN(d.getTime())) {
      const pad = n => String(n).padStart(2, '0');
      const day = pad(d.getDate());
      const month = pad(d.getMonth() + 1);
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = pad(d.getMinutes());
      const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const hoursStr = pad(hours);
      formatted = `${day}-${month}-${year}, ${hoursStr}:${minutes} ${ampm}`;
    }

    return { formatted, label };
  }, [activeTab, tablaLastUpdated, dispLastUpdated, libroLastUpdated, insumosLastUpdated]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F4F4F4' }}>
      {/* HEADER */}
      <header style={{ padding: '24px 32px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '16px', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Volver al Portal General
          </button>
          <h1 style={{ fontSize: '2.2rem', color: '#1e293b', margin: 0, fontWeight: 800 }}>Panel de Producción Quirúrgica</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px', flexWrap: 'wrap' }}>
            <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0 }}>Estadísticas de Producción General y Libro Electrónico</p>
            {currentTabUpdatedDate && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '4px 14px',
                borderRadius: '999px',
                background: '#ecfdf5',
                color: '#065f46',
                border: '1.5px solid #a7f3d0',
                fontSize: '0.82rem',
                fontWeight: 700,
                boxShadow: '0 2px 6px rgba(16,185,129,0.1)'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                Actualizado: {currentTabUpdatedDate.formatted} ({currentTabUpdatedDate.label})
              </span>
            )}
          </div>
        </div>

        {/* TABS (Dark Longitudinal Menu) */}
        <div style={{ display: 'flex', gap: '12px', background: '#2d334a', padding: '12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 10 }}>
          {[
            { id: 'libro', label: 'Estadística (Libro)', icon: <BarChart2 size={18} /> },
            { id: 'tabla', label: 'Programación de tabla', icon: <Calendar size={18} /> },
            { id: 'disponibilidad', label: 'Indicadores de gestión', icon: <Clock size={18} /> },
            { id: 'insumos', label: 'Insumos y Costeo', icon: <DollarSign size={18} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 24px',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
                border: 'none',
                borderRadius: '14px',
                boxShadow: activeTab === tab.id ? '0 4px 15px rgba(99, 102, 241, 0.4)' : 'none',
                color: activeTab === tab.id ? 'white' : '#94a3b8',
                fontWeight: activeTab === tab.id ? 700 : 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* MAIN CONTENT AREA WITH FLOATING SIDEBAR */}
      {(activeTab === 'libro' || activeTab === 'tabla' || activeTab === 'disponibilidad') && (
        <div style={{ display: 'flex', flex: 1, alignItems: 'flex-start', position: 'relative' }}>
          {/* FLOATING SIDEBAR */}
          <motion.div
            onMouseEnter={() => setSidebarHovered(true)}
            onMouseLeave={() => setSidebarHovered(false)}
            initial={false}
            animate={{ 
              width: isExpanded ? 320 : 64,
              boxShadow: isExpanded 
                ? '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(30, 64, 175, 0.2)' 
                : '0 10px 30px -5px rgba(15, 23, 42, 0.12)'
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            style={{
              position: 'fixed',
              top: '125px',
              left: '20px',
              height: 'calc(100vh - 150px)',
              zIndex: 90,
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{ 
              padding: isExpanded ? '18px 20px' : '18px 0', 
              borderBottom: '1px solid rgba(226, 232, 240, 0.7)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: isExpanded ? 'space-between' : 'center',
              background: isExpanded ? 'linear-gradient(135deg, rgba(248, 250, 252, 0.9), rgba(241, 245, 249, 0.6))' : 'transparent',
              transition: 'all 0.3s ease'
            }}>
              {isExpanded ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ 
                      width: '36px', height: '36px', borderRadius: '12px', 
                      background: 'linear-gradient(135deg, #1e40af, #1e3a8a)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)'
                    }}>
                      <Filter size={18} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Filtros</h3>
                      {activeFilterCount > 0 ? (
                        <span style={{ fontSize: '0.7rem', color: '#1e40af', fontWeight: 700 }}>
                          {activeFilterCount} filtro{activeFilterCount > 1 ? 's' : ''} activo{activeFilterCount > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>
                          Pasa el mouse para desplegar
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearAllFilters}
                        title="Limpiar filtros"
                        style={{
                          padding: '6px 10px', borderRadius: '10px',
                          background: 'rgba(239, 68, 68, 0.1)', border: 'none',
                          color: '#ef4444', fontSize: '0.75rem', fontWeight: 700,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <RotateCcw size={12} /> Limpiar
                      </button>
                    )}
                    <button
                      onClick={() => setSidebarPinned(!sidebarPinned)}
                      title={sidebarPinned ? "Desfijar menú" : "Fijar menú abierto"}
                      style={{
                        width: '32px', height: '32px', borderRadius: '10px',
                        background: sidebarPinned ? '#1e40af' : 'rgba(241, 245, 249, 0.8)',
                        border: '1px solid #e2e8f0',
                        color: sidebarPinned ? 'white' : '#64748b', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Pin size={14} style={{ transform: sidebarPinned ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '14px', 
                    background: activeFilterCount > 0 ? 'linear-gradient(135deg, #1e40af, #1e3a8a)' : '#f1f5f9', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: activeFilterCount > 0 ? 'white' : '#64748b',
                    boxShadow: activeFilterCount > 0 ? '0 4px 12px rgba(30, 64, 175, 0.3)' : 'none',
                    transition: 'all 0.3s ease'
                  }}>
                    <Filter size={20} />
                  </div>
                  {activeFilterCount > 0 && (
                    <span style={{ 
                      position: 'absolute', top: '-4px', right: '-4px',
                      background: '#ef4444', color: 'white', fontSize: '0.65rem',
                      fontWeight: 900, borderRadius: '50%', width: '18px', height: '18px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid white', boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)'
                    }}>
                      {activeFilterCount}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Scrollable Filters List */}
            <div style={{ 
              flex: 1, 
              overflowY: isExpanded ? 'auto' : 'hidden', 
              padding: isExpanded ? '20px' : '16px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {isExpanded ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Periodo de Monitoreo */}
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <label style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Periodo de Monitoreo</label>
                      {activeTab === 'disponibilidad' && (
                        <span style={{ fontSize: '0.65rem', background: '#e0e7ff', color: '#3730a3', padding: '2px 6px', borderRadius: '6px', fontWeight: 800 }}>2026</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {activeTab === 'disponibilidad' ? (
                        <>
                          <input type="date" value={dateRangeIndicadores.start} onChange={e => setDateRangeIndicadores(p => ({ ...p, start: e.target.value }))} style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', color: '#1e293b', fontSize: '0.8rem', outline: 'none', fontWeight: 600 }} />
                          <input type="date" value={dateRangeIndicadores.end} onChange={e => setDateRangeIndicadores(p => ({ ...p, end: e.target.value }))} style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', color: '#1e293b', fontSize: '0.8rem', outline: 'none', fontWeight: 600 }} />
                        </>
                      ) : (
                        <>
                          <input type="date" defaultValue={dateRange.start} onBlur={e => setDateRange(p => ({ ...p, start: e.target.value }))} style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#1e293b', fontSize: '0.8rem', outline: 'none', fontWeight: 600 }} />
                          <input type="date" defaultValue={dateRange.end} onBlur={e => setDateRange(p => ({ ...p, end: e.target.value }))} style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#1e293b', fontSize: '0.8rem', outline: 'none', fontWeight: 600 }} />
                        </>
                      )}
                    </div>
                    {activeTab === 'disponibilidad' && (
                      <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                        <button
                          onClick={() => setDateRangeIndicadores({ start: '2026-01-01', end: '2026-12-31' })}
                          style={{ flex: 1, padding: '4px 6px', fontSize: '0.7rem', background: (dateRangeIndicadores.start === '2026-01-01' && dateRangeIndicadores.end === '2026-12-31') ? '#1e40af' : '#f1f5f9', color: (dateRangeIndicadores.start === '2026-01-01' && dateRangeIndicadores.end === '2026-12-31') ? 'white' : '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                        >
                          Año 2026
                        </button>
                        <button
                          onClick={() => setDateRangeIndicadores({ start: '2026-01-01', end: '2026-06-30' })}
                          style={{ flex: 1, padding: '4px 6px', fontSize: '0.7rem', background: (dateRangeIndicadores.start === '2026-01-01' && dateRangeIndicadores.end === '2026-06-30') ? '#1e40af' : '#f1f5f9', color: (dateRangeIndicadores.start === '2026-01-01' && dateRangeIndicadores.end === '2026-06-30') ? 'white' : '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                        >
                          1er Sem 2026
                        </button>
                        <button
                          onClick={() => setDateRangeIndicadores({ start: '2025-01-01', end: '2026-12-31' })}
                          style={{ flex: 1, padding: '4px 6px', fontSize: '0.7rem', background: (dateRangeIndicadores.start === '2025-01-01' && dateRangeIndicadores.end === '2026-12-31') ? '#1e40af' : '#f1f5f9', color: (dateRangeIndicadores.start === '2025-01-01' && dateRangeIndicadores.end === '2026-12-31') ? 'white' : '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                        >
                          Histórico
                        </button>
                      </div>
                    )}
                  </div>

                  {activeTab === 'libro' && (
                    <>
                      {[
                        { label: 'N° Pabellón (Tabla Quirúrgica)', val: libroPabellonTabla, set: setLibroPabellonTabla, options: dropdowns.pabellonesTabla },
                        { label: 'Pabellón CRR (Tabla)', val: libroPabellonCrr, set: setLibroPabellonCrr, options: dropdowns.crrOptions },
                        { label: 'Tipo de Cirugía', val: tipoCirugia, set: setTipoCirugia, options: dropdowns.tipos },
                        { label: 'Tipo de Paciente', val: tipoPaciente, set: setTipoPaciente, options: dropdowns.tipoPacientes },
                        { label: 'Procedencia', val: procedencia, set: setProcedencia, options: dropdowns.procedencias },
                        { label: 'Tipo de Gestor', val: tipoGestor, set: setTipoGestor, options: dropdowns.gestores },
                        { label: 'Forma de Pago', val: formaPago, set: setFormaPago, options: dropdowns.pagos },
                        { label: 'Nombre IQ', val: nombreIq, set: setNombreIq, options: dropdowns.iqs },
                        { label: 'Primer Cirujano', val: primerCirujano, set: setPrimerCirujano, options: dropdowns.ciru1 },
                        { label: 'Segundo Cirujano', val: segundoCirujano, set: setSegundoCirujano, options: dropdowns.ciru2 },
                        { label: 'Anestesiólogo', val: anestesiologo, set: setAnestesiologo, options: dropdowns.anestes },
                        { label: 'Reintervención', val: reintervencion, set: setReintervencion, options: dropdowns.reints }
                      ].map((f, i) => (
                        <div key={i}>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, marginBottom: '6px', color: '#64748b', textTransform: 'uppercase' }}>{f.label}</label>
                          <MultiSearchableSelect value={f.val} options={f.options} onChange={f.set} />
                        </div>
                      ))}
                    </>
                  )}

                  {activeTab === 'tabla' && (
                    <>
                      {[
                        { label: 'Fecha de programación', val: tablaFechaProg, set: setTablaFechaProg, options: tablaDropdowns.fechas },
                        { label: 'Gran Causa de Suspensión', val: tablaCausaSuspension, set: setTablaCausaSuspension, options: tablaDropdowns.causas },
                        { label: 'Causa Específica (Motivo)', val: tablaMotivoSuspension, set: setTablaMotivoSuspension, options: tablaDropdowns.motivos },
                        { label: 'Tipo de cirugía', val: tablaTipoCirugia, set: setTablaTipoCirugia, options: tablaDropdowns.tipos },
                        { label: 'Tipo de paciente', val: tablaTipoPaciente, set: setTablaTipoPaciente, options: tablaDropdowns.tipoPacientes },
                        { label: 'Tipo de priorización', val: tablaPriorizacion, set: setTablaPriorizacion, options: tablaDropdowns.prios },
                        { label: 'Pabellón CRR', val: tablaPabellonCrr, set: setTablaPabellonCrr, options: tablaDropdowns.crrs },
                        { label: 'Intervención Propuesta', val: tablaIntervencion, set: setTablaIntervencion, options: tablaDropdowns.ints },
                        { label: 'Primer Cirujano', val: tablaCirujano, set: setTablaCirujano, options: tablaDropdowns.cirus },
                        { label: 'Anestesiólogo', val: tablaAnestesista, set: setTablaAnestesista, options: tablaDropdowns.anestesistas },
                        { label: 'Pabellón', val: tablaPabellon, set: setTablaPabellon, options: tablaDropdowns.pabs },
                        { label: 'Modalidad de atención', val: tablaModalidad, set: setTablaModalidad, options: tablaDropdowns.mods }
                      ].map((f, i) => (
                        <div key={i}>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, marginBottom: '6px', color: '#64748b', textTransform: 'uppercase' }}>{f.label}</label>
                          <MultiSearchableSelect value={f.val} options={f.options} onChange={f.set} />
                        </div>
                      ))}
                    </>
                  )}

                  {activeTab === 'disponibilidad' && (
                    <>
                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, marginBottom: '6px', color: '#1e40af', textTransform: 'uppercase' }}>Búsqueda Rápida</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            placeholder="Paciente, cirujano, IQ..."
                            value={indicadorSearch}
                            onChange={e => setIndicadorSearch(e.target.value)}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none' }}
                          />
                        </div>
                      </div>

                      {/* Selector Tipo de Jornada (Días Hábiles / No Hábiles) */}
                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, marginBottom: '8px', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tipo de Jornada / Días</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {[
                            { id: 'habiles', label: 'Días hábiles (Lun - Vie)', badge: 'Lun a Vie' },
                            { id: 'no_habiles', label: 'Días no hábiles (Sáb - Dom)', badge: 'Sáb y Dom' },
                            { id: 'todos', label: 'Todos los días', badge: 'Completo' }
                          ].map(t => (
                            <button
                              key={t.id}
                              onClick={() => setIndicadorTipoDia(t.id)}
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                fontSize: '0.78rem',
                                textAlign: 'left',
                                borderRadius: '8px',
                                border: indicadorTipoDia === t.id ? '1.5px solid #1e40af' : '1px solid #e2e8f0',
                                background: indicadorTipoDia === t.id ? '#eff6ff' : 'white',
                                color: indicadorTipoDia === t.id ? '#1e40af' : '#334155',
                                fontWeight: indicadorTipoDia === t.id ? 800 : 500,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <span>{t.label}</span>
                              {indicadorTipoDia === t.id && (
                                <span style={{ background: '#1e40af', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '6px', fontWeight: 700 }}>Activo</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {[
                        { label: 'Pabellón', val: indicadorPabellon, set: setIndicadorPabellon, options: indicadorDropdowns.pabs },
                        { label: 'Estado Cumplimiento (15 min)', val: indicadorCumplimiento, set: setIndicadorCumplimiento, options: indicadorDropdowns.cumplimientos }
                      ].map((f, i) => (
                        <div key={i}>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, marginBottom: '6px', color: '#64748b', textTransform: 'uppercase' }}>{f.label}</label>
                          <MultiSearchableSelect value={f.val} options={f.options} onChange={f.set} />
                        </div>
                      ))}
                    </>
                  )}
                </motion.div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', paddingTop: '10px' }}>
                  <div title="Pasa el mouse para filtrar" style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: '2px', cursor: 'pointer' }}>
                    FILTROS
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* RIGHT DASHBOARD CONTENT */}
          <div style={{ flex: 1, padding: '32px 32px 32px 100px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <p>Cargando datos...</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                {activeTab === 'libro' && (
                  <>
                    {/* TOP ACTION & CONTEXT BANNER */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                      padding: '16px 20px',
                      borderRadius: '18px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                      marginBottom: '20px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#eff6ff',
                          color: '#1e40af',
                          padding: '6px 14px',
                          borderRadius: '999px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          border: '1px solid #bfdbfe'
                        }}>
                          <Award size={14} /> Hospital de Villarrica · Mediana Complejidad
                        </div>
                        <span style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
                          Período activo: <strong style={{ color: '#0f172a' }}>{dateRange.start}</strong> a <strong style={{ color: '#0f172a' }}>{dateRange.end}</strong>
                        </span>
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>•</span>
                        <span style={{
                          color: '#047857',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          background: '#ecfdf5',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          border: '1px solid #a7f3d0'
                        }}>
                          Tasa de Concentración: {surgicalDensity.ratio} cx/caso
                        </span>
                        {libroPabellonTabla.length > 0 && (
                          <span style={{
                            color: '#1d4ed8',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            background: '#eff6ff',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            border: '1px solid #bfdbfe'
                          }}>
                            Pabellón Tabla: {libroPabellonTabla.join(', ')}
                          </span>
                        )}
                        {libroPabellonCrr.length > 0 && (
                          <span style={{
                            color: '#7c3aed',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            background: '#f5f3ff',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            border: '1px solid #ddd6fe'
                          }}>
                            CRR: {libroPabellonCrr.join(', ')}
                          </span>
                        )}
                      </div>

                      {/* TOGGLE MODO DE ANÁLISIS: CIRUGÍAS VS PACIENTES (EVENTOS QUIRÚRGICOS) */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: '#0f172a',
                        padding: '4px',
                        borderRadius: '14px',
                        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
                      }}>
                        <button
                          onClick={() => setViewMode('cirugias')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 18px',
                            borderRadius: '10px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            background: viewMode === 'cirugias' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent',
                            color: viewMode === 'cirugias' ? '#ffffff' : '#94a3b8',
                            boxShadow: viewMode === 'cirugias' ? '0 2px 8px rgba(37, 99, 235, 0.5)' : 'none',
                            transition: 'all 0.2s ease'
                          }}
                          title="Cuenta cada procedimiento e intervención quirúrgica registrada (1 paciente puede tener múltiples cirugías)"
                        >
                          <Activity size={15} />
                          <span>Por Cirugías</span>
                          <span style={{
                            background: viewMode === 'cirugias' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                            padding: '2px 7px',
                            borderRadius: '8px',
                            fontSize: '0.72rem'
                          }}>
                            {filteredLibro.length.toLocaleString()}
                          </span>
                        </button>

                        <button
                          onClick={() => setViewMode('pacientes')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 18px',
                            borderRadius: '10px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            background: viewMode === 'pacientes' ? 'linear-gradient(135deg, #0d9488, #0f766e)' : 'transparent',
                            color: viewMode === 'pacientes' ? '#ffffff' : '#94a3b8',
                            boxShadow: viewMode === 'pacientes' ? '0 2px 8px rgba(13, 148, 136, 0.5)' : 'none',
                            transition: 'all 0.2s ease'
                          }}
                          title="Cuenta 1 caso por evento quirúrgico / paciente, catalogado por la cirugía principal (marcada al 100%)"
                        >
                          <Users size={15} />
                          <span>Por Paciente / Evento</span>
                          <span style={{
                            background: viewMode === 'pacientes' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                            padding: '2px 7px',
                            borderRadius: '8px',
                            fontSize: '0.72rem'
                          }}>
                            {surgicalDensity.totalPac.toLocaleString()}
                          </span>
                        </button>

                        {/* BOTÓN AUDITORÍA CRÍTICA DE CASOS PENDIENTES */}
                        {auditoriaCasos.length > 0 && (
                          <button
                            onClick={() => setShowAuditoriaModal(true)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 16px',
                              borderRadius: '10px',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: 800,
                              background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                              color: '#ffffff',
                              boxShadow: '0 2px 10px rgba(239, 68, 68, 0.45)',
                              transition: 'all 0.2s ease',
                              marginLeft: '6px'
                            }}
                            title="Ver casos intervenidos en Tabla que NO registran cierre en Discoverer"
                          >
                            <AlertCircle size={15} />
                            <span>Auditoría de Cierres</span>
                            <span style={{
                              background: 'rgba(255,255,255,0.3)',
                              padding: '2px 8px',
                              borderRadius: '999px',
                              fontSize: '0.72rem',
                              fontWeight: 900
                            }}>
                              {auditoriaCasos.length}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* KPI ROW: 4 TARJETAS EJECUTIVAS */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                      {/* CARD 1: PRODUCCION TOTAL */}
                      <div style={{
                        background: 'white',
                        padding: '18px 20px',
                        borderRadius: '18px',
                        border: '1px solid #e2e8f0',
                        borderLeft: '5px solid #1e40af',
                        boxShadow: '0 4px 14px rgba(30, 64, 175, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              {viewMode === 'cirugias' ? 'Producción Total (Cirugías)' : 'Pacientes Intervenidos (Casos)'}
                            </p>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>YoY vs año ant.</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                            <h2 style={{ margin: 0, fontSize: '2.3rem', color: '#1e40af', fontWeight: 900, lineHeight: 1 }}>
                              {totalKPI.val.toLocaleString()}
                            </h2>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                              {viewMode === 'cirugias' ? 'intervenciones' : 'casos únicos'}
                            </span>
                          </div>
                        </div>
                        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.72rem',
                            background: totalKPI.trend === 'positive' ? 'rgba(30, 64, 175, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: totalKPI.trend === 'positive' ? '#1e40af' : '#ef4444',
                            padding: '3px 8px',
                            borderRadius: '8px',
                            fontWeight: 800
                          }}>
                            {totalKPI.trend === 'positive' ? <TrendingUp size={13} /> : <TrendingDown size={13} />} {totalKPI.text}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            Base ant: {totalKPI.prior?.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* CARD 2: CIRUGIA MAYOR Y AMBULATORIZACION */}
                      <div style={{
                        background: 'white',
                        padding: '18px 20px',
                        borderRadius: '18px',
                        border: '1px solid #e2e8f0',
                        borderLeft: '5px solid #DF6D05',
                        boxShadow: '0 4px 14px rgba(223, 109, 5, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Cirugías Mayores (CM + CMA)
                            </p>
                            <span style={{
                              fontSize: '0.68rem',
                              background: '#fff7ed',
                              color: '#c2410c',
                              padding: '2px 6px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              border: '1px solid #ffedd5'
                            }}>
                              {totalKPI.val > 0 ? ((mayorKPI.val / totalKPI.val) * 100).toFixed(1) : 0}% del total
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                            <h2 style={{ margin: 0, fontSize: '2.3rem', color: '#DF6D05', fontWeight: 900, lineHeight: 1 }}>
                              {mayorKPI.val.toLocaleString()}
                            </h2>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                              Mayor complejidad
                            </span>
                          </div>
                        </div>
                        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.72rem',
                            background: mayorKPI.trend === 'positive' ? 'rgba(223, 109, 5, 0.12)' : 'rgba(239, 68, 68, 0.1)',
                            color: mayorKPI.trend === 'positive' ? '#DF6D05' : '#ef4444',
                            padding: '3px 8px',
                            borderRadius: '8px',
                            fontWeight: 800
                          }}>
                            {mayorKPI.trend === 'positive' ? <TrendingUp size={13} /> : <TrendingDown size={13} />} {mayorKPI.text}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            CMA: {insights.indiceAmbulatorizacion}%
                          </span>
                        </div>
                      </div>

                      {/* CARD 3: URGENCIA VS ELECTIVA */}
                      <div style={{
                        background: 'white',
                        padding: '18px 20px',
                        borderRadius: '18px',
                        border: '1px solid #e2e8f0',
                        borderLeft: '5px solid #F2A400',
                        boxShadow: '0 4px 14px rgba(242, 164, 0, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Urgencias vs Electivas
                            </p>
                            <span style={{
                              fontSize: '0.68rem',
                              background: '#fefce8',
                              color: '#a16207',
                              padding: '2px 6px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              border: '1px solid #fef08a'
                            }}>
                              {totalKPI.val > 0 ? ((procedenciaStats.urgencia / totalKPI.val) * 100).toFixed(1) : 0}% tasa urg.
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                            <h2 style={{ margin: 0, fontSize: '2.3rem', color: '#b45309', fontWeight: 900, lineHeight: 1 }}>
                              {procedenciaStats.urgencia.toLocaleString()}
                            </h2>
                            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 700 }}>
                              / {procedenciaStats.electiva.toLocaleString()} elec.
                            </span>
                          </div>
                        </div>
                        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.72rem',
                            background: urgenciaKPI.trend === 'positive' ? 'rgba(242, 164, 0, 0.15)' : 'rgba(148, 163, 184, 0.12)',
                            color: urgenciaKPI.trend === 'positive' ? '#b45309' : '#64748b',
                            padding: '3px 8px',
                            borderRadius: '8px',
                            fontWeight: 800
                          }}>
                            <AlertCircle size={13} /> Urg. {urgenciaKPI.text}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            Diferidas: {procedenciaStats.tUrgDif}
                          </span>
                        </div>
                      </div>

                      {/* CARD 4: DENSIDAD QUIRÚRGICA Y GES */}
                      <div style={{
                        background: 'white',
                        padding: '18px 20px',
                        borderRadius: '18px',
                        border: '1px solid #e2e8f0',
                        borderLeft: '5px solid #0d9488',
                        boxShadow: '0 4px 14px rgba(13, 148, 136, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Efectividad y Garantías GES
                            </p>
                            <span style={{
                              fontSize: '0.68rem',
                              background: '#f0fdfa',
                              color: '#0f766e',
                              padding: '2px 6px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              border: '1px solid #ccfbf1'
                            }}>
                              Espera: {insights.promedioEspera}d
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                            <h2 style={{ margin: 0, fontSize: '2.3rem', color: '#0f766e', fontWeight: 900, lineHeight: 1 }}>
                              {insights.porcentajeGES}%
                            </h2>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                              Cobertura GES
                            </span>
                          </div>
                        </div>
                        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.72rem',
                            background: '#f0fdfa',
                            color: '#0f766e',
                            padding: '3px 8px',
                            borderRadius: '8px',
                            fontWeight: 800
                          }}>
                            <CheckCircle size={13} /> {viewMode === 'cirugias' ? `1 caso = ${(1/parseFloat(surgicalDensity.ratio || 1)).toFixed(2)} pac.` : '1 caso = 1 pac. (100%)'}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            Inst: {insights.porcentajeInst}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* MAIN VISUAL SPLIT (FITS IN SINGLE EXECUTIVE VIEW) */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1.8fr 1fr',
                      gap: '20px',
                      marginBottom: '20px'
                    }}>
                      {/* LEFT: COMPOSED MONTHLY EVOLUTION & MOVING AVERAGE */}
                      <div style={{
                        background: 'white',
                        padding: '20px 22px',
                        borderRadius: '20px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '14px',
                          borderBottom: '1px solid #f1f5f9',
                          paddingBottom: '12px'
                        }}>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                              Evolución Mensual de Producción y Tendencia Móvil
                            </h3>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                              Desagregación según tipología clínica ({viewMode === 'cirugias' ? 'total cirugías' : 'casos de pacientes'})
                            </p>
                          </div>
                          <div style={{
                            fontSize: '0.72rem',
                            background: '#f8fafc',
                            color: '#475569',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            fontWeight: 700
                          }}>
                            Proyección: Media Móvil 3m
                          </div>
                        </div>

                        <div style={{ flex: 1, minHeight: '340px' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={monthlyChartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                              <RechartsTooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 8px 20px rgba(0,0,0,0.08)', fontSize: '0.8rem' }}
                              />
                              <Legend wrapperStyle={{ paddingTop: '8px', fontSize: '0.78rem' }} />

                              <Bar yAxisId="left" dataKey="Cirugía Mayor" stackId="a" fill={PIE_COLORS['Cirugía Mayor']}>
                                <LabelList dataKey="Cirugía Mayor" position="inside" fill="#fff" fontSize={10} fontWeight={700} formatter={v => v > 40 ? v : ''} />
                              </Bar>
                              <Bar yAxisId="left" dataKey="Cirugía Mayor Ambulatoria" stackId="a" fill={PIE_COLORS['Cirugía Mayor Ambulatoria']}>
                                <LabelList dataKey="Cirugía Mayor Ambulatoria" position="inside" fill="#fff" fontSize={10} fontWeight={700} formatter={v => v > 40 ? v : ''} />
                              </Bar>
                              <Bar yAxisId="left" dataKey="Cirugía Menor" stackId="a" fill={PIE_COLORS['Cirugía Menor']}>
                                <LabelList dataKey="Cirugía Menor" position="inside" fill="#fff" fontSize={10} fontWeight={700} formatter={v => v > 30 ? v : ''} />
                              </Bar>
                              <Bar yAxisId="left" dataKey="Procedimientos" stackId="a" fill={PIE_COLORS['Procedimientos']}>
                                <LabelList dataKey="Procedimientos" position="inside" fill="#fff" fontSize={10} fontWeight={700} formatter={v => v > 30 ? v : ''} />
                                <LabelList dataKey="total" position="top" fill="#0f172a" fontSize={11} fontWeight={800} />
                              </Bar>

                              <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="proyeccion"
                                stroke="#e11d48"
                                strokeWidth={2.5}
                                dot={{ r: 3, fill: '#e11d48' }}
                                activeDot={{ r: 5 }}
                                name="Tendencia Móvil"
                              />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* RIGHT: DONUT BREAKDOWN (CIRUGÍA / FAMILIA) */}
                      <div style={{
                        background: 'white',
                        padding: '20px 22px',
                        borderRadius: '20px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '14px',
                          borderBottom: '1px solid #f1f5f9',
                          paddingBottom: '12px'
                        }}>
                          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                            Composición
                          </h3>
                          <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '10px' }}>
                            <button
                              onClick={() => setPieMode('cirugia')}
                              style={{
                                padding: '5px 12px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                borderRadius: '7px',
                                border: 'none',
                                background: pieMode === 'cirugia' ? '#1e40af' : 'transparent',
                                color: pieMode === 'cirugia' ? 'white' : '#64748b',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              Por Tipo
                            </button>
                            <button
                              onClick={() => setPieMode('familia')}
                              style={{
                                padding: '5px 12px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                borderRadius: '7px',
                                border: 'none',
                                background: pieMode === 'familia' ? '#1e40af' : 'transparent',
                                color: pieMode === 'familia' ? 'white' : '#64748b',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              Por Familia
                            </button>
                          </div>
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '340px' }}>
                          <div style={{ flex: 1, minHeight: '190px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPieChart>
                                <Pie
                                  data={pieMode === 'cirugia' ? distribucionCirugia : distribucionFamilia}
                                  cy="50%"
                                  innerRadius={55}
                                  outerRadius={85}
                                  paddingAngle={2}
                                  dataKey="value"
                                  labelLine={false}
                                  label={renderCustomizedLabel}
                                >
                                  <Label content={renderCenterLabel} />
                                  {(pieMode === 'cirugia' ? distribucionCirugia : distribucionFamilia).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={pieMode === 'cirugia' ? (PIE_COLORS[entry.name] || COLORS[index % COLORS.length]) : COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <RechartsTooltip contentStyle={{ borderRadius: '10px', fontSize: '0.78rem' }} />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          </div>

                          <div style={{ marginTop: '8px', maxHeight: '110px', overflowY: 'auto' }}>
                            {renderCustomLegend({ payload: (pieMode === 'cirugia' ? distribucionCirugia : distribucionFamilia).map((entry, index) => ({ color: pieMode === 'cirugia' ? (PIE_COLORS[entry.name] || COLORS[index % COLORS.length]) : COLORS[index % COLORS.length], value: entry.name })) })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* COMPACT EXECUTIVE INSIGHTS GRID */}
                    <div style={{
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                      padding: '18px 22px',
                      borderRadius: '20px',
                      color: 'white',
                      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                      marginBottom: '20px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <TrendingUp size={17} color="#F2A400" />
                          <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, letterSpacing: '0.3px', textTransform: 'uppercase', color: '#f8fafc' }}>
                            Principales Insights de Producción y Gestión Quirúrgica
                          </h4>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          Análisis activo: <strong style={{ color: '#38bdf8' }}>{viewMode === 'cirugias' ? 'Cirugías Totales' : 'Pacientes Únicos (Cirugía Principal al 100%)'}</strong>
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                        {/* Insight 1: Ambulatorizacion */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 14px', borderRadius: '12px', borderLeft: '3px solid #F2A400' }}>
                          <p style={{ margin: '0 0 3px 0', fontSize: '0.66rem', textTransform: 'uppercase', color: '#F2A400', fontWeight: 800 }}>
                            Índice Ambulatorización
                          </p>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <h4 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, color: '#ffffff' }}>
                              {insights.indiceAmbulatorizacion}%
                            </h4>
                            <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>CMA s/ Mayor</span>
                          </div>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.3 }}>
                            Eficiencia en uso de camas quirúrgicas del establecimiento.
                          </p>
                        </div>

                        {/* Insight 2: Top Familias */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 14px', borderRadius: '12px', borderLeft: '3px solid #60a5fa' }}>
                          <p style={{ margin: '0 0 3px 0', fontSize: '0.66rem', textTransform: 'uppercase', color: '#60a5fa', fontWeight: 800 }}>
                            Polos de Mayor Volumen
                          </p>
                          <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            CMA: <span style={{ fontWeight: 500, color: '#e2e8f0' }}>{insights.topCMA[0]}</span> <strong style={{ color: '#60a5fa' }}>({insights.topCMA[1]})</strong>
                          </p>
                          <p style={{ margin: '3px 0 0 0', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            CM: <span style={{ fontWeight: 500, color: '#e2e8f0' }}>{insights.topCM[0]}</span> <strong style={{ color: '#60a5fa' }}>({insights.topCM[1]})</strong>
                          </p>
                        </div>

                        {/* Insight 3: Urgencias y Oportunidad */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 14px', borderRadius: '12px', borderLeft: '3px solid #f87171' }}>
                          <p style={{ margin: '0 0 3px 0', fontSize: '0.66rem', textTransform: 'uppercase', color: '#f87171', fontWeight: 800 }}>
                            Demanda no programada
                          </p>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <h4 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, color: '#ffffff' }}>
                              {procedenciaStats.tUrg.toLocaleString()}
                            </h4>
                            <span style={{ fontSize: '0.7rem', color: '#fca5a5' }}>urg. directas</span>
                          </div>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.3 }}>
                            Más <strong>{procedenciaStats.tUrgDif}</strong> diferidas compensadas en sala.
                          </p>
                        </div>

                        {/* Insight 4: Concentración Quirúrgica */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 14px', borderRadius: '12px', borderLeft: '3px solid #34d399' }}>
                          <p style={{ margin: '0 0 3px 0', fontSize: '0.66rem', textTransform: 'uppercase', color: '#34d399', fontWeight: 800 }}>
                            Multi-intervención
                          </p>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <h4 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, color: '#ffffff' }}>
                              {surgicalDensity.ratio}
                            </h4>
                            <span style={{ fontSize: '0.7rem', color: '#a7f3d0' }}>cx / paciente</span>
                          </div>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.3 }}>
                            {viewMode === 'pacientes' ? 'Vista agrupada por evento principal (100%)' : 'Contando cada procedimiento secundario'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* COLLAPSIBLE DETAILED PIVOT TABLE */}
                    <div style={{
                      background: 'white',
                      borderRadius: '18px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                      overflow: 'hidden'
                    }}>
                      <div
                        onClick={() => setShowPivotTable(!showPivotTable)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '16px 22px',
                          cursor: 'pointer',
                          background: showPivotTable ? '#f8fafc' : 'white',
                          transition: 'background 0.2s ease',
                          borderBottom: showPivotTable ? '1px solid #e2e8f0' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '10px',
                            background: '#eff6ff',
                            color: '#1e40af',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Users size={18} />
                          </div>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                              Despliegue Detallado de Producción (Matriz Dinámica por Familia / Intervención / Cirujano)
                            </h4>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                              {showPivotTable ? 'Haz clic para plegar la matriz' : 'Haz clic para desplegar la tabla analítica completa con aperturas mensuales e históricas'}
                            </p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: '#1e40af',
                            background: '#eff6ff',
                            padding: '4px 12px',
                            borderRadius: '8px',
                            border: '1px solid #bfdbfe'
                          }}>
                            {showPivotTable ? 'Ocultar Matriz' : 'Desplegar Matriz'}
                          </span>
                          {showPivotTable ? <ChevronDown size={18} color="#1e40af" /> : <ChevronRight size={18} color="#64748b" />}
                        </div>
                      </div>

                      {showPivotTable && (
                        <div style={{ padding: '20px' }}>
                          <PivotTable data={displayLibro} totalCirugias={totalKPI.val} />
                        </div>
                      )}
                    </div>

                  </>
                )}
                {(activeTab === 'tabla' || activeTab === 'informe-crr') && (
                  <div>
                    {/* TÍTULO DEL TABLERO */}
                    <div style={{ marginBottom: '24px' }}>
                      <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                        Programación de tabla quirúrgica y suspensiones quirúrgicas
                      </h2>
                    </div>

                    {/* MENÚ DE PESTAÑAS EJECUTIVAS PARA TABLA */}
                    <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '6px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px', flexWrap: 'wrap' }}>
                      {[
                        { id: 'resumen', label: '📊 1. Resumen & Métricas Clave' },
                        { id: 'profesionales', label: '👨‍⚕️ 2. Cirujanos, Anestesiólogos & Causas' },
                        { id: 'tabla_jerarquica', label: '🌳 3. Tabla Jerárquica (4 Niveles)' },
                        { id: 'pivot', label: '📋 4. Matriz Pivot Quirúrgica' }
                      ].map(st => (
                        <button
                          key={st.id}
                          onClick={() => setTablaSubTab(st.id)}
                          style={{
                            padding: '10px 18px',
                            fontSize: '0.82rem',
                            fontWeight: tablaSubTab === st.id ? 800 : 600,
                            borderRadius: '12px',
                            border: 'none',
                            background: tablaSubTab === st.id ? 'linear-gradient(135deg, #1e40af, #1d4ed8)' : 'transparent',
                            color: tablaSubTab === st.id ? 'white' : '#475569',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: tablaSubTab === st.id ? '0 4px 12px rgba(30, 64, 175, 0.25)' : 'none'
                          }}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>

                    {/* SUB-TAB 1: RESUMEN & MÉTRICAS CLAVE */}
                    {tablaSubTab === 'resumen' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                        {/* KPI CARDS PARA TABLA */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                          <div style={{ background: '#f4f4f4', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                            <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: '#1e293b', fontWeight: 700 }}>PACIENTES PROGRAMADOS</p>
                            <h2 style={{ margin: 0, fontSize: '2rem', color: '#0f172a', fontWeight: 900 }}>{tablaProgKPI.val.toLocaleString()}</h2>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: tablaProgKPI.trend === 'positive' ? '#10b981' : '#ef4444', fontWeight: 800, marginTop: '8px' }}>
                               {tablaProgKPI.text}
                            </div>
                          </div>

                          <div style={{ background: '#f4f4f4', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                            <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: '#1e293b', fontWeight: 700 }}>PACIENTES INTERVENIDOS</p>
                            <h2 style={{ margin: 0, fontSize: '2rem', color: '#0f172a', fontWeight: 900 }}>{tablaIntKPI.val.toLocaleString()}</h2>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: tablaIntKPI.trend === 'positive' ? '#10b981' : '#ef4444', fontWeight: 800, marginTop: '8px' }}>
                               {tablaIntKPI.text}
                            </div>
                          </div>

                          <div style={{ background: '#f4f4f4', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                            <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: '#1e293b', fontWeight: 700 }}>PACIENTES SUSPENDIDOS</p>
                            <h2 style={{ margin: 0, fontSize: '2rem', color: '#0f172a', fontWeight: 900 }}>{tablaSuspKPI.val.toLocaleString()}</h2>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: tablaSuspKPI.trend === 'positive' ? '#10b981' : '#ef4444', fontWeight: 800, marginTop: '8px' }}>
                               {tablaSuspKPI.text}
                            </div>
                          </div>

                          <div style={{ background: '#f4f4f4', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                            <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: '#1e293b', fontWeight: 700 }}>% SUSPENSIONES</p>
                            <h2 style={{ margin: 0, fontSize: '2rem', color: '#0f172a', fontWeight: 900 }}>{currentSuspPct.toFixed(1)} %</h2>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: suspPctTrend === 'positive' ? '#10b981' : '#ef4444', fontWeight: 800, marginTop: '8px' }}>
                               {suspPctText}
                            </div>
                          </div>
                        </div>

                        {/* BAR CHART PRODUCCIÓN */}
                        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', marginBottom: '24px' }}>
                          <h3 style={{ margin: '0 0 24px 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Producción Quirúrgica y Suspensiones</h3>
                          <div style={{ height: '360px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart data={tablaChartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `${val}%`} />
                                <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                
                                <Bar yAxisId="left" dataKey="Pendientes" stackId="a" fill="#94a3b8" barSize={40} name="Pendientes">
                                  <LabelList dataKey="Pendientes" position="inside" fill="#fff" fontSize={11} fontWeight={600} formatter={v => v > 0 ? v : ''} />
                                </Bar>
                                <Bar yAxisId="left" dataKey="Intervenidos" stackId="a" fill="#1e40af" barSize={40} name="Intervenidos">
                                  <LabelList dataKey="Intervenidos" position="inside" fill="#fff" fontSize={11} fontWeight={600} formatter={v => v > 0 ? v : ''} />
                                </Bar>
                                <Bar yAxisId="left" dataKey="Suspendidos" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} name="Suspendidos">
                                  <LabelList dataKey="Suspendidos" position="inside" fill="#fff" fontSize={11} fontWeight={600} formatter={v => v > 0 ? v : ''} />
                                  <LabelList dataKey="Programados" position="top" fill="#0f172a" fontSize={12} fontWeight={800} formatter={v => v > 0 ? v : ''} />
                                </Bar>
                                
                                <Line yAxisId="right" type="monotone" dataKey="pctSuspensiones" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} activeDot={{ r: 6 }} name="% Suspensiones" />
                                <ReferenceLine yAxisId="right" y={5} stroke="#ef4444" strokeDasharray="3 3" opacity={0.6} label={{ position: 'top', value: 'Meta 5%', fill: '#ef4444', fontSize: 11, fontWeight: 700 }} />
                              </ComposedChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* INSIGHTS ROW WITH CHARTS */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Desglose de Suspensiones</h3>
                            <p style={{ margin: '0 0 24px 0', fontSize: '0.8rem', color: '#64748b' }}>Anillo interno: Causas / Anillo externo: Motivos</p>
                            <div style={{ height: '320px' }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                                  <Pie data={tablaInsights.sunburstCausas} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} fill="#1e40af">
                                    {tablaInsights.sunburstCausas.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Pie data={tablaInsights.sunburstMotivos} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={85} outerRadius={120} fill="#DF6D05" label={({ name, percent }) => percent > 0.05 ? name.substring(0, 15) + (name.length > 15 ? '...' : '') : ''}>
                                    {tablaInsights.sunburstMotivos.map((entry, index) => {
                                       const pIndex = tablaInsights.sunburstCausas.findIndex(c => c.name === entry.parent);
                                       return <Cell key={`cell-${index}`} fill={COLORS[pIndex % COLORS.length]} opacity={0.7} />;
                                    })}
                                  </Pie>
                                </RechartsPieChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Suspensiones por Especialidad Quirúrgica</h3>
                            <p style={{ margin: '0 0 24px 0', fontSize: '0.8rem', color: '#64748b' }}>Porcentaje relativo de cada especialidad sobre el total de suspensiones</p>
                            <div style={{ height: '320px' }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart layout="vertical" data={tablaInsights.topEspProb} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                                  <XAxis type="number" hide domain={[0, 'dataMax']} />
                                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                  <RechartsTooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                    formatter={(value, name) => {
                                      if (name === 'prob') return [`${value}%`, '% Total Susp.'];
                                      return [value, name];
                                    }}
                                  />
                                  <Bar dataKey="prob" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={24}>
                                    <LabelList dataKey="prob" position="right" formatter={(val) => `${val}%`} style={{ fill: '#ef4444', fontSize: '11px', fontWeight: 600 }} />
                                  </Bar>
                                </ComposedChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>

                        {/* MATRIZ COLAPSABLE DE GRANDES CAUSAS Y CAUSAS ESPECÍFICAS DE SUSPENSIÓN */}
                        <TablaCausasSuspensionColapsable data={filteredTabla} />

                        {/* MATRIZ COLAPSABLE DE ESPECIALIDADES E INTERVENCIONES PROPUESTAS (IQ) */}
                        <TablaEspecialidadesSuspensionColapsable data={filteredTabla} />
                      </motion.div>
                    )}

                    {/* SUB-TAB 2: CIRUJANOS, ANESTESIÓLOGOS & CAUSAS */}
                    {tablaSubTab === 'profesionales' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                        <AnalisisCirujanosYCausas data={filteredTabla} />
                      </motion.div>
                    )}

                    {/* SUB-TAB 3: TABLA JERÁRQUICA (4 NIVELES) */}
                    {tablaSubTab === 'tabla_jerarquica' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                        <div style={{ marginBottom: '32px' }}>
                          {/* BANNER DE FÓRMULA DE CÁLCULO Y ACLARACIÓN METODOLÓGICA */}
                          <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #bfdbfe', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', boxShadow: '0 4px 15px rgba(30, 64, 175, 0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                              <div style={{ background: '#1e40af', color: 'white', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Activity size={22} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 800, color: '#1e3a8a' }}>Fórmula de Cálculo y Criterio Metodológico</h4>
                                <div style={{ background: 'white', border: '1px solid #93c5fd', borderRadius: '10px', padding: '10px 16px', margin: '8px 0 12px 0', display: 'inline-block', fontWeight: 800, color: '#1e40af', fontSize: '0.9rem' }}>
                                  Tasa de Suspensión (%) = ( Pacientes Suspendidos / Pacientes Programados Totales ) × 100
                                </div>
                                <p style={{ margin: 0, fontSize: '0.82rem', color: '#1e3a8a', lineHeight: '1.55' }}>
                                  <strong>Aclaración Metodológica REM vs. Informe Integral:</strong> Para los indicadores estandarizados oficiales del <strong>Registro Estadístico Mensual (REM - MINSAL)</strong>, la reglamentación exige <strong>excluir</strong> a los pacientes registrados en condición <em>"Condicional"</em>. No obstante, en este reporte institucional se incluyen de manera predeterminada para visibilizar y analizar la totalidad del fenómeno de suspensiones en la tabla quirúrgica. El usuario puede aplicar dicha exclusión en cualquier momento utilizando el <strong>menú flotante de filtros</strong>.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* MATRIZ DINÁMICA DE GRANDES CAUSAS Y CAUSAS ESPECÍFICAS DE SUSPENSIÓN */}
                          <TablaCausasSuspensionColapsable data={filteredTabla} />

                          {/* MATRIZ COLAPSABLE DE ESPECIALIDADES E INTERVENCIONES PROPUESTAS (IQ) */}
                          <TablaEspecialidadesSuspensionColapsable data={filteredTabla} />

                          {/* TABLA DINÁMICA JERÁRQUICA COLAPSABLE (POR ESPECIALIDAD Y MÉDICO) */}
                          <TablaDinamicaSuspensiones data={filteredTabla} />

                          {/* PANEL DE ANÁLISIS DE HALLAZGOS ESTADÍSTICOS DEL PACIENTE SUSPENDIDO */}
                          <AnalisisHallazgosSuspensiones data={filteredTabla} />
                        </div>
                      </motion.div>
                    )}

                    {/* SUB-TAB 4: MATRIZ PIVOT QUIRÚRGICA */}
                    {tablaSubTab === 'pivot' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                        <div style={{ marginBottom: '24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <Users size={22} color="#1e40af" />
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Despliegue Detallado de Producción (Tabla Dinámica)</h3>
                          </div>
                          <PivotTable data={filteredTabla} totalCirugias={tablaProgKPI.val} />
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* TAB 3: INDICADORES DE GESTIÓN (RETRASO EN PRIMERA HORA Y DISPONIBILIDAD) */}
                {activeTab === 'disponibilidad' && (
                  <div>
                    {/* ENCABEZADO Y CONTEXTO NORMATIVO */}
                    <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)', borderRadius: '24px', padding: '28px 32px', color: 'white', marginBottom: '32px', boxShadow: '0 15px 35px -10px rgba(30, 64, 175, 0.4)', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '220px', height: '220px', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', backdropFilter: 'blur(4px)' }}>
                          Estándar Quirúrgico Institucional
                        </span>
                        <span style={{ background: '#10b981', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>
                          Tolerancia: ≤ 15 Minutos
                        </span>
                      </div>
                      <h2 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>
                        Indicador: Retraso en Primera Hora de Pabellón
                      </h2>
                      <p style={{ margin: '0 0 16px 0', fontSize: '0.95rem', opacity: 0.92, maxWidth: '900px', lineHeight: 1.5 }}>
                        Monitoreo del tiempo transcurrido desde la habilitación oficial de cada quirófano (<code style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px', color: '#fed7aa' }}>horario_inicio</code>) hasta el ingreso del primer paciente intervenido (<code style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px', color: '#fed7aa' }}>hora_ingreso_cirugia</code>). Se evalúa el cumplimiento del estándar de inicio puntual (máximo 15 min de demora) y se computan los minutos totales de retraso operacional acumulados.
                      </p>

                      {/* BADGES DE FILTROS ACTIVOS */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', background: 'rgba(0,0,0,0.18)', padding: '10px 16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fed7aa', textTransform: 'uppercase' }}>Filtros en curso:</span>
                        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700 }}>
                          📅 Periodo: {dateRangeIndicadores.start} al {dateRangeIndicadores.end}
                        </span>
                        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700 }}>
                          🏥 Pabellones: {indicadorPabellon.length === 0 ? 'Todos' : indicadorPabellon.map(p => `Pab ${p}`).join(', ')}
                        </span>
                        <span style={{ background: indicadorTipoDia === 'habiles' ? 'rgba(16, 185, 129, 0.25)' : indicadorTipoDia === 'no_habiles' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(59, 130, 246, 0.25)', border: '1px solid rgba(255,255,255,0.3)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
                          🗓️ {indicadorTipoDia === 'habiles' ? 'Días Hábiles (Lun a Vie)' : indicadorTipoDia === 'no_habiles' ? 'Días No Hábiles (Fines de Semana)' : 'Todos los Días'}
                        </span>
                        <span style={{ background: 'rgba(239, 68, 68, 0.25)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fee2e2', padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700 }}>
                          ✕ Pabellones 6 (Urgencia) y 7 (Cirugía Menor) excluidos por defecto
                        </span>
                      </div>
                    </div>

                    {/* KPI SUMMARY CARDS */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                      {/* Minutos Totales Retraso */}
                      <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', borderLeft: '6px solid #ef4444', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Retraso Acumulado</p>
                          <span style={{ background: '#fef2f2', color: '#ef4444', padding: '4px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800 }}>Fórmula Oficial</span>
                        </div>
                        <h2 style={{ margin: '10px 0 4px 0', fontSize: '2.4rem', color: '#0f172a', fontWeight: 900 }}>
                          {indicadoresGestionData.totalRetrasoMinutos.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 700, color: '#64748b' }}>min</span>
                        </h2>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#ef4444', fontWeight: 700 }}>
                          ≈ {indicadoresGestionData.totalHorasRetraso} horas operacionales perdidas
                        </p>
                      </div>

                      {/* Porcentaje Cumplimiento Norma */}
                      <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', borderLeft: '6px solid #10b981', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cumplimiento Norma (≤ 15 min)</p>
                          <span style={{ background: '#ecfdf5', color: '#10b981', padding: '4px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800 }}>Meta &gt; 80%</span>
                        </div>
                        <h2 style={{ margin: '10px 0 4px 0', fontSize: '2.4rem', color: parseFloat(indicadoresGestionData.pctCumplimientoNorma) >= 70 ? '#10b981' : '#f59e0b', fontWeight: 900 }}>
                          {indicadoresGestionData.pctCumplimientoNorma}
                        </h2>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                          <strong style={{ color: '#0f172a' }}>{indicadoresGestionData.cumplenNorma15m}</strong> de {indicadoresGestionData.pabellonesEvaluados} jornadas cumplieron la tolerancia
                        </p>
                      </div>

                      {/* Promedio Minutos Inicio Cirugía */}
                      <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', borderLeft: '6px solid #4f46e5', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tiempo Promedio de Inicio</p>
                          <Clock size={16} color="#4f46e5" />
                        </div>
                        <h2 style={{ margin: '10px 0 4px 0', fontSize: '2.4rem', color: '#0f172a', fontWeight: 900 }}>
                          {indicadoresGestionData.promedioTiempoInicioMin} <span style={{ fontSize: '1rem', fontWeight: 700, color: '#64748b' }}>min</span>
                        </h2>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                          Demora neta sobre norma: <strong style={{ color: '#f59e0b' }}>{indicadoresGestionData.promedioRetrasoMinutos} min / pab</strong>
                        </p>
                      </div>

                      {/* Pabellones / Jornadas Evaluadas */}
                      <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', borderLeft: '6px solid #6366f1', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Jornadas Quirúrgicas</p>
                          <Activity size={16} color="#6366f1" />
                        </div>
                        <h2 style={{ margin: '10px 0 4px 0', fontSize: '2.4rem', color: '#0f172a', fontWeight: 900 }}>
                          {indicadoresGestionData.pabellonesEvaluados.toLocaleString()}
                        </h2>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#ef4444', fontWeight: 600 }}>
                          <strong style={{ color: '#ef4444' }}>{indicadoresGestionData.noCumplenNorma15m}</strong> iniciaron con más de 15 min de retraso
                        </p>
                      </div>
                    </div>

                    {/* GRÁFICO DESTACADO: TIEMPO PROMEDIO DE INICIO DE CIRUGÍA (LÍNEAS MENSUALES) */}
                    <div style={{ background: 'white', padding: '26px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>
                              <Clock size={20} color="white" />
                            </div>
                            <div>
                              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
                                Tiempo Promedio de Inicio de Cirugía (Minutos) — Evolución Mensual
                              </h3>
                              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                                Tiempo medio transcurrido desde la habilitación del quirófano hasta el ingreso/inicio del primer paciente por mes en lo que va del año
                              </p>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <div style={{ background: '#f8fafc', padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'right' }}>
                            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Promedio Global</span>
                            <span style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 900 }}>{indicadoresGestionData.promedioTiempoInicioMin} min</span>
                          </div>
                          <div style={{ background: '#ecfdf5', padding: '8px 16px', borderRadius: '12px', border: '1.5px solid #a7f3d0', textAlign: 'right' }}>
                            <span style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Tolerancia Estándar</span>
                            <span style={{ fontSize: '1.2rem', color: '#059669', fontWeight: 900 }}>≤ 15 min</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ height: '340px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={indicadoresGestionData.monthlyTrend} margin={{ top: 24, right: 30, left: 10, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="mes" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} tickLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} unit=" min" domain={[0, 'auto']} tickLine={false} />
                            <RechartsTooltip
                              formatter={(val, name) => [
                                `${val} min`,
                                name
                              ]}
                              labelFormatter={(label) => `Mes: ${label}`}
                              contentStyle={{ borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', fontWeight: 600 }}
                            />
                            <Legend wrapperStyle={{ fontSize: '0.82rem', paddingTop: '12px' }} />
                            <ReferenceLine y={15} stroke="#10b981" strokeDasharray="4 4" strokeWidth={2}>
                              <Label value="Tolerancia Estándar (15 min)" position="insideTopLeft" fill="#059669" fontSize={11} fontWeight={700} />
                            </ReferenceLine>
                            <Line
                              type="monotone"
                              dataKey="promTiempoInicioMin"
                              name="Tiempo Promedio de Inicio (minutos)"
                              stroke="#4f46e5"
                              strokeWidth={3.5}
                              activeDot={{ r: 8, stroke: '#4f46e5', strokeWidth: 2, fill: 'white' }}
                              dot={{ r: 5, fill: '#4f46e5', stroke: 'white', strokeWidth: 2 }}
                            >
                              <LabelList dataKey="promTiempoInicioMin" position="top" offset={10} fill="#4f46e5" fontSize={11} fontWeight={700} formatter={(v) => `${v}m`} />
                            </Line>
                            <Line
                              type="monotone"
                              dataKey="promRetrasoMin"
                              name="Demora Neta Excedente (>15 min)"
                              stroke="#f59e0b"
                              strokeWidth={2}
                              strokeDasharray="4 4"
                              dot={{ r: 4, fill: '#f59e0b' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* GRÁFICOS DINÁMICOS: TENDENCIA TEMPORAL Y COMPARATIVO PABELLONES */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                      {/* Gráfico 1: Tendencia Mensual de Cumplimiento y Retraso */}
                      <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>Evolución Mensual del Retraso de 1ª Hora</h3>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>% de cumplimiento de norma (≤15 min) vs Minutos promedio de demora</p>
                          </div>
                        </div>
                        <div style={{ height: '320px', width: '100%' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={indicadoresGestionData.monthlyTrend}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="mes" tick={{ fill: '#64748b', fontSize: 11 }} />
                              <YAxis yAxisId="left" orientation="left" tick={{ fill: '#10b981', fontSize: 11 }} domain={[0, 100]} unit="%" />
                              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#f59e0b', fontSize: 11 }} unit="m" />
                              <RechartsTooltip
                                formatter={(val, name) => [
                                  name === '% Cumplimiento (≤15 min)' ? `${val}%` : `${val} min`,
                                  name
                                ]}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                              />
                              <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
                              <Bar yAxisId="right" dataKey="promRetrasoMin" name="Demora Promedio (min)" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={26} />
                              <Line yAxisId="left" type="monotone" dataKey="pctCumplimiento" name="% Cumplimiento (≤15 min)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Gráfico 2: Desempeño por Pabellón */}
                      <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>Cumplimiento y Retraso por Quirófano</h3>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Comparativa de eficiencia de apertura por pabellón</p>
                          </div>
                        </div>
                        <div style={{ height: '320px', width: '100%' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={indicadoresGestionData.pabellonStats}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="pabellon" tick={{ fill: '#64748b', fontSize: 11 }} />
                              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} unit="%" domain={[0, 100]} />
                              <RechartsTooltip
                                formatter={(val, name, item) => [
                                  name === '% Cumplimiento' ? `${val}%` : `${val} min`,
                                  `${name} (${item.payload.totalCasos} cirugías evaluadas)`
                                ]}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                              />
                              <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
                              <Bar dataKey="pctCumplimiento" name="% Cumplimiento" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={34}>
                                {indicadoresGestionData.pabellonStats.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.pctCumplimiento >= 50 ? '#10b981' : '#f59e0b'} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* INSUMOS Y COSTEO TAB */}
      {activeTab === 'insumos' && (
        <InsumosCosteoDashboard
          rawDataLibro={rawDataLibro}
          insumosData={insumosData}
          insumosLoading={insumosLoading}
          insumosLastUpdated={insumosLastUpdated}
          insumosError={insumosError}
          insumosEspecialidad={insumosEspecialidad}
          setInsumosEspecialidad={setInsumosEspecialidad}
          insumosSearch={insumosSearch}
          setInsumosSearch={setInsumosSearch}
          insumosDrillOpen={insumosDrillOpen}
          setInsumosDrillOpen={setInsumosDrillOpen}
        />
      )}

      {/* MODAL AUDITORÍA CRÍTICA DE CIERRES DISCOVERER */}
      <AnimatePresence>
        {showAuditoriaModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                background: 'white',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '1200px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden',
                border: '1px solid #e2e8f0'
              }}
            >
              {/* Header Modal */}
              <div style={{
                padding: '20px 28px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
                    <AlertCircle size={22} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#991b1b', fontWeight: 800 }}>
                      Auditoría de Cierres Quirúrgicos — Tabla vs Discoverer
                    </h2>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#7f1d1d' }}>
                      {auditoriaCasos.length} cirugías figuran como <strong>Intervenidas</strong> en Tabla de Pabellón pero <strong>no registran cierre o protocolo en Discoverer DWH</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAuditoriaModal(false)}
                  style={{
                    background: 'white',
                    border: '1px solid #fecaca',
                    borderRadius: '12px',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#991b1b',
                    fontWeight: 800,
                    fontSize: '1rem'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Banner de Impacto en Facturación */}
              <div style={{ padding: '14px 28px', background: '#fffbeb', borderBottom: '1px solid #fef3c7', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                <span style={{ fontSize: '0.8rem', color: '#92400e', lineHeight: 1.4 }}>
                  <strong>Impacto en Gestión y Facturación:</strong> Estos pacientes fueron intervenidos en los quirófanos pero su evento no ha completado el ciclo administrativo en la base central institucional (LE abierta, RUT incompleto o protocolo pendiente). Es urgente su revisión por Control de Gestión, SOME y Pabellón para regularizar su valorización.
                </span>
              </div>

              {/* Tabla de Casos */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '10px 12px' }}>#</th>
                      <th style={{ padding: '10px 12px' }}>Fecha</th>
                      <th style={{ padding: '10px 12px' }}>Pabellón</th>
                      <th style={{ padding: '10px 12px' }}>RUT Paciente</th>
                      <th style={{ padding: '10px 12px' }}>Nombre Paciente</th>
                      <th style={{ padding: '10px 12px' }}>ID Lista Espera</th>
                      <th style={{ padding: '10px 12px' }}>Procedencia</th>
                      <th style={{ padding: '10px 12px' }}>Especialidad</th>
                      <th style={{ padding: '10px 12px' }}>Cirujano</th>
                      <th style={{ padding: '10px 12px' }}>Intervención Propuesta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditoriaCasos.map((c, i) => (
                      <tr key={c.id || i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                        <td style={{ padding: '10px 12px', color: '#94a3b8', fontWeight: 700 }}>{i + 1}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>{c.fecha}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            background: c.pabellon === '6' ? '#fee2e2' : '#eff6ff',
                            color: c.pabellon === '6' ? '#991b1b' : '#1e40af',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontWeight: 800,
                            fontSize: '0.72rem'
                          }}>
                            Pab {c.pabellon}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 700, color: c.rut.includes('-') && !c.rut.includes('--') ? '#1e293b' : '#dc2626' }}>
                          {c.rut}
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>{c.paciente}</td>
                        <td style={{ padding: '10px 12px' }}>
                          {c.id_lista_espera !== '0' ? (
                            <span style={{ background: '#ecfdf5', color: '#065f46', padding: '3px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '0.72rem' }}>
                              LE: {c.id_lista_espera}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.72rem' }}>Sin LE (0)</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            background: c.procedencia === 'Urgencia' ? '#fee2e2' : '#f1f5f9',
                            color: c.procedencia === 'Urgencia' ? '#b91c1c' : '#475569',
                            padding: '2px 6px',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontWeight: 700
                          }}>
                            {c.procedencia}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#475569' }}>{c.especialidad}</td>
                        <td style={{ padding: '10px 12px', color: '#0f172a', fontWeight: 600 }}>{c.cirujano}</td>
                        <td style={{ padding: '10px 12px', color: '#64748b', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.intervencion}>
                          {c.intervencion}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Modal */}
              <div style={{ padding: '16px 28px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Total casos detectados: <strong>{auditoriaCasos.length}</strong> (No sumados forzadamente en Libro Electrónico para resguardar la validez de la auditoría)
                </span>
                <button
                  onClick={() => setShowAuditoriaModal(false)}
                  style={{
                    background: '#0f172a',
                    color: 'white',
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Cerrar Auditoría
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
