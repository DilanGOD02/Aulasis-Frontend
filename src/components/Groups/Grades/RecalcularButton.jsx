/** Botón "Actualizar cálculos" — recalcula promedios/asistencia del grupo. Vive junto a Exportar. */
function RecalcularButton({ onClick, isLoading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      title="Actualizar cálculos"
      className="press flex items-center gap-1.5 whitespace-nowrap rounded-[11px] border border-[#E8ECF2] bg-white px-3.5 py-2 text-[13px] font-bold text-[#475569] disabled:opacity-60"
    >
      <i className={`ph-bold ph-arrows-clockwise text-[16px] ${isLoading ? 'animate-spin' : ''}`} />
      Actualizar cálculos
    </button>
  );
}

export default RecalcularButton;
