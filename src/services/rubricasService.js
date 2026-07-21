import { apiFetch, jsonHeaders, parseJsonOrThrow } from './apiClient';

export const rubricasService = {
  /** Rúbrica ya guardada para un ítem, o null si no tiene.
   * Cuando no existe, el backend responde con el cuerpo vacío (Nest no serializa
   * un `null` de controlador como el literal JSON "null") — parseJsonOrThrow lo
   * recibe como `{}`, así que acá se normaliza a null revisando el id real. */
  async getPorItem(itemId) {
    const response = await apiFetch(`/esquemas/items/${itemId}/rubrica`);
    const data = await parseJsonOrThrow(response);
    return data?.id ? data : null;
  },

  /** Crea o actualiza la rúbrica de un ítem: { nombre?, niveles: [{id?,valor,etiqueta}], indicadores: [{id?,texto,celdas:[{nivelValor,descripcion}]}] }. */
  async guardar(itemId, payload) {
    const response = await apiFetch(`/esquemas/items/${itemId}/rubrica`, {
      method: 'PUT',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
    return parseJsonOrThrow(response);
  },

  async eliminar(itemId) {
    const response = await apiFetch(`/esquemas/items/${itemId}/rubrica`, { method: 'DELETE' });
    return parseJsonOrThrow(response);
  },

  /** Sube un PDF con una rúbrica ya hecha — devuelve un borrador {niveles, indicadores} para revisar, no guarda nada. */
  async extraerDeArchivo(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiFetch('/esquemas/items/rubrica/extraer', {
      method: 'POST',
      body: formData,
    });
    return parseJsonOrThrow(response);
  },

  /** La rúbrica + lo que ya calificó (si algo) un estudiante puntual, en un periodo. */
  async getEvaluacionEstudiante(grupoId, matriculaId, itemId, periodoLectivoId) {
    const response = await apiFetch(
      `/grupos/${grupoId}/estudiantes/${matriculaId}/rubricas/${itemId}?periodo=${periodoLectivoId}`,
    );
    return parseJsonOrThrow(response);
  },

  /** Guarda la calificación por indicador + observación de un estudiante, y aplica la nota resultante al ítem. */
  async evaluarEstudiante(grupoId, matriculaId, itemId, payload) {
    const response = await apiFetch(`/grupos/${grupoId}/estudiantes/${matriculaId}/rubricas/${itemId}`, {
      method: 'PUT',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
    return parseJsonOrThrow(response);
  },
};
