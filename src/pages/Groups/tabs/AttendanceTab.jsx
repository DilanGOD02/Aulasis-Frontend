import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  AttendanceStatCards,
  AttendanceActionsBar,
  AttendanceList,
  countByStatus,
} from '../../../components/Groups/Attendance';

function AttendanceTab() {
  const { group } = useOutletContext();

  const [statusByName, setStatusByName] = useState(() =>
    Object.fromEntries(group.students.map((s) => [s.name, s.todayStatus])),
  );

  const counts = useMemo(() => countByStatus(statusByName), [statusByName]);

  const setStatus = (name, status) => setStatusByName((prev) => ({ ...prev, [name]: status }));
  const markAllPresent = () =>
    setStatusByName(Object.fromEntries(group.students.map((s) => [s.name, 'presente'])));

  return (
    <>
      <AttendanceStatCards counts={counts} />
      <AttendanceActionsBar onMarkAllPresent={markAllPresent} />

      <div className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-[#64748B]">
        <i className="ph ph-hand-tap text-[16px] text-[var(--brand)]" />
        Tocá el estado de cada estudiante: presente, ausente, tardía o justificada.
      </div>

      <AttendanceList students={group.students} statusByName={statusByName} onSetStatus={setStatus} />

      <button
        type="button"
        className="press mt-[18px] flex w-full items-center justify-center gap-2 rounded-2xl bg-[#16A34A] py-[15px] text-[15px] font-extrabold text-white shadow-[0_12px_26px_-12px_rgba(22,163,74,0.55)]"
      >
        <i className="ph-fill ph-check-circle text-[18px]" />
        Guardar asistencia · {group.students.length} estudiantes
      </button>
    </>
  );
}

export default AttendanceTab;
