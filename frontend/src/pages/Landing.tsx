import { Link } from 'react-router-dom';
import { Home, MessageSquare, BarChart3, FileText, Users, Check, MapPin, Database } from 'lucide-react';
import { getPlansForRole } from '@/data/plans';

const DISTRICTS = ['Lince', 'Jesús María', 'Miraflores'];

const CAPABILITIES = [
  { icon: <MessageSquare size={22} />, title: 'Chat Tasador con IA', desc: 'Conversa con nuestros agentes y obtén una tasación referencial de tu propiedad en segundos, con datos reales del mercado limeño.' },
  { icon: <BarChart3 size={22} />, title: 'Comparador de precios', desc: 'Compara el precio por m², el alquiler y la rentabilidad (PER) entre distritos usando los indicadores oficiales del BCRP.' },
  { icon: <FileText size={22} />, title: 'Reportes ACM', desc: 'Genera un Análisis Comparativo de Mercado por distrito con valuación estimada y comparables reales de portales.' },
  { icon: <Users size={22} />, title: 'Leads calificados', desc: 'Las inmobiliarias reciben prospectos calificados automáticamente por la IA a partir de conversaciones reales.' },
];

function isAuthed() {
  return !!localStorage.getItem('inmodata_token');
}
function panelPath() {
  return localStorage.getItem('inmodata_role') === 'ADMIN' ? '/command-center' : '/mi-suscripcion';
}

export default function Landing() {
  const authed = isAuthed();
  const usuarioPlans = getPlansForRole('BUYER');
  const empresaPlans = getPlansForRole('BROKER');

  return (
    <div className="min-h-screen bg-bg-base text-text-secondary">
      {/* Nav */}
      <header className="border-b border-border-subtle">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo rounded-[9px] flex items-center justify-center">
              <Home size={16} className="text-white" />
            </div>
            <span className="text-sm font-bold text-text-primary">InmoData IA</span>
          </div>
          <nav className="flex items-center gap-3">
            {authed ? (
              <Link to={panelPath()} className="text-[12px] font-semibold bg-indigo hover:bg-indigo/85 text-white rounded-[9px] px-4 py-2 transition-all">
                Ir a mi panel
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-[12px] font-medium text-text-ghost hover:text-text-secondary transition-colors">Iniciar sesión</Link>
                <Link to="/register" className="text-[12px] font-semibold bg-indigo hover:bg-indigo/85 text-white rounded-[9px] px-4 py-2 transition-all">Registrarse</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-5 pt-16 pb-14 text-center">
        <div className="inline-flex items-center gap-1.5 text-[11px] text-indigo-light bg-indigo/10 border border-indigo/25 rounded-full px-3 py-1 mb-5">
          <Database size={12} /> Datos oficiales del BCRP · IVT 2025
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-text-primary leading-tight mb-5">
          Tasación inmobiliaria con<br className="hidden md:block" /> inteligencia artificial en Lima
        </h1>
        <p className="text-[15px] text-text-muted max-w-2xl mx-auto mb-8 leading-relaxed">
          InmoData IA ayuda a personas e inmobiliarias a conocer el valor real de una propiedad,
          comparar precios entre distritos y captar leads calificados — usando IA y datos oficiales
          del Banco Central de Reserva del Perú.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/register" className="bg-indigo hover:bg-indigo/85 text-white font-semibold text-sm rounded-[10px] px-6 py-3 transition-all">
            Crear cuenta
          </Link>
          <Link to="/chat" className="bg-bg-card border border-border-subtle hover:border-indigo/50 text-text-secondary font-semibold text-sm rounded-[10px] px-6 py-3 transition-all">
            Probar el chat gratis →
          </Link>
        </div>
      </section>

      {/* Capacidades */}
      <section className="max-w-5xl mx-auto px-5 py-12">
        <h2 className="text-2xl font-black text-text-primary text-center mb-2">Todo lo que necesitas para decidir con datos</h2>
        <p className="text-[13px] text-text-ghost text-center mb-10">Una plataforma PropTech pensada para el mercado inmobiliario de Lima.</p>
        <div className="grid md:grid-cols-2 gap-4">
          {CAPABILITIES.map((c) => (
            <div key={c.title} className="bg-bg-card border border-border-subtle rounded-card p-5 flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-indigo/10 text-indigo flex items-center justify-center flex-shrink-0">{c.icon}</div>
              <div>
                <h3 className="text-[14px] font-bold text-text-primary mb-1">{c.title}</h3>
                <p className="text-[12px] text-text-ghost leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Distritos / datos */}
      <section className="max-w-5xl mx-auto px-5 py-12">
        <div className="bg-bg-card border border-border-subtle rounded-card p-8 text-center">
          <h2 className="text-xl font-black text-text-primary mb-2">Cobertura con datos verificados</h2>
          <p className="text-[13px] text-text-ghost mb-6 max-w-xl mx-auto">
            Trabajamos con los indicadores del mercado inmobiliario del BCRP (IVT 2025) y comparables
            reales de portales para los distritos con mayor demanda de Lima.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {DISTRICTS.map((d) => (
              <span key={d} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-text-secondary bg-bg-surface border border-border-subtle rounded-full px-4 py-2">
                <MapPin size={13} className="text-teal" /> {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Planes */}
      <section className="max-w-5xl mx-auto px-5 py-12">
        <h2 className="text-2xl font-black text-text-primary text-center mb-2">Planes para personas y empresas</h2>
        <p className="text-[13px] text-text-ghost text-center mb-10">Elige el plan que se ajuste a ti. Todos incluyen el Chat Tasador con IA.</p>

        <div className="grid md:grid-cols-2 gap-6">
          <PlanColumn title="Para personas" subtitle="Encuentra y valúa tu próxima propiedad" plans={usuarioPlans} />
          <PlanColumn title="Para inmobiliarias" subtitle="Capta y califica más clientes" plans={empresaPlans} />
        </div>

        <div className="text-center mt-8">
          <Link to="/register" className="bg-indigo hover:bg-indigo/85 text-white font-semibold text-sm rounded-[10px] px-6 py-3 transition-all inline-block">
            Empezar ahora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle mt-8">
        <div className="max-w-5xl mx-auto px-5 py-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[12px] text-text-ghost">
            <Home size={14} className="text-indigo" /> InmoData IA — PropTech · Lima, Perú
          </div>
          <div className="text-[11px] text-text-ghost">
            Fuente de datos: BCRP Nota de Estudios N.º 16 — IVT 2025
          </div>
        </div>
      </footer>
    </div>
  );
}

function PlanColumn({ title, subtitle, plans }: { title: string; subtitle: string; plans: ReturnType<typeof getPlansForRole> }) {
  return (
    <div className="bg-bg-card border border-border-subtle rounded-card p-6">
      <h3 className="text-[15px] font-black text-text-primary">{title}</h3>
      <p className="text-[11.5px] text-text-ghost mb-4">{subtitle}</p>
      <div className="space-y-3">
        {plans.map((p) => (
          <div key={p.key} className={`rounded-xl p-4 border ${p.highlighted ? 'border-indigo bg-indigo/5' : 'border-border-subtle bg-bg-surface'}`}>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-[13px] font-bold text-text-primary">{p.label}</span>
              <span className="text-[15px] font-black text-text-primary">S/ {p.priceSOL}<span className="text-[10px] text-text-ghost font-normal">/mes</span></span>
            </div>
            <p className="text-[10.5px] text-text-ghost mb-2">{p.tagline}</p>
            <ul className="space-y-1">
              {p.features.slice(0, 3).map((f, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[10.5px] text-text-secondary">
                  <Check size={12} className="text-emerald flex-shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
