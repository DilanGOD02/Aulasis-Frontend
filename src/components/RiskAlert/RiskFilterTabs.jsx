const FILTERS = [
  { key: 'todas', label: 'Todas', icon: 'ph-list' },
  { key: 'critico', label: 'Críticas', icon: 'ph-warning-circle' },
  { key: 'atencion', label: 'Atención', icon: 'ph-warning' },
];

/** Segmented control filtering the consolidated risk list by severity. */
function RiskFilterTabs({ active, onChange }) {
  return (
    <div className="flex shrink-0 rounded-[11px] bg-[#EEF2F7] p-[3px]">
      {FILTERS.map(({ key, label, icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`press flex items-center gap-1.5 whitespace-nowrap rounded-[9px] px-3.5 py-2 text-[13px] font-bold ${
            active === key ? 'bg-[var(--brand)] text-white shadow-sm' : 'text-[#64748B]'
          }`}
        >
          <i className={`ph-bold ${icon} text-[15px]`} />
          {label}
        </button>
      ))}
    </div>
  );
}

export default RiskFilterTabs;
