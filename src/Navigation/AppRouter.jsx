import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './AppLayout';
import MainScreen from '../pages/MainScreen/MainScreen';
import EvaluationFrameworksPage from '../pages/EvaluationFrameworks/EvaluationFrameworksPage';
import TemplateBuilderPage from '../pages/EvaluationFrameworks/TemplateBuilderPage';
import RiskAlertPage from '../pages/RiskAlert/RiskAlertPage';
import AttendancePage from '../pages/Attendance/AttendancePage';
import GroupsDetailsPage from '../pages/Groups/GroupsDetailsPage';
import CreateGroupPage from '../pages/Groups/CreateGroupPage';
import StudentProfilePage from '../pages/Groups/StudentProfilePage';
import SummaryTab from '../pages/Groups/tabs/SummaryTab';
import StudentsTab from '../pages/Groups/tabs/StudentsTab';
import GradesTab from '../pages/Groups/tabs/GradesTab';
import AttendanceTab from '../pages/Groups/tabs/AttendanceTab';
import EvaluationFrameworkTab from '../pages/Groups/tabs/EvaluationFrameworkTab';

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<MainScreen />} />
          <Route path="esquemas" element={<EvaluationFrameworksPage />} />
          <Route path="esquemas/:templateId" element={<TemplateBuilderPage />} />
          <Route path="alertas" element={<RiskAlertPage />} />
          <Route path="asistencia" element={<AttendancePage />} />

          {/* Static "crear" is more specific than :groupId, so it always wins the match. */}
          <Route path="grupos/crear" element={<CreateGroupPage />} />
          {/* Sibling to the tab tree below (not nested) — the profile has its own plain
              header, not the group's gradient banner + Resumen/Estudiantes/... tabs. */}
          <Route path="grupos/:groupId/estudiantes/:studentId" element={<StudentProfilePage />} />
          <Route path="grupos/:groupId" element={<GroupsDetailsPage />}>
            <Route index element={<SummaryTab />} />
            <Route path="estudiantes" element={<StudentsTab />} />
            <Route path="notas" element={<GradesTab />} />
            <Route path="asistencia" element={<AttendanceTab />} />
            <Route path="esquema" element={<EvaluationFrameworkTab />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
