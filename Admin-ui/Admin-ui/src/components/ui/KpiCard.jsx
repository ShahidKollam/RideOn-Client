import { cn } from '../../utils/cn';
import { MoreHorizontal } from 'lucide-react';

const accentMap = {
  purple: 'bg-violet-500/15 text-violet-500',
  green: 'bg-emerald-500/15 text-emerald-500',
  blue: 'bg-blue-500/15 text-blue-500',
  orange: 'bg-orange-500/15 text-orange-500',
  red: 'bg-red-500/15 text-red-500',
};

export function KpiCard({
  title,
  value,
  change,
  changeType = 'up', // up | down | neutral
  changeLabel = 'vs last month',
  icon: Icon,
  accent = 'blue',
  sparkline,
  className,
}) {
  const isUp = changeType === 'up';
  const isDown = changeType === 'down';

  return (
    <div
      className={cn(
        'relative bg-surface border border-token rounded-lg p-5 shadow-card transition-theme',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', accentMap[accent])}>
          {Icon && <Icon size={20} strokeWidth={2} />}
        </div>
        <button className="text-muted hover:text-secondary transition-colors p-1 rounded-md hover:bg-[var(--color-primary-soft)]">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <p className="text-xs font-medium uppercase tracking-wide text-muted mb-1">{title}</p>
      <p className="text-2xl font-bold text-primary-token tracking-tight">{value}</p>

      {change !== undefined && (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              'font-medium',
              isUp && 'text-success',
              isDown && 'text-danger',
              !isUp && !isDown && 'text-muted'
            )}
          >
            {isUp && '↑ '}
            {isDown && '↓ '}
            {change}
          </span>
          <span className="text-muted">{changeLabel}</span>
        </div>
      )}

      {sparkline && (
        <div className="mt-3 h-10 w-full opacity-80">
          {sparkline}
        </div>
      )}
    </div>
  );
}
