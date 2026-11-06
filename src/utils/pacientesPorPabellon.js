/**
 * Rendimiento Quirúrgico: Número promedio de pacientes por pabellón electivo.
 *
 * Definición:
 *   Para cada pabellón electivo (1 al 7, excluyendo el pabellón de urgencia) y cada día cerrado
 *   con actividad quirúrgica electiva, contabiliza el número de pacientes efectivamente intervenidos
 *   (además de los programados y suspendidos para análisis de aprovechamiento de tabla).
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

export const META_PACIENTES_DEFECTO = 4;

const esVerdadero = (v) => v === true || v === 'true' || v === 'True' || v === 1;

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

  // Indizar disponibilidad por fecha|pabellon
  const dispMap = new Map();
  for (const d of disponibilidad || []) {
    const fecha = (d.fecha || '').substring(0, 10);
    const pab = Number(d.numero_pabellon);
    if (!fecha || !PABELLONES_VALIDOS.includes(pab)) continue;
    dispMap.set(`${fecha}|${pab}`, d);
  }

  // Agrupar registros de tabla por fecha|pabellon
  const grupos = new Map();
  for (const r of tabla || []) {
    if (esVerdadero(r.eliminada)) continue;
    if (esVerdadero(r.pabellon_urgencia)) continue;

    const fecha = (r.fecha_programacion || '').substring(0, 10);
    const pab = Number(r.pabellon);
    if (!fecha || fecha >= hoy) continue;
    if (!PABELLONES_VALIDOS.includes(pab)) continue;
    if (esPabellonUrgencia(fecha, pab)) continue;

    const d = dispMap.get(`${fecha}|${pab}`);
    if (fecha >= FECHA_CAMBIO_URGENCIA && d && esVerdadero(d.es_urgencia)) continue;

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
    if (nPacientes === 0) continue; // Día quirúrgico activo (al menos 1 paciente intervenido)

    const [fecha, pabStr] = key.split('|');
    const pab = Number(pabStr);
    const [y, m, dd] = fecha.split('-').map(Number);
    const diaSemana = new Date(y, m - 1, dd).getDay();
    const mesKey = fecha.substring(0, 7);

    // Determinar especialidad predominante del pabellón-día y desglose por jornada y tipo de cirugía
    const conteoEsp = new Map();
    let nAM = 0;
    let nPM = 0;
    let nMayor = 0;
    let nCMA = 0;
    let nMenor = 0;
    let duracionMinTotal = 0;
    let conDuracion = 0;

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
    const esJornadaCompleta = disponibleHasta ? disponibleHasta > 780 : (nPM > 0);

    filas.push({
      fecha,
      anio: y,
      mes: m,
      mesKey,
      diaSemana,
      pabellon: pab,
      nPacientes,
      nProgramados: g.programados,
      nSuspendidos: g.suspendidos,
      nAM,
      nPM,
      nMayor,
      nCMA,
      nMenor,
      pctCMA: (nCMA / nPacientes) * 100,
      especialidad: especialidadPrincipal,
      esJornadaCompleta,
      duracionPromedioMin: conDuracion ? duracionMinTotal / conDuracion : null
    });
  }

  filas.sort((a, b) => (a.fecha === b.fecha ? a.pabellon - b.pabellon : a.fecha < b.fecha ? -1 : 1));
  return filas;
}

/**
 * Resume un conjunto de pabellón-días en métricas de rendimiento quirúrgico.
 */
export function resumirPacientesPorPabellon(filas, meta = META_PACIENTES_DEFECTO) {
  const nDiasPabellon = filas.length;
  if (!nDiasPabellon) {
    return {
      nDiasPabellon: 0,
      diasCalendario: 0,
      totalPacientes: 0,
      totalProgramados: 0,
      totalSuspendidos: 0,
      promedio: 0,
      mediana: 0,
      maxPacientes: 0,
      cumplenMeta: 0,
      pctCumplenMeta: 0,
      bajaProduccion: 0,
      pctBajaProduccion: 0,
      pctCMA: 0,
      promedioJornadaCompleta: 0
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

  const cumplenMeta = filas.filter((f) => f.nPacientes >= meta).length;
  const bajaProduccion = filas.filter((f) => f.nPacientes <= 2).length;
  const diasCalendario = new Set(filas.map((f) => f.fecha)).size;

  const completas = filas.filter((f) => f.esJornadaCompleta);
  const promedioJornadaCompleta = completas.length
    ? completas.reduce((s, f) => s + f.nPacientes, 0) / completas.length
    : 0;

  return {
    nDiasPabellon,
    diasCalendario,
    totalPacientes,
    totalProgramados,
    totalSuspendidos,
    promedio: totalPacientes / nDiasPabellon,
    mediana,
    maxPacientes,
    cumplenMeta,
    pctCumplenMeta: (cumplenMeta / nDiasPabellon) * 100,
    bajaProduccion,
    pctBajaProduccion: (bajaProduccion / nDiasPabellon) * 100,
    pctCMA: totalPacientes ? (totalCMA / totalPacientes) * 100 : 0,
    promedioJornadaCompleta
  };
}
