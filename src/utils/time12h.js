/** "14:20" (24h, como lo espera el backend) -> { hour: 2, minute: '20', meridiem: 'p.m.' } */
export function to12h(hhmm) {
  const [hStr, mStr] = (hhmm ?? '00:00').split(':');
  let hour = parseInt(hStr, 10) || 0;
  const meridiem = hour >= 12 ? 'p.m.' : 'a.m.';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return { hour, minute: mStr ?? '00', meridiem };
}

/** Inverso de to12h: arma de vuelta el "HH:MM" 24h que espera el backend. */
export function from12h(hour, minute, meridiem) {
  let h = parseInt(hour, 10) % 12;
  if (meridiem === 'p.m.') h += 12;
  return `${String(h).padStart(2, '0')}:${minute}`;
}

export function formatHora12(hhmm) {
  const { hour, minute, meridiem } = to12h(hhmm);
  return `${hour}:${minute} ${meridiem}`;
}
