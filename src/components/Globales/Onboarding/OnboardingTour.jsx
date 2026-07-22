import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FONT } from '../colors';

const STORAGE_KEY = 'aulasis_onboarding_completed';

const STEPS = [
  {
    icon: 'ph-hand-waving',
    title: '¡Bienvenida a Aulasis!',
    description: 'Te mostramos rapidito cómo organizar tus grupos — son solo unos pasos.',
  },
  {
    icon: 'ph-stack',
    title: '1. Creá tu esquema de evaluación',
    description:
      'Antes que nada, andá a "Esquemas de evaluación" y armá tu plantilla: las categorías (trabajo cotidiano, pruebas, tareas…) y el peso de cada una, hasta sumar 100%. Después vas a poder usar esa misma plantilla en todos tus grupos.',
  },
  {
    icon: 'ph-users-three',
    title: '2. Creá tus grupos',
    description:
      'Con la plantilla lista, creá un grupo por cada sección/materia que das — elegís su horario, el periodo lectivo y la plantilla de evaluación que le corresponde.',
  },
  {
    icon: 'ph-clipboard-text',
    title: '3. Agregá estudiantes y empezá a trabajar',
    description:
      'Subí tu lista de estudiantes (a mano o importando un PDF), y desde ahí ya podés poner notas, pasar asistencia y ver el promedio y el estado de riesgo de cada quien, calculado solo.',
  },
];

// Duración de la animación de transición entre pasos — debe coincidir con
// los @keyframes definidos más abajo (fly-out-*/fly-in-*).
const TRANSITION_MS = 380;

function hasCompletedOnboarding() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return true;
  }
}

function markOnboardingCompleted() {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    // localStorage puede fallar en modo incógnito — no es crítico, el tour solo se repetiría.
  }
}

/**
 * Mini-tutorial de bienvenida, click para avanzar — se muestra una sola vez
 * por navegador (localStorage), la primera vez que alguien entra ya logueado.
 * Termina llevando a Esquemas de evaluación, que es el primer paso real.
 *
 * Efecto visual: la tarjeta es un panel "de vidrio esmerilado" (blur +
 * translucidez) flotando sobre un par de manchas difuminadas tipo nube;
 * al avanzar/retroceder, el paso actual "vuela" hacia un lado con el viento
 * y se desvanece, y el nuevo entra flotando desde el lado opuesto.
 */
function OnboardingTour() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(() => !hasCompletedOnboarding());
  const [stepIndex, setStepIndex] = useState(0);
  const [anim, setAnim] = useState(null); // null | 'out-forward' | 'out-back' | 'in-forward' | 'in-back'

  const finish = () => {
    markOnboardingCompleted();
    setVisible(false);
  };

  const goToEsquemas = () => {
    finish();
    navigate('/esquemas');
  };

  const changeStep = (nextIndex, dir) => {
    if (anim) return; // ya hay una transición en curso, ignorar clicks de más
    setAnim(dir === 'forward' ? 'out-forward' : 'out-back');
    setTimeout(() => {
      setStepIndex(nextIndex);
      setAnim(dir === 'forward' ? 'in-forward' : 'in-back');
      setTimeout(() => setAnim(null), TRANSITION_MS);
    }, TRANSITION_MS);
  };

  const goNext = () => changeStep(Math.min(STEPS.length - 1, stepIndex + 1), 'forward');
  const goPrev = () => changeStep(Math.max(0, stepIndex - 1), 'back');

  if (!visible) return null;

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;
  const cardAnimClass = anim ? `onboarding-${anim}` : '';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[3px]">
      <style>{`
        @keyframes onboarding-fly-out-forward {
          0% { opacity: 1; transform: translate(0, 0) rotate(0deg); filter: blur(0); }
          100% { opacity: 0; transform: translate(120px, -60px) rotate(10deg); filter: blur(6px); }
        }
        @keyframes onboarding-fly-out-back {
          0% { opacity: 1; transform: translate(0, 0) rotate(0deg); filter: blur(0); }
          100% { opacity: 0; transform: translate(-120px, -60px) rotate(-10deg); filter: blur(6px); }
        }
        @keyframes onboarding-fly-in-forward {
          0% { opacity: 0; transform: translate(120px, 40px) rotate(8deg); filter: blur(6px); }
          100% { opacity: 1; transform: translate(0, 0) rotate(0deg); filter: blur(0); }
        }
        @keyframes onboarding-fly-in-back {
          0% { opacity: 0; transform: translate(-120px, 40px) rotate(-8deg); filter: blur(6px); }
          100% { opacity: 1; transform: translate(0, 0) rotate(0deg); filter: blur(0); }
        }
        .onboarding-out-forward { animation: onboarding-fly-out-forward ${TRANSITION_MS}ms ease-in forwards; }
        .onboarding-out-back { animation: onboarding-fly-out-back ${TRANSITION_MS}ms ease-in forwards; }
        .onboarding-in-forward { animation: onboarding-fly-in-forward ${TRANSITION_MS}ms ease-out forwards; }
        .onboarding-in-back { animation: onboarding-fly-in-back ${TRANSITION_MS}ms ease-out forwards; }
      `}</style>

      <div className="relative w-full max-w-[420px]">
        {/* "nubes" — manchas difuminadas de color detrás de la tarjeta */}
        <div className="pointer-events-none absolute -left-10 -top-14 h-40 w-40 rounded-full bg-[var(--brand)]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-8 h-44 w-44 rounded-full bg-[#DB2777]/20 blur-3xl" />

        <div
          className={`relative flex flex-col rounded-[26px] border border-white/60 bg-white/80 p-6 shadow-[0_30px_70px_-30px_rgba(16,24,40,0.5)] backdrop-blur-xl ${cardAnimClass}`}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 w-6 rounded-full transition-colors duration-300"
                  style={{ background: i <= stepIndex ? 'var(--brand)' : '#E2E8F0' }}
                />
              ))}
            </div>
            <button type="button" onClick={finish} className="press text-[12.5px] font-bold text-[#94A3B8]">
              Saltar tour
            </button>
          </div>

          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[var(--brand)]/10">
            <i className={`ph-bold ${step.icon} text-[24px] text-[var(--brand)]`} />
          </div>

          <div className="mb-2 text-[19px] font-extrabold text-[#0F172A]" style={{ fontFamily: FONT.display }}>
            {step.title}
          </div>
          <p className="mb-6 text-[14px] font-medium leading-relaxed text-[#64748B]">{step.description}</p>

          <div className="flex items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={goPrev}
              disabled={stepIndex === 0 || !!anim}
              className="press rounded-[12px] px-3.5 py-2.5 text-[13.5px] font-bold text-[#475569] disabled:opacity-0"
            >
              Anterior
            </button>

            {isLast ? (
              <button
                type="button"
                onClick={goToEsquemas}
                disabled={!!anim}
                className="press flex items-center gap-2 rounded-[13px] bg-[var(--brand)] px-4 py-3 text-[14.5px] font-extrabold text-white shadow-[0_12px_26px_-10px_rgba(99,102,241,0.6)] disabled:opacity-70"
              >
                Crear mi primera plantilla
                <i className="ph-bold ph-arrow-right text-[16px]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                disabled={!!anim}
                className="press flex items-center gap-2 rounded-[13px] bg-[var(--brand)] px-4 py-3 text-[14.5px] font-extrabold text-white shadow-[0_12px_26px_-10px_rgba(99,102,241,0.6)] disabled:opacity-70"
              >
                Siguiente
                <i className="ph-bold ph-arrow-right text-[16px]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingTour;
