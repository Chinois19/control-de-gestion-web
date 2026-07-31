import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Search, Target, Users, Clock, FileText, CheckCircle2, 
  AlertCircle, AlertTriangle, ShieldCheck, Activity, TrendingUp, 
  ChevronRight, X, BarChart2, Filter, Stethoscope
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, ReferenceLine
} from 'recharts';
import { LEY19664_META, LEY19664_INDICATORS } from '../data/ley19664Data';

const HealthGoalsLey19664 = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [selectedIndicator, setSelectedIndicator] = useState(null);

  // Filter indicators
  const filteredIndicators = useMemo(() => {
    return LEY19664_INDICATORS.filter(ind => {
      // Search query
      const query = searchQuery.toLowerCase().trim();
      const searchMatch = !query || 
        ind.name.toLowerCase().includes(query) ||
        ind.code.toLowerCase().includes(query) ||
        (ind.formula && ind.formula.toLowerCase().includes(query));

      // Status filter
      let statusMatch = true;
      if (selectedStatus === 'cumple') statusMatch = ind.summaryYTD.status === 'Cumple';
      else if (selectedStatus === 'nocumple') statusMatch = ind.summaryYTD.status === 'No Cumple';

      return searchMatch && statusMatch;
    });
  }, [searchQuery, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = LEY19664_INDICATORS.length;
    const cumple = LEY19664_INDICATORS.filter(i => i.summaryYTD.status === 'Cumple').length;
    const noCumple = LEY19664_INDICATORS.filter(i => i.summaryYTD.status === 'No Cumple').length;

    return { total, cumple, noCumple };
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Cumple':
        return <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12} /> Cumple</span>;
      case 'No Cumple':
        return <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12} /> No Cumple</span>;
      default:
        return <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> En Proceso</span>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px 32px 60px 32px', color: '#0f172a', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <button 
          onClick={onBack} 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #e2e8f0', padding: '10px 18px', borderRadius: '12px', color: '#0f172a', fontWeight: 700, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}
        >
          <ArrowLeft size={18} /> Volver al Inicio
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ background: '#16a34a', color: '#ffffff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.5px' }}>
            LEY 19.664 - 2026 FORMATIVO
          </span>
          <span style={{ background: '#f1f5f9', color: '#475569', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
            {LEY19664_META.hospital}
          </span>
        </div>
      </div>

      {/* Hero Banner */}
      <div style={{ background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)', borderRadius: '24px', padding: '32px 40px', color: '#ffffff', marginBottom: '32px', boxShadow: '0 20px 40px rgba(4,120,87,0.2)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '900px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a7f3d0', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            <Stethoscope size={16} /> Ley de Metas Sanitarias Profesionales de la Salud
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>
            Tablero Oficial Metas Sanitarias Ley 19.664 (2026 Formativo)
          </h1>
          <p style={{ fontSize: '15px', color: '#d1fae5', margin: 0, lineHeight: 1.6 }}>
            Monitoreo oficial de metas de gestión sanitaria para el personal de profesionales de la salud regidos por la Ley N° 19.664 en el Hospital de Villarrica (Fuente: RESULTADO METAS 19664 2026 formativo.xlsx).
          </p>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Total Indicadores</div>
          <div style={{ fontSize: '30px', fontWeight: 900, color: '#0f172a' }}>{stats.total}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Evaluados en 2026 Formativo</div>
        </div>
        <div style={{ background: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: '4px' }}>Cumplen Meta</div>
          <div style={{ fontSize: '30px', fontWeight: 900, color: '#16a34a' }}>{stats.cumple}</div>
          <div style={{ fontSize: '11px', color: '#166534', marginTop: '2px' }}>Desempeño óptimo</div>
        </div>
        <div style={{ background: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', marginBottom: '4px' }}>No Cumplen Meta</div>
          <div style={{ fontSize: '30px', fontWeight: 900, color: '#dc2626' }}>{stats.noCumple}</div>
          <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '2px' }}>Requieren gestión de mejora</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{ background: '#ffffff', padding: '20px 24px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '28px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
        
        {/* Search Bar */}
        <div style={{ position: 'relative', minWidth: '320px', flex: 1 }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Buscar por código, nombre o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 42px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '13.5px', outline: 'none', background: '#f8fafc' }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
          <button 
            onClick={() => setSelectedStatus('todos')}
            style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 800, cursor: 'pointer', background: selectedStatus === 'todos' ? '#ffffff' : 'transparent', color: selectedStatus === 'todos' ? '#0f172a' : '#64748b', boxShadow: selectedStatus === 'todos' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}
          >
            Todos ({stats.total})
          </button>
          <button 
            onClick={() => setSelectedStatus('cumple')}
            style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 800, cursor: 'pointer', background: selectedStatus === 'cumple' ? '#ffffff' : 'transparent', color: selectedStatus === 'cumple' ? '#166534' : '#64748b', boxShadow: selectedStatus === 'cumple' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}
          >
            Cumple ({stats.cumple})
          </button>
          <button 
            onClick={() => setSelectedStatus('nocumple')}
            style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 800, cursor: 'pointer', background: selectedStatus === 'nocumple' ? '#ffffff' : 'transparent', color: selectedStatus === 'nocumple' ? '#991b1b' : '#64748b', boxShadow: selectedStatus === 'nocumple' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}
          >
            No Cumple ({stats.noCumple})
          </button>
        </div>
      </div>

      {/* Indicator Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
        {filteredIndicators.map(ind => {
          const validMonthly = ind.monthlyData.filter(m => m.result !== null && m.result !== undefined);

          return (
            <motion.div 
              key={ind.id}
              whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
              onClick={() => setSelectedIndicator(ind)}
              style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
            >
              <div>
                {/* Header Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ background: '#04785715', color: '#047857', padding: '4px 12px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 800 }}>
                    {ind.code}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0', lineHeight: 1.4, height: '42px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {ind.name}
                </h3>

                {/* Result KPI Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', margin: '14px 0' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, display: 'block' }}>Resultado Acumulado</span>
                    <span style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>{ind.summaryYTD.resultFormatted}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, display: 'block' }}>Meta 2026</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>{ind.target}</span>
                  </div>
                </div>

                {/* Monthly Line Chart Preview */}
                {(() => {
                  const targetMatch = (ind.target || '').match(/[\d\.]+/);
                  const targetNum = targetMatch ? parseFloat(targetMatch[0]) : null;
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
                          {targetNum !== null && (
                            <ReferenceLine y={targetNum} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1.5} />
                          )}
                          <Line type="monotone" dataKey="result" stroke="#047857" strokeWidth={2.5} dot={{ r: 3, fill: '#047857' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Card Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '10px' }}>
                {getStatusBadge(ind.summaryYTD.status)}
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#047857', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Ver Detalle <ChevronRight size={14} />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed Modal Dialog */}
      <AnimatePresence>
        {selectedIndicator && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '850px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            >
              {/* Modal Header */}
              <div style={{ padding: '24px 32px', background: '#064e3b', color: '#ffffff', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ background: '#34d399', color: '#064e3b', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 900 }}>
                      LEY 19.664 (FORMATIVO)
                    </span>
                  </div>
                  <h2 style={{ fontSize: '20px', fontWeight: 900, margin: 0, lineHeight: 1.3 }}>
                    {selectedIndicator.code}: {selectedIndicator.name}
                  </h2>
                </div>
                <button 
                  onClick={() => setSelectedIndicator(null)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '28px 32px', overflowY: 'auto', flex: 1 }}>
                
                {/* Information Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, display: 'block' }}>Meta 2026</span>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>{selectedIndicator.target}</span>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, display: 'block' }}>Resultado Acumulado</span>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>{selectedIndicator.summaryYTD.resultFormatted}</span>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, display: 'block' }}>Estado de Cumplimiento</span>
                    <div style={{ marginTop: '4px' }}>{getStatusBadge(selectedIndicator.summaryYTD.status)}</div>
                  </div>
                </div>

                {/* Formula */}
                {selectedIndicator.formula && (
                  <div style={{ background: '#f1f5f9', padding: '18px 20px', borderRadius: '14px', marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#334155', margin: '0 0 6px 0', textTransform: 'uppercase' }}>Fórmula de Cálculo</h4>
                    <p style={{ fontSize: '13px', color: '#0f172a', margin: 0, fontFamily: 'monospace', lineHeight: 1.5 }}>
                      {selectedIndicator.formula}
                    </p>
                  </div>
                )}

                {/* Monthly Data Table */}
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} color="#047857" /> Desglose Mensual Ley 19.664 (Año 2026)
                </h4>

                {selectedIndicator.monthlyData && selectedIndicator.monthlyData.length > 0 ? (
                  <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '14px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 800 }}>Mes</th>
                          <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 800, textAlign: 'right' }}>Numerador</th>
                          <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 800, textAlign: 'right' }}>Denominador</th>
                          <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 800, textAlign: 'right' }}>Resultado</th>
                          <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 800, textAlign: 'center' }}>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedIndicator.monthlyData.map((row, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>{row.month}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace' }}>{row.numerator !== null ? row.numerator : '-'}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace' }}>{row.denominator !== null ? row.denominator : '-'}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>{row.resultFormatted}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>{getStatusBadge(row.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <Clock size={32} color="#64748b" style={{ margin: '0 auto 8px auto' }} />
                    <p style={{ fontSize: '13.5px', color: '#1e293b', fontWeight: 700, margin: 0 }}>
                      Este indicador se evalúa semestralmente mediante pauta auditada por el Servicio de Salud Araucanía Sur (SSAS) / MINSAL.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HealthGoalsLey19664;
