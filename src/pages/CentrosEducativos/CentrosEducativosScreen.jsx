import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, FONT } from '../../components/Globales';
import { centrosEducativosService } from '../../services/centrosEducativosService';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';

/** One card in the "Mis centros educativos" grid: escudo, nombre, color propio, stats y menú de 3 puntos. */
function CentroCard({ centro, onEliminado }) {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { showToast } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const color = centro.color || '#6366F1';

  const handleEditar = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    navigate(`/inicio/${centro.id}/editar`);
  };

  const handleEliminar = async (e) => {
    e.stopPropagation();
    setShowMenu(false);
    const ok = await confirm({
      title: 'Eliminar centro',
      message: `¿Eliminar el centro educativo "${centro.nombre}"? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    setIsDeleting(true);
    try {
      await centrosEducativosService.remove(centro.id);
      onEliminado(centro.id);
      showToast('Centro educativo eliminado');
    } catch (err) {
      showToast(err.message, 'error');
      setIsDeleting(false);
    }
  };

  return (
    <div
      onClick={() => navigate(`/inicio/${centro.id}`)}
      className="lift relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#EEF1F6] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_26px_-20px_rgba(16,24,40,0.16)] sm:p-[18px]"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-[120px] w-[120px] rounded-full"
        style={{ background: `color-mix(in srgb, ${color} 8%, transparent)` }}
      />

      {/* Badge de riesgo + menú de 3 puntos agrupados en un solo bloque arriba a la derecha
          para que no se encimen (antes cada uno se posicionaba "absolute" por su cuenta). */}
      <div
        className="absolute right-3 top-3 z-10 flex items-center gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        {centro.estudiantesEnRiesgo > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-[#FEE2E2] px-2.5 py-1 text-[11px] font-extrabold text-[#DC2626]">
            <i className="ph-fill ph-warning text-[12px]" />
            {centro.estudiantesEnRiesgo}
          </div>
        )}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu((v) => !v)}
            disabled={isDeleting}
            className="press flex h-8 w-8 items-center justify-center rounded-[10px] text-[#94A3B8] hover:bg-[#F1F4F8] disabled:opacity-60"
            aria-label="Opciones del centro"
          >
            <i className="ph-bold ph-dots-three-vertical text-[16px]" />
          </button>
          {showMenu && (
            <div className="absolute right-0 z-10 mt-1.5 w-44 rounded-[12px] border border-[#EEF1F6] bg-white p-1.5 text-left shadow-[0_20px_44px_-16px_rgba(16,24,40,0.34)]">
              <button
                type="button"
                onClick={handleEditar}
                className="press flex w-full items-center gap-2 rounded-[9px] px-3 py-2.5 text-[13.5px] font-bold text-[#334155]"
              >
                <i className="ph ph-pencil-simple text-[15px]" />
                Editar centro
              </button>
              <button
                type="button"
                onClick={handleEliminar}
                className="press flex w-full items-center gap-2 rounded-[9px] px-3 py-2.5 text-[13.5px] font-bold text-[#DC2626]"
              >
                <i className="ph ph-trash text-[15px]" />
                Eliminar centro
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="relative flex items-center gap-3">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#EEF1F6] bg-[#F5F7FA]"
          style={{ boxShadow: `0 0 0 3px color-mix(in srgb, ${color} 14%, transparent)` }}
        >
          {centro.escudoUrl ? (
            <img src={centro.escudoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <i className="ph-bold ph-bank text-[24px]" style={{ color }} />
          )}
        </div>
        <div className="min-w-0 flex-1 pr-16">
          <div className="truncate text-[16px] font-extrabold text-[#0F172A]">{centro.nombre}</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-[#94A3B8]">
            <i className="ph-bold ph-users-three text-[13px]" />
            {centro.gruposCount} grupo{centro.gruposCount === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {centro.estudiantesEnRiesgo > 0 ? (
        <div className="mt-3.5 flex items-center gap-1.5 border-t border-[#F1F4F8] pt-3 text-[13px] font-bold text-[#DC2626]">
          <i className="ph-fill ph-warning text-[15px]" />
          {centro.estudiantesEnRiesgo} estudiante{centro.estudiantesEnRiesgo === 1 ? '' : 's'} en riesgo
        </div>
      ) : (
        <div className="mt-3.5 flex items-center gap-1.5 border-t border-[#F1F4F8] pt-3 text-[13px] font-semibold text-[#94A3B8]">
          <i className="ph-fill ph-check-circle text-[15px] text-[#22C55E]" />
          Sin alertas de riesgo
        </div>
      )}
    </div>
  );
}

/** Hero de bienvenida con gradiente de marca + mini-stats agregados en vivo. */
function WelcomeHero({ nombre, totalCentros, totalGrupos, totalRiesgo }) {
  return (
    <div
      className="relative mb-5 overflow-hidden rounded-[20px] p-6 text-white shadow-[0_16px_36px_-16px_rgba(99,102,241,0.6)] sm:p-7"
      style={{ background: 'linear-gradient(135deg, var(--brand-light) 0%, var(--brand) 55%, var(--brand-dark) 100%)' }}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-[190px] w-[190px] rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-14 left-16 h-[150px] w-[150px] rounded-full bg-white/10" />

      <div className="relative">
        <div className="text-[12.5px] font-bold uppercase tracking-wide opacity-85">Panel general</div>
        <div
          className="mt-2 mb-1 text-[24px] font-extrabold leading-tight tracking-tight sm:text-[28px]"
          style={{ fontFamily: FONT.display }}
        >
          {nombre ? `Bienvenido, ${nombre}` : 'Bienvenido de vuelta'}
        </div>
        <div className="mb-5 text-[14.5px] font-medium opacity-90">
          Elegí un centro educativo para ver sus grupos, asistencia y notas.
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex min-w-[130px] flex-1 items-center gap-3 rounded-[14px] border border-white/20 bg-white/15 px-4 py-3">
            <i className="ph-fill ph-bank text-[22px]" />
            <div>
              <div className="text-[19px] font-extrabold leading-none" style={{ fontFamily: FONT.display }}>
                {totalCentros}
              </div>
              <div className="mt-0.5 text-[12px] font-semibold opacity-85">
                centro{totalCentros === 1 ? '' : 's'}
              </div>
            </div>
          </div>
          <div className="flex min-w-[130px] flex-1 items-center gap-3 rounded-[14px] border border-white/20 bg-white/15 px-4 py-3">
            <i className="ph-fill ph-users-three text-[22px]" />
            <div>
              <div className="text-[19px] font-extrabold leading-none" style={{ fontFamily: FONT.display }}>
                {totalGrupos}
              </div>
              <div className="mt-0.5 text-[12px] font-semibold opacity-85">grupos en total</div>
            </div>
          </div>
          <div className="flex min-w-[130px] flex-1 items-center gap-3 rounded-[14px] border border-white/20 bg-white/15 px-4 py-3">
            <i className="ph-fill ph-warning text-[22px]" />
            <div>
              <div className="text-[19px] font-extrabold leading-none" style={{ fontFamily: FONT.display }}>
                {totalRiesgo}
              </div>
              <div className="mt-0.5 text-[12px] font-semibold opacity-85">en riesgo</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Estado vacío: el profesor todavía no tiene ningún centro educativo. */
function EmptyState({ onCrear }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#CBD8E8] bg-white px-6 py-14 text-center">
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: 'linear-gradient(135deg, var(--brand-light), var(--brand))' }}
      >
        <i className="ph-fill ph-bank text-[30px] text-white" />
      </div>
      <div className="mb-1.5 text-[18px] font-extrabold text-[#0F172A]" style={{ fontFamily: FONT.display }}>
        Todavía no tenés centros educativos
      </div>
      <p className="mb-6 max-w-[380px] text-[13.5px] font-medium leading-relaxed text-[#64748B]">
        Un centro educativo es el colegio o liceo donde trabajás. Creá uno para empezar a organizar tus grupos,
        pasar asistencia y llevar las notas de tus estudiantes.
      </p>
      <button
        type="button"
        onClick={onCrear}
        className="press flex items-center gap-2 rounded-2xl bg-[var(--brand)] px-6 py-3.5 text-[15px] font-extrabold text-white shadow-[0_12px_26px_-10px_rgba(99,102,241,0.6)]"
      >
        <i className="ph-bold ph-plus text-[17px]" />
        Crear centro educativo
      </button>
    </div>
  );
}

function CentrosEducativosScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [centros, setCentros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    centrosEducativosService
      .listMios()
      .then(setCentros)
      .finally(() => setIsLoading(false));
  }, []);

  const handleEliminado = (id) => setCentros((prev) => prev.filter((c) => c.id !== id));

  if (isLoading) {
    return (
      <>
        <PageHeader title="Mis centros educativos" />
        <div className="flex-1 px-4 py-5 sm:px-6 sm:py-6" />
      </>
    );
  }

  const totalGrupos = centros.reduce((acc, c) => acc + (c.gruposCount ?? 0), 0);
  const totalRiesgo = centros.reduce((acc, c) => acc + (c.estudiantesEnRiesgo ?? 0), 0);
  const primerNombre = user?.nombre?.split(' ')[0];

  return (
    <>
      <PageHeader title="Mis centros educativos" />

      <div className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
        <WelcomeHero
          nombre={primerNombre}
          totalCentros={centros.length}
          totalGrupos={totalGrupos}
          totalRiesgo={totalRiesgo}
        />

        <div className="mb-3.5 flex items-center justify-between">
          <div className="text-[19px] font-extrabold tracking-tight text-[#0F172A]">Mis centros educativos</div>
          <div className="text-[13px] font-semibold text-[#64748B]">
            {centros.length} centro{centros.length === 1 ? '' : 's'}
          </div>
        </div>

        {centros.length === 0 ? (
          <EmptyState onCrear={() => navigate('/inicio/crear')} />
        ) : (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
            {centros.map((centro) => (
              <CentroCard key={centro.id} centro={centro} onEliminado={handleEliminado} />
            ))}

            <div
              onClick={() => navigate('/inicio/crear')}
              className="press flex min-h-[150px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-[1.5px] border-dashed border-[var(--brand)]/40 bg-[var(--brand)]/[0.04] px-4 py-6 text-center transition hover:border-[var(--brand)] hover:bg-[var(--brand)]/[0.07]"
            >
              <div className="mb-1 flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[var(--brand)]/10">
                <i className="ph-bold ph-plus text-[22px] text-[var(--brand)]" />
              </div>
              <div className="text-[15px] font-extrabold text-[#1E293B]">Crear centro educativo</div>
              <div className="text-[12.5px] font-medium text-[#94A3B8]">Registra un colegio o liceo</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default CentrosEducativosScreen;
