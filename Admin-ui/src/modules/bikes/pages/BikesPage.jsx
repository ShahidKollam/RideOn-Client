import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Bike, Eye, Pencil, Trash2, Wrench, Plus } from 'lucide-react';
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
  const rows = data?.bikes || data?.items || data?.data || (Array.isArray(data) ? data : []);
  const pagination = data?.pagination || data?.meta || {};
  return {
    rows,
    total: pagination.total ?? data?.total ?? rows.length,
    totalPages:
      pagination.totalPages ??
      data?.totalPages ??
      Math.max(1, Math.ceil((pagination.total ?? rows.length) / (pagination.limit || 10))),
  };
}

const EMPTY_FORM = {
  campusId: '',
  registrationNumber: '',
  name: '',
  brand: '',
  model: '',
  year: '',
  color: '',
  currentOdometer: 0,
  imageUrls: '',
};

export default function BikesPage() {
  const { hasPermission } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [newStatus, setNewStatus] = useState('AVAILABLE');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const canCreate = hasPermission('bikes.create') || hasPermission('*');
  const canUpdate = hasPermission('bikes.update') || hasPermission('*');
  const canDelete = hasPermission('bikes.delete') || hasPermission('*');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['bikes', { page, limit, search, status: statusFilter }],
    queryFn: async () => {
      const qs = new URLSearchParams({ page, limit });
      if (search) qs.set('search', search);
      if (statusFilter) qs.set('status', statusFilter);
      const res = await api.get(`/bikes?${qs}`);
      return res.data || res;
    },
  });

  const { rows, total, totalPages } = parseList(data || {});

  const saveMut = useMutation({
    mutationFn: (payload) => {
      if (editing?.id) {
        const { campusId, registrationNumber, ...body } = payload;
        return api.patch(`/bikes/${editing.id}`, body);
      }
      return api.post('/bikes', payload);
    },
    onSuccess: () => {
      toast.success(editing ? 'Bike updated successfully' : 'Bike created successfully');
      setModalOpen(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      qc.invalidateQueries({ queryKey: ['bikes'] });
    },
    onError: (e) => {
      setFormError(e?.message || e?.data?.message || 'Failed to save bike');
      toast.error(e?.message || 'Failed to save bike');
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/bikes/${id}`),
    onSuccess: () => {
      toast.success('Bike deleted successfully');
      setDeleteTarget(null);
      if (selected?.id === deleteTarget?.id) setSelected(null);
      qc.invalidateQueries({ queryKey: ['bikes'] });
    },
    onError: (e) => toast.error(e.message || 'Failed to delete bike'),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/bikes/${id}/status`, { status }),
    onSuccess: () => {
      toast.success('Status updated');
      setStatusTarget(null);
      qc.invalidateQueries({ queryKey: ['bikes'] });
      if (selected?.id === statusTarget?.id) {
        setSelected((s) => (s ? { ...s, status: newStatus } : s));
      }
    },
    onError: (e) => toast.error(e.message || 'Failed to update status'),
  });

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      campusId: row.campusId || row.campus?.id || '',
      registrationNumber: row.registrationNumber || '',
      name: row.name || '',
      brand: row.brand || '',
      model: row.model || '',
      year: row.year ?? '',
      color: row.color || '',
      currentOdometer: row.currentOdometer ?? 0,
      imageUrls: Array.isArray(row.imageUrls) ? row.imageUrls.join(', ') : row.imageUrls || '',
    });
    setFormError('');
    setModalOpen(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!editing && !form.campusId.trim()) {
      setFormError('Campus ID is required');
      return;
    }
    if (!editing && !form.registrationNumber.trim()) {
      setFormError('Registration number is required');
      return;
    }
    if (!form.name.trim() && !form.brand.trim()) {
      setFormError('Name or brand is required');
      return;
    }

    const payload = {
      name: form.name.trim() || undefined,
      brand: form.brand.trim() || undefined,
      model: form.model.trim() || undefined,
      year: form.year ? Number(form.year) : undefined,
      color: form.color.trim() || undefined,
      currentOdometer: Number(form.currentOdometer) || 0,
    };
    if (form.imageUrls.trim()) {
      payload.imageUrls = form.imageUrls
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (!editing) {
      payload.campusId = form.campusId.trim();
      payload.registrationNumber = form.registrationNumber.trim();
    }
    saveMut.mutate(payload);
  }

  const columns = [
    {
      key: 'name',
      header: 'Bike',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-[var(--color-primary-soft)] text-brand flex items-center justify-center shrink-0">
            <Bike size={16} />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-primary-token truncate">
              {r.name || `${r.brand || ''} ${r.model || ''}`.trim() || '—'}
            </p>
            <p className="text-xs text-muted truncate">
              {r.registrationNumber || r.regNo || '—'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'brand',
      header: 'Brand / Model',
      render: (r) => (
        <span className="text-secondary">
          {[r.brand, r.model].filter(Boolean).join(' ') || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.status || 'AVAILABLE'} />,
    },
    {
      key: 'odometer',
      header: 'Odometer',
      render: (r) => (
        <span className="text-secondary">
          {r.currentOdometer != null
            ? `${Number(r.currentOdometer).toLocaleString()} km`
            : '—'}
        </span>
      ),
    },
    {
      key: 'campus',
      header: 'Campus',
      render: (r) => (
        <span className="text-secondary">{r.campus?.name || r.campusName || '—'}</span>
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
            canUpdate && {
              label: 'Change Status',
              icon: Wrench,
              onClick: () => {
                setStatusTarget(r);
                setNewStatus(r.status || 'AVAILABLE');
              },
            },
            canUpdate && {
              label: 'Edit',
              icon: Pencil,
              onClick: () => openEdit(r),
            },
            canDelete && { divider: true },
            canDelete && {
              label: 'Delete',
              icon: Trash2,
              danger: true,
              onClick: () => setDeleteTarget(r),
            },
          ].filter(Boolean)}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Bikes"
        description="Manage RideOn fleet"
        actions={
          canCreate ? (
            <Button size="md" variant="primary" onClick={openCreate}>
              <Plus size={16} /> Add Bike
            </Button>
          ) : null
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Bikes', value: total },
          { label: 'On Page', value: rows.length },
          { label: 'Page', value: `${page} / ${totalPages}` },
          { label: 'Per Page', value: limit },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs text-muted">{s.label}</p>
            <p className="text-lg font-bold text-primary-token mt-0.5">{s.value}</p>
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
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <Input
                className="pl-9"
                placeholder="Search name or registration…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary" size="md">
              Search
            </Button>
          </form>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="IN_USE">In Use</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="DISABLED">Disabled</option>
            <option value="RETIRED">Retired</option>
          </Select>
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          loading={isLoading}
          error={error?.message}
          onRetry={refetch}
          emptyTitle="No bikes found"
          emptyDescription="Add your first RideOn bike to get started."
          emptyIcon={Bike}
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

      {/* Detail Drawer */}
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name || 'Bike details'}
        description={selected?.registrationNumber}
        footer={
          selected && (
            <>
              {canUpdate && (
                <Button
                  size="md"
                  variant="secondary"
                  onClick={() => {
                    setStatusTarget(selected);
                    setNewStatus(selected.status || 'AVAILABLE');
                  }}
                >
                  <Wrench size={14} /> Status
                </Button>
              )}
              {canUpdate && (
                <Button
                  size="md"
                  variant="secondary"
                  onClick={() => {
                    openEdit(selected);
                    setSelected(null);
                  }}
                >
                  <Pencil size={14} /> Edit
                </Button>
              )}
              {canDelete && (
                <Button
                  size="md"
                  variant="danger"
                  onClick={() => setDeleteTarget(selected)}
                >
                  <Trash2 size={14} /> Delete
                </Button>
              )}
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="mb-2">
              <StatusBadge status={selected.status || 'AVAILABLE'} />
            </div>
            {[
              ['Name', selected.name],
              ['Registration', selected.registrationNumber],
              ['Brand', selected.brand],
              ['Model', selected.model],
              ['Year', selected.year],
              ['Color', selected.color],
              [
                'Odometer',
                selected.currentOdometer != null
                  ? `${Number(selected.currentOdometer).toLocaleString()} km`
                  : null,
              ],
              ['Campus', selected.campus?.name || selected.campusName],
              ['Active', selected.isActive === false ? 'No' : 'Yes'],
            ].map(([l, v]) => (
              <div
                key={l}
                className="flex justify-between gap-4 border-b border-token pb-2"
              >
                <span className="text-muted">{l}</span>
                <span className="font-medium text-primary-token text-right">
                  {v ?? '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </Drawer>

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          if (!saveMut.isPending) {
            setModalOpen(false);
            setEditing(null);
            setFormError('');
          }
        }}
        title={editing ? 'Edit Bike' : 'Add Bike'}
        description={
          editing
            ? 'Update bike details. Registration and campus cannot be changed.'
            : 'Register a new bike in the RideOn fleet.'
        }
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setModalOpen(false)}
              disabled={saveMut.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={saveMut.isPending}
              onClick={handleSubmit}
            >
              {editing ? 'Save changes' : 'Create bike'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-danger">
              {formError}
            </div>
          )}

          {!editing && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1.5">
                  Campus ID <span className="text-danger">*</span>
                </label>
                <Input
                  value={form.campusId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, campusId: e.target.value }))
                  }
                  placeholder="clx…"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1.5">
                  Registration No. <span className="text-danger">*</span>
                </label>
                <Input
                  value={form.registrationNumber}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      registrationNumber: e.target.value,
                    }))
                  }
                  placeholder="MH12AB1234"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">
              Name
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Honda Activa 6G"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">
                Brand
              </label>
              <Input
                value={form.brand}
                onChange={(e) =>
                  setForm((f) => ({ ...f, brand: e.target.value }))
                }
                placeholder="Honda"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">
                Model
              </label>
              <Input
                value={form.model}
                onChange={(e) =>
                  setForm((f) => ({ ...f, model: e.target.value }))
                }
                placeholder="Activa 6G"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">
                Year
              </label>
              <Input
                type="number"
                min="1990"
                max="2100"
                value={form.year}
                onChange={(e) =>
                  setForm((f) => ({ ...f, year: e.target.value }))
                }
                placeholder="2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">
                Color
              </label>
              <Input
                value={form.color}
                onChange={(e) =>
                  setForm((f) => ({ ...f, color: e.target.value }))
                }
                placeholder="Pearl White"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">
                Odometer (km)
              </label>
              <Input
                type="number"
                min="0"
                value={form.currentOdometer}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    currentOdometer: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">
              Image URLs
            </label>
            <Input
              value={form.imageUrls}
              onChange={(e) =>
                setForm((f) => ({ ...f, imageUrls: e.target.value }))
              }
              placeholder="https://… (comma-separated)"
            />
            <p className="mt-1 text-xs text-muted">
              Optional. Separate multiple URLs with commas.
            </p>
          </div>
        </form>
      </Modal>

      {/* Status Modal */}
      <Modal
        open={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        title="Change bike status"
        description={statusTarget?.name || statusTarget?.registrationNumber}
        footer={
          <>
            <Button variant="secondary" onClick={() => setStatusTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={statusMut.isPending}
              onClick={() =>
                statusMut.mutate({ id: statusTarget.id, status: newStatus })
              }
            >
              Update status
            </Button>
          </>
        }
      >
        <Select
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          className="w-full"
        >
          <option value="AVAILABLE">Available</option>
          <option value="IN_USE">In Use</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="DISABLED">Disabled</option>
          <option value="RETIRED">Retired</option>
        </Select>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMut.mutate(deleteTarget.id)}
        title="Delete bike?"
        description={`Are you sure you want to delete "${deleteTarget?.name || deleteTarget?.registrationNumber}"? This will soft-delete the bike (isActive = false).`}
        confirmLabel="Delete Bike"
        loading={deleteMut.isPending}
      />
    </div>
  );
}
