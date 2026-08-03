import { useNavigate, useParams } from 'react-router-dom';

/** Roster table: Estudiante / Prom. / Asist. / Estado / Acciones. Each row is tinted a soft pastel matching the student's status. */
function StudentsTable({ students, onEditar, onTrasladar, onEliminar }) {
  const navigate = useNavigate();
  const { groupId, centroId } = useParams();
  const verPerfil = (student) => navigate(`/inicio/${centroId}/grupos/${groupId}/estudiantes/${student.id}`);

  return (
    <>
      {/* PC/tablet: tabla completa, sin cambios. */}
      <div className="hidden overflow-x-auto rounded-2xl border border-[#EEF1F6] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:block">
        <div className="min-w-[620px]">
          <div className="grid grid-cols-[1.7fr_90px_90px_110px_120px] border-b border-[#EEF1F6] bg-[#F8FAFC] text-[11px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
            <div className="sticky left-0 z-20 bg-[#F8FAFC] px-4 py-3">Estudiante</div>
            <div className="py-3 text-center">Prom.</div>
            <div className="py-3 text-center">Asist.</div>
            <div className="px-4 py-3 text-center">Estado</div>
            <div className="px-4 py-3 text-right">Acciones</div>
          </div>

          {students.map((student) => (
            <div
              key={student.id}
              className="grid grid-cols-[1.7fr_90px_90px_110px_120px] items-center border-t border-[#F4F6F9]"
              style={{ background: student.status.bg }}
            >
              <div
                onClick={() => verPerfil(student)}
                className="press sticky left-0 z-10 flex items-center gap-2.5 px-4 py-2.5"
                style={{ background: student.status.bg }}
              >
                <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-white/70 text-[11.5px] font-extrabold text-[#334155]">
                  {student.initials}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-bold text-[#0F172A]">{student.name}</div>
                  {student.telefonoEncargado && (
                    <div className="flex items-center gap-1 truncate text-[11.5px] font-semibold text-[#94A3B8]">
                      <i className="ph-bold ph-phone text-[11px]" />
                      {student.telefonoEncargado}
                    </div>
                  )}
                  {student.correoEncargado && (
                    <div className="flex items-center gap-1 truncate text-[11.5px] font-semibold text-[#94A3B8]">
                      <i className="ph-bold ph-envelope-simple text-[11px]" />
                      {student.correoEncargado}
                    </div>
                  )}
                </div>
              </div>
              <div
                className="text-center text-[15.5px] font-extrabold"
                style={{ color: student.status.key === 'ok' ? '#0F172A' : student.status.color }}
              >
                {student.avgLiteral != null ? student.avgLiteral.toFixed(1) : '—'}
              </div>
              <div className="text-center text-[13.5px] font-semibold text-[#475569]">
                {student.attendance != null ? `${student.attendance}%` : '—'}
              </div>
              <div className="px-4 text-center">
                <span
                  className="whitespace-nowrap rounded-full px-2.5 py-1 text-[10.5px] font-extrabold text-white"
                  style={{ background: student.status.color }}
                >
                  {student.status.label}
                </span>
              </div>
              <div className="flex items-center justify-end gap-1.5 px-4">
                <button
                  type="button"
                  onClick={() => onEditar?.(student)}
                  title="Editar"
                  className="press flex h-7 w-7 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white/80 text-[var(--brand)]"
                >
                  <i className="ph ph-pencil-simple text-[13.5px]" />
                </button>
                <button
                  type="button"
                  onClick={() => onTrasladar?.(student)}
                  title="Trasladar"
                  className="press flex h-7 w-7 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white/80 text-[var(--brand)]"
                >
                  <i className="ph ph-arrows-left-right text-[13.5px]" />
                </button>
                <button
                  type="button"
                  onClick={() => onEliminar?.(student)}
                  title="Eliminar"
                  className="press flex h-7 w-7 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white/80 text-[#DC2626]"
                >
                  <i className="ph ph-trash text-[13.5px]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: lista de cards. */}
      <div className="flex flex-col gap-2.5 sm:hidden">
        {students.map((student) => (
          <div
            key={student.id}
            className="rounded-2xl border p-3.5"
            style={{ background: student.status.bg, borderColor: `${student.status.color}33` }}
          >
            <div onClick={() => verPerfil(student)} className="press flex items-start gap-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/70 text-[12px] font-extrabold text-[#334155]">
                {student.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[14.5px] font-bold text-[#0F172A]">{student.name}</span>
                  <span
                    className="shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-extrabold text-white"
                    style={{ background: student.status.color }}
                  >
                    {student.status.label}
                  </span>
                </div>
                {student.telefonoEncargado && (
                  <div className="flex items-center gap-1 truncate text-[11.5px] font-semibold text-[#94A3B8]">
                    <i className="ph-bold ph-phone text-[11px]" />
                    {student.telefonoEncargado}
                  </div>
                )}
                {student.correoEncargado && (
                  <div className="flex items-center gap-1 truncate text-[11.5px] font-semibold text-[#94A3B8]">
                    <i className="ph-bold ph-envelope-simple text-[11px]" />
                    {student.correoEncargado}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 flex items-center gap-4 border-t border-black/5 pt-2.5">
              <div>
                <div
                  className="text-[16px] font-extrabold leading-none"
                  style={{ color: student.status.key === 'ok' ? '#0F172A' : student.status.color }}
                >
                  {student.avgLiteral != null ? student.avgLiteral.toFixed(1) : '—'}
                </div>
                <div className="text-[10.5px] font-bold text-[#64748B]">promedio</div>
              </div>
              <div>
                <div className="text-[16px] font-extrabold leading-none text-[#475569]">
                  {student.attendance != null ? `${student.attendance}%` : '—'}
                </div>
                <div className="text-[10.5px] font-bold text-[#64748B]">asistencia</div>
              </div>

              <div className="ml-auto flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onEditar?.(student)}
                  title="Editar"
                  className="press flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white/80 text-[var(--brand)]"
                >
                  <i className="ph ph-pencil-simple text-[14px]" />
                </button>
                <button
                  type="button"
                  onClick={() => onTrasladar?.(student)}
                  title="Trasladar"
                  className="press flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white/80 text-[var(--brand)]"
                >
                  <i className="ph ph-arrows-left-right text-[14px]" />
                </button>
                <button
                  type="button"
                  onClick={() => onEliminar?.(student)}
                  title="Eliminar"
                  className="press flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white/80 text-[#DC2626]"
                >
                  <i className="ph ph-trash text-[14px]" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default StudentsTable;
