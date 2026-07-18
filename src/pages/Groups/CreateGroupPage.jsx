import { PageHeader, CreateGroupForm } from '../../components/Globales';

function CreateGroupPage() {
  return (
    <>
      <PageHeader crumb="Nuevo" title="Crear grupo" showBack />
      <div className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
        <CreateGroupForm />
      </div>
    </>
  );
}

export default CreateGroupPage;
