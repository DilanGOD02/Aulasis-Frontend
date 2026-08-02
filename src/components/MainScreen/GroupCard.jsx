import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProgressBar from '../Globales/ProgressBar';
import { gruposService } from '../../services/gruposService';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';

/** One card in the "Mis grupos" grid: identity, progress, and quick shortcuts. */
function GroupCard({ group, onEliminado }) {
  const navigate = useNavigate();
  const { centroId } = useParams();
  const confirm = useConfirm();
  const { showToast } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditar = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    navigate(`/inicio/${centroId}/grupos/${group.id}/editar`);
  };

  const handleEliminar = async (e) => {
    e.stopPropagation();
    setShowMenu(false);
    const ok = await confirm({
      title: 'Eliminar grupo',
      message: `¿Eliminar el grupo "${group.name}"? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    setIsDeleting(true);
    try {
      await gruposService.remove(group.id);
      onEliminado?.(group.id);
      showToast('Grupo eliminado');
    } catch (err) {
      showToast(err.message, 'error');
      setIsDeleting(false);
    }
  };

  return (
    <div
      onClick={() => navigate(`/inicio/${centroId}/grupos/${group.id}`)}
      className="lift relative flex cursor-pointer overflow-hidden rounded-2xl border border-[#EEF1F6] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_26px_-20px_rgba(16,24,40,0.16)]"
      style={{ borderLeft: `4px solid ${group.color}` }}
    >
      <div className="flex-1 p-4 pb-[18px] sm:p-[18px]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-[16px] font-extrabold text-[#0F172A]">{group.name}</div>
            <div className="mt-0.5 text-[12.5px] font-semibold text-[#94A3B8]">{group.sub}</div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <span
              className="whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-extrabold"
              style={{ background: group.badgeBg, color: group.badgeColor }}
            >
              {group.badge}
            </span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu((v) => !v)}
                disabled={isDeleting}
                className="press flex h-7 w-7 items-center justify-center rounded-[9px] text-[#94A3B8] hover:bg-[#F1F4F8] disabled:opacity-60"
                aria-label="Opciones del grupo"
              >
                <i className="ph-bold ph-dots-three-vertical text-[15px]" />
              </button>
              {showMenu && (
                <div className="absolute right-0 z-10 mt-1.5 w-44 rounded-[12px] border border-[#EEF1F6] bg-white p-1.5 text-left shadow-[0_20px_44px_-16px_rgba(16,24,40,0.34)]">
                  <button
                    type="button"
                    onClick={handleEditar}
                    className="press flex w-full items-center gap-2 rounded-[9px] px-3 py-2.5 text-[13.5px] font-bold text-[#334155]"
                  >
                    <i className="ph ph-pencil-simple text-[15px]" />
                    Editar grupo
                  </button>
                  <button
                    type="button"
                    onClick={handleEliminar}
                    className="press flex w-full items-center gap-2 rounded-[9px] px-3 py-2.5 text-[13.5px] font-bold text-[#DC2626]"
                  >
                    <i className="ph ph-trash text-[15px]" />
                    Eliminar grupo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="my-4">
          <ProgressBar label="Avance del periodo" value={group.progress} color={group.color} />
        </div>

        <div className="flex gap-2 border-t border-[#F1F4F8] pt-3.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/inicio/${centroId}/grupos/${group.id}/estudiantes`);
            }}
            className="press flex-1 rounded-[9px] bg-[#F5F7FA] py-2 text-[13px] font-bold text-[#334155]"
          >
            Estudiantes
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/inicio/${centroId}/grupos/${group.id}/notas`);
            }}
            className="press flex-1 rounded-[9px] bg-[#F5F7FA] py-2 text-[13px] font-bold text-[#334155]"
          >
            Notas
          </button>
        </div>

        {group.hasRisk && (
          <div className="mt-3 flex items-center gap-1.5 text-[13px] font-bold text-[#DC2626]">
            <i className="ph-fill ph-warning text-[15px]" />
            {group.riskText}
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupCard;
