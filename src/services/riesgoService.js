import { apiFetch, parseJsonOrThrow } from './apiClient';

export const riesgoService = {
  /** Sin `centroEducativoId`: todos los grupos del profesor. Con él: solo los de ese centro. */
  async listar(centroEducativoId) {
    const query = centroEducativoId ? `?centroEducativoId=${centroEducativoId}` : '';
    const response = await apiFetch(`/riesgo${query}`);
    return parseJsonOrThrow(response);
  },
};
