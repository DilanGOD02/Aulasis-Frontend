import { apiFetch, jsonHeaders, parseJsonOrThrow } from './apiClient';

export const esquemasService = {
  async list() {
    const response = await apiFetch('/esquemas');
    return parseJsonOrThrow(response);
  },

  async getOne(id) {
    const response = await apiFetch(`/esquemas/${id}`);
    return parseJsonOrThrow(response);
  },

  async create(payload) {
    const response = await apiFetch('/esquemas', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
    return parseJsonOrThrow(response);
  },

  async update(id, payload) {
    const response = await apiFetch(`/esquemas/${id}`, {
      method: 'PUT',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
    return parseJsonOrThrow(response);
  },

  async remove(id) {
    const response = await apiFetch(`/esquemas/${id}`, { method: 'DELETE' });
    return parseJsonOrThrow(response);
  },
};
