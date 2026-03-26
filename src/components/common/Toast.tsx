import { X } from 'lucide-react';
import { Toast as ToastType } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-0 right-0 max-w-[480px] mx-auto px-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastType; onRemove: () => void }) {
  const { t } = useLanguage();

  function handleUndo() {
    toast.undoFn?.();
    onRemove();
  }

  return (
    <div className="animate-slide-up pointer-events-auto flex items-center gap-3 bg-surface-elevated border border-[var(--border)] rounded-card px-4 py-3 shadow-lg">
      <span className="flex-1 text-sm text-text-primary">{toast.message}</span>
      {toast.undoFn && (
        <button
          onClick={handleUndo}
          className="text-accent text-sm font-semibold hover:text-accent/80 transition-colors shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          {t.itemActions.undo}
        </button>
      )}
      <button
        onClick={onRemove}
        className="text-text-muted hover:text-text-secondary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label={t.itemActions.dismiss}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
