import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Calendar, Search, Users, Activity, Clock, CheckCircle,
  XCircle, AlertCircle, Filter, PieChart, BarChart2, ChevronRight, ChevronLeft, ChevronDown, TrendingUp
} from 'lucide-react';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, LabelList, Label, ReferenceLine
} from 'recharts';

const COLORS = ['#295A64', '#DF6D05', '#F2A400', '#94BCC1', '#EAE6E1', '#1f434a', '#a65103', '#b37800', '#6e8f93'];
const PIE_COLORS = {
  'Cirugía Mayor': '#295A64',
  'Cirugía Mayor Ambulatoria': '#DF6D05',
  'Cirugía Menor': '#F2A400',
  'Procedimientos': '#94BCC1'
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

  const filtered = options.filter(o => String(o).toLowerCase().includes(search.toLowerCase()));
  const isAll = value.length === 0;
  const displayText = isAll ? "Todas" : (value.length === 1 ? value[0] : `${value.length} seleccionadas`);

  const toggleOption = (o) => {
    if (value.includes(o)) onChange(value.filter(v => v !== o));
    else onChange([...value, o]);
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
            {filtered.map(o => {
              const isSelected = value.includes(o);
              return (
                <div
                  key={o}
                  onClick={() => toggleOption(o)}
                  style={{ padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '6px', background: isSelected ? '#f1f5f9' : 'transparent', fontWeight: isSelected ? 700 : 400, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = isSelected ? '#f1f5f9' : 'transparent'}
                >
                  <input type="checkbox" checked={isSelected} readOnly style={{ cursor: 'pointer' }} />
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o}</span>
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
    return `rgba(41, 90, 100, ${intensity * 0.50})`; // Stronger gradient so low values look white
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
        <thead style={{ position: 'sticky', top: 0, zIndex: 20, background: '#295A64', color: 'white' }}>
          {/* Year Header Row */}
          <tr>
            <th rowSpan={2} style={{ padding: '12px', position: 'sticky', left: 0, zIndex: 30, background: '#295A64', borderRight: '1px solid rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>Familia / Intervención / Cirujano</th>
            {years.map(y => (
              <th key={y} colSpan={monthsByYear[y].length + 2} style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.2)', fontWeight: 800 }}>{y}</th>
            ))}
            <th rowSpan={2} style={{ padding: '12px', textAlign: 'right', background: '#1f434a', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>Total General</th>
            <th rowSpan={2} style={{ padding: '12px', textAlign: 'right', background: '#18363d', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>% del Total</th>
          </tr>
          {/* Month Header Row */}
          <tr>
            {years.map(y => (
              <React.Fragment key={y}>
                {monthsByYear[y].map(m => (
                  <th key={m} style={{ padding: '8px 12px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: '0.85rem', background: '#366d78', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>{formatMonth(m).split(' ')[0]}</th>
                ))}
                <th style={{ padding: '8px 12px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: '0.85rem', background: '#1f434a', borderRight: '1px solid rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>Total {y}</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: '0.85rem', background: '#18363d', borderRight: '1px solid rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>% {y}</th>
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
              if (!d || d.total === 0) return <React.Fragment key={m}><td style={{ background: '#5d826a', borderRight: '1px solid rgba(255,255,255,0.2)' }}></td><td style={{ background: '#5d826a', borderRight: '1px solid rgba(255,255,255,0.2)' }}></td></React.Fragment>;
              return (
                <React.Fragment key={m}>
                  <td style={{ background: '#5d826a', color: 'white', padding: '8px', textAlign: 'center', fontWeight: 700, borderRight: '1px solid rgba(255,255,255,0.2)' }}>{d.total}</td>
                  <td style={{ background: '#5d826a', color: 'white', padding: '8px', textAlign: 'center', fontWeight: 700, borderRight: '1px solid rgba(255,255,255,0.2)' }}>{(d.sumDur/d.total).toFixed(2)}</td>
                </React.Fragment>
              );
            })}
            {/* Year Total for TFoot */}
            {(() => {
              const yt = getYearlyTotal(tree, y);
              return (
                <React.Fragment key={`ft-yt-${y}`}>
                  <td style={{ background: '#366d78', color: 'white', padding: '8px', textAlign: 'center', fontWeight: 800, borderRight: '1px solid rgba(255,255,255,0.2)' }}>{yt.total}</td>
                  <td style={{ background: '#366d78', color: 'white', padding: '8px', textAlign: 'center', fontWeight: 800, borderRight: '1px solid rgba(255,255,255,0.2)' }}>{yt.total > 0 ? (yt.sumDur/yt.total).toFixed(2) : '-'}</td>
                </React.Fragment>
              );
            })()}
          </React.Fragment>
        ))}
        {/* Grand Total for TFoot */}
        <td style={{ background: '#1f434a', color: 'white', padding: '8px', textAlign: 'center', fontWeight: 900, borderRight: '1px solid rgba(255,255,255,0.2)' }}>{tree.total}</td>
        <td style={{ background: '#1f434a', color: 'white', padding: '8px', textAlign: 'center', fontWeight: 900, borderRight: '1px solid rgba(255,255,255,0.2)' }}>{(tree.sumDur/tree.total).toFixed(2)}</td>
      </React.Fragment>
    );
  };

  return (
    <div style={{ overflow: 'auto', maxHeight: '550px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', position: 'relative' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.75rem' }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 30 }}>
          <tr>
            <th style={{ position: 'sticky', left: 0, zIndex: 40, background: '#5d826a', color: 'white', padding: '8px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)', minWidth: '300px' }}>Year</th>
            {years.map(y => (
              <th key={y} colSpan={(monthsByYear[y].length * 2) + 2} style={{ background: '#5d826a', color: 'white', padding: '8px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)' }}>{y}</th>
            ))}
            <th colSpan="2" rowSpan="2" style={{ background: '#366d78', color: 'white', padding: '8px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Total General</th>
          </tr>
          <tr>
            <th style={{ position: 'sticky', left: 0, zIndex: 40, background: '#5d826a', color: 'white', padding: '8px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Month</th>
            {years.map(y => (
              <React.Fragment key={`m-hdr-${y}`}>
                {monthsByYear[y].map(m => (
                  <th key={m} colSpan="2" style={{ background: '#84a28f', color: 'white', padding: '8px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)' }}>{formatMonth(m)}</th>
                ))}
                <th colSpan="2" style={{ background: '#366d78', color: 'white', padding: '8px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Total {y}</th>
              </React.Fragment>
            ))}
          </tr>
          <tr>
            <th style={{ position: 'sticky', left: 0, zIndex: 40, background: '#5d826a', color: 'white', padding: '8px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)', boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }}>codigo_iq</th>
            {years.map(y => (
              <React.Fragment key={`col-hdr-${y}`}>
                {monthsByYear[y].map(m => (
                  <React.Fragment key={`hdr-${m}`}>
                    <th style={{ background: '#84a28f', color: 'white', padding: '8px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)', minWidth: '40px' }}>N°</th>
                    <th style={{ background: '#84a28f', color: 'white', padding: '8px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)', minWidth: '50px' }}>t Prom</th>
                  </React.Fragment>
                ))}
                <th style={{ background: '#366d78', color: 'white', padding: '8px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)', minWidth: '40px' }}>N°</th>
                <th style={{ background: '#366d78', color: 'white', padding: '8px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)', minWidth: '50px' }}>t Prom</th>
              </React.Fragment>
            ))}
            <th style={{ background: '#1f434a', color: 'white', padding: '8px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)', minWidth: '40px' }}>N°</th>
            <th style={{ background: '#1f434a', color: 'white', padding: '8px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)', minWidth: '50px' }}>t Prom</th>
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
            <td style={{ position: 'sticky', left: 0, zIndex: 40, background: '#5d826a', color: 'white', padding: '8px', fontWeight: 700, borderRight: '1px solid rgba(255,255,255,0.2)', boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }}>Total General</td>
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

export default function SurgicalDashboard({ onBack }) {
  const [activeTab, setActiveTab] = useState('libro'); // We start on 'libro' based on user request
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
  const [procedencia, setProcedencia] = useState([]);
  const [tipoGestor, setTipoGestor] = useState([]);
  const [formaPago, setFormaPago] = useState([]);
  const [nombreIq, setNombreIq] = useState([]);
  const [primerCirujano, setPrimerCirujano] = useState([]);
  const [segundoCirujano, setSegundoCirujano] = useState([]);
  const [reintervencion, setReintervencion] = useState([]);
  const [pieMode, setPieMode] = useState('cirugia');

  // Sidebar Filters for Tabla
  const [tablaFechaProg, setTablaFechaProg] = useState([]);
  const [tablaTipoCirugia, setTablaTipoCirugia] = useState([]);
  const [tablaPriorizacion, setTablaPriorizacion] = useState([]);
  const [tablaPabellonCrr, setTablaPabellonCrr] = useState([]);
  const [tablaIntervencion, setTablaIntervencion] = useState([]);
  const [tablaCirujano, setTablaCirujano] = useState([]);
  const [tablaPabellon, setTablaPabellon] = useState([]);
  const [tablaModalidad, setTablaModalidad] = useState([]);

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
          const res = await fetch(basePath);
          if (!res.ok) throw new Error(`No se pudo cargar ${basePath}`);
          return await res.json();
        };

        const [tablaJson, dispJson, libroJson, grdJson] = await Promise.all([
          fetchJsonWithGz('/data/pabellon_tabla_cached.json'),
          fetchJsonWithGz('/data/pabellon_disponibilidad_cached.json'),
          fetchJsonWithGz('/data/libro_pabellon_cached.json').catch(() => ({ records: [] })),
          fetch('/data/valorizacion_grd.json').catch(() => ({ json: () => ([]) })).then(r => r.json ? r.json() : r)
        ]);

        const normalizeDate = (dStr) => {
          if (!dStr) return null;
          if (/^\d{4}-\d{2}-\d{2}/.test(dStr)) return dStr.substring(0, 10);
          const d = new Date(dStr);
          if (isNaN(d.getTime())) return null;
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        };

        const normalizedLibro = (libroJson.records || []).map(r => ({
          ...r,
          fecha_cirugia: normalizeDate(r.fecha_cirugia)
        }));

        setTablaData(tablaJson.records || []);
        setDisponibilidadData(dispJson.records || []);
        setRawDataLibro(normalizedLibro);
        setLibroData(normalizedLibro);
        setGrdData(grdJson || []);
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
      cirus2: Array.from(ciru2).sort().filter(Boolean),
      reints: Array.from(reints).sort().filter(Boolean)
    };
  }, [rawDataLibro]);

  const tablaDropdowns = useMemo(() => {
    const fechas = new Set();
    const tipos = new Set();
    const prios = new Set();
    const crrs = new Set();
    const ints = new Set();
    const cirus = new Set();
    const pabs = new Set();
    const mods = new Set();

    tablaData.forEach(r => {
      if (r.fecha_programacion) fechas.add(r.fecha_programacion.split('-')[0]);
      if (r.tipo_cirugia) tipos.add(r.tipo_cirugia);
      if (r.priorizacion) prios.add(r.priorizacion);
      if (r.pabellon_crr) crrs.add(r.pabellon_crr);
      if (r.intervencion_propuesta) ints.add(r.intervencion_propuesta);
      if (r.cirujano) cirus.add(r.cirujano);
      if (r.pabellon) pabs.add(String(r.pabellon));
      if (r.modalidad) mods.add(r.modalidad);
    });

    return {
      fechas: Array.from(fechas).sort().filter(Boolean),
      tipos: Array.from(tipos).sort().filter(Boolean),
      prios: Array.from(prios).sort().filter(Boolean),
      crrs: Array.from(crrs).sort().filter(Boolean),
      ints: Array.from(ints).sort().filter(Boolean),
      cirus: Array.from(cirus).sort().filter(Boolean),
      pabs: Array.from(pabs).sort((a, b) => a.localeCompare(b)).filter(Boolean),
      mods: Array.from(mods).sort().filter(Boolean),
    };
  }, [tablaData]);

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
      if (tablaPriorizacion.length > 0 && !tablaPriorizacion.includes(r.priorizacion)) return false;
      if (tablaPabellonCrr.length > 0 && !tablaPabellonCrr.includes(r.pabellon_crr)) return false;
      if (tablaIntervencion.length > 0 && !tablaIntervencion.includes(r.intervencion_propuesta)) return false;
      if (tablaCirujano.length > 0 && !tablaCirujano.includes(r.cirujano)) return false;
      if (tablaPabellon.length > 0 && !tablaPabellon.includes(String(r.pabellon))) return false;
      if (tablaModalidad.length > 0 && !tablaModalidad.includes(r.modalidad)) return false;

      return true;
    });
  }, [tablaData, dateRange, tablaFechaProg, tablaTipoCirugia, tablaPriorizacion, tablaPabellonCrr, tablaIntervencion, tablaCirujano, tablaPabellon, tablaModalidad]);

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
      if (tablaPriorizacion.length > 0 && !tablaPriorizacion.includes(r.priorizacion)) return;
      if (tablaPabellonCrr.length > 0 && !tablaPabellonCrr.includes(r.pabellon_crr)) return;
      if (tablaIntervencion.length > 0 && !tablaIntervencion.includes(r.intervencion_propuesta)) return;
      if (tablaCirujano.length > 0 && !tablaCirujano.includes(r.cirujano)) return;
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
      if (procedencia.length > 0 && !procedencia.includes(r.procedencia)) return false;
      if (tipoGestor.length > 0 && !tipoGestor.includes(r.tipo_gestor)) return false;
      if (formaPago.length > 0 && !formaPago.includes(r.forma_pago)) return false;
      if (nombreIq.length > 0 && !nombreIq.includes(r.intervencion)) return false;
      if (primerCirujano.length > 0 && !primerCirujano.includes(r.cirujano)) return false;
      if (segundoCirujano.length > 0 && !segundoCirujano.includes(r.segundo_cirujano)) return false;
      if (reintervencion.length > 0 && !reintervencion.includes(r.reintervencion_no_prog)) return false;

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

      if (tipoCirugia.length > 0 && !tipoCirugia.includes(r.tipo_cirugia)) return;
      if (procedencia.length > 0 && !procedencia.includes(r.procedencia)) return;
      if (tipoGestor.length > 0 && !tipoGestor.includes(r.tipo_gestor)) return;
      if (formaPago.length > 0 && !formaPago.includes(r.forma_pago)) return;

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

  const procedenciaStats = useMemo(() => {
    let urg = 0, elec = 0, urgDiferida = 0;
    filteredLibro.forEach(r => {
      if (r.urgencia === 'SI') urg++;
      else elec++;

      const t = String(r.tipo_iq || '').toUpperCase();
      if (t.includes('DIFERIDA')) urgDiferida++;
    });
    // Adjust Urgencia and Electiva from tipo_iq if we want exact counts:
    let tUrg = 0, tUrgDif = 0, tElec = 0;
    filteredLibro.forEach(r => {
      const t = String(r.tipo_iq || '').toUpperCase();
      if (t.includes('DIFERIDA')) tUrgDif++;
      else if (t.includes('URGENCIA')) tUrg++;
      else tElec++; // Treat rest as electiva
    });

    return { urgencia: urg, electiva: elec, tUrg, tUrgDif, tElec };
  }, [filteredLibro]);

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

    const sortedData = Object.values(monthlyMap).sort((a, b) => a.key.localeCompare(b.key));

    // Calculate projection (Moving Average)
    sortedData.forEach((d, i) => {
      if (i === 0) d.proyeccion = d.total;
      else if (i === 1) d.proyeccion = Math.round((sortedData[0].total + d.total) / 2);
      else d.proyeccion = Math.round((sortedData[i - 2].total + sortedData[i - 1].total + d.total) / 3);
    });

    return sortedData;
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

    filteredLibro.forEach(r => {
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
  }, [distribucionCirugia, filteredLibro]);

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
        <tspan x={cx} dy="20" fontSize="0.85rem" fontWeight="500" fill="#64748b">Cirugías</tspan>
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F4F4F4' }}>
      {/* HEADER */}
      <header style={{ padding: '24px 32px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '16px', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Volver al Portal General
          </button>
          <h1 style={{ fontSize: '2.2rem', color: '#1e293b', margin: 0, fontWeight: 800 }}>Panel de Producción Quirúrgica</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', margin: '8px 0 0 0' }}>Estadísticas de Producción General y Libro Electrónico</p>
        </div>

        {/* TABS (Dark Longitudinal Menu) */}
        <div style={{ display: 'flex', gap: '12px', background: '#2d334a', padding: '12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 10 }}>
          {[
            { id: 'libro', label: 'Estadística (Libro)', icon: <BarChart2 size={18} /> },
            { id: 'tabla', label: 'Tabla de Programación', icon: <Calendar size={18} /> },
            { id: 'disponibilidad', label: 'Disponibilidad (Infra)', icon: <Clock size={18} /> }
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

      {/* MAIN CONTENT AREA WITH SIDEBAR */}
      {(activeTab === 'libro' || activeTab === 'tabla') && (
        <div style={{ display: 'flex', flex: 1, alignItems: 'flex-start' }}>
          {/* SIDEBAR */}
          <motion.div
            animate={{ width: sidebarCollapsed ? '70px' : '300px' }}
            style={{
              background: 'white',
              borderRight: '1px solid #e2e8f0',
              height: '100vh',
              overflowY: sidebarCollapsed ? 'hidden' : 'auto',
              overflowX: 'hidden',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '2px 0 10px rgba(0,0,0,0.02)',
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}
          >
            {/* Toggle Sidebar Button inside sidebar */}
            <div style={{ display: 'flex', justifyContent: sidebarCollapsed ? 'center' : 'flex-end', padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: '#f1f5f9', border: '1px solid #e2e8f0',
                  color: '#64748b', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
            </div>

            <div style={{ padding: sidebarCollapsed ? '24px 0' : '24px', display: 'flex', flexDirection: 'column', alignItems: sidebarCollapsed ? 'center' : 'stretch' }}>
              <div style={{ display: 'flex', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', alignItems: 'center', marginBottom: '24px' }}>
                <Filter size={sidebarCollapsed ? 24 : 18} color="#0f172a" />
                {!sidebarCollapsed && <h3 style={{ margin: '0 0 0 8px', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Filtros</h3>}
              </div>

              {/* Filters List */}
              {!sidebarCollapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                  {/* Date Range applies to both Libro and Tabla */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px', color: '#64748b', textTransform: 'uppercase' }}>Periodo de Monitoreo</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="date" defaultValue={dateRange.start} onBlur={e => setDateRange(p => ({ ...p, start: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', fontSize: '0.85rem', outline: 'none' }} />
                      <input type="date" defaultValue={dateRange.end} onBlur={e => setDateRange(p => ({ ...p, end: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', fontSize: '0.85rem', outline: 'none' }} />
                    </div>
                  </div>

                  {activeTab === 'libro' && (
                    <>

                      {[
                        { label: 'Tipo de Cirugía', val: tipoCirugia, set: setTipoCirugia, options: dropdowns.tipos },
                        { label: 'Procedencia', val: procedencia, set: setProcedencia, options: dropdowns.procedencias },
                        { label: 'Tipo de Gestor', val: tipoGestor, set: setTipoGestor, options: dropdowns.gestores },
                        { label: 'Forma de Pago', val: formaPago, set: setFormaPago, options: dropdowns.pagos },
                        { label: 'Nombre IQ', val: nombreIq, set: setNombreIq, options: dropdowns.iqs },
                        { label: 'Primer Cirujano', val: primerCirujano, set: setPrimerCirujano, options: dropdowns.ciru1 },
                        { label: 'Segundo Cirujano', val: segundoCirujano, set: setSegundoCirujano, options: dropdowns.ciru2 },
                        { label: 'Reintervención', val: reintervencion, set: setReintervencion, options: dropdowns.reints }
                      ].map((f, i) => (
                        <div key={i}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px', color: '#64748b', textTransform: 'uppercase' }}>{f.label}</label>
                          <MultiSearchableSelect value={f.val} options={f.options} onChange={f.set} />
                        </div>
                      ))}
                    </>
                  )}

                  {activeTab === 'tabla' && (
                    <>
                      {[
                        { label: 'Fecha de programación', val: tablaFechaProg, set: setTablaFechaProg, options: tablaDropdowns.fechas },
                        { label: 'Tipo de cirugía', val: tablaTipoCirugia, set: setTablaTipoCirugia, options: tablaDropdowns.tipos },
                        { label: 'Tipo de priorización', val: tablaPriorizacion, set: setTablaPriorizacion, options: tablaDropdowns.prios },
                        { label: 'Pabellón CRR', val: tablaPabellonCrr, set: setTablaPabellonCrr, options: tablaDropdowns.crrs },
                        { label: 'Intervención Propuesta', val: tablaIntervencion, set: setTablaIntervencion, options: tablaDropdowns.ints },
                        { label: 'Primer Cirujano', val: tablaCirujano, set: setTablaCirujano, options: tablaDropdowns.cirus },
                        { label: 'Pabellón', val: tablaPabellon, set: setTablaPabellon, options: tablaDropdowns.pabs },
                        { label: 'Modalidad de atención', val: tablaModalidad, set: setTablaModalidad, options: tablaDropdowns.mods }
                      ].map((f, i) => (
                        <div key={i}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px', color: '#64748b', textTransform: 'uppercase' }}>{f.label}</label>
                          <MultiSearchableSelect value={f.val} options={f.options} onChange={f.set} />
                        </div>
                      ))}
                    </>
                  )}

                </motion.div>
              )}
            </div>
          </motion.div>

          {/* RIGHT DASHBOARD CONTENT */}
          <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <p>Cargando datos...</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                {activeTab === 'libro' && (
                  <>
                    {/* KPI ROW */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                      <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid rgba(41, 90, 100, 0.2)', borderLeft: '6px solid #295A64', boxShadow: '0 10px 30px rgba(41, 90, 100, 0.05)' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Producción Total</p>
                        <h2 style={{ margin: '8px 0', fontSize: '2.8rem', color: '#295A64', fontWeight: 900 }}>{totalKPI.val.toLocaleString()}</h2>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Cirugías registradas</p>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', background: totalKPI.trend === 'positive' ? 'rgba(41, 90, 100, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: totalKPI.trend === 'positive' ? '#295A64' : '#ef4444', padding: '4px 10px', borderRadius: '12px', fontWeight: 800, marginTop: '12px' }}>
                          <Activity size={14} /> {totalKPI.text}
                        </div>
                      </div>

                      <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid rgba(223, 109, 5, 0.2)', borderLeft: '6px solid #DF6D05', boxShadow: '0 10px 30px rgba(223, 109, 5, 0.05)' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cirugías Mayores Totales</p>
                        <h2 style={{ margin: '8px 0', fontSize: '2.8rem', color: '#DF6D05', fontWeight: 900 }}>{mayorKPI.val.toLocaleString()}</h2>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Alta complejidad</p>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', background: mayorKPI.trend === 'positive' ? 'rgba(223, 109, 5, 0.1)' : 'rgba(148, 163, 184, 0.1)', color: mayorKPI.trend === 'positive' ? '#DF6D05' : '#64748b', padding: '4px 10px', borderRadius: '12px', fontWeight: 800, marginTop: '12px' }}>
                          <TrendingUp size={14} /> {mayorKPI.text}
                        </div>
                      </div>

                      <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid rgba(242, 164, 0, 0.3)', borderLeft: '6px solid #F2A400', boxShadow: '0 10px 30px rgba(242, 164, 0, 0.05)' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Procedencia Urgencia vs Electiva</p>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', margin: '8px 0' }}>
                          <h2 style={{ margin: 0, fontSize: '2.8rem', color: '#cc8a00', fontWeight: 900 }}>{procedenciaStats.urgencia.toLocaleString()}</h2>
                          <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 700, paddingBottom: '8px' }}>/ {procedenciaStats.electiva.toLocaleString()}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Urgencias vs Electivas (incl. diferidas)</p>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', background: urgenciaKPI.trend === 'positive' ? 'rgba(242, 164, 0, 0.15)' : 'rgba(148, 163, 184, 0.1)', color: urgenciaKPI.trend === 'positive' ? '#cc8a00' : '#64748b', padding: '4px 10px', borderRadius: '12px', fontWeight: 800, marginTop: '12px' }}>
                          <AlertCircle size={14} /> Urgencias {urgenciaKPI.text}
                        </div>
                      </div>
                    </div>

                    {/* MAIN SPLIT LAYOUT */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '24px', marginBottom: '24px' }}>

                      {/* LEFT: COMPOSED BAR CHART */}
                      <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', padding: '16px 24px', borderRadius: '12px', marginBottom: '24px' }}>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, textAlign: 'center' }}>Producción de cirugías y Proyección (Media Móvil)</h3>
                        </div>
                        <div style={{ flex: 1, minHeight: '450px' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={monthlyChartData} margin={{ top: 30, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                              <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                              <Legend wrapperStyle={{ paddingTop: '10px' }} />

                              <Bar yAxisId="left" dataKey="Cirugía Mayor" stackId="a" fill={PIE_COLORS['Cirugía Mayor']}>
                                <LabelList dataKey="Cirugía Mayor" position="inside" fill="#fff" fontSize={11} fontWeight={600} formatter={v => v > 0 ? v : ''} />
                              </Bar>
                              <Bar yAxisId="left" dataKey="Cirugía Mayor Ambulatoria" stackId="a" fill={PIE_COLORS['Cirugía Mayor Ambulatoria']}>
                                <LabelList dataKey="Cirugía Mayor Ambulatoria" position="inside" fill="#fff" fontSize={11} fontWeight={600} formatter={v => v > 0 ? v : ''} />
                              </Bar>
                              <Bar yAxisId="left" dataKey="Cirugía Menor" stackId="a" fill={PIE_COLORS['Cirugía Menor']}>
                                <LabelList dataKey="Cirugía Menor" position="inside" fill="#fff" fontSize={11} fontWeight={600} formatter={v => v > 0 ? v : ''} />
                              </Bar>
                              <Bar yAxisId="left" dataKey="Procedimientos" stackId="a" fill={PIE_COLORS['Procedimientos']}>
                                <LabelList dataKey="Procedimientos" position="inside" fill="#fff" fontSize={11} fontWeight={600} formatter={v => v > 0 ? v : ''} />
                                <LabelList dataKey="total" position="top" fill="#0f172a" fontSize={12} fontWeight={800} />
                              </Bar>

                              <Line yAxisId="right" type="monotone" dataKey="proyeccion" stroke="#e11d48" strokeWidth={3} dot={{ r: 4, fill: '#e11d48' }} activeDot={{ r: 6 }} name="Proyección Prod." />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* RIGHT: TIPO IQ + PIES */}
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

                        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                            <button onClick={() => setPieMode('cirugia')} style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 800, borderRadius: '8px', border: 'none', background: pieMode === 'cirugia' ? '#295A64' : '#f1f5f9', color: pieMode === 'cirugia' ? 'white' : '#64748b', cursor: 'pointer' }}>Por Cirugía</button>
                            <button onClick={() => setPieMode('familia')} style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 800, borderRadius: '8px', border: 'none', background: pieMode === 'familia' ? '#295A64' : '#f1f5f9', color: pieMode === 'familia' ? 'white' : '#64748b', cursor: 'pointer' }}>Por Familia</button>
                          </div>

                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '450px' }}>
                            <div style={{ flex: 1, minHeight: '220px' }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                  <Pie
                                    data={pieMode === 'cirugia' ? distribucionCirugia : distribucionFamilia}
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={105}
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
                                  <RechartsTooltip />
                                </RechartsPieChart>
                              </ResponsiveContainer>
                            </div>
                            {/* Legend Renderizado de forma nativa por fuera para evitar que Recharts desplace el centro geométrico */}
                            {renderCustomLegend({ payload: (pieMode === 'cirugia' ? distribucionCirugia : distribucionFamilia).map((entry, index) => ({ color: pieMode === 'cirugia' ? (PIE_COLORS[entry.name] || COLORS[index % COLORS.length]) : COLORS[index % COLORS.length], value: entry.name })) })}
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* FULL WIDTH INSIGHTS PANEL */}
                    <div style={{ background: 'linear-gradient(135deg, #295A64, #1f434a)', padding: '24px', borderRadius: '16px', color: 'white', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                        <TrendingUp size={18} color="#F2A400" />
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Insights Operativos y Procedencia</h3>
                      </div>

                      {/* ROW 1: Procedencia */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.08)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #fcd34d' }}>
                          <p style={{ margin: '0 0 4px 0', fontSize: '0.65rem', opacity: 0.9, textTransform: 'uppercase', fontWeight: 800, color: '#fcd34d' }}>Ingresos por Urgencia</p>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <h4 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900 }}>{procedenciaStats.tUrg}</h4>
                            <span style={{ fontSize: '0.75rem', color: urgenciaKPI.trend === 'positive' ? '#ef4444' : '#10b981' }}>{urgenciaKPI.text}</span>
                          </div>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', opacity: 0.7 }}>Casos priorizados e ingresados directo de UEH.</p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.08)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #fb923c' }}>
                          <p style={{ margin: '0 0 4px 0', fontSize: '0.65rem', opacity: 0.9, textTransform: 'uppercase', fontWeight: 800, color: '#fb923c' }}>Urgencia Diferida</p>
                          <h4 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900 }}>{procedenciaStats.tUrgDif}</h4>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', opacity: 0.7 }}>Pacientes compensados que esperan turno quirúrgico.</p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.08)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #94a3b8' }}>
                          <p style={{ margin: '0 0 4px 0', fontSize: '0.65rem', opacity: 0.9, textTransform: 'uppercase', fontWeight: 800, color: '#94a3b8' }}>Producción Electiva</p>
                          <h4 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900 }}>{procedenciaStats.tElec}</h4>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', opacity: 0.7 }}>Programación desde lista de espera regular.</p>
                        </div>
                      </div>

                      {/* ROW 2: Clinicos */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.08)', padding: '16px', borderRadius: '12px' }}>
                          <p style={{ margin: '0 0 4px 0', fontSize: '0.65rem', opacity: 0.9, textTransform: 'uppercase', color: '#F2A400', fontWeight: 800 }}>Índice de Ambulatorización</p>
                          <h4 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: '#F2A400' }}>{insights.indiceAmbulatorizacion}%</h4>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', opacity: 0.7 }}>Cálculo: CMA / (CMA + CM)</p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', opacity: 0.5, fontStyle: 'italic' }}>Estrategia Minsal de optimización de camas.</p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.08)', padding: '16px', borderRadius: '12px' }}>
                          <p style={{ margin: '0 0 4px 0', fontSize: '0.65rem', opacity: 0.9, textTransform: 'uppercase', color: '#6366f1', fontWeight: 800 }}>Top Familias Mayores</p>
                          <div style={{ marginTop: '4px' }}>
                            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700 }}>CMA: <span style={{ fontWeight: 400, opacity: 0.9 }}>{insights.topCMA[0]} ({insights.topCMA[1]})</span></p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', fontWeight: 700 }}>CM: <span style={{ fontWeight: 400, opacity: 0.9 }}>{insights.topCM[0]} ({insights.topCM[1]})</span></p>
                          </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.08)', padding: '16px', borderRadius: '12px' }}>
                          <p style={{ margin: '0 0 4px 0', fontSize: '0.65rem', opacity: 0.9, textTransform: 'uppercase', color: '#94BCC1', fontWeight: 800 }}>Cobertura GES & Espera</p>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <h4 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: '#94BCC1' }}>{insights.porcentajeGES}%</h4>
                            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Garantizadas</span>
                          </div>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', opacity: 0.7 }}>T. Espera Promedio: <strong>{insights.promedioEspera} días</strong></p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.08)', padding: '16px', borderRadius: '12px' }}>
                          <p style={{ margin: '0 0 4px 0', fontSize: '0.65rem', opacity: 0.9, textTransform: 'uppercase', color: '#EAE6E1', fontWeight: 800 }}>Capacidad Productiva</p>
                          <h4 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#EAE6E1' }}>{insights.porcentajeInst}% Inst.</h4>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', opacity: 0.7 }}>Oferta Complementaria: <strong>{(100 - insights.porcentajeInst).toFixed(1)}%</strong> ({insights.gestorComp} cx)</p>
                        </div>
                      </div>
                    </div>

                    {/* PIVOT TABLE ROW */}
                    <div style={{ marginTop: '32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Users size={22} color="#295A64" />
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Despliegue Detallado de Producción (Tabla Dinámica)</h3>
                      </div>
                      <PivotTable data={filteredLibro} totalCirugias={totalKPI.val} />
                    </div>

                  </>
                )}

                {(activeTab === 'tabla' || activeTab === 'informe-crr') && (
                  <div>
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

                    {/* BAR CHART */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', marginBottom: '24px' }}>
                      <h3 style={{ margin: '0 0 24px 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Producción Quirúrgica y Suspensiones</h3>
                      <div style={{ height: '400px' }}>
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
                            <Bar yAxisId="left" dataKey="Intervenidos" stackId="a" fill="#295A64" barSize={40} name="Intervenidos">
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
                      
                      {/* Sunburst Chart for Causas -> Motivos */}
                      <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Desglose de Suspensiones</h3>
                        <p style={{ margin: '0 0 24px 0', fontSize: '0.8rem', color: '#64748b' }}>Anillo interno: Causas / Anillo externo: Motivos</p>
                        <div style={{ height: '350px' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                              <Pie data={tablaInsights.sunburstCausas} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#295A64">
                                {tablaInsights.sunburstCausas.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Pie data={tablaInsights.sunburstMotivos} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={90} outerRadius={130} fill="#DF6D05" label={({ name, percent }) => percent > 0.05 ? name.substring(0, 15) + (name.length > 15 ? '...' : '') : ''}>
                                {tablaInsights.sunburstMotivos.map((entry, index) => {
                                   const pIndex = tablaInsights.sunburstCausas.findIndex(c => c.name === entry.parent);
                                   return <Cell key={`cell-${index}`} fill={COLORS[pIndex % COLORS.length]} opacity={0.7} />;
                                })}
                              </Pie>
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Horizontal Bar Chart for Especialidades */}
                      <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Número de suspensiones según especialidad quirúrgica y porcentaje respecto de las suspensiones totales</h3>
                        <p style={{ margin: '0 0 24px 0', fontSize: '0.8rem', color: '#64748b' }}>Porcentaje relativo de cada especialidad sobre el total de suspensiones</p>
                        <div style={{ height: '350px' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart layout="vertical" data={tablaInsights.topEspProb} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                              <XAxis type="number" hide domain={[0, 'dataMax']} />
                              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                              <RechartsTooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                formatter={(value, name, props) => {
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
                    
                    <TopSuspensionesGRD data={filteredTabla} grdData={grdData} />

                    {/* PIVOT TABLE TABLA */}
                    <div style={{ marginTop: '32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Users size={22} color="#295A64" />
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Despliegue Detallado de Pacientes Intervenidos (Tabla Dinámica)</h3>
                      </div>
                      <PivotTableTabla data={filteredTabla} />
                    </div>
                  </div>
                )}

              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* OTHER TABS: Keep existing logic for DISPONIBILIDAD */}
      {activeTab === 'disponibilidad' && (
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
