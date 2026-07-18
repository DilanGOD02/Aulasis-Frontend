import { Navigate } from 'react-router-dom';

// Quick shortcut (Navbar bell aside, BottomNav "Asistencia", dashboard "Asistencia rápida") —
// jumps straight to the next class's own Attendance tab instead of a separate generic screen.
function AttendancePage() {
  return <Navigate to="/grupos/1/asistencia" replace />;
}

export default AttendancePage;
