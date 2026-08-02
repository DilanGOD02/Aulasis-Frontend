// Capacidades específicas por modalidad de centro (MEP) — ver
// tipos_centro_educativo en el backend. En vez de comparar la clave del tipo
// directamente en cada pantalla (`clave === 'telesecundaria'` repetido por
// todos lados), se declara acá una vez qué feature tiene cada tipo, y las
// pantallas preguntan por la feature (`tieneFeature(clave, 'tabSesionesTv')`).
// Así, si mañana otro tipo necesita la misma feature, o un tipo necesita 5
// features nuevas, se toca solo este archivo — no cada componente.
//
// EJEMPLO ilustrativo para telesecundaria — ajustar/borrar cuando se
// definan las features reales con los profesores de esa modalidad.
const FEATURES_BY_TIPO = {
  telesecundaria: {
    tabSesionesTv: true,
    bannerModalidad: true,
  },
  // Regla del MEP, no una preferencia libre del profesor: la nota mínima
  // para aprobar depende de la etapa del grupo (Tercer Ciclo 65% /
  // Educación Diversificada 70%) — ver SchemaBuilderForm.jsx.
  colegio_academico: {
    notaMinimaPorEtapa: true,
  },
  // La misma maestra da varias materias (Español, Matemática, Estudios
  // Sociales, Ciencias...) al mismo aula/matrícula — ver GrupoMateria en el
  // backend. Habilita el selector de materia en Notas/Esquema/Estudiantes y
  // el multi-select de materias al crear el grupo (en vez de 1 sola).
  escuela: {
    materiasMultiples: true,
  },
};

/** Materias sugeridas al crear un grupo de escuela — el profesor puede activarlas/desactivarlas y agregar otra a mano. */
export const MATERIAS_ESCUELA_SUGERIDAS = ['Español', 'Matemática', 'Estudios Sociales', 'Ciencias', 'Educación Cívica'];

export function tieneFeature(tipoCentroEducativoClave, feature) {
  return !!FEATURES_BY_TIPO[tipoCentroEducativoClave]?.[feature];
}
