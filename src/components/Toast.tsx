import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, Info, AlertTriangle, AlertCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
        let borderClass = 'border-stone-200 bg-white text-stone-900';

        if (toast.type === 'error') {
          icon = <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />;
          borderClass = 'border-rose-200 bg-rose-50 text-rose-950';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />;
          borderClass = 'border-amber-200 bg-amber-50 text-amber-950';
        } else if (toast.type === 'info') {
          icon = <Info className="w-4 h-4 text-stone-600 shrink-0" />;
          borderClass = 'border-stone-200 bg-stone-50 text-stone-900';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-lg border shadow-lg transition-all duration-200 text-sm ${borderClass}`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              {icon}
              <span className="truncate">{toast.message}</span>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 text-stone-400 hover:text-stone-700 transition-colors shrink-0"
              aria-label="Dismiss alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
