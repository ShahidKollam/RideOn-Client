import { MobileList, MobileCard } from '../../../components/ui/MobileList';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Tags,
  Eye,
  Pencil,
  Trash2,
  Plus,
  Star,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { DataTable } from '../../../components/ui/DataTable';
// import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { ActionMenu } from '../../../components/ui/ActionMenu';
import { Drawer } from '../../../components/ui/Drawer';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../components/ui/Toast';
import { cn } from '../../../utils/cn';

function parseList(data) {
  const rows =
    data?.pricings ||
    data?.pricing ||
    data?.items ||
    data?.data ||
    (Array.isArray(data) ? data : []);
  const pagination = data?.pagination || {};
  return {
    rows,
    total: pagination.total ?? data?.total ?? rows.length,
    totalPages:
      pagination.totalPages ??
      Math.max(1, Math.ceil((pagination.total ?? rows.length) / (pagination.limit || 10))),
  };
}

const EMPTY_FORM = {
  packageName: '',
  durationHours: 4,
  price: 0,
  includedKm: 0,
  extraKmRate: 0,
  depositAmount: 0,
  displayOrder: 0,
  isFeatured: false,
  isActive: true,
  campusId: '',
};

export default function PricingPage() {
  const { hasPermission } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = create, object = edit
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const canCreate = hasPermission('pricing.create') || hasPermission('*');
  const canUpdate = hasPermission('pricing.update') || hasPermission('*');
  const canDelete = hasPermission('pricing.delete') || hasPermission('*');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['pricing', { page, limit, search }],
    queryFn: async () => {
      const qs = new URLSearchParams({ page, limit });
      if (search) qs.set('search', search);
      const res = await api.get(`/pricing?${qs}`);
      return res.data || res;
    },
  });
  const { rows, total, totalPages } = parseList(data || {});

  const saveMut = useMutation({
    mutationFn: (payload) => {
      if (editing?.id) {
        // PATCH — all fields optional except we send the ones we have
        const { campusId, ...body } = payload;
        return api.patch(`/pricing/${editing.id}`, body);
      }
      return api.post('/pricing', payload);
    },
    onSuccess: () => {
      toast.success(editing ? 'Pricing updated successfully' : 'Pricing package created');
      setModalOpen(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      qc.invalidateQueries({ queryKey: ['pricing'] });
    },
    onError: (e) => {
      setFormError(e?.message || e?.data?.message || 'Failed to save pricing');
      toast.error(e?.message || 'Failed to save pricing');
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/pricing/${id}`),
    onSuccess: () => {
      toast.success('Pricing package deleted');
      setDeleteTarget(null);
      if (selected?.id === deleteTarget?.id) setSelected(null);
      qc.invalidateQueries({ queryKey: ['pricing'] });
    },
    onError: (e) => toast.error(e.message || 'Failed to delete'),
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
      packageName: row.packageName || row.name || '',
      durationHours: row.durationHours ?? 4,
      price: row.price ?? 0,
      includedKm: row.includedKm ?? 0,
      extraKmRate: row.extraKmRate ?? 0,
      depositAmount: row.depositAmount ?? 0,
      displayOrder: row.displayOrder ?? 0,
      isFeatured: !!row.isFeatured,
      isActive: row.isActive !== false,
      campusId: row.campusId || row.campus?.id || '',
    });
    setFormError('');
    setModalOpen(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!form.packageName.trim()) {
      setFormError('Package name is required');
      return;
    }
    if (!form.durationHours || form.durationHours <= 0) {
      setFormError('Duration must be greater than 0');
      return;
    }
    if (form.price == null || form.price < 0) {
      setFormError('Price is required');
      return;
    }
    const payload = {
      packageName: form.packageName.trim(),
      durationHours: Number(form.durationHours),
      price: Number(form.price),
      includedKm: Number(form.includedKm) || 0,
      extraKmRate: Number(form.extraKmRate) || 0,
      depositAmount: Number(form.depositAmount) || 0,
      displayOrder: Number(form.displayOrder) || 0,
      isFeatured: !!form.isFeatured,
      isActive: !!form.isActive,
    };
    if (!editing && form.campusId) {
      payload.campusId = form.campusId;
    }
    saveMut.mutate(payload);
  }

  const columns = [
    {
      key: 'packageName',
      header: 'Package',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-[var(--color-primary-soft)] text-brand flex items-center justify-center shrink-0">
            <Tags size={16} />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-primary-token truncate flex items-center gap-1.5">
              {r.packageName || r.name || '—'}
              {r.isFeatured && (
                <Star size={12} className="text-amber-400 fill-amber-400 shrink-0" />
              )}
            </p>
            <p className="text-xs text-muted truncate">
              {r.campus?.name || r.campusName || '—'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'durationHours',
      header: 'Duration',
      render: (r) => (
        <span className="text-secondary">
          {r.durationHours != null ? `${r.durationHours}h` : '—'}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (r) => (
        <span className="font-semibold text-primary-token">
          {r.price != null ? `$${Number(r.price).toFixed(2)}` : '—'}
        </span>
      ),
    },
    {
      key: 'includedKm',
      header: 'Included Km',
      render: (r) => (
        <span className="text-secondary">
          {r.includedKm != null ? `${r.includedKm} km` : '—'}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (r) => (
        <StatusBadge status={r.isActive === false ? 'DISABLED' : 'ACTIVE'} />
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
        title="Pricing"
        description="Manage rental packages and pricing"
        actions={
          canCreate ? (
            <Button size="md" variant="primary" onClick={openCreate}>
              <Plus size={16} /> Add Package
            </Button>
          ) : null
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Packages', value: total },
          { label: 'On Page', value: rows.length },
          { label: 'Page', value: `${page} / ${totalPages}` },
          { label: 'Per Page', value: limit },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs text-muted">{s.label}</p>
            <p className="text-lg font-bold text-primary-token">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="flex gap-3 p-4 border-b border-token">
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
                placeholder="Search packages…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary" size="md">
              Search
            </Button>
          </form>
        </div>
        <MobileList>
        {(rows || []).map((r) => (
          <MobileCard key={r.id} onClick={() => typeof setSelected === 'function' ? setSelected(r) : undefined}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-sm text-primary-token">{r.packageName || `${r.durationHours}h`}</span>
              <StatusBadge status={r.isActive === false ? 'DISABLED' : 'AVAILABLE'} />
            </div>
            <p className="text-sm text-secondary">₹{Number(r.price||0).toLocaleString('en-IN')} · {r.durationHours}h</p>
          </MobileCard>
        ))}
      </MobileList>
      <div className="hidden md:block">
      <DataTable
          columns={columns}
          rows={rows}
          loading={isLoading}
          error={error?.message}
          onRetry={refetch}
          emptyTitle="No pricing packages"
          emptyDescription="Create your first rental package to get started."
          emptyIcon={Tags}
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

      {/* Detail Drawer */}
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.packageName || selected?.name || 'Package'}
        description={selected?.campus?.name || selected?.campusName}
        footer={
          selected && (
            <>
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
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-2">
              <StatusBadge
                status={selected.isActive === false ? 'DISABLED' : 'ACTIVE'}
              />
              {selected.isFeatured && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-500">
                  <Star size={12} className="fill-amber-400" /> Featured
                </span>
              )}
            </div>
            {[
              ['Package', selected.packageName || selected.name],
              [
                'Duration',
                selected.durationHours != null
                  ? `${selected.durationHours} hours`
                  : null,
              ],
              [
                'Price',
                selected.price != null
                  ? `$${Number(selected.price).toFixed(2)}`
                  : null,
              ],
              [
                'Included Km',
                selected.includedKm != null ? `${selected.includedKm} km` : null,
              ],
              [
                'Extra Km Rate',
                selected.extraKmRate != null
                  ? `$${Number(selected.extraKmRate).toFixed(2)} / km`
                  : null,
              ],
              [
                'Deposit',
                selected.depositAmount != null
                  ? `$${Number(selected.depositAmount).toFixed(2)}`
                  : null,
              ],
              ['Display Order', selected.displayOrder],
              ['Campus', selected.campus?.name || selected.campusName],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between gap-4 border-b border-token pb-2.5"
              >
                <span className="text-muted">{label}</span>
                <span className="font-medium text-primary-token text-right">
                  {value ?? '—'}
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
        title={editing ? 'Edit Pricing Package' : 'Add Pricing Package'}
        description={
          editing
            ? 'Update package details. Campus cannot be changed.'
            : 'Create a new rental package for a campus.'
        }
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
              {editing ? 'Save changes' : 'Create package'}
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

          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">
              Package name <span className="text-danger">*</span>
            </label>
            <Input
              value={form.packageName}
              onChange={(e) =>
                setForm((f) => ({ ...f, packageName: e.target.value }))
              }
              placeholder="e.g. 4 Hour Package"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">
                Duration (hours) <span className="text-danger">*</span>
              </label>
              <Input
                type="number"
                min="1"
                step="1"
                value={form.durationHours}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    durationHours: parseInt(e.target.value, 10) || 0,
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">
                Price ($) <span className="text-danger">*</span>
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    price: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">
                Included Km
              </label>
              <Input
                type="number"
                min="0"
                value={form.includedKm}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    includedKm: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">
                Extra Km Rate ($)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.extraKmRate}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    extraKmRate: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">
                Deposit Amount ($)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.depositAmount}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    depositAmount: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">
                Display Order
              </label>
              <Input
                type="number"
                min="0"
                value={form.displayOrder}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    displayOrder: parseInt(e.target.value, 10) || 0,
                  }))
                }
              />
            </div>
          </div>

          {!editing && (
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">
                Campus ID
              </label>
              <Input
                value={form.campusId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, campusId: e.target.value }))
                }
                placeholder="clx… (required by API)"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-6 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isFeatured: e.target.checked }))
                }
                className="h-4 w-4 rounded border-token accent-[var(--color-primary)]"
              />
              <span className="text-sm text-primary-token">Featured package</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isActive: e.target.checked }))
                }
                className="h-4 w-4 rounded border-token accent-[var(--color-primary)]"
              />
              <span className="text-sm text-primary-token">Active</span>
            </label>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMut.mutate(deleteTarget.id)}
        title="Delete package?"
        description={`Delete "${deleteTarget?.packageName || deleteTarget?.name}"? This soft-deletes the package (isActive = false).`}
        confirmLabel="Delete"
        loading={deleteMut.isPending}
      />
    </div>
  );
}
