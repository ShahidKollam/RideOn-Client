import { Construction } from 'lucide-react';
import { PageHeader } from './PageHeader';

export function UnderDevelopment({ title = 'Module' }) {
  return (
    <div>
      <PageHeader
        title={title}
        description="This module is currently under development."
      />
      <div className="mt-12 flex flex-col items-center justify-center text-center py-16">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary-soft)] text-brand">
          <Construction size={32} strokeWidth={1.5} />
        </div>
        <h2 className="text-lg font-semibold text-primary-token mb-2">
          Coming Soon
        </h2>
        <p className="text-sm text-muted max-w-md">
          The <strong>{title}</strong> module will appear here once implementation is completed.
          Feature requirements will be provided in a later prompt.
        </p>
      </div>
    </div>
  );
}
