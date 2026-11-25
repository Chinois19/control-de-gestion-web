import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

const cleanVal = (v) => {
  const s = String(v ?? '').trim();
  if (!s || /^(sin rce|n\/a|seg[uú]n desglose)$/i.test(s)) return '';
  return s;
};

export default function GlosaTooltip({ glosa, actividad, rendimiento }) {
  const [coords, setCoords] = useState(null);
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

  const handleEnter = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipW = 440;
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - tooltipW - 12));
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openAbove = spaceAbove >= spaceBelow && spaceAbove > 240;

    setCoords({
      left,
      top: openAbove ? undefined : rect.bottom + 8,
      bottom: openAbove ? window.innerHeight - rect.top + 8 : undefined,
      maxHeight: Math.max(220, (openAbove ? spaceAbove : spaceBelow) - 20),
    });
  };

  return (
    <span
      ref={triggerRef}
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={handleEnter}
      onMouseLeave={() => setCoords(null)}
    >
      <span style={{
        fontSize: '0.82rem',
        color: '#334155',
        cursor: 'help',
        borderBottom: hasRce ? '1px dashed #6366f1' : '1px dashed #94a3b8',
      }}>
        {actividad}
      </span>
      {coords && createPortal(
        <div style={{
          position: 'fixed',
          left: `${coords.left}px`,
          top: coords.top !== undefined ? `${coords.top}px` : undefined,
          bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
          maxHeight: `${coords.maxHeight}px`,
          overflowY: 'auto',
          zIndex: 99999,
          width: '440px',
          maxWidth: 'calc(100vw - 24px)',
          background: '#0f172a',
          color: '#f1f5f9',
          border: '1px solid rgba(148,163,184,0.22)',
          borderRadius: '14px',
          boxShadow: '0 20px 48px rgba(2,6,23,0.58), 0 0 0 1px rgba(255,255,255,0.04) inset',
          fontSize: '0.77rem',
          lineHeight: '1.55',
          pointerEvents: 'none',
        }}>
          {/* Header */}
          <div style={{
            padding: '12px 16px 10px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(14,165,233,0.08))',
            borderBottom: '1px solid rgba(148,163,184,0.16)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
              <span style={{
                fontSize: '0.64rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#93c5fd',
              }}>
                Ficha Técnica de Actividad Programada
              </span>
              {rpeVal && (
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  color: '#cbd5e1',
                  background: 'rgba(148,163,184,0.18)',
                  padding: '2px 7px',
                  borderRadius: '999px',
                  whiteSpace: 'nowrap',
                }}>
                  RPE {rpeVal}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.3 }}>
              {tituloActividad}
            </div>
          </div>

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
          </div>
        </div>,
        document.body
      )}
    </span>
  );
}
