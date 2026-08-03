const STATUS_STYLE = {
  presente: { icon: 'ph-check', bg: '#F0FDF4', color: '#16A34A', label: 'presente' },
  ausente: { icon: 'ph-x', bg: '#FEF2F2', color: '#DC2626', label: 'ausente' },
  tardia: { icon: 'ph-clock', bg: '#FFF7ED', color: '#C2410C', label: 'tardía' },
};

const LEGEND = [
  { status: 'presente', label: 'presente' },
  { status: 'ausente', label: 'ausente' },
  { status: 'tardia', label: 'tardía' },
];

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function dateLabelOf(fecha) {
  const [, month, day] = fecha.split('-').map(Number);
  return `${day} ${MONTHS[month - 1]}`;
}

/** "Historial de asistencia" — asistencias reales de esta matrícula, más recientes primero. */
function AttendanceHistoryCard({ historial, student }) {
  // Las justificadas se cuentan aparte (abajo) — no las sumamos también acá,
  // si no un mismo día aparecería contado dos veces (en "ausente"/"tardía" Y en "justif.").
  const counts = historial.reduce((acc, h) => {
    if (h.justificada) return acc;
    return { ...acc, [h.estado]: (acc[h.estado] ?? 0) + 1 };
  }, {});
  const justificadas = historial.filter((h) => h.justificada).length;

  const totalLecciones = student?.totalLeccionesPeriodo ?? null;
  const leccionesPerdidas = student?.leccionesPerdidasAcumuladas ?? null;
  const porcentajeAusentismo = student?.porcentajeAusentismo ?? null;

  return (
    <div className="rounded-2xl border border-[#EEF1F6] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="text-[16px] font-extrabold text-[#0F172A]">Historial de asistencia</div>
        <div className="flex flex-wrap gap-3 text-[12px] font-semibold text-[#64748B]">
          {LEGEND.map(({ status, label }) => (
            <span key={status} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: STATUS_STYLE[status].color }} />
              {counts[status] ?? 0} {label}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#475569]" />
            {justificadas} justif.
          </span>
        </div>
      </div>

      {student && (
        <div className="mb-4 rounded-[12px] bg-[#FAFBFD] px-4 py-3 text-[13px] font-bold text-[#334155]">
          {totalLecciones == null ? (
            <span className="text-[#94A3B8]">Este periodo no tiene el total de lecciones declarado.</span>
          ) : (
            <span>
              {(totalLecciones - (leccionesPerdidas ?? 0))} de {totalLecciones} lecciones asistidas ·{' '}
              <span style={{ color: (porcentajeAusentismo ?? 0) >= 50 ? '#DC2626' : '#C2410C' }}>
                {porcentajeAusentismo != null ? `${Math.round(porcentajeAusentismo)}%` : '—'} de ausentismo
              </span>{' '}
              <span className="font-semibold text-[#94A3B8]">({leccionesPerdidas ?? 0} lecciones perdidas)</span>
            </span>
          )}
        </div>
      )}

      {historial.length === 0 ? (
        <div className="py-2 text-[13.5px] font-semibold text-[#94A3B8]">Todavía no hay asistencia registrada.</div>
      ) : (
        <>
          <div className="mb-2 text-[12px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
            Asistencia por día
          </div>
          <div className="flex flex-wrap gap-2.5">
          {historial.map((entry) => {
            const { icon, bg, color, label } = STATUS_STYLE[entry.estado] ?? STATUS_STYLE.presente;
            return (
              <div
                key={entry.fecha}
                className="flex min-w-[84px] flex-1 flex-col items-center gap-1.5 rounded-[12px] border py-3"
                style={{ background: bg, borderColor: `${color}33` }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-white" style={{ background: color }}>
                  <i className={`ph-bold ${icon} text-[16px]`} />
                </div>
                <div className="text-center text-[12px] font-extrabold" style={{ color }}>
                  {label}
                  {entry.justificada && ' (justif.)'}
                  {entry.estado === 'tardia' && !entry.justificada && entry.horaLlegada && ` (${entry.horaLlegada})`}
                </div>
                <div className="text-[11px] font-semibold text-[#94A3B8]">{dateLabelOf(entry.fecha)}</div>
              </div>
            );
          })}
          </div>
        </>
      )}
    </div>
  );
}

export default AttendanceHistoryCard;
