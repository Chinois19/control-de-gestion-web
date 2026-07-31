import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, ArrowLeft, Stethoscope, Info, Clock, Activity, Users, BookOpen, AlertTriangle, CheckCircle, XCircle, Filter } from 'lucide-react';
import { programacionMedica } from '../data/programacionVillarrica2026';

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const RR_CONFIG = {
  R:  { label: 'Requiere Rendimiento', color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: '✓' },
  NR: { label: 'No Requiere Rendimiento', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '—' },
  'Act. No ident': { label: 'Actividad No Identificada', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: '!' },
};

const PROCESO_COLORS = {
  Ambulatorio: { color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  Quirúrgico: { color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
};

// ─── HELPER ─────────────────────────────────────────────────────────────────
const fmt = (n) => (n || 0).toLocaleString('es-CL');
const fmtH = (n) => `${(n || 0).toLocaleString('es-CL', { maximumFractionDigits: 1 })}h`;

function RRBadge({ rr, size = 'sm' }) {
  const cfg = RR_CONFIG[rr] || RR_CONFIG['Act. No ident'];
  const pad = size === 'sm' ? '2px 8px' : '4px 12px';
  const fs = size === 'sm' ? '0.68rem' : '0.75rem';
  return (
    <span style={{
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33`,
      borderRadius: '20px', padding: pad, fontSize: fs, fontWeight: 700,
      whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '4px'
    }}>
      {cfg.icon} {rr}
    </span>
  );
}

function GlosaTooltip({ glosa, actividad }) {
  const [show, setShow] = useState(false);
  if (!glosa) return <span style={{ fontSize: '0.82rem', color: '#334155' }}>{actividad}</span>;
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span style={{ fontSize: '0.82rem', color: '#334155', cursor: 'help', borderBottom: '1px dashed #6366f1' }}>
        {actividad}
      </span>
      {show && (
        <div style={{
          position: 'absolute', bottom: '100%', left: 0, zIndex: 9999, width: '340px',
          background: '#1e293b', color: '#f1f5f9', borderRadius: '12px', padding: '14px 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)', fontSize: '0.75rem', lineHeight: '1.6',
          marginBottom: '8px',
        }}>
          <div style={{ fontWeight: 800, color: '#818cf8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            📋 Cómo registrar en el aplicativo
          </div>
          {glosa.actPlanilla && (
            <div style={{ marginBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Actividad planilla: </span>
              <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{glosa.actPlanilla}</span>
            </div>
          )}
          {glosa.grupoRCE && glosa.grupoRCE !== 'Sin RCE' && (
            <div style={{ marginBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Grupo RCE: </span>
              <span style={{ color: '#e2e8f0' }}>{glosa.grupoRCE}</span>
            </div>
          )}
          {glosa.actRCE && glosa.actRCE !== 'Sin RCE' && (
            <div style={{ marginBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Actividad RCE: </span>
              <span style={{ color: '#a5b4fc', fontWeight: 600 }}>{glosa.actRCE}</span>
            </div>
          )}
          {glosa.rem && glosa.rem !== 'N/A' && (
            <div style={{ marginBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Serie REM: </span>
              <span style={{ color: '#6ee7b7' }}>{glosa.rem}</span>
            </div>
          )}
          {glosa.descripcion && (
            <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', color: '#94a3b8', fontSize: '0.7rem' }}>
              {glosa.descripcion.substring(0, 200)}{glosa.descripcion.length > 200 ? '...' : ''}
            </div>
          )}
        </div>
      )}
    </span>
  );
}

// ─── ACTIVIDADES TABLE ───────────────────────────────────────────────────────
function ActividadesTable({ actividades, filterRR }) {
  const filtered = filterRR === 'todos' ? actividades : actividades.filter(a => a.rr === filterRR);
  if (!filtered.length) return (
    <div style={{ padding: '16px', color: '#94a3b8', fontSize: '0.82rem', textAlign: 'center' }}>
      No hay actividades para el filtro seleccionado
    </div>
  );
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
        <thead>
          <tr style={{ background: 'rgba(99,102,241,0.06)' }}>
            {['Actividad', 'Proceso', 'Horas Asig.', 'Rendim./h', 'Prod. 1°Sem', 'Prod. 2°Sem', 'Total', 'R.R.'].map(h => (
              <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#64748b', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((act, i) => {
            const rrCfg = RR_CONFIG[act.rr] || RR_CONFIG['Act. No ident'];
            const procCfg = PROCESO_COLORS[act.proceso] || {};
            return (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'transparent' : 'rgba(248,250,252,0.5)' }}>
                <td style={{ padding: '8px 12px', maxWidth: '280px' }}>
                  <GlosaTooltip glosa={act.glosa} actividad={act.actividad} />
                </td>
                <td style={{ padding: '8px 12px' }}>
                  {act.proceso ? (
                    <span style={{ background: procCfg.bg, color: procCfg.color, padding: '2px 8px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 600 }}>
                      {act.proceso}
                    </span>
                  ) : '—'}
                </td>
                <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1e293b' }}>{fmtH(act.horas)}</td>
                <td style={{ padding: '8px 12px', color: '#64748b' }}>{act.rendimiento || '—'}</td>
                <td style={{ padding: '8px 12px', color: act.rr === 'R' ? '#059669' : '#64748b', fontWeight: act.rr === 'R' ? 600 : 400 }}>{fmt(act.prod1Sem)}</td>
                <td style={{ padding: '8px 12px', color: act.rr === 'R' ? '#059669' : '#64748b', fontWeight: act.rr === 'R' ? 600 : 400 }}>{fmt(act.prod2Sem)}</td>
                <td style={{ padding: '8px 12px', fontWeight: 700, color: act.rr === 'R' ? '#1e293b' : '#94a3b8' }}>{fmt(act.prod1Sem + act.prod2Sem)}</td>
                <td style={{ padding: '8px 12px' }}><RRBadge rr={act.rr} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── PROFESIONAL ROW ─────────────────────────────────────────────────────────
function ProfesionalRow({ prof, filterRR }) {
  const [open, setOpen] = useState(false);
  const actsR = prof.actividades.filter(a => a.rr === 'R');
  const totalR = actsR.reduce((s, a) => s + a.prod1Sem + a.prod2Sem, 0);
  const totalNR = prof.actividades.filter(a => a.rr !== 'R').reduce((s, a) => s + a.prod1Sem + a.prod2Sem, 0);
  return (
    <div style={{ borderBottom: '1px solid #f1f5f9' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'grid', gridTemplateColumns: '1fr 80px 90px 90px 90px 90px 100px',
          alignItems: 'center', padding: '10px 16px', cursor: 'pointer',
          gap: '12px', background: open ? 'rgba(99,102,241,0.04)' : 'transparent',
          transition: 'background 0.2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChevronRight size={14} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: '0.2s', color: '#6366f1', flexShrink: 0 }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{prof.nombre}</span>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>({prof.actividades.length} actos)</span>
        </div>
        <span style={{ fontSize: '0.82rem', color: '#64748b', textAlign: 'right' }}>{fmtH(prof.totalHorasAsignadas)}</span>
        <span style={{ fontSize: '0.82rem', color: '#64748b', textAlign: 'right' }}>{fmt(prof.prod1Sem)}</span>
        <span style={{ fontSize: '0.82rem', color: '#64748b', textAlign: 'right' }}>{fmt(prof.prod2Sem)}</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', textAlign: 'right' }}>{fmt(prof.totalProd)}</span>
        <span style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 600, textAlign: 'right' }}>{fmt(totalR)}</span>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {actsR.length > 0 && <RRBadge rr="R" />}
          {prof.actividades.some(a => a.rr === 'NR') && <span style={{ marginLeft: '4px' }}><RRBadge rr="NR" /></span>}
        </div>
      </div>
      {open && (
        <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', paddingBottom: '4px' }}>
          <ActividadesTable actividades={prof.actividades} filterRR={filterRR} />
        </div>
      )}
    </div>
  );
}

// ─── ESPECIALIDAD ROW ─────────────────────────────────────────────────────────
function EspecialidadRow({ esp, filterRR }) {
  const [open, setOpen] = useState(false);
  const allActs = esp.profesionales.flatMap(p => p.actividades);
  const totalR = allActs.filter(a => a.rr === 'R').reduce((s, a) => s + a.prod1Sem + a.prod2Sem, 0);
  const pctR = esp.totalProd > 0 ? Math.round((totalR / esp.totalProd) * 100) : 0;

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '8px' }}>
      {/* Header row */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'grid', gridTemplateColumns: '1fr 80px 90px 90px 90px 90px 100px',
          alignItems: 'center', padding: '14px 16px', cursor: 'pointer',
          background: open ? 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(14,165,233,0.04))' : 'white',
          gap: '12px', transition: 'background 0.2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ChevronDown size={16} style={{ transform: open ? 'rotate(180deg)' : 'rotate(-90deg)', transition: '0.2s', color: '#6366f1', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>{esp.nombre}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
              {esp.numProfesionales} profesional{esp.numProfesionales !== 1 ? 'es' : ''}
              {pctR > 0 && <span style={{ color: '#10b981', marginLeft: '8px' }}>• {pctR}% evaluable</span>}
            </div>
          </div>
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4f46e5', textAlign: 'right' }}>{fmtH(esp.totalHorasAsignadas)}</span>
        <span style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'right' }}>{fmt(esp.prod1Sem)}</span>
        <span style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'right' }}>{fmt(esp.prod2Sem)}</span>
        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', textAlign: 'right' }}>{fmt(esp.totalProd)}</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981', textAlign: 'right' }}>{fmt(totalR)}</span>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
          <div style={{
            width: '60px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden'
          }}>
            <div style={{ height: '100%', width: `${pctR}%`, background: '#10b981', borderRadius: '3px', transition: '0.5s' }} />
          </div>
        </div>
      </div>

      {/* Profesionales */}
      {open && (
        <div style={{ background: '#fafbfc', borderTop: '1px solid #e2e8f0' }}>
          {/* Sub-header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 80px 90px 90px 90px 90px 100px',
            gap: '12px', padding: '6px 16px', background: 'rgba(99,102,241,0.04)',
            borderBottom: '1px solid #e2e8f0'
          }}>
            {['Profesional', 'Horas Asig.', '1° Sem', '2° Sem', 'Total', 'Total R', 'R.R.'].map(h => (
              <span key={h} style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', textAlign: h !== 'Profesional' ? 'right' : 'left' }}>{h}</span>
            ))}
          </div>
          {esp.profesionales.map(prof => (
            <ProfesionalRow key={prof.nombre} prof={prof} filterRR={filterRR} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
export default function ProgramacionMedicaDashboard({ onBack }) {
  const [searchEsp, setSearchEsp] = useState('');
  const [filterRR, setFilterRR] = useState('todos');
  const [filterProceso, setFilterProceso] = useState('todos');

  // KPIs globales
  const totalEsp = programacionMedica.length;
  const totalProfs = programacionMedica.reduce((s, e) => s + e.numProfesionales, 0);
  const totalHoras = programacionMedica.reduce((s, e) => s + e.totalHorasAsignadas, 0);
  const totalProd = programacionMedica.reduce((s, e) => s + e.totalProd, 0);
  const totalProd1 = programacionMedica.reduce((s, e) => s + e.prod1Sem, 0);
  const totalProd2 = programacionMedica.reduce((s, e) => s + e.prod2Sem, 0);
  const totalR = programacionMedica.flatMap(e => e.profesionales).flatMap(p => p.actividades)
    .filter(a => a.rr === 'R').reduce((s, a) => s + a.prod1Sem + a.prod2Sem, 0);

  // Filtered data
  const filtered = useMemo(() => {
    let data = programacionMedica;
    if (searchEsp.trim()) {
      const q = searchEsp.toLowerCase();
      data = data.filter(e => e.nombre.toLowerCase().includes(q));
    }
    if (filterProceso !== 'todos') {
      data = data.map(e => ({
        ...e,
        profesionales: e.profesionales.map(p => ({
          ...p,
          actividades: p.actividades.filter(a => a.proceso === filterProceso)
        })).filter(p => p.actividades.length > 0)
      })).filter(e => e.profesionales.length > 0);
    }
    return data;
  }, [searchEsp, filterProceso]);

  const kpis = [
    { label: 'Especialidades', value: totalEsp, icon: <Stethoscope size={20} />, color: '#6366f1' },
    { label: 'Profesionales', value: fmt(totalProfs), icon: <Users size={20} />, color: '#0ea5e9' },
    { label: 'Horas Asignadas', value: fmtH(totalHoras), icon: <Clock size={20} />, color: '#8b5cf6' },
    { label: 'Total Prod. Comprometida', value: fmt(totalProd), icon: <Activity size={20} />, color: '#10b981' },
    { label: '1° Semestre', value: fmt(totalProd1), icon: <Activity size={20} />, color: '#f59e0b' },
    { label: '2° Semestre', value: fmt(totalProd2), icon: <Activity size={20} />, color: '#f59e0b' },
    { label: 'Total Evaluable (R)', value: fmt(totalR), icon: <CheckCircle size={20} />, color: '#10b981' },
  ];

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e40af 100%)',
        padding: '32px 40px 28px', color: 'white', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '100%', background: 'radial-gradient(ellipse at right, rgba(99,102,241,0.3) 0%, transparent 70%)' }} />
        <button onClick={onBack} style={{
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          color: 'white', borderRadius: '10px', padding: '8px 16px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '20px'
        }}>
          <ArrowLeft size={16} /> Volver
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '16px', padding: '16px', backdropFilter: 'blur(10px)' }}>
            <Stethoscope size={32} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>
              Programación Hospital de Villarrica 2026
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>
              Programación Médica
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '8px', fontSize: '0.9rem' }}>
              Programación de especialidades médicas 2026 · Archivo: Programacion.RRHH.230626.xlsx
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginTop: '28px' }}>
          {kpis.map((k, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
              borderRadius: '14px', padding: '16px', border: '1px solid rgba(255,255,255,0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 600 }}>
                <span style={{ color: k.color }}>{k.icon}</span>
                {k.label}
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.5px' }}>{k.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Nota técnica RR */}
      <div style={{
        margin: '24px 40px 0', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
        borderRadius: '12px', padding: '14px 18px', display: 'flex', gap: '12px', alignItems: 'flex-start'
      }}>
        <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.82rem', color: '#92400e', lineHeight: '1.6' }}>
          <strong>Requiere Rendimiento (RR)</strong>: Solo las actividades marcadas como <RRBadge rr="R" size="sm" /> generan compromiso formal de producción evaluable según orientaciones técnicas MINSAL.
          Las actividades <RRBadge rr="NR" size="sm" /> pueden tener producción registrada pero <strong>no serán contempladas en la evaluación final del profesional</strong>.
        </div>
      </div>

      {/* Filtros */}
      <div style={{ margin: '20px 40px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '320px' }}>
          <input
            placeholder="Buscar especialidad..."
            value={searchEsp}
            onChange={e => setSearchEsp(e.target.value)}
            style={{
              width: '100%', padding: '10px 16px 10px 40px', borderRadius: '10px',
              border: '1px solid #e2e8f0', fontSize: '0.88rem', outline: 'none',
              background: 'white', boxSizing: 'border-box'
            }}
          />
          <Filter size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        </div>

        <div style={{ display: 'flex', gap: '6px', background: 'white', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          {['todos', 'R', 'NR'].map(v => (
            <button key={v} onClick={() => setFilterRR(v)} style={{
              padding: '6px 14px', borderRadius: '7px', border: 'none', cursor: 'pointer',
              fontSize: '0.78rem', fontWeight: 700, transition: 'all 0.2s',
              background: filterRR === v ? '#6366f1' : 'transparent',
              color: filterRR === v ? 'white' : '#64748b'
            }}>
              {v === 'todos' ? 'Todos' : v === 'R' ? '✓ Solo R' : '— Solo NR'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '6px', background: 'white', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          {['todos', 'Ambulatorio', 'Quirúrgico'].map(v => (
            <button key={v} onClick={() => setFilterProceso(v)} style={{
              padding: '6px 14px', borderRadius: '7px', border: 'none', cursor: 'pointer',
              fontSize: '0.78rem', fontWeight: 700, transition: 'all 0.2s',
              background: filterProceso === v ? '#1e40af' : 'transparent',
              color: filterProceso === v ? 'white' : '#64748b'
            }}>
              {v === 'todos' ? 'Todo proceso' : v}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', fontSize: '0.82rem', color: '#94a3b8', fontWeight: 500 }}>
          Mostrando {filtered.length} de {totalEsp} especialidades
        </div>
      </div>

      {/* Tabla header */}
      <div style={{ margin: '0 40px', marginBottom: '4px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 80px 90px 90px 90px 90px 100px',
          gap: '12px', padding: '8px 16px', background: 'rgba(99,102,241,0.06)',
          borderRadius: '8px 8px 0 0', border: '1px solid #e2e8f0', borderBottom: 'none'
        }}>
          {['Especialidad / Profesional', 'Horas Asig.', '1° Sem', '2° Sem', 'Total', 'Total R', 'R.R.'].map(h => (
            <span key={h} style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{h}</span>
          ))}
        </div>
      </div>

      {/* Especialidades */}
      <div style={{ margin: '0 40px', paddingBottom: '60px' }}>
        {filtered.map(esp => (
          <EspecialidadRow key={esp.nombre} esp={esp} filterRR={filterRR} />
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', fontSize: '0.92rem' }}>
            No se encontraron especialidades para la búsqueda
          </div>
        )}
      </div>
    </div>
  );
}
