import {
    CircleDollarSign,
    CalendarCheck,
    UsersRound,
    CreditCard,
    Bike,
    CalendarPlus,
    UserPlus,
    BarChart3,
    Settings,
    FileText,
    Ticket,
    CheckCircle2,
    UserPlus as UserPlusIcon,
    Wrench,
    Calendar,
    XCircle,
    MoreHorizontal,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { cn } from '../../../utils/cn'

/* ── Demo data (visual prototype) ── */
const KPI = [
    {
        title: 'TOTAL REVENUE',
        value: '$48,240.50',
        change: '12.5%',
        up: true,
        label: 'vs last month',
        icon: CircleDollarSign,
        iconBg: 'bg-violet-500/15 text-violet-400',
        spark: [12, 18, 14, 22, 19, 28, 24, 32, 30, 38, 35, 42],
        sparkColor: '#a78bfa',
    },
    {
        title: 'TOTAL BOOKINGS',
        value: '1,284',
        change: '8.2%',
        up: true,
        label: 'vs last month',
        icon: CalendarCheck,
        iconBg: 'bg-emerald-500/15 text-emerald-400',
        spark: [20, 22, 18, 25, 28, 24, 30, 32, 29, 35, 38, 40],
        sparkColor: '#34d399',
    },
    {
        title: 'ACTIVE USERS',
        value: '8,742',
        change: '5.1%',
        up: true,
        label: 'vs last month',
        icon: UsersRound,
        iconBg: 'bg-amber-500/15 text-amber-400',
        spark: [30, 28, 32, 35, 33, 38, 36, 40, 42, 39, 44, 48],
        sparkColor: '#fbbf24',
    },
    {
        title: 'PENDING PAYMENTS',
        value: '36',
        change: '3',
        up: false,
        label: 'vs yesterday',
        icon: CreditCard,
        iconBg: 'bg-red-500/15 text-red-400',
        spark: [40, 38, 42, 35, 30, 28, 32, 25, 22, 20, 18, 16],
        sparkColor: '#f87171',
    },
]

const REVENUE = [
    { month: 'Dec', value: 24500 },
    { month: 'Jan', value: 39200 },
    { month: 'Feb', value: 24800 },
    { month: 'Mar', value: 36500 },
    { month: 'Apr', value: 47800 },
    { month: 'May', value: 48240 },
]

const BOOKING_STATS = [
    { label: 'Active', value: 642, percent: 50.0, color: '#10b981' },
    { label: 'Completed', value: 412, percent: 32.1, color: '#3b82f6' },
    { label: 'Cancelled', value: 156, percent: 12.1, color: '#ef4444' },
    { label: 'Pending', value: 74, percent: 5.8, color: '#f59e0b' },
]

const BIKE_STATS = [
    { label: 'Available', value: 12, percent: 50.0, color: '#10b981' },
    { label: 'Booked', value: 8, percent: 33.3, color: '#3b82f6' },
    { label: 'Maintenance', value: 3, percent: 12.5, color: '#f59e0b' },
    { label: 'Retired', value: 1, percent: 4.2, color: '#94a3b8' },
]

const QUICK_LINKS = [
    { label: 'Add New Bike', icon: Bike, color: 'text-blue-400' },
    { label: 'New Booking', icon: CalendarPlus, color: 'text-emerald-400' },
    { label: 'Add User', icon: UserPlus, color: 'text-violet-400' },
    { label: 'Create Report', icon: BarChart3, color: 'text-amber-400' },
    { label: 'View Payments', icon: CreditCard, color: 'text-cyan-400' },
    { label: 'Open Tickets', icon: Ticket, color: 'text-red-400' },
    { label: 'System Settings', icon: Settings, color: 'text-slate-400' },
    { label: 'Audit Logs', icon: FileText, color: 'text-indigo-400' },
]

const RECENT_ACTIVITY = [
    {
        icon: CheckCircle2,
        color: 'text-emerald-400',
        title: 'Payment received',
        desc: '$850.00 from John Doe',
        time: '2m ago',
    },
    {
        icon: UserPlusIcon,
        color: 'text-blue-400',
        title: 'New user registered',
        desc: 'Alex Johnson joined',
        time: '15m ago',
    },
    {
        icon: Wrench,
        color: 'text-amber-400',
        title: 'Bike status updated',
        desc: 'Yamaha R15 set to Maintenance',
        time: '32m ago',
    },
    {
        icon: Calendar,
        color: 'text-violet-400',
        title: 'New booking created',
        desc: 'Booking #BK-1245 created',
        time: '1h ago',
    },
    {
        icon: XCircle,
        color: 'text-red-400',
        title: 'Payment failed',
        desc: 'Payment failed for booking #BK-1242',
        time: '2h ago',
    },
]

const TOP_BIKES = [
    { name: 'Yamaha R15', bookings: 326, pct: 100 },
    { name: 'Yamaha MT-15', bookings: 284, pct: 87 },
    { name: 'Honda Hornet 2.0', bookings: 198, pct: 61 },
    { name: 'TVS Apache RTR 160', bookings: 142, pct: 44 },
    { name: 'Bajaj Pulsar 150', bookings: 110, pct: 34 },
]

/* ── Sparkline (SVG) ── */
function Sparkline({ data, color = '#4C8DFF', height = 32 }) {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    const w = 100
    const points = data
        .map((v, i) => {
            const x = (i / (data.length - 1)) * w
            const y = height - ((v - min) / range) * (height - 4) - 2
            return `${x},${y}`
        })
        .join(' ')
    return (
        <svg viewBox={`0 0 ${w} ${height}`} className="w-full h-8" preserveAspectRatio="none">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
        </svg>
    )
}

/* ── Proportional bar chart ── */
function RevenueBars({ data }) {
    const max = Math.max(...data.map((d) => d.value))
    return (
        <div className="flex items-end gap-3 sm:gap-4 h-44 pt-2">
            {data.map((d) => {
                const h = Math.max(8, Math.round((d.value / max) * 100))
                return (
                    <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="relative w-full flex items-end justify-center" style={{ height: 140 }}>
                            <div
                                className="w-full max-w-[48px] mx-auto rounded-t-md bg-gradient-to-t from-[var(--color-primary)] to-[var(--color-primary)]/70 transition-all duration-300 group-hover:opacity-90"
                                style={{ height: `${h}%` }}
                                title={`$${d.value.toLocaleString()}`}
                            />
                            {d.month === 'May' && (
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--color-primary)] px-2 py-0.5 text-[10px] font-semibold text-white shadow">
                                    $48,240.50
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-muted">{d.month}</span>
                    </div>
                )
            })}
        </div>
    )
}

/* ── Donut ── */
function Donut({ total, segments, size = 110 }) {
    let angle = 0
    const parts = segments.map((s) => {
        const start = angle
        angle += (s.percent / 100) * 360
        return `${s.color} ${start}deg ${angle}deg`
    })
    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            <div
                className="rounded-full"
                style={{ width: size, height: size, background: `conic-gradient(${parts.join(', ')})` }}
            />
            <div
                className="absolute inset-0 m-auto rounded-full bg-surface flex flex-col items-center justify-center"
                style={{ width: size * 0.58, height: size * 0.58 }}
            >
                <span className="text-lg font-bold text-primary-token leading-none">{total}</span>
                <span className="text-[9px] text-muted uppercase mt-0.5">Total</span>
            </div>
        </div>
    )
}

