import ProgressBar from '../../Globales/ProgressBar';

const TILES = [
  { key: 'ok', label: 'Al día', color: '#15803D' },
  { key: 'limit', label: 'Atención', color: '#C2410C' },
  { key: 'risk', label: 'En riesgo', color: '#DC2626' },
];

/** "Distribución de notas" card: al día / atención / en riesgo tiles + period progress. */
function GradeDistributionCard({ distribution, progress }) {
  return (
    <div className="rounded-[18px] border border-[#EEF1F6] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-6">
      <div className="mb-4 text-[17px] font-extrabold text-[#0F172A]">Distribución de notas</div>

      <div className="grid grid-cols-3 gap-3">
        {TILES.map(({ key, label, color }) => (
          <div key={key} className="rounded-[14px] border border-[#EEF1F6] bg-[#F8FAFC] px-3 py-4">
            <div className="text-[26px] font-extrabold leading-none sm:text-[30px]" style={{ color }}>
              {distribution[key]}
            </div>
            <div className="mt-1.5 text-[13px] font-semibold text-[#64748B]">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-[18px]">
        <ProgressBar label="Avance del periodo" value={progress} />
      </div>
    </div>
  );
}

export default GradeDistributionCard;
