import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    Users,
    Bike,
    CalendarCheck,
    CreditCard,
    Tags,
    ShieldCheck,
    UsersRound,
    ClipboardList,
    Settings,
    FileText,
    Ticket,
    ChevronDown,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../utils/cn'

const NAV_GROUPS = [
    {
        label: null,
        items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard.read' }],
    },
    {
        label: 'MANAGEMENT',
        items: [
            { to: '/users', label: 'Users', icon: Users, permission: 'users.read' },
            { to: '/bikes', label: 'Bikes', icon: Bike, permission: 'bikes.read' },
            {
                to: '/bookings',
                label: 'Bookings',
                icon: CalendarCheck,
                permission: 'bookings.read',
                children: [
                    { to: '/bookings', label: 'All Bookings', end: true, permission: 'bookings.read' },
                    { to: '/bookings/reserve', label: 'Reserve a Ride', permission: 'bookings.create' },
                ],
            },
            { to: '/payments', label: 'Payments', icon: CreditCard, permission: 'payments.read' },
            { to: '/tickets', label: 'Tickets', icon: Ticket, permission: 'tickets.read', badge: 3 },
        ],
    },
    {
        label: 'BUSINESS',
        items: [
            { to: '/pricing', label: 'Pricing', icon: Tags, permission: 'pricing.read' },
            { to: '/policies', label: 'Policies', icon: ShieldCheck, permission: 'policies.read' },
        ],
    },
    {
        label: 'ADMINISTRATION',
        items: [
            { to: '/roles', label: 'Roles & Permissions', icon: UsersRound, permission: 'roles.read' },
            { to: '/audit', label: 'Audit Logs', icon: ClipboardList, permission: 'audit.read' },
        ],
    },
    {
        label: 'SYSTEM',
        items: [
            { to: '/settings', label: 'Settings', icon: Settings, permission: 'settings.read' },
            { to: '/system-logs', label: 'System Logs', icon: FileText, permission: 'system-logs.read' },
        ],
    },
]

function canSee(item, hasPermission) {
    if (!item.permission) return true
    return hasPermission(item.permission) || hasPermission('*')
}

