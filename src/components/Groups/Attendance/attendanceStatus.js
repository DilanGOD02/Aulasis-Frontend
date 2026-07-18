// Shared config for the 4 attendance states — drives both the stat tiles and the toggle buttons.

export const ATTENDANCE_STATUSES = [
  { key: 'presente', label: 'Presentes', icon: 'ph-check', color: '#16A34A', bg: '#F0FDF4', border: '#D6F0DD' },
  { key: 'ausente', label: 'Ausentes', icon: 'ph-x', color: '#DC2626', bg: '#FEF2F2', border: '#FCDADA' },
  { key: 'tardia', label: 'Tardías', icon: 'ph-clock', color: '#C2410C', bg: '#FFF7ED', border: '#FCE3C7' },
  { key: 'justificada', label: 'Justificadas', icon: 'ph-note', color: '#475569', bg: '#F4F6F9', border: '#E8ECF2' },
];

export function countByStatus(statusByName) {
  const counts = { presente: 0, ausente: 0, tardia: 0, justificada: 0 };
  Object.values(statusByName).forEach((status) => {
    counts[status] += 1;
  });
  return counts;
}
