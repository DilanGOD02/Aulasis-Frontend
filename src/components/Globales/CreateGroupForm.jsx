import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { esquemasService } from '../../services/esquemasService';
import { gruposService } from '../../services/gruposService';
import { periodosService } from '../../services/periodosService';
import { mapGrupoDetail, mapTemplate } from '../../utils/mappers';
import { useToast } from '../../context/ToastContext';

const DAYS = [
  { key: 'L', label: 'Lunes', backend: 'lunes' },
  { key: 'K', label: 'Martes', backend: 'martes' },
  { key: 'M', label: 'Miércoles', backend: 'miercoles' },
  { key: 'J', label: 'Jueves', backend: 'jueves' },
  { key: 'V', label: 'Viernes', backend: 'viernes' },
];
const COLORS = ['#6366F1', '#0D9488', '#22C55E', '#F59E0B', '#EF4444', '#A855F7', '#0EA5E9', '#6D28D9'];
const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES_5 = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
const DAY_BY_BACKEND = Object.fromEntries(DAYS.map((d) => [d.backend, d.key]));

const emptySchedule = () => Object.fromEntries(DAYS.map((d) => [d.key, { enabled: false, from: '07:00', to: '08:20' }]));

/** "14:20" (24h, como lo espera el backend) -> { hour: 2, minute: '20', meridiem: 'p.m.' } */
function to12h(hhmm) {
  const [hStr, mStr] = (hhmm ?? '00:00').split(':');
  let hour = parseInt(hStr, 10) || 0;
  const meridiem = hour >= 12 ? 'p.m.' : 'a.m.';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return { hour, minute: mStr ?? '00', meridiem };
}

/** Inverso de to12h: arma de vuelta el "HH:MM" 24h que espera el backend. */
function from12h(hour, minute, meridiem) {
  let h = parseInt(hour, 10) % 12;
  if (meridiem === 'p.m.') h += 12;
  return `${String(h).padStart(2, '0')}:${minute}`;
}

function formatHora12(hhmm) {
  const { hour, minute, meridiem } = to12h(hhmm);
  return `${hour}:${minute} ${meridiem}`;
}

