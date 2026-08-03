import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { esquemasService } from '../../services/esquemasService';
import { gruposService } from '../../services/gruposService';
import { periodosService } from '../../services/periodosService';
import { centrosEducativosService } from '../../services/centrosEducativosService';
import { mapGrupoDetail, mapTemplate } from '../../utils/mappers';
import { formatHora12 } from '../../utils/time12h';
import { useToast } from '../../context/ToastContext';
import ImageUploader from './ImageUploader';
import TimeField12h from './TimeField12h';
import LoadingOverlay from './LoadingOverlay';
import { COLORS } from './colorPalette';
import { tieneFeature, MATERIAS_ESCUELA_SUGERIDAS } from '../../utils/centerTypeFeatures';

const DAYS = [
  { key: 'L', label: 'Lunes', backend: 'lunes' },
  { key: 'K', label: 'Martes', backend: 'martes' },
  { key: 'M', label: 'Miércoles', backend: 'miercoles' },
  { key: 'J', label: 'Jueves', backend: 'jueves' },
  { key: 'V', label: 'Viernes', backend: 'viernes' },
];
const DAY_BY_BACKEND = Object.fromEntries(DAYS.map((d) => [d.backend, d.key]));

const emptySchedule = () => Object.fromEntries(DAYS.map((d) => [d.key, { enabled: false, from: '07:00', to: '08:20' }]));

/**
 * Formulario de grupo — se usa tanto para crear (sin `groupId`) como para
 * editar (con `groupId`, precarga los datos existentes). Sección, materia,
 * año lectivo, horario semanal (12h explícito), color, esquema de evaluación
 * inicial y qué periodos del curso lectivo usa este grupo (multi-select:
 * marcar/desmarcar solo decide si el periodo aplica a ESTE grupo — no borra
 * nada de la institución). Los periodos "nuevos" que se crean acá quedan
 * privados de este grupo, no le salen a otros profesores.
 */
