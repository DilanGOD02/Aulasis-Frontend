// Builds the Notas grid's columns and filter pills from the group's own
// evaluation schema, instead of a fixed C1/C2/P1/P2/T1/T2/Proy layout — so the
// table always matches whatever categories/items a group's schema actually has.

function leafKeysOf(category) {
  return category.items.length ? category.items.map((i) => i.gradeKey) : category.gradeKeys ?? [];
}

/**
 * One column per graded leaf (item, or plain category grade), plus a
 * read-only "total" column for any category with more than one leaf.
 * Attendance ("auto") categories are excluded — they aren't hand-graded.
 */
export function buildGradeColumns(schema) {
  const columns = [];

  schema
    .filter((c) => !c.auto)
    .forEach((category) => {
      const keys = leafKeysOf(category);
      keys.forEach((key) => columns.push({ key, header: key.toUpperCase(), type: 'leaf' }));
      if (keys.length > 1) {
        columns.push({ key: `total-${category.id}`, header: category.name, type: 'total', leafKeys: keys });
      }
    });

  return columns;
}

/** "Todas · 100%" + one pill per non-auto category, each isolating that category's columns. */
export function buildGradeFilters(schema) {
  const gradable = schema.filter((c) => !c.auto);
  const total = schema.reduce((sum, c) => sum + Number(c.weight || 0), 0);

  const perCategory = gradable.map((c) => {
    const keys = leafKeysOf(c);
    const columnKeys = keys.length > 1 ? [...keys, `total-${c.id}`] : keys;
    return { key: `cat-${c.id}`, label: c.name, weight: c.weight, columnKeys };
  });

  return [{ key: 'all', label: 'Todas', weight: total, columnKeys: null }, ...perCategory];
}
