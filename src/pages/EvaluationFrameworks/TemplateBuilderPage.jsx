import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/Globales';
import { SchemaBuilderForm } from '../../components/EvaluationFrameworks';
import { DUMMY_TEMPLATES } from '../../data/dummyTemplates';

const EMPTY_CATEGORIES = [
  { id: 1, name: 'Trabajo cotidiano', weight: 30, items: [] },
  { id: 2, name: 'Pruebas', weight: 40, items: [] },
  { id: 3, name: 'Tareas', weight: 30, items: [] },
];

function TemplateBuilderPage() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const isNew = templateId === 'nueva';
  const existing = isNew ? null : DUMMY_TEMPLATES.find((t) => t.id === templateId);
  const [templateName, setTemplateName] = useState(existing?.name ?? '');

  if (!isNew && !existing) {
    return (
      <>
        <PageHeader title="Plantilla no encontrada" crumb="Esquemas" showBack />
        <div className="flex flex-1 items-center justify-center px-6 py-16 text-center text-[15px] font-semibold text-[#94A3B8]">
          No encontramos esa plantilla. Puede que haya sido eliminada.
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Constructor de evaluación" crumb="Esquemas" showBack />
      <div className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
        <SchemaBuilderForm
          key={templateId}
          initialCategories={existing?.categories ?? EMPTY_CATEGORIES}
          showNameField
          templateName={templateName}
          onTemplateNameChange={setTemplateName}
          onSave={() => navigate('/esquemas')}
        />
      </div>
    </>
  );
}

export default TemplateBuilderPage;
