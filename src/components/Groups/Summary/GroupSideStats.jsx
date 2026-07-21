import { useNavigate } from 'react-router-dom';

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-[#EEF1F6] bg-white px-[22px] py-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-center gap-2 text-[#64748B]">
        <i className={`ph ${icon} text-[18px]`} />
        <span className="text-[13.5px] font-bold">{label}</span>
      </div>
      <div className="mt-2 text-[30px] font-extrabold text-[#0F172A]">{value}</div>
    </div>
  );
}

/** Right-column mini cards: next class schedule, student count, general average. */
function GroupSideStats({ groupId, nextClassSchedule, studentCount, avgGeneral }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-1 min-w-[220px] flex-col gap-3.5">
      <div className="rounded-2xl border border-[#EEF1F6] bg-white px-[22px] py-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="text-[11.5px] font-extrabold uppercase tracking-wider text-[#94A3B8]">Próxima clase</div>
        <div className="my-2 text-[18px] font-extrabold text-[#0F172A]">{nextClassSchedule || 'Sin horario'}</div>
        <button
          type="button"
          onClick={() => navigate(`/grupos/${groupId}/asistencia`)}
          className="press inline-flex items-center gap-1.5 text-[13.5px] font-bold text-[var(--brand)]"
        >
          Pasar asistencia <i className="ph-bold ph-arrow-right text-[14px]" />
        </button>
      </div>

      <StatCard icon="ph-users-three" label="Estudiantes" value={studentCount} />
      <StatCard icon="ph-trend-up" label="Promedio general" value={avgGeneral != null ? avgGeneral.toFixed(1) : '—'} />
    </div>
  );
}

export default GroupSideStats;
