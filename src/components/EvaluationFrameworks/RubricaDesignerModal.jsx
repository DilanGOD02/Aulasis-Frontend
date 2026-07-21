import { useEffect, useRef, useState } from 'react';
import { rubricasService } from '../../services/rubricasService';

const ESCALA_POR_DEFECTO = [
  { valor: 0, etiqueta: 'No responde' },
  { valor: 1, etiqueta: 'Nivel Inicial' },
  { valor: 2, etiqueta: 'Nivel Intermedio' },
  { valor: 3, etiqueta: 'Nivel Avanzado' },
];

function indicadorVacio() {
  return { id: undefined, texto: '', celdasPorNivel: {} };
}

/** Convierte lo que devuelve el backend (o el borrador extraído de un PDF) al estado editable del diseñador. */
function aEstado(detalle) {
  const niveles = (detalle?.niveles?.length ? detalle.niveles : ESCALA_POR_DEFECTO).map((n) => ({ ...n }));
  const indicadores = detalle?.indicadores?.length
    ? detalle.indicadores.map((ind) => ({
        id: ind.id,
        texto: ind.texto,
        celdasPorNivel: Object.fromEntries((ind.celdas ?? []).map((c) => [c.nivelValor, c.descripcion ?? ''])),
      }))
    : [indicadorVacio()];
  return { nombre: detalle?.nombre ?? '', niveles, indicadores };
}

/**
 * Diseñador de rúbrica para un ítem del esquema: filas = indicadores, columnas =
 * niveles de la escala. Se abre desde el "papelito" de cada ítem en el editor
 * de esquemas. Permite armarla a mano o subir un archivo (PDF) para precargarla
 * — en ambos casos el profesor revisa/corrige acá antes de guardar.
 */
