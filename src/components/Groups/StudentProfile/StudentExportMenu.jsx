import { useEffect, useRef, useState } from 'react';
import { exportStudentProfileExcel, exportStudentProfilePdf } from '../../../utils/exportStudentProfile';

const OPTIONS = [
  { key: 'pdf', label: 'Exportar PDF', icon: 'ph-file-pdf' },
  { key: 'excel', label: 'Exportar Excel', icon: 'ph-file-xls' },
];

/** Hamburger menu del perfil de un estudiante — exporta solo los datos de este estudiante (aislado del grupo). */
function StudentExportMenu({ group, student, schema, modo, periodos, historial }) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(null);
  const ref = useRef(null);

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
      const payload = { group, student, schema, modo, periodos, historial };
      if (key === 'pdf') exportStudentProfilePdf(payload);
      else if (key === 'excel') await exportStudentProfileExcel(payload);
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
        title="Exportar perfil del estudiante"
        className="press flex h-9 w-9 items-center justify-center rounded-[11px] border border-[#E8ECF2] bg-white text-[#475569]"
      >
        <i className="ph ph-list text-[18px]" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1.5 w-52 overflow-hidden rounded-xl border border-[#E8ECF2] bg-white py-1.5 shadow-[0_8px_24px_rgba(16,24,40,0.12)]">
          {OPTIONS.map((opt) => (
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

export default StudentExportMenu;
