/**
 * Fondo animado compartido por las pantallas de auth (login/registro/planes)
 * y la de renovación — grandes manchas de color + íconos temáticos flotando.
 * El contenedor padre debe ser `relative overflow-hidden` para que quede detrás del contenido.
 */
function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-28 -top-28 h-[420px] w-[420px] animate-[float-a_11s_ease-in-out_infinite] rounded-full bg-[var(--brand)]/30 blur-3xl" />
      <div className="absolute -bottom-40 -right-20 h-[460px] w-[460px] animate-[float-b_13s_ease-in-out_infinite] rounded-full bg-[var(--brand-dark)]/25 blur-3xl" />
      <div className="absolute right-[8%] top-[12%] h-[220px] w-[220px] animate-[float-a_9s_ease-in-out_infinite] rounded-full bg-[var(--brand-light)]/35 blur-2xl" />
      <div className="absolute bottom-[10%] left-[6%] h-[160px] w-[160px] animate-[float-b_10s_ease-in-out_infinite] rounded-full bg-[var(--brand)]/25 blur-2xl" />

      <i
        className="ph-bold ph-graduation-cap absolute left-[8%] top-[10%] animate-[float-a_10s_ease-in-out_infinite] text-[64px]"
        style={{ color: 'rgba(99,102,241,0.18)' }}
      />
      <i
        className="ph-bold ph-chart-line-up absolute right-[10%] top-[8%] animate-[float-b_12s_ease-in-out_infinite] text-[56px]"
        style={{ color: 'rgba(67,56,202,0.16)' }}
      />
      <i
        className="ph-bold ph-check-circle absolute right-[14%] bottom-[16%] animate-[float-a_9s_ease-in-out_infinite] text-[50px]"
        style={{ color: 'rgba(99,102,241,0.2)' }}
      />
      <i
        className="ph-bold ph-calendar-check absolute left-[10%] bottom-[12%] animate-[float-b_11s_ease-in-out_infinite] text-[58px]"
        style={{ color: 'rgba(67,56,202,0.17)' }}
      />
      <i
        className="ph-bold ph-bell-ringing absolute left-[4%] top-[46%] animate-[float-a_13s_ease-in-out_infinite] text-[44px]"
        style={{ color: 'rgba(99,102,241,0.15)' }}
      />
      <i
        className="ph-bold ph-table absolute right-[4%] top-[46%] animate-[float-b_14s_ease-in-out_infinite] text-[46px]"
        style={{ color: 'rgba(129,140,248,0.22)' }}
      />
    </div>
  );
}

export default AnimatedBackground;
