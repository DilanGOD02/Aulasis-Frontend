import { useEffect, useRef, useState } from 'react';
import {
  exportNotasDesglosadasExcel,
  exportNotasDesglosadasPdf,
  exportNotasGlobalExcel,
  exportNotasGlobalPdf,
  exportNotasResumenExcel,
  exportNotasResumenPdf,
  exportNotasSea,
} from '../../../utils/exportNotas';
import { formatDocente } from '../../../utils/exportHeader';
import { useAuth } from '../../../context/AuthContext';

const OPTIONS = [
  { key: 'pdf-desglosado', label: 'Exportar notas desglosadas PDF', icon: 'ph-file-pdf' },
  { key: 'excel-desglosado', label: 'Exportar notas desglosadas Excel', icon: 'ph-file-xls' },
  { key: 'pdf-resumen', label: 'Exportar notas PDF', icon: 'ph-file-pdf' },
  { key: 'excel-resumen', label: 'Exportar notas Excel', icon: 'ph-file-xls' },
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
  const { user } = useAuth();

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
      const docente = formatDocente(user);
      if (isGlobal) {
        if (key === 'pdf') await exportNotasGlobalPdf(group, students, docente);
        else if (key === 'excel') await exportNotasGlobalExcel(group, students, docente);
      } else if (key === 'pdf-desglosado') {
        await exportNotasDesglosadasPdf(group, students, docente);
      } else if (key === 'excel-desglosado') {
        await exportNotasDesglosadasExcel(group, students, docente);
      } else if (key === 'pdf-resumen') {
        await exportNotasResumenPdf(group, students, docente);
      } else if (key === 'excel-resumen') {
        await exportNotasResumenExcel(group, students, docente);
      } else if (key === 'sea') {
        exportNotasSea(group, students);
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
        className="press flex items-center gap-1.5 rounded-[11px] border border-[#E8ECF2] bg-white px-3.5 py-2 text-[13px] font-bold text-[#475569]"
      >
        <i className="ph-bold ph-export text-[16px]" />
        Exportar
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
