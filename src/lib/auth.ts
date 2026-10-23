/**
 * ==============================================================================
 * ARMAN PORTFOLIO — ADMIN AUTHENTICATION CONTEXT & CLIENT-SIDE RATE LIMITING
 * ==============================================================================
 * Handles Supabase email/password authentication, admin verification,
 * session persistence, rate-limiting on login attempts, and clean signout.
 * ==============================================================================
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';

const RATE_LIMIT_KEY = 'arman_admin_login_rate_limit';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds

interface RateLimitData {
  attempts: number;
  lockoutUntil: number | null;
}

function getRateLimitData(): RateLimitData {
  if (typeof window === 'undefined') return { attempts: 0, lockoutUntil: null };
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    if (raw) {
      const data: RateLimitData = JSON.parse(raw);
      if (data.lockoutUntil && Date.now() > data.lockoutUntil) {
        // Lockout expired
        return { attempts: 0, lockoutUntil: null };
      }
      return data;
    }
  } catch {
    // ignore
  }
  return { attempts: 0, lockoutUntil: null };
}

function recordFailedAttempt(): { remaining: number; lockoutSeconds: number | null } {
  const current = getRateLimitData();
  const nextAttempts = current.attempts + 1;

  if (nextAttempts >= MAX_ATTEMPTS) {
    const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
    try {
      localStorage.setItem(
        RATE_LIMIT_KEY,
        JSON.stringify({ attempts: nextAttempts, lockoutUntil })
      );
    } catch {
      // ignore
    }
    return { remaining: 0, lockoutSeconds: 60 };
  }

  try {
    localStorage.setItem(
      RATE_LIMIT_KEY,
      JSON.stringify({ attempts: nextAttempts, lockoutUntil: null })
    );
  } catch {
    // ignore
  }
  return { remaining: MAX_ATTEMPTS - nextAttempts, lockoutSeconds: null };
}

function resetRateLimit(): void {
  try {
    localStorage.removeItem(RATE_LIMIT_KEY);
  } catch {
    // ignore
  }
}

export type AdminRole = 'owner' | 'editor';

export interface AdminUserRecord {
  user_id: string;
  email: string;
  role: AdminRole;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isOwner: boolean;
  role: AdminRole | null;
  isLoading: boolean;
  loginError: string | null;
  rateLimitRemaining: number;
  lockoutSeconds: number | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAdminRole: (userId: string) => Promise<{ isAdmin: boolean; role: AdminRole | null }>;
  getAdminsList: () => Promise<AdminUserRecord[]>;
  addEditor: (email: string, userId: string) => Promise<{ success: boolean; error?: string }>;
  removeAdmin: (userId: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [rateLimitRemaining, setRateLimitRemaining] = useState<number>(MAX_ATTEMPTS);
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);

  // Check rate limit timer
  useEffect(() => {
    const checkRateLimit = () => {
      const data = getRateLimitData();
      if (data.lockoutUntil && Date.now() < data.lockoutUntil) {
        setLockoutSeconds(Math.ceil((data.lockoutUntil - Date.now()) / 1000));
        setRateLimitRemaining(0);
      } else {
        setLockoutSeconds(null);
        setRateLimitRemaining(Math.max(0, MAX_ATTEMPTS - data.attempts));
      }
    };

    checkRateLimit();
    const interval = setInterval(checkRateLimit, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkAdminRole = useCallback(async (userId: string): Promise<{ isAdmin: boolean; role: AdminRole | null }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { isAdmin: false, role: null };
    }
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('user_id, email, role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.warn('[Admin Verification Error]', error.message);
        return { isAdmin: false, role: null };
      }

      if (data && data.user_id) {
        const userRole = (data.role as AdminRole) || 'editor';
        return { isAdmin: true, role: userRole };
      }
      return { isAdmin: false, role: null };
    } catch {
      return { isAdmin: false, role: null };
    }
  }, []);

  // Initialize active session on mount & subscribe to auth state changes
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const { isAdmin: adminOk, role: userRole } = await checkAdminRole(session.user.id);
        setIsAdmin(adminOk);
        setRole(userRole);
        setIsOwner(userRole === 'owner');
      } else {
        setIsAdmin(false);
        setRole(null);
        setIsOwner(false);
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        const { isAdmin: adminOk, role: userRole } = await checkAdminRole(newSession.user.id);
        setIsAdmin(adminOk);
        setRole(userRole);
        setIsOwner(userRole === 'owner');
      } else {
        setIsAdmin(false);
        setRole(null);
        setIsOwner(false);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [checkAdminRole]);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setLoginError(null);

    // Verify rate limit
    const rateData = getRateLimitData();
    if (rateData.lockoutUntil && Date.now() < rateData.lockoutUntil) {
      const seconds = Math.ceil((rateData.lockoutUntil - Date.now()) / 1000);
      const msg = `Too many failed login attempts. Please wait ${seconds}s before trying again.`;
      setLoginError(msg);
      return { success: false, error: msg };
    }

    if (!isSupabaseConfigured || !supabase) {
      const msg = 'Supabase credentials are not configured in .env yet. Please paste your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY into .env.';
      setLoginError(msg);
      return { success: false, error: msg };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });

      if (error) {
        const { remaining, lockoutSeconds: lockout } = recordFailedAttempt();
        setRateLimitRemaining(remaining);
        setLockoutSeconds(lockout);
        const warning = lockout
          ? `Too many failed attempts. Locked for ${lockout} seconds.`
          : `Invalid email or password. ${remaining} attempts remaining before lockout.`;
        setLoginError(warning);
        return { success: false, error: warning };
      }

      if (data.user) {
        resetRateLimit();
        setUser(data.user);
        setSession(data.session);
        const { isAdmin: adminOk, role: userRole } = await checkAdminRole(data.user.id);
        setIsAdmin(adminOk);
        setRole(userRole);
        setIsOwner(userRole === 'owner');
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (err: any) {
      const msg = err?.message || 'Authentication error occurred';
      setLoginError(msg);
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setIsOwner(false);
    setRole(null);
  };

  const getAdminsList = async (): Promise<AdminUserRecord[]> => {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []).map((row: any) => ({
        user_id: row.user_id,
        email: row.email || 'Admin',
        role: (row.role as AdminRole) || 'editor',
        created_at: row.created_at,
      }));
    } catch (err) {
      console.warn('Failed to fetch admins list:', err);
      return [];
    }
  };

  const addEditor = async (email: string, userId: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase is not configured' };
    }
    try {
      const { data, error } = await supabase
        .from('admins')
        .insert({
          user_id: userId.trim(),
          email: email.trim().toLowerCase(),
          role: 'editor',
        })
        .select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Failed to add editor: 0 rows affected. RLS may restrict admin insertion to owners.');
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to add editor' };
    }
  };

  const removeAdmin = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase is not configured' };
    }
    if (user?.id === userId) {
      return { success: false, error: 'You cannot remove your own admin account.' };
    }
    try {
      const { data, error } = await supabase
        .from('admins')
        .delete()
        .eq('user_id', userId)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Failed to remove admin: 0 rows affected. RLS may restrict admin deletion to owners.');
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to remove admin' };
    }
  };

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        session,
        isAdmin,
        isOwner,
        role,
        isLoading,
        loginError,
        rateLimitRemaining,
        lockoutSeconds,
        login,
        logout,
        checkAdminRole,
        getAdminsList,
        addEditor,
        removeAdmin,
      },
    },
    children
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
