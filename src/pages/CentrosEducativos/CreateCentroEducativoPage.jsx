import { PageHeader, CreateCentroEducativoForm } from '../../components/Globales';

function CreateCentroEducativoPage() {
  return (
    <>
      <PageHeader crumb="Nuevo" title="Crear centro educativo" showBack />
      <div className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
        <CreateCentroEducativoForm />
      </div>
    </>
  );
}

export default CreateCentroEducativoPage;
