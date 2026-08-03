import { useEffect, useMemo, useRef, useState } from 'react';
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
import { LoadingOverlay } from '../../../components/Globales';
import { asistenciasService } from '../../../services/asistenciasService';
import { leccionesParaFecha, leccionesPerdidasPorTardanza } from '../../../utils/attendanceLecciones';

function todayLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** "Lecciones de hoy" ya guardado (mismo valor en todos los estudiantes de ese día) — null si nadie tiene asistencia registrada todavía. */
function leccionesYaGuardadasHoy(students) {
  const conDato = students.find((s) => s.todayStatus?.lecciones != null);
  return conDato?.todayStatus?.lecciones ?? null;
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
  const [lecciones, setLecciones] = useState(
    () => leccionesYaGuardadasHoy(group.students) ?? leccionesParaFecha(group.horarios, fecha, group.minutosPorLeccion),
  );
  const [isLoadingFecha, setIsLoadingFecha] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showHistorial, setShowHistorial] = useState(false);

  const isHoy = fecha === todayLocalDateString();

  // Estudiantes cuyo campo "lecciones perdidas" el profesor ya tocó a mano en
  // esta sesión de edición — no se les pisa el valor con la sugerencia
  // automática cuando cambia la hora de llegada u otra cosa se recalcula.
  const leccionesPerdidasManualRef = useRef(new Set());

  // Al cambiar de periodo (pill), la fecha se reubica dentro de su rango.
  useEffect(() => {
    if (!esGlobal) setFecha(defaultFechaParaPeriodo(periodoActivo));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodoActivoId, esGlobal]);

  useEffect(() => {
    if (esGlobal) return;
    leccionesPerdidasManualRef.current = new Set();
    if (isHoy) {
      setStatusById(Object.fromEntries(group.students.map((s) => [s.id, s.todayStatus ?? DEFAULT_ENTRY])));
      // Si ya se guardó asistencia hoy, se respeta ese valor — la sugerencia
      // del horario solo aplica la primera vez que se abre el día.
      setLecciones(
        leccionesYaGuardadasHoy(group.students) ?? leccionesParaFecha(group.horarios, fecha, group.minutosPorLeccion),
      );
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
                  ? {
                      estado: r.estado,
                      justificada: !!r.justificada,
                      horaLlegada: r.horaLlegada ?? null,
                      // Precarga lo ya guardado; si no hay nada guardado aún, cae a la sugerencia server-side.
                      leccionesPerdidas: r.leccionesPerdidas ?? r.leccionesPerdidasSugeridas ?? null,
                    }
                  : DEFAULT_ENTRY,
              ];
            }),
          ),
        );
        // Si ese día ya tiene asistencia guardada, se usa el valor real guardado
        // (mismo en todos los registros del día) — la sugerencia del servidor
        // solo aplica cuando todavía no hay nada guardado para esa fecha.
        const leccionesYaGuardadas = data.registros.find((r) => r.lecciones != null)?.lecciones ?? null;
        setLecciones(
          leccionesYaGuardadas ??
            data.leccionesSugeridas ??
            leccionesParaFecha(group.horarios, fecha, group.minutosPorLeccion),
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
    // Vuelve a permitir que la sugerencia automática le recalcule "lecciones
    // perdidas" a este estudiante — si venía de una tardía anterior editada a
    // mano, ese ajuste ya no aplica a un estado nuevo.
    leccionesPerdidasManualRef.current.delete(id);
    setStatusById((prev) => {
      // Cambiar de estado resetea los flags — evita que quede "justificada"
      // pegada de un estado anterior sin que el docente la haya vuelto a marcar.
      // Al marcar tardía, arranca con una hora por defecto (en vez de vacía) para
      // que el selector 12h y "lecciones perdidas" queden consistentes desde ya.
      const horaLlegada = estado === 'tardia' ? '07:00' : null;
      const leccionesPerdidas =
        estado === 'tardia'
          ? leccionesPerdidasPorTardanza(group.horarios, fecha, horaLlegada, group.minutosPorLeccion)
          : null;
      return {
        ...prev,
        [id]: { estado, justificada: false, horaLlegada, leccionesPerdidas },
      };
    });
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
    setStatusById((prev) => {
      // Si el profesor ya editó "lecciones perdidas" a mano para este estudiante,
      // no se lo pisamos al recalcular la sugerencia por el cambio de hora.
      const yaTocado = leccionesPerdidasManualRef.current.has(id);
      const leccionesPerdidas = yaTocado
        ? prev[id]?.leccionesPerdidas
        : leccionesPerdidasPorTardanza(group.horarios, fecha, horaLlegada, group.minutosPorLeccion);
      return {
        ...prev,
        [id]: { ...prev[id], horaLlegada, leccionesPerdidas },
      };
    });
  };
  const setLeccionesPerdidas = (id, valor) => {
    setSaved(false);
    leccionesPerdidasManualRef.current.add(id);
    setStatusById((prev) => ({
      ...prev,
      [id]: { ...prev[id], leccionesPerdidas: valor === '' ? null : Number(valor) },
    }));
  };
  const setLeccionesDia = (valor) => {
    setSaved(false);
    setLecciones(valor);
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
        lecciones: Number(lecciones) || 1,
        entradas: Object.entries(statusById).map(([grupoEstudianteId, entry]) => ({
          grupoEstudianteId: Number(grupoEstudianteId),
          estado: entry.estado,
          justificada: entry.justificada,
          horaLlegada: entry.horaLlegada || undefined,
          leccionesPerdidas: entry.leccionesPerdidas ?? undefined,
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
          Anual (solo lectura) — veces presente, tardía y ausente en todo el año. Cambiá a un periodo puntual para pasar o editar asistencia.
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
      <LoadingOverlay show={isSaving} message="Guardando asistencia…" />

      <AttendanceStatCards counts={counts} />

      <div className="mb-3.5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2.5">
        <div className="grid grid-cols-2 gap-2 sm:contents">
          <label className="flex items-center gap-1.5 rounded-[11px] border border-[#E8ECF2] bg-white px-2.5 py-2 sm:gap-2 sm:px-3.5">
            <i className="ph-bold ph-calendar-blank shrink-0 text-[16px] text-[var(--brand)]" />
            <span className="hidden text-[13px] font-bold text-[#475569] sm:inline">Fecha:</span>
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
              className="min-w-0 flex-1 border-none bg-transparent text-[13px] font-bold text-[#1E293B] outline-none"
            />
          </label>
          <label className="flex items-center gap-1.5 rounded-[11px] border border-[#E8ECF2] bg-white px-2.5 py-2 sm:gap-2 sm:px-3.5">
            <i className="ph-bold ph-hash shrink-0 text-[16px] text-[var(--brand)]" />
            <span className="hidden whitespace-nowrap text-[13px] font-bold text-[#475569] sm:inline">Lecciones de hoy:</span>
            <span className="whitespace-nowrap text-[13px] font-bold text-[#475569] sm:hidden">Lecciones:</span>
            <input
              type="number"
              min={1}
              value={lecciones}
              onChange={(e) => setLeccionesDia(e.target.value)}
              className="w-10 min-w-0 border-none bg-transparent text-[13px] font-bold text-[#1E293B] outline-none sm:w-14"
            />
          </label>
        </div>
        {(periodoActivo || !isHoy) && (
          <div className="flex flex-wrap items-center gap-1.5">
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
          </div>
        )}
        <div className="sm:ml-auto">
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
        onSetLeccionesPerdidas={setLeccionesPerdidas}
        lecciones={lecciones}
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
