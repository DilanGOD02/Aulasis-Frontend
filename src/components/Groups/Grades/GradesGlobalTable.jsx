const DOT_BY_STATUS = { ok: '#16A34A', limit: '#1D4ED8', risk: '#D97706', reprobado: '#DC2626', incomplete: '#94A3B8' };

/**
 * Tabla de "Año completo": una columna por periodo (la nota YA obtenida ahí)
 * más la nota final (promedio simple de esos periodos) — de solo lectura,
 * sin desglose por ítem (eso solo tiene sentido dentro de un periodo puntual).
 */
function GradesGlobalTable({ students, periodos }) {
  const templateColumns = `200px repeat(${periodos.length}, 1fr) 110px 104px`;
  const sinNotas = students.every((s) => periodos.every((p) => s.periodoPromedios?.[p.id] == null));

  return (
    <>
      {/* PC/tablet: tabla completa, sin cambios. */}
      <div className="hidden overflow-x-auto rounded-2xl border border-[#EEF1F6] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:block">
        <div style={{ minWidth: 200 + periodos.length * 100 + 110 + 104 }}>
          <div
            className="grid border-b border-[#EEF1F6] bg-[#FAFBFD] text-[11px] font-extrabold uppercase tracking-wider text-[#94A3B8]"
            style={{ gridTemplateColumns: templateColumns }}
          >
            <div className="sticky left-0 z-20 bg-[#FAFBFD] px-4 py-2.5">Estudiante</div>
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
              <div className="sticky left-0 z-10 flex items-center gap-2.5 bg-white px-4 py-2">
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

          {sinNotas && (
            <div className="flex flex-col items-center gap-1.5 border-t border-[#F4F6F9] px-4 py-10 text-center">
              <i className="ph ph-notebook text-[22px] text-[#CBD5E1]" />
              <div className="text-[13.5px] font-bold text-[#64748B]">Todavía no hay notas registradas en ningún periodo</div>
              <div className="text-[12.5px] font-medium text-[#94A3B8]">Cargá notas en un periodo puntual para que aparezcan acá.</div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: una card por estudiante con la nota de cada periodo. */}
      <div className="flex flex-col gap-2.5 sm:hidden">
        {students.map((student) => (
          <div key={student.id} className="rounded-2xl border border-[#EEF1F6] bg-white p-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: DOT_BY_STATUS[student.status.key] }} />
              <span className="min-w-0 flex-1 truncate text-[14px] font-bold text-[#1E293B]">{student.name}</span>
              <span
                className="shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-extrabold"
                style={{ background: student.status.bg, color: student.status.color }}
              >
                {student.status.label}
              </span>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-2 border-t border-[#F1F4F8] pt-2.5">
              {periodos.map((p) => {
                const nota = student.periodoPromedios?.[p.id];
                return (
                  <div key={p.id} className="rounded-[9px] bg-[#FAFBFD] px-2.5 py-1.5 text-center">
                    <div className="text-[13px] font-extrabold text-[#1E293B]">{nota != null ? nota.toFixed(1) : '—'}</div>
                    <div className="text-[9.5px] font-bold text-[#94A3B8]">{p.nombre}</div>
                  </div>
                );
              })}
              <div className="ml-auto rounded-[9px] bg-[var(--brand)]/10 px-2.5 py-1.5 text-center">
                <div className="text-[13px] font-extrabold text-[var(--brand)]">
                  {student.avg != null && student.status.key !== 'incomplete' ? student.avg.toFixed(1) : '—'}
                </div>
                <div className="text-[9.5px] font-bold text-[var(--brand-dark)]">Nota final</div>
              </div>
            </div>
          </div>
        ))}

        {sinNotas && (
          <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-[#EEF1F6] bg-white px-4 py-10 text-center">
            <i className="ph ph-notebook text-[22px] text-[#CBD5E1]" />
            <div className="text-[13.5px] font-bold text-[#64748B]">Todavía no hay notas registradas en ningún periodo</div>
            <div className="text-[12.5px] font-medium text-[#94A3B8]">Cargá notas en un periodo puntual para que aparezcan acá.</div>
          </div>
        )}
      </div>
    </>
  );
}

export default GradesGlobalTable;
