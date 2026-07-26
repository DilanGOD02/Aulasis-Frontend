import { useRef, useState } from 'react';
import { uploadsService } from '../../services/uploadsService';
import { useToast } from '../../context/ToastContext';

const PLACEHOLDER_ICON = { centro: 'ph-bank', grupo: 'ph-users-three' };

/**
 * Círculo/cuadro con preview de imagen + botón de cambiar. Sube automático
 * al elegir archivo (input file oculto) y avisa el resultado vía onChange(url).
 * Reutilizado para el escudo del centro educativo y el logo del grupo.
 */
function ImageUploader({ value, onChange, tipo, entidadId, label, shape = 'circle' }) {
  const inputRef = useRef(null);
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handlePick = () => inputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setIsUploading(true);
    try {
      const { url } = await uploadsService.subirImagen(file, tipo, entidadId);
      onChange?.(url);
    } catch (err) {
      showToast(err.message ?? 'No se pudo subir la imagen', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const radius = shape === 'circle' ? 'rounded-full' : 'rounded-[14px]';

  return (
    <div>
      {label && <label className="mb-2 block text-[13px] font-bold text-[#475569]">{label}</label>}
      <button
        type="button"
        onClick={handlePick}
        disabled={isUploading}
        className={`press relative flex h-[86px] w-[86px] items-center justify-center overflow-hidden border border-[#E2E8F0] bg-[#F5F7FA] ${radius}`}
      >
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <i className={`ph-bold ${PLACEHOLDER_ICON[tipo] ?? 'ph-image'} text-[30px] text-[#94A3B8]`} />
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
          {isUploading ? (
            <i className="ph-bold ph-spinner animate-spin text-[20px] text-white" />
          ) : (
            <i className="ph-bold ph-camera text-[20px] text-white" />
          )}
        </div>

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <i className="ph-bold ph-spinner animate-spin text-[20px] text-white" />
          </div>
        )}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      {isUploading && <div className="mt-1.5 text-[12px] font-semibold text-[#94A3B8]">Subiendo…</div>}
    </div>
  );
}

export default ImageUploader;
