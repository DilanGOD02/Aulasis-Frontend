import { PageHeader } from '../../components/Globales';
import {
  RiskAlertBanner,
  NextClassCard,
  PeriodSummaryCard,
  GroupsSection,
} from '../../components/MainScreen';
import { DUMMY_GROUPS, DASHBOARD_SUMMARY } from '../../data/dummyGroups';

function MainScreen() {
  return (
    <>
      <PageHeader title="Inicio" />

      <div className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
        <RiskAlertBanner count={3} names="Josué, Allison y Diego están por debajo de 70." />

        <div className="mb-6 flex flex-wrap gap-4">
          <NextClassCard
            time={DASHBOARD_SUMMARY.nextClass.time}
            groupLabel={DASHBOARD_SUMMARY.nextClass.group}
          />
          <PeriodSummaryCard
            totalStudents={DASHBOARD_SUMMARY.totalStudents}
            atRisk={DASHBOARD_SUMMARY.atRisk}
            gradesCaptured={DASHBOARD_SUMMARY.gradesCaptured}
          />
        </div>

        <GroupsSection groups={DUMMY_GROUPS} />
      </div>
    </>
  );
}

export default MainScreen;
