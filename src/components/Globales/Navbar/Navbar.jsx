import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FONT } from '../colors';
import { useAuth } from '../../../context/AuthContext';

function getInitials(nombre) {
  if (!nombre) return '';
  const partes = nombre.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase();
}

const NAV_LINKS = [
  { to: '/inicio', label: 'Inicio', icon: 'ph-house', end: true },
  { to: '/esquemas', label: 'Esquemas', icon: 'ph-stack' },
];

function NavItem({ to, label, icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `press flex h-full items-center gap-[7px] whitespace-nowrap px-3.5 text-[14.5px] no-underline border-b-[2.5px] ${
          isActive
            ? 'border-[var(--brand)] font-bold text-[var(--brand)]'
            : 'border-transparent font-semibold text-[#64748B]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <i className={`${isActive ? 'ph-fill' : 'ph'} ${icon} text-[18px]`} />
          {label}
        </>
      )}
    </NavLink>
  );
}

/**
 * App top navigation: brand mark, desktop nav links, "Crear grupo" action,
 * notifications bell and avatar. Nav links move to the bottom tab bar on
 * mobile (see BottomNav), so this bar stays compact on small screens.
 */
function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [menuOpen]);

  return (
    <div className="sticky top-0 z-50 flex-shrink-0 border-b border-[#EEF1F6] bg-white">
      <div className="flex h-[60px] items-center gap-3 px-4 sm:px-5 md:gap-4">
        {/* brand */}
        <div className="press flex items-center gap-2.5" onClick={() => navigate('/inicio')}>
          <div
            className="h-9 w-9 shrink-0"
            style={{ backgroundImage: 'url(/logo.png)', backgroundSize: '290% auto', backgroundPosition: '50% 20%', backgroundRepeat: 'no-repeat' }}
          />
          <span
            className="whitespace-nowrap text-[17px] font-extrabold tracking-tight text-[#0F172A]"
            style={{ fontFamily: FONT.display }}
          >
            Aulasis
          </span>
        </div>

        {/* desktop nav links */}
        <div className="ml-1 hidden h-full min-w-0 flex-1 items-center gap-0.5 md:flex">
          {NAV_LINKS.map((link) => (
            <NavItem key={link.to} {...link} />
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/grupos/crear')}
            className="press flex items-center gap-2 rounded-[11px] bg-[var(--brand)] px-3 py-2.5 font-bold text-[14px] text-white shadow-[0_12px_26px_-10px_rgba(99,102,241,0.6)] md:px-4"
          >
            <i className="ph-bold ph-plus text-[16px]" />
            <span className="hidden md:inline">Crear grupo</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/alertas')}
            className="press relative flex h-10 w-10 items-center justify-center rounded-[11px] bg-[#EEF2F7]"
          >
            <i className="ph ph-bell text-[20px] text-[#475569]" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-[1.5px] border-white bg-[#DC2626]" />
          </button>

          <div className="relative hidden sm:block" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              title={user?.nombre ?? 'Cuenta'}
              className="press flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full text-[14px] font-extrabold text-white"
              style={{ background: 'linear-gradient(140deg, #7C3AED, #DB2777)' }}
            >
              {getInitials(user?.nombre)}
            </button>

            {menuOpen && (
              <div className="absolute right-0 z-20 mt-1.5 w-56 overflow-hidden rounded-xl border border-[#E8ECF2] bg-white py-1.5 shadow-[0_8px_24px_rgba(16,24,40,0.12)]">
                {user?.nombre && (
                  <div className="truncate border-b border-[#F1F4F8] px-3.5 py-2 text-[13px] font-bold text-[#334155]">
                    {user.nombre}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[13px] font-semibold text-[#DC2626] hover:bg-[#FEF2F2]"
                >
                  <i className="ph-bold ph-sign-out text-[16px]" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
