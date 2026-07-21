import { useParams } from 'react-router-dom';
import { PageHeader, CreateGroupForm } from '../../components/Globales';

function EditGroupPage() {
  const { groupId } = useParams();

  return (
    <>
      <PageHeader crumb="Editar" title="Editar grupo" showBack />
      <div className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
        <CreateGroupForm groupId={groupId} />
      </div>
    </>
  );
}

export default EditGroupPage;
