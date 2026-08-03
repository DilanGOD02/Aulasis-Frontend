import {
  apiBaseUrl,
  apiFetch,
  jsonHeaders,
  parseJsonOrThrow,
  refreshSession,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
} from './apiClient';
import { getTenantSlug } from '../config/tenant';

export const authService = {
  async register(nombre, email, password, telefono, etiqueta) {
    const response = await fetch(`${apiBaseUrl}/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: { ...jsonHeaders(), 'x-tenant-slug': getTenantSlug() },
      body: JSON.stringify({ nombre, email, password, telefono, etiqueta: etiqueta || undefined }),
    });
    return parseJsonOrThrow(response);
  },

  async login(email, password) {
    const response = await fetch(`${apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: { ...jsonHeaders(), 'x-tenant-slug': getTenantSlug() },
      body: JSON.stringify({ email, password }),
    });
    const data = await parseJsonOrThrow(response); // { accessToken, refreshToken, user }
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    return data;
  },

  /**
   * Recupera sesión con el refresh token guardado en localStorage. Usa la
   * misma promesa compartida que apiClient — si dos llamadas concurrentes
   * (ej. el doble efecto de StrictMode) piden refresh a la vez, comparten UNA
   * sola petición en vez de que la segunda invalide el token que la primera
   * ya rotó.
   */
  async refresh() {
    return refreshSession();
  },

  async logout() {
    const refreshToken = getRefreshToken();
    await fetch(`${apiBaseUrl}/auth/logout`, {
      method: 'POST',
      headers: { ...jsonHeaders(), 'x-tenant-slug': getTenantSlug() },
      body: JSON.stringify({ refreshToken: refreshToken || undefined }),
    }).catch(() => {});
    setAccessToken(null);
    setRefreshToken(null);
  },

  async forgotPassword(email) {
    const response = await fetch(`${apiBaseUrl}/auth/forgot-password`, {
      method: 'POST',
      credentials: 'include',
      headers: { ...jsonHeaders(), 'x-tenant-slug': getTenantSlug() },
      body: JSON.stringify({ email }),
    });
    return parseJsonOrThrow(response);
  },

  async resetPassword(email, code, newPassword) {
    const response = await fetch(`${apiBaseUrl}/auth/reset-password`, {
      method: 'POST',
      credentials: 'include',
      headers: { ...jsonHeaders(), 'x-tenant-slug': getTenantSlug() },
      body: JSON.stringify({ email, code, newPassword }),
    });
    return parseJsonOrThrow(response);
  },

  async listInstituciones() {
    const response = await fetch(`${apiBaseUrl}/instituciones`);
    return parseJsonOrThrow(response);
  },

  /** Ejemplo de llamada autenticada de aquí en adelante: usa apiFetch. */
  async me() {
    const response = await apiFetch('/auth/me');
    return parseJsonOrThrow(response);
  },

  /** Precios y datos de pago (SINPE/PayPal) para la pantalla de renovación — pública. */
  async planes() {
    const response = await fetch(`${apiBaseUrl}/auth/planes`, {
      headers: { 'x-tenant-slug': getTenantSlug() },
    });
    return parseJsonOrThrow(response);
  },
};
