import Header from '@/components/layout/Header';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

/* ─── Tokens ─────────────────────────────────────────────────────── */
const C = {
  indigo: '#6366f1', teal: '#2dd4bf', amber: '#f59e0b',
  green: '#22c55e', rose: '#f43f5e', violet: '#a78bfa',
  slate: '#475569', muted: '#94a3b8',
};
const ttStyle = {
  backgroundColor: '#1a1d2e', border: '0.5px solid rgba(255,255,255,0.1)',
  borderRadius: '8px', fontSize: '12px', color: '#e2e8f0', padding: '8px 12px',
};

/* ─── Componentes base ───────────────────────────────────────────── */
function SectionTitle({ children, icon }: { children: React.ReactNode; icon?: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4 mt-8 first:mt-0">
      {icon && <span className="text-base">{icon}</span>}
      <span className="text-[10px] font-semibold uppercase tracking-[0.09em] text-text-deep">{children}</span>
      <span className="flex-1 h-px bg-white/[0.06]" />
    </div>
  );
}

function Card({ children, accent, className = '' }: { children: React.ReactNode; accent?: string; className?: string }) {
  return (
    <div
      className={`bg-bg-card rounded-card border border-border-subtle p-4 ${className}`}
      style={accent ? { borderLeft: `3px solid ${accent}` } : {}}
    >
      {children}
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className="text-[9px] font-bold uppercase tracking-[0.06em] rounded px-1.5 py-0.5 border inline-block"
      style={{ color, background: `${color}15`, borderColor: `${color}35` }}>
      {label}
    </span>
  );
}

function KpiMini({ label, value, sub, color = C.indigo }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-bg-card rounded-card border border-border-subtle p-3">
      <div className="text-[10px] text-text-ghost mb-1.5 uppercase tracking-wide">{label}</div>
      <div className="text-[22px] font-bold leading-none" style={{ color }}>{value}</div>
      {sub && <div className="text-[10px] text-text-ghost mt-1">{sub}</div>}
    </div>
  );
}

/* ─── 1. VISIÓN ──────────────────────────────────────────────────── */
function VisionSection() {
  return (
    <>
      <SectionTitle icon="🔭">Visión estratégica</SectionTitle>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card accent={C.indigo} className="col-span-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.08em] mb-2" style={{ color: C.indigo }}>🎯 Misión</div>
          <p className="text-[12px] text-text-secondary leading-relaxed">
            Democratizar la inteligencia inmobiliaria en Lima mediante agentes IA que conviertan datos dispersos de mercado en decisiones concretas: valuaciones precisas, leads calificados y reportes ACM en tiempo real — disponibles 24/7 para compradores y corredores.
          </p>
        </Card>
        <Card accent={C.teal} className="col-span-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.08em] mb-2" style={{ color: C.teal }}>🔭 Visión 2027</div>
          <p className="text-[12px] text-text-secondary leading-relaxed">
            Ser la plataforma SaaS de referencia para el sector inmobiliario en Lima y expandirse a las principales ciudades de Latinoamérica, integrando datos oficiales de cada banco central (BCRP, BCRA, BCB) con scraping en tiempo real de los portales líderes de cada país.
          </p>
        </Card>
        <Card accent={C.amber} className="col-span-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.08em] mb-2" style={{ color: C.amber }}>💡 Propuesta de valor</div>
          <ul className="text-[11.5px] text-text-ghost space-y-1.5">
            <li>✦ Valuaciones respaldadas por BCRP IVT oficial</li>
            <li>✦ Leads calificados con nombre, zona, presupuesto y celular</li>
            <li>✦ ACM automático generado en &lt;10 segundos</li>
            <li>✦ Datos de 3 distritos, expandible a toda Lima</li>
            <li>✦ Sin fricción: chat natural, sin formularios</li>
          </ul>
        </Card>
      </div>
    </>
  );
}

