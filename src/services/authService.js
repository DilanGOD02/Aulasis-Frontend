import { apiBaseUrl, apiFetch, jsonHeaders, parseJsonOrThrow, refreshSession, setAccessToken } from './apiClient';
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
      credentials: 'include',
      headers: { ...jsonHeaders(), 'x-tenant-slug': getTenantSlug() },
      body: JSON.stringify({ email, password }),
    });
    const data = await parseJsonOrThrow(response); // { accessToken, user }
    setAccessToken(data.accessToken);
    return data;
  },

  /**
   * Recupera sesión vía la cookie httpOnly (sin tocar localStorage). Usa la
   * misma promesa compartida que apiClient — si dos llamadas concurrentes
   * (ej. el doble efecto de StrictMode) piden refresh a la vez, comparten UNA
   * sola petición en vez de que la segunda invalide el token que la primera
   * ya rotó.
   */
  async refresh() {
    return refreshSession();
  },

  async logout() {
    await fetch(`${apiBaseUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'x-tenant-slug': getTenantSlug() },
    }).catch(() => {});
    setAccessToken(null);
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
};
