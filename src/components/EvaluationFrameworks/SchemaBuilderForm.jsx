import { useState } from 'react';
import RubricaDesignerModal from './RubricaDesignerModal';

// Soft pastel tones — same spirit as the attendance status cards, not the vivid brand palette.
const DOT_COLORS = ['#A5B4FC', '#7DD3FC', '#FCD34D', '#F9A8D4', '#C4B5FD', '#86EFAC'];
const TOLERANCIA_PESO = 0.5;

// IDs negativos = "todavía no existe en la BD" (los reales del backend siempre son positivos).
// Así toEsquemaPayload sabe cuáles mandar como actualización y cuáles como creación nueva.
let nextCategoryId = -1;
let nextItemId = -1;
const newCategory = () => ({ id: nextCategoryId--, name: 'Nueva categoría', weight: 0, items: [] });
const newItem = () => ({ id: nextItemId--, name: 'Nuevo ítem', weight: 0 });

// Una categoría sin items se califica directo (el backend le crea un item
// implícito) — no hace falta que el profesor elija un modo a mano, alcanza
// con que agregue items o no.
function categorySubtitle(category) {
  if (category.auto) return 'Calculada automáticamente';
  if (!category.items.length) return 'Una sola evaluación · puntaje directo';
  return `${category.items.length} items · subdividido`;
}

/** Suma de los items de una categoría vs. lo que debería sumar (el peso de esa categoría). */
function itemsSumInfo(category) {
  const suma = category.items.reduce((acc, it) => acc + Number(it.weight || 0), 0);
  const esperado = Number(category.weight || 0);
  return { suma, esperado, ok: Math.abs(suma - esperado) <= TOLERANCIA_PESO };
}

/**
 * Reusable category/weight builder for an evaluation schema. Used both standalone
 * (creating/editing a template in the Esquemas module) and inside a group's
 * Esquema tab. Pass a different `initialCategories` + remount via `key` on the
 * parent to reset the form when the user picks a different starting template.
 *
 * El peso de cada item es su parte del TOTAL del esquema (no un % relativo a
 * su categoría) — los items de una categoría deben sumar el mismo peso que
 * esa categoría. Una categoría sin items se califica directo (el backend ya
 * soporta esto), no hace falta marcarlo aparte.
 */
