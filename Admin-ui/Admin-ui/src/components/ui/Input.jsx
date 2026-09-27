import { cn } from '../../utils/cn';

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'h-9 w-full rounded-lg border border-token bg-surface px-3 text-sm text-primary-token placeholder:text-muted',
        'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]',
        'disabled:opacity-50 disabled:cursor-not-allowed transition-all',
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'h-9 rounded-lg border border-token bg-surface px-3 text-sm text-primary-token',
        'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]',
        'disabled:opacity-50 transition-all',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
