import { useApi } from '@/hooks/useApi';
import { fetchLeads, fetchDashboardMetrics } from '@/api/client';
import Header from '@/components/layout/Header';
import KPICard from '@/components/dashboard/KPICard';
import MarketIntelligence from '@/components/dashboard/MarketIntelligence';
import type { Lead } from '@/types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

/* ─── Colores y tokens ─────────────────────────────────────────────── */
const C = {
  indigo:  '#6366f1',
  teal:    '#2dd4bf',
  amber:   '#f59e0b',
  green:   '#22c55e',
  rose:    '#f43f5e',
  slate:   '#475569',
  muted:   '#94a3b8',
  ghost:   '#334155',
  surface: '#141720',
  elevated:'#1e2235',
  border:  'rgba(255,255,255,0.07)',
};

const ttStyle = {
  backgroundColor: '#1a1d2e',
  border: '0.5px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#e2e8f0',
  padding: '8px 12px',
};

/* ─── Datos estáticos ──────────────────────────────────────────────── */
const AGENTS = [
  {
    id: 'Triaje',
    icon: '🔀',
    role: 'Orquestador de Intenciones',
    color: C.indigo,
    desc: 'Recibe cada mensaje del usuario, clasifica su intención (valuación, compra, info B2B o soporte) y lo deriva al agente especializado en <200 ms. Actúa como cerebro de enrutamiento de toda la conversación.',
    capabilities: ['Clasificación de intent', 'Routing contextual', 'Historial de sesión', 'Fallback seguro'],
  },
  {
    id: 'Analista',
    icon: '🔍',
    role: 'RAG · Tasador Inmobiliario',
    color: C.amber,
    desc: 'Combina búsqueda vectorial (pgvector) con datos oficiales del BCRP IVT Q4 2025. Compara precio/m² del usuario contra la mediana del mercado y muestra comparables reales de Urbania y Adondevivir.',
    capabilities: ['Búsqueda semántica RAG', 'Validación vs. BCRP', 'Comparables de mercado', 'Estimación PER'],
  },
  {
    id: 'Comercial',
    icon: '💬',
    role: 'Calificador de Leads',
    color: C.teal,
    desc: 'Extrae teléfono y presupuesto (USD o SOL) de forma conversacional. Cuando ambos datos están disponibles, registra el lead, estima m² alcanzables con el BCRP y muestra propiedades que encajan en el presupuesto.',
    capabilities: ['Extracción de datos NLP', 'Detección de moneda', 'Creación de lead', 'Match con propiedades'],
  },
  {
    id: 'Soporte B2B',
    icon: '📄',
    role: 'Generador ACM',
    color: C.green,
    desc: 'Atiende a corredores y empresas inmobiliarias. Genera reportes de Análisis Comparativo de Mercado (ACM) en tiempo real con datos de scraping + BCRP, exportables como PDF para presentar a clientes.',
    capabilities: ['Generación de ACM', 'Datos de scraping live', 'Soporte corredor SaaS', 'Exportación PDF'],
  },
];

const FLOW_STEPS = [
  { icon: '👤', label: 'Usuario', desc: 'Escribe en el chat B2C', color: C.slate },
  { icon: '🔀', label: 'Triaje',  desc: 'Detecta intención y enruta', color: C.indigo },
  { icon: '⚡', label: 'Agente especializado', desc: 'Analista / Comercial / Soporte B2B', color: C.teal },
  { icon: '🤖', label: 'Gemini 2.5', desc: 'Genera respuesta con contexto RAG', color: C.amber },
  { icon: '💬', label: 'Respuesta', desc: 'Texto enriquecido al usuario', color: C.green },
];

