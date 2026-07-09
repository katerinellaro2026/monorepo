import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Home, MessageSquare, BarChart3, FileText, Users, Check, MapPin,
  Database, Sparkles, TrendingUp, ShieldCheck, ArrowRight,
} from 'lucide-react';
import { getPlansForRole } from '@/data/plans';
import { AGENT_PERSONAS } from '@/data/agentPersonas';

const DISTRICTS = ['Lince', 'Jesús María', 'Miraflores'];
const TEAM_KEYS = ['TRIAJE', 'ANALISTA', 'COMERCIAL', 'SOPORTE_B2B'];

const CAPABILITIES = [
  { icon: <MessageSquare size={22} />, color: '#6366f1', title: 'Chat Tasador con IA', desc: 'Conversa con nuestros agentes y obtén una tasación referencial de tu propiedad en segundos, con datos reales del mercado limeño.' },
  { icon: <BarChart3 size={22} />, color: '#2dd4bf', title: 'Comparador de precios', desc: 'Compara el precio por m², el alquiler y la rentabilidad (PER) entre distritos usando los indicadores oficiales del BCRP.' },
  { icon: <FileText size={22} />, color: '#a78bfa', title: 'Reportes ACM', desc: 'Genera un Análisis Comparativo de Mercado por distrito con valuación estimada y comparables reales de portales.' },
  { icon: <Users size={22} />, color: '#f59e0b', title: 'Leads calificados', desc: 'Las inmobiliarias reciben prospectos calificados automáticamente por la IA a partir de conversaciones reales.' },
];

