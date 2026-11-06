/**
 * Tiempo de recambio entre pacientes en pabellones electivos.
 *
 * Definición:
 *   Para cada pabellón electivo (1 al 7, excluyendo urgencia) y cada día cerrado,
 *   se ordenan cronológicamente los pacientes efectivamente intervenidos en ese pabellón
 *   según su hora de ingreso a pabellón (`hora_ingreso_cirugia`).
 *   Para cada par consecutivo de pacientes (P_i -> P_{i+1}) en el mismo pabellón y día:
 *     Tiempo de recambio (min) = hora_ingreso_cirugia(P_{i+1}) - hora_salida_cirugia(P_i).
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

export const UMBRAL_RECAMBIO_DEFECTO_MIN = 30;
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

  // Indizar disponibilidad por fecha|pabellon para verificar es_urgencia y horario de apertura
  const dispMap = new Map();
  for (const d of disponibilidad || []) {
    const fecha = (d.fecha || '').substring(0, 10);
    const pab = Number(d.numero_pabellon);
    if (!fecha || !PABELLONES_VALIDOS.includes(pab)) continue;
    dispMap.set(`${fecha}|${pab}`, d);
  }

  // Agrupar cirugías intervenidas por fecha|pabellon
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

    // Descartar registros de madrugada previos a apertura electiva (< 07:00)
    if (ingreso < 420) continue;

    let salida = salidaRaw;
    if (salida < ingreso) salida += 1440; // cruza medianoche

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

    // Ordenar cronológicamente por hora de ingreso (y desempate por salida y orden_cirugia)
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

      // Descartar solapamientos negativos por error de digitación de horas
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
 * Resume un conjunto de eventos de recambio en KPIs principales.
 */
export function resumirRecambios(filas, umbral = UMBRAL_RECAMBIO_DEFECTO_MIN) {
  const n = filas.length;
  if (!n) {
    return {
      n: 0,
      promedio: 0,
      mediana: 0,
      totalMin: 0,
      dentroMeta: 0,
      sobreUmbral: 0,
      pctDentroMeta: 0,
      pctSobreUmbral: 0,
      diasEvaluados: 0
    };
  }
  const suma = filas.reduce((s, f) => s + f.recambio, 0);
  const ordenados = [...filas].map((f) => f.recambio).sort((a, b) => a - b);
  const mid = Math.floor(n / 2);
  const mediana = n % 2 === 0 ? (ordenados[mid - 1] + ordenados[mid]) / 2 : ordenados[mid];
  const dentroMeta = filas.filter((f) => f.recambio <= umbral).length;
  const sobreUmbral = n - dentroMeta;
  const diasEvaluados = new Set(filas.map((f) => `${f.fecha}|${f.pabellon}`)).size;

  return {
    n,
    promedio: suma / n,
    mediana,
    totalMin: suma,
    dentroMeta,
    sobreUmbral,
    pctDentroMeta: (dentroMeta / n) * 100,
    pctSobreUmbral: (sobreUmbral / n) * 100,
    diasEvaluados
  };
}

