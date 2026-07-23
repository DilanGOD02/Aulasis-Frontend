import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/Globales';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { PLAN_LABELS, PLAN_ORDEN } from '../../constants/plans';

function formatFecha(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function EstadoBadge({ profesor }) {
  if (profesor.esAdmin) {
    return <span className="rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[11.5px] font-extrabold text-[#4338CA]">Admin</span>;
  }
  if (!profesor.esActivo) {
    return <span className="rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[11.5px] font-extrabold text-[#475569]">Desactivada</span>;
  }
  if (!profesor.cuentaActiva) {
    return <span className="rounded-full bg-[#FEF2F2] px-2.5 py-1 text-[11.5px] font-extrabold text-[#DC2626]">Vencida</span>;
  }
  if (!profesor.plan) {
    return <span className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-[11.5px] font-extrabold text-[#2563EB]">Prueba gratis</span>;
  }
  return <span className="rounded-full bg-[#F0FDF4] px-2.5 py-1 text-[11.5px] font-extrabold text-[#16A34A]">Activa</span>;
}

function ProfesorRow({ profesor, onActivar, onDesactivar }) {
  const [plan, setPlan] = useState('mensual');
  const [isActivando, setIsActivando] = useState(false);
  const [isDesactivando, setIsDesactivando] = useState(false);

  const handleActivar = async () => {
    setIsActivando(true);
    try {
      await onActivar(profesor.id, plan);
    } finally {
      setIsActivando(false);
    }
  };

  const handleDesactivar = async () => {
    setIsDesactivando(true);
    try {
      await onDesactivar(profesor.id);
    } finally {
      setIsDesactivando(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#EEF1F6] bg-white p-4 sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-extrabold text-[14.5px] text-[#0F172A]">{profesor.nombre ?? 'Sin nombre'}</span>
          <EstadoBadge profesor={profesor} />
        </div>
        <div className="mt-0.5 text-[12.5px] font-semibold text-[#64748B]">{profesor.email}</div>
        <div className="mt-1 text-[12px] font-medium text-[#94A3B8]">
          {profesor.plan ? `Plan ${PLAN_LABELS[profesor.plan]} · ` : ''}
          Vence: {formatFecha(profesor.fechaVencimiento)}
          {profesor.ultimoPagoEn && ` · Último pago: ${formatFecha(profesor.ultimoPagoEn)}`}
        </div>
      </div>

      {!profesor.esAdmin && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="rounded-[10px] border border-[#E2E8F0] px-2.5 py-2 text-[13px] font-bold text-[#334155]"
          >
            {PLAN_ORDEN.map((p) => (
              <option key={p} value={p}>{PLAN_LABELS[p]}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleActivar}
            disabled={isActivando}
            className="press rounded-[10px] bg-[var(--brand)] px-3.5 py-2 text-[13px] font-extrabold text-white disabled:opacity-60"
          >
            {isActivando ? 'Activando…' : 'Activar / renovar'}
          </button>
          {profesor.esActivo && (
            <button
              type="button"
              onClick={handleDesactivar}
              disabled={isDesactivando}
              title="Cortar el acceso ya mismo, sin tocar la fecha de vencimiento"
              className="press rounded-[10px] border border-[#FCA5A5] px-3.5 py-2 text-[13px] font-extrabold text-[#DC2626] disabled:opacity-60"
            >
              {isDesactivando ? 'Desactivando…' : 'Desactivar'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Panel admin: solo lo alcanza esAdmin (ver AdminRoute). Activa/renueva el plan de cada profesor tras confirmar el pago manualmente. */
function AdminTeachersPage() {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [profesores, setProfesores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const cargar = () => adminService.listarProfesores().then(setProfesores);

  useEffect(() => {
    cargar().finally(() => setIsLoading(false));
  }, []);

  const handleActivar = async (id, plan) => {
    try {
      await adminService.activarPlan(id, plan);
      await cargar();
      showToast('Plan activado', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDesactivar = async (id) => {
    const ok = await confirm({
      title: 'Desactivar cuenta',
      message: 'Le corta el acceso a la app ya mismo. Podés volver a activarlo cuando quieras eligiendo un plan.',
      confirmLabel: 'Desactivar',
      danger: true,
    });
    if (!ok) return;
    try {
      await adminService.desactivarCuenta(id);
      await cargar();
      showToast('Cuenta desactivada', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <>
      <PageHeader crumb="Administración" title="Profesores" showBack />

      <div className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
        {isLoading ? (
          <div className="flex-1" />
        ) : profesores.length === 0 ? (
          <div className="py-16 text-center text-[14px] font-semibold text-[#94A3B8]">
            No hay profesores registrados todavía.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {profesores.map((p) => (
              <ProfesorRow key={p.id} profesor={p} onActivar={handleActivar} onDesactivar={handleDesactivar} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default AdminTeachersPage;
