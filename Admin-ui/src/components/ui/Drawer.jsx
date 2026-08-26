import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Premium right-side detail drawer.
 * Supports rich header (icon/avatar, title, subtitle, badge) + sticky footer actions.
 */
export function Drawer({
  open,
  onClose,
  title,
  description,
  header,
  children,
  footer,
  width = 'max-w-md',
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[70] transition-visibility',
        open ? 'visible' : 'invisible pointer-events-none'
      )}
    >
      <div
        className={cn(
          'absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          'absolute right-0 top-0 bottom-0 w-full bg-surface border-l border-token shadow-2xl',
          'flex flex-col transition-transform duration-200 ease-out',
          width,
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-token shrink-0">
          <div className="min-w-0 flex-1">
            {header ? (
              header
            ) : (
              <>
                {title && (
                  <h2 className="text-base font-semibold text-primary-token truncate">{title}</h2>
                )}
                {description && (
                  <p className="mt-0.5 text-xs text-muted">{description}</p>
                )}
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-[var(--color-primary-soft)] hover:text-secondary transition-colors shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 px-5 py-4 border-t border-token shrink-0 bg-surface">
            {footer}
          </div>
        )}
      </aside>
    </div>
  );
}
