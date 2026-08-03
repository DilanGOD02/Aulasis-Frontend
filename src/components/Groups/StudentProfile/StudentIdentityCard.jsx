import { useState } from 'react';
import { estudiantesService } from '../../../services/estudiantesService';
import { useToast } from '../../../context/ToastContext';

/** Avatar + identity + the two headline stats (promedio, asistencia). */
function StudentIdentityCard({ student, group, groupId, studentId }) {
  const { showToast } = useToast();
  const [isSendingNota, setIsSendingNota] = useState(false);
  const [isSendingAlerta, setIsSendingAlerta] = useState(false);
  const sinCorreo = !student.correoEncargado;

  const handleEnviarNota = async () => {
    setIsSendingNota(true);
    try {
      await estudiantesService.enviarNota(groupId, studentId);
      showToast('Correo enviado', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSendingNota(false);
    }
  };

  const handleEnviarAlerta = async () => {
    setIsSendingAlerta(true);
    try {
      await estudiantesService.enviarAlertaAsistencia(groupId, studentId);
      showToast('Correo enviado', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSendingAlerta(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#EEF1F6] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-6">
      <div className="mb-4 flex items-center gap-3.5">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[18px] font-extrabold text-white"
          style={{ background: group.color }}
        >
          {student.initials}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[18px] font-extrabold text-[#0F172A]">{student.name}</div>
          <div className="text-[13px] font-semibold text-[#94A3B8]">
            {group.name} · Cédula {student.cedula}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[14px] p-4" style={{ background: student.status.bg }}>
          <div className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: student.status.color }}>
            Promedio
          </div>
          <div className="mt-1 text-[26px] font-extrabold leading-none" style={{ color: student.status.color }}>
            {student.avgLiteral != null ? student.avgLiteral.toFixed(1) : '—'}
          </div>
          <div className="mt-1 text-[12px] font-bold" style={{ color: student.status.color }}>
            {student.status.label}
          </div>
        </div>
        <div className="rounded-[14px] bg-[var(--brand)]/10 p-4">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--brand-dark)]">
            Asistencia
          </div>
          {student.asistenciaCounts ? (
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
              <div>
                <span className="text-[19px] font-extrabold leading-none text-[#16A34A]">
                  {student.asistenciaCounts.presente}
                </span>
                <div className="text-[10.5px] font-bold text-[#64748B]">presente</div>
              </div>
              <div>
                <span className="text-[19px] font-extrabold leading-none text-[#C2410C]">
                  {student.asistenciaCounts.tardiaInjustificada}
                </span>
                <div className="text-[10.5px] font-bold text-[#64748B]">tardía</div>
              </div>
              <div>
                <span className="text-[19px] font-extrabold leading-none text-[#DC2626]">
                  {student.asistenciaCounts.ausenteInjustificada}
                </span>
                <div className="text-[10.5px] font-bold text-[#64748B]">ausente</div>
              </div>
              <div>
                <span className="text-[19px] font-extrabold leading-none text-[#475569]">
                  {student.asistenciaCounts.ausenteJustificada + student.asistenciaCounts.tardiaJustificada}
                </span>
                <div className="text-[10.5px] font-bold text-[#64748B]">justif.</div>
              </div>
            </div>
          ) : (
            <div className="mt-1 text-[26px] font-extrabold leading-none text-[var(--brand-dark)]">—</div>
          )}

          {student.porcentajeAusentismo != null && (
            <div className="mt-2 border-t border-[var(--brand)]/15 pt-1.5 text-[11.5px] font-bold text-[var(--brand-dark)]">
              {student.porcentajeAusentismo.toFixed(1)}% de ausentismo
              {student.totalLeccionesPeriodo != null && (
                <span className="font-semibold text-[#64748B]">
                  {' '}
                  · {student.leccionesPerdidasAcumuladas ?? 0} de {student.totalLeccionesPeriodo} lecciones
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-[#EEF1F6] pt-4">
        <button
          type="button"
          onClick={handleEnviarNota}
          disabled={sinCorreo || isSendingNota}
          title={sinCorreo ? 'Este estudiante no tiene correo del encargado registrado' : undefined}
          className="press flex items-center gap-1.5 whitespace-nowrap rounded-[11px] border border-[#E2E8F0] bg-white px-3.5 py-2 text-[12.5px] font-bold text-[#334155] shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSendingNota ? (
            <i className="ph-bold ph-spinner animate-spin text-[14px]" />
          ) : (
            <i className="ph-bold ph-envelope-simple text-[14px]" />
          )}
          Enviar nota al encargado
        </button>

        {student.rachaAsistencia && (
          <button
            type="button"
            onClick={handleEnviarAlerta}
            disabled={sinCorreo || isSendingAlerta}
            title={
              sinCorreo
                ? 'Este estudiante no tiene correo del encargado registrado'
                : student.rachaAsistencia.motivo
            }
            className="press flex items-center gap-1.5 whitespace-nowrap rounded-[11px] border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-2 text-[12.5px] font-bold text-[#DC2626] shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSendingAlerta ? (
              <i className="ph-bold ph-spinner animate-spin text-[14px]" />
            ) : (
              <i className="ph-bold ph-warning text-[14px]" />
            )}
            Avisar ausentismo al encargado
          </button>
        )}
      </div>
    </div>
  );
}

export default StudentIdentityCard;
