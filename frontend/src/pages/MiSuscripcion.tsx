import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Check, CreditCard, RefreshCw } from 'lucide-react';
import { fetchMySubscription, SubscriptionRecord } from '@/api/client';
import { getPlanDef, ROLE_LABEL } from '@/data/plans';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Activa', color: '#22c55e' },
  CANCELLED: { label: 'Cancelada', color: '#f43f5e' },
  TRIAL: { label: 'Prueba', color: '#f59e0b' },
};

export default function MiSuscripcion() {
  const navigate = useNavigate();
  const role = localStorage.getItem('inmodata_role') ?? 'BUYER';
  const [sub, setSub] = useState<SubscriptionRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMySubscription()
      .then((r) => setSub(r.subscription))
      .finally(() => setLoading(false));
  }, []);

  const plan = sub ? getPlanDef(role, sub.plan) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <Loader2 className="animate-spin text-text-ghost" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base px-6 py-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-black text-text-primary mb-1">Mi suscripción</h1>
        <p className="text-[12px] text-text-ghost mb-6">Cuenta {ROLE_LABEL[role] ?? role}</p>

        {!sub || sub.status !== 'ACTIVE' ? (
          <div className="bg-bg-card rounded-card border border-border-subtle p-8 text-center">
            <p className="text-text-secondary text-sm mb-4">No tienes una suscripción activa.</p>
            <button
              onClick={() => navigate('/seleccionar-plan')}
              className="bg-indigo hover:bg-indigo/85 text-white font-semibold text-sm rounded-[10px] px-5 py-2.5"
            >
              Elegir un plan
            </button>
          </div>
        ) : (
          <>
            <div className="bg-bg-card rounded-card border border-indigo/40 p-6 mb-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-[10px] text-text-faint uppercase tracking-wide">Plan actual</div>
                  <div className="text-2xl font-black text-text-primary mt-0.5">{plan?.label ?? sub.plan}</div>
                  <div className="text-[11px] text-text-ghost mt-0.5">{plan?.tagline}</div>
                </div>
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: `${STATUS_LABEL[sub.status]?.color ?? '#475569'}18`,
                    color: STATUS_LABEL[sub.status]?.color ?? '#475569',
                  }}
                >
                  {STATUS_LABEL[sub.status]?.label ?? sub.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-bg-surface rounded-lg p-3">
                  <div className="text-lg font-black text-text-primary">S/ {sub.mrrSOL}</div>
                  <div className="text-[9px] text-text-ghost">por mes</div>
                </div>
                <div className="bg-bg-surface rounded-lg p-3">
                  <div className="text-[12px] font-bold text-text-secondary">
                    {new Date(sub.startedAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="text-[9px] text-text-ghost">inicio</div>
                </div>
                <div className="bg-bg-surface rounded-lg p-3">
                  <div className="text-[12px] font-bold text-text-secondary">
                    {sub.endsAt ? new Date(sub.endsAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </div>
                  <div className="text-[9px] text-text-ghost">próximo cobro</div>
                </div>
              </div>

              {plan && (
                <ul className="space-y-1.5 mb-5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11.5px] text-text-secondary">
                      <Check size={13} className="text-emerald flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={() => navigate('/seleccionar-plan')}
                className="flex items-center gap-2 bg-bg-surface border border-border-subtle hover:border-indigo/50 text-text-secondary font-semibold text-[12px] rounded-[10px] px-4 py-2 transition-all"
              >
                <RefreshCw size={13} /> Cambiar de plan
              </button>
            </div>

            {/* Historial de pagos */}
            {sub.transactions && sub.transactions.length > 0 && (
              <div className="bg-bg-card rounded-card border border-border-subtle p-6">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard size={14} className="text-text-ghost" />
                  <h2 className="text-[13px] font-semibold text-text-secondary">Historial de pagos</h2>
                </div>
                <div className="space-y-2">
                  {sub.transactions.map((t) => (
                    <div key={t.id} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                      <div>
                        <div className="text-[11.5px] text-text-secondary">{t.clientName}</div>
                        <div className="text-[9.5px] text-text-ghost">
                          {new Date(t.createdAt).toLocaleString('es-PE')}
                        </div>
                      </div>
                      <div className="text-[13px] font-bold text-text-primary">S/ {t.amountSOL}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
