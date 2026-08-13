import { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabaseClient';
import { seedDefaultsIfEmpty } from '../../db/seed';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const hasSeededRef = useRef(false);

  function handleSession(newSession: Session | null) {
    setSession(newSession);
    setLoading(false);
    if (newSession && !hasSeededRef.current) {
      hasSeededRef.current = true;
      seedDefaultsIfEmpty().catch((err) => console.error('Failed to seed defaults:', err));
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => handleSession(data.session));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      handleSession(newSession);
    });

    return () => subscription.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
