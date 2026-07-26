// Réplica en JS de la lógica pura de `Aulasis-Backend/src/common/schedule.util.ts`
// (leccionesParaFecha / leccionesPerdidasPorTardanza) — el backend sigue siendo la
// fuente de verdad al guardar, esto solo sirve para precargar sugerencias editables
// en el formulario de asistencia sin ir al servidor (ej. para "hoy", que no pasa por
// `porFecha`, o para recalcular en vivo mientras el profesor escribe la hora de llegada).

const DIA_TO_INDEX = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
};

const INDEX_TO_DIA = Object.fromEntries(Object.entries(DIA_TO_INDEX).map(([nombre, idx]) => [idx, nombre]));

export const MINUTOS_POR_LECCION_DEFECTO = 40;

function toMinutos(hora) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

function minutosEntre(horaInicio, horaFin) {
  return toMinutos(horaFin) - toMinutos(horaInicio);
}

/**
 * Cuántas "lecciones" representa el bloque de horario de ese día de la semana.
 * Sin horario cargado para ese día, se asume 1 lección por defecto.
 */
export function leccionesParaFecha(horarios, fecha, minutosPorLeccion = MINUTOS_POR_LECCION_DEFECTO) {
  const [year, month, day] = fecha.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const diaSemana = INDEX_TO_DIA[date.getDay()];
  if (!diaSemana) return 1;

  const bloques = (horarios ?? []).filter((h) => h.diaSemana === diaSemana);
  if (!bloques.length) return 1;

  const totalMinutos = bloques.reduce((sum, h) => sum + Math.max(0, minutosEntre(h.horaInicio, h.horaFin)), 0);
  return Math.max(1, Math.round(totalMinutos / (minutosPorLeccion || MINUTOS_POR_LECCION_DEFECTO)));
}

/**
 * Cuántas lecciones de ese día ya habían terminado por completo antes de que el
 * estudiante llegara — medido contra el primer bloque del día. Sin horario cargado, 0.
 */
export function leccionesPerdidasPorTardanza(horarios, fecha, horaLlegada, minutosPorLeccion = MINUTOS_POR_LECCION_DEFECTO) {
  if (!horaLlegada) return 0;
  const [year, month, day] = fecha.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const diaSemana = INDEX_TO_DIA[date.getDay()];
  if (!diaSemana) return 0;

  const bloques = (horarios ?? [])
    .filter((h) => h.diaSemana === diaSemana)
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  if (!bloques.length) return 0;

  const minutosPerdidos = Math.max(0, toMinutos(horaLlegada) - toMinutos(bloques[0].horaInicio));
  return Math.floor(minutosPerdidos / (minutosPorLeccion || MINUTOS_POR_LECCION_DEFECTO));
}
