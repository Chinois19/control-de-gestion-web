import React, { useState, useRef, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { Pin, ChevronUp, ChevronDown, X } from 'lucide-react';

const cleanVal = (v) => {
  const s = String(v ?? '').trim();
  if (!s || /^(sin rce|n\/a|seg[uú]n desglose)$/i.test(s)) return '';
  return s;
};

export default function GlosaTooltip({ glosa, actividad, rendimiento }) {
  const instanceId = useId();
  const [coords, setCoords] = useState(null);
  const [pinned, setPinned] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const triggerRef = useRef(null);

  const tipoAct = cleanVal(glosa?.tipoActRCE);
  const subAct = cleanVal(glosa?.subActRCE || glosa?.actRCE);
  const grupoRce = cleanVal(glosa?.grupoRCE);
  const hasRce = Boolean(tipoAct || subAct || grupoRce);

  const remRaw = cleanVal(glosa?.rem);
  const remVal = remRaw ? remRaw.replace(/\.0$/, '') : '';
  const rpeVal = cleanVal(glosa?.rpe);
  const descripcion = (glosa?.descripcion && !/^sin descripci[oó]n$/i.test(glosa.descripcion.trim()))
    ? glosa.descripcion.trim()
    : '';

  const rendLabel = rendimiento > 0
    ? `${rendimiento.toLocaleString('es-CL', { maximumFractionDigits: 2 })} / hora`
    : (glosa?.rendimiento ? `${glosa.rendimiento} / hora (ref. MINSAL)` : 'No aplica');

  const tituloActividad = glosa?.actPlanilla || actividad;

  const computeCoords = () => {
    if (!triggerRef.current) return null;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipW = 440;
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - tooltipW - 12));
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openAbove = spaceAbove >= spaceBelow && spaceAbove > 240;

    return {
      left,
      top: openAbove ? undefined : rect.bottom + 8,
      bottom: openAbove ? window.innerHeight - rect.top + 8 : undefined,
      maxHeight: Math.max(220, (openAbove ? spaceAbove : spaceBelow) - 20),
    };
  };

  const handleEnter = () => {
    if (pinned) return;
    setCoords(computeCoords());
  };

  const handleLeave = () => {
    if (pinned) return;
    setCoords(null);
  };

  const handleClickTrigger = (e) => {
    e.stopPropagation();
    if (pinned) {
      setPinned(false);
      setCollapsed(false);
      setCoords(null);
    } else {
      window.dispatchEvent(new CustomEvent('glosa-tooltip-pin', { detail: instanceId }));
      setCoords(computeCoords());
      setPinned(true);
      setCollapsed(false);
    }
  };

  const handleClose = (e) => {
    if (e) e.stopPropagation();
    setPinned(false);
    setCollapsed(false);
    setCoords(null);
  };

  // Escuchar si otra ficha se fija o si se presiona Escape
  useEffect(() => {
    if (!pinned) return;
    const onOtherPin = (ev) => {
      if (ev.detail !== instanceId) {
        setPinned(false);
        setCollapsed(false);
        setCoords(null);
      }
    };
    const onKeyDown = (ev) => {
      if (ev.key === 'Escape') {
        setPinned(false);
        setCollapsed(false);
        setCoords(null);
      }
    };
    window.addEventListener('glosa-tooltip-pin', onOtherPin);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('glosa-tooltip-pin', onOtherPin);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [pinned, instanceId]);

  const isVisible = Boolean(coords);

  return (
    <span
      ref={triggerRef}
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={handleClickTrigger}
      title={pinned ? 'Clic para desfijar ficha técnica' : 'Clic para fijar ficha técnica'}
    >
      <span style={{
        fontSize: '0.82rem',
        color: pinned ? '#4f46e5' : '#334155',
        fontWeight: pinned ? 700 : 400,
        cursor: 'pointer',
        borderBottom: pinned
          ? '2px solid #6366f1'
          : (hasRce ? '1px dashed #6366f1' : '1px dashed #94a3b8'),
        paddingBottom: '1px',
        transition: 'color 0.15s ease',
      }}>
        {actividad}
      </span>

      {isVisible && createPortal(
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            left: `${coords.left}px`,
            top: coords.top !== undefined ? `${coords.top}px` : undefined,
            bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
            maxHeight: `${coords.maxHeight}px`,
            overflowY: collapsed ? 'hidden' : 'auto',
            zIndex: 99999,
            width: '440px',
            maxWidth: 'calc(100vw - 24px)',
            background: '#0f172a',
            color: '#f1f5f9',
            border: pinned ? '1px solid rgba(129,140,248,0.6)' : '1px solid rgba(148,163,184,0.22)',
            borderRadius: '14px',
            boxShadow: pinned
              ? '0 22px 54px rgba(2,6,23,0.68), 0 0 0 2px rgba(99,102,241,0.25)'
              : '0 20px 48px rgba(2,6,23,0.58), 0 0 0 1px rgba(255,255,255,0.04) inset',
            fontSize: '0.77rem',
            lineHeight: '1.55',
            pointerEvents: pinned ? 'auto' : 'none',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '12px 14px 10px 16px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(14,165,233,0.08))',
            borderBottom: collapsed ? 'none' : '1px solid rgba(148,163,184,0.16)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#93c5fd',
                }}>
                  Ficha Técnica de Actividad Programada
                </span>
                {pinned && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    color: '#c7d2fe',
                    background: 'rgba(99,102,241,0.35)',
                    border: '1px solid rgba(129,140,248,0.45)',
                    padding: '1px 6px',
                    borderRadius: '999px',
                  }}>
                    <Pin size={10} /> Fijada
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {rpeVal && (
                  <span style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    color: '#cbd5e1',
                    background: 'rgba(148,163,184,0.18)',
                    padding: '2px 7px',
                    borderRadius: '999px',
                    whiteSpace: 'nowrap',
                    marginRight: pinned ? 4 : 0,
                  }}>
                    RPE {rpeVal}
                  </span>
                )}
                {pinned && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setCollapsed(c => !c); }}
                      title={collapsed ? 'Expandir ficha técnica' : 'Colapsar ficha técnica'}
                      style={{
                        background: 'rgba(148,163,184,0.16)',
                        border: '1px solid rgba(148,163,184,0.25)',
                        color: '#e2e8f0',
                        borderRadius: '6px',
                        width: 24,
                        height: 24,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      title="Cerrar (Esc)"
                      style={{
                        background: 'rgba(239,68,68,0.18)',
                        border: '1px solid rgba(248,113,113,0.3)',
                        color: '#fca5a5',
                        borderRadius: '6px',
                        width: 24,
                        height: 24,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <X size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.3 }}>
              {tituloActividad}
            </div>
          </div>

          {!collapsed && (
            <div style={{ padding: '12px 16px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Registro en RCE */}
              {hasRce ? (
                <div style={{
                  background: 'rgba(30,41,59,0.85)',
                  border: '1px solid rgba(99,102,241,0.28)',
                  borderLeft: '3px solid #38bdf8',
                  borderRadius: '8px',
                  padding: '9px 12px',
                }}>
                  <div style={{
                    fontSize: '0.63rem',
                    fontWeight: 800,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    color: '#94a3b8',
                    marginBottom: '6px',
                  }}>
                    Registro en RCE Especialistas
                  </div>
                  {tipoAct && (
                    <div style={{ display: 'flex', gap: 6, marginBottom: subAct || grupoRce ? 4 : 0 }}>
                      <span style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>
                        <strong style={{ color: '#f87171' }}>*</strong> Tipo Actividad:
                      </span>
                      <span style={{ color: '#38bdf8', fontWeight: 700 }}>{tipoAct}</span>
                    </div>
                  )}
                  {subAct && (
                    <div style={{ display: 'flex', gap: 6, marginBottom: grupoRce ? 4 : 0 }}>
                      <span style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>
                        <strong style={{ color: '#f87171' }}>*</strong> Sub-Actividad:
                      </span>
                      <span style={{ color: '#c4b5fd', fontWeight: 700 }}>{subAct}</span>
                    </div>
                  )}
                  {grupoRce && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>Actividad RCE:</span>
                      <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{grupoRce}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  background: 'rgba(245,158,11,0.09)',
                  border: '1px solid rgba(245,158,11,0.28)',
                  borderLeft: '3px solid #f59e0b',
                  borderRadius: '8px',
                  padding: '9px 12px',
                }}>
                  <div style={{
                    fontSize: '0.64rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#fbbf24',
                    marginBottom: '3px',
                  }}>
                    Sin registro en RCE
                  </div>
                  <div style={{ color: '#fde68a', fontSize: '0.73rem', lineHeight: 1.45 }}>
                    Esta actividad no se registra actualmente en el RCE de especialistas del Hospital de Villarrica.
                  </div>
                </div>
              )}

              {/* Parámetros: Rendimiento + Imputación REM */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{
                  background: 'rgba(30,41,59,0.65)',
                  border: '1px solid rgba(148,163,184,0.14)',
                  borderRadius: '8px',
                  padding: '7px 10px',
                }}>
                  <div style={{ fontSize: '0.61rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 2 }}>
                    Rendimiento Especialidad
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fbbf24' }}>
                    {rendLabel}
                  </div>
                </div>
                <div style={{
                  background: 'rgba(30,41,59,0.65)',
                  border: '1px solid rgba(148,163,184,0.14)',
                  borderRadius: '8px',
                  padding: '7px 10px',
                }}>
                  <div style={{ fontSize: '0.61rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 2 }}>
                    Imputación REM
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: remVal ? '#34d399' : '#94a3b8' }}>
                    {remVal ? `REM ${remVal}` : 'No aplica'}
                  </div>
                </div>
              </div>

              {/* Definición completa */}
              {descripcion && (
                <div style={{
                  borderTop: '1px solid rgba(148,163,184,0.16)',
                  paddingTop: '9px',
                }}>
                  <div style={{
                    fontSize: '0.63rem',
                    fontWeight: 800,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    color: '#94a3b8',
                    marginBottom: '4px',
                  }}>
                    Definición de la Actividad
                  </div>
                  <div style={{ color: '#e2e8f0', fontSize: '0.74rem', lineHeight: 1.55, textAlign: 'justify' }}>
                    {descripcion}
                  </div>
                </div>
              )}

              {/* Hint cuando aún no está fijada */}
              {!pinned && (
                <div style={{
                  fontSize: '0.65rem',
                  color: '#64748b',
                  textAlign: 'right',
                  paddingTop: '2px',
                }}>
                  Clic en la actividad para fijar, copiar o colapsar
                </div>
              )}
            </div>
          )}
        </div>,
        document.body
      )}
    </span>
  );
}
