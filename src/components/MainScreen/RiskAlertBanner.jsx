import { useNavigate } from 'react-router-dom';

/** Red banner on the dashboard warning about students who dropped into risk range. */
function RiskAlertBanner({ count, names }) {
  const navigate = useNavigate();

  return (
    <div className="mb-4 flex items-center gap-4 rounded-2xl border border-[#FCDADA] bg-[#FEF2F2] px-4 py-3.5 sm:px-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-[#FEE2E2]">
        <i className="ph-fill ph-warning-octagon text-[22px] text-[#DC2626]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[14.5px] font-bold text-[#991B1B]">
          {count} estudiantes entraron en riesgo
        </div>
        <div className="mt-0.5 truncate text-[13px] font-medium text-[#B91C1C]">{names}</div>
      </div>
      <button
        type="button"
        onClick={() => navigate('/alertas')}
        className="press flex shrink-0 items-center gap-1 whitespace-nowrap bg-transparent text-[13.5px] font-bold text-[#DC2626]"
      >
        Ver <i className="ph-bold ph-arrow-right text-[14px]" />
      </button>
    </div>
  );
}

export default RiskAlertBanner;
