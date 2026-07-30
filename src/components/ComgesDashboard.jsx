import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, Filter, CheckCircle, AlertTriangle, XCircle, Info,
  BookOpen, FileText, ChevronRight, BarChart2, TrendingUp, Calendar,
  Award, Shield, ExternalLink, HelpCircle, Layers, Activity, FileSpreadsheet,
  Download, RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ReferenceLine
} from 'recharts';
import { COMGES_META, COMGES_DOMAINS, COMGES_INDICATORS } from '../data/comges2026Data';

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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
            <CheckCircle className="w-3.5 h-3.5" /> Cumple
          </span>
        );
      case 'En Riesgo':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> En Riesgo
          </span>
        );
      case 'No Cumple':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" /> No Cumple
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 border border-slate-500/30">
            <Info className="w-3.5 h-3.5" /> Sin Dato / Pendiente
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16 font-sans">
      {/* Top Header Banner */}
      <header className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white shadow-xl border-b border-teal-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="mt-1 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center"
                  title="Volver al menú"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {COMGES_META.hospital}
                  </span>
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {COMGES_META.year}
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {COMGES_META.version}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1 text-white flex items-center gap-3">
                  <Award className="w-8 h-8 text-teal-400" />
                  Compromisos de Gestión (COMGES) 2026
                </h1>
                <p className="text-slate-300 text-sm mt-1 max-w-3xl">
                  Evaluación mensual de indicadores, fórmulas de cálculo, metas y orientaciones técnicas emanadas desde el MINSAL.
                </p>
              </div>
            </div>

            {/* Monthly Update Info Box */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/15 text-xs flex flex-col gap-1.5 min-w-[260px]">
              <div className="flex items-center justify-between text-teal-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-400" /> Avance de Carga Base
                </span>
                <span className="bg-teal-400/20 text-teal-200 px-2 py-0.5 rounded font-bold">
                  {COMGES_META.lastUpdatedMonth} 2026
                </span>
              </div>
              <p className="text-slate-300 leading-tight text-[11px]">
                Actualización mensual sincronizada. Próxima carga programada al recibir los archivos de base actualizados.
              </p>
              <div className="flex items-center gap-1 text-[10px] text-teal-400 font-medium">
                <RefreshCw className="w-3 h-3 animate-spin text-teal-400" />
                <span>Estructura lista para ingesta automática de datos</span>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 mt-6 border-t border-white/10 pt-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('indicators')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'indicators'
                  ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              Indicadores Evaluados ({filteredIndicators.length})
            </button>
            <button
              onClick={() => setActiveTab('orientaciones')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'orientaciones'
                  ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Orientaciones Técnicas MINSAL
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'summary'
                  ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              Resumen por Dominios (6 COMGES)
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* KPI Cards Section */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              Total Indicadores <FileText className="w-4 h-4 text-slate-400" />
            </span>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{summaryMetrics.total}</span>
              <span className="text-xs text-slate-500 block mt-0.5">23 COMGES + Monitoreo</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider flex items-center justify-between">
              Cumplen Meta <CheckCircle className="w-4 h-4 text-emerald-500" />
            </span>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{summaryMetrics.cumple}</span>
              <span className="text-xs text-emerald-600/80 font-medium block mt-0.5">{summaryMetrics.cumplePerc}% del total</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider flex items-center justify-between">
              En Riesgo <AlertTriangle className="w-4 h-4 text-amber-500" />
            </span>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">{summaryMetrics.riesgo}</span>
              <span className="text-xs text-slate-500 block mt-0.5">Monitoreo activo</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider flex items-center justify-between">
              No Cumplen <XCircle className="w-4 h-4 text-rose-500" />
            </span>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-rose-600">{summaryMetrics.noCumple}</span>
              <span className="text-xs text-rose-600/80 font-medium block mt-0.5">Plan de mejora</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between col-span-2 md:col-span-1">
            <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider flex items-center justify-between">
              Ponderación MINSAL <Shield className="w-4 h-4 text-teal-500" />
            </span>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-teal-700">100%</span>
              <span className="text-xs text-slate-500 block mt-0.5">6 Dominios evaluados</span>
            </div>
          </div>
        </div>

        {/* TAB 1: INDICATORS EVALUATED */}
        {activeTab === 'indicators' && (
          <div>
            {/* Filter and Search Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por código, nombre, fórmula o definición..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {/* Status Filter buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                  <span className="text-xs font-medium text-slate-500 mr-1 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" /> Estado:
                  </span>
                  <button
                    onClick={() => setSelectedStatus('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedStatus === 'all'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setSelectedStatus('cumple')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedStatus === 'cumple'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    Cumple ({summaryMetrics.cumple})
                  </button>
                  <button
                    onClick={() => setSelectedStatus('riesgo')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedStatus === 'riesgo'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    En Riesgo ({summaryMetrics.riesgo})
                  </button>
                  <button
                    onClick={() => setSelectedStatus('nocumple')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedStatus === 'nocumple'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    No Cumple ({summaryMetrics.noCumple})
                  </button>
                </div>
              </div>

              {/* Domain Pills Filter */}
              <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 pb-1">
                <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Dominio:</span>
                <button
                  onClick={() => setSelectedDomain('all')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedDomain === 'all'
                      ? 'bg-teal-600 text-white shadow'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Todos los Dominios
                </button>
                {COMGES_DOMAINS.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDomain(d.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      selectedDomain === d.id
                        ? 'bg-teal-600 text-white shadow'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></span>
                    {d.code} ({d.weight})
                  </button>
                ))}
              </div>
            </div>

            {/* Indicator Cards List */}
            {filteredIndicators.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                <Info className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">No se encontraron indicadores</h3>
                <p className="text-slate-500 text-sm mt-1">Prueba cambiando el filtro de búsqueda o el dominio seleccionado.</p>
                <button
                  onClick={() => { setSelectedDomain('all'); setSelectedStatus('all'); setSearchQuery(''); }}
                  className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredIndicators.map((ind) => {
                  const domainInfo = COMGES_DOMAINS.find(d => d.id === ind.domainId);
                  return (
                    <motion.div
                      key={ind.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all p-5 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Indicator Top Header */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-900 text-white font-mono">
                              {ind.code}
                            </span>
                            <span
                              className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white"
                              style={{ backgroundColor: domainInfo?.color || '#64748B' }}
                            >
                              {domainInfo?.code} ({ind.ponderacion})
                            </span>
                          </div>
                          {getStatusBadge(ind.summaryYTD?.status)}
                        </div>

                        {/* Indicator Title & Definition */}
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug mt-1">
                          {ind.name}
                        </h3>

                        <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                          {ind.definition}
                        </p>

                        {/* Formula expression box */}
                        <div className="mt-3 bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-xs text-slate-700 font-mono">
                          <span className="text-[10px] text-slate-400 font-sans font-bold uppercase tracking-wider block mb-1">
                            Fórmula MINSAL
                          </span>
                          {ind.formula?.expression || 'Ver fórmula técnica'}
                        </div>
                      </div>

                      {/* Bottom Performance Metrics & Action Button */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-4 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Meta MINSAL</span>
                            <span className="font-bold text-slate-800">{ind.target}</span>
                          </div>
                          <div className="border-l border-slate-200 pl-4">
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Resultado YTD</span>
                            <span className="font-extrabold text-slate-900 text-sm">
                              {ind.summaryYTD?.resultFormatted || '-'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => { setSelectedIndicator(ind); setModalSubTab('minsal'); }}
                          className="px-3.5 py-2 bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border border-teal-200 hover:border-teal-600 shadow-sm"
                        >
                          <BookOpen className="w-3.5 h-3.5" /> Ficha Técnica MINSAL
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-7 h-7 text-teal-600" />
                <h2 className="text-xl font-bold text-slate-900">Orientaciones Técnicas COMGES 2026 - MINSAL</h2>
              </div>
              <p className="text-sm text-slate-600 max-w-4xl leading-relaxed">
                Compendio conceptual y metodológico normado por la Subsecretaría de Redes Asistenciales del Ministerio de Salud para la evaluación de los 6 Compromisos de Gestión institucionales en el Hospital de Villarrica.
              </p>
            </div>

            {/* General Evaluation Framework Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-200">
                <h4 className="font-bold text-teal-900 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-teal-600" /> Ponderación Global (100%)
                </h4>
                <p className="text-xs text-teal-800/80 mt-1 leading-relaxed">
                  Los 6 Compromisos de Gestión agrupan los 23 indicadores normados. Cada compromiso posee una ponderación fija dentro de la evaluación semestral y anual del establecimiento.
                </p>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200">
                <h4 className="font-bold text-blue-900 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" /> Cortes de Evaluación
                </h4>
                <p className="text-xs text-blue-800/80 mt-1 leading-relaxed">
                  Corte 1 (Primer Semestre - Julio) y Corte 2 (Segundo Semestre - Enero siguiente). Se aplican tablas de sensibilidad y descuentos por requisitos no cumplidos.
                </p>
              </div>

              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200">
                <h4 className="font-bold text-purple-900 text-sm flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-purple-600" /> Registro y Fuentes
                </h4>
                <p className="text-xs text-purple-800/80 mt-1 leading-relaxed">
                  Las fuentes de datos validadas son el Sistema SIGGES, SIGTE, REM-A08/A27, Ficha Clínica Electrónica (RCE) y planillas institucionales de control de gestión.
                </p>
              </div>
            </div>

            {/* Accordion list of all 6 Domains and their detailed MINSAL specs */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Estructura por Dominios de Gestión 2026</h3>
              {COMGES_DOMAINS.filter(d => d.id !== 'monitoreo').map((domain) => {
                const domainIndicators = COMGES_INDICATORS.filter(i => i.domainId === domain.id);
                return (
                  <div key={domain.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: domain.color }}></span>
                        <h4 className="font-bold text-slate-900 text-base">{domain.code}: {domain.title}</h4>
                      </div>
                      <span className="px-3 py-1 bg-white border border-slate-300 text-slate-800 rounded-full font-bold text-xs">
                        Ponderación: {domain.weight}
                      </span>
                    </div>
                    <div className="p-4 bg-white space-y-3">
                      <p className="text-xs text-slate-600">{domain.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        {domainIndicators.map(ind => (
                          <div key={ind.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                            <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                              <span>{ind.code}</span>
                              <span className="text-teal-700 font-mono">Meta: {ind.target}</span>
                            </div>
                            <p className="font-semibold text-slate-900">{ind.name}</p>
                            <p className="text-slate-500 mt-1 line-clamp-2">{ind.definition}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: RESUMEN EJECUTIVO POR DOMINIOS */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {COMGES_DOMAINS.map((d) => {
                const inds = COMGES_INDICATORS.filter(i => i.domainId === d.id);
                const cumpleCount = inds.filter(i => i.summaryYTD?.status === 'Cumple').length;
                const noCumpleCount = inds.filter(i => i.summaryYTD?.status === 'No Cumple').length;
                return (
                  <div key={d.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold text-white font-mono" style={{ backgroundColor: d.color }}>
                          {d.code}
                        </span>
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          Ponderación: {d.weight}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug">{d.title}</h3>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">{d.description}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-slate-500 font-medium">Indicadores ({inds.length})</span>
                        <span className="text-emerald-600 font-bold">{cumpleCount} Cumplen</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                        <div
                          className="bg-emerald-500 h-full transition-all"
                          style={{ width: `${inds.length > 0 ? (cumpleCount / inds.length) * 100 : 0}%` }}
                        ></div>
                        <div
                          className="bg-rose-500 h-full transition-all"
                          style={{ width: `${inds.length > 0 ? (noCumpleCount / inds.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* DETAILED FICHA TÉCNICA & EXCEL PERFORMANCE MODAL */}
      <AnimatePresence>
        {selectedIndicator && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-slate-900 to-teal-950 text-white p-6 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold px-2.5 py-0.5 rounded font-mono">
                      {selectedIndicator.code}
                    </span>
                    <span className="bg-white/10 text-slate-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Ponderación: {selectedIndicator.ponderacion}
                    </span>
                    {getStatusBadge(selectedIndicator.summaryYTD?.status)}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 leading-snug">
                    {selectedIndicator.name}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedIndicator(null)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Modal Sub-Tabs */}
              <div className="bg-slate-100 border-b border-slate-200 px-6 pt-3 flex items-center gap-4">
                <button
                  onClick={() => setModalSubTab('minsal')}
                  className={`pb-3 font-bold text-sm transition-all flex items-center gap-2 border-b-2 ${
                    modalSubTab === 'minsal'
                      ? 'border-teal-600 text-teal-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <BookOpen className="w-4 h-4" /> Orientaciones Técnicas MINSAL
                </button>
                <button
                  onClick={() => setModalSubTab('excel')}
                  className={`pb-3 font-bold text-sm transition-all flex items-center gap-2 border-b-2 ${
                    modalSubTab === 'excel'
                      ? 'border-teal-600 text-teal-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" /> Evaluación Mensual (Excel 2026)
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
                {modalSubTab === 'minsal' ? (
                  <div className="space-y-5">
                    {/* Definition */}
                    <div>
                      <h4 className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Info className="w-4 h-4" /> Definición Técnica MINSAL
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                        {selectedIndicator.definition}
                      </p>
                    </div>

                    {/* Strategic Objective */}
                    {selectedIndicator.objective && (
                      <div>
                        <h4 className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
                          Objetivo Estratégico de Gestión
                        </h4>
                        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                          {selectedIndicator.objective}
                        </p>
                      </div>
                    )}

                    {/* Calculation Formula */}
                    <div>
                      <h4 className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <BarChart2 className="w-4 h-4" /> Fórmula de Cálculo
                      </h4>
                      <div className="bg-slate-900 text-slate-100 p-4 rounded-xl space-y-3 font-mono text-xs shadow-inner">
                        <div className="text-teal-300 font-bold text-sm">
                          {selectedIndicator.formula?.expression}
                        </div>
                        <div className="border-t border-slate-700 pt-2 space-y-1 text-slate-300">
                          <p><strong className="text-white">Numerador:</strong> {selectedIndicator.formula?.numerator}</p>
                          <p><strong className="text-white">Denominador:</strong> {selectedIndicator.formula?.denominator}</p>
                        </div>
                      </div>
                    </div>

                    {/* Evaluation Rules & Frequency */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Meta & Umbrales MINSAL
                        </h5>
                        <p className="text-base font-extrabold text-teal-800">{selectedIndicator.target}</p>
                        <p className="text-xs text-slate-500 mt-1">Frecuencia: {selectedIndicator.frequency}</p>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Fuente de Información / Registro
                        </h5>
                        <p className="text-xs text-slate-700 font-medium">{selectedIndicator.dataSource}</p>
                      </div>
                    </div>

                    {/* Evaluation Conditions */}
                    {selectedIndicator.evalRules && (
                      <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 text-xs text-amber-900">
                        <h5 className="font-bold flex items-center gap-1.5 text-amber-950 mb-1">
                          <AlertTriangle className="w-4 h-4 text-amber-600" /> Condiciones y Requisitos de Evaluación
                        </h5>
                        <p className="leading-relaxed">{selectedIndicator.evalRules}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Monthly Excel Data Table */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-teal-600" /> Desglose Mensual 2026 (Planilla Base)
                        </h4>
                        <span className="text-xs text-slate-500">Hospital de Villarrica</span>
                      </div>

                      {selectedIndicator.monthlyData && selectedIndicator.monthlyData.length > 0 ? (
                        <div className="overflow-x-auto border border-slate-200 rounded-xl">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                              <tr>
                                <th className="p-3">Mes</th>
                                <th className="p-3 text-right">Numerador</th>
                                <th className="p-3 text-right">Denominador</th>
                                <th className="p-3 text-right">Resultado %</th>
                                <th className="p-3 text-center">Meta</th>
                                <th className="p-3 text-center">Estado</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 font-medium">
                              {selectedIndicator.monthlyData.map((row, idx) => (
                                <tr key={idx} className={row.month === 'Junio' ? 'bg-teal-50/50' : 'hover:bg-slate-50'}>
                                  <td className="p-3 font-bold text-slate-900">{row.month}</td>
                                  <td className="p-3 text-right font-mono">{row.numerator}</td>
                                  <td className="p-3 text-right font-mono">{row.denominator}</td>
                                  <td className="p-3 text-right font-bold text-slate-900">{row.resultFormatted}</td>
                                  <td className="p-3 text-center text-slate-600">{selectedIndicator.target}</td>
                                  <td className="p-3 text-center">{getStatusBadge(row.status)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
                          <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-xs text-slate-600">
                            Este indicador se evalúa mediante entrega semestral de respaldos / pauta de cotejo. No presenta desglose numérico mensual en la planilla de cálculo.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Notice for Monthly Updates */}
                    <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl text-xs text-teal-900 flex items-start gap-3">
                      <RefreshCw className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-bold text-teal-950 mb-1">Actualizaciones Mensuales de Base</h5>
                        <p className="leading-relaxed">
                          Al momento de cargar un nuevo archivo de base mensual actualizado (ej. Julio, Agosto), este módulo reflejará automáticamente los nuevos numeradores, denominadores y resultados acumulados sin alterar las definiciones técnicas del MINSAL.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-100 border-t border-slate-200 p-4 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">ID: {selectedIndicator.id}</span>
                <button
                  onClick={() => setSelectedIndicator(null)}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
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
