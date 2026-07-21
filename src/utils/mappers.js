// Adaptadores entre las respuestas del backend (nombres en español, tal cual
// las tablas) y las props que ya esperan los componentes de presentación
// existentes (name/weight/auto/status{bg,color,label}, etc.) — así no hay
// que tocar el diseño ya construido.
import { statusMeta, initialsOf } from './statusMeta';

const BADGE_BG = '#EEF2FF';
const BADGE_COLOR = '#4338CA';

function estudianteCount(n) {
  return `${n} estudiante${n === 1 ? '' : 's'}`;
}

export function mapGrupoResumen(g) {
  return {
    id: g.id,
    name: g.nombre,
    sub: estudianteCount(g.studentCount),
    badge: g.nextClassLabel ?? 'Sin horario',
    badgeBg: BADGE_BG,
    badgeColor: BADGE_COLOR,
    color: g.color ?? '#6366F1',
    progress: g.progress ?? 0,
    hasRisk: g.hasRisk,
    riskText: g.riskText,
    avgGeneral: g.avgGeneral,
    distribution: g.distribution,
    nextClassSchedule: g.nextClassSchedule,
    studentCount: g.studentCount,
  };
}

export function mapEstudiante(s) {
  return {
    id: s.id,
    estudianteId: s.estudianteId,
    name: s.nombre,
    cedula: s.cedula,
    initials: initialsOf(s.nombre),
    avg: s.avg,
    attendance: s.attendance,
    asistenciaCounts: s.asistenciaCounts ?? null,
    status: statusMeta(s.status),
    todayStatus: s.todayStatus,
    grades: s.grades ?? {},
    periodoPromedios: s.periodoPromedios ?? {},
  };
}

export function mapEsquemaCategoria(c) {
  return {
    id: c.id,
    name: c.nombre,
    weight: c.pesoPct,
    auto: !!c.esAutomatica,
    items: (c.items ?? []).map((it) => ({
      id: it.id,
      name: it.nombre,
      weight: it.pesoPct,
      valorMaximo: it.valorMaximo,
      fecha: it.fecha,
      tieneRubrica: !!it.tieneRubrica,
    })),
  };
}

export function mapGrupoDetail(g) {
  return {
    id: g.id,
    name: g.nombre,
    seccion: g.seccion,
    materia: g.materia,
    sub: estudianteCount(g.studentCount),
    color: g.color ?? '#6366F1',
    esquemaEvaluacionId: g.esquemaEvaluacionId,
    anioLectivo: g.anioLectivo,
    periodos: g.periodos ?? [],
    periodoActualId: g.periodoActualId ?? null,
    modo: g.modo ?? 'periodo',
    periodoSeleccionadoId: g.periodoSeleccionadoId ?? null,
    studentCount: g.studentCount,
    avgGeneral: g.avgGeneral,
    distribution: g.distribution,
    hasRisk: g.hasRisk,
    riskText: g.riskText,
    progress: g.modo === 'global' ? null : (g.progress ?? 0),
    nextClassSchedule: g.nextClassSchedule,
    horarios: g.horarios ?? [],
    students: (g.students ?? []).map(mapEstudiante),
    evaluationSchema: (g.evaluationSchema ?? []).map(mapEsquemaCategoria),
  };
}

/** Detalle completo de un esquema (con items) — para editar en SchemaBuilderForm. */
export function mapEsquemaDetail(e) {
  return {
    id: e.id,
    name: e.nombre,
    categories: (e.categorias ?? []).map(mapEsquemaCategoria),
  };
}

export function mapTemplate(t) {
  return {
    id: t.id,
    name: t.nombre,
    badge: t.badge,
    description: t.descripcion,
    usageCount: t.usageCount,
    categories: (t.categorias ?? []).map((c) => ({
      id: c.id,
      name: c.nombre,
      weight: c.pesoPct,
      auto: !!c.esAutomatica,
    })),
  };
}

/** Junta el árbol del esquema (nombres/pesos) con los scores ya calculados del backend. */
export function mergeBreakdown(schema, breakdown) {
  const porCategoria = new Map((breakdown ?? []).map((b) => [b.categoriaId, b]));
  return schema.map((cat) => {
    const b = porCategoria.get(cat.id);
    const porItem = new Map((b?.items ?? []).map((it) => [it.itemId, it]));
    return {
      ...cat,
      score: b?.score ?? null,
      porPeriodo: b?.porPeriodo,
      scoreFinal: b?.scoreFinal,
      items: cat.items.map((it) => {
        const dato = porItem.get(it.id);
        return { ...it, score: dato?.score ?? null, valorObtenido: dato?.valorObtenido ?? null };
      }),
    };
  });
}

export function mapRiesgoEstudiante(r) {
  return {
    name: r.nombre,
    initials: initialsOf(r.nombre),
    studentId: r.matriculaId,
    groupId: r.grupoId,
    groupName: r.grupoNombre,
    groupColor: r.grupoColor,
    avg: r.avg,
    severity: r.severity,
    reason: r.reason,
    neededScore: r.neededScore,
  };
}

/** Payload de vuelta al backend (POST/PUT /esquemas) a partir del estado de SchemaBuilderForm.
 * Los ids positivos (ya existen en la BD) se mandan para que el backend actualice ese mismo
 * registro en vez de recrearlo — así no se pierden las rúbricas atadas a un item. Los ids
 * negativos (creados en esta sesión de edición, todavía no guardados) se omiten. */
export function toEsquemaPayload(categories, nombre) {
  return {
    nombre,
    categorias: categories.map((c) => ({
      id: c.id > 0 ? c.id : undefined,
      nombre: c.name,
      pesoPct: Number(c.weight) || 0,
      esAutomatica: !!c.auto,
      items: c.auto
        ? []
        : (c.items ?? []).map((it) => ({
            id: it.id > 0 ? it.id : undefined,
            nombre: it.name,
            pesoPct: Number(it.weight) || 0,
          })),
    })),
  };
}
