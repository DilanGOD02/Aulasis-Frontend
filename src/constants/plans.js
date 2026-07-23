export const PLAN_LABELS = {
  mensual: 'Mensual',
  trimestral: 'Trimestral',
  cuatrimestral: 'Cuatrimestral',
  semestral: 'Semestral',
  anual: 'Anual',
};

export const PLAN_FRECUENCIA = {
  mensual: 'Se paga cada mes',
  trimestral: 'Se paga cada 3 meses',
  cuatrimestral: 'Se paga cada 4 meses',
  semestral: 'Se paga cada 6 meses',
  anual: 'Se paga una vez al año',
};

export const PLAN_ORDEN = ['mensual', 'trimestral', 'cuatrimestral', 'semestral', 'anual'];

export const PLAN_MESES = {
  mensual: 1,
  trimestral: 3,
  cuatrimestral: 4,
  semestral: 6,
  anual: 12,
};

// Por ahora todos los planes dan lo mismo — solo cambia cada cuánto se paga.
export const PLAN_BENEFICIOS = [
  'Grupos y estudiantes ilimitados',
  'Promedios y asistencia calculados automáticamente (fórmula del MEP)',
  'Esquemas de evaluación y rúbricas personalizables',
  'Alertas de estudiantes en riesgo académico',
  'Historial de asistencia por fecha, editable',
  'Exportación de notas y reportes a Excel/PDF',
  'Soporte directo por WhatsApp',
];

export function formatColones(valor) {
  return `₡${valor.toLocaleString('es-CR')}`;
}

/** % que ahorra ese plan vs. pagar mensual todos los meses — null si no aplica o faltan precios. */
export function ahorroPct(plan, precios) {
  if (plan === 'mensual' || !precios?.mensual || precios[plan] == null) return null;
  const equivalenteMensual = precios[plan] / PLAN_MESES[plan];
  const pct = Math.round((1 - equivalenteMensual / precios.mensual) * 100);
  return pct > 0 ? pct : null;
}
