import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, Filter, CheckCircle, AlertTriangle, XCircle, Info,
  BookOpen, FileText, ChevronRight, BarChart2, TrendingUp, Calendar,
  Award, Shield, ExternalLink, HelpCircle, Layers, Activity, FileSpreadsheet,
  Download, RefreshCw
} from 'lucide-react';
import { COMGES_META, COMGES_DOMAINS, COMGES_INDICATORS } from '../data/comges2026Data';
import './ComgesDashboard.css';

export default function ComgesDashboard({ onBack }) {
  const [activeTab, setActiveTab] = useState('indicators'); // 'indicators' | 'orientaciones' | 'summary'
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  const [modalSubTab, setModalSubTab] = useState('minsal'); // 'minsal' | 'excel'

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    let cumple = 0;
    let riesgo = 0;
    let noCumple = 0;
    let sinDato = 0;

    COMGES_INDICATORS.forEach(ind => {
      const status = ind.summaryYTD?.status;
      if (status === 'Cumple') cumple++;
      else if (status === 'En Riesgo') riesgo++;
      else if (status === 'No Cumple') noCumple++;
      else sinDato++;
    });

    return {
      total: COMGES_INDICATORS.length,
      cumple,
      riesgo,
      noCumple,
      sinDato,
      cumplePerc: ((cumple / COMGES_INDICATORS.length) * 100).toFixed(1)
    };
  }, []);

  // Filtered Indicators List
  const filteredIndicators = useMemo(() => {
    return COMGES_INDICATORS.filter(ind => {
      // Domain filter
      if (selectedDomain !== 'all' && ind.domainId !== selectedDomain) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'all') {
        const st = ind.summaryYTD?.status;
        if (selectedStatus === 'cumple' && st !== 'Cumple') return false;
        if (selectedStatus === 'riesgo' && st !== 'En Riesgo') return false;
        if (selectedStatus === 'nocumple' && st !== 'No Cumple') return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchCode = ind.code.toLowerCase().includes(q);
        const matchName = ind.name.toLowerCase().includes(q);
        const matchDef = (ind.definition || '').toLowerCase().includes(q);
        const matchObj = (ind.objective || '').toLowerCase().includes(q);
        const matchDomain = (ind.domainId || '').toLowerCase().includes(q);
        if (!matchCode && !matchName && !matchDef && !matchObj && !matchDomain) return false;
      }
      return true;
    });
  }, [selectedDomain, selectedStatus, searchQuery]);

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
                  <span className="comges-badge comges-badge-version">
                    {COMGES_META.version}
                  </span>
                </div>
                <h1 className="comges-title">
                  <Award size={32} color="#2dd4bf" />
                  Compromisos de Gestión (COMGES) 2026
                </h1>
                <p className="comges-subtitle">
                  Evaluación mensual de indicadores evaluados en Excel, definiciones técnicas, fórmulas de cálculo y requisitos normados por el MINSAL.
                </p>
              </div>
            </div>

            {/* Monthly Update Info Box */}
            <div className="comges-update-box">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#5eead4', fontWeight: 700, marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={16} /> Carga Mensual Base
                </span>
                <span style={{ background: 'rgba(45, 212, 191, 0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                  {COMGES_META.lastUpdatedMonth} 2026
                </span>
              </div>
              <p style={{ color: '#94a3b8', lineHeight: 1.4 }}>
                Se actualizará automáticamente cada mes al cargar los nuevos archivos de base.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: '#2dd4bf', fontWeight: 600, fontSize: '11px' }}>
                <RefreshCw size={12} className="animate-spin" />
                <span>Ingesta directa desde PLANILLA COMGES 2026.xlsx</span>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="comges-nav-tabs">
            <button
              onClick={() => setActiveTab('indicators')}
              className={`comges-tab-btn ${activeTab === 'indicators' ? 'comges-tab-btn-active' : 'comges-tab-btn-inactive'}`}
            >
              <Activity size={16} />
              Indicadores Evaluados ({filteredIndicators.length})
            </button>
            <button
              onClick={() => setActiveTab('orientaciones')}
              className={`comges-tab-btn ${activeTab === 'orientaciones' ? 'comges-tab-btn-active' : 'comges-tab-btn-inactive'}`}
            >
              <BookOpen size={16} />
              Orientaciones Técnicas MINSAL
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
      </header>

      {/* Main Content Area */}
      <main className="comges-main">
        {/* KPI Cards Section */}
        <div className="comges-kpi-grid">
          <div className="comges-kpi-card">
            <span className="comges-kpi-label" style={{ color: '#64748b' }}>
              Total Indicadores <FileText size={16} />
            </span>
            <div>
              <span className="comges-kpi-val" style={{ color: '#0f172a' }}>{summaryMetrics.total}</span>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>23 COMGES + Monitoreo</span>
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

          <div className="comges-kpi-card" style={{ borderLeft: '4px solid #0d9488' }}>
            <span className="comges-kpi-label" style={{ color: '#0d9488' }}>
              Ponderación MINSAL <Shield size={16} />
            </span>
            <div>
              <span className="comges-kpi-val" style={{ color: '#0f766e' }}>100%</span>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>6 Dominios evaluados</span>
            </div>
          </div>
        </div>

        {/* TAB 1: INDICATORS EVALUATED */}
        {activeTab === 'indicators' && (
          <div>
            {/* Filter and Search Toolbar */}
            <div className="comges-toolbar">
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyBetween: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                {/* Search Input */}
                <div className="comges-search-box">
                  <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="comges-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por código, nombre, fórmula o definición técnica..."
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
                </div>
              </div>

              {/* Domain Pills Filter */}
              <div className="comges-domain-pills">
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Dominio:</span>
                <button
                  onClick={() => setSelectedDomain('all')}
                  className={`comges-pill ${selectedDomain === 'all' ? 'comges-pill-active' : ''}`}
                >
                  Todos los Dominios
                </button>
                {COMGES_DOMAINS.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDomain(d.id)}
                    className={`comges-pill ${selectedDomain === d.id ? 'comges-pill-active' : ''}`}
                  >
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: d.color, marginRight: '6px' }}></span>
                    {d.code} ({d.weight})
                  </button>
                ))}
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
                              {domainInfo?.code} ({ind.ponderacion})
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
                      </div>

                      {/* Bottom Performance Metrics & Action Button */}
                      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
                          <div>
                            <span style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Meta MINSAL</span>
                            <span style={{ fontWeight: 700, color: '#1e293b' }}>{ind.target}</span>
                          </div>
                          <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '16px' }}>
                            <span style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Resultado YTD</span>
                            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>
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

        {/* TAB 2: ORIENTACIONES TÉCNICAS MINSAL COMPENDIO */}
        {activeTab === 'orientaciones' && (
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <FileText size={28} color="#0d9488" />
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Orientaciones Técnicas COMGES 2026 - MINSAL</h2>
              </div>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, maxWidth: '900px' }}>
                Compendio conceptual y metodológico normado por la Subsecretaría de Redes Asistenciales del Ministerio de Salud para la evaluación de los 6 Compromisos de Gestión institucionales en el Hospital de Villarrica.
              </p>
            </div>

            {/* General Evaluation Framework Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <div style={{ padding: '16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px' }}>
                <h4 style={{ fontWeight: 800, color: '#166534', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={16} color="#166534" /> Ponderación Global (100%)
                </h4>
                <p style={{ fontSize: '12px', color: '#166534', marginTop: '6px', lineHeight: 1.5 }}>
                  Los 6 Compromisos de Gestión agrupan los 23 indicadores normados. Cada compromiso posee una ponderación fija dentro de la evaluación semestral y anual del establecimiento.
                </p>
              </div>

              <div style={{ padding: '16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px' }}>
                <h4 style={{ fontWeight: 800, color: '#1e40af', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={16} color="#1e40af" /> Cortes de Evaluación
                </h4>
                <p style={{ fontSize: '12px', color: '#1e40af', marginTop: '6px', lineHeight: 1.5 }}>
                  Corte 1 (Primer Semestre - Julio) y Corte 2 (Segundo Semestre - Enero siguiente). Se aplican tablas de sensibilidad y descuentos por requisitos no cumplidos.
                </p>
              </div>

              <div style={{ padding: '16px', background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '12px' }}>
                <h4 style={{ fontWeight: 800, color: '#6b21a8', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileSpreadsheet size={16} color="#6b21a8" /> Registro y Fuentes
                </h4>
                <p style={{ fontSize: '12px', color: '#6b21a8', marginTop: '6px', lineHeight: 1.5 }}>
                  Las fuentes de datos validadas son el Sistema SIGGES, SIGTE, REM-A08/A27, Ficha Clínica Electrónica (RCE) y planillas institucionales de control de gestión.
                </p>
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
                          Ponderación: {domain.weight}
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

        {/* TAB 3: RESUMEN EJECUTIVO POR DOMINIOS */}
        {activeTab === 'summary' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {COMGES_DOMAINS.map((d) => {
              const inds = COMGES_INDICATORS.filter(i => i.domainId === d.id);
              const cumpleCount = inds.filter(i => i.summaryYTD?.status === 'Cumple').length;
              const noCumpleCount = inds.filter(i => i.summaryYTD?.status === 'No Cumple').length;
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
                      <span style={{ color: '#059669', fontWeight: 700 }}>{cumpleCount} Cumplen</span>
                    </div>
                    <div style={{ width: '100%', background: '#e2e8f0', borderRadius: '9999px', height: '8px', overflow: 'hidden', display: 'flex' }}>
                      <div
                        style={{ width: `${inds.length > 0 ? (cumpleCount / inds.length) * 100 : 0}%`, background: '#10b981', height: '100%' }}
                      ></div>
                      <div
                        style={{ width: `${inds.length > 0 ? (noCumpleCount / inds.length) * 100 : 0}%`, background: '#f43f5e', height: '100%' }}
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
                    <span style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#e2e8f0', fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px' }}>
                      Ponderación: {selectedIndicator.ponderacion}
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

                      {selectedIndicator.monthlyData && selectedIndicator.monthlyData.length > 0 ? (
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
                      ) : (
                        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                          <Info size={32} color="#94a3b8" style={{ margin: '0 auto 8px auto' }} />
                          <p style={{ fontSize: '13px', color: '#475569' }}>
                            Este indicador se evalúa mediante entrega semestral de respaldos / pauta de cotejo. No presenta desglose numérico mensual en la planilla de cálculo.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Notice for Monthly Updates */}
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '12px', fontSize: '13px', color: '#166534', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <RefreshCw size={20} color="#166534" style={{ marginTop: '2px', shrink: 0 }} />
                      <div>
                        <h5 style={{ fontWeight: 800, color: '#14532d', marginBottom: '2px' }}>Actualizaciones Mensuales de Base</h5>
                        <p style={{ lineHeight: 1.5 }}>
                          Al momento de cargar un nuevo archivo de base mensual actualizado (ej. Julio, Agosto), este módulo reflejará automáticamente los nuevos numeradores, denominadores y resultados acumulados sin alterar las definiciones técnicas del MINSAL.
                        </p>
                      </div>
                    </div>
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
