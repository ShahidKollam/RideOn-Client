import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  Loader2,
  Save,
  Receipt,
  Wallet,
  HardHat,
  Info,
  History,
  Tag,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../components/ui/Toast';
import { cn } from '../../../utils/cn';

const TABS = [
  { id: 'pricing', label: 'Pricing Policies', icon: Tag },
  { id: 'helmet', label: 'Helmet Pricing', icon: HardHat },
  { id: 'history', label: 'Activity History', icon: History },
];

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40',
        checked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border-strong)]',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span
        className={cn(
          'pointer-events-none absolute left-1 flex h-5 items-center justify-center rounded-full bg-white text-[9px] font-bold text-[var(--color-primary)] shadow-sm transition-all duration-200',
          checked ? 'translate-x-5 w-7' : 'translate-x-0 w-5'
        )}
      >
        {checked ? 'ON' : ''}
      </span>
    </button>
  );
}

function FieldWithSuffix({
  label,
  value,
  onChange,
  disabled,
  suffix,
  helper,
  step = '0.01',
  min = '0',
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-secondary mb-1.5">{label}</label>
      <div className="relative">
        <Input
          type="number"
          step={step}
          min={min}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="pr-10"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted pointer-events-none">
          {suffix}
        </span>
      </div>
      {helper && <p className="mt-1.5 text-xs text-muted">{helper}</p>}
    </div>
  );
}

