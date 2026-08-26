import { cn } from '../../utils/cn';

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'bg-surface border border-token rounded-lg shadow-card transition-theme',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return <div className={cn('px-5 pt-5 pb-3', className)}>{children}</div>;
}

export function CardContent({ children, className }) {
  return <div className={cn('px-5 pb-5', className)}>{children}</div>;
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-sm font-semibold text-primary-token', className)}>
      {children}
    </h3>
  );
}
