import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Users as UsersIcon,
  Eye,
  Pencil,
  MailCheck,
  ClipboardCheck,
  BadgeCheck,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { PageHeader } from '../../../components/ui/PageHeader';
import { MobileList, MobileCard } from '../../../components/ui/MobileList';
import { MobileListSkeleton } from '../../../components/ui/Skeleton';
import { DataTable } from '../../../components/ui/DataTable';
import { Pagination } from '../../../components/ui/Pagination';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { Input, Select } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { ActionMenu } from '../../../components/ui/ActionMenu';
import { Drawer } from '../../../components/ui/Drawer';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../components/ui/Toast';

function useUsers(params) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== '' && v != null) qs.set(k, v);
      });
      const res = await api.get(`/users?${qs.toString()}`);
      return res.data || res;
    },
  });
}

function parseList(data) {
  const rows = data?.users || data?.items || data?.data || (Array.isArray(data) ? data : []);
  const pagination = data?.pagination || data?.meta || {};
  return {
    rows,
    total: pagination.total ?? data?.total ?? rows.length,
    totalPages: pagination.totalPages ?? data?.totalPages ?? Math.max(1, Math.ceil((pagination.total ?? rows.length) / (pagination.limit || 10))),
    page: pagination.page ?? 1,
    limit: pagination.limit ?? 10,
  };
}

async function fetchUserTotal(params = {}) {
  const qs = new URLSearchParams({ page: '1', limit: '1' });
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v != null) qs.set(k, v);
  });
  const res = await api.get(`/users?${qs.toString()}`);
  const data = res.data || res;
  const pagination = data?.pagination || data?.meta || {};
  return pagination.total ?? data?.total ?? 0;
}

