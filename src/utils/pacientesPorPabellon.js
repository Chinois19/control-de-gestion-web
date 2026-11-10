/**
 * Rendimiento Quirúrgico: Número promedio de pacientes por pabellón electivo.
 *
 * Norma Ministerial (MINSAL) según horario de disponibilidad del pabellón:
 *   1. Pabellón Estándar (08:00 a 17:00 hrs):
 *      - Óptimo: 5 a 6 pacientes por jornada
 *      - Destacado / Sobresaliente: > 6 pacientes (7 o más)
 *      - Bajo en programación / resolución: < 5 pacientes (1 a 4)
 *   2. Pabellón Extendido (08:00 a 20:00 hrs, cierre >= 19:00 hrs):
 *      - Óptimo: 6 a 8 pacientes por jornada
 *      - Destacado / Sobresaliente: > 8 pacientes (9 o más)
 *      - Bajo en programación / resolución: < 6 pacientes (1 a 5)
 *
 * Exclusión de Pabellón de Urgencia:
 *   - Hasta el 30-09-2026: el pabellón 6 era el de urgencia.
 *   - Desde el 01-10-2026: el pabellón 2 pasa a ser el de urgencia (y se respeta `es_urgencia` / `pabellon_urgencia`).
 */

import {
  FECHA_CAMBIO_URGENCIA,
  PABELLONES_VALIDOS,
  esPabellonUrgencia,
  aMinutos,
  fechaLocalISO
} from './subprogramacion';

export {
  FECHA_CAMBIO_URGENCIA,
  PABELLONES_VALIDOS,
  esPabellonUrgencia,
  aMinutos,
  fechaLocalISO
};

export const META_PACIENTES_17H = { min: 5, max: 6, label: '08:00–17:00 (5–6 pac)' };
export const META_PACIENTES_20H = { min: 6, max: 8, label: '08:00–20:00 (6–8 pac)' };

const esVerdadero = (v) => v === true || v === 'true' || v === 'True' || v === 1;

/**
 * Clasifica un pabellón-día según su bloque horario y número de pacientes.
 * @param {number} nPacientes
 * @param {'17h'|'20h'} regimen
 * @returns {'bajo'|'optimo'|'destacado'}
 */
export function clasificarRendimientoMinsal(nPacientes, regimen = '17h') {
  const minOpt = regimen === '20h' ? META_PACIENTES_20H.min : META_PACIENTES_17H.min;
  const maxOpt = regimen === '20h' ? META_PACIENTES_20H.max : META_PACIENTES_17H.max;
  if (nPacientes < minOpt) return 'bajo';
  if (nPacientes <= maxOpt) return 'optimo';
  return 'destacado';
}

/**
 * Calcula las filas por pabellón-día electivo con actividad quirúrgica.
 *
 * @param {Array} tabla registros de pabellon_tabla_cached.json
 * @param {Array} disponibilidad registros de pabellon_disponibilidad_cached.json
 * @param {{hoy?: string}} opts
 * @returns {Array} lista de pabellón-días evaluados
 */
