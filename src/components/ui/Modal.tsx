import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { IconButton } from './IconButton';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  labelledBy?: string;
  children: React.ReactNode;
  /** Extra classes for the panel (width, padding overrides) */
  className?: string;
}

/**
 * Accessible dialog: backdrop click + Escape to dismiss, focus trap,
 * scroll lock, aria wiring. Renders as a centered card on tablet/desktop
 * and a bottom sheet on small screens.
 */
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, labelledBy, children, className }) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement;

    // Move focus into the dialog
    const timer = window.setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      (first ?? panelRef.current)?.focus();
    }, 30);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === 'Tab' && panelRef.current) {
        // Simple focus trap
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const headingId = labelledBy ?? `modal-title-${title ? title.replace(/\s+/g, '-').toLowerCase() : 'panel'}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel: bottom sheet on mobile, centered card ≥ sm */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? headingId : undefined}
        tabIndex={-1}
        className={cn(
          'relative w-full max-h-[92dvh] overflow-y-auto overscroll-contain',
          'rounded-t-3xl border border-app-border bg-app-surface shadow-elevation-lg',
          'sm:rounded-3xl sm:max-w-xl',
          'animate-sheet-in sm:animate-slide-up',
          'safe-bottom sm:!pb-7',
          className
        )}
      >
        {/* Mobile grab handle */}
        <div className="flex justify-center pt-3 sm:hidden" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-app-border-strong" />
        </div>

        {title && (
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-app-border bg-app-surface/95 px-5 py-4 backdrop-blur sm:px-7">
            <h2 id={headingId} className="font-display text-lg font-bold text-text-primary">
              {title}
            </h2>
            <IconButton label="Close" variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </IconButton>
          </div>
        )}

        <div className="p-5 sm:p-7">{children}</div>
      </div>
    </div>
  );
};

Modal.displayName = 'Modal';
