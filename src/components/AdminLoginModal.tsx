import React, { useState } from 'react';
import { X, Lock, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { isSupabaseConfigured } from '../lib/supabase';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { login, loginError, lockoutSeconds, rateLimitRemaining } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim() || !password) {
      setLocalError('Please enter both your admin email and password.');
      return;
    }

    setIsSubmitting(true);
    const res = await login(email.trim(), password);
    setIsSubmitting(false);

    if (res.success) {
      setEmail('');
      setPassword('');
      onLoginSuccess();
    } else {
      setLocalError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const isLocked = Boolean(lockoutSeconds && lockoutSeconds > 0);

  return (
    <div
      role="dialog"
      aria-label="Admin Authentication Dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] p-6 sm:p-7 shadow-2xl text-[var(--text)] z-10 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
              <Lock className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Admin Sign In
              </h2>
              <p className="text-xs text-[var(--text-muted)] font-mono">
                Arman Portfolio CMS
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
            aria-label="Close Admin Login Dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Notice if Supabase not configured */}
        {!isSupabaseConfigured && (
          <div className="mt-4 p-3 rounded-xl bg-amber-950/40 border border-amber-600/30 text-amber-200 text-xs leading-relaxed">
            <span className="font-semibold block mb-0.5">Supabase keys missing:</span>
            Add <code className="px-1 py-0.5 rounded bg-black/40 font-mono text-[11px]">VITE_SUPABASE_URL</code> and <code className="px-1 py-0.5 rounded bg-black/40 font-mono text-[11px]">VITE_SUPABASE_ANON_KEY</code> to your <code className="px-1 py-0.5 rounded bg-black/40 font-mono text-[11px]">.env</code> to connect the live database.
          </div>
        )}

        {/* Errors / Rate Limit */}
        {(localError || loginError) && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
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

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="admin-modal-email"
              className="block text-xs font-mono font-semibold text-[var(--text-primary)] mb-1.5 uppercase tracking-wider"
            >
              Admin Email
            </label>
            <input
              id="admin-modal-email"
              type="email"
              autoComplete="username"
              required
              disabled={isLocked || isSubmitting}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="admin-modal-password"
              className="block text-xs font-mono font-semibold text-[var(--text-primary)] mb-1.5 uppercase tracking-wider"
            >
              Password
            </label>
            <input
              id="admin-modal-password"
              type="password"
              autoComplete="current-password"
              required
              disabled={isLocked || isSubmitting}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors disabled:opacity-50"
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
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--accent)] hover:opacity-95 text-[var(--on-accent)] font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : isLocked ? (
              <span>Locked ({lockoutSeconds}s)</span>
            ) : (
              <span>Sign In to Studio</span>
            )}
          </button>
        </form>

        {/* Footer info link */}
        <div className="mt-5 pt-3.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
          <span>Protected by Row Level Security</span>
          <a
            href="/admin"
            className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline"
            onClick={onClose}
          >
            <span>Full page</span>
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
