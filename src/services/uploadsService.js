import { apiFetch, parseJsonOrThrow } from './apiClient';

export const uploadsService = {
  /**
   * Sube una imagen (escudo de centro o logo de grupo). NO se pasa un
   * Content-Type a mano: apiFetch solo agrega x-tenant-slug/Authorization
   * por su cuenta, así que dejando `headers` sin definir el navegador arma
   * el `multipart/form-data; boundary=...` correcto solo.
   */
  /**
   * `entidadId` (opcional): si ya existe el centro/grupo que se está
   * editando, el backend guarda la imagen con una key fija para esa
   * entidad y SOBRESCRIBE el archivo anterior en vez de dejarlo huérfano.
   * Al crear algo nuevo (sin id todavía) se omite y cada intento sube un
   * archivo con nombre único.
   */
  async subirImagen(file, tipo, entidadId) {
    const formData = new FormData();
    formData.append('archivo', file);
    const query = entidadId ? `?tipo=${tipo}&entidadId=${entidadId}` : `?tipo=${tipo}`;
    const response = await apiFetch(`/uploads/imagen${query}`, {
      method: 'POST',
      body: formData,
    });
    return parseJsonOrThrow(response);
  },
};
