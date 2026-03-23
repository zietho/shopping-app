import { useState, FormEvent } from 'react';
import { X, Link2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface JoinListModalProps {
  onClose: () => void;
}

export default function JoinListModal({ onClose }: JoinListModalProps) {
  const { joinListByCode } = useApp();
  const { t } = useLanguage();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setError('');
    setLoading(true);

    const { error: err, listName } = await joinListByCode(code);

    if (err) {
      if (err === 'INVALID_CODE') setError(t.sharing.errorInvalidCode);
      else if (err === 'ALREADY_MEMBER') setError(t.sharing.errorAlreadyMember);
      else setError(t.sharing.errorGeneric);
    } else {
      setSuccess(listName ? `${t.sharing.joinSuccess} "${listName}"` : t.sharing.joinSuccess);
      setTimeout(onClose, 1500);
    }
    setLoading(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full sm:max-w-sm mx-0 sm:mx-4 bg-surface-card rounded-t-2xl sm:rounded-2xl shadow-2xl border border-[var(--border)] animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-base font-semibold text-text-primary">{t.sharing.joinTitle}</h2>
            <p className="text-xs text-text-muted mt-0.5">{t.sharing.joinSubtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-elevated transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              <Link2 className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
              placeholder={t.sharing.codePlaceholder}
              maxLength={8}
              autoFocus
              autoCapitalize="characters"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="done"
              className="w-full h-12 bg-surface-elevated border border-[var(--border)] rounded-xl pl-10 pr-4 font-mono text-base tracking-widest text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors uppercase"
            />
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/20 rounded-lg px-4 py-3 text-danger text-sm animate-fade-in">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-success/10 border border-success/20 rounded-lg px-4 py-3 text-success text-sm animate-fade-in">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !code.trim() || !!success}
            className="w-full h-12 btn-primary flex items-center justify-center gap-2 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : t.sharing.joinButton}
          </button>
        </form>

        <div className="h-2" />
      </div>
    </div>
  );
}
