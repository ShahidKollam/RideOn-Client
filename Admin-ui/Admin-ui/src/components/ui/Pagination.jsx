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

  // Build page numbers window
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }
  for (let i = start; i <= end; i++) pages.push(i);

  if (total === 0 && totalPages <= 1) return null;

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-token',
        className
      )}
    >
      <p className="text-xs text-muted order-2 sm:order-1">
        Showing <span className="font-medium text-secondary">{from}</span> to{' '}
        <span className="font-medium text-secondary">{to}</span> of{' '}
        <span className="font-medium text-secondary">{total}</span> results
      </p>

      <div className="flex items-center gap-2 order-1 sm:order-2">
        {/* Page buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange?.(page - 1)}
            className={cn(
              'h-8 w-8 flex items-center justify-center rounded-lg border border-token text-secondary',
              'hover:bg-[var(--color-primary-soft)] disabled:opacity-40 disabled:pointer-events-none transition-colors'
            )}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          {start > 1 && (
            <>
              <PageBtn n={1} current={page} onClick={onPageChange} />
              {start > 2 && <span className="px-1 text-muted text-xs">…</span>}
            </>
          )}

          {pages.map((n) => (
            <PageBtn key={n} n={n} current={page} onClick={onPageChange} />
          ))}

          {end < totalPages && (
            <>
              {end < totalPages - 1 && <span className="px-1 text-muted text-xs">…</span>}
              <PageBtn n={totalPages} current={page} onClick={onPageChange} />
            </>
          )}

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange?.(page + 1)}
            className={cn(
              'h-8 w-8 flex items-center justify-center rounded-lg border border-token text-secondary',
              'hover:bg-[var(--color-primary-soft)] disabled:opacity-40 disabled:pointer-events-none transition-colors'
            )}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Limit selector */}
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

function PageBtn({ n, current, onClick }) {
  const active = n === current;
  return (
    <button
      type="button"
      onClick={() => onClick?.(n)}
      className={cn(
        'h-8 min-w-8 px-2 flex items-center justify-center rounded-lg text-xs font-medium transition-colors',
        active
          ? 'bg-[var(--color-primary)] text-white shadow-sm'
          : 'border border-token text-secondary hover:bg-[var(--color-primary-soft)]'
      )}
    >
      {n}
    </button>
  );
}
