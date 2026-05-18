import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Target, BarChart, CheckCircle2, Info } from 'lucide-react';

const healthLaws = [
  {
    id: '18834',
    title: 'Ley 18834',
    subtitle: 'Metas Sanitarias Personal Administrativo',
    color: '#00897b',
    objectives: [
      { id: 1, title: 'Eficiencia en Procesos', desc: 'Optimización de tiempos de respuesta en trámites internos.', stat: '94%', trend: '+2%' },
      { id: 2, title: 'Calidad de Atención', desc: 'Encuestas de satisfacción usuaria y trato al paciente.', stat: '88%', trend: '+5%' },
      { id: 3, title: 'Gestión Documental', desc: 'Digitalización y orden del archivo hospitalario.', stat: '100%', trend: 'Estable' },
      { id: 4, title: 'Capacitación Gremial', desc: 'Cumplimiento del plan anual de capacitación.', stat: '75%', trend: '-2%' }
    ]
  },
  {
    id: '19664',
    title: 'Ley 19664',
    subtitle: 'Metas Sanitarias Personal Médico',
    color: '#2e7d32',
    objectives: [
      { id: 1, title: 'Resolutividad Quirúrgica', desc: 'Reducción de suspensión de tablas y optimización de pabellón.', stat: '82%', trend: '+4%' },
      { id: 2, title: 'Cumplimiento Ambulatorio', desc: 'Atención de consultas de especialidad según agenda.', stat: '91%', trend: '+1%' },
      { id: 3, title: 'Calidad Clínica', desc: 'Indicadores de re-intervención y complicaciones.', stat: '96%', trend: 'Estable' },
      { id: 4, title: 'Docencia e Investigación', desc: 'Participación en comités y formación de becados.', stat: '68%', trend: '+10%' }
    ]
  },
  {
    id: '15707',
    title: 'Ley 15707',
    subtitle: 'Incentivos a la Excelencia Institucional',
    color: '#00695c',
    objectives: [
      { id: 1, title: 'Meta Institucional 1', desc: 'Cumplimiento de indicadores globales de la red.', stat: '100%', trend: 'Meta' },
      { id: 2, title: 'Gestión Financiera', desc: 'Equilibrio presupuestario y ejecución eficiente.', stat: '98%', trend: '+1%' },
      { id: 3, title: 'Satisfacción Usuaria', desc: 'Medición de impacto en la comunidad local.', stat: '85%', trend: '+2%' },
      { id: 4, title: 'Clima Organizacional', desc: 'Resultados de encuesta interna de ambiente laboral.', stat: '72%', trend: '-5%' }
    ]
  }
];

