import { ATTENDANCE_STATUSES } from './attendanceStatus';

/** The 4 Presentes/Ausentes/Tardías/Justificadas count tiles. */
function AttendanceStatCards({ counts }) {
  return (
    <div className="mb-4 flex flex-wrap gap-2.5">
      {ATTENDANCE_STATUSES.map(({ key, label, color, bg, border }) => (
        <div
          key={key}
          className="min-w-[90px] flex-1 rounded-[14px] border px-4 py-3"
          style={{ background: bg, borderColor: border }}
        >
          <div className="text-[24px] font-extrabold leading-none" style={{ color }}>
            {counts[key]}
          </div>
          <div className="mt-1 text-[12px] font-bold" style={{ color }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default AttendanceStatCards;
