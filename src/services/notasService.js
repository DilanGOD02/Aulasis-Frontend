import { apiFetch, jsonHeaders, parseJsonOrThrow } from './apiClient';

export const notasService = {
  /** Autosave de una celda: { grupoEstudianteId, itemEvaluacionId, valorObtenido }. */
  async upsert(payload) {
    const response = await apiFetch('/notas', {
      method: 'PATCH',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
    return parseJsonOrThrow(response);
  },
};
