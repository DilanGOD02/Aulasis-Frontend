import { useState } from 'react';

/** "Trasladar a otro grupo": elegí el grupo destino entre los grupos del profesor (menos el actual). */
function TransferStudentModal({ student, currentGroupId, groups, onClose, onSubmit }) {
  const opciones = groups.filter((g) => g.id !== currentGroupId);
  const [grupoDestinoId, setGrupoDestinoId] = useState(opciones[0]?.id ?? '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!grupoDestinoId) return;
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit(Number(grupoDestinoId));
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-5 shadow-[0_30px_70px_-30px_rgba(16,24,40,0.4)] sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[17px] font-extrabold text-[#0F172A]">Trasladar a otro grupo</div>
          <button type="button" onClick={onClose} className="press text-[#94A3B8]" aria-label="Cerrar">
            <i className="ph-bold ph-x text-[18px]" />
          </button>
        </div>

        <p className="mb-4 text-[13.5px] font-medium text-[#64748B]">
          <strong className="text-[#1E293B]">{student.name}</strong> va a salir de este grupo — sus notas y
          asistencia de acá quedan guardadas, pero en el grupo nuevo empieza sin datos.
        </p>

        {opciones.length === 0 ? (
          <div className="rounded-[12px] bg-[#FEF2F2] px-4 py-3 text-[13px] font-bold text-[#DC2626]">
            No tenés otros grupos activos para trasladarlo.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div>
              <label className="mb-1.5 block text-[13px] font-bold text-[#475569]">Grupo destino</label>
              <select
                value={grupoDestinoId}
                onChange={(e) => setGrupoDestinoId(e.target.value)}
                className="w-full rounded-[11px] border border-[#E2E8F0] px-3.5 py-3 text-[14.5px] font-semibold text-[#1E293B] outline-none focus:border-[var(--brand)]"
              >
                {opciones.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {error && <div className="text-[13px] font-bold text-[#DC2626]">{error}</div>}

            <div className="mt-2 flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="press flex-1 rounded-[12px] bg-[#F1F4F8] py-3 text-[14.5px] font-bold text-[#475569]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="press flex-1 rounded-[12px] bg-[var(--brand)] py-3 text-[14.5px] font-extrabold text-white disabled:opacity-60"
              >
                {isSubmitting ? 'Trasladando…' : 'Trasladar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default TransferStudentModal;