export function Sidebar({ collapsed, mobileOpen, onMobileClose }) {
    const { hasPermission, admin, logout } = useAuth()
    const location = useLocation()
    const [openGroups, setOpenGroups] = useState(() => {
        // Auto-open Bookings when on a bookings route
        if (location.pathname.startsWith('/bookings')) return { bookings: true }
        return {}
    })

    useEffect(() => {
        if (location.pathname.startsWith('/bookings')) {
            setOpenGroups((g) => ({ ...g, bookings: true }))
        }
    }, [location.pathname])

    const toggleGroup = (key) => {
        setOpenGroups((g) => ({ ...g, [key]: !g[key] }))
    }

    const content = (
        <div className="flex h-full flex-col">
            <div
                className={cn(
                    'flex items-center gap-3 px-4 h-16 border-b border-token shrink-0',
                    collapsed && 'justify-center px-2'
                )}
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white font-bold text-sm shrink-0">
                    R
                </div>
                {!collapsed && (
                    <div className="min-w-0">
                        <div className="text-sm font-bold text-primary-token tracking-tight leading-tight">RIDEON</div>
                        <div className="text-[10px] text-muted leading-none mt-0.5">Control Center</div>
                    </div>
                )}
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                {NAV_GROUPS.map((group) => {
                    const visibleItems = group.items.filter((item) => canSee(item, hasPermission))
                    if (visibleItems.length === 0) return null

                    return (
                        <div key={group.label || 'main'}>
                            {!collapsed && group.label && (
                                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
                                    {group.label}
                                </p>
                            )}
                            <ul className="space-y-0.5">
                                {visibleItems.map((item) => {
                                    const children = (item.children || []).filter((c) => canSee(c, hasPermission))
                                    const hasChildren = children.length > 0
                                    const groupKey = item.to.replace(/\//g, '') || 'root'
                                    const isOpen = !!openGroups[groupKey]
                                    const pathActive =
                                        item.to === '/'
                                            ? location.pathname === '/'
                                            : location.pathname === item.to ||
                                              location.pathname.startsWith(item.to + '/')

                                    if (hasChildren && !collapsed) {
                                        return (
                                            <li key={item.to}>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleGroup(groupKey)}
                                                    className={cn(
                                                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                                                        pathActive
                                                            ? 'bg-[var(--color-primary)]/15 text-primary-token'
                                                            : 'text-secondary hover:bg-[var(--color-primary-soft)] hover:text-primary-token'
                                                    )}
                                                >
                                                    <item.icon size={18} strokeWidth={2} className="shrink-0" />
                                                    <span className="truncate flex-1 text-left">{item.label}</span>
                                                    <ChevronDown
                                                        size={14}
                                                        className={cn(
                                                            'shrink-0 text-muted transition-transform duration-200',
                                                            isOpen && 'rotate-180'
                                                        )}
                                                    />
                                                </button>
                                                {isOpen && (
                                                    <ul className="mt-0.5 ml-4 pl-3 border-l border-token space-y-0.5">
                                                        {children.map((child) => (
                                                            <li key={child.to + child.label}>
                                                                <NavLink
                                                                    to={child.to}
                                                                    end={child.end === true}
                                                                    onClick={onMobileClose}
                                                                    className={({ isActive }) =>
                                                                        cn(
                                                                            'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
                                                                            isActive
                                                                                ? 'bg-[var(--color-primary)] text-white shadow-sm'
                                                                                : 'text-secondary hover:bg-[var(--color-primary-soft)] hover:text-primary-token'
                                                                        )
                                                                    }
                                                                >
                                                                    <span
                                                                        className={cn(
                                                                            'h-1.5 w-1.5 rounded-full shrink-0',
                                                                            location.pathname === child.to ||
                                                                                (child.end &&
                                                                                    location.pathname === child.to)
                                                                                ? 'bg-white'
                                                                                : 'bg-current opacity-50'
                                                                        )}
                                                                    />
                                                                    <span className="truncate">{child.label}</span>
                                                                </NavLink>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        )
                                    }

                                    // Collapsed or no children: simple link
                                    return (
                                        <li key={item.to}>
                                            <NavLink
                                                to={item.to}
                                                end={item.to === '/'}
                                                onClick={onMobileClose}
                                                className={({ isActive }) =>
                                                    cn(
                                                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                                                        collapsed && 'justify-center px-2',
                                                        isActive || (hasChildren && pathActive)
                                                            ? 'bg-[var(--color-primary)] text-white shadow-sm'
                                                            : 'text-secondary hover:bg-[var(--color-primary-soft)] hover:text-primary-token'
                                                    )
                                                }
                                                title={collapsed ? item.label : undefined}
                                            >
                                                <item.icon size={18} strokeWidth={2} className="shrink-0" />
                                                {!collapsed && (
                                                    <>
                                                        <span className="truncate flex-1">{item.label}</span>
                                                        {item.badge != null && (
                                                            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-[10px] font-semibold text-brand px-1.5">
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </NavLink>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    )
                })}
            </nav>

            {!collapsed && admin && (
                <div className="border-t border-token p-3 shrink-0">
                    <div className="flex items-center gap-3 rounded-lg px-2 py-2 group">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)] text-white text-xs font-semibold shrink-0">
                            {admin.avatarInitials ||
                                (typeof admin.name === 'string' && admin.name
                                    ? admin.name
                                          .split(' ')
                                          .map((n) => n[0])
                                          .join('')
                                          .slice(0, 2)
                                          .toUpperCase()
                                    : 'AD')}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-primary-token truncate">
                                {typeof admin.name === 'string' ? admin.name : admin.name?.name || 'Admin'}
                            </p>
                            <p className="text-[11px] text-muted flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                {typeof admin.role === 'string'
                                    ? admin.role
                                    : admin.role?.name || admin.roleName || 'Admin'}
                            </p>
                        </div>
                        <button
                            onClick={() => logout()}
                            className="text-[11px] text-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                            title="Logout"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    )

    return (
        <>
            <aside
                className={cn(
                    'hidden lg:flex flex-col bg-sidebar border-r border-token transition-all duration-200 shrink-0 z-30',
                    collapsed ? 'w-[72px]' : 'w-64'
                )}
            >
                {content}
            </aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
                    <aside className="absolute left-0 top-0 bottom-0 w-72 bg-sidebar border-r border-token shadow-xl">
                        {content}
                    </aside>
                </div>
            )}
        </>
    )
}
