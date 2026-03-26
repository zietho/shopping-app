import { useState, useEffect } from 'react';
import { Copy, Check, RefreshCw, X, Users, Crown, User, Link, MessageCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface ShareModalProps {
  listId: string;
  listName: string;
  onClose: () => void;
}

export default function ShareModal({ listId, listName, onClose }: ShareModalProps) {
  const { generateShareCode, activeListMembers, isOwnerOfList } = useApp();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isOwnerOfList(listId)) {
      loadCode();
    } else {
      setLoading(false);
    }
  }, [listId]);

  async function loadCode() {
    setLoading(true);
    const c = await generateShareCode(listId);
    setCode(c);
    setLoading(false);
  }

  async function handleRefresh() {
    setRefreshing(true);
    const c = await generateShareCode(listId);
    setCode(c);
    setRefreshing(false);
  }

  async function handleCopy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied — ignore silently, user can select the code manually
    }
  }

  function getInviteLink() {
    const base = window.location.origin + window.location.pathname;
    return `${base}?join=${code}`;
  }

  async function handleCopyLink() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(getInviteLink());
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Clipboard access denied — ignore silently, user can copy the link manually
    }
  }

  function handleWhatsApp() {
    if (!code) return;
    const link = getInviteLink();
    const message = encodeURIComponent(`${t.sharing.whatsAppMessage}${code}\n${link}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  }

  const isOwner = isOwnerOfList(listId);

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
            <h2 className="text-base font-semibold text-text-primary">{t.sharing.title}</h2>
            <p className="text-xs text-text-muted mt-0.5 truncate max-w-[220px]">{listName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-elevated transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {isOwner && (
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                {t.sharing.inviteCode}
              </p>
              {loading ? (
                <div className="h-14 rounded-xl bg-surface-elevated animate-pulse" />
              ) : code ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-surface-elevated border border-[var(--border)] rounded-xl px-4 py-3 font-mono text-lg font-bold tracking-[0.25em] text-text-primary text-center select-all">
                    {code}
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-all duration-150 shrink-0 ${
                      copied
                        ? 'bg-success/10 border-success/30 text-success'
                        : 'bg-surface-elevated border-[var(--border)] text-text-secondary hover:text-accent hover:border-accent/30 hover:bg-accent/5'
                    }`}
                    title={t.sharing.copyCode}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-surface-elevated border border-[var(--border)] text-text-secondary hover:text-accent hover:border-accent/30 hover:bg-accent/5 transition-all duration-150 shrink-0 disabled:opacity-50"
                    title={t.sharing.generateCode}
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              ) : (
                <p className="text-sm text-text-muted text-center py-2">{t.sharing.errorGeneric}</p>
              )}
              {copied && (
                <p className="text-xs text-success text-center mt-2 animate-fade-in">{t.sharing.copied}</p>
              )}

              {code && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                    {t.sharing.inviteLink}
                  </p>
                  <div className="flex items-center gap-2 p-3 bg-surface-elevated border border-[var(--border)] rounded-xl">
                    <Link className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    <span className="flex-1 text-xs text-text-secondary truncate font-mono select-all">
                      {getInviteLink()}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleCopyLink}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all duration-150 ${
                        linkCopied
                          ? 'bg-success/10 border-success/30 text-success'
                          : 'bg-surface-elevated border-[var(--border)] text-text-secondary hover:text-text-primary hover:border-accent/30 hover:bg-accent/5'
                      }`}
                    >
                      {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {linkCopied ? t.sharing.linkCopied : t.sharing.copyLink}
                    </button>
                    <button
                      onClick={handleWhatsApp}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium bg-[#25D366]/10 border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/20 transition-all duration-150"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {t.sharing.shareViaWhatsApp}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-3.5 h-3.5 text-text-muted" />
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                {t.sharing.membersTitle} ({activeListMembers.length})
              </p>
            </div>
            <div className="space-y-2">
              {activeListMembers.map(member => (
                <div
                  key={member.user_id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                    member.user_id === user?.id ? 'bg-accent/5 border border-accent/15' : 'bg-surface-elevated'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: member.avatar_color }}
                  >
                    {member.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {member.username.charAt(0).toUpperCase() + member.username.slice(1)}
                      {member.user_id === user?.id && (
                        <span className="ml-1.5 text-xs text-accent font-normal">({t.settings.user})</span>
                      )}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {member.role === 'owner' ? (
                      <div className="flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        <Crown className="w-3 h-3" />
                        {t.settings.owner}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-text-muted bg-surface-card px-2 py-0.5 rounded-full border border-[var(--border)]">
                        <User className="w-3 h-3" />
                        {t.settings.member}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-5" />
      </div>
    </div>
  );
}
