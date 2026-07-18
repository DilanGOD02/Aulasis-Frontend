import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/', label: 'Inicio', icon: 'ph-house', end: true },
  { to: '/asistencia', label: 'Asistencia', icon: 'ph-calendar-check' },
  { to: '/esquemas', label: 'Esquemas', icon: 'ph-stack' },
  { to: '/alertas', label: 'Alertas', icon: 'ph-warning', badge: 3 },
];

/** Fixed bottom tab bar shown on mobile only — top nav links live here instead of a hamburger menu. */
function BottomNav() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex border-t border-[#EEF1F6] bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      {TABS.map(({ to, label, icon, end, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `press relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11.5px] no-underline ${
              isActive ? 'font-bold text-[var(--brand)]' : 'font-semibold text-[#94A3B8]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className="relative">
                <i className={`${isActive ? 'ph-fill' : 'ph'} ${icon} text-[22px]`} />
                {badge && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#DC2626] px-1 text-[10px] font-bold text-white">
                    {badge}
                  </span>
                )}
              </span>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}

export default BottomNav;
