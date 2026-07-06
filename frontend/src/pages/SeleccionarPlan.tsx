import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Check, LogOut, ArrowLeft } from 'lucide-react';
import { getPlansForRole, ROLE_LABEL } from '@/data/plans';
import { logout, fetchMySubscription } from '@/api/client';

export default function SeleccionarPlan() {
  const navigate = useNavigate();
  const role = localStorage.getItem('inmodata_role') ?? 'BUYER';
  const plans = getPlansForRole(role);

  // Plan actualmente activo — se inicializa síncrono desde caché para evitar
  // el parpadeo "Elegir" → "Plan actual", y se revalida en segundo plano.
  const [currentPlan, setCurrentPlan] = useState<string | null>(
    () => localStorage.getItem('inmodata_plan')
  );

  useEffect(() => {
    fetchMySubscription()
      .then((r) => {
        if (r.subscription && r.subscription.status === 'ACTIVE') {
          setCurrentPlan(r.subscription.plan);
          localStorage.setItem('inmodata_plan', r.subscription.plan);
        } else {
          setCurrentPlan(null);
          localStorage.removeItem('inmodata_plan');
        }
      })
      .catch(() => { /* mantiene el valor cacheado */ });
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-bg-base px-4 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo rounded-[10px] flex items-center justify-center">
              <Home size={18} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-text-primary leading-none">InmoData IA</div>
              <div className="text-[10px] text-text-faint mt-0.5">Cuenta {ROLE_LABEL[role] ?? role}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {currentPlan && (
              <button
                onClick={() => navigate('/mi-suscripcion')}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-text-secondary hover:text-indigo-light transition-colors"
              >
                <ArrowLeft size={14} /> Volver al panel
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-[11px] text-text-ghost hover:text-rose transition-colors"
            >
              <LogOut size={14} /> Salir
            </button>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-text-primary mb-2">Elige tu plan</h1>
          <p className="text-[13px] text-text-ghost">
            Todos los planes son de pago. Podrás cambiar de plan cuando quieras desde tu panel.
          </p>
        </div>

        {/* Planes */}
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.key;
            return (
            <div
              key={plan.key}
              className={`relative bg-bg-card rounded-card border p-6 flex flex-col ${
                isCurrent ? 'border-emerald' : plan.highlighted ? 'border-indigo' : 'border-border-subtle'
              }`}
            >
              {isCurrent ? (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald text-white text-[9px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full">
                  Plan actual
                </div>
              ) : plan.highlighted && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-indigo text-white text-[9px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full">
                  Más popular
                </div>
              )}

              <div className="mb-4">
                <div className="text-[13px] font-bold text-text-primary">{plan.label}</div>
                <div className="text-[10.5px] text-text-ghost mt-0.5 min-h-[28px]">{plan.tagline}</div>
              </div>

              <div className="mb-5">
                <span className="text-3xl font-black text-text-primary">S/ {plan.priceSOL}</span>
                <span className="text-[12px] text-text-ghost"> / mes</span>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11.5px] text-text-secondary">
                    <Check size={14} className="text-emerald flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="w-full flex items-center justify-center gap-1.5 font-semibold text-sm rounded-[10px] py-2.5 bg-emerald/10 border border-emerald/30 text-emerald cursor-default">
                  <Check size={15} /> Plan actual
                </div>
              ) : (
                <button
                  onClick={() => navigate(`/checkout?plan=${plan.key}`)}
                  className={`w-full font-semibold text-sm rounded-[10px] py-2.5 transition-all ${
                    plan.highlighted
                      ? 'bg-indigo hover:bg-indigo/85 text-white'
                      : 'bg-bg-surface border border-border-subtle text-text-secondary hover:border-indigo/50'
                  }`}
                >
                  {currentPlan ? `Cambiar a ${plan.label}` : `Elegir ${plan.label}`}
                </button>
              )}
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
