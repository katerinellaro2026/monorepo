import Header from '@/components/layout/Header';

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
  points: string[];
}

const SUPPORT: Activity[] = [
  {
    icon: '🏛️', title: 'Infraestructura de la empresa', color: C.slate,
    short: 'Plataforma, finanzas y gestión',
    points: [
      'Monorepo desplegado en Railway (frontend + backend + scraper)',
      'Base de datos Supabase (PostgreSQL + pgvector) con datos reales',
      'Gestión financiera: MRR, suscripciones y transacciones',
      'Dashboards de dirección: Centro de Comando, Plan Estratégico, BSC',
      'Seguridad: autenticación JWT, hashing scrypt, control por rol',
    ],
  },
  {
    icon: '👥', title: 'Gestión de recursos humanos', color: C.sky,
    short: 'Cultura y equipo (humano + IA)',
    points: [
      'Cultura organizacional y valores de la empresa',
      'Definición de roles de los 4 agentes de IA (Sofía, Carlos, Diego, Valeria)',
      'Entrenamiento few-shot y ejemplos aprobados por escenario',
      'Monitoreo de desempeño: adherencia cultural, precisión y latencia',
    ],
  },
  {
    icon: '⚙️', title: 'Desarrollo de tecnología', color: C.violet,
    short: 'I+D y arquitectura de IA',
    points: [
      'Stack: React/Vite, Fastify, Prisma, Gemini 2.5 Flash Lite',
      'Pipeline de agentes orquestados (triaje → especialista)',
      'RAG con pgvector sobre propiedades comparables',
      'Integración de tipo de cambio USD/PEN (dolar.pe) en tiempo real',
    ],
  },
  {
    icon: '📦', title: 'Aprovisionamiento (compras)', color: C.orange,
    short: 'Proveedores y fuentes de datos',
    points: [
      'Contratación de Gemini API (motor de IA)',
      'Servicios cloud: Railway (cómputo) y Supabase (datos)',
      'Fuentes de datos: BCRP IVT 2025 (oficial) y portales',
      'Scraping de Urbania y Adondevivir como insumo de mercado',
    ],
  },
];

const PRIMARY: Activity[] = [
  {
    icon: '📥', title: 'Logística de entrada', color: C.indigo,
    short: 'Captura y normalización de datos',
    points: [
      'Scraping de propiedades en Urbania y Adondevivir',
      'Ingesta de indicadores oficiales del BCRP (IVT 2025)',
      'Normalización de precios (detección USD vs SOL, miles/decimales)',
      'Indexación vectorial (pgvector) de propiedades comparables',
    ],
  },
  {
    icon: '🧠', title: 'Operaciones', color: C.teal,
    short: 'Procesamiento con IA',
    points: [
      'Triaje de la consulta y enrutamiento al agente correcto',
      'Tasación de propiedades contra la referencia BCRP',
      'Generación de Análisis Comparativo de Mercado (ACM)',
      'Calificación de leads a partir de la conversación',
    ],
  },
  {
    icon: '📤', title: 'Logística de salida', color: C.violet,
    short: 'Entrega del servicio',
    points: [
      'Chat tasador con respuesta en segundos',
      'Reportes ACM descargables en PDF',
      'Entrega de leads calificados a los corredores',
      'Comparador de precios y alertas de propiedades',
    ],
  },
  {
    icon: '📣', title: 'Marketing y ventas', color: C.amber,
    short: 'Captación y conversión',
    points: [
      'Landing pública optimizada para SEO + Google Search Console',
      'Planes de suscripción (Persona y Empresa) con pasarela de pago',
      'CTA de registro dentro del chat gratuito',
      'Captación de leads B2C que alimentan a los corredores B2B',
    ],
  },
  {
    icon: '🛟', title: 'Servicio', color: C.green,
    short: 'Postventa y soporte',
    points: [
      'Soporte B2B a corredores (agente Valeria)',
      'Gestión de perfil y suscripción del cliente',
      'Monitor IA: logs, tokens y costos por interacción',
      'Mejora continua vía entrenamiento de los agentes',
    ],
  },
];