/** Hora explícita en 12h (hora + minuto + a.m./p.m.) — sin la ambigüedad del <input type="time">. */
function TimeField12h({ value, onChange }) {
  const { hour, minute, meridiem } = to12h(value);
  const update = (nextHour, nextMinute, nextMeridiem) => onChange(from12h(nextHour, nextMinute, nextMeridiem));

  return (
    <div className="flex items-center gap-1">
      <select
        value={hour}
        onChange={(e) => update(e.target.value, minute, meridiem)}
        className="rounded-lg border border-[#E2E8F0] px-1.5 py-1.5 text-[13.5px] font-semibold text-[#1E293B] outline-none"
      >
        {HOURS_12.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span className="text-[#94A3B8]">:</span>
      <select
        value={minute}
        onChange={(e) => update(hour, e.target.value, meridiem)}
        className="rounded-lg border border-[#E2E8F0] px-1.5 py-1.5 text-[13.5px] font-semibold text-[#1E293B] outline-none"
      >
        {MINUTES_5.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <select
        value={meridiem}
        onChange={(e) => update(hour, minute, e.target.value)}
        className="rounded-lg border border-[#E2E8F0] px-1.5 py-1.5 text-[13.5px] font-bold text-[#1E293B] outline-none"
      >
        <option value="a.m.">a.m.</option>
        <option value="p.m.">p.m.</option>
      </select>
    </div>
  );
}

/**
 * Formulario de grupo — se usa tanto para crear (sin `groupId`) como para
 * editar (con `groupId`, precarga los datos existentes). Sección, materia,
 * año lectivo, horario semanal (12h explícito), color, esquema de evaluación
 * inicial y qué periodos del curso lectivo usa este grupo (multi-select:
 * marcar/desmarcar solo decide si el periodo aplica a ESTE grupo — no borra
 * nada de la institución). Los periodos "nuevos" que se crean acá quedan
 * privados de este grupo, no le salen a otros profesores.
 */
function CreateGroupForm({ groupId }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEditMode = !!groupId;

  const [seccion, setSeccion] = useState('');
  const [materia, setMateria] = useState('');
  const [anioLectivo, setAnioLectivo] = useState(new Date().getFullYear());
  const [minutosPorLeccion, setMinutosPorLeccion] = useState(40);
  const [schedule, setSchedule] = useState(emptySchedule);
  const [color, setColor] = useState(COLORS[0]);
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(isEditMode);
  const [error, setError] = useState('');

  const [periodosDisponibles, setPeriodosDisponibles] = useState(null); // null = cargando
  const [seleccion, setSeleccion] = useState({}); // { [periodoId]: { fechaInicio, fechaFin } }
  const [seleccionInicial, setSeleccionInicial] = useState({}); // snapshot al cargar (para el diff en editar)
  const [periodosNuevosLocal, setPeriodosNuevosLocal] = useState([]); // [{tempId, nombre, fechaInicio, fechaFin}]
  const [showNuevoPeriodo, setShowNuevoPeriodo] = useState(false);
  const [nuevoPeriodoForm, setNuevoPeriodoForm] = useState({ nombre: '', fechaInicio: '', fechaFin: '' });
  const [periodoError, setPeriodoError] = useState('');

  useEffect(() => {
    esquemasService.list().then((data) => {
      const mapped = data.map(mapTemplate);
      setTemplates(mapped);
      if (!isEditMode) setTemplateId((prev) => prev ?? mapped[0]?.id ?? null);
    });
  }, [isEditMode]);

  useEffect(() => {
    if (!isEditMode) {
      periodosService.listDisponibles().then((data) => {
        setPeriodosDisponibles(data);
        if (!data.length) setShowNuevoPeriodo(true);
      });
      return;
    }

    setIsLoadingInitial(true);
    Promise.all([
      gruposService.getOne(groupId),
      periodosService.listDisponibles(groupId),
      periodosService.listParaGrupo(groupId),
    ])
      .then(([grupoData, disponibles, asociados]) => {
        const grupo = mapGrupoDetail(grupoData);
        setSeccion(grupo.seccion ?? '');
        setMateria(grupo.materia ?? '');
        setAnioLectivo(grupo.anioLectivo ?? new Date().getFullYear());
        setMinutosPorLeccion(grupo.minutosPorLeccion ?? 40);
        setColor(grupo.color ?? COLORS[0]);

        const nextSchedule = emptySchedule();
        for (const h of grupo.horarios ?? []) {
          const key = DAY_BY_BACKEND[h.diaSemana];
          if (key) nextSchedule[key] = { enabled: true, from: h.horaInicio, to: h.horaFin };
        }
        setSchedule(nextSchedule);

        setPeriodosDisponibles(disponibles);
        const inicial = Object.fromEntries(
          asociados.map((p) => [p.id, { fechaInicio: p.fechaInicio, fechaFin: p.fechaFin }]),
        );
        setSeleccion(inicial);
        setSeleccionInicial(inicial);
        if (!disponibles.length) setShowNuevoPeriodo(true);
      })
      .finally(() => setIsLoadingInitial(false));
  }, [isEditMode, groupId]);

  const activeDays = DAYS.filter((d) => schedule[d.key].enabled);
  const template = templates.find((t) => t.id === templateId);
  const necesitaPeriodo =
    periodosDisponibles !== null && periodosDisponibles.length === 0 && periodosNuevosLocal.length === 0;
  const seleccionados = Object.entries(seleccion);
  const seleccionIncompleta = seleccionados.some(([, v]) => !v.fechaInicio || !v.fechaFin);
  const totalPeriodos = seleccionados.length + periodosNuevosLocal.length;

  const toggleDay = (key) =>
    setSchedule((prev) => ({ ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } }));
  const setDayTime = (key, field, value) =>
    setSchedule((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));

  const togglePeriodo = (periodo) =>
    setSeleccion((prev) => {
      const next = { ...prev };
      if (next[periodo.id]) {
        delete next[periodo.id];
      } else {
        next[periodo.id] = { fechaInicio: periodo.fechaInicio ?? '', fechaFin: periodo.fechaFin ?? '' };
      }
      return next;
    });
  const setFechaSeleccion = (periodoId, field, value) =>
    setSeleccion((prev) => ({ ...prev, [periodoId]: { ...prev[periodoId], [field]: value } }));

  const handleAgregarPeriodoNuevo = (e) => {
    e.preventDefault();
    setPeriodoError('');
    if (!nuevoPeriodoForm.nombre || !nuevoPeriodoForm.fechaInicio || !nuevoPeriodoForm.fechaFin) return;
    if (new Date(nuevoPeriodoForm.fechaFin) <= new Date(nuevoPeriodoForm.fechaInicio)) {
      setPeriodoError('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }
    setPeriodosNuevosLocal((prev) => [...prev, { tempId: `tmp-${Date.now()}`, ...nuevoPeriodoForm }]);
    setNuevoPeriodoForm({ nombre: '', fechaInicio: '', fechaFin: '' });
    setShowNuevoPeriodo(false);
  };
  const handleQuitarPeriodoNuevo = (tempId) =>
    setPeriodosNuevosLocal((prev) => prev.filter((p) => p.tempId !== tempId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditMode && !templateId) return;
    if (necesitaPeriodo || !totalPeriodos || seleccionIncompleta) return;
    setError('');
    setIsSubmitting(true);
    try {
      const horarios = activeDays.map((d) => ({
        diaSemana: d.backend,
        horaInicio: schedule[d.key].from,
        horaFin: schedule[d.key].to,
      }));

      if (isEditMode) {
        await gruposService.update(groupId, {
          seccion,
          materia,
          color,
          anioLectivo: Number(anioLectivo),
          minutosPorLeccion: Number(minutosPorLeccion),
          horarios,
        });

        for (const periodoId of Object.keys(seleccionInicial)) {
          if (!seleccion[periodoId]) {
            await periodosService.desasociarDeGrupo(groupId, periodoId);
          }
        }
        for (const [periodoId, fechas] of seleccionados) {
          await periodosService.asociarAGrupo(groupId, {
            periodoLectivoId: Number(periodoId),
            fechaInicio: fechas.fechaInicio,
            fechaFin: fechas.fechaFin,
          });
        }
        for (const p of periodosNuevosLocal) {
          await periodosService.crearPrivadoParaGrupo(groupId, {
            nombre: p.nombre,
            anioLectivo: Number(anioLectivo),
            fechaInicio: p.fechaInicio,
            fechaFin: p.fechaFin,
          });
        }

        showToast('Grupo actualizado');
        navigate(`/grupos/${groupId}`);
      } else {
        const grupo = await gruposService.create({
          seccion,
          materia,
          color,
          anioLectivo: Number(anioLectivo),
          minutosPorLeccion: Number(minutosPorLeccion),
          esquemaOrigenId: templateId,
          horarios,
          periodos: seleccionados.map(([periodoLectivoId, fechas]) => ({
            periodoLectivoId: Number(periodoLectivoId),
            fechaInicio: fechas.fechaInicio,
            fechaFin: fechas.fechaFin,
          })),
          periodosNuevos: periodosNuevosLocal.map((p) => ({
            nombre: p.nombre,
            anioLectivo: Number(anioLectivo),
            fechaInicio: p.fechaInicio,
            fechaFin: p.fechaFin,
          })),
        });
        showToast('Grupo creado');
        navigate(`/grupos/${grupo.id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingInitial) {
    return <div className="text-[14px] font-semibold text-[#94A3B8]">Cargando grupo…</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-start gap-[18px]">
      <div className="flex-[2] min-w-[300px] rounded-2xl border border-[#EEF1F6] bg-white p-5 sm:p-6">
        <div className="mb-5 flex gap-3">
          <div className="flex-1">
            <label className="mb-2 block text-[13px] font-bold text-[#475569]">Sección</label>
            <input
              required
              value={seccion}
              onChange={(e) => setSeccion(e.target.value)}
              placeholder="Ej. 10-A"
              className="w-full rounded-[11px] border border-[#E2E8F0] px-3.5 py-3 text-[14.5px] font-semibold text-[#1E293B] outline-none focus:border-[var(--brand)]"
            />
          </div>
          <div className="flex-[1.5]">
            <label className="mb-2 block text-[13px] font-bold text-[#475569]">Materia</label>
            <input
              required
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
              placeholder="Ej. Matemática"
              className="w-full rounded-[11px] border border-[#E2E8F0] px-3.5 py-3 text-[14.5px] font-semibold text-[#1E293B] outline-none focus:border-[var(--brand)]"
            />
          </div>
          <div className="w-[110px] shrink-0">
            <label className="mb-2 block text-[13px] font-bold text-[#475569]">Año lectivo</label>
            <input
              required
              type="number"
              value={anioLectivo}
              onChange={(e) => setAnioLectivo(e.target.value)}
              className="w-full rounded-[11px] border border-[#E2E8F0] px-3.5 py-3 text-[14.5px] font-semibold text-[#1E293B] outline-none focus:border-[var(--brand)]"
            />
          </div>
        </div>

        <label className="mb-1 block text-[13px] font-bold text-[#475569]">Periodos que usa este grupo</label>
        <p className="mb-2.5 text-[12px] font-medium text-[#94A3B8]">
          Marcá los periodos que aplican a este grupo y ajustá de qué fecha a qué fecha dura cada uno acá. Si
          desmarcás uno, simplemente no se usa en este grupo (no se borra de la institución). Los periodos nuevos
          que crees acá quedan privados de este grupo — no le salen a otros profesores.
        </p>
        {periodosDisponibles === null ? (
          <div className="mb-5 text-[13px] font-semibold text-[#94A3B8]">Cargando periodos…</div>
        ) : (
          <div className="mb-5">
            {(periodosDisponibles.length > 0 || periodosNuevosLocal.length > 0) && (
              <div className="mb-2.5 flex flex-col gap-2">
                {periodosDisponibles.map((p) => {
                  const marcado = !!seleccion[p.id];
                  return (
                    <div key={p.id} className="rounded-[12px] border border-[#E2E8F0] px-3.5 py-2.5">
                      <label className="flex cursor-pointer items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={marcado}
                          onChange={() => togglePeriodo(p)}
                          className="h-4 w-4 accent-[var(--brand)]"
                        />
                        <span className="text-[13.5px] font-bold text-[#1E293B]">{p.nombre}</span>
                      </label>
                      {marcado && (
                        <div className="mt-2 flex flex-wrap items-center gap-2 pl-6">
                          <input
                            required
                            type="date"
                            value={seleccion[p.id].fechaInicio}
                            onChange={(e) => setFechaSeleccion(p.id, 'fechaInicio', e.target.value)}
                            className="rounded-lg border border-[#E2E8F0] px-2.5 py-1.5 text-[12.5px] font-semibold text-[#1E293B] outline-none"
                          />
                          <span className="text-[#94A3B8]">a</span>
                          <input
                            required
                            type="date"
                            value={seleccion[p.id].fechaFin}
                            onChange={(e) => setFechaSeleccion(p.id, 'fechaFin', e.target.value)}
                            className="rounded-lg border border-[#E2E8F0] px-2.5 py-1.5 text-[12.5px] font-semibold text-[#1E293B] outline-none"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                {periodosNuevosLocal.map((p) => (
                  <div
                    key={p.tempId}
                    className="flex items-center justify-between rounded-[12px] border border-[var(--brand)]/40 bg-[var(--brand)]/5 px-3.5 py-2.5"
                  >
                    <div>
                      <div className="text-[13.5px] font-bold text-[#1E293B]">{p.nombre}</div>
                      <div className="text-[12px] font-semibold text-[#64748B]">
                        {p.fechaInicio} a {p.fechaFin} · privado de este grupo
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuitarPeriodoNuevo(p.tempId)}
                      className="press flex h-7 w-7 items-center justify-center rounded-full text-[#94A3B8] hover:bg-[#E2E8F0] hover:text-[#DC2626]"
                    >
                      <i className="ph-bold ph-x text-[13px]" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {necesitaPeriodo && (
              <div className="mb-2.5 rounded-[10px] bg-[#FFFBEB] px-3.5 py-2.5 text-[12.5px] font-bold text-[#92400E]">
                Este grupo todavía no tiene periodos. Creá al menos uno para poder registrar notas y asistencia.
              </div>
            )}

            {!showNuevoPeriodo && (
              <button
                type="button"
                onClick={() => setShowNuevoPeriodo(true)}
                className="press rounded-[9px] border border-dashed border-[#CBD5E1] px-3 py-1.5 text-[12.5px] font-bold text-[var(--brand)]"
              >
                + Crear un periodo nuevo (ej. IV Periodo)
              </button>
            )}

            {periodoError && !showNuevoPeriodo && (
              <div className="mt-2 text-[12.5px] font-bold text-[#DC2626]">{periodoError}</div>
            )}

            {showNuevoPeriodo && (
              <div className="mt-2 rounded-[12px] border border-[#E2E8F0] p-3.5">
                <div className="mb-2.5 flex flex-wrap gap-2.5">
                  <input
                    value={nuevoPeriodoForm.nombre}
                    onChange={(e) => setNuevoPeriodoForm((prev) => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Ej. IV Periodo"
                    className="min-w-[140px] flex-1 rounded-lg border border-[#E2E8F0] px-3 py-2 text-[13px] font-semibold text-[#1E293B] outline-none"
                  />
                  <input
                    required
                    type="date"
                    value={nuevoPeriodoForm.fechaInicio}
                    onChange={(e) => setNuevoPeriodoForm((prev) => ({ ...prev, fechaInicio: e.target.value }))}
                    className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-[13px] font-semibold text-[#1E293B] outline-none"
                  />
                  <span className="self-center text-[#94A3B8]">a</span>
                  <input
                    required
                    type="date"
                    value={nuevoPeriodoForm.fechaFin}
                    onChange={(e) => setNuevoPeriodoForm((prev) => ({ ...prev, fechaFin: e.target.value }))}
                    className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-[13px] font-semibold text-[#1E293B] outline-none"
                  />
                </div>
                {periodoError && <div className="mb-2 text-[12.5px] font-bold text-[#DC2626]">{periodoError}</div>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAgregarPeriodoNuevo}
                    disabled={!nuevoPeriodoForm.nombre || !nuevoPeriodoForm.fechaInicio || !nuevoPeriodoForm.fechaFin}
                    className="press rounded-lg bg-[var(--brand)] px-3.5 py-2 text-[12.5px] font-extrabold text-white disabled:opacity-60"
                  >
                    Agregar periodo
                  </button>
                  {(periodosDisponibles.length > 0 || periodosNuevosLocal.length > 0) && (
                    <button
                      type="button"
                      onClick={() => setShowNuevoPeriodo(false)}
                      className="press rounded-lg px-3.5 py-2 text-[12.5px] font-bold text-[#64748B]"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <label className="mb-1 block text-[13px] font-bold text-[#475569]">Horario de clases</label>
        <p className="mb-2.5 text-[12px] font-medium text-[#94A3B8]">
          Activá los días y ajustá la hora exacta (a.m./p.m.) de inicio y fin.
        </p>

        <div className="mb-3.5 flex max-w-[220px] items-center gap-2.5 rounded-[12px] border border-[#E2E8F0] px-3.5 py-2.5">
          <i className="ph-bold ph-clock-countdown shrink-0 text-[16px] text-[var(--brand)]" />
          <label className="flex-1 text-[12.5px] font-bold text-[#475569]">Minutos por lección</label>
          <input
            type="number"
            min="1"
            value={minutosPorLeccion}
            onChange={(e) => setMinutosPorLeccion(e.target.value)}
            title="Para el cálculo oficial de asistencia del MEP — un bloque de 7:00 a 8:20 con lecciones de 40 min son 2 lecciones"
            className="w-14 rounded-lg border border-transparent bg-[#F8FAFC] px-2 py-1 text-center text-[13.5px] font-extrabold text-[#1E293B] outline-none focus:border-[var(--brand)]"
          />
        </div>
        <div className="mb-3 flex gap-2">
          {DAYS.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => toggleDay(d.key)}
              className={`press flex h-9 w-9 items-center justify-center rounded-[10px] text-[13px] font-extrabold ${
                schedule[d.key].enabled ? 'bg-[var(--brand)] text-white' : 'bg-[#EEF2F7] text-[#94A3B8]'
              }`}
            >
              {d.key}
            </button>
          ))}
        </div>

        <div className="mb-5 flex flex-col gap-2.5">
          {activeDays.map((d) => (
            <div
              key={d.key}
              className="flex flex-wrap items-center gap-2.5 rounded-[12px] border border-[#E2E8F0] px-3.5 py-2.5"
            >
              <span className="w-[70px] shrink-0 text-[13.5px] font-bold text-[#334155]">{d.label}</span>
              <TimeField12h value={schedule[d.key].from} onChange={(v) => setDayTime(d.key, 'from', v)} />
              <span className="text-[#94A3B8]">–</span>
              <TimeField12h value={schedule[d.key].to} onChange={(v) => setDayTime(d.key, 'to', v)} />
            </div>
          ))}
        </div>

        <label className="mb-1 block text-[13px] font-bold text-[#475569]">Color identificador del grupo</label>
        <p className="mb-2.5 text-[12px] font-medium text-[#94A3B8]">
          Este color identificará al grupo en todas las pantallas.
        </p>
        <div className="mb-5 flex flex-wrap gap-2.5">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="press flex h-9 w-9 items-center justify-center rounded-full"
              style={{ background: c }}
            >
              {color === c && <i className="ph-bold ph-check text-[16px] text-white" />}
            </button>
          ))}
        </div>

        <label className="mb-2 block text-[13px] font-bold text-[#475569]">Esquema de evaluación</label>
        {isEditMode ? (
          <div className="flex items-center gap-3 rounded-[12px] border border-[#E2E8F0] bg-[#FAFBFD] px-3.5 py-3">
            <i className="ph-bold ph-lock-simple shrink-0 text-[16px] text-[#94A3B8]" />
            <div className="text-[13px] font-semibold text-[#64748B]">
              El esquema de evaluación no se puede cambiar una vez creado el grupo (ya tiene notas asociadas).
              Ajustalo desde la pestaña "Esquema" del grupo.
            </div>
          </div>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTemplatePicker((v) => !v)}
              disabled={!template}
              className="press flex w-full items-center gap-3 rounded-[12px] border border-[#E2E8F0] px-3.5 py-3 text-left disabled:opacity-60"
            >
              <i className="ph-bold ph-sliders-horizontal shrink-0 text-[18px] text-[var(--brand)]" />
              <div className="min-w-0 flex-1">
                {template ? (
                  <>
                    <div className="text-[14px] font-extrabold text-[#1E293B]">
                      {template.name} · {template.categories.length} categorías
                    </div>
                    <div className="truncate text-[12px] font-semibold text-[var(--brand)]">
                      {template.categories.map((c) => c.name).join(', ')}
                    </div>
                  </>
                ) : (
                  <div className="text-[14px] font-semibold text-[#94A3B8]">Cargando plantillas…</div>
                )}
              </div>
              <i className={`ph-bold ${showTemplatePicker ? 'ph-caret-up' : 'ph-caret-down'} shrink-0 text-[14px] text-[#94A3B8]`} />
            </button>

            {showTemplatePicker && (
              <div className="absolute z-10 mt-1.5 w-full rounded-[12px] border border-[#EEF1F6] bg-white p-1.5 shadow-[0_20px_44px_-16px_rgba(16,24,40,0.34)]">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTemplateId(t.id);
                      setShowTemplatePicker(false);
                    }}
                    className={`press flex w-full items-center justify-between rounded-[9px] px-3 py-2.5 text-left text-[13.5px] font-bold ${
                      t.id === templateId ? 'bg-[#F5F7FA] text-[#0F172A]' : 'text-[#475569]'
                    }`}
                  >
                    {t.name}
                    {t.id === templateId && <i className="ph-bold ph-check text-[15px] text-[var(--brand)]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="min-w-[240px] flex-1">
        <div className="mb-3.5 rounded-2xl border border-[#EEF1F6] bg-white p-5">
          <div className="mb-2 text-[11.5px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
            Vista previa
          </div>
          <div className="rounded-[10px] border-l-4 bg-[#FAFBFD] p-3" style={{ borderColor: color }}>
            <div className="text-[15px] font-extrabold text-[#0F172A]">
              {seccion || materia ? `${seccion} · ${materia}` : 'Nombre del grupo'}
            </div>
            <div className="text-[12.5px] font-semibold text-[#94A3B8]">0 estudiantes</div>
          </div>
        </div>

        {!isEditMode && (
          <div className="mb-3.5 rounded-2xl border border-[#EEF1F6] bg-white p-5">
            <div className="mb-1.5 text-[13.5px] font-extrabold text-[#0F172A]">Siguiente paso</div>
            <p className="text-[13px] font-medium text-[#64748B]">
              Después de crear el grupo, podrás agregar estudiantes manualmente o importarlos desde un Excel.
            </p>
          </div>
        )}

        {activeDays.length > 0 && (
          <div className="mb-3.5 rounded-2xl border border-[#EEF1F6] bg-white p-5">
            <div className="mb-2.5 flex items-center gap-2 text-[13.5px] font-extrabold text-[#0F172A]">
              <i className="ph ph-calendar-blank text-[16px] text-[var(--brand)]" />
              Horario
            </div>
            <div className="flex flex-col gap-2">
              {activeDays.map((d) => (
                <div key={d.key} className="flex items-center justify-between text-[13px] font-semibold">
                  <span className="flex items-center gap-2 text-[#475569]">
                    <span className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-[var(--brand)] text-[10px] font-extrabold text-white">
                      {d.key}
                    </span>
                    {d.label}
                  </span>
                  <span className="text-[#94A3B8]">
                    {formatHora12(schedule[d.key].from)} – {formatHora12(schedule[d.key].to)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-3.5 rounded-2xl bg-[#FEF2F2] px-4 py-3 text-[13px] font-bold text-[#DC2626]">{error}</div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || (!isEditMode && !template) || necesitaPeriodo || !totalPeriodos || seleccionIncompleta}
          className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand)] py-3.5 text-[15px] font-extrabold text-white shadow-[0_12px_26px_-10px_rgba(99,102,241,0.6)] disabled:opacity-60"
        >
          <i className={`ph-bold ${isEditMode ? 'ph-check' : 'ph-plus'} text-[17px]`} />
          {isSubmitting ? (isEditMode ? 'Guardando…' : 'Creando…') : isEditMode ? 'Guardar cambios' : 'Crear grupo'}
        </button>
      </div>
    </form>
  );
}

export default CreateGroupForm;
