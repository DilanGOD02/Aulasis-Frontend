// El backend solo manda la clave (ok/limit/risk/reprobado/incomplete) —
// colores y etiquetas son puramente de presentación, así que se quedan del
// lado del cliente. El estado depende de cuánto del esquema ya está
// evaluado y si el promedio con eso aprueba:
//   < 70% evaluado              -> "Incompleto" (incomplete)
//   70-99% evaluado, aprueba    -> "Va bien"     (limit)
//   70-99% evaluado, no aprueba -> "En riesgo"   (risk)
//   100% evaluado, aprueba      -> "Aprobado"    (ok)
//   100% evaluado, no aprueba   -> "Reprobado"   (reprobado)
export const STATUS_META = {
  ok: { key: 'ok', label: 'Aprobado', bg: '#DCFCE7', color: '#15803D' },
  limit: { key: 'limit', label: 'Va bien', bg: '#DBEAFE', color: '#1D4ED8' },
  risk: { key: 'risk', label: 'En riesgo', bg: '#FFEDD5', color: '#C2410C' },
  reprobado: { key: 'reprobado', label: 'Reprobado', bg: '#FEE2E2', color: '#DC2626' },
  // Menos del 70% del esquema calificado todavía — no se afirma
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
