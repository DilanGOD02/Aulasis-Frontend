import { useNavigate } from 'react-router-dom';
import ProgressBar from '../Globales/ProgressBar';

/** One card in the "Mis grupos" grid: identity, progress, and quick shortcuts. */
function GroupCard({ group }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/grupos/${group.id}`)}
      className="lift flex cursor-pointer overflow-hidden rounded-2xl border border-[#EEF1F6] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_26px_-20px_rgba(16,24,40,0.16)]"
      style={{ borderLeft: `4px solid ${group.color}` }}
    >
      <div className="flex-1 p-4 pb-[18px] sm:p-[18px]">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[16px] font-extrabold text-[#0F172A]">{group.name}</div>
            <div className="mt-0.5 text-[12.5px] font-semibold text-[#94A3B8]">{group.sub}</div>
          </div>
          <span
            className="whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-extrabold"
            style={{ background: group.badgeBg, color: group.badgeColor }}
          >
            {group.badge}
          </span>
        </div>

        <div className="my-4">
          <ProgressBar label="Avance del periodo" value={group.progress} color={group.color} />
        </div>

        <div className="flex gap-2 border-t border-[#F1F4F8] pt-3.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/grupos/${group.id}/estudiantes`);
            }}
            className="press flex-1 rounded-[9px] bg-[#F5F7FA] py-2 text-[13px] font-bold text-[#334155]"
          >
            Estudiantes
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/grupos/${group.id}/notas`);
            }}
            className="press flex-1 rounded-[9px] bg-[#F5F7FA] py-2 text-[13px] font-bold text-[#334155]"
          >
            Notas
          </button>
        </div>

        {group.hasRisk && (
          <div className="mt-3 flex items-center gap-1.5 text-[13px] font-bold text-[#DC2626]">
            <i className="ph-fill ph-warning text-[15px]" />
            {group.riskText}
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupCard;
