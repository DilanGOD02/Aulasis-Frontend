import { useNavigate } from 'react-router-dom';

/** Quick actions above the roster: mark everyone present, scan QR, jump to the summary tab. */
function AttendanceActionsBar({ onMarkAllPresent }) {
  const navigate = useNavigate();

  return (
    <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        onClick={onMarkAllPresent}
        className="press flex items-center gap-1.5 rounded-[11px] border border-[#E8ECF2] bg-white px-3.5 py-2 text-[13px] font-bold text-[#475569]"
      >
        <i className="ph ph-checks text-[16px] text-[#16A34A]" />
        Marcar todos presentes
      </button>
      <button
        type="button"
        className="press flex items-center gap-1.5 rounded-[11px] border border-[#E8ECF2] bg-white px-3.5 py-2 text-[13px] font-bold text-[#475569]"
      >
        <i className="ph ph-qr-code text-[16px] text-[#94A3B8]" />
        Escanear QR
      </button>
      <button
        type="button"
        onClick={() => navigate('..')}
        className="press flex items-center gap-1.5 rounded-[11px] border border-[#E8ECF2] bg-white px-3.5 py-2 text-[13px] font-bold text-[#475569]"
      >
        <i className="ph ph-chart-bar text-[16px] text-[#94A3B8]" />
        Ver resumen
      </button>
    </div>
  );
}

export default AttendanceActionsBar;
