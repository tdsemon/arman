import React, { useState } from 'react';
import { Smartphone, Tv, Play, Clock, ArrowRight, FolderX } from 'lucide-react';
import { ProjectItem } from '../data/portfolioData';
import { useContent } from '../lib/content';
import { EditableText } from './EditableText';

interface ProjectsProps {
  onSelectProject: (project: ProjectItem) => void;
}

export const Projects: React.FC<ProjectsProps> = ({ onSelectProject }) => {
  const { content } = useContent();
  const [activeTab, setActiveTab] = useState<'short' | 'long'>('short');
  const [, setHoveredProjectId] = useState<string | null>(null);

  // Filter visible projects only (or all if visible is undefined)
  const shortProjects = (content.projects.short || []).filter((p) => p.visible !== false);
  const longProjects = (content.projects.long || []).filter((p) => p.visible !== false);

  return (
    <section 
      id="projects" 
      aria-label="Selected Video Projects"
      className="py-24 relative border-t border-[var(--border)] bg-[var(--bg)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Single clean section kicker */}
        <div className="flex items-center gap-3 mb-8">
          <EditableText
            textKey="projects.kicker"
            defaultText="PROJECTS"
            className="font-mono text-xs text-[var(--accent)] font-semibold tracking-wider"
          />
          <span className="h-px w-8 bg-[var(--border)]" />
          <EditableText
            textKey="projects.subkicker"
            defaultText="Selected Cuts"
            className="text-xs text-[var(--text-muted)] font-mono"
          />
        </div>

        {/* Section Header with Segmented Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
              <EditableText textKey="projects.heading" defaultText="Selected work." />
            </h2>
            <EditableText
              textKey="projects.intro"
              defaultText="Recent short-form reels and long-form YouTube cuts. Click any video to open the player."
              as="p"
              className="text-[var(--text-muted)] text-sm sm:text-base mt-2 max-w-xl"
            />
          </div>

          {/* Segmented Control / Tabs */}
          <div 
            role="tablist"
            aria-label="Video Format Filter"
            className="inline-flex p-1 rounded-xl bg-[var(--surface)] border border-[var(--border)] self-start md:self-auto shrink-0"
          >
            <button
              role="tab"
              aria-selected={activeTab === 'short'}
              onClick={() => setActiveTab('short')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold tracking-wide transition-colors duration-150 cursor-pointer ${
                activeTab === 'short'
                  ? 'bg-[var(--accent)] text-[var(--on-accent)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Smartphone className="w-4 h-4" strokeWidth={1.5} />
              <EditableText textKey="projects.tab_short" defaultText="Short Videos (9:16)" />
              <span className="ml-1 text-xs font-mono opacity-80">{shortProjects.length}</span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'long'}
              onClick={() => setActiveTab('long')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold tracking-wide transition-colors duration-150 cursor-pointer ${
                activeTab === 'long'
                  ? 'bg-[var(--accent)] text-[var(--on-accent)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Tv className="w-4 h-4" strokeWidth={1.5} />
              <EditableText textKey="projects.tab_long" defaultText="Long Videos (16:9)" />
              <span className="ml-1 text-xs font-mono opacity-80">{longProjects.length}</span>
            </button>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* TAB 1: SHORT VIDEOS (9:16 VERTICAL CARDS)                           */}
        {/* ==================================================================== */}
        {activeTab === 'short' && (
          <>
            {shortProjects.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center rounded-2xl bg-[var(--surface)] border border-dashed border-[var(--border)] p-8">
                <FolderX className="w-10 h-10 text-[var(--text-muted)] mb-3 opacity-60" />
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
                  No short-form projects published yet
                </h3>
                <EditableText
                  textKey="projects.empty_short"
                  defaultText="Check back soon or request a custom sample video for your channel."
                  as="p"
                  className="text-xs text-[var(--text-muted)] font-mono max-w-md"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 sm:gap-8">
                {shortProjects.map((project, index) => (
                  <div
                    key={project.id}
                    data-project-card="true"
                    onMouseEnter={() => setHoveredProjectId(project.id)}
                    onMouseLeave={() => setHoveredProjectId(null)}
                    onClick={() => onSelectProject(project)}
                    className="group relative cursor-pointer flex flex-col rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-accent)] transition-all duration-200 overflow-hidden shadow-lg"
                  >
                    {/* 9:16 Vertical Thumbnail Frame */}
                    <div className="relative aspect-[9/16] w-full overflow-hidden bg-black">
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Gradient Scrim */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[color-mix(in_srgb,var(--bg)_95%,transparent)] via-[color-mix(in_srgb,var(--bg)_40%,transparent)] to-transparent group-hover:via-[color-mix(in_srgb,var(--bg)_25%,transparent)] transition-colors" />

                      {/* Top Bar on Card: Index & Duration */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between text-xs font-mono">
                        <span className="px-2 py-0.5 rounded bg-[color-mix(in_srgb,var(--surface-elevated)_90%,transparent)] backdrop-blur-md text-[var(--text)] border border-[var(--border)]">
                          0{index + 1} · 9:16
                        </span>
                        {project.duration && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[color-mix(in_srgb,var(--surface-elevated)_90%,transparent)] backdrop-blur-md text-[var(--text)] border border-[var(--border)]">
                            <Clock className="w-3.5 h-3.5 text-[var(--accent)]" strokeWidth={1.5} />
                            {project.duration}
                          </span>
                        )}
                      </div>

                      {/* Center Play Overlay on Hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <div className="w-14 h-14 rounded-full bg-[var(--accent)] text-[var(--on-accent)] flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-200">
                          <Play className="w-6 h-6 fill-current ml-0.5" strokeWidth={1.5} />
                        </div>
                      </div>

                      {/* Bottom Information Overlay Inside Media Frame */}
                      <div className="absolute inset-x-0 bottom-0 p-4 space-y-1.5 bg-[color-mix(in_srgb,var(--bg)_85%,transparent)] backdrop-blur-sm border-t border-[var(--border-subtle)]">
                        <div className="text-xs font-mono text-[var(--accent)] uppercase tracking-wider font-semibold">
                          {project.category}
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-snug group-hover:text-[var(--accent)] transition-colors">
                          {project.title}
                        </h3>

                        {project.highlightStat && (
                          <div className="text-xs text-[var(--text-muted)] font-mono flex items-center gap-1.5 pt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>{project.highlightStat}</span>
                          </div>
                        )}

                        {/* Optional custom fields */}
                        {project.customFields && project.customFields.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {project.customFields.map((cf, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded bg-[var(--surface)] text-[10px] font-mono text-[var(--text-muted)] border border-[var(--border)]">
                                <span className="text-[var(--accent)]">{cf.label}:</span> {cf.value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Card Footer: Tools & Play Action */}
                    <div className="p-3.5 bg-[var(--surface-elevated)] border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2 truncate">
                        {project.toolsUsed.slice(0, 2).map((t) => (
                          <span key={t} className="text-[var(--text-muted)] text-xs">
                            {t}
                          </span>
                        ))}
                      </div>

                      <span className="text-[var(--accent)] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Play</span>
                        <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: LONG VIDEOS (16:9 WIDESCREEN CARDS)                          */}
        {/* ==================================================================== */}
        {activeTab === 'long' && (
          <>
            {longProjects.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center rounded-2xl bg-[var(--surface)] border border-dashed border-[var(--border)] p-8">
                <FolderX className="w-10 h-10 text-[var(--text-muted)] mb-3 opacity-60" />
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
                  No long-form projects published yet
                </h3>
                <EditableText
                  textKey="projects.empty_long"
                  defaultText="Check back soon or request a custom YouTube master cut sample."
                  as="p"
                  className="text-xs text-[var(--text-muted)] font-mono max-w-md"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {longProjects.map((project, index) => (
                  <div
                    key={project.id}
                    data-project-card="true"
                    onMouseEnter={() => setHoveredProjectId(project.id)}
                    onMouseLeave={() => setHoveredProjectId(null)}
                    onClick={() => onSelectProject(project)}
                    className="group relative cursor-pointer flex flex-col rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-accent)] transition-all duration-200 overflow-hidden shadow-lg"
                  >
                    {/* 16:9 Widescreen Thumbnail Frame */}
                    <div className="relative aspect-video w-full overflow-hidden bg-black">
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Gradient Scrim */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[color-mix(in_srgb,var(--bg)_95%,transparent)] via-[color-mix(in_srgb,var(--bg)_35%,transparent)] to-transparent group-hover:via-[color-mix(in_srgb,var(--bg)_20%,transparent)] transition-colors" />

                      {/* Top Bar: Index & Duration */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between text-xs font-mono">
                        <span className="px-2 py-0.5 rounded bg-[color-mix(in_srgb,var(--surface-elevated)_90%,transparent)] backdrop-blur-md text-[var(--text)] border border-[var(--border)]">
                          0{index + 1} · 16:9
                        </span>
                        {project.duration && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[color-mix(in_srgb,var(--surface-elevated)_90%,transparent)] backdrop-blur-md text-[var(--text)] border border-[var(--border)]">
                            <Clock className="w-3.5 h-3.5 text-[var(--accent)]" strokeWidth={1.5} />
                            {project.duration}
                          </span>
                        )}
                      </div>

                      {/* Center Play Overlay on Hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <div className="w-14 h-14 rounded-full bg-[var(--accent)] text-[var(--on-accent)] flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-200">
                          <Play className="w-6 h-6 fill-current ml-0.5" strokeWidth={1.5} />
                        </div>
                      </div>
                    </div>

                    {/* Card Content Below 16:9 Frame */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                          <span className="text-[var(--accent)] uppercase font-semibold">
                            {project.category}
                          </span>
                          {project.client && (
                            <span className="text-[var(--text-muted)] truncate max-w-[150px]">
                              {project.client}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                          {project.title}
                        </h3>

                        <p className="text-xs text-[var(--text-muted)] mt-2 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>

                        {/* Optional custom fields */}
                        {project.customFields && project.customFields.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {project.customFields.map((cf, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-[var(--surface-elevated)] text-[10px] font-mono text-[var(--text-muted)] border border-[var(--border)]">
                                <span className="text-[var(--accent)]">{cf.label}:</span> {cf.value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Card Bottom Meta */}
                      <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {project.toolsUsed.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text)]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>

                        <span className="text-[var(--accent)] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Watch</span>
                          <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Section Footnote / Delivery Notice */}
        <div className="mt-12 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[var(--text)]">Over 300 delivered projects across YouTube, TikTok, and brand campaigns.</span>
          </div>
          <a
            href="#contact"
            className="text-[var(--text-primary)] hover:text-[var(--accent)] font-semibold underline underline-offset-4 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Have a custom video or raw footage? Send an inquiry</span>
            <span>→</span>
          </a>
        </div>

      </div>
    </section>
  );
};
