import { useNavigate, useParams } from 'react-router-dom';

const TILES = [
  { to: 'notas', icon: 'ph-table', iconColor: '#2563EB', iconBg: '#EFF6FF', label: 'Notas', desc: 'Planilla del periodo' },
  { to: 'asistencia', icon: 'ph-calendar-check', iconColor: '#16A34A', iconBg: '#F0FDF4', label: 'Asistencia', desc: 'Pasar lista hoy' },
  { to: 'esquema', icon: 'ph-sliders-horizontal', iconColor: 'var(--brand)', iconBg: '#EEF2FF', label: 'Esquema', desc: 'Categorías y pesos' },
];

/** Shortcut tiles to the group's other tabs. */
function QuickActionTiles() {
  const navigate = useNavigate();
  const { groupId } = useParams();

  return (
    <div className="mb-[18px] flex flex-wrap gap-2.5">
      {TILES.map(({ to, icon, iconColor, iconBg, label, desc }) => (
        <button
          key={to}
          type="button"
          onClick={() => navigate(`/grupos/${groupId}/${to}`)}
          className="lift press min-w-[140px] flex-1 rounded-[15px] border border-[#EEF1F6] bg-white p-4 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
        >
          <div
            className="mb-2.5 flex h-[38px] w-[38px] items-center justify-center rounded-[11px]"
            style={{ background: iconBg }}
          >
            <i className={`ph-fill ${icon} text-[20px]`} style={{ color: iconColor }} />
          </div>
          <div className="text-[14.5px] font-extrabold text-[#0F172A]">{label}</div>
          <div className="text-[12.5px] font-semibold text-[#94A3B8]">{desc}</div>
        </button>
      ))}
    </div>
  );
}

export default QuickActionTiles;
