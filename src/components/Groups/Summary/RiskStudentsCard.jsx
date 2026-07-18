import { useNavigate } from 'react-router-dom';

// Rotating pastel palette for the avatars in this list.
const AVATAR_COLORS = [
  { bg: '#FEE2E2', color: '#DC2626' },
  { bg: '#FFEDD5', color: '#C2410C' },
  { bg: '#FEF3C7', color: '#B45309' },
];

function RiskStudentRow({ student, index }) {
  const { bg, color } = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const need = Math.max(0, 70 - student.avg);

  return (
    <div className="press flex items-center gap-3.5 border-t border-[#F4F6F9] py-2.5">
      <div
        className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full text-[12.5px] font-extrabold"
        style={{ background: bg, color }}
      >
        {student.initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14.5px] font-bold text-[#0F172A]">{student.name}</div>
        <div className="text-[12.5px] font-semibold text-[#94A3B8]">
          Promedio: {student.avg.toFixed(1)} · para 70 +{need.toFixed(1)}
        </div>
      </div>
      <span className="text-[13px] font-bold text-[var(--brand)]">Ver</span>
    </div>
  );
}

/** "Estudiantes que requieren atención" card — students in the "al límite" or "en riesgo" bands. */
function RiskStudentsCard({ students }) {
  const navigate = useNavigate();

  return (
    <div className="rounded-[18px] border border-[#FCDADA] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-6">
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="ph-fill ph-warning text-[19px] text-[#DC2626]" />
          <span className="text-[17px] font-extrabold text-[#0F172A]">Estudiantes que requieren atención</span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/alertas')}
          className="press shrink-0 whitespace-nowrap text-[13px] font-bold text-[var(--brand)]"
        >
          Ver todos →
        </button>
      </div>

      {students.length === 0 ? (
        <div className="py-2 text-[13.5px] font-semibold text-[#94A3B8]">
          Nadie necesita atención en este grupo ahora mismo.
        </div>
      ) : (
        <div className="flex flex-col">
          {students.map((student, index) => (
            <RiskStudentRow key={student.name} student={student} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

export default RiskStudentsCard;
