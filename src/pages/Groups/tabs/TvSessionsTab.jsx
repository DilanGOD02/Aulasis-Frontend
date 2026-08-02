import { useOutletContext } from 'react-router-dom';
import { tieneFeature } from '../../../utils/centerTypeFeatures';

/**
 * EJEMPLO ilustrativo de tab exclusivo por tipo de centro (telesecundaria) —
 * placeholder para mostrar el patrón de punta a punta. Reemplazar por la
 * funcionalidad real (programar sesiones de TV Educa + guías de trabajo
 * autónomo) cuando se defina con los profesores de telesecundaria.
 *
 * El link a este tab ya viene oculto para el resto de tipos (GroupTabs.jsx),
 * pero igual se revalida acá adentro: si alguien entra por URL directa a un
 * grupo que no es de telesecundaria, no debe ver el contenido — esconder el
 * link no alcanza como control de acceso.
 */
function TvSessionsTab() {
  const { group } = useOutletContext();

  if (!tieneFeature(group.tipoCentroEducativoClave, 'tabSesionesTv')) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#CBD8E8] bg-white px-6 py-14 text-center">
        <div className="mb-1.5 text-[15px] font-extrabold text-[#0F172A]">Esta sección no aplica a este grupo</div>
        <p className="max-w-[380px] text-[13.5px] font-medium text-[#64748B]">
          "Sesiones TV" es exclusivo de centros modalidad Telesecundaria.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#EEF1F6] bg-white p-6">
      <div className="mb-1.5 flex items-center gap-2 text-[16px] font-extrabold text-[#0F172A]">
        <i className="ph-fill ph-television text-[20px] text-[var(--brand)]" />
        Sesiones TV
      </div>
      <p className="mb-4 max-w-[520px] text-[13.5px] font-medium leading-relaxed text-[#64748B]">
        Acá vas a poder programar las sesiones de TV Educa de este grupo y llevar el seguimiento de las guías de
        trabajo autónomo — ejemplo de tab exclusivo para centros modalidad Telesecundaria.
      </p>
      <div className="rounded-[12px] bg-[#F5F7FA] px-4 py-3 text-[12.5px] font-semibold text-[#94A3B8]">
        Todavía no hay funcionalidad real acá — es un ejemplo para mostrar cómo se filtra un tab por tipo de centro.
      </div>
    </div>
  );
}

export default TvSessionsTab;
