import { apiFetch, parseJsonOrThrow } from './apiClient';

export const dashboardService = {
  /** Sin `centroEducativoId`: resumen de todos los grupos del profesor. Con él: solo los de ese centro. */
  async getResumen(centroEducativoId) {
    const query = centroEducativoId ? `?centroEducativoId=${centroEducativoId}` : '';
    const response = await apiFetch(`/dashboard${query}`);
    return parseJsonOrThrow(response);
  },
};