export function calcularPacientesPorPabellon(tabla, disponibilidad, opts = {}) {
  const hoy = opts.hoy || fechaLocalISO();
  const filtroUrgencia = opts.esUrgencia || 'electivo'; // 'electivo' | 'urgencia' | 'todos'

  const dispMap = new Map();
  for (const d of disponibilidad || []) {
    const fecha = (d.fecha || '').substring(0, 10);
    const pab = Number(d.numero_pabellon);
    if (!fecha || !PABELLONES_VALIDOS.includes(pab)) continue;
    dispMap.set(`${fecha}|${pab}`, d);
  }

  const grupos = new Map();
  for (const r of tabla || []) {
    if (esVerdadero(r.eliminada)) continue;

    const fecha = (r.fecha_programacion || '').substring(0, 10);
    const pab = Number(r.pabellon);
    if (!fecha || fecha >= hoy) continue;
    if (!PABELLONES_VALIDOS.includes(pab)) continue;

    const d = dispMap.get(`${fecha}|${pab}`);
    const esUrg = esVerdadero(r.pabellon_urgencia) || esPabellonUrgencia(fecha, pab) || (fecha >= FECHA_CAMBIO_URGENCIA && d && esVerdadero(d.es_urgencia));
    if (filtroUrgencia === 'electivo' && esUrg) continue;
    if (filtroUrgencia === 'urgencia' && !esUrg) continue;

    const key = `${fecha}|${pab}`;
    if (!grupos.has(key)) {
      grupos.set(key, {
        intervenidos: [],
        suspendidos: 0,
        programados: 0
      });
    }
    const g = grupos.get(key);
    g.programados += 1;
    if (r.estado === 'Intervenido') {
      g.intervenidos.push(r);
    } else if (r.estado === 'Suspendido') {
      g.suspendidos += 1;
    }
  }

  const filas = [];
  for (const [key, g] of grupos.entries()) {
    const nPacientes = g.intervenidos.length;
    if (nPacientes === 0) continue;

    const [fecha, pabStr] = key.split('|');
    const pab = Number(pabStr);
    const [y, m, dd] = fecha.split('-').map(Number);
    const diaSemana = new Date(y, m - 1, dd).getDay();
    const mesKey = fecha.substring(0, 7);

    const conteoEsp = new Map();
    let nAM = 0;
    let nPM = 0;
    let nMayor = 0;
    let nCMA = 0;
    let nMenor = 0;
    let duracionMinTotal = 0;
    let conDuracion = 0;
    let maxSalidaMin = 0;

    for (const r of g.intervenidos) {
      const esp = (r.especialidad || '').trim() || 'Sin especialidad';
      conteoEsp.set(esp, (conteoEsp.get(esp) || 0) + 1);

      const jor = (r.jornada || '').trim().toUpperCase();
      if (jor === 'AM') nAM += 1;
      else if (jor === 'PM') nPM += 1;

      const tc = (r.tipo_cirugia || '').toLowerCase();
      if (tc.includes('amb')) nCMA += 1;
      else if (tc.includes('menor')) nMenor += 1;
      else nMayor += 1;

      const ing = aMinutos(r.hora_ingreso_cirugia);
      const salRaw = aMinutos(r.hora_salida_cirugia);
      if (ing !== null && salRaw !== null) {
        let sal = salRaw;
        if (sal < ing) sal += 1440;
        if (sal > maxSalidaMin) maxSalidaMin = sal;
        const dur = sal - ing;
        if (dur > 0 && dur <= 720) {
          duracionMinTotal += dur;
          conDuracion += 1;
        }
      }
    }

    let especialidadPrincipal = 'Sin especialidad';
    let maxEsp = 0;
    for (const [esp, c] of conteoEsp.entries()) {
      if (c > maxEsp) {
        maxEsp = c;
        especialidadPrincipal = esp;
      }
    }

    const d = dispMap.get(key);
    const finAm = d ? aMinutos(d.horario_am_termino) : null;
    const finPm = d ? aMinutos(d.horario_pm_termino) : null;
    const fines = [finAm, finPm].filter((x) => x !== null);
    const disponibleHasta = fines.length ? Math.max(...fines) : null;

    // Excluir jornadas que solo operan medio día AM (<= 13:00 / 780 min) para evaluar justamente las normas de 08-17 y 08-20
    if (disponibleHasta !== null && disponibleHasta <= 780) continue;
    if (disponibleHasta === null && maxSalidaMin > 0 && maxSalidaMin <= 780 && nPM === 0) continue;

    // Determinar régimen horario: '20h' (08:00 a 20:00, cierre >= 19:00 / 1140 min) vs '17h' (08:00 a 17:00)
    const regimen = (disponibleHasta !== null && disponibleHasta >= 1140) ? '20h' : '17h';
    const metaMin = regimen === '20h' ? META_PACIENTES_20H.min : META_PACIENTES_17H.min;
    const metaMax = regimen === '20h' ? META_PACIENTES_20H.max : META_PACIENTES_17H.max;

    const categoriaRealizada = clasificarRendimientoMinsal(nPacientes, regimen);
    const categoriaProgramada = clasificarRendimientoMinsal(g.programados, regimen);

    filas.push({
      fecha,
      anio: y,
      mes: m,
      mesKey,
      diaSemana,
      pabellon: pab,
      regimen, // '17h' | '20h'
      metaMin,
      metaMax,
      nPacientes,
      nProgramados: g.programados,
      nSuspendidos: g.suspendidos,
      categoriaRealizada, // 'bajo' | 'optimo' | 'destacado'
      categoriaProgramada,
      cumpleNorma: nPacientes >= metaMin,
      cumpleNormaProgramada: g.programados >= metaMin,
      nAM,
      nPM,
      nMayor,
      nCMA,
      nMenor,
      pctCMA: (nCMA / nPacientes) * 100,
      especialidad: especialidadPrincipal,
      disponibleHasta,
      duracionPromedioMin: conDuracion ? duracionMinTotal / conDuracion : null
    });
  }

  filas.sort((a, b) => (a.fecha === b.fecha ? a.pabellon - b.pabellon : a.fecha < b.fecha ? -1 : 1));
  return filas;
}

