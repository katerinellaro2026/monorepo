import Header from '@/components/layout/Header';
import { ChevronRight } from 'lucide-react';

/* ─── Tokens ─────────────────────────────────────────────────────── */
const C = {
  indigo: '#6366f1', teal: '#2dd4bf', amber: '#f59e0b',
  green: '#22c55e', rose: '#f43f5e', violet: '#a78bfa',
  orange: '#f97316', sky: '#38bdf8', slate: '#64748b',
};

/* ─── Datos: Cadena de Valor de Porter aplicada a InmoData IA ─────── */
interface Activity {
  icon: string;
  title: string;
  color: string;
  short: string;
  stat: string;
  points: string[];
}

const SUPPORT: Activity[] = [
  {
    icon: '🏛️', title: 'Infraestructura de la empresa', color: C.slate,
    short: 'Plataforma, finanzas y gestión', stat: 'MRR S/ 2,308',
    points: [
      'Monorepo desplegado en Railway (frontend + backend + scraper)',
      'Base de datos Supabase (PostgreSQL + pgvector 768 dims)',
      'Gestión financiera: 4 suscripciones activas → MRR S/ 2,308',
      'Dashboards de dirección: Centro de Comando, Plan Estratégico, BSC',
      'Seguridad: JWT + hashing scrypt, control por 3 roles',
    ],
  },
  {
    icon: '👥', title: 'Gestión de recursos humanos', color: C.sky,
    short: 'Cultura y equipo (humano + IA)', stat: '4 agentes IA',
    points: [
      'Cultura organizacional y 6 valores de la empresa',
      '4 agentes de IA con roles definidos: Sofía, Carlos, Diego, Valeria',
      'Entrenamiento few-shot con ejemplos aprobados por escenario',
      'Monitoreo de desempeño: adherencia cultural, precisión y latencia',
    ],
  },
  {
    icon: '⚙️', title: 'Desarrollo de tecnología', color: C.violet,
    short: 'I+D y arquitectura de IA', stat: 'Gemini 2.5',
    points: [
      'Stack: React/Vite, Fastify, Prisma, Gemini 2.5 Flash Lite',
      'Pipeline de 4 agentes orquestados (triaje → especialista)',
      'RAG con pgvector sobre 105 propiedades comparables',
      'Integración de tipo de cambio USD/PEN (dolar.pe) en tiempo real',
    ],
  },
  {
    icon: '📦', title: 'Aprovisionamiento (compras)', color: C.orange,
    short: 'Proveedores y fuentes de datos', stat: '2 portales',
    points: [
      'Gemini API — costo: US$ 0.10/M tokens entrada, US$ 0.40/M salida',
      'Servicios cloud: Railway (cómputo) y Supabase (datos)',
      'Fuente oficial: BCRP IVT 2025 con 12 distritos de referencia',
      'Scraping de 2 portales: Adondevivir (61) y Urbania (44)',
    ],
  },
];

const PRIMARY: Activity[] = [
  {
    icon: '📥', title: 'Logística de entrada', color: C.indigo,
    short: 'Captura y normalización de datos', stat: '105 propiedades',
    points: [
      '105 propiedades activas indexadas (Lince 41 · Miraflores 34 · J. María 30)',
      'Ingesta de indicadores oficiales del BCRP (IVT 2025, 12 distritos)',
      'Normalización de precios: detección USD vs SOL, miles/decimales',
      'Indexación vectorial (pgvector, 768 dims) para búsqueda de comparables',
    ],
  },
  {
    icon: '🧠', title: 'Operaciones', color: C.teal,
    short: 'Procesamiento con IA', stat: '120 interacciones',
    points: [
      'Triaje y enrutamiento al agente correcto (4 agentes especializados)',
      'Tasación vs BCRP: Miraflores US$ 2,400/m², Lince US$ 1,970/m²',
      'ACM con comparables reales y PER (ej. Miraflores 17.5 años)',
      '120 interacciones procesadas en 44 sesiones de chat',
    ],
  },
  {
    icon: '📤', title: 'Logística de salida', color: C.violet,
    short: 'Entrega del servicio', stat: '10 leads',
    points: [
      'Chat tasador con respuesta en < 2 segundos',
      'Reportes ACM descargables en PDF',
      '10 leads calificados entregados a los corredores',
      'Comparador de 3 distritos activos y alertas de propiedades',
    ],
  },
  {
    icon: '📣', title: 'Marketing y ventas', color: C.amber,
    short: 'Captación y conversión', stat: '31 clientes B2C',
    points: [
      'Landing SEO + Google Search Console (sitemap con 4 URLs)',
      '6 planes: Persona S/ 29–99 · Empresa S/ 150–2,000',
      '31 usuarios B2C captados y 2 corredores B2B suscritos',
      'CTA de registro dentro del chat gratuito',
    ],
  },
  {
    icon: '🛟', title: 'Servicio', color: C.green,
    short: 'Postventa y soporte', stat: 'Monitor IA',
    points: [
      'Soporte B2B a corredores (agente Valeria)',
      'Monitor IA: 120 logs con tokens y costo por interacción',
      'Gestión de perfil y suscripción del cliente',
      'Mejora continua vía entrenamiento few-shot de los agentes',
    ],
  },
];