export default function HealthGoals({ onBack }) {
  const [activeLaw, setActiveLaw] = useState(healthLaws[0]);
  const [selectedObjective, setSelectedObjective] = useState(null);

  return (
    <motion.div 
      className="health-goals-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="detail-header">
        <button className="back-btn" onClick={onBack}><ArrowLeft size={20} /> Volver</button>
        <div className="header-info">
          <h2>Metas Sanitarias e Incentivos</h2>
          <p>Seleccione una ley para visualizar los objetivos y el estado de cumplimiento.</p>
        </div>
      </header>

      {/* Law Selection Tabs */}
      <div className="law-tabs">
        {healthLaws.map(law => (
          <button 
            key={law.id}
            className={`law-tab ${activeLaw.id === law.id ? 'active' : ''}`}
            onClick={() => { setActiveLaw(law); setSelectedObjective(null); }}
          >
            <h3>{law.title}</h3>
            <span>{law.subtitle}</span>
          </button>
        ))}
      </div>

      {/* 4 Objectives Grid (Infographic Style) */}
      <div className="objectives-infographic">
        {activeLaw.objectives.map(obj => (
          <motion.div 
            key={obj.id}
            className={`obj-card ${selectedObjective?.id === obj.id ? 'selected' : ''}`}
            onClick={() => setSelectedObjective(obj)}
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="obj-number">{obj.id}</div>
            <div className="obj-content">
              <h4>{obj.title}</h4>
              <p>{obj.desc}</p>
            </div>
            <div className="obj-status">
              <CheckCircle2 size={16} />
              <span>Ver detalle</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Deployment Statistics Area */}
      <AnimatePresence mode="wait">
        {selectedObjective && (
          <motion.div 
            key={selectedObjective.id}
            className="stats-deployment glass-card"
            initial={{ height: 0, opacity: 0, y: 20 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: 20 }}
          >
            <div className="stats-header">
              <div className="stats-title">
                <Target size={24} color={activeLaw.color} />
                <h3>Detalle: {selectedObjective.title}</h3>
              </div>
              <div className="stats-badges">
                <span className="badge">Mes: Mayo 2026</span>
                <span className="badge">Responsable: Control de Gestión</span>
              </div>
            </div>

            <div className="stats-main">
              <div className="stat-circle">
                <div className="circle-inner">
                  <span className="percent">{selectedObjective.stat}</span>
                  <span className="label">Cumplimiento</span>
                </div>
              </div>
              
              <div className="stat-details">
                <div className="stat-row">
                  <div className="stat-info">
                    <BarChart size={18} />
                    <span>Tendencia Mensual</span>
                  </div>
                  <span className={`trend-val ${selectedObjective.trend.includes('+') ? 'up' : 'down'}`}>
                    {selectedObjective.trend}
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-label">Avance hacia la meta anual</div>
                  <div className="progress-bar">
                    <motion.div 
                      className="progress-fill" 
                      style={{ background: activeLaw.color }}
                      initial={{ width: 0 }}
                      animate={{ width: selectedObjective.stat }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
                <div className="action-hint">
                  <Info size={16} />
                  <span>Este indicador se actualiza el día 20 de cada mes.</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .health-goals-view { padding-top: 20px; }
        .law-tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
        .law-tab { 
          padding: 24px; 
          background: white; 
          border-radius: 20px; 
          text-align: left; 
          border: 2px solid transparent;
          box-shadow: var(--shadow-soft);
          transition: all 0.3s;
        }
        .law-tab.active { border-color: var(--accent-teal); background: rgba(0, 137, 123, 0.05); }
        .law-tab h3 { font-size: 1.5rem; margin-bottom: 4px; color: var(--text-main); }
        .law-tab span { font-size: 0.85rem; color: var(--text-secondary); }

        .objectives-infographic { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 40px; }
        .obj-card { 
          position: relative; 
          background: #f8f9fa; 
          border-radius: 24px; 
          padding: 32px 24px; 
          cursor: pointer; 
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .obj-card.selected { background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border-color: var(--accent-teal); }
        .obj-number { 
          position: absolute; 
          top: -20px; 
          right: -10px; 
          font-size: 8rem; 
          font-weight: 800; 
          color: rgba(0,0,0,0.03); 
          line-height: 1;
        }
        .obj-card.selected .obj-number { color: rgba(0, 137, 123, 0.08); }
        .obj-content { position: relative; z-index: 1; margin-bottom: 24px; }
        .obj-content h4 { font-size: 1.1rem; margin-bottom: 12px; }
        .obj-content p { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4; }
        .obj-status { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 600; color: var(--accent-teal); }

        .stats-deployment { padding: 40px; overflow: hidden; }
        .stats-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .stats-title { display: flex; align-items: center; gap: 16px; }
        .stats-badges { display: flex; gap: 12px; }
        .badge { padding: 6px 12px; background: rgba(0,0,0,0.05); border-radius: 8px; font-size: 0.8rem; color: var(--text-secondary); }

        .stats-main { display: flex; gap: 60px; align-items: center; }
        .stat-circle { 
          width: 180px; 
          height: 180px; 
          border-radius: 50%; 
          border: 12px solid #f0f0f0; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          position: relative;
        }
        .circle-inner { text-align: center; }
        .percent { display: block; font-size: 3rem; font-weight: 800; color: var(--text-main); }
        .label { font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; }

        .stat-details { flex: 1; display: flex; flex-direction: column; gap: 24px; }
        .stat-row { display: flex; justify-content: space-between; align-items: center; }
        .stat-info { display: flex; align-items: center; gap: 12px; color: var(--text-secondary); }
        .trend-val { font-weight: 700; font-size: 1.2rem; }
        .trend-val.up { color: #4caf50; }
        .trend-val.down { color: #f44336; }

        .progress-bar-container { margin-top: 8px; }
        .progress-label { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px; }
        .progress-bar { height: 12px; background: #eee; border-radius: 6px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 6px; }
        .action-hint { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--text-secondary); margin-top: 12px; }

        @media (max-width: 1000px) {
          .law-tabs { grid-template-columns: 1fr; }
          .objectives-infographic { grid-template-columns: 1fr 1fr; }
          .stats-main { flex-direction: column; gap: 40px; }
        }
      `}</style>
    </motion.div>
  );
}