/**
 * Resume un conjunto de pabellón-días evaluando tanto el estándar 08:00–17:00 (5–6 pac)
 * como el estándar extendido 08:00–20:00 (6–8 pac).
 */
export function resumirPacientesPorPabellon(filas) {
  const nDiasPabellon = filas.length;
  if (!nDiasPabellon) {
    return {
      nDiasPabellon: 0,
      diasCalendario: 0,
      totalPacientes: 0,
      totalProgramados: 0,
      totalSuspendidos: 0,
      promedio: 0,
      promedioProgramados: 0,
      mediana: 0,
      maxPacientes: 0,
      bajos: 0,
      optimos: 0,
      destacados: 0,
      cumplenNorma: 0,
      cumplenNormaProgramada: 0,
      pctBajo: 0,
      pctOptimo: 0,
      pctDestacado: 0,
      pctCumplenNorma: 0,
      pctCumplenNormaProgramada: 0,
      pctCMA: 0,
      n17h: 0,
      prom17h: 0,
      pctCumple17h: 0,
      n20h: 0,
      prom20h: 0,
      pctCumple20h: 0
    };
  }

  const totalPacientes = filas.reduce((s, f) => s + f.nPacientes, 0);
  const totalProgramados = filas.reduce((s, f) => s + f.nProgramados, 0);
  const totalSuspendidos = filas.reduce((s, f) => s + f.nSuspendidos, 0);
  const totalCMA = filas.reduce((s, f) => s + f.nCMA, 0);

  const ordenados = [...filas].map((f) => f.nPacientes).sort((a, b) => a - b);
  const mid = Math.floor(nDiasPabellon / 2);
  const mediana = nDiasPabellon % 2 === 0 ? (ordenados[mid - 1] + ordenados[mid]) / 2 : ordenados[mid];
  const maxPacientes = ordenados[nDiasPabellon - 1];

  const bajos = filas.filter((f) => f.categoriaRealizada === 'bajo').length;
  const optimos = filas.filter((f) => f.categoriaRealizada === 'optimo').length;
  const destacados = filas.filter((f) => f.categoriaRealizada === 'destacado').length;
  const cumplenNorma = optimos + destacados;
  const cumplenNormaProgramada = filas.filter((f) => f.cumpleNormaProgramada).length;
  const diasCalendario = new Set(filas.map((f) => f.fecha)).size;

  const filas17 = filas.filter((f) => f.regimen === '17h');
  const filas20 = filas.filter((f) => f.regimen === '20h');
  const prom17h = filas17.length ? filas17.reduce((s, f) => s + f.nPacientes, 0) / filas17.length : 0;
  const pctCumple17h = filas17.length ? (filas17.filter((f) => f.cumpleNorma).length / filas17.length) * 100 : 0;
  const prom20h = filas20.length ? filas20.reduce((s, f) => s + f.nPacientes, 0) / filas20.length : 0;
  const pctCumple20h = filas20.length ? (filas20.filter((f) => f.cumpleNorma).length / filas20.length) * 100 : 0;

  return {
    nDiasPabellon,
    diasCalendario,
    totalPacientes,
    totalProgramados,
    totalSuspendidos,
    promedio: totalPacientes / nDiasPabellon,
    promedioProgramados: totalProgramados / nDiasPabellon,
    mediana,
    maxPacientes,
    bajos,
    optimos,
    destacados,
    cumplenNorma,
    cumplenNormaProgramada,
    pctBajo: (bajos / nDiasPabellon) * 100,
    pctOptimo: (optimos / nDiasPabellon) * 100,
    pctDestacado: (destacados / nDiasPabellon) * 100,
    pctCumplenNorma: (cumplenNorma / nDiasPabellon) * 100,
    pctCumplenNormaProgramada: (cumplenNormaProgramada / nDiasPabellon) * 100,
    pctCMA: totalPacientes ? (totalCMA / totalPacientes) * 100 : 0,
    n17h: filas17.length,
    prom17h,
    pctCumple17h,
    n20h: filas20.length,
    prom20h,
    pctCumple20h
  };
}
