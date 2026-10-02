import React, { createContext, useContext, useState, useRef, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (type, message, duration) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => dismiss(id), duration); // auto-hide
    },
    [dismiss]
  );

  // useMemo keeps this object identical between renders, so components
  // that use it don't re-run their effects every time a toast appears.
  const toast = useMemo(
    () => ({
      success: (message) => show('success', message, 3500),
      error: (message) => show('error', message, 6000),
      info: (message) => show('info', message, 4000),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}

      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div key={t.id} className={`toast toast-${t.type}`} role={t.type === 'error' ? 'alert' : 'status'}>
              <Icon size={18} className="toast-icon" />
              <span>{t.message}</span>
              <button className="toast-close" onClick={() => dismiss(t.id)} aria-label="Dismiss notification">
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};