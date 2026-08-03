import { useEffect, useRef, useState } from 'react';

/** Category filter pills ("Todas · 100%", "Cotidiano 30%", ...) + the autosave indicator. */
function CategoryFilterPills({ filters, active, onChange, actions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const activeFilter = filters.find((f) => f.key === active) ?? filters[0];

  useEffect(() => {
    if (!open) return undefined;
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  return (
    <div className="mb-3.5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
      {/* Mobile: desplegable — mismas opciones, mucho menos lugar. */}
      <div className="relative sm:hidden" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="press flex w-full items-center justify-between gap-2 rounded-[11px] border border-[#E8ECF2] bg-white px-3.5 py-2.5 text-[13px] font-bold text-[#334155]"
        >
          <span className="flex items-center gap-1.5">
            <i className="ph-bold ph-funnel text-[15px] text-[var(--brand)]" />
            {activeFilter.label} · {activeFilter.weight}%
          </span>
          <i className={`ph-bold ${open ? 'ph-caret-up' : 'ph-caret-down'} text-[13px] text-[#94A3B8]`} />
        </button>
        {open && (
          <div className="absolute left-0 right-0 z-20 mt-1.5 overflow-hidden rounded-xl border border-[#E8ECF2] bg-white py-1.5 shadow-[0_8px_24px_rgba(16,24,40,0.12)]">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => {
                  onChange(f.key);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-[13px] font-semibold ${
                  f.key === active ? 'bg-[var(--brand)]/10 text-[var(--brand-dark)]' : 'text-[#334155]'
                }`}
              >
                {f.label} · {f.weight}%
                {f.key === active && <i className="ph-bold ph-check text-[14px]" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* PC/tablet: fila de pills, sin cambios. */}
      <div className="hidden flex-wrap gap-2 sm:flex">
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

      <div className="grid grid-cols-2 gap-2 sm:ml-auto sm:flex sm:w-auto sm:flex-nowrap sm:gap-2.5">
        {actions}
      </div>
      <div className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[11px] bg-[#ECFDF3] px-3.5 py-2 text-[13px] font-bold text-[#15803D] sm:justify-start">
        <i className="ph-fill ph-check-circle text-[16px]" />
        Guardado automático
      </div>
    </div>
  );
}

export default CategoryFilterPills;
