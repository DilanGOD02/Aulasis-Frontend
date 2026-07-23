import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from './AppLayout';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import PlansInfoPage from '../pages/Auth/PlansInfoPage';
import ForgotPasswordPage from '../pages/Auth/ForgotPasswordPage';
import MainScreen from '../pages/MainScreen/MainScreen';
import EvaluationFrameworksPage from '../pages/EvaluationFrameworks/EvaluationFrameworksPage';
import TemplateBuilderPage from '../pages/EvaluationFrameworks/TemplateBuilderPage';
import RiskAlertPage from '../pages/RiskAlert/RiskAlertPage';
import AttendancePage from '../pages/Attendance/AttendancePage';
import GroupsDetailsPage from '../pages/Groups/GroupsDetailsPage';
import CreateGroupPage from '../pages/Groups/CreateGroupPage';
import EditGroupPage from '../pages/Groups/EditGroupPage';
import StudentProfilePage from '../pages/Groups/StudentProfilePage';
import SummaryTab from '../pages/Groups/tabs/SummaryTab';
import StudentsTab from '../pages/Groups/tabs/StudentsTab';
import GradesTab from '../pages/Groups/tabs/GradesTab';
import AttendanceTab from '../pages/Groups/tabs/AttendanceTab';
import EvaluationFrameworkTab from '../pages/Groups/tabs/EvaluationFrameworkTab';
import AdminTeachersPage from '../pages/Admin/AdminTeachersPage';
import AdminRoute from './AdminRoute';

function AppRouter() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Sin AppLayout a propósito: estas pantallas no llevan Navbar/BottomNav (aún no hay sesión).
              "/" ES la pantalla de login — es la primera vista del proyecto. */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<PlansInfoPage />} />
          <Route path="/registro/crear" element={<RegisterPage />} />
          <Route path="/olvide-contrasena" element={<ForgotPasswordPage />} />

          {/* Sin index a propósito: AppLayout no debe renderizar nada para el "/" bare —
              esa ruta ya la gana el <Route path="/" element={<LoginPage/>}/> de arriba. */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppLayout />}>
              <Route path="inicio" element={<MainScreen />} />
              <Route path="esquemas" element={<EvaluationFrameworksPage />} />
              <Route path="esquemas/:templateId" element={<TemplateBuilderPage />} />
              <Route path="alertas" element={<RiskAlertPage />} />
              <Route path="asistencia" element={<AttendancePage />} />

              <Route element={<AdminRoute />}>
                <Route path="admin/profesores" element={<AdminTeachersPage />} />
              </Route>

              {/* Static "crear" is more specific than :groupId, so it always wins the match. */}
              <Route path="grupos/crear" element={<CreateGroupPage />} />
              {/* Sibling to the tab tree below (not nested) — editar/estudiantes/:studentId have
                  their own plain header, not the group's gradient banner + Resumen/... tabs. */}
              <Route path="grupos/:groupId/editar" element={<EditGroupPage />} />
              <Route path="grupos/:groupId/estudiantes/:studentId" element={<StudentProfilePage />} />
              <Route path="grupos/:groupId" element={<GroupsDetailsPage />}>
                <Route index element={<SummaryTab />} />
                <Route path="estudiantes" element={<StudentsTab />} />
                <Route path="notas" element={<GradesTab />} />
                <Route path="asistencia" element={<AttendanceTab />} />
                <Route path="esquema" element={<EvaluationFrameworkTab />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default AppRouter;
