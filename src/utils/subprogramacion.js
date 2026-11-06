/**
 * Subprogramación diaria de pabellón.
 *
 * Definición:
 *   Para cada pabellón y día con disponibilidad, se compara el término de la disponibilidad
 *   (p.ej. 17:00) con la hora de salida de pabellón del ÚLTIMO paciente intervenido ese día.
 *   Subprogramación (min) = término de disponibilidad - hora de salida del último paciente.
 *   Si el valor es negativo (el paciente salió después del término) se registra como
 *   "sobretiempo" y la subprogramación queda en 0.
 *   Un pabellón-día se considera subprogramado (crítico) si supera el umbral (por defecto 60 min).
 *
 * Pabellón de urgencia:
 *   Hasta el 30-09-2026 la urgencia era el pabellón 6; desde el 01-10-2026 es el pabellón 2.
 *   El campo `es_urgencia` de disponibilidad NO es confiable para fechas anteriores al cambio
 *   (marca el P2 como urgencia desde 2025 aunque operaba como pabellón regular), por lo que
 *   la exclusión se hace por fecha.
 */

export const FECHA_CAMBIO_URGENCIA = '2026-10-01';
export const PABELLONES_VALIDOS = [1, 2, 3, 4, 5, 6, 7];
export const UMBRAL_DEFECTO_MIN = 60;

export function esPabellonUrgencia(fecha, pabellon) {
  const p = Number(pabellon);
  return fecha >= FECHA_CAMBIO_URGENCIA ? p === 2 : p === 6;
}

const HHMM = /^(\d{1,2}):(\d{2})/;

export function aMinutos(hhmm) {
  if (!hhmm || typeof hhmm !== 'string') return null;
  const m = HHMM.exec(hhmm.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  if (h > 23 || mi > 59) return null;
  return h * 60 + mi;
}

export function minutosAHHMM(min) {
  if (min === null || min === undefined || Number.isNaN(min)) return '–';
  const total = ((Math.round(min) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function fechaLocalISO(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const esVerdadero = (v) => v === true || v === 'true' || v === 'True' || v === 1;

/**
 * @param {Array} tabla  registros de pabellon_tabla_cached.json
 * @param {Array} disponibilidad registros de pabellon_disponibilidad_cached.json
 * @param {{hoy?: string}} opts hoy (YYYY-MM-DD): solo se evalúan días anteriores a hoy (día cerrado)
 * @returns {Array} filas por pabellón-día
 */
export function calcularSubprogramacion(tabla, disponibilidad, opts = {}) {
  const hoy = opts.hoy || fechaLocalISO();

  // Pacientes intervenidos por fecha|pabellón (excluye eliminadas y pabellón de urgencia)
  const pacientes = new Map();
  for (const r of tabla || []) {
    if (r.estado !== 'Intervenido') continue;
    if (esVerdadero(r.eliminada)) continue;
    if (esVerdadero(r.pabellon_urgencia)) continue;
    const fecha = (r.fecha_programacion || '').substring(0, 10);
    const salidaRaw = aMinutos(r.hora_salida_cirugia);
    if (!fecha || salidaRaw === null) continue;

    let salida = salidaRaw;
    const inicio = aMinutos(r.hora_inicio_cirugia);
    if (inicio !== null && salida < inicio) salida += 1440; // cruza medianoche

    const key = `${fecha}|${Number(r.pabellon)}`;
    if (!pacientes.has(key)) pacientes.set(key, []);
    pacientes.get(key).push({ salida, rec: r });
  }

  const filas = [];
  for (const d of disponibilidad || []) {
    const fecha = (d.fecha || '').substring(0, 10);
    const pab = Number(d.numero_pabellon);
    if (!fecha || fecha >= hoy) continue;
    if (!PABELLONES_VALIDOS.includes(pab)) continue;
    if (esPabellonUrgencia(fecha, pab)) continue;
    if (fecha >= FECHA_CAMBIO_URGENCIA && esVerdadero(d.es_urgencia)) continue;

    const finAm = aMinutos(d.horario_am_termino);
    const finPm = aMinutos(d.horario_pm_termino);
    const ini = [aMinutos(d.horario_am_inicio), aMinutos(d.horario_pm_inicio)].filter((x) => x !== null);
    const fines = [finAm, finPm].filter((x) => x !== null);
    if (fines.length === 0) continue; // sin disponibilidad ese día
    const fin = Math.max(...fines);

    // Regla: No calcular si el pabellón solo tiene disponibilidad hasta las 13:00 (solo AM)
    if (fin <= 780) continue;

    // Se descartan salidas anteriores al inicio de la disponibilidad (cirugías de madrugada
    // del turno previo registradas en este pabellón).
    const desde = ini.length ? Math.min(...ini) : null;
    const delDia = (pacientes.get(`${fecha}|${pab}`) || []).filter((p) => desde === null || p.salida >= desde);
    let u = null;
    if (delDia.length) {
      const mejor = delDia.reduce((a, b) => (b.salida > a.salida ? b : a));
      u = { salida: mejor.salida, rec: mejor.rec, n: delDia.length };
    }

    // Regla: No calcular si no tiene cirugías o si solo tuvo cirugías AM (última salida <= 13:00)
    if (!u || u.salida <= 780) continue;

    const [y, m, dd] = fecha.split('-').map(Number);
    const base = {
      fecha,
      anio: y,
      mes: m,
      mesKey: fecha.substring(0, 7),
      diaSemana: new Date(y, m - 1, dd).getDay(), // 0=Dom
      pabellon: pab,
      disponibleDesde: ini.length ? Math.min(...ini) : null,
      disponibleHasta: fin,
      especialidadDisp: d.especialidad_pm || d.especialidad_am || ''
    };

    const delta = fin - u.salida;
    filas.push({
      ...base,
      estado: 'evaluado',
      subprogramacion: Math.max(0, delta),
      sobretiempo: delta < 0 ? -delta : 0,
      ultimaSalida: u.salida,
      nCirugias: u.n,
      especialidad: u.rec.especialidad || base.especialidadDisp || 'Sin especialidad',
      cirujano: u.rec.cirujano || ''
    });
  }

  filas.sort((a, b) => (a.fecha === b.fecha ? a.pabellon - b.pabellon : a.fecha < b.fecha ? -1 : 1));
  return filas;
}

/** Agrega un conjunto de filas "evaluado" en métricas resumen. */
export function resumir(filas, umbral = UMBRAL_DEFECTO_MIN) {
  const ev = filas.filter((f) => f.estado === 'evaluado');
  const n = ev.length;
  const suma = ev.reduce((s, f) => s + f.subprogramacion, 0);
  const criticos = ev.filter((f) => f.subprogramacion >= umbral).length;
  return {
    n,
    promedio: n ? suma / n : 0,
    totalMin: suma,
    criticos,
    pctCriticos: n ? (criticos / n) * 100 : 0,
    conSobretiempo: ev.filter((f) => f.sobretiempo > 0).length
  };
}
