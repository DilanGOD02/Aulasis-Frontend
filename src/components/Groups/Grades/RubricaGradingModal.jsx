import { useEffect, useState } from 'react';
import { rubricasService } from '../../../services/rubricasService';
import { exportRubricaPdf } from '../../../utils/exportRubrica';
import { useToast } from '../../../context/ToastContext';

/**
 * Se abre desde el iconito de un ítem con rúbrica en la grilla de Notas.
 * El profesor elige el nivel que sacó el estudiante en cada indicador y puede
 * dejar una observación libre. Al guardar, el backend calcula la nota del
 * ítem (proporcional al valor máximo) y actualiza el promedio del grupo.
 */
function RubricaGradingModal({
  group,
  grupoId,
  matriculaId,
  itemId,
  itemName,
  itemValorMaximo,
  periodoLectivoId,
  studentName,
  onClose,
  onSaved,
}) {
  const { showToast } = useToast();
  const [rubrica, setRubrica] = useState(null); // null = cargando
  const [calificaciones, setCalificaciones] = useState({}); // { [indicadorId]: nivelValor }
  const [observacion, setObservacion] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!periodoLectivoId) return;
    rubricasService
      .getEvaluacionEstudiante(grupoId, matriculaId, itemId, periodoLectivoId)
      .then((data) => {
        setRubrica(data);
        setCalificaciones(Object.fromEntries((data.calificaciones ?? []).map((c) => [c.indicadorId, c.nivelValor])));
        setObservacion(data.observacion ?? '');
      })
      .catch((err) => {
        console.error('Error al cargar la rúbrica del estudiante', err);
        setError(
          err instanceof TypeError
            ? 'No se pudo conectar con el servidor — revisá que el backend esté corriendo.'
            : err.message || 'No se pudo cargar la rúbrica.',
        );
      });
  }, [grupoId, matriculaId, itemId, periodoLectivoId]);

  const elegirNivel = (indicadorId, nivelValor) =>
    setCalificaciones((prev) => ({ ...prev, [indicadorId]: nivelValor }));

  const todosCalificados = rubrica?.indicadores.every((ind) => calificaciones[ind.id] !== undefined);

  const handleExportarPdf = () => {
    exportRubricaPdf({ group, studentName, itemName, itemValorMaximo, rubrica, calificaciones, observacion });
  };

  const handleGuardar = async () => {
    setError('');
    setIsSaving(true);
    try {
      await rubricasService.evaluarEstudiante(grupoId, matriculaId, itemId, {
        periodoLectivoId,
        calificaciones: Object.entries(calificaciones).map(([indicadorId, nivelValor]) => ({
          indicadorId: Number(indicadorId),
          nivelValor,
        })),
        observacion,
      });
      onSaved?.();
      showToast('Evaluación guardada');
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
        className="flex max-h-[85vh] w-full max-w-[880px] flex-col rounded-2xl bg-white shadow-[0_30px_70px_-30px_rgba(16,24,40,0.4)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#EEF1F6] px-5 py-4">
          <div>
            <div className="text-[17px] font-extrabold text-[#0F172A]">Evaluar con rúbrica</div>
            <div className="text-[12.5px] font-semibold text-[#94A3B8]">{studentName}</div>
          </div>
          <button type="button" onClick={onClose} className="press flex h-8 w-8 items-center justify-center rounded-full bg-[#F1F4F8]">
            <i className="ph-bold ph-x text-[15px] text-[#64748B]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!periodoLectivoId && (
            <div className="mb-3 rounded-[10px] bg-[#FEF2F2] px-3.5 py-2.5 text-[12.5px] font-bold text-[#DC2626]">
              Este grupo no tiene un periodo activo — no se puede evaluar todavía.
            </div>
          )}
          {error && (
            <div className="mb-3 rounded-[10px] bg-[#FEF2F2] px-3.5 py-2.5 text-[12.5px] font-bold text-[#DC2626]">
              {error}
            </div>
          )}

          {!rubrica && !error && periodoLectivoId && (
            <div className="py-6 text-center text-[13px] font-semibold text-[#94A3B8]">Cargando…</div>
          )}

          {rubrica && (
            <div className="flex flex-col gap-4">
              <div>
                <div className="mb-2 text-[12.5px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
                  Rúbrica{rubrica.nombre ? ` · ${rubrica.nombre}` : ''}
                </div>
                <div className="overflow-x-auto rounded-[14px] border border-[#EEF1F6]">
                  <table className="w-full border-collapse text-[12px]">
                    <thead>
                      <tr className="bg-[#FAFBFD]">
                        <th className="min-w-[160px] border-b border-r border-[#EEF1F6] px-3 py-2 text-left font-extrabold text-[#475569]">
                          Indicadores
                        </th>
                        {rubrica.niveles.map((n) => (
                          <th
                            key={n.valor}
                            className="min-w-[150px] border-b border-r border-[#EEF1F6] px-3 py-2 text-center font-extrabold text-[#475569] last:border-r-0"
                          >
                            ({n.valor}) {n.etiqueta}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rubrica.indicadores.map((ind) => (
                        <tr key={ind.id}>
                          <td className="border-b border-r border-[#EEF1F6] px-3 py-2 align-top font-semibold text-[#334155]">
                            {ind.texto}
                          </td>
                          {rubrica.niveles.map((n) => {
                            const celda = ind.celdas?.find((c) => c.nivelValor === n.valor);
                            return (
                              <td
                                key={n.valor}
                                className="border-b border-r border-[#EEF1F6] px-3 py-2 align-top text-[#64748B] last:border-r-0"
                              >
                                {celda?.descripcion || '—'}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <div className="mb-2 text-[12.5px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
                  Evaluación de {studentName}
                </div>
                <div className="flex flex-col gap-2">
                  {rubrica.indicadores.map((ind) => (
                    <div
                      key={ind.id}
                      className="flex flex-col gap-2 rounded-[12px] border border-[#EEF1F6] p-2.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="text-[12.5px] font-bold text-[#334155] sm:max-w-[45%]">{ind.texto}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {rubrica.niveles.map((n) => {
                          const seleccionado = calificaciones[ind.id] === n.valor;
                          return (
                            <button
                              key={n.valor}
                              type="button"
                              onClick={() => elegirNivel(ind.id, n.valor)}
                              title={ind.celdas?.find((c) => c.nivelValor === n.valor)?.descripcion || undefined}
                              className={`press rounded-[9px] border px-2.5 py-1.5 text-[12px] font-extrabold ${
                                seleccionado
                                  ? 'border-[var(--brand)] bg-[var(--brand)] text-white'
                                  : 'border-[#E2E8F0] bg-white text-[#475569]'
                              }`}
                            >
                              ({n.valor}) {n.etiqueta}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-[#475569]">Observaciones</label>
                <textarea
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  rows={3}
                  placeholder="Comentarios sobre el desempeño de este estudiante…"
                  className="w-full resize-none rounded-[11px] border border-[#E2E8F0] px-3 py-2.5 text-[13px] font-medium text-[#334155] outline-none focus:border-[var(--brand)]"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-[#EEF1F6] px-5 py-3.5">
          {rubrica && (
            <button
              type="button"
              onClick={handleExportarPdf}
              title="Exportar esta evaluación en PDF"
              className="press mr-auto flex items-center gap-1.5 rounded-[12px] border border-[#E2E8F0] px-3.5 py-2.5 text-[13.5px] font-bold text-[#475569]"
            >
              <i className="ph ph-file-pdf text-[16px] text-[var(--brand)]" />
              Exportar PDF
            </button>
          )}
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
            disabled={isSaving || !rubrica || !todosCalificados}
            title={!todosCalificados ? 'Elegí un nivel para cada indicador' : undefined}
            className="press rounded-[12px] bg-[var(--brand)] px-4 py-2.5 text-[13.5px] font-extrabold text-white disabled:opacity-60"
          >
            {isSaving ? 'Guardando…' : 'Guardar evaluación'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RubricaGradingModal;
