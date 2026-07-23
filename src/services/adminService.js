import { apiFetch, jsonHeaders, parseJsonOrThrow } from './apiClient';

export const adminService = {
  async listarProfesores() {
    const response = await apiFetch('/admin/profesores');
    return parseJsonOrThrow(response);
  },

  async activarPlan(profesorId, plan) {
    const response = await apiFetch(`/admin/profesores/${profesorId}/activar`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ plan }),
    });
    return parseJsonOrThrow(response);
  },

  async desactivarCuenta(profesorId) {
    const response = await apiFetch(`/admin/profesores/${profesorId}/desactivar`, { method: 'POST' });
    return parseJsonOrThrow(response);
  },
};