const TECH_STACK = [
  { cat: 'Backend',    items: [{ name: 'Node.js 22', icon: '🟢' }, { name: 'TypeScript 5', icon: '🔷' }, { name: 'Fastify 5', icon: '⚡' }, { name: 'Prisma ORM', icon: '🔺' }] },
  { cat: 'Base de Datos', items: [{ name: 'PostgreSQL', icon: '🐘' }, { name: 'pgvector', icon: '🧮' }, { name: 'Supabase', icon: '⚡' }] },
  { cat: 'Frontend',   items: [{ name: 'React 18', icon: '⚛️' }, { name: 'Vite', icon: '⚡' }, { name: 'Tailwind CSS', icon: '🎨' }, { name: 'Recharts', icon: '📊' }] },
  { cat: 'IA',         items: [{ name: 'Google Gemini', icon: '🤖' }, { name: 'RAG + pgvector', icon: '🧠' }] },
  { cat: 'Scraping',   items: [{ name: 'Playwright', icon: '🎭' }, { name: 'Navent/Lifull', icon: '🌐' }, { name: 'node-cron', icon: '⏱️' }] },
];

const DEMAND_DATA = [
  { distrito: 'Lince',       demanda: 182000, oferta: 222000 },
  { distrito: 'Jesús María', demanda: 241000, oferta: 298000 },
  { distrito: 'Miraflores',  demanda: 385000, oferta: 441000 },
];

const RADAR_DATA = [
  { metric: 'Vol. búsqueda', Lince: 82, JesusMaria: 68, Miraflores: 55 },
  { metric: 'Brecha precio', Lince: 90, JesusMaria: 74, Miraflores: 58 },
  { metric: 'Conv. lead',    Lince: 45, JesusMaria: 62, Miraflores: 80 },
  { metric: 'Recurrencia',   Lince: 60, JesusMaria: 55, Miraflores: 88 },
  { metric: 'Urgencia',      Lince: 75, JesusMaria: 70, Miraflores: 65 },
];

const INSIGHTS = [
  { text: 'El 65% de usuarios en Lince tiene un presupuesto S/ 40,000 por debajo de la oferta actual publicada.', tag: 'Brecha crítica', color: C.rose },
  { text: 'Microzona más solicitada hoy: Parque Castilla (Lince) con 182 consultas en las últimas 6 horas.', tag: 'Tendencia', color: C.amber },
  { text: 'Jesús María muestra la mayor tasa de intención de compra real: 71% declara plazo menor a 3 meses.', tag: 'Oportunidad', color: C.green },
  { text: 'Precio/m² en Miraflores subió 4.3% vs. semana anterior (ref. Urbania + BCRP IVT 2025).', tag: 'Dato macro', color: C.indigo },
];

