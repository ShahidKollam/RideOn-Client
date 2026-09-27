import { cn } from '../../utils/cn';

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-[var(--color-border)]',
        className
      )}
      {...props}
    />
  );
}

export function KpiSkeleton() {
  return (
    <div className="bg-surface border border-token rounded-lg p-5">
      <div className="flex justify-between mb-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-4 w-4" />
      </div>
      <Skeleton className="h-3 w-20 mb-2" />
      <Skeleton className="h-7 w-28 mb-2" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
