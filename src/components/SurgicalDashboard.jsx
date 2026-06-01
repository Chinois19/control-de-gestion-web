import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, Search, Users, Activity, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, BarChart2 } from 'lucide-react';

// Main Dashboard Component
export default function SurgicalDashboard({ onBack }) {
  const [activeTab, setActiveTab] = useState('tabla');
  const [tablaData, setTablaData] = useState([]);
  const [disponibilidadData, setDisponibilidadData] = useState([]);
  const [libroData, setLibroData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros de fecha estándar
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [tablaRes, dispRes, libroRes] = await Promise.all([
          fetch('/data/pabellon_tabla_cached.json'),
          fetch('/data/pabellon_disponibilidad_cached.json'),
          fetch('/data/libro_pabellon_cached.json').catch(() => ({ json: () => ({ records: [] }) }))
        ]);
        
        const tablaJson = await tablaRes.json();
        const dispJson = await dispRes.json();
        const libroJson = await libroRes.json();
        
        setTablaData(tablaJson.records || []);
        setDisponibilidadData(dispJson.records || []);
        setLibroData(libroJson.records || []);
      } catch (err) {
        console.error("Error loading surgical data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtrado de datos por fecha
  const filteredTabla = useMemo(() => {
    return tablaData.filter(row => {
      if (!row.fecha_programacion) return false;
      const passDate = row.fecha_programacion >= dateRange.start && row.fecha_programacion <= dateRange.end;
      
      const passSearch = searchTerm === '' || 
        (row.rut && row.rut.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (row.nombre_paciente && row.nombre_paciente.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (row.cirujano && row.cirujano.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (row.especialidad && row.especialidad.toLowerCase().includes(searchTerm.toLowerCase()));
        
      return passDate && passSearch;
    });
  }, [tablaData, dateRange, searchTerm]);

  const filteredDisp = useMemo(() => {
    return disponibilidadData.filter(row => {
      if (!row.fecha) return false;
      return row.fecha >= dateRange.start && row.fecha <= dateRange.end;
    });
  }, [disponibilidadData, dateRange]);

  const filteredLibro = useMemo(() => {
    return libroData.filter(row => {
      if (!row.fecha_cirugia) return false;
      const passDate = row.fecha_cirugia.substring(0,10) >= dateRange.start && row.fecha_cirugia.substring(0,10) <= dateRange.end;
      
      const passSearch = searchTerm === '' || 
        (row.rut && row.rut.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (row.paciente && row.paciente.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (row.cirujano && row.cirujano.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (row.especialidad && row.especialidad.toLowerCase().includes(searchTerm.toLowerCase()));
        
      return passDate && passSearch;
    });
  }, [libroData, dateRange, searchTerm]);

  // Aggregations for KPI
  const stats = useMemo(() => {
    const totalProgramados = filteredTabla.length;
    const realizados = filteredTabla.filter(r => r.estado && r.estado.toLowerCase() === 'realizado').length;
    const suspendidos = filteredTabla.filter(r => r.estado && r.estado.toLowerCase() === 'suspendido').length;
    const pendientes = filteredTabla.filter(r => r.estado && r.estado.toLowerCase() === 'pendiente').length;
    
    // Calculate Horas programadas vs Disponibles (aprox)
    const horasDisponibles = filteredDisp.reduce((acc, curr) => acc + (parseFloat(curr.total_horas_disponibles) || 0), 0);
    
    return {
      total: totalProgramados,
      realizados,
      suspendidos,
      pendientes,
      tasaSuspension: totalProgramados > 0 ? ((suspendidos / totalProgramados) * 100).toFixed(1) : '0.0',
      horasDisp: Math.round(horasDisponibles)
    };
  }, [filteredTabla, filteredDisp]);

  return (
    <motion.div 
      className="dashboard-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', paddingBottom: '60px' }}
    >
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <button className="btn-back" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '16px', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Volver al Portal General
          </button>
          <h1 style={{ fontSize: '2.2rem', color: '#1e293b', margin: 0, fontWeight: 800 }}>Panel de Producción Quirúrgica</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', margin: '8px 0 0 0' }}>Monitoreo integrado de infraestructura y programación de pabellones</p>
        </div>
        
        {/* Global Date Filters */}
        <div className="global-filters" style={{ display: 'flex', gap: '12px', background: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Desde</label>
            <input 
              type="date" 
              value={dateRange.start} 
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Hasta</label>
            <input 
              type="date" 
              value={dateRange.end} 
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
            />
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="kpi-card glass-panel" style={{ padding: '24px', borderRadius: '20px', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Pacientes Programados</p>
              <h3 style={{ margin: '8px 0 0 0', fontSize: '2.5rem', color: '#0f172a', fontWeight: 800 }}>{stats.total}</h3>
            </div>
            <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '12px', color: '#3b82f6' }}>
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="kpi-card glass-panel" style={{ padding: '24px', borderRadius: '20px', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Cirugías Realizadas</p>
              <h3 style={{ margin: '8px 0 0 0', fontSize: '2.5rem', color: '#10b981', fontWeight: 800 }}>{stats.realizados}</h3>
            </div>
            <div style={{ padding: '12px', background: '#ecfdf5', borderRadius: '12px', color: '#10b981' }}>
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

        <div className="kpi-card glass-panel" style={{ padding: '24px', borderRadius: '20px', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Tasa de Suspensión</p>
              <h3 style={{ margin: '8px 0 0 0', fontSize: '2.5rem', color: '#ef4444', fontWeight: 800 }}>{stats.tasaSuspension}%</h3>
            </div>
            <div style={{ padding: '12px', background: '#fef2f2', borderRadius: '12px', color: '#ef4444' }}>
              <XCircle size={24} />
            </div>
          </div>
        </div>

        <div className="kpi-card glass-panel" style={{ padding: '24px', borderRadius: '20px', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Horas Disp. (Infra)</p>
              <h3 style={{ margin: '8px 0 0 0', fontSize: '2.5rem', color: '#8b5cf6', fontWeight: 800 }}>{stats.horasDisp}h</h3>
            </div>
            <div style={{ padding: '12px', background: '#f5f3ff', borderRadius: '12px', color: '#8b5cf6' }}>
              <Clock size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="tabs-container" style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
        {['tabla', 'disponibilidad', 'libro'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '3px solid #0f172a' : '3px solid transparent',
              color: activeTab === tab ? '#0f172a' : '#64748b',
              fontWeight: activeTab === tab ? 700 : 500,
              fontSize: '1.05rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textTransform: 'capitalize'
            }}
          >
            {tab === 'tabla' ? 'Tabla Quirúrgica (Programación)' : tab === 'disponibilidad' ? 'Disponibilidad Infraestructura' : 'Libro de Pabellón'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content glass-panel" style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', padding: '32px', minHeight: '500px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column', gap: '16px' }}>
            <div className="loader" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ color: '#64748b', fontWeight: 600 }}>Cargando miles de registros operativos...</p>
          </div>
        ) : (
          <>
            {activeTab === 'tabla' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b' }}>Registro de Programación Quirúrgica</h3>
                  <div className="search-bar" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '300px' }}>
                    <Search size={18} color="#94a3b8" />
                    <input 
                      type="text" 
                      placeholder="Buscar paciente, RUT o cirujano..." 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                <div className="table-responsive" style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0' }}>Fecha Prog.</th>
                        <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0' }}>Paciente</th>
                        <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0' }}>Pabellón</th>
                        <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0' }}>Cirujano</th>
                        <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0' }}>Especialidad</th>
                        <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0' }}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTabla.slice(0, 50).map((row, idx) => (
                        <tr key={row.id || idx} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} className="table-row-hover">
                          <td style={{ padding: '16px', fontSize: '0.9rem', color: '#64748b' }}>{row.fecha_programacion}</td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{row.nombre_paciente} {row.apellido_paterno}</div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>RUT: {row.rut} • Edad: {row.edad}</div>
                          </td>
                          <td style={{ padding: '16px', fontSize: '0.9rem', color: '#334155' }}>
                            <span style={{ display: 'inline-block', padding: '4px 8px', background: '#f1f5f9', borderRadius: '6px', fontWeight: 600 }}>{row.pabellon}</span>
                          </td>
                          <td style={{ padding: '16px', fontSize: '0.9rem', color: '#334155' }}>{row.cirujano || 'No asignado'}</td>
                          <td style={{ padding: '16px', fontSize: '0.9rem', color: '#334155' }}>{row.especialidad}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ 
                              padding: '6px 12px', 
                              borderRadius: '20px', 
                              fontSize: '0.75rem', 
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              background: row.estado?.toLowerCase() === 'realizado' ? '#ecfdf5' : row.estado?.toLowerCase() === 'suspendido' ? '#fef2f2' : '#fffbeb',
                              color: row.estado?.toLowerCase() === 'realizado' ? '#10b981' : row.estado?.toLowerCase() === 'suspendido' ? '#ef4444' : '#d97706'
                            }}>
                              {row.estado || 'Pendiente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredTabla.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No hay registros para los filtros seleccionados.</div>
                  )}
                  {filteredTabla.length > 50 && (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                      Mostrando primeros 50 registros de {filteredTabla.length}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'disponibilidad' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 style={{ margin: '0 0 24px 0', fontSize: '1.4rem', color: '#1e293b' }}>Disponibilidad de Infraestructura</h3>
                <div className="table-responsive" style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0' }}>Fecha</th>
                        <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0' }}>Pabellón</th>
                        <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0' }}>Estado</th>
                        <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0' }}>Hrs Disp.</th>
                        <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0' }}>Especialidad AM</th>
                        <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0' }}>Especialidad PM</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDisp.slice(0, 50).map((row, idx) => (
                        <tr key={row.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '16px', fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>{row.fecha}</td>
                          <td style={{ padding: '16px', fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>{row.numero_pabellon}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ 
                              padding: '4px 8px', 
                              borderRadius: '6px', 
                              fontSize: '0.75rem', 
                              fontWeight: 700,
                              background: row.estado_pabellon?.toLowerCase() === 'operativo' ? '#ecfdf5' : '#fef2f2',
                              color: row.estado_pabellon?.toLowerCase() === 'operativo' ? '#10b981' : '#ef4444'
                            }}>
                              {row.estado_pabellon || 'N/A'}
                            </span>
                          </td>
                          <td style={{ padding: '16px', fontSize: '0.9rem', color: '#334155', fontWeight: 700 }}>{row.total_horas_disponibles} h</td>
                          <td style={{ padding: '16px', fontSize: '0.9rem', color: '#64748b' }}>{row.especialidad_am || '-'}</td>
                          <td style={{ padding: '16px', fontSize: '0.9rem', color: '#64748b' }}>{row.especialidad_pm || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredDisp.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No hay registros para los filtros seleccionados.</div>
                  )}
                  {filteredDisp.length > 50 && (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                      Mostrando primeros 50 registros de {filteredDisp.length}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'libro' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b' }}>Libro de Pabellón Electrónico</h3>
                  <div className="search-bar" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '300px' }}>
                    <Search size={18} color="#94a3b8" />
                    <input 
                      type="text" 
                      placeholder="Buscar paciente, RUT o cirujano..." 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                <div className="table-responsive" style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0' }}>Fecha CIR.</th>
                        <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0' }}>Paciente</th>
                        <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0' }}>Intervención</th>
                        <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0' }}>Cirujano</th>
                        <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0' }}>Especialidad</th>
                        <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0' }}>Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLibro.slice(0, 50).map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} className="table-row-hover">
                          <td style={{ padding: '16px', fontSize: '0.9rem', color: '#64748b' }}>{row.fecha_cirugia ? row.fecha_cirugia.substring(0,10) : ''}</td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{row.paciente}</div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>RUT: {row.rut} • Edad: {row.edad}</div>
                          </td>
                          <td style={{ padding: '16px', fontSize: '0.9rem', color: '#334155', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.intervencion}>
                            {row.intervencion}
                          </td>
                          <td style={{ padding: '16px', fontSize: '0.9rem', color: '#334155' }}>{row.cirujano || '-'}</td>
                          <td style={{ padding: '16px', fontSize: '0.9rem', color: '#334155' }}>{row.especialidad || '-'}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ 
                              padding: '6px 12px', 
                              borderRadius: '20px', 
                              fontSize: '0.75rem', 
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              background: row.urgencia === 'SI' ? '#fef2f2' : '#eff6ff',
                              color: row.urgencia === 'SI' ? '#ef4444' : '#3b82f6'
                            }}>
                              {row.urgencia === 'SI' ? 'URGENCIA' : 'ELECTIVA'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredLibro.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No hay registros para los filtros seleccionados.</div>
                  )}
                  {filteredLibro.length > 50 && (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                      Mostrando primeros 50 registros de {filteredLibro.length}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .table-row-hover:hover {
          background-color: #f8fafc !important;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}
