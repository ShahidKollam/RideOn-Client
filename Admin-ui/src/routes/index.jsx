import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import LoginPage from '../modules/auth/pages/LoginPage';
import DashboardPage from '../modules/dashboard/pages/DashboardPage';
import UsersPage from '../modules/users/pages/UsersPage';
import BikesPage from '../modules/bikes/pages/BikesPage';
import BookingsPage from '../modules/bookings/pages/BookingsPage';
import PaymentsPage from '../modules/payments/pages/PaymentsPage';
import PricingPage from '../modules/pricing/pages/PricingPage';
import PoliciesPage from '../modules/policies/pages/PoliciesPage';
import RolesPage from '../modules/roles/pages/RolesPage';
import AuditPage from '../modules/audit/pages/AuditPage';
import SettingsPage from '../modules/settings/pages/SettingsPage';
import SystemLogsPage from '../modules/system-logs/pages/SystemLogsPage';
import TicketsPage from '../modules/tickets/pages/TicketsPage';

function Guard({ permission, children }) {
  return <ProtectedRoute permission={permission}>{children}</ProtectedRoute>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <Guard>
        <AdminLayout />
      </Guard>
    ),
    children: [
      {
        index: true,
        element: (
          <Guard permission="dashboard.read">
            <DashboardPage />
          </Guard>
        ),
      },
      {
        path: 'users',
        element: (
          <Guard permission="users.read">
            <UsersPage />
          </Guard>
        ),
      },
      {
        path: 'bikes',
        element: (
          <Guard permission="bikes.read">
            <BikesPage />
          </Guard>
        ),
      },
      {
        path: 'bookings',
        element: (
          <Guard permission="bookings.read">
            <BookingsPage />
          </Guard>
        ),
      },
      {
        path: 'payments',
        element: (
          <Guard permission="payments.read">
            <PaymentsPage />
          </Guard>
        ),
      },
      {
        path: 'pricing',
        element: (
          <Guard permission="pricing.read">
            <PricingPage />
          </Guard>
        ),
      },
      {
        path: 'policies',
        element: (
          <Guard permission="policies.read">
            <PoliciesPage />
          </Guard>
        ),
      },
      {
        path: 'roles',
        element: (
          <Guard permission="roles.read">
            <RolesPage />
          </Guard>
        ),
      },
      {
        path: 'audit',
        element: (
          <Guard permission="audit.read">
            <AuditPage />
          </Guard>
        ),
      },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'system-logs', element: <SystemLogsPage /> },
      { path: 'tickets', element: <TicketsPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
