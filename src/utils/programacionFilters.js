// Utilidades compartidas por los paneles de Programación (Médica / Profesionales)

// Normaliza texto: minúsculas, sin tildes ni espacios repetidos
export const normText = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

// Búsqueda por nombre: todos los términos escritos deben estar contenidos en el nombre
// (sin importar orden, tildes ni mayúsculas). Ej: "paola cadenasso" encuentra "CADENASSO GARCIA PAOLA INES"
export const matchesAllTokens = (name, query) => {
  const n = normText(name);
  const tokens = normText(query).split(' ').filter(Boolean);
  return tokens.length === 0 || tokens.every((t) => n.includes(t));
};

// Reconstruye los totales de un profesional a partir de un subconjunto de actividades
export const rebuildProfesional = (p, actividades) => {
  const totalHorasAsignadas = actividades.reduce((s, a) => s + (a.horas || 0), 0);
  const prod1Sem = actividades.reduce((s, a) => s + (a.prod1Sem || 0), 0);
  const prod2Sem = actividades.reduce((s, a) => s + (a.prod2Sem || 0), 0);
  return {
    ...p,
    actividades,
    totalHorasAsignadas,
    horas: totalHorasAsignadas,
    prod1Sem,
    prod2Sem,
    totalProd: prod1Sem + prod2Sem,
  };
};

// Reconstruye los totales de una especialidad / grupo profesional a partir de un subconjunto de profesionales
export const rebuildGroup = (g, profesionales) => {
  const totalHorasAsignadas = profesionales.reduce((s, p) => s + (p.totalHorasAsignadas || 0), 0);
  const prod1Sem = profesionales.reduce((s, p) => s + (p.prod1Sem || 0), 0);
  const prod2Sem = profesionales.reduce((s, p) => s + (p.prod2Sem || 0), 0);
  return {
    ...g,
    profesionales,
    numProfesionales: profesionales.length,
    totalHorasAsignadas,
    prod1Sem,
    prod2Sem,
    totalProd: prod1Sem + prod2Sem,
  };
};
