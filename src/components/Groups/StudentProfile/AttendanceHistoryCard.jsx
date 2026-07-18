import { buildAttendanceHistory } from '../../../data/dummyGroups';

const STATUS_STYLE = {
  presente: { icon: 'ph-check', bg: '#F0FDF4', color: '#16A34A' },
  ausente: { icon: 'ph-x', bg: '#FEF2F2', color: '#DC2626' },
  tardia: { icon: 'ph-clock', bg: '#FFF7ED', color: '#C2410C' },
  justificada: { icon: 'ph-note', bg: '#F4F6F9', color: '#475569' },
};

const LEGEND = [
  { status: 'presente', label: 'presente' },
  { status: 'ausente', label: 'ausente' },
  { status: 'tardia', label: 'tardía' },
  { status: 'justificada', label: 'justif.' },
];

/** "Historial de asistencia" — a short strip of recent days with their attendance status. */
function AttendanceHistoryCard({ student }) {
  const history = buildAttendanceHistory(student);
  const counts = history.reduce((acc, h) => ({ ...acc, [h.status]: (acc[h.status] ?? 0) + 1 }), {});

  return (
    <div className="rounded-2xl border border-[#EEF1F6] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="text-[16px] font-extrabold text-[#0F172A]">Historial de asistencia</div>
        <div className="flex flex-wrap gap-3 text-[12px] font-semibold text-[#64748B]">
          {LEGEND.map(({ status, label }) => (
            <span key={status} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: STATUS_STYLE[status].color }} />
              {counts[status] ?? 0} {label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {history.map((entry, i) => {
          const { icon, bg, color } = STATUS_STYLE[entry.status];
          return (
            <div
              key={i}
              className="flex min-w-[84px] flex-1 flex-col items-center gap-1.5 rounded-[12px] border py-3"
              style={{ background: bg, borderColor: `${color}33` }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full text-white" style={{ background: color }}>
                <i className={`ph-bold ${icon} text-[16px]`} />
              </div>
              <div className="text-[12px] font-extrabold" style={{ color }}>
                {entry.label}
              </div>
              <div className="text-[11px] font-semibold text-[#94A3B8]">{entry.dateLabel}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AttendanceHistoryCard;
