import { useAuth } from '../../contexts/AuthContext';

export default function UserBar() {
  const { profile } = useAuth();

  if (!profile) return null;

  const displayName = profile.username.charAt(0).toUpperCase() + profile.username.slice(1);

  return (
    <div className="mx-4 mb-2 px-3 py-2 bg-surface-elevated border border-[var(--border)] rounded-lg flex items-center gap-2.5 animate-fade-in">
      <div className="relative shrink-0">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-accent"
          style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 12%, transparent)' }}
        >
          {profile.username[0].toUpperCase()}
        </div>
        <span className="presence-dot" />
      </div>
      <p className="text-xs text-text-secondary leading-tight">
        <span className="font-semibold text-text-primary">{displayName}</span>
      </p>
    </div>
  );
}
