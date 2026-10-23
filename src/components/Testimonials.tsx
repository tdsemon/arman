import React from 'react';
import { ExternalLink } from 'lucide-react';
import { TESTIMONIALS, TestimonialItem } from '../data/portfolioData';
import { useContent } from '../lib/content';
import { EditableText } from './EditableText';

export const Testimonials: React.FC = () => {
  const { content } = useContent();
  const list = content.testimonials && content.testimonials.length > 0 ? content.testimonials : TESTIMONIALS;

  const col1 = list.filter((_, i) => i % 2 === 0);
  const col2 = list.filter((_, i) => i % 2 === 1);

  const renderCard = (item: TestimonialItem, isFeatured: boolean = false) => (
    <div
      key={item.id}
      className={`rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-accent)] transition-colors duration-150 p-6 sm:p-7 flex flex-col justify-between ${
        isFeatured ? 'sm:p-8 bg-[var(--surface-elevated)]' : ''
      }`}
    >
      <div>
        {/* Scope badge */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border-subtle)] mb-5">
          <span className="text-xs font-mono text-[var(--accent)] font-semibold">
            {item.projectScope}
          </span>
          {item.clientUrl && (
            <a
              href={item.clientUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 text-xs font-mono"
              aria-label={`Visit ${item.clientName}'s page`}
            >
              <span>Visit</span>
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
            </a>
          )}
        </div>

        {/* Quote */}
        <p className={`text-[var(--text)] leading-relaxed ${isFeatured ? 'text-base sm:text-lg font-medium' : 'text-sm sm:text-base'}`}>
          "{item.quote}"
        </p>
      </div>

      {/* Client Meta with real photo */}
      <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center gap-3.5">
        <div className="relative w-10 h-10 shrink-0">
          {item.avatarImage ? (
            <>
              <img
                src={item.avatarImage}
                alt={item.clientName}
                className="w-10 h-10 rounded-full object-cover object-[center_20%] border border-[var(--border)]"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                  const fb = e.currentTarget.parentElement?.querySelector('.avatar-fallback') as HTMLElement;
                  if (fb) fb.style.display = 'flex';
                }}
              />
              <div className="avatar-fallback hidden absolute inset-0 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] items-center justify-center font-mono text-xs font-bold text-[var(--text-primary)]">
                {item.avatarPlaceholder}
              </div>
            </>
          ) : (
            <div className="w-10 h-10 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center font-mono text-xs font-bold text-[var(--text-primary)]">
              {item.avatarPlaceholder}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="text-sm font-bold text-[var(--text-primary)] truncate">
            {item.clientName}
          </div>
          <div className="text-xs text-[var(--text-muted)] font-mono truncate">
            {item.clientRole} · {item.clientChannelOrBrand}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section 
      id="testimonials" 
      aria-label="Client Testimonials and Feedback"
      className="py-24 relative border-t border-[var(--border)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <EditableText
              textKey="testimonials.kicker"
              defaultText="TESTIMONIALS"
              className="font-mono text-xs text-[var(--accent)] font-semibold tracking-wider"
            />
            <span className="h-px w-8 bg-[var(--border)]" />
            <EditableText
              textKey="testimonials.subkicker"
              defaultText="Client Feedback"
              className="text-xs font-mono text-[var(--text-muted)]"
            />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
            <EditableText
              textKey="testimonials.heading"
              defaultText="What clients say about working with me."
            />
          </h2>
          <EditableText
            textKey="testimonials.intro"
            defaultText="Feedback on pacing, communication, fast turnaround, and channel retention."
            as="p"
            className="text-[var(--text-muted)] text-sm sm:text-base mt-2 max-w-xl"
          />
        </div>

        {/* Asymmetrical 2-Column Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* Column 1 */}
          <div className="space-y-6 lg:space-y-8">
            {col1.map((item, index) => renderCard(item, index === 0))}
          </div>

          {/* Column 2 */}
          <div className="space-y-6 lg:space-y-8">
            {col2.map((item, index) => renderCard(item, index === 1))}
          </div>
        </div>

      </div>
    </section>
  );
};
