import React, { useEffect, useRef } from 'react';
import { X, Play, Clock, Film, Wrench, ExternalLink } from 'lucide-react';
import { ProjectItem } from '../data/portfolioData';

interface VideoModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ project, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key and lock body scroll
  useEffect(() => {
    if (!project) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [project, onClose]);

  if (!project) return null;

  // Helper to format or identify player type
  const isDirectVideo = project.videoUrl.endsWith('.mp4') || project.videoUrl.endsWith('.webm');
  
  // Format YouTube or Vimeo embed if not already in embed format
  const getEmbedUrl = (rawUrl: string): string => {
    try {
      if (rawUrl.includes('youtube.com/embed') || rawUrl.includes('player.vimeo.com')) {
        return rawUrl;
      }
      // Handle YouTube Shorts (e.g., https://youtube.com/shorts/mgyOdnewW9A)
      if (rawUrl.includes('youtube.com/shorts/')) {
        const videoId = rawUrl.split('youtube.com/shorts/')[1]?.split('?')[0]?.split('/')[0];
        if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      }
      // Handle standard YouTube watch URL
      if (rawUrl.includes('youtube.com/watch')) {
        const urlObj = new URL(rawUrl);
        const videoId = urlObj.searchParams.get('v');
        if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      }
      // Handle youtu.be shortlinks (e.g., https://youtu.be/UzeXuQtjCUQ?si=...)
      if (rawUrl.includes('youtu.be/')) {
        const videoId = rawUrl.split('youtu.be/')[1]?.split('?')[0]?.split('/')[0];
        if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      }
      // Handle Vimeo
      if (rawUrl.includes('vimeo.com/')) {
        const videoId = rawUrl.split('vimeo.com/')[1]?.split('?')[0];
        if (videoId) return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
      }
      return rawUrl;
    } catch {
      return rawUrl;
    }
  };

  const isShort = project.aspectRatio === '9:16';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Video player for ${project.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Lightbox Container */}
      <div 
        ref={modalRef}
        className={`relative w-full max-h-[94vh] flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden transition-all duration-200 ${
          isShort ? 'max-w-2xl' : 'max-w-5xl'
        }`}
      >
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[var(--bg)] border-b border-[var(--border)] font-mono text-xs">
          <div className="flex items-center gap-2.5 truncate">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="text-[var(--text-primary)] font-semibold truncate">{project.title}</span>
            <span className="opacity-40">·</span>
            <span className="text-[var(--text-muted)] shrink-0">{project.aspectRatio}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[var(--text-muted)] text-xs hidden sm:inline">ESC to close</span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border)] cursor-pointer"
              aria-label="Close video player"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Video Player Display (stays dark per spec) */}
        <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">
          <div 
            className={`w-full relative flex items-center justify-center ${
              isShort ? 'max-h-[65vh] py-2' : 'aspect-video'
            }`}
          >
            {isDirectVideo ? (
              <video
                src={project.videoUrl}
                controls
                autoPlay
                className={`rounded-lg object-contain ${isShort ? 'h-[62vh] aspect-[9/16]' : 'w-full h-full'}`}
              >
                Your browser does not support HTML5 video playback.
              </video>
            ) : (
              <div 
                className={`relative ${
                  isShort ? 'h-[62vh] aspect-[9/16] rounded-xl overflow-hidden shadow-2xl border border-[var(--border)]' : 'w-full aspect-video'
                }`}
              >
                <iframe
                  src={getEmbedUrl(project.videoUrl)}
                  title={project.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </div>

        {/* Modal Info Footer with readable theme background */}
        <div className="px-5 py-4 bg-[var(--surface)] border-t border-[var(--border)] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 font-mono text-[var(--text-muted)]">
              <span className="text-[var(--accent)] font-semibold">{project.category}</span>
              {project.duration && (
                <>
                  <span className="opacity-40">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[var(--accent)]" strokeWidth={1.5} />
                    {project.duration}
                  </span>
                </>
              )}
              {project.client && (
                <>
                  <span className="opacity-40">·</span>
                  <span>Client: {project.client}</span>
                </>
              )}
            </div>

            {/* Tools badge list */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {project.toolsUsed.map((tool) => (
                <span
                  key={tool}
                  className="px-2 py-0.5 rounded bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text)]"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          <p className="text-sm text-[var(--text)] leading-relaxed">
            {project.description}
          </p>

          {/* Video Meta Info Footer */}
          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
            <a
              href={project.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
            >
              <span>Watch directly on source</span>
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
            </a>
            {project.highlightStat && (
              <span className="text-emerald-400 font-medium">{project.highlightStat}</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
