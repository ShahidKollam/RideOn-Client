import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, CalendarCheck, Eye, KeyRound, Undo2, CircleX } from 'lucide-react';
import { api } from '../../../lib/api';
import { PageHeader } from '../../../components/ui/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { Input, Select } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { ActionMenu } from '../../../components/ui/ActionMenu';
import { Drawer } from '../../../components/ui/Drawer';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../components/ui/Toast';

function parseList(data) {
  const rows = data?.bookings || data?.items || data?.data || (Array.isArray(data) ? data : []);
  const pagination = data?.pagination || {};
  return {
    rows,
    total: pagination.total ?? data?.total ?? rows.length,
    totalPages: pagination.totalPages ?? Math.max(1, Math.ceil((pagination.total ?? rows.length) / (pagination.limit || 10))),
  };
}

export default function BookingsPage() {
  const { hasPermission } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [pickupTarget, setPickupTarget] = useState(null);
  const [returnTarget, setReturnTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [odometer, setOdometer] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['bookings', { page, limit, search, status: statusFilter }],
    queryFn: async () => {
      const qs = new URLSearchParams({ page, limit });
      if (search) qs.set('search', search);
      if (statusFilter) qs.set('status', statusFilter);
      const res = await api.get(`/bookings?${qs}`);
      return res.data || res;
    },
  });
  const { rows, total, totalPages } = parseList(data || {});

  const pickupMut = useMutation({
    mutationFn: ({ id, pickupOdometer }) => api.patch(`/bookings/${id}/pickup`, { pickupOdometer: Number(pickupOdometer) }),
    onSuccess: () => { toast.success('Pickup recorded'); setPickupTarget(null); qc.invalidateQueries({ queryKey: ['bookings'] }); },
    onError: (e) => toast.error(e.message),
  });
  const returnMut = useMutation({
    mutationFn: ({ id, returnOdometer }) => api.patch(`/bookings/${id}/return`, { returnOdometer: Number(returnOdometer) }),
    onSuccess: () => { toast.success('Return recorded'); setReturnTarget(null); qc.invalidateQueries({ queryKey: ['bookings'] }); },
    onError: (e) => toast.error(e.message),
  });
  const cancelMut = useMutation({
    mutationFn: (id) => api.patch(`/bookings/${id}/cancel`, {}),
    onSuccess: () => { toast.success('Booking cancelled'); setCancelTarget(null); qc.invalidateQueries({ queryKey: ['bookings'] }); },
    onError: (e) => toast.error(e.message),
  });

  const columns = [
    {
      key: 'bookingNumber',
      header: 'Booking',
      render: (r) => (
        <div>
          <p className="font-medium text-primary-token">{r.bookingNumber || r.id?.slice?.(0, 8) || '—'}</p>
          <p className="text-xs text-muted">{r.user?.name || r.userName || '—'}</p>
        </div>
      ),
    },
    { key: 'bike', header: 'Bike', render: (r) => <span className="text-secondary">{r.bike?.name || r.bikeName || '—'}</span> },
    { key: 'pickupAt', header: 'Pickup', render: (r) => <span className="text-secondary text-xs">{r.pickupAt ? new Date(r.pickupAt).toLocaleString() : '—'}</span> },
    { key: 'returnAt', header: 'Return', render: (r) => <span className="text-secondary text-xs">{r.returnAt ? new Date(r.returnAt).toLocaleString() : '—'}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status || 'PENDING'} /> },
    {
      key: 'actions',
      header: '',
      cellClassName: 'w-12',
      render: (r) => (
        <ActionMenu
          items={[
            { label: 'View', icon: Eye, onClick: () => setSelected(r) },
            hasPermission('bookings.update') && r.status === 'CONFIRMED' && {
              label: 'Pickup', icon: KeyRound, onClick: () => { setPickupTarget(r); setOdometer(''); },
            },
            hasPermission('bookings.update') && r.status === 'ACTIVE' && {
              label: 'Return', icon: Undo2, onClick: () => { setReturnTarget(r); setOdometer(''); },
            },
            hasPermission('bookings.cancel') && {
              label: 'Cancel', icon: CircleX, danger: true, onClick: () => setCancelTarget(r),
            },
          ].filter(Boolean)}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Bookings"
        description="Manage and monitor RideOn bookings"
        actions={
          hasPermission('bookings.create') ? (
            <Button size="md" variant="primary" onClick={() => toast.info('Create booking — wire to POST /bookings')}>+ New Booking</Button>
          ) : null
        }
      />
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
              <Input className="pl-9" placeholder="Search booking #…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
            </div>
            <Button type="submit" variant="secondary" size="md">Search</Button>
          </form>
          <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="PAYMENT_PENDING">Payment Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No Show</option>
          </Select>
        </div>
        <DataTable columns={columns} rows={rows} loading={isLoading} error={error?.message} onRetry={refetch}
          emptyTitle="No bookings found" emptyIcon={CalendarCheck}
          page={page} limit={limit} totalPages={totalPages} total={total}
          onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }}
          onRowClick={(row) => setSelected(row)} />
      </Card>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.bookingNumber || 'Booking'}
        description={selected?.user?.name || selected?.userName}
        footer={
          selected && (
            <>
              {hasPermission('bookings.update') && selected.status === 'CONFIRMED' && (
                <Button size="md" variant="primary" onClick={() => { setPickupTarget(selected); setOdometer(''); }}>
                  <KeyRound size={14} /> Pickup
                </Button>
              )}
              {hasPermission('bookings.update') && selected.status === 'ACTIVE' && (
                <Button size="md" variant="primary" onClick={() => { setReturnTarget(selected); setOdometer(''); }}>
                  <Undo2 size={14} /> Return
                </Button>
              )}
              {hasPermission('bookings.cancel') && !['CANCELLED', 'COMPLETED', 'FAILED'].includes(selected.status) && (
                <Button size="md" variant="danger" onClick={() => setCancelTarget(selected)}>
                  <CircleX size={14} /> Cancel
                </Button>
              )}
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="mb-1">
              <StatusBadge status={selected.status || 'PENDING'} />
            </div>
            {[
              ['Number', selected.bookingNumber],
              ['User', selected.user?.name || selected.userName],
              ['Bike', selected.bike?.name || selected.bikeName],
              ['Campus', selected.campus?.name || selected.campusName],
              ['Pickup', selected.pickupAt && new Date(selected.pickupAt).toLocaleString()],
              ['Return', selected.returnAt && new Date(selected.returnAt).toLocaleString()],
              ['Notes', selected.notes],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between gap-4 border-b border-token pb-2">
                <span className="text-muted">{l}</span>
                <span className="font-medium text-primary-token text-right">{v || '—'}</span>
              </div>
            ))}
          </div>
        )}
      </Drawer>

      <Modal open={!!pickupTarget} onClose={() => setPickupTarget(null)} title="Record Pickup" description={pickupTarget?.bookingNumber}
        footer={<><Button variant="secondary" onClick={() => setPickupTarget(null)}>Cancel</Button>
          <Button variant="primary" loading={pickupMut.isPending} onClick={() => pickupMut.mutate({ id: pickupTarget.id, pickupOdometer: odometer })}>Confirm Pickup</Button></>}>
        <label className="block text-sm text-secondary mb-1.5">Pickup Odometer</label>
        <Input type="number" value={odometer} onChange={(e) => setOdometer(e.target.value)} placeholder="e.g. 1250" />
      </Modal>

      <Modal open={!!returnTarget} onClose={() => setReturnTarget(null)} title="Record Return" description={returnTarget?.bookingNumber}
        footer={<><Button variant="secondary" onClick={() => setReturnTarget(null)}>Cancel</Button>
          <Button variant="primary" loading={returnMut.isPending} onClick={() => returnMut.mutate({ id: returnTarget.id, returnOdometer: odometer })}>Confirm Return</Button></>}>
        <label className="block text-sm text-secondary mb-1.5">Return Odometer</label>
        <Input type="number" value={odometer} onChange={(e) => setOdometer(e.target.value)} placeholder="e.g. 1320" />
      </Modal>

      <ConfirmDialog open={!!cancelTarget} onClose={() => setCancelTarget(null)}
        onConfirm={() => cancelMut.mutate(cancelTarget.id)}
        title="Cancel booking?" description={`Cancel booking ${cancelTarget?.bookingNumber || ''}?`}
        confirmLabel="Cancel Booking" loading={cancelMut.isPending} />
    </div>
  );
}
