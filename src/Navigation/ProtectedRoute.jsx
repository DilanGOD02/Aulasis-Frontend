import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RenewalScreen from '../pages/Auth/RenewalScreen';

/** Bloquea el árbol de rutas de AppLayout hasta confirmar sesión activa y con la suscripción vigente. */
function ProtectedRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#E9EDF3]" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Prueba gratis o plan vencidos: reemplaza toda la app hasta que renueve
  // (el admin siempre pasa, ver estadoCuenta() en el backend).
  if (!user.cuentaActiva) {
    return <RenewalScreen user={user} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
