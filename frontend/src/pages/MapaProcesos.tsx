import Header from '@/components/layout/Header';

/* ─── Tokens ─────────────────────────────────────────────────────── */
const C = {
  indigo: '#6366f1', teal: '#2dd4bf', amber: '#f59e0b',
  green:  '#22c55e', rose:  '#f43f5e', violet: '#a78bfa',
  orange: '#f97316', sky: '#38bdf8', slate: '#475569', muted: '#94a3b8',
};

/* ─── Componentes base ───────────────────────────────────────────── */
function SectionTitle({ children, icon, sub }: { children: React.ReactNode; icon?: string; sub?: string }) {
  return (
    <div className="mb-5 mt-8 first:mt-0">
      <div className="flex items-center gap-2.5 mb-1">
        {icon && <span className="text-base">{icon}</span>}
        <span className="text-[10px] font-semibold uppercase tracking-[0.09em] text-text-deep">{children}</span>
        <span className="flex-1 h-px bg-white/[0.06]" />
      </div>
      {sub && <p className="text-[11px] text-text-ghost pl-1">{sub}</p>}
    </div>
  );
}

function ProcessCard({
  icon, title, owner, steps, color, inputs, outputs, tools,
}: {
  icon: string; title: string; owner: string; steps: string[];
  color: string; inputs?: string[]; outputs?: string[]; tools?: string[];
}) {
  return (
    <div className="bg-bg-card rounded-card border border-border-subtle p-3.5 flex flex-col gap-2"
      style={{ borderTop: `2.5px solid ${color}` }}>
      <div className="flex items-start gap-2">
        <span className="text-lg flex-shrink-0">{icon}</span>
        <div className="flex-1">
          <div className="text-[12px] font-semibold text-text-secondary leading-tight">{title}</div>
          <div className="text-[9.5px] mt-0.5" style={{ color }}>{owner}</div>
        </div>
      </div>
      <ul className="space-y-1 pl-1">
        {steps.map((s, i) => (
          <li key={i} className="text-[10.5px] text-text-ghost flex items-start gap-1.5">
            <span className="text-[8px] mt-1 flex-shrink-0" style={{ color }}>◆</span>{s}
          </li>
        ))}
      </ul>
      {(inputs || outputs || tools) && (
        <div className="border-t border-border-subtle pt-2 space-y-1 mt-auto">
          {inputs && (
            <div className="flex items-start gap-1.5">
              <span className="text-[9px] font-bold text-text-deep w-14 flex-shrink-0">Entrada</span>
              <span className="text-[9.5px] text-text-ghost">{inputs.join(' · ')}</span>
            </div>
          )}
          {outputs && (
            <div className="flex items-start gap-1.5">
              <span className="text-[9px] font-bold text-text-deep w-14 flex-shrink-0">Salida</span>
              <span className="text-[9.5px] text-text-ghost">{outputs.join(' · ')}</span>
            </div>
          )}
          {tools && (
            <div className="flex items-start gap-1.5">
              <span className="text-[9px] font-bold text-text-deep w-14 flex-shrink-0">Herr.</span>
              <span className="text-[9.5px]" style={{ color }}>{tools.join(' · ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Arrow({ label, vertical }: { label?: string; vertical?: boolean }) {
  if (vertical) {
    return (
      <div className="flex flex-col items-center gap-0.5 py-1">
        <div className="w-px h-4 bg-white/10" />
        <span className="text-[9px] text-text-ghost">{label}</span>
        <div className="text-white/20 text-xs">▼</div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      <div className="h-px w-5 bg-white/10" />
      {label && <span className="text-[8px] text-text-ghost whitespace-nowrap">{label}</span>}
      <div className="text-white/20 text-[10px]">▶</div>
    </div>
  );
}

function Actor({ icon, label, color, sub }: { icon: string; label: string; color: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
        style={{ background: `${color}15`, border: `1.5px solid ${color}40` }}>
        {icon}
      </div>
      <div className="text-[10px] font-semibold text-text-secondary text-center leading-tight">{label}</div>
      {sub && <div className="text-[9px] text-text-ghost text-center">{sub}</div>}
    </div>
  );
}

/* ─── 1. ACTORES DEL SISTEMA ─────────────────────────────────────── */
function ActoresSection() {
  const actors = [
    { icon: '👤', label: 'Usuario B2C', color: C.teal,   sub: 'Comprador / arrendatario' },
    { icon: '🏢', label: 'Corredor Pro', color: C.indigo, sub: 'Broker suscrito SaaS' },
    { icon: '🏗️', label: 'Inmobiliaria', color: C.violet, sub: 'Cliente enterprise' },
    { icon: '🔀', label: 'Ag. Triaje', color: C.indigo,  sub: 'Router de intenciones' },
    { icon: '🔍', label: 'Ag. Analista', color: C.amber,  sub: 'RAG + BCRP tasador' },
    { icon: '💬', label: 'Ag. Comercial', color: C.teal,  sub: 'Calificador de leads' },
    { icon: '📄', label: 'Ag. Soporte B2B', color: C.green, sub: 'Generador ACM' },
    { icon: '🌐', label: 'Urbania / ADV', color: C.orange, sub: 'Portales scrapeados' },
    { icon: '🏦', label: 'BCRP', color: C.sky,           sub: 'Datos IVT Q4 2025' },
    { icon: '🗄️', label: 'PostgreSQL', color: C.green,   sub: 'Supabase + pgvector' },
    { icon: '🤖', label: 'Gemini 2.5', color: C.rose,    sub: 'LLM generativo' },
    { icon: '👑', label: 'CEO / Admin', color: C.amber,   sub: 'Centro de comando' },
  ];

  return (
    <>
      <SectionTitle icon="👥" sub="Todos los participantes humanos, digitales y externos que intervienen en el sistema">
        Actores del sistema
      </SectionTitle>
      <div className="bg-bg-card rounded-card border border-border-subtle p-5 mb-6">
        <div className="grid grid-cols-6 gap-5">
          {actors.map((a) => <Actor key={a.label} {...a} />)}
        </div>
        <div className="mt-5 pt-4 border-t border-border-subtle grid grid-cols-3 gap-3 text-[10.5px]">
          {[
            { color: C.teal,   label: 'Actores humanos externos', items: ['Usuario B2C', 'Corredor Pro', 'Inmobiliaria / Enterprise'] },
            { color: C.indigo, label: 'Agentes IA internos',       items: ['Triaje', 'Analista RAG', 'Comercial', 'Soporte B2B'] },
            { color: C.orange, label: 'Fuentes de datos / Sistemas', items: ['Urbania · Adondevivir', 'BCRP · INEI', 'PostgreSQL · pgvector · Gemini'] },
          ].map((g) => (
            <div key={g.label}>
              <div className="font-semibold mb-1.5" style={{ color: g.color }}>{g.label}</div>
              {g.items.map((i) => <div key={i} className="text-text-ghost flex items-center gap-1.5"><span style={{ color: g.color }}>▸</span>{i}</div>)}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── 2. PROCESOS ESTRATÉGICOS ───────────────────────────────────── */
function ProcesosEstrategicos() {
  const procs = [
    {
      icon: '🎯', color: C.indigo,
      title: 'Planificación estratégica',
      owner: 'CEO / Admin',
      steps: ['Definición de misión, visión y objetivos SMART', 'Diseño del modelo de negocio (SaaS + CPL)', 'Selección de distritos objetivo (Lince, JM, Miraflores)', 'Roadmap de producto y OKRs trimestrales'],
      inputs: ['Análisis de mercado BCRP', 'Feedback de corredores'],
      outputs: ['Plan estratégico', 'KPIs definidos', 'Roadmap'],
      tools: ['Plan Estratégico · Dashboard CEO'],
    },
    {
      icon: '💰', color: C.amber,
      title: 'Gestión comercial y pricing',
      owner: 'CEO / Admin',
      steps: ['Definición de precios: S/150/mes Plan Pro, S/320 CPL', 'Estrategia de captación de corredores beta', 'Gestión de contratos enterprise (S/2,000+/mes)', 'Análisis de conversión y ajuste de precios'],
      inputs: ['Métricas de conversión', 'Benchmarks del sector'],
      outputs: ['Contratos firmados', 'MRR', 'Ingresos CPL'],
      tools: ['Dashboard CEO · CRM'],
    },
    {
      icon: '📊', color: C.violet,
      title: 'Monitoreo de KPIs y BI',
      owner: 'CEO / Admin',
      steps: ['Seguimiento de MRR, leads, conversión y latencia', 'Análisis de demanda vs. oferta por distrito', 'Radar distrital: 5 dimensiones de mercado', 'Generación de insights IA para decisiones estratégicas'],
      inputs: ['AgentLog DB', 'Leads DB', 'Propiedades DB'],
      outputs: ['Dashboard CEO actualizado', 'Insights de mercado'],
      tools: ['Centro de Comando · Recharts · SQL'],
    },
    {
      icon: '🌎', color: C.teal,
      title: 'Expansión de mercado',
      owner: 'CEO / Admin',
      steps: ['Priorización de nuevos distritos Lima (6 adicionales)', 'Evaluación de expansión geográfica (Arequipa, Trujillo)', 'Estrategia de alianzas con portales y BCRP', 'Gestión de fuentes de capital (STARTUP PERU, ángeles)'],
      inputs: ['Métricas de adopción', 'Análisis competitivo'],
      outputs: ['Plan de expansión', 'Nuevos contratos'],
      tools: ['Plan Estratégico · Mapas de calor'],
    },
  ];

  return (
    <>
      <SectionTitle icon="♟️" sub="Procesos de dirección que definen el rumbo del negocio y la toma de decisiones">
        Procesos estratégicos
      </SectionTitle>
      <div className="grid grid-cols-4 gap-3 mb-6">
        {procs.map((p) => <ProcessCard key={p.title} {...p} />)}
      </div>
    </>
  );
}

/* ─── 3. PROCESOS CLAVE ──────────────────────────────────────────── */

/* 3A. Swim-lane: flujo principal de conversación */
function SwimLane() {
  const lanes = [
    {
      actor: '👤 Usuario B2C', color: C.teal,
      steps: [
        { label: 'Abre chat\nB2C', w: '8%' },
        { label: 'Escribe\nmensaje', w: '8%' },
        { label: '', w: '8%' },
        { label: '', w: '8%' },
        { label: '', w: '8%' },
        { label: '', w: '8%' },
        { label: '', w: '8%' },
        { label: 'Lee\nrespuesta', w: '8%' },
        { label: 'Continúa\nconversación', w: '8%' },
        { label: 'Lead\ncreado ✅', w: '8%' },
      ],
    },
    {
      actor: '⚡ API Fastify', color: C.slate,
      steps: [
        { label: '', w: '8%' },
        { label: 'Recibe\nPOST /chat', w: '8%' },
        { label: 'Auth JWT\nvalida token', w: '8%' },
        { label: '', w: '8%' },
        { label: '', w: '8%' },
        { label: '', w: '8%' },
        { label: 'Recibe\nrespuesta', w: '8%' },
        { label: 'Retorna\nJSON', w: '8%' },
        { label: '', w: '8%' },
        { label: '', w: '8%' },
      ],
    },
    {
      actor: '🔀 Ag. Triaje', color: C.indigo,
      steps: [
        { label: '', w: '8%' },
        { label: '', w: '8%' },
        { label: '', w: '8%' },
        { label: 'Clasifica\nintención', w: '12%' },
        { label: 'Enruta\nal agente', w: '12%' },
        { label: '', w: '8%' },
        { label: '', w: '8%' },
        { label: '', w: '8%' },
        { label: '', w: '8%' },
        { label: '', w: '8%' },
      ],
    },
    {
      actor: '🔍/💬/📄 Agente', color: C.amber,
      steps: [
        { label: '', w: '8%' },
        { label: '', w: '8%' },
        { label: '', w: '8%' },
        { label: '', w: '8%' },
        { label: 'Recibe\nmensaje', w: '8%' },
        { label: 'Consulta\nDB / BCRP', w: '8%' },
        { label: 'Llama\nGemini', w: '8%' },
        { label: 'Genera\nrespuesta', w: '8%' },
        { label: '', w: '8%' },
        { label: '', w: '8%' },
      ],
    },
    {
      actor: '🗄️ PostgreSQL', color: C.green,
      steps: [
        { label: '', w: '8%' },
        { label: '', w: '8%' },
        { label: '', w: '8%' },
        { label: '', w: '8%' },
        { label: '', w: '8%' },
        { label: 'Devuelve\ncomparables', w: '8%' },
        { label: '', w: '8%' },
        { label: '', w: '8%' },
        { label: 'Guarda\nlead', w: '8%' },
        { label: 'Notifica\ncorredor', w: '8%' },
      ],
    },
  ];

  const stepLabels = ['1. Inicio', '2. Request', '3. Auth', '4. Triaje', '5. Routing',
                      '6. Datos', '7. LLM', '8. Respuesta', '9. Persistencia', '10. Notif.'];

  return (
    <div className="bg-bg-card rounded-card border border-border-subtle p-4 mb-4 overflow-x-auto">
      <div className="text-[11px] font-semibold text-text-muted mb-0.5">Diagrama de carril (swim-lane) — Conversación B2C</div>
      <div className="text-[10px] text-text-ghost mb-4">Flujo completo de un mensaje de usuario hasta la persistencia del lead</div>
      <div style={{ minWidth: '900px' }}>
        {/* Header de pasos */}
        <div className="flex mb-2" style={{ paddingLeft: '120px' }}>
          {stepLabels.map((s) => (
            <div key={s} className="text-[8.5px] text-text-ghost text-center font-medium" style={{ flex: 1 }}>
              {s}
            </div>
          ))}
        </div>
        {/* Lanes */}
        {lanes.map((lane) => (
          <div key={lane.actor} className="flex items-center mb-1.5">
            <div className="flex-shrink-0 w-[120px] pr-3 text-right">
              <span className="text-[10px] font-semibold" style={{ color: lane.color }}>{lane.actor}</span>
            </div>
            <div className="flex flex-1 gap-1">
              {lane.steps.map((step, i) => (
                <div key={i} className="flex-1 min-h-[36px] rounded flex items-center justify-center text-center"
                  style={{
                    background: step.label ? `${lane.color}12` : 'transparent',
                    border: step.label ? `0.5px solid ${lane.color}30` : '0.5px solid transparent',
                  }}>
                  {step.label && (
                    <span className="text-[9px] leading-tight" style={{ color: lane.color }}>
                      {step.label.split('\n').map((l, j) => <span key={j} className="block">{l}</span>)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {/* Leyenda de flechas */}
        <div className="flex justify-around mt-3 pt-3 border-t border-border-subtle">
          {[
            { from: '👤 Usuario', to: '⚡ API', label: 'HTTP POST', color: C.teal },
            { from: '⚡ API', to: '🔀 Triaje', label: 'orchestrate()', color: C.indigo },
            { from: '🔀 Triaje', to: '🔍/💬/📄', label: 'route(intent)', color: C.amber },
            { from: 'Agente', to: '🗄️ DB', label: 'Prisma query', color: C.green },
            { from: 'Agente', to: '🤖 Gemini', label: 'generateContent()', color: C.rose },
          ].map((f) => (
            <div key={f.label} className="text-center text-[9px]">
              <span className="text-text-ghost">{f.from}</span>
              <span className="mx-1" style={{ color: f.color }}>→</span>
              <span className="text-text-ghost">{f.to}</span>
              <div style={{ color: f.color }} className="font-mono">{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProcesosClave() {
  const procs = [
    {
      icon: '🌐', color: C.orange,
      title: 'P1 · Ingesta y scraping de datos',
      owner: 'Scraper · node-cron',
      steps: [
        'Cron cada 60 min lanza Playwright headless',
        'GET a Urbania/Adondevivir con User-Agent InmoDataIA-Bot',
        'waitForSelector("[data-qa=POSTING_CARD_PRICE]") — espera render React',
        'extractCards(): extrae precio, área, dirección, sourceId',
        'normalizePrice(): detecta USD vs SOL, separadores miles/decimales',
        'Upsert en tabla Property (deduplicación por sourceId)',
      ],
      inputs: ['HTML portales Navent/Lifull', 'Datos BCRP IVT Q4 2025'],
      outputs: ['105+ propiedades reales en DB', 'Debug HTML para auditoría'],
      tools: ['Playwright · node-cron · Prisma'],
    },
    {
      icon: '🔀', color: C.indigo,
      title: 'P2 · Orquestación de intenciones (Triaje)',
      owner: 'TriageAgent · Gemini Flash',
      steps: [
        'Recibe mensaje + historial de sesión (últimos 6 turns)',
        'Prompt Gemini: clasifica en {valuation, lead, b2b, general}',
        'Devuelve JSON: { intent, confidence, response }',
        'Enruta: Analista (valuation) | Comercial (lead) | Soporte B2B (b2b)',
        'Si confidence < 0.6 → respuesta general directa',
        'Log latencia en AgentLog para telemetría CEO',
      ],
      inputs: ['Mensaje usuario', 'Historial chat'],
      outputs: ['Intent clasificado', 'Agente destino'],
      tools: ['Gemini 2.5 Flash Lite · Fastify'],
    },
    {
      icon: '🔍', color: C.amber,
      title: 'P3 · Valuación RAG + BCRP (Analista)',
      owner: 'AnalystAgent · pgvector · BCRP',
      steps: [
        'Extrae precio, área, distrito y tipo (venta/alquiler) del mensaje',
        'evaluateSalePrice(): compara vs. mediana BCRP IVT 2025',
        'Calcula diff% → etiqueta: "en línea / por encima / significativamente"',
        'Búsqueda semántica pgvector: comparables ±30% de área en BD',
        'Construye prompt con bloque BCRP + comparables + contexto',
        'Gemini Pro genera análisis narrativo con fundamento de datos',
      ],
      inputs: ['Precio/m² usuario', 'Distrito de interés'],
      outputs: ['Valuación fundamentada', 'Comparables reales', 'PER'],
      tools: ['pgvector · BCRP IVT · Gemini Pro'],
    },
    {
      icon: '💬', color: C.teal,
      title: 'P4 · Calificación de leads (Comercial)',
      owner: 'CommercialAgent · Gemini Flash',
      steps: [
        'Extrae de la conversación: nombre, teléfono (9 dígitos), presupuesto, zona',
        'Detecta moneda: USD ("dólares") vs SOL ("S/ / soles") en el texto',
        'Pide dato faltante en orden: presupuesto → nombre → teléfono → zona',
        'Con los 4 datos: crea User + Lead en DB, marca QUALIFIED',
        'Estima m² alcanzables con BCRP (budgetUsd / precio/m² mediana)',
        'Muestra 3 propiedades reales del rango ±25% de la BD',
      ],
      inputs: ['Conversación completa', 'Presupuesto + moneda'],
      outputs: ['Lead completo en DB', 'Propiedades sugeridas'],
      tools: ['Gemini Flash JSON · Prisma · BCRP'],
    },
    {
      icon: '📄', color: C.green,
      title: 'P5 · Generación de ACM (Soporte B2B)',
      owner: 'SupportAgent · Corredor Pro',
      steps: [
        'Corredor solicita ACM para una propiedad o zona específica',
        'Consulta comparables reales de la BD filtrados por distrito',
        'Integra precios BCRP IVT como referencia de mercado oficial',
        'Gemini genera reporte narrativo estructurado en markdown',
        'Incluye: precio/m² zona, tendencia, brecha demanda-oferta, recomendación',
        'Log en AgentLog (satisfacción corredor target: >94%)',
      ],
      inputs: ['Parámetros del corredor', 'BD propiedades + BCRP'],
      outputs: ['Reporte ACM markdown', 'Datos exportables'],
      tools: ['Gemini Pro · pgvector · BCRP'],
    },
    {
      icon: '🏢', color: C.violet,
      title: 'P6 · Distribución y seguimiento de leads',
      owner: 'Sistema + Corredor Pro',
      steps: [
        'Lead creado → disponible en Dashboard Pro del corredor',
        'Filtro por zona: corredor ve solo leads de sus distritos',
        'Dashboard muestra: nombre, teléfono, zona, presupuesto, fecha',
        'Corredor actualiza estado: NEW → CONTACTED → QUALIFIED → SOLD',
        'Métricas CPL reportadas al CEO en tiempo real',
        'Ingresos registrados en TransactionLog por lead vendido',
      ],
      inputs: ['Lead calificado en DB', 'Perfil del corredor'],
      outputs: ['Lead asignado', 'Ingreso CPL registrado'],
      tools: ['Dashboard Pro · Fastify · Prisma'],
    },
  ];

  return (
    <>
      <SectionTitle icon="⚙️" sub="Procesos que generan valor directo al cliente y sustentan el modelo de negocio">
        Procesos clave
      </SectionTitle>
      <SwimLane />
      <div className="grid grid-cols-3 gap-3 mb-6">
        {procs.map((p) => <ProcessCard key={p.title} {...p} />)}
      </div>
    </>
  );
}

/* ─── 4. PROCESOS DE APOYO ───────────────────────────────────────── */
function ProcesosApoyo() {
  const procs = [
    {
      icon: '🔐', color: C.rose,
      title: 'Seguridad y autenticación',
      owner: 'Fastify · JWT · bcrypt',
      steps: ['Login con email + password (bcrypt hash)', 'Firma JWT con roles: ADMIN / BROKER / BUYER', 'Middleware verifyToken en rutas privadas', 'Roles en sidebar: rutas visibles según perfil'],
      inputs: ['Credenciales usuario'], outputs: ['JWT token', 'Sesión activa'],
      tools: ['@fastify/jwt · bcrypt'],
    },
    {
      icon: '📡', color: C.slate,
      title: 'Telemetría y monitoreo',
      owner: 'AgentLog · Dashboard CEO',
      steps: ['Cada agente registra latencyMs en AgentLog', 'Precisión: leadCreated ? 1.0 : 0.35', 'CEO ve telemetría en tiempo real (Tab Visión Sistémica)', 'Alertas por latencia > 3 s o errores consecutivos'],
      inputs: ['Ejecución de agentes'], outputs: ['Métricas de rendimiento', 'Alertas'],
      tools: ['Prisma · AgentLog · Recharts'],
    },
    {
      icon: '🗃️', color: C.green,
      title: 'Gestión de base de datos',
      owner: 'Prisma ORM · Supabase',
      steps: ['Migraciones con prisma migrate deploy', 'Seed inicial con datos demo y suscripciones', 'Deduplicación de propiedades por sourceId', 'Pool de conexiones: puerto 6543 (runtime) y 5432 (migrations)'],
      inputs: ['Schema Prisma'], outputs: ['DB consistente', 'Datos de prueba'],
      tools: ['Prisma · Supabase · pgvector'],
    },
    {
      icon: '💳', color: C.amber,
      title: 'Gestión de suscripciones',
      owner: 'Sistema · Corredor · CEO',
      steps: ['Planes: Starter (trial), Pro (S/150/mes), Enterprise', 'Registro de transacciones: CPL S/320-640, SaaS S/150', 'Historial de pagos en TransactionLog', 'Próximo: integración Culqi para pagos automáticos'],
      inputs: ['Plan elegido', 'Pago realizado'], outputs: ['Suscripción activa', 'Factura'],
      tools: ['Prisma · Culqi (próximo)'],
    },
    {
      icon: '🛠️', color: C.sky,
      title: 'Infraestructura y despliegue',
      owner: 'DevOps · Railway · Vercel',
      steps: ['Backend en Railway (Node.js container)', 'Frontend en Vercel (React SPA)', 'DB en Supabase (PostgreSQL serverless)', 'Scraper como worker en Railway (cron schedule)'],
      inputs: ['Código fuente', 'Variables de entorno'], outputs: ['Servicios desplegados', 'SSL + CDN'],
      tools: ['Railway · Vercel · Supabase · Docker'],
    },
    {
      icon: '🧹', color: C.violet,
      title: 'Calidad y limpieza de datos',
      owner: 'Scraper · normalizeUtils',
      steps: ['Skip de propiedades "desde" (proyectos, no unidades)', 'Filtro de precios: USD<700k, SOL≥700k (heurístico)', 'Limpieza de direcciones: quitar ", Lima" redundante', 'Validación de área (m²) y dormitorios extraídos'],
      inputs: ['Raw listings portales'], outputs: ['Propiedades normalizadas válidas'],
      tools: ['normalizePrice · extractCards · regex'],
    },
  ];

  return (
    <>
      <SectionTitle icon="🔧" sub="Procesos transversales que habilitan el funcionamiento de los procesos clave">
        Procesos de apoyo
      </SectionTitle>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {procs.map((p) => <ProcessCard key={p.title} {...p} />)}
      </div>
    </>
  );
}

/* ─── 5. MAPA INTEGRADO ──────────────────────────────────────────── */
function MapaIntegrado() {
  return (
    <>
      <SectionTitle icon="🗺️" sub="Vista consolidada: relación entre los tres niveles de procesos y sus interacciones">
        Mapa integrado de procesos
      </SectionTitle>
      <div className="bg-bg-card rounded-card border border-border-subtle p-5 mb-6">
        {/* Capa estratégica */}
        <div className="mb-4">
          <div className="text-[9px] font-bold uppercase tracking-[0.1em] mb-2 flex items-center gap-2" style={{ color: C.indigo }}>
            <span className="w-2 h-2 rounded-sm" style={{ background: C.indigo }} />
            Nivel estratégico — Dirección y control
          </div>
          <div className="grid grid-cols-4 gap-2">
            {['🎯 Planificación estratégica', '💰 Gestión comercial / pricing', '📊 BI y monitoreo KPIs', '🌎 Expansión de mercado'].map((p) => (
              <div key={p} className="rounded-lg px-3 py-2 text-[10.5px] font-medium text-center"
                style={{ background: `${C.indigo}10`, border: `0.5px solid ${C.indigo}30`, color: C.muted }}>
                {p}
              </div>
            ))}
          </div>
        </div>

        {/* Flecha bajando */}
        <div className="flex justify-center mb-3">
          <div className="flex flex-col items-center gap-1">
            <div className="text-[9px] text-text-ghost">Directrices y recursos</div>
            <div className="w-px h-5 bg-white/10" />
            <div className="text-white/20">▼</div>
          </div>
        </div>

        {/* Capa clave */}
        <div className="mb-4">
          <div className="text-[9px] font-bold uppercase tracking-[0.1em] mb-2 flex items-center gap-2" style={{ color: C.teal }}>
            <span className="w-2 h-2 rounded-sm" style={{ background: C.teal }} />
            Nivel operativo — Generación de valor
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { label: '🌐 P1\nIngesta datos', color: C.orange },
              null,
              { label: '🔀 P2\nTriaje intent', color: C.indigo },
              null,
              { label: '🔍 P3\nValuación RAG', color: C.amber },
              { label: '💬 P4\nCalif. leads', color: C.teal },
              { label: '📄 P5\nACM Soporte', color: C.green },
              null,
              { label: '🏢 P6\nDistrib. leads', color: C.violet },
            ].map((item, i) =>
              item === null ? (
                <Arrow key={i} />
              ) : (
                <div key={i} className="flex-shrink-0 rounded-lg px-3 py-2 text-center"
                  style={{ background: `${item.color}12`, border: `1px solid ${item.color}35`, minWidth: '90px' }}>
                  <div className="text-[10px] font-semibold leading-tight" style={{ color: item.color }}>
                    {item.label.split('\n').map((l, j) => <div key={j}>{l}</div>)}
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Flecha subiendo */}
        <div className="flex justify-center mb-3">
          <div className="flex flex-col items-center gap-1">
            <div className="text-white/20">▲</div>
            <div className="w-px h-5 bg-white/10" />
            <div className="text-[9px] text-text-ghost">Soporte técnico y habilitadores</div>
          </div>
        </div>

        {/* Capa apoyo */}
        <div>
          <div className="text-[9px] font-bold uppercase tracking-[0.1em] mb-2 flex items-center gap-2" style={{ color: C.slate }}>
            <span className="w-2 h-2 rounded-sm" style={{ background: C.slate }} />
            Nivel soporte — Habilitadores transversales
          </div>
          <div className="grid grid-cols-6 gap-2">
            {['🔐 Seguridad / Auth', '📡 Telemetría', '🗃️ BD y migraciones', '💳 Suscripciones', '🛠️ Infraestructura', '🧹 Calidad de datos'].map((p) => (
              <div key={p} className="rounded-lg px-2 py-2 text-[10px] font-medium text-center"
                style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', color: C.slate }}>
                {p}
              </div>
            ))}
          </div>
        </div>

        {/* Inputs / Outputs externos */}
        <div className="mt-5 pt-4 border-t border-border-subtle grid grid-cols-2 gap-6">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.08em] mb-2" style={{ color: C.orange }}>
              ← Inputs externos al sistema
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {['👤 Mensajes de usuarios B2C', '🏢 Solicitudes de corredores', '🌐 Listados Urbania · Adondevivir', '🏦 Datos BCRP IVT Q4 2025'].map((i) => (
                <div key={i} className="text-[10px] text-text-ghost flex items-center gap-1.5 bg-bg-elevated rounded px-2 py-1">
                  <span style={{ color: C.orange }}>⬎</span>{i}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.08em] mb-2" style={{ color: C.green }}>
              Outputs del sistema →
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {['💬 Valuaciones y análisis IA', '🎯 Leads calificados completos', '📄 Reportes ACM para corredores', '💰 Ingresos SaaS + CPL'].map((o) => (
                <div key={o} className="text-[10px] text-text-ghost flex items-center gap-1.5 bg-bg-elevated rounded px-2 py-1">
                  <span style={{ color: C.green }}>⬏</span>{o}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── 6. MATRIZ RACI ─────────────────────────────────────────────── */
function MatrizRACI() {
  const rows = [
    { proceso: 'Scraping de portales',         ceo: '—', dev: 'R',  triaje: '—', analista: '—', comercial: '—', b2b: '—',  corredor: '—', nota: 'Totalmente automatizado' },
    { proceso: 'Clasificación de intenciones', ceo: 'I', dev: 'A',  triaje: 'R', analista: '—', comercial: '—', b2b: '—',  corredor: '—', nota: 'Gemini + historial sesión' },
    { proceso: 'Valuación inmobiliaria RAG',   ceo: 'I', dev: 'A',  triaje: 'C', analista: 'R', comercial: '—', b2b: '—',  corredor: 'I', nota: 'BCRP + pgvector + Gemini' },
    { proceso: 'Calificación de lead',         ceo: 'I', dev: 'A',  triaje: 'C', analista: '—', comercial: 'R', b2b: '—',  corredor: 'C', nota: '4 datos: nombre/tel/budget/zona' },
    { proceso: 'Generación ACM',               ceo: 'I', dev: 'A',  triaje: 'C', analista: 'C', comercial: '—', b2b: 'R',  corredor: 'R', nota: 'Corredor solicita + IA genera' },
    { proceso: 'Distribución de leads',        ceo: 'A', dev: 'R',  triaje: '—', analista: '—', comercial: 'C', b2b: '—',  corredor: 'R', nota: 'Dashboard Pro en tiempo real' },
    { proceso: 'Monitoreo de KPIs',            ceo: 'R', dev: 'A',  triaje: '—', analista: '—', comercial: '—', b2b: '—',  corredor: 'I', nota: 'Dashboard CEO + AgentLog' },
    { proceso: 'Gestión de suscripciones',     ceo: 'A', dev: 'R',  triaje: '—', analista: '—', comercial: '—', b2b: '—',  corredor: 'R', nota: 'Corredor paga · CEO aprueba' },
    { proceso: 'Expansión de distritos',       ceo: 'R', dev: 'A',  triaje: '—', analista: 'C', comercial: '—', b2b: 'C',  corredor: 'I', nota: 'Config scrapers + BCRP data' },
  ];

  const raciColors: Record<string, string> = { R: C.indigo, A: C.amber, C: C.teal, I: C.slate, '—': 'transparent' };
  const raciLabels: Record<string, string> = { R: 'Responsable', A: 'Aprobador', C: 'Consultado', I: 'Informado' };
  const cols = [
    { key: 'ceo', label: 'CEO' }, { key: 'dev', label: 'Dev' }, { key: 'triaje', label: 'Triaje' },
    { key: 'analista', label: 'Analista' }, { key: 'comercial', label: 'Comercial' },
    { key: 'b2b', label: 'Soporte B2B' }, { key: 'corredor', label: 'Corredor' },
  ];

  return (
    <>
      <SectionTitle icon="📋" sub="Responsabilidades de cada actor en cada proceso — R: Responsable · A: Aprobador · C: Consultado · I: Informado">
        Matriz RACI
      </SectionTitle>
      <div className="bg-bg-card rounded-card border border-border-subtle p-4 mb-6 overflow-x-auto">
        <table className="w-full text-[11px]" style={{ minWidth: '700px' }}>
          <thead>
            <tr>
              <th className="text-left px-3 py-2 text-text-ghost font-medium text-[10px] uppercase tracking-[0.05em] border-b border-border-subtle w-[35%]">Proceso</th>
              {cols.map((c) => (
                <th key={c.key} className="px-2 py-2 text-center text-text-ghost font-medium text-[10px] uppercase tracking-[0.05em] border-b border-border-subtle">{c.label}</th>
              ))}
              <th className="text-left px-3 py-2 text-text-ghost font-medium text-[10px] uppercase tracking-[0.05em] border-b border-border-subtle">Nota</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white/[0.01]' : ''}>
                <td className="px-3 py-2.5 text-text-secondary border-b border-border-subtle/50">{row.proceso}</td>
                {cols.map((c) => {
                  const val = row[c.key as keyof typeof row] as string;
                  return (
                    <td key={c.key} className="px-2 py-2.5 text-center border-b border-border-subtle/50">
                      {val !== '—' && (
                        <span className="inline-block w-6 h-6 rounded text-[10px] font-black leading-6 text-center"
                          style={{ background: `${raciColors[val]}20`, color: raciColors[val] }}>
                          {val}
                        </span>
                      )}
                    </td>
                  );
                })}
                <td className="px-3 py-2.5 text-text-ghost text-[10px] border-b border-border-subtle/50">{row.nota}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex gap-4 mt-3 pt-3 border-t border-border-subtle">
          {Object.entries(raciLabels).map(([k, v]) => (
            <span key={k} className="flex items-center gap-1.5 text-[10px]">
              <span className="w-5 h-5 rounded text-[9px] font-black flex items-center justify-center"
                style={{ background: `${raciColors[k]}20`, color: raciColors[k] }}>{k}</span>
              <span className="text-text-ghost">{v}</span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── PAGE ───────────────────────────────────────────────────────── */
export default function MapaProcesos() {
  return (
    <div className="min-h-screen bg-bg-base px-6 py-5">
      <Header
        title="Mapa de Procesos — InmoData IA"
        subtitle="Procesos estratégicos · clave · apoyo · RACI"
        onRefresh={() => {}}
        refreshing={false}
      />

      <ActoresSection />
      <ProcesosEstrategicos />
      <ProcesosClave />
      <ProcesosApoyo />
      <MapaIntegrado />
      <MatrizRACI />

      <div className="mt-8 pt-4 border-t border-border-subtle flex justify-between text-[11px] text-text-deep">
        <span>InmoData IA · Mapa de Procesos v1.0 · Junio 2026</span>
        <span>Lima, Perú — Lince · Jesús María · Miraflores</span>
      </div>
    </div>
  );
}
