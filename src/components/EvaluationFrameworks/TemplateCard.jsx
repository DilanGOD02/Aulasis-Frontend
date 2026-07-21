import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { esquemasService } from '../../services/esquemasService';

/** One reusable evaluation template card: its category chips, usage count, and edit/delete shortcuts. */
function TemplateCard({ template, onDeleted }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const total = template.categories.reduce((sum, c) => sum + c.weight, 0);

  const handleDelete = async () => {
    if (!window.confirm(`¿Eliminar la plantilla "${template.name}"? Esta acción no se puede deshacer.`)) return;
    setError('');
    setIsDeleting(true);
    try {
      await esquemasService.remove(template.id);
      onDeleted?.(template.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-[#EEF1F6] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-[var(--brand)]/10">
          <i className="ph-fill ph-stack text-[22px] text-[var(--brand)]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[15.5px] font-extrabold text-[#0F172A]">{template.name}</span>
            {template.badge && (
              <span className="whitespace-nowrap rounded-full bg-[#ECFDF3] px-2 py-0.5 text-[10.5px] font-extrabold text-[#15803D]">
                {template.badge}
              </span>
            )}
          </div>
          <div className="text-[12.5px] font-semibold text-[#94A3B8]">
            Usado en {template.usageCount} {template.usageCount === 1 ? 'grupo' : 'grupos'}
          </div>
        </div>
      </div>

      <p className="mb-3.5 text-[13.5px] font-medium text-[#64748B]">{template.description}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {template.categories.map((c) => (
          <span
            key={c.id}
            className="whitespace-nowrap rounded-full bg-[#F5F7FA] px-2.5 py-1 text-[12px] font-semibold text-[#475569]"
          >
            {c.name} {c.weight}%
          </span>
        ))}
      </div>

      {error && <div className="mb-2 text-[12.5px] font-bold text-[#DC2626]">{error}</div>}

      <div className="mt-auto flex items-center justify-between border-t border-[#F1F4F8] pt-3.5">
        <div className="text-[13px] font-semibold text-[#94A3B8]">
          Total: <span className="font-extrabold text-[var(--brand)]">{total}%</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            title={template.usageCount > 0 ? 'En uso por grupos existentes' : 'Eliminar plantilla'}
            className="press flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E8ECF2] bg-white text-[#DC2626] disabled:opacity-60"
          >
            <i className="ph ph-trash text-[15px]" />
          </button>
          <button
            type="button"
            onClick={() => navigate(`/esquemas/${template.id}`)}
            className="press flex items-center gap-1.5 rounded-[10px] border border-[#E8ECF2] bg-white px-3.5 py-2 text-[13px] font-bold text-[#334155]"
          >
            <i className="ph ph-pencil-simple text-[15px]" />
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}

export default TemplateCard;