export default function DashboardPage() {
    const navigate = useNavigate()
    const { data: overview } = useQuery({
        queryKey: ['dashboard-overview'],
        queryFn: async () => {
            try {
                const res = await api.get('/dashboard/overview')
                return res.data || res
            } catch {
                return null
            }
        },
    })
    const lateReturns = overview?.bookings?.lateReturns ?? null

    return (
        <div className="space-y-5">
            {lateReturns != null && lateReturns > 0 && (
                <button
                    type="button"
                    onClick={() => navigate('/bookings?late=1')}
                    className="mb-4 w-full sm:w-auto flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-left hover:bg-red-500/15 transition-colors"
                >
                    <span className="text-lg">🔴</span>
                    <div>
                        <p className="text-sm font-semibold text-red-600 dark:text-red-400">Late Returns</p>
                        <p className="text-xs text-secondary">
                            {lateReturns} active booking{lateReturns === 1 ? '' : 's'} past scheduled return — view list
                        </p>
                    </div>
                </button>
            )}

            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold text-primary-token">
                    Welcome back, <span className="text-brand">Admin Hasan</span> 👋
                </h1>
                <p className="mt-1 text-sm text-secondary">
                    Here&apos;s what&apos;s happening with your RideOn platform today.
                </p>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {KPI.map((k) => (
                    <div
                        key={k.title}
                        className="relative bg-surface border border-token rounded-lg p-5 shadow-card transition-theme hover:border-[var(--color-primary)]/30"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', k.iconBg)}>
                                <k.icon size={20} strokeWidth={2} />
                            </div>
                            <button className="text-muted hover:text-secondary p-1 rounded-md hover:bg-[var(--color-primary-soft)] transition-colors">
                                <MoreHorizontal size={16} />
                            </button>
                        </div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted mb-1">{k.title}</p>
                        <p className="text-2xl font-bold text-primary-token tracking-tight">{k.value}</p>
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                            <span className={cn('font-medium', k.up ? 'text-success' : 'text-danger')}>
                                {k.up ? '↑' : '↓'} {k.change}
                            </span>
                            <span className="text-muted">{k.label}</span>
                        </div>
                        <div className="mt-3">
                            <Sparkline data={k.spark} color={k.sparkColor} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Revenue + Recent Activity */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <Card className="xl:col-span-2">
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 size={18} className="text-brand" />
                                Revenue Overview
                            </CardTitle>
                            <p className="text-xs text-muted mt-0.5">Monthly revenue comparison</p>
                        </div>
                        <button className="text-xs font-medium text-secondary border border-token rounded-lg px-3 py-1.5 hover:bg-[var(--color-primary-soft)] transition-colors shrink-0">
                            This Month ▾
                        </button>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-1 flex justify-between text-[10px] text-muted">
                            <span>$60K</span>
                        </div>
                        <RevenueBars data={REVENUE} />
                        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-token pt-4">
                            <div>
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                                    <span className="text-xs text-muted">This Month</span>
                                </div>
                                <p className="font-semibold text-primary-token">$48,240.50</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="h-2 w-2 rounded-full bg-violet-400" />
                                    <span className="text-xs text-muted">Last Month</span>
                                </div>
                                <p className="font-semibold text-primary-token">$42,890.20</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                    <span className="text-xs text-muted">Growth Rate</span>
                                </div>
                                <p className="font-semibold text-success">12.47% ↑</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                                    <span className="text-xs text-muted">Best Month</span>
                                </div>
                                <p className="font-semibold text-primary-token">March 2025</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Activity</CardTitle>
                        <button className="text-xs font-medium text-brand hover:underline">View all</button>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {RECENT_ACTIVITY.map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div
                                        className={cn(
                                            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)]',
                                            item.color
                                        )}
                                    >
                                        <item.icon size={15} strokeWidth={2} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-primary-token leading-tight">{item.title}</p>
                                        <p className="text-xs text-muted truncate mt-0.5">{item.desc}</p>
                                    </div>
                                    <span className="text-[11px] text-muted shrink-0">{item.time}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Links */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                        {QUICK_LINKS.map((link) => (
                            <button
                                key={link.label}
                                className={cn(
                                    'flex flex-col items-center gap-2 rounded-lg border border-token p-4',
                                    'hover:bg-[var(--color-primary-soft)] hover:border-[var(--color-primary)]/30 transition-all duration-150',
                                    'text-center group'
                                )}
                            >
                                <link.icon
                                    size={22}
                                    className={cn(link.color, 'group-hover:scale-110 transition-transform')}
                                    strokeWidth={1.75}
                                />
                                <span className="text-xs font-medium text-secondary leading-tight">{link.label}</span>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Bottom: Bookings / Bikes / Top Bikes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Bookings Overview</CardTitle>
                        <p className="text-xs text-muted">This month overview</p>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-5">
                            <Donut total="1,284" segments={BOOKING_STATS} />
                            <div className="space-y-2 flex-1">
                                {BOOKING_STATS.map((s) => (
                                    <div key={s.label} className="flex items-center gap-2 text-sm">
                                        <span
                                            className="h-2.5 w-2.5 rounded-full shrink-0"
                                            style={{ background: s.color }}
                                        />
                                        <span className="text-secondary flex-1">{s.label}</span>
                                        <span className="font-medium text-primary-token">{s.value}</span>
                                        <span className="text-muted text-xs w-12 text-right">({s.percent}%)</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Bike Status Overview</CardTitle>
                        <p className="text-xs text-muted">Total 24 bikes</p>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-5">
                            <Donut total="24" segments={BIKE_STATS} />
                            <div className="space-y-2 flex-1">
                                {BIKE_STATS.map((s) => (
                                    <div key={s.label} className="flex items-center gap-2 text-sm">
                                        <span
                                            className="h-2.5 w-2.5 rounded-full shrink-0"
                                            style={{ background: s.color }}
                                        />
                                        <span className="text-secondary flex-1">{s.label}</span>
                                        <span className="font-medium text-primary-token">{s.value}</span>
                                        <span className="text-muted text-xs w-12 text-right">({s.percent}%)</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Top Bikes by Bookings</CardTitle>
                            <p className="text-xs text-muted">This month</p>
                        </div>
                        <button className="text-xs font-medium text-brand hover:underline">View all</button>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3.5">
                            {TOP_BIKES.map((b) => (
                                <li key={b.name} className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-primary-soft)] text-brand shrink-0">
                                        <Bike size={14} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-primary-token truncate">{b.name}</p>
                                        <div className="mt-1 h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-[var(--color-primary)] transition-all"
                                                style={{ width: `${b.pct}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-primary-token shrink-0">{b.bookings}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
