import { ENV } from '../config/env';
import { getTenantSlug } from '../config/tenant';

export const apiBaseUrl = ENV.API_URL.replace(/\/$/, '');

// El access token vive solo en memoria: se pierde en un F5 y se recupera con
// un refresh silencioso (ver AuthContext).
let accessToken = null;
export const getAccessToken = () => accessToken;
export const setAccessToken = (token) => {
  accessToken = token;
};

// El refresh token SÍ se persiste (localStorage) para que la sesión
// sobreviva a cerrar la app/pestaña. No es una cookie httpOnly a propósito:
// frontend (Cloudflare Workers) y backend (Render) son dominios sin relación
// entre sí, así que cualquier cookie entre ellos es "de tercero" — Safari y
// Firefox la bloquean por default, y Chrome/Edge cada vez más, así que la
// sesión se perdía todo el tiempo al cerrar y reabrir. localStorage no tiene
// ese problema porque no depende de políticas de cookies cross-site.
const REFRESH_TOKEN_KEY = 'aulasis_refresh_token';
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
export const setRefreshToken = (token) => {
  if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
  else localStorage.removeItem(REFRESH_TOKEN_KEY);
};

let refreshPromise = null;

async function attemptRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No hay sesión guardada');

  const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-tenant-slug': getTenantSlug() },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    setRefreshToken(null);
    throw new Error('Refresh failed');
  }

  const data = await response.json();
  setAccessToken(data.accessToken);
  setRefreshToken(data.refreshToken); // rota en cada uso — hay que guardar el nuevo
  return data;
}

/**
 * Punto único de refresh — compartido por AuthContext (refresh al montar) y
 * por el retry-en-401 de abajo. El refresh token rota en cada uso (una sola
 * sesión activa), así que dos llamadas concurrentes (ej. el doble efecto de
 * React.StrictMode en dev) no pueden ir cada una por su lado: la segunda
 * invalidaría el token que la primera ya rotó. Todas comparten esta misma
 * promesa en vuelo.
 */
export function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = attemptRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/**
 * Wrapper de fetch con renovación automática de sesión.
 * Agrega Authorization, x-tenant-slug y la cookie httpOnly automáticamente.
 *
 * Si el backend responde 401:
 *   1. Intenta renovar contra POST /auth/refresh (una sola promesa compartida)
 *   2. Si renueva, reintenta el request original con el nuevo access token
 *   3. Si falla, dispara "aulasis:session-expired" para que AuthContext haga logout
 */
export async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${apiBaseUrl}${path}`;

  const buildHeaders = (token) => ({
    ...options.headers,
    'x-tenant-slug': getTenantSlug(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  const doRequest = (token) =>
    fetch(url, { ...options, credentials: 'include', headers: buildHeaders(token) });

  const response = await doRequest(getAccessToken());
  if (response.status !== 401) return response;

  try {
    const { accessToken: newToken } = await refreshSession();
    return doRequest(newToken);
  } catch {
    setAccessToken(null);
    window.dispatchEvent(new CustomEvent('aulasis:session-expired'));
    return response;
  }
}

export const jsonHeaders = () => ({ 'Content-Type': 'application/json' });

/** Parsea la respuesta o lanza un Error con el mensaje del backend (soporta el array de class-validator). */
export async function parseJsonOrThrow(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = Array.isArray(data.message) ? data.message.join('. ') : data.message;
    throw new Error(message || 'Ocurrió un error, intenta de nuevo');
  }
  return data;
}
