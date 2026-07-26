import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { centrosEducativosService } from '../../services/centrosEducativosService';
import { useToast } from '../../context/ToastContext';
import ImageUploader from './ImageUploader';
import { COLORS } from './colorPalette';

/**
 * Formulario de centro educativo — se usa tanto para crear (sin `centroId`)
 * como para editar (con `centroId`, precarga los datos existentes). Mismo
 * patrón que CreateGroupForm: identidad + datos de contacto + escudo + color
 * identificador.
 */
function CreateCentroEducativoForm({ centroId }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEditMode = !!centroId;

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [codigoPresupuestario, setCodigoPresupuestario] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tipo, setTipo] = useState('publica');
  const [color, setColor] = useState(COLORS[0]);
  const [escudoUrl, setEscudoUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(isEditMode);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEditMode) return;
    setIsLoadingInitial(true);
    centrosEducativosService
      .getOne(centroId)
      .then((centro) => {
        setNombre(centro.nombre ?? '');
        setCorreo(centro.correo ?? '');
        setDireccion(centro.direccion ?? '');
        setCodigoPresupuestario(centro.codigoPresupuestario ?? '');
        setTelefono(centro.telefono ?? '');
        setTipo(centro.tipo ?? 'publica');
        setColor(centro.color ?? COLORS[0]);
        setEscudoUrl(centro.escudoUrl ?? null);
      })
      .finally(() => setIsLoadingInitial(false));
  }, [isEditMode, centroId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const payload = {
        nombre,
        escudoUrl: escudoUrl || undefined,
        correo: correo || undefined,
        direccion: direccion || undefined,
        codigoPresupuestario: codigoPresupuestario || undefined,
        telefono: telefono || undefined,
        tipo: tipo || undefined,
        color,
      };

      if (isEditMode) {
        await centrosEducativosService.update(centroId, payload);
        showToast('Centro educativo actualizado');
        navigate(`/inicio/${centroId}`);
      } else {
        const centro = await centrosEducativosService.create(payload);
        showToast('Centro educativo creado');
        navigate(`/inicio/${centro.id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingInitial) {
    return <div className="text-[14px] font-semibold text-[#94A3B8]">Cargando centro…</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-start gap-[18px]">
      <div className="flex-[2] min-w-[300px] rounded-2xl border border-[#EEF1F6] bg-white p-5 sm:p-6">
        <div className="mb-5">
          <ImageUploader
            value={escudoUrl}
            onChange={setEscudoUrl}
            tipo="centro"
            entidadId={centroId}
            label="Escudo del centro"
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-[13px] font-bold text-[#475569]">Nombre</label>
          <input
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Liceo San José"
            className="w-full rounded-[11px] border border-[#E2E8F0] px-3.5 py-3 text-[14.5px] font-semibold text-[#1E293B] outline-none focus:border-[var(--brand)]"
          />
        </div>

        <div className="mb-4 flex gap-3">
          <div className="flex-1">
            <label className="mb-2 block text-[13px] font-bold text-[#475569]">Correo</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="contacto@centro.edu"
              className="w-full rounded-[11px] border border-[#E2E8F0] px-3.5 py-3 text-[14.5px] font-semibold text-[#1E293B] outline-none focus:border-[var(--brand)]"
            />
          </div>
          <div className="w-[160px] shrink-0">
            <label className="mb-2 block text-[13px] font-bold text-[#475569]">Teléfono</label>
            <input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="2222-2222"
              className="w-full rounded-[11px] border border-[#E2E8F0] px-3.5 py-3 text-[14.5px] font-semibold text-[#1E293B] outline-none focus:border-[var(--brand)]"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-[13px] font-bold text-[#475569]">Dirección</label>
          <input
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Dirección exacta"
            className="w-full rounded-[11px] border border-[#E2E8F0] px-3.5 py-3 text-[14.5px] font-semibold text-[#1E293B] outline-none focus:border-[var(--brand)]"
          />
        </div>

        <div className="mb-5 flex gap-3">
          <div className="flex-1">
            <label className="mb-2 block text-[13px] font-bold text-[#475569]">Código presupuestario</label>
            <input
              value={codigoPresupuestario}
              onChange={(e) => setCodigoPresupuestario(e.target.value)}
              className="w-full rounded-[11px] border border-[#E2E8F0] px-3.5 py-3 text-[14.5px] font-semibold text-[#1E293B] outline-none focus:border-[var(--brand)]"
            />
          </div>
          <div className="w-[160px] shrink-0">
            <label className="mb-2 block text-[13px] font-bold text-[#475569]">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full rounded-[11px] border border-[#E2E8F0] px-3.5 py-3 text-[14.5px] font-semibold text-[#1E293B] outline-none focus:border-[var(--brand)]"
            >
              <option value="publica">Pública</option>
              <option value="privada">Privada</option>
            </select>
          </div>
        </div>

        <label className="mb-1 block text-[13px] font-bold text-[#475569]">Color identificador del centro</label>
        <p className="mb-2.5 text-[12px] font-medium text-[#94A3B8]">
          Este color identificará al centro en todas las pantallas.
        </p>
        <div className="flex flex-wrap gap-2.5">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="press flex h-9 w-9 items-center justify-center rounded-full"
              style={{ background: c }}
            >
              {color === c && <i className="ph-bold ph-check text-[16px] text-white" />}
            </button>
          ))}
        </div>
      </div>

      <div className="min-w-[240px] flex-1">
        <div className="mb-3.5 rounded-2xl border border-[#EEF1F6] bg-white p-5">
          <div className="mb-2 text-[11.5px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
            Vista previa
          </div>
          <div className="flex items-center gap-3 rounded-[10px] border-l-4 bg-[#FAFBFD] p-3" style={{ borderColor: color }}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#EEF1F6] bg-white">
              {escudoUrl ? (
                <img src={escudoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <i className="ph-bold ph-bank text-[18px] text-[#94A3B8]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-extrabold text-[#0F172A]">{nombre || 'Nombre del centro'}</div>
              <div className="text-[12.5px] font-semibold text-[#94A3B8]">{tipo === 'privada' ? 'Privada' : 'Pública'}</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-3.5 rounded-2xl bg-[#FEF2F2] px-4 py-3 text-[13px] font-bold text-[#DC2626]">{error}</div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand)] py-3.5 text-[15px] font-extrabold text-white shadow-[0_12px_26px_-10px_rgba(99,102,241,0.6)] disabled:opacity-60"
        >
          <i className={`ph-bold ${isEditMode ? 'ph-check' : 'ph-plus'} text-[17px]`} />
          {isSubmitting
            ? isEditMode
              ? 'Guardando…'
              : 'Creando…'
            : isEditMode
              ? 'Guardar cambios'
              : 'Crear centro educativo'}
        </button>
      </div>
    </form>
  );
}

export default CreateCentroEducativoForm;
