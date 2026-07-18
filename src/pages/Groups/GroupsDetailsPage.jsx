import { Outlet, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/Globales';
import { GroupPageHeader, GroupTabs } from '../../components/Groups';
import { DUMMY_GROUPS } from '../../data/dummyGroups';

/** Shell shared by every /grupos/:groupId screen: gradient header + tabs + the active tab's content. */
function GroupsDetailsPage() {
  const { groupId } = useParams();
  const group = DUMMY_GROUPS.find((g) => String(g.id) === groupId);

  if (!group) {
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
        <GroupTabs group={group} />
      </div>
      <div className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
        <Outlet context={{ group }} />
      </div>
    </>
  );
}

export default GroupsDetailsPage;
