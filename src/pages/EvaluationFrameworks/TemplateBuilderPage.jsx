import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/Globales';
import { SchemaBuilderForm } from '../../components/EvaluationFrameworks';
import { esquemasService } from '../../services/esquemasService';
import { mapEsquemaDetail, toEsquemaPayload } from '../../utils/mappers';

const EMPTY_CATEGORIES = [
  { id: 1, name: 'Trabajo cotidiano', weight: 30, items: [] },
  { id: 2, name: 'Pruebas', weight: 40, items: [] },
  { id: 3, name: 'Tareas', weight: 30, items: [] },
];

function TemplateBuilderPage() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const isNew = templateId === 'nueva';
  const [existing, setExisting] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [isLoading, setIsLoading] = useState(!isNew);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew) return;
    esquemasService
      .getOne(templateId)
      .then((data) => {
        const mapped = mapEsquemaDetail(data);
        setExisting(mapped);
        setTemplateName(mapped.name);
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [templateId, isNew]);

  if (isLoading) return <div className="flex-1" />;

  if (!isNew && notFound) {
    return (
      <>
        <PageHeader title="Plantilla no encontrada" crumb="Esquemas de evaluación" showBack />
        <div className="flex flex-1 items-center justify-center px-6 py-16 text-center text-[15px] font-semibold text-[#94A3B8]">
          No encontramos esa plantilla. Puede que haya sido eliminada.
        </div>
      </>
    );
  }

  const handleSave = async (categories, nombre) => {
    setError('');
    try {
      if (isNew) {
        await esquemasService.create(toEsquemaPayload(categories, nombre));
      } else {
        await esquemasService.update(templateId, toEsquemaPayload(categories, nombre));
      }
      navigate('/esquemas');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <PageHeader title="Constructor de evaluación" crumb="Esquemas de evaluación" showBack />
      <div className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
        {error && (
          <div className="mb-4 rounded-[11px] bg-[#FEF2F2] px-3.5 py-2.5 text-[13px] font-bold text-[#DC2626]">
            {error}
          </div>
        )}
        <SchemaBuilderForm
          key={templateId}
          initialCategories={
            (isNew ? EMPTY_CATEGORIES : existing?.categories)?.map((c) => ({ ...c, items: c.items ?? [] }))
          }
          showNameField
          templateName={templateName}
          onTemplateNameChange={setTemplateName}
          onSave={handleSave}
        />
      </div>
    </>
  );
}

export default TemplateBuilderPage;