/* ─── 2. OBJETIVOS SMART ─────────────────────────────────────────── */
const SMART_OBJECTIVES = [
  {
    id: 'O1', color: C.indigo,
    title: 'MVP funcional en producción',
    specific: 'Lanzar el monorepo InmoData IA con 4 agentes IA operativos, scraping real de Urbania y Adondevivir, e integración de datos BCRP IVT Q4 2025.',
    measurable: '4 agentes activos, >100 propiedades reales indexadas, latencia <2 s por respuesta.',
    achievable: 'Stack definido (Node.js + Gemini + pgvector). Arquitectura multi-agente implementada.',
    relevant: 'Sin MVP funcional no hay producto que monetizar ni leads que vender.',
    time: 'Junio 2026',
    status: 'LOGRADO', statusColor: C.green,
    progress: 100,
  },
  {
    id: 'O2', color: C.teal,
    title: 'Primeros 10 corredores suscritos',
    specific: 'Incorporar 10 corredores inmobiliarios de Lima en plan Pro (S/150/mes) con acceso a leads calificados y generación de ACM.',
    measurable: 'MRR ≥ S/1,500 por suscripciones. ≥ 5 ACM generados por semana.',
    achievable: 'El chat B2C ya genera leads. El dashboard Pro ya muestra leads en tiempo real.',
    relevant: 'Primera fuente de ingresos recurrentes que financia la operación.',
    time: 'Julio 2026',
    status: 'EN CURSO', statusColor: C.amber,
    progress: 15,
  },
  {
    id: 'O3', color: C.amber,
    title: '50 leads calificados vendidos',
    specific: 'Generar y transferir a inmobiliarias 50 leads con nombre, teléfono, presupuesto y zona verificados en el primer mes de operación.',
    measurable: 'Ingresos CPL ≥ S/16,000 (50 × S/320 avg). Tasa de conversión chat→lead ≥ 8%.',
    achievable: 'Agente Comercial extrae 4 datos completos. Pipeline de calificación automatizado.',
    relevant: 'El modelo CPL es el principal driver de ingresos a corto plazo.',
    time: 'Julio–Agosto 2026',
    status: 'PRÓXIMO', statusColor: C.slate,
    progress: 5,
  },
  {
    id: 'O4', color: C.violet,
    title: 'Expansión a 6 distritos adicionales',
    specific: 'Ampliar el scraping y los datos BCRP a San Isidro, Surco, Surquillo, Barranco, Magdalena y San Miguel.',
    measurable: '>500 propiedades totales en BD. Cobertura de los 9 distritos más demandados de Lima.',
    achievable: 'Scrapers ya funcionan para 3 distritos. Solo requiere agregar slugs al mapa de distritos.',
    relevant: 'Ampliar cobertura multiplica el TAM y atrae corredores de otras zonas.',
    time: 'Agosto 2026',
    status: 'PLANIFICADO', statusColor: C.muted,
    progress: 0,
  },
  {
    id: 'O5', color: C.green,
    title: 'Primer cliente empresarial (inmobiliaria)',
    specific: 'Cerrar contrato con al menos una inmobiliaria que adquiera un paquete enterprise de ≥ S/2,000/mes por acceso API + leads exclusivos.',
    measurable: 'Contrato firmado, primer pago recibido, integración API documentada.',
    achievable: 'El endpoint /chat y /leads ya es una API REST consumible por terceros.',
    relevant: 'Un cliente enterprise equivale a >13 suscripciones Pro individuales.',
    time: 'Setiembre 2026',
    status: 'PLANIFICADO', statusColor: C.muted,
    progress: 0,
  },
];

