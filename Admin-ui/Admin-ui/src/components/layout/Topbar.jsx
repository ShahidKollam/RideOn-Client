import { useState, useRef, useEffect } from 'react';
import { Menu, Search, Sun, Moon, Bell, Calendar, LogOut, User, Settings } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

export function Topbar({ onMenuClick }) {
  const { toggleTheme, isDark } = useTheme();
  const { admin, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const initials =
    admin?.avatarInitials ||
    (typeof admin?.name === 'string'
      ? admin.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
      : 'AD');

  useEffect(() => {
    if (!profileOpen) return;
    function handle(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [profileOpen]);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-token bg-surface/80 backdrop-blur-md px-4 sm:px-6 transition-theme">
      <button
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-secondary hover:bg-[var(--color-primary-soft)] transition-colors shrink-0"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1 min-w-0 max-w-lg hidden sm:block">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="search"
            placeholder="Search users, bikes, bookings..."
            className={cn(
              'w-full h-9 pl-9 pr-14 rounded-lg text-sm',
              'bg-[var(--color-bg)] border border-token text-primary-token placeholder:text-muted',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all'
            )}
            readOnly
            onFocus={(e) => e.target.blur()}
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-0.5 rounded border border-token bg-surface px-1.5 py-0.5 text-[10px] font-medium text-muted">
            Ctrl K
          </kbd>
        </div>
      </div>

      <div className="flex-1 sm:flex-none sm:ml-auto" />

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
        <button className="hidden md:flex items-center gap-2 h-9 px-3 rounded-lg text-sm text-secondary border border-token hover:bg-[var(--color-primary-soft)] transition-colors">
          <Calendar size={14} />
          <span>May 1 – May 31, 2025</span>
        </button>

        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-secondary hover:bg-[var(--color-primary-soft)] transition-colors"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-secondary hover:bg-[var(--color-primary-soft)] transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-semibold text-white">
            4
          </span>
        </button>

        {/* Profile dropdown */}
        <div className="relative ml-0.5" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)] text-white text-xs font-semibold select-none hover:opacity-90 transition-opacity"
          >
            {initials}
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-token bg-surface shadow-xl py-1 z-50">
              <div className="px-3 py-2.5 border-b border-token">
                <p className="text-sm font-medium text-primary-token truncate">{admin?.name || 'Admin'}</p>
                <p className="text-xs text-muted truncate">{admin?.email || ''}</p>
              </div>
              <button
                type="button"
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-secondary hover:bg-[var(--color-primary-soft)] transition-colors"
                onClick={() => setProfileOpen(false)}
              >
                <User size={14} /> Profile
              </button>
              <button
                type="button"
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-secondary hover:bg-[var(--color-primary-soft)] transition-colors"
                onClick={() => setProfileOpen(false)}
              >
                <Settings size={14} /> Settings
              </button>
              <div className="my-1 border-t border-token" />
              <button
                type="button"
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-red-500/10 transition-colors"
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                }}
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
