import { useState } from 'react';
import { estudiantesService } from '../../../services/estudiantesService';

/**
 * "Agregar estudiante" modal: cédula, nombre, apellidos. Si la cédula ya
 * existe en la institución, los campos de nombre se autocompletan y se
 * bloquean — la acción pasa a ser "matricular" en vez de "crear".
 */
function AddStudentModal({ onClose, onSubmit }) {
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefonoEncargado, setTelefonoEncargado] = useState('');
  const [existing, setExisting] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCedulaBlur = async () => {
    if (!cedula.trim()) return;
    try {
      const result = await estudiantesService.buscarPorCedula(cedula.trim());
      if (result.found) {
        setExisting(result);
        setNombre(result.nombre ?? '');
        setApellidos(result.apellidos ?? '');
        setTelefonoEncargado(result.telefonoEncargado ?? '');
      } else {
        setExisting(null);
      }
    } catch {
      setExisting(null);
    }
  };

  const handleCedulaChange = (value) => {
    setCedula(value);
    if (existing) {
      setExisting(null);
      setNombre('');
      setApellidos('');
      setTelefonoEncargado('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit({
        cedula: cedula.trim(),
        nombre,
        apellidos,
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
          <div className="text-[17px] font-extrabold text-[#0F172A]">Agregar estudiante</div>
          <button type="button" onClick={onClose} className="press text-[#94A3B8]" aria-label="Cerrar">
            <i className="ph-bold ph-x text-[18px]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="mb-1.5 block text-[13px] font-bold text-[#475569]">Cédula</label>
            <input
              required
              value={cedula}
              onChange={(e) => handleCedulaChange(e.target.value)}
              onBlur={handleCedulaBlur}
              placeholder="Ej. 1-1234-5678"
              className="w-full rounded-[11px] border border-[#E2E8F0] px-3.5 py-3 text-[14.5px] font-semibold text-[#1E293B] outline-none focus:border-[var(--brand)]"
            />
          </div>

          {existing && (
            <div className="flex items-center gap-2 rounded-[11px] bg-[#ECFDF3] px-3.5 py-2.5 text-[13px] font-bold text-[#15803D]">
              <i className="ph-fill ph-check-circle text-[16px]" />
              Ya registrado — se matriculará en este grupo.
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-[13px] font-bold text-[#475569]">Nombre</label>
            <input
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={!!existing}
              placeholder="Ej. Génesis"
              className="w-full rounded-[11px] border border-[#E2E8F0] px-3.5 py-3 text-[14.5px] font-semibold text-[#1E293B] outline-none focus:border-[var(--brand)] disabled:bg-[#F8FAFC] disabled:text-[#94A3B8]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-bold text-[#475569]">Apellidos</label>
            <input
              required
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              disabled={!!existing}
              placeholder="Ej. Vargas Soto"
              className="w-full rounded-[11px] border border-[#E2E8F0] px-3.5 py-3 text-[14.5px] font-semibold text-[#1E293B] outline-none focus:border-[var(--brand)] disabled:bg-[#F8FAFC] disabled:text-[#94A3B8]"
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
              {isSubmitting ? 'Guardando…' : existing ? 'Matricular' : 'Agregar estudiante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStudentModal;
