import { useState } from 'react';

/** "Editar estudiante": nombre, apellidos, cédula, celular del encargado — es el mismo registro en todos los grupos donde esté matriculado. */
function EditStudentModal({ student, onClose, onSubmit }) {
  const [nombre, setNombre] = useState(student.name?.split(' ').slice(0, 1).join(' ') ?? '');
  const [apellidos, setApellidos] = useState(student.name?.split(' ').slice(1).join(' ') ?? '');
  const [cedula, setCedula] = useState(student.cedula ?? '');
  const [telefonoEncargado, setTelefonoEncargado] = useState(student.telefonoEncargado ?? '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit({
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        cedula: cedula.trim(),
        telefonoEncargado: telefonoEncargado.trim() || undefined,
      });
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
          <div className="text-[17px] font-extrabold text-[#0F172A]">Editar estudiante</div>
          <button type="button" onClick={onClose} className="press text-[#94A3B8]" aria-label="Cerrar">
            <i className="ph-bold ph-x text-[18px]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="mb-1.5 block text-[13px] font-bold text-[#475569]">Nombre</label>
            <input
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-[11px] border border-[#E2E8F0] px-3.5 py-3 text-[14.5px] font-semibold text-[#1E293B] outline-none focus:border-[var(--brand)]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-bold text-[#475569]">Apellidos</label>
            <input
              required
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              className="w-full rounded-[11px] border border-[#E2E8F0] px-3.5 py-3 text-[14.5px] font-semibold text-[#1E293B] outline-none focus:border-[var(--brand)]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-bold text-[#475569]">Cédula</label>
            <input
              required
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              className="w-full rounded-[11px] border border-[#E2E8F0] px-3.5 py-3 text-[14.5px] font-semibold text-[#1E293B] outline-none focus:border-[var(--brand)]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-bold text-[#475569]">
              Celular del encargado <span className="font-semibold text-[#94A3B8]">(opcional)</span>
            </label>
            <input
              type="tel"
              value={telefonoEncargado}
              onChange={(e) => setTelefonoEncargado(e.target.value)}
              placeholder="Ej. 8888-8888"
              className="w-full rounded-[11px] border border-[#E2E8F0] px-3.5 py-3 text-[14.5px] font-semibold text-[#1E293B] outline-none focus:border-[var(--brand)]"
            />
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
              {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditStudentModal;
