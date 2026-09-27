import { useEffect, useRef, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Professional action menu — stays open until click outside or item click.
 * Does NOT close on mouse leave.
 */
export function ActionMenu({ items = [], align = 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  if (!items.length) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={cn(
          'p-1.5 rounded-md text-muted hover:text-secondary hover:bg-[var(--color-primary-soft)] transition-colors',
          open && 'bg-[var(--color-primary-soft)] text-secondary'
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute z-50 mt-1 min-w-[160px] rounded-xl border border-token bg-surface shadow-xl py-1',
            'animate-in fade-in zoom-in-95 duration-100',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item, i) => {
            if (item.divider) {
              return <div key={i} className="my-1 border-t border-token" />;
            }
            if (item.hidden) return null;
            return (
              <button
                key={i}
                role="menuitem"
                type="button"
                disabled={item.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  item.onClick?.();
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left',
                  item.danger
                    ? 'text-danger hover:bg-red-500/10'
                    : 'text-secondary hover:bg-[var(--color-primary-soft)] hover:text-primary-token',
                  item.disabled && 'opacity-40 pointer-events-none'
                )}
              >
                {item.icon && <item.icon size={14} className="shrink-0" />}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