function SchemaBuilderForm({
  initialCategories,
  showNameField = false,
  templateName = '',
  onTemplateNameChange,
  onSave,
}) {
  const [categories, setCategories] = useState(() => initialCategories.map((c) => ({ ...c })));
  const [expanded, setExpanded] = useState(
    () => new Set(initialCategories.filter((c) => c.items.length).map((c) => c.id)),
  );
  const [rubricaAbierta, setRubricaAbierta] = useState(null); // { categoryId, itemId, itemNombre } | null

  const total = categories.reduce((sum, c) => sum + Number(c.weight || 0), 0);
  const isComplete = total === 100;

  // Categorías subdivididas cuyos items no suman el peso de la categoría —
  // bloquea el guardado; el detalle exacto se ve fila por fila (Suma de items).
  const categoriasConProblemas = categories
    .filter((c) => !c.auto && c.items.length > 0)
    .filter((c) => !itemsSumInfo(c).ok)
    .map((c) => c.name);
  const canSave = isComplete && categoriasConProblemas.length === 0;

  const updateCategory = (id, patch) =>
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const removeCategory = (id) => setCategories((prev) => prev.filter((c) => c.id !== id));
  const addCategory = () => setCategories((prev) => [...prev, newCategory()]);

  const toggleExpanded = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const addItem = (categoryId) => {
    setExpanded((prev) => new Set(prev).add(categoryId));
    updateCategory(categoryId, {
      items: [...categories.find((c) => c.id === categoryId).items, newItem()],
    });
  };
  const updateItem = (categoryId, itemId, patch) => {
    const category = categories.find((c) => c.id === categoryId);
    updateCategory(categoryId, {
      items: category.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
    });
  };
  const removeItem = (categoryId, itemId) => {
    const category = categories.find((c) => c.id === categoryId);
    updateCategory(categoryId, { items: category.items.filter((it) => it.id !== itemId) });
  };

  return (
    <div className="flex flex-wrap gap-[18px]">
      <div className="flex-[2] min-w-[300px]">
        {showNameField && (
          <div className="mb-4 rounded-[14px] border border-[#EEF1F6] bg-white p-4">
            <label className="mb-2 block text-[13px] font-bold text-[#475569]">Nombre de la plantilla</label>
            <input
              value={templateName}
              onChange={(e) => onTemplateNameChange?.(e.target.value)}
              placeholder="Ej. Plantilla MEP 2026"
              className="w-full rounded-[11px] border border-[#E2E8F0] px-3.5 py-3 text-[14.5px] font-semibold text-[#1E293B] outline-none focus:border-[var(--brand)]"
            />
          </div>
        )}

        <p className="mb-4 text-[14px] font-medium text-[#64748B]">
          Agregá categorías y asigná su peso. El total debe sumar exactamente{' '}
          <strong className="text-[#1E293B]">100%</strong>. Si subdividís una categoría en items, esos items deben
          sumar entre sí el mismo peso que la categoría — no un 100% aparte.
        </p>

        <div className="flex flex-col gap-2.5">
          {categories.map((c, i) => {
            const isOpen = expanded.has(c.id);
            const color = c.auto ? '#CBD5E1' : DOT_COLORS[i % DOT_COLORS.length];
            const itemsInfo = !c.auto ? itemsSumInfo(c) : null;

            return (
              <div key={c.id}>
                <div className="flex items-center gap-3 rounded-[14px] border border-[#EEF1F6] bg-white p-3.5">
                  <i className="ph ph-dots-six-vertical shrink-0 text-[19px] text-[#CBD5E1]" />
                  <span className="h-8 w-2 shrink-0 rounded-[5px]" style={{ background: color }} />

                  <div className="min-w-0 flex-1">
                    {c.auto ? (
                      <div className="px-1.5 py-1 text-[15px] font-bold italic text-[#94A3B8]">{c.name}</div>
                    ) : (
                      <input
                        value={c.name}
                        onChange={(e) => updateCategory(c.id, { name: e.target.value })}
                        className="w-full rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-[15px] font-bold text-[#1E293B] outline-none focus:border-[#E2E8F0] focus:bg-[#FAFBFD]"
                      />
                    )}
                    <div className="px-1.5 text-[12px] font-semibold text-[#94A3B8]">{categorySubtitle(c)}</div>
                  </div>

                  <div
                    className={`flex shrink-0 items-center gap-1 rounded-[11px] border px-2.5 py-1.5 ${
                      c.auto ? 'border-[#EEF1F6] bg-[#F8FAFC]' : 'border-[#E8ECF2] bg-[#F5F7FA]'
                    }`}
                  >
                    <input
                      type="number"
                      value={c.weight}
                      onChange={(e) =>
                        updateCategory(c.id, { weight: e.target.value === '' ? '' : Number(e.target.value) })
                      }
                      className="w-9 border-none bg-transparent text-right text-[16px] font-extrabold text-[#0F172A] outline-none"
                    />
                    <span className="font-bold text-[#94A3B8]">%</span>
                  </div>

                  {!c.auto && (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(c.id)}
                      className="press shrink-0 text-[#94A3B8]"
                      aria-label={isOpen ? 'Contraer' : 'Expandir'}
                    >
                      <i className={`ph-bold ${isOpen ? 'ph-caret-up' : 'ph-caret-down'} text-[15px]`} />
                    </button>
                  )}
                  {!c.auto && (
                    <button
                      type="button"
                      onClick={() => removeCategory(c.id)}
                      className="press shrink-0 text-[#CBD5E1]"
                      aria-label="Eliminar categoría"
                    >
                      <i className="ph ph-trash text-[17px]" />
                    </button>
                  )}
                </div>

                {!c.auto && isOpen && (
                  <div className="mt-2 flex flex-col gap-1.5 pl-[44px]">
                    {c.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2.5 rounded-[11px] border border-[#EEF1F6] bg-[#FAFBFD] px-3 py-2"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            item.id > 0 &&
                            setRubricaAbierta({ categoryId: c.id, itemId: item.id, itemNombre: item.name })
                          }
                          disabled={!(item.id > 0)}
                          title={
                            item.id > 0
                              ? item.tieneRubrica
                                ? 'Ver/editar rúbrica'
                                : 'Agregar rúbrica'
                              : 'Guardá el esquema primero para agregarle una rúbrica a este ítem'
                          }
                          className="press shrink-0 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <i
                            className={`${item.tieneRubrica ? 'ph-fill' : 'ph'} ph-file shrink-0 text-[15px] ${
                              item.tieneRubrica ? 'text-[var(--brand)]' : 'text-[#94A3B8]'
                            }`}
                          />
                        </button>
                        <input
                          value={item.name}
                          onChange={(e) => updateItem(c.id, item.id, { name: e.target.value })}
                          className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1 py-0.5 text-[13.5px] font-semibold text-[#334155] outline-none focus:border-[#E2E8F0] focus:bg-white"
                        />
                        <div className="flex shrink-0 items-center gap-1 text-[12px] font-bold text-[#94A3B8]">
                          <input
                            type="number"
                            value={item.weight}
                            onChange={(e) =>
                              updateItem(c.id, item.id, { weight: e.target.value === '' ? '' : Number(e.target.value) })
                            }
                            className="w-8 border-none bg-transparent text-right outline-none"
                          />
                          % del total
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(c.id, item.id)}
                          className="press shrink-0 text-[#CBD5E1]"
                          aria-label="Eliminar ítem"
                        >
                          <i className="ph ph-trash text-[15px]" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addItem(c.id)}
                      className="press flex items-center gap-1.5 py-1 text-[13.5px] font-bold text-[var(--brand)]"
                    >
                      <i className="ph-bold ph-plus text-[14px]" />
                      Agregar ítem
                    </button>

                    {c.items.length > 0 && itemsInfo && (
                      <div
                        className="flex items-center gap-1.5 text-[12px] font-bold"
                        style={{ color: itemsInfo.ok ? '#15803D' : '#DC2626' }}
                      >
                        <i className={`ph-fill ${itemsInfo.ok ? 'ph-check-circle' : 'ph-warning-circle'} text-[14px]`} />
                        Suma de items: {itemsInfo.suma}/{itemsInfo.esperado}%
                        {!itemsInfo.ok &&
                          ` · ${itemsInfo.suma > itemsInfo.esperado ? 'sobran' : 'faltan'} ${Math.abs(itemsInfo.esperado - itemsInfo.suma)}%`}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={addCategory}
            className="press flex items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-[#CBD8E8] py-3.5 text-[14px] font-bold text-[var(--brand)]"
          >
            <i className="ph-bold ph-plus text-[16px]" />
            Agregar categoría
          </button>
        </div>
      </div>

      <div className="min-w-[240px] flex-1">
        <div className="rounded-2xl border border-[#EEF1F6] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11.5px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
                Suma de pesos
              </div>
              <div
                className="mt-1 text-[32px] font-extrabold leading-none"
                style={{ color: isComplete ? '#16A34A' : '#DC2626' }}
              >
                {total}%
              </div>
            </div>
            <i
              className={`ph-fill ${isComplete ? 'ph-check-circle text-[#16A34A]' : 'ph-warning-circle text-[#DC2626]'} text-[28px]`}
            />
          </div>

          <div className="my-4 flex h-2 overflow-hidden rounded-full bg-[#EEF2F7]">
            {categories.map((c, i) => (
              <div
                key={c.id}
                style={{
                  width: `${Math.max(0, Number(c.weight || 0))}%`,
                  background: c.auto ? '#CBD5E1' : DOT_COLORS[i % DOT_COLORS.length],
                }}
              />
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {categories.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between text-[13px] font-semibold text-[#475569]">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: c.auto ? '#CBD5E1' : DOT_COLORS[i % DOT_COLORS.length] }}
                  />
                  {c.name}
                </div>
                <span>{c.weight || 0}%</span>
              </div>
            ))}
          </div>

          <div
            className="mt-4 flex items-center gap-2 rounded-[11px] px-3.5 py-2.5 text-[13px] font-bold"
            style={{ background: canSave ? '#F0FDF4' : '#FEF2F2', color: canSave ? '#15803D' : '#DC2626' }}
          >
            <i className={`ph-fill ${canSave ? 'ph-check-circle' : 'ph-warning-circle'} text-[16px]`} />
            {canSave
              ? 'El esquema está completo y listo para guardar.'
              : !isComplete
                ? `Ajustá los pesos de las categorías: ${total > 100 ? `sobran ${total - 100}` : `faltan ${100 - total}`}% para llegar a 100%.`
                : `Revisá los items de ${categoriasConProblemas.join(', ')} — no suman el mismo peso que su categoría.`}
          </div>

          <button
            type="button"
            onClick={() => canSave && onSave?.(categories, templateName)}
            disabled={!canSave}
            title={!canSave ? 'Corregí los pesos antes de guardar' : undefined}
            className="press mt-4 flex w-full items-center justify-center gap-2 rounded-[13px] bg-[var(--brand)] py-3 text-[14.5px] font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <i className="ph-fill ph-floppy-disk text-[17px]" />
            Guardar esquema
          </button>
        </div>
      </div>

      {rubricaAbierta && (
        <RubricaDesignerModal
          itemId={rubricaAbierta.itemId}
          itemNombre={rubricaAbierta.itemNombre}
          onClose={() => setRubricaAbierta(null)}
          onSaved={(tieneRubrica) =>
            updateItem(rubricaAbierta.categoryId, rubricaAbierta.itemId, { tieneRubrica })
          }
        />
      )}
    </div>
  );
}

export default SchemaBuilderForm;
