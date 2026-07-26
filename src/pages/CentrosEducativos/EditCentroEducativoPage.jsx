import { useParams } from 'react-router-dom';
import { PageHeader, CreateCentroEducativoForm } from '../../components/Globales';

function EditCentroEducativoPage() {
  const { centroId } = useParams();

  return (
    <>
      <PageHeader crumb="Editar" title="Editar centro educativo" showBack />
      <div className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
        <CreateCentroEducativoForm centroId={centroId} />
      </div>
    </>
  );
}

export default EditCentroEducativoPage;
