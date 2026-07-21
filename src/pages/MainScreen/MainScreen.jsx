import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/Globales';
import { RiskAlertBanner, NextClassCard, PeriodSummaryCard, GroupsSection } from '../../components/MainScreen';
import { dashboardService } from '../../services/dashboardService';
import { gruposService } from '../../services/gruposService';
import { riesgoService } from '../../services/riesgoService';
import { mapGrupoResumen } from '../../utils/mappers';

function MainScreen() {
  const [summary, setSummary] = useState(null);
  const [groups, setGroups] = useState([]);
  const [riesgo, setRiesgo] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([dashboardService.getResumen(), gruposService.list(), riesgoService.listar()])
      .then(([dash, gruposList, riesgoList]) => {
        setSummary(dash);
        setGroups(gruposList.map(mapGrupoResumen));
        setRiesgo(riesgoList);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <>
        <PageHeader title="Inicio" />
        <div className="flex-1 px-4 py-5 sm:px-6 sm:py-6" />
      </>
    );
  }

  const nombresEnRiesgo = riesgo
    .slice(0, 3)
    .map((r) => r.nombre.split(' ')[0])
    .join(', ');

  return (
    <>
      <PageHeader title="Inicio" />

      <div className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
        {riesgo.length > 0 && (
          <RiskAlertBanner count={riesgo.length} names={`${nombresEnRiesgo} necesitan atención.`} />
        )}

        <div className="mb-6 flex flex-wrap gap-4">
          {summary?.nextClass && (
            <NextClassCard time={summary.nextClass.label} groupLabel={summary.nextClass.groupName} />
          )}
          <PeriodSummaryCard
            totalStudents={summary?.totalStudents ?? 0}
            atRisk={summary?.atRisk ?? 0}
            gradesCaptured={summary?.gradesCaptured ?? 0}
          />
        </div>

        <GroupsSection groups={groups} />
      </div>
    </>
  );
}

export default MainScreen;
