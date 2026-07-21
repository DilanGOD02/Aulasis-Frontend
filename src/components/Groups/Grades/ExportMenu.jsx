import { useEffect, useRef, useState } from 'react';
import {
  exportNotasExcel,
  exportNotasGlobalExcel,
  exportNotasGlobalPdf,
  exportNotasPdf,
  exportNotasSea,
} from '../../../utils/exportNotas';

const OPTIONS = [
  { key: 'pdf', label: 'Exportar notas PDF', icon: 'ph-file-pdf' },
  { key: 'excel', label: 'Exportar notas Excel', icon: 'ph-file-xls' },
  { key: 'sea', label: 'Exportar notas SEA', icon: 'ph-file-arrow-down' },
];

/** "Año completo" no tiene desglose por ítem — solo tiene sentido PDF/Excel, no el formato SEA (que es por periodo). */
const GLOBAL_OPTIONS = OPTIONS.filter((o) => o.key !== 'sea');

/** Hamburger menu next to "Guardado automático" con las opciones de exportación de notas. */
function ExportMenu({ group, students }) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(null);
  const ref = useRef(null);
  const isGlobal = group.modo === 'global';

  useEffect(() => {
    if (!open) return undefined;
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const handleSelect = async (key) => {
    setExporting(key);
    try {
      if (isGlobal) {
        if (key === 'pdf') exportNotasGlobalPdf(group, students);
        else if (key === 'excel') await exportNotasGlobalExcel(group, students);
      } else if (key === 'pdf') {
        exportNotasPdf(group, students);
      } else if (key === 'excel') {
        await exportNotasExcel(group, students);
      } else if (key === 'sea') {
        await exportNotasSea(group, students);
      }
    } finally {
      setExporting(null);
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Exportar notas"
        className="press flex h-9 w-9 items-center justify-center rounded-[11px] border border-[#E8ECF2] bg-white text-[#475569]"
      >
        <i className="ph ph-list text-[18px]" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1.5 w-56 overflow-hidden rounded-xl border border-[#E8ECF2] bg-white py-1.5 shadow-[0_8px_24px_rgba(16,24,40,0.12)]">
          {(isGlobal ? GLOBAL_OPTIONS : OPTIONS).map((opt) => (
            <button
              key={opt.key}
              type="button"
              disabled={exporting != null}
              onClick={() => handleSelect(opt.key)}
              className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-[13px] font-semibold text-[#334155] hover:bg-[#F4F6F9] disabled:opacity-50"
            >
              <i className={`ph ${opt.icon} text-[16px] text-[var(--brand)]`} />
              {exporting === opt.key ? 'Generando…' : opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExportMenu;
