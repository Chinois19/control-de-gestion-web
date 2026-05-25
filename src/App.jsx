import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Menu, 
  X, 
  Target, 
  Activity, 
  FileText, 
  PieChart, 
  Calendar,
  ArrowRight,
  TrendingUp,
  MapPin,
  Bell,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Settings,
  User,
  LayoutDashboard,
  ClipboardList,
  Stethoscope,
  Scissors
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SurgicalDashboard from './components/SurgicalDashboard';
import DocumentRepository from './components/DocumentRepository';
import HealthGoals from './components/HealthGoals';
import ProductionPortal from './components/ProductionPortal';
import MammographyDashboard from './components/MammographyDashboard';
import UltrasoundDashboard from './components/UltrasoundDashboard';
import RadiologyDashboard from './components/RadiologyDashboard';
import TacDashboard from './components/TacDashboard';
import EndoscopyDashboard from './components/EndoscopyDashboard';
import ClosedAttentionDashboard from './components/ClosedAttentionDashboard';
import PharmacyDashboard from './components/PharmacyDashboard';
import SigcomDashboard from './components/SigcomDashboard';
import SolicitudesDashboard from './components/SolicitudesDashboard';
import './App.css';

// HD Images
const imgSurgical = "/surgical_hd.png";
const imgConsultation = "/consultation_hd.png";
const imgHero = "/hero_hd.png";
const imgStats = "/stats_abstract.png";
const imgProduction = "/production_stats_hd.png";

const menuStructure = [
  { id: 'solicitudes_ciudadanas', icon: <User size={22} />, label: 'Solicitudes Ciudadanas' },
  { 
    id: 'produccion_general', 
    icon: <LayoutDashboard size={22} />, 
    label: 'Estadísticas generales de producción',
    subItems: [
      { 
        id: 'atencion_abierta', 
        label: 'Atención Abierta',
        nested: [
          { id: 'esp_medicas', label: 'Consultas Especialidades Médicas' },
          { id: 'prof_no_medicos', label: 'Consultas Profesionales No Médicos' },
          { id: 'esp_odontologicas', label: 'Consultas Odontológicas' }
        ]
      },
      { 
        id: 'atencion_cerrada', 
        label: 'Atención Cerrada',
        nested: [
          { id: 'censo', label: 'Estadística Cerrada y Censo' }
        ]
      },
      { id: 'quirurgica', label: 'Producción Quirúrgica' },
      { id: 'urgencia', label: 'Estadísticas de Urgencia' },
      { 
        id: 'procedimientos_especialidades', 
        label: 'Servicios de apoyo diagnóstico',
        subNested: [
          { 
            id: 'imagenologia', 
            label: 'Procedimientos de imagenología',
            items: [
              { id: 'mamografias', label: 'Producción mamografías (REDCap)' },
              { id: 'radiografias', label: 'Producción radiografías' },
              { id: 'tac', label: 'Producción de TAC' },
              { id: 'ecografias', label: 'Producción de ecografías' }
            ]
          },
          {
            id: 'endoscopia',
            label: 'Procedimientos Endoscópicos (REDCap)'
          },
          {
            id: 'farmacia',
            label: 'Producción de Farmacia'
          }
        ]
      }
    ]
  },
  { 
    id: 'indicadores_gestion', 
    icon: <ClipboardList size={22} />, 
    label: 'Indicadores de Gestión',
    subItems: [
      { 
        id: 'metas_sanitarias', 
        label: 'Metas Sanitarias',
        nested: [
          { id: 'ley18834', label: 'Ley 18.834' },
          { id: 'ley19664', label: 'Ley 19.664' },
          { id: 'ley15707', label: 'Ley 15.707' }
        ]
      },
      { id: 'comgest', label: 'Compromisos de Gestión 2026' },
      { id: 'adp', label: 'Alta Dirección Pública' },
      { id: 'acuerdo_minsal', label: 'Acuerdo Programación MINSAL' }
    ]
  },
  { id: 'repositorio', icon: <FileText size={22} />, label: 'Repositorio Anual' },
  { id: 'costeo', icon: <Activity size={22} />, label: 'Costeo GRD' },
  { id: 'agenda', icon: <Calendar size={22} />, label: 'Agenda Gestión' }
];

const indicatorCards = [
  { 
    id: 'produccion_general', 
    title: 'Estadísticas generales de producción', 
    image: imgProduction, 
    type: 'Gestión Asistencial',
    desc: 'Análisis detallado de la actividad clínica y uso de recursos bajo estándares MINSAL.'
  },
  { 
    id: 'indicadores', 
    title: 'Metas Sanitarias 2026', 
    image: imgStats, 
    type: 'Cumplimiento Leyes',
    desc: 'Monitoreo de compromisos de gestión y metas de eficiencia institucional.'
  },
  { 
    id: 'estadistica', 
    title: 'Panel Quirúrgico HD', 
    image: imgSurgical, 
    type: 'Alta Resolución',
    desc: 'Visualización en tiempo real de pabellones y listas de espera.'
  }
];

