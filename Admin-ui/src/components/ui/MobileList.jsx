import { cn } from '../../utils/cn';
import { ChevronRight } from 'lucide-react';

/**
 * Compact mobile card list — use below md breakpoint.
 * Desktop tables stay as DataTable; pair with className "md:hidden" / "hidden md:block".
 */
export function MobileCard({ children, onClick, className, chevron = true }) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-xl border border-token bg-surface p-4',
        'flex items-start gap-3 transition-colors',
        onClick && 'hover:bg-[var(--color-primary-soft)]/40 active:scale-[0.99]',
        className
      )}
    >
      <div className="min-w-0 flex-1 space-y-1.5">{children}</div>
      {chevron && onClick && (
        <ChevronRight size={18} className="shrink-0 text-muted mt-1" />
      )}
    </Comp>
  );
}

export function MobileList({ children, className }) {
  return <div className={cn('flex flex-col gap-3 md:hidden', className)}>{children}</div>;
}

export function MobileCardRow({ label, value, className }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className={cn('flex items-center justify-between gap-2 text-xs', className)}>
      <span className="text-muted shrink-0">{label}</span>
      <span className="text-secondary text-right truncate">{value}</span>
    </div>
  );
}
