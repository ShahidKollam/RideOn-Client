import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings,
  Loader2,
  Save,
  Receipt,
  Wallet,
  HardHat,
  Clock,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../components/ui/Toast';
import { cn } from '../../../utils/cn';

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

function Field({ label, value, onChange, disabled, suffix, helper, step = '1', min = '0', max }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-secondary mb-1.5">{label}</label>
      <div className="relative">
        <Input
          type="number"
          step={step}
          min={min}
          max={max}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          className={suffix ? 'pr-12' : ''}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">{suffix}</span>
        )}
      </div>
      {helper && <p className="mt-1.5 text-xs text-muted leading-relaxed">{helper}</p>}
    </div>
  );
}

const DEFAULTS = {
  gstEnabled: true,
  gstRate: 18,
  platformFeeEnabled: true,
  platformFee: 20,
  helmetFirstPrice: 0,
  helmetSecondPrice: 0,
  lateHelmetFee: 0,
  bookingBufferMinutes: 15,
  disruptionPenalty: 150,
};

export default function SettingsPage() {
  const { hasPermission } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const canUpdate = hasPermission('settings.update') || hasPermission('policies.update') || hasPermission('*');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data || res;
    },
  });

  const [form, setForm] = useState(DEFAULTS);

  useEffect(() => {
    if (!data) return;
    const s = data.settings || data;
    setForm({
      gstEnabled: !!s.gstEnabled,
      gstRate: s.gstRate ?? 18,
      platformFeeEnabled: !!s.platformFeeEnabled,
      platformFee: s.platformFee ?? 20,
      helmetFirstPrice: s.helmetFirstPrice ?? 0,
      helmetSecondPrice: s.helmetSecondPrice ?? 0,
      lateHelmetFee: s.lateHelmetFee ?? 0,
      bookingBufferMinutes: s.bookingBufferMinutes ?? 15,
      disruptionPenalty: s.disruptionPenalty ?? 150,
    });
  }, [data]);

  const mutation = useMutation({
    mutationFn: (body) => api.patch('/settings', body),
    onSuccess: (res) => {
      toast.success('Settings saved');
      const s = res?.data || res;
      if (s) {
        setForm((prev) => ({
          ...prev,
          ...s,
        }));
      }
      qc.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (e) => toast.error(e?.message || e?.data?.message || 'Failed to save settings'),
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  function handleSubmit(e) {
    e.preventDefault();
    const buffer = Number(form.bookingBufferMinutes);
    if (!Number.isInteger(buffer) || buffer < 0 || buffer > 180) {
      toast.error('Booking buffer must be an integer between 0 and 180 minutes');
      return;
    }
    if (Number(form.disruptionPenalty) < 0) {
      toast.error('Disruption penalty must be ≥ 0');
      return;
    }
    mutation.mutate({
      gstEnabled: form.gstEnabled,
      gstRate: Number(form.gstRate) || 0,
      platformFeeEnabled: form.platformFeeEnabled,
      platformFee: Number(form.platformFee) || 0,
      helmetFirstPrice: Number(form.helmetFirstPrice) || 0,
      helmetSecondPrice: Number(form.helmetSecondPrice) || 0,
      lateHelmetFee: Number(form.lateHelmetFee) || 0,
      bookingBufferMinutes: buffer,
      disruptionPenalty: Number(form.disruptionPenalty) || 0,
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin text-[var(--color-primary)]" size={28} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Settings"
        description="GST, platform fee, helmet pricing, booking buffer, and disruption penalty"
        action={
          canUpdate && (
            <Button onClick={handleSubmit} disabled={mutation.isPending} className="w-full sm:w-auto">
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {mutation.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          )
        }
      />

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-danger flex justify-between gap-2">
          <span>{error.message || 'Failed to load settings'}</span>
          <button type="button" onClick={refetch} className="underline font-medium shrink-0">
            Retry
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Operations */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-start gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 shrink-0">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-primary-token">Booking operations</h3>
              <p className="text-xs text-muted mt-0.5">
                Buffer between bookings and optional disruption penalty on late returns
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Booking buffer (minutes)"
              value={form.bookingBufferMinutes}
              onChange={(v) => set('bookingBufferMinutes', v)}
              disabled={!canUpdate}
              suffix="min"
              min="0"
              max="180"
              step="1"
              helper="Minutes required between bookings for availability and conflict checks. Applied by the backend (0–180)."
            />
            <Field
              label="Disruption penalty"
              value={form.disruptionPenalty}
              onChange={(v) => set('disruptionPenalty', v)}
              disabled={!canUpdate}
              suffix="₹"
              min="0"
              step="1"
              helper="Optional amount admin may apply on late return. Never auto-applied."
            />
          </div>
        </Card>

        {/* GST */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-start gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-500 shrink-0">
              <Receipt size={18} />
            </div>
            <div className="flex-1 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-primary-token">GST</h3>
                <p className="text-xs text-muted mt-0.5">Tax applied to taxable booking amounts</p>
              </div>
              <Toggle
                checked={form.gstEnabled}
                disabled={!canUpdate}
                onChange={(v) => set('gstEnabled', v)}
              />
            </div>
          </div>
          <Field
            label="GST rate"
            value={form.gstRate}
            onChange={(v) => set('gstRate', v)}
            disabled={!canUpdate || !form.gstEnabled}
            suffix="%"
            min="0"
            step="0.01"
          />
        </Card>

        {/* Platform fee */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-start gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-500 shrink-0">
              <Wallet size={18} />
            </div>
            <div className="flex-1 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-primary-token">Platform fee</h3>
                <p className="text-xs text-muted mt-0.5">Flat fee added per booking</p>
              </div>
              <Toggle
                checked={form.platformFeeEnabled}
                disabled={!canUpdate}
                onChange={(v) => set('platformFeeEnabled', v)}
              />
            </div>
          </div>
          <Field
            label="Platform fee amount"
            value={form.platformFee}
            onChange={(v) => set('platformFee', v)}
            disabled={!canUpdate || !form.platformFeeEnabled}
            suffix="₹"
            min="0"
            step="1"
          />
        </Card>

        {/* Helmet */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-start gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500 shrink-0">
              <HardHat size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-primary-token">Helmet pricing</h3>
              <p className="text-xs text-muted mt-0.5">Optional add-on prices and late helmet fee</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field
              label="First helmet"
              value={form.helmetFirstPrice}
              onChange={(v) => set('helmetFirstPrice', v)}
              disabled={!canUpdate}
              suffix="₹"
              min="0"
            />
            <Field
              label="Second helmet"
              value={form.helmetSecondPrice}
              onChange={(v) => set('helmetSecondPrice', v)}
              disabled={!canUpdate}
              suffix="₹"
              min="0"
            />
            <Field
              label="Late helmet fee"
              value={form.lateHelmetFee}
              onChange={(v) => set('lateHelmetFee', v)}
              disabled={!canUpdate}
              suffix="₹"
              min="0"
              helper="Applied when return is late and helmets were taken."
            />
          </div>
        </Card>

        <div className="flex items-start gap-2 rounded-xl border border-token bg-surface/50 px-4 py-3 text-xs text-muted">
          <Info size={14} className="shrink-0 mt-0.5 text-[var(--color-primary)]" />
          <p>
            There is no separate “late fee enabled” toggle. Late rental charges are calculated at return;
            admins choose whether to apply them. Booking buffer is always used by availability checks.
          </p>
        </div>

        {canUpdate && (
          <div className="sticky bottom-4 sm:static flex justify-end pt-2">
            <Button type="submit" disabled={mutation.isPending} className="w-full sm:w-auto shadow-lg sm:shadow-none">
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {mutation.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
