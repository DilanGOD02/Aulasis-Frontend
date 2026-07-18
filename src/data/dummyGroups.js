// Dummy data for the dashboard grid and the group detail screens — swap for a real API call later.
//
// Each group carries one canonical `students` roster (name, category grades,
// attendance, average). Everything else that's student-derived — the "al
// día/atención/riesgo" distribution, the risk list, the grade-status pill —
// is computed from that roster via `getGradeStatus`, instead of being
// hand-duplicated per screen.

/** Passing average is 70; below that is risk, just under is a warning band. */
export function getGradeStatus(avg) {
  if (avg < 70) return { key: 'risk', label: 'En riesgo', bg: '#FEE2E2', color: '#DC2626' };
  if (avg < 75) return { key: 'limit', label: 'Al límite', bg: '#FFEDD5', color: '#C2410C' };
  return { key: 'ok', label: 'Aprobado', bg: '#DCFCE7', color: '#15803D' };
}

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

/** Fills in plausible per-category grades around a known average (used for groups we didn't hand-author every cell for). */
function makeGrades(avg) {
  const base = Math.round(avg);
  const offsets = { c1: 4, c2: -3, p1: 2, p2: -4, t1: 3, t2: -2, proy: 1 };
  return Object.fromEntries(Object.entries(offsets).map(([key, offset]) => [key, clamp(base + offset, 40, 100)]));
}

function makeStudent(name, avg, attendance, grades, todayStatus) {
  return { name, avg, attendance, grades: grades ?? makeGrades(avg), todayStatus };
}

// Fallback cycle for today's attendance status when a group doesn't hand-author one per student.
const ATTENDANCE_CYCLE = ['presente', 'presente', 'presente', 'ausente', 'presente', 'tardia', 'presente', 'justificada'];

let nextSchemaCategoryId = 1;
let nextSchemaItemId = 1;
const schemaItem = (name, weight, gradeKey) => ({ id: nextSchemaItemId++, name, weight, gradeKey });
// `gradeKeys` (no items) or `items` (subdivided) tell the student profile which
// `student.grades` fields feed this category's score. `auto` categories (like
// Asistencia) are computed from real attendance instead of a manual grade.
const schemaCat = (name, weight, extra = {}) => ({ id: nextSchemaCategoryId++, name, weight, items: [], ...extra });

// Used by groups that haven't customized their evaluation schema yet.
const DEFAULT_EVALUATION_SCHEMA = [
  schemaCat('Trabajo cotidiano', 30, { gradeKeys: ['c1', 'c2'] }),
  schemaCat('Pruebas', 35, {
    items: [schemaItem('Prueba 1 · Álgebra', 50, 'p1'), schemaItem('Prueba 2 · Funciones', 50, 'p2')],
  }),
  schemaCat('Tareas', 10, { gradeKeys: ['t1', 't2'] }),
  schemaCat('Proyecto', 20, { gradeKeys: ['proy'] }),
  schemaCat('Asistencia', 5, { auto: true }),
];

