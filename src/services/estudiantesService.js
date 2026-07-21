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

  /** Importa una lista de estudiantes desde un PDF (nombre + cédula) y los matricula en el grupo. */
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
};
