import { cn } from '../../utils/cn';

const statusStyles = {
  AVAILABLE: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  ACTIVE: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  IN_USE: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  COMPLETED: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  BOOKED: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  PENDING: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  MAINTENANCE: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  CANCELLED: 'bg-red-500/15 text-red-600 dark:text-red-400',
  DISABLED: 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
  RETIRED: 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
  CONFIRMED: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  PAYMENT_PENDING: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  PARTIALLY_PAID: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  LATE_RETURN: 'bg-red-500/15 text-red-600 dark:text-red-400',
  SUCCESS: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  PENDING: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  FAILED: 'bg-red-500/15 text-red-600 dark:text-red-400',
  NOT_APPLICABLE: 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
  CANCELLED: 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
  IN_USE: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
};

export function StatusBadge({ status, className }) {
  const key = (status || '').toUpperCase().replace(/\s+/g, '_');
  const style = statusStyles[key] || 'bg-slate-500/15 text-slate-600';

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        style,
        className
      )}
    >
      {key.replaceAll('_', ' ')}
    </span>
  );
}
