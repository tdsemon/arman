import React, { useState, useEffect } from 'react';
import { Mail, MessageCircle, Phone, Send, ArrowUpRight, CheckCircle2, AlertCircle, Loader2, Globe } from 'lucide-react';
import { CONTACT } from '../data/portfolioData';
import { useSound } from '../lib/sound';
import { useContent } from '../lib/content';
import { EditableText } from './EditableText';

const WEB3FORMS_URL = 'https://api.web3forms.com/submit';
const COOLDOWN_KEY = 'arman_portfolio_contact_cooldown';
const COOLDOWN_SECONDS = 30;

interface FormState {
  name: string;
  email: string;
  projectType: string;
  message: string;
  botcheck: string; // honeypot field
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export const Contact: React.FC = () => {
  const { content } = useContent();
  const contact = content.contact || CONTACT;
  const { playSuccess, playError } = useSound();
  const [formData, setFormData] = useState<FormState>({
    name: '',
    email: '',
    projectType: 'Short-Form (TikTok / Reels / Shorts)',
    message: '',
    botcheck: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  // Check cooldown timer on mount and update countdown
  useEffect(() => {
    const checkCooldown = () => {
      try {
        const lastSent = localStorage.getItem(COOLDOWN_KEY);
        if (lastSent) {
          const elapsed = (Date.now() - parseInt(lastSent, 10)) / 1000;
          const remaining = Math.max(0, Math.ceil(COOLDOWN_SECONDS - elapsed));
          setCooldownRemaining(remaining);
        }
      } catch {
        // localStorage unavailable
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Validate form
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Please provide your name or brand name.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please provide brief details about your project.';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check honeypot spam trap
    if (formData.botcheck) {
      // Silently discard bot submission
      setStatus('success');
      return;
    }

    // Check cooldown
    if (cooldownRemaining > 0) {
      setStatus('error');
      setErrorMessage(`Please wait ${cooldownRemaining} seconds before sending another message.`);
      return;
    }

    if (!validate()) return;

    setStatus('sending');
    setErrorMessage('');

    const apiKey = import.meta.env.VITE_WEB3FORMS_KEY;

    if (!apiKey || apiKey === 'your_web3forms_access_key_here') {
      console.warn(
        '[Contact Form Warning] VITE_WEB3FORMS_KEY is missing or using placeholder in environment variables. ' +
        'Please register for a free key at https://web3forms.com and set VITE_WEB3FORMS_KEY in your .env.'
      );
    }

    try {
      const payload = {
        access_key: apiKey || 'demo-placeholder-key',
        subject: `New portfolio inquiry from ${formData.name.trim()} (${formData.projectType})`,
        from_name: formData.name.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        reply_to: formData.email.trim(),
        project_type: formData.projectType,
        message: formData.message.trim(),
        botcheck: formData.botcheck,
      };

      const response = await fetch(WEB3FORMS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && (result.success !== false)) {
        setStatus('success');
        playSuccess();
        setFormData({
          name: '',
          email: '',
          projectType: 'Short-Form (TikTok / Reels / Shorts)',
          message: '',
          botcheck: '',
        });
        setErrors({});

        // Set cooldown timestamp
        try {
          localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
          setCooldownRemaining(COOLDOWN_SECONDS);
        } catch {
          // ignore
        }
      } else {
        throw new Error(result.message || 'Submission failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Contact form submission error:', err);
      setStatus('error');
      playError();
      setErrorMessage(
        err?.message || 'Could not send message through the contact server. Please reach out to me directly.'
      );
    }
  };

  return (
    <section 
      id="contact" 
      aria-label="Contact and Inquiry"
      className="py-24 relative border-t border-[var(--border)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Single subtle kicker */}
        <div className="flex items-center gap-3 mb-10">
          <EditableText
            textKey="contact.kicker"
            defaultText="CONTACT"
            className="font-mono text-xs text-[var(--accent)] font-semibold tracking-wider"
          />
          <span className="h-px w-8 bg-[var(--border)]" />
          <EditableText
            textKey="contact.subkicker"
            defaultText="Get in touch"
            className="text-xs font-mono text-[var(--text-muted)]"
          />
        </div>

        {/* 2-Column Contact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Heading, Channels & Socials */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-6 leading-tight">
                <EditableText textKey="contact.heading" defaultText="Let's work together." />
              </h2>
              <EditableText
                textKey="contact.intro"
                defaultText="Have a project in mind, need recurring video editing, or want to discuss a new video idea? Drop me a message below or reach out directly."
                as="p"
                multiline
                className="text-[var(--text)] text-base sm:text-lg leading-relaxed mb-8"
              />

              {/* Status & Availability Notice */}
              <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2 mb-8 text-xs font-mono">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{contact.status}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                  <Globe className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>{contact.location} · {contact.timezone}</span>
                </div>
              </div>

              {/* Direct Instant Action Buttons */}
              <div className="space-y-3 mb-8">
                {/* Email Direct */}
                {/* Email Direct */}
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--border-accent)] transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
                        <Mail className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="text-xs font-mono text-[var(--text-muted)]">Email Direct</div>
                        <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                          {contact.email}
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-transform" strokeWidth={1.5} />
                  </a>
                )}

                {/* WhatsApp Quick Chat */}
                {contact.whatsapp && (
                  <a
                    href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-emerald-500 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center text-emerald-400">
                        <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="text-xs font-mono text-[var(--text-muted)]">WhatsApp</div>
                        <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-emerald-400 transition-colors">
                          {contact.whatsappDisplay || contact.whatsapp}
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-transform" strokeWidth={1.5} />
                  </a>
                )}

                {/* Direct Phone Call */}
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-sky-500 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center text-sky-400">
                        <Phone className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="text-xs font-mono text-[var(--text-muted)]">Direct Phone</div>
                        <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-sky-400 transition-colors">
                          {contact.phone}
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-transform" strokeWidth={1.5} />
                  </a>
                )}
              </div>
            </div>

            {/* Social Links Row */}
            {Array.isArray(contact.socials) && contact.socials.filter((s) => s.url).length > 0 && (
              <div>
                <div className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider mb-3">
                  Social Profiles
                </div>
                <div className="flex flex-wrap gap-2">
                  {contact.socials
                    .filter((social) => Boolean(social.url))
                    .map((social) => (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--border-accent)] text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
                      >
                        <span>{social.name}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[var(--text-muted)]" strokeWidth={1.5} />
                      </a>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 sm:p-10 shadow-2xl relative">
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                Project Inquiry
              </h3>
              <p className="text-xs font-mono text-[var(--text-muted)] mb-6">
                Fill in the details below. Messages are routed directly to <span className="text-[var(--accent)] font-semibold">{contact.email}</span>.
              </p>

              {/* Status Announcements (aria-live) */}
              <div aria-live="polite" className="mb-6">
                {status === 'success' && (
                  <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-emerald-500/40 flex items-start gap-3 text-emerald-400 text-sm animate-fadeIn">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">Message sent, I'll reply soon!</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Thank you for reaching out. I usually review footage requests and return quotes within 24 hours.
                      </p>
                    </div>
                  </div>
                )}

                {status === 'error' && (
                  <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-rose-500/40 flex items-start gap-3 text-rose-400 text-sm animate-fadeIn">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">Unable to send message</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        {errorMessage || 'There was a connection issue with the submission server.'}{' '}
                        Please email me directly at{' '}
                        <a
                          href={`mailto:${contact.email}?subject=Project%20Inquiry%20from%20Portfolio`}
                          className="text-[var(--accent)] underline font-medium hover:text-[var(--accent-hover)]"
                        >
                          {contact.email}
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Honeypot field (hidden from screen reader & visuals) */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="botcheck">Do not fill this field</label>
                  <input
                    id="botcheck"
                    type="text"
                    name="botcheck"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.botcheck}
                    onChange={(e) => setFormData({ ...formData, botcheck: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-mono text-[var(--text-muted)] mb-2">
                      YOUR NAME / BRAND *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      disabled={status === 'sending'}
                      placeholder="e.g. Alex Rivera"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: undefined });
                      }}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'contact-name-error' : undefined}
                      className={`w-full px-4 py-3 rounded-xl bg-[var(--bg)] border text-[var(--text-primary)] placeholder-[var(--text-muted)]/50 text-sm focus:border-[var(--border-accent)] focus:ring-1 focus:ring-[var(--border-accent)] transition-colors outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
                        errors.name ? 'border-rose-500/70' : 'border-[var(--border)]'
                      }`}
                    />
                    {errors.name && (
                      <p id="contact-name-error" className="mt-1 text-xs text-rose-400 font-mono">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-mono text-[var(--text-muted)] mb-2">
                      EMAIL ADDRESS *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      disabled={status === 'sending'}
                      placeholder="alex@channel.com"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'contact-email-error' : undefined}
                      className={`w-full px-4 py-3 rounded-xl bg-[var(--bg)] border text-[var(--text-primary)] placeholder-[var(--text-muted)]/50 text-sm focus:border-[var(--border-accent)] focus:ring-1 focus:ring-[var(--border-accent)] transition-colors outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
                        errors.email ? 'border-rose-500/70' : 'border-[var(--border)]'
                      }`}
                    />
                    {errors.email && (
                      <p id="contact-email-error" className="mt-1 text-xs text-rose-400 font-mono">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Project Type Dropdown */}
                <div>
                  <label htmlFor="contact-project-type" className="block text-xs font-mono text-[var(--text-muted)] mb-2">
                    PROJECT FORMAT & SCOPE
                  </label>
                  <select
                    id="contact-project-type"
                    disabled={status === 'sending'}
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm focus:border-[var(--border-accent)] focus:ring-1 focus:ring-[var(--border-accent)] transition-colors outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="Short-Form (TikTok / Reels / Shorts)">Short-Form Videos (TikTok / Reels / YouTube Shorts)</option>
                    <option value="YouTube Long-Form Video">YouTube Long-Form Video (Documentary / Talking Head / Essay)</option>
                    <option value="Commercial / Brand Anthem">Commercial / Brand Anthem (4K Ad / Product Reveal)</option>
                    <option value="Motion Graphics & VFX">Motion Graphics, Title Sequences & VFX Polish</option>
                    <option value="Full-Channel Editing Retainer">Monthly Video Editing Retainer (Weekly batches)</option>
                    <option value="Other Inquiry">Other Custom Video Editing Project</option>
                  </select>
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="contact-message" className="block text-xs font-mono text-[var(--text-muted)] mb-2">
                    PROJECT BRIEF & DEADLINE * (MIN 10 CHARS)
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    disabled={status === 'sending'}
                    placeholder="Tell me about your channel/brand, footage amount, preferred style references, and target timeline..."
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if (errors.message) setErrors({ ...errors, message: undefined });
                    }}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'contact-message-error' : undefined}
                    className={`w-full px-4 py-3 rounded-xl bg-[var(--bg)] border text-[var(--text-primary)] placeholder-[var(--text-muted)]/50 text-sm focus:border-[var(--border-accent)] focus:ring-1 focus:ring-[var(--border-accent)] transition-colors outline-none resize-y disabled:opacity-60 disabled:cursor-not-allowed ${
                      errors.message ? 'border-rose-500/70' : 'border-[var(--border)]'
                    }`}
                  />
                  {errors.message && (
                    <p id="contact-message-error" className="mt-1 text-xs text-rose-400 font-mono">
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={status === 'sending' || cooldownRemaining > 0}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] font-semibold text-sm tracking-wide uppercase transition-colors duration-150 active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'sending' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending inquiry...</span>
                    </>
                  ) : cooldownRemaining > 0 ? (
                    <span>Wait {cooldownRemaining}s to re-send</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Project Inquiry</span>
                    </>
                  )}
                </button>

                <p className="text-xs font-mono text-center text-[var(--text-muted)]">
                  Confidentiality guaranteed · Direct response within 24 hours.
                </p>
              </form>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
