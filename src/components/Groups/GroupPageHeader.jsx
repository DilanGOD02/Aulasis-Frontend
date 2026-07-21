import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gruposService } from '../../services/gruposService';

/**
 * Page header for every group-scoped screen: a gradient identity banner
 * (back button + icon + name + subtitle) colored from the group's own
 * `color`, replacing the plain white PageHeader used elsewhere in the app.
 * Also holds the grupo settings menu (editar/eliminar).
 */
function GroupPageHeader({ group }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEliminar = async () => {
    setShowMenu(false);
    if (!window.confirm(`¿Eliminar el grupo "${group.name}"? Esta acción no se puede deshacer.`)) return;
    setIsDeleting(true);
    try {
      await gruposService.remove(group.id);
      navigate('/inicio');
    } catch (err) {
      window.alert(err.message);
      setIsDeleting(false);
    }
  };

  return (
    <div className="px-4 pt-4 sm:px-6 sm:pt-5">
      <div
        className="flex items-center gap-3.5 rounded-[18px] p-4 text-white shadow-[0_14px_30px_-16px_rgba(16,24,40,0.45)] sm:p-5"
        style={{ background: `linear-gradient(120deg, ${group.color}, color-mix(in srgb, ${group.color} 65%, black))` }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white/20"
        >
          <i className="ph-bold ph-arrow-left text-[18px]" />
        </button>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-white/20">
          <i className="ph-fill ph-graduation-cap text-[22px]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-[18px] font-extrabold tracking-tight sm:text-[20px]">{group.name}</div>
          <div className="truncate text-[13px] font-medium opacity-90">{group.sub}</div>
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowMenu((v) => !v)}
            disabled={isDeleting}
            className="press flex h-10 w-10 items-center justify-center rounded-[12px] bg-white/20 disabled:opacity-60"
            aria-label="Opciones del grupo"
          >
            <i className="ph-bold ph-dots-three-vertical text-[18px]" />
          </button>
          {showMenu && (
            <div className="absolute right-0 z-10 mt-1.5 w-44 rounded-[12px] border border-[#EEF1F6] bg-white p-1.5 text-left shadow-[0_20px_44px_-16px_rgba(16,24,40,0.34)]">
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  navigate(`/grupos/${group.id}/editar`);
                }}
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
  );
}

export default GroupPageHeader;
