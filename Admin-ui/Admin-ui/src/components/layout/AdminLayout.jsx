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
    <div className="flex h-screen overflow-hidden bg-app transition-theme">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={handleMenuClick} />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
