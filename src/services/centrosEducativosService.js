import { apiFetch, jsonHeaders, parseJsonOrThrow } from './apiClient';

export const centrosEducativosService = {
  async listMios() {
    const response = await apiFetch('/centros-educativos/mios');
    return parseJsonOrThrow(response);
  },

  async getOne(id) {
    const response = await apiFetch(`/centros-educativos/${id}`);
    return parseJsonOrThrow(response);
  },

  /** Catálogo de modalidades MEP (académico, técnico, CINDEA, etc.) para el combo del formulario. */
  async listTipos() {
    const response = await apiFetch('/centros-educativos/tipos');
    return parseJsonOrThrow(response);
  },

  async create(payload) {
    const response = await apiFetch('/centros-educativos', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
    return parseJsonOrThrow(response);
  },

  async update(id, payload) {
    const response = await apiFetch(`/centros-educativos/${id}`, {
      method: 'PUT',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
    return parseJsonOrThrow(response);
  },

  async remove(id) {
    const response = await apiFetch(`/centros-educativos/${id}`, { method: 'DELETE' });
    return parseJsonOrThrow(response);
  },

  async addProfesor(id, email) {
    const response = await apiFetch(`/centros-educativos/${id}/profesores`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ email }),
    });
    return parseJsonOrThrow(response);
  },
};
