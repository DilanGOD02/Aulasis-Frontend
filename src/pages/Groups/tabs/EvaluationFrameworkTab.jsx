import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { SchemaBuilderForm } from '../../../components/EvaluationFrameworks';
import { LoadingOverlay } from '../../../components/Globales';
import { esquemasService } from '../../../services/esquemasService';
import { toEsquemaPayload } from '../../../utils/mappers';
import { useToast } from '../../../context/ToastContext';

function EvaluationFrameworkTab() {
  const { group, reloadGroup } = useOutletContext();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (categories, _templateName, notaMinimaAprobar) => {
    setIsSaving(true);
    try {
      await esquemasService.update(
        group.esquemaEvaluacionId,
        toEsquemaPayload(categories, group.name, notaMinimaAprobar),
      );
      await reloadGroup();
      showToast('Esquema guardado', 'success');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <LoadingOverlay show={isSaving} message="Guardando esquema…" />
      <SchemaBuilderForm
        initialCategories={group.evaluationSchema}
        initialNotaMinimaAprobar={group.notaMinimaAprobar}
        tipoCentroEducativoClave={group.tipoCentroEducativoClave}
        onSave={handleSave}
      />
    </>
  );
}

export default EvaluationFrameworkTab;
