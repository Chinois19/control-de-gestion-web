import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Search, Target, Users, Clock, FileText, CheckCircle2, 
  AlertCircle, AlertTriangle, ShieldCheck, Activity, TrendingUp, 
  ChevronRight, X, BarChart2, Filter, Building2, Stethoscope, RefreshCw, Award
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, ReferenceLine, ReferenceArea
} from 'recharts';
import { LEY18834_META, LEY18834_INDICATORS } from '../data/ley18834Data';

export default function HealthGoalsLey18834({ onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState('monthly');

  // Filter indicators
  const filteredIndicators = useMemo(() => {
    return LEY18834_INDICATORS.filter(ind => {
      // Search query
      const query = searchQuery.toLowerCase().trim();
      const searchMatch = !query || 
        ind.name.toLowerCase().includes(query) ||
        ind.code.toLowerCase().includes(query) ||
        ind.deptCode.toLowerCase().includes(query) ||
        (ind.definition && ind.definition.toLowerCase().includes(query));

      // Status filter
      let statusMatch = true;
      if (selectedStatus === 'cumple') statusMatch = ind.summaryYTD.status === 'Cumple';
      else if (selectedStatus === 'riesgo') statusMatch = ind.summaryYTD.status === 'En Riesgo';
      else if (selectedStatus === 'nocumple') statusMatch = ind.summaryYTD.status === 'No Cumple';

      return searchMatch && statusMatch;
    });
  }, [searchQuery, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = LEY18834_INDICATORS.length;
    const cumple = LEY18834_INDICATORS.filter(i => i.summaryYTD.status === 'Cumple').length;
    const enRiesgo = LEY18834_INDICATORS.filter(i => i.summaryYTD.status === 'En Riesgo').length;
    const noCumple = LEY18834_INDICATORS.filter(i => i.summaryYTD.status === 'No Cumple').length;
    const totalScoreObtained = LEY18834_INDICATORS.reduce((acc, curr) => acc + (curr.summaryYTD.scoreObtained || 0), 0);

    return { total, cumple, enRiesgo, noCumple, totalScoreObtained };
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Cumple':
        return <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12} /> Cumple</span>;
      case 'En Riesgo':
        return <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={12} /> En Riesgo</span>;
      case 'No Cumple':
        return <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12} /> No Cumple</span>;
      default:
        return <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Pendiente</span>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px 32px 60px 32px', color: '#0f172a', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <button 
          onClick={onBack} 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: '#ffffff', 
            border: '1px solid #cbd5e1', 
            padding: '10px 18px', 
            borderRadius: '12px', 
            fontSize: '13px', 
            fontWeight: 700, 
            color: '#334155', 
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          <ArrowLeft size={16} /> Volver al Menú Principal
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ background: '#dbeafe', color: '#1e40af', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building2 size={14} /> Hospital de Villarrica 2026
          </span>
          <span style={{ background: '#f0fdf4', color: '#166534', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, border: '1px solid #bbf7d0' }}>
            Res. Exenta N° 649 MINSAL
          </span>
        </div>
      </div>

      {/* Main Title Card */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '20px', padding: '28px 32px', color: '#ffffff', marginBottom: '28px', boxShadow: '0 10px 25px -5px rgba(15,23,42,0.25)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-20px', bottom: '-30px', opacity: 0.08 }}>
          <Award size={240} color="#ffffff" />
        </div>
        <div style={{ maxWidth: '850px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ background: 'rgba(59,130,246,0.2)', color: '#93c5fd', border: '1px solid rgba(147,197,253,0.3)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Ley N° 18.834 (Estatuto Administrativo)
            </span>
            <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>•</span>
            <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>Evaluación Acumulada a Mayo 2026</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', margin: 0, tracking: '-0.5px', lineHeight: 1.2 }}>
            Metas Sanitarias Ley N° 18.834 — Año 2026
          </h1>
          <p style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '10px', lineHeight: 1.6 }}>
            Monitoreo y evaluación del cumplimiento de las 5 metas institucionales reguladas por la <strong>Res. Exenta N° 649 (MINSAL 2026)</strong> para los funcionarios/as del Hospital de Villarrica.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>Total Metas Reguladas</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>{stats.total}</span>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Metas Res. 649</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #bbf7d0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534', display: 'block', marginBottom: '6px' }}>Metas Cumplidas</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#15803d' }}>{stats.cumple}</span>
            <span style={{ fontSize: '12px', color: '#166534', fontWeight: 700 }}>({((stats.cumple / stats.total) * 100).toFixed(0)}%)</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #fecaca', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#991b1b', display: 'block', marginBottom: '6px' }}>Metas En Riesgo / No Cumplidas</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#dc2626' }}>{stats.noCumple + stats.enRiesgo}</span>
            <span style={{ fontSize: '12px', color: '#991b1b', fontWeight: 700 }}>({stats.noCumple} No Cumple)</span>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '20px', borderRadius: '16px', color: '#ffffff', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#a7f3d0', display: 'block', marginBottom: '6px' }}>Puntaje Acumulado Ley 18.834</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: 900, color: '#ffffff' }}>{stats.totalScoreObtained.toFixed(1)}%</span>
            <span style={{ fontSize: '13px', color: '#ecfdf5', fontWeight: 700 }}>/ 100.0% Puntos</span>
          </div>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
        
        {/* Search box */}
        <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Buscar por código, nombre o definición de la meta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 42px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', color: '#0f172a', outline: 'none', background: '#f8fafc' }}
          />
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginRight: '4px' }}>Estado:</span>
          {[
            { id: 'todos', label: 'Todas' },
            { id: 'cumple', label: 'Cumple' },
            { id: 'riesgo', label: 'En Riesgo' },
            { id: 'nocumple', label: 'No Cumple' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedStatus(f.id)}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                border: selectedStatus === f.id ? '1px solid #2563eb' : '1px solid #e2e8f0',
                background: selectedStatus === f.id ? '#eff6ff' : '#ffffff',
                color: selectedStatus === f.id ? '#1d4ed8' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Indicators Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        {filteredIndicators.map((ind) => {
          const validMonthly = (ind.monthlyData || []).filter(d => d.result !== null && d.result !== undefined);
          return (
            <motion.div
              key={ind.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <div>
                {/* Header card */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: '#0f172a', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, fontFamily: 'monospace' }}>
                      {ind.code}
                    </span>
                    <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                      {ind.deptCode}
                    </span>
                  </div>
                  <span style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                    Ponderación: {ind.weight}
                  </span>
                </div>

                {/* Title & Definition */}
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', lineHeight: 1.4, marginBottom: '8px' }}>
                  {ind.name}
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {ind.definition}
                </p>

                {/* Main Result & Target */}
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Resultado Acumulado</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a' }}>{ind.summaryYTD.resultFormatted}</span>
                      {getStatusBadge(ind.summaryYTD.status)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, display: 'block' }}>Meta MINSAL</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#ef4444', fontFamily: 'monospace' }}>{ind.target}</span>
                  </div>
                </div>

                {/* Monthly Line Chart Preview */}
                {(() => {
                  const targetMatch = (ind.target || '').match(/[\d\.]+/);
                  const targetNum = targetMatch ? parseFloat(targetMatch[0]) : null;
                  const isLessTarget = (ind.target || '').includes('<') || (ind.target || '').includes('≤');
                  const vals = validMonthly.map(d => d.result);
                  let yDomain = ['auto', 'auto'];
                  if (vals.length > 0) {
                    let min = Math.min(...vals);
                    let max = Math.max(...vals);
                    if (targetNum !== null && !isNaN(targetNum)) {
                      min = Math.min(min, targetNum);
                      max = Math.max(max, targetNum);
                    }
                    const pad = Math.max((max - min) * 0.2, 2);
                    yDomain = [Math.max(0, Math.floor(min - pad)), Math.ceil(max + pad)];
                  }
                  return validMonthly.length > 0 ? (
                    <div style={{ height: '70px', marginTop: '12px', marginBottom: '8px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={validMonthly} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                          <XAxis dataKey="month" hide />
                          <YAxis hide domain={yDomain} />
                          {targetNum !== null && Array.isArray(yDomain) && typeof yDomain[0] === 'number' && (
                            <ReferenceArea
                              y1={isLessTarget ? yDomain[0] : targetNum}
                              y2={isLessTarget ? targetNum : yDomain[1]}
                              fill="#10b981"
                              fillOpacity={0.08}
                              stroke="none"
                            />
                          )}
                          {targetNum !== null && (
                            <ReferenceLine y={targetNum} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1.5} />
                          )}
                          <Line type="monotone" dataKey="result" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: '#2563eb' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', textAlign: 'center', fontSize: '11.5px', color: '#64748b', fontWeight: 600, margin: '12px 0 8px 0' }}>
                      Evaluación por Pauta / Auditado Semestral
                    </div>
                  );
                })()}
              </div>

              {/* Card Footer Button */}
              <button
                onClick={() => {
                  setSelectedIndicator(ind);
                  setActiveModalTab('formula');
                }}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  padding: '10px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'background 0.15s ease'
                }}
              >
                <FileText size={15} color="#2563eb" />
                Ver Ficha Técnica y Evolución (Res. 649)
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* DETAILED FICHA TÉCNICA & MONTHLY DATA MODAL */}
      <AnimatePresence>
        {selectedIndicator && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '850px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            >
              {/* Modal Header */}
              <div style={{ padding: '20px 24px', background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ background: '#2563eb', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800, fontFamily: 'monospace' }}>
                      {selectedIndicator.code}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 700 }}>
                      Ley N° 18.834 • Ponderación: {selectedIndicator.weight}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    {selectedIndicator.name}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedIndicator(null)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#ffffff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Sub-Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '0 24px' }}>
                <button
                  onClick={() => setActiveModalTab('formula')}
                  style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 700, color: activeModalTab === 'formula' ? '#2563eb' : '#64748b', borderBottom: activeModalTab === 'formula' ? '2px solid #2563eb' : 'none', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FileText size={16} /> Ficha Técnica (Res. Exenta N° 649)
                </button>
                <button
                  onClick={() => setActiveModalTab('monthly')}
                  style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 700, color: activeModalTab === 'monthly' ? '#2563eb' : '#64748b', borderBottom: activeModalTab === 'monthly' ? '2px solid #2563eb' : 'none', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <TrendingUp size={16} /> Desglose Mensual 2026
                </button>
              </div>

              {/* Modal Content */}
              <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                {activeModalTab === 'formula' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Definition */}
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Definición del Indicador</h4>
                      <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6, margin: 0 }}>{selectedIndicator.definition}</p>
                    </div>

                    {/* Objective */}
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Objetivo Institucional</h4>
                      <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6, margin: 0 }}>{selectedIndicator.objective}</p>
                    </div>

                    {/* Formula MINSAL */}
                    <div style={{ background: '#eff6ff', padding: '18px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1e40af', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fórmula de Cálculo Oficial MINSAL</h4>
                      <div style={{ fontSize: '13px', color: '#1e3a8a', lineHeight: 1.6 }}>
                        <p style={{ margin: '0 0 6px 0' }}><strong>Numerador:</strong> {selectedIndicator.formula.numerator}</p>
                        <p style={{ margin: '0 0 6px 0' }}><strong>Denominador:</strong> {selectedIndicator.formula.denominator}</p>
                        <p style={{ margin: '8px 0 0 0', padding: '8px 12px', background: '#ffffff', borderRadius: '8px', fontFamily: 'monospace', fontWeight: 700, color: '#2563eb', border: '1px solid #93c5fd', display: 'inline-block' }}>
                          Fórmula: {selectedIndicator.formula.expression}
                        </p>
                      </div>
                    </div>

                    {/* Rules & Meta */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Meta Exigida MINSAL</h4>
                        <span style={{ fontSize: '18px', fontWeight: 900, color: '#ef4444', fontFamily: 'monospace' }}>{selectedIndicator.target}</span>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Fuente de Información</h4>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{selectedIndicator.dataSource}</span>
                      </div>
                    </div>

                    {/* Evaluation Rules */}
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reglas de Evaluación (Res. Exenta N° 649)</h4>
                      <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6, margin: 0 }}>{selectedIndicator.evalRules}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Recharts Line Chart */}
                    <div style={{ marginBottom: '24px', background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Evolución Mensual 2026</h4>
                        <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 800, background: '#fef2f2', padding: '3px 8px', borderRadius: '4px', border: '1px solid #fecaca', fontFamily: 'monospace' }}>
                          Meta MINSAL: {selectedIndicator.target}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '220px' }}>
                        {(() => {
                          const validMonthly = (selectedIndicator.monthlyData || []).filter(d => d.result !== null && d.result !== undefined);
                          const targetMatch = (selectedIndicator.target || '').match(/[\d\.]+/);
                          const targetNum = targetMatch ? parseFloat(targetMatch[0]) : null;
                          const isLessTarget = (selectedIndicator.target || '').includes('<') || (selectedIndicator.target || '').includes('≤');
                          const vals = validMonthly.map(d => d.result);
                          let yDomain = ['auto', 'auto'];
                          if (vals.length > 0) {
                            let min = Math.min(...vals);
                            let max = Math.max(...vals);
                            if (targetNum !== null && !isNaN(targetNum)) {
                              min = Math.min(min, targetNum);
                              max = Math.max(max, targetNum);
                            }
                            const pad = Math.max((max - min) * 0.2, 2);
                            yDomain = [Math.max(0, Math.floor(min - pad)), Math.ceil(max + pad)];
                          }
                          return (
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={validMonthly} margin={{ top: 14, right: 14, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={yDomain} />
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
                                      return (
                                        <div style={{ background: '#0f172a', color: '#ffffff', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                                          <p style={{ fontWeight: 800, color: '#60a5fa', margin: '0 0 2px 0' }}>{data.month} 2026</p>
                                          <p style={{ fontWeight: 700, margin: 0 }}>Resultado: {data.resultFormatted}</p>
                                          {data.numerator > 0 && <p style={{ fontSize: '11px', color: '#cbd5e1', margin: '2px 0 0 0' }}>({data.numerator} / {data.denominator})</p>}
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                {targetNum !== null && (
                                  <ReferenceLine y={targetNum} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: `Meta ${selectedIndicator.target}`, fill: '#ef4444', fontSize: 11, fontWeight: 800, position: 'insideTopRight' }} />
                                )}
                                <Line type="monotone" dataKey="result" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} />
                              </LineChart>
                            </ResponsiveContainer>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Monthly Performance Table */}
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                            <th style={{ padding: '12px 16px' }}>Mes</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center' }}>Numerador</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center' }}>Denominador</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center' }}>Resultado</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center' }}>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedIndicator.monthlyData.map((row, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>{row.month}</td>
                              <td style={{ padding: '12px 16px', textAlign: 'center', color: '#475569', fontFamily: 'monospace' }}>{row.numerator > 0 ? row.numerator.toLocaleString() : '-'}</td>
                              <td style={{ padding: '12px 16px', textAlign: 'center', color: '#475569', fontFamily: 'monospace' }}>{row.denominator > 0 ? row.denominator.toLocaleString() : '-'}</td>
                              <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 800, color: '#0f172a' }}>{row.resultFormatted}</td>
                              <td style={{ padding: '12px 16px', textAlign: 'center' }}>{getStatusBadge(row.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
