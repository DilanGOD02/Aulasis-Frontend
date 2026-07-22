// Qué alertas de riesgo ya vio el profesor — guardado por navegador (no hay
// concepto de "leído" en el backend todavía). El badge de la campanita/tab
// de Alertas solo debe contar las que aparecieron DESPUÉS de la última vez
// que entró a /alertas, no todas las que hay ahora mismo.

const STORAGE_KEY = 'aulasis_alerts_seen';

export function alertKey(student) {
  return `${student.groupId}-${student.studentId}`;
}

function readSeenKeys() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function countUnseen(students) {
  const seen = readSeenKeys();
  return students.filter((s) => !seen.has(alertKey(s))).length;
}

/** Marca como vistas todas las alertas actuales — se llama al entrar a /alertas. */
export function markAllSeen(students) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students.map(alertKey)));
  } catch {
    // localStorage puede fallar en modo incógnito — no es crítico, el badge solo se repetiría.
  }
  window.dispatchEvent(new Event('aulasis:alerts-seen'));
}
