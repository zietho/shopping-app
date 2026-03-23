import { useState, FormEvent, useEffect } from 'react';
import { ShoppingCart, Eye, EyeOff, Lock, User, Link } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasPendingJoin, setHasPendingJoin] = useState(false);

  useEffect(() => {
    setHasPendingJoin(!!sessionStorage.getItem('pending_join_code'));
  }, []);

  function switchMode(next: 'login' | 'register') {
    setMode(next);
    setError('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError(t.login.errorRequired);
      return;
    }
    if (mode === 'register') {
      if (!confirmPassword.trim()) {
        setError(t.login.errorRequired);
        return;
      }
      if (password !== confirmPassword) {
        setError(t.login.errorPasswordMismatch);
        return;
      }
      if (password.length < 6) {
        setError(t.login.errorPasswordTooShort);
        return;
      }
    }
    setError('');
    setLoading(true);

    if (mode === 'login') {
      const { error: err } = await signIn(username, password);
      if (err) {
        if (err === 'UNKNOWN_USER') setError(t.login.errorUnknownUser);
        else if (err === 'WRONG_PASSWORD') setError(t.login.errorWrongPassword);
        else setError(err);
      }
    } else {
      const { error: err } = await signUp(username, password);
      if (err) {
        if (err === 'USERNAME_TAKEN') setError(t.login.errorUsernameTaken);
        else if (err === 'USERNAME_TOO_SHORT') setError(t.login.errorUsernameTooShort);
        else if (err === 'USERNAME_INVALID') setError(t.login.errorUsernameInvalid);
        else setError(err);
      }
    }
    setLoading(false);
  }

  const isRegister = mode === 'register';

  return (
    <div className="flex flex-col min-h-full bg-bg-primary overflow-y-auto">
      <div className="flex-1 flex flex-col justify-center px-6 py-10">
        {hasPendingJoin && (
          <div className="mb-6 animate-slide-up flex items-start gap-3 bg-accent/10 border border-accent/20 rounded-xl px-4 py-3">
            <Link className="w-4 h-4 text-accent mt-0.5 shrink-0" />
            <p className="text-sm text-accent leading-snug">
              Du wurdest zu einer Einkaufsliste eingeladen. Melde dich an oder registriere dich, um beizutreten.
            </p>
          </div>
        )}

        <div className="mb-10 animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-[var(--border)] flex items-center justify-center mb-6">
            <ShoppingCart className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">
            {isRegister ? t.login.titleRegister : t.login.title}
          </h1>
          <p className="text-text-secondary text-sm">
            {isRegister ? t.login.subtitleRegister : t.login.subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up" style={{ animationDelay: '60ms' }}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-text-secondary mb-2">
              {t.login.username}
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                <User className="w-4 h-4" />
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                placeholder={t.login.usernamePlaceholder}
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="next"
                className="w-full h-12 bg-surface-card border border-[var(--border)] rounded-lg pl-10 pr-4 text-text-primary placeholder-text-muted text-base focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
            </div>
            {isRegister && (
              <p className="text-xs text-text-muted mt-1.5 pl-1">{t.login.usernameHint}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
              {t.login.password}
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder={t.login.passwordPlaceholder}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                enterKeyHint={isRegister ? 'next' : 'done'}
                className="w-full h-12 bg-surface-card border border-[var(--border)] rounded-lg pl-10 pr-12 text-text-primary placeholder-text-muted text-base focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors p-1"
                aria-label={showPassword ? t.login.hidePassword : t.login.showPassword}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isRegister && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-2">
                {t.login.confirmPassword}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                  placeholder={t.login.confirmPasswordPlaceholder}
                  autoComplete="new-password"
                  enterKeyHint="done"
                  className="w-full h-12 bg-surface-card border border-[var(--border)] rounded-lg pl-10 pr-4 text-text-primary placeholder-text-muted text-base focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-danger/10 border border-danger/20 rounded-lg px-4 py-3 text-danger text-sm animate-fade-in">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 btn-primary flex items-center justify-center gap-2 text-base font-semibold disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isRegister ? t.login.submitRegister : t.login.submit}
          </button>
        </form>

        <button
          onClick={() => switchMode(isRegister ? 'login' : 'register')}
          className="mt-6 text-sm text-accent hover:underline text-center w-full"
        >
          {isRegister ? t.login.switchToLogin : t.login.switchToRegister}
        </button>
      </div>
    </div>
  );
}
