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
};