const searchIndex = [
  {
    keys: ['farmacia', 'recetas', 'prescripciones', 'medicamentos', 'blanca', 'verde', 'controlados', 'dispensacion', 'farmacos', 'produccion farmacia'],
    title: 'Producción de Farmacia y Medicamentos',
    path: 'Servicios de Apoyo ➔ Farmacia',
    desc: 'Monitoreo de dispensación de medicamentos en dos dimensiones: número de recetas y número de prescripciones por servicio clínico.',
    action: { view: 'farmacia' }
  },
  {
    keys: ['censo', 'camas', 'ocupacion', 'egresos', 'altas', 'pacientes', 'cerrado', 'hospitalizacion', 'atencion cerrada', 'ingresos hospitalarios', 'sala', 'camas ocupadas', 'alta medica', 'dias estada', 'atencion clinica', 'estadistica cerrada', 'hospitalizado'],
    title: 'Estadística Cerrada y Censo de Camas',
    path: 'Gestión Asistencial ➔ Atención Cerrada',
    desc: 'Monitoreo diario de ocupación de camas, censo hospitalario, egresos, traslados y altas médicas.',
    action: { view: 'atencion_cerrada' }
  },
  {
    keys: ['urgencia', 'emergencia', 'sapo', 'sar', 'atencion urgencia', 'box urgencias', 'categorizacion', 'triage', 'c3', 'c2', 'c1', 'tiempo de espera urgencia', 'urgencias'],
    title: 'Estadísticas de Urgencia',
    path: 'Gestión Asistencial ➔ Urgencia',
    desc: 'Volumen de consultas, tiempos de espera por categorización (Triage) y derivaciones de urgencia.',
    action: { view: 'urgencia' }
  },
  {
    keys: ['atencion abierta', 'consultas', 'medicas', 'profesionales no medicos', 'odontologia', 'consultas especialidades', 'abierta', 'policlinico', 'controles', 'medico', 'especialista', 'consulta medica', 'consultorio'],
    title: 'Consultas y Atención Abierta',
    path: 'Gestión Asistencial ➔ Atención Abierta',
    desc: 'Rendimiento de consultas médicas de especialidades, profesionales no médicos y odontología.',
    action: { view: 'atencion_abierta' }
  },
  {
    keys: ['nsp', 'inasistencias', 'ausentismo', 'no se presento', 'mamografias nsp', 'perdidas', 'horas mamografia', 'inasistencia mamografia'],
    title: 'Tendencia de Inasistencias (NSP) - Mamografías',
    path: 'Imagenología ➔ Mamografías',
    desc: 'Análisis dinámico de ausentismo, horas perdidas y establecimientos críticos.',
    action: { view: 'mamografias', tab: 'summary', filterNsp: true, scrollId: 'nsp-trend-section' }
  },
  {
    keys: ['produccion mamografias', 'mamografias', 'procedimientos mamografia', 'redcap', 'radiografia de mama', 'mama'],
    title: 'Producción de Mamografías (REDCap)',
    path: 'Imagenología ➔ Mamografías',
    desc: 'Volumen mensual de atenciones, exámenes unilaterales, bilaterales y marcaciones.',
    action: { view: 'mamografias', tab: 'summary' }
  },
  {
    keys: ['proyecciones mamografias', 'calidad mamografias', 'edad mamografias', 'grupo etario', 'cobertura', 'rango de edad'],
    title: 'Proyecciones y Calidad de Mamografías',
    path: 'Imagenología ➔ Mamografías ➔ Calidad',
    desc: 'Distribución por grupo de edad, efectividad de asistencia y metas ministeriales.',
    action: { view: 'mamografias', tab: 'details' }
  },
  {
    keys: ['alertas mamografias', 'birads', 'birads pendientes', 'alertas clinicas', 'urgente mama', 'sospecha cancer', 'derivacion birads', 'birads 4', 'birads 5'],
    title: 'Control de Alertas Clínicas (BIRADS)',
    path: 'Imagenología ➔ Mamografías ➔ Alertas',
    desc: 'Pacientes con sospecha diagnóstica (BIRADS 4 y 5) con necesidad de derivación urgente.',
    action: { view: 'mamografias', tab: 'results' }
  },
  {
    keys: ['quirurgico', 'pabellon', 'cirugias', 'lista de espera', 'operativa', 'eficiencia operativa', 'sma', 'cirugía', 'suspendidas', 'tiempo quirurgico', 'pabellón'],
    title: 'Panel Quirúrgico y Eficiencia Operativa',
    path: 'Gestión Asistencial ➔ Quirúrgica',
    desc: 'Eficiencia de pabellón, tasa SMA, cirugías fuera de orden y absentismo laboral.',
    action: { view: 'estadistica' }
  },
  {
    keys: ['metas', 'metas sanitarias', 'compromisos', 'comgest', 'ley 18834', 'ley 19664', 'ley 15707', 'leyes', 'cumplimiento', 'incentivo', 'desempeño', 'indicador metas'],
    title: 'Monitoreo de Metas Sanitarias 2026',
    path: 'Indicadores de Gestión ➔ Metas Sanitarias',
    desc: 'Seguimiento de cumplimiento de leyes de salud y metas de eficiencia institucional.',
    action: { view: 'indicadores' }
  },
  {
    keys: ['documentos', 'repositorio', 'normas', 'resoluciones', 'archivos', 'pdf', 'descargar manual', 'circulares', 'reglamentos', 'biblioteca'],
    title: 'Repositorio Documental Anual',
    path: 'Repositorio',
    desc: 'Acceso centralizado a circulares, resoluciones, manuales y normativas del establecimiento.',
    action: { view: 'repositorio' }
  },
  {
    keys: ['ecografias', 'ecotomografias', 'produccion ecografias', 'procedimientos ecograficos', 'urgencia ecografia', 'ecografía', 'ultrasonido', 'eco abdominal', 'eco renal', 'eco partes blandas'],
    title: 'Producción de Ecografías (REDCap)',
    path: 'Imagenología ➔ Ecografías',
    desc: 'Volumen mensual de ecografías abdominales, gineco-obstétricas, renales y de partes blandas.',
    action: { view: 'ecografias', tab: 'summary' }
  },
  {
    keys: ['nsp ecografias', 'inasistencias ecografias', 'ausentismo ecografias', 'horas perdidas ecografia', 'eco nsp'],
    title: 'Tendencia de Inasistencias (NSP) - Ecografías',
    path: 'Imagenología ➔ Ecografías',
    desc: 'Análisis de ausentismo, horas clínicas perdidas y centros derivadores con mayor tasa NSP.',
    action: { view: 'ecografias', tab: 'summary', filterNsp: true }
  },
  {
    keys: ['clasificacion ecografias', 'ginecologia ecografia', 'obstetrica ecografia', 'abdominal ecografia', 'renal ecografia', 'eco renal', 'urologica eco'],
    title: 'Clasificación de Procedimientos Ecográficos',
    path: 'Imagenología ➔ Ecografías ➔ Clasificación',
    desc: 'Clasificación y volumen de exámenes urológicos, obstétricos, tiroideos y de partes blandas.',
    action: { view: 'ecografias', tab: 'classification' }
  },
  {
    keys: ['rem ecografias', 'resumen mensual ecografias', 'fonasa ecografias', 'operativos ecografias', 'registro eco'],
    title: 'Resumen Mensual (REM) - Ecografías',
    path: 'Imagenología ➔ Ecografías ➔ REM',
    desc: 'Estadísticas agrupadas REM: Beneficiarios (FONASA), procedencias y operativos.',
    action: { view: 'ecografias', tab: 'rem' }
  },
  {
    keys: ['radiografias', 'produccion radiografias', 'rayos', 'radiografia convencional', 'redcap radiografias', 'placas', 'rayos x'],
    title: 'Producción de Radiografías (REDCap)',
    path: 'Imagenología ➔ Radiografías',
    desc: 'Volumen mensual de atenciones y exámenes realizados en las 10 columnas descriptivas de rayos.',
    action: { view: 'radiografias', tab: 'summary' }
  },
  {
    keys: ['nsp radiografias', 'inasistencias radiografias', 'horas perdidas radiografias', 'rayos nsp'],
    title: 'Tendencia de Inasistencias (NSP) - Radiografías',
    path: 'Imagenología ➔ Radiografías',
    desc: 'Análisis dinámico de ausentismo y horas clínicas de rayos perdidas.',
    action: { view: 'radiografias', tab: 'summary', filterNsp: true }
  },
  {
    keys: ['clasificacion radiografias', 'tipos radiografias', 'torax', 'columna', 'pelvis', 'extremidades', 'placas torax'],
    title: 'Clasificación de Exámenes Radiográficos',
    path: 'Imagenología ➔ Radiografías ➔ Clasificación',
    desc: 'Distribución y volumen de exámenes de tórax, columna, pelvis, extremidades y estudios contrastados.',
    action: { view: 'radiografias', tab: 'classification' }
  },
  {
    keys: ['rem radiografias', 'resumen mensual radiografias', 'fonasa radiografias', 'operativos radiografias'],
    title: 'Resumen Mensual (REM) - Radiografías',
    path: 'Imagenología ➔ Radiografías ➔ REM',
    desc: 'Estadísticas agrupadas REM: Beneficiarios (FONASA), procedencias y operativos de radiografías.',
    action: { view: 'radiografias', tab: 'rem' }
  },
  {
    keys: ['tac', 'produccion tac', 'tomografia', 'escaner', 'redcap tac', 'tac de cerebro', 'tac de abdomen', 'axial computarizada'],
    title: 'Producción de TAC (REDCap)',
    path: 'Imagenología ➔ TAC',
    desc: 'Volumen mensual de atenciones, exámenes y rendimiento del tomógrafo axial computarizada.',
    action: { view: 'tac', tab: 'summary' }
  },
  {
    keys: ['nsp tac', 'inasistencias tac', 'horas perdidas tac', 'escaner nsp'],
    title: 'Tendencia de Inasistencias (NSP) - TAC',
    path: 'Imagenología ➔ TAC',
    desc: 'Análisis dinámico de ausentismo y horas perdidas de tomografía.',
    action: { view: 'tac', tab: 'summary', filterNsp: true }
  },
  {
    keys: ['clasificacion tac', 'tipos tac', 'cerebral', 'angio tac', 'abdominal tac'],
    title: 'Clasificación de Exámenes de TAC',
    path: 'Imagenología ➔ TAC ➔ Clasificación',
    desc: 'Distribución clínica de tomografías: cerebrales, abdominales, angiotomografías y óseas.',
    action: { view: 'tac', tab: 'classification' }
  },
  {
    keys: ['rem tac', 'resumen mensual tac', 'fonasa tac', 'operativos tac'],
    title: 'Resumen Mensual (REM) - TAC',
    path: 'Imagenología ➔ TAC ➔ REM',
    desc: 'Estadísticas agrupadas REM: Beneficiarios (FONASA), procedencias y operativos de TAC.',
    action: { view: 'tac', tab: 'rem' }
  },
  {
    keys: ['endoscopia', 'colonoscopia', 'cistoscopia', 'produccion endoscopias', 'redcap endoscopias', 'biopsias', 'digestiva', 'endoscopía', 'gastroenterologia'],
    title: 'Producción de Procedimientos Endoscópicos (REDCap)',
    path: 'Especialidades ➔ Procedimientos Endoscópicos',
    desc: 'Volumen mensual de endoscopías altas, colonoscopías, cistoscopías y biopsias asociadas.',
    action: { view: 'endoscopia', tab: 'summary' }
  },
  {
    keys: ['nsp endoscopia', 'inasistencias endoscopia', 'ausentismo endoscopias', 'horas perdidas endoscopias'],
    title: 'Tendencia de Inasistencias (NSP) - Endoscopías',
    path: 'Especialidades ➔ Procedimientos Endoscópicos',
    desc: 'Análisis dinámico de ausentismo de pacientes y centros derivadores con alta inasistencia en endoscopías.',
    action: { view: 'endoscopia', tab: 'summary', filterNsp: true }
  },
  {
    keys: ['biopsias endoscopia', 'ureasa', 'helicobacter', 'resultado biopsia', 'patologia endoscopias', 'cancer gastrico'],
    title: 'Estudio de Biopsias y Helicobacter pylori',
    path: 'Especialidades ➔ Procedimientos Endoscópicos ➔ Clasificación',
    desc: 'Mapeo oncológico de biopsias malignas/benignas y tasa de positividad del test de Ureasa.',
    action: { view: 'endoscopia', tab: 'classification' }
  },
  {
    keys: ['rem endoscopia', 'resumen mensual endoscopias', 'fonasa endoscopia', 'operativos endoscopia'],
    title: 'Resumen Mensual (REM) - Endoscopías',
    path: 'Especialidades ➔ Procedimientos Endoscópicos ➔ REM',
    desc: 'Estadísticas agrupadas REM: Beneficiarios (FONASA), desglose etario y de género para endoscopías.',
  },
  {
    keys: ['solicitudes', 'ciudadanas', 'oirs', 'reclamos', 'felicitaciones', 'sugerencias', 'transparencia', 'ley de transparencia', 'participacion', 'participación'],
    title: 'Solicitudes Ciudadanas (OIRS)',
    path: 'Panel Principal ➔ Solicitudes Ciudadanas',
    desc: 'Monitor dinámico de la Ley de Transparencia, reclamos, felicitaciones y tiempos de respuesta.',
    action: { view: 'solicitudes_ciudadanas' }
  },
  {
    keys: ['sigcom', 'costeo', 'grd', 'analisis proyectivo', 'finanzas', 'costos', 'banda minsal', 'produccion valorizada'],
    title: 'Análisis Proyectivo SIGCOM',
    path: 'Costeo GRD ➔ SIGCOM',
    desc: 'Costeo por área productiva y análisis financiero institucional comparativo con Banda MINSAL.',
    action: { view: 'sigcom' }
  }
];

