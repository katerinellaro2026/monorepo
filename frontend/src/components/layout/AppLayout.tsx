import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { X, Loader2 } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import ChatInterface from '@/components/chat/ChatInterface';
import { fetchMe, MeResult } from '@/api/client';
import { getPlanDef, isPlanRole } from '@/data/plans';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const role = localStorage.getItem('inmodata_role') ?? 'BUYER';
  const isClient = isPlanRole(role);

  const [me, setMe] = useState<MeResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    fetchMe()
      .then(setMe)
      .catch(() => setMe(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-base">
        <Loader2 className="animate-spin text-text-ghost" />
      </div>
    );
  }

  // Clientes sin suscripción activa → forzar selección de plan
  if (isClient && me && !me.hasSubscription) {
    return <Navigate to="/seleccionar-plan" replace />;
  }

  const planKey = me?.subscription?.plan;
  const planMenus = isClient ? (getPlanDef(role, planKey)?.menus ?? []) : [];

  return (
    <div className="flex h-screen overflow-hidden bg-bg-base">
      <Sidebar
        role={role}
        planMenus={planMenus}
        onOpenChat={() => setChatOpen(true)}
      />

      <main className="flex-1 overflow-y-auto">{children}</main>

      {/* Chat Tasador — panel lateral derecho */}
      {chatOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setChatOpen(false)}
          />
          <aside className="fixed top-0 right-0 h-screen w-full max-w-[440px] z-50 shadow-2xl border-l border-border-subtle animate-slide-in">
            <button
              onClick={() => setChatOpen(false)}
              className="absolute top-3.5 right-3 z-10 w-8 h-8 rounded-lg bg-bg-elevated/80 hover:bg-bg-elevated flex items-center justify-center text-text-ghost hover:text-text-secondary transition-colors"
              title="Cerrar chat"
            >
              <X size={16} />
            </button>
            <ChatInterface />
          </aside>
        </>
      )}
    </div>
  );
}
