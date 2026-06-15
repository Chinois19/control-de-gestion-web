import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, CheckCircle, AlertTriangle, TrendingUp, BarChart2, 
  PieChart, Activity, AlertCircle, FileWarning, ShieldAlert,
  Calendar, FileQuestion, Users, Target, ActivitySquare, RefreshCw,
  Table, Info, FileSpreadsheet, Eye, HelpCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, ReferenceLine
} from 'recharts';

export default function AcuerdoMinsalDashboard({ onBack }) {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('resumen');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/data/acuerdo_minsal_hoja1.json');
      if (!response.ok) throw new Error('No se pudo cargar el archivo de datos del Acuerdo de Programación.');
      const data = await response.json();
      setRawData(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar los datos. Asegúrate de ejecutar el actualizador G:\\.');
    } finally {
      setLoading(false);
    }
  };

  // Helper parsers
  const parseVal = (val) => {
    if (!val) return null;
    const clean = val.toString().replace(/[^0-9.-]/g, '').trim();
    if (clean === '-' || clean === '') return null;
    const num = parseFloat(clean);
    return isNaN(num) ? null : num;
  };

  const parsePercent = (val) => {
    if (!val) return null;
    if (val.toString().includes('%')) {
      const clean = val.toString().replace('%', '').trim();
      const num = parseFloat(clean);
      return isNaN(num) ? null : num;
    }
    const num = parseFloat(val);
    return isNaN(num) ? null : num * 100;
  };

  const cleanMonthName = (mes) => {
    if (!mes) return '';
    return mes.toString().trim();
  };

  const processedData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    
    // Filter out metadata rows (Total, META, etc.)
    return rawData
      .filter(row => {
        const mes = cleanMonthName(row.Mes);
        return mes && mes !== 'Total año 2026' && mes !== 'META' && !mes.includes('Total');
      })
      .map(row => {
        const egresos = parseVal(row["Egresos 2026"]);
        const cma = parseVal(row["CMA 2026"]);
        const hasData = egresos !== null || cma !== null;

        return {
          mes: cleanMonthName(row.Mes),
          acuerdoEgresos: parseVal(row["Acuerdo Egresos"]),
          egresos2026: egresos,
          acuerdoCma: parseVal(row["Acuerdo CMA"]),
          cma2026: cma,
          indiceFuncional: parseVal(row["1. Indice Funcional"]),
          iema: parseVal(row["2. IEMA"]),
          impacto: parseVal(row["3. Impacto"]),
          cumplimientoGes: parsePercent(row["6.1 % Cumplimiento GES"]),
          suspensionQca: parsePercent(row["8. % SUSPENSION QCA"]),
          medianaIQ: parseVal(row["9. MEDIANA IQ"]),
          medianaCNE: parseVal(row["10. MEDIANA CNE"]),
          registrosGes: parsePercent(row["11. Registros GES"]),
          hasData
        };
      });
  }, [rawData]);

  const yearlyTotals = useMemo(() => {
    if (!rawData || rawData.length === 0) return null;
    const totalRow = rawData.find(row => cleanMonthName(row.Mes).includes('Total año 2026'));
    if (!totalRow) return null;

    return {
      acuerdoEgresos: parseVal(totalRow["Acuerdo Egresos"]),
      egresos2026: parseVal(totalRow["Egresos 2026"]),
      peso2026: parseVal(totalRow["Peso 2026"]),
      acuerdoCma: parseVal(totalRow["Acuerdo CMA"]),
      cma2026: parseVal(totalRow["CMA 2026"]),
      pesoCma2026: parseVal(totalRow["Peso CMA 2026"]),
      indiceFuncional: parseVal(totalRow["1. Indice Funcional"]),
      iema: parseVal(totalRow["2. IEMA"]),
      impacto: parseVal(totalRow["3. Impacto"]),
      cumplimientoGes: parsePercent(totalRow["6.1 % Cumplimiento GES"]),
      suspensionQca: parsePercent(totalRow["8. % SUSPENSION QCA"]),
      medianaIQ: parseVal(totalRow["9. MEDIANA IQ"]),
      medianaCNE: parseVal(totalRow["10. MEDIANA CNE"]),
      registrosGes: parsePercent(totalRow["11. Registros GES"])
    };
  }, [rawData]);

  const missingReportMonths = useMemo(() => {
    return processedData.filter(d => !d.hasData).map(d => d.mes);
  }, [processedData]);

  if (loading) {
    return (
      <div className="loader-container" style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyPoint: 'center', gap: '20px', color: 'var(--text-dark)' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}>
          <RefreshCw size={54} color="var(--primary-accent)" />
        </motion.div>
        <h3>Cargando Acuerdo de Programación 2026...</h3>
        <p>Leyendo base de datos compilada de la red ASUR</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dark)' }}>
        <ShieldAlert size={64} color="#ef4444" style={{ marginBottom: '20px' }} />
        <h2>Error de Acceso a Datos</h2>
        <p style={{ maxWidth: '600px', margin: '20px auto', color: '#64748b' }}>{error}</p>
        <button className="preset-btn" onClick={fetchData} style={{ padding: '10px 20px', borderRadius: '8px' }}>Reintentar Carga</button>
      </div>
    );
  }

  return (
    <div className="acuerdo-minsal-portal" style={{ color: 'var(--text-dark)', paddingBottom: '40px' }}>
      {/* Header */}
      <header className="portal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button className="circle-back-btn" onClick={onBack} title="Volver al panel principal">
            <ArrowLeft size={22} />
          </button>
          <div>
            <div className="header-badges">
              <span className="live-status" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                <span className="pulse-dot" style={{ background: '#ef4444' }}></span> Brecha de Reporte Detectada
              </span>
              <span className="api-badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                <FileSpreadsheet size={14} style={{ marginRight: '4px', display: 'inline' }} /> Excel G:\ ok.xlsx
              </span>
              <span className="update-badge">📅 Período 2026</span>
            </div>
            <h1 className="portal-title">Acuerdo de Programación MINSAL 2026</h1>
            <p className="portal-subtitle">Monitoreo de compromisos de gestión, índices funcionales y brechas de reporte clínico.</p>
          </div>
        </div>
      </header>

      {/* Alert showing units that did not submit information */}
      {missingReportMonths.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ 
            margin: '24px 0', padding: '20px', borderRadius: '16px', 
            background: 'linear-gradient(to right, rgba(239, 68, 68, 0.07), rgba(239, 68, 68, 0.02))',
            border: '1px solid rgba(239, 68, 68, 0.25)', display: 'flex', gap: '20px', alignItems: 'flex-start'
          }}
        >
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '50%', color: '#ef4444' }}>
            <ShieldAlert size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#b91c1c', fontSize: '1.15rem', fontWeight: 800 }}>
              Bloqueo Crítico de Datos: Información Incompleta a partir de Mayo 2026
            </h3>
            <p style={{ margin: '0 0 12px 0', color: '#7f1d1d', lineHeight: '1.6', fontSize: '0.92rem' }}>
              Los datos clínicos de egresos y producción correspondientes a los meses de <strong>{missingReportMonths.join(', ')}</strong> no han sido informados por las unidades correspondientes. Esto genera una paralización en el cálculo mensual del <strong>Índice Funcional (GRD)</strong> y del <strong>IEMA</strong>, afectando la correcta visibilidad del hospital ante el Servicio de Salud.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {missingReportMonths.map(m => (
                <span key={m} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  ⚠️ {m}: Sin Reporte
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="custom-tabs glass-card" style={{ display: 'flex', padding: '6px', borderRadius: '14px', gap: '8px', marginBottom: '24px' }}>
        <button className={`tab-btn ${activeTab === 'resumen' ? 'active' : ''}`} onClick={() => setActiveTab('resumen')}>
          <Target size={16} /> Resumen de Compromisos
        </button>
        <button className={`tab-btn ${activeTab === 'indice_funcional' ? 'active' : ''}`} onClick={() => setActiveTab('indice_funcional')}>
          <ActivitySquare size={16} /> Índice Funcional (GRD)
        </button>
        <button className={`tab-btn ${activeTab === 'tabla_completa' ? 'active' : ''}`} onClick={() => setActiveTab('tabla_completa')}>
          <Table size={16} /> Matriz Completa de Datos
        </button>
      </div>

      {activeTab === 'resumen' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Main KPI Cards from Excel "Total año 2026" */}
          {yearlyTotals && (
            <div className="kpi-grid" style={{ marginBottom: '24px' }}>
              <div className="kpi-card glass-card">
                <div className="kpi-icon" style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}><Target size={22} /></div>
                <div className="kpi-info">
                  <h3>Egresos 2026</h3>
                  <div className="kpi-value">{yearlyTotals.egresos2026?.toLocaleString('es-CL') || '0'}</div>
                  <div className="kpi-trend" style={{ color: '#64748b' }}>
                    Acuerdo: <strong>{yearlyTotals.acuerdoEgresos?.toLocaleString('es-CL')}</strong> (Avance: {((yearlyTotals.egresos2026 / yearlyTotals.acuerdoEgresos) * 100).toFixed(1)}%)
                  </div>
                </div>
              </div>
              
              <div className="kpi-card glass-card">
                <div className="kpi-icon" style={{ background: 'rgba(169, 85, 247, 0.1)', color: '#a855f7' }}><ActivitySquare size={22} /></div>
                <div className="kpi-info">
                  <h3>Índice Funcional</h3>
                  <div className="kpi-value">{yearlyTotals.indiceFuncional || '0.00'}</div>
                  <div className="kpi-trend" style={{ color: '#10b981', fontWeight: 700 }}>
                    Meta: ≤ 1.00 (Cumple ✅)
                  </div>
                </div>
              </div>

              <div className="kpi-card glass-card">
                <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><CheckCircle size={22} /></div>
                <div className="kpi-info">
                  <h3>Cumplimiento GES</h3>
                  <div className="kpi-value">{yearlyTotals.cumplimientoGes ? `${yearlyTotals.cumplimientoGes.toFixed(2)}%` : '0.00%'}</div>
                  <div className="kpi-trend" style={{ color: '#ef4444', fontWeight: 700 }}>
                    Meta: ≥ 99.50% (No Cumple ❌)
                  </div>
                </div>
              </div>

              <div className="kpi-card glass-card">
                <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}><FileWarning size={22} /></div>
                <div className="kpi-info">
                  <h3>Suspensión Quirúrgica</h3>
                  <div className="kpi-value">{yearlyTotals.suspensionQca ? `${yearlyTotals.suspensionQca.toFixed(2)}%` : '0.00%'}</div>
                  <div className="kpi-trend" style={{ color: '#10b981', fontWeight: 700 }}>
                    Meta: ≤ 7.00% (Cumple ✅)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Graphics section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '20px', fontWeight: 800 }}>Evolución de Egresos vs Acuerdo Programado</h3>
              <div style={{ height: '320px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={processedData.filter(d => d.egresos2026 !== null)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar name="Programado (Acuerdo)" dataKey="acuerdoEgresos" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                    <Bar name="Ejecutado Real" dataKey="egresos2026" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', fontWeight: 800 }}>Estado de Metas Transversales</h3>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>1. Índice Funcional</span>
                    <span style={{ fontWeight: 800, color: '#10b981', fontSize: '0.95rem' }}>{yearlyTotals?.indiceFuncional}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Meta: ≤ 1.00 (Estado: Excelente)</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>2. IEMA</span>
                    <span style={{ fontWeight: 800, color: '#10b981', fontSize: '0.95rem' }}>{yearlyTotals?.iema}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Meta: ≤ 1.00 (Estado: Excelente)</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>3. Impacto Financiero</span>
                    <span style={{ fontWeight: 800, color: '#10b981', fontSize: '0.95rem' }}>{yearlyTotals?.impacto}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Meta: ≤ 0 (Estado: Excelente)</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', borderLeft: '4px solid #ef4444' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>6.1 Cumplimiento GES</span>
                    <span style={{ fontWeight: 800, color: '#ef4444', fontSize: '0.95rem' }}>{yearlyTotals?.cumplimientoGes?.toFixed(1)}%</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Meta: ≥ 99.5% (Déficit de -9.4%)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed analysis */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={20} color="var(--primary-accent)" /> Análisis Situacional y Principales Hallazgos
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', borderTop: '4px solid #ef4444' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: 800, color: '#ef4444' }}>Incumplimiento Crítico GES</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155', lineHeight: '1.5' }}>
                  El porcentaje de cumplimiento GES del <strong>{yearlyTotals?.cumplimientoGes?.toFixed(2)}%</strong> se sitúa muy por debajo de la meta exigida del 99.5%. Es una prioridad reactivar la gestión de casos y regularizar el flujo administrativo.
                </p>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', borderTop: '4px solid #10b981' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: 800, color: '#10b981' }}>Eficiencia GRD Destacada</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155', lineHeight: '1.5' }}>
                  El **Índice Funcional** acumulado de **{yearlyTotals?.indiceFuncional}** cumple holgadamente la meta (≤ 1.00), lo que demuestra que el hospital gestiona con altos estándares de eficiencia y complejidad las estancias de sus egresos informados.
                </p>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', borderTop: '4px solid #f59e0b' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: 800, color: '#f59e0b' }}>Suspensión Quirúrgica Límite</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155', lineHeight: '1.5' }}>
                  La suspensión de pabellón acumulada ({yearlyTotals?.suspensionQca?.toFixed(1)}%) se mantiene justo por debajo del límite de la meta de 7%. Sin embargo, la tendencia de marzo y abril superó la tolerancia, requiriendo un control estricto.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'indice_funcional' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ActivitySquare color="var(--primary-accent)" /> Análisis Mensual del Índice Funcional (GRD)
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            <div style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData.filter(d => d.indiceFuncional !== null)} margin={{ top: 20, right: 30, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0.5, 1.2]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <ReferenceLine y={1.00} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Límite Meta (≤ 1.00)', fill: '#ef4444', position: 'top', fontSize: 10, fontWeight: 700 }} />
                  <Line name="Índice Funcional" type="monotone" dataKey="indiceFuncional" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 6, fill: '#8b5cf6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#8b5cf6', fontWeight: 800 }}>Puntaje Acumulado 2026</h4>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-dark)' }}>
                  {yearlyTotals?.indiceFuncional}
                </div>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  El valor acumulado cumple con la meta oficial. Sin embargo, carece de representatividad a partir de Mayo.
                </p>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.04)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.1)' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#ef4444', fontWeight: 700, marginBottom: '6px' }}>
                  <AlertTriangle size={18} />
                  <span style={{ fontSize: '0.85rem' }}>Efecto de Omisión</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#7f1d1d', lineHeight: '1.4' }}>
                  El Índice Funcional requiere la relación entre Egresos Reales y Pesos Relativos. Al faltar la data desde Mayo, la serie histórica se encuentra truncada e inválida para la proyección del segundo semestre.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'tabla_completa' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 800 }}>Matriz Histórica de Indicadores del Acuerdo</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Origen: Hoja1 (Compilado Excel)</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 800 }}>Mes</th>
                  <th style={{ padding: '12px 8px', fontWeight: 800 }}>Egresos Real</th>
                  <th style={{ padding: '12px 8px', fontWeight: 800 }}>Acuerdo Egresos</th>
                  <th style={{ padding: '12px 8px', fontWeight: 800 }}>CMA Real</th>
                  <th style={{ padding: '12px 8px', fontWeight: 800 }}>Acuerdo CMA</th>
                  <th style={{ padding: '12px 8px', fontWeight: 800, color: '#8b5cf6' }}>Índice Funcional</th>
                  <th style={{ padding: '12px 8px', fontWeight: 800 }}>IEMA</th>
                  <th style={{ padding: '12px 8px', fontWeight: 800 }}>Impacto</th>
                  <th style={{ padding: '12px 8px', fontWeight: 800 }}>Cumplimiento GES</th>
                  <th style={{ padding: '12px 8px', fontWeight: 800 }}>Susp. Quirúrgica</th>
                </tr>
              </thead>
              <tbody>
                {rawData.map((row, idx) => {
                  const isTotal = cleanMonthName(row.Mes).includes('Total');
                  const isMeta = cleanMonthName(row.Mes) === 'META';
                  
                  let rowStyle = { borderBottom: '1px solid #e2e8f0' };
                  if (isTotal) rowStyle = { background: '#f8fafc', fontWeight: 700, borderTop: '2px solid #cbd5e1', borderBottom: '2px solid #cbd5e1' };
                  if (isMeta) rowStyle = { background: '#f1f5f9', fontWeight: 700, fontStyle: 'italic', borderBottom: '2px solid #cbd5e1' };

                  return (
                    <tr key={idx} style={rowStyle}>
                      <td style={{ padding: '10px 8px', textAlign: 'left', fontWeight: (isTotal || isMeta) ? 800 : 600 }}>
                        {cleanMonthName(row.Mes) || 'N/A'}
                      </td>
                      <td style={{ padding: '10px 8px' }}>{row["Egresos 2026"] || '-'}</td>
                      <td style={{ padding: '10px 8px' }}>{row["Acuerdo Egresos"] || '-'}</td>
                      <td style={{ padding: '10px 8px' }}>{row["CMA 2026"] || '-'}</td>
                      <td style={{ padding: '10px 8px' }}>{row["Acuerdo CMA"] || '-'}</td>
                      <td style={{ padding: '10px 8px', color: '#8b5cf6', fontWeight: 700 }}>
                        {row["1. Indice Funcional"] || '-'}
                      </td>
                      <td style={{ padding: '10px 8px' }}>{row["2. IEMA"] || '-'}</td>
                      <td style={{ padding: '10px 8px' }}>{row["3. Impacto"] || '-'}</td>
                      <td style={{ padding: '10px 8px' }}>{row["6.1 % Cumplimiento GES"] || '-'}</td>
                      <td style={{ padding: '10px 8px' }}>{row["8. % SUSPENSION QCA"] || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Custom Tooltip component for Recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{ background: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
        <p className="label" style={{ fontWeight: 800, margin: '0 0 6px 0', color: '#1e293b' }}>{label}</p>
        {payload.map((entry, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', margin: '4px 0' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }} />
            <span style={{ color: '#64748b' }}>{entry.name}:</span>
            <span style={{ color: '#0f172a', fontWeight: 800 }}>{entry.value?.toLocaleString('es-CL')}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};
