import { ATTENDANCE_STATUSES } from './attendanceStatus';

/** Roster with a 4-state toggle (presente/ausente/tardía/justificada) per student. */
function AttendanceList({ students, statusById, onSetStatus }) {
  return (
    <div className="flex flex-col gap-2.5">
      {students.map((student) => {
        const current = statusById[student.id];

        return (
          <div
            key={student.id}
            className="flex items-center gap-3.5 rounded-2xl border border-[#EEF1F6] bg-white px-3.5 py-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F1F4F8] text-[12.5px] font-extrabold text-[#475569]">
              {student.initials}
            </div>
            <span className="min-w-0 flex-1 truncate text-[14px] font-bold text-[#1E293B]">{student.name}</span>
            <div className="flex shrink-0 gap-1.5">
              {ATTENDANCE_STATUSES.map(({ key, icon, color }) => {
                const active = current === key;
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
        );
      })}
    </div>
  );
}

export default AttendanceList;