/* ─── Componentes auxiliares ───────────────────────────────────────── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="text-[10px] font-semibold uppercase tracking-[0.09em] text-text-deep">{children}</span>
      <span className="flex-1 h-px bg-white/[0.06]" />
    </div>
  );
}

const STATUS_LABEL: Record<string, string> = { NEW: 'Nuevo', SOLD: 'Vendido', DISCARDED: 'Descartado' };
const STATUS_COLOR: Record<string, string> = { NEW: C.teal, SOLD: C.green, DISCARDED: C.rose };

function LeadRow({ lead }: { lead: Lead }) {
  return (
    <tr>
      <td className="px-3 py-2.5 border-b border-border-muted text-text-secondary text-[12px] font-medium">
        {lead.user?.name ?? 'Anónimo'}
      </td>
      <td className="px-3 py-2.5 border-b border-border-muted text-text-muted text-[12px]">
        {lead.districtSought ?? '—'}
      </td>
      <td className="px-3 py-2.5 border-b border-border-muted text-text-primary font-bold text-[12px] tabular-nums">
        {lead.budgetExtracted ? `USD ${Math.round(lead.budgetExtracted).toLocaleString('en-US')}` : '—'}
      </td>
      <td className="px-3 py-2.5 border-b border-border-muted text-text-muted text-[12px]">
        {lead.user?.phone ?? lead.phone ?? '—'}
      </td>
      <td className="px-3 py-2.5 border-b border-border-muted">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.05em] rounded-[5px] px-2 py-0.5 border"
          style={{ color: STATUS_COLOR[lead.status], background: `${STATUS_COLOR[lead.status]}18`, borderColor: `${STATUS_COLOR[lead.status]}33` }}
        >
          {STATUS_LABEL[lead.status]}
        </span>
      </td>
      <td className="px-3 py-2.5 border-b border-border-muted text-text-ghost text-[11px]">
        {new Date(lead.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
      </td>
    </tr>
  );
}

/* ─── Sección: Flujo didáctico ─────────────────────────────────────── */
function AgentFlow() {
  return (
    <div className="bg-bg-card rounded-card border border-border-subtle p-5 mb-5">
      <div className="text-[13px] font-semibold text-text-muted mb-0.5">¿Cómo funciona el flujo entre agentes?</div>
      <div className="text-[11px] text-text-ghost mb-5">Cada mensaje del usuario pasa por una cadena de agentes IA especializados en tiempo real</div>

      {/* Flow horizontal */}
      <div className="flex items-start gap-2 overflow-x-auto pb-2">
        {FLOW_STEPS.map((step, i) => (
          <div key={i} className="flex items-center gap-2 flex-shrink-0">
            <div className="flex flex-col items-center text-center w-[110px]">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-2 flex-shrink-0"
                style={{ background: `${step.color}18`, border: `1px solid ${step.color}40` }}
              >
                {step.icon}
              </div>
              <div className="text-[11.5px] font-semibold text-text-secondary leading-tight">{step.label}</div>
              <div className="text-[10px] text-text-ghost mt-0.5 leading-tight">{step.desc}</div>
            </div>
            {i < FLOW_STEPS.length - 1 && (
              <div className="flex flex-col items-center gap-0.5 flex-shrink-0 mt-[-16px]">
                <div className="w-8 h-px bg-white/10" />
                <span className="text-[10px] text-text-ghost">▶</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Detalle por intención */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { intent: '💰 Valoración / tasación', route: 'Triaje → Analista RAG → Gemini Pro', color: C.amber },
          { intent: '🏠 Compra / búsqueda de propiedad', route: 'Triaje → Comercial → Gemini Flash → Lead DB', color: C.teal },
          { intent: '📋 Reporte ACM (corredor)', route: 'Triaje → Soporte B2B → BCRP + Scraping → PDF', color: C.green },
        ].map((r) => (
          <div key={r.intent} className="rounded-lg p-3" style={{ background: `${r.color}0d`, border: `0.5px solid ${r.color}30` }}>
            <div className="text-[11px] font-semibold text-text-secondary mb-1.5">{r.intent}</div>
            <div className="text-[10px] font-mono" style={{ color: r.color }}>{r.route}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Sección: Los 4 agentes ───────────────────────────────────────── */
function AgentsSection() {
  return (
    <div className="mb-5">
      <SectionTitle>Los 4 agentes IA de InmoData</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        {AGENTS.map((a) => (
          <div key={a.id} className="bg-bg-card rounded-card border border-border-subtle p-4" style={{ borderLeft: `3px solid ${a.color}` }}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[17px] flex-shrink-0" style={{ background: `${a.color}18` }}>
                {a.icon}
              </div>
              <div>
                <div className="text-[12.5px] font-semibold text-text-secondary">Agente {a.id}</div>
                <div className="text-[10.5px]" style={{ color: a.color }}>{a.role}</div>
              </div>
              <span className="ml-auto text-[9px] font-bold uppercase tracking-[0.05em] rounded px-1.5 py-0.5 border"
                style={{ color: C.green, background: `${C.green}12`, borderColor: `${C.green}30` }}>
                ● Operativo
              </span>
            </div>
            <p className="text-[11.5px] text-text-ghost leading-relaxed mb-3">{a.desc}</p>
            <div className="flex flex-wrap gap-1.5">
              {a.capabilities.map((cap) => (
                <span key={cap} className="text-[9.5px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: `${a.color}10`, color: C.muted, border: `0.5px solid ${a.color}25` }}>
                  {cap}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Sección: Misión y Visión ─────────────────────────────────────── */
function MisionVision() {
  return (
    <div className="grid grid-cols-2 gap-3 mb-5">
      <div className="bg-bg-card rounded-card border border-border-subtle p-4" style={{ borderTop: `2px solid ${C.indigo}` }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🎯</span>
          <span className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: C.indigo }}>Misión</span>
        </div>
        <p className="text-[12px] text-text-secondary leading-relaxed">
          Democratizar la inteligencia del mercado inmobiliario peruano mediante agentes IA que conviertan datos de mercado dispersos en decisiones concretas: valoraciones precisas, leads calificados y reportes ACM en tiempo real.
        </p>
      </div>
      <div className="bg-bg-card rounded-card border border-border-subtle p-4" style={{ borderTop: `2px solid ${C.teal}` }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🔭</span>
          <span className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: C.teal }}>Visión</span>
        </div>
        <p className="text-[12px] text-text-secondary leading-relaxed">
          Ser la plataforma SaaS de referencia para corredores y desarrolladoras inmobiliarias en Lima, expandiéndose a las principales ciudades de Latinoamérica con datos oficiales (BCRP, INEI) integrados en cada respuesta IA.
        </p>
      </div>
    </div>
  );
}

/* ─── Sección: Gestión empresarial ────────────────────────────────── */
function GestionEmpresarial() {
  return (
    <div className="mb-5">
      <SectionTitle>Gestión empresarial — Inteligencia de negocio</SectionTitle>
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Demand vs Supply */}
        <div className="bg-bg-card rounded-card border border-border-subtle p-4">
          <div className="text-[13px] font-semibold text-text-muted mb-0.5">Demanda vs. Oferta por distrito</div>
          <div className="text-[11px] text-text-ghost mb-3">Presupuesto usuario (interno) vs. precio publicado (externo)</div>
          <div className="flex gap-3 mb-3">
            {[['#6366f1', 'Presupuesto usuario'], ['#f43f5e', 'Precio oferta']].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1.5 text-[10.5px]" style={{ color: C.muted }}>
                <span className="w-2 h-2 rounded-sm inline-block" style={{ background: c }} />{l}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={DEMAND_DATA} barSize={18} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="distrito" tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.slate, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => 'S/' + Math.round(v / 1000) + 'k'} />
              <Tooltip contentStyle={ttStyle} formatter={(v: number) => ['S/ ' + v.toLocaleString('es-PE')]} />
              <Bar dataKey="demanda" name="Presupuesto usuario" fill={C.indigo} radius={[3, 3, 0, 0]} />
              <Bar dataKey="oferta"  name="Precio oferta"       fill={C.rose}   radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar distrital */}
        <div className="bg-bg-card rounded-card border border-border-subtle p-4">
          <div className="text-[13px] font-semibold text-text-muted mb-0.5">Radar distrital comparativo</div>
          <div className="text-[11px] text-text-ghost mb-2">Índice de 5 dimensiones por distrito</div>
          <div className="flex gap-3 mb-1 flex-wrap">
            {([[C.indigo, 'Lince'], [C.teal, 'Jesús María'], [C.amber, 'Miraflores']] as [string,string][]).map(([c, l]) => (
              <span key={l} className="flex items-center gap-1 text-[10px]" style={{ color: C.muted }}>
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: c }} />{l}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={195}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="rgba(255,255,255,0.07)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: C.slate, fontSize: 9 }} />
              <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
              <Radar name="Lince"       dataKey="Lince"       stroke={C.indigo} fill={C.indigo} fillOpacity={0.12} strokeWidth={1.5} />
              <Radar name="Jesús María" dataKey="JesusMaria"  stroke={C.teal}   fill={C.teal}   fillOpacity={0.12} strokeWidth={1.5} />
              <Radar name="Miraflores"  dataKey="Miraflores"  stroke={C.amber}  fill={C.amber}  fillOpacity={0.12} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights IA */}
      <div className="grid grid-cols-2 gap-2.5">
        {INSIGHTS.map((ins, i) => (
          <div key={i} className="bg-bg-card rounded-card p-3.5 border border-border-subtle" style={{ borderLeft: `3px solid ${ins.color}` }}>
            <span className="text-[9px] font-bold uppercase tracking-[0.06em] rounded px-1.5 py-0.5 border inline-block mb-2"
              style={{ color: ins.color, background: `${ins.color}15`, borderColor: `${ins.color}35` }}>
              {ins.tag}
            </span>
            <p className="text-[11.5px] text-text-ghost leading-relaxed">{ins.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Sección: Stack tecnológico ───────────────────────────────────── */
function TechStack() {
  return (
    <div className="bg-bg-card rounded-card border border-border-subtle p-5 mb-5">
      <div className="text-[13px] font-semibold text-text-muted mb-0.5">Stack tecnológico</div>
      <div className="text-[11px] text-text-ghost mb-4">Tecnologías que impulsan la plataforma InmoData IA</div>
      <div className="grid grid-cols-5 gap-3">
        {TECH_STACK.map((cat) => (
          <div key={cat.cat}>
            <div className="text-[9.5px] font-bold uppercase tracking-[0.08em] mb-2.5" style={{ color: C.slate }}>{cat.cat}</div>
            <div className="flex flex-col gap-1.5">
              {cat.items.map((tech) => (
                <div key={tech.name} className="flex items-center gap-1.5 text-[11px] text-text-ghost rounded-lg px-2 py-1.5 bg-bg-elevated">
                  <span className="text-sm">{tech.icon}</span>
                  <span>{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────── */
export default function ProDashboard() {
  const leads   = useApi(() => fetchLeads({ status: 'NEW' }));
  const metrics = useApi(fetchDashboardMetrics);
  const m = metrics.data;

  return (
    <div className="min-h-screen bg-bg-base px-6 py-5">
      <Header
        title="InmoData IA — Dashboard Pro"
        subtitle="Corredor · Vista personalizada"
        onRefresh={() => { leads.refetch(); metrics.refetch(); }}
        refreshing={leads.loading}
      />

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <KPICard
          label="Leads asignados (activos)"
          value={String(leads.data?.length ?? 0)}
          icon="🎯"
          accent={C.teal}
        />
        <KPICard
          label="Presupuesto promedio"
          value={
            leads.data && leads.data.length > 0
              ? `USD ${Math.round(leads.data.reduce((s, l) => s + (l.budgetExtracted ?? 0), 0) / leads.data.length).toLocaleString('en-US')}`
              : '—'
          }
          icon="💰"
          accent={C.indigo}
        />
        <KPICard
          label="Tasa de conversión"
          value={m ? `${m.kpis.conversionRate}%` : '—'}
          icon="📊"
          accent={C.amber}
        />
      </div>

      {/* Leads table */}
      <div className="bg-bg-card rounded-card p-4 border border-border-subtle mb-5">
        <div className="text-[13px] font-semibold text-text-muted mb-0.5">Mis leads activos</div>
        <div className="text-[11px] text-text-ghost mb-4">Prospectos calificados asignados a tu perfil</div>
        {leads.loading ? (
          <div className="h-40 animate-pulse bg-bg-elevated rounded-lg" />
        ) : leads.error ? (
          <div className="text-rose text-sm">{leads.error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  {['Contacto', 'Zona', 'Presupuesto', 'Teléfono', 'Estado', 'Recibido'].map((h) => (
                    <th key={h} className="text-left text-text-ghost font-medium px-3 py-2 border-b border-border-subtle text-[10.5px] uppercase tracking-[0.05em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.data?.map((lead) => <LeadRow key={lead.id} lead={lead} />)}
                {leads.data?.length === 0 && (
                  <tr><td colSpan={6} className="px-3 py-6 text-center text-text-ghost text-sm">Sin leads activos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Market intelligence */}
      {m && (
        <>
          <SectionTitle>Inteligencia de mercado — Tu zona</SectionTitle>
          <div className="mb-5">
            <MarketIntelligence demandVsSupply={m.demandVsSupply} />
          </div>
        </>
      )}

      {/* Flujo entre agentes */}
      <SectionTitle>Cómo funciona — Flujo entre agentes IA</SectionTitle>
      <AgentFlow />

      {/* Los 4 agentes */}
      <AgentsSection />

      {/* Misión y Visión */}
      <SectionTitle>Misión y Visión</SectionTitle>
      <MisionVision />

      {/* Gestión empresarial */}
      <GestionEmpresarial />

      {/* Stack tecnológico */}
      <SectionTitle>Stack tecnológico</SectionTitle>
      <TechStack />

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border-subtle flex justify-between text-[11px] text-text-deep">
        <span>InmoData IA · {new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        <span>Lince · Jesús María · Miraflores, Lima — Perú</span>
      </div>
    </div>
  );
}
