import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ArrowUpRight, Stethoscope, Bed, Scissors, Bell, Activity } from 'lucide-react';

const cases = [
  {
    id: 'atencion_abierta',
    title: 'Atención Abierta',
    icon: <Stethoscope size={24} />,
    image: '/consultation_hd.png',
    desc: 'Gestión de consultas médicas, especialidades odontológicas y procedimientos ambulatorios. Monitoreo de oferta vs demanda asistencial.',
    color: '#2ecc71'
  },
  {
    id: 'atencion_cerrada',
    title: 'Atención Cerrada',
    icon: <Bed size={24} />,
    image: '/production_stats_hd.png',
    desc: 'Análisis de egresos hospitalarios, días de estada y censo diario. Control de ocupación de camas críticas y básicas.',
    color: '#3498db'
  },
  {
    id: 'quirurgica',
    title: 'Producción Quirúrgica',
    icon: <Scissors size={24} />,
    image: '/surgical_hd.png',
    desc: 'Eficiencia de pabellones, rendimiento por quirófano y análisis de suspensiones. Seguimiento de lista de espera quirúrgica.',
    color: '#e74c3c'
  },
  {
    id: 'urgencia',
    title: 'Estadísticas de Urgencia',
    icon: <Bell size={24} />,
    image: '/emergency_hd.png',
    desc: 'Monitoreo de flujo de pacientes, categorización (C1-C5) y tiempos de espera en la unidad de emergencia hospitalaria.',
    color: '#f1c40f'
  },
  {
    id: 'procedimientos_especialidades',
    title: 'Procedimientos de Especialidades',
    icon: <Activity size={24} />,
    image: '/stats_abstract.png',
    desc: 'Estadísticas de procedimientos clínicos realizados por especialidad y servicios de apoyo.',
    color: '#e74c3c'
  },
  {
    id: 'farmacia',
    title: 'Producción de Farmacia',
    icon: <ClipboardList size={24} />,
    image: '/production_stats_hd.png',
    desc: 'Análisis dinámico de dispensación de medicamentos. Monitoreo en dos dimensiones clave (recetas y prescripciones) según servicios clínicos y áreas de farmacia.',
    color: '#0ea5e9'
  }
];

const ProductionPortal = ({ onBack, onNavigate, title, cases: customCases }) => {
  const displayCases = customCases || cases;
  const displayTitle = title || "Estadísticas generales de producción";

  return (
    <div className="production-portal-container" style={{ color: 'var(--text-dark)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '60px' }}>
        <button 
          onClick={onBack}
          style={{ background: 'white', border: '1px solid #eee', padding: '12px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <span style={{ color: 'var(--primary-accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>Control de Gestión Villarrica</span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{displayTitle}</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px' }}>
        {displayCases.map((item, index) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{ 
              background: 'white', 
              borderRadius: '32px', 
              overflow: 'hidden', 
              boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
              border: '1px solid #f0f0f0',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ height: '240px', position: 'relative', overflow: 'hidden' }}>
              <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={item.title} />
              <div style={{ 
                position: 'absolute', 
                top: '20px', 
                left: '20px', 
                background: 'rgba(255,255,255,0.9)', 
                backdropFilter: 'blur(10px)',
                width: '48px', 
                height: '48px', 
                borderRadius: '16px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: item.color || 'var(--primary-accent)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}>
                {item.icon}
              </div>
            </div>
            
            <div style={{ padding: '40px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '16px' }}>{item.title}</h3>
              <p style={{ color: '#666', lineHeight: '1.7', marginBottom: '32px', flex: 1 }}>{item.desc}</p>
              
              <button 
                onClick={() => onNavigate(item.id)}
                style={{ 
                  background: 'var(--text-dark)', 
                  color: 'white', 
                  border: 'none', 
                  padding: '16px 32px', 
                  borderRadius: '16px', 
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--primary-accent)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'var(--text-dark)'}
              >
                INGRESAR AL PANEL <ArrowUpRight size={20} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ marginTop: '80px', padding: '60px', background: 'var(--text-dark)', borderRadius: '40px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ maxWidth: '600px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Consolidado Institucional</h2>
          <p style={{ opacity: 0.7, lineHeight: '1.6' }}>Visualiza los indicadores clave de desempeño de toda la red asistencial en un solo tablero de mando integrado.</p>
        </div>
        <button style={{ background: 'var(--primary-accent)', color: 'white', border: 'none', padding: '20px 40px', borderRadius: '20px', fontWeight: 800 }}>VER REPORTE GLOBAL</button>
      </div>
    </div>
  );
};

export default ProductionPortal;
