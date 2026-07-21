import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout, PasswordField } from '../../components/Auth';
import { FONT } from '../../components/Globales/colors';
import { authService } from '../../services/authService';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = pedir correo, 2 = código + nueva contraseña
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(email);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (passwordsMismatch) return;
    setError('');
    setIsSubmitting(true);
    try {
      await authService.resetPassword(email, codigo, password);
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Recuperemos tu acceso."
      description="Te enviamos un código de un solo uso a tu correo para que puedas volver a entrar de forma segura."
      stats={[
        { value: '6', label: 'dígitos por código' },
        { value: '10 min', label: 'de vigencia' },
      ]}
    >
      {step === 1 ? (
        <>
          <div className="mb-1 text-[24px] font-extrabold text-[#0F172A]" style={{ fontFamily: FONT.display }}>
            Recuperar contraseña
          </div>
          <div className="mb-7 text-[14px] font-medium text-[#64748B]">
            Ingresá tu correo y te enviaremos un código para restablecer tu contraseña.
          </div>

          <form onSubmit={handleSendCode} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-bold text-[#475569]">Correo</label>
              <div className="flex items-center gap-2.5 rounded-[12px] border border-[#E2E8F0] px-3.5 py-3 focus-within:border-[var(--brand)]">
                <i className="ph ph-envelope-simple shrink-0 text-[18px] text-[#94A3B8]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="marielos.jimenez@mep.go.cr"
                  className="min-w-0 flex-1 border-none bg-transparent text-[14.5px] font-medium text-[#1E293B] outline-none"
                />
              </div>
            </div>

            {error && <div className="text-[13px] font-bold text-[#DC2626]">{error}</div>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="press mt-1 flex items-center justify-center gap-2 rounded-[13px] bg-[var(--brand)] py-3.5 text-[15.5px] font-extrabold text-white shadow-[0_12px_26px_-10px_rgba(99,102,241,0.6)] disabled:opacity-60"
            >
              {isSubmitting ? 'Enviando…' : 'Enviar código'}
              {!isSubmitting && <i className="ph-bold ph-arrow-right text-[17px]" />}
            </button>
          </form>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="press mb-4 flex items-center gap-1.5 text-[13px] font-bold text-[#94A3B8]"
          >
            <i className="ph-bold ph-arrow-left text-[14px]" />
            Cambiar correo
          </button>

          <div className="mb-1 text-[24px] font-extrabold text-[#0F172A]" style={{ fontFamily: FONT.display }}>
            Ingresá el código
          </div>
          <div className="mb-2 text-[14px] font-medium text-[#64748B]">
            Escribí el código que enviamos a <span className="font-bold text-[#1E293B]">{email || 'tu correo'}</span> y
            tu nueva contraseña.
          </div>
          <div className="mb-7 flex items-center gap-1.5 rounded-[11px] bg-[#ECFDF3] px-3.5 py-2.5 text-[13px] font-bold text-[#15803D]">
            <i className="ph-fill ph-check-circle text-[16px]" />
            Código enviado
          </div>

          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-bold text-[#475569]">Código de verificación</label>
              <input
                required
                maxLength={6}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full rounded-[12px] border border-[#E2E8F0] px-3.5 py-3 text-center text-[20px] font-extrabold tracking-[0.4em] text-[#1E293B] outline-none focus:border-[var(--brand)]"
              />
            </div>

            <PasswordField label="Nueva contraseña" value={password} onChange={setPassword} />
            <div>
              <PasswordField label="Confirmar nueva contraseña" value={confirmPassword} onChange={setConfirmPassword} />
              {passwordsMismatch && (
                <div className="mt-1.5 text-[12.5px] font-bold text-[#DC2626]">Las contraseñas no coinciden.</div>
              )}
            </div>

            {error && <div className="text-[13px] font-bold text-[#DC2626]">{error}</div>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="press mt-1 flex items-center justify-center gap-2 rounded-[13px] bg-[var(--brand)] py-3.5 text-[15.5px] font-extrabold text-white shadow-[0_12px_26px_-10px_rgba(99,102,241,0.6)] disabled:opacity-60"
            >
              {isSubmitting ? 'Cambiando…' : 'Cambiar contraseña'}
              {!isSubmitting && <i className="ph-bold ph-check text-[17px]" />}
            </button>

            <button
              type="button"
              onClick={handleSendCode}
              className="press text-center text-[13px] font-bold text-[var(--brand)]"
            >
              Reenviar código
            </button>
          </form>
        </>
      )}

      <div className="mt-5 text-center text-[13.5px] font-semibold text-[#94A3B8]">
        ¿Ya la recordaste?{' '}
        <Link to="/login" className="font-bold text-[var(--brand)] no-underline">
          Iniciar sesión
        </Link>
      </div>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
