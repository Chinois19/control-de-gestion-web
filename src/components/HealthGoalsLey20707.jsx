import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Search, Target, Users, Clock, FileText, CheckCircle2, 
  AlertCircle, AlertTriangle, ShieldCheck, Activity, TrendingUp, 
  ChevronRight, X, BarChart2, Filter, Building2, Stethoscope, RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, ReferenceLine
} from 'recharts';
import { LEY20707_META, LEY20707_UNITS, LEY20707_INDICATORS } from '../data/ley20707Data';

const HealthGoalsLey20707 = ({ onBack }) => {
  const [selectedUnit, setSelectedUnit] = useState('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState('monthly');

  // Filter indicators
  const filteredIndicators = useMemo(() => {
    return LEY20707_INDICATORS.filter(ind => {
      // Unit filter
      const unitMatch = selectedUnit === 'todas' || 
        (selectedUnit === 'ueh' && ind.dept.includes('EMERGENCIA')) ||
        (selectedUnit === 'pabellon' && ind.dept.includes('PABELLON')) ||
        (selectedUnit === 'pediatria' && ind.dept.includes('PEDIATRICA')) ||
        (selectedUnit === 'upc' && ind.dept.includes('CRITICO')) ||
        (selectedUnit === 'ginecologia' && ind.dept.includes('GINECOLOGIA'));

      // Search query
      const query = searchQuery.toLowerCase().trim();
      const searchMatch = !query || 
        ind.name.toLowerCase().includes(query) ||
        ind.code.toLowerCase().includes(query) ||
        ind.dept.toLowerCase().includes(query) ||
        (ind.formula && ind.formula.toLowerCase().includes(query));

      // Status filter
      let statusMatch = true;
      if (selectedStatus === 'cumple') statusMatch = ind.summaryYTD.status === 'Cumple';
      else if (selectedStatus === 'riesgo') statusMatch = ind.summaryYTD.status === 'En Riesgo';
      else if (selectedStatus === 'nocumple') statusMatch = ind.summaryYTD.status === 'No Cumple';
      else if (selectedStatus === 'semestral') statusMatch = ind.summaryYTD.status === 'Sin Dato' || ind.summaryYTD.status === 'En Proceso';

      return unitMatch && searchMatch && statusMatch;
    });
  }, [selectedUnit, searchQuery, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = LEY20707_INDICATORS.length;
    const cumple = LEY20707_INDICATORS.filter(i => i.summaryYTD.status === 'Cumple').length;
    const enRiesgo = LEY20707_INDICATORS.filter(i => i.summaryYTD.status === 'En Riesgo').length;
    const noCumple = LEY20707_INDICATORS.filter(i => i.summaryYTD.status === 'No Cumple').length;
    const semestral = LEY20707_INDICATORS.filter(i => i.summaryYTD.status === 'Sin Dato' || i.summaryYTD.status === 'En Proceso').length;

    return { total, cumple, enRiesgo, noCumple, semestral };
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
        return <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Auditado Semestral</span>;
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
          <span style={{ background: '#0284c7', color: '#ffffff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.5px' }}>
            LEY 20.707 - AÑO 2026
          </span>
          <span style={{ background: '#f1f5f9', color: '#475569', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
            {LEY20707_META.hospital}
          </span>
        </div>
      </div>

      {/* Hero Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '24px', padding: '32px 40px', color: '#ffffff', marginBottom: '32px', boxShadow: '0 20px 40px rgba(15,23,42,0.15)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '900px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            <Stethoscope size={16} /> Ley de Metas Sanitarias Médicas y Odontológicas
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>
            Tablero Oficial Metas Sanitarias Ley 20.707 (2026)
          </h1>
          <p style={{ fontSize: '15px', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
            Monitoreo y evaluación continua de los indicadores de gestión clínica y de calidad asistencial aplicables a Profesionales Médicos, Cirujano-Dentistas, Químico-Farmacéuticos y Bioquímicos del Hospital de Villarrica.
          </p>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Total Indicadores</div>
          <div style={{ fontSize: '30px', fontWeight: 900, color: '#0f172a' }}>{stats.total}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Distribuidos por Unidad Clínica</div>
        </div>
        <div style={{ background: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: '4px' }}>Cumplen Meta</div>
          <div style={{ fontSize: '30px', fontWeight: 900, color: '#16a34a' }}>{stats.cumple}</div>
          <div style={{ fontSize: '11px', color: '#166534', marginTop: '2px' }}>En evaluación mensual</div>
        </div>
        <div style={{ background: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', marginBottom: '4px' }}>En Riesgo / No Cumple</div>
          <div style={{ fontSize: '30px', fontWeight: 900, color: '#dc2626' }}>{stats.enRiesgo + stats.noCumple}</div>
          <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '2px' }}>Requieren ajuste clínico</div>
        </div>
        <div style={{ background: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Pauta Semestral</div>
          <div style={{ fontSize: '30px', fontWeight: 900, color: '#475569' }}>{stats.semestral}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Auditoría técnica en proceso</div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div style={{ background: '#ffffff', padding: '20px 24px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '28px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
        
        {/* Search Bar */}
        <div style={{ position: 'relative', minWidth: '320px', flex: 1 }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, código o unidad clínica..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 42px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '13.5px', outline: 'none', background: '#f8fafc' }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          {/* Unit Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={16} color="#64748b" />
            <select 
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, background: '#ffffff', cursor: 'pointer', outline: 'none' }}
            >
              {LEY20707_UNITS.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
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
              onClick={() => setSelectedStatus('semestral')}
              style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 800, cursor: 'pointer', background: selectedStatus === 'semestral' ? '#ffffff' : 'transparent', color: selectedStatus === 'semestral' ? '#0f172a' : '#64748b', boxShadow: selectedStatus === 'semestral' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}
            >
              Auditoría ({stats.semestral})
            </button>
          </div>
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
              onClick={() => { setSelectedIndicator(ind); setActiveModalTab('monthly'); }}
              style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
            >
              <div>
                {/* Header Badge & Code */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ background: ind.deptInfo.color + '15', color: ind.deptInfo.color, padding: '4px 12px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 800 }}>
                    {ind.deptInfo.code}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0', lineHeight: 1.4, height: '42px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {ind.code}: {ind.name}
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
                {validMonthly.length > 0 ? (
                  <div style={{ height: '70px', marginTop: '12px', marginBottom: '8px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={validMonthly}>
                        <Line type="monotone" dataKey="result" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3, fill: '#3b82f6' }} />
                        <XAxis dataKey="month" hide />
                        <YAxis hide domain={['auto', 'auto']} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', textAlign: 'center', fontSize: '11.5px', color: '#64748b', fontWeight: 600, margin: '12px 0 8px 0' }}>
                    Evaluación por Pauta / Auditoría Semestral
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '10px' }}>
                {getStatusBadge(ind.summaryYTD.status)}
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
              <div style={{ padding: '24px 32px', background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ background: '#38bdf8', color: '#0f172a', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 900 }}>
                      {selectedIndicator.dept}
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
                  <FileText size={18} color="#0284c7" /> Desglose Mensual Ley 20.707 (Año 2026)
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

export default HealthGoalsLey20707;
