import { useOutletContext } from 'react-router-dom';
import { GradeDistributionCard, RiskStudentsCard, GroupSideStats } from '../../../components/Groups';

function SummaryTab() {
  const { group } = useOutletContext();
  // 'incomplete' (sin suficientes datos para juzgar) no es "riesgo", y
  // 'limit' ("va bien" con datos parciales) tampoco — ya va aprobando. Solo
  // cuentan los que no están aprobando: en riesgo (parcial) o reprobados (esquema completo).
  const riskStudents = group.students.filter((s) => s.status.key === 'risk' || s.status.key === 'reprobado');

  return (
    <div className="flex flex-wrap items-start gap-[18px]">
      <div className="flex flex-[2] min-w-[300px] flex-col gap-[18px]">
        <GradeDistributionCard distribution={group.distribution} progress={group.progress} />
        <RiskStudentsCard students={riskStudents} groupId={group.id} />
      </div>

      <GroupSideStats
        groupId={group.id}
        nextClassSchedule={group.nextClassSchedule}
        studentCount={group.studentCount}
        avgGeneral={group.avgGeneral}
      />
    </div>
  );
}

export default SummaryTab;
