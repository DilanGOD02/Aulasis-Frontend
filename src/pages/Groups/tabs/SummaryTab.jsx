import { useOutletContext } from 'react-router-dom';
import { GradeDistributionCard, RiskStudentsCard, GroupSideStats } from '../../../components/Groups';

function SummaryTab() {
  const { group } = useOutletContext();
  // 'incomplete' (sin suficientes datos para juzgar) no es "riesgo" — solo al_limite/en_riesgo cuentan.
  const riskStudents = group.students.filter((s) => s.status.key === 'limit' || s.status.key === 'risk');

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
