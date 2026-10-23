import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useContent } from '../lib/content';
import { EditableText } from './EditableText';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'turnaround',
    category: 'TIMELINE',
    question: 'What is your standard turnaround time for edits?',
    answer:
      'For short-form reels, TikToks, and Shorts, turnaround is typically 24 to 48 hours per video. For long-form YouTube videos (8–20 minutes), standard turnaround is 3 to 5 business days per rough cut, followed by 24-hour turnaround on revision passes. Rush options are available on request.',
  },
  {
    id: 'revisions',
    category: 'PROCESS',
    question: 'How do revisions and feedback cycles work?',
    answer:
      'Every project includes 2 revision rounds at no extra charge. I deliver review links via Frame.io or timestamped video portals so you can leave notes directly on the timeline. Revisions are usually turned around in under 24 hours.',
  },
  {
    id: 'software',
    category: 'WORKFLOW',
    question: 'What editing suite and tools do you use?',
    answer:
      'My primary NLE is Adobe Premiere Pro, paired with After Effects for kinetic typography, VFX, and motion graphics. For finishing, I handle color grading in DaVinci Resolve Studio. I also use CapCut for rapid mobile-first pacing when requested.',
  },
  {
    id: 'retainer',
    category: 'PRICING',
    question: 'Do you offer monthly retainers or batch packages?',
    answer:
      'Yes. Most of my creator and brand clients work on recurring monthly retainers (such as 8–12 short-form videos/month or 4 long-form videos/month). Retainers lock in dedicated weekly calendar bandwidth, priority turnaround, and consistent visual style.',
  },
  {
    id: 'assets',
    category: 'FOOTAGE',
    question: 'How should I send footage and project assets?',
    answer:
      'You can share footage via Google Drive, Dropbox, Frame.io, or WeTransfer. I work with raw camera footage (4K Log/RAW), screen recordings, audio tracks, and brand kits. If needed, I also source licensed stock footage, sound effects, and music.',
  },
  {
    id: 'style',
    category: 'CREATIVE',
    question: 'Can you match my existing editing style or channel aesthetics?',
    answer:
      'Absolutely. Send over 2–3 reference links or your previous top-performing uploads. I will deconstruct the pacing, sound design, font hierarchy, and color tone to match your signature feel.',
  },
];

export const FAQ: React.FC = () => {
  const { content } = useContent();
  const faqs = content.faqs && content.faqs.length > 0 ? content.faqs : FAQ_ITEMS;
  const [openId, setOpenId] = useState<string | null>(() => (faqs[0]?.id || null));

  // Dynamically synchronize live FAQPage JSON-LD for rich snippet SEO
  useEffect(() => {
    if (!faqs || faqs.length === 0) return;
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };

    let script = document.getElementById('faq-jsonld') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'faq-jsonld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd);

    return () => {
      // Keep script in head
    };
  }, [faqs]);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      aria-label="Frequently Asked Questions"
      className="py-24 relative border-t border-[var(--border)]"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Single subtle kicker */}
        <div className="flex items-center gap-3 mb-10">
          <EditableText
            textKey="faq.kicker"
            defaultText="FAQ"
            className="font-mono text-xs text-[var(--accent)] font-semibold tracking-wider"
          />
          <span className="h-px w-8 bg-[var(--border)]" />
          <EditableText
            textKey="faq.subkicker"
            defaultText="Questions & Answers"
            className="text-xs font-mono text-[var(--text-muted)]"
          />
        </div>

        {/* Section Heading */}
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-4">
            <EditableText textKey="faq.heading" defaultText="Questions people often ask." />
          </h2>
          <p className="text-[var(--text-muted)] text-sm sm:text-base">
            <EditableText
              textKey="faq.intro"
              defaultText="Turnaround times, project scopes, revisions, and how to get started. Have a question not listed here?"
            />{' '}
            <a href="#contact" className="text-[var(--accent)] hover:underline underline-offset-4">
              <EditableText textKey="faq.contact_link" defaultText="Send me a message" />
            </a>
            .
          </p>
        </div>

        {/* Simple Divided List (no chunky cards) */}
        <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]" role="region" aria-label="FAQ Accordion">
          {faqs.map((item, idx) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id} className="py-2">
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${item.id}`}
                  id={`faq-question-${item.id}`}
                  className="w-full py-4 flex items-center justify-between gap-4 text-left cursor-pointer focus-visible:outline-none group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="font-mono text-xs text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors shrink-0">
                      0{idx + 1}
                    </span>
                    <span className="text-base sm:text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {item.question}
                    </span>
                  </div>
                  <div className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors shrink-0 p-1">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.5} />
                    ) : (
                      <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${item.id}`}
                    role="region"
                    aria-labelledby={`faq-question-${item.id}`}
                    className="pb-5 pl-7 pr-2 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed"
                  >
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
