import { apiFetch, jsonHeaders, parseJsonOrThrow } from './apiClient';

export const estudiantesService = {
  async buscarPorCedula(cedula) {
    const response = await apiFetch(`/estudiantes/buscar?cedula=${encodeURIComponent(cedula)}`);
    return parseJsonOrThrow(response);
  },

  async matricular(grupoId, payload) {
    const response = await apiFetch(`/grupos/${grupoId}/estudiantes`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
    return parseJsonOrThrow(response);
  },

  async getPerfil(grupoId, matriculaId, periodo) {
    const query = periodo ? `?periodo=${periodo}` : '';
    const response = await apiFetch(`/grupos/${grupoId}/estudiantes/${matriculaId}${query}`);
    return parseJsonOrThrow(response);
  },

  /** Importa una lista de estudiantes desde un PDF o Excel (.xlsx) (nombre + cédula) y los matricula en el grupo. */
  async importarLista(grupoId, file) {
    const formData = new FormData();
    formData.append('file', file);
    // Sin Content-Type manual: el navegador arma el multipart/form-data con su boundary.
    const response = await apiFetch(`/grupos/${grupoId}/estudiantes/importar`, {
      method: 'POST',
      body: formData,
    });
    return parseJsonOrThrow(response);
  },

  /** Saca al estudiante de este grupo (baja lógica, no borra su historial). */
  async eliminar(grupoId, matriculaId) {
    const response = await apiFetch(`/grupos/${grupoId}/estudiantes/${matriculaId}`, {
      method: 'DELETE',
    });
    return parseJsonOrThrow(response);
  },

  /** Edita los datos del estudiante (nombre/apellidos/cédula/teléfono del encargado). */
  async editar(grupoId, matriculaId, payload) {
    const response = await apiFetch(`/grupos/${grupoId}/estudiantes/${matriculaId}`, {
      method: 'PATCH',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
    return parseJsonOrThrow(response);
  },

  /** Traslada la matrícula del estudiante a otro grupo. */
  async trasladar(grupoId, matriculaId, grupoDestinoId) {
    const response = await apiFetch(`/grupos/${grupoId}/estudiantes/${matriculaId}/trasladar`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ grupoDestinoId }),
    });
    return parseJsonOrThrow(response);
  },
};
