import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout, PasswordField } from '../../components/Auth';
import { FONT } from '../../components/Globales/colors';
import { useAuth } from '../../context/AuthContext';

function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Tus notas y asistencia, sin Excel."
      description="Cálculo automático de promedios ponderados, control de asistencia y alertas de riesgo. Hecho para el aula costarricense."
      stats={[
        { value: '100%', label: 'compatible MEP' },
        { value: '<1 min', label: 'pasar lista' },
      ]}
    >
      <div className="mb-1 text-[24px] font-extrabold text-[#0F172A]" style={{ fontFamily: FONT.display }}>
        Bienvenida de nuevo
      </div>
      <div className="mb-7 text-[14px] font-medium text-[#64748B]">Ingresá para continuar con tus grupos.</div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

        <PasswordField label="Contraseña" value={password} onChange={setPassword} />

        {error && <div className="text-[13px] font-bold text-[#DC2626]">{error}</div>}

        <Link
          to="/olvide-contrasena"
          className="press -mt-1 self-end text-[13px] font-bold text-[var(--brand)] no-underline"
        >
          ¿Olvidaste tu contraseña?
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="press mt-1 flex items-center justify-center gap-2 rounded-[13px] bg-[var(--brand)] py-3.5 text-[15.5px] font-extrabold text-white shadow-[0_12px_26px_-10px_rgba(99,102,241,0.6)] disabled:opacity-60"
        >
          {isSubmitting ? 'Ingresando…' : 'Ingresar'}
          {!isSubmitting && <i className="ph-bold ph-arrow-right text-[17px]" />}
        </button>
      </form>

      <div className="mt-5 text-center text-[13.5px] font-semibold text-[#94A3B8]">
        ¿Primera vez?{' '}
        <Link to="/registro" className="font-bold text-[var(--brand)] no-underline">
          Crear cuenta de docente
        </Link>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;
