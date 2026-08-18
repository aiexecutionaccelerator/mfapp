"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface ToastState {
  message: string;
  retry?: () => void;
}

interface ToastApi {
  showToast: (message: string, options?: { retry?: () => void }) => void;
}

const ToastContext = createContext<ToastApi>({ showToast: () => {} });

export function useToast(): ToastApi {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback(
    (message: string, options?: { retry?: () => void }) => {
      setToast({ message, retry: options?.retry });
    },
    [],
  );

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const api = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast && (
        <div
          role="alert"
          className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-5 pb-[calc(env(safe-area-inset-bottom)+96px)]"
        >
          <div className="glass rise-in flex w-full max-w-[390px] items-center gap-3 rounded-[14px] p-4">
            <p className="flex-1 text-[15px] text-ink-0">{toast.message}</p>
            {toast.retry && (
              <button
                type="button"
                className="eyebrow shrink-0 text-gold-300"
                onClick={() => {
                  const retry = toast.retry;
                  setToast(null);
                  retry?.();
                }}
              >
                Retry
              </button>
            )}
            <button
              type="button"
              aria-label="Dismiss"
              className="shrink-0 text-ink-2"
              onClick={() => setToast(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
