import { useNavigate } from 'react-router-dom';
import { FONT } from '../Globales/colors';

/** Gradient hero card promoting the next class's quick attendance flow. */
function NextClassCard({ time, groupLabel }) {
  const navigate = useNavigate();

  return (
    <div
      className="relative flex-[2] min-w-[280px] overflow-hidden rounded-[20px] p-6 text-white shadow-[0_16px_36px_-16px_rgba(99,102,241,0.6)] sm:p-7"
      style={{ background: 'linear-gradient(135deg, var(--brand-light) 0%, var(--brand) 55%, var(--brand-dark) 100%)' }}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-[190px] w-[190px] rounded-full bg-white/10" />

      <div className="relative">
        <div className="text-[12.5px] font-bold uppercase tracking-wide opacity-85">
          Tu próxima clase · {time}
        </div>
        <div
          className="mt-2 mb-1 text-[26px] font-extrabold leading-tight tracking-tight sm:text-[30px]"
          style={{ fontFamily: FONT.display }}
        >
          Pasar asistencia ahora
        </div>
        <div className="mb-5 text-[14.5px] font-medium opacity-90">{groupLabel}</div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/asistencia')}
            className="press flex items-center gap-2 rounded-xl bg-white px-[18px] py-3 text-[14.5px] font-extrabold text-[var(--brand-dark)]"
          >
            <i className="ph-fill ph-lightning text-[17px]" />
            Asistencia rápida
          </button>
          <button
            type="button"
            onClick={() => navigate('/asistencia')}
            className="press flex items-center gap-2 rounded-xl border border-white/25 bg-white/15 px-4 py-3 text-[14.5px] font-bold text-white"
          >
            <i className="ph ph-qr-code text-[17px]" />
            Escanear QR
          </button>
        </div>
      </div>
    </div>
  );
}

export default NextClassCard;
