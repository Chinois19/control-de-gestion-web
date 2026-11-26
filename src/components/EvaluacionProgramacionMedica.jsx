import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronDown, ChevronRight, Stethoscope, Users, Clock, Activity,
  CheckCircle, AlertTriangle, XCircle, Filter, Search, BarChart3,
  Calendar, Award, Layers, Eye, HelpCircle, RefreshCw, Info
} from 'lucide-react';
import GlosaTooltip from './GlosaTooltip';
import { matchesAllTokens } from '../utils/programacionFilters';

const fmt = (n) => Math.round(n || 0).toLocaleString('es-CL');
const fmtH = (n) => `${(n || 0).toLocaleString('es-CL', { maximumFractionDigits: 1 })}h`;
const fmtPct = (n) => `${(n || 0).toFixed(1)}%`;

// Normalización canónica en mayúsculas sin tildes ni signos '?'
const norm = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\?/g, '')
    .replace(/\s+/g, ' ')
    .trim();

// Alias manuales entre nombre de planilla y nombre en RCE (diferencias de escritura o abreviaciones)
const PROF_ALIASES = {
  'INZUNZA NAVARRO JOSE ANTONIO': 'JOSE A INZUNZA NAVARRO',
  'GAPP RIVAS KATHERINA NICOLE': 'KATHARINA NICOLE GAPP RIVAS',
  'THORKELSEN GERMAN': 'GERMAN THORKELSEN THORKELSEN',
  'DE LA MAZA VERA FRANCISCA BELEN': 'FRANCISCA DE LA MAZA VERA',
  'VELASQUEZ GONZALEZ ROBERTO': 'ROBERTO ENRIQUE VELASQUEZ GONZALEZ',
  'SANTANDER MARTINEZ HERNAN': 'HERNAN ENRIQUE SANTANDER MARTINEZ',
};

// Mapea una atención RCE (especialidad + policlinico + profesional) a la Especialidad de la Planilla
function mapRceToPlanillaEsp(r, profProgEsps) {
  const e = norm(r.especialidad);
  const p = norm(r.policlinico);

  // Gestión Oncológica se registra como MEDICINA GENERAL | GESTION ONCOLOGICA en RCE
  if (p.includes('ONCOLOG')) return 'ONCOLOGÍA MÉDICA';

  // Ginecología vs Obstetricia: Policlínico ALTO RIESGO OBSTETRICO -> OBSTETRICIA
  if (e.includes('GINECOLOG') || e.includes('OBSTETRIC')) {
    if (p.includes('OBSTETRIC') || p.includes('ARO')) return 'OBSTETRICIA';
    if (profProgEsps && profProgEsps.has('OBSTETRICIA') && !profProgEsps.has('GINECOLOGÍA ADULTO')) {
      return 'OBSTETRICIA';
    }
    return 'GINECOLOGÍA ADULTO';
  }

  const DIRECT_MAP = {
    'ANESTESIOLOGIA': 'ANESTESIOLOGÍA',
    'CARDIOLOGIA ADULTO': 'CARDIOLOGÍA ADULTO',
    'CARDIOLOGIA': 'CARDIOLOGÍA ADULTO',
    'CIRUGIA DIGESTIVA': 'CIRUGÍA DIGESTIVA (ALTA)',
    'CIRUGIA GENERAL ADULTO': 'CIRUGÍA GENERAL ADULTO',
    'CIRUGIA GENERAL': 'CIRUGÍA GENERAL ADULTO',
    'CIRUGIA PEDIATRICA': 'CIRUGÍA PEDIÁTRICA',
    'CIRUGIA INFANTIL': 'CIRUGÍA PEDIÁTRICA',
    'CIRUGIA PLASTICA Y REPARADORA': 'CIRUGÍA PLÁSTICA Y REPARADORA ADULTO',
    'COLOPROCTOLOGIA': 'COLOPROCTOLOGÍA (CIRUGIA DIGESTIVA BAJA)',
    'DERMATOLOGIA': 'DERMATOLOGÍA',
    'ENDOCRINOLOGIA PEDIATRICA': 'ENDOCRINOLOGÍA PEDIÁTRICA',
    'GASTROENTEROLOGIA ADULTO': 'GASTROENTEROLOGÍA ADULTO',
    'INMUNOLOGIA': 'INMUNOLOGÍA',
    'MASTOLOGIA': 'MASTOLOGÍA',
    'MEDICINA FAMILIAR': 'MEDICINA FAMILIAR',
    'MEDICINA GENERAL': 'MEDICINA GENERAL',
    'MEDICINA INTERNA': 'MEDICINA INTERNA',
    'NEUROLOGIA ADULTO': 'NEUROLOGÍA ADULTO',
    'NEUROLOGIA PEDIATRICA': 'NEUROLOGÍA PEDIÁTRICA',
    'NEUROLOGIA INFANTIL': 'NEUROLOGÍA PEDIÁTRICA',
    'OFTALMOLOGIA': 'OFTALMOLOGÍA',
    'OTORRINOLARINGOLOGIA': 'OTORRINOLARINGOLOGÍA',
    'PEDIATRIA': 'PEDIATRÍA',
    'PSIQUIATRIA ADULTO': 'PSIQUIATRÍA ADULTO',
    'PSIQUIATRIA PEDIATRICA Y DE LA ADOLESCENCIA': 'PSIQUIATRÍA PEDIÁTRICA Y DE LA ADOLESCENCIA',
    'PSIQUIATRIA INFANTIL': 'PSIQUIATRÍA PEDIÁTRICA Y DE LA ADOLESCENCIA',
    'TRAUMATOLOGIA Y ORTOPEDIA': 'TRAUMATOLOGÍA Y ORTOPEDIA ADULTO',
    'TRAUMATOLOGIA Y ORTOPEDIA ADULTO': 'TRAUMATOLOGÍA Y ORTOPEDIA ADULTO',
    'TRAUMATOLOGIA Y ORTOPEDIA PEDIATRICA': 'TRAUMATOLOGÍA Y ORTOPEDIA PEDIÁTRICA',
    'TRAUMATOLOGIA INFANTIL': 'TRAUMATOLOGÍA Y ORTOPEDIA PEDIÁTRICA',
    'UROLOGIA': 'UROLOGÍA ADULTO',
    'UROLOGIA ADULTO': 'UROLOGÍA ADULTO',
  };

  const mapped = DIRECT_MAP[e] || e;
  // Si el profesional solo tiene 1 especialidad programada y el RCE trae una afín (ej. Traumatólogo Infantil viendo Poli Choque), priorizar su especialidad programada si no tiene la otra
  if (profProgEsps && profProgEsps.size === 1 && !profProgEsps.has(mapped)) {
    const onlyEsp = [...profProgEsps][0];
    if (
      (mapped.includes('TRAUMATOLOG') && onlyEsp.includes('TRAUMATOLOG')) ||
      (mapped.includes('CIRUG') && onlyEsp.includes('CIRUG'))
    ) {
      return onlyEsp;
    }
  }
  return mapped;
}

// Clave RCE canónica para una actividad programada (a partir de su glosa) o un registro RCE
function getActRceKey(act) {
  const g = act?.glosa;
  if (!g || !g.tipoActRCE || !g.subActRCE) return '';
  return `${norm(g.tipoActRCE)}|${norm(g.subActRCE)}`;
}

