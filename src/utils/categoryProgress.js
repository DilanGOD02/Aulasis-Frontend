// Mismo criterio en todos lados (tarjeta "Desglose por categoría" del perfil
// del estudiante y sus exportables): cuánto aporta cada item/categoría a la
// nota final — los items todavía en blanco cuentan como 0 (no se ignoran),
// para mostrar "cuánto llevás ganado hasta ahora" en vez de un promedio
// inflado de lo poco que sí está calificado.

/** Cuánto aporta este item a la nota final (score/100 * su peso, ya en unidades del 100% total). */
export function itemContributionPct(item) {
  if (item.score == null) return 0;
  return (item.score / 100) * (item.weight ?? 0);
}

/** Puntos que la categoría ya aporta a la nota final, y el % que representa sobre el peso propio de la categoría. */
export function categoryProgress(category) {
  const pts = category.items.reduce((sum, it) => sum + itemContributionPct(it), 0);
  const roundedPts = Math.round(pts * 10) / 10;
  const pctObtenido = category.weight ? Math.round((pts / category.weight) * 100) : null;
  return { pts: roundedPts, pctObtenido };
}
