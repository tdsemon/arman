import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  LogOut,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowLeft,
  SlidersHorizontal,
  Database,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { isSupabaseConfigured } from '../lib/supabase';
import { AdminDrawer } from '../components/AdminDrawer';
import { PermissionsModal } from '../components/PermissionsModal';

export const AdminPage: React.FC = () => {
  const {
    user,
    isAdmin,
    isLoading: isAuthLoading,
    login,
    logout,
    loginError,
    lockoutSeconds,
    rateLimitRemaining,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const navigate = useNavigate();

  // Enforce noindex dynamically on /admin
  useEffect(() => {
    let metaTag = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    let created = false;
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = 'robots';
      document.head.appendChild(metaTag);
      created = true;
    }
    const originalContent = metaTag.content;
    metaTag.content = 'noindex, nofollow';

    return () => {
      if (created && metaTag) {
        document.head.removeChild(metaTag);
      } else if (metaTag) {
        metaTag.content = originalContent || 'index, follow';
      }
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim() || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const res = await login(email.trim(), password);
    setIsSubmitting(false);

    if (res.success) {
      setEmail('');
      setPassword('');
      setIsDrawerOpen(true);
    } else {
      setLocalError(res.error || 'Login failed. Please verify credentials.');
    }
  };

  const isLocked = Boolean(lockoutSeconds && lockoutSeconds > 0);

  // Loading state during session restoration
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 font-mono text-xs text-[var(--text-muted)]">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
          <span>Restoring admin session...</span>
        </div>
      </div>
    );
  }

  // LOGGED IN ADMIN VIEW
  if (user && isAdmin) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col">
        {/* Admin Top App Bar */}
        <header className="sticky top-0 z-40 px-4 sm:px-8 py-3.5 bg-[var(--surface-elevated)] border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
              <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-[var(--text-primary)]">
                  Arman Studio CMS
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-xs text-[var(--text-muted)] font-mono">
                Logged in as <span className="text-[var(--text-primary)]">{user.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--on-accent)] text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Open Editor</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPermissionsOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-mono text-[var(--accent)] transition-colors cursor-pointer"
              title="Verify RLS and table write permissions"
            >
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Test Permissions</span>
            </button>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)] transition-colors"
            >
              <span>View Site</span>
              <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
            </Link>

            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-rose-950/40 border border-[var(--border)] hover:border-rose-600/40 text-xs font-mono text-[var(--text-muted)] hover:text-rose-300 transition-colors cursor-pointer"
              title="Log out from admin"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </header>

        {/* Dashboard Workspace */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-10">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                Live Content Manager
              </h2>
              <p className="text-xs font-mono text-[var(--text-muted)] mt-1">
                All changes save directly to PostgreSQL with instant cache invalidation.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
              <Database className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.5} />
              <span>Storage Bucket: site-media (2MB limit, WebP)</span>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div
              onClick={() => setIsDrawerOpen(true)}
              className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-accent)] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-[var(--accent)] uppercase font-semibold">
                  Tabs 1–4
                </span>
                <SlidersHorizontal className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
                Projects, Testimonials & FAQ
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Add, reorder, hide or edit short/long videos, customer quotes, and FAQ answers.
              </p>
            </div>

            <div
              onClick={() => setIsDrawerOpen(true)}
              className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-accent)] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-[var(--accent)] uppercase font-semibold">
                  Tabs 5–7
                </span>
                <SlidersHorizontal className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
                Bio, Stats & Contact
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Update hero headlines, about text, portrait photo, stats numbers, WhatsApp and email.
              </p>
            </div>

            <div
              onClick={() => setIsDrawerOpen(true)}
              className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-accent)] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-[var(--accent)] uppercase font-semibold">
                  Tab 8
                </span>
                <Sparkles className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
                Default Theme & Pet
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Pick default aesthetic theme, cursor companion pet, and default sound preference.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-[var(--text-primary)]">
                Editor Drawer is ready
              </h4>
              <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">
                Click "Open Editor" anytime to slide out the editing panel.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] font-semibold text-xs uppercase tracking-wider cursor-pointer hover:opacity-95 transition-opacity"
            >
              Open Editor Drawer
            </button>
          </div>
        </main>

        {/* The Slide-In Drawer */}
        <AdminDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

        {/* Live Permissions Diagnostic Modal */}
        <PermissionsModal
          isOpen={isPermissionsOpen}
          onClose={() => setIsPermissionsOpen(false)}
        />
      </div>
    );
  }

  // LOGGED IN BUT NOT AN ADMIN VIEW
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col justify-center items-center px-4 py-12 selection:bg-[var(--accent)]/30 selection:text-[var(--text-primary)]">
        <div className="max-w-lg w-full">
          {/* Back Link */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Back to portfolio</span>
            </Link>
          </div>

          <div className="rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] p-7 sm:p-8 shadow-2xl space-y-6">
            {/* Warning Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/50 border border-rose-500/40 font-mono text-xs text-rose-300">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>ACCESS RESTRICTED</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
                You're logged in but not an admin
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-mono">
                You have authenticated successfully as <span className="text-[var(--text-primary)] font-bold">{user.email}</span>, but your account is not registered in the database <code className="px-1.5 py-0.5 rounded bg-[var(--surface)] text-[var(--accent)]">public.admins</code> table.
              </p>
            </div>

            {/* User Details Box */}
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3 text-xs font-mono">
              <div>
                <div className="text-[var(--text-muted)] text-[11px] uppercase tracking-wider mb-1">Authenticated Email</div>
                <div className="text-[var(--text-primary)] font-semibold">{user.email}</div>
              </div>
              <div>
                <div className="text-[var(--text-muted)] text-[11px] uppercase tracking-wider mb-1">Supabase User UUID</div>
                <div className="select-all p-2 rounded bg-black/40 text-[var(--accent)] break-all border border-[var(--border)]">
                  {user.id}
                </div>
              </div>
            </div>

            {/* Instruction on how to get authorized */}
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs leading-relaxed space-y-2">
              <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>How to grant admin access:</span>
              </div>
              <p className="font-mono text-[11px]">
                Ask the site owner to add you as an editor using the Admins tab in the CMS, or run this in the Supabase SQL Editor:
              </p>
              <pre className="p-2.5 rounded bg-black/50 text-[11px] font-mono text-amber-200 overflow-x-auto border border-amber-500/20 select-all">
{`insert into public.admins (user_id, email, role)
values ('${user.id}', '${user.email}', 'editor')
on conflict (user_id) do update set role = 'editor';`}
              </pre>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsPermissionsOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] text-xs font-bold font-mono cursor-pointer hover:opacity-90 transition-opacity"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Test my permissions</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  await logout();
                  navigate('/admin');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--surface)] hover:bg-rose-950/40 text-[var(--text-muted)] hover:text-rose-300 border border-[var(--border)] hover:border-rose-600/40 text-xs font-mono transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>

        <PermissionsModal
          isOpen={isPermissionsOpen}
          onClose={() => setIsPermissionsOpen(false)}
        />
      </div>
    );
  }

  // UN-AUTHENTICATED LOGIN SCREEN
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col justify-center items-center px-4 py-12 selection:bg-[var(--accent)]/30 selection:text-[var(--text-primary)]">
      <div className="max-w-md w-full">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Back to portfolio</span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] p-7 sm:p-8 shadow-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)] font-mono text-xs text-[var(--text-muted)] mb-5">
            <Lock className="w-3.5 h-3.5 text-[var(--accent)]" strokeWidth={1.5} />
            <span>RESTRICTED ACCESS</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
            Studio Admin
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-6 font-mono">
            Sign in with your verified admin credentials to edit portfolio content live.
          </p>

          {/* Warning if Supabase is unconfigured */}
          {!isSupabaseConfigured && (
            <div className="mb-6 p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
              <span className="font-semibold block mb-1">Database configuration needed:</span>
              <p className="mb-2">
                Supabase credentials are not detected in <code className="px-1 py-0.5 rounded bg-black/40 font-mono text-[11px]">.env</code>.
              </p>
              <p className="font-mono text-[11px] text-amber-300">
                1. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env<br />
                2. Run the provided supabase/schema.sql in Supabase SQL editor<br />
                3. Create your admin user in Supabase Authentication
              </p>
            </div>
          )}

          {/* Error Message */}
          {(localError || loginError) && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1 leading-relaxed">
                {localError || loginError}
                {isLocked && (
                  <div className="mt-1 font-mono font-bold text-rose-200">
                    Locked for {lockoutSeconds} seconds
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-mono font-semibold text-[var(--text-primary)] mb-1.5 uppercase tracking-wider"
              >
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                required
                disabled={isLocked || isSubmitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-mono font-semibold text-[var(--text-primary)] mb-1.5 uppercase tracking-wider"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                disabled={isLocked || isSubmitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors disabled:opacity-50"
              />
            </div>

            {rateLimitRemaining < 5 && !isLocked && (
              <p className="text-xs text-[var(--text-muted)] font-mono">
                {rateLimitRemaining} attempts remaining before temporary lockout.
              </p>
            )}

            <button
              type="submit"
              disabled={isLocked || isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--accent)] hover:opacity-95 text-[var(--on-accent)] font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : isLocked ? (
                <span>Locked for {lockoutSeconds}s</span>
              ) : (
                <span>Log In to Studio</span>
              )}
            </button>
          </form>

          {/* Footer security disclaimer */}
          <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] text-center text-xs font-mono text-[var(--text-muted)]">
            <span>Client-side rate limited · RLS authenticated</span>
          </div>
        </div>
      </div>
    </div>
  );
};
