import { useState, FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Home, Loader2, CreditCard, ShieldCheck, ArrowLeft } from 'lucide-react';
import { subscribe } from '@/api/client';
import { getPlanDef, TEST_CARDS, ROLE_LABEL } from '@/data/plans';
import axios from 'axios';

export default function Checkout() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const role = localStorage.getItem('inmodata_role') ?? 'BUYER';
  const planKey = params.get('plan') ?? 'PRO';
  const plan = getPlanDef(role, planKey);

  const [number, setNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [exp, setExp] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!plan) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-ghost text-sm mb-3">Plan no válido.</p>
          <Link to="/seleccionar-plan" className="text-indigo-light text-[13px] hover:underline">← Volver a elegir plan</Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await subscribe(planKey, { number, name: cardName, exp, cvv });
      navigate('/mi-suscripcion');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 402) {
        setError('Tarjeta no válida. Usa una de las tarjetas de prueba listadas abajo.');
      } else {
        setError('No se pudo procesar el pago. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-base px-4 py-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 bg-indigo rounded-[10px] flex items-center justify-center">
            <Home size={18} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-text-primary leading-none">InmoData IA</div>
            <div className="text-[10px] text-text-faint mt-0.5">Cuenta {ROLE_LABEL[role] ?? role}</div>
          </div>
        </div>

        <Link to="/seleccionar-plan" className="inline-flex items-center gap-1.5 text-[11px] text-text-ghost hover:text-text-muted mb-4 transition-colors">
          <ArrowLeft size={13} /> Cambiar de plan
        </Link>

        <div className="grid md:grid-cols-[1fr_320px] gap-6">
          {/* Formulario de pago */}
          <div className="bg-bg-card rounded-card border border-border-subtle p-6">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard size={16} className="text-indigo" />
              <h2 className="text-[15px] font-semibold text-text-secondary">Datos de pago</h2>
            </div>
            <div className="flex items-center gap-1.5 text-[10.5px] text-amber mb-5">
              <ShieldCheck size={12} />
              Pasarela de demostración — no se cobra dinero real.
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] text-text-faint uppercase tracking-[0.06em] font-medium mb-1.5">
                  Número de tarjeta
                </label>
                <input
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  required
                  inputMode="numeric"
                  placeholder="4242 4242 4242 4242"
                  className="w-full bg-bg-surface border border-border-subtle rounded-[10px] px-3.5 py-2.5 text-sm text-text-secondary placeholder-text-ghost outline-none focus:border-indigo/50 focus:ring-1 focus:ring-indigo/25 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-text-faint uppercase tracking-[0.06em] font-medium mb-1.5">
                  Nombre en la tarjeta
                </label>
                <input
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                  placeholder="JUAN PEREZ"
                  className="w-full bg-bg-surface border border-border-subtle rounded-[10px] px-3.5 py-2.5 text-sm text-text-secondary placeholder-text-ghost outline-none focus:border-indigo/50 focus:ring-1 focus:ring-indigo/25 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-text-faint uppercase tracking-[0.06em] font-medium mb-1.5">
                    Vencimiento
                  </label>
                  <input
                    value={exp}
                    onChange={(e) => setExp(e.target.value)}
                    required
                    placeholder="12/28"
                    className="w-full bg-bg-surface border border-border-subtle rounded-[10px] px-3.5 py-2.5 text-sm text-text-secondary placeholder-text-ghost outline-none focus:border-indigo/50 focus:ring-1 focus:ring-indigo/25 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-text-faint uppercase tracking-[0.06em] font-medium mb-1.5">
                    CVV
                  </label>
                  <input
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    required
                    inputMode="numeric"
                    placeholder="123"
                    className="w-full bg-bg-surface border border-border-subtle rounded-[10px] px-3.5 py-2.5 text-sm text-text-secondary placeholder-text-ghost outline-none focus:border-indigo/50 focus:ring-1 focus:ring-indigo/25 transition-all font-mono"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-rose/10 border border-rose/30 text-rose rounded-[10px] px-3.5 py-2.5 text-[12px]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !number || !cardName || !exp || !cvv}
                className="w-full bg-indigo hover:bg-indigo/85 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-[10px] py-2.5 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? 'Procesando...' : `Pagar S/ ${plan.priceSOL} y suscribirme`}
              </button>
            </form>

            {/* Tarjetas de prueba */}
            <div className="mt-5 pt-4 border-t border-border-subtle">
              <div className="text-[10px] text-text-faint uppercase tracking-wide mb-2">Tarjetas de prueba válidas</div>
              <div className="space-y-1.5">
                {TEST_CARDS.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => setNumber(c.label)}
                    className="flex items-center justify-between w-full text-left px-2.5 py-1.5 rounded-lg bg-bg-surface hover:bg-bg-elevated transition-colors"
                  >
                    <span className="font-mono text-[11px] text-text-secondary">{c.label}</span>
                    <span className="text-[9px] text-text-ghost">{c.brand}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Resumen del plan */}
          <div className="bg-bg-card rounded-card border border-border-subtle p-6 h-fit">
            <div className="text-[10px] text-text-faint uppercase tracking-wide mb-2">Resumen</div>
            <div className="text-[15px] font-bold text-text-primary">Plan {plan.label}</div>
            <div className="text-[10.5px] text-text-ghost mb-4">{plan.tagline}</div>

            <div className="flex items-baseline justify-between py-3 border-t border-b border-border-subtle mb-4">
              <span className="text-[12px] text-text-secondary">Total mensual</span>
              <span className="text-xl font-black text-text-primary">S/ {plan.priceSOL}</span>
            </div>

            <ul className="space-y-1.5">
              {plan.features.map((f, i) => (
                <li key={i} className="text-[10.5px] text-text-ghost">• {f}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
