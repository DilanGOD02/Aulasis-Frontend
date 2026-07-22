import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/Globales';
import { RiskFilterTabs, RiskStudentCard } from '../../components/RiskAlert';
import { riesgoService } from '../../services/riesgoService';
import { mapRiesgoEstudiante } from '../../utils/mappers';
import { markAllSeen } from '../../utils/alertsSeen';

function RiskAlertPage() {
  const [filter, setFilter] = useState('todas');
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    riesgoService
      .listar()
      .then((data) => {
        const mapped = data.map(mapRiesgoEstudiante);
        setStudents(mapped);
        markAllSeen(mapped);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const visible = filter === 'todas' ? students : students.filter((s) => s.severity === filter);

  return (
    <>
      <PageHeader crumb="Todos los grupos" title="Estudiantes en riesgo" showBack />

      <div className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <p className="max-w-[52ch] text-[13.5px] font-medium text-[#64748B]">
            Consolidado de todos tus grupos, ordenado por urgencia. Tocá un estudiante para ver su detalle.
          </p>
          <div className="ml-auto">
            <RiskFilterTabs active={filter} onChange={setFilter} />
          </div>
        </div>

        {!isLoading && visible.length === 0 ? (
          <div className="py-16 text-center text-[14px] font-semibold text-[#94A3B8]">
            No hay estudiantes en esta categoría ahora mismo.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map((student) => (
              <RiskStudentCard key={`${student.groupId}-${student.studentId}`} student={student} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default RiskAlertPage;
