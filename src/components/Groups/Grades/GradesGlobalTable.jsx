const DOT_BY_STATUS = { ok: '#16A34A', limit: '#D97706', risk: '#DC2626', incomplete: '#94A3B8' };

/**
 * Tabla de "Año completo": una columna por periodo (la nota YA obtenida ahí)
 * más la nota final (promedio simple de esos periodos) — de solo lectura,
 * sin desglose por ítem (eso solo tiene sentido dentro de un periodo puntual).
 */
function GradesGlobalTable({ students, periodos }) {
  const templateColumns = `200px repeat(${periodos.length}, 1fr) 110px 104px`;

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#EEF1F6] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div style={{ minWidth: 200 + periodos.length * 100 + 110 + 104 }}>
        <div
          className="grid border-b border-[#EEF1F6] bg-[#FAFBFD] text-[11px] font-extrabold uppercase tracking-wider text-[#94A3B8]"
          style={{ gridTemplateColumns: templateColumns }}
        >
          <div className="px-4 py-2.5">Estudiante</div>
          {periodos.map((p) => (
            <div key={p.id} className="py-2.5 text-center">
              {p.nombre}
            </div>
          ))}
          <div className="py-2.5 text-center" style={{ color: 'var(--brand)' }}>
            Nota final
          </div>
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

            {periodos.map((p) => {
              const nota = student.periodoPromedios?.[p.id];
              return (
                <div key={p.id} className="text-center text-[14px] font-bold text-[#1E293B]">
                  {nota != null ? nota.toFixed(1) : '—'}
                </div>
              );
            })}

            <div className="text-center text-[15.5px] font-extrabold text-[var(--brand)]">
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

export default GradesGlobalTable;
