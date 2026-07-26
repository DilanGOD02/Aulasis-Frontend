import { apiFetch, jsonHeaders, parseJsonOrThrow } from './apiClient';

export const riesgoService = {
  /** Sin `centroEducativoId`: todos los grupos del profesor. Con él: solo los de ese centro. */
  async listar(centroEducativoId) {
    const query = centroEducativoId ? `?centroEducativoId=${centroEducativoId}` : '';
    const response = await apiFetch(`/riesgo${query}`);
    return parseJsonOrThrow(response);
  },

  /** Envío MANUAL (botón del profesor): informe de riesgo al correo del encargado. */
  async enviarInforme(matriculaId) {
    const response = await apiFetch('/riesgo/enviar-informe', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ matriculaId }),
    });
    return parseJsonOrThrow(response);
  },
};
