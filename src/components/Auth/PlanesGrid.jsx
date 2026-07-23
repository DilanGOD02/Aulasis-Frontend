import { PLAN_LABELS, PLAN_FRECUENCIA, PLAN_ORDEN, PLAN_BENEFICIOS, formatColones, ahorroPct } from '../../constants/plans';

/** Lista de planes con precio, frecuencia de pago y ahorro vs. mensual, más el checklist de beneficios (compartidos por todos los planes por ahora). */
function PlanesGrid({ precios }) {
  return (
    <div className="flex flex-col gap-2">
      {PLAN_ORDEN.map((plan) => {
        const ahorro = ahorroPct(plan, precios);
        return (
          <div key={plan} className="flex items-center justify-between rounded-[13px] border border-[#E2E8F0] px-4 py-3">
            <div>
              <div className="text-[14px] font-extrabold text-[#0F172A]">{PLAN_LABELS[plan]}</div>
              <div className="text-[12.5px] font-medium text-[#94A3B8]">{PLAN_FRECUENCIA[plan]}</div>
            </div>
            <div className="text-right">
              <div className="text-[15px] font-extrabold text-[var(--brand)]">
                {precios?.[plan] != null ? formatColones(precios[plan]) : '—'}
              </div>
              {ahorro != null && <div className="text-[11px] font-extrabold text-[#16A34A]">Ahorrás {ahorro}%</div>}
            </div>
          </div>
        );
      })}

      <div className="mt-1 rounded-[13px] bg-[#F8FAFC] p-3.5">
        <div className="mb-2 text-[12.5px] font-extrabold text-[#334155]">Todos los planes incluyen</div>
        <div className="flex flex-col gap-1.5">
          {PLAN_BENEFICIOS.map((beneficio) => (
            <div key={beneficio} className="flex items-start gap-2 text-[12.5px] font-semibold text-[#475569]">
              <i className="ph-bold ph-check-circle mt-0.5 shrink-0 text-[14px] text-[#16A34A]" />
              <span>{beneficio}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PlanesGrid;
