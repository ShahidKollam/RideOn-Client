import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Users as UsersIcon, Eye, Pencil, UserCheck, UserX } from 'lucide-react';
import { api } from '../../../lib/api';
import { PageHeader } from '../../../components/ui/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
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

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Users', value: total, icon: UsersIcon, color: 'text-blue-400' },
          { label: 'This Page', value: rows.length, icon: UserCheck, color: 'text-emerald-400' },
          { label: 'Page', value: `${page} / ${totalPages}`, icon: UserCheck, color: 'text-violet-400' },
          { label: 'Per Page', value: limit, icon: UserX, color: 'text-amber-400' },
        ].map((s) => (
          <Card key={s.label} className="p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-soft)] ${s.color}`}>
              <s.icon size={18} />
            </div>
            <div>
              <p className="text-xs text-muted">{s.label}</p>
              <p className="text-lg font-bold text-primary-token">{s.value}</p>
            </div>
          </Card>
        ))}
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
