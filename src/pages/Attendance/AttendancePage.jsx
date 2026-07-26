import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { gruposService } from '../../services/gruposService';

// Quick shortcut (Navbar bell aside, BottomNav "Asistencia", dashboard "Asistencia rápida") —
// jumps straight to the next class's own Attendance tab instead of a separate generic screen.
// El dashboard no informa el centroEducativoId del próximo grupo, así que se resuelve con
// un segundo fetch a /grupos/:id (que sí lo trae) antes de armar la ruta anidada bajo /inicio/:centroId.
function AttendancePage() {
  const [target, setTarget] = useState(undefined); // undefined = cargando, null = sin próxima clase

  useEffect(() => {
    dashboardService
      .getResumen()
      .then((data) => {
        const groupId = data.nextClass?.groupId;
        if (!groupId) return setTarget(null);
        return gruposService
          .getOne(groupId)
          .then((grupo) => setTarget(grupo.centroEducativoId ? { groupId, centroId: grupo.centroEducativoId } : null))
          .catch(() => setTarget(null));
      })
      .catch(() => setTarget(null));
  }, []);

  if (target === undefined) return null;
  return <Navigate to={target ? `/inicio/${target.centroId}/grupos/${target.groupId}/asistencia` : '/inicio'} replace />;
}

export default AttendancePage;
