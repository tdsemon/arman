import React from 'react';
import { ArrowLeft, ShieldCheck, Mail, Lock, Server } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContent } from '../lib/content';

export const PrivacyPolicy: React.FC = () => {
  const { content } = useContent();
  const privacy = content.legalPrivacy;
  const contact = content.contact;

  return (
    <div className="pt-28 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO PORTFOLIO</span>
        </Link>
      </div>

      {/* Header */}
      <header className="mb-12 border-b border-[var(--border)] pb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="font-mono text-xs text-[var(--accent)] font-semibold tracking-wider">
            LEGAL // DOCUMENT 01
          </span>
          <span className="h-px w-12 bg-[var(--border)]" />
          <span className="text-xs font-mono text-[var(--text-muted)]">
            LAST UPDATED: {privacy.lastUpdated || 'OCTOBER 2025'}
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-4">
          {privacy.title || 'Privacy Policy'}
        </h1>
        <p className="text-base sm:text-lg text-[var(--text-muted)] leading-relaxed">
          {privacy.subtitle ||
            'Transparent, minimal, and respectful data practices. How Arman handles your inquiry information and browser storage.'}
        </p>
      </header>

      {/* Table of Contents */}
      {privacy.sections && privacy.sections.length > 0 && (
        <nav
          aria-label="Table of Contents"
          className="mb-12 p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
        >
          <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-4">
            Table of Contents
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm font-medium">
            {privacy.sections.map((sec, idx) => (
              <li key={idx}>
                <a
                  href={`#section-${idx + 1}`}
                  className="text-[var(--text)] hover:text-[var(--accent)] transition-colors flex items-center gap-2"
                >
                  <span className="text-xs font-mono text-[var(--accent)]">
                    {String(idx + 1).padStart(2, '0')}.
                  </span>
                  <span>{sec.heading}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Content Sections */}
      <div className="space-y-12 text-base text-[var(--text)] leading-relaxed">
        {privacy.sections?.map((sec, idx) => (
          <section key={idx} id={`section-${idx + 1}`} className="scroll-mt-28">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-3">
              <span className="font-mono text-sm text-[var(--accent)]">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span>{sec.heading}</span>
            </h2>
            <div className="text-[var(--text-muted)] leading-relaxed whitespace-pre-line space-y-3">
              {sec.content}
            </div>
          </section>
        ))}

        {/* Contact direct card */}
        <div className="mt-12 p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Questions regarding privacy or data handling?
            </h3>
            <p className="text-xs font-mono text-[var(--text-muted)] mt-1">
              Direct inbox: {contact.email || 'emraninspired@gmail.com'}
            </p>
          </div>
          <a
            href={`mailto:${contact.email || 'emraninspired@gmail.com'}?subject=Privacy%20Question`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)] transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Send Email</span>
          </a>
        </div>
      </div>
    </div>
  );
};
