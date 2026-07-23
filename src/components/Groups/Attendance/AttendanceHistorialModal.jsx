import { useEffect, useState } from 'react';
import { asistenciasService } from '../../../services/asistenciasService';
import { ATTENDANCE_STATUSES } from './attendanceStatus';
import { useConfirm } from '../../../context/ConfirmContext';

const STATUS_BY_KEY = Object.fromEntries(ATTENDANCE_STATUSES.map((s) => [s.key, s]));

/**
 * "Ver resumen" del tab de Asistencia: historial real de fechas con asistencia
 * tomada para el grupo, con el desglose por estudiante de cada una. Elegir
 * "Editar" en una fecha la manda de vuelta al editor de arriba para corregirla.
 * "Eliminar" borra toda la asistencia de esa fecha. `soloLectura` (vista Año
 * completo) oculta ambas acciones.
 */
function AttendanceHistorialModal({ groupId, periodoId, soloLectura = false, onClose, onEditarFecha, onChanged }) {
  const confirm = useConfirm();
  const [historial, setHistorial] = useState(null);
  const [error, setError] = useState('');
  const [expandedFecha, setExpandedFecha] = useState(null);
  const [deletingFecha, setDeletingFecha] = useState(null);

  useEffect(() => {
    asistenciasService
      .historial(groupId, periodoId)
      .then(setHistorial)
      .catch((err) => setError(err.message));
  }, [groupId, periodoId]);

  const handleEliminar = async (fecha) => {
    const ok = await confirm({
      title: 'Eliminar asistencia',
      message: `¿Eliminar toda la asistencia del ${fecha}? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    setDeletingFecha(fecha);
    try {
      await asistenciasService.eliminarFecha(groupId, fecha);
      setHistorial((prev) => prev.filter((d) => d.fecha !== fecha));
      await onChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingFecha(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="max-h-[80vh] w-full max-w-[520px] overflow-y-auto rounded-2xl bg-white p-5 shadow-[0_30px_60px_-20px_rgba(16,24,40,0.4)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[17px] font-extrabold text-[#0F172A]">Historial de asistencia</div>
          <button type="button" onClick={onClose} className="press flex h-8 w-8 items-center justify-center rounded-full bg-[#F1F4F8]">
            <i className="ph-bold ph-x text-[15px] text-[#64748B]" />
          </button>
        </div>

        {error && <div className="text-[13px] font-bold text-[#DC2626]">{error}</div>}

        {!error && historial === null && (
          <div className="py-8 text-center text-[13px] font-semibold text-[#94A3B8]">Cargando…</div>
        )}

        {historial?.length === 0 && (
          <div className="py-8 text-center text-[13px] font-semibold text-[#94A3B8]">
            Todavía no se ha tomado asistencia en este grupo.
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {historial?.map((dia) => {
            const isOpen = expandedFecha === dia.fecha;
            return (
              <div key={dia.fecha} className="rounded-[14px] border border-[#EEF1F6]">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedFecha(isOpen ? null : dia.fecha)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setExpandedFecha(isOpen ? null : dia.fecha);
                  }}
                  className="press flex w-full cursor-pointer items-center justify-between px-3.5 py-3 text-left"
                >
                  <div>
                    <div className="text-[13.5px] font-extrabold text-[#1E293B]">{dia.fecha}</div>
                    <div className="mt-0.5 flex flex-wrap gap-2 text-[11.5px] font-bold">
                      {ATTENDANCE_STATUSES.map(
                        (s) =>
                          dia.resumen[s.key] > 0 && (
                            <span key={s.key} style={{ color: s.color }}>
                              {dia.resumen[s.key]} {s.label.toLowerCase()}
                            </span>
                          ),
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {!soloLectura && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditarFecha(dia.fecha);
                          }}
                          className="press rounded-lg bg-[var(--brand)] px-3 py-1.5 text-[12px] font-extrabold text-white"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEliminar(dia.fecha);
                          }}
                          disabled={deletingFecha === dia.fecha}
                          title="Eliminar asistencia de esta fecha"
                          className="press flex h-7 w-7 items-center justify-center rounded-lg border border-[#E8ECF2] text-[#DC2626] disabled:opacity-60"
                        >
                          <i className="ph ph-trash text-[13px]" />
                        </button>
                      </>
                    )}
                    <i className={`ph-bold ${isOpen ? 'ph-caret-up' : 'ph-caret-down'} text-[13px] text-[#94A3B8]`} />
                  </div>
                </div>

                {isOpen && (
                  <div className="flex flex-col gap-1.5 border-t border-[#F4F6F9] px-3.5 py-2.5">
                    {dia.registros.map((r) => {
                      const meta = STATUS_BY_KEY[r.estado] ?? STATUS_BY_KEY.presente;
                      return (
                        <div key={r.grupoEstudianteId} className="flex items-center justify-between text-[13px] font-semibold">
                          <span className="text-[#334155]">{r.nombre}</span>
                          <span
                            className="rounded-full px-2 py-0.5 text-[11px] font-extrabold"
                            style={{ background: meta.bg, color: meta.color }}
                          >
                            {meta.label}
                            {r.justificada && ' · justificada'}
                            {r.estado === 'tardia' && !r.justificada && r.horaLlegada && ` · llegó ${r.horaLlegada}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AttendanceHistorialModal;
