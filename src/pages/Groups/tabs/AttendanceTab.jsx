import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  AttendanceStatCards,
  AttendanceActionsBar,
  AttendanceList,
  AttendanceHistorialModal,
  AttendanceExportMenu,
  countByStatus,
  DEFAULT_ENTRY,
} from '../../../components/Groups/Attendance';
import { asistenciasService } from '../../../services/asistenciasService';

function todayLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Hoy si cae dentro del periodo; si el periodo ya terminó, su último día; si aún no empieza, su primer día. */
function defaultFechaParaPeriodo(periodo) {
  const hoy = todayLocalDateString();
  if (!periodo?.fechaInicio || !periodo?.fechaFin) return hoy;
  if (hoy >= periodo.fechaInicio && hoy <= periodo.fechaFin) return hoy;
  if (hoy > periodo.fechaFin) return periodo.fechaFin;
  return periodo.fechaInicio;
}

function AttendanceTab() {
  const { group, reloadGroup } = useOutletContext();
  const esGlobal = group.modo === 'global';
  const periodoActivoId = group.periodoSeleccionadoId ?? group.periodoActualId;
  const periodoActivo = group.periodos.find((p) => p.id === periodoActivoId) ?? null;

  const [fecha, setFecha] = useState(() => defaultFechaParaPeriodo(periodoActivo));
  const [statusById, setStatusById] = useState(() =>
    Object.fromEntries(group.students.map((s) => [s.id, s.todayStatus ?? DEFAULT_ENTRY])),
  );
  const [isLoadingFecha, setIsLoadingFecha] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showHistorial, setShowHistorial] = useState(false);

  const isHoy = fecha === todayLocalDateString();

  // Al cambiar de periodo (pill), la fecha se reubica dentro de su rango.
  useEffect(() => {
    if (!esGlobal) setFecha(defaultFechaParaPeriodo(periodoActivo));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodoActivoId, esGlobal]);

  useEffect(() => {
    if (esGlobal) return;
    if (isHoy) {
      setStatusById(Object.fromEntries(group.students.map((s) => [s.id, s.todayStatus ?? DEFAULT_ENTRY])));
      return;
    }
    let cancelled = false;
    setIsLoadingFecha(true);
    asistenciasService
      .porFecha(group.id, fecha)
      .then((data) => {
        if (cancelled) return;
        const registroPorMatricula = new Map(data.registros.map((r) => [r.grupoEstudianteId, r]));
        setStatusById(
          Object.fromEntries(
            group.students.map((s) => {
              const r = registroPorMatricula.get(s.id);
              return [
                s.id,
                r?.estado
                  ? { estado: r.estado, justificada: !!r.justificada, horaLlegada: r.horaLlegada ?? null }
                  : DEFAULT_ENTRY,
              ];
            }),
          ),
        );
      })
      .finally(() => !cancelled && setIsLoadingFecha(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha, group.id, esGlobal]);

  const counts = useMemo(() => countByStatus(statusById), [statusById]);

  const setStatus = (id, estado) => {
    setSaved(false);
    setStatusById((prev) => ({
      ...prev,
      // Cambiar de estado resetea los flags — evita que quede "justificada"
      // pegada de un estado anterior sin que el docente la haya vuelto a marcar.
      [id]: { estado, justificada: false, horaLlegada: null },
    }));
  };
  const toggleFlag = (id, flag) => {
    setSaved(false);
    setStatusById((prev) => ({
      ...prev,
      [id]: { ...prev[id], [flag]: !prev[id]?.[flag] },
    }));
  };
  const setHoraLlegada = (id, horaLlegada) => {
    setSaved(false);
    setStatusById((prev) => ({
      ...prev,
      [id]: { ...prev[id], horaLlegada },
    }));
  };
  const markAllPresent = () => {
    setSaved(false);
    setStatusById(Object.fromEntries(group.students.map((s) => [s.id, { ...DEFAULT_ENTRY }])));
  };

  const handleGuardar = async () => {
    setIsSaving(true);
    try {
      await asistenciasService.guardar({
        grupoId: group.id,
        fecha,
        entradas: Object.entries(statusById).map(([grupoEstudianteId, entry]) => ({
          grupoEstudianteId: Number(grupoEstudianteId),
          estado: entry.estado,
          justificada: entry.justificada,
          horaLlegada: entry.horaLlegada || undefined,
        })),
      });
      setSaved(true);
      // Siempre recarga el grupo (no solo si es hoy) — así Estudiantes/Notas/
      // Resumen ya muestran los promedios y % de asistencia recién calculados
      // en cuanto el profesor cambia de tab, sin tener que refrescar a mano.
      await reloadGroup();
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditarFecha = (nuevaFecha) => {
    setFecha(nuevaFecha);
    setShowHistorial(false);
  };

  if (esGlobal) {
    return (
      <>
        <div className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-[#64748B]">
          <i className="ph ph-info text-[16px] text-[var(--brand)]" />
          Año completo (solo lectura) — veces presente, tardía y ausente en todo el año. Cambiá a un periodo puntual para pasar o editar asistencia.
        </div>
        <div className="mb-3.5 flex justify-end">
          <button
            type="button"
            onClick={() => setShowHistorial(true)}
            className="press flex items-center gap-1.5 rounded-[11px] border border-[#E8ECF2] bg-white px-3.5 py-2 text-[13px] font-bold text-[#475569]"
          >
            <i className="ph ph-chart-bar text-[16px] text-[#94A3B8]" />
            Ver historial
          </button>
        </div>
        <div className="flex flex-col gap-2.5">
          {group.students.map((student) => {
            const c = student.asistenciaCounts;
            return (
              <div
                key={student.id}
                className="flex items-center gap-3.5 rounded-2xl border border-[#EEF1F6] bg-white px-3.5 py-2.5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F1F4F8] text-[12.5px] font-extrabold text-[#475569]">
                  {student.initials}
                </div>
                <span className="min-w-0 flex-1 truncate text-[14px] font-bold text-[#1E293B]">{student.name}</span>
                {c ? (
                  <div className="flex flex-wrap justify-end gap-x-3 gap-y-0.5 text-[12.5px] font-bold">
                    <span className="text-[#16A34A]">{c.presente} presente</span>
                    <span className="text-[#C2410C]">{c.tardiaInjustificada + c.tardiaJustificada} tardía</span>
                    <span className="text-[#DC2626]">{c.ausenteInjustificada + c.ausenteJustificada} ausente</span>
                    <span className="text-[#64748B]">
                      {c.ausenteJustificada + c.tardiaJustificada} justif.
                    </span>
                  </div>
                ) : (
                  <span className="text-[13px] font-semibold text-[#94A3B8]">Sin registros</span>
                )}
              </div>
            );
          })}
        </div>

        {showHistorial && (
          <AttendanceHistorialModal
            groupId={group.id}
            onClose={() => setShowHistorial(false)}
            onEditarFecha={() => {}}
            soloLectura
          />
        )}
      </>
    );
  }

  return (
    <>
      <AttendanceStatCards counts={counts} />

      <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
        <label className="flex items-center gap-2 rounded-[11px] border border-[#E8ECF2] bg-white px-3.5 py-2">
          <i className="ph-bold ph-calendar-blank text-[16px] text-[var(--brand)]" />
          <span className="text-[13px] font-bold text-[#475569]">Fecha:</span>
          <input
            type="date"
            value={fecha}
            min={periodoActivo?.fechaInicio}
            max={
              periodoActivo?.fechaFin && periodoActivo.fechaFin < todayLocalDateString()
                ? periodoActivo.fechaFin
                : todayLocalDateString()
            }
            onChange={(e) => {
              setSaved(false);
              setFecha(e.target.value);
            }}
            className="border-none bg-transparent text-[13px] font-bold text-[#1E293B] outline-none"
          />
        </label>
        {periodoActivo && (
          <span className="rounded-full bg-[#EEF2F7] px-2.5 py-1 text-[11.5px] font-extrabold text-[#475569]">
            {periodoActivo.nombre}
          </span>
        )}
        {!isHoy && (
          <span className="rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[11.5px] font-extrabold text-[#4338CA]">
            Editando un día pasado
          </span>
        )}
        <div className="ml-auto">
          <AttendanceExportMenu group={group} fecha={fecha} students={group.students} statusById={statusById} />
        </div>
      </div>

      <AttendanceActionsBar onMarkAllPresent={markAllPresent} onVerResumen={() => setShowHistorial(true)} />

      <div className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-[#64748B]">
        <i className="ph ph-hand-tap text-[16px] text-[var(--brand)]" />
        Tocá el estado de cada estudiante: presente, ausente o tardía. Si es justificada, o si es tardía, marcalo
        debajo (para la tardía, la hora real de llegada).
      </div>

      <AttendanceList
        students={group.students}
        statusById={statusById}
        onSetStatus={setStatus}
        onToggleFlag={toggleFlag}
        onSetHoraLlegada={setHoraLlegada}
      />

      <button
        type="button"
        onClick={handleGuardar}
        disabled={isSaving || isLoadingFecha}
        className="press mt-[18px] flex w-full items-center justify-center gap-2 rounded-2xl bg-[#16A34A] py-[15px] text-[15px] font-extrabold text-white shadow-[0_12px_26px_-12px_rgba(22,163,74,0.55)] disabled:opacity-60"
      >
        <i className="ph-fill ph-check-circle text-[18px]" />
        {isSaving
          ? 'Guardando…'
          : saved
            ? 'Asistencia guardada ✓'
            : `Guardar asistencia del ${fecha} · ${group.students.length} estudiantes`}
      </button>

      {showHistorial && (
        <AttendanceHistorialModal
          groupId={group.id}
          periodoId={periodoActivoId}
          onClose={() => setShowHistorial(false)}
          onEditarFecha={handleEditarFecha}
          onChanged={reloadGroup}
        />
      )}
    </>
  );
}

export default AttendanceTab;
