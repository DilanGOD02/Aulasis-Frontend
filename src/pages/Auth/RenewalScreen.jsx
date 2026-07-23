import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { AnimatedBackground, PlanesGrid } from '../../components/Auth';

/**
 * Pantalla de bloqueo cuando la prueba gratis o el plan pago vencieron —
 * reemplaza toda la app (ni Navbar ni rutas) hasta que el profesor renueve.
 * El pago se confirma a mano (SINPE/PayPal/WhatsApp), así que esto solo
 * muestra las instrucciones; la activación real la hace el admin desde su panel.
 */
function RenewalScreen({ user }) {
  const { logout } = useAuth();
  const [planes, setPlanes] = useState(null);

  useEffect(() => {
    authService.planes().then(setPlanes).catch(() => {});
  }, []);

  const desactivadaAMano = !user.esActivo;
  const eraPrueba = !user.plan;
  const diasVencido = user.diasRestantes != null ? Math.abs(user.diasRestantes) : null;

  const mensajeWhatsapp = encodeURIComponent(
    `Hola, soy ${user.nombre ?? user.email} (${user.email}). Ya hice el pago para renovar mi cuenta en Aulasis, te comparto el comprobante:`,
  );
  const whatsappHref = planes?.pago?.whatsapp
    ? `https://wa.me/${planes.pago.whatsapp}?text=${mensajeWhatsapp}`
    : null;

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-6"
      style={{ background: 'linear-gradient(160deg, #EEF1FF 0%, #E3E8FD 45%, #D9E0FC 100%)' }}
    >
      <AnimatedBackground />

      <div className="relative w-full max-w-[480px] rounded-[20px] bg-white p-6 shadow-[0_30px_60px_-20px_rgba(16,24,40,0.35)] sm:p-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF2F2]">
          <i className="ph-fill ph-lock-key text-[26px] text-[#DC2626]" />
        </div>

        <div className="mb-1.5 text-center text-[20px] font-extrabold text-[#0F172A]">
          {desactivadaAMano ? 'Tu cuenta fue desactivada' : eraPrueba ? 'Tu prueba gratuita venció' : 'Tu plan venció'}
        </div>
        <div className="mb-6 text-center text-[13.5px] font-medium text-[#64748B]">
          {desactivadaAMano
            ? 'Tu institución desactivó tu acceso. Escribí por WhatsApp para reactivarlo.'
            : diasVencido != null
              ? `Venció hace ${diasVencido} día${diasVencido === 1 ? '' : 's'}. Renová tu plan para seguir usando Aulasis.`
              : 'Renová tu plan para seguir usando Aulasis.'}
        </div>

        <div className="mb-5 rounded-[14px] border border-[#E8ECF2] p-4">
          <div className="mb-2.5 text-[13px] font-extrabold text-[#334155]">Planes disponibles</div>
          <PlanesGrid precios={planes?.precios} />
        </div>

        <div className="mb-6 rounded-[14px] border border-[#E8ECF2] bg-[#F8FAFC] p-4">
          <div className="mb-2.5 text-[13px] font-extrabold text-[#334155]">Cómo pagar</div>
          <div className="flex flex-col gap-2 text-[13.5px] font-semibold text-[#475569]">
            <div className="flex items-start gap-2">
              <i className="ph-bold ph-device-mobile mt-0.5 text-[16px] text-[var(--brand)]" />
              <span>
                SINPE Móvil: <span className="font-extrabold text-[#0F172A]">{planes?.pago?.sinpe?.numero ?? '—'}</span>{' '}
                ({planes?.pago?.sinpe?.nombre ?? '—'})
              </span>
            </div>
            <div className="flex items-start gap-2">
              <i className="ph-bold ph-paypal-logo mt-0.5 text-[16px] text-[var(--brand)]" />
              <span>PayPal: <span className="font-extrabold text-[#0F172A]">{planes?.pago?.paypal?.usuario ?? '—'}</span></span>
            </div>
          </div>
        </div>

        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="press mb-3 flex w-full items-center justify-center gap-2 rounded-[13px] bg-[#16A34A] py-3 text-[14px] font-extrabold text-white shadow-[0_12px_26px_-10px_rgba(22,163,74,0.55)]"
          >
            <i className="ph-bold ph-whatsapp-logo text-[18px]" />
            Enviar comprobante por WhatsApp
          </a>
        )}

        <button
          type="button"
          onClick={logout}
          className="press flex w-full items-center justify-center gap-2 rounded-[13px] border border-[#E2E8F0] py-3 text-[14px] font-bold text-[#475569]"
        >
          <i className="ph-bold ph-sign-out text-[16px]" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default RenewalScreen;
