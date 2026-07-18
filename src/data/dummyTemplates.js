// Dummy evaluation-framework templates — reusable category/weight presets teachers can
// start a group's schema from. Swap for a real API call later.

let nextCategoryId = 1;
// "Asistencia" categories are always auto-calculated from real attendance, never hand-graded.
const cat = (name, weight) => ({ id: nextCategoryId++, name, weight, items: [], auto: name === 'Asistencia' });

export const DUMMY_TEMPLATES = [
  {
    id: 'mep-2026',
    name: 'Plantilla MEP 2026',
    badge: 'MEP',
    description: 'Categorías y pesos oficiales del Ministerio de Educación Pública.',
    usageCount: 3,
    categories: [
      cat('Pruebas', 45),
      cat('Tareas', 10),
      cat('Trabajo cotidiano', 20),
      cat('Proyecto', 10),
      cat('Asistencia', 5),
      cat('Concepto', 10),
    ],
  },
  {
    id: 'por-proyectos',
    name: 'Por proyectos',
    description: 'Enfocada en evaluación continua por proyectos y portafolio.',
    usageCount: 2,
    categories: [cat('Proyectos', 50), cat('Cotidiano', 25), cat('Pruebas', 15), cat('Tareas', 10)],
  },
  {
    id: 'ciencias-laboratorio',
    name: 'Ciencias con laboratorio',
    description: 'Incluye prácticas de laboratorio como categoría con peso propio.',
    usageCount: 1,
    categories: [
      cat('Pruebas', 35),
      cat('Laboratorio', 25),
      cat('Cotidiano', 20),
      cat('Tareas', 10),
      cat('Asistencia', 10),
    ],
  },
];
