import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Al montar, intenta recuperar la sesión con la cookie httpOnly del
  // refresh token — el access token nunca se persiste, así que un F5
  // depende de este refresh silencioso en vez de leer localStorage.
  useEffect(() => {
    authService
      .refresh()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  // apiClient dispara esto cuando un refresh en segundo plano falla
  // (sesión expirada/revocada) mientras se navega la app.
  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      navigate('/login', { state: { sessionExpired: true } });
    };
    window.addEventListener('aulasis:session-expired', handleExpired);
    return () => window.removeEventListener('aulasis:session-expired', handleExpired);
  }, [navigate]);

  const login = async (email, password, redirectTo) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    navigate(redirectTo ?? '/inicio', { replace: true });
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
