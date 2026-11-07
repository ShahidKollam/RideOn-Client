import { cn } from '../../utils/cn';

/** Base shimmer block */
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('skeleton-shimmer rounded-md', className)}
      {...props}
    />
  );
}

/** KPI card placeholder — matches stylish KPI cards */
export function KpiSkeleton({ className } = {}) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col rounded-xl border border-token bg-surface p-4 shadow-card',
        className
      )}
    >
      <div className="flex w-full items-center justify-between gap-3">
        <Skeleton className="h-3.5 w-24 rounded" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
      <div className="mt-3 flex w-full items-end justify-between gap-3">
        <Skeleton className="h-7 w-14 rounded" />
        <Skeleton className="h-3 w-16 rounded" />
      </div>
    </div>
  );
}

export function KpiSkeletonGrid({ count = 4, className } = {}) {
  return (
    <div className={cn('grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <KpiSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Table-shaped skeleton — header + multi-column rows
 * Looks like the real DataTable while loading.
 */
export function TableSkeleton({ rows = 6, columns = 5, className }) {
  const widths = ['w-[28%]', 'w-[18%]', 'w-[14%]', 'w-[16%]', 'w-[12%]', 'w-8'];

  return (
    <div className={cn('w-full', className)} role="status" aria-label="Loading">
      <div className="flex items-center gap-4 border-b border-token px-4 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={`h-${i}`}
            className={cn('h-3 rounded', widths[i % widths.length])}
          />
        ))}
      </div>
      <div className="divide-y divide-token/70">
        {Array.from({ length: rows }).map((_, row) => (
          <div
            key={row}
            className="flex items-center gap-4 px-4 py-3.5"
            style={{ opacity: 1 - row * 0.06 }}
          >
            {Array.from({ length: columns }).map((_, col) => (
              <Skeleton
                key={col}
                className={cn(
                  'h-3.5 rounded',
                  col === 0 ? 'h-4' : '',
                  widths[col % widths.length]
                )}
              />
            ))}
          </div>
        ))}
      </div>
      <span className="sr-only">Loading table</span>
    </div>
  );
}

/** Mobile card list placeholders — matches MobileCard layout */
export function MobileListSkeleton({ rows = 4, className }) {
  return (
    <div
      className={cn('flex flex-col gap-3 md:hidden', className)}
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-token bg-surface p-4 shadow-card"
          style={{ opacity: 1 - i * 0.08 }}
        >
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-4 w-[42%] max-w-[10rem] rounded" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-[68%] max-w-[14rem] rounded" />
              <div className="flex items-center justify-between pt-0.5">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-3.5 w-14 rounded" />
              </div>
            </div>
            <Skeleton className="mt-1 h-4 w-4 shrink-0 rounded" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading list</span>
    </div>
  );
}

/** Detail panel / drawer content skeleton */
export function DetailSkeleton({ rows = 6, className }) {
  return (
    <div className={cn('space-y-0', className)} role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 border-b border-token py-3"
        >
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-3.5 w-36 rounded" />
        </div>
      ))}
    </div>
  );
}
