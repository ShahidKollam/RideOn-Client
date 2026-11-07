import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

const LIMIT_OPTIONS = [10, 25, 50, 100, 200];

export function Pagination({
  page = 1,
  limit = 10,
  total = 0,
  totalPages = 1,
  onPageChange,
  onLimitChange,
  className,
}) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  if (total === 0 && totalPages <= 1) return null;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 px-3 py-3 sm:px-4 border-t border-token',
        'sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      {/* Results summary */}
      <p className="text-xs text-muted text-center sm:text-left order-2 sm:order-1 sm:flex-shrink-0">
        <span className="sm:hidden">
          <span className="font-medium text-secondary">{from}–{to}</span>
          {' '}of{' '}
          <span className="font-medium text-secondary">{total}</span>
        </span>
        <span className="hidden sm:inline">
          Showing <span className="font-medium text-secondary">{from}</span>
          {' '}to{' '}
          <span className="font-medium text-secondary">{to}</span>
          {' '}of{' '}
          <span className="font-medium text-secondary">{total}</span>
          {' '}results
        </span>
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 order-1 sm:order-2">
        {/* Prev / Page indicator / Next */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => onPageChange?.(page - 1)}
            className={cn(
              'inline-flex h-8 items-center gap-1 rounded-lg border border-token px-2.5 text-xs font-medium text-secondary',
              'hover:bg-[var(--color-primary-soft)] transition-colors',
              'disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/30'
            )}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} className="flex-shrink-0" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <span
            className="min-w-[5.5rem] text-center text-xs font-medium text-secondary tabular-nums px-1"
            aria-live="polite"
            aria-atomic="true"
          >
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            disabled={isLast}
            onClick={() => onPageChange?.(page + 1)}
            className={cn(
              'inline-flex h-8 items-center gap-1 rounded-lg border border-token px-2.5 text-xs font-medium text-secondary',
              'hover:bg-[var(--color-primary-soft)] transition-colors',
              'disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/30'
            )}
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={16} className="flex-shrink-0" />
          </button>
        </div>

        {/* Page-size selector */}
        {onLimitChange && (
          <select
            value={limit}
            onChange={(e) => {
              onLimitChange(Number(e.target.value));
            }}
            className={cn(
              'h-8 rounded-lg border border-token bg-surface px-2 text-xs text-secondary',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]',
              'cursor-pointer transition-colors'
            )}
            aria-label="Rows per page"
          >
            {LIMIT_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