// Normaliza sub-actividades RCE que tienen variantes equivalentes en el Glosario
function normalizeRceRecordKeys(r, includeTeleEquiv) {
  const t = norm(r.tipo_consulta);
  const a = norm(r.actividad);
  if (!t && !a) return [];
  const exact = `${t}|${a}`;
  const keys = [exact];

  // Consultoría Salud Mental: en RCE viene con sufijo '- UNIPROFESIONAL', '- DOS O MAS PROFESIONALES', etc.
  if (t === 'SALUD MENTAL ESPECIALIDAD' && a.startsWith('CONSULTORIA DE SALUD MENTAL ESPECIALIDAD OTORGADA')) {
    const base = 'SALUD MENTAL ESPECIALIDAD|CONSULTORIA DE SALUD MENTAL ESPECIALIDAD OTORGADA';
    if (!keys.includes(base)) keys.push(base);
  }
  // Enlace SM: en Glosario dice 'SALUD MENTAL ESPECIALDIAD/ENLACE' (typo en Excel Glosario)
  if (t === 'SALUD MENTAL ESPECIALIDAD/ENLACE') {
    keys.push(`SALUD MENTAL ESPECIALDIAD/ENLACE|${a}`);
  }
  // Si se activa equivalencia de Teleconsulta <-> Teleinterconsulta Sincrónica
  if (includeTeleEquiv) {
    if (t === 'TELEMEDICINA CONTROL' && a === 'TELECONSULTA CONTROL') {
      keys.push('TELEMEDICINA CONTROL|TELEINTERCONSULTA SINCRONICA CONTROL');
    }
    if (t === 'TELEMEDICINA NUEVA' && a === 'TELECONSULTA NUEVA') {
      keys.push('TELEMEDICINA NUEVA|TELEINTERCONSULTA SINCRONICA NUEVA');
    }
  }
  return keys;
}

// Clasificación de estado de una actividad programada
function classifyAct(act) {
  if (act.rr !== 'R') return 'NR';
  if (!act.glosa) return 'SIN_GLOSA';
  if (!act.glosa.tipoActRCE || !act.glosa.subActRCE) return 'SIN_RCE';
  return 'HOMOLOGADA';
}

