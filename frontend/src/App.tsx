import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Login from '@/pages/Login';
import PublicChat from '@/pages/PublicChat';
import CommandCenter from '@/pages/CommandCenter';
import ProDashboard from '@/pages/ProDashboard';
import PlanEstrategico from '@/pages/PlanEstrategico';
import MapaProcesos from '@/pages/MapaProcesos';
import SimuladorBSC from '@/pages/SimuladorBSC';
import EstructuraIA from '@/pages/EstructuraIA';
import CulturaOrganizacional from '@/pages/CulturaOrganizacional';
import MonitorIA from '@/pages/MonitorIA';

function getRole(): string | null {
  return localStorage.getItem('inmodata_role');
}

function isAuthenticated(): boolean {
  return !!localStorage.getItem('inmodata_token');
}

// Redirects to /login if no token, otherwise checks role
function PrivateRoute({
  children,
  requiredRoles,
}: {
  children: React.ReactNode;
  requiredRoles: string[];
}) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  const role = getRole() ?? '';
  if (!requiredRoles.includes(role)) return <Navigate to="/chat" replace />;
  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-base">
      <Sidebar role={getRole() ?? undefined} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

const BACKEND = import.meta.env.VITE_API_URL ?? '';

export default function App() {
  const [ready, setReady] = useState(!!localStorage.getItem('inmodata_token'));

  useEffect(() => {
    if (localStorage.getItem('inmodata_token')) return;
    fetch(`${BACKEND}/auth/auto`, { method: 'POST' })
      .then((r) => r.json())
      .then((data) => {
        localStorage.setItem('inmodata_token', data.token);
        localStorage.setItem('inmodata_role', data.role);
        localStorage.setItem('inmodata_name', data.name ?? 'Admin');
        setReady(true);
      })
      .catch(() => setReady(true)); // si falla, igual muestra la app
  }, []);

  if (!ready) return null;

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/chat" element={<PublicChat />} />

        {/* Private — ADMIN only */}
        <Route
          path="/command-center"
          element={
            <PrivateRoute requiredRoles={['ADMIN']}>
              <AppLayout>
                <CommandCenter />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* Private — BROKER or ADMIN */}
        <Route
          path="/pro-dashboard"
          element={
            <PrivateRoute requiredRoles={['BROKER', 'ADMIN']}>
              <AppLayout>
                <ProDashboard />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* Private — BROKER or ADMIN */}
        <Route
          path="/plan-estrategico"
          element={
            <PrivateRoute requiredRoles={['BROKER', 'ADMIN']}>
              <AppLayout>
                <PlanEstrategico />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* Private — BROKER or ADMIN */}
        <Route
          path="/mapa-procesos"
          element={
            <PrivateRoute requiredRoles={['BROKER', 'ADMIN']}>
              <AppLayout>
                <MapaProcesos />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* Private — BROKER or ADMIN */}
        <Route
          path="/simulador-bsc"
          element={
            <PrivateRoute requiredRoles={['BROKER', 'ADMIN']}>
              <AppLayout>
                <SimuladorBSC />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* Private — BROKER or ADMIN */}
        <Route
          path="/estructura-ia"
          element={
            <PrivateRoute requiredRoles={['BROKER', 'ADMIN']}>
              <AppLayout>
                <EstructuraIA />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* Private — BROKER or ADMIN */}
        <Route
          path="/cultura-organizacional"
          element={
            <PrivateRoute requiredRoles={['BROKER', 'ADMIN']}>
              <AppLayout>
                <CulturaOrganizacional />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* Private — ADMIN only */}
        <Route
          path="/monitor-ia"
          element={
            <PrivateRoute requiredRoles={['ADMIN']}>
              <AppLayout>
                <MonitorIA />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
