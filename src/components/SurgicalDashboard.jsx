import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, Activity, Users, Clock, AlertCircle } from 'lucide-react';

const indicators = [
  {
    title: 'Tasa SMA',
    value: '45.5',
    target: '< 46.0',
    trend: 'down',
    status: 'good',
    formula: '(Total SMA / Total Egresos) * 100',
    icon: <Activity size={20} />
  },
  {
    title: 'Eficiencia Operativa',
    value: '12.0',
    target: '13.0',
    trend: 'up',
    status: 'warning',
    formula: 'Producción / Horas Disponibles',
    icon: <TrendingUp size={20} />
  },
  {
    title: 'Costo Medio SMA',
    value: '$85.57',
    target: 'Var. Interanual',
    trend: 'up',
    status: 'bad',
    formula: 'Gasto Total SMA / N° Casos',
    icon: <AlertCircle size={20} />
  },
  {
    title: 'Cirugías Fuera de Orden',
    value: '26.9%',
    target: '< 15%',
    trend: 'up',
    status: 'bad',
    formula: '(Cirugías No Programadas / Total) * 100',
    icon: <AlertCircle size={20} />
  },
  {
    title: 'Ausentismo Laboral',
    value: '20.25%',
    target: '< 18%',
    trend: 'up',
    status: 'warning',
    formula: 'Días Perdidos / Días Programados',
    icon: <Users size={20} />
  },
  {
    title: 'Ocupación Pabellón',
    value: '78%',
    target: '85%',
    trend: 'down',
    status: 'warning',
    formula: 'Tiempo Quirúrgico / Tiempo Disponible',
    icon: <Clock size={20} />
  }
];

export default function SurgicalDashboard({ onBack }) {
  return (
    <motion.div 
      className="detail-view"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      <header className="detail-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} /> Volver al Resumen
        </button>
        <div className="header-info">
          <h2>Panel Quirúrgico y Operativo</h2>
          <p>Detalle de indicadores clínicos y eficiencia del bloque quirúrgico.</p>
        </div>
      </header>

      <div className="indicators-grid">
        {indicators.map((ind, i) => (
          <motion.div 
            key={ind.title}
            className="indicator-card glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="ind-header">
              <div className={`ind-icon status-${ind.status}`}>
                {ind.icon}
              </div>
              <span className="ind-status-label">{ind.status === 'good' ? 'Cumplido' : 'En Observación'}</span>
            </div>
            
            <div className="ind-body">
              <h3>{ind.title}</h3>
              <div className="value-row">
                <span className="big-value">{ind.value}</span>
                {ind.trend === 'up' ? <TrendingUp size={24} color="#f44336" /> : <TrendingDown size={24} color="#4caf50" />}
              </div>
              <div className="target-row">
                <span>Meta: <strong>{ind.target}</strong></span>
              </div>
            </div>

            <div className="ind-footer">
              <p className="formula">Fórmula: {ind.formula}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <section className="detail-sections">
        <div className="glass-card full-width-card">
          <h3>Evolución Anual Eficiencia</h3>
          <div className="chart-placeholder">
            {/* Visual simulation of a chart */}
            <svg viewBox="0 0 800 200" className="simple-chart">
              <path 
                d="M0,150 Q100,140 200,160 T400,120 T600,130 T800,100" 
                fill="none" 
                stroke="var(--accent-teal)" 
                strokeWidth="4" 
              />
              <circle cx="200" cy="160" r="6" fill="var(--accent-orange)" />
              <text x="210" y="150" fontSize="12" fill="var(--text-secondary)">Punto crítico: Absentismo</text>
            </svg>
          </div>
        </div>
      </section>

      <style jsx>{`
        .detail-view {
          padding-top: 20px;
        }
        .detail-header {
          display: flex;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 40px;
        }
        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: white;
          border-radius: 12px;
          font-weight: 500;
          box-shadow: var(--shadow-soft);
          color: var(--text-main);
        }
        .header-info h2 {
          font-size: 2rem;
          margin-bottom: 4px;
        }
        .header-info p {
          color: var(--text-secondary);
        }
        .indicators-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }
        .indicator-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .ind-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .ind-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .status-good { background: rgba(76, 175, 80, 0.1); color: #4caf50; }
        .status-warning { background: rgba(255, 152, 0, 0.1); color: #ff9800; }
        .status-bad { background: rgba(244, 67, 54, 0.1); color: #f44336; }
        .ind-status-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-secondary);
        }
        .ind-body h3 {
          font-size: 1.1rem;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        .value-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .big-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-main);
        }
        .target-row {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .ind-footer {
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid rgba(0,0,0,0.05);
        }
        .formula {
          font-size: 0.75rem;
          font-style: italic;
          color: var(--text-secondary);
        }
        .full-width-card {
          margin-top: 40px;
          padding: 32px;
        }
        .chart-placeholder {
          margin-top: 24px;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .simple-chart {
          width: 100%;
          height: 100%;
        }
        @media (max-width: 768px) {
          .detail-header { flex-direction: column; }
        }
      `}</style>
    </motion.div>
  );
}
