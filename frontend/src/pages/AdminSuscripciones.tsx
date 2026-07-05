import { useEffect, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { api } from '@/api/client';
import { ROLE_LABEL } from '@/data/plans';

interface AdminSub {
  id: string;
  plan: string;
  status: string;
  mrrSOL: number;
  startedAt: string;
  endsAt: string | null;
  user: { name: string | null; email: string | null; role: string } | null;
  transactions: Array<{ id: string; amountSOL: number; createdAt: string; clientName: string }>;
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: '#22c55e', CANCELLED: '#f43f5e', TRIAL: '#f59e0b',
};

export default function AdminSuscripciones() {
  const [subs, setSubs] = useState<AdminSub[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.get('/subscriptions')
      .then((r) => setSubs(r.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const active = subs.filter((s) => s.status === 'ACTIVE');
  const mrrTotal = active.reduce((sum, s) => sum + s.mrrSOL, 0);
  const revenueTotal = subs.reduce((sum, s) => sum + s.transactions.reduce((a, t) => a + t.amountSOL, 0), 0);

  return (
    <div className="min-h-screen bg-bg-base px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-black text-text-primary">Suscripciones</h1>
          <p className="text-[12px] text-text-ghost">Verificación de planes, estados y pagos de todas las cuentas</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10.5px] font-bold text-text-ghost bg-bg-card border border-border-subtle hover:text-text-secondary transition-all disabled:opacity-40"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Recargar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Suscripciones activas', value: active.length, color: '#22c55e' },
          { label: 'Total suscripciones', value: subs.length, color: '#6366f1' },
          { label: 'MRR (S/)', value: `S/ ${mrrTotal.toLocaleString('es-PE')}`, color: '#2dd4bf' },
          { label: 'Ingresos totales (S/)', value: `S/ ${revenueTotal.toLocaleString('es-PE')}`, color: '#f59e0b' },
        ].map((k) => (
          <div key={k.label} className="bg-bg-card rounded-card border border-border-subtle p-4 text-center">
            <div className="text-xl font-black leading-none mb-1" style={{ color: k.color }}>{k.value}</div>
            <div className="text-[9.5px] text-text-ghost">{k.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-text-ghost" /></div>
      ) : subs.length === 0 ? (
        <div className="bg-bg-card rounded-card border border-border-subtle p-10 text-center text-text-ghost text-sm">
          Aún no hay suscripciones registradas.
        </div>
      ) : (
        <div className="bg-bg-card rounded-card border border-border-subtle overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-subtle text-[9.5px] text-text-faint uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">MRR</th>
                <th className="px-4 py-3 font-medium">Inicio</th>
                <th className="px-4 py-3 font-medium">Próx. cobro</th>
                <th className="px-4 py-3 font-medium text-right">Pagos</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-b border-border-subtle last:border-0 text-[11.5px]">
                  <td className="px-4 py-3">
                    <div className="text-text-secondary font-medium">{s.user?.name ?? '—'}</div>
                    <div className="text-[9.5px] text-text-ghost">{s.user?.email ?? ''}</div>
                  </td>
                  <td className="px-4 py-3 text-text-ghost">{ROLE_LABEL[s.user?.role ?? ''] ?? s.user?.role}</td>
                  <td className="px-4 py-3 text-text-secondary font-semibold">{s.plan}</td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${STATUS_COLOR[s.status] ?? '#475569'}18`, color: STATUS_COLOR[s.status] ?? '#475569' }}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-text-secondary font-bold">S/ {s.mrrSOL}</td>
                  <td className="px-4 py-3 text-text-ghost">{new Date(s.startedAt).toLocaleDateString('es-PE')}</td>
                  <td className="px-4 py-3 text-text-ghost">{s.endsAt ? new Date(s.endsAt).toLocaleDateString('es-PE') : '—'}</td>
                  <td className="px-4 py-3 text-right text-text-ghost">{s.transactions.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
