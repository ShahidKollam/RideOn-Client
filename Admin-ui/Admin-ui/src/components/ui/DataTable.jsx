import { cn } from '../../utils/cn';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { Pagination } from './Pagination';

export function DataTable({
  columns,
  rows = [],
  loading,
  error,
  onRetry,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your filters or search.',
  emptyIcon,
  emptyAction,
  page = 1,
  limit = 10,
  totalPages = 1,
  total = 0,
  onPageChange,
  onLimitChange,
  rowKey = 'id',
  onRowClick,
}) {
  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Failed to load" description={error} onRetry={onRetry} />;
  }

  if (!rows.length) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyAction?.label}
        onAction={emptyAction?.onClick}
      />
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-token text-left">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted whitespace-nowrap',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row[rowKey] || row.id || idx}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-b border-token last:border-0 transition-colors',
                  'hover:bg-[var(--color-primary-soft)]/40',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col) => {
                  const isActions = col.key === 'actions';
                  return (
                    <td
                      key={col.key}
                      className={cn('px-4 py-3 text-primary-token', col.cellClassName)}
                      onClick={isActions ? (e) => e.stopPropagation() : undefined}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    </div>
  );
}
