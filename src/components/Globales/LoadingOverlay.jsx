/** Full-screen blocking overlay for actions that must finish before the user touches anything else (ej. guardar asistencia, crear grupo, recalcular). */
function LoadingOverlay({ show, message = 'Cargando…' }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-[2px]">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-[#E2E8F0] border-t-[var(--brand)]" />
        <img src="/logo.png" alt="" className="h-11 w-11 animate-pulse object-contain" />
      </div>
      <div className="text-center">
        <div className="text-[15px] font-extrabold text-[#0F172A]">Aulasis</div>
        <div className="text-[13px] font-semibold text-[#64748B]">{message}</div>
      </div>
    </div>
  );
}

export default LoadingOverlay;
