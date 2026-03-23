import { LogOut, Palette, Shield, Globe, Check, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Language } from '../lib/i18n';

interface SettingsScreenProps {
  onClose: () => void;
}

export default function SettingsScreen({ onClose }: SettingsScreenProps) {
  const { profile, signOut } = useAuth();
  const { lists, templates, items } = useApp();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const displayName = profile?.username
    ? profile.username.charAt(0).toUpperCase() + profile.username.slice(1)
    : t.settings.user;

  const email = profile?.username ? `${profile.username}@shoplist.app` : '';

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto scrollbar-none">
      <div className="px-4 py-4 shrink-0 border-b border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold shrink-0 bg-accent/25 text-accent border-2 border-surface-dark"
            >
              {displayName[0]}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-text-primary">{displayName}</h1>
              <p className="text-xs text-text-muted truncate">{email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-elevated transition-colors shrink-0"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 pb-4">
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">{t.settings.overview}</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t.settings.lists, value: lists.length },
            { label: t.settings.items, value: items.length },
            { label: t.settings.templates, value: templates.length },
          ].map(stat => (
            <div key={stat.label} className="surface-card p-3 text-center">
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              <p className="text-xs text-text-muted mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4">
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">{t.settings.app}</h2>
        <div className="surface-card overflow-hidden divide-y divide-[var(--border)]">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="text-text-muted"><Palette className="w-4 h-4" /></span>
            <span className="flex-1 text-sm text-text-primary">{t.settings.design}</span>
            <div className="flex items-center gap-1 bg-surface-elevated rounded-lg p-0.5">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                  theme === 'light'
                    ? 'bg-surface-card text-text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                {t.settings.themeLight}
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                  theme === 'dark'
                    ? 'bg-surface-card text-text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                {t.settings.themeDark}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">{t.settings.language}</h2>
        <div className="surface-card overflow-hidden divide-y divide-[var(--border)]">
          <LanguageOption lang="de" label="Deutsch" flag="🇩🇪" current={language} onSelect={setLanguage} />
          <LanguageOption lang="en" label="English" flag="🇬🇧" current={language} onSelect={setLanguage} />
          <LanguageOption lang="fr" label="Français" flag="🇫🇷" current={language} onSelect={setLanguage} />
          <LanguageOption lang="es" label="Español" flag="🇪🇸" current={language} onSelect={setLanguage} />
        </div>
      </div>

      <div className="px-4 pb-4">
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">{t.settings.about}</h2>
        <div className="surface-card overflow-hidden divide-y divide-[var(--border)]">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="text-text-muted"><Shield className="w-4 h-4" /></span>
            <span className="flex-1 text-sm text-text-primary">{t.settings.version}</span>
            <span className="text-sm text-text-secondary">1.0.0</span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-8 mt-auto">
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 h-12 bg-danger/10 border border-danger/20 rounded-card text-danger font-semibold hover:bg-danger/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t.settings.signOut}
        </button>
      </div>
    </div>
  );
}

function LanguageOption({
  lang,
  label,
  flag,
  current,
  onSelect,
}: {
  lang: Language;
  label: string;
  flag: string;
  current: Language;
  onSelect: (lang: Language) => void;
}) {
  const isActive = current === lang;
  return (
    <button
      onClick={() => onSelect(lang)}
      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface-elevated transition-colors"
    >
      <Globe className="w-4 h-4 text-text-muted shrink-0" />
      <span className="text-base mr-1">{flag}</span>
      <span className="flex-1 text-sm text-text-primary text-left">{label}</span>
      {isActive && <Check className="w-4 h-4 text-accent shrink-0" />}
    </button>
  );
}
