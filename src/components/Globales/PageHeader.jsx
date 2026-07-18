import { useNavigate } from 'react-router-dom';
import { FONT } from './colors';

/**
 * Screen title bar shown under the Navbar. Background is a shade darker
 * than the navbar so the two don't blend into one bar. Supports an
 * optional back button, a small crumb line above the title, and an optional
 * action slot on the right for a screen-specific button (the global "Crear
 * grupo" action already lives in the Navbar, so only use this for something
 * that isn't that).
 */
function PageHeader({ title, crumb, showBack = false, action }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3.5 border-b border-[#E7EBF2] bg-[#F1F4F9] px-4 py-3.5 sm:px-6">
      {showBack && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="press flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-white"
        >
          <i className="ph-bold ph-arrow-left text-[18px] text-[#1E293B]" />
        </button>
      )}
      <div className="min-w-0">
        {crumb && <div className="mb-0.5 text-[12.5px] font-semibold text-[#94A3B8]">{crumb}</div>}
        <div
          className="truncate text-[20px] font-extrabold tracking-tight text-[#0F172A] sm:text-[22px]"
          style={{ fontFamily: FONT.display }}
        >
          {title}
        </div>
      </div>
      {action && <div className="ml-auto flex items-center gap-2.5">{action}</div>}
    </div>
  );
}

export default PageHeader;
