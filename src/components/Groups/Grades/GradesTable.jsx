import { groupColumnsByCategory } from './categories';

const DOT_BY_STATUS = { ok: '#16A34A', limit: '#D97706', risk: '#DC2626', incomplete: '#94A3B8' };
const HEADER_DARK = '#1E293B';

function totalFor(student, column) {
  const values = column.leafKeys.map((k) => student.grades[k]).filter((v) => v != null);
  return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;
}

/** Cuánto aporta esta celda a la nota final: (obtenido / valorMáximo) * peso del item. */
function contributionPct(value, column) {
  if (value == null || value === '' || !column.valorMaximo) return null;
  const pct = (Number(value) / column.valorMaximo) * column.weight;
  return Math.round(pct * 10) / 10;
}

/** Nota fuera de rango (negativa o mayor al valor máximo del ítem) — se marca en la celda antes de guardar. */
function gradeError(value, column) {
  if (value == null || value === '') return null;
  const n = Number(value);
  if (n < 0) return 'No puede ser negativa';
  if (column.valorMaximo && n > column.valorMaximo) return `Máximo ${column.valorMaximo}`;
  return null;
}

/** Suma de lo que ya aportan los items de esta categoría — el % de la categoría obtenido hasta ahora. */
function categoryContributionPct(student, column, colByKey) {
  const total = column.leafKeys.reduce((sum, k) => {
    const pct = contributionPct(student.grades[k], colByKey[k]);
    return sum + (pct ?? 0);
  }, 0);
  return Math.round(total * 10) / 10;
}

/**
 * Grade-entry grid whose columns come from the group's evaluation schema —
 * editable leaf cells, read-only category totals. `onGradeChange` updates
 * local state on every keystroke (fast UI); `onGradeCommit` fires on blur to
 * persist ("Guardado automático").
 */
function GradesTable({ students, columns, onGradeChange, onGradeCommit, onOpenRubrica }) {
  const templateColumns = `200px repeat(${columns.length}, 1fr) 92px 104px`;
  const colByKey = Object.fromEntries(columns.map((c) => [c.key, c]));
  const groups = groupColumnsByCategory(columns);
  const promCol = columns.length + 2;
  const estadoCol = columns.length + 3;

  const groupCells = groups.reduce((acc, g) => {
    const start = acc.length ? acc[acc.length - 1].start + acc[acc.length - 1].count : 2;
    return [...acc, { ...g, start }];
  }, []);

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#EEF1F6] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div style={{ minWidth: 200 + columns.length * 70 + 92 + 104 }}>
        <div
          className="grid border-b border-black text-[11px] font-extrabold uppercase tracking-wider"
          style={{ gridTemplateColumns: templateColumns, gridTemplateRows: 'auto auto' }}
        >
          <div
            className="flex items-center border-r border-black px-4 py-2.5 text-white"
            style={{ gridColumn: '1', gridRow: '1 / 3', background: HEADER_DARK }}
          >
            Estudiante
          </div>

          {groupCells.map((g) => (
            <div
              key={g.categoryId}
              className="border-r border-black py-2 text-center text-white"
              style={{ gridColumn: `${g.start} / span ${g.count}`, gridRow: '1', background: g.color }}
            >
              {g.name}
              {g.weight ? ` ${g.weight}%` : ''}
            </div>
          ))}

          <div
            className="border-r border-black py-2.5 text-center text-white"
            style={{ gridColumn: `${promCol}`, gridRow: '1 / 3', background: HEADER_DARK }}
          >
            Prom.
          </div>
          <div
            className="px-2 py-2.5 text-center text-white"
            style={{ gridColumn: `${estadoCol}`, gridRow: '1 / 3', background: HEADER_DARK }}
          >
            Estado
          </div>

          {columns.map((col, idx) => (
            <div
              key={col.key}
              title={col.auto ? 'Se calcula sola con la asistencia — se puede escribir un valor a mano si querés cambiarla' : undefined}
              className="flex items-center justify-center gap-1 border-r border-t border-black py-1.5 text-center text-[10px] text-white"
              style={{ gridColumn: `${idx + 2}`, gridRow: '2', background: col.color }}
            >
              {col.auto && <i className="ph-fill ph-magic-wand text-[10px]" />}
              {col.header}
            </div>
          ))}
        </div>

        {students.map((student) => (
          <div
            key={student.id}
            className="grid items-center border-t border-[#F4F6F9]"
            style={{ gridTemplateColumns: templateColumns }}
          >
            <div className="flex items-center gap-2.5 border-r border-black px-4 py-2">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: DOT_BY_STATUS[student.status.key] }}
              />
              <span className="truncate text-[13.5px] font-bold text-[#1E293B]">{student.name}</span>
            </div>

            {columns.map((col) =>
              col.type === 'total' ? (
                <div key={col.key} className="border-r border-black text-center">
                  <div className="text-[14px] font-extrabold text-[var(--brand)]">{totalFor(student, col) ?? '—'}</div>
                  <div className="-mt-0.5 text-[10.5px] font-bold text-[var(--brand)]">
                    → {categoryContributionPct(student, col, colByKey)}%
                  </div>
                </div>
              ) : (
                (() => {
                  const value = student.grades[col.key];
                  const error = gradeError(value, col);
                  return (
                    <div key={col.key} className="border-r border-black px-1 py-1">
                      <div className="flex items-center gap-0.5">
                        <input
                          type="text"
                          value={value ?? ''}
                          title={error ?? undefined}
                          onChange={(e) => {
                            const raw = e.target.value;
                            onGradeChange(student.id, col.key, raw === '' ? '' : Number(raw));
                          }}
                          onBlur={() => {
                            if (gradeError(student.grades[col.key], col)) return; // no se guarda hasta corregirla
                            onGradeCommit?.(student.id, col.key, student.grades[col.key] ?? null);
                          }}
                          className={`w-full min-w-0 flex-1 rounded-lg border bg-transparent py-1.5 text-center text-[14px] font-bold outline-none focus:bg-white ${
                            error
                              ? 'border-[#DC2626] text-[#DC2626] focus:border-[#DC2626]'
                              : 'border-transparent text-[#1E293B] focus:border-[var(--brand)]'
                          }`}
                        />
                        {col.tieneRubrica && (
                          <button
                            type="button"
                            onClick={() => onOpenRubrica?.(student.id, col.key)}
                            title="Evaluar con rúbrica"
                            className="press shrink-0 text-[var(--brand)]"
                          >
                            <i className="ph-fill ph-clipboard-text text-[15px]" />
                          </button>
                        )}
                      </div>
                      {error ? (
                        <div className="-mt-0.5 text-center text-[10.5px] font-bold text-[#DC2626]">{error}</div>
                      ) : (
                        contributionPct(value, col) != null && (
                          <div className="-mt-0.5 text-center text-[10.5px] font-bold text-[var(--brand)]">
                            → {contributionPct(value, col)}%
                          </div>
                        )
                      )}
                    </div>
                  );
                })()
              ),
            )}

            <div
              className="border-r border-black text-center text-[15.5px] font-extrabold"
              style={{ color: student.status.key === 'ok' ? '#0F172A' : student.status.color }}
            >
              {student.avg != null && student.status.key !== 'incomplete' ? student.avg.toFixed(1) : '—'}
            </div>
            <div className="px-2 text-center">
              <span
                className="whitespace-nowrap rounded-full px-2 py-1 text-[10.5px] font-extrabold"
                style={{ background: student.status.bg, color: student.status.color }}
              >
                {student.status.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GradesTable;
