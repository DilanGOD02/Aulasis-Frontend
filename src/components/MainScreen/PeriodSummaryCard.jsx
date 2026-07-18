import { FONT } from '../Globales/colors';
import ProgressBar from '../Globales/ProgressBar';

/** White card summarizing period-wide stats: total students, at-risk count, grades progress. */
function PeriodSummaryCard({ totalStudents, atRisk, gradesCaptured }) {
  return (
    <div className="flex flex-1 min-w-[220px] flex-col rounded-[20px] border border-[#EEF1F6] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-6">
      <div className="text-[12.5px] font-bold uppercase tracking-wide text-[#94A3B8]">
        Resumen del periodo
      </div>

      <div className="mt-4 flex gap-6">
        <div>
          <div className="text-[28px] font-extrabold text-[#0F172A] sm:text-[30px]" style={{ fontFamily: FONT.display }}>
            {totalStudents}
          </div>
          <div className="text-[12.5px] font-semibold text-[#64748B]">estudiantes</div>
        </div>
        <div>
          <div className="text-[28px] font-extrabold text-[#DC2626] sm:text-[30px]" style={{ fontFamily: FONT.display }}>
            {atRisk}
          </div>
          <div className="text-[12.5px] font-semibold text-[#64748B]">en riesgo</div>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <ProgressBar
          label="Notas capturadas"
          value={gradesCaptured}
          valueColor="#16A34A"
          color="linear-gradient(90deg, #22C55E, #16A34A)"
        />
      </div>
    </div>
  );
}

export default PeriodSummaryCard;