export default function PoliciesPage() {
  const { hasPermission } = useAuth();
  const canUpdate = hasPermission('policies.update') || hasPermission('*');
  const queryClient = useQueryClient();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('pricing');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['policies'],
    queryFn: async () => {
      try {
        const res = await api.get('/policies');
        return res.data || res;
      } catch {
        // fallback to /settings if policies path not available
        const res = await api.get('/settings');
        return res.data || res;
      }
    },
  });

  const policy = data?.policy || data?.settings || data || {};

  const [form, setForm] = useState({
    gstEnabled: false,
    gstRate: 0,
    platformFeeEnabled: false,
    platformFee: 0,
    helmetFirstPrice: 0,
    helmetSecondPrice: 0,
    lateHelmetFee: 0,
  });

  useEffect(() => {
    if (policy && Object.keys(policy).length) {
      setForm({
        gstEnabled: !!policy.gstEnabled,
        gstRate: policy.gstRate ?? 0,
        platformFeeEnabled: !!policy.platformFeeEnabled,
        platformFee: policy.platformFee ?? 0,
        helmetFirstPrice: policy.helmetFirstPrice ?? 0,
        helmetSecondPrice: policy.helmetSecondPrice ?? 0,
        lateHelmetFee: policy.lateHelmetFee ?? 0,
      });
    }
  }, [policy]);

  const mutation = useMutation({
    mutationFn: async (body) => {
      try {
        return await api.patch('/policies', body);
      } catch {
        return await api.patch('/settings', body);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success('Policies updated successfully');
    },
    onError: (e) => {
      toast.error(e?.message || 'Failed to update policies');
    },
  });

  function handleChange(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e) {
    e?.preventDefault();
    if (!canUpdate) return;
    mutation.mutate(form);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-brand" size={28} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Policies"
        description="Platform fees, GST and helmet pricing"
        actions={
          canUpdate ? (
            <Button
              size="md"
              variant="primary"
              onClick={handleSubmit}
              loading={mutation.isPending}
            >
              <Save size={16} />
              {mutation.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          ) : null
        }
      />

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-danger flex items-center justify-between">
          <span>{error.message || 'Failed to load policies'}</span>
          <button onClick={refetch} className="underline ml-2 font-medium">
            Retry
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-1 rounded-xl border border-token bg-surface p-1 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap',
                active
                  ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)] shadow-sm'
                  : 'text-secondary hover:text-primary-token hover:bg-[var(--color-primary-soft)]/50'
              )}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Pricing Policies tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* GST Settings */}
              <Card className="p-5">
                <div className="flex items-start gap-3 mb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-500 shrink-0">
                    <Receipt size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-primary-token">GST Settings</h3>
                    <p className="text-xs text-muted mt-0.5">
                      Configure GST settings for the platform
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-5">
                  <span className="text-sm font-medium text-primary-token">Enable GST</span>
                  <Toggle
                    checked={form.gstEnabled}
                    disabled={!canUpdate}
                    onChange={(v) => handleChange('gstEnabled', v)}
                  />
                </div>

                <FieldWithSuffix
                  label="GST Rate (%)"
                  value={form.gstRate}
                  onChange={(v) => handleChange('gstRate', v)}
                  disabled={!canUpdate || !form.gstEnabled}
                  suffix="%"
                  helper="This rate will be applied to all platform transactions"
                />
              </Card>

              {/* Platform Fee */}
              <Card className="p-5">
                <div className="flex items-start gap-3 mb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500 shrink-0">
                    <Wallet size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-primary-token">Platform Fee</h3>
                    <p className="text-xs text-muted mt-0.5">
                      Configure platform service fee
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-5">
                  <span className="text-sm font-medium text-primary-token">
                    Enable platform fee
                  </span>
                  <Toggle
                    checked={form.platformFeeEnabled}
                    disabled={!canUpdate}
                    onChange={(v) => handleChange('platformFeeEnabled', v)}
                  />
                </div>

                <FieldWithSuffix
                  label="Platform Fee ($)"
                  value={form.platformFee}
                  onChange={(v) => handleChange('platformFee', v)}
                  disabled={!canUpdate || !form.platformFeeEnabled}
                  suffix="$"
                  helper="This fee will be added to each booking as a platform service charge"
                />
              </Card>
            </div>

            {/* Helmet Pricing summary card on Pricing tab too for quick view */}
            <Card className="p-5">
              <div className="flex items-start gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 shrink-0">
                  <HardHat size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-primary-token">Helmet Pricing</h3>
                  <p className="text-xs text-muted mt-0.5">
                    Set helmet fees for different usage durations
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FieldWithSuffix
                  label="First helmet fee ($)"
                  value={form.helmetFirstPrice}
                  onChange={(v) => handleChange('helmetFirstPrice', v)}
                  disabled={!canUpdate}
                  suffix="$"
                  helper="Fee for the first helmet"
                />
                <FieldWithSuffix
                  label="Second helmet fee ($)"
                  value={form.helmetSecondPrice}
                  onChange={(v) => handleChange('helmetSecondPrice', v)}
                  disabled={!canUpdate}
                  suffix="$"
                  helper="Fee for the second helmet"
                />
                <FieldWithSuffix
                  label="Late helmet fee ($)"
                  value={form.lateHelmetFee}
                  onChange={(v) => handleChange('lateHelmetFee', v)}
                  disabled={!canUpdate}
                  suffix="$"
                  helper="Additional fee for late returns"
                />
              </div>
            </Card>
          </div>
        )}

        {/* Helmet Pricing tab (focused view) */}
        {activeTab === 'helmet' && (
          <Card className="p-5 max-w-3xl">
            <div className="flex items-start gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 shrink-0">
                <HardHat size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-primary-token">Helmet Pricing</h3>
                <p className="text-xs text-muted mt-0.5">
                  Set helmet fees for different usage durations
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <FieldWithSuffix
                label="First helmet fee ($)"
                value={form.helmetFirstPrice}
                onChange={(v) => handleChange('helmetFirstPrice', v)}
                disabled={!canUpdate}
                suffix="$"
                helper="Fee for the first helmet"
              />
              <FieldWithSuffix
                label="Second helmet fee ($)"
                value={form.helmetSecondPrice}
                onChange={(v) => handleChange('helmetSecondPrice', v)}
                disabled={!canUpdate}
                suffix="$"
                helper="Fee for the second helmet"
              />
              <FieldWithSuffix
                label="Late helmet fee ($)"
                value={form.lateHelmetFee}
                onChange={(v) => handleChange('lateHelmetFee', v)}
                disabled={!canUpdate}
                suffix="$"
                helper="Additional fee for late returns"
              />
            </div>
          </Card>
        )}

        {/* Activity History tab */}
        {activeTab === 'history' && (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center text-center py-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary-soft)] text-brand mb-4">
                <History size={24} />
              </div>
              <h3 className="text-base font-semibold text-primary-token mb-1">
                Activity History
              </h3>
              <p className="text-sm text-muted max-w-sm">
                Policy change history will appear here once the audit feed is connected.
                Changes you save today are applied immediately to new bookings.
              </p>
            </div>
          </Card>
        )}

        {/* About box — always visible */}
        <div className="mt-5 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary-soft)]/40 px-5 py-4 flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/15 text-brand shrink-0 mt-0.5">
            <Info size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--color-primary)]">
              About Policy Settings
            </p>
            <p className="text-xs text-secondary mt-1 leading-relaxed">
              These policies will be applied to all new bookings and transactions. Changes will
              not affect existing bookings.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 shrink-0 opacity-60">
            <ShieldCheck size={28} className="text-brand" />
          </div>
        </div>
      </form>
    </div>
  );
}
