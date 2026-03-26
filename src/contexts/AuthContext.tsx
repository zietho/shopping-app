import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: string | null }>;
  signUp: (username: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AVATAR_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
];

function randomAvatarColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    setProfile(data);
    setLoading(false);
  }

  async function signIn(username: string, password: string): Promise<{ error: string | null }> {
    const lowerUsername = username.toLowerCase().trim();
    const email = `${lowerUsername}@shoplist.app`;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // 400 = invalid credentials (Supabase intentionally returns same status for
      // unknown user and wrong password to avoid user enumeration)
      if (error.status === 400) return { error: 'UNKNOWN_USER' };
      return { error: 'WRONG_PASSWORD' };
    }
    return { error: null };
  }

  async function signUp(username: string, password: string): Promise<{ error: string | null }> {
    const lowerUsername = username.toLowerCase().trim();

    if (lowerUsername.length < 2) {
      return { error: 'USERNAME_TOO_SHORT' };
    }
    if (!/^[a-z0-9_]+$/.test(lowerUsername)) {
      return { error: 'USERNAME_INVALID' };
    }

    const email = `${lowerUsername}@shoplist.app`;

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      if (error.message.toLowerCase().includes('already registered') ||
          error.message.toLowerCase().includes('already exists') ||
          error.message.toLowerCase().includes('user already')) {
        return { error: 'USERNAME_TAKEN' };
      }
      return { error: error.message };
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        username: lowerUsername,
        avatar_color: randomAvatarColor(),
      });
      if (profileError) {
        return { error: profileError.message };
      }
    }

    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
