import React, { useState, useMemo, useEffect } from 'react';
import MultiSelectSearch from './MultiSelectSearch';
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
  searchEsp = '',
  setSearchEsp,
  searchProf = '',
  setSearchProf,
  filterProceso = 'todos',
  setFilterProceso,
  availableProcesos = [],
  filterRR = 'todos',
  setFilterRR,
}) {
  const [rceData, setRceData] = useState(null);
  const [usData, setUsData] = useState(null);
  const [pabData, setPabData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Controles de evaluación
  const [periodo, setPeriodo] = useState('anual'); // 'anual' (S1+S2) | 's1' (Ene-Jun) | 's2' (Jul-Dic)
  const [modoMeta, setModoMeta] = useState('completa'); // 'completa' | 'devengada'
  const [filterEstados, setFilterEstados] = useState([]); // [] = Todas las actividades
  const [filterActKeys, setFilterActKeys] = useState([]); // [] = Todas las actividades
  const [includeComprasServicio, setIncludeComprasServicio] = useState(false); // Excluye compras de servicio / no institucional por defecto
  const includeTeleEquiv = true; // Siempre activo por defecto sin mostrar check redundante
  const [selectedProfDetail, setSelectedProfDetail] = useState(null);
  const [focusedEsp, setFocusedEsp] = useState(null);
  const [focusedProf, setFocusedProf] = useState(null);

  // Carga del caché RCE de Especialistas y REDCap Ecografías (Imagenología)
  useEffect(() => {
    let mounted = true;
    async function fetchGzOrJson(gzUrl, jsonUrl) {
      try {
        const resGz = await fetch(gzUrl + '?' + Date.now());
        if (resGz.ok && typeof DecompressionStream !== 'undefined') {
          const ds = new DecompressionStream('gzip');
          return await new Response(resGz.body.pipeThrough(ds)).json();
        }
      } catch (e) {
        console.warn('Fallback a JSON sin comprimir para ' + jsonUrl + ':', e);
      }
      const res = await fetch(jsonUrl + '?' + Date.now());
      if (!res.ok) throw new Error('No se pudo cargar ' + jsonUrl);
      return await res.json();
    }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [rce, us, pab] = await Promise.all([
          fetchGzOrJson('data/actividades_medicina_cached.json.gz', 'data/actividades_medicina_cached.json'),
          fetchGzOrJson('data/ultrasound_cached.json.gz', 'data/ultrasound_cached.json').catch(() => null),
          fetchGzOrJson('data/libro_pabellon_cached.json.gz', 'data/libro_pabellon_cached.json').catch(() => null),
        ]);
        if (mounted) {
          setRceData(rce);
          setUsData(us);
          setPabData(pab);
        }
      } catch (e) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  // Registros REDCap Ecografías (Imagenología) 2026 homologados por apellido
  const usStats2026 = useMemo(() => {
    const recs = usData?.records || [];
    const byProfCode = new Map(); // `${normProf}||${code}` -> { ejec, nsp, byMonth }
    let unprogrammedEjec = 0;

    const matchRadiologo = (rawFunc) => {
      const f = norm(rawFunc);
      if (!f) return null;
      if (f.includes('SAMUR')) return 'SAMUR JACOB ANDRES FELIPE';
      if (f.includes('QUIJANES')) return 'QUIJANES IBACACHE NATALIA';
      if (f.includes('RAVANAL')) return 'RAVANAL PARRA JAVIERA FABIOLA';
      if (f.includes('RIOS')) return 'RIOS HELDT FABIOLA CHRISTI';
      if (f.includes('FRANCO') && f.includes('HERNANDEZ')) return 'HERNANDEZ UGALDE FRANCO ANDRE';
      return null;
    };

    const isInstitucional = (mod) => {
      const m = norm(mod);
      return m === 'INSTITUCIONAL' || m === 'OPERATIVO RADIOLOGICO';
    };

    const classifyExamCode = (examText, procedencia) => {
      const t = norm(examText);
      const isUrg = norm(procedencia) === 'URGENCIA';
      if (/BIOPSIA|PUNCION|MARCACION/.test(t)) return '295';
      if (/DOPPLER|VASCULAR/.test(t)) return isUrg ? '292' : '319';
      return isUrg ? '291' : '318';
    };

    for (const r of recs) {
      const f = r.fecha_de_atenci_n || '';
      if (!f.startsWith('2026-')) continue;
      const m = parseInt(f.slice(5, 7), 10);
      if (periodo === 's1' && m > 6) continue;
      if (periodo === 's2' && m < 7) continue;
      if (!includeComprasServicio && !isInstitucional(r.modalidad_de_atenci_n)) continue;

      const est = norm(r.estado_de_atenci_n);
      const isNsp = est.includes('NSP') || est.includes('NO SE PRESENT');
      const isEjec = !isNsp;

      const exams = [
        r.descripci_n_del_ex_men,
        r.descripci_n_del_ex_men_2,
        r.descripci_n_del_ex_men_3,
        r.descripci_n_del_ex_men_4,
      ].filter(x => x && String(x).trim() !== '');
      const examList = exams.length > 0 ? exams : ['ECOGRAFIA'];

      const progProf = matchRadiologo(r.funcionario_que_atiende);
      if (!progProf) {
        if (isEjec) unprogrammedEjec += examList.length;
        continue;
      }

      const ym = f.slice(0, 7);
      for (const ex of examList) {
        const code = classifyExamCode(ex, r.procedencia_de_derivaci_n);
        const k = `${progProf}||${code}`;
        if (!byProfCode.has(k)) byProfCode.set(k, { ejec: 0, nsp: 0, byMonth: {} });
        const st = byProfCode.get(k);
        if (isEjec) {
          st.ejec++;
          st.byMonth[ym] = (st.byMonth[ym] || 0) + 1;
        } else {
          st.nsp++;
        }
      }
    }
    return { byProfCode, unprogrammedEjec };
  }, [usData, periodo, includeComprasServicio]);

  // Registros Libro de Pabellón Electrónico 2026 vinculados por RUT (cirujano y anestesiólogo)
  const pabStats2026 = useMemo(() => {
    const recs = pabData?.records || [];
    const byRutCat = new Map(); // `${rutBase}||${cat}` -> { ejec, byMonth }
    const byRutAllCats = new Map(); // rutBase -> Map<catKey, { catKey, ejec, byMonth }>
    const stripRut = (r) => String(r || '').trim().toUpperCase().replace(/\./g, '').split('-')[0];

    const isInstitucionalPab = (tg) => {
      const m = norm(tg);
      return !m.includes('COMPRA') && !m.includes('LICITACION');
    };

    const classifyPab = (r) => {
      const tiq = norm(r.tipo_iq);
      if (tiq === 'URGENCIA' || (norm(r.urgencia) === 'SI' && !tiq.includes('DIFERIDA'))) return 'PAB_URG';
      const esp = norm(r.especialidad);
      const itv = norm(r.intervencion);
      if ((esp.includes('OBSTETRIC') || esp.includes('GINECOL')) && /CESAREA|OBSTET|PARTO|LEGRADO/.test(itv)) {
        return 'PAB_OBST';
      }
      const tc = norm(r.tipo_cirugia);
      if (tc.includes('PROCEDIMIENTO')) return 'PAB_PROC';
      if (tc.includes('MENOR')) return 'PAB_MENOR';
      if (tc.includes('AMBULATORIA')) return 'PAB_CMA';
      if (tc.includes('MAYOR')) return 'PAB_MAYOR';
      return null;
    };

    const addCat = (rutBase, catKey, ym) => {
      const k = `${rutBase}||${catKey}`;
      if (!byRutCat.has(k)) byRutCat.set(k, { ejec: 0, byMonth: {} });
      const st = byRutCat.get(k);
      st.ejec++;
      st.byMonth[ym] = (st.byMonth[ym] || 0) + 1;

      if (!byRutAllCats.has(rutBase)) byRutAllCats.set(rutBase, new Map());
      const m = byRutAllCats.get(rutBase);
      if (!m.has(catKey)) m.set(catKey, { catKey, ejec: 0, byMonth: {} });
      const st2 = m.get(catKey);
      st2.ejec++;
      st2.byMonth[ym] = (st2.byMonth[ym] || 0) + 1;
    };

    for (const r of recs) {
      const f = r.fecha_cirugia || '';
      if (!f.startsWith('2026-')) continue;
      const m = parseInt(f.slice(5, 7), 10);
      if (periodo === 's1' && m > 6) continue;
      if (periodo === 's2' && m < 7) continue;
      if (!includeComprasServicio && !isInstitucionalPab(r.tipo_gestor || r.tipo_paciente)) continue;

      const cat = classifyPab(r);
      if (!cat) continue;
      const ym = f.slice(0, 7);

      const ruts = new Set([stripRut(r.cirujano), stripRut(r.anestesiologo)].filter(Boolean));
      for (const rutBase of ruts) addCat(rutBase, cat, ym);

      const ruts23 = new Set([stripRut(r.segundo_cirujano), stripRut(r.tercer_cirujano)].filter(Boolean));
      for (const rutBase of ruts23) addCat(rutBase, `${cat}_23`, ym);
    }
    return { byRutCat, byRutAllCats };
  }, [pabData, periodo, includeComprasServicio]);

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

  // Mapa inverso: Clave RCE (TIPO|SUB) -> Actividad(es) equivalente(s) en Programación
  const rceKeyToProgMap = useMemo(() => {
    const m = new Map();
    for (const c of catalogoActividades) {
      if (c.tipoRCE && c.subRCE) {
        const k = `${norm(c.tipoRCE)}|${norm(c.subRCE)}`;
        if (!m.has(k)) m.set(k, []);
        const label = `[#${c.id}] ${c.actividad}`;
        if (!m.get(k).includes(label)) m.get(k).push(label);
      }
    }
    if (!m.has('TELEMEDICINA CONTROL|TELECONSULTA CONTROL')) {
      m.set('TELEMEDICINA CONTROL|TELECONSULTA CONTROL', ['[#113] Telemedicina: Teleconsulta Control']);
    }
    if (!m.has('TELEMEDICINA NUEVA|TELECONSULTA NUEVA')) {
      m.set('TELEMEDICINA NUEVA|TELECONSULTA NUEVA', ['[#112] Telemedicina: Teleconsulta Nueva']);
    }
    return m;
  }, [catalogoActividades]);

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

      // Unificar profesionales duplicados por RUT dentro de la misma especialidad (ej. variantes de tildes/apóstrofos)
      const profByRut = new Map();
      for (const rawP of esp.profesionales) {
        const rutKey = rawP.rut ? String(rawP.rut).trim() : norm(rawP.nombre);
        if (!profByRut.has(rutKey)) {
          profByRut.set(rutKey, { ...rawP, actividades: [...(rawP.actividades || [])] });
        } else {
          const prev = profByRut.get(rutKey);
          const cleanName = !/[¿?]/.test(rawP.nombre) && /[¿?]/.test(prev.nombre) ? rawP.nombre : prev.nombre;
          prev.nombre = cleanName;
          prev.actividades = [...prev.actividades, ...(rawP.actividades || [])];
        }
      }

      const profsEval = [];
      for (const prof of profByRut.values()) {
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
        const matchedPabCatsForProf = new Set();

        for (const a of prof.actividades) {
          if (filterProceso !== 'todos' && a.proceso !== filterProceso) continue;
          if (filterRR !== 'todos' && a.rr !== filterRR) continue;
          const actCatKey = `${a.id}|${norm(a.actividad)}`;
          if (filterActKeys.length > 0 && !filterActKeys.includes(actCatKey)) continue;

          const isImagenologiaEco = esp.nombre === 'IMAGENOLOGÍA' && ['318', '291', '319', '292', '295'].includes(String(a.id));
          const actN = norm(a.actividad || '');
          const isSegundoCirujano = actN.includes('SEGUNDO O TERCER CIRUJANO');
          const basePabCat = actN.startsWith('PABELLON CIRUGIA')
            ? (actN.includes('URGENCIA') ? 'PAB_URG'
              : actN.includes('OBSTETRICA') ? 'PAB_OBST'
              : actN.includes('MENOR') ? 'PAB_MENOR'
              : actN.includes('AMBULATORIA') ? 'PAB_CMA'
              : actN.includes('MAYOR') ? 'PAB_MAYOR'
              : null)
            : null;
          const pabCat = basePabCat ? (isSegundoCirujano ? `${basePabCat}_23` : basePabCat) : null;
          if (pabCat) matchedPabCatsForProf.add(pabCat);
          const isPsiquiatria = norm(esp.nombre).includes('PSIQUIATRIA');
          const isGestionCasosNoSM = norm(a.actividad).includes('GESTION DE CASOS') && !isPsiquiatria;
          const isVisitaSalaNoSM = /visita a sala hospitalizado/i.test(a.actividad || '') && !isPsiquiatria;
          const effectiveGlosa = pabCat
            ? {
                ...(a.glosa || {}),
                tipoActRCE: 'Libro de Pabellón Electrónico',
                subActRCE: a.actividad,
                actRCE: a.actividad,
              }
            : isVisitaSalaNoSM
              ? {
                  ...(a.glosa || {}),
                  tipoActRCE: 'ATENCION A HOSPITALIZADOS',
                  subActRCE: 'ATENCION ESPECIALISTA EN SALA',
                  actRCE: 'ATENCION ESPECIALISTA EN SALA',
                }
              : a.glosa;
          const estado = (isImagenologiaEco || pabCat) ? 'HOMOLOGADA' : (isGestionCasosNoSM ? 'SIN_RCE' : classifyAct(a));
          if (filterEstados.length > 0 && !filterEstados.includes(estado)) continue;

          const rk = isGestionCasosNoSM
            ? null
            : (isVisitaSalaNoSM ? 'ATENCION A HOSPITALIZADOS|ATENCION ESPECIALISTA EN SALA' : getActRceKey(a));
          const metaAnual = (a.prod1Sem || 0) + (a.prod2Sem || 0);
          const metaPeriodo = getMetaBase(a);
          const metaEval = Math.round(metaPeriodo * factorDevengado);

          let ejec = 0;
          let nsp = 0;
          let asig = 0;
          let byMonth = {};
          let sharedKeyNote = null;

          if (pabCat) {
            const rutBase = prof.rut ? String(prof.rut).trim().toUpperCase().replace(/\./g, '').split('-')[0] : '';
            const st = rutBase ? pabStats2026.byRutCat.get(`${rutBase}||${pabCat}`) : null;
            if (st) {
              ejec = st.ejec;
              byMonth = st.byMonth;
            }
          } else if (isImagenologiaEco) {
            const st = usStats2026.byProfCode.get(`${np}||${String(a.id)}`);
            if (st) {
              ejec = st.ejec;
              nsp = st.nsp;
              byMonth = st.byMonth;
            }
          } else if (estado === 'HOMOLOGADA' && rk) {
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
            glosa: effectiveGlosa,
            sourceType: pabCat ? 'PABELLON' : (isImagenologiaEco ? 'REDCAP_ECO' : 'RCE'),
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
            sharedKeyNote: null,
          });
        }

        // Agrupar actividades HOMOLOGADAS que comparten la misma clave RCE en una sola fila resumida desplegable
        const groupedByRce = new Map();
        const finalActsEval = [];
        for (const item of actsEval) {
          const gk = item.rceKey || (item.sourceType === 'PABELLON' ? `PABELLON|${norm(item.actividad)}` : null);
          if (item.estado === 'HOMOLOGADA' && gk) {
            if (!groupedByRce.has(gk)) groupedByRce.set(gk, []);
            groupedByRce.get(gk).push(item);
          } else {
            finalActsEval.push(item);
          }
        }
        for (const [rk, items] of groupedByRce.entries()) {
          if (items.length === 1) {
            finalActsEval.push(items[0]);
          } else {
            const isPabGroup = rk.startsWith('PABELLON|');
            const st = isPabGroup ? null : profEspKeyStats.get(`${np}||${esp.nombre}||${rk}`);
            const ejec = isPabGroup ? (items[0].ejec || 0) : (st ? st.ejec : 0);
            const nsp = isPabGroup ? (items[0].nsp || 0) : (st ? st.nsp : 0);
            const asig = isPabGroup ? (items[0].asig || 0) : (st ? st.asig : 0);
            const byMonth = isPabGroup ? (items[0].byMonth || {}) : (st ? st.byMonth : {});
            const meta1Sem = items.reduce((s, x) => s + (x.meta1Sem || 0), 0);
            const meta2Sem = items.reduce((s, x) => s + (x.meta2Sem || 0), 0);
            const metaAnual = items.reduce((s, x) => s + (x.metaAnual || 0), 0);
            const metaPeriodo = items.reduce((s, x) => s + (x.metaPeriodo || 0), 0);
            const metaEval = items.reduce((s, x) => s + (x.metaEval || 0), 0);
            const horas1Sem = items.reduce((s, x) => s + (x.horas1Sem || 0), 0);
            const horas2Sem = items.reduce((s, x) => s + (x.horas2Sem || 0), 0);
            const horas = items.reduce((s, x) => s + (x.horas || 0), 0);
            const isVisitaSala = rk === 'SALUD MENTAL ESPECIALIDAD/ENLACE|INTERCONSULTA EN SALA';
            const isAtencionSala = rk === 'ATENCION A HOSPITALIZADOS|ATENCION ESPECIALISTA EN SALA';
            const summaryName = isVisitaSala
              ? 'Visitas en Sala Hospitalizado (Resumen)'
              : isAtencionSala
                ? 'Atención en Sala Hospitalizado (Resumen)'
                : `${items[0].glosa?.subActRCE || items[0].actividad} (Resumen)`;
            finalActsEval.push({
              ...items[0],
              id: items.map(x => x.id).join('+'),
              actividad: summaryName,
              horas1Sem,
              horas2Sem,
              horas,
              meta1Sem,
              meta2Sem,
              metaAnual,
              metaPeriodo,
              metaEval,
              ejec,
              nsp,
              asig,
              pct: metaEval > 0 ? (ejec / metaEval) * 100 : null,
              brecha: ejec - metaEval,
              byMonth,
              sharedKeyNote: null,
              subItems: items,
            });
          }
        }
        actsEval.length = 0;
        actsEval.push(...finalActsEval);

        if (actsEval.length === 0) continue;

        // Producción de este profesional en claves que NO tiene programadas (RCE + Libro de Pabellón)
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
        }) : [];

        const PAB_CAT_LABELS = {
          PAB_URG: 'Pabellon Cirugía Urgencia',
          PAB_OBST: 'Pabellon Cirugía Obstétrica',
          PAB_MENOR: 'Pabellon Cirugía Menor',
          PAB_CMA: 'Pabellon Cirugía Mayor Ambulatoria',
          PAB_MAYOR: 'Pabellon Cirugía Mayor',
          PAB_PROC: 'Procedimientos en Pabellón',
          PAB_URG_23: 'Pabellon Cirugía Urgencia (2do o 3er cirujano)',
          PAB_OBST_23: 'Pabellon Cirugía Obstétrica (2do o 3er cirujano)',
          PAB_MENOR_23: 'Pabellon Cirugía Menor (2do o 3er cirujano)',
          PAB_CMA_23: 'Pabellon Cirugía Mayor Ambulatoria (2do o 3er cirujano)',
          PAB_MAYOR_23: 'Pabellon Cirugía Mayor (2do o 3er cirujano)',
          PAB_PROC_23: 'Procedimientos en Pabellón (2do o 3er cirujano)',
        };
        const profRutBase = String(prof.rut || '').trim().toUpperCase().replace(/\./g, '').split('-')[0];
        const profPabCats = pabStats2026.byRutAllCats.get(profRutBase);
        if (profPabCats) {
          const pabCatToInfo = new Map();
          for (const e of (programacionMedica?.especialidades || [])) {
            for (const p of (e.profesionales || [])) {
              for (const a of (p.actividades || [])) {
                if (!a.id || !a.actividad) continue;
                const an = norm(a.actividad);
                const is23 = an.includes('SEGUNDO O TERCER CIRUJANO');
                const bc = an.startsWith('PABELLON CIRUGIA')
                  ? (an.includes('URGENCIA') ? 'PAB_URG'
                    : an.includes('OBSTETRICA') ? 'PAB_OBST'
                    : an.includes('MENOR') ? 'PAB_MENOR'
                    : an.includes('AMBULATORIA') ? 'PAB_CMA'
                    : an.includes('MAYOR') ? 'PAB_MAYOR'
                    : null)
                  : (an.includes('PROCEDIMIENTO') && an.includes('PABELLON') ? 'PAB_PROC' : null);
                const pk = bc ? (is23 ? `${bc}_23` : bc) : null;
                if (pk && !pabCatToInfo.has(pk)) pabCatToInfo.set(pk, { id: a.id, nombre: a.actividad });
              }
            }
          }
          const PAB_CAT_IDS = {
            PAB_URG: 192,
            PAB_OBST: 9,
            PAB_MENOR: 8,
            PAB_CMA: 6,
            PAB_MAYOR: 7,
            PAB_PROC: 4,
            PAB_URG_23: 339,
            PAB_OBST_23: 338,
            PAB_CMA_23: 337,
            PAB_MAYOR_23: 336,
          };
          for (const [catKey, st] of profPabCats.entries()) {
            if (!matchedPabCatsForProf.has(catKey) && st.ejec > 0) {
              const info = pabCatToInfo.get(catKey);
              const label = info?.nombre || PAB_CAT_LABELS[catKey] || catKey;
              const actId = info?.id || PAB_CAT_IDS[catKey];
              realBreakdown.push({
                exactKey: `PABELLON|${catKey}`,
                tipo: 'Libro de Pabellón Electrónico',
                sub: PAB_CAT_LABELS[catKey] || catKey,
                equivLabel: actId ? `[#${actId}] ${label}` : label,
                policlinicos: 'Pabellón Quirúrgico',
                ejec: st.ejec,
                nsp: 0,
                isIngresoSm: false,
                isProgrammed: false,
              });
            }
          }
        }
        realBreakdown.sort((a, b) => b.ejec - a.ejec);

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
    filterEstados,
    filterActKeys,
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
                Datos RCE actualizados al {rce2026.maxDate} · {fmt(rce2026.records.length)} atenciones 2026
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
              <strong>1° Sem:</strong> Reprogramación marzo 2026 · <strong>2° Sem:</strong> Reprogramación junio 2026 · <strong>Producción:</strong> Atenciones ejecutadas (NSP complementario)
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

        {/* Segunda fila: Caja unificada de Filtros de Evaluación */}
        <div style={{
          marginTop: '14px', padding: '14px 16px',
          background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px',
          display: 'flex', flexDirection: 'column', gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <Filter size={13} color="#4f46e5" /> Filtros de Evaluación
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
              Mostrando {evalModel.especialidades.length} de {programacionMedica.length} especialidades · {evalModel.especialidades.reduce((s, e) => s + e.profesionales.length, 0)} profesionales
            </div>
          </div>

          {/* Fila A: Especialidad, Profesional, R/NR y Proceso */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            {setSearchEsp && (
              <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: '280px' }}>
                <input
                  placeholder="Buscar especialidad..."
                  value={searchEsp}
                  onChange={e => setSearchEsp(e.target.value)}
                  style={{
                    width: '100%', padding: '7px 28px 7px 32px', borderRadius: '8px',
                    border: searchEsp.trim() ? '1px solid #4f46e5' : '1px solid #cbd5e1',
                    fontSize: '0.78rem', outline: 'none', background: 'white', boxSizing: 'border-box'
                  }}
                />
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                {searchEsp && (
                  <button onClick={() => setSearchEsp('')} title="Limpiar" style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.95rem', lineHeight: 1 }}>×</button>
                )}
              </div>
            )}

            {setSearchProf && (
              <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: '300px' }}>
                <input
                  placeholder="Buscar profesional (nombre o apellido)..."
                  value={searchProf}
                  onChange={e => setSearchProf(e.target.value)}
                  style={{
                    width: '100%', padding: '7px 28px 7px 32px', borderRadius: '8px',
                    border: searchProf.trim() ? '1px solid #4f46e5' : '1px solid #cbd5e1',
                    fontSize: '0.78rem', outline: 'none', background: 'white', boxSizing: 'border-box'
                  }}
                />
                <Users size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: searchProf.trim() ? '#4f46e5' : '#94a3b8' }} />
                {searchProf && (
                  <button onClick={() => setSearchProf('')} title="Limpiar" style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.95rem', lineHeight: 1 }}>×</button>
                )}
              </div>
            )}

            {setFilterRR && (
              <div
                style={{ display: 'flex', gap: '4px', background: 'white', padding: '3px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                title="Requiere Rendimiento (RR): Solo las actividades marcadas como ✓ R generan compromiso formal de producción evaluable según orientaciones técnicas MINSAL. Las actividades — NR pueden tener producción registrada pero no serán contempladas en la evaluación final del profesional."
              >
                {['todos', 'R', 'NR'].map(v => (
                  <button key={v} onClick={() => setFilterRR(v)} style={{
                    padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                    fontSize: '0.74rem', fontWeight: 700,
                    background: filterRR === v ? '#4f46e5' : 'transparent',
                    color: filterRR === v ? 'white' : '#64748b'
                  }}>
                    {v === 'todos' ? 'Todos' : v === 'R' ? '✓ Solo R ⓘ' : '— Solo NR'}
                  </button>
                ))}
              </div>
            )}

            {setFilterProceso && (
              <div style={{ display: 'flex', gap: '4px', background: 'white', padding: '3px', borderRadius: '8px', border: '1px solid #cbd5e1', flexWrap: 'wrap' }}>
                {['todos', ...availableProcesos].map(v => (
                  <button key={v} onClick={() => setFilterProceso(v)} style={{
                    padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                    fontSize: '0.74rem', fontWeight: 700,
                    background: filterProceso === v ? '#1e40af' : 'transparent',
                    color: filterProceso === v ? 'white' : '#64748b'
                  }}>
                    {v === 'todos' ? 'Todo proceso' : v}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fila B: Estado actividad, Actividad (multi-select) y Compras de Servicio */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', paddingTop: '8px', borderTop: '1px dashed #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '280px', flex: '0 1 340px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>Estado actividad:</span>
            <div style={{ flex: 1 }}>
              <MultiSelectSearch
                selectedValues={filterEstados}
                onChange={setFilterEstados}
                options={[
                  { value: 'HOMOLOGADA', label: '✓ Solo Evaluables RCE (Homologadas)' },
                  { value: 'SIN_RCE', label: 'Sin RCE Especialistas' },
                  { value: 'SIN_GLOSA', label: 'Sin Glosa' },
                  { value: 'NR', label: 'No Requiere Rendimiento (NR)' },
                ]}
                placeholder="Todas las actividades"
                searchPlaceholder="Buscar estado..."
                minWidth="220px"
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '320px', flex: '1 1 400px', maxWidth: '560px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>Actividad:</span>
            <div style={{ flex: 1 }}>
              <MultiSelectSearch
                selectedValues={filterActKeys}
                onChange={setFilterActKeys}
                options={catalogoActividades.map(c => ({
                  value: c.key,
                  label: `[${c.id}] ${c.actividad} ${c.tipoRCE ? `→ ${c.tipoRCE} | ${c.subRCE}` : `(${ESTADO_META[c.estado]?.label})`}`,
                }))}
                placeholder={`Todas las actividades (${catalogoActividades.length})`}
                searchPlaceholder="Buscar actividad por nombre, código o RCE..."
                minWidth="280px"
              />
            </div>
          </div>
          <label style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem',
            color: '#334155', fontWeight: 600, cursor: 'pointer', marginLeft: 'auto'
          }} title="Por defecto se excluyen Compras de Servicio, Convenios y Privados en Imagenología (los Operativos Radiológicos sí se consideran institucionales).">
            <input
              type="checkbox"
              checked={includeComprasServicio}
              onChange={e => setIncludeComprasServicio(e.target.checked)}
            />
            Incluir Compras de Servicio / No Institucional (Imagenología)
          </label>
          </div>
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
          autoOpen={searchProf.trim().length > 0 || filterActKeys.length > 0}
          onSelectProf={setSelectedProfDetail}
          focusedEsp={focusedEsp}
          setFocusedEsp={setFocusedEsp}
          focusedProf={focusedProf}
          setFocusedProf={setFocusedProf}
          rceKeyToProgMap={rceKeyToProgMap}
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
function EvalEspecialidadRow({ esp, autoOpen, onSelectProf, focusedEsp, setFocusedEsp, focusedProf, setFocusedProf, rceKeyToProgMap }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  useEffect(() => { if (autoOpen) setOpen(true); }, [autoOpen]);
  const sem = semaforoColor(esp.pctHom);

  const isFocused = focusedEsp === esp.nombre;
  const isDimmed = Boolean(focusedEsp && !isFocused && !hovered);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (setFocusedEsp) {
      if (next) {
        setFocusedEsp(esp.nombre);
      } else if (focusedEsp === esp.nombre) {
        setFocusedEsp(null);
        if (setFocusedProf) setFocusedProf(null);
      }
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: isFocused ? '1.5px solid #6366f1' : '1px solid #e2e8f0',
        borderTop: isFocused ? '1.5px solid #6366f1' : 'none',
        borderLeft: isFocused ? '4px solid #4f46e5' : '1px solid #e2e8f0',
        background: 'white',
        boxShadow: isFocused ? '0 10px 26px rgba(79,70,229,0.12)' : 'none',
        opacity: isDimmed ? 0.42 : 1,
        filter: isDimmed ? 'saturate(0.7)' : 'none',
        transition: 'opacity 0.22s ease, filter 0.22s ease, box-shadow 0.22s ease',
      }}
    >
      <div
        onClick={handleToggle}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 75px 88px 88px 98px 98px 88px 135px 75px',
          gap: '10px', padding: '13px 16px', alignItems: 'center', cursor: 'pointer',
          background: isFocused ? 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(14,165,233,0.06))' : (open ? 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(14,165,233,0.04))' : 'white'),
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
              espNombre={esp.nombre}
              focusedProf={focusedProf}
              setFocusedProf={setFocusedProf}
              rceKeyToProgMap={rceKeyToProgMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── FILA DE PROFESIONAL ───────────────────────────────────────────────────
function EvalProfesionalRow({ prof, espNombre, autoOpen, onSelectProf, focusedProf, setFocusedProf, rceKeyToProgMap }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [openNoProg, setOpenNoProg] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const toggleGroup = (idx) => setExpandedGroups(prev => ({ ...prev, [idx]: !prev[idx] }));
  useEffect(() => { if (autoOpen) setOpen(true); }, [autoOpen]);
  const sem = semaforoColor(prof.pctHom);
  const totalRceProfEjec = prof.realBreakdown.reduce((s, x) => s + x.ejec, 0);

  const profKey = `${espNombre || ''}||${prof.nombre}`;
  const isProfFocused = focusedProf === profKey;
  const isProfDimmed = Boolean(focusedProf && !isProfFocused && !hovered);

  const handleToggleProf = () => {
    const next = !open;
    setOpen(next);
    if (setFocusedProf) {
      if (next) setFocusedProf(profKey);
      else if (focusedProf === profKey) setFocusedProf(null);
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderBottom: '1px solid #e2e8f0',
        borderLeft: isProfFocused ? '4px solid #6366f1' : '4px solid transparent',
        background: isProfFocused ? 'rgba(99,102,241,0.03)' : 'transparent',
        opacity: isProfDimmed ? 0.44 : 1,
        transition: 'opacity 0.2s ease, border-left-color 0.2s ease, background 0.2s ease',
      }}
    >
      <div
        onClick={handleToggleProf}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 75px 88px 88px 98px 98px 88px 135px 75px',
          gap: '10px', padding: '10px 16px 10px 28px', alignItems: 'center', cursor: 'pointer',
          background: isProfFocused ? 'rgba(79,70,229,0.08)' : (open ? 'rgba(79,70,229,0.05)' : 'transparent')
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
                const hasSub = Array.isArray(a.subItems) && a.subItems.length > 1;
                const isGroupOpen = !!expandedGroups[idx];
                return (
                  <React.Fragment key={idx}>
                  <tr
                    onClick={hasSub ? () => toggleGroup(idx) : undefined}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      cursor: hasSub ? 'pointer' : 'default',
                      background: hasSub ? 'rgba(99,102,241,0.03)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '7px 10px', maxWidth: '270px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {hasSub ? (
                          <span style={{ color: '#4f46e5', display: 'inline-flex', alignItems: 'center' }}>
                            {isGroupOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>#{a.id}</span>
                        )}
                        <span style={{ fontWeight: hasSub ? 700 : 400 }}>
                          <GlosaTooltip glosa={a.glosa} actividad={a.actividad} rendimiento={a.rendimiento} />
                        </span>
                        {hasSub && (
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 700, color: '#4f46e5',
                            background: '#eef2ff', padding: '1px 6px', borderRadius: '999px', whiteSpace: 'nowrap'
                          }}>
                            {a.subItems.length} prog.
                          </span>
                        )}
                      </div>
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
                      {a.sourceType === 'PABELLON' ? (
                        <span style={{
                          fontSize: '0.67rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
                          background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd',
                          whiteSpace: 'nowrap'
                        }}>
                          Evaluable en Libro de Pabellón
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '0.67rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
                          background: stMeta.bg, color: stMeta.color, border: `1px solid ${stMeta.border}`,
                          whiteSpace: 'nowrap'
                        }}>
                          {stMeta.label}
                        </span>
                      )}
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
                  {hasSub && isGroupOpen && a.subItems.map((sub, sIdx) => (
                    <tr key={`${idx}-sub-${sIdx}`} style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9', fontSize: '0.73rem', color: '#475569' }}>
                      <td style={{ padding: '5px 10px 5px 30px', maxWidth: '270px' }}>
                        <span style={{ fontSize: '0.66rem', color: '#94a3b8', fontWeight: 700, marginRight: 6 }}>#{sub.id}</span>
                        {sub.actividad}
                      </td>
                      <td style={{ padding: '5px 10px', color: '#94a3b8', fontSize: '0.69rem' }}>↳ Desglose programado</td>
                      <td style={{ padding: '5px 10px', textAlign: 'center', color: '#94a3b8' }}>—</td>
                      <td style={{ padding: '5px 10px', textAlign: 'right' }}>{fmtH(sub.horas1Sem)} / {fmtH(sub.horas2Sem)}</td>
                      <td style={{ padding: '5px 10px', textAlign: 'right' }}>{fmt(sub.meta1Sem)}</td>
                      <td style={{ padding: '5px 10px', textAlign: 'right' }}>{fmt(sub.meta2Sem)}</td>
                      <td style={{ padding: '5px 10px', textAlign: 'right', fontWeight: 600 }}>{fmt(sub.metaEval)}</td>
                      <td style={{ padding: '5px 10px', textAlign: 'right', color: '#94a3b8' }}>—</td>
                      <td style={{ padding: '5px 10px', textAlign: 'right', color: '#94a3b8' }}>—</td>
                      <td style={{ padding: '5px 10px', textAlign: 'right', color: '#94a3b8' }}>—</td>
                      <td style={{ padding: '5px 10px', textAlign: 'right', color: '#94a3b8' }}>—</td>
                    </tr>
                  ))}
                  </React.Fragment>
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
                      Producción 2026 en claves NO programadas ({noProgItems.length} {noProgItems.length === 1 ? 'clave' : 'claves'})
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
                        {fmtPct(pctSobreTotal)} de su prod. total ({fmt(totalRceProfEjec)})
                      </span>
                    )}
                  </div>
                </div>
                {openNoProg && (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', background: 'white' }}>
                      <thead>
                        <tr style={{ background: '#f5f3ff', color: '#5b21b6', textTransform: 'uppercase', fontSize: '0.66rem', borderBottom: '1px solid #ede9fe' }}>
                          <th style={{ padding: '6px 10px', textAlign: 'left' }}>Actividad Programación (Equivalente)</th>
                          <th style={{ padding: '6px 10px', textAlign: 'left' }}>Fuente</th>
                          <th style={{ padding: '6px 10px', textAlign: 'left' }}>Tipo Actividad</th>
                          <th style={{ padding: '6px 10px', textAlign: 'left' }}>Sub-Actividad / Categoría</th>
                          <th style={{ padding: '6px 10px', textAlign: 'left' }}>Policlínico / Lugar</th>
                          <th style={{ padding: '6px 10px', textAlign: 'right' }}>Ejecutadas</th>
                          <th style={{ padding: '6px 10px', textAlign: 'right', minWidth: '135px' }}>% del No Prog.</th>
                          <th style={{ padding: '6px 10px', textAlign: 'right' }}>% del Total Prod.</th>
                          <th style={{ padding: '6px 10px', textAlign: 'right' }}>NSP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {noProgItems.map((x, i) => {
                          const pctNoProg = totalNoProgEjec > 0 ? (x.ejec / totalNoProgEjec) * 100 : 0;
                          const pctTotalRce = totalRceProfEjec > 0 ? (x.ejec / totalRceProfEjec) * 100 : 0;
                          const rk = `${norm(x.tipo)}|${norm(x.sub)}`;
                          const equivActs = x.tipo === 'Libro de Pabellón Electrónico'
                            ? [x.equivLabel || x.sub]
                            : (rceKeyToProgMap?.get(rk) || []);
                          return (
                            <tr key={i} style={{ borderBottom: '1px solid #f3e8ff', background: i % 2 === 0 ? 'white' : '#fcfaff' }}>
                              <td style={{ padding: '6px 10px', fontWeight: 700, color: equivActs.length ? '#312e81' : '#94a3b8', fontSize: '0.72rem', maxWidth: '250px' }}>
                                {equivActs.length > 0 ? equivActs.join(' / ') : 'Sin equivalente en Glosario'}
                              </td>
                              <td style={{ padding: '6px 10px', fontSize: '0.70rem', fontWeight: 700, color: x.tipo === 'Libro de Pabellón Electrónico' ? '#0369a1' : '#6d28d9' }}>
                                {x.tipo === 'Libro de Pabellón Electrónico' ? 'Libro de Pabellón Electrónico' : 'RCE Especialistas'}
                              </td>
                              <td style={{ padding: '6px 10px', fontWeight: 700, color: '#4c1d95' }}>
                                {x.tipo === 'Libro de Pabellón Electrónico' ? 'Pabellón Quirúrgico' : x.tipo}
                              </td>
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
                            <td colSpan={4} style={{ padding: '6px 10px' }}>Total acciones no programadas</td>
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
          <label style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem',
            color: '#334155', fontWeight: 600, cursor: 'pointer', marginLeft: 'auto'
          }} title="Por defecto se excluyen Compras de Servicio, Convenios y Privados en Imagenología (los Operativos Radiológicos sí se consideran institucionales).">
            <input
              type="checkbox"
              checked={includeComprasServicio}
              onChange={e => setIncludeComprasServicio(e.target.checked)}
            />
            Incluir Compras de Servicio / No Institucional (Imagenología)
          </label>
          </div>
        </div>
      </div>
    </div>
  );
}
