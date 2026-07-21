import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';

// Quick shortcut (Navbar bell aside, BottomNav "Asistencia", dashboard "Asistencia rápida") —
// jumps straight to the next class's own Attendance tab instead of a separate generic screen.
function AttendancePage() {
  const [groupId, setGroupId] = useState(undefined);

  useEffect(() => {
    dashboardService
      .getResumen()
      .then((data) => setGroupId(data.nextClass?.groupId ?? null))
      .catch(() => setGroupId(null));
  }, []);

  if (groupId === undefined) return null;
  return <Navigate to={groupId ? `/grupos/${groupId}/asistencia` : '/inicio'} replace />;
}

export default AttendancePage;
