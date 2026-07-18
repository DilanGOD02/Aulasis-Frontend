/** Category filter pills ("Todas · 100%", "Cotidiano 30%", ...) + the autosave indicator. */
function CategoryFilterPills({ filters, active, onChange }) {
  return (
    <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => onChange(f.key)}
            className={`press whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12.5px] font-bold ${
              active === f.key ? 'bg-[var(--brand)] text-white' : 'border border-[#E8ECF2] bg-white text-[#475569]'
            }`}
          >
            {f.label} {f.weight}%
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-1.5 whitespace-nowrap rounded-[11px] bg-[#ECFDF3] px-3.5 py-2 text-[13px] font-bold text-[#15803D]">
        <i className="ph-fill ph-check-circle text-[16px]" />
        Guardado automático
      </div>
    </div>
  );
}

export default CategoryFilterPills;
