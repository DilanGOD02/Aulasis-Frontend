import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import { DUMMY_GROUPS } from '../../data/dummyGroups';

const TABS = [
  { to: '', label: 'Resumen', icon: 'ph-squares-four', end: true },
  { to: 'estudiantes', label: 'Estudiantes', icon: 'ph-users-three' },
  { to: 'notas', label: 'Notas', icon: 'ph-table' },
  { to: 'asistencia', label: 'Asistencia', icon: 'ph-calendar-check' },
  { to: 'esquema', label: 'Esquema', icon: 'ph-sliders-horizontal' },
];

/**
 * Group context ribbon shown under the PageHeader on every group-scoped
 * screen: a group switcher followed by the section tabs
 * (Resumen/Estudiantes/Notas/Asistencia/Esquema). Tab links are relative
 * to the current /grupos/:groupId route; switching groups keeps the same tab.
 */
function GroupTabs({ group }) {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const { pathname } = useLocation();
  const tabSuffix = pathname.split(`/grupos/${groupId}`)[1] || '';

  return (
    <div className="no-scrollbar flex items-center gap-1 overflow-x-auto border-b border-[#EEF1F6] bg-white px-4 sm:px-6">
      <div className="mr-2 flex shrink-0 items-center gap-2 whitespace-nowrap rounded-[11px] border border-[#EEF1F6] bg-[#F5F7FA] px-2.5 py-1.5">
        <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: group.color }} />
        <select
          value={group.id}
          onChange={(e) => navigate(`/grupos/${e.target.value}${tabSuffix}`)}
          className="cursor-pointer appearance-none bg-transparent text-[13.5px] font-extrabold text-[#0F172A] outline-none"
        >
          {DUMMY_GROUPS.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <i className="ph-bold ph-caret-down text-[11px] text-[#94A3B8]" />
      </div>

      {TABS.map(({ to, label, icon, end }) => (
        <NavLink
          key={label}
          to={to}
          end={end}
          className={({ isActive }) =>
            `press flex h-[50px] shrink-0 items-center gap-[7px] whitespace-nowrap border-b-[2.5px] px-3.5 text-[13.5px] no-underline ${
              isActive
                ? 'border-[var(--brand)] font-extrabold text-[var(--brand)]'
                : 'border-transparent font-semibold text-[#64748B]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <i className={`${isActive ? 'ph-fill' : 'ph'} ${icon} text-[16px]`} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}

export default GroupTabs;
