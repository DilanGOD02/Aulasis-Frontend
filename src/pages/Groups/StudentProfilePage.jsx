import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/Globales';
import {
  StudentIdentityCard,
  CategoryBreakdownCard,
  AttendanceHistoryCard,
  StudentExportMenu,
} from '../../components/Groups/StudentProfile';
import { gruposService } from '../../services/gruposService';
import { estudiantesService } from '../../services/estudiantesService';
import { notasService } from '../../services/notasService';
import { initialsOf, statusMeta } from '../../utils/statusMeta';
import { mapGrupoDetail, mergeBreakdown } from '../../utils/mappers';

function StudentProfilePage() {
  const { groupId, studentId } = useParams();
  const [group, setGroup] = useState(null);
  const [student, setStudent] = useState(null);
  const [schema, setSchema] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [periodo, setPeriodo] = useState(undefined); // undefined = periodo actual
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const reload = useCallback(() => {
    return Promise.all([
      gruposService.getOne(groupId, periodo),
      estudiantesService.getPerfil(groupId, studentId, periodo),
    ]).then(([groupData, perfil]) => {
      const mappedGroup = mapGrupoDetail(groupData);
      setGroup(mappedGroup);
      setPeriodos(perfil.periodos ?? []);
      setStudent({
        initials: initialsOf(perfil.nombre),
        name: perfil.nombre,
        cedula: perfil.cedula,
        avg: perfil.avg,
        asistenciaCounts: perfil.asistenciaCounts ?? null,
        status: statusMeta(perfil.status),
        promediosPorPeriodo: perfil.promediosPorPeriodo ?? {},
      });
      setSchema(mergeBreakdown(mappedGroup.evaluationSchema, perfil.breakdown));
      setHistorial(perfil.historial ?? []);
    });
  }, [groupId, studentId, periodo]);

  useEffect(() => {
    setIsLoading(true);
    setNotFound(false);
    reload()
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [reload]);

  // Al cambiar de estudiante, volvemos a "periodo actual" por defecto.
  useEffect(() => {
    setPeriodo(undefined);
  }, [studentId]);

  const handleEditItem = async (itemId, rawValue) => {
    const periodoLectivoId = group.periodoSeleccionadoId ?? group.periodoActualId;
    if (!periodoLectivoId) return;
    await notasService.upsert({
      grupoEstudianteId: Number(studentId),
      itemEvaluacionId: itemId,
      periodoLectivoId,
      valorObtenido: rawValue === '' ? null : Number(rawValue),
    });
    await reload();
  };

  if (isLoading) return <div className="flex-1" />;

  if (notFound || !group || !student) {
    return (
      <>
        <PageHeader title="Estudiante no encontrado" crumb="Grupos" showBack />
        <div className="flex flex-1 items-center justify-center px-6 py-16 text-center text-[15px] font-semibold text-[#94A3B8]">
          No encontramos ese estudiante. Puede que haya sido eliminado del grupo.
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader crumb={group.name} title={student.name} showBack />

      {periodos.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3 sm:px-6">
          <div className="flex flex-wrap gap-1 rounded-[11px] bg-[#EEF2F7] p-[3px]">
            {periodos.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriodo(p.id)}
                className={`press rounded-[9px] px-3 py-1.5 text-[12.5px] font-bold ${
                  group.modo === 'periodo' && (periodo ? Number(periodo) === p.id : p.id === group.periodoActualId)
                    ? 'bg-white text-[#1E293B] shadow-sm'
                    : 'text-[#64748B]'
                }`}
              >
                {p.nombre}
              </button>
            ))}
            {periodos.length > 1 && (
              <button
                type="button"
                onClick={() => setPeriodo('global')}
                className={`press rounded-[9px] px-3 py-1.5 text-[12.5px] font-bold ${
                  group.modo === 'global' ? 'bg-white text-[#1E293B] shadow-sm' : 'text-[#64748B]'
                }`}
              >
                Año completo
              </button>
            )}
          </div>
          <StudentExportMenu group={group} student={student} schema={schema} modo={group.modo} periodos={periodos} historial={historial} />
        </div>
      )}

      <div className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
        <div className="mb-[18px] flex flex-wrap items-start gap-[18px]">
          <div className="flex-[2] min-w-[300px]">
            <StudentIdentityCard student={student} group={group} />
          </div>
          <div className="min-w-[240px] flex-1">
            <CategoryBreakdownCard
              schema={schema}
              modo={group.modo}
              periodos={periodos}
              onEditItem={handleEditItem}
              totalAvg={student.avg}
            />
          </div>
        </div>

        <AttendanceHistoryCard historial={historial} />
      </div>
    </>
  );
}

export default StudentProfilePage;
