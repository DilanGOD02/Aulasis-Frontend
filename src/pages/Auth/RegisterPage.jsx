import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout, PasswordField } from '../../components/Auth';
import { FONT } from '../../components/Globales/colors';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';

const ETIQUETAS_SUGERIDAS = ['Prof.', 'Profa.', 'Lic.', 'Licda.', 'Bach.', 'MSc.', 'Ing.', 'Dr.', 'Dra.'];

function RegisterPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [etiqueta, setEtiqueta] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordsMismatch) return;
    setError('');
    setIsSubmitting(true);
    try {
      await authService.register(nombre, email, password, telefono, etiqueta);
      showToast('Cuenta creada — tenés 7 días de prueba gratis. Iniciá sesión para empezar.', 'success');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Empezá a organizar tus grupos en minutos."
      description="Creá tu cuenta de docente, armá el esquema de evaluación de tu institución y subí tu primera lista de estudiantes."
      stats={[
        { value: '6', label: 'grupos en promedio' },
        { value: '0 ₡', label: 'para empezar' },
      ]}
    >
      <div className="mb-1 text-[24px] font-extrabold text-[#0F172A]" style={{ fontFamily: FONT.display }}>
        Crear cuenta de docente
      </div>
      <div className="mb-7 text-[14px] font-medium text-[#64748B]">Solo toma un minuto.</div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-3">
          <div className="w-[110px] shrink-0">
            <label className="mb-1.5 block text-[13px] font-bold text-[#475569]">Título</label>
            <div className="flex items-center rounded-[12px] border border-[#E2E8F0] px-3 py-3 focus-within:border-[var(--brand)]">
              <input
                list="etiquetas-sugeridas"
                value={etiqueta}
                onChange={(e) => setEtiqueta(e.target.value)}
                placeholder="Lic."
                maxLength={30}
                className="min-w-0 flex-1 border-none bg-transparent text-[14.5px] font-medium text-[#1E293B] outline-none"
              />
              <datalist id="etiquetas-sugeridas">
                {ETIQUETAS_SUGERIDAS.map((op) => (
                  <option key={op} value={op} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <label className="mb-1.5 block text-[13px] font-bold text-[#475569]">Nombre completo</label>
            <div className="flex items-center gap-2.5 rounded-[12px] border border-[#E2E8F0] px-3.5 py-3 focus-within:border-[var(--brand)]">
              <i className="ph ph-user shrink-0 text-[18px] text-[#94A3B8]" />
              <input
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Marielos Jiménez"
                className="min-w-0 flex-1 border-none bg-transparent text-[14.5px] font-medium text-[#1E293B] outline-none"
              />
            </div>
          </div>
        </div>

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

        <div>
          <label className="mb-1.5 block text-[13px] font-bold text-[#475569]">Número de teléfono</label>
          <div className="flex items-center gap-2.5 rounded-[12px] border border-[#E2E8F0] px-3.5 py-3 focus-within:border-[var(--brand)]">
            <i className="ph ph-phone shrink-0 text-[18px] text-[#94A3B8]" />
            <input
              type="tel"
              required
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="8888-8888"
              maxLength={30}
              className="min-w-0 flex-1 border-none bg-transparent text-[14.5px] font-medium text-[#1E293B] outline-none"
            />
          </div>
        </div>

        <PasswordField label="Contraseña" value={password} onChange={setPassword} />
        <div>
          <PasswordField label="Confirmar contraseña" value={confirmPassword} onChange={setConfirmPassword} />
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
          {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
          {!isSubmitting && <i className="ph-bold ph-arrow-right text-[17px]" />}
        </button>
      </form>

      <div className="mt-5 text-center text-[13.5px] font-semibold text-[#94A3B8]">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="font-bold text-[var(--brand)] no-underline">
          Iniciar sesión
        </Link>
      </div>
    </AuthLayout>
  );
}

export default RegisterPage;
