import { MobileList, MobileCard } from '../../../components/ui/MobileList';
import { Pagination } from '../../../components/ui/Pagination';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, CreditCard, Eye, CheckCircle2, XCircle, Clock } from 'lucide-react';
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

async function fetchPaymentTotal(status) {
  const qs = new URLSearchParams({ page: '1', limit: '1' });
  if (status) qs.set('status', status);
  const res = await api.get(`/payments?${qs}`);
  const data = res.data || res;
  const pagination = data?.pagination || {};
  return pagination.total ?? data?.total ?? 0;
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

  // Status summary counts (independent of list filters)
  const { data: totalAll = 0 } = useQuery({
    queryKey: ['payments-stats', 'ALL'],
    queryFn: () => fetchPaymentTotal(''),
    staleTime: 30_000,
  });
  const { data: totalPaid = 0 } = useQuery({
    queryKey: ['payments-stats', 'PAID'],
    queryFn: () => fetchPaymentTotal('PAID'),
    staleTime: 30_000,
  });
  const { data: totalFailed = 0 } = useQuery({
    queryKey: ['payments-stats', 'FAILED'],
    queryFn: () => fetchPaymentTotal('FAILED'),
    staleTime: 30_000,
  });
  const { data: totalPending = 0 } = useQuery({
    queryKey: ['payments-stats', 'PENDING'],
    queryFn: () => fetchPaymentTotal('PENDING'),
    staleTime: 30_000,
  });

  const openPayment = (r) => setSelected(r);

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
      render: (r) => <span className="font-semibold text-primary-token">{r.amount != null ? `₹${Number(r.amount).toLocaleString('en-IN')}` : '—'}</span>,
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
      render: (r) => <ActionMenu items={[{ label: 'View', icon: Eye, onClick: () => openPayment(r) }]} />,
    },
  ];

  const stats = [
    {
      label: 'Total',
      value: totalAll,
      hint: 'All payments',
      icon: CreditCard,
      iconWrap: 'bg-blue-500/15 text-blue-400',
      valueClass: 'text-primary-token',
      onClick: () => {
        setStatusFilter('');
        setPage(1);
      },
    },
    {
      label: 'Paid',
      value: totalPaid,
      hint: 'Successful',
      icon: CheckCircle2,
      iconWrap: 'bg-emerald-500/15 text-emerald-400',
      valueClass: 'text-primary-token',
      onClick: () => {
        setStatusFilter('PAID');
        setPage(1);
      },
    },
    {
      label: 'Failed',
      value: totalFailed,
      hint: 'Need review',
      icon: XCircle,
      iconWrap: 'bg-red-500/15 text-red-400',
      valueClass: totalFailed > 0 ? 'text-red-400' : 'text-primary-token',
      onClick: () => {
        setStatusFilter('FAILED');
        setPage(1);
      },
    },
    {
      label: 'Pending',
      value: totalPending,
      hint: 'Awaiting payment',
      icon: Clock,
      iconWrap: 'bg-amber-500/15 text-amber-400',
      valueClass: 'text-primary-token',
      onClick: () => {
        setStatusFilter('PENDING');
        setPage(1);
      },
    },
  ];

  return (
    <div>
      <PageHeader title="Payments" description="Track and review platform payments" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.label}
              type="button"
              onClick={s.onClick}
              aria-label={`Show ${s.label.toLowerCase()} payments`}
              className="group flex min-w-0 flex-col rounded-xl border border-token bg-surface p-4 text-left shadow-card transition-colors cursor-pointer hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary-soft)]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50"
            >
              <div className="flex w-full items-center justify-between gap-3">
                <p className="min-w-0 truncate text-sm font-medium text-secondary">{s.label}</p>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.iconWrap}`}>
                  <Icon size={18} strokeWidth={2} />
                </div>
              </div>
              <div className="mt-3 flex w-full items-end justify-between gap-3">
                <p className={`text-2xl font-bold leading-none tracking-tight tabular-nums ${s.valueClass}`}>
                  {String(s.value ?? 0).padStart(2, '0')}
                </p>
                <p className="max-w-[60%] text-right text-xs leading-4 text-muted">{s.hint}</p>
              </div>
            </button>
          );
        })}
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
        <MobileList>
          {(rows || data?.items || []).map((r) => (
            <MobileCard key={r.id} onClick={() => openPayment(r)} chevron>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm text-primary-token truncate">{r.gatewayOrderId || r.id}</span>
                <StatusBadge status={r.status || 'PENDING'} />
              </div>
              <p className="text-xs text-muted">{r.booking?.bookingNumber || r.user?.name || '—'}</p>
              <div className="flex justify-between text-xs pt-1">
                <span className="text-muted">{r.paidAt ? new Date(r.paidAt).toLocaleString() : (r.createdAt ? new Date(r.createdAt).toLocaleString() : '—')}</span>
                <span className="font-medium text-primary-token">₹{Number(r.amount || 0).toLocaleString('en-IN')}</span>
              </div>
            </MobileCard>
          ))}
        </MobileList>
        <div className="md:hidden">
          <Pagination
            page={page}
            limit={limit}
            total={total}
            totalPages={totalPages}
            onPageChange={setPage}
            onLimitChange={(l) => { setLimit(l); setPage(1); }}
          />
        </div>
        <div className="hidden md:block">
          <DataTable
            columns={columns}
            rows={rows}
            loading={isLoading}
            error={error?.message}
            onRetry={refetch}
            emptyTitle="No payments found"
            emptyIcon={CreditCard}
            page={page}
            limit={limit}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
            onLimitChange={(l) => { setLimit(l); setPage(1); }}
            onRowClick={(row) => openPayment(row)}
          />
        </div>
      </Card>
      <Drawer open={!!selected} onClose={() => setSelected(null)} title="Payment details">
        {selected && (
          <div className="space-y-3 text-sm">
            {[
              ['ID', selected.id],
              ['Amount', selected.amount != null ? `₹${Number(selected.amount).toLocaleString('en-IN')}` : null],
              ['Status', selected.status],
              ['Method', selected.method || selected.paymentMethod],
              ['Booking', selected.booking?.bookingNumber || selected.bookingNumber],
              ['User', selected.user?.name],
              ['Date', selected.createdAt && new Date(selected.createdAt).toLocaleString()],
            ].map(([l, v]) => (
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
