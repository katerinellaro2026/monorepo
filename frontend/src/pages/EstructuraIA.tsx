import Header from '@/components/layout/Header';

/* ─── Tokens ─────────────────────────────────────────────────────── */
const C = {
  indigo: '#6366f1', teal: '#2dd4bf', amber: '#f59e0b',
  green: '#22c55e', rose: '#f43f5e', violet: '#a78bfa',
  orange: '#f97316', sky: '#38bdf8', slate: '#475569', muted: '#94a3b8',
};

/* ─── Primitivos ─────────────────────────────────────────────────── */
function SectionTitle({ children, icon, sub }: { children: React.ReactNode; icon?: string; sub?: string }) {
  return (
    <div className="mb-5 mt-8 first:mt-0">
      <div className="flex items-center gap-2.5 mb-0.5">
        {icon && <span className="text-base">{icon}</span>}
        <span className="text-[10px] font-semibold uppercase tracking-[0.09em] text-text-deep">{children}</span>
        <span className="flex-1 h-px bg-white/[0.06]" />
      </div>
      {sub && <p className="text-[10.5px] text-text-ghost pl-1 mt-0.5">{sub}</p>}
    </div>
  );
}

function Card({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`bg-bg-card rounded-card border border-border-subtle p-4 ${className}`} style={style}>{children}</div>
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-block text-[9px] font-bold uppercase tracking-[0.06em] rounded px-1.5 py-0.5 border"
      style={{ color, background: `${color}12`, borderColor: `${color}30` }}>
      {label}
    </span>
  );
}

