import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, Filter, CheckCircle, AlertTriangle, XCircle, Info,
  BookOpen, FileText, ChevronRight, BarChart2, TrendingUp, Calendar,
  Award, Shield, ExternalLink, HelpCircle, Layers, Activity, FileSpreadsheet,
  Download, RefreshCw, Clock, Building2, AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ReferenceLine, ReferenceArea
} from 'recharts';
import { COMGES_META, COMGES_DOMAINS, COMGES_INDICATORS, REM_CALENDAR, REGIONAL_HOSPITALS } from '../data/comges2026Data';
import './ComgesDashboard.css';

// Mini Monthly Line Chart component rendered below formula in each card
const MiniMonthlyLineChart = ({ monthlyData = [], target = '', status = '' }) => {
  // Parse target numerical value if available (e.g. "≥ 70.0%" -> 70, "≤ 5.0%" -> 5, "> 10%" -> 10, "≥ 95%" -> 95)
  const targetNum = useMemo(() => {
    if (!target) return null;
    const match = target.match(/[\d\.]+/);
    return match ? parseFloat(match[0]) : null;
  }, [target]);

  // Determine if target direction is "less than" (<, ≤) or "greater than" (>, ≥)
  const isLessTarget = useMemo(() => {
    if (!target) return false;
    return target.includes('<') || target.includes('≤');
  }, [target]);

  // Format chart points
  const chartData = useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) return [];
    return monthlyData.map(d => ({
      month: d.month ? d.month.slice(0, 3) : '',
      fullMonth: d.month,
      val: d.result !== null && d.result !== undefined ? d.result : null,
      valFormatted: d.resultFormatted,
      num: d.numerator,
      den: d.denominator,
      status: d.status
    }));
  }, [monthlyData]);

  // Compute dynamic Y-Domain including both data values and target line so ReferenceLine and Success Zone are NEVER clipped!
  const yDomain = useMemo(() => {
    if (!chartData || chartData.length === 0) return ['auto', 'auto'];
    const validVals = chartData.map(d => d.val).filter(v => v !== null && v !== undefined && !isNaN(v));
    if (validVals.length === 0) return ['auto', 'auto'];

    let min = Math.min(...validVals);
    let max = Math.max(...validVals);

    if (targetNum !== null && !isNaN(targetNum)) {
      min = Math.min(min, targetNum);
      max = Math.max(max, targetNum);
    }

    const range = max - min;
    const padding = range === 0 ? 5 : Math.max(range * 0.2, 2);

    const domainMin = Math.max(0, Math.floor(min - padding));
    const domainMax = Math.ceil(max + padding);

    return [domainMin, domainMax];
  }, [chartData, targetNum]);

  const hasData = chartData.some(d => d.val !== null);

  if (status === 'Sin Medición') {
    return (
      <div style={{ marginTop: '10px', padding: '10px 12px', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#475569' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
          <AlertCircle size={14} color="#64748b" /> Sin Medición Acumulada:
        </span>
        <span style={{ fontStyle: 'italic', color: '#64748b' }}>Dudas metodológicas para su medición por aclarar por el SSAS</span>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div style={{ marginTop: '10px', padding: '10px 12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
          <TrendingUp size={14} color="#0d9488" /> Evolución Mensual:
        </span>
        <span style={{ fontStyle: 'italic', color: '#64748b' }}>Evaluación semestral por informe / pauta auditada</span>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '10px', background: '#ffffff', padding: '10px 12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11px', fontWeight: 700, color: '#334155' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <TrendingUp size={14} color="#0d9488" /> Evolución Mensual 2026
        </span>
        {targetNum !== null && (
          <span style={{ fontSize: '10px', color: '#ef4444', fontFamily: 'monospace', fontWeight: 800, background: '#fef2f2', padding: '2px 6px', borderRadius: '4px', border: '1px solid #fecaca' }}>
            Meta: {target}
          </span>
        )}
      </div>

      <div style={{ width: '100%', height: '115px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 14, right: 14, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} domain={yDomain} />
            
            {/* Subtle Mint Green Success Zone Shading */}
            {targetNum !== null && Array.isArray(yDomain) && typeof yDomain[0] === 'number' && (
              <ReferenceArea
                y1={isLessTarget ? yDomain[0] : targetNum}
                y2={isLessTarget ? targetNum : yDomain[1]}
                fill="#10b981"
                fillOpacity={0.08}
                stroke="none"
              />
            )}

            <RechartsTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  if (data.val === null) return null;
                  return (
                    <div style={{ background: '#0f172a', color: '#ffffff', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <p style={{ fontWeight: 800, color: '#5eead4' }}>{data.fullMonth} 2026</p>
                      <p style={{ fontWeight: 700, marginTop: '2px' }}>Resultado: {data.valFormatted}</p>
                      {data.num > 0 && <p style={{ fontSize: '10px', color: '#cbd5e1' }}>({data.num} / {data.den})</p>}
                    </div>
                  );
                }
                return null;
              }}
            />
            {targetNum !== null && (
              <ReferenceLine
                y={targetNum}
                stroke="#ef4444"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{ value: `Meta ${target}`, fill: '#ef4444', fontSize: 10, fontWeight: 800, position: 'insideTopRight' }}
              />
            )}
            <Line
              type="monotone"
              dataKey="val"
              stroke="#0d9488"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#0d9488', strokeWidth: 1.5, stroke: '#fff' }}
              activeDot={{ r: 6, fill: '#0f766e' }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default function ComgesDashboard({ onBack }) {
  const [activeTab, setActiveTab] = useState('indicators'); // 'indicators' | 'monitoreo' | 'orientaciones' | 'summary' | 'rem_calendar'
  // Filters for Evaluated Indicators tab
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  // Filters for Monitoreo tab
  const [monitoreoStatus, setMonitoreoStatus] = useState('all');
  const [monitoreoSearch, setMonitoreoSearch] = useState('');
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  const [modalSubTab, setModalSubTab] = useState('minsal'); // 'minsal' | 'excel'

  // All evaluated COMGES indicators (type !== 'monitoreo')
  const evaluatedIndicators = useMemo(() => COMGES_INDICATORS.filter(ind => ind.type !== 'monitoreo'), []);
  // All monitoring indicators
  const monitoreoIndicators = useMemo(() => COMGES_INDICATORS.filter(ind => ind.type === 'monitoreo'), []);

  // Summary Metrics (only evaluated indicators)
  const summaryMetrics = useMemo(() => {
    let cumple = 0;
    let riesgo = 0;
    let noCumple = 0;
    let sinMedicion = 0;
    let sinDato = 0;

    evaluatedIndicators.forEach(ind => {
      const status = ind.summaryYTD?.status;
      if (status === 'Cumple') cumple++;
      else if (status === 'En Riesgo') riesgo++;
      else if (status === 'No Cumple') noCumple++;
      else if (status === 'Sin Medición') sinMedicion++;
      else sinDato++;
    });

    return {
      total: evaluatedIndicators.length,
      cumple,
      riesgo,
      noCumple,
      sinMedicion,
      sinDato,
      cumplePerc: evaluatedIndicators.length > 0 ? ((cumple / evaluatedIndicators.length) * 100).toFixed(1) : '0.0'
    };
  }, [evaluatedIndicators]);

  // Summary Metrics for Monitoreo tab
  const monitoreoMetrics = useMemo(() => {
    let cumple = 0, riesgo = 0, noCumple = 0, sinMedicion = 0;
    monitoreoIndicators.forEach(ind => {
      const status = ind.summaryYTD?.status;
      if (status === 'Cumple') cumple++;
      else if (status === 'En Riesgo') riesgo++;
      else if (status === 'No Cumple') noCumple++;
      else if (status === 'Sin Medición') sinMedicion++;
    });
    return { total: monitoreoIndicators.length, cumple, riesgo, noCumple, sinMedicion };
  }, [monitoreoIndicators]);

  // Filtered Indicators List (Includes COMGES Evaluados and Monitoreo)
  const filteredIndicators = useMemo(() => {
    return COMGES_INDICATORS.filter(ind => {
      if (selectedDomain !== 'all' && ind.domainId !== selectedDomain) return false;
      if (selectedStatus !== 'all') {
        const st = ind.summaryYTD?.status;
        if (selectedStatus === 'cumple' && st !== 'Cumple') return false;
        if (selectedStatus === 'riesgo' && st !== 'En Riesgo') return false;
        if (selectedStatus === 'nocumple' && st !== 'No Cumple') return false;
        if (selectedStatus === 'sinmedicion' && st !== 'Sin Medición') return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const codeMatch = ind.code.toLowerCase().includes(q);
        const nameMatch = ind.name.toLowerCase().includes(q);
        const defMatch = (ind.definition || '').toLowerCase().includes(q);
        const objMatch = (ind.objective || '').toLowerCase().includes(q);
        const domainMatch = (ind.domainId || '').toLowerCase().includes(q);
        if (!codeMatch && !nameMatch && !defMatch && !objMatch && !domainMatch) return false;
      }
      return true;
    });
  }, [selectedDomain, selectedStatus, searchQuery]);

  // Filtered Monitoreo Indicators List
  const filteredMonitoreo = useMemo(() => {
    return monitoreoIndicators.filter(ind => {
      if (monitoreoStatus !== 'all') {
        const st = ind.summaryYTD?.status;
        if (monitoreoStatus === 'cumple' && st !== 'Cumple') return false;
        if (monitoreoStatus === 'riesgo' && st !== 'En Riesgo') return false;
        if (monitoreoStatus === 'nocumple' && st !== 'No Cumple') return false;
        if (monitoreoStatus === 'sinmedicion' && st !== 'Sin Medición') return false;
      }
      if (monitoreoSearch.trim() !== '') {
        const q = monitoreoSearch.toLowerCase();
        if (!ind.code.toLowerCase().includes(q) &&
            !ind.name.toLowerCase().includes(q) &&
            !(ind.definition || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [monitoreoIndicators, monitoreoStatus, monitoreoSearch]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Cumple':
        return (
          <span className="status-badge status-cumple">
            <CheckCircle size={14} /> Cumple
          </span>
        );
      case 'En Riesgo':
        return (
          <span className="status-badge status-riesgo">
            <AlertTriangle size={14} /> En Riesgo
          </span>
        );
      case 'No Cumple':
        return (
          <span className="status-badge status-nocumple">
            <XCircle size={14} /> No Cumple
          </span>
        );
      case 'Sin Medición':
        return (
          <span className="status-badge" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={14} color="#64748b" /> Sin Medición (Por definir SSAS)
          </span>
        );
      default:
        return (
          <span className="status-badge status-sindato">
            <Info size={14} /> Sin Dato / Pendiente
          </span>
        );
    }
  };

  return (
    <div className="comges-container">
      {/* Top Header Banner */}
      <header className="comges-header">
        <div className="comges-header-inner">
          <div className="comges-header-top">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              {onBack && (
                <button
                  onClick={onBack}
                  style={{
                    marginTop: '4px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 600
                  }}
                  title="Volver al menú principal"
                >
                  <ArrowLeft size={18} /> Volver
                </button>
              )}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="comges-badge comges-badge-hospital">
                    {COMGES_META.hospital}
                  </span>
                  <span className="comges-badge comges-badge-year">
                    Año {COMGES_META.year}
                  </span>
                </div>
                <h1 className="comges-title">
                  <Award size={32} color="#2dd4bf" />
                  Compromisos de Gestión (COMGES) 2026
                </h1>
                <p className="comges-subtitle">
                  Evaluación de los 11 indicadores oficiales aplicables al Hospital de Villarrica, fechas de puerto REM y orientaciones técnicas MINSAL.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="comges-nav-tabs-wrapper">
            <div className="comges-nav-tabs">
              <button
                onClick={() => setActiveTab('indicators')}
                className={`comges-tab-btn ${activeTab === 'indicators' ? 'comges-tab-btn-active' : 'comges-tab-btn-inactive'}`}
              >
                <Award size={16} />
                Indicadores Evaluados ({evaluatedIndicators.length})
              </button>
              <button
                onClick={() => setActiveTab('monitoreo')}
                className={`comges-tab-btn ${activeTab === 'monitoreo' ? 'comges-tab-btn-active' : 'comges-tab-btn-inactive'}`}
              >
                <Activity size={16} />
                Indicadores de Monitoreo ({monitoreoIndicators.length})
              </button>
              <button
                onClick={() => setActiveTab('orientaciones')}
                className={`comges-tab-btn ${activeTab === 'orientaciones' ? 'comges-tab-btn-active' : 'comges-tab-btn-inactive'}`}
              >
                <BookOpen size={16} />
                Orientaciones Técnicas MINSAL
              </button>
              <button
                onClick={() => setActiveTab('rem_calendar')}
                className={`comges-tab-btn ${activeTab === 'rem_calendar' ? 'comges-tab-btn-active' : 'comges-tab-btn-inactive'}`}
              >
                <Clock size={16} />
                Calendario Cargas REM 2026
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`comges-tab-btn ${activeTab === 'summary' ? 'comges-tab-btn-active' : 'comges-tab-btn-inactive'}`}
              >
                <Layers size={16} />
                Resumen por Dominios (6 COMGES)
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="comges-main">
        {/* KPI Cards Section */}
        <div className="comges-kpi-grid">
          <div className="comges-kpi-card">
            <span className="comges-kpi-label" style={{ color: '#64748b' }}>
              Indicadores Evaluables <FileText size={16} />
            </span>
            <div>
              <span className="comges-kpi-val" style={{ color: '#0f172a' }}>11</span>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Hospital de Villarrica 2026</span>
            </div>
          </div>

          <div className="comges-kpi-card" style={{ borderLeft: '4px solid #10b981' }}>
            <span className="comges-kpi-label" style={{ color: '#059669' }}>
              Cumplen Meta <CheckCircle size={16} />
            </span>
            <div>
              <span className="comges-kpi-val" style={{ color: '#059669' }}>{summaryMetrics.cumple}</span>
              <span style={{ fontSize: '11px', color: '#059669', display: 'block', fontWeight: 600 }}>{summaryMetrics.cumplePerc}% del total</span>
            </div>
          </div>

          <div className="comges-kpi-card" style={{ borderLeft: '4px solid #f59e0b' }}>
            <span className="comges-kpi-label" style={{ color: '#d97706' }}>
              En Riesgo <AlertTriangle size={16} />
            </span>
            <div>
              <span className="comges-kpi-val" style={{ color: '#d97706' }}>{summaryMetrics.riesgo}</span>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Monitoreo activo</span>
            </div>
          </div>

          <div className="comges-kpi-card" style={{ borderLeft: '4px solid #f43f5e' }}>
            <span className="comges-kpi-label" style={{ color: '#e11d48' }}>
              No Cumplen <XCircle size={16} />
            </span>
            <div>
              <span className="comges-kpi-val" style={{ color: '#e11d48' }}>{summaryMetrics.noCumple}</span>
              <span style={{ fontSize: '11px', color: '#e11d48', display: 'block', fontWeight: 600 }}>Plan de mejora</span>
            </div>
          </div>

          <div className="comges-kpi-card" style={{ borderLeft: '4px solid #64748b' }}>
            <span className="comges-kpi-label" style={{ color: '#475569' }}>
              Sin Medición <AlertCircle size={16} />
            </span>
            <div>
              <span className="comges-kpi-val" style={{ color: '#334155' }}>{summaryMetrics.sinMedicion}</span>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Criterios SSAS por definir</span>
            </div>
          </div>
        </div>

        {/* TAB 1: INDICATORS EVALUATED (11 COMGES) */}
        {activeTab === 'indicators' && (
          <div>
            {/* Filter and Search Toolbar */}
            <div className="comges-toolbar">
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                
                {/* Left Group: Search Input + Domain / Objective Select Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1', minWidth: '320px', flexWrap: 'wrap' }}>
                  {/* Search Input */}
                  <div className="comges-search-box" style={{ flex: '1', minWidth: '240px', position: 'relative' }}>
                    <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      className="comges-search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar por código, nombre, fórmula o definición..."
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Limpiar
                      </button>
                    )}
                  </div>

                  {/* Objective / Domain Dropdown Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label htmlFor="domain-select" style={{ fontSize: '13px', fontWeight: 700, color: '#334155', whiteSpace: 'nowrap' }}>
                      Objetivo / Dominio:
                    </label>
                    <select
                      id="domain-select"
                      value={selectedDomain}
                      onChange={(e) => setSelectedDomain(e.target.value)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#0f172a',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        outline: 'none',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        maxHeight: '42px'
                      }}
                    >
                      <option value="all">🎯 Todos los Indicadores (16: 11 COMGES + 5 Monitoreo)</option>
                      {COMGES_DOMAINS.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.code}: {d.title} {d.weight !== 'Monitoreo' ? `(${d.weight})` : '(Obligatorio)'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status Filter buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginRight: '4px' }}>Estado:</span>
                  <button
                    onClick={() => setSelectedStatus('all')}
                    className={`comges-pill ${selectedStatus === 'all' ? 'comges-pill-active' : ''}`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setSelectedStatus('cumple')}
                    className={`comges-pill ${selectedStatus === 'cumple' ? 'comges-pill-active' : ''}`}
                    style={selectedStatus === 'cumple' ? { background: '#10b981', borderColor: '#10b981' } : { color: '#059669' }}
                  >
                    Cumple ({summaryMetrics.cumple})
                  </button>
                  <button
                    onClick={() => setSelectedStatus('riesgo')}
                    className={`comges-pill ${selectedStatus === 'riesgo' ? 'comges-pill-active' : ''}`}
                    style={selectedStatus === 'riesgo' ? { background: '#f59e0b', borderColor: '#f59e0b' } : { color: '#d97706' }}
                  >
                    En Riesgo ({summaryMetrics.riesgo})
                  </button>
                  <button
                    onClick={() => setSelectedStatus('nocumple')}
                    className={`comges-pill ${selectedStatus === 'nocumple' ? 'comges-pill-active' : ''}`}
                    style={selectedStatus === 'nocumple' ? { background: '#f43f5e', borderColor: '#f43f5e' } : { color: '#e11d48' }}
                  >
                    No Cumple ({summaryMetrics.noCumple})
                  </button>
                  <button
                    onClick={() => setSelectedStatus('sinmedicion')}
                    className={`comges-pill ${selectedStatus === 'sinmedicion' ? 'comges-pill-active' : ''}`}
                    style={selectedStatus === 'sinmedicion' ? { background: '#64748b', borderColor: '#64748b' } : { color: '#475569' }}
                  >
                    Sin Medición ({summaryMetrics.sinMedicion})
                  </button>
                </div>
              </div>
            </div>

            {/* Indicator Cards List */}
            {filteredIndicators.length === 0 ? (
              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '48px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <Info size={48} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>No se encontraron indicadores</h3>
                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Prueba cambiando el filtro de búsqueda o el dominio seleccionado.</p>
                <button
                  onClick={() => { setSelectedDomain('all'); setSelectedStatus('all'); setSearchQuery(''); }}
                  style={{ marginTop: '16px', padding: '10px 20px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              <div className="comges-indicators-grid">
                {filteredIndicators.map((ind) => {
                  const domainInfo = COMGES_DOMAINS.find(d => d.id === ind.domainId);
                  const isSinMedicion = ind.summaryYTD?.status === 'Sin Medición';
                  return (
                    <motion.div
                      key={ind.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="comges-card"
                    >
                      <div>
                        {/* Indicator Top Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '8px', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span className="comges-card-code">
                              {ind.code}
                            </span>
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#fff',
                                backgroundColor: domainInfo?.color || '#64748b'
                              }}
                            >
                              {domainInfo?.code}
                            </span>
                          </div>
                          {getStatusBadge(ind.summaryYTD?.status)}
                        </div>

                        {/* Indicator Title & Definition */}
                        <h3 className="comges-card-title">
                          {ind.name}
                        </h3>

                        <p className="comges-card-def">
                          {ind.definition}
                        </p>

                        {/* Formula expression box */}
                        <div className="comges-formula-box">
                          <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                            Fórmula MINSAL
                          </span>
                          {ind.formula?.expression || 'Ver fórmula técnica'}
                        </div>

                        {/* Monthly Trend Line Chart right below the formula */}
                        <MiniMonthlyLineChart monthlyData={ind.monthlyData} target={ind.target} status={ind.summaryYTD?.status} />
                      </div>

                      {/* Bottom Performance Metrics & Action Button */}
                      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
                          <div>
                            <span style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Meta MINSAL</span>
                            <span style={{ fontWeight: 700, color: '#1e293b' }}>{ind.target}</span>
                          </div>
                          <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '16px' }}>
                            <span style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Resultado Acumulado</span>
                            <span style={{ fontWeight: 800, color: isSinMedicion ? '#64748b' : '#0f172a', fontSize: isSinMedicion ? '12px' : '14px', fontStyle: isSinMedicion ? 'italic' : 'normal' }}>
                              {ind.summaryYTD?.resultFormatted || '-'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => { setSelectedIndicator(ind); setModalSubTab('minsal'); }}
                          style={{
                            padding: '8px 14px',
                            background: '#f0fdf4',
                            color: '#166534',
                            border: '1px solid #bbf7d0',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s'
                          }}
                        >
                          <BookOpen size={14} /> Ficha Técnica MINSAL
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INDICADORES DE MONITOREO */}
        {activeTab === 'monitoreo' && (
          <div>
            {/* Monitoreo header info */}
            <div style={{ background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '10px', background: '#64748b', borderRadius: '10px', flexShrink: 0 }}>
                <Activity size={20} color="white" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>Indicadores de Monitoreo Obligatorio — Hospital de Villarrica</h3>
                <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#64748b', lineHeight: 1.5 }}>
                  {monitoreoIndicators.length} indicadores de seguimiento continuo. <strong>No cuentan con ponderación en la evaluación COMGES</strong> pero son de reporte obligatorio ante el SSAS.
                </p>
              </div>
              {/* Monitoreo KPIs mini */}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
                {[
                  { label: 'Cumple', val: monitoreoMetrics.cumple, color: '#10b981', bg: '#d1fae5' },
                  { label: 'En Riesgo', val: monitoreoMetrics.riesgo, color: '#f59e0b', bg: '#fef3c7' },
                  { label: 'No Cumple', val: monitoreoMetrics.noCumple, color: '#e11d48', bg: '#ffe4e6' },
                  { label: 'Sin Med.', val: monitoreoMetrics.sinMedicion, color: '#64748b', bg: '#f1f5f9' },
                ].map(m => (
                  <div key={m.label} style={{ background: m.bg, border: `1px solid ${m.color}33`, borderRadius: '8px', padding: '6px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: m.color, lineHeight: 1 }}>{m.val}</div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: m.color, marginTop: '2px' }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monitoreo Toolbar */}
            <div className="comges-toolbar">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                {/* Search */}
                <div className="comges-search-box" style={{ flex: '1', minWidth: '260px', position: 'relative' }}>
                  <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="comges-search-input"
                    value={monitoreoSearch}
                    onChange={(e) => setMonitoreoSearch(e.target.value)}
                    placeholder="Buscar indicador de monitoreo..."
                  />
                  {monitoreoSearch && (
                    <button onClick={() => setMonitoreoSearch('')}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px' }}
                    >Limpiar</button>
                  )}
                </div>
                {/* Status filter pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginRight: '4px' }}>Estado:</span>
                  {[
                    { key: 'all', label: 'Todos', activeStyle: {} },
                    { key: 'cumple', label: `Cumple (${monitoreoMetrics.cumple})`, activeStyle: { background: '#10b981', borderColor: '#10b981' }, inactiveStyle: { color: '#059669' } },
                    { key: 'riesgo', label: `En Riesgo (${monitoreoMetrics.riesgo})`, activeStyle: { background: '#f59e0b', borderColor: '#f59e0b' }, inactiveStyle: { color: '#d97706' } },
                    { key: 'nocumple', label: `No Cumple (${monitoreoMetrics.noCumple})`, activeStyle: { background: '#f43f5e', borderColor: '#f43f5e' }, inactiveStyle: { color: '#e11d48' } },
                    { key: 'sinmedicion', label: `Sin Med. (${monitoreoMetrics.sinMedicion})`, activeStyle: { background: '#64748b', borderColor: '#64748b' }, inactiveStyle: { color: '#475569' } },
                  ].map(p => (
                    <button key={p.key}
                      onClick={() => setMonitoreoStatus(p.key)}
                      className={`comges-pill ${monitoreoStatus === p.key ? 'comges-pill-active' : ''}`}
                      style={monitoreoStatus === p.key ? p.activeStyle : (p.inactiveStyle || {})}
                    >{p.label}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Monitoreo Cards Grid */}
            {filteredMonitoreo.length === 0 ? (
              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '48px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <Info size={48} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>No se encontraron indicadores de monitoreo</h3>
                <button onClick={() => { setMonitoreoStatus('all'); setMonitoreoSearch(''); }}
                  style={{ marginTop: '16px', padding: '10px 20px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                >Restablecer filtros</button>
              </div>
            ) : (
              <div className="comges-indicators-grid">
                {filteredMonitoreo.map((ind) => {
                  const isSinMedicion = ind.summaryYTD?.status === 'Sin Medición';
                  return (
                    <motion.div
                      key={ind.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="comges-card"
                      style={{ borderLeft: '4px solid #64748b' }}
                    >
                      <div>
                        {/* Card header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span className="comges-card-code" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>
                              {ind.code}
                            </span>
                            <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, color: '#fff', backgroundColor: '#64748b' }}>
                              MONITOREO
                            </span>
                          </div>
                          {getStatusBadge(ind.summaryYTD?.status)}
                        </div>

                        <h3 className="comges-card-title">{ind.name}</h3>
                        <p className="comges-card-def">{ind.definition}</p>

                        <div className="comges-formula-box">
                          <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Fórmula</span>
                          {ind.formula?.expression || 'Ver fórmula técnica'}
                        </div>

                        <MiniMonthlyLineChart monthlyData={ind.monthlyData} target={ind.target} status={ind.summaryYTD?.status} />
                      </div>

                      {/* Bottom metrics */}
                      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
                          <div>
                            <span style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Meta</span>
                            <span style={{ fontWeight: 700, color: '#1e293b' }}>{ind.target}</span>
                          </div>
                          <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '16px' }}>
                            <span style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Resultado Acumulado</span>
                            <span style={{ fontWeight: 800, color: isSinMedicion ? '#64748b' : '#0f172a', fontSize: isSinMedicion ? '12px' : '14px', fontStyle: isSinMedicion ? 'italic' : 'normal' }}>
                              {ind.summaryYTD?.resultFormatted || '-'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => { setSelectedIndicator(ind); setModalSubTab('minsal'); }}
                          style={{ padding: '8px 14px', background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                        >
                          <BookOpen size={14} /> Ver Ficha
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ORIENTACIONES TÉCNICAS MINSAL COMPENDIO */}
        {activeTab === 'orientaciones' && (
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <FileText size={28} color="#0d9488" />
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Orientaciones Técnicas COMGES 2026 - MINSAL</h2>
              </div>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, maxWidth: '900px' }}>
                Compendio conceptual y metodológico normado por la Subsecretaría de Redes Asistenciales del Ministerio de Salud (Videoconferencia MINSAL 21-07-2026).
              </p>
            </div>

            {/* Penalization rules callout from Videoconferencia Slide 10 */}
            <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '13px', color: '#9a3412' }}>
              <h4 style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: '#c2410c', marginBottom: '4px' }}>
                <AlertCircle size={18} color="#c2410c" /> Regla de Evaluación y Penalizaciones (-1 Punto)
              </h4>
              <p style={{ lineHeight: 1.5 }}>
                La evaluación del indicador principal se realiza en una escala de 0 a 4 puntos según su tabla de sensibilidad. Cuando el indicador incorpora **Requisito**, el incumplimiento técnico, no entrega o entrega fuera de plazo **descontará 1 punto** del puntaje obtenido (sin reducir el resultado a menos de 0 Puntos).
              </p>
            </div>

            {/* Situación Regional Por Establecimiento (Slide 17) */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} color="#0d9488" /> Situación Actual Red Asistencial Araucanía Sur
              </h3>
              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <table className="comges-table">
                  <thead>
                    <tr>
                      <th>Establecimiento</th>
                      <th style={{ textAlign: 'center' }}>Indicadores Evaluables</th>
                      <th style={{ textAlign: 'center' }}>Indicadores de Monitoreo</th>
                      <th style={{ textAlign: 'center' }}>Referentes Definidos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {REGIONAL_HOSPITALS.map((h, idx) => (
                      <tr key={idx} style={h.highlight ? { background: '#f0fdf4', fontWeight: 700 } : {}}>
                        <td style={{ color: h.highlight ? '#166534' : '#0f172a' }}>
                          {h.name} {h.highlight && '(Nuestro Hospital)'}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{h.evalCount}</td>
                        <td style={{ textAlign: 'center' }}>{h.monitoreoCount}</td>
                        <td style={{ textAlign: 'center', color: '#0d9488', fontWeight: 700 }}>{h.referentes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Structure by Domains */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Estructura por Dominios de Gestión 2026</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {COMGES_DOMAINS.filter(d => d.id !== 'monitoreo').map((domain) => {
                  const domainIndicators = COMGES_INDICATORS.filter(i => i.domainId === domain.id);
                  return (
                    <div key={domain.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                      <div style={{ padding: '14px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: domain.color }}></span>
                          <h4 style={{ fontWeight: 800, color: '#0f172a', fontSize: '15px' }}>{domain.code}: {domain.title}</h4>
                        </div>
                        <span style={{ padding: '4px 12px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '9999px', fontWeight: 700, fontSize: '12px' }}>
                          Ponderación: {domain.weight} ({domain.indWeight} / indicador)
                        </span>
                      </div>
                      <div style={{ padding: '16px', background: '#ffffff' }}>
                        <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>{domain.description}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px', marginTop: '16px' }}>
                          {domainIndicators.map(ind => (
                            <div key={ind.id} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                                <span>{ind.code}</span>
                                <span style={{ color: '#0d9488', fontFamily: 'monospace' }}>Meta: {ind.target}</span>
                              </div>
                              <p style={{ fontWeight: 700, color: '#1e293b' }}>{ind.name}</p>
                              <p style={{ color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>{ind.definition}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CALENDARIO DE CARGAS REM 2026 */}
        {activeTab === 'rem_calendar' && (
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Clock size={28} color="#0d9488" />
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Calendario Oficial Cargas REM MINSAL 2026</h2>
              </div>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, maxWidth: '900px' }}>
                Fechas de apertura, cierre de puerto y disponibilidad oficial de publicación de datos del Sistema de Cargas REM (Videoconferencia MINSAL 21-07-2026).
              </p>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <table className="comges-table">
                <thead>
                  <tr>
                    <th>Información REM A Cargar</th>
                    <th style={{ textAlign: 'center' }}>Apertura de Puerto</th>
                    <th style={{ textAlign: 'center' }}>Cierre de Puerto</th>
                    <th style={{ textAlign: 'center' }}>Datos Disponibles Publicación</th>
                  </tr>
                </thead>
                <tbody>
                  {REM_CALENDAR.map((row, idx) => (
                    <tr key={idx} style={row.month.includes('Junio') ? { background: '#f0fdf4', fontWeight: 700 } : {}}>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{row.month}</td>
                      <td style={{ textAlign: 'center', color: '#2563eb' }}>{row.open}</td>
                      <td style={{ textAlign: 'center', color: '#e11d48' }}>{row.close}</td>
                      <td style={{ textAlign: 'center', color: '#059669', fontWeight: 700 }}>{row.publish}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: RESUMEN EJECUTIVO POR DOMINIOS */}
        {activeTab === 'summary' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {COMGES_DOMAINS.map((d) => {
              const inds = COMGES_INDICATORS.filter(i => i.domainId === d.id);
              const cumpleCount = inds.filter(i => i.summaryYTD?.status === 'Cumple').length;
              const noCumpleCount = inds.filter(i => i.summaryYTD?.status === 'No Cumple').length;
              const sinMedicionCount = inds.filter(i => i.summaryYTD?.status === 'Sin Medición').length;
              return (
                <div key={d.id} style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, color: '#fff', backgroundColor: d.color, fontFamily: 'monospace' }}>
                        {d.code}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', background: '#f1f5f9', padding: '4px 10px', borderRadius: '9999px' }}>
                        Ponderación: {d.weight}
                      </span>
                    </div>
                    <h3 style={{ fontWeight: 800, color: '#0f172a', fontSize: '16px', lineHeight: 1.3 }}>{d.title}</h3>
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', lineHeight: 1.5 }}>{d.description}</p>
                  </div>

                  <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Indicadores ({inds.length})</span>
                      <span style={{ color: '#059669', fontWeight: 700 }}>{cumpleCount} Cumplen {sinMedicionCount > 0 && `| ${sinMedicionCount} Sin Medición`}</span>
                    </div>
                    <div style={{ width: '100%', background: '#e2e8f0', borderRadius: '9999px', height: '8px', overflow: 'hidden', display: 'flex' }}>
                      <div
                        style={{ width: `${inds.length > 0 ? (cumpleCount / inds.length) * 100 : 0}%`, background: '#10b981', height: '100%' }}
                      ></div>
                      <div
                        style={{ width: `${inds.length > 0 ? (noCumpleCount / inds.length) * 100 : 0}%`, background: '#f43f5e', height: '100%' }}
                      ></div>
                      <div
                        style={{ width: `${inds.length > 0 ? (sinMedicionCount / inds.length) * 100 : 0}%`, background: '#64748b', height: '100%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* DETAILED FICHA TÉCNICA & EXCEL PERFORMANCE MODAL */}
      <AnimatePresence>
        {selectedIndicator && (
          <div className="comges-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="comges-modal-content"
            >
              {/* Modal Header */}
              <div className="comges-modal-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <span style={{ background: 'rgba(45, 212, 191, 0.2)', color: '#5eead4', border: '1px solid rgba(45, 212, 191, 0.4)', fontSize: '12px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                      {selectedIndicator.code}
                    </span>
                    {getStatusBadge(selectedIndicator.summaryYTD?.status)}
                  </div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', lineHeight: 1.3 }}>
                    {selectedIndicator.name}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedIndicator(null)}
                  style={{ background: 'rgba(255, 255, 255, 0.15)', border: 'none', color: '#fff', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontWeight: 700 }}
                >
                  ✕
                </button>
              </div>

              {/* Modal Sub-Tabs */}
              <div style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', padding: '12px 24px 0 24px', display: 'flex', gap: '16px' }}>
                <button
                  onClick={() => setModalSubTab('minsal')}
                  style={{
                    paddingBottom: '12px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    borderBottom: modalSubTab === 'minsal' ? '3px solid #0d9488' : '3px solid transparent',
                    color: modalSubTab === 'minsal' ? '#0f766e' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <BookOpen size={16} /> Orientaciones Técnicas MINSAL
                </button>
                <button
                  onClick={() => setModalSubTab('excel')}
                  style={{
                    paddingBottom: '12px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    borderBottom: modalSubTab === 'excel' ? '3px solid #0d9488' : '3px solid transparent',
                    color: modalSubTab === 'excel' ? '#0f766e' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FileSpreadsheet size={16} /> Evaluación Mensual (Excel 2026)
                </button>
              </div>

              {/* Modal Body */}
              <div className="comges-modal-body">
                {modalSubTab === 'minsal' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Definition */}
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Info size={16} /> Definición Técnica MINSAL
                      </h4>
                      <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6, background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        {selectedIndicator.definition}
                      </p>
                    </div>

                    {/* Strategic Objective */}
                    {selectedIndicator.objective && (
                      <div>
                        <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                          Objetivo Estratégico de Gestión
                        </h4>
                        <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5, background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          {selectedIndicator.objective}
                        </p>
                      </div>
                    )}

                    {/* Calculation Formula */}
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BarChart2 size={16} /> Fórmula de Cálculo
                      </h4>
                      <div style={{ background: '#0f172a', color: '#f8fafc', padding: '16px', borderRadius: '12px', fontFamily: 'monospace', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ color: '#5eead4', fontWeight: 800, fontSize: '14px' }}>
                          {selectedIndicator.formula?.expression}
                        </div>
                        <div style={{ borderTop: '1px solid #334155', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', color: '#cbd5e1', fontSize: '12px' }}>
                          <p><strong style={{ color: '#fff' }}>Numerador:</strong> {selectedIndicator.formula?.numerator}</p>
                          <p><strong style={{ color: '#fff' }}>Denominador:</strong> {selectedIndicator.formula?.denominator}</p>
                        </div>
                      </div>
                    </div>

                    {/* Evaluation Rules & Frequency */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h5 style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Meta & Umbrales MINSAL
                        </h5>
                        <p style={{ fontSize: '18px', fontWeight: 800, color: '#0f766e' }}>{selectedIndicator.target}</p>
                        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Frecuencia: {selectedIndicator.frequency}</p>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h5 style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Fuente de Información / Registro
                        </h5>
                        <p style={{ fontSize: '13px', color: '#1e293b', fontWeight: 600 }}>{selectedIndicator.dataSource}</p>
                      </div>
                    </div>

                    {/* Evaluation Conditions */}
                    {selectedIndicator.evalRules && (
                      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '16px', borderRadius: '12px', fontSize: '13px', color: '#78350f' }}>
                        <h5 style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: '#92400e' }}>
                          <AlertTriangle size={16} color="#d97706" /> Condiciones y Requisitos de Evaluación
                        </h5>
                        <p style={{ lineHeight: 1.5 }}>{selectedIndicator.evalRules}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Monthly Excel Data Table */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileSpreadsheet size={18} color="#0d9488" /> Desglose Mensual 2026 (Planilla Base)
                        </h4>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Hospital de Villarrica</span>
                      </div>

                      {(selectedIndicator.id === '3.3.1' || selectedIndicator.id === '3.3.2') ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                          {/* Table 3.3.1: Excluye Ortodoncia */}
                          {(() => {
                            const ind331 = COMGES_INDICATORS.find(i => i.id === '3.3.1') || selectedIndicator;
                            return (
                              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                <h5 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ background: '#0d9488', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px' }}>3.3.1</span>
                                  Monitoreo P75 Consulta Nueva Odontológica (Excluye Ortodoncia)
                                </h5>
                                <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '10px', background: '#ffffff' }}>
                                  <table className="comges-table">
                                    <thead>
                                      <tr>
                                        <th>Mes</th>
                                        <th style={{ textAlign: 'right' }}>Línea Base (P75)</th>
                                        <th style={{ textAlign: 'right' }}>Lista de Espera</th>
                                        <th style={{ textAlign: 'right' }}>Egresos (Numerador)</th>
                                        <th style={{ textAlign: 'right' }}>Resultado %</th>
                                        <th style={{ textAlign: 'center' }}>Estado</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {ind331.monthlyData.map((row, idx) => (
                                        <tr key={idx} style={row.month === 'Junio' ? { background: '#f0fdf4' } : {}}>
                                          <td style={{ fontWeight: 700, color: '#0f172a' }}>{row.month}</td>
                                          <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>1353</td>
                                          <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{row.denominator ? row.denominator - row.numerator : '-'}</td>
                                          <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>{row.numerator}</td>
                                          <td style={{ textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>{row.resultFormatted}</td>
                                          <td style={{ textAlign: 'center' }}>{getStatusBadge(row.status)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Table 3.3.2: Ortodoncia */}
                          {(() => {
                            const ind332 = COMGES_INDICATORS.find(i => i.id === '3.3.2') || selectedIndicator;
                            return (
                              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                <h5 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ background: '#0284c7', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px' }}>3.3.2</span>
                                  Monitoreo P75 Consulta Nueva Odontológica (Ortodoncia)
                                </h5>
                                <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '10px', background: '#ffffff' }}>
                                  <table className="comges-table">
                                    <thead>
                                      <tr>
                                        <th>Mes</th>
                                        <th style={{ textAlign: 'right' }}>Línea Base (P75)</th>
                                        <th style={{ textAlign: 'right' }}>Lista de Espera</th>
                                        <th style={{ textAlign: 'right' }}>Egresos (Numerador)</th>
                                        <th style={{ textAlign: 'right' }}>Resultado %</th>
                                        <th style={{ textAlign: 'center' }}>Estado</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {ind332.monthlyData.map((row, idx) => (
                                        <tr key={idx} style={row.month === 'Junio' ? { background: '#f0fdf4' } : {}}>
                                          <td style={{ fontWeight: 700, color: '#0f172a' }}>{row.month}</td>
                                          <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{row.denominator || '-'}</td>
                                          <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{row.month === 'Abril' ? 559 : row.month === 'Mayo' ? 487 : row.month === 'Junio' ? 421 : '-'}</td>
                                          <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>{row.numerator}</td>
                                          <td style={{ textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>{row.resultFormatted}</td>
                                          <td style={{ textAlign: 'center' }}>{getStatusBadge(row.status)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      ) : selectedIndicator.monthlyData && selectedIndicator.monthlyData.length > 0 ? (
                        <>
                          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                            <table className="comges-table">
                              <thead>
                                <tr>
                                  <th>Mes</th>
                                  <th style={{ textAlign: 'right' }}>Numerador</th>
                                  <th style={{ textAlign: 'right' }}>Denominador</th>
                                  <th style={{ textAlign: 'right' }}>Resultado %</th>
                                  <th style={{ textAlign: 'center' }}>Meta</th>
                                  <th style={{ textAlign: 'center' }}>Estado</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedIndicator.monthlyData.map((row, idx) => (
                                  <tr key={idx} style={row.month === 'Junio' ? { background: '#f0fdf4' } : {}}>
                                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{row.month}</td>
                                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{row.numerator}</td>
                                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{row.denominator}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>{row.resultFormatted}</td>
                                    <td style={{ textAlign: 'center', color: '#475569' }}>{selectedIndicator.target}</td>
                                    <td style={{ textAlign: 'center' }}>{getStatusBadge(row.status)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Notice for Monthly Updates - Only shown when indicator has monthly measurement data */}
                          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '12px', fontSize: '13px', color: '#166534', display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: '16px' }}>
                            <RefreshCw size={20} color="#166534" style={{ marginTop: '2px', shrink: 0 }} />
                            <div>
                              <h5 style={{ fontWeight: 800, color: '#14532d', marginBottom: '2px' }}>Actualizaciones Mensuales de Base</h5>
                              <p style={{ lineHeight: 1.5 }}>
                                Al momento de cargar un nuevo archivo de base mensual actualizado (ej. Julio, Agosto), este módulo reflejará automáticamente los nuevos numeradores, denominadores y resultados acumulados sin alterar las definiciones técnicas del MINSAL.
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                          <AlertCircle size={32} color="#64748b" style={{ margin: '0 auto 8px auto' }} />
                          <p style={{ fontSize: '13.5px', color: '#1e293b', fontWeight: 700, lineHeight: 1.5 }}>
                            Actualmente sin medición acumulada por dificultades metodológicas y falta de definición de las líneas de base por aclarar desde el Servicio de Salud Araucanía Sur (SSAS).
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Detailed Ord 1934 Analysis for Ausentismo Laboral M4.6 */}
                    {selectedIndicator.ord1934Details && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '2px dashed #cbd5e1', paddingTop: '20px', marginTop: '10px' }}>
                        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '12px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1e40af', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={18} color="#2563eb" /> Análisis Oficial Ord. N° 1934 - Ausentismo Laboral por LMC (Mayo 2026)
                          </h4>
                          <p style={{ fontSize: '12px', color: '#1e3a8a', lineHeight: 1.5 }}>
                            <strong>Documento Oficial:</strong> {selectedIndicator.ord1934Details.documentRef} | <strong>Periodo Evaluado:</strong> {selectedIndicator.ord1934Details.period} | <strong>Tasa Acumulada:</strong> {selectedIndicator.ord1934Details.ytdCumulativeRate}
                          </p>
                        </div>

                        {/* Breakdown 1: Distribution by Days */}
                        <div>
                          <h5 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                            1. Distribución de Licencias Médicas Curativas por Tramo de Días (Hospital Villarrica)
                          </h5>
                          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                            <table className="comges-table" style={{ fontSize: '12px' }}>
                              <thead>
                                <tr>
                                  <th>Tramo de Días</th>
                                  <th style={{ textAlign: 'right' }}>N° de Licencias</th>
                                  <th style={{ textAlign: 'right' }}>Porcentaje %</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedIndicator.ord1934Details.distributionByDays.map((item, i) => (
                                  <tr key={i}>
                                    <td style={{ fontWeight: 700 }}>{item.range}</td>
                                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{item.count}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#0f766e' }}>{item.percentage}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Breakdown 2: Critical Units */}
                        <div>
                          <h5 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                            2. Servicios y Unidades con Mayor Ausentismo en Hospital Villarrica (Mayo 2026)
                          </h5>
                          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                            <table className="comges-table" style={{ fontSize: '12px' }}>
                              <thead>
                                <tr>
                                  <th>Unidad / Servicio</th>
                                  <th style={{ textAlign: 'right' }}>Días de Ausencia</th>
                                  <th style={{ textAlign: 'right' }}>Índice (Días/Func)</th>
                                  <th style={{ textAlign: 'center' }}>Nivel de Riesgo</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedIndicator.ord1934Details.criticalUnits.map((u, i) => (
                                  <tr key={i} style={u.unit.includes('Pabellón') ? { background: '#fff1f2' } : {}}>
                                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{u.unit}</td>
                                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{u.absentDays}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 800, color: u.unit.includes('Pabellón') ? '#e11d48' : '#0f172a' }}>{u.index}</td>
                                    <td style={{ textAlign: 'center', fontWeight: 700, color: u.unit.includes('Pabellón') ? '#e11d48' : '#475569' }}>{u.risk}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Breakdown 3: Top Doctors */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                            <h5 style={{ fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                              Médicos con Mayor Emisión de LMC en Villarrica
                            </h5>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {selectedIndicator.ord1934Details.topDoctorsEmittingLMC.map((doc, i) => (
                                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{doc.name}</span>
                                  <span style={{ fontWeight: 800, color: '#0d9488' }}>{doc.lmcCount} LMC</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div style={{ background: '#faf5ff', padding: '14px', borderRadius: '10px', border: '1px solid #f3e8ff' }}>
                            <h5 style={{ fontSize: '12px', fontWeight: 800, color: '#6b21a8', marginBottom: '8px' }}>
                              Comportamiento por Rango Etario en la Red SSAS
                            </h5>
                            <p style={{ fontSize: '12px', color: '#581c87', lineHeight: 1.5 }}>
                              {selectedIndicator.ord1934Details.ageDistributionNote}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{ background: '#f1f5f9', borderTop: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>ID: {selectedIndicator.id}</span>
                <button
                  onClick={() => setSelectedIndicator(null)}
                  style={{ padding: '8px 20px', background: '#0f172a', color: '#ffffff', fontSize: '13px', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                >
                  Cerrar Ficha
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
