import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { SchemaBuilderForm } from '../../../components/EvaluationFrameworks';
import { DUMMY_TEMPLATES } from '../../../data/dummyTemplates';

function EvaluationFrameworkTab() {
  const { group } = useOutletContext();
  const [sourceId, setSourceId] = useState('current');

  const categoriesFor = (id) =>
    id === 'current' ? group.evaluationSchema : DUMMY_TEMPLATES.find((t) => t.id === id)?.categories;

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
          {DUMMY_TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <SchemaBuilderForm key={sourceId} initialCategories={categoriesFor(sourceId)} />
    </>
  );
}

export default EvaluationFrameworkTab;