const GROUPS_INPUT = [
  {
    id: 1,
    name: '10-A · Matemática',
    sub: '32 estudiantes',
    badge: 'Hoy 9:40 a.m.',
    badgeBg: '#EEF2FF',
    badgeColor: '#4338CA',
    color: '#6366F1',
    progress: 78,
    nextClassSchedule: 'Lun · Mié · Vie · 7:00 a.m.',
    avgGeneral: 78.9,
    students: [
      makeStudent('Génesis Vargas Soto', 92.7, 100, { c1: 95, c2: 90, p1: 92, p2: 88, t1: 90, t2: 94, proy: 96 }, 'presente'),
      makeStudent('Josué Hernández Mora', 62.7, 80, { c1: 62, c2: 58, p1: 55, p2: 60, t1: 70, t2: null, proy: 68 }, 'ausente'),
      makeStudent('María José Rodríguez', 84.8, 96, { c1: 88, c2: 85, p1: 79, p2: 82, t1: 90, t2: 88, proy: 85 }, 'presente'),
      makeStudent('Diego Alfaro Quesada', 67.3, 88, { c1: 70, c2: 66, p1: 58, p2: 64, t1: 72, t2: 68, proy: 71 }, 'tardia'),
      makeStudent('Keylor Soto Navas', 80.5, 92, { c1: 84, c2: 80, p1: 76, p2: 78, t1: 82, t2: 85, proy: 80 }, 'presente'),
      makeStudent('Allison Murillo Chacón', 72.9, 94, { c1: 75, c2: 72, p1: 70, p2: 73, t1: 74, t2: 71, proy: 72 }, 'justificada'),
      makeStudent('Valentina Quirós León', 91.2, 98, { c1: 91, c2: 93, p1: 87, p2: 89, t1: 92, t2: 90, proy: 94 }, 'presente'),
      makeStudent('Esteban Cordero Mata', 78.7, 90, { c1: 78, c2: 80, p1: 74, p2: 76, t1: 82, t2: 79, proy: 81 }, 'presente'),
    ],
  },
  {
    id: 2,
    name: '9-B · Ciencias',
    sub: '29 estudiantes',
    badge: 'Mañana 7:00 a.m.',
    badgeBg: '#ECFDF5',
    badgeColor: '#047857',
    color: '#10B981',
    progress: 64,
    nextClassSchedule: 'Mar · Jue · 8:00 a.m.',
    avgGeneral: 81.4,
    students: [
      makeStudent('Mariana Jiménez Rojas', 85.0, 98),
      makeStudent('Carlos Vindas Solís', 90.0, 100),
      makeStudent('Fiorella Araya Castro', 78.0, 92),
      makeStudent('Randall Ureña Cordero', 76.0, 88),
      makeStudent('Pamela Solano Mora', 82.0, 95),
    ],
  },
  {
    id: 3,
    name: '11-C · Español',
    sub: '27 estudiantes',
    badge: 'Hoy 1:20 p.m.',
    badgeBg: '#FFF7ED',
    badgeColor: '#C2410C',
    color: '#F59E0B',
    progress: 52,
    nextClassSchedule: 'Lun · Mié · 1:20 p.m.',
    avgGeneral: 69.5,
    students: [
      makeStudent('Kimberly Solano Vargas', 64.1, 85),
      makeStudent('Esteban Rojas Mora', 68.0, 90),
      makeStudent('Natalia Campos Vega', 88.0, 96),
      makeStudent('Warner Salazar Núñez', 79.0, 91),
      makeStudent('Grettel Muñoz Alfaro', 91.0, 99),
    ],
  },
  {
    id: 4,
    name: '8-A · Estudios Sociales',
    sub: '31 estudiantes',
    badge: 'Miér 10:10 a.m.',
    badgeBg: '#FDF2F8',
    badgeColor: '#BE185D',
    color: '#DB2777',
    progress: 88,
    nextClassSchedule: 'Miér 10:10 a.m.',
    avgGeneral: 85.2,
    students: [
      makeStudent('Sofía Campos Ureña', 88.0, 97),
      makeStudent('Luis Fernando Araya', 90.0, 100),
      makeStudent('Ana Lucía Bermúdez', 82.0, 93),
      makeStudent('Gabriel Solís Chaves', 85.0, 95),
      makeStudent('Melany Quesada Rojas', 79.0, 90),
    ],
  },
  {
    id: 5,
    name: '10-B · Inglés',
    sub: '30 estudiantes',
    badge: 'Jue 8:30 a.m.',
    badgeBg: '#ECFEFF',
    badgeColor: '#0E7490',
    color: '#0891B2',
    progress: 45,
    nextClassSchedule: 'Mar · Jue · 8:30 a.m.',
    avgGeneral: 66.8,
    students: [
      makeStudent('Fabián Castro Núñez', 58.4, 78),
      makeStudent('Mariana Vega Solís', 63.9, 82),
      makeStudent('Andrés Chinchilla Ureña', 66.5, 85),
      makeStudent('Yendry Bolaños Araya', 61.0, 80),
      makeStudent('Kevin Rojas Méndez', 82.0, 93),
      makeStudent('Silvia Méndez Solano', 90.0, 97),
    ],
  },
  {
    id: 6,
    name: '9-A · Educación Física',
    sub: '33 estudiantes',
    badge: 'Vie 2:00 p.m.',
    badgeBg: '#F5F3FF',
    badgeColor: '#6D28D9',
    color: '#7C3AED',
    progress: 70,
    nextClassSchedule: 'Vie 2:00 p.m.',
    avgGeneral: 88.1,
    students: [
      makeStudent('Emiliano Rojas Vindas', 90.0, 99),
      makeStudent('Camila Araya Jiménez', 85.0, 96),
      makeStudent('Josimar Chacón Solano', 92.0, 100),
      makeStudent('Daniela Ureña Campos', 88.0, 98),
      makeStudent('Brayan Solís Quesada', 80.0, 94),
    ],
  },
];

function initialsOf(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('');
}

function fakeCedula(i) {
  const a = 1000 + ((i * 373) % 9000);
  const b = 1000 + ((i * 619) % 9000);
  return `1-${a}-${b}`;
}

