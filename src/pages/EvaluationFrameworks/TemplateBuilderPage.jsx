import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/Globales';
import { SchemaBuilderForm } from '../../components/EvaluationFrameworks';
import { esquemasService } from '../../services/esquemasService';
import { mapEsquemaDetail, toEsquemaPayload } from '../../utils/mappers';
import { useToast } from '../../context/ToastContext';

const EMPTY_CATEGORIES = [
  { id: 1, name: 'Trabajo cotidiano', weight: 30, items: [] },
  { id: 2, name: 'Pruebas', weight: 40, items: [] },
  { id: 3, name: 'Tareas', weight: 30, items: [] },
];

function TemplateBuilderPage() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
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
      showToast(isNew ? 'Plantilla creada' : 'Plantilla actualizada');
      navigate('/esquemas');
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isNew && existing?.esOficial) {
    return (
      <>
        <PageHeader title={existing.name} crumb="Esquemas de evaluación · Plantilla oficial" showBack />
        <div className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
          <div className="mb-4 flex items-center gap-2 rounded-[12px] bg-[#EEF2FF] px-4 py-3 text-[13px] font-bold text-[var(--brand-dark)]">
            <i className="ph-fill ph-lock-simple text-[16px]" />
            Plantilla oficial de referencia — solo se puede ver, no editar ni borrar.
          </div>
          <div className="flex flex-col gap-2.5">
            {existing.categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-[14px] border border-[#EEF1F6] bg-white p-3.5"
              >
                <div>
                  <div className="text-[14.5px] font-bold text-[#1E293B]">{c.name}</div>
                  {c.auto ? (
                    <div className="text-[12px] font-semibold text-[#94A3B8]">Calculada automáticamente</div>
                  ) : (
                    <div className="text-[12px] font-semibold text-[#94A3B8]">
                      {c.items?.length ? `${c.items.length} items` : 'Una sola evaluación'}
                    </div>
                  )}
                </div>
                <div className="text-[16px] font-extrabold text-[var(--brand)]">{c.weight}%</div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

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
