import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gruposService } from '../../services/gruposService';
import { riesgoService } from '../../services/riesgoService';
import { useToast } from '../../context/ToastContext';

const SEVERITY = {
  critico: { border: '#DC2626', rowBg: '#FEF2F2', badgeBg: '#DC2626', label: 'CRÍTICO' },
  atencion: { border: '#D97706', rowBg: '#FFFBEB', badgeBg: '#D97706', label: 'ATENCIÓN' },
};

/** One row in the consolidated risk list: student, why they're flagged, and a shortcut to their profile. */
function RiskStudentCard({ student, highlighted, cardRef }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { border, rowBg, badgeBg, label } = SEVERITY[student.severity];

  // /riesgo no informa el centroEducativoId del grupo, así que se resuelve con un
  // fetch puntual a /grupos/:id (que sí lo trae) antes de armar la ruta anidada.
  const handleVerPerfil = async () => {
    setIsNavigating(true);
    try {
      const grupo = await gruposService.getOne(student.groupId);
      navigate(`/inicio/${grupo.centroEducativoId}/grupos/${student.groupId}/estudiantes/${student.studentId}`);
    } finally {
      setIsNavigating(false);
    }
  };

  const handleEnviarInforme = async () => {
    setIsSending(true);
    try {
      await riesgoService.enviarInforme(student.studentId);
      showToast('Correo enviado', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      ref={cardRef}
      className={`flex items-center gap-3.5 rounded-2xl border p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-[18px] ${
        highlighted ? 'ring-2 ring-[var(--brand)] ring-offset-2' : ''
      }`}
      style={{ background: rowBg, borderColor: `${border}33`, borderLeft: `4px solid ${border}` }}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white" style={{ color: border }}>
        <i className="ph-fill ph-warning text-[22px]" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-extrabold text-[15px] text-[#0F172A]">{student.name}</span>
          <span className="text-[12.5px] font-semibold text-[#64748B]">Sección {student.groupName}</span>
          <span
            className="whitespace-nowrap rounded-[6px] px-2 py-0.5 text-[10.5px] font-extrabold text-white"
            style={{ background: badgeBg }}
          >
            {label}
          </span>
        </div>
        <div className="mt-0.5 text-[13.5px] font-semibold text-[#64748B]">{student.reason}</div>
        <div className="mt-1 text-[12.5px] font-medium text-[#78716C]">
          Promedio actual: <span className="font-extrabold text-[#1E293B]">{student.avg != null ? student.avg.toFixed(0) : '—'}</span>
          {student.neededScore != null && (
            <>
              {' '}
              · Necesita <span className="font-extrabold text-[#1E293B]">{student.neededScore}</span> en próximas
              evaluaciones
            </>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={handleEnviarInforme}
          disabled={isSending}
          title="Enviar informe al encargado"
          className="press flex h-[38px] w-[38px] items-center justify-center rounded-[11px] border border-transparent bg-white text-[#334155] shadow-sm disabled:opacity-60"
        >
          {isSending ? (
            <i className="ph-bold ph-spinner animate-spin text-[15px]" />
          ) : (
            <i className="ph-bold ph-envelope-simple text-[15px]" />
          )}
        </button>
        <button
          type="button"
          onClick={handleVerPerfil}
          disabled={isNavigating}
          className="press flex items-center gap-1.5 whitespace-nowrap rounded-[11px] border border-transparent bg-white px-3.5 py-2 text-[13px] font-bold text-[#334155] shadow-sm disabled:opacity-60"
        >
          Ver perfil <i className="ph-bold ph-arrow-right text-[13px]" />
        </button>
      </div>
    </div>
  );
}

export default RiskStudentCard;
