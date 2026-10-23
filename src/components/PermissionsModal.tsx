import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, Loader2, X, RefreshCw, Database } from 'lucide-react';
import { runPermissionDiagnostics, DiagnosticResult } from '../lib/diagnostics';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({ isOpen, onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[] | null>(null);

  const executeDiagnostics = async () => {
    setIsRunning(true);
    try {
      const res = await runPermissionDiagnostics();
      setResults(res);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isOpen && !results && !isRunning) {
      executeDiagnostics();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const hasFailures = results?.some((r) => r.status === 'fail');
  const allPassed = results && results.length > 0 && !hasFailures;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Database Permissions Diagnostic Test"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Database Permissions Diagnostics
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-mono">
                Real-time RLS and table write verification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isRunning}
              onClick={executeDiagnostics}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)] disabled:opacity-50 cursor-pointer transition-colors"
              title="Rerun permissions tests"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin text-[var(--accent)]' : ''}`} />
              <span className="hidden sm:inline">Rerun</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {isRunning && !results ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-xs font-mono text-[var(--text-muted)]">
              <Loader2 className="w-7 h-7 animate-spin text-[var(--accent)]" />
              <span>Testing active database permissions across all tables...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {results?.map((res) => (
                <div
                  key={res.id}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                    res.status === 'pass'
                      ? 'bg-[var(--surface)] border-[var(--border)]'
                      : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {res.status === 'pass' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold font-mono text-[var(--text-primary)]">
                        {res.name}
                      </span>
                      <div className="flex items-center gap-2">
                        {res.durationMs !== undefined && (
                          <span className="text-[10px] font-mono text-[var(--text-muted)]">
                            {res.durationMs}ms
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                            res.status === 'pass'
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {res.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <p
                      className={`text-xs font-mono mt-1 ${
                        res.status === 'pass' ? 'text-[var(--text-muted)]' : 'text-rose-300'
                      }`}
                    >
                      {res.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Outcome Summary */}
          {results && !isRunning && (
            <div
              className={`p-4 rounded-xl border text-xs font-mono flex items-start gap-3 ${
                allPassed
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
              }`}
            >
              <Database className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">
                  {allPassed ? 'Diagnostic Verification Passed' : 'Permission Issues Detected'}
                </div>
                <p className="mt-1 opacity-90 leading-relaxed">
                  {allPassed
                    ? 'All permissions tests completed successfully. Your authenticated admin session has full read, insert, update, and delete authority across all tables via verified RLS policies.'
                    : 'One or more write probes failed or were blocked by PostgreSQL Row-Level Security (RLS). Please confirm your user UUID is inserted in public.admins.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--border)] bg-[var(--surface)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)] cursor-pointer"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
