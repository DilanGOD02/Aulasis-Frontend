import { FONT } from '../Globales/colors';

/**
 * Shared two-column shell for Login/Register/ForgotPassword: a brand gradient
 * panel (marketing copy + stats/features) on the left, the actual form on
 * the right. The gradient panel hides on mobile — a compact logo row plus a
 * softer version of the decorative background replaces it there so the form
 * doesn't feel like a bare white box on small viewports either.
 */
function AuthLayout({ title, description, stats, features, children }) {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-6"
      style={{ background: 'linear-gradient(160deg, #EEF1FF 0%, #E3E8FD 45%, #D9E0FC 100%)' }}
    >
      {/* fondo animado de la página — grandes manchas de color + íconos temáticos flotando */}
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

      <div className="relative flex w-full max-w-[980px] flex-wrap overflow-hidden rounded-[26px] border border-[#E8ECF2] bg-white shadow-[0_30px_70px_-30px_rgba(16,24,40,0.4)]">
        {/* brand panel — desktop only */}
        <div
          className="relative hidden min-w-[320px] flex-1 flex-col justify-center overflow-hidden p-[54px] text-white md:flex"
          style={{ background: 'linear-gradient(150deg, var(--brand-light) 0%, var(--brand) 58%, var(--brand-dark) 100%)' }}
        >
          {/* patrón de puntos sutil para dar textura, sin competir con el texto */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.15]"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '22px 22px' }}
          />
          <div className="pointer-events-none absolute -right-[60px] -top-[60px] h-[240px] w-[240px] animate-[float-a_10s_ease-in-out_infinite] rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-24 right-[10px] h-[200px] w-[200px] animate-[float-b_12s_ease-in-out_infinite] rounded-full bg-white/[0.08]" />

          <div className="relative">
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/95 p-2 shadow-[0_10px_24px_-8px_rgba(0,0,0,0.35)]">
                <img src="/logo.png" alt="" className="h-full w-full object-contain" />
              </div>
              <span className="text-[24px] font-extrabold" style={{ fontFamily: FONT.display }}>
                Aulasis
              </span>
            </div>

            <div
              className="mb-4 max-w-[20ch] text-[34px] font-extrabold leading-[1.1] tracking-tight"
              style={{ fontFamily: FONT.display }}
            >
              {title}
            </div>
            <p className="max-w-[36ch] text-[15.5px] font-medium leading-relaxed opacity-90">{description}</p>

            {features && (
              <div className="mt-8 flex flex-col gap-3.5">
                {features.map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                      <i className={`${icon} text-[16px]`} />
                    </div>
                    <span className="text-[14px] font-semibold opacity-95">{text}</span>
                  </div>
                ))}
              </div>
            )}

            {stats && (
              <div className="mt-9 flex gap-6">
                {stats.map(({ value, label }) => (
                  <div key={label}>
                    <div className="text-[26px] font-extrabold" style={{ fontFamily: FONT.display }}>
                      {value}
                    </div>
                    <div className="text-[12.5px] font-semibold opacity-85">{label}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-10 flex w-fit items-center gap-2 rounded-full bg-white/15 py-2 pl-2.5 pr-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/95">
                <i className="ph-bold ph-check text-[13px] text-[var(--brand-dark)]" />
              </div>
              <span className="text-[13px] font-bold">Compatible con formato SEA</span>
            </div>
          </div>
        </div>

        {/* form panel */}
        <div className="flex min-w-[300px] flex-1 flex-col justify-center p-6 sm:p-10">
          <div className="mb-7 flex items-center gap-2.5 md:hidden">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F1F4FF] p-1.5">
              <img src="/logo.png" alt="" className="h-full w-full object-contain" />
            </div>
            <span className="text-[17px] font-extrabold text-[#0F172A]" style={{ fontFamily: FONT.display }}>
              Aulasis
            </span>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
