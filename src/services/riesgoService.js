import { apiFetch, parseJsonOrThrow } from './apiClient';

export const riesgoService = {
  async listar() {
    const response = await apiFetch('/riesgo');
    return parseJsonOrThrow(response);
  },
};
