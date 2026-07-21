import { useOutletContext } from 'react-router-dom';
import { GradeDistributionCard, RiskStudentsCard, GroupSideStats } from '../../../components/Groups';

function SummaryTab() {
  const { group } = useOutletContext();
  const riskStudents = group.students.filter((s) => s.status.key !== 'ok');

  return (
    <div className="flex flex-wrap items-start gap-[18px]">
      <div className="flex flex-[2] min-w-[300px] flex-col gap-[18px]">
        <GradeDistributionCard distribution={group.distribution} progress={group.progress} />
        <RiskStudentsCard students={riskStudents} />
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
