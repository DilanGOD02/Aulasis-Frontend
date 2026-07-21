import { useCallback, useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/Globales';
import { GroupPageHeader, GroupTabs } from '../../components/Groups';
import { gruposService } from '../../services/gruposService';
import { mapGrupoDetail, mapGrupoResumen } from '../../utils/mappers';

/** Shell shared by every /grupos/:groupId screen: gradient header + tabs + the active tab's content. */
function GroupsDetailsPage() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [groupsList, setGroupsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [periodo, setPeriodo] = useState(undefined); // undefined = periodo actual (default del backend)

  const reloadGroup = useCallback(() => {
    return gruposService
      .getOne(groupId, periodo)
      .then((data) => setGroup(mapGrupoDetail(data)))
      .catch(() => setNotFound(true));
  }, [groupId, periodo]);

  // Aplica una nota ya guardada en backend al estado en memoria, sin refetch —
  // así si el usuario cambia de tab y vuelve, la celda no se revierte al valor viejo.
  const updateStudentGrade = useCallback((studentId, itemId, value, avg, status) => {
    setGroup((prev) =>
      prev
        ? {
            ...prev,
            students: prev.students.map((s) =>
              s.id === studentId
                ? { ...s, grades: { ...s.grades, [itemId]: value }, avg, status }
                : s,
            ),
          }
        : prev,
    );
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setNotFound(false);
    Promise.all([reloadGroup(), gruposService.list().then((list) => setGroupsList(list.map(mapGrupoResumen)))]).finally(
      () => setIsLoading(false),
    );
  }, [reloadGroup]);

  // Al cambiar de grupo (no de periodo), volvemos a "periodo actual" por defecto.
  useEffect(() => {
    setPeriodo(undefined);
  }, [groupId]);

  if (isLoading) {
    return <div className="flex-1" />;
  }

  if (notFound || !group) {
    return (
      <>
        <PageHeader title="Grupo no encontrado" crumb="Resumen del grupo" showBack />
        <div className="flex flex-1 items-center justify-center px-6 py-16 text-center text-[15px] font-semibold text-[#94A3B8]">
          No encontramos ese grupo. Puede que haya sido eliminado.
        </div>
      </>
    );
  }

  return (
    <>
      <GroupPageHeader group={group} />
      <div className="mt-4">
        <GroupTabs group={group} groups={groupsList} selectedPeriodo={periodo} onSelectPeriodo={setPeriodo} />
      </div>
      <div className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
        <Outlet context={{ group, reloadGroup, updateStudentGrade }} />
      </div>
    </>
  );
}

export default GroupsDetailsPage;