const STATS = [
  { value: '4', label: 'Agentes de IA especializados' },
  { value: 'BCRP', label: 'Datos oficiales · IVT 2025' },
  { value: '3', label: 'Distritos con cobertura activa' },
  { value: '<2s', label: 'Tasación referencial' },
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

  // Scroll al ancla (#planes) tras el render de la SPA — el navegador no puede
  // hacerlo solo porque el elemento aún no existe al cargar.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    let tries = 0;
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (tries++ < 10) {
        setTimeout(tryScroll, 100);
      }
    };
    setTimeout(tryScroll, 80);
  }, []);

  return (
    <div className="min-h-screen bg-bg-base text-text-secondary overflow-x-hidden">
      {/* Blobs decorativos de fondo */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 w-[480px] h-[480px] rounded-full bg-indigo/20 blur-[120px] animate-glow-pulse" />
        <div className="absolute top-40 -right-32 w-[420px] h-[420px] rounded-full bg-teal/15 blur-[120px] animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-violet/15 blur-[120px] animate-glow-pulse" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative">
        {/* Nav */}
        <header className="border-b border-border-subtle backdrop-blur-sm sticky top-0 z-30 bg-bg-base/70">
          <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo to-violet rounded-[9px] flex items-center justify-center">
                <Home size={16} className="text-white" />
              </div>
              <span className="text-sm font-bold text-text-primary">InmoData IA</span>
            </div>
            <nav className="flex items-center gap-3">
              {authed ? (
                <Link to={panelPath()} className="text-[12px] font-semibold bg-indigo hover:bg-indigo/85 text-white rounded-[9px] px-4 py-2 transition-all">Ir a mi panel</Link>
              ) : (
                <>
                  <Link to="/login" className="text-[12px] font-medium text-text-ghost hover:text-text-secondary transition-colors">Iniciar sesión</Link>
                  <Link to="/register" className="text-[12px] font-semibold bg-indigo hover:bg-indigo/85 text-white rounded-[9px] px-4 py-2 transition-all shadow-lg shadow-indigo/25">Registrarse</Link>
                </>
              )}
            </nav>
          </div>
        </header>

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-5 pt-16 pb-12 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fadeUp">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-indigo-light bg-indigo/10 border border-indigo/25 rounded-full px-3 py-1 mb-5">
              <Database size={12} /> Datos oficiales del BCRP · IVT 2025
            </div>
            <h1 className="text-4xl md:text-[52px] font-black text-text-primary leading-[1.05] mb-5">
              El valor real de tu propiedad,{' '}
              <span className="bg-gradient-to-r from-indigo-light via-violet to-teal bg-clip-text text-transparent">con inteligencia artificial</span>
            </h1>
            <p className="text-[15px] text-text-muted max-w-xl mb-8 leading-relaxed">
              InmoData IA ayuda a personas e inmobiliarias en Lima a tasar propiedades, comparar precios
              entre distritos y captar leads calificados — combinando IA conversacional con datos oficiales
              del Banco Central de Reserva del Perú.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/register" className="group bg-indigo hover:bg-indigo/85 text-white font-semibold text-sm rounded-[11px] px-6 py-3.5 transition-all shadow-lg shadow-indigo/30 flex items-center gap-2">
                Crear cuenta <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link to="/chat" className="bg-bg-card border border-border-subtle hover:border-indigo/50 text-text-secondary font-semibold text-sm rounded-[11px] px-6 py-3.5 transition-all">
                Probar el chat gratis
              </Link>
            </div>
            <div className="flex items-center gap-4 mt-7">
              <div className="flex -space-x-2">
                {TEAM_KEYS.map((k) => {
                  const p = AGENT_PERSONAS[k];
                  return <img key={k} src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full border-2 border-bg-base object-cover" />;
                })}
              </div>
              <span className="text-[11.5px] text-text-ghost">Sofía, Carlos, Diego y Valeria — tu equipo de IA, 24/7</span>
            </div>
          </div>

          {/* Mockup del producto */}
          <div className="relative animate-fadeUp" style={{ animationDelay: '0.15s' }}>
            <HeroMockup />
          </div>
        </section>

        {/* Stats */}
        <section className="max-w-6xl mx-auto px-5 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STATS.map((s) => (
              <div key={s.label} className="bg-bg-card/60 backdrop-blur border border-border-subtle rounded-card p-5 text-center">
                <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-indigo-light to-teal bg-clip-text text-transparent mb-1">{s.value}</div>
                <div className="text-[10.5px] text-text-ghost leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Capacidades */}
        <section className="max-w-6xl mx-auto px-5 py-14">
          <SectionHead eyebrow="Plataforma" title="Todo lo que necesitas para decidir con datos" sub="Una plataforma PropTech pensada para el mercado inmobiliario de Lima." />
          <div className="grid md:grid-cols-2 gap-4">
            {CAPABILITIES.map((c) => (
              <div key={c.title} className="group bg-bg-card border border-border-subtle rounded-card p-6 flex gap-4 hover:border-indigo/40 transition-all hover:-translate-y-0.5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                  style={{ background: `${c.color}18`, color: c.color }}>
                  {c.icon}
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-text-primary mb-1">{c.title}</h3>
                  <p className="text-[12px] text-text-ghost leading-relaxed">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Equipo de IA */}
        <section className="max-w-6xl mx-auto px-5 py-14">
          <SectionHead eyebrow="Conoce a tu equipo" title="4 agentes de IA, cada uno experto en lo suyo" sub="Trabajan juntos para tasar, analizar el mercado, captar clientes y dar soporte." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEAM_KEYS.map((k) => {
              const p = AGENT_PERSONAS[k];
              return (
                <div key={k} className="bg-bg-card border border-border-subtle rounded-card p-5 text-center hover:-translate-y-1 transition-all"
                  style={{ boxShadow: `0 0 0 0 ${p.color}00` }}>
                  <div className="relative inline-block mb-3">
                    <img src={p.avatar} alt={p.name} className="w-20 h-20 rounded-2xl object-cover mx-auto" style={{ border: `2px solid ${p.color}55` }} />
                    <span className="absolute -bottom-1 -right-1 text-lg">{p.emoji}</span>
                  </div>
                  <div className="text-[14px] font-black text-text-primary">{p.name}</div>
                  <div className="text-[10.5px] font-semibold mb-2" style={{ color: p.color }}>{p.role}</div>
                  <p className="text-[10.5px] text-text-ghost leading-relaxed">{p.tagline}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Distritos */}
        <section className="max-w-6xl mx-auto px-5 py-14">
          <div className="relative bg-gradient-to-br from-bg-card to-bg-surface border border-border-subtle rounded-[20px] p-8 md:p-10 overflow-hidden">
            <Skyline />
            <div className="relative text-center">
              <div className="inline-flex items-center gap-1.5 text-[11px] text-teal bg-teal/10 border border-teal/25 rounded-full px-3 py-1 mb-4">
                <ShieldCheck size={12} /> Cobertura con datos verificados
              </div>
              <h2 className="text-2xl font-black text-text-primary mb-2">Enfocados en los distritos de mayor demanda</h2>
              <p className="text-[13px] text-text-ghost mb-7 max-w-xl mx-auto">
                Trabajamos con los indicadores del mercado inmobiliario del BCRP (IVT 2025) y comparables
                reales de portales para las zonas con más movimiento de Lima.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {DISTRICTS.map((d) => (
                  <span key={d} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-text-secondary bg-bg-base/60 backdrop-blur border border-border-subtle rounded-full px-5 py-2.5">
                    <MapPin size={14} className="text-teal" /> {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Planes */}
        <section id="planes" className="max-w-6xl mx-auto px-5 py-14 scroll-mt-20">
          <SectionHead eyebrow="Precios" title="Planes para personas y empresas" sub="Elige el plan que se ajuste a ti. Todos incluyen el Chat Tasador con IA." />
          <div className="grid md:grid-cols-2 gap-6">
            <PlanColumn title="Para personas" subtitle="Encuentra y valúa tu próxima propiedad" icon={<Home size={16} />} plans={usuarioPlans} />
            <PlanColumn title="Para inmobiliarias" subtitle="Capta y califica más clientes" icon={<TrendingUp size={16} />} plans={empresaPlans} />
          </div>
        </section>

        {/* CTA final */}
        <section className="max-w-6xl mx-auto px-5 py-14">
          <div className="relative rounded-[24px] p-10 md:p-14 text-center overflow-hidden bg-gradient-to-br from-indigo/25 via-violet/15 to-teal/20 border border-indigo/30">
            <div className="absolute inset-0 bg-bg-base/40" />
            <div className="relative">
              <Sparkles size={28} className="text-indigo-light mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-black text-text-primary mb-3">Empieza a tomar decisiones con datos reales</h2>
              <p className="text-[13.5px] text-text-muted mb-7 max-w-lg mx-auto">Crea tu cuenta en minutos o prueba el chat tasador gratis, sin registro.</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link to="/register" className="bg-indigo hover:bg-indigo/85 text-white font-semibold text-sm rounded-[11px] px-7 py-3.5 transition-all shadow-lg shadow-indigo/30">Crear cuenta</Link>
                <Link to="/chat" className="bg-bg-card/80 backdrop-blur border border-border-subtle hover:border-indigo/50 text-text-secondary font-semibold text-sm rounded-[11px] px-7 py-3.5 transition-all">Probar el chat gratis</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border-subtle">
          <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[12px] text-text-ghost">
              <Home size={14} className="text-indigo" /> InmoData IA — PropTech · Lima, Perú
            </div>
            <div className="text-[11px] text-text-ghost">Fuente de datos: BCRP Nota de Estudios N.º 16 — IVT 2025</div>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ── Sub-componentes ──────────────────────────────────────────────── */

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <div className="text-center mb-10">
      <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-indigo-light mb-2">{eyebrow}</div>
      <h2 className="text-2xl md:text-3xl font-black text-text-primary mb-2">{title}</h2>
      <p className="text-[13px] text-text-ghost max-w-xl mx-auto">{sub}</p>
    </div>
  );
}

function HeroMockup() {
  return (
    <div className="relative">
      {/* Card chat */}
      <div className="bg-bg-card/90 backdrop-blur border border-border-subtle rounded-2xl p-5 shadow-2xl animate-float">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-subtle">
          <img src={AGENT_PERSONAS.TRIAJE.avatar} alt="Sofía" className="w-8 h-8 rounded-lg object-cover" />
          <div>
            <div className="text-[11px] font-bold text-text-primary">Sofía · Coordinadora IA</div>
            <div className="text-[9px] text-emerald flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald inline-block" /> en línea</div>
          </div>
        </div>
        <div className="space-y-2.5">
          <div className="ml-auto w-fit max-w-[80%] bg-indigo text-white text-[11px] rounded-2xl rounded-tr-sm px-3 py-2">¿Cuánto vale un depa de 80m² en Miraflores?</div>
          <div className="w-fit max-w-[85%] bg-bg-elevated text-text-secondary text-[11px] rounded-2xl rounded-tl-sm px-3 py-2 border border-border-subtle">
            Según el <b className="text-text-primary">BCRP (IVT 2025)</b>, Miraflores está en <b className="text-text-primary">US$ 2,400/m²</b>. Para 80m²:
          </div>
        </div>
      </div>

      {/* Card valuación flotante */}
      <div className="absolute -bottom-6 -left-6 bg-bg-card border border-indigo/40 rounded-2xl p-4 shadow-2xl w-52 animate-float-slow">
        <div className="text-[9px] text-text-ghost uppercase tracking-wide mb-1">Valuación estimada</div>
        <div className="text-2xl font-black bg-gradient-to-r from-indigo-light to-teal bg-clip-text text-transparent">US$ 192,000</div>
        <div className="flex items-center gap-1 text-[10px] text-emerald mt-1"><TrendingUp size={11} /> rango US$ 177k – 207k</div>
        <div className="mt-3 flex items-end gap-1 h-10">
          {[40, 65, 50, 80, 60, 95, 72].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-indigo/40 to-teal/70" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>

      {/* Badge flotante */}
      <div className="absolute -top-4 -right-3 bg-bg-card border border-teal/40 rounded-xl px-3 py-2 shadow-xl animate-float" style={{ animationDelay: '1s' }}>
        <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-teal"><Database size={12} /> Datos BCRP</div>
      </div>
    </div>
  );
}

function Skyline() {
  return (
    <svg className="absolute bottom-0 left-0 w-full h-32 opacity-[0.07]" viewBox="0 0 1200 200" preserveAspectRatio="none" fill="currentColor">
      <rect x="40" y="90" width="70" height="110" /><rect x="130" y="50" width="60" height="150" />
      <rect x="210" y="110" width="80" height="90" /><rect x="310" y="30" width="55" height="170" />
      <rect x="385" y="80" width="75" height="120" /><rect x="480" y="60" width="60" height="140" />
      <rect x="560" y="100" width="90" height="100" /><rect x="670" y="40" width="58" height="160" />
      <rect x="748" y="85" width="72" height="115" /><rect x="840" y="55" width="64" height="145" />
      <rect x="924" y="105" width="84" height="95" /><rect x="1028" y="45" width="60" height="155" />
      <rect x="1108" y="95" width="70" height="105" />
    </svg>
  );
}

function PlanColumn({ title, subtitle, icon, plans }: { title: string; subtitle: string; icon: React.ReactNode; plans: ReturnType<typeof getPlansForRole> }) {
  return (
    <div className="bg-bg-card border border-border-subtle rounded-card p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-9 h-9 rounded-lg bg-indigo/12 text-indigo flex items-center justify-center">{icon}</div>
        <div>
          <h3 className="text-[15px] font-black text-text-primary leading-none">{title}</h3>
          <p className="text-[11px] text-text-ghost mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-3">
        {plans.map((p) => (
          <div key={p.key} className={`rounded-xl p-4 border transition-all ${p.highlighted ? 'border-indigo bg-indigo/5' : 'border-border-subtle bg-bg-surface'}`}>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-[13px] font-bold text-text-primary flex items-center gap-2">
                {p.label}
                {p.highlighted && <span className="text-[8px] font-bold uppercase bg-indigo text-white rounded-full px-1.5 py-0.5">Popular</span>}
              </span>
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
      <Link to="/register" className="mt-4 block text-center bg-indigo hover:bg-indigo/85 text-white font-semibold text-[12px] rounded-[10px] py-2.5 transition-all">
        Empezar ahora
      </Link>
    </div>
  );
}
