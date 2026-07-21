import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/Globales';
import { TemplateCard } from '../../components/EvaluationFrameworks';
import { esquemasService } from '../../services/esquemasService';
import { mapTemplate } from '../../utils/mappers';

function EvaluationFrameworksPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    esquemasService
      .list()
      .then((data) => setTemplates(data.map(mapTemplate)))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        title="Plantillas de evaluación"
        action={
          <button
            type="button"
            onClick={() => navigate('/esquemas/nueva')}
            className="press flex items-center gap-2 rounded-[11px] bg-[var(--brand)] px-4 py-2.5 text-[14px] font-bold text-white shadow-[0_12px_26px_-10px_rgba(99,102,241,0.6)]"
          >
            <i className="ph-bold ph-plus text-[16px]" />
            Crear plantilla
          </button>
        }
      />

      <div className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
        <p className="mb-4 max-w-[60ch] text-[13.5px] font-medium text-[#64748B]">
          Tus plantillas de evaluación reutilizables. Creá una nueva o editá las existentes — luego las asignás a
          cualquier grupo.
        </p>

        {!isLoading && (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onDeleted={(id) => setTemplates((prev) => prev.filter((t) => t.id !== id))}
              />
            ))}

            <div
              onClick={() => navigate('/esquemas/nueva')}
              className="press flex min-h-[150px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-[1.5px] border-dashed border-[#CBD8E8] px-4 py-6 text-center"
            >
              <div className="mb-1 flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#EEF2F7]">
                <i className="ph-bold ph-plus text-[22px] text-[#64748B]" />
              </div>
              <div className="text-[15px] font-extrabold text-[#1E293B]">Crear plantilla nueva</div>
              <div className="text-[12.5px] font-medium text-[#94A3B8]">Define categorías y pesos</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default EvaluationFrameworksPage;
