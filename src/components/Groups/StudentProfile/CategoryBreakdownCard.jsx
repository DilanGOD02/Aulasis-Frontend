import { getCategoryScore, getItemScore } from '../../../data/dummyGroups';

/** "Desglose por categoría" — each schema category's score, with its items broken out underneath. */
function CategoryBreakdownCard({ schema, student }) {
  return (
    <div className="rounded-2xl border border-[#EEF1F6] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-6">
      <div className="mb-4 text-[16px] font-extrabold text-[#0F172A]">Desglose por categoría</div>

      <div className="flex flex-col gap-4">
        {schema.map((category) => {
          const score = getCategoryScore(category, student);
          return (
            <div key={category.id}>
              <div className="mb-1.5 flex items-center justify-between text-[13.5px]">
                <span className="font-bold text-[#334155]">
                  {category.name} · {category.weight}%
                </span>
                <span className="font-extrabold text-[#0F172A]">{score ?? '—'}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#EEF2F7]">
                <div
                  className="h-full rounded-full bg-[var(--brand)]"
                  style={{ width: `${Math.min(100, score ?? 0)}%` }}
                />
              </div>

              {category.items.length > 0 && (
                <div className="mt-2 flex flex-col gap-1.5 pl-3.5">
                  {category.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-[12.5px] font-semibold text-[#64748B]">
                      <span>{item.name}</span>
                      <span className="font-bold text-[#475569]">{getItemScore(item, student) ?? '—'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryBreakdownCard;
