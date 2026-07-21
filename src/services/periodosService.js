import { apiFetch, jsonHeaders, parseJsonOrThrow } from './apiClient';

export const periodosService = {
  /** Periodos "del sistema" (globales) + los privados de grupoId, si se pasa. */
  async listDisponibles(grupoId) {
    const query = grupoId ? `?grupoId=${grupoId}` : '';
    const response = await apiFetch(`/periodos${query}`);
    return parseJsonOrThrow(response);
  },

  /** Periodos asociados a un grupo puntual (con las fechas propias de ese grupo). */
  async listParaGrupo(grupoId) {
    const response = await apiFetch(`/grupos/${grupoId}/periodos`);
    return parseJsonOrThrow(response);
  },

  /** Asocia (o actualiza las fechas de) un periodo del sistema a un grupo. */
  async asociarAGrupo(grupoId, payload) {
    const response = await apiFetch(`/grupos/${grupoId}/periodos`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
    return parseJsonOrThrow(response);
  },

  /** Crea un periodo nuevo PRIVADO de este grupo (no le sale a otros profesores) y lo asocia. */
  async crearPrivadoParaGrupo(grupoId, payload) {
    const response = await apiFetch(`/grupos/${grupoId}/periodos/nuevo`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
    return parseJsonOrThrow(response);
  },

  /** Quita un periodo de un grupo (no borra el periodo de la institución). */
  async desasociarDeGrupo(grupoId, periodoLectivoId) {
    const response = await apiFetch(`/grupos/${grupoId}/periodos/${periodoLectivoId}`, {
      method: 'DELETE',
    });
    return parseJsonOrThrow(response);
  },
};
