import React from 'react';
import { Scissors, Layers, Sliders } from 'lucide-react';
import { EDITING_TOOLS } from '../data/portfolioData';
import { useContent } from '../lib/content';
import { EditableText } from './EditableText';

export const About: React.FC = () => {
  const { content } = useContent();
  const brand = content.brand;
  const tools = content.tools && content.tools.length > 0 ? content.tools : EDITING_TOOLS;
  const stats = content.stats && content.stats.length > 0 ? content.stats : [];

  return (
    <section 
      id="about" 
      aria-label="About Arman and Editing Process"
      className="py-24 relative border-t border-[var(--border)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Single subtle section kicker */}
        <div className="flex items-center gap-3 mb-10">
          <EditableText
            textKey="about.kicker"
            defaultText="ABOUT"
            className="font-mono text-xs text-[var(--accent)] font-semibold tracking-wider"
          />
          <span className="h-px w-8 bg-[var(--border)]" />
          <EditableText
            textKey="about.subkicker"
            defaultText="Arman · Video Editor"
            className="text-xs text-[var(--text-muted)] font-mono"
          />
        </div>

        {/* Editorial Layout: First-Person Bio & Optional Portrait Photo */}
        <div className={`grid grid-cols-1 ${brand.portraitUrl ? 'lg:grid-cols-12 gap-12 lg:gap-16' : 'max-w-4xl'} items-start mb-24`}>
          
          {/* Photo Slot (rendered only when authentic portraitUrl is configured) */}
          {brand.portraitUrl ? (
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[var(--surface-elevated)] border border-[var(--border)] group">
                <img
                  src={brand.portraitUrl}
                  alt={`${brand.name} portrait`}
                  className="w-full h-full object-cover grayscale-[25%] contrast-[1.05] group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/80 via-transparent to-transparent pointer-events-none" />
                
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-[var(--surface)]/90 backdrop-blur-md border border-[var(--border)] text-xs font-mono text-[var(--text-muted)] flex items-center justify-between">
                  <span className="text-[var(--text-primary)] font-semibold">{brand.name}</span>
                  <EditableText
                    textKey="about.photo_badge"
                    defaultText="Available for projects"
                    className="text-xs font-mono text-[var(--text-muted)]"
                  />
                </div>
              </div>
            </div>
          ) : null}

          {/* First-Person Bio & Philosophy */}
          <div className={`${brand.portraitUrl ? 'lg:col-span-7' : 'w-full'} flex flex-col justify-between`}>
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-6 leading-tight">
                <EditableText
                  textKey="about.headline"
                  defaultText="I make videos that people actually watch to the end."
                />
              </h2>

              <div className="space-y-4 text-[var(--text)] text-base sm:text-lg leading-relaxed mb-8">
                <EditableText
                  textKey="about.lead"
                  defaultText={brand.aboutCopy || "I am an independent video editor specializing in rhythm, retention, and narrative pacing."}
                  as="p"
                  multiline
                  className="text-[var(--text-primary)] font-medium leading-relaxed"
                />
                <EditableText
                  textKey="about.bio_extended"
                  defaultText={brand.extendedBio || "My workflow revolves around three core pillars: tight pacing, kinetic subtitles, and DaVinci color grading."}
                  as="p"
                  multiline
                  className="text-[var(--text-muted)] text-base leading-relaxed"
                />
                <EditableText
                  textKey="about.philosophy"
                  defaultText="Whether you send over a 60-minute raw podcast recording or 30 unorganized mobile clips, I organize the timeline, find the story beats, cut the dead air, and deliver clean, polished exports ready for upload."
                  as="p"
                  multiline
                  className="text-[var(--text-muted)] text-base leading-relaxed"
                />
              </div>

              {/* Three Clean Practical Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[var(--border)] text-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 font-semibold text-[var(--text-primary)]">
                    <Scissors className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.5} />
                    <EditableText textKey="about.pillar1_title" defaultText="Tight Pacing" />
                  </div>
                  <EditableText
                    textKey="about.pillar1_desc"
                    defaultText="Zero filler, seamless cuts, and rhythmic pacing matched to audience retention."
                    as="p"
                    multiline
                    className="text-xs text-[var(--text-muted)] leading-relaxed"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1.5 font-semibold text-[var(--text-primary)]">
                    <Layers className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.5} />
                    <EditableText textKey="about.pillar2_title" defaultText="Visual Polish" />
                  </div>
                  <EditableText
                    textKey="about.pillar2_desc"
                    defaultText="Legible kinetic subtitles, graphic callouts, and clean zooms that emphasize key points."
                    as="p"
                    multiline
                    className="text-xs text-[var(--text-muted)] leading-relaxed"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1.5 font-semibold text-[var(--text-primary)]">
                    <Sliders className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.5} />
                    <EditableText textKey="about.pillar3_title" defaultText="Sound & Grade" />
                  </div>
                  <EditableText
                    textKey="about.pillar3_desc"
                    defaultText="Balanced dialogue, crisp sound effects, and color grading for accurate skin tones."
                    as="p"
                    multiline
                    className="text-xs text-[var(--text-muted)] leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TOOLS & STACK SECTION (Clean borderless tool logo slot) */}
        <div className="mb-24">
          <div className="flex items-center justify-between mb-8 pb-3 border-b border-[var(--border)]">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                <EditableText textKey="about.tools_heading" defaultText="Software & Tools" />
              </h3>
              <EditableText
                textKey="about.tools_subtitle"
                defaultText="Primary NLE suites and finishing applications I use every day"
                as="p"
                className="text-xs font-mono text-[var(--text-muted)] mt-1"
              />
            </div>
            <span className="text-xs font-mono text-[var(--text-muted)]">{tools.length} Suites</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="rounded-xl bg-[var(--surface)] p-5 transition-colors duration-150"
              >
                <div className="flex items-center gap-3.5 mb-4">
                  {/* Clean borderless tool logo slot */}
                  <div className="w-10 h-10 rounded-lg bg-[var(--surface-elevated)] flex items-center justify-center shrink-0 overflow-hidden p-1.5 border-0">
                    <img
                      src={tool.file || tool.iconImage}
                      alt={tool.alt || `${tool.name} logo`}
                      width={40}
                      height={40}
                      loading="lazy"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">
                      {tool.name}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] font-mono">
                      {tool.category}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {tool.shortDescription || tool.proficiency}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* STATS: PLAIN LARGE-NUMBER ROW WITH NO CARDS */}
        <div className="pt-10 border-t border-[var(--border)]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
            {stats.map((stat) => (
              <div key={stat.id} className="flex flex-col">
                <div className="font-display text-5xl sm:text-6xl font-bold tracking-tight text-[var(--text-primary)] tabular-nums">
                  {stat.value}
                </div>
                <div className="text-sm font-bold text-[var(--text-primary)] mt-2">
                  {stat.label}
                </div>
                {stat.subtext && (
                  <div className="text-xs text-[var(--text-muted)] font-mono mt-1">
                    {stat.subtext}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
