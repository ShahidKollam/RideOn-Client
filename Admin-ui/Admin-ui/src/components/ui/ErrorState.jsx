import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

export function ErrorState({
  title = 'Something went wrong',
  description = "We couldn't load this page. Please try again.",
  onRetry,
  onGoHome,
  className,
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 px-6 text-center', className)}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-danger">
        <AlertTriangle size={28} strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-primary-token mb-1">{title}</h3>
      <p className="text-sm text-muted max-w-sm mb-6">{description}</p>
      <div className="flex items-center gap-3">
        {onRetry && (
          <Button onClick={onRetry} variant="primary">
            Try Again
          </Button>
        )}
        {onGoHome && (
          <Button onClick={onGoHome} variant="secondary">
            Go to Dashboard
          </Button>
        )}
      </div>
    </div>
  );
}
