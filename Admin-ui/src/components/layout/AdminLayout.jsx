import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleMenuClick() {
    // Desktop: toggle collapse; Mobile: open drawer
    if (window.innerWidth >= 1024) {
      setCollapsed((c) => !c);
    } else {
      setMobileOpen(true);
    }
  }

  return (
    // h-dvh follows the real mobile viewport when the browser chrome shows/hides
    <div className="flex h-dvh max-h-dvh overflow-hidden bg-app transition-theme">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Always visible — outside the scrolling main */}
        <div className="z-30 shrink-0 border-b border-token bg-surface">
          <Topbar onMenuClick={handleMenuClick} />
        </div>

        {/* Only this region scrolls */}
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
