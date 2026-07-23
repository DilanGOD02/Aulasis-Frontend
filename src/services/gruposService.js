import { apiFetch, jsonHeaders, parseJsonOrThrow } from './apiClient';

export const gruposService = {
  async list() {
    const response = await apiFetch('/grupos');
    return parseJsonOrThrow(response);
  },

  async getOne(id, periodo) {
    const query = periodo ? `?periodo=${periodo}` : '';
    const response = await apiFetch(`/grupos/${id}${query}`);
    return parseJsonOrThrow(response);
  },

  async create(payload) {
    const response = await apiFetch('/grupos', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
    return parseJsonOrThrow(response);
  },

  async update(id, payload) {
    const response = await apiFetch(`/grupos/${id}`, {
      method: 'PUT',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
    return parseJsonOrThrow(response);
  },

  async remove(id) {
    const response = await apiFetch(`/grupos/${id}`, { method: 'DELETE' });
    return parseJsonOrThrow(response);
  },

  /** Refresca los promedios/estados cacheados de todos los grupos — no toca notas ni asistencia reales. */
  async recalcularTodo() {
    const response = await apiFetch('/grupos/recalcular-todo', { method: 'POST' });
    return parseJsonOrThrow(response);
  },

  /** Igual que recalcularTodo pero para un solo grupo — más rápido, se usa desde la vista del grupo. */
  async recalcularGrupo(id) {
    const response = await apiFetch(`/grupos/${id}/recalcular`, { method: 'POST' });
    return parseJsonOrThrow(response);
  },
};
