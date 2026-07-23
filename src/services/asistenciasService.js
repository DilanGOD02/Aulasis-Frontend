import { apiFetch, jsonHeaders, parseJsonOrThrow } from './apiClient';

export const asistenciasService = {
  /** Guarda bulk: { grupoId, fecha, entradas: [{grupoEstudianteId, estado, justificada, horaLlegada}] }. */
  async guardar(payload) {
    const response = await apiFetch('/asistencias', {
      method: 'PUT',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
    return parseJsonOrThrow(response);
  },

  /** Asistencia ya guardada para una fecha puntual (para editar cualquier día). */
  async porFecha(grupoId, fecha) {
    const response = await apiFetch(`/grupos/${grupoId}/asistencias?fecha=${fecha}`);
    return parseJsonOrThrow(response);
  },

  /** Historial de fechas con asistencia tomada, con desglose por estudiante. Filtrable por periodo. */
  async historial(grupoId, periodoId) {
    const query = periodoId ? `?periodo=${periodoId}` : '';
    const response = await apiFetch(`/grupos/${grupoId}/asistencias/historial${query}`);
    return parseJsonOrThrow(response);
  },

  /** Borra toda la asistencia tomada en una fecha para el grupo. */
  async eliminarFecha(grupoId, fecha) {
    const response = await apiFetch(`/grupos/${grupoId}/asistencias?fecha=${fecha}`, {
      method: 'DELETE',
    });
    return parseJsonOrThrow(response);
  },
};
