import { createContext, useCallback, useContext, useState } from 'react';

const ConfirmContext = createContext(null);

/**
 * Reemplaza window.confirm/alert (feos, del navegador, no se pueden estilar)
 * por un modal propio. `confirm(...)` devuelve una Promise<boolean> — se
 * resuelve true/false según el botón que toque el usuario, así los call
 * sites solo cambian `if (!window.confirm(msg))` por `if (!(await confirm(msg)))`.
 */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null); // { message, title, confirmLabel, danger, resolve } | null

  const confirm = useCallback((options) => {
    const opts = typeof options === 'string' ? { message: options } : options;
    return new Promise((resolve) => {
      setState({
        title: opts.title ?? 'Confirmar',
        message: opts.message,
        confirmLabel: opts.confirmLabel ?? 'Confirmar',
        danger: opts.danger ?? false,
        resolve,
      });
    });
  }, []);

  const handle = (value) => {
    state?.resolve(value);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4"
          onClick={() => handle(false)}
        >
          <div
            className="w-full max-w-[380px] rounded-2xl bg-white p-5 shadow-[0_30px_70px_-30px_rgba(16,24,40,0.4)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1.5 text-[16px] font-extrabold text-[#0F172A]">{state.title}</div>
            <p className="mb-5 text-[14px] font-medium leading-relaxed text-[#64748B]">{state.message}</p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => handle(false)}
                className="press flex-1 rounded-[12px] bg-[#F1F4F8] py-3 text-[14px] font-bold text-[#475569]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handle(true)}
                className="press flex-1 rounded-[12px] py-3 text-[14px] font-extrabold text-white"
                style={{ background: state.danger ? '#DC2626' : 'var(--brand)' }}
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm debe usarse dentro de ConfirmProvider');
  return ctx.confirm;
}
