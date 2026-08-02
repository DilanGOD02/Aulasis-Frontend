import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import { tieneFeature } from '../../utils/centerTypeFeatures';

const TABS = [
  { to: '', label: 'Resumen', icon: 'ph-squares-four', end: true },
  { to: 'estudiantes', label: 'Estudiantes', icon: 'ph-users-three' },
  { to: 'notas', label: 'Notas', icon: 'ph-table' },
  { to: 'asistencia', label: 'Asistencia', icon: 'ph-calendar-check' },
  { to: 'esquema', label: 'Esquema', icon: 'ph-sliders-horizontal' },
  // EJEMPLO: tab exclusivo de telesecundaria — ver utils/centerTypeFeatures.js.
  { to: 'sesiones-tv', label: 'Sesiones TV', icon: 'ph-television', feature: 'tabSesionesTv' },
];

/**
 * Group context ribbon shown under the PageHeader on every group-scoped
 * screen: a group switcher, a periodo/año-completo selector, and the section
 * tabs (Resumen/Estudiantes/Notas/Asistencia/Esquema). Tab links are relative
 * to the current /grupos/:groupId route; switching groups keeps the same tab.
 */
function GroupTabs({ group, groups, selectedPeriodo, onSelectPeriodo, selectedMateria, onSelectMateria }) {
  const navigate = useNavigate();
  const { groupId, centroId } = useParams();
  const { pathname } = useLocation();
  const tabSuffix = pathname.split(`/grupos/${groupId}`)[1] || '';

  // Texto de estado: qué periodo (o "Anual") se está viendo ahora mismo —
  // válido tanto para colegio (sin materias) como para escuela (con materias).
  const periodoActivo = group.periodos.find((p) =>
    selectedPeriodo ? Number(selectedPeriodo) === p.id : p.id === group.periodoActualId,
  );
  const viendoLabel = group.modo === 'global' ? 'Anual' : (periodoActivo?.nombre ?? '—');

  return (
    <div className="border-b border-[#EEF1F6] bg-white">
      <div className="no-scrollbar flex items-center gap-1 overflow-x-auto px-4 pt-3 sm:px-6">
        <div className="mr-2 flex shrink-0 items-center gap-2 whitespace-nowrap rounded-[11px] border border-[#EEF1F6] bg-[#F5F7FA] px-2.5 py-1.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: group.color }} />
          <select
            value={group.id}
            onChange={(e) => navigate(`/inicio/${centroId}/grupos/${e.target.value}${tabSuffix}`)}
            className="cursor-pointer appearance-none bg-transparent text-[13.5px] font-extrabold text-[#0F172A] outline-none"
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <i className="ph-bold ph-caret-down text-[11px] text-[#94A3B8]" />
        </div>

        {group.materias.length > 0 && (
          <div className="mr-2 flex shrink-0 gap-1 whitespace-nowrap rounded-[11px] bg-[#EEF2F7] p-[3px]">
            {group.materias.map((m) => {
              const isActive = selectedMateria ? Number(selectedMateria) === m.id : m.id === group.materiaSeleccionadaId;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectMateria(m.id)}
                  className={`press rounded-[9px] px-3 py-1.5 text-[12.5px] font-bold ${
                    isActive ? 'bg-white text-[#1E293B] shadow-sm' : 'text-[#64748B]'
                  }`}
                >
                  {m.nombre}
                </button>
              );
            })}
          </div>
        )}

        {group.periodos.length > 0 && (
          <div className="flex shrink-0 gap-1 whitespace-nowrap rounded-[11px] bg-[#EEF2F7] p-[3px]">
            {group.periodos.map((p) => {
              const isActive =
                group.modo === 'periodo' && (selectedPeriodo ? Number(selectedPeriodo) === p.id : p.id === group.periodoActualId);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectPeriodo(p.id)}
                  className={`press rounded-[9px] px-3 py-1.5 text-[12.5px] font-bold ${
                    isActive ? 'bg-white text-[#1E293B] shadow-sm' : 'text-[#64748B]'
                  }`}
                >
                  {p.nombre}
                </button>
              );
            })}
            {group.periodos.length > 1 && (
              <button
                type="button"
                onClick={() => onSelectPeriodo('global')}
                className={`press rounded-[9px] px-3 py-1.5 text-[12.5px] font-bold ${
                  group.modo === 'global' ? 'bg-white text-[#1E293B] shadow-sm' : 'text-[#64748B]'
                }`}
              >
                Anual
              </button>
            )}
          </div>
        )}

        {group.periodos.length > 0 && (
          <div className="ml-1 shrink-0 whitespace-nowrap text-[12px] font-semibold text-[#94A3B8]">
            Viendo: <span className="font-extrabold text-[#475569]">{viendoLabel}</span>
          </div>
        )}
      </div>

      <div className="no-scrollbar flex items-center gap-1 overflow-x-auto px-4 sm:px-6">
        {TABS.filter((tab) => !tab.feature || tieneFeature(group.tipoCentroEducativoClave, tab.feature)).map(
          ({ to, label, icon, end }) => (
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
    </div>
  );
}

export default GroupTabs;