/* ─── 1. ARQUITECTURA VISUAL ─────────────────────────────────────── */
function ArchBox({ icon, label, sub, color, wide }: { icon: string; label: string; sub?: string; color: string; wide?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${wide ? 'flex-1' : ''}`}>
      <div className="px-3 py-2 rounded-xl text-center transition-all"
        style={{ background: `${color}12`, border: `1.5px solid ${color}40`, minWidth: wide ? undefined : '90px' }}>
        <div className="text-lg mb-0.5">{icon}</div>
        <div className="text-[10px] font-bold leading-tight" style={{ color }}>{label}</div>
        {sub && <div className="text-[8.5px] text-text-ghost mt-0.5 leading-tight">{sub}</div>}
      </div>
    </div>
  );
}

function ConnV({ label, color = 'rgba(255,255,255,0.1)' }: { label?: string; color?: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-1">
      <div className="w-px h-4" style={{ background: color }} />
      {label && <div className="text-[8px] px-1.5 py-0.5 rounded" style={{ color, background: `${color}10`, border: `0.5px solid ${color}30` }}>{label}</div>}
      <div className="text-[10px]" style={{ color }}>▼</div>
    </div>
  );
}

function ArqSection() {
  return (
    <>
      <SectionTitle icon="🏛️" sub="Estructura de 5 capas: actores externos → API → orquestación → especialización → infraestructura de datos">
        Arquitectura de la organización de agentes IA
      </SectionTitle>
      <Card className="mb-6">
        <div className="max-w-4xl mx-auto">

          {/* Capa 0: Actores externos */}
          <div className="mb-1">
            <div className="text-[8.5px] font-bold uppercase tracking-[0.1em] text-center mb-2" style={{ color: C.slate }}>
              CAPA 0 — Actores externos
            </div>
            <div className="flex justify-center gap-8">
              <ArchBox icon="👤" label="Usuario B2C" sub="Comprador / arrendatario" color={C.teal} />
              <ArchBox icon="🏢" label="Corredor Pro" sub="Broker suscrito" color={C.indigo} />
              <ArchBox icon="🏗️" label="Inmobiliaria" sub="Cliente enterprise" color={C.violet} />
            </div>
          </div>

          <ConnV label="HTTP / WebSocket" color={C.slate} />

          {/* Capa 1: API Gateway */}
          <div className="mb-1">
            <div className="text-[8.5px] font-bold uppercase tracking-[0.1em] text-center mb-2" style={{ color: C.slate }}>
              CAPA 1 — Gateway & Auth
            </div>
            <div className="flex justify-center">
              <div className="px-8 py-2.5 rounded-xl text-center"
                style={{ background: `${C.slate}12`, border: `1.5px solid ${C.slate}40`, width: '320px' }}>
                <div className="text-base mb-0.5">⚡</div>
                <div className="text-[10px] font-bold" style={{ color: C.slate }}>API Fastify 5 · JWT Auth · Rate Limiter</div>
                <div className="text-[8.5px] text-text-ghost mt-0.5">POST /chat · POST /leads · GET /metrics · GET /properties</div>
              </div>
            </div>
          </div>

          <ConnV label="orchestrate(message, history, userId)" color={C.indigo} />

          {/* Capa 2: Orquestador */}
          <div className="mb-1">
            <div className="text-[8.5px] font-bold uppercase tracking-[0.1em] text-center mb-2" style={{ color: C.indigo }}>
              CAPA 2 — Orquestador central
            </div>
            <div className="flex justify-center">
              <div className="px-8 py-3 rounded-xl text-center relative"
                style={{ background: `${C.indigo}15`, border: `2px solid ${C.indigo}60`, width: '360px', boxShadow: `0 0 20px ${C.indigo}20` }}>
                <div className="text-xl mb-1">🔀</div>
                <div className="text-[12px] font-black" style={{ color: C.indigo }}>Agente Triaje (Orquestador)</div>
                <div className="text-[9px] text-text-ghost mt-1">Clasifica intenciones · Enruta al agente correcto · Gestiona contexto de sesión</div>
                <div className="mt-2 flex justify-center gap-2 flex-wrap">
                  {['valuation', 'lead', 'b2b', 'general'].map((t) => (
                    <span key={t} className="text-[8.5px] px-1.5 py-0.5 rounded font-mono"
                      style={{ background: `${C.indigo}20`, color: C.indigo }}>intent: {t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Flechas de routing */}
          <div className="flex justify-center gap-0 my-1">
            <div className="flex-1 flex flex-col items-center">
              <div className="w-px h-5" style={{ background: C.amber }} />
              <div className="text-[8px] px-1 rounded" style={{ color: C.amber, background: `${C.amber}12` }}>valuation</div>
              <div style={{ color: C.amber }} className="text-[10px]">▼</div>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="w-px h-5" style={{ background: C.teal }} />
              <div className="text-[8px] px-1 rounded" style={{ color: C.teal, background: `${C.teal}12` }}>lead</div>
              <div style={{ color: C.teal }} className="text-[10px]">▼</div>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="w-px h-5" style={{ background: C.green }} />
              <div className="text-[8px] px-1 rounded" style={{ color: C.green, background: `${C.green}12` }}>b2b</div>
              <div style={{ color: C.green }} className="text-[10px]">▼</div>
            </div>
          </div>

          {/* Capa 3: Agentes especializados */}
          <div className="mb-1">
            <div className="text-[8.5px] font-bold uppercase tracking-[0.1em] text-center mb-2" style={{ color: C.slate }}>
              CAPA 3 — Agentes especializados
            </div>
            <div className="flex justify-center gap-4">
              {[
                { icon: '🔍', label: 'Ag. Analista', sub: 'RAG · BCRP · Valuación', color: C.amber },
                { icon: '💬', label: 'Ag. Comercial', sub: 'NLP · Lead · Calificación', color: C.teal },
                { icon: '📄', label: 'Ag. Soporte B2B', sub: 'ACM · Corredor · Reportes', color: C.green },
              ].map((a) => (
                <div key={a.label} className="flex-1 flex flex-col items-center">
                  <ArchBox {...a} wide />
                </div>
              ))}
            </div>
          </div>

          {/* Flechas hacia infraestructura */}
          <div className="flex justify-center gap-0 my-1">
            {[C.amber, C.teal, C.green].map((c, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-px h-3" style={{ background: c }} />
                <div style={{ color: c }} className="text-[10px]">▼</div>
              </div>
            ))}
          </div>

          {/* Capa 4: Infraestructura */}
          <div>
            <div className="text-[8.5px] font-bold uppercase tracking-[0.1em] text-center mb-2" style={{ color: C.slate }}>
              CAPA 4 — Infraestructura de datos & IA
            </div>
            <div className="flex justify-center gap-3 flex-wrap">
              {[
                { icon: '🤖', label: 'Gemini 2.5 Flash Lite', sub: 'LLM generativo', color: C.rose },
                { icon: '🗄️', label: 'PostgreSQL + pgvector', sub: 'BD relacional + vectores', color: C.green },
                { icon: '🏦', label: 'BCRP IVT Q4 2025', sub: 'Datos oficiales precios/m²', color: C.sky },
                { icon: '🌐', label: 'Scraper Playwright', sub: 'Urbania + Adondevivir', color: C.orange },
                { icon: '📊', label: 'AgentLog', sub: 'Telemetría y KPIs', color: C.violet },
              ].map((s) => <ArchBox key={s.label} {...s} />)}
            </div>
          </div>

          {/* Leyenda de flujos */}
          <div className="mt-5 pt-4 border-t border-border-subtle grid grid-cols-4 gap-3 text-[10px]">
            {[
              { color: C.indigo, label: 'Flujo de enrutamiento', desc: 'El Triaje delega al agente adecuado según el intent clasificado' },
              { color: C.amber,  label: 'Flujo de datos',        desc: 'Agentes consultan BD, vectores BCRP y propiedades reales' },
              { color: C.teal,   label: 'Flujo de resultados',   desc: 'Respuestas generadas retornan al usuario via API' },
              { color: C.green,  label: 'Flujo de persistencia', desc: 'Leads, logs y sesiones se guardan en PostgreSQL' },
            ].map((f) => (
              <div key={f.label} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ background: f.color }} />
                <div>
                  <div className="font-semibold" style={{ color: f.color }}>{f.label}</div>
                  <div className="text-text-ghost mt-0.5 leading-tight">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </>
  );
}

/* ─── 2. FICHAS DETALLADAS DE AGENTES ───────────────────────────── */
const AGENTS = [
  {
    id: 'triaje', icon: '🔀', name: 'Agente Triaje', color: C.indigo,
    rol: 'Orquestador central del sistema multi-agente',
    rolOrg: 'Reemplaza al recepcionista/dispatcher tradicional que enrutaba consultas manualmente entre departamentos',
    justificacion: 'Sin un orquestador, cada mensaje de usuario llegaría al mismo agente monolítico, saturando su contexto y reduciendo la precisión. El Triaje permite especialización y escalabilidad: cada agente downstream recibe solo los mensajes relevantes a su dominio.',
    sinEsteAgente: 'Todos los mensajes irían al mismo LLM con un prompt gigante que combina valuación + calificación + reportes + soporte, resultando en respuestas imprecisas, mayor costo de tokens y latencia elevada.',
    tecnologia: ['Gemini 2.5 Flash Lite (JSON mode)', 'Historial de sesión (últimos 6 turns)', 'FastAPI context enrichment'],
    entradas: ['Mensaje del usuario', 'Historial completo de sesión', 'UserId de la sesión activa'],
    salidas: ['Intent clasificado: {valuation | lead | b2b | general}', 'Confianza del clasificador (0-1)', 'Delegación al agente especializado'],
    relaciones: [
      { actor: 'Ag. Analista', tipo: 'delega',  desc: 'Mensajes de tipo valuation/comparación/m²/precio' },
      { actor: 'Ag. Comercial', tipo: 'delega', desc: 'Mensajes de tipo lead/compra/presupuesto/interés' },
      { actor: 'Ag. Soporte B2B', tipo: 'delega', desc: 'Mensajes de tipo b2b/ACM/corredor/reporte' },
      { actor: 'API Fastify', tipo: 'recibe de', desc: 'Recibe cada mensaje via POST /chat como punto de entrada' },
    ],
    kpis: [
      { k: 'Precisión de clasificación', v: '96.4%', target: '>95%', ok: true },
      { k: 'Latencia de triaje', v: '~280 ms', target: '<300 ms', ok: true },
      { k: 'Intents manejados/día', v: '50–200', target: 'escalable', ok: true },
      { k: 'Fallback a general', v: '<4%', target: '<5%', ok: true },
    ],
    patron: 'Patrón: Router Agent',
    protocoloDecision: [
      '1. Recibe el mensaje + historial de los últimos 6 turnos',
      '2. Invoca Gemini con prompt de clasificación (JSON mode)',
      '3. Si confidence ≥ 0.6 → delega al agente especializado',
      '4. Si confidence < 0.6 → respuesta general directa sin delegar',
      '5. Registra latencyMs en AgentLog para monitoreo del CEO',
    ],
  },
  {
    id: 'analista', icon: '🔍', name: 'Agente Analista', color: C.amber,
    rol: 'Tasador y analista inmobiliario con datos oficiales y comparables reales',
    rolOrg: 'Digitaliza el rol del tasador certificado (perito valuador) y el analista de mercado, que antes requería visitas físicas y acceso a portales de pago',
    justificacion: 'Los compradores en Lima desconocen si el precio que les ofrecen es justo. Los corredores necesitan sustentar sus precios con datos objetivos. El Analista provee valuaciones instantáneas respaldadas por BCRP y comparables de mercado real — en segundos, no días.',
    sinEsteAgente: 'El usuario recibiría solo una respuesta genérica tipo "depende de la zona". No habría validación objetiva del precio, ni comparación con el mercado, ni cálculo de m² alcanzables. Se perdería el principal diferenciador del producto.',
    tecnologia: ['pgvector (búsqueda semántica de comparables)', 'BCRP IVT Q4 2025 (datos oficiales)', 'Gemini Pro (análisis narrativo)'],
    entradas: ['Precio propuesto por el usuario', 'Área (m²) de la propiedad', 'Distrito de Lima', 'Tipo de operación (venta/alquiler)'],
    salidas: ['Valuación con diff% vs mediana BCRP', 'Hasta 5 propiedades comparables reales', 'Indicador: en línea / por encima / alto', 'Estimación de m² alcanzables con el presupuesto', 'Ratio PER (precio/renta)'],
    relaciones: [
      { actor: 'Ag. Triaje', tipo: 'recibe de', desc: 'Recibe mensajes con intent=valuation delegados por el Triaje' },
      { actor: 'PostgreSQL', tipo: 'consulta',  desc: 'Búsqueda de propiedades comparables con filtros de distrito y área' },
      { actor: 'pgvector',   tipo: 'consulta',  desc: 'Búsqueda semántica de propiedades similares en contexto' },
      { actor: 'BCRP IVT',  tipo: 'consulta',  desc: 'Lee precios oficiales por m² de los 12 distritos indexados' },
      { actor: 'Gemini Pro', tipo: 'invoca',    desc: 'Genera análisis narrativo fundamentado con los datos obtenidos' },
    ],
    kpis: [
      { k: 'Precisión de valuación vs BCRP', v: '±8%', target: '<10%', ok: true },
      { k: 'Comparables encontrados avg', v: '3.2 / consulta', target: '>2', ok: true },
      { k: 'Latencia total', v: '~900 ms', target: '<1.5 s', ok: true },
      { k: 'Distritos con data BCRP', v: '12', target: '≥9', ok: true },
    ],
    patron: 'Patrón: RAG Agent (Retrieval-Augmented Generation)',
    protocoloDecision: [
      '1. Extrae precio, área, distrito y tipo de operación del mensaje',
      '2. evaluateSalePrice(): compara vs mediana BCRP del distrito',
      '3. Calcula diff%: <5% "en línea", 5–20% "por encima", >20% "significativamente alto"',
      '4. Consulta PostgreSQL: propiedades en rango ±30% área en el mismo distrito',
      '5. Construye prompt con bloque BCRP + comparables + contexto del usuario',
      '6. Gemini Pro genera análisis narrativo estructurado con fundamento de datos',
    ],
  },
  {
    id: 'comercial', icon: '💬', name: 'Agente Comercial', color: C.teal,
    rol: 'Calificador automatizado de leads inmobiliarios mediante NLP conversacional',
    rolOrg: 'Reemplaza al pre-vendedor o SDR (Sales Development Representative) que calificaba leads por teléfono, extrayendo datos básicos antes de transferir al corredor',
    justificacion: 'El tiempo de un corredor inmobiliario es valioso. Llamar a 100 prospectos para filtrar 10 interesados reales es ineficiente y costoso. El Agente Comercial hace esta calificación de forma conversacional 24/7, extrayendo los 4 datos clave (nombre, teléfono, presupuesto+moneda, zona) antes de transferir al corredor solo los leads completos.',
    sinEsteAgente: 'Los leads llegarían sin datos o incompletos (solo un teléfono). El corredor gastaría tiempo en llamadas iniciales para recabar información básica. La tasa de conversión caería porque los leads fríos se enfrían más rápido sin seguimiento inmediato.',
    tecnologia: ['Gemini Flash 2.5 Lite (JSON extraction mode)', 'Regex NLP para teléfonos peruanos', 'parseBudget() — detección USD vs SOL', 'Prisma ORM — User + Lead creation'],
    entradas: ['Conversación completa del usuario', 'Historial de sesión', 'Señales de intención de compra'],
    salidas: ['Lead completo en BD (nombre + teléfono + presupuesto + zona)', 'Estimación de m² alcanzables (BCRP)', '3 propiedades reales sugeridas del rango', 'Mensaje de confirmación para el usuario', 'Notificación al corredor asignado'],
    relaciones: [
      { actor: 'Ag. Triaje',   tipo: 'recibe de', desc: 'Recibe mensajes con intent=lead delegados por el Triaje' },
      { actor: 'PostgreSQL',   tipo: 'escribe en', desc: 'Crea registros en tablas User y Lead con QUALIFIED status' },
      { actor: 'Ag. Analista', tipo: 'complementa', desc: 'Usa datos BCRP del Analista para calcular m² alcanzables' },
      { actor: 'Dashboard Pro',tipo: 'alimenta',   desc: 'El lead aparece en tiempo real en el dashboard del corredor' },
      { actor: 'BCRP IVT',     tipo: 'consulta',   desc: 'Lee precio/m² del distrito para calcular poder de compra' },
    ],
    kpis: [
      { k: 'Leads con 4 datos completos', v: '~70%', target: '>70%', ok: true },
      { k: 'Tasa conv. chat → lead', v: '8%', target: '>8%', ok: true },
      { k: 'Precisión detección USD/SOL', v: '97%', target: '>95%', ok: true },
      { k: 'Latencia calificación', v: '~1.2 s', target: '<2 s', ok: true },
    ],
    patron: 'Patrón: Conversational Extraction Agent',
    protocoloDecision: [
      '1. Gemini extrae de la conversación: nombre, teléfono, presupuesto, moneda, distrito',
      '2. Detecta moneda: "dólares" → USD, "soles/S/" → SOL, "100 mil" → SOL por defecto',
      '3. Pide dato faltante en orden: presupuesto → nombre → teléfono → zona (1 dato por turno)',
      '4. Con los 4 datos: crea User (QUALIFIED) + Lead en BD, calcula m² con BCRP',
      '5. Busca 3 propiedades reales en rango ±25% del presupuesto (USD y SOL equivalente)',
      '6. Genera confirmación con nombre, zona, presupuesto, m² estimados y propiedades',
    ],
  },
  {
    id: 'b2b', icon: '📄', name: 'Agente Soporte B2B', color: C.green,
    rol: 'Generador automatizado de reportes ACM y soporte técnico para corredores suscritos',
    rolOrg: 'Reemplaza al analista interno de la inmobiliaria que preparaba Análisis Comparativo de Mercado (ACM) manualmente, tomando entre 2–4 horas por reporte',
    justificacion: 'Un ACM manual requiere: buscar en portales, filtrar comparables, calcular promedios, redactar el análisis y formatearlo. El Agente B2B hace esto en <10 segundos con datos reales de la BD y referencia BCRP oficial, liberando al corredor para tareas de alto valor como cerrar ventas.',
    sinEsteAgente: 'Los corredores no tendrían soporte técnico inmediato. Los ACM requerirían trabajo manual de 2–4h cada uno. Perdería el principal argumento de venta del Plan Pro (S/150/mes), haciendo difícil justificar la suscripción.',
    tecnologia: ['Gemini Pro (análisis narrativo estructurado)', 'pgvector (comparables similares)', 'BCRP IVT Q4 2025 (precio/m² oficial)', 'Markdown renderer en el chat'],
    entradas: ['Solicitud del corredor (zona, tipo, características)', 'Propiedades comparables de la BD', 'Datos BCRP del distrito solicitado'],
    salidas: ['Reporte ACM en markdown (precio/m², tendencia, brecha oferta-demanda)', 'Recomendación de precio de venta/alquiler', 'Rango de precios del mercado real', 'Log de satisfacción en AgentLog'],
    relaciones: [
      { actor: 'Ag. Triaje',   tipo: 'recibe de', desc: 'Recibe mensajes con intent=b2b delegados por el Triaje' },
      { actor: 'PostgreSQL',   tipo: 'consulta',  desc: 'Propiedades activas filtradas por distrito y características' },
      { actor: 'pgvector',     tipo: 'consulta',  desc: 'Búsqueda semántica de comparables en contexto del corredor' },
      { actor: 'BCRP IVT',    tipo: 'consulta',  desc: 'Precio/m² oficial como ancla del análisis de mercado' },
      { actor: 'Gemini Pro',   tipo: 'invoca',    desc: 'Redacta el ACM narrativo con sustento de datos' },
      { actor: 'Dashboard Pro',tipo: 'reporta a', desc: 'Métricas de uso y satisfacción del corredor' },
    ],
    kpis: [
      { k: 'Tiempo generación ACM', v: '<10 s', target: '<15 s', ok: true },
      { k: 'Satisfacción corredor', v: '94%', target: '>90%', ok: true },
      { k: 'ACM generados / semana', v: 'target 20', target: '≥15', ok: true },
      { k: 'Reducción tiempo vs manual', v: '~98%', target: '>90%', ok: true },
    ],
    patron: 'Patrón: RAG Report Generation Agent',
    protocoloDecision: [
      '1. Identifica parámetros del ACM: zona, tipo de propiedad, rango de área',
      '2. Consulta PostgreSQL: hasta 10 propiedades comparables activas del distrito',
      '3. Lee precio/m² BCRP como referencia de mercado oficial',
      '4. Calcula: mediana de precios, rango mín-máx, brecha demanda-oferta en zona',
      '5. Construye prompt estructurado con los datos para Gemini Pro',
      '6. Gemini genera ACM narrativo en markdown: análisis + recomendación + fundamento',
    ],
  },
];

function AgentCard({ agent }: { agent: typeof AGENTS[0] }) {
  return (
    <Card style={{ borderTop: `3px solid ${agent.color}` }} className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: `${agent.color}15`, border: `1.5px solid ${agent.color}40` }}>
          {agent.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[14px] font-black text-text-secondary">{agent.name}</h3>
            <Tag label={agent.patron} color={agent.color} />
          </div>
          <div className="text-[11px] font-semibold mt-0.5" style={{ color: agent.color }}>{agent.rol}</div>
        </div>
      </div>

      {/* Rol organizacional */}
      <div className="bg-bg-elevated rounded-xl p-3">
        <div className="text-[9px] font-bold uppercase tracking-[0.08em] mb-1.5" style={{ color: agent.color }}>🏢 Rol organizacional</div>
        <p className="text-[11px] text-text-ghost leading-relaxed">{agent.rolOrg}</p>
      </div>

      {/* Justificación */}
      <div>
        <div className="text-[9px] font-bold uppercase tracking-[0.08em] mb-2" style={{ color: C.indigo }}>💡 Justificación de negocio</div>
        <p className="text-[11px] text-text-ghost leading-relaxed">{agent.justificacion}</p>
      </div>

      {/* Sin este agente */}
      <div className="border border-rose/20 rounded-xl p-3" style={{ background: `${C.rose}08` }}>
        <div className="text-[9px] font-bold uppercase tracking-[0.08em] mb-1.5" style={{ color: C.rose }}>⚠️ Sin este agente…</div>
        <p className="text-[10.5px] text-text-ghost leading-relaxed">{agent.sinEsteAgente}</p>
      </div>

      {/* Entradas → Salidas */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-[0.07em] mb-2 text-text-ghost">⬇️ Entradas</div>
          <ul className="space-y-1">
            {agent.entradas.map((e, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[10.5px] text-text-ghost">
                <span className="mt-0.5 flex-shrink-0" style={{ color: agent.color }}>◆</span>{e}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[9px] font-bold uppercase tracking-[0.07em] mb-2 text-text-ghost">⬆️ Salidas / Resultados</div>
          <ul className="space-y-1">
            {agent.salidas.map((s, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[10.5px] text-text-ghost">
                <span className="mt-0.5 flex-shrink-0" style={{ color: C.green }}>◆</span>{s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Protocolo de decisión */}
      <div>
        <div className="text-[9px] font-bold uppercase tracking-[0.07em] mb-2 text-text-ghost">⚡ Protocolo de decisión (paso a paso)</div>
        <div className="space-y-1.5">
          {agent.protocoloDecision.map((paso, i) => (
            <div key={i} className="flex items-start gap-2 text-[10.5px] text-text-ghost">
              <span className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold mt-0.5"
                style={{ background: `${agent.color}20`, color: agent.color }}>{i + 1}</span>
              {paso.replace(/^\d+\.\s*/, '')}
            </div>
          ))}
        </div>
      </div>

      {/* Tecnología */}
      <div>
        <div className="text-[9px] font-bold uppercase tracking-[0.07em] mb-2 text-text-ghost">🛠️ Stack tecnológico</div>
        <div className="flex flex-wrap gap-1.5">
          {agent.tecnologia.map((t) => <Tag key={t} label={t} color={agent.color} />)}
        </div>
      </div>

      {/* KPIs */}
      <div>
        <div className="text-[9px] font-bold uppercase tracking-[0.07em] mb-2 text-text-ghost">📊 KPIs del agente</div>
        <div className="grid grid-cols-2 gap-2">
          {agent.kpis.map((kpi) => (
            <div key={kpi.k} className="flex items-center justify-between rounded-lg px-2.5 py-1.5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)' }}>
              <div>
                <div className="text-[9.5px] text-text-ghost">{kpi.k}</div>
                <div className="text-[9px] text-text-deep">meta: {kpi.target}</div>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-bold" style={{ color: kpi.ok ? C.green : C.rose }}>{kpi.v}</div>
                <div className="text-[9px]" style={{ color: kpi.ok ? C.green : C.rose }}>{kpi.ok ? '✓' : '✗'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Relaciones */}
      <div>
        <div className="text-[9px] font-bold uppercase tracking-[0.07em] mb-2 text-text-ghost">🔗 Relaciones con otros actores</div>
        <div className="space-y-1.5">
          {agent.relaciones.map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-[10.5px]">
              <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold flex-shrink-0"
                style={{
                  background: r.tipo === 'delega' ? `${C.indigo}15` : r.tipo === 'recibe de' ? `${C.teal}15` : r.tipo === 'escribe en' ? `${C.rose}15` : r.tipo === 'consulta' ? `${C.amber}15` : `${C.green}15`,
                  color: r.tipo === 'delega' ? C.indigo : r.tipo === 'recibe de' ? C.teal : r.tipo === 'escribe en' ? C.rose : r.tipo === 'consulta' ? C.amber : C.green,
                }}>
                {r.tipo}
              </span>
              <span className="font-semibold text-text-secondary">{r.actor}</span>
              <span className="text-text-ghost">— {r.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function AgentesSection() {
  return (
    <>
      <SectionTitle icon="🤖" sub="Ficha completa de cada agente: rol organizacional, justificación, protocolo de decisión, relaciones y KPIs">
        Estructura de agentes IA — Fichas detalladas
      </SectionTitle>
      {/* Triaje ocupa ancho completo */}
      <div className="mb-4"><AgentCard agent={AGENTS[0]} /></div>
      {/* Los 3 especializados en grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {AGENTS.slice(1).map((a) => <AgentCard key={a.id} agent={a} />)}
      </div>
    </>
  );
}

/* ─── 3. MATRIZ DE RELACIONES ────────────────────────────────────── */
function MatrizRelaciones() {
  type RelType = 'delega' | 'lee' | 'escribe' | 'invoca' | 'complementa' | '—';
  const colores: Record<RelType, string> = {
    delega: C.indigo, lee: C.amber, escribe: C.rose, invoca: C.violet, complementa: C.teal, '—': 'transparent',
  };

  const rows = ['Ag. Triaje', 'Ag. Analista', 'Ag. Comercial', 'Ag. Soporte B2B'];
  const cols = ['Ag. Triaje', 'Ag. Analista', 'Ag. Comercial', 'Ag. Soporte B2B', 'PostgreSQL', 'pgvector', 'BCRP IVT', 'Gemini LLM', 'AgentLog'];

  const matrix: RelType[][] = [
    //  Triaje      Analista    Comercial   B2B         PG           pgvec       BCRP         Gemini       Log
    ['—',        'delega',   'delega',   'delega',   '—',         '—',        '—',         'invoca',    'escribe'],
    ['lee',      '—',        '—',        '—',        'lee',       'lee',      'lee',       'invoca',    'escribe'],
    ['lee',      'complementa','—',      '—',        'escribe',   '—',        'lee',       'invoca',    'escribe'],
    ['lee',      '—',        '—',        '—',        'lee',       'lee',      'lee',       'invoca',    'escribe'],
  ];

  return (
    <>
      <SectionTitle icon="🔗" sub="Cómo se relacionan los agentes entre sí y con los sistemas de infraestructura">
        Matriz de relaciones entre agentes y sistemas
      </SectionTitle>
      <Card className="mb-6 overflow-x-auto">
        <table className="w-full text-[10.5px]" style={{ minWidth: '820px' }}>
          <thead>
            <tr>
              <th className="text-left px-3 py-2 text-text-ghost font-medium text-[9px] uppercase tracking-[0.05em] border-b border-border-subtle">Agente ↓ / Actor →</th>
              {cols.map((c) => (
                <th key={c} className="px-2 py-2 text-center text-text-ghost font-medium text-[9px] border-b border-border-subtle">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? 'bg-white/[0.01]' : ''}>
                <td className="px-3 py-2.5 font-semibold text-text-secondary border-b border-border-subtle/40">
                  {['🔀','🔍','💬','📄'][ri]} {row}
                </td>
                {matrix[ri].map((rel, ci) => (
                  <td key={ci} className="px-2 py-2.5 text-center border-b border-border-subtle/40">
                    {rel !== '—' && (
                      <span className="inline-block px-2 py-0.5 rounded text-[8.5px] font-bold"
                        style={{ background: `${colores[rel]}15`, color: colores[rel] }}>
                        {rel}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex gap-4 mt-3 pt-3 border-t border-border-subtle flex-wrap">
          {(Object.entries(colores) as [RelType, string][]).filter(([k]) => k !== '—').map(([t, c]) => (
            <span key={t} className="flex items-center gap-1.5 text-[9.5px]">
              <span className="px-1.5 py-0.5 rounded font-bold text-[8px]" style={{ background: `${c}15`, color: c }}>{t}</span>
              <span className="text-text-ghost">{({
                delega: 'Transfiere control del flujo', lee: 'Consulta datos sin modificar',
                escribe: 'Persiste datos en el sistema', invoca: 'Llama API externa del LLM',
                complementa: 'Usa lógica compartida',
              } as Record<string, string>)[t]}</span>
            </span>
          ))}
        </div>
      </Card>
    </>
  );
}

/* ─── 4. PROCESOS ORGANIZACIONALES ──────────────────────────────── */
const PROCESOS = [
  {
    id: 'P-B2C', icon: '🛒', title: 'Proceso B2C: Comprador → Lead calificado',
    color: C.teal, target: 'Usuario comprador / arrendatario',
    resultado: 'Lead completo registrado, corredor asignado en <2 min',
    pasos: [
      { actor: '👤 Usuario', accion: 'Escribe consulta en el chat público', agente: null },
      { actor: '⚡ API', accion: 'Recibe POST /chat, autentica sesión (guest o user)', agente: null },
      { actor: '🔀 Triaje', accion: 'Clasifica intent: "quiero comprar" → lead', agente: 'Triaje' },
      { actor: '💬 Comercial', accion: 'Extrae presupuesto (USD/SOL), pide nombre', agente: 'Comercial' },
      { actor: '💬 Comercial', accion: 'Solicita teléfono de contacto', agente: 'Comercial' },
      { actor: '💬 Comercial', accion: 'Pregunta zona / distrito de Lima de interés', agente: 'Comercial' },
      { actor: '💬 Comercial', accion: 'Con 4 datos: crea User (QUALIFIED) + Lead en BD', agente: 'Comercial' },
      { actor: '🏢 Corredor', accion: 'Recibe lead en Dashboard Pro, lo llama', agente: null },
    ],
    justificacion: 'Digitaliza el 100% del embudo de captación. Antes un corredor gastaba 3h/día en llamadas de pre-calificación; ahora recibe solo leads con los 4 datos completos, multiplicando su productividad por 5–8x.',
  },
  {
    id: 'P-VAL', icon: '🏠', title: 'Proceso de valuación: Precio propuesto → Análisis de mercado',
    color: C.amber, target: 'Comprador, vendedor o corredor consultando precio',
    resultado: 'Valuación fundamentada con comparables reales y datos BCRP en <2 segundos',
    pasos: [
      { actor: '👤 Usuario', accion: 'Pregunta si un precio es justo / qué vale una propiedad', agente: null },
      { actor: '🔀 Triaje', accion: 'Detecta intent=valuation, delega al Analista', agente: 'Triaje' },
      { actor: '🔍 Analista', accion: 'Extrae precio, m², distrito y tipo de la consulta', agente: 'Analista' },
      { actor: '🔍 Analista', accion: 'Compara con mediana BCRP IVT Q4 2025 del distrito', agente: 'Analista' },
      { actor: '🔍 Analista', accion: 'Busca comparables reales en BD (pgvector ±30% área)', agente: 'Analista' },
      { actor: '🔍 Analista', accion: 'Invoca Gemini Pro: genera análisis narrativo con datos', agente: 'Analista' },
      { actor: '👤 Usuario', accion: 'Recibe: diff% vs BCRP, comparables, m² alcanzables, PER', agente: null },
    ],
    justificacion: 'Una valuación profesional de un tasador certificado cuesta S/200–800 y tarda 3–5 días. El Analista entrega una valoración orientativa basada en datos oficiales en 1.8 segundos, gratis para el usuario, como gancho para convertir en lead.',
  },
  {
    id: 'P-ACM', icon: '📄', title: 'Proceso B2B: Corredor solicita ACM → Reporte entregado',
    color: C.green, target: 'Corredor inmobiliario suscrito al Plan Pro',
    resultado: 'Reporte ACM completo en markdown en <10 segundos',
    pasos: [
      { actor: '🏢 Corredor', accion: 'Solicita ACM en el chat: "necesito un análisis de mercado para Miraflores"', agente: null },
      { actor: '🔀 Triaje', accion: 'Detecta intent=b2b, verifica rol BROKER, delega a Soporte B2B', agente: 'Triaje' },
      { actor: '📄 Soporte B2B', accion: 'Identifica zona, tipo y características del ACM solicitado', agente: 'Soporte B2B' },
      { actor: '📄 Soporte B2B', accion: 'Consulta comparables en BD + precio/m² BCRP del distrito', agente: 'Soporte B2B' },
      { actor: '📄 Soporte B2B', accion: 'Construye prompt estructurado con datos del mercado real', agente: 'Soporte B2B' },
      { actor: '📄 Soporte B2B', accion: 'Gemini Pro genera reporte ACM: precios, tendencias, recomendación', agente: 'Soporte B2B' },
      { actor: '🏢 Corredor', accion: 'Recibe ACM renderizado en markdown — usa en su presentación al cliente', agente: null },
    ],
    justificacion: 'Un ACM manual tarda 2–4 horas. El Agente B2B lo entrega en <10 segundos. Para un corredor activo con 8–12 operaciones mensuales, esto representa un ahorro de 16–48 horas/mes. El principal argumento del Plan Pro a S/150/mes.',
  },
  {
    id: 'P-MON', icon: '📊', title: 'Proceso de monitoreo: Métricas en tiempo real para el CEO',
    color: C.violet, target: 'CEO / Administrador del sistema',
    resultado: 'Dashboard CEO con KPIs actualizados, telemetría de agentes y alertas',
    pasos: [
      { actor: '🔀🔍💬📄 Agentes', accion: 'Cada agente registra latencyMs + precision en AgentLog al finalizar', agente: 'Todos' },
      { actor: '🗄️ PostgreSQL', accion: 'AgentLog acumula métricas por agente, sesión y hora', agente: null },
      { actor: '⚡ API', accion: 'GET /api/metrics devuelve KPIs agregados (leads, latencia, conversión)', agente: null },
      { actor: '👑 CEO', accion: 'Ve Dashboard CEO: Tab B2B (ingresos, leads) + Tab Sistémica (telemetría IA)', agente: null },
      { actor: '👑 CEO', accion: 'Identifica agentes con latencia elevada o precisión baja → ajusta prompts', agente: null },
    ],
    justificacion: 'La telemetría integrada permite al CEO detectar degradaciones en los agentes antes de que impacten al cliente. Sin esto, un agente con baja precisión podría estar calificando incorrectamente leads durante días sin ser detectado.',
  },
];

function ProcesosSection() {
  return (
    <>
      <SectionTitle icon="🔄" sub="Cómo los agentes IA ejecutan los procesos clave de la organización para obtener resultados de negocio">
        Relaciones y procesos organizacionales con agentes IA
      </SectionTitle>
      <div className="space-y-4 mb-6">
        {PROCESOS.map((proc) => (
          <Card key={proc.id} style={{ borderLeft: `3px solid ${proc.color}` }}>
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl">{proc.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-[13px] font-black text-text-secondary">{proc.title}</h3>
                  <Tag label={proc.id} color={proc.color} />
                </div>
                <div className="text-[10.5px] text-text-ghost mt-0.5">
                  <span style={{ color: proc.color }}>Actor principal: </span>{proc.target}
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="text-[9px] text-text-ghost">Resultado</div>
                <div className="text-[11px] font-semibold text-text-secondary max-w-[220px] leading-tight">{proc.resultado}</div>
              </div>
            </div>

            {/* Flujo de pasos */}
            <div className="flex gap-0 overflow-x-auto pb-2 mb-4">
              {proc.pasos.map((paso, i) => (
                <div key={i} className="flex items-center">
                  <div className="flex-shrink-0 flex flex-col items-center" style={{ minWidth: '110px' }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold mb-1.5"
                      style={{ background: paso.agente ? `${proc.color}20` : 'rgba(255,255,255,0.06)', color: paso.agente ? proc.color : C.slate }}>
                      {i + 1}
                    </div>
                    <div className="px-2 py-1.5 rounded-lg text-center"
                      style={{ background: paso.agente ? `${proc.color}10` : 'rgba(255,255,255,0.03)', border: `0.5px solid ${paso.agente ? proc.color + '30' : 'rgba(255,255,255,0.06)'}`, width: '100px' }}>
                      <div className="text-[9px] font-bold mb-0.5 leading-tight" style={{ color: paso.agente ? proc.color : C.slate }}>{paso.actor}</div>
                      <div className="text-[8.5px] text-text-ghost leading-tight">{paso.accion}</div>
                    </div>
                  </div>
                  {i < proc.pasos.length - 1 && (
                    <div className="flex items-center px-1 flex-shrink-0">
                      <div className="h-px w-3" style={{ background: proc.color + '40' }} />
                      <div className="text-[8px]" style={{ color: proc.color + '60' }}>▶</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Justificación */}
            <div className="rounded-xl p-3" style={{ background: `${proc.color}08`, border: `0.5px solid ${proc.color}25` }}>
              <div className="text-[9px] font-bold uppercase tracking-[0.07em] mb-1" style={{ color: proc.color }}>
                💡 Justificación del proceso con IA
              </div>
              <p className="text-[10.5px] text-text-ghost leading-relaxed">{proc.justificacion}</p>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

/* ─── 5. JUSTIFICACIÓN ESTRATÉGICA ──────────────────────────────── */
function JustificacionSection() {
  const comparacion = [
    { dim: 'Costo operativo mensual',   sin: 'S/ 8,000–15,000 (equipo humano SDR + analistas)', con: 'S/ 300–900 (API + hosting + LLM)', ganancia: 'Reducción >90%' },
    { dim: 'Disponibilidad',            sin: '8h/día, L–V, excl. festivos', con: '24/7/365 sin costo adicional', ganancia: '3x más disponibilidad' },
    { dim: 'Tiempo de calificación lead', sin: '15–30 min (llamada + formulario)', con: '3–8 min (chat conversacional)', ganancia: '5–10x más rápido' },
    { dim: 'Tiempo de ACM',             sin: '2–4 horas por reporte manual', con: '<10 segundos', ganancia: '720–1440x más rápido' },
    { dim: 'Consistencia',              sin: 'Variable: depende del analista y su expertise', con: 'Uniforme: BCRP + misma lógica siempre', ganancia: 'Elimina sesgo humano' },
    { dim: 'Escalabilidad',             sin: 'Lineal: 1 SDR = 10–15 leads/día', con: 'Exponencial: N leads simultáneos', ganancia: 'Sin límite de concurrencia' },
    { dim: 'Actualización de datos',    sin: 'Manual: el analista busca en portales diariamente', con: 'Automático: scraping + BCRP cada hora', ganancia: 'Tiempo real vs. 24h de lag' },
    { dim: 'Trazabilidad',              sin: 'Notas en Excel / CRM manual', con: 'AgentLog + BD estructurada + Dashboard', ganancia: 'Auditabilidad completa' },
  ];

  return (
    <>
      <SectionTitle icon="⚖️" sub="Por qué una arquitectura multi-agente especializada supera al enfoque monolítico o al equipo humano tradicional">
        Justificación estratégica del sistema multi-agente
      </SectionTitle>

      {/* Por qué multi-agente vs monolítico */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          {
            title: '🚫 LLM monolítico único', color: C.rose,
            puntos: [
              'Prompt único que combina valuación + calificación + ACM + soporte',
              'Contexto saturado → respuestas genéricas y menos precisas',
              'Un solo punto de falla: si el prompt falla, todo falla',
              'No escala: cada mejora en un área afecta todas las demás',
              'Mayor costo de tokens por el prompt largo constante',
            ],
          },
          {
            title: '✅ Multi-agente especializado', color: C.green,
            puntos: [
              'Cada agente tiene un dominio específico y un prompt optimizado',
              'El Triaje enruta al agente correcto → mayor precisión',
              'Fallos aislados: un agente puede fallar sin afectar los demás',
              'Escalabilidad independiente: mejorar el Analista no toca al Comercial',
              'Menor costo por token: cada agente usa solo el contexto que necesita',
            ],
          },
          {
            title: '🚫 Equipo humano equivalente', color: C.amber,
            puntos: [
              '1 SDR + 1 tasador + 1 analista de mercado + 1 soporte = S/12,000+/mes',
              'Disponible solo en horario laboral, no los fines de semana',
              'Variabilidad humana: calidad depende del estado del agente ese día',
              'No escala rápido: contratar y capacitar toma semanas/meses',
              'Sin trazabilidad automática: reportes manuales incompletos',
            ],
          },
        ].map((col) => (
          <Card key={col.title} style={{ borderTop: `2.5px solid ${col.color}` }}>
            <div className="text-[11.5px] font-bold mb-3" style={{ color: col.color }}>{col.title}</div>
            <ul className="space-y-2">
              {col.puntos.map((p, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[10.5px] text-text-ghost">
                  <span className="mt-0.5 flex-shrink-0 text-[8px]" style={{ color: col.color }}>◆</span>{p}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      {/* Tabla comparativa IA vs sin IA */}
      <Card className="mb-6">
        <div className="text-[11px] font-semibold text-text-muted mb-1">Sistema IA vs. operación tradicional</div>
        <div className="text-[10px] text-text-ghost mb-3">Comparación directa en las dimensiones clave del negocio</div>
        <table className="w-full text-[10.5px]">
          <thead>
            <tr>
              <th className="text-left px-3 py-2 text-text-ghost font-medium text-[9.5px] border-b border-border-subtle">Dimensión</th>
              <th className="px-3 py-2 text-center font-bold text-[9.5px] border-b border-border-subtle" style={{ color: C.rose }}>❌ Sin agentes IA</th>
              <th className="px-3 py-2 text-center font-bold text-[9.5px] border-b border-border-subtle" style={{ color: C.green }}>✅ Con agentes IA</th>
              <th className="px-3 py-2 text-center font-bold text-[9.5px] border-b border-border-subtle" style={{ color: C.indigo }}>Ganancia</th>
            </tr>
          </thead>
          <tbody>
            {comparacion.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white/[0.01]' : ''}>
                <td className="px-3 py-2 text-text-secondary font-medium border-b border-border-subtle/40">{row.dim}</td>
                <td className="px-3 py-2 text-center text-text-ghost border-b border-border-subtle/40">{row.sin}</td>
                <td className="px-3 py-2 text-center border-b border-border-subtle/40" style={{ color: C.green }}>{row.con}</td>
                <td className="px-3 py-2 text-center font-bold border-b border-border-subtle/40" style={{ color: C.indigo }}>{row.ganancia}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Principios de diseño */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { icon: '🎯', title: 'Principio de especialización', color: C.indigo,
            desc: 'Cada agente domina una función específica. El Triaje sabe enrutar; el Analista sabe valorar; el Comercial sabe calificar. Esta separación de responsabilidades produce respuestas de mayor calidad que un agente generalista.' },
          { icon: '🔒', title: 'Principio de aislamiento', color: C.rose,
            desc: 'Los fallos están contenidos. Si el Agente Comercial tiene un error en la detección de moneda, el Analista y el B2B continúan funcionando sin interrupción. Esto eleva el SLA general del sistema.' },
          { icon: '📈', title: 'Principio de escalabilidad', color: C.green,
            desc: 'Agregar un nuevo agente (ej. Agente de Alquiler) no requiere modificar los existentes. La arquitectura de enrutamiento permite escalar el sistema incorporando nuevos especialistas sin refactoring.' },
          { icon: '🔁', title: 'Principio de mejora continua', color: C.amber,
            desc: 'Cada agente tiene KPIs propios medidos en AgentLog. El CEO puede identificar qué agente tiene menor precisión o mayor latencia y ajustar su prompt de forma quirúrgica, sin afectar a los demás.' },
        ].map((p) => (
          <Card key={p.title} style={{ borderTop: `2.5px solid ${p.color}` }}>
            <div className="text-xl mb-2">{p.icon}</div>
            <div className="text-[11.5px] font-bold mb-2" style={{ color: p.color }}>{p.title}</div>
            <p className="text-[10.5px] text-text-ghost leading-relaxed">{p.desc}</p>
          </Card>
        ))}
      </div>
    </>
  );
}

/* ─── 6. CADENA DE VALOR ─────────────────────────────────────────── */
function CadenaValor() {
  const steps = [
    { icon: '🌐', label: 'Datos de mercado', desc: 'Scraper indexa propiedades de Urbania + ADV cada hora. BCRP IVT Q4 2025 como referencia oficial.', color: C.orange, value: '105+ props reales' },
    { icon: '🔀', label: 'Clasificación de intent', desc: 'Triaje categoriza cada mensaje con 96.4% de precisión y enruta al agente correcto.', color: C.indigo, value: '~280ms latencia' },
    { icon: '⚙️', label: 'Procesamiento especializado', desc: 'Analista valora, Comercial califica, B2B genera ACM — cada uno optimizado para su tarea.', color: C.amber, value: '3 agentes paralelos' },
    { icon: '🎯', label: 'Resultados generados', desc: 'Valuaciones, leads completos, reportes ACM — entregados en segundos.', color: C.teal, value: '<2s por respuesta' },
    { icon: '💰', label: 'Valor de negocio', desc: 'Lead vendido a corredor (S/320), suscripción Pro (S/150/mes), ACM premium (S/80).', color: C.green, value: 'S/17,500 MRR target' },
  ];

  return (
    <>
      <SectionTitle icon="⛓️" sub="Cómo la estructura de agentes transforma datos de mercado en ingresos de negocio">
        Cadena de valor de la organización IA
      </SectionTitle>
      <Card className="mb-8">
        <div className="flex items-stretch gap-0 overflow-x-auto">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-stretch">
              <div className="flex flex-col" style={{ minWidth: '170px' }}>
                <div className="flex-1 rounded-xl p-3 m-1"
                  style={{ background: `${step.color}10`, border: `1px solid ${step.color}30` }}>
                  <div className="text-2xl mb-2">{step.icon}</div>
                  <div className="text-[11px] font-bold mb-1.5" style={{ color: step.color }}>{step.label}</div>
                  <p className="text-[10px] text-text-ghost leading-snug mb-2">{step.desc}</p>
                  <div className="mt-auto text-[10px] font-bold px-2 py-1 rounded text-center"
                    style={{ background: `${step.color}18`, color: step.color }}>{step.value}</div>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="flex items-center px-1 flex-shrink-0">
                  <div className="text-[18px]" style={{ color: step.color + '60' }}>▶</div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-border-subtle grid grid-cols-3 gap-4 text-[10.5px]">
          <div>
            <div className="font-bold text-text-muted mb-2">Entrada del sistema</div>
            <div className="space-y-1 text-text-ghost">
              <div>▸ Mensajes de usuarios en lenguaje natural</div>
              <div>▸ HTML de portales inmobiliarios (scraping)</div>
              <div>▸ Datos BCRP en archivo JSON local</div>
            </div>
          </div>
          <div>
            <div className="font-bold text-text-muted mb-2">Transformaciones</div>
            <div className="space-y-1 text-text-ghost">
              <div>▸ Texto → Intent clasificado (Triaje)</div>
              <div>▸ Precio + m² → Valuación (Analista)</div>
              <div>▸ Conversación → Lead en BD (Comercial)</div>
            </div>
          </div>
          <div>
            <div className="font-bold text-text-muted mb-2">Salida de valor</div>
            <div className="space-y-1 text-text-ghost">
              <div>▸ Leads calificados → Ingresos CPL (S/320+)</div>
              <div>▸ Suscripciones Pro → MRR recurrente (S/150/mes)</div>
              <div>▸ ACM generados → Retención corredor (NPS &gt;40)</div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}

/* ─── PAGE ───────────────────────────────────────────────────────── */
export default function EstructuraIA() {
  return (
    <div className="min-h-screen bg-bg-base px-6 py-5">
      <Header
        title="Estructura de Agentes IA"
        subtitle="Arquitectura · Relaciones · Procesos organizacionales · Justificación estratégica"
        onRefresh={() => {}}
        refreshing={false}
      />

      {/* Intro */}
      <div className="mt-4 mb-6 grid grid-cols-4 gap-3">
        {[
          { n: '4', l: 'Agentes IA especializados', sub: 'Triaje · Analista · Comercial · Soporte B2B', color: C.indigo },
          { n: '5', l: 'Capas arquitectónicas', sub: 'Actores → API → Orquestador → Especialistas → Datos', color: C.teal },
          { n: '4', l: 'Procesos organizacionales', sub: 'B2C · Valuación · ACM · Monitoreo CEO', color: C.amber },
          { n: '>90%', l: 'Reducción costo operativo', sub: 'vs. equipo humano equivalente', color: C.green },
        ].map((k) => (
          <div key={k.l} className="bg-bg-card rounded-card border border-border-subtle p-3">
            <div className="text-[26px] font-black leading-none mb-1" style={{ color: k.color }}>{k.n}</div>
            <div className="text-[11px] font-semibold text-text-secondary leading-tight">{k.l}</div>
            <div className="text-[9.5px] text-text-ghost mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      <ArqSection />
      <AgentesSection />
      <MatrizRelaciones />
      <ProcesosSection />
      <JustificacionSection />
      <CadenaValor />

      <div className="pt-4 border-t border-border-subtle flex justify-between text-[11px] text-text-deep">
        <span>InmoData IA · Estructura de Agentes IA v1.0 · Junio 2026</span>
        <span>Arquitectura multi-agente · Gemini 2.5 Flash Lite · pgvector · BCRP IVT Q4 2025</span>
      </div>
    </div>
  );
}
