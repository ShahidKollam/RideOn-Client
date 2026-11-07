import { cn } from '../../utils/cn';

/**
 * Simple brand spinner — use for buttons, inline waits, and full-page loads.
 * Lists/tables should prefer Skeleton placeholders instead.
 */
export function LoadingSpinner({ size = 28, className, label }) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3', className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <svg
        className="animate-spin text-[var(--color-primary)]"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path
          className="opacity-90"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V2C5.373 2 0 7.373 0 14h2a10 10 0 0110-10v2a8 8 0 00-8 8H4z"
        />
      </svg>
      {label ? <p className="text-sm text-muted">{label}</p> : null}
      <span className="sr-only">{label || 'Loading'}</span>
    </div>
  );
}

/** Centered page/section loader */
export function PageLoader({ label = 'Loading…', className }) {
  return (
    <div className={cn('flex min-h-[40vh] items-center justify-center py-16', className)}>
      <LoadingSpinner size={32} label={label} />
    </div>
  );
}
