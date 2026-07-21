/**
 * "Desglose por categoría". En modo periodo: cada ítem es editable (escribís
 * la nota y se guarda sola). En modo "Año completo": de solo lectura, una
 * columna por periodo con la nota ya obtenida ahí + la nota final de la
 * categoría (promedio de esos periodos).
 */
function CategoryBreakdownCard({ schema, modo, periodos, onEditItem, totalAvg }) {
  const esGlobal = modo === 'global';

  return (
    <div className="rounded-2xl border border-[#EEF1F6] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-6">
      <div className="mb-4 text-[16px] font-extrabold text-[#0F172A]">Desglose por categoría</div>

      <div className="flex flex-col gap-4">
        {schema.map((category) => (
          <div key={category.id}>
            <div className="mb-1.5 flex items-center justify-between text-[13.5px]">
              <span className="font-bold text-[#334155]">
                {category.name} · {category.weight}%
              </span>
              <span className="font-extrabold text-[#0F172A]">
                {esGlobal
                  ? category.scoreFinal != null
                    ? Math.round(category.scoreFinal)
                    : '—'
                  : category.score != null
                    ? Math.round(category.score)
                    : '—'}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[#EEF2F7]">
              <div
                className="h-full rounded-full bg-[var(--brand)]"
                style={{
                  width: `${Math.min(100, (esGlobal ? category.scoreFinal : category.score) ?? 0)}%`,
                }}
              />
            </div>

            {esGlobal ? (
              (periodos ?? []).length > 0 && (
                <div className="mt-2 flex flex-col gap-1.5 pl-3.5">
                  {periodos.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-[12.5px] font-semibold text-[#64748B]">
                      <span>{p.nombre}</span>
                      <span className="font-bold text-[#475569]">
                        {category.porPeriodo?.[p.id] != null ? Math.round(category.porPeriodo[p.id]) : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              )
            ) : (
              category.items.length > 0 && (
                <div className="mt-2 flex flex-col gap-1.5 pl-3.5">
                  {category.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-2 text-[12.5px] font-semibold text-[#64748B]">
                      <span className="min-w-0 flex-1 truncate">{item.name}</span>
                      <input
                        type="text"
                        defaultValue={item.valorObtenido ?? ''}
                        onBlur={(e) => onEditItem?.(item.id, e.target.value)}
                        className="w-[52px] rounded-md border border-[#E2E8F0] bg-[#FAFBFD] px-2 py-1 text-center text-[12.5px] font-bold text-[#1E293B] outline-none focus:border-[var(--brand)] focus:bg-white"
                      />
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#F1F4F8] pt-3.5 text-[14px]">
        <span className="font-bold text-[#334155]">Total</span>
        <span className="font-extrabold text-[var(--brand)]">{totalAvg != null ? totalAvg.toFixed(1) : '—'}</span>
      </div>
    </div>
  );
}

export default CategoryBreakdownCard;
