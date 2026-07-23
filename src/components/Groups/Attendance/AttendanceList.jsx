import { ATTENDANCE_STATUSES } from './attendanceStatus';

/**
 * Roster con un toggle de 3 estados (presente/ausente/tardía) por estudiante.
 * "Justificada" es un flag secundario y para la tardía injustificada se pide
 * la hora real de llegada — el backend calcula solo cuántas lecciones del
 * bloque de ese día se perdieron (ver grading.util.ts / schedule.util.ts).
 */
function AttendanceList({ students, statusById, onSetStatus, onToggleFlag, onSetHoraLlegada }) {
  return (
    <div className="flex flex-col gap-2.5">
      {students.map((student) => {
        const current = statusById[student.id] ?? { estado: 'presente', justificada: false, horaLlegada: null };
        const mostrarJustificada = current.estado === 'ausente' || current.estado === 'tardia';
        const mostrarHora = current.estado === 'tardia' && !current.justificada;

        return (
          <div
            key={student.id}
            className="flex flex-col gap-2 rounded-2xl border border-[#EEF1F6] bg-white px-3.5 py-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F1F4F8] text-[12.5px] font-extrabold text-[#475569]">
                {student.initials}
              </div>
              <span className="min-w-0 flex-1 truncate text-[14px] font-bold text-[#1E293B]">{student.name}</span>
              <div className="flex shrink-0 gap-1.5">
                {ATTENDANCE_STATUSES.map(({ key, icon, color }) => {
                  const active = current.estado === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      title={key}
                      onClick={() => onSetStatus(student.id, key)}
                      className="press flex h-[38px] w-10 items-center justify-center rounded-[10px] border"
                      style={{
                        background: active ? color : '#fff',
                        borderColor: active ? color : '#E2E8F0',
                        color: active ? '#fff' : '#CBD5E1',
                      }}
                    >
                      <i className={`ph-bold ${icon} text-[18px]`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {(mostrarJustificada || mostrarHora) && (
              <div className="ml-[46px] flex flex-wrap items-center gap-1.5">
                {mostrarJustificada && (
                  <button
                    type="button"
                    onClick={() => onToggleFlag(student.id, 'justificada')}
                    className="press flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-bold"
                    style={{
                      background: current.justificada ? '#EEF2FF' : '#fff',
                      borderColor: current.justificada ? 'var(--brand)' : '#E2E8F0',
                      color: current.justificada ? 'var(--brand-dark)' : '#94A3B8',
                    }}
                  >
                    <i className={`ph-bold ${current.justificada ? 'ph-check-square' : 'ph-square'} text-[13px]`} />
                    Justificada
                  </button>
                )}
                {mostrarHora && (
                  <label className="flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-2.5 py-1 text-[11.5px] font-bold text-[#475569]">
                    <i className="ph-bold ph-clock text-[13px] text-[#C2410C]" />
                    Llegó a las
                    <input
                      type="time"
                      value={current.horaLlegada ?? ''}
                      onChange={(e) => onSetHoraLlegada(student.id, e.target.value)}
                      className="border-none bg-transparent text-[11.5px] font-bold text-[#1E293B] outline-none"
                    />
                  </label>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default AttendanceList;
