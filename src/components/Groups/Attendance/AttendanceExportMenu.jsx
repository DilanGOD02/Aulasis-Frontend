import { useEffect, useRef, useState } from 'react';
import { exportAttendanceExcel, exportAttendancePdf } from '../../../utils/exportAttendance';
import { formatDocente } from '../../../utils/exportHeader';
import { useAuth } from '../../../context/AuthContext';

const OPTIONS = [
  { key: 'pdf', label: 'Exportar asistencia PDF', icon: 'ph-file-pdf' },
  { key: 'excel', label: 'Exportar asistencia Excel', icon: 'ph-file-xls' },
];

/** Hamburger menu junto al selector de fecha — exporta la lista de asistencia de la fecha elegida. */
function AttendanceExportMenu({ group, fecha, students, statusById }) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(null);
  const ref = useRef(null);
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
      if (key === 'pdf') await exportAttendancePdf(group, fecha, students, statusById, docente);
      else if (key === 'excel') await exportAttendanceExcel(group, fecha, students, statusById, docente);
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
        title="Exportar asistencia"
        className="press flex items-center gap-1.5 rounded-[11px] border border-[#E8ECF2] bg-white px-3.5 py-2 text-[13px] font-bold text-[#475569]"
      >
        <i className="ph-bold ph-export text-[16px]" />
        Exportar
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1.5 w-56 overflow-hidden rounded-xl border border-[#E8ECF2] bg-white py-1.5 shadow-[0_8px_24px_rgba(16,24,40,0.12)]">
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

export default AttendanceExportMenu;
