import { useNavigate, useParams } from 'react-router-dom';

/** Roster table: Estudiante / Prom. / Asist. / Estado. Each row is tinted a soft pastel matching the student's status. */
function StudentsTable({ students }) {
  const navigate = useNavigate();
  const { groupId } = useParams();

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#EEF1F6] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="min-w-[520px]">
        <div className="grid grid-cols-[1.7fr_90px_90px_124px] border-b border-[#EEF1F6] bg-[#F8FAFC] text-[11px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
          <div className="px-4 py-3">Estudiante</div>
          <div className="py-3 text-center">Prom.</div>
          <div className="py-3 text-center">Asist.</div>
          <div className="px-4 py-3 text-right">Estado</div>
        </div>

        {students.map((student) => (
          <div
            key={student.id}
            onClick={() => navigate(`/grupos/${groupId}/estudiantes/${student.id}`)}
            className="press grid grid-cols-[1.7fr_90px_90px_124px] items-center border-t border-[#F4F6F9]"
            style={{ background: student.status.bg }}
          >
            <div className="flex items-center gap-2.5 px-4 py-2.5">
              <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-white/70 text-[11.5px] font-extrabold text-[#334155]">
                {student.initials}
              </div>
              <span className="truncate text-[14px] font-bold text-[#0F172A]">{student.name}</span>
            </div>
            <div
              className="text-center text-[15.5px] font-extrabold"
              style={{ color: student.status.key === 'ok' ? '#0F172A' : student.status.color }}
            >
              {student.avg != null ? student.avg.toFixed(1) : '—'}
            </div>
            <div className="text-center text-[13.5px] font-semibold text-[#475569]">
              {student.attendance != null ? `${student.attendance}%` : '—'}
            </div>
            <div className="px-4 py-2 text-right">
              <span
                className="whitespace-nowrap rounded-full px-2.5 py-1 text-[10.5px] font-extrabold text-white"
                style={{ background: student.status.color }}
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

export default StudentsTable;
