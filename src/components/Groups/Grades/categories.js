// Builds the Notas grid's columns and filter pills from the group's own
// evaluation schema, instead of a fixed layout — so the table always matches
// whatever categories/items a group's schema actually has. Cada categoría
// siempre tiene al menos un item real (el backend crea uno implícito para
// las categorías "sin items · puntaje directo" y para la "asistencia
// automática"), así que las columnas siempre se arman a partir de item.id.

// Un color fijo por categoría — mismo criterio en la tabla en pantalla y en
// los archivos exportados (PDF/Excel), así el agrupado visual es consistente.
export const CATEGORY_PALETTE = ['4F46E5', '0EA5E9', '16A34A', 'D97706', 'DB2777', '7C3AED', '0D9488', 'B45309'];

/**
 * One column per graded leaf item, plus a read-only "total" column for any
 * category with more than one item. La categoría de asistencia automática
 * también sale como columna — se ve el valor calculado y se puede
 * sobreescribir a mano igual que cualquier otra. Cada columna queda
 * etiquetada con los datos de su categoría (id/nombre/peso/color) para poder
 * agrupar el encabezado visualmente.
 */
export function buildGradeColumns(schema) {
  const columns = [];

  schema.forEach((category, idx) => {
    const color = `#${CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length]}`;
    const categoryMeta = {
      categoryId: category.id,
      categoryName: category.name,
      categoryWeight: category.weight ?? 0,
      color,
      auto: !!category.auto,
    };

    category.items.forEach((item) =>
      columns.push({
        key: item.id,
        header: item.name.toUpperCase(),
        type: 'leaf',
        valorMaximo: item.valorMaximo ?? 100,
        weight: item.weight ?? 0,
        tieneRubrica: !!item.tieneRubrica,
        ...categoryMeta,
      }),
    );
    if (category.items.length > 1) {
      columns.push({
        key: `total-${category.id}`,
        header: 'TOTAL',
        type: 'total',
        leafKeys: category.items.map((i) => i.id),
        ...categoryMeta,
      });
    }
  });

  return columns;
}

/**
 * Agrupa columnas consecutivas de la misma categoría — para pintar un
 * encabezado de 2 filas (nombre+peso de la categoría arriba, columna
 * individual abajo) tanto en la tabla en pantalla como en las exportaciones.
 */
export function groupColumnsByCategory(columns) {
  const groups = [];
  columns.forEach((col) => {
    const last = groups[groups.length - 1];
    if (last && last.categoryId === col.categoryId) last.count += 1;
    else
      groups.push({
        categoryId: col.categoryId,
        name: col.categoryName,
        weight: col.categoryWeight,
        color: col.color,
        auto: col.auto,
        count: 1,
      });
  });
  return groups;
}

/** Cuánto aporta esta celda a la nota final: (obtenido / valorMáximo) * peso del item (ya en unidades del 100% total, no relativo a la categoría). */
export function contributionPct(value, column) {
  if (value == null || value === '' || !column.valorMaximo) return null;
  const pct = (Number(value) / column.valorMaximo) * column.weight;
  return Math.round(pct * 10) / 10;
}

/**
 * Puntos que la categoría ya aporta a la nota final — suma la contribución de
 * cada item con nota; los items todavía en blanco simplemente no suman nada
 * (equivalente a contarlos como 0), a propósito: es "cuánto lleva ganado
 * hasta ahora", no un promedio que ignore lo que falta por calificar.
 */
export function categoryContributionPct(student, column, colByKey) {
  // Categorías con un solo item (sin columna "total" propia, ver buildGradeColumns)
  // usan ese único item como si fuera su leafKey.
  const leafKeys = column.type === 'total' ? column.leafKeys : [column.key];
  const total = leafKeys.reduce((sum, k) => {
    const pct = contributionPct(student.grades[k], colByKey[k]);
    return sum + (pct ?? 0);
  }, 0);
  return Math.round(total * 10) / 10;
}

/** % de la categoría ya obtenido (0-100, sobre el peso propio de la categoría) — los items en blanco cuentan como 0. */
export function categoryScorePct(student, column, colByKey) {
  if (!column.categoryWeight) return null;
  const pts = categoryContributionPct(student, column, colByKey);
  return Math.round((pts / column.categoryWeight) * 100);
}

/** "Todas · 100%" + one pill per category, each isolating that category's columns. */
export function buildGradeFilters(schema) {
  const total = schema.reduce((sum, c) => sum + Number(c.weight || 0), 0);

  const perCategory = schema.map((c) => {
    const keys = c.items.map((i) => i.id);
    const columnKeys = keys.length > 1 ? [...keys, `total-${c.id}`] : keys;
    return { key: `cat-${c.id}`, label: c.name, weight: c.weight, columnKeys };
  });

  return [{ key: 'all', label: 'Todas', weight: total, columnKeys: null }, ...perCategory];
}
