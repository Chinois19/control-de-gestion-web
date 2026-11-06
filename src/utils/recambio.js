/**
 * Tiempo de recambio entre pacientes en pabellones electivos.
 *
 * Estándar Ministerial (MINSAL):
 *   - Ideal: ≤ 15 minutos
 *   - Mínimo aceptable: 16 a 20 minutos (15–20 min)
 *   - Crítico (gestión local): > 20 minutos
 *
 * Exclusión de Pabellón de Urgencia (misma regla que Subprogramación Diaria):
 *   - Antes del 01-10-2026: Pabellón 6 es urgencia.
 *   - Desde el 01-10-2026: Pabellón 2 es urgencia (y se respeta `es_urgencia` / `pabellon_urgencia`).
 */

import {
  FECHA_CAMBIO_URGENCIA,
  PABELLONES_VALIDOS,
  esPabellonUrgencia,
  aMinutos,
  minutosAHHMM,
  fechaLocalISO
} from './subprogramacion';

export {
  FECHA_CAMBIO_URGENCIA,
  PABELLONES_VALIDOS,
  esPabellonUrgencia,
  aMinutos,
  minutosAHHMM,
  fechaLocalISO
};

export const UMBRAL_IDEAL_MIN = 15;
export const UMBRAL_ACEPTABLE_MAX_MIN = 20;
export const UMBRAL_RECAMBIO_DEFECTO_MIN = 20; // > 20 min es crítico
export const TOPE_COLACION_MIN = 180; // >180 min suele corresponder a bloques separados AM/PM sin actividad intermedia

const esVerdadero = (v) => v === true || v === 'true' || v === 'True' || v === 1;

/**
 * Calcula todos los eventos de recambio entre pacientes consecutivos en el mismo pabellón y día.
 *
 * @param {Array} tabla registros de pabellon_tabla_cached.json
 * @param {Array} disponibilidad registros de pabellon_disponibilidad_cached.json
 * @param {{hoy?: string}} opts
 * @returns {Array} lista de recambios individuales
 */
export function calcularRecambios(tabla, disponibilidad, opts = {}) {
  const hoy = opts.hoy || fechaLocalISO();

  const dispMap = new Map();
  for (const d of disponibilidad || []) {
    const fecha = (d.fecha || '').substring(0, 10);
    const pab = Number(d.numero_pabellon);
    if (!fecha || !PABELLONES_VALIDOS.includes(pab)) continue;
    dispMap.set(`${fecha}|${pab}`, d);
  }

  const grupos = new Map();
  for (const r of tabla || []) {
    if (r.estado !== 'Intervenido') continue;
    if (esVerdadero(r.eliminada)) continue;
    if (esVerdadero(r.pabellon_urgencia)) continue;

    const fecha = (r.fecha_programacion || '').substring(0, 10);
    const pab = Number(r.pabellon);
    if (!fecha || fecha >= hoy) continue;
    if (!PABELLONES_VALIDOS.includes(pab)) continue;
    if (esPabellonUrgencia(fecha, pab)) continue;

    const d = dispMap.get(`${fecha}|${pab}`);
    if (fecha >= FECHA_CAMBIO_URGENCIA && d && esVerdadero(d.es_urgencia)) continue;

    const ingreso = aMinutos(r.hora_ingreso_cirugia);
    const salidaRaw = aMinutos(r.hora_salida_cirugia);
    if (ingreso === null || salidaRaw === null) continue;

    if (ingreso < 420) continue; // descartar registros previos a 07:00

    let salida = salidaRaw;
    if (salida < ingreso) salida += 1440;

    const key = `${fecha}|${pab}`;
    if (!grupos.has(key)) grupos.set(key, []);
    grupos.get(key).push({
      ingreso,
      salida,
      orden: Number(r.orden_cirugia) || 999,
      jornada: (r.jornada || '').trim().toUpperCase(),
      especialidad: r.especialidad || 'Sin especialidad',
      tipoCirugia: r.tipo_cirugia || '',
      rec: r
    });
  }

  const recambios = [];
  for (const [key, lista] of grupos.entries()) {
    if (lista.length < 2) continue;

    lista.sort((a, b) => a.ingreso - b.ingreso || a.salida - b.salida || a.orden - b.orden);

    const [fecha, pabStr] = key.split('|');
    const pab = Number(pabStr);
    const [y, m, dd] = fecha.split('-').map(Number);
    const diaSemana = new Date(y, m - 1, dd).getDay();
    const mesKey = fecha.substring(0, 7);

    for (let i = 0; i < lista.length - 1; i++) {
      const prev = lista[i];
      const next = lista[i + 1];
      const minRecambio = next.ingreso - prev.salida;

      if (minRecambio < 0) continue;

      const mismaJornada = Boolean(prev.jornada && next.jornada && prev.jornada === next.jornada);
      const cambioJornada = prev.jornada !== next.jornada;

      recambios.push({
        fecha,
        anio: y,
        mes: m,
        mesKey,
        diaSemana,
        pabellon: pab,
        ordenPrev: i + 1,
        ordenNext: i + 2,
        horaSalidaPrev: prev.salida,
        horaIngresoNext: next.ingreso,
        recambio: minRecambio,
        jornadaPrev: prev.jornada,
        jornadaNext: next.jornada,
        mismaJornada,
        cambioJornada,
        especialidadPrev: prev.especialidad,
        especialidadNext: next.especialidad,
        especialidad: next.especialidad || prev.especialidad || 'Sin especialidad',
        mismaEspecialidad: prev.especialidad === next.especialidad,
        totalCirugiasDia: lista.length
      });
    }
  }

  recambios.sort((a, b) => (a.fecha === b.fecha ? (a.pabellon - b.pabellon || a.ordenPrev - b.ordenPrev) : (a.fecha < b.fecha ? -1 : 1)));
  return recambios;
}

