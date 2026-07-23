import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Anida dentro de ProtectedRoute — además de tener sesión, exige esAdmin. */
function AdminRoute() {
  const { user } = useAuth();

  if (!user?.esAdmin) {
    return <Navigate to="/inicio" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
