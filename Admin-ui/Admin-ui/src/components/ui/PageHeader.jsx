import { cn } from '../../utils/cn';

export function PageHeader({ title, description, actions, breadcrumb, className }) {
  return (
    <div className={cn('mb-6', className)}>
      {breadcrumb && <div className="mb-2 text-sm text-muted">{breadcrumb}</div>}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary-token">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-secondary">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
