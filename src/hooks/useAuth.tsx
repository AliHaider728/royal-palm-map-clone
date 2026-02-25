import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { api } from '@/lib/api';
import type { Session, User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  company_name: string | null;
  full_name: string | null;
  email: string;
  phone: string | null;
  logo_url: string | null;
  bio: string | null;
  is_active: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: string[];
  isDealer: boolean;
  isSuperadmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, metadata: Record<string, string>) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      const [profileData, rolesData] = await Promise.all([
        api.auth.getProfile(userId),
        api.auth.getUserRoles(userId),
      ]);
      setProfile(profileData as Profile);
      setRoles(rolesData);
    } catch (e) {
      console.error('Error fetching user data:', e);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchUserData(session.user.id), 0);
      } else {
        setProfile(null);
        setRoles([]);
      }
      setIsLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await api.auth.login(email, password);
  };

  const register = async (email: string, password: string, metadata: Record<string, string>) => {
    await api.auth.register(email, password, metadata);
    // After register, assign dealer role via edge function or manually
  };

  const logout = async () => {
    await api.auth.logout();
    setProfile(null);
    setRoles([]);
  };

  const refreshProfile = async () => {
    if (user) await fetchUserData(user.id);
  };

  return (
    <AuthContext.Provider value={{
      session, user, profile, roles,
      isDealer: roles.includes('dealer'),
      isSuperadmin: roles.includes('superadmin'),
      isLoading,
      login, register, logout, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
