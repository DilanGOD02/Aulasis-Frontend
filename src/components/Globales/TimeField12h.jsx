import { to12h, from12h } from '../../utils/time12h';

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);

/**
 * Hora explícita en 12h (hora + minuto + a.m./p.m.) — sin la ambigüedad del
 * <input type="time"> nativo, que muestra 24h o 12h según el idioma/config
 * del navegador y no se puede forzar. `value`/`onChange` siguen en "HH:MM"
 * 24h (lo que espera el backend); `minuteStep` controla la granularidad del
 * selector de minutos (5 para horarios de clase, 1 para horas exactas como
 * la de llegada de un estudiante).
 */
function TimeField12h({ value, onChange, minuteStep = 5 }) {
  const { hour, minute, meridiem } = to12h(value);
  const update = (nextHour, nextMinute, nextMeridiem) => onChange(from12h(nextHour, nextMinute, nextMeridiem));

  const minuteOptions = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) =>
    String(i * minuteStep).padStart(2, '0'),
  );
  // Si el valor actual no cae justo en un paso del step (ej. llegó por un dato viejo
  // guardado en otro formato), igual se muestra como opción para no perder el dato.
  if (!minuteOptions.includes(minute)) minuteOptions.push(minute);
  minuteOptions.sort();

  return (
    <div className="flex items-center gap-1">
      <select
        value={hour}
        onChange={(e) => update(e.target.value, minute, meridiem)}
        className="rounded-lg border border-[#E2E8F0] px-1.5 py-1.5 text-[13.5px] font-semibold text-[#1E293B] outline-none"
      >
        {HOURS_12.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span className="text-[#94A3B8]">:</span>
      <select
        value={minute}
        onChange={(e) => update(hour, e.target.value, meridiem)}
        className="rounded-lg border border-[#E2E8F0] px-1.5 py-1.5 text-[13.5px] font-semibold text-[#1E293B] outline-none"
      >
        {minuteOptions.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <select
        value={meridiem}
        onChange={(e) => update(hour, minute, e.target.value)}
        className="rounded-lg border border-[#E2E8F0] px-1.5 py-1.5 text-[13.5px] font-bold text-[#1E293B] outline-none"
      >
        <option value="a.m.">a.m.</option>
        <option value="p.m.">p.m.</option>
      </select>
    </div>
  );
}

export default TimeField12h;