/**
 * Resume un conjunto de eventos de recambio bajo el criterio MINSAL:
 *   - Ideal: <= idealMax (15 min)
 *   - Mínimo aceptable: > idealMax y <= aceptableMax (16 a 20 min)
 *   - Crítico: > aceptableMax (> 20 min)
 */
export function resumirRecambios(filas, idealMax = UMBRAL_IDEAL_MIN, aceptableMax = UMBRAL_ACEPTABLE_MAX_MIN) {
  const n = filas.length;
  if (!n) {
    return {
      n: 0,
      promedio: 0,
      mediana: 0,
      totalMin: 0,
      ideales: 0,
      aceptables: 0,
      criticos: 0,
      dentroAceptable: 0,
      pctIdeal: 0,
      pctAceptable: 0,
      pctCritico: 0,
      pctDentroAceptable: 0,
      diasEvaluados: 0
    };
  }
  const suma = filas.reduce((s, f) => s + f.recambio, 0);
  const ordenados = [...filas].map((f) => f.recambio).sort((a, b) => a - b);
  const mid = Math.floor(n / 2);
  const mediana = n % 2 === 0 ? (ordenados[mid - 1] + ordenados[mid]) / 2 : ordenados[mid];

  const ideales = filas.filter((f) => f.recambio <= idealMax).length;
  const aceptables = filas.filter((f) => f.recambio > idealMax && f.recambio <= aceptableMax).length;
  const criticos = filas.filter((f) => f.recambio > aceptableMax).length;
  const dentroAceptable = ideales + aceptables;
  const diasEvaluados = new Set(filas.map((f) => `${f.fecha}|${f.pabellon}`)).size;

  return {
    n,
    promedio: suma / n,
    mediana,
    totalMin: suma,
    ideales,
    aceptables,
    criticos,
    dentroAceptable,
    pctIdeal: (ideales / n) * 100,
    pctAceptable: (aceptables / n) * 100,
    pctCritico: (criticos / n) * 100,
    pctDentroAceptable: (dentroAceptable / n) * 100,
    diasEvaluados
  };
}
