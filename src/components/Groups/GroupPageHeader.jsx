import { useNavigate } from 'react-router-dom';

/**
 * Page header for every group-scoped screen: a gradient identity banner
 * (back button + icon + name + subtitle) colored from the group's own
 * `color`, replacing the plain white PageHeader used elsewhere in the app.
 */
function GroupPageHeader({ group }) {
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-4 sm:px-6 sm:pt-5">
      <div
        className="flex items-center gap-3.5 rounded-[18px] p-4 text-white shadow-[0_14px_30px_-16px_rgba(16,24,40,0.45)] sm:p-5"
        style={{ background: `linear-gradient(120deg, ${group.color}, color-mix(in srgb, ${group.color} 65%, black))` }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white/20"
        >
          <i className="ph-bold ph-arrow-left text-[18px]" />
        </button>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-white/20">
          <i className="ph-fill ph-graduation-cap text-[22px]" />
        </div>

        <div className="min-w-0">
          <div className="truncate text-[18px] font-extrabold tracking-tight sm:text-[20px]">{group.name}</div>
          <div className="truncate text-[13px] font-medium opacity-90">{group.sub} · II Periodo · Liceo de Heredia</div>
        </div>
      </div>
    </div>
  );
}

export default GroupPageHeader;
