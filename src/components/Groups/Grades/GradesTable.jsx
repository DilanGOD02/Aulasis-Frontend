const DOT_BY_STATUS = { ok: '#16A34A', limit: '#D97706', risk: '#DC2626' };

function totalFor(student, column) {
  const values = column.leafKeys.map((k) => student.grades[k]).filter((v) => v != null);
  return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;
}

/** Grade-entry grid whose columns come from the group's evaluation schema — editable leaf cells, read-only category totals. */
function GradesTable({ students, columns, onGradeChange }) {
  const templateColumns = `200px repeat(${columns.length}, 1fr) 92px 104px`;

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#EEF1F6] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div style={{ minWidth: 200 + columns.length * 70 + 92 + 104 }}>
        <div
          className="grid border-b border-[#EEF1F6] bg-[#FAFBFD] text-[11px] font-extrabold uppercase tracking-wider text-[#94A3B8]"
          style={{ gridTemplateColumns: templateColumns }}
        >
          <div className="px-4 py-2.5">Estudiante</div>
          {columns.map((col) => (
            <div key={col.key} className="py-2.5 text-center" style={col.type === 'total' ? { color: 'var(--brand)' } : undefined}>
              {col.header}
            </div>
          ))}
          <div className="py-2.5 text-center">Prom.</div>
          <div className="px-2 py-2.5 text-center">Estado</div>
        </div>

        {students.map((student) => (
          <div
            key={student.id}
            className="grid items-center border-t border-[#F4F6F9]"
            style={{ gridTemplateColumns: templateColumns }}
          >
            <div className="flex items-center gap-2.5 px-4 py-2">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: DOT_BY_STATUS[student.status.key] }}
              />
              <span className="truncate text-[13.5px] font-bold text-[#1E293B]">{student.name}</span>
            </div>

            {columns.map((col) =>
              col.type === 'total' ? (
                <div key={col.key} className="text-center text-[14px] font-extrabold text-[var(--brand)]">
                  {totalFor(student, col) ?? '—'}
                </div>
              ) : (
                <div key={col.key} className="px-1 py-1">
                  <input
                    type="text"
                    value={student.grades[col.key] ?? ''}
                    onChange={(e) => {
                      const raw = e.target.value;
                      onGradeChange(student.id, col.key, raw === '' ? '' : Number(raw));
                    }}
                    className="w-full rounded-lg border border-transparent bg-transparent py-1.5 text-center text-[14px] font-bold text-[#1E293B] outline-none focus:border-[var(--brand)] focus:bg-white"
                  />
                </div>
              ),
            )}

            <div
              className="text-center text-[15.5px] font-extrabold"
              style={{ color: student.status.key === 'ok' ? '#0F172A' : student.status.color }}
            >
              {student.avg.toFixed(1)}
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
