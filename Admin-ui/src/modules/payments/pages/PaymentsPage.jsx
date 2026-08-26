import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, CreditCard, Eye } from 'lucide-react';
import { api } from '../../../lib/api';
import { PageHeader } from '../../../components/ui/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { Input, Select } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { ActionMenu } from '../../../components/ui/ActionMenu';
import { Drawer } from '../../../components/ui/Drawer';

function parseList(data) {
  const rows = data?.payments || data?.items || data?.data || (Array.isArray(data) ? data : []);
  const pagination = data?.pagination || {};
  return {
    rows,
    total: pagination.total ?? data?.total ?? rows.length,
    totalPages: pagination.totalPages ?? Math.max(1, Math.ceil((pagination.total ?? rows.length) / (pagination.limit || 10))),
  };
}

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['payments', { page, limit, search, status: statusFilter }],
    queryFn: async () => {
      const qs = new URLSearchParams({ page, limit });
      if (search) qs.set('search', search);
      if (statusFilter) qs.set('status', statusFilter);
      const res = await api.get(`/payments?${qs}`);
      return res.data || res;
    },
  });
  const { rows, total, totalPages } = parseList(data || {});

  const columns = [
    {
      key: 'id',
      header: 'Payment',
      render: (r) => (
        <div>
          <p className="font-medium text-primary-token font-mono text-xs">{r.id?.slice?.(0, 10) || r.paymentId || '—'}</p>
          <p className="text-xs text-muted">{r.booking?.bookingNumber || r.bookingNumber || '—'}</p>
        </div>
      ),
    },
    { key: 'user', header: 'User', render: (r) => <span className="text-secondary">{r.user?.name || r.userName || '—'}</span> },
    {
      key: 'amount',
      header: 'Amount',
      render: (r) => <span className="font-semibold text-primary-token">{r.amount != null ? `$${Number(r.amount).toFixed(2)}` : '—'}</span>,
    },
    { key: 'method', header: 'Method', render: (r) => <span className="text-secondary text-xs uppercase">{r.method || r.paymentMethod || '—'}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status || 'PENDING'} /> },
    {
      key: 'createdAt',
      header: 'Date',
      render: (r) => <span className="text-secondary text-xs">{r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}</span>,
    },
    {
      key: 'actions',
      header: '',
      cellClassName: 'w-12',
      render: (r) => <ActionMenu items={[{ label: 'View', icon: Eye, onClick: () => setSelected(r) }]} />,
    },
  ];

  return (
    <div>
      <PageHeader title="Payments" description="Track and review platform payments" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[{ label: 'Total', value: total }, { label: 'On Page', value: rows.length }, { label: 'Page', value: `${page}/${totalPages}` }, { label: 'Per Page', value: limit }].map((s) => (
          <Card key={s.label} className="p-4"><p className="text-xs text-muted">{s.label}</p><p className="text-lg font-bold text-primary-token">{s.value}</p></Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-token">
          <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput.trim()); setPage(1); }} className="flex-1 flex gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <Input className="pl-9" placeholder="Search payments…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
            </div>
            <Button type="submit" variant="secondary" size="md">Search</Button>
          </form>
          <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
            <option value="PARTIALLY_REFUNDED">Partially Refunded</option>
          </Select>
        </div>
        <DataTable columns={columns} rows={rows} loading={isLoading} error={error?.message} onRetry={refetch}
          emptyTitle="No payments found" emptyIcon={CreditCard}
          page={page} limit={limit} totalPages={totalPages} total={total}
          onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }}
          onRowClick={(row) => setSelected(row)} />
      </Card>
      <Drawer open={!!selected} onClose={() => setSelected(null)} title="Payment details">
        {selected && (
          <div className="space-y-3 text-sm">
            {[['ID', selected.id], ['Amount', selected.amount != null ? `$${Number(selected.amount).toFixed(2)}` : null],
              ['Status', selected.status], ['Method', selected.method || selected.paymentMethod],
              ['Booking', selected.booking?.bookingNumber || selected.bookingNumber],
              ['User', selected.user?.name],
              ['Date', selected.createdAt && new Date(selected.createdAt).toLocaleString()]].map(([l, v]) => (
              <div key={l} className="flex justify-between gap-4 border-b border-token pb-2">
                <span className="text-muted">{l}</span>
                <span className="font-medium text-primary-token text-right">{v || '—'}</span>
              </div>
            ))}
          </div>
        )}
      </Drawer>
    </div>
  );
}