const KPIS = [
  { value: '105', label: 'Propiedades indexadas', color: C.indigo },
  { value: '3', label: 'Distritos con cobertura', color: C.teal },
  { value: '4', label: 'Agentes de IA', color: C.violet },
  { value: '10', label: 'Leads calificados', color: C.amber },
  { value: '4', label: 'Suscripciones activas', color: C.green },
  { value: 'S/ 2,308', label: 'MRR actual', color: C.sky },
];

/* ─── Componentes ─────────────────────────────────────────────────── */
function DetailCard({ a }: { a: Activity }) {
  return (
    <div className="bg-bg-card rounded-card border border-border-subtle p-4" style={{ borderTop: `2.5px solid ${a.color}` }}>
      <div className="flex items-start gap-2.5 mb-2.5">
        <span className="text-xl flex-shrink-0">{a.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-semibold text-text-secondary leading-tight">{a.title}</div>
          <div className="text-[9.5px] mt-0.5" style={{ color: a.color }}>{a.short}</div>
        </div>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: `${a.color}18`, color: a.color }}>{a.stat}</span>
      </div>
      <ul className="space-y-1.5">
        {a.points.map((p, i) => (
          <li key={i} className="text-[10.5px] text-text-ghost flex items-start gap-1.5">
            <span className="text-[8px] mt-1 flex-shrink-0" style={{ color: a.color }}>◆</span>{p}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionTitle({ children, icon }: { children: React.ReactNode; icon?: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4 mt-8">
      {icon && <span className="text-base">{icon}</span>}
      <span className="text-[10px] font-semibold uppercase tracking-[0.09em] text-text-deep">{children}</span>
      <span className="flex-1 h-px bg-white/[0.06]" />
    </div>
  );
}

export default function CadenaDeValor() {
  return (
    <div className="min-h-screen bg-bg-base px-6 py-5">
      <Header
        title="Cadena de Valor de Porter"
        subtitle="Actividades primarias y de apoyo de InmoData IA que generan margen y ventaja competitiva"
      />

      <p className="text-[12px] text-text-ghost leading-relaxed max-w-3xl mb-5">
        El modelo de Michael Porter descompone la empresa en actividades que crean valor. En InmoData IA,
        las <span className="text-text-secondary font-semibold">actividades primarias</span> transforman los datos
        del mercado en tasaciones y leads, mientras que las <span className="text-text-secondary font-semibold">actividades
        de apoyo</span> sostienen todo el proceso. La diferencia entre el valor entregado y el costo de producirlo
        es el <span className="text-text-secondary font-semibold">margen</span>. Las cifras mostradas son datos reales de la plataforma.
      </p>

      {/* ── KPIs reales ──────────────────────────────────────────── */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-2">
        {KPIS.map((k) => (
          <div key={k.label} className="bg-bg-card rounded-card border border-border-subtle p-3 text-center">
            <div className="text-xl font-black leading-none mb-1" style={{ color: k.color }}>{k.value}</div>
            <div className="text-[9px] text-text-ghost leading-tight">{k.label}</div>
          </div>
        ))}
      </div>

      {/* ── Diagrama ─────────────────────────────────────────────── */}
      <SectionTitle icon="🗺️">Diagrama de la cadena de valor</SectionTitle>

      <div className="bg-bg-card/50 border border-border-subtle rounded-card p-4 overflow-x-auto">
        <div className="min-w-[860px]">
          {/* Apoyo */}
          <div className="flex gap-2 mb-3">
            <div className="w-32 flex-shrink-0 flex items-center justify-center rounded-lg bg-bg-elevated text-[9.5px] font-bold uppercase tracking-wide text-text-deep text-center px-2 py-3">
              Actividades de apoyo
            </div>
            <div className="flex-1 space-y-2">
              {SUPPORT.map((a) => (
                <div key={a.title} className="flex items-center gap-2.5 rounded-lg px-3 py-2"
                  style={{ background: `${a.color}12`, border: `1px solid ${a.color}30` }}>
                  <span className="text-sm flex-shrink-0">{a.icon}</span>
                  <span className="text-[11px] font-semibold text-text-secondary w-56 flex-shrink-0">{a.title}</span>
                  <span className="text-[10px] text-text-ghost flex-1 truncate">{a.short}</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: `${a.color}20`, color: a.color }}>{a.stat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Primarias + Margen (con flechas, sin recortes) */}
          <div className="flex gap-2 items-stretch">
            <div className="w-32 flex-shrink-0 flex items-center justify-center rounded-lg bg-bg-elevated text-[9.5px] font-bold uppercase tracking-wide text-text-deep text-center px-2">
              Actividades primarias
            </div>
            <div className="flex-1 flex items-stretch">
              {PRIMARY.map((a, i) => (
                <div key={a.title} className="flex items-stretch flex-1">
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-2 py-3 rounded-lg"
                    style={{ background: `${a.color}18`, borderTop: `2.5px solid ${a.color}` }}>
                    <span className="text-base mb-1">{a.icon}</span>
                    <span className="text-[9.5px] font-bold text-text-secondary leading-tight">{a.title}</span>
                    <span className="text-[8.5px] mt-0.5" style={{ color: a.color }}>{a.stat}</span>
                  </div>
                  {i < PRIMARY.length - 1 && (
                    <div className="flex items-center px-0.5 flex-shrink-0">
                      <ChevronRight size={16} className="text-text-deep" />
                    </div>
                  )}
                </div>
              ))}
              {/* Flecha a margen */}
              <div className="flex items-center px-0.5 flex-shrink-0">
                <ChevronRight size={18} style={{ color: C.violet }} />
              </div>
              {/* Margen */}
              <div className="flex flex-col items-center justify-center text-center px-3 py-3 w-24 flex-shrink-0 rounded-lg"
                style={{ background: `linear-gradient(135deg, ${C.indigo}, ${C.violet})` }}>
                <span className="text-base mb-0.5">💰</span>
                <span className="text-[10px] font-black text-white leading-tight">MARGEN</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Detalle actividades primarias ────────────────────────── */}
      <SectionTitle icon="⭐">Actividades primarias — el flujo que entrega valor</SectionTitle>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {PRIMARY.map((a) => <DetailCard key={a.title} a={a} />)}
      </div>

      {/* ── Detalle actividades de apoyo ─────────────────────────── */}
      <SectionTitle icon="🧩">Actividades de apoyo — lo que sostiene el proceso</SectionTitle>
      <div className="grid md:grid-cols-2 gap-3">
        {SUPPORT.map((a) => <DetailCard key={a.title} a={a} />)}
      </div>

      {/* ── Margen / ventaja competitiva ─────────────────────────── */}
      <SectionTitle icon="💰">Margen y ventaja competitiva</SectionTitle>
      <div className="grid md:grid-cols-3 gap-3 mb-8">
        {[
          { icon: '📊', title: 'Datos oficiales BCRP', desc: 'Tasaciones ancladas a una fuente pública (BCRP IVT 2025, 12 distritos) en lugar de estimaciones opacas. Genera confianza y diferenciación.', color: C.teal },
          { icon: '🤖', title: 'IA conversacional 24/7', desc: '4 agentes especializados atienden, tasan y califican leads sin costo laboral marginal, con respuesta en < 2 segundos.', color: C.indigo },
          { icon: '📉', title: 'Costo marginal mínimo', desc: 'Cada consulta cuesta una fracción de centavo (Gemini: US$ 0.10/M entrada, US$ 0.40/M salida) frente a S/ 2,308 de MRR: margen alto y escalable.', color: C.green },
        ].map((m) => (
          <div key={m.title} className="bg-bg-card rounded-card border border-border-subtle p-4" style={{ borderLeft: `3px solid ${m.color}` }}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-lg">{m.icon}</span>
              <span className="text-[12px] font-bold text-text-secondary">{m.title}</span>
            </div>
            <p className="text-[10.5px] text-text-ghost leading-relaxed">{m.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
