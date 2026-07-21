/** Avatar + identity + the two headline stats (promedio, asistencia). */
function StudentIdentityCard({ student, group }) {
  return (
    <div className="rounded-2xl border border-[#EEF1F6] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-6">
      <div className="mb-4 flex items-center gap-3.5">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[18px] font-extrabold text-white"
          style={{ background: group.color }}
        >
          {student.initials}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[18px] font-extrabold text-[#0F172A]">{student.name}</div>
          <div className="text-[13px] font-semibold text-[#94A3B8]">
            {group.name} · Cédula {student.cedula}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[14px] p-4" style={{ background: student.status.bg }}>
          <div className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: student.status.color }}>
            Promedio
          </div>
          <div className="mt-1 text-[26px] font-extrabold leading-none" style={{ color: student.status.color }}>
            {student.avg != null ? student.avg.toFixed(1) : '—'}
          </div>
          <div className="mt-1 text-[12px] font-bold" style={{ color: student.status.color }}>
            {student.status.label}
          </div>
        </div>
        <div className="rounded-[14px] bg-[var(--brand)]/10 p-4">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--brand-dark)]">
            Asistencia
          </div>
          {student.asistenciaCounts ? (
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
              <div>
                <span className="text-[19px] font-extrabold leading-none text-[#16A34A]">
                  {student.asistenciaCounts.presente}
                </span>
                <div className="text-[10.5px] font-bold text-[#64748B]">presente</div>
              </div>
              <div>
                <span className="text-[19px] font-extrabold leading-none text-[#C2410C]">
                  {student.asistenciaCounts.tardia}
                </span>
                <div className="text-[10.5px] font-bold text-[#64748B]">tardía</div>
              </div>
              <div>
                <span className="text-[19px] font-extrabold leading-none text-[#DC2626]">
                  {student.asistenciaCounts.ausente}
                </span>
                <div className="text-[10.5px] font-bold text-[#64748B]">ausente</div>
              </div>
            </div>
          ) : (
            <div className="mt-1 text-[26px] font-extrabold leading-none text-[var(--brand-dark)]">—</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentIdentityCard;
