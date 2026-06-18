import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import PublicChat from '@/pages/PublicChat';
import CommandCenter from '@/pages/CommandCenter';
import ProDashboard from '@/pages/ProDashboard';

function getRole(): string {
  // In production, decode the JWT. For now, read a stored role.
  return localStorage.getItem('inmodata_role') ?? 'ADMIN'; // Default to ADMIN for dev
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const role = getRole();
  return (
    <div className="flex h-screen overflow-hidden bg-bg-base">
      <Sidebar role={role} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public chat — no sidebar needed for immersive experience */}
        <Route path="/chat" element={<PublicChat />} />

        {/* Authenticated routes with sidebar */}
        <Route
          path="/command-center"
          element={
            <AppLayout>
              <CommandCenter />
            </AppLayout>
          }
        />
        <Route
          path="/pro-dashboard"
          element={
            <AppLayout>
              <ProDashboard />
            </AppLayout>
          }
        />

        {/* Default */}
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