function App() {
  const [activeView, setActiveView] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [expandedSubMenu, setExpandedSubMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mammographyInitialTab, setMammographyInitialTab] = useState('summary');
  const [mammographyFilterNsp, setMammographyFilterNsp] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeView]);

  const navigateToView = (view) => {
    setMammographyInitialTab('summary');
    setMammographyFilterNsp(false);
    setActiveView(view);
  };

  const handleMenuClick = (id) => {
    if (id === 'produccion_general') {
      navigateToView('produccion_general');
      setIsSidebarOpen(false);
      return;
    }
    
    if (menuStructure.find(m => m.id === id)?.subItems) {
      setExpandedMenu(expandedMenu === id ? null : id);
    } else {
      navigateToView(id);
      setIsSidebarOpen(false);
    }
  };

  const searchResults = searchQuery.trim() === '' ? [] : (() => {
    const queryNormalized = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const queryTokens = queryNormalized.split(/\s+/).filter(t => t.length > 1);
    
    if (queryTokens.length === 0 && queryNormalized.length > 0) {
      queryTokens.push(queryNormalized);
    }

    return searchIndex
      .map(item => {
        let score = 0;
        const titleNorm = item.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const descNorm = item.desc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        // Match full query
        if (titleNorm.includes(queryNormalized)) score += 100;
        if (descNorm.includes(queryNormalized)) score += 30;
        
        item.keys.forEach(key => {
          const keyNorm = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          if (keyNorm === queryNormalized) {
            score += 80;
          } else if (keyNorm.includes(queryNormalized)) {
            score += 40;
          }
        });

        // Match tokens
        queryTokens.forEach(token => {
          if (titleNorm.includes(token)) score += 15;
          if (descNorm.includes(token)) score += 5;
          item.keys.forEach(key => {
            const keyNorm = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (keyNorm.includes(token)) score += 10;
          });
        });

        return { ...item, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Limit to top 5 extremely relevant results
  })();

  const handleSearchResultClick = (action) => {
    setSearchQuery('');
    
    if (action.tab) {
      setMammographyInitialTab(action.tab);
    } else {
      setMammographyInitialTab('summary');
    }
    
    if (action.filterNsp) {
      setMammographyFilterNsp(true);
    } else {
      setMammographyFilterNsp(false);
    }

    setActiveView(action.view);
    
    if (action.scrollId) {
      setTimeout(() => {
        const el = document.getElementById(action.scrollId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('search-highlight-pulse');
          setTimeout(() => {
            el.classList.remove('search-highlight-pulse');
          }, 3000);
        }
      }, 400);
    }
  };

  const handleSubMenuClick = (e, id) => {
    e.stopPropagation();
    setExpandedSubMenu(expandedSubMenu === id ? null : id);
  };

  return (
    <div className="App">
      {/* Premium Glass Nav */}
      <nav className="premium-nav">
        <button 
          className="quick-icon-btn" 
          style={{ width: '48px', height: '48px', background: 'var(--text-dark)', margin: 0 }} 
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => navigateToView('home')}>
          <div style={{ background: 'var(--primary-accent)', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <TrendingUp size={20} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-dark)', letterSpacing: '-0.5px' }}>CG <span style={{ color: 'var(--primary-accent)' }}>VILLARRICA</span></span>
        </div>

        <div className="nav-links" style={{ marginLeft: 'auto' }}>
          <span className="nav-link" onClick={() => navigateToView('home')}>BIENVENIDA</span>
          <span className="nav-link" onClick={() => navigateToView('produccion_general')}>ESTADÍSTICAS</span>
          <span className="nav-link" onClick={() => navigateToView('repositorio')}>REPOSITORIO</span>
          <div style={{ width: '32px', height: '32px', background: '#eee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={16} />
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div className="search-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} style={{ zIndex: 1900 }} />
            <motion.div className="collapsible-sidebar open" initial={{ x: -450 }} animate={{ x: 24 }} exit={{ x: -450 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Menú Estratégico</h3>
                <X size={24} cursor="pointer" onClick={() => setIsSidebarOpen(false)} style={{ opacity: 0.5 }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {menuStructure.map(item => (
                  <div key={item.id} className="menu-item-container">
                    <div className={`menu-item-main ${activeView === item.id ? 'active' : ''}`} onClick={() => handleMenuClick(item.id)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>{item.icon} <span>{item.label}</span></div>
                      {item.subItems && <ChevronDown size={18} style={{ transform: expandedMenu === item.id ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />}
                    </div>
                    
                    <AnimatePresence>
                      {expandedMenu === item.id && item.subItems && (
                        <motion.div className="submenu-container" initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}>
                          {item.subItems.map(sub => (
                            <div key={sub.id} className="menu-item-container">
                              <div className="submenu-item" onClick={(e) => sub.nested ? handleSubMenuClick(e, sub.id) : (navigateToView(sub.id), setIsSidebarOpen(false))}>
                                {sub.label}
                                {sub.nested && <ChevronRight size={14} style={{ transform: expandedSubMenu === sub.id ? 'rotate(90deg)' : 'none', transition: '0.3s' }} />}
                              </div>
                              {expandedSubMenu === sub.id && sub.nested && (
                                <div style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                                  {sub.nested.map(nest => (
                                    <div key={nest.id} className="menu-item-container">
                                      <div 
                                        className="submenu-item" 
                                        style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)' }} 
                                        onClick={(e) => {
                                          if (nest.subNested) {
                                            e.stopPropagation();
                                            setExpandedSubMenu(expandedSubMenu === nest.id ? null : nest.id);
                                          } else {
                                            navigateToView(nest.id);
                                            setIsSidebarOpen(false);
                                          }
                                        }}
                                      >
                                        {nest.label}
                                        {nest.subNested && <ChevronRight size={12} style={{ transform: expandedSubMenu === nest.id ? 'rotate(90deg)' : 'none', transition: '0.3s' }} />}
                                      </div>
                                      
                                      {expandedSubMenu === nest.id && nest.subNested && (
                                        <div style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                                          {nest.subNested.map(sn => (
                                            <div key={sn.id} className="menu-item-container">
                                              <div 
                                                className="submenu-item" 
                                                style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)' }}
                                                onClick={(e) => {
                                                  if (sn.items) {
                                                    e.stopPropagation();
                                                    setExpandedSubMenu(expandedSubMenu === sn.id ? null : sn.id);
                                                  } else {
                                                    navigateToView(sn.id);
                                                    setIsSidebarOpen(false);
                                                  }
                                                }}
                                              >
                                                {sn.label}
                                                {sn.items && <ChevronRight size={10} style={{ transform: expandedSubMenu === sn.id ? 'rotate(90deg)' : 'none', transition: '0.3s' }} />}
                                              </div>
                                              
                                              {expandedSubMenu === sn.id && sn.items && (
                                                <div style={{ paddingLeft: '12px', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                                                  {sn.items.map(item => (
                                                    <div 
                                                      key={item.id} 
                                                      className="submenu-item" 
                                                      style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.15)' }}
                                                      onClick={() => { navigateToView(item.id); setIsSidebarOpen(false); }}
                                                    >
                                                      {item.label}
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="page-transition-wrapper">
        <AnimatePresence mode="wait">
          {activeView === 'home' ? (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              
              <div className="hero-illiers" style={{ backgroundImage: `url(${imgHero})` }}>
                <h1>Control de <span style={{ color: 'var(--primary-accent)' }}>Gestión</span></h1>
                <p style={{ position: 'relative', fontSize: '1.8rem', fontWeight: 800, marginTop: '-12px', marginBottom: '28px', color: 'rgba(255, 255, 255, 0.95)', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>Hospital de Villarrica</p>
                
                {/* Immersive Smart Search Bar */}
                <div className="smart-search-container" style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
                  <div className="smart-search-bar">
                    <Search size={24} color="#999" />
                    <input 
                      placeholder="Busca de forma inteligente: ej. 'NSP mamografías', 'pabellón', 'metas'..." 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                    />
                  </div>

                  <AnimatePresence>
                    {searchResults.length > 0 && (
                      <motion.div 
                        className="search-results-dropdown"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 8px)',
                          left: 0,
                          width: '100%',
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(16px)',
                          borderRadius: '16px',
                          border: '1px solid rgba(0, 0, 0, 0.08)',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                          zIndex: 2000,
                          maxHeight: '380px',
                          overflowY: 'auto',
                          padding: '8px'
                        }}
                      >
                        <div style={{ padding: '6px 12px', fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Resultados de Búsqueda Temática
                        </div>
                        {searchResults.map((result, idx) => (
                          <div
                            key={idx}
                            className="search-result-item"
                            onMouseEnter={() => setHoveredIdx(idx)}
                            onMouseLeave={() => setHoveredIdx(null)}
                            onClick={() => handleSearchResultClick(result.action)}
                            style={{
                              padding: '12px 16px',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px',
                              transition: 'background 0.2s',
                              background: hoveredIdx === idx ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                              borderBottom: idx < searchResults.length - 1 ? '1px solid rgba(0,0,0,0.03)' : 'none',
                              textAlign: 'left'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.92rem', fontWeight: '700', color: '#1a365d' }}>{result.title}</span>
                              <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', background: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: '20px' }}>{result.path}</span>
                            </div>
                            <span style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: '1.3' }}>{result.desc}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="main-content">
                <div className="feature-large">
                  <motion.div className="feature-image-box" initial={{ x: -30, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}>
                    <img src={imgProduction} alt="Producción General" />
                  </motion.div>
                  <motion.div className="feature-glass-card" initial={{ x: 30, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}>
                    <span style={{ color: 'var(--primary-accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>Portal de Gestión</span>
                    <h2 style={{ margin: '16px 0' }}>Estadísticas generales de producción</h2>
                    <p style={{ marginBottom: '32px', lineHeight: '1.8' }}>
                      Las <strong>Estadísticas Hospitalarias</strong> según el MINSAL constituyen el conjunto de registros que resumen la actividad asistencial y el uso de recursos. La producción se define como el conjunto de prestaciones (consultas, cirugías, egresos) otorgadas para recuperar la salud de la población, permitiendo una planificación estratégica fundamentada.
                    </p>
                    <button className="read-more-btn" onClick={() => navigateToView('produccion_general')} style={{ background: 'var(--primary-accent)' }}>
                      Ingresar al Portal <ArrowUpRight size={20} />
                    </button>
                  </motion.div>
                </div>

                <div className="indicator-grid">
                  {indicatorCards.map(card => (
                    <motion.div key={card.id} className="indicator-card" whileHover={{ scale: 1.03 }} onClick={() => navigateToView(card.id)}>
                      <img src={card.image} alt={card.title} />
                      <div className="indicator-overlay">
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>{card.type}</span>
                        <h4 style={{ fontSize: '1.4rem', marginTop: '8px' }}>{card.title}</h4>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div key="detail" style={{ paddingTop: '100px', maxWidth: '1400px', margin: '0 auto', padding: '100px 40px' }}>
              {activeView === 'produccion_general' && (
                <ProductionPortal 
                  onBack={() => navigateToView('home')} 
                  onNavigate={(caseId) => navigateToView(caseId)} 
                />
              )}
              {activeView === 'atencion_abierta' && (
                <ProductionPortal 
                  title="Atención Abierta"
                  onBack={() => navigateToView('produccion_general')}
                  onNavigate={(id) => navigateToView(id)}
                  cases={[
                    { id: 'esp_medicas', title: 'Consultas Especialidades Médicas', icon: <Stethoscope size={24} />, image: imgConsultation, desc: 'Gestión y control de la actividad de especialidades médicas.', color: '#2ecc71' },
                    { id: 'prof_no_medicos', title: 'Consultas Profesionales No Médicos', icon: <User size={24} />, image: imgConsultation, desc: 'Atención de profesionales no médicos (Enfermería, Matonería, etc).', color: '#3498db' },
                    { id: 'esp_odontologicas', title: 'Consultas Odontológicas', icon: <Stethoscope size={24} />, image: imgConsultation, desc: 'Producción de la especialidad odontológica y urgencias dentales.', color: '#f1c40f' }
                  ]}
                />
              )}
              {activeView === 'procedimientos_especialidades' && (
                <ProductionPortal 
                  title="Servicios de apoyo diagnóstico"
                  onBack={() => navigateToView('produccion_general')}
                  onNavigate={(id) => navigateToView(id)}
                  cases={[
                    { id: 'imagenologia', title: 'Imagenología', icon: <Search size={24} />, image: imgStats, desc: 'Control de producción de exámenes diagnósticos por imagen.', color: '#9b59b6' },
                    { id: 'endoscopia', title: 'Procedimientos Endoscópicos (REDCap)', icon: <Stethoscope size={24} />, image: imgProduction, desc: 'Base de datos integrada de endoscopías y colonoscopías realizadas.', color: '#10b981' },
                    { id: 'farmacia', title: 'Producción de Farmacia', icon: <ClipboardList size={24} />, image: imgProduction, desc: 'Análisis dinámico de dispensación de medicamentos por servicios clínicos y áreas.', color: '#0ea5e9' }
                  ]}
                />
              )}
              {activeView === 'imagenologia' && (
                <ProductionPortal 
                  title="Procedimientos de imagenología"
                  onBack={() => navigateToView('procedimientos_especialidades')}
                  onNavigate={(id) => navigateToView(id)}
                  cases={[
                    { id: 'mamografias', title: 'Producción mamografías (REDCap)', icon: <Activity size={24} />, image: imgProduction, desc: 'Base de datos de mamografías integrada desde REDCap.', color: '#e74c3c' },
                    { id: 'radiografias', title: 'Producción radiografías', icon: <Search size={24} />, image: imgStats, desc: 'Control de actividad y tiempos de espera en radiografía convencional.', color: '#3498db' },
                    { id: 'tac', title: 'Producción de TAC', icon: <Activity size={24} />, image: imgStats, desc: 'Rendimiento y agenda de tomografía axial computarizada.', color: '#2ecc71' },
                    { id: 'ecografias', title: 'Producción de ecografías', icon: <Activity size={24} />, image: imgStats, desc: 'Seguimiento de ecografías generales y gineco-obstétricas.', color: '#f1c40f' }
                  ]}
                />
              )}
              {(activeView === 'atencion_cerrada' || activeView === 'censo') && (
                <ClosedAttentionDashboard 
                  onBack={() => navigateToView('produccion_general')} 
                />
              )}
              {activeView === 'urgencia' && <div style={{ color: 'var(--text-dark)' }}><h1>Panel de Urgencia</h1><button onClick={() => navigateToView('produccion_general')}>Volver</button></div>}
              {activeView === 'estadistica' && <SurgicalDashboard onBack={() => navigateToView('home')} />}
              {activeView === 'indicadores' && <HealthGoals onBack={() => navigateToView('home')} />}
              {activeView === 'repositorio' && <DocumentRepository onBack={() => navigateToView('home')} />}
              {activeView === 'mamografias' && (
                <MammographyDashboard 
                  onBack={() => navigateToView('imagenologia')} 
                  initialTab={mammographyInitialTab}
                  initialFilterNsp={mammographyFilterNsp}
                />
              )}
              {activeView === 'radiografias' && (
                <RadiologyDashboard 
                  onBack={() => navigateToView('imagenologia')} 
                  initialTab={mammographyInitialTab}
                  initialFilterNsp={mammographyFilterNsp}
                />
              )}
              {activeView === 'tac' && (
                <TacDashboard 
                  onBack={() => navigateToView('imagenologia')} 
                  initialTab={mammographyInitialTab}
                  initialFilterNsp={mammographyFilterNsp}
                />
              )}
              {activeView === 'ecografias' && (
                <UltrasoundDashboard 
                  onBack={() => navigateToView('imagenologia')} 
                  initialTab={mammographyInitialTab}
                  initialFilterNsp={mammographyFilterNsp}
                />
              )}
              {activeView === 'endoscopia' && (
                <EndoscopyDashboard 
                  onBack={() => navigateToView('procedimientos_especialidades')} 
                  initialTab={mammographyInitialTab}
                  initialFilterNsp={mammographyFilterNsp}
                />
              )}
              {activeView === 'farmacia' && (
                <PharmacyDashboard 
                  onBack={() => navigateToView('procedimientos_especialidades')} 
                />
              )}
              {activeView === 'costeo' && (
                <ProductionPortal 
                  title="Costeo GRD y Eficiencia"
                  onBack={() => navigateToView('home')}
                  onNavigate={(id) => navigateToView(id)}
                  cases={[
                    { id: 'sigcom', title: 'Análisis Proyectivo SIGCOM', icon: <Activity size={24} />, image: imgStats, desc: 'Costeo por área productiva y análisis financiero institucional vs Banda MINSAL.', color: '#e74c3c' },
                    { id: 'visor_grd', title: 'Visor Analítico GRD (Próximamente)', icon: <TrendingUp size={24} />, image: imgProduction, desc: 'Análisis de Casuística Hospitalaria, Peso GRD, IMAE e impacto por servicio clínico.', color: '#3498db' }
                  ]}
                />
              )}
              {activeView === 'sigcom' && (
                <SigcomDashboard />
              )}
              {activeView === 'solicitudes_ciudadanas' && (
                <SolicitudesDashboard onBack={() => navigateToView('home')} />
              )}
            </div>
          )}
        </AnimatePresence>
      </main>

      <footer style={{ padding: '60px 40px', background: 'transparent', color: 'var(--text-dark)', marginTop: '80px', textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <p style={{ fontWeight: 700, fontSize: '0.92rem', opacity: 0.9 }}>© 2026 Departamento de Control de Gestión • Hospital Villarrica</p>
        <p style={{ fontSize: '0.75rem', marginTop: '6px', opacity: 0.45, fontWeight: 800, letterSpacing: '1px' }}>BY GPS</p>
      </footer>
    </div>
  );
}

export default App;
