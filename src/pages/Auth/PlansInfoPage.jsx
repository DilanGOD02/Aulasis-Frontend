import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout, PlanesGrid } from '../../components/Auth';
import { FONT } from '../../components/Globales/colors';
import { authService } from '../../services/authService';

/**
 * Paso previo al formulario de registro: explica la prueba gratis de 7 días,
 * los planes disponibles (y cada cuánto se paga cada uno) y las formas de
 * pago — así nadie llega al formulario sin saber qué pasa cuando se acabe
 * la prueba. El formulario real vive en /registro/crear.
 */
function PlansInfoPage() {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState(null);

  useEffect(() => {
    authService.planes().then(setPlanes).catch(() => {});
  }, []);

  return (
    <AuthLayout
      title="Empezá a organizar tus grupos en minutos."
      description="Creá tu cuenta de docente, armá el esquema de evaluación de tu institución y subí tu primera lista de estudiantes."
      stats={[
        { value: '7 días', label: 'de prueba gratis' },
        { value: '0 ₡', label: 'para empezar' },
      ]}
    >
      <div className="mb-1 text-[24px] font-extrabold text-[#0F172A]" style={{ fontFamily: FONT.display }}>
        Planes y precios
      </div>
      <div className="mb-6 text-[14px] font-medium text-[#64748B]">
        Arrancás con 7 días gratis, sin pagar nada. Cuando se acaben, elegís el plan que más te acomode.
      </div>

      <div className="mb-5">
        <PlanesGrid precios={planes?.precios} />
      </div>

      <div className="mb-6 rounded-[14px] border border-[#E8ECF2] bg-[#F8FAFC] p-4">
        <div className="mb-2.5 text-[13px] font-extrabold text-[#334155]">Formas de pago</div>
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
        <div className="mt-3 text-[12.5px] font-medium text-[#94A3B8]">
          Después de que se acabe tu prueba gratis (o tu plan actual), tu cuenta queda pausada hasta que renovés — pagás
          por fuera y tu institución activa tu plan en un momento.
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('/registro/crear')}
        className="press flex w-full items-center justify-center gap-2 rounded-[13px] bg-[var(--brand)] py-3.5 text-[15.5px] font-extrabold text-white shadow-[0_12px_26px_-10px_rgba(99,102,241,0.6)]"
      >
        Crear cuenta gratis por 7 días
        <i className="ph-bold ph-arrow-right text-[17px]" />
      </button>

      <div className="mt-5 text-center text-[13.5px] font-semibold text-[#94A3B8]">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="font-bold text-[var(--brand)] no-underline">
          Iniciar sesión
        </Link>
      </div>
    </AuthLayout>
  );
}

export default PlansInfoPage;
