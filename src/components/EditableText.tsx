import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Edit3, Loader2 } from 'lucide-react';
import { useContent } from '../lib/content';
import { useAuth } from '../lib/auth';

interface EditableTextProps {
  textKey: string;
  defaultText?: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'div';
  className?: string;
  multiline?: boolean;
  maxLength?: number;
}

export const EditableText: React.FC<EditableTextProps> = ({
  textKey,
  defaultText = '',
  as: Component = 'span',
  className = '',
  multiline = false,
  maxLength = 1500,
}) => {
  const { t, updateSiteText, isEditMode } = useContent();
  const { isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const currentText = t(textKey, defaultText);
  const [draft, setDraft] = useState(currentText);
  const [isSaving, setIsSaving] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Keep draft in sync if external text changes
  useEffect(() => {
    setDraft(currentText);
  }, [currentText]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if ('select' in inputRef.current) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleStartEdit = (e: React.MouseEvent) => {
    if (!isAdmin || !isEditMode) return;
    e.preventDefault();
    e.stopPropagation();

    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const popoverWidth = Math.min(420, window.innerWidth - 32);
      let left = rect.left;
      if (left + popoverWidth > window.innerWidth - 16) {
        left = window.innerWidth - popoverWidth - 16;
      }
      left = Math.max(16, left);

      let top = rect.bottom + 8;
      if (top + 220 > window.innerHeight) {
        top = Math.max(16, rect.top - 220);
      }
      setPopoverPos({ top, left });
    }
    setDraft(currentText);
    setIsEditing(true);
  };

  const handleSave = async (e?: React.MouseEvent | React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (draft === currentText) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await updateSiteText(textKey, draft.trim());
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update text key:', textKey, err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setDraft(currentText);
    setIsEditing(false);
  };

  // If not admin in edit mode, render regular element with text
  if (!isAdmin || !isEditMode) {
    return <Component className={className}>{currentText}</Component>;
  }

  return (
    <>
      <Component
        ref={triggerRef as any}
        onClick={handleStartEdit}
        title={`Click to edit live: ${textKey}`}
        className={`${className} outline-dashed outline-1 outline-[var(--accent)]/60 hover:outline-[var(--accent)] hover:bg-[var(--accent)]/10 cursor-pointer rounded px-1 transition-all inline-block relative group/editable`}
      >
        {currentText || <span className="opacity-40 italic">&lt;empty&gt;</span>}
        <span
          className="inline-flex ml-1.5 opacity-0 group-hover/editable:opacity-100 transition-opacity text-[var(--accent)]"
          aria-hidden="true"
        >
          <Edit3 className="w-3 h-3 inline" />
        </span>
      </Component>

      {/* Floating Inline Edit Popover */}
      {isEditing && popoverPos && (
        <div
          role="dialog"
          aria-label={`Edit ${textKey}`}
          className="fixed z-50 bg-[var(--surface-elevated)] border border-[var(--border-accent)] rounded-xl shadow-2xl p-4 text-[var(--text)] w-80 sm:w-96 backdrop-blur-md"
          style={{ top: `${popoverPos.top}px`, left: `${popoverPos.left}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[var(--border)]">
            <span className="font-mono text-[10px] text-[var(--accent)] uppercase tracking-wider truncate">
              {textKey}
            </span>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              {draft.length}/{maxLength}
            </span>
          </div>

          <form onSubmit={handleSave}>
            {multiline ? (
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={draft}
                maxLength={maxLength}
                onChange={(e) => setDraft(e.target.value)}
                rows={4}
                className="w-full text-xs font-sans bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] focus:border-[var(--accent)] rounded-lg p-2.5 outline-none resize-y leading-relaxed mb-3"
              />
            ) : (
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={draft}
                maxLength={maxLength}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full text-xs font-sans bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] focus:border-[var(--accent)] rounded-lg p-2.5 outline-none mb-3"
              />
            )}

            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-[var(--text-muted)] font-mono">Plain text only</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-2.5 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border)] font-mono transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] hover:opacity-90 text-[var(--on-accent)] text-xs font-bold font-mono transition-opacity cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