function SmartSection() {
  return (
    <>
      <SectionTitle icon="🎯">Objetivos SMART</SectionTitle>
      <div className="space-y-3">
        {SMART_OBJECTIVES.map((obj) => (
          <Card key={obj.id} accent={obj.color}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                style={{ background: `${obj.color}18`, color: obj.color }}>
                {obj.id}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[13px] font-semibold text-text-secondary">{obj.title}</span>
                  <Badge label={obj.status} color={obj.statusColor} />
                  <span className="ml-auto text-[10px] text-text-ghost">📅 {obj.time}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1 bg-white/[0.06] rounded-full mb-3">
                  <div className="h-1 rounded-full transition-all" style={{ width: `${obj.progress}%`, background: obj.color }} />
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11px]">
                  <div><span className="text-text-ghost font-semibold">S — </span><span className="text-text-ghost">{obj.specific}</span></div>
                  <div><span className="text-text-ghost font-semibold">M — </span><span className="text-text-ghost">{obj.measurable}</span></div>
                  <div><span className="text-text-ghost font-semibold">A — </span><span className="text-text-ghost">{obj.achievable}</span></div>
                  <div><span className="text-text-ghost font-semibold">R — </span><span className="text-text-ghost">{obj.relevant}</span></div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

/* ─── 3. KPIs ────────────────────────────────────────────────────── */
const KPI_GROUPS = [
  {
    label: 'Producto & Técnico', color: C.indigo,
    items: [
      { k: 'Propiedades indexadas', v: '105', t: 'Meta Jul: 300', color: C.indigo },
      { k: 'Distritos cubiertos', v: '3', t: 'Meta Ago: 9', color: C.indigo },
      { k: 'Latencia promedio agentes', v: '~1.8 s', t: 'Meta: <1.5 s', color: C.green },
      { k: 'Precisión enrutamiento Triaje', v: '96.4%', t: 'Meta: >95%', color: C.green },
    ],
  },
  {
    label: 'Comercial & Leads', color: C.teal,
    items: [
      { k: 'Leads calificados (mes)', v: '0', t: 'Meta Jul: 50', color: C.teal },
      { k: 'Tasa conv. chat → lead', v: '—', t: 'Meta: ≥ 8%', color: C.teal },
      { k: 'Leads con 4 datos completos', v: '—', t: 'Meta: ≥ 70%', color: C.amber },
      { k: 'Tiempo promedio calificación', v: '—', t: 'Meta: <5 min', color: C.amber },
    ],
  },
  {
    label: 'Financiero', color: C.amber,
    items: [
      { k: 'MRR Suscripciones SaaS', v: 'S/ 0', t: 'Meta Jul: S/ 1,500', color: C.amber },
      { k: 'Ingresos CPL (mes)', v: 'S/ 0', t: 'Meta Jul: S/ 16,000', color: C.amber },
      { k: 'Corredores activos', v: '0', t: 'Meta Jul: 10', color: C.green },
      { k: 'CAC (Costo adq. cliente)', v: '—', t: 'Meta: <S/ 200', color: C.green },
    ],
  },
  {
    label: 'Satisfacción & Retención', color: C.violet,
    items: [
      { k: 'NPS corredores', v: '—', t: 'Meta: > 40', color: C.violet },
      { k: 'Churn mensual', v: '—', t: 'Meta: <5%', color: C.violet },
      { k: 'LTV corredor (12 meses)', v: '—', t: 'Meta: S/ 1,800', color: C.violet },
      { k: 'ACM generados / semana', v: '0', t: 'Meta: 15', color: C.violet },
    ],
  },
];

function KpisSection() {
  return (
    <>
      <SectionTitle icon="📊">KPIs — Indicadores clave de rendimiento</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        {KPI_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] mb-2.5 flex items-center gap-2"
              style={{ color: group.color }}>
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: group.color }} />
              {group.label}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {group.items.map((kpi) => (
                <div key={kpi.k} className="bg-bg-card rounded-card border border-border-subtle p-3">
                  <div className="text-[9.5px] text-text-ghost mb-1 leading-tight">{kpi.k}</div>
                  <div className="text-[18px] font-bold" style={{ color: kpi.color }}>{kpi.v}</div>
                  <div className="text-[9px] text-text-deep mt-0.5">{kpi.t}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ─── 4. ACTIVIDADES ─────────────────────────────────────────────── */
const ACTIVITIES = [
  { obj: 'O1', cat: 'Arquitectura', act: 'Diseño del monorepo (backend/frontend/scraper) y selección de stack tecnológico', status: '✅', color: C.green },
  { obj: 'O1', cat: 'Arquitectura', act: 'Configuración de Supabase (PostgreSQL + pgvector) y conexión via Prisma ORM', status: '✅', color: C.green },
  { obj: 'O1', cat: 'Arquitectura', act: 'Schema Prisma: User, Property, Lead, Subscription, ChatSession, AgentLog', status: '✅', color: C.green },
  { obj: 'O1', cat: 'Backend', act: 'API REST con Fastify 5: auth JWT, rutas CRUD de propiedades, leads y métricas', status: '✅', color: C.green },
  { obj: 'O1', cat: 'Backend', act: 'Sistema de autenticación con roles: ADMIN, BROKER, BUYER', status: '✅', color: C.green },
  { obj: 'O1', cat: 'IA — Agentes', act: 'Agente Triaje: clasificación de intent y enrutamiento dinámico con Gemini', status: '✅', color: C.green },
  { obj: 'O1', cat: 'IA — Agentes', act: 'Agente Analista: RAG con pgvector + integración datos BCRP IVT Q4 2025', status: '✅', color: C.green },
  { obj: 'O1', cat: 'IA — Agentes', act: 'Agente Comercial: extracción de nombre, teléfono, presupuesto (USD/SOL) y zona', status: '✅', color: C.green },
  { obj: 'O1', cat: 'IA — Agentes', act: 'Agente Soporte B2B: generación de reportes ACM para corredores', status: '✅', color: C.green },
  { obj: 'O1', cat: 'Datos BCRP', act: 'Integración de Nota de Estudios No. 16 BCRP IVT 2025: precio/m² de 12 distritos Lima', status: '✅', color: C.green },
  { obj: 'O1', cat: 'Scraping', act: 'Scraper Playwright (headless Chrome) para Urbania y Adondevivir con robots.txt', status: '✅', color: C.green },
  { obj: 'O1', cat: 'Scraping', act: 'Normalización de precios: detección USD vs SOL, miles/decimales, datos inválidos', status: '✅', color: C.green },
  { obj: 'O1', cat: 'Scraping', act: '105 propiedades reales indexadas: Lince (41), Miraflores (34), Jesús María (30)', status: '✅', color: C.green },
  { obj: 'O1', cat: 'Frontend', act: 'Chat B2C público (PublicChat.tsx) con historial y markdown rendering', status: '✅', color: C.green },
  { obj: 'O1', cat: 'Frontend', act: 'CEO Dashboard: Tab B2B (KPIs, revenue chart, transacciones) + Tab Sistémica', status: '✅', color: C.green },
  { obj: 'O1', cat: 'Frontend', act: 'Pro Dashboard: leads activos, flujo agentes, stack tecnológico, misión/visión', status: '✅', color: C.green },
  { obj: 'O2', cat: 'Go-to-market', act: 'Definir pricing: Plan Pro S/150/mes y Plan Enterprise S/2,000+/mes', status: '🟡', color: C.amber },
  { obj: 'O2', cat: 'Go-to-market', act: 'Landing page pública con propuesta de valor y formulario de registro para corredores', status: '🟡', color: C.amber },
  { obj: 'O2', cat: 'Go-to-market', act: 'Onboarding de primeros 10 corredores beta en Lima (Lince, Miraflores, Jesús María)', status: '⬜', color: C.slate },
  { obj: 'O2', cat: 'Producto', act: 'Pasarela de pago (Culqi / Mercado Pago) para suscripciones automáticas', status: '⬜', color: C.slate },
  { obj: 'O3', cat: 'Leads', act: 'Pipeline de asignación automática de leads a corredores por zona y presupuesto', status: '⬜', color: C.slate },
  { obj: 'O3', cat: 'Leads', act: 'Notificaciones WhatsApp / email al corredor cuando llega un lead nuevo', status: '⬜', color: C.slate },
  { obj: 'O4', cat: 'Escalabilidad', act: 'Ampliar scrapers a San Isidro, Surco, Surquillo, Barranco, Magdalena, San Miguel', status: '⬜', color: C.slate },
  { obj: 'O5', cat: 'Enterprise', act: 'Documentar API pública para integración con CRMs de inmobiliarias', status: '⬜', color: C.slate },
];

function ActividadesSection() {
  const cats = [...new Set(ACTIVITIES.map((a) => a.cat))];
  return (
    <>
      <SectionTitle icon="⚡">Actividades por objetivo estratégico</SectionTitle>
      <div className="space-y-3">
        {cats.map((cat) => {
          const items = ACTIVITIES.filter((a) => a.cat === cat);
          return (
            <Card key={cat}>
              <div className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-text-muted mb-3">{cat}</div>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-sm flex-shrink-0 mt-0.5">{item.status}</span>
                    <span className="text-[11.5px] text-text-ghost leading-snug flex-1">{item.act}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{ color: SMART_OBJECTIVES.find(o => o.id === item.obj)?.color ?? C.slate,
                               background: `${SMART_OBJECTIVES.find(o => o.id === item.obj)?.color ?? C.slate}12` }}>
                      {item.obj}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

/* ─── 5. CRONOGRAMA ──────────────────────────────────────────────── */
const TIMELINE = [
  {
    month: 'Abril 2026', icon: '🏗️', color: C.indigo, status: 'COMPLETADO',
    milestones: [
      'Definición del modelo de negocio PropTech B2B/B2C',
      'Diseño de arquitectura: monorepo Node.js + React + Scraper',
      'Configuración Supabase + Prisma schema completo',
      'Setup inicial de Fastify con auth JWT y roles',
      'Primer commit del repositorio InmoData IA',
    ],
  },
  {
    month: 'Mayo 2026', icon: '⚙️', color: C.teal, status: 'COMPLETADO',
    milestones: [
      'Backend completo: rutas CRUD, métricas, chat, scraping',
      'Frontend: React/Vite/Tailwind — Chat B2C y dashboards',
      'CEO Dashboard: Tab B2B + Tab Visión Sistémica',
      'Pro Dashboard: leads, inteligencia de mercado',
      'Scraper base con Playwright y rate limiting',
    ],
  },
  {
    month: 'Junio 2026', icon: '🤖', color: C.amber, status: 'EN CURSO',
    milestones: [
      '4 agentes IA con Gemini 2.5 Flash Lite integrados',
      'Datos BCRP IVT Q4 2025: 12 distritos Lima indexados',
      '105 propiedades reales via scraping (Urbania + Adondevivir)',
      'Fix price normalization: USD vs SOL dual-currency',
      'Agente Comercial: recolección de 4 datos del lead',
      'Plan Estratégico y dashboards de gestión empresarial',
    ],
  },
  {
    month: 'Julio 2026', icon: '🚀', color: C.green, status: 'PRÓXIMO',
    milestones: [
      'Lanzamiento beta con primeros 10 corredores',
      'Integración de pasarela de pago (Culqi)',
      'Notificaciones WhatsApp al corredor por nuevo lead',
      'Pipeline automático de asignación de leads',
      'Landing page pública para captación de corredores',
      'Meta: S/17,500 en ingresos primer mes',
    ],
  },
  {
    month: 'Agosto 2026', icon: '📈', color: C.violet, status: 'PLANIFICADO',
    milestones: [
      'Expansión scraping a 6 distritos adicionales de Lima',
      '>500 propiedades indexadas en BD',
      'Optimización de pgvector para búsqueda semántica',
      'Primer cliente enterprise (inmobiliaria mediana)',
      'Meta: S/35,000 MRR combinado',
    ],
  },
  {
    month: 'Setiembre 2026', icon: '🌎', color: C.rose, status: 'PLANIFICADO',
    milestones: [
      'API pública documentada (OpenAPI/Swagger)',
      'Integración con CRMs: Salesforce, HubSpot',
      'Piloto en segunda ciudad peruana (Arequipa)',
      'Ronda de inversión ángel o ingreso a aceleradora',
      'Meta: 50 corredores activos, S/50,000 MRR',
    ],
  },
];

function CronogramaSection() {
  return (
    <>
      <SectionTitle icon="📅">Cronograma de actividades (Abril 2026 → ...)</SectionTitle>
      <div className="relative">
        {/* Línea vertical */}
        <div className="absolute left-[19px] top-4 bottom-4 w-px bg-white/[0.08]" />
        <div className="space-y-4">
          {TIMELINE.map((phase) => (
            <div key={phase.month} className="flex gap-4">
              {/* Dot */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg z-10"
                style={{ background: `${phase.color}18`, border: `1.5px solid ${phase.color}50` }}>
                {phase.icon}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[13px] font-semibold text-text-secondary">{phase.month}</span>
                  <Badge label={phase.status} color={phase.color} />
                </div>
                <div className="bg-bg-card rounded-card border border-border-subtle p-3">
                  <ul className="space-y-1.5">
                    {phase.milestones.map((m, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11.5px] text-text-ghost">
                        <span className="mt-0.5 flex-shrink-0" style={{ color: phase.color }}>▸</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── 6. PRESUPUESTO ─────────────────────────────────────────────── */
const BUDGET_OPEX = [
  { item: 'Supabase Pro (PostgreSQL + pgvector)', monthly: 94, annual: 1128, cat: 'Infraestructura' },
  { item: 'Hosting backend/frontend (Railway + Vercel)', monthly: 75, annual: 900, cat: 'Infraestructura' },
  { item: 'Gemini API (Flash 2.5 Lite)', monthly: 150, annual: 1800, cat: 'IA' },
  { item: 'Dominio + SSL + CDN', monthly: 15, annual: 180, cat: 'Infraestructura' },
  { item: 'Google Ads / Marketing digital', monthly: 500, annual: 6000, cat: 'Marketing' },
  { item: 'Herramientas SaaS (Notion, Figma, etc.)', monthly: 60, annual: 720, cat: 'Operaciones' },
];

const BUDGET_CAPEX = [
  { item: 'Desarrollo del MVP (oportunidad — 3 meses)', value: 18000, note: 'Bootstrapped, no erogado' },
  { item: 'Registro de marca / constitución SRL', value: 800, note: 'Pendiente' },
  { item: 'Licencias de software y herramientas año 1', value: 500, note: 'Pendiente' },
];

const BUDGET_CHART = [
  { mes: 'Abr', costo: 300, ingreso: 0 },
  { mes: 'May', costo: 350, ingreso: 0 },
  { mes: 'Jun', costo: 450, ingreso: 0 },
  { mes: 'Jul', costo: 900, ingreso: 17500 },
  { mes: 'Ago', costo: 1100, ingreso: 35000 },
  { mes: 'Sep', costo: 1400, ingreso: 52000 },
];

function PresupuestoSection() {
  const totalMonthly = BUDGET_OPEX.reduce((s, b) => s + b.monthly, 0);
  const totalAnnual  = BUDGET_OPEX.reduce((s, b) => s + b.annual, 0);

  return (
    <>
      <SectionTitle icon="💸">Presupuesto operativo (OPEX)</SectionTitle>
      <div className="grid grid-cols-4 gap-3 mb-4">
        <KpiMini label="Costo mensual estimado" value={`S/ ${totalMonthly.toLocaleString('es-PE')}`} sub="En régimen de operación" color={C.rose} />
        <KpiMini label="Costo anual proyectado" value={`S/ ${totalAnnual.toLocaleString('es-PE')}`} sub="Sin incluir marketing adicional" color={C.amber} />
        <KpiMini label="Inversión inicial (CAPEX)" value="S/ 19,300" sub="~18k bootstrapped + trámites" color={C.indigo} />
        <KpiMini label="Break-even mensual" value="~8 corredores" sub="o 5 leads + 3 suscripciones" color={C.green} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card>
          <div className="text-[11px] font-semibold text-text-muted mb-3">Desglose de costos mensuales</div>
          <div className="space-y-2">
            {BUDGET_OPEX.map((b) => (
              <div key={b.item} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] px-1.5 py-0.5 rounded" style={{
                    background: b.cat === 'IA' ? `${C.amber}18` : b.cat === 'Marketing' ? `${C.teal}18` : `${C.indigo}18`,
                    color: b.cat === 'IA' ? C.amber : b.cat === 'Marketing' ? C.teal : C.indigo,
                  }}>{b.cat}</span>
                  <span className="text-text-ghost">{b.item}</span>
                </div>
                <span className="font-semibold text-text-secondary tabular-nums">S/ {b.monthly}</span>
              </div>
            ))}
            <div className="border-t border-border-subtle pt-2 flex justify-between font-bold text-[12px]">
              <span className="text-text-muted">Total mensual</span>
              <span style={{ color: C.rose }}>S/ {totalMonthly}</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-[11px] font-semibold text-text-muted mb-1">Proyección Costos vs. Ingresos (S/)</div>
          <div className="text-[10px] text-text-ghost mb-3">Desde activación comercial (Julio 2026)</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={BUDGET_CHART}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.slate, fontSize: 9 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v === 0 ? '0' : `S/${Math.round(v / 1000)}k`} />
              <Tooltip contentStyle={ttStyle}
                formatter={(v: number, n: string) => [`S/ ${v.toLocaleString('es-PE')}`, n === 'ingreso' ? 'Ingresos' : 'Costos']} />
              <Line dataKey="ingreso" stroke={C.green} strokeWidth={2} dot={{ r: 3, fill: C.green }} name="ingreso" />
              <Line dataKey="costo"   stroke={C.rose}  strokeWidth={2} dot={{ r: 3, fill: C.rose }}  name="costo" strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <div className="text-[11px] font-semibold text-text-muted mb-3">Inversión inicial (CAPEX)</div>
        <div className="space-y-2">
          {BUDGET_CAPEX.map((c) => (
            <div key={c.item} className="flex items-center justify-between text-[11px]">
              <span className="text-text-ghost">{c.item}</span>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-text-deep">{c.note}</span>
                <span className="font-semibold text-text-secondary tabular-nums">S/ {c.value.toLocaleString('es-PE')}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

/* ─── 7. VIABILIDAD FINANCIERA ───────────────────────────────────── */
const REVENUE_STREAMS = [
  {
    stream: 'SaaS Subscripciones Pro',
    price: 'S/ 150 / corredor / mes',
    target: '50 corredores (Sep 2026)',
    mrr: 'S/ 7,500',
    color: C.indigo,
    icon: '💳',
  },
  {
    stream: 'Leads CPL (costo por lead)',
    price: 'S/ 320 – S/ 640 / lead',
    target: '100 leads / mes (Sep 2026)',
    mrr: 'S/ 32,000',
    color: C.teal,
    icon: '🎯',
  },
  {
    stream: 'Reportes ACM avanzados',
    price: 'S/ 80 / reporte premium',
    target: '60 reportes / mes',
    mrr: 'S/ 4,800',
    color: C.amber,
    icon: '📄',
  },
  {
    stream: 'Enterprise API Access',
    price: 'S/ 2,000+ / contrato',
    target: '3 inmobiliarias (Dic 2026)',
    mrr: 'S/ 6,000',
    color: C.violet,
    icon: '🏢',
  },
];

const ROI_DATA = [
  { mes: 'Jul', mrr: 17500 },
  { mes: 'Ago', mrr: 35000 },
  { mes: 'Sep', mrr: 50300 },
  { mes: 'Oct', mrr: 62000 },
  { mes: 'Nov', mrr: 76000 },
  { mes: 'Dic', mrr: 95000 },
];

function ViabilidadSection() {
  return (
    <>
      <SectionTitle icon="📈">Viabilidad financiera</SectionTitle>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <KpiMini label="MRR objetivo Jul 2026" value="S/ 17,500" sub="Primer mes comercial" color={C.green} />
        <KpiMini label="MRR objetivo Sep 2026" value="S/ 50,300" sub="Con los 4 streams activos" color={C.teal} />
        <KpiMini label="Break-even operativo" value="Jul 2026" sub="Mes 1 de operación" color={C.amber} />
        <KpiMini label="ROI estimado año 1" value=">400%" sub="Sobre CAPEX no-bootstrapped" color={C.violet} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="space-y-2">
          {REVENUE_STREAMS.map((s) => (
            <Card key={s.stream} accent={s.color}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{s.icon}</span>
                <span className="text-[12px] font-semibold text-text-secondary">{s.stream}</span>
                <span className="ml-auto text-[13px] font-bold" style={{ color: s.color }}>{s.mrr}</span>
              </div>
              <div className="flex justify-between text-[10.5px] text-text-ghost">
                <span>{s.price}</span>
                <span>{s.target}</span>
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <div className="text-[11px] font-semibold text-text-muted mb-0.5">Proyección MRR combinado (S/)</div>
          <div className="text-[10px] text-text-ghost mb-3">Jul 2026 → Dic 2026</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ROI_DATA} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.slate, fontSize: 9 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `S/${Math.round(v / 1000)}k`} />
              <Tooltip contentStyle={ttStyle} formatter={(v: number) => [`S/ ${v.toLocaleString('es-PE')}`, 'MRR']} />
              <Bar dataKey="mrr" radius={[4, 4, 0, 0]} name="MRR">
                {ROI_DATA.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? C.green : i < 3 ? C.teal : C.indigo} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="text-center p-2 rounded-lg bg-bg-elevated">
              <div className="text-[10px] text-text-ghost">Ingresos acum. H2 2026</div>
              <div className="text-[15px] font-bold" style={{ color: C.green }}>S/ 335,800</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-bg-elevated">
              <div className="text-[10px] text-text-ghost">Costos acum. H2 2026</div>
              <div className="text-[15px] font-bold" style={{ color: C.rose }}>S/ 7,250</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Escenarios */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Escenario conservador', color: C.amber, icon: '📉',
            items: ['10 corredores a S/150', '30 leads/mes a S/320', 'Sin enterprise'], mrr: 'S/ 11,100' },
          { label: 'Escenario base', color: C.teal, icon: '📊',
            items: ['30 corredores a S/150', '80 leads/mes a S/380', '1 enterprise a S/2,000'], mrr: 'S/ 38,400' },
          { label: 'Escenario optimista', color: C.green, icon: '🚀',
            items: ['50 corredores a S/150', '120 leads/mes a S/400', '3 enterprise a S/2,500'], mrr: 'S/ 63,000' },
        ].map((esc) => (
          <Card key={esc.label} accent={esc.color}>
            <div className="flex items-center gap-2 mb-2">
              <span>{esc.icon}</span>
              <span className="text-[11px] font-semibold text-text-muted">{esc.label}</span>
            </div>
            <div className="text-[20px] font-bold mb-2" style={{ color: esc.color }}>{esc.mrr} <span className="text-[10px] font-normal text-text-ghost">/mes</span></div>
            <ul className="space-y-1">
              {esc.items.map((item, i) => (
                <li key={i} className="text-[10.5px] text-text-ghost flex items-center gap-1.5">
                  <span style={{ color: esc.color }}>▸</span>{item}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </>
  );
}

/* ─── 8. FUENTES DE CAPITAL ──────────────────────────────────────── */
function CapitalSection() {
  const sources = [
    {
      type: 'Bootstrapping (actual)', icon: '💻', color: C.green, status: 'ACTIVO',
      desc: 'El MVP fue desarrollado con recursos propios (tiempo y conocimiento). El costo de oportunidad estimado es S/18,000 en 3 meses de desarrollo. No hay deuda ni dilución de equity.',
      amount: 'S/ 18,000', note: 'En desarrollo (no erogado)',
    },
    {
      type: 'STARTUP PERU — PROINNOVATE', icon: '🇵🇪', color: C.indigo, status: 'EVALUANDO',
      desc: 'Fondo no reembolsable del Estado peruano para startups tech. Convocatoria "Emprendedores Innovadores" otorga hasta S/50,000 para validación de mercado. InmoData IA califica por ser PropTech con impacto social.',
      amount: 'S/ 50,000', note: 'Fondo no reembolsable',
    },
    {
      type: 'Angel Investing Lima PropTech', icon: '👼', color: C.teal, status: 'PROSPECTO',
      desc: 'Red de ángeles inversionistas del ecosistema peruano (Ángeles Invirtiendo, Lima Valley). Ticket típico: $10,000–$30,000 USD por 5–10% de equity. Target: Q4 2026 cuando tengamos MRR >S/20,000.',
      amount: 'USD 15,000–30,000', note: '5–10% equity dilución',
    },
    {
      type: 'Revenue-Based Financing', icon: '📊', color: C.amber, status: 'FUTURO',
      desc: 'Una vez alcanzado MRR > S/15,000, empresas como Kapital, Drip Capital o COFIDE pueden ofrecer financiamiento basado en ingresos. Sin dilución de equity. Pago como % de ingresos mensuales.',
      amount: 'S/ 50,000–150,000', note: 'Sin dilución. Desde MRR >S/15k',
    },
    {
      type: 'Aceleradora / VC Latam', icon: '🌎', color: C.violet, status: 'FUTURO',
      desc: 'Venture capital enfocado en PropTech Latam (ALLVP, Softbank, Monashees). Ronda Seed típica: $200k–$500k USD por 15–20% equity. Requisito: tracción demostrable (>50 corredores, >S/30k MRR).',
      amount: 'USD 200,000–500,000', note: 'Ronda Seed — Q2 2027',
    },
  ];

  return (
    <>
      <SectionTitle icon="💰">Fuentes de capital</SectionTitle>
      <div className="space-y-3">
        {sources.map((s) => (
          <Card key={s.type} accent={s.color}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: `${s.color}18` }}>
                {s.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[12.5px] font-semibold text-text-secondary">{s.type}</span>
                  <Badge label={s.status} color={s.color} />
                  <div className="ml-auto text-right">
                    <div className="text-[14px] font-bold" style={{ color: s.color }}>{s.amount}</div>
                    <div className="text-[9px] text-text-ghost">{s.note}</div>
                  </div>
                </div>
                <p className="text-[11.5px] text-text-ghost leading-relaxed">{s.desc}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Roadmap de financiamiento */}
      <div className="mt-4 bg-bg-card rounded-card border border-border-subtle p-4">
        <div className="text-[11px] font-semibold text-text-muted mb-3">Roadmap de financiamiento</div>
        <div className="flex items-center gap-0 overflow-x-auto">
          {[
            { date: 'Abr–Jun 2026', label: 'Bootstrap', detail: 'MVP sin costo erogado', color: C.green },
            { date: 'Jul 2026', label: 'Revenue', detail: 'Autofinanciado por ventas', color: C.teal },
            { date: 'Ago 2026', label: 'STARTUP PERU', detail: 'Solicitud fondo S/50k', color: C.indigo },
            { date: 'Q4 2026', label: 'Angel Round', detail: 'USD 15–30k por 8% equity', color: C.amber },
            { date: 'Q2 2027', label: 'Seed VC', detail: 'USD 200–500k Latam PropTech', color: C.violet },
          ].map((phase, i) => (
            <div key={i} className="flex items-center flex-shrink-0">
              <div className="text-center">
                <div className="text-[9px] text-text-ghost mb-1">{phase.date}</div>
                <div className="px-3 py-1.5 rounded-lg text-[10.5px] font-semibold"
                  style={{ background: `${phase.color}18`, color: phase.color, border: `0.5px solid ${phase.color}40` }}>
                  {phase.label}
                </div>
                <div className="text-[9px] text-text-ghost mt-1 max-w-[90px] leading-tight">{phase.detail}</div>
              </div>
              {i < 4 && <div className="w-8 h-px mx-1" style={{ background: `${phase.color}40` }} />}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── PAGE ───────────────────────────────────────────────────────── */
export default function PlanEstrategico() {
  return (
    <div className="min-h-screen bg-bg-base px-6 py-5">
      <Header
        title="Plan Estratégico — InmoData IA"
        subtitle="Visión · Objetivos · Cronograma · Viabilidad"
        onRefresh={() => {}}
        refreshing={false}
      />

      <VisionSection />
      <SmartSection />
      <KpisSection />
      <ActividadesSection />
      <CronogramaSection />
      <PresupuestoSection />
      <ViabilidadSection />
      <CapitalSection />

      <div className="mt-8 pt-4 border-t border-border-subtle flex justify-between text-[11px] text-text-deep">
        <span>InmoData IA · Plan Estratégico 2026 · Documento interno</span>
        <span>Lima, Perú — Lince · Jesús María · Miraflores</span>
      </div>
    </div>
  );
}