export const DUMMY_GROUPS = GROUPS_INPUT.map((group) => {
  const students = group.students.map((student, i) => ({
    ...student,
    id: i + 1,
    cedula: fakeCedula(group.id * 100 + i),
    initials: initialsOf(student.name),
    status: getGradeStatus(student.avg),
    todayStatus: student.todayStatus ?? ATTENDANCE_CYCLE[i % ATTENDANCE_CYCLE.length],
  }));

  const distribution = students.reduce(
    (acc, s) => ({ ...acc, [s.status.key]: acc[s.status.key] + 1 }),
    { ok: 0, limit: 0, risk: 0 },
  );
  const needsAttentionCount = distribution.limit + distribution.risk;

  return {
    ...group,
    students,
    distribution,
    hasRisk: needsAttentionCount > 0,
    riskText: needsAttentionCount > 0 ? `${needsAttentionCount} en riesgo` : undefined,
    evaluationSchema: group.evaluationSchema ?? DEFAULT_EVALUATION_SCHEMA,
  };
});

export const DASHBOARD_SUMMARY = {
  totalStudents: 187,
  atRisk: 9,
  gradesCaptured: 78,
  nextClass: {
    time: '9:40 a.m.',
    group: '10-A · Matemática · 32 estudiantes',
  },
};

const RISK_REASONS = ['Promedio bajo el 70%', 'Reprobando 2 categorías', '3 ausencias sin justificar'];
const LIMIT_REASONS = ['Tendencia a la baja', 'Tareas pendientes', 'Cerca del límite de aprobación'];

function neededScoreFor(student) {
  if (student.status.key === 'risk') return clamp(Math.round(70 + (70 - student.avg)), 70, 100);
  if (student.status.key === 'limit') return clamp(Math.round(student.avg + 5), 70, 100);
  return null;
}

/** Consolidated "needs attention" roster across every group, for the Risk Alert screen. */
export function getAllAtRiskStudents() {
  const list = [];

  DUMMY_GROUPS.forEach((group) => {
    group.students.forEach((student, i) => {
      if (student.status.key === 'ok') return;
      const isCritical = student.status.key === 'risk';
      const reasons = isCritical ? RISK_REASONS : LIMIT_REASONS;

      list.push({
        name: student.name,
        initials: student.initials,
        studentId: student.id,
        groupId: group.id,
        groupName: group.name,
        groupColor: group.color,
        avg: student.avg,
        severity: isCritical ? 'critico' : 'atencion',
        reason: reasons[i % reasons.length],
        neededScore: neededScoreFor(student),
      });
    });
  });

  return list.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === 'critico' ? -1 : 1;
    return a.avg - b.avg;
  });
}

/** A single evaluation-schema item's score for one student (or null if that grade isn't in yet). */
export function getItemScore(item, student) {
  if (!item.gradeKey) return null;
  const value = student.grades[item.gradeKey];
  return value == null ? null : value;
}

/** A category's representative score for one student: the average of its items/gradeKeys, or attendance if it's auto-calculated. */
export function getCategoryScore(category, student) {
  if (category.auto) return student.attendance;

  const keys = category.items.length ? category.items.map((i) => i.gradeKey) : category.gradeKeys ?? [];
  const values = keys.map((k) => student.grades[k]).filter((v) => v != null);
  return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;
}

/** Weighted average across the whole schema for one student — what "Prom." recalculates to as grades are edited. */
export function computeWeightedAverage(schema, student) {
  let sum = 0;
  schema.forEach((category) => {
    const score = getCategoryScore(category, student);
    if (score != null) sum += (score * Number(category.weight || 0)) / 100;
  });
  return sum;
}

const ATTENDANCE_LABELS = {
  presente: 'Presente',
  ausente: 'Ausente',
  tardia: 'Tardía',
  justificada: 'Justif.',
};

// Fixed pattern applied to every student's history — this is illustrative dummy
// data, not derived from real records, so it doesn't need to reconcile with
// each student's summary `attendance` percentage.
const HISTORY_PATTERN = ['ausente', 'presente', 'tardia', 'presente', 'justificada', 'presente', 'presente'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** Builds a short recent attendance history for a student's profile, ending in their current `todayStatus`. */
export function buildAttendanceHistory(student, referenceDate = new Date(2026, 5, 19)) {
  const statuses = [...HISTORY_PATTERN, student.todayStatus];

  return statuses.map((status, i) => {
    const daysAgo = (statuses.length - 1 - i) * 2;
    const date = new Date(referenceDate);
    date.setDate(date.getDate() - daysAgo);

    return {
      status,
      label: ATTENDANCE_LABELS[status],
      dateLabel: `${date.getDate()} ${MONTHS[date.getMonth()]}`,
    };
  });
}
