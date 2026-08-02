import { useOutletContext } from 'react-router-dom';
import { SchemaBuilderForm } from '../../../components/EvaluationFrameworks';
import { esquemasService } from '../../../services/esquemasService';
import { toEsquemaPayload } from '../../../utils/mappers';
import { useToast } from '../../../context/ToastContext';

function EvaluationFrameworkTab() {
  const { group, reloadGroup } = useOutletContext();
  const { showToast } = useToast();

  const handleSave = async (categories, _templateName, notaMinimaAprobar) => {
    await esquemasService.update(
      group.esquemaEvaluacionId,
      toEsquemaPayload(categories, group.name, notaMinimaAprobar),
    );
    await reloadGroup();
    showToast('Esquema guardado', 'success');
  };

  return (
    <SchemaBuilderForm
      initialCategories={group.evaluationSchema}
      initialNotaMinimaAprobar={group.notaMinimaAprobar}
      tipoCentroEducativoClave={group.tipoCentroEducativoClave}
      onSave={handleSave}
    />
  );
}

export default EvaluationFrameworkTab;
