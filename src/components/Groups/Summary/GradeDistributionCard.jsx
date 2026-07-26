import ProgressBar from '../../Globales/ProgressBar';
import { STATUS_META } from '../../../utils/statusMeta';

// Mismas etiquetas/colores que el resto de la app (ver statusMeta.js) — 'incomplete'
// no tiene tile propio acá porque ya se distingue con la barra de avance del periodo.
const TILES = [
  { key: 'ok', label: STATUS_META.ok.label, color: STATUS_META.ok.color },
  { key: 'limit', label: STATUS_META.limit.label, color: STATUS_META.limit.color },
  { key: 'risk', label: STATUS_META.risk.label, color: STATUS_META.risk.color },
  { key: 'reprobado', label: STATUS_META.reprobado.label, color: STATUS_META.reprobado.color },
];

/** "Distribución de notas" card: aprobado / va bien / en riesgo / reprobado tiles + period progress. */
function GradeDistributionCard({ distribution, progress }) {
  return (
    <div className="rounded-[18px] border border-[#EEF1F6] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-6">
      <div className="mb-4 text-[17px] font-extrabold text-[#0F172A]">Distribución de notas</div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TILES.map(({ key, label, color }) => (
          <div key={key} className="rounded-[14px] border border-[#EEF1F6] bg-[#F8FAFC] px-3 py-4">
            <div className="text-[26px] font-extrabold leading-none sm:text-[30px]" style={{ color }}>
              {distribution[key] ?? 0}
            </div>
            <div className="mt-1.5 text-[13px] font-semibold text-[#64748B]">{label}</div>
          </div>
        ))}
      </div>

      {progress != null && (
        <div className="mt-[18px]">
          <ProgressBar label="Avance del periodo" value={progress} />
        </div>
      )}
    </div>
  );
}

export default GradeDistributionCard;