function RubricaDesignerModal({ itemId, itemNombre, onClose, onSaved }) {
  const [estado, setEstado] = useState(null); // null = cargando
  const [existia, setExistia] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    rubricasService
      .getPorItem(itemId)
      .then((detalle) => {
        setExistia(!!detalle);
        setEstado(aEstado(detalle));
      })
      .catch((err) => setError(err.message));
  }, [itemId]);

  if (!estado) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="rounded-2xl bg-white px-6 py-5 text-[13.5px] font-semibold text-[#94A3B8]">
          {error || 'Cargando…'}
        </div>
      </div>
    );
  }

  const setNombre = (nombre) => setEstado((prev) => ({ ...prev, nombre }));

  const agregarNivel = () => {
    const siguienteValor = estado.niveles.length
      ? Math.max(...estado.niveles.map((n) => n.valor)) + 1
      : 0;
    setEstado((prev) => ({ ...prev, niveles: [...prev.niveles, { valor: siguienteValor, etiqueta: '' }] }));
  };
  const quitarNivel = (valor) =>
    setEstado((prev) => ({
      ...prev,
      niveles: prev.niveles.filter((n) => n.valor !== valor),
      indicadores: prev.indicadores.map((ind) => {
        const resto = { ...ind.celdasPorNivel };
        delete resto[valor];
        return { ...ind, celdasPorNivel: resto };
      }),
    }));
  const setNivel = (valorActual, patch) =>
    setEstado((prev) => ({
      ...prev,
      niveles: prev.niveles.map((n) => (n.valor === valorActual ? { ...n, ...patch } : n)),
    }));

  const agregarIndicador = () =>
    setEstado((prev) => ({ ...prev, indicadores: [...prev.indicadores, indicadorVacio()] }));
  const quitarIndicador = (idx) =>
    setEstado((prev) => ({ ...prev, indicadores: prev.indicadores.filter((_, i) => i !== idx) }));
  const setIndicadorTexto = (idx, texto) =>
    setEstado((prev) => ({
      ...prev,
      indicadores: prev.indicadores.map((ind, i) => (i === idx ? { ...ind, texto } : ind)),
    }));
  const setCelda = (idx, nivelValor, descripcion) =>
    setEstado((prev) => ({
      ...prev,
      indicadores: prev.indicadores.map((ind, i) =>
        i === idx ? { ...ind, celdasPorNivel: { ...ind.celdasPorNivel, [nivelValor]: descripcion } } : ind,
      ),
    }));

  const handleSubirArchivo = () => fileInputRef.current?.click();
  const handleArchivoSeleccionado = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setIsImporting(true);
    try {
      const borrador = await rubricasService.extraerDeArchivo(file);
      if (!borrador.niveles.length || !borrador.indicadores.length) {
        setError('No se pudo leer una tabla clara en ese archivo — armá la rúbrica a mano abajo.');
        return;
      }
      setEstado((prev) => ({ ...aEstado(borrador), nombre: prev.nombre }));
    } catch (err) {
      console.error('Error al leer el archivo de rúbrica', err);
      setError(
        err instanceof TypeError
          ? 'No se pudo conectar con el servidor — revisá que el backend esté corriendo.'
          : err.message || 'No se pudo leer el archivo, intenta de nuevo.',
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleGuardar = async () => {
    setError('');
    setIsSaving(true);
    try {
      const payload = {
        nombre: estado.nombre || undefined,
        niveles: estado.niveles.map((n) => ({ id: n.id, valor: Number(n.valor), etiqueta: n.etiqueta })),
        indicadores: estado.indicadores
          .filter((ind) => ind.texto.trim())
          .map((ind) => ({
            id: ind.id,
            texto: ind.texto,
            celdas: estado.niveles.map((n) => ({
              nivelValor: Number(n.valor),
              descripcion: ind.celdasPorNivel[n.valor] ?? '',
            })),
          })),
      };
      await rubricasService.guardar(itemId, payload);
      onSaved?.(true);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEliminar = async () => {
    if (!window.confirm('¿Eliminar esta rúbrica? Las calificaciones ya hechas con ella se pierden.')) return;
    setIsSaving(true);
    try {
      await rubricasService.eliminar(itemId);
      onSaved?.(false);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-[900px] flex-col rounded-2xl bg-white shadow-[0_30px_70px_-30px_rgba(16,24,40,0.4)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#EEF1F6] px-5 py-4">
          <div>
            <div className="text-[17px] font-extrabold text-[#0F172A]">Rúbrica de evaluación</div>
            <div className="text-[12.5px] font-semibold text-[#94A3B8]">Ítem: {itemNombre}</div>
          </div>
          <button type="button" onClick={onClose} className="press flex h-8 w-8 items-center justify-center rounded-full bg-[#F1F4F8]">
            <i className="ph-bold ph-x text-[15px] text-[#64748B]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div className="min-w-[200px] flex-1">
              <label className="mb-1.5 block text-[12.5px] font-bold text-[#475569]">Nombre (opcional)</label>
              <input
                value={estado.nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Rúbrica trabajo cotidiano"
                className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-[13.5px] font-semibold text-[#1E293B] outline-none focus:border-[var(--brand)]"
              />
            </div>
            <button
              type="button"
              onClick={handleSubirArchivo}
              disabled={isImporting}
              className="press flex items-center gap-1.5 rounded-lg border border-[#E8ECF2] bg-white px-3.5 py-2 text-[13px] font-bold text-[#334155] disabled:opacity-60"
            >
              <i className="ph-bold ph-file-arrow-up text-[15px]" />
              {isImporting ? 'Leyendo…' : 'Subir archivo (PDF)'}
            </button>
            <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleArchivoSeleccionado} className="hidden" />
          </div>

          {error && (
            <div className="mb-3 rounded-[10px] bg-[#FEF2F2] px-3.5 py-2.5 text-[12.5px] font-bold text-[#DC2626]">
              {error}
            </div>
          )}
          <div className="mb-3 rounded-[10px] bg-[#EEF2FF] px-3.5 py-2.5 text-[12.5px] font-bold text-[#4338CA]">
            Si subiste un archivo, revisá que el texto de cada celda haya quedado bien antes de guardar.
          </div>

          <div className="overflow-x-auto rounded-[14px] border border-[#EEF1F6]">
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr className="bg-[#FAFBFD]">
                  <th className="min-w-[180px] border-b border-r border-[#EEF1F6] px-3 py-2 text-left font-extrabold text-[#475569]">
                    Indicadores
                  </th>
                  {estado.niveles.map((n) => (
                    <th key={n.valor} className="min-w-[160px] border-b border-r border-[#EEF1F6] px-3 py-2">
                      <div className="mb-1 flex items-center justify-center gap-1">
                        <input
                          type="number"
                          value={n.valor}
                          onChange={(e) => setNivel(n.valor, { valor: Number(e.target.value) })}
                          className="w-10 rounded border border-[#E2E8F0] px-1 py-0.5 text-center text-[12px] font-bold text-[#1E293B] outline-none"
                        />
                        <button type="button" onClick={() => quitarNivel(n.valor)} className="press text-[#CBD5E1]">
                          <i className="ph ph-x text-[12px]" />
                        </button>
                      </div>
                      <input
                        value={n.etiqueta ?? ''}
                        onChange={(e) => setNivel(n.valor, { etiqueta: e.target.value })}
                        placeholder="Etiqueta"
                        className="w-full rounded border border-[#E2E8F0] px-1.5 py-1 text-center text-[12px] font-bold text-[#334155] outline-none"
                      />
                    </th>
                  ))}
                  <th className="w-10 border-b border-[#EEF1F6]">
                    <button
                      type="button"
                      onClick={agregarNivel}
                      title="Agregar nivel"
                      className="press flex h-7 w-7 items-center justify-center rounded-full text-[var(--brand)] hover:bg-[#EEF2FF]"
                    >
                      <i className="ph-bold ph-plus text-[13px]" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {estado.indicadores.map((ind, idx) => (
                  <tr key={idx}>
                    <td className="border-b border-r border-[#EEF1F6] px-3 py-2 align-top">
                      <textarea
                        value={ind.texto}
                        onChange={(e) => setIndicadorTexto(idx, e.target.value)}
                        placeholder="Texto del indicador"
                        rows={2}
                        className="w-full resize-none rounded border border-transparent bg-transparent px-1 py-0.5 text-[12.5px] font-semibold text-[#334155] outline-none focus:border-[#E2E8F0] focus:bg-[#FAFBFD]"
                      />
                    </td>
                    {estado.niveles.map((n) => (
                      <td key={n.valor} className="border-b border-r border-[#EEF1F6] px-3 py-2 align-top">
                        <textarea
                          value={ind.celdasPorNivel[n.valor] ?? ''}
                          onChange={(e) => setCelda(idx, n.valor, e.target.value)}
                          placeholder="Descripción"
                          rows={2}
                          className="w-full resize-none rounded border border-transparent bg-transparent px-1 py-0.5 text-[12px] font-medium text-[#64748B] outline-none focus:border-[#E2E8F0] focus:bg-[#FAFBFD]"
                        />
                      </td>
                    ))}
                    <td className="border-b border-[#EEF1F6] text-center align-top">
                      <button
                        type="button"
                        onClick={() => quitarIndicador(idx)}
                        className="press mt-2 text-[#CBD5E1] hover:text-[#DC2626]"
                        aria-label="Eliminar indicador"
                      >
                        <i className="ph ph-trash text-[14px]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={agregarIndicador}
            className="press mt-2.5 flex items-center gap-1.5 text-[13px] font-bold text-[var(--brand)]"
          >
            <i className="ph-bold ph-plus text-[14px]" />
            Agregar indicador
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-[#EEF1F6] px-5 py-3.5">
          {existia ? (
            <button
              type="button"
              onClick={handleEliminar}
              disabled={isSaving}
              className="press rounded-lg px-3.5 py-2 text-[13px] font-bold text-[#DC2626] disabled:opacity-60"
            >
              Eliminar rúbrica
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="press rounded-[12px] bg-[#F1F4F8] px-4 py-2.5 text-[13.5px] font-bold text-[#475569]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleGuardar}
              disabled={isSaving || !estado.niveles.length || !estado.indicadores.some((i) => i.texto.trim())}
              className="press rounded-[12px] bg-[var(--brand)] px-4 py-2.5 text-[13.5px] font-extrabold text-white disabled:opacity-60"
            >
              {isSaving ? 'Guardando…' : 'Guardar rúbrica'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RubricaDesignerModal;