export default function UsersPage() {
  const { hasPermission } = useAuth();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);

  const { data, isLoading, error, refetch } = useUsers({
    page,
    limit,
    search,
    onboardingStatus: statusFilter || undefined,
  });

  const { rows, total, totalPages } = parseList(data || {});

  const { data: totalUsers = 0 } = useQuery({
    queryKey: ['users-stats', 'ALL'],
    queryFn: () => fetchUserTotal(),
    staleTime: 30_000,
  });
  const { data: verifiedUsers = 0 } = useQuery({
    queryKey: ['users-stats', 'VERIFIED'],
    queryFn: () => fetchUserTotal({ isVerified: true }),
    staleTime: 30_000,
  });
  const { data: profileSubmitted = 0 } = useQuery({
    queryKey: ['users-stats', 'PROFILE_COMPLETED'],
    queryFn: () => fetchUserTotal({ onboardingStatus: 'PROFILE_COMPLETED' }),
    staleTime: 30_000,
  });
  const { data: emailVerified = 0 } = useQuery({
    queryKey: ['users-stats', 'EMAIL_VERIFIED'],
    queryFn: () => fetchUserTotal({ onboardingStatus: 'EMAIL_VERIFIED' }),
    staleTime: 30_000,
  });

  const userStats = [
    {
      label: 'Total Users',
      value: totalUsers,
      hint: 'All registered',
      icon: UsersIcon,
      iconWrap: 'bg-blue-500/15 text-blue-400',
      valueClass: 'text-primary-token',
      onClick: () => {
        setStatusFilter('');
        setPage(1);
      },
    },
    {
      label: 'Verified Users',
      value: verifiedUsers,
      hint: 'Identity verified',
      icon: BadgeCheck,
      iconWrap: 'bg-emerald-500/15 text-emerald-400',
      valueClass: 'text-primary-token',
    },
    {
      label: 'Profile Submitted',
      value: profileSubmitted,
      hint: 'Onboarding complete',
      icon: ClipboardCheck,
      iconWrap: 'bg-violet-500/15 text-violet-400',
      valueClass: 'text-primary-token',
      onClick: () => {
        setStatusFilter('PROFILE_COMPLETED');
        setPage(1);
      },
    },
    {
      label: 'Email Verified',
      value: emailVerified,
      hint: 'Awaiting profile',
      icon: MailCheck,
      iconWrap: 'bg-amber-500/15 text-amber-400',
      valueClass: 'text-primary-token',
      onClick: () => {
        setStatusFilter('EMAIL_VERIFIED');
        setPage(1);
      },
    },
  ];

  const columns = [
    {
      key: 'name',
      header: 'User',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[var(--color-primary-soft)] text-brand flex items-center justify-center text-xs font-semibold shrink-0">
            {(r.name || r.email || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-primary-token truncate">{r.name || '—'}</p>
            <p className="text-xs text-muted truncate">{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (r) => <span className="text-secondary">{r.phone || '—'}</span>,
    },
    {
      key: 'campus',
      header: 'Campus',
      render: (r) => <span className="text-secondary">{r.campus?.name || r.campusName || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <StatusBadge
          status={
            r.onboardingStatus ||
            (r.isVerified === false ? 'PENDING' : r.isVerified ? 'ACTIVE' : 'PENDING')
          }
        />
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (r) => (
        <span className="text-secondary text-xs">
          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      cellClassName: 'w-12',
      render: (r) => (
        <ActionMenu
          items={[
            { label: 'View', icon: Eye, onClick: () => setSelected(r) },
            hasPermission('users.update') && {
              label: 'Edit',
              icon: Pencil,
              onClick: () => toast.info('Edit user — connect form when API ready'),
            },
          ].filter(Boolean)}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage and monitor platform users"
      />

      {/* KPI cards — bookings-style */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
        {userStats.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.label}
              type="button"
              onClick={s.onClick}
              aria-label={s.onClick ? `Show ${s.label.toLowerCase()}` : undefined}
              className={`group flex min-w-0 flex-col rounded-xl border border-token bg-surface p-4 text-left shadow-card transition-colors ${
                s.onClick
                  ? 'cursor-pointer hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary-soft)]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50'
                  : 'cursor-default'
              }`}
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(searchInput.trim());
              setPage(1);
            }}
            className="flex-1 flex gap-2"
          >
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <Input
                className="pl-9"
                placeholder="Search by name or email…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary" size="md">Search</Button>
          </form>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="SIGNED_UP">Signed Up</option>
            <option value="EMAIL_VERIFIED">Email Verified</option>
            <option value="PROFILE_COMPLETED">Profile Completed</option>
          </Select>
        </div>

        {isLoading ? <MobileListSkeleton /> : null}
        <MobileList>
        {(rows || []).map((r) => (
          <MobileCard key={r.id} onClick={() => typeof setSelected === 'function' ? setSelected(r) : undefined}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-sm text-primary-token truncate">{r.name || '—'}</span>
              {r.isVerified != null && (
                <span className="text-xs text-muted">{r.isVerified ? 'Verified' : 'Unverified'}</span>
              )}
            </div>
            <p className="text-xs text-muted truncate">{r.email || '—'}</p>
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
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
        />
      </div>
      <div className="hidden md:block">
      <DataTable
          columns={columns}
          rows={rows}
          loading={isLoading}
          error={error?.message}
          onRetry={refetch}
          emptyTitle="No users found"
          emptyDescription="There are no users matching your filters."
          emptyIcon={UsersIcon}
          page={page}
          limit={limit}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
          onRowClick={(row) => setSelected(row)}
        />
      </div>
      </Card>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name || 'User details'}
        description={selected?.email}
        footer={
          <Button variant="secondary" size="md" onClick={() => setSelected(null)}>
            Close
          </Button>
        }
      >
        {selected && (
          <div className="space-y-4 text-sm">
            {[
              ['Name', selected.name],
              ['Email', selected.email],
              ['Phone', selected.phone],
              ['Campus', selected.campus?.name || selected.campusName],
              ['Onboarding', selected.onboardingStatus],
              ['Verified', selected.isVerified ? 'Yes' : 'No'],
              ['Joined', selected.createdAt ? new Date(selected.createdAt).toLocaleString() : null],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-token pb-2">
                <span className="text-muted">{label}</span>
                <span className="text-primary-token font-medium text-right">{val || '—'}</span>
              </div>
            ))}
          </div>
        )}
      </Drawer>
    </div>
  );
}
