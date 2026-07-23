// El backend solo manda la clave (ok/limit/risk) — colores y etiquetas son
// puramente de presentación, así que se quedan del lado del cliente. Mismos
// valores que usaba data/dummyGroups.js (getGradeStatus) para no cambiar el
// look de la app.
export const STATUS_META = {
  ok: { key: 'ok', label: 'Aprobado', bg: '#DCFCE7', color: '#15803D' },
  limit: { key: 'limit', label: 'En riesgo', bg: '#FFEDD5', color: '#C2410C' },
  risk: { key: 'risk', label: 'Reprobado', bg: '#FEE2E2', color: '#DC2626' },
  // Menos de la mitad del esquema calificado todavía — no se afirma
  // aprobado/reprobado con tan pocos datos.
  incomplete: { key: 'incomplete', label: 'Incompleto', bg: '#F1F5F9', color: '#64748B' },
};

export const statusMeta = (key) => STATUS_META[key] ?? STATUS_META.incomplete;

export function initialsOf(nombre) {
  if (!nombre) return '';
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
