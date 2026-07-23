import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;
const ICON_BY_TYPE = { success: 'ph-check-circle', error: 'ph-x-circle', info: 'ph-info' };
const BG_BY_TYPE = { success: '#16A34A', error: '#DC2626', info: '#1E293B' };

/**
 * Notificación flotante para confirmar acciones (guardar/eliminar/etc.) que
 * a veces navegan a otra pantalla enseguida — el toast vive arriba del
 * router, así que sobrevive esa navegación en vez de desaparecer con la
 * pantalla que lo disparó.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const showToast = useCallback(
    (message, type = 'success') => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      timers.current[id] = setTimeout(() => dismiss(id), 3200);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[200] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => dismiss(t.id)}
            className="press pointer-events-auto flex max-w-[420px] items-center gap-2.5 rounded-[13px] px-4 py-3 text-left text-[13.5px] font-bold text-white shadow-[0_16px_36px_-12px_rgba(16,24,40,0.4)]"
            style={{ background: BG_BY_TYPE[t.type] ?? BG_BY_TYPE.info }}
          >
            <i className={`ph-fill ${ICON_BY_TYPE[t.type] ?? ICON_BY_TYPE.info} shrink-0 text-[19px]`} />
            {t.message}
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider');
  return ctx;
}
