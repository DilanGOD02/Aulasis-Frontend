import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { SchemaBuilderForm } from '../../../components/EvaluationFrameworks';
import { esquemasService } from '../../../services/esquemasService';
import { mapEsquemaDetail, toEsquemaPayload } from '../../../utils/mappers';
import { useToast } from '../../../context/ToastContext';

function EvaluationFrameworkTab() {
  const { group, reloadGroup } = useOutletContext();
  const { showToast } = useToast();
  const [sourceId, setSourceId] = useState('current');
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    // Necesitamos los items de cada plantilla (no solo el resumen) para poder
    // editarlas en SchemaBuilderForm, así que se trae el detalle completo.
    esquemasService.list().then((list) =>
      Promise.all(list.map((t) => esquemasService.getOne(t.id).then(mapEsquemaDetail))).then(setTemplates),
    );
  }, []);

  const categoriesFor = (id) =>
    id === 'current' ? group.evaluationSchema : templates.find((t) => String(t.id) === id)?.categories;

  const handleSave = async (categories) => {
    await esquemasService.update(group.esquemaEvaluacionId, toEsquemaPayload(categories, group.name));
    await reloadGroup();
    showToast('Esquema guardado', 'success');
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-[14px] border border-[#EEF1F6] bg-white p-3.5">
        <label className="text-[13px] font-bold text-[#475569]">Empezar desde una plantilla</label>
        <select
          value={sourceId}
          onChange={(e) => setSourceId(e.target.value)}
          className="ml-auto rounded-[10px] border border-[#E2E8F0] bg-white px-3 py-2 text-[13.5px] font-semibold text-[#1E293B] outline-none focus:border-[var(--brand)]"
        >
          <option value="current">Esquema actual del grupo</option>
          {templates.map((t) => (
            <option key={t.id} value={String(t.id)}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <SchemaBuilderForm key={sourceId} initialCategories={categoriesFor(sourceId)} onSave={handleSave} />
    </>
  );
}

export default EvaluationFrameworkTab;
