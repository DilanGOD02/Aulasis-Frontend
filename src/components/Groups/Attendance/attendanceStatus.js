// Shared config for the 3 attendance states — drives both the stat tiles and the toggle buttons.
// "Justificada" ya no es un estado aparte: es un flag sobre ausente/tardía
// (fórmula oficial del MEP, ver grading.util.ts en el backend). Para la
// tardía injustificada se guarda la hora real de llegada (horaLlegada) — el
// backend calcula solo cuántas lecciones de ese día se perdió.

export const ATTENDANCE_STATUSES = [
  { key: 'presente', label: 'Presentes', icon: 'ph-check', color: '#16A34A', bg: '#F0FDF4', border: '#D6F0DD' },
  { key: 'ausente', label: 'Ausentes', icon: 'ph-x', color: '#DC2626', bg: '#FEF2F2', border: '#FCDADA' },
  { key: 'tardia', label: 'Tardías', icon: 'ph-clock', color: '#C2410C', bg: '#FFF7ED', border: '#FCE3C7' },
];

export const DEFAULT_ENTRY = { estado: 'presente', justificada: false, horaLlegada: null };

export function countByStatus(statusById) {
  const counts = { presente: 0, ausente: 0, tardia: 0, justificadas: 0 };
  Object.values(statusById).forEach((entry) => {
    if (entry?.estado) counts[entry.estado] += 1;
    if (entry?.justificada) counts.justificadas += 1;
  });
  return counts;
}