const ESTADO_META = {
  HOMOLOGADA: { label: 'Evaluable en RCE', color: '#059669', bg: '#d1fae5', border: '#6ee7b7' },
  SIN_RCE:    { label: 'Sin RCE Especialistas', color: '#b45309', bg: '#fef3c7', border: '#fcd34d' },
  SIN_GLOSA:  { label: 'Sin Glosa en Glosario', color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' },
  NR:         { label: 'No Requiere Rendimiento (NR)', color: '#4f46e5', bg: '#e0e7ff', border: '#a5b4fc' },
};

function semaforoColor(pct) {
  if (pct === null || pct === undefined) return { color: '#64748b', bg: '#f1f5f9', label: 'Sin meta' };
  if (pct >= 100) return { color: '#059669', bg: '#d1fae5', label: 'Cumple (≥100%)' };
  if (pct >= 80)  return { color: '#0284c7', bg: '#e0f2fe', label: 'En rango (80-99%)' };
  if (pct >= 50)  return { color: '#d97706', bg: '#fef3c7', label: 'Bajo (50-79%)' };
  return { color: '#dc2626', bg: '#fee2e2', label: 'Crítico (<50%)' };
}

export default function EvaluacionProgramacionMedica({
  programacionMedica,
  searchEsp,
  searchProf,
  filterProceso,
  filterRR,
}) {
  const [rceData, setRceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Controles de evaluación
  const [periodo, setPeriodo] = useState('anual'); // 'anual' (S1+S2) | 's1' (Ene-Jun) | 's2' (Jul-Dic)
  const [modoMeta, setModoMeta] = useState('completa'); // 'completa' | 'devengada'
  const [filterEstado, setFilterEstado] = useState('HOMOLOGADA'); // 'TODOS' | 'HOMOLOGADA' | 'SIN_RCE' | 'SIN_GLOSA' | 'NR'
  const [filterActKey, setFilterActKey] = useState('TODAS');
  const [includeTeleEquiv, setIncludeTeleEquiv] = useState(true);
  const [selectedProfDetail, setSelectedProfDetail] = useState(null);

  // Carga del caché RCE de Especialistas
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const resGz = await fetch('data/actividades_medicina_cached.json.gz?' + Date.now());
        if (resGz.ok && typeof DecompressionStream !== 'undefined') {
          const ds = new DecompressionStream('gzip');
          const d = await new Response(resGz.body.pipeThrough(ds)).json();
          if (mounted) { setRceData(d); setLoading(false); }
          return;
        }
      } catch (e) {
        console.warn('Fallback a JSON sin comprimir:', e);
      }
      try {
        const res = await fetch('data/actividades_medicina_cached.json?' + Date.now());
        if (!res.ok) throw new Error('No se pudo cargar actividades_medicina_cached.json');
        const d = await res.json();
        if (mounted) setRceData(d);
      } catch (e) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  // Registros RCE solo del año 2026 y dentro del período seleccionado
  const rce2026 = useMemo(() => {
    const recs = rceData?.records || [];
    let maxDate = '2026-01-01';
    const out = [];
    for (const r of recs) {
      const f = String(r.fecha_atencion || '');
      if (!f.startsWith('2026')) continue;
      if (f > maxDate) maxDate = f;
      const mes = parseInt(f.substring(5, 7), 10);
      if (periodo === 's1' && mes > 6) continue;
      if (periodo === 's2' && mes < 7) continue;
      out.push(r);
    }
    return { records: out, maxDate, lastUpdated: rceData?.lastUpdated };
  }, [rceData, periodo]);

  // Factor de meta devengada según fecha máxima de atención en el RCE 2026
  const factorDevengado = useMemo(() => {
    if (modoMeta === 'completa') return 1;
    const maxD = new Date(rce2026.maxDate + 'T00:00:00');
    if (isNaN(maxD)) return 1;
    const start = periodo === 's2' ? new Date('2026-07-01T00:00:00') : new Date('2026-01-01T00:00:00');
    const end = periodo === 's1' ? new Date('2026-06-30T00:00:00') : new Date('2026-12-31T00:00:00');
    if (maxD >= end) return 1;
    if (maxD <= start) return 0;
    const totalDays = (end - start) / 86400000 + 1;
    const elapsedDays = (maxD - start) / 86400000 + 1;
    return Math.min(1, Math.max(0.05, elapsedDays / totalDays));
  }, [modoMeta, rce2026.maxDate, periodo]);

  // Catálogo de actividades homologadas para el filtro selector
  const catalogoActividades = useMemo(() => {
    const map = new Map();
    programacionMedica.forEach(e => e.profesionales.forEach(p => p.actividades.forEach(a => {
      const k = `${a.id}|${norm(a.actividad)}`;
      if (!map.has(k)) {
        map.set(k, {
          key: k,
          id: a.id,
          actividad: a.actividad,
          estado: classifyAct(a),
          rceKey: getActRceKey(a),
          tipoRCE: a.glosa?.tipoActRCE || '',
          subRCE: a.glosa?.subActRCE || '',
        });
      }
    })));
    return [...map.values()].sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }));
  }, [programacionMedica]);

  // Construcción del motor de cruce Planilla (S1 + S2) <-> RCE 2026
  const evalModel = useMemo(() => {
    // 1. Mapa de profesionales programados -> token set y especialidades donde están programados
    const profProgEsps = new Map(); // normProgName -> Set(espName)
    const tokenMap = new Map();     // frozenTokensKey -> normProgName
    const allProgProfs = new Map(); // normProgName -> displayName

    programacionMedica.forEach(e => {
      e.profesionales.forEach(p => {
        const np = norm(p.nombre);
        allProgProfs.set(np, p.nombre);
        if (!profProgEsps.has(np)) profProgEsps.set(np, new Set());
        profProgEsps.get(np).add(e.nombre);
        const tKey = np.split(' ').sort().join('|');
        tokenMap.set(tKey, np);
      });
    });

    // Función que resuelve el nombre RCE al nombre normalizado de la planilla
    const rceNameCache = new Map();
    const resolveRceProf = (rawName) => {
      const nr = norm(rawName);
      if (!nr) return null;
      if (rceNameCache.has(nr)) return rceNameCache.get(nr);

      // a) Coincidencia por alias inverso
      for (const [progN, rceAlias] of Object.entries(PROF_ALIASES)) {
        if (norm(rceAlias) === nr && allProgProfs.has(progN)) {
          rceNameCache.set(nr, progN);
          return progN;
        }
      }
      // b) Coincidencia exacta por conjunto de tokens (independiente del orden Nombres/Apellidos)
      const tKey = nr.split(' ').sort().join('|');
      if (tokenMap.has(tKey)) {
        const found = tokenMap.get(tKey);
        rceNameCache.set(nr, found);
        return found;
      }
      // c) Coincidencia por intersección de al menos 3 tokens (o 2 tokens si el nombre tiene ≤3 tokens)
      const rTokens = nr.split(' ');
      let bestMatch = null;
      let bestScore = 0;
      for (const progN of allProgProfs.keys()) {
        const pTokens = progN.split(' ');
        const common = pTokens.filter(t => rTokens.includes(t)).length;
        if (common >= 3 || (common >= 2 && (pTokens.length <= 3 || rTokens.length <= 3))) {
          if (common > bestScore) {
            bestScore = common;
            bestMatch = progN;
          }
        }
      }
      rceNameCache.set(nr, bestMatch);
      return bestMatch;
    };

    // 2. Indexar producción RCE 2026 por:
    //    - Profesional + Especialidad + Clave RCE (y mes)
    //    - Especialidad + Clave RCE
    //    - Profesional + Especialidad (NSP total complementario y desglose real por Tipo|Sub)
    const profEspKeyStats = new Map(); // `${profNorm}||${esp}||${rceKey}` -> { ejec, nsp, asig, byMonth: {} }
    const profEspRealList = new Map(); // `${profNorm}||${esp}` -> Map(exactTypeSub -> { tipo, sub, policlinico, ejec, nsp, asig })
    const profEspNspTotal = new Map(); // `${profNorm}||${esp}` -> nspCount
    const espNspTotal = new Map();     // `${esp}` -> nspCount

    for (const r of rce2026.records) {
      const progProf = resolveRceProf(r.profesional_nombre);
      const pEsps = progProf ? profProgEsps.get(progProf) : null;
      const mappedEsp = mapRceToPlanillaEsp(r, pEsps);
      const est = norm(r.estado_hora);
      const isEjec = est === 'EJECUTADA';
      const isNsp = est === 'NO SE PRESENTO' || norm(r.estado_atencion) === 'NO SE PRESENTO';
      const isAsig = est === 'ASIGNADA';
      const mes = String(r.fecha_atencion || '').substring(5, 7);

      if (isNsp) {
        espNspTotal.set(mappedEsp, (espNspTotal.get(mappedEsp) || 0) + 1);
        if (progProf) {
          const pk = `${progProf}||${mappedEsp}`;
          profEspNspTotal.set(pk, (profEspNspTotal.get(pk) || 0) + 1);
        }
      }

      const rceKeys = normalizeRceRecordKeys(r, includeTeleEquiv);
      if (progProf) {
        // Guardar detalle real de lo que registra el profesional en el RCE
        const pk = `${progProf}||${mappedEsp}`;
        if (!profEspRealList.has(pk)) profEspRealList.set(pk, new Map());
        const exactLabel = `${r.tipo_consulta || '(Sin Tipo)'} | ${r.actividad || '(Sin Sub-Actividad)'}`;
        const rMap = profEspRealList.get(pk);
        if (!rMap.has(exactLabel)) {
          rMap.set(exactLabel, {
            tipo: r.tipo_consulta || '—',
            sub: r.actividad || '—',
            exactKey: `${norm(r.tipo_consulta)}|${norm(r.actividad)}`,
            policlinicos: new Set(),
            ejec: 0,
            nsp: 0,
            asig: 0,
          });
        }
        const entry = rMap.get(exactLabel);
        if (r.policlinico) entry.policlinicos.add(r.policlinico);
        if (isEjec) entry.ejec += 1;
        else if (isNsp) entry.nsp += 1;
        else if (isAsig) entry.asig += 1;

        for (const rk of rceKeys) {
          const fullK = `${progProf}||${mappedEsp}||${rk}`;
          if (!profEspKeyStats.has(fullK)) {
            profEspKeyStats.set(fullK, { ejec: 0, nsp: 0, asig: 0, byMonth: {} });
          }
          const st = profEspKeyStats.get(fullK);
          if (isEjec) {
            st.ejec += 1;
            st.byMonth[mes] = (st.byMonth[mes] || 0) + 1;
          } else if (isNsp) {
            st.nsp += 1;
          } else if (isAsig) {
            st.asig += 1;
          }
        }
      }
    }

    // 3. Evaluar cada Especialidad -> Profesional -> Actividad de la planilla
    const getMetaBase = (a) => {
      if (periodo === 's1') return a.prod1Sem || 0;
      if (periodo === 's2') return a.prod2Sem || 0;
      return (a.prod1Sem || 0) + (a.prod2Sem || 0);
    };

    const especialidades = [];
    for (const esp of programacionMedica) {
      if (searchEsp.trim() && !esp.nombre.toLowerCase().includes(searchEsp.trim().toLowerCase())) {
        continue;
      }

      const profsEval = [];
      for (const prof of esp.profesionales) {
        if (searchProf.trim() && !matchesAllTokens(prof.nombre, searchProf)) {
          continue;
        }
        const np = norm(prof.nombre);

        // Primero agrupar las metas de actividades homologadas que comparten la misma clave RCE en este profesional
        const keyMetaSum = new Map();
        for (const a of prof.actividades) {
          const rk = getActRceKey(a);
          if (rk && classifyAct(a) === 'HOMOLOGADA') {
            keyMetaSum.set(rk, (keyMetaSum.get(rk) || 0) + getMetaBase(a));
          }
        }

        const actsEval = [];
        const matchedRceKeysForProf = new Set();

        for (const a of prof.actividades) {
          if (filterProceso !== 'todos' && a.proceso !== filterProceso) continue;
          if (filterRR !== 'todos' && a.rr !== filterRR) continue;
          const actCatKey = `${a.id}|${norm(a.actividad)}`;
          if (filterActKey !== 'TODAS' && actCatKey !== filterActKey) continue;

          const estado = classifyAct(a);
          if (filterEstado !== 'TODOS' && estado !== filterEstado) continue;

          const rk = getActRceKey(a);
          const metaAnual = (a.prod1Sem || 0) + (a.prod2Sem || 0);
          const metaPeriodo = getMetaBase(a);
          const metaEval = Math.round(metaPeriodo * factorDevengado);

          let ejec = 0;
          let nsp = 0;
          let asig = 0;
          let byMonth = {};
          let sharedKeyNote = null;

          if (estado === 'HOMOLOGADA' && rk) {
            matchedRceKeysForProf.add(rk);
            const st = profEspKeyStats.get(`${np}||${esp.nombre}||${rk}`);
            const totalKeyMeta = keyMetaSum.get(rk) || 0;
            // Si el profesional tiene 2 actividades programadas con la misma clave RCE (ej. Teleconsulta Nueva + Teleinterconsulta Nueva),
            // repartir proporcionalmente a la meta para no duplicar sus ejecutadas al sumar
            const share = totalKeyMeta > 0 ? (metaPeriodo / totalKeyMeta) : 1;
            if (st) {
              ejec = Math.round(st.ejec * share);
              nsp = Math.round(st.nsp * share);
              asig = Math.round(st.asig * share);
              byMonth = st.byMonth;
            }
            if (share < 0.999 && totalKeyMeta > 0) {
              sharedKeyNote = `Comparte clave RCE (${Math.round(share * 100)}% de la meta de la clave)`;
            }
          }

          const pct = (estado === 'HOMOLOGADA' && metaEval > 0) ? (ejec / metaEval) * 100 : null;
          const brecha = estado === 'HOMOLOGADA' ? (ejec - metaEval) : null;

          actsEval.push({
            ...a,
            estado,
            rceKey: rk,
            meta1Sem: a.prod1Sem || 0,
            meta2Sem: a.prod2Sem || 0,
            metaAnual,
            metaPeriodo,
            metaEval,
            ejec,
            nsp,
            asig,
            pct,
            brecha,
            byMonth,
            sharedKeyNote,
          });
        }

        if (actsEval.length === 0) continue;

        // Producción en RCE de este profesional en claves que NO tiene programadas
        const realMap = profEspRealList.get(`${np}||${esp.nombre}`);
        const realBreakdown = realMap ? [...realMap.values()].map(x => {
          const isIngresoSm = norm(x.tipo) === 'SALUD MENTAL ESPECIALIDAD' && norm(x.sub).includes('(INGRESO)');
          return {
            ...x,
            isIngresoSm,
            policlinicos: [...x.policlinicos].join(', '),
            isProgrammed: matchedRceKeysForProf.has(x.exactKey) ||
              (includeTeleEquiv && x.exactKey === 'TELEMEDICINA CONTROL|TELECONSULTA CONTROL' && matchedRceKeysForProf.has('TELEMEDICINA CONTROL|TELEINTERCONSULTA SINCRONICA CONTROL')) ||
              (includeTeleEquiv && x.exactKey === 'TELEMEDICINA NUEVA|TELECONSULTA NUEVA' && matchedRceKeysForProf.has('TELEMEDICINA NUEVA|TELEINTERCONSULTA SINCRONICA NUEVA')) ||
              (x.exactKey.startsWith('SALUD MENTAL ESPECIALIDAD|CONSULTORIA DE SALUD MENTAL ESPECIALIDAD OTORGADA') && matchedRceKeysForProf.has('SALUD MENTAL ESPECIALIDAD|CONSULTORIA DE SALUD MENTAL ESPECIALIDAD OTORGADA')) ||
              (x.exactKey.startsWith('SALUD MENTAL ESPECIALIDAD/ENLACE|') && matchedRceKeysForProf.has(x.exactKey.replace('ESPECIALIDAD/ENLACE', 'ESPECIALDIAD/ENLACE')))
          };
        }).sort((a, b) => b.ejec - a.ejec) : [];

        const ingresosSm = realBreakdown.filter(x => x.isIngresoSm).reduce((s, x) => s + x.ejec, 0);
        const fueraProgEjec = realBreakdown.filter(x => !x.isProgrammed).reduce((s, x) => s + x.ejec, 0);

        const homActs = actsEval.filter(a => a.estado === 'HOMOLOGADA');
        const meta1SemHom = homActs.reduce((s, a) => s + a.meta1Sem, 0);
        const meta2SemHom = homActs.reduce((s, a) => s + a.meta2Sem, 0);
        const metaEvalHom = homActs.reduce((s, a) => s + a.metaEval, 0);
        const ejecHom = homActs.reduce((s, a) => s + a.ejec, 0);
        const nspHom = homActs.reduce((s, a) => s + a.nsp, 0);
        const nspTotalProf = profEspNspTotal.get(`${np}||${esp.nombre}`) || nspHom;
        const pctHom = metaEvalHom > 0 ? (ejecHom / metaEvalHom) * 100 : null;

        const metaTotalVisible = actsEval.reduce((s, a) => s + a.metaPeriodo, 0);
        const horasVisible = actsEval.reduce((s, a) => s + (a.horas || 0), 0);

        profsEval.push({
          nombre: prof.nombre,
          rut: prof.rut,
          especialidad: esp.nombre,
          horas: horasVisible,
          meta1SemHom,
          meta2SemHom,
          metaEvalHom,
          metaTotalVisible,
          ejecHom,
          nspHom,
          nspTotalProf,
          ingresosSm,
          fueraProgEjec,
          pctHom,
          brechaHom: ejecHom - metaEvalHom,
          actividades: actsEval,
          realBreakdown,
        });
      }

      if (profsEval.length === 0) continue;

      const meta1SemHom = profsEval.reduce((s, p) => s + p.meta1SemHom, 0);
      const meta2SemHom = profsEval.reduce((s, p) => s + p.meta2SemHom, 0);
      const metaEvalHom = profsEval.reduce((s, p) => s + p.metaEvalHom, 0);
      const metaTotalVisible = profsEval.reduce((s, p) => s + p.metaTotalVisible, 0);
      const ejecHom = profsEval.reduce((s, p) => s + p.ejecHom, 0);
      const nspTotalEsp = profsEval.reduce((s, p) => s + p.nspTotalProf, 0);
      const ingresosSmEsp = profsEval.reduce((s, p) => s + (p.ingresosSm || 0), 0);
      const fueraProgEjec = profsEval.reduce((s, p) => s + p.fueraProgEjec, 0);
      const horas = profsEval.reduce((s, p) => s + p.horas, 0);
      const pctHom = metaEvalHom > 0 ? (ejecHom / metaEvalHom) * 100 : null;

      especialidades.push({
        nombre: esp.nombre,
        numProfesionales: profsEval.length,
        horas,
        meta1SemHom,
        meta2SemHom,
        metaEvalHom,
        metaTotalVisible,
        ejecHom,
        nspTotalEsp,
        ingresosSm: ingresosSmEsp,
        fueraProgEjec,
        pctHom,
        brechaHom: ejecHom - metaEvalHom,
        profesionales: profsEval,
      });
    }

    // Totales globales para tarjetas de resumen
    const totMeta1Hom = especialidades.reduce((s, e) => s + e.meta1SemHom, 0);
    const totMeta2Hom = especialidades.reduce((s, e) => s + e.meta2SemHom, 0);
    const totMetaEvalHom = especialidades.reduce((s, e) => s + e.metaEvalHom, 0);
    const totEjecHom = especialidades.reduce((s, e) => s + e.ejecHom, 0);
    const totNsp = especialidades.reduce((s, e) => s + e.nspTotalEsp, 0);
    const totFueraProg = especialidades.reduce((s, e) => s + e.fueraProgEjec, 0);
    const totPct = totMetaEvalHom > 0 ? (totEjecHom / totMetaEvalHom) * 100 : null;

    return {
      especialidades,
      totMeta1Hom,
      totMeta2Hom,
      totMetaEvalHom,
      totEjecHom,
      totNsp,
      totFueraProg,
      totPct,
    };
  }, [
    programacionMedica,
    rce2026.records,
    searchEsp,
    searchProf,
    filterProceso,
    filterRR,
    filterEstado,
    filterActKey,
    periodo,
    factorDevengado,
    includeTeleEquiv,
  ]);

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
        Cargando producción RCE 2026 de especialistas para evaluación...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ margin: '24px 40px', padding: '20px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#991b1b' }}>
        Error al cargar producción RCE: {error}
      </div>
    );
  }

  const gSem = semaforoColor(evalModel.totPct);

  return (
    <div style={{ margin: '0 40px', paddingBottom: '60px' }}>
      {/* Barra superior de criterios de evaluación */}
      <div style={{
        background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px',
        padding: '18px 22px', marginBottom: '18px', boxShadow: '0 4px 14px rgba(15,23,42,0.04)'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                Evaluación Programación vs. Producción RCE 2026
              </span>
              <span style={{
                fontSize: '0.74rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px',
                background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0'
              }}>
                Corte RCE en caché: hasta {rce2026.maxDate} ({fmt(rce2026.records.length)} registros 2026)
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
              <strong>1° Sem:</strong> Reprogramación 19-03-2026 (2).xlsx · <strong>2° Sem:</strong> Programacion.RRHH.230626.xlsx · <strong>Producción:</strong> Estado Hora = <code>EJECUTADA</code> (NSP complementario)
            </div>
          </div>

          {/* Controles de Período y Meta */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              {[
                { id: 'anual', label: 'Año 2026 (1°+2° Sem)' },
                { id: 's1', label: '1° Sem (Ene-Jun)' },
                { id: 's2', label: '2° Sem (Jul-Dic)' },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setPeriodo(p.id)}
                  style={{
                    padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '0.76rem', fontWeight: 700,
                    background: periodo === p.id ? '#1e40af' : 'transparent',
                    color: periodo === p.id ? 'white' : '#475569'
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              {[
                { id: 'completa', label: 'Meta Completa (100%)' },
                { id: 'devengada', label: `Meta Devengada al ${rce2026.maxDate} (${Math.round(factorDevengado * 100)}%)` },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setModoMeta(m.id)}
                  style={{
                    padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '0.76rem', fontWeight: 700,
                    background: modoMeta === m.id ? '#4f46e5' : 'transparent',
                    color: modoMeta === m.id ? 'white' : '#475569'
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Segunda fila: Filtros de Estado de Homologación, Actividad específica y equivalencia Teleconsulta */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center',
          marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Estado actividad:</span>
            {[
              { id: 'HOMOLOGADA', label: '✓ Solo Evaluables RCE (Homologadas)' },
              { id: 'TODOS', label: 'Todas las actividades' },
              { id: 'SIN_RCE', label: 'Sin RCE Especialistas' },
              { id: 'SIN_GLOSA', label: 'Sin Glosa' },
              { id: 'NR', label: 'No Requiere Rendimiento (NR)' },
            ].map(st => (
              <button
                key={st.id}
                onClick={() => setFilterEstado(st.id)}
                style={{
                  padding: '5px 11px', borderRadius: '8px', cursor: 'pointer',
                  fontSize: '0.74rem', fontWeight: 700,
                  border: filterEstado === st.id ? '1.5px solid #4f46e5' : '1px solid #e2e8f0',
                  background: filterEstado === st.id ? 'rgba(79,70,229,0.08)' : 'white',
                  color: filterEstado === st.id ? '#4f46e5' : '#64748b'
                }}
              >
                {st.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Actividad:</span>
            <select
              value={filterActKey}
              onChange={e => setFilterActKey(e.target.value)}
              style={{
                padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1',
                fontSize: '0.76rem', fontWeight: 600, color: '#1e293b', background: 'white', maxWidth: '340px'
              }}
            >
              <option value="TODAS">Todas las actividades ({catalogoActividades.length})</option>
              {catalogoActividades.map(c => (
                <option key={c.key} value={c.key}>
                  [{c.id}] {c.actividad} {c.tipoRCE ? `→ ${c.tipoRCE} | ${c.subRCE}` : `(${ESTADO_META[c.estado]?.label})`}
                </option>
              ))}
            </select>
          </div>

          <label style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem',
            color: '#334155', fontWeight: 600, cursor: 'pointer', marginLeft: 'auto'
          }} title="En el Glosario, 'Telemedicina: Teleconsulta Control' (cod 113) figura como TELEINTERCONSULTA SINCRONICA CONTROL, pero en el RCE los médicos la registran como TELECONSULTA CONTROL. Al marcar esta opción se contabilizan ambas.">
            <input
              type="checkbox"
              checked={includeTeleEquiv}
              onChange={e => setIncludeTeleEquiv(e.target.checked)}
            />
            Incluir <code>TELECONSULTA CONTROL/NUEVA</code> en Telemedicina (112/113)
          </label>
        </div>
      </div>

      {/* Tarjetas de resumen de la vista filtrada */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))',
        gap: '14px', marginBottom: '18px'
      }}>
        <div style={{ background: 'white', borderRadius: '14px', padding: '14px 16px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Meta 1° Sem (Homologada)</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{fmt(evalModel.totMeta1Hom)}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Reprogramación 19-03-2026</div>
        </div>

        <div style={{ background: 'white', borderRadius: '14px', padding: '14px 16px', border: '1px solid #e2e8f0', borderLeft: '4px solid #6366f1' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Meta 2° Sem (Homologada)</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{fmt(evalModel.totMeta2Hom)}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Programacion.RRHH.230626</div>
        </div>

        <div style={{ background: 'white', borderRadius: '14px', padding: '14px 16px', border: '1px solid #e2e8f0', borderLeft: '4px solid #0f172a' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Meta Evaluada ({periodo === 'anual' ? 'Año 2026' : periodo === 's1' ? '1° Sem' : '2° Sem'})
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{fmt(evalModel.totMetaEvalHom)}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
            {modoMeta === 'completa' ? '100% del período' : `Devengada (${Math.round(factorDevengado * 100)}%)`}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '14px', padding: '14px 16px', border: '1px solid #e2e8f0', borderLeft: '4px solid #059669' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Producción Ejecutada RCE</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#059669', marginTop: '4px' }}>{fmt(evalModel.totEjecHom)}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>En claves RCE programadas</div>
        </div>

        <div style={{ background: gSem.bg, borderRadius: '14px', padding: '14px 16px', border: `1px solid ${gSem.color}44`, borderLeft: `4px solid ${gSem.color}` }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: gSem.color, textTransform: 'uppercase' }}>% Cumplimiento Global</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: gSem.color, marginTop: '4px' }}>
            {evalModel.totPct !== null ? fmtPct(evalModel.totPct) : '—'}
          </div>
          <div style={{ fontSize: '0.72rem', color: gSem.color, fontWeight: 600 }}>
            Brecha: {evalModel.totEjecHom - evalModel.totMetaEvalHom >= 0 ? '+' : ''}{fmt(evalModel.totEjecHom - evalModel.totMetaEvalHom)}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '14px', padding: '14px 16px', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>NSP + Fuera de Prog.</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#b45309', marginTop: '4px' }}>
            NSP: {fmt(evalModel.totNsp)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 700 }}>
            +{fmt(evalModel.totFueraProg)} ejec. no programadas
          </div>
        </div>
      </div>

      {/* Encabezado de tabla jerárquica */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 75px 88px 88px 98px 98px 88px 135px 75px',
        gap: '10px', padding: '10px 16px', background: '#1e293b', color: 'white',
        borderRadius: '10px 10px 0 0', fontSize: '0.71rem', fontWeight: 700, textTransform: 'uppercase'
      }}>
        <span>Especialidad / Profesional / Actividad</span>
        <span style={{ textAlign: 'right' }}>Horas</span>
        <span style={{ textAlign: 'right' }}>Meta 1°S</span>
        <span style={{ textAlign: 'right' }}>Meta 2°S</span>
        <span style={{ textAlign: 'right' }}>Meta {modoMeta === 'devengada' ? 'Dev.' : '2026'}</span>
        <span style={{ textAlign: 'right' }}>Ejecutadas</span>
        <span style={{ textAlign: 'right' }}>Brecha</span>
        <span style={{ textAlign: 'right' }}>% Cumplimiento</span>
        <span style={{ textAlign: 'right' }}>NSP (Comp.)</span>
      </div>

      {/* Filas por Especialidad */}
      {evalModel.especialidades.map(esp => (
        <EvalEspecialidadRow
          key={esp.nombre}
          esp={esp}
          autoOpen={searchProf.trim().length > 0 || filterActKey !== 'TODAS'}
          onSelectProf={setSelectedProfDetail}
        />
      ))}

      {evalModel.especialidades.length === 0 && (
        <div style={{ background: 'white', padding: '48px', textAlign: 'center', color: '#94a3b8', borderRadius: '0 0 12px 12px', border: '1px solid #e2e8f0' }}>
          No hay registros para los filtros seleccionados.
        </div>
      )}

      {/* Modal de auditoría detallada por profesional (para control aleatorio de casos) */}
      {selectedProfDetail && (
        <ProfAuditModal
          prof={selectedProfDetail}
          periodo={periodo}
          rceMaxDate={rce2026.maxDate}
          onClose={() => setSelectedProfDetail(null)}
        />
      )}
    </div>
  );
}

// ─── FILA DE ESPECIALIDAD ──────────────────────────────────────────────────
function EvalEspecialidadRow({ esp, autoOpen, onSelectProf }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { if (autoOpen) setOpen(true); }, [autoOpen]);
  const sem = semaforoColor(esp.pctHom);

  return (
    <div style={{ border: '1px solid #e2e8f0', borderTop: 'none', background: 'white' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 75px 88px 88px 98px 98px 88px 135px 75px',
          gap: '10px', padding: '13px 16px', alignItems: 'center', cursor: 'pointer',
          background: open ? 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(14,165,233,0.04))' : 'white',
          borderBottom: open ? '1px solid #e2e8f0' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ChevronDown size={16} style={{ transform: open ? 'rotate(180deg)' : 'rotate(-90deg)', transition: '0.2s', color: '#4f46e5', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>{esp.nombre}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {esp.numProfesionales} profesional{esp.numProfesionales !== 1 ? 'es' : ''}
              {esp.ingresosSm > 0 && (
                <span style={{ color: '#0f766e', marginLeft: '8px', fontWeight: 700, background: '#ccfbf1', padding: '1px 7px', borderRadius: '999px' }}>
                  Ingresos SM (RCE): {fmt(esp.ingresosSm)}
                </span>
              )}
              {esp.fueraProgEjec > 0 && (
                <span style={{ color: '#7c3aed', marginLeft: '8px', fontWeight: 600 }}>
                  • +{fmt(esp.fueraProgEjec)} ejec. fuera de clave programada
                </span>
              )}
            </div>
          </div>
        </div>
        <span style={{ fontSize: '0.83rem', fontWeight: 600, color: '#4f46e5', textAlign: 'right' }}>{fmtH(esp.horas)}</span>
        <span style={{ fontSize: '0.83rem', color: '#475569', textAlign: 'right' }}>{fmt(esp.meta1SemHom)}</span>
        <span style={{ fontSize: '0.83rem', color: '#475569', textAlign: 'right' }}>{fmt(esp.meta2SemHom)}</span>
        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', textAlign: 'right' }}>{fmt(esp.metaEvalHom)}</span>
        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#059669', textAlign: 'right' }}>{fmt(esp.ejecHom)}</span>
        <span style={{
          fontSize: '0.82rem', fontWeight: 700, textAlign: 'right',
          color: esp.brechaHom >= 0 ? '#059669' : '#dc2626'
        }}>
          {esp.metaEvalHom > 0 ? `${esp.brechaHom >= 0 ? '+' : ''}${fmt(esp.brechaHom)}` : '—'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
          <div style={{ width: '54px', height: '7px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, esp.pctHom || 0)}%`,
              background: sem.color,
              borderRadius: '4px'
            }} />
          </div>
          <span style={{
            minWidth: '52px', textAlign: 'right', fontSize: '0.78rem', fontWeight: 800,
            padding: '2px 7px', borderRadius: '999px', background: sem.bg, color: sem.color
          }}>
            {esp.pctHom !== null ? fmtPct(esp.pctHom) : '—'}
          </span>
        </div>
        <span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 700, textAlign: 'right' }}>
          {fmt(esp.nspTotalEsp)}
        </span>
      </div>

      {open && (
        <div style={{ background: '#f8fafc' }}>
          {esp.profesionales.map(prof => (
            <EvalProfesionalRow
              key={prof.nombre}
              prof={prof}
              autoOpen={autoOpen}
              onSelectProf={onSelectProf}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── FILA DE PROFESIONAL ───────────────────────────────────────────────────
function EvalProfesionalRow({ prof, autoOpen, onSelectProf }) {
  const [open, setOpen] = useState(false);
  const [openNoProg, setOpenNoProg] = useState(false);
  useEffect(() => { if (autoOpen) setOpen(true); }, [autoOpen]);
  const sem = semaforoColor(prof.pctHom);
  const totalRceProfEjec = prof.realBreakdown.reduce((s, x) => s + x.ejec, 0);

  return (
    <div style={{ borderBottom: '1px solid #e2e8f0' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 75px 88px 88px 98px 98px 88px 135px 75px',
          gap: '10px', padding: '10px 16px 10px 28px', alignItems: 'center', cursor: 'pointer',
          background: open ? 'rgba(79,70,229,0.05)' : 'transparent'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <ChevronRight size={14} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: '0.2s', color: '#6366f1', flexShrink: 0 }} />
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b' }}>{prof.nombre}</span>
          {prof.rut && (
            <span style={{ fontSize: '0.68rem', color: '#64748b', background: '#e2e8f0', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
              RUN {prof.rut}
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onSelectProf(prof); }}
            style={{
              border: '1px solid #c7d2fe', background: '#eef2ff', color: '#4338ca',
              borderRadius: '6px', padding: '2px 8px', fontSize: '0.68rem', fontWeight: 700,
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px'
            }}
            title="Ver ficha completa de auditoría RCE vs Programación del profesional"
          >
            <Eye size={12} /> Auditar RCE
          </button>
          {prof.ingresosSm > 0 && (
            <span style={{
              fontSize: '0.68rem', background: '#ccfbf1', color: '#0f766e',
              padding: '1px 7px', borderRadius: '999px', fontWeight: 700
            }} title="Registros bajo SALUD MENTAL ESPECIALIDAD cuya subactividad incluye (INGRESO) Uni/Multi/Dos Prof.">
              Ingresos SM: {fmt(prof.ingresosSm)}
            </span>
          )}
          {prof.fueraProgEjec > 0 && (
            <span style={{
              fontSize: '0.68rem', background: '#f3e8ff', color: '#6d28d9',
              padding: '1px 7px', borderRadius: '999px', fontWeight: 700
            }}>
              +{fmt(prof.fueraProgEjec)} ejec. sin prog.{totalRceProfEjec > 0 ? ` (${fmtPct((prof.fueraProgEjec / totalRceProfEjec) * 100)} RCE)` : ''}
            </span>
          )}
        </div>
        <span style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'right' }}>{fmtH(prof.horas)}</span>
        <span style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'right' }}>{fmt(prof.meta1SemHom)}</span>
        <span style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'right' }}>{fmt(prof.meta2SemHom)}</span>
        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', textAlign: 'right' }}>{fmt(prof.metaEvalHom)}</span>
        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#059669', textAlign: 'right' }}>{fmt(prof.ejecHom)}</span>
        <span style={{
          fontSize: '0.8rem', fontWeight: 700, textAlign: 'right',
          color: prof.brechaHom >= 0 ? '#059669' : '#dc2626'
        }}>
          {prof.metaEvalHom > 0 ? `${prof.brechaHom >= 0 ? '+' : ''}${fmt(prof.brechaHom)}` : '—'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
          <div style={{ width: '48px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, prof.pctHom || 0)}%`,
              background: sem.color,
              borderRadius: '3px'
            }} />
          </div>
          <span style={{
            minWidth: '50px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 800,
            padding: '2px 6px', borderRadius: '999px', background: sem.bg, color: sem.color
          }}>
            {prof.pctHom !== null ? fmtPct(prof.pctHom) : '—'}
          </span>
        </div>
        <span style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 600, textAlign: 'right' }}>
          {fmt(prof.nspTotalProf)}
        </span>
      </div>

      {/* Tabla de actividades del profesional */}
      {open && (
        <div style={{ background: 'white', padding: '8px 16px 14px 42px', borderTop: '1px dashed #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', color: '#475569', textTransform: 'uppercase', fontSize: '0.67rem' }}>
                <th style={{ padding: '7px 10px', textAlign: 'left' }}>Actividad Programada</th>
                <th style={{ padding: '7px 10px', textAlign: 'left' }}>Homologación RCE (Tipo | Sub-Actividad)</th>
                <th style={{ padding: '7px 10px', textAlign: 'center' }}>Estado</th>
                <th style={{ padding: '7px 10px', textAlign: 'right' }}>Hrs (S1/S2)</th>
                <th style={{ padding: '7px 10px', textAlign: 'right' }}>Meta 1°S</th>
                <th style={{ padding: '7px 10px', textAlign: 'right' }}>Meta 2°S</th>
                <th style={{ padding: '7px 10px', textAlign: 'right' }}>Meta Eval.</th>
                <th style={{ padding: '7px 10px', textAlign: 'right' }}>Ejecutadas RCE</th>
                <th style={{ padding: '7px 10px', textAlign: 'right' }}>Brecha</th>
                <th style={{ padding: '7px 10px', textAlign: 'right' }}>% Cumpl.</th>
                <th style={{ padding: '7px 10px', textAlign: 'right' }}>NSP</th>
              </tr>
            </thead>
            <tbody>
              {prof.actividades.map((a, idx) => {
                const stMeta = ESTADO_META[a.estado] || ESTADO_META.SIN_GLOSA;
                const aSem = semaforoColor(a.pct);
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '7px 10px', maxWidth: '270px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>#{a.id}</span>
                        <GlosaTooltip glosa={a.glosa} actividad={a.actividad} rendimiento={a.rendimiento} />
                      </div>
                      {a.sharedKeyNote && (
                        <div style={{ fontSize: '0.66rem', color: '#6366f1', marginTop: '2px' }}>{a.sharedKeyNote}</div>
                      )}
                    </td>
                    <td style={{ padding: '7px 10px', color: '#334155', fontSize: '0.73rem' }}>
                      {a.glosa?.tipoActRCE && a.glosa?.subActRCE ? (
                        <span>
                          <strong style={{ color: '#1e40af' }}>{a.glosa.tipoActRCE}</strong>
                          {' → '}
                          <span style={{ color: '#0f172a', fontWeight: 600 }}>{a.glosa.subActRCE}</span>
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No mide por RCE Especialistas</span>
                      )}
                    </td>
                    <td style={{ padding: '7px 10px', textAlign: 'center' }}>
                      <span style={{
                        fontSize: '0.67rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
                        background: stMeta.bg, color: stMeta.color, border: `1px solid ${stMeta.border}`,
                        whiteSpace: 'nowrap'
                      }}>
                        {stMeta.label}
                      </span>
                    </td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {fmtH(a.horas1Sem)} / {fmtH(a.horas2Sem)}
                    </td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', color: '#475569' }}>{fmt(a.meta1Sem)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', color: '#475569' }}>{fmt(a.meta2Sem)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{fmt(a.metaEval)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 800, color: a.estado === 'HOMOLOGADA' ? '#059669' : '#94a3b8' }}>
                      {a.estado === 'HOMOLOGADA' ? fmt(a.ejec) : '—'}
                    </td>
                    <td style={{
                      padding: '7px 10px', textAlign: 'right', fontWeight: 700,
                      color: a.brecha === null ? '#94a3b8' : a.brecha >= 0 ? '#059669' : '#dc2626'
                    }}>
                      {a.brecha !== null ? `${a.brecha >= 0 ? '+' : ''}${fmt(a.brecha)}` : '—'}
                    </td>
                    <td style={{ padding: '7px 10px', textAlign: 'right' }}>
                      {a.pct !== null ? (
                        <span style={{
                          fontSize: '0.73rem', fontWeight: 800, padding: '2px 7px', borderRadius: '999px',
                          background: aSem.bg, color: aSem.color
                        }}>
                          {fmtPct(a.pct)}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', color: '#b45309', fontWeight: 600 }}>
                      {a.estado === 'HOMOLOGADA' ? fmt(a.nsp) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Tabla colapsable de producción RCE registrada en claves no programadas para este profesional */}
          {(() => {
            const noProgItems = prof.realBreakdown.filter(x => !x.isProgrammed && x.ejec > 0);
            if (!noProgItems.length) return null;
            const totalNoProgEjec = noProgItems.reduce((s, x) => s + x.ejec, 0);
            const totalNoProgNsp = noProgItems.reduce((s, x) => s + (x.nsp || 0), 0);
            const pctSobreTotal = totalRceProfEjec > 0 ? (totalNoProgEjec / totalRceProfEjec) * 100 : 0;
            return (
              <div style={{
                marginTop: '12px', borderRadius: '10px', overflow: 'hidden',
                border: '1px solid #ddd6fe', background: '#faf5ff'
              }}>
                <div
                  onClick={() => setOpenNoProg(!openNoProg)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px',
                    padding: '9px 12px', background: 'linear-gradient(90deg, #ede9fe, #f5f3ff)',
                    borderBottom: openNoProg ? '1px solid #ddd6fe' : 'none',
                    cursor: 'pointer', userSelect: 'none'
                  }}
                  title={openNoProg ? 'Colapsar detalle' : 'Expandir detalle de acciones no programadas'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ChevronRight size={15} style={{ transform: openNoProg ? 'rotate(90deg)' : 'none', transition: '0.2s', color: '#6d28d9', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#5b21b6' }}>
                      Producción RCE 2026 en claves NO programadas ({noProgItems.length} {noProgItems.length === 1 ? 'clave' : 'claves'})
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#7c3aed', fontWeight: 600 }}>
                      ({openNoProg ? 'clic para colapsar' : 'clic para ver detalle'})
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.72rem', fontWeight: 700, color: '#6d28d9' }}>
                    <span style={{ background: 'white', padding: '2px 8px', borderRadius: '999px', border: '1px solid #ddd6fe' }}>
                      Total no programado: <strong>{fmt(totalNoProgEjec)}</strong> ejec.
                    </span>
                    {totalRceProfEjec > 0 && (
                      <span style={{ background: '#6d28d9', color: 'white', padding: '2px 9px', borderRadius: '999px' }}>
                        {fmtPct(pctSobreTotal)} de su RCE total ({fmt(totalRceProfEjec)})
                      </span>
                    )}
                  </div>
                </div>
                {openNoProg && (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', background: 'white' }}>
                      <thead>
                        <tr style={{ background: '#f5f3ff', color: '#5b21b6', textTransform: 'uppercase', fontSize: '0.66rem', borderBottom: '1px solid #ede9fe' }}>
                          <th style={{ padding: '6px 10px', textAlign: 'left' }}>Tipo Actividad RCE</th>
                          <th style={{ padding: '6px 10px', textAlign: 'left' }}>Sub-Actividad RCE</th>
                          <th style={{ padding: '6px 10px', textAlign: 'left' }}>Policlínico(s) RCE</th>
                          <th style={{ padding: '6px 10px', textAlign: 'right' }}>Ejecutadas</th>
                          <th style={{ padding: '6px 10px', textAlign: 'right', minWidth: '135px' }}>% del No Prog.</th>
                          <th style={{ padding: '6px 10px', textAlign: 'right' }}>% del Total RCE</th>
                          <th style={{ padding: '6px 10px', textAlign: 'right' }}>NSP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {noProgItems.map((x, i) => {
                          const pctNoProg = totalNoProgEjec > 0 ? (x.ejec / totalNoProgEjec) * 100 : 0;
                          const pctTotalRce = totalRceProfEjec > 0 ? (x.ejec / totalRceProfEjec) * 100 : 0;
                          return (
                            <tr key={i} style={{ borderBottom: '1px solid #f3e8ff', background: i % 2 === 0 ? 'white' : '#fcfaff' }}>
                              <td style={{ padding: '6px 10px', fontWeight: 700, color: '#4c1d95' }}>{x.tipo}</td>
                              <td style={{ padding: '6px 10px', fontWeight: 600, color: '#1e293b' }}>{x.sub}</td>
                              <td style={{ padding: '6px 10px', color: '#64748b', fontSize: '0.71rem' }}>{x.policlinicos || '—'}</td>
                              <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 800, color: '#6d28d9' }}>{fmt(x.ejec)}</td>
                              <td style={{ padding: '6px 10px', textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', justifyContent: 'flex-end' }}>
                                  <div style={{ width: '56px', height: '6px', background: '#ede9fe', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: `${Math.min(100, pctNoProg)}%`, height: '100%', background: '#7c3aed', borderRadius: '3px' }} />
                                  </div>
                                  <span style={{ minWidth: '44px', fontWeight: 800, color: '#5b21b6' }}>{fmtPct(pctNoProg)}</span>
                                </div>
                              </td>
                              <td style={{ padding: '6px 10px', textAlign: 'right', color: '#475569', fontWeight: 600 }}>
                                {fmtPct(pctTotalRce)}
                              </td>
                              <td style={{ padding: '6px 10px', textAlign: 'right', color: '#b45309', fontWeight: 600 }}>
                                {fmt(x.nsp || 0)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {noProgItems.length > 1 && (
                        <tfoot>
                          <tr style={{ background: '#f5f3ff', fontWeight: 800, color: '#4c1d95', borderTop: '1px solid #ddd6fe' }}>
                            <td colSpan={3} style={{ padding: '6px 10px' }}>Total acciones no programadas</td>
                            <td style={{ padding: '6px 10px', textAlign: 'right' }}>{fmt(totalNoProgEjec)}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'right' }}>100.0%</td>
                            <td style={{ padding: '6px 10px', textAlign: 'right' }}>
                              {totalRceProfEjec > 0 ? fmtPct(pctSobreTotal) : '—'}
                            </td>
                            <td style={{ padding: '6px 10px', textAlign: 'right', color: '#b45309' }}>{fmt(totalNoProgNsp)}</td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ─── MODAL DE AUDITORÍA DE CASO POR PROFESIONAL ────────────────────────────
function ProfAuditModal({ prof, periodo, rceMaxDate, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: '24px'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: '18px', maxWidth: '980px', width: '100%',
          maxHeight: '88vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(15,23,42,0.35)', overflow: 'hidden'
        }}
      >
        <div style={{
          padding: '18px 24px', background: 'linear-gradient(135deg, #1e1b4b, #1e40af)',
          color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.75 }}>
              Auditoría de Caso · {prof.especialidad} {prof.rut ? `· RUN ${prof.rut}` : ''}
            </div>
            <h3 style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 800 }}>{prof.nombre}</h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
              width: '34px', height: '34px', borderRadius: '10px', cursor: 'pointer',
              fontSize: '1.1rem', fontWeight: 700
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Resumen numérico del profesional */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>META 1° SEM (HOMOL.)</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{fmt(prof.meta1SemHom)}</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>META 2° SEM (HOMOL.)</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{fmt(prof.meta2SemHom)}</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>META EVALUADA</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e40af' }}>{fmt(prof.metaEvalHom)}</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '10px', background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
              <div style={{ fontSize: '0.7rem', color: '#065f46', fontWeight: 700 }}>EJECUTADAS RCE 2026</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#059669' }}>{fmt(prof.ejecHom)}</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '10px', background: '#fffbeb', border: '1px solid #fde68a' }}>
              <div style={{ fontSize: '0.7rem', color: '#92400e', fontWeight: 700 }}>NSP 2026 (COMPLEM.)</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#b45309' }}>{fmt(prof.nspTotalProf)}</div>
            </div>
          </div>

          {/* 1. Actividades en Planilla de Programación */}
          <div>
            <h4 style={{ margin: '0 0 8px', fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
              1. Actividades comprometidas en Planillas (1° Sem Reprogramación + 2° Sem RRHH)
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', border: '1px solid #e2e8f0' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                  <th style={{ padding: '7px 10px', textAlign: 'left' }}>Cód / Actividad Planilla</th>
                  <th style={{ padding: '7px 10px', textAlign: 'left' }}>Clave RCE (Glosario)</th>
                  <th style={{ padding: '7px 10px', textAlign: 'right' }}>Meta 1°S</th>
                  <th style={{ padding: '7px 10px', textAlign: 'right' }}>Meta 2°S</th>
                  <th style={{ padding: '7px 10px', textAlign: 'right' }}>Meta Año</th>
                  <th style={{ padding: '7px 10px', textAlign: 'right' }}>Ejecutadas</th>
                  <th style={{ padding: '7px 10px', textAlign: 'right' }}>% Cumpl.</th>
                </tr>
              </thead>
              <tbody>
                {prof.actividades.map((a, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '7px 10px', fontWeight: 600 }}>[{a.id}] {a.actividad}</td>
                    <td style={{ padding: '7px 10px', color: '#1e40af' }}>
                      {a.rceKey || <span style={{ color: '#94a3b8' }}>({ESTADO_META[a.estado]?.label})</span>}
                    </td>
                    <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(a.meta1Sem)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(a.meta2Sem)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700 }}>{fmt(a.metaAnual)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                      {a.estado === 'HOMOLOGADA' ? fmt(a.ejec) : '—'}
                    </td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700 }}>
                      {a.pct !== null ? fmtPct(a.pct) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 2. Desglose real de todo lo registrado por el profesional en el RCE en 2026 */}
          <div>
            <h4 style={{ margin: '0 0 8px', fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
              2. Producción real registrada en RCE Especialistas 2026 (corte {rceMaxDate})
            </h4>
            {prof.realBreakdown.length === 0 ? (
              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', color: '#64748b', fontSize: '0.8rem' }}>
                Este profesional no registra atenciones en el RCE de Especialistas en el período seleccionado.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', border: '1px solid #e2e8f0' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                    <th style={{ padding: '7px 10px', textAlign: 'left' }}>Tipo Actividad en RCE</th>
                    <th style={{ padding: '7px 10px', textAlign: 'left' }}>Sub-Actividad en RCE</th>
                    <th style={{ padding: '7px 10px', textAlign: 'left' }}>Policlínico(s) RCE</th>
                    <th style={{ padding: '7px 10px', textAlign: 'center' }}>¿Cruza con Prog.?</th>
                    <th style={{ padding: '7px 10px', textAlign: 'right' }}>Ejecutadas</th>
                    <th style={{ padding: '7px 10px', textAlign: 'right' }}>NSP</th>
                    <th style={{ padding: '7px 10px', textAlign: 'right' }}>Asignadas</th>
                  </tr>
                </thead>
                <tbody>
                  {prof.realBreakdown.map((r, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #e2e8f0', background: r.isProgrammed ? 'white' : '#faf5ff' }}>
                      <td style={{ padding: '7px 10px', fontWeight: 700, color: '#1e293b' }}>{r.tipo}</td>
                      <td style={{ padding: '7px 10px', fontWeight: 600, color: '#0f172a' }}>{r.sub}</td>
                      <td style={{ padding: '7px 10px', color: '#64748b' }}>{r.policlinicos}</td>
                      <td style={{ padding: '7px 10px', textAlign: 'center' }}>
                        {r.isProgrammed ? (
                          <span style={{ background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '999px', fontWeight: 700, fontSize: '0.68rem' }}>
                            ✓ Sí (Programada)
                          </span>
                        ) : r.isIngresoSm ? (
                          <span style={{ background: '#ccfbf1', color: '#0f766e', padding: '2px 8px', borderRadius: '999px', fontWeight: 700, fontSize: '0.68rem' }}>
                            Ingreso SM (RCE)
                          </span>
                        ) : (
                          <span style={{ background: '#f3e8ff', color: '#6d28d9', padding: '2px 8px', borderRadius: '999px', fontWeight: 700, fontSize: '0.68rem' }}>
                            Sin programación
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 800, color: '#059669' }}>{fmt(r.ejec)}</td>
                      <td style={{ padding: '7px 10px', textAlign: 'right', color: '#b45309', fontWeight: 600 }}>{fmt(r.nsp)}</td>
                      <td style={{ padding: '7px 10px', textAlign: 'right', color: '#64748b' }}>{fmt(r.asig)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
