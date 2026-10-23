import React, { useState } from 'react';
import { Edit3, Eye, Sliders, Upload, Image as ImageIcon, X, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useContent, compressAndUploadMedia } from '../lib/content';

interface LiveEditOverlayProps {
  onOpenAdminDrawer: () => void;
}

export const LiveEditOverlay: React.FC<LiveEditOverlayProps> = ({ onOpenAdminDrawer }) => {
  const { isAdmin, role } = useAuth();
  const { isEditMode, setIsEditMode } = useContent();
  const [replaceModal, setReplaceModal] = useState<{
    isOpen: boolean;
    title: string;
    targetKey: string;
    onSave: (url: string) => Promise<void>;
  } | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Visitors NEVER see this component
  if (!isAdmin) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replaceModal) return;
    setIsUploading(true);
    setError(null);
    try {
      const publicUrl = await compressAndUploadMedia(file, 'replacements');
      await replaceModal.onSave(publicUrl);
      setReplaceModal(null);
      setUrlInput('');
    } catch (err: any) {
      setError(err?.message || 'Media upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || !replaceModal) return;
    setIsUploading(true);
    setError(null);
    try {
      await replaceModal.onSave(urlInput.trim());
      setReplaceModal(null);
      setUrlInput('');
    } catch (err: any) {
      setError(err?.message || 'Failed to save URL');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* FLOATING BOTTOM-RIGHT ACTION PILL */}
      <aside 
        aria-label="Studio Admin Controls"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 p-1.5 rounded-full bg-[var(--surface-elevated)]/95 backdrop-blur-md border border-[var(--border-accent)] shadow-2xl text-[var(--text)] transition-all animate-fadeIn"
      >
        {/* Edit mode toggle switch button */}
        <button
          type="button"
          onClick={() => setIsEditMode(!isEditMode)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full font-mono text-xs font-semibold transition-all cursor-pointer ${
            isEditMode
              ? 'bg-[var(--accent)] text-[var(--on-accent)] shadow-md shadow-[var(--accent)]/30'
              : 'bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
          title="Toggle inline live text editing mode"
        >
          {isEditMode ? (
            <>
              <Edit3 className="w-3.5 h-3.5 animate-pulse" />
              <span>Edit Mode ON</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Mode</span>
            </>
          )}
        </button>

        {/* Divider dot */}
        <span className="w-1 h-1 rounded-full bg-[var(--border)]" />

        {/* Open Admin Panel Button */}
        <button
          type="button"
          onClick={onOpenAdminDrawer}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[var(--surface-hover)] hover:bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border)] font-mono text-xs transition-colors cursor-pointer"
          title="Open Studio Admin CMS Drawer"
        >
          <Sliders className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="hidden sm:inline">CMS Panel</span>
        </button>

        {/* Role badge */}
        <span className="hidden md:inline-flex px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[10px] font-mono uppercase text-[var(--accent)]">
          {role || 'Admin'}
        </span>
      </aside>

      {/* QUICK MEDIA REPLACE MODAL */}
      {replaceModal && replaceModal.isOpen && (
        <div 
          role="dialog"
          aria-label={replaceModal.title || 'Replace Media Asset'}
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <div className="w-full max-w-md bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 text-[var(--text)]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[var(--accent)]" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  {replaceModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReplaceModal(null)}
                className="p-1 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono">
                {error}
              </div>
            )}

            {/* Option 1: File Upload */}
            <div className="mb-5">
              <label className="block text-xs font-mono text-[var(--text-muted)] uppercase mb-2">
                Upload New Image (Auto WebP · Max 2MB)
              </label>
              <label className="flex flex-col items-center justify-center p-5 rounded-xl border border-dashed border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--surface)] transition-all cursor-pointer">
                <Upload className="w-6 h-6 text-[var(--accent)] mb-2" />
                <span className="text-xs font-medium text-[var(--text-primary)]">
                  {isUploading ? 'Compressing & Uploading...' : 'Click or drop image file here'}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono mt-1">
                  PNG, JPG, WEBP, SVG
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center gap-3 my-4">
              <span className="h-px flex-1 bg-[var(--border)]" />
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">or paste url</span>
              <span className="h-px flex-1 bg-[var(--border)]" />
            </div>

            {/* Option 2: Paste URL */}
            <form onSubmit={handleUrlSubmit} className="space-y-3">
              <div>
                <input
                  type="url"
                  placeholder="https://..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full text-xs font-mono bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] focus:border-[var(--accent)] rounded-lg p-2.5 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReplaceModal(null)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--surface)] text-xs font-mono text-[var(--text-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !urlInput.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--on-accent)] text-xs font-bold font-mono disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save URL</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
