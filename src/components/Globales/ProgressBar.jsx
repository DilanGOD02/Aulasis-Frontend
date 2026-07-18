/**
 * Labeled progress bar reused by the period summary card and each group card.
 * `color` accepts any CSS color/gradient string for the filled portion.
 */
function ProgressBar({ label, value, color = 'var(--brand)', valueColor = '#1E293B' }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-[12px] font-semibold text-[#64748B]">
        <span>{label}</span>
        <span className="font-extrabold" style={{ color: valueColor }}>
          {value}%
        </span>
      </div>
      <div className="h-[7px] rounded-full bg-[#EEF2F7]">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
