import { FONT } from '../Globales/colors';

/**
 * Shared two-column shell for Login/Register/ForgotPassword: a brand gradient
 * panel (marketing copy + stats) on the left, the actual form on the right.
 * The gradient panel hides on mobile — a compact logo row replaces it there
 * so the form stays the only thing on screen on small viewports.
 */
function AuthLayout({ title, description, stats, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#E9EDF3] p-4 sm:p-6">
      <div className="flex w-full max-w-[940px] flex-wrap overflow-hidden rounded-[26px] border border-[#E8ECF2] bg-white shadow-[0_30px_70px_-30px_rgba(16,24,40,0.4)]">
        {/* brand panel — desktop only */}
        <div
          className="relative hidden min-w-[300px] flex-1 flex-col justify-center overflow-hidden p-[54px] text-white md:flex"
          style={{ background: 'linear-gradient(150deg, var(--brand-light) 0%, var(--brand) 58%, var(--brand-dark) 100%)' }}
        >
          <div className="pointer-events-none absolute -right-[50px] -top-[50px] h-[230px] w-[230px] rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 right-[30px] h-[180px] w-[180px] rounded-full bg-white/[0.07]" />

          <div className="relative">
            <div className="mb-10 flex items-center gap-3">
              <img src="/Logo.png" alt="" className="h-16 w-auto shrink-0 object-contain" />
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
            <p className="max-w-[34ch] text-[15.5px] font-medium leading-relaxed opacity-90">{description}</p>

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
          </div>
        </div>

        {/* form panel */}
        <div className="flex min-w-[300px] flex-1 flex-col justify-center p-6 sm:p-10">
          <div className="mb-7 flex items-center gap-2.5 md:hidden">
            <img src="/Logo.png" alt="" className="h-9 w-auto shrink-0 object-contain" />
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