function CreateGroupForm({ groupId, centroEducativoId }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEditMode = !!groupId;

  const [seccion, setSeccion] = useState('');
  const [materia, setMateria] = useState('');
  const [anioLectivo, setAnioLectivo] = useState(new Date().getFullYear());
  const [minutosPorLeccion, setMinutosPorLeccion] = useState(40);
  const [schedule, setSchedule] = useState(emptySchedule);
  const [color, setColor] = useState(COLORS[0]);
  const [logoUrl, setLogoUrl] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(isEditMode);
  const [error, setError] = useState('');

  const [periodosDisponibles, setPeriodosDisponibles] = useState(null); // null = cargando
  const [seleccion, setSeleccion] = useState({}); // { [periodoId]: { fechaInicio, fechaFin, totalLecciones } }
  const [seleccionInicial, setSeleccionInicial] = useState({}); // snapshot al cargar (para el diff en editar)
  const [periodosNuevosLocal, setPeriodosNuevosLocal] = useState([]); // [{tempId, nombre, fechaInicio, fechaFin, totalLecciones}]
  const [showNuevoPeriodo, setShowNuevoPeriodo] = useState(false);
  const [nuevoPeriodoForm, setNuevoPeriodoForm] = useState({ nombre: '', fechaInicio: '', fechaFin: '', totalLecciones: '' });
  const [periodoError, setPeriodoError] = useState('');

  // Grupos de escuela (I/II Ciclo): varias materias en el mismo grupo, cada
  // una con su propio esquema — ver centerTypeFeatures.js#materiasMultiples.
  const [tipoCentroClave, setTipoCentroClave] = useState(null);
  const [materiasActivas, setMateriasActivas] = useState({}); // { [nombre]: templateId | null }
  const [nuevaMateriaNombre, setNuevaMateriaNombre] = useState('');
  const esEscuela = tieneFeature(tipoCentroClave, 'materiasMultiples');

  useEffect(() => {
    if (isEditMode || !centroEducativoId) return;
    centrosEducativosService.getOne(centroEducativoId).then((centro) => {
      setTipoCentroClave(centro.tipoCentroEducativo?.clave ?? null);
    });
  }, [isEditMode, centroEducativoId]);

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
        setLogoUrl(grupo.logoUrl ?? null);

        const nextSchedule = emptySchedule();
        for (const h of grupo.horarios ?? []) {
          const key = DAY_BY_BACKEND[h.diaSemana];
          // El backend devuelve horas de columnas TIME como "HH:MM:SS" — si el
          // profesor no toca ese día en el picker, se manda tal cual al guardar
          // y el backend lo rechaza (exige "HH:MM" exacto, sin segundos).
          if (key)
            nextSchedule[key] = {
              enabled: true,
              from: (h.horaInicio ?? '').slice(0, 5),
              to: (h.horaFin ?? '').slice(0, 5),
            };
        }
        setSchedule(nextSchedule);

        setPeriodosDisponibles(disponibles);
        const inicial = Object.fromEntries(
          asociados.map((p) => [
            p.id,
            { fechaInicio: p.fechaInicio, fechaFin: p.fechaFin, totalLecciones: p.totalLecciones ?? '' },
          ]),
        );
        setSeleccion(inicial);
        setSeleccionInicial(inicial);
        if (!disponibles.length) setShowNuevoPeriodo(true);
      })
      .finally(() => setIsLoadingInitial(false));
  }, [isEditMode, groupId]);

  const activeDays = DAYS.filter((d) => schedule[d.key].enabled);
  const template = templates.find((t) => t.id === templateId);
  const materiasSeleccionadas = Object.entries(materiasActivas).filter(([, tId]) => tId !== null);
  const materiasListas = esEscuela && materiasSeleccionadas.length > 0 && materiasSeleccionadas.every(([, tId]) => tId);
  const toggleMateria = (nombre) =>
    setMateriasActivas((prev) => {
      const next = { ...prev };
      if (nombre in next) delete next[nombre];
      else next[nombre] = templates[0]?.id ?? null;
      return next;
    });
  const setMateriaTemplate = (nombre, tId) => setMateriasActivas((prev) => ({ ...prev, [nombre]: tId }));
  const agregarMateriaExtra = () => {
    const nombre = nuevaMateriaNombre.trim();
    if (!nombre || nombre in materiasActivas) return;
    setMateriasActivas((prev) => ({ ...prev, [nombre]: templates[0]?.id ?? null }));
    setNuevaMateriaNombre('');
  };
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
        next[periodo.id] = {
          fechaInicio: periodo.fechaInicio ?? '',
          fechaFin: periodo.fechaFin ?? '',
          totalLecciones: periodo.totalLecciones ?? '',
        };
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
    setNuevoPeriodoForm({ nombre: '', fechaInicio: '', fechaFin: '', totalLecciones: '' });
    setShowNuevoPeriodo(false);
  };
  const handleQuitarPeriodoNuevo = (tempId) =>
    setPeriodosNuevosLocal((prev) => prev.filter((p) => p.tempId !== tempId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditMode && !(esEscuela ? materiasListas : templateId)) return;
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
          ...(logoUrl ? { logoUrl } : {}),
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
            totalLecciones: Number(fechas.totalLecciones) || undefined,
          });
        }
        for (const p of periodosNuevosLocal) {
          await periodosService.crearPrivadoParaGrupo(groupId, {
            nombre: p.nombre,
            anioLectivo: Number(anioLectivo),
            fechaInicio: p.fechaInicio,
            fechaFin: p.fechaFin,
            totalLecciones: Number(p.totalLecciones) || undefined,
          });
        }

        showToast('Grupo actualizado');
        navigate(`/inicio/${centroEducativoId}/grupos/${groupId}`);
      } else {
        const grupo = await gruposService.create({
          centroEducativoId: Number(centroEducativoId),
          seccion,
          color,
          anioLectivo: Number(anioLectivo),
          minutosPorLeccion: Number(minutosPorLeccion),
          horarios,
          ...(esEscuela
            ? { materias: materiasSeleccionadas.map(([nombre, esquemaOrigenId]) => ({ nombre, esquemaOrigenId })) }
            : { materia, esquemaOrigenId: templateId }),
          ...(logoUrl ? { logoUrl } : {}),
          periodos: seleccionados.map(([periodoLectivoId, fechas]) => ({
            periodoLectivoId: Number(periodoLectivoId),
            fechaInicio: fechas.fechaInicio,
            fechaFin: fechas.fechaFin,
            totalLecciones: Number(fechas.totalLecciones) || undefined,
          })),
          periodosNuevos: periodosNuevosLocal.map((p) => ({
            nombre: p.nombre,
            anioLectivo: Number(anioLectivo),
            fechaInicio: p.fechaInicio,
            fechaFin: p.fechaFin,
            totalLecciones: Number(p.totalLecciones) || undefined,
          })),
        });
        showToast('Grupo creado');
        navigate(`/inicio/${centroEducativoId}/grupos/${grupo.id}`);
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
      <LoadingOverlay show={isSubmitting} message={isEditMode ? 'Guardando grupo…' : 'Creando grupo…'} />

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
          {!(esEscuela && !isEditMode) && (
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
          )}
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
          Marcá los periodos que aplican a este grupo y ajustá de qué fecha a qué fecha dura cada uno acá. Tambien puedes personalizarlo a tu gusto creando uno nuevo
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
                          <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[#64748B]">
                            Total de lecciones
                            <input
                              type="number"
                              min="1"
                              placeholder="opcional"
                              value={seleccion[p.id].totalLecciones}
                              onChange={(e) => setFechaSeleccion(p.id, 'totalLecciones', e.target.value)}
                              className="w-[84px] rounded-lg border border-[#E2E8F0] px-2.5 py-1.5 text-[12.5px] font-semibold text-[#1E293B] outline-none"
                            />
                          </label>
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
                        {p.fechaInicio} a {p.fechaFin}
                        {p.totalLecciones ? ` · ${p.totalLecciones} lecciones` : ''} · privado de este grupo
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
                  <input
                    type="number"
                    min="1"
                    placeholder="Total de lecciones (opcional)"
                    value={nuevoPeriodoForm.totalLecciones}
                    onChange={(e) => setNuevoPeriodoForm((prev) => ({ ...prev, totalLecciones: e.target.value }))}
                    className="w-[190px] rounded-lg border border-[#E2E8F0] px-3 py-2 text-[13px] font-semibold text-[#1E293B] outline-none"
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

        <div className="mb-5">
          <ImageUploader
            value={logoUrl}
            onChange={setLogoUrl}
            tipo="grupo"
            entidadId={groupId}
            label="Logo del grupo (opcional)"
            shape="circle"
          />
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

        <label className="mb-2 block text-[13px] font-bold text-[#475569]">
          {esEscuela && !isEditMode ? 'Materias y esquema de evaluación' : 'Esquema de evaluación'}
        </label>
        {isEditMode ? (
          <div className="flex items-center gap-3 rounded-[12px] border border-[#E2E8F0] bg-[#FAFBFD] px-3.5 py-3">
            <i className="ph-bold ph-lock-simple shrink-0 text-[16px] text-[#94A3B8]" />
            <div className="text-[13px] font-semibold text-[#64748B]">
              El esquema de evaluación no se puede cambiar una vez creado el grupo (ya tiene notas asociadas).
              Ajustalo desde la pestaña "Esquema" del grupo.
            </div>
          </div>
        ) : esEscuela ? (
          <div className="mb-1">
            <p className="mb-2.5 text-[12px] font-medium text-[#94A3B8]">
              Marcá las materias que vas a dar en este grupo — cada una lleva sus propias notas, con su propio
              esquema, pero comparten estudiantes y asistencia.
            </p>
            <div className="flex flex-col gap-2">
              {MATERIAS_ESCUELA_SUGERIDAS.map((nombre) => {
                const marcada = nombre in materiasActivas;
                return (
                  <div key={nombre} className="rounded-[12px] border border-[#E2E8F0] px-3.5 py-2.5">
                    <label className="flex cursor-pointer items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={marcada}
                        onChange={() => toggleMateria(nombre)}
                        className="h-4 w-4 accent-[var(--brand)]"
                      />
                      <span className="text-[13.5px] font-bold text-[#1E293B]">{nombre}</span>
                    </label>
                    {marcada && (
                      <select
                        value={materiasActivas[nombre] ?? ''}
                        onChange={(e) => setMateriaTemplate(nombre, Number(e.target.value))}
                        className="mt-2 w-full rounded-lg border border-[#E2E8F0] px-2.5 py-1.5 text-[12.5px] font-semibold text-[#1E293B] outline-none"
                      >
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              })}

              {Object.keys(materiasActivas)
                .filter((nombre) => !MATERIAS_ESCUELA_SUGERIDAS.includes(nombre))
                .map((nombre) => (
                  <div key={nombre} className="rounded-[12px] border border-[var(--brand)]/40 bg-[var(--brand)]/5 px-3.5 py-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[13.5px] font-bold text-[#1E293B]">{nombre}</span>
                      <button
                        type="button"
                        onClick={() => toggleMateria(nombre)}
                        className="press flex h-6 w-6 items-center justify-center rounded-full text-[#94A3B8] hover:bg-[#E2E8F0] hover:text-[#DC2626]"
                      >
                        <i className="ph-bold ph-x text-[12px]" />
                      </button>
                    </div>
                    <select
                      value={materiasActivas[nombre] ?? ''}
                      onChange={(e) => setMateriaTemplate(nombre, Number(e.target.value))}
                      className="mt-2 w-full rounded-lg border border-[#E2E8F0] px-2.5 py-1.5 text-[12.5px] font-semibold text-[#1E293B] outline-none"
                    >
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
            </div>

            <div className="mt-2.5 flex gap-2">
              <input
                value={nuevaMateriaNombre}
                onChange={(e) => setNuevaMateriaNombre(e.target.value)}
                placeholder="Otra materia (ej. Educación Física)"
                className="min-w-0 flex-1 rounded-lg border border-[#E2E8F0] px-3 py-2 text-[13px] font-semibold text-[#1E293B] outline-none"
              />
              <button
                type="button"
                onClick={agregarMateriaExtra}
                disabled={!nuevaMateriaNombre.trim()}
                className="press rounded-lg border border-dashed border-[#CBD5E1] px-3 py-2 text-[12.5px] font-bold text-[var(--brand)] disabled:opacity-50"
              >
                + Agregar
              </button>
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
              {esEscuela && !isEditMode
                ? seccion || 'Nombre del grupo'
                : seccion || materia
                  ? `${seccion} · ${materia}`
                  : 'Nombre del grupo'}
            </div>
            <div className="text-[12.5px] font-semibold text-[#94A3B8]">
              {esEscuela && !isEditMode && materiasSeleccionadas.length > 0
                ? `${materiasSeleccionadas.length} materia${materiasSeleccionadas.length === 1 ? '' : 's'} · 0 estudiantes`
                : '0 estudiantes'}
            </div>
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
          disabled={
            isSubmitting ||
            (!isEditMode && !(esEscuela ? materiasListas : template)) ||
            necesitaPeriodo ||
            !totalPeriodos ||
            seleccionIncompleta
          }
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