/* ─── Componentes ─────────────────────────────────────────────────── */
function DetailCard({ a }: { a: Activity }) {
  return (
    <div className="bg-bg-card rounded-card border border-border-subtle p-4" style={{ borderTop: `2.5px solid ${a.color}` }}>
      <div className="flex items-start gap-2.5 mb-2.5">
        <span className="text-xl flex-shrink-0">{a.icon}</span>
        <div>
          <div className="text-[12.5px] font-semibold text-text-secondary leading-tight">{a.title}</div>
          <div className="text-[9.5px] mt-0.5" style={{ color: a.color }}>{a.short}</div>
        </div>
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

const CHEVRON = 'polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 50%)';
const CHEVRON_FIRST = 'polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%)';

export default function CadenaDeValor() {
  return (
    <div className="min-h-screen bg-bg-base px-6 py-5">
      <Header
        title="Cadena de Valor de Porter"
        subtitle="Actividades primarias y de apoyo de InmoData IA que generan margen y ventaja competitiva"
      />

      <p className="text-[12px] text-text-ghost leading-relaxed max-w-3xl mb-2">
        El modelo de Michael Porter descompone la empresa en actividades que crean valor. En InmoData IA,
        las <span className="text-text-secondary font-semibold">actividades primarias</span> transforman los datos
        del mercado en tasaciones y leads, mientras que las <span className="text-text-secondary font-semibold">actividades
        de apoyo</span> sostienen y potencian todo el proceso. La diferencia entre el valor entregado y el costo
        de producirlo es el <span className="text-text-secondary font-semibold">margen</span>.
      </p>

      {/* ── Diagrama ─────────────────────────────────────────────── */}
      <SectionTitle icon="🗺️">Diagrama de la cadena de valor</SectionTitle>

      <div className="bg-bg-card/50 border border-border-subtle rounded-card p-4 overflow-x-auto">
        <div className="min-w-[820px]">
          {/* Apoyo */}
          <div className="flex gap-2 mb-2">
            <div className="w-32 flex-shrink-0 flex items-center justify-center rounded-lg bg-bg-elevated text-[9.5px] font-bold uppercase tracking-wide text-text-deep text-center px-2">
              Actividades de apoyo
            </div>
            <div className="flex-1 space-y-2">
              {SUPPORT.map((a) => (
                <div key={a.title} className="flex items-center gap-2.5 rounded-lg px-3 py-2"
                  style={{ background: `${a.color}12`, border: `1px solid ${a.color}30` }}>
                  <span className="text-sm">{a.icon}</span>
                  <span className="text-[11px] font-semibold text-text-secondary w-56 flex-shrink-0">{a.title}</span>
                  <span className="text-[10px] text-text-ghost truncate">{a.short}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Primarias + Margen */}
          <div className="flex gap-2 mt-3">
            <div className="w-32 flex-shrink-0 flex items-center justify-center rounded-lg bg-bg-elevated text-[9.5px] font-bold uppercase tracking-wide text-text-deep text-center px-2">
              Actividades primarias
            </div>
            <div className="flex-1 flex items-stretch gap-1">
              {PRIMARY.map((a, i) => (
                <div key={a.title}
                  className="flex-1 flex flex-col items-center justify-center text-center px-4 py-3"
                  style={{
                    background: `${a.color}18`,
                    borderTop: `2px solid ${a.color}`,
                    clipPath: i === 0 ? CHEVRON_FIRST : CHEVRON,
                    marginLeft: i === 0 ? 0 : -14,
                  }}>
                  <span className="text-base mb-0.5">{a.icon}</span>
                  <span className="text-[9.5px] font-bold text-text-secondary leading-tight">{a.title}</span>
                </div>
              ))}
              {/* Margen */}
              <div className="flex flex-col items-center justify-center text-center px-3 py-3 w-24 flex-shrink-0 rounded-r-lg"
                style={{ background: `linear-gradient(135deg, ${C.indigo}, ${C.violet})`, marginLeft: -14, clipPath: 'polygon(18px 0, 100% 0, 100% 100%, 18px 100%, 0 50%)' }}>
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
          { icon: '📊', title: 'Datos oficiales BCRP', desc: 'Tasaciones ancladas a una fuente pública y confiable (IVT 2025), no a estimaciones opacas. Genera confianza y diferenciación.', color: C.teal },
          { icon: '🤖', title: 'IA conversacional 24/7', desc: 'Cuatro agentes especializados atienden, tasan y califican leads sin costo laboral marginal, con latencia de segundos.', color: C.indigo },
          { icon: '📉', title: 'Bajo costo marginal', desc: 'El costo por interacción (tokens Gemini) es mínimo frente al valor entregado, lo que sostiene un margen operativo alto y escalable.', color: C.green },
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
