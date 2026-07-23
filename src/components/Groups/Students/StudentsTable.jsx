import { useNavigate, useParams } from 'react-router-dom';

/** Roster table: Estudiante / Prom. / Asist. / Estado / Acciones. Each row is tinted a soft pastel matching the student's status. */
function StudentsTable({ students, onEditar, onTrasladar, onEliminar }) {
  const navigate = useNavigate();
  const { groupId } = useParams();

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#EEF1F6] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="min-w-[620px]">
        <div className="grid grid-cols-[1.7fr_90px_90px_110px_120px] border-b border-[#EEF1F6] bg-[#F8FAFC] text-[11px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
          <div className="px-4 py-3">Estudiante</div>
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
              onClick={() => navigate(`/grupos/${groupId}/estudiantes/${student.id}`)}
              className="press flex items-center gap-2.5 px-4 py-2.5"
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
              </div>
            </div>
            <div
              className="text-center text-[15.5px] font-extrabold"
              style={{ color: student.status.key === 'ok' ? '#0F172A' : student.status.color }}
            >
              {student.avg != null && student.status.key !== 'incomplete' ? student.avg.toFixed(1) : '—'}
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
  );
}

export default StudentsTable;
