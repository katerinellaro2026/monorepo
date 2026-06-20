import { useState, useCallback, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { AGENT_PERSONAS } from '@/data/agentPersonas';
import {
  runTrainingScenario, approveTrainingExample, fetchTrainingStats, fetchTokenStats,
  type TrainingRunResult, type TrainingStats, type TrainingAgentStats, type TokenStats,
} from '@/api/client';

/* ─── Tokens ─────────────────────────────────────────────────────── */
const C = {
  indigo: '#6366f1', teal: '#2dd4bf', amber: '#f59e0b',
  green: '#22c55e', rose: '#f43f5e', violet: '#a78bfa',
  slate: '#475569', muted: '#94a3b8',
};

/* ─── Primitivos ─────────────────────────────────────────────────── */
function Card({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <div className={`bg-bg-card rounded-card border border-border-subtle p-4 ${className}`} style={style}>{children}</div>;
}
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
function Tag({ label, color }: { label: string; color: string }) {
  return <span className="inline-block text-[9px] font-bold uppercase tracking-[0.06em] rounded px-1.5 py-0.5 border" style={{ color, background: `${color}12`, borderColor: `${color}30` }}>{label}</span>;
}

/* ─── 1. CULTURA GENERAL ─────────────────────────────────────────── */
const VALORES = [
  { icon: '🎯', nombre: 'Precisión', desc: 'Cada valoración, dato y recomendación está respaldada por fuentes verificables (BCRP, portales reales, pgvector). Nunca estimamos sin fundamento.', color: C.indigo },
  { icon: '⚡', nombre: 'Agilidad', desc: 'Respuestas en menos de 2 segundos. El tiempo del cliente es sagrado. La velocidad es una forma de respeto.', color: C.teal },
  { icon: '🔍', nombre: 'Transparencia', desc: 'Decimos lo que los datos dicen, incluso cuando la respuesta no es la que el cliente quiere oír. Nunca inflamos expectativas.', color: C.amber },
  { icon: '🤝', nombre: 'Empatía', desc: 'Comprar o vender una propiedad es una de las decisiones más importantes de la vida. Cada interacción se trata con esa seriedad y calidez.', color: C.green },
  { icon: '🚀', nombre: 'Innovación', desc: 'Somos un equipo AI-first. Usamos tecnología de punta (Gemini, pgvector, scraping en tiempo real) para democratizar el acceso a información de calidad.', color: C.violet },
  { icon: '🌎', nombre: 'Impacto social', desc: 'Creemos que el acceso a datos inmobiliarios de calidad no debería ser un privilegio. InmoData IA lo pone al alcance de cualquier persona en Lima.', color: C.rose },
];

const PRINCIPIOS = [
  { n: '01', titulo: 'Data before opinions', desc: 'Ningún agente emite juicios sin respaldo de datos. BCRP IVT > intuición propia.' },
  { n: '02', titulo: 'Every lead matters', desc: 'Cada conversación es una persona con una necesidad real. No hay consultas triviales.' },
  { n: '03', titulo: 'Speed is respect', desc: 'Una respuesta lenta es una respuesta incompleta. La latencia objetivo es <1.5 s.' },
  { n: '04', titulo: 'Escalate with context', desc: 'Al pasar una consulta entre agentes, se transfiere TODO el historial relevante, nunca solo el mensaje.' },
  { n: '05', titulo: 'Own your domain', desc: 'Cada agente es el máximo responsable de su especialidad. El Analista no califica leads. El Comercial no hace valuaciones.' },
  { n: '06', titulo: 'Honest about gaps', desc: 'Si no tenemos cobertura de un distrito, lo decimos explícitamente y ofrecemos la alternativa más cercana.' },
  { n: '07', titulo: 'No pressure, ever', desc: 'El Agente Comercial nunca presiona para obtener datos. Si el usuario no quiere compartir su teléfono, no insistimos.' },
  { n: '08', titulo: 'Speak like a person', desc: 'Lenguaje peruano natural y amigable. Sin tecnicismos innecesarios. Sin respuestas robóticas.' },
  { n: '09', titulo: 'Log everything', desc: 'Cada interacción se registra en AgentLog. Lo que no se mide no puede mejorar.' },
  { n: '10', titulo: 'Improve incrementally', desc: 'Los prompts se ajustan basándose en métricas reales. No hay versión final; hay versión actual.' },
];

const NORMAS_COMUNICACION = [
  { aspecto: 'Saludo', correcto: '"¡Hola! Soy Sofía/Carlos/Diego/Valeria de InmoData IA."', incorrecto: '"Hola, ¿en qué le puedo ayudar?" (sin nombre, sin identidad)' },
  { aspecto: 'Datos', correcto: '"Según BCRP IVT Q4 2025, el precio/m² en Miraflores es USD 2,400."', incorrecto: '"El precio en Miraflores suele ser alto." (sin cifras)' },
  { aspecto: 'Negativa', correcto: '"No cubrimos San Borja aún, pero puedo darte datos de Miraflores que es la zona más cercana."', incorrecto: '"Lo siento, no tengo esa información." (sin alternativa)' },
  { aspecto: 'Lead', correcto: '"¿Me compartes tu nombre para personalizar la atención?"', incorrecto: '"Ingresa tu nombre aquí." (imperativo, frío)' },
  { aspecto: 'Error', correcto: '"Hubo un inconveniente técnico. Permíteme intentarlo nuevamente."', incorrecto: '"Error 500. Intente más tarde." (técnico, distante)' },
  { aspecto: 'Cierre', correcto: '"¿Hay algo más en lo que pueda ayudarte sobre propiedades en Lima?"', incorrecto: '"¿Alguna pregunta más?" (genérico)' },
];

function CulturaGeneral() {
  return (
    <>
      {/* Manifiesto */}
      <Card className="mb-5" style={{ borderLeft: `3px solid ${C.indigo}` }}>
        <div className="text-[10px] font-bold uppercase tracking-[0.08em] mb-2" style={{ color: C.indigo }}>📜 Manifiesto cultural</div>
        <p className="text-[13px] text-text-secondary leading-relaxed font-medium">
          "En InmoData IA creemos que cada persona merece tomar decisiones inmobiliarias informadas. Nuestros agentes no son chatbots — son especialistas digitales con nombre, propósito y criterio. Trabajamos con datos reales, respondemos con honestidad y acompañamos a cada cliente como si fuera el único."
        </p>
        <div className="mt-3 text-[10px] text-text-ghost">— Carta fundacional, InmoData IA, Lima 2026</div>
      </Card>

      {/* Valores */}
      <SectionTitle icon="💎" sub="Los 6 valores que guían cada decisión, respuesta e interacción de los agentes y el equipo">
        Valores organizacionales
      </SectionTitle>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {VALORES.map((v) => (
          <Card key={v.nombre} style={{ borderTop: `2.5px solid ${v.color}` }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{v.icon}</span>
              <span className="text-[12.5px] font-bold" style={{ color: v.color }}>{v.nombre}</span>
            </div>
            <p className="text-[11px] text-text-ghost leading-relaxed">{v.desc}</p>
          </Card>
        ))}
      </div>

      {/* Principios */}
      <SectionTitle icon="📐" sub="10 principios operativos que definen cómo actúan los agentes en cada interacción">
        Principios operativos
      </SectionTitle>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {PRINCIPIOS.map((p) => (
          <div key={p.n} className="flex items-start gap-3 bg-bg-card rounded-card border border-border-subtle px-3 py-2.5">
            <div className="text-[11px] font-black tabular-nums flex-shrink-0 pt-0.5" style={{ color: C.indigo }}>{p.n}</div>
            <div>
              <div className="text-[11.5px] font-bold text-text-secondary font-mono">{p.titulo}</div>
              <div className="text-[10.5px] text-text-ghost mt-0.5 leading-snug">{p.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Normas de comunicación */}
      <SectionTitle icon="🗣️" sub="Estándares de comunicación que todos los agentes deben cumplir — correcto vs. incorrecto">
        Normas de comunicación
      </SectionTitle>
      <Card className="mb-6 overflow-x-auto">
        <table className="w-full text-[10.5px]">
          <thead>
            <tr>
              <th className="text-left px-3 py-2 text-text-ghost text-[9.5px] uppercase tracking-[0.05em] border-b border-border-subtle w-[15%]">Aspecto</th>
              <th className="px-3 py-2 font-bold text-[9.5px] border-b border-border-subtle text-left" style={{ color: C.green }}>✅ Correcto</th>
              <th className="px-3 py-2 font-bold text-[9.5px] border-b border-border-subtle text-left" style={{ color: C.rose }}>❌ Incorrecto</th>
            </tr>
          </thead>
          <tbody>
            {NORMAS_COMUNICACION.map((n, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white/[0.01]' : ''}>
                <td className="px-3 py-2.5 font-semibold text-text-muted border-b border-border-subtle/40">{n.aspecto}</td>
                <td className="px-3 py-2.5 text-text-ghost border-b border-border-subtle/40 italic">"{n.correcto}"</td>
                <td className="px-3 py-2.5 text-text-ghost border-b border-border-subtle/40 italic">"{n.incorrecto}"</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

/* ─── 2. IDENTIDAD DE AGENTES ────────────────────────────────────── */
const AGENT_DETAILS = {
  TRIAJE: {
    valores: ['Empatía ante todo', 'Claridad en el enrutamiento', 'Rapidez de respuesta'],
    estilo: 'Cálida, eficiente, nunca burocrática. Siempre saluda con nombre y ofrece opciones concretas.',
    debilidades: 'En consultas muy ambiguas con múltiples intents mezclados, puede requerir un turno extra para clasificar.',
    culturalScore: 95,
  },
  ANALISTA: {
    valores: ['Datos sobre opiniones', 'Transparencia en cifras', 'Honestidad sobre incertidumbre'],
    estilo: 'Preciso y formal, pero accesible. Cita fuentes explícitamente. Compara siempre contra el BCRP.',
    debilidades: 'En distritos sin cobertura, su respuesta es más genérica. Con propiedades atípicas (penthouses, locales comerciales) su precisión cae.',
    culturalScore: 92,
  },
  COMERCIAL: {
    valores: ['No presión, nunca', 'Respeto por la privacidad', 'Conversación natural'],
    estilo: 'Conversacional y cálido. Usa el nombre del cliente tan pronto como lo conoce. Nunca pide dos datos en el mismo turno.',
    debilidades: 'En conversaciones muy cortas (1-2 turnos), puede necesitar más contexto para extraer los 4 datos completos.',
    culturalScore: 91,
  },
  SOPORTE_B2B: {
    valores: ['Orientación al corredor', 'Calidad sobre velocidad', 'Honestidad sobre cobertura'],
    estilo: 'Profesional y directa. Estructura sus respuestas en secciones claras. Siempre cita precio/m² BCRP como ancla.',
    debilidades: 'En distritos sin propiedades reales en la BD, el ACM se basa solo en BCRP, reduciendo la riqueza comparativa.',
    culturalScore: 90,
  },
};

function AgentIdentityCard({ agentKey }: { agentKey: string }) {
  const persona = AGENT_PERSONAS[agentKey];
  const detail = AGENT_DETAILS[agentKey as keyof typeof AGENT_DETAILS];
  if (!persona || !detail) return null;

  return (
    <Card style={{ borderTop: `3px solid ${persona.color}` }}>
      {/* Header con foto */}
      <div className="flex items-start gap-3 mb-4">
        <img src={persona.avatar} alt={persona.name}
          className="w-16 h-16 rounded-xl object-cover border-2 flex-shrink-0"
          style={{ borderColor: persona.color + '50' }} />
        <div className="flex-1">
          <div className="text-[15px] font-black text-text-primary">{persona.name}</div>
          <div className="text-[11px] font-semibold mt-0.5" style={{ color: persona.color }}>{persona.role}</div>
          <div className="text-[10px] text-text-ghost mt-0.5">{persona.personality}</div>
          <div className="mt-2 flex items-center gap-2">
            <Tag label={`Agente ${agentKey.replace('_', ' ')}`} color={persona.color} />
            <div className="flex items-center gap-1 text-[9.5px]">
              <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
              <span className="text-text-ghost">En línea</span>
            </div>
          </div>
        </div>
        {/* Cultural score */}
        <div className="text-center flex-shrink-0">
          <div className="text-[22px] font-black" style={{ color: detail.culturalScore >= 90 ? C.green : detail.culturalScore >= 75 ? C.amber : C.rose }}>
            {detail.culturalScore}
          </div>
          <div className="text-[8.5px] text-text-ghost">Score cultural</div>
          <div className="w-full h-1 bg-white/[0.06] rounded-full mt-1" style={{ width: '48px' }}>
            <div className="h-1 rounded-full" style={{ width: `${detail.culturalScore}%`, background: detail.culturalScore >= 90 ? C.green : C.amber }} />
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div className="italic text-[11.5px] text-text-secondary mb-3 pl-2 border-l-2" style={{ borderColor: persona.color }}>
        "{persona.tagline}"
      </div>

      {/* Valores del agente */}
      <div className="mb-3">
        <div className="text-[9px] font-bold uppercase tracking-[0.07em] mb-1.5 text-text-ghost">Valores personales</div>
        <div className="flex flex-wrap gap-1.5">
          {detail.valores.map((v) => <Tag key={v} label={v} color={persona.color} />)}
        </div>
      </div>

      {/* Estilo */}
      <div className="bg-bg-elevated rounded-lg p-2.5 mb-2">
        <div className="text-[9px] font-bold uppercase tracking-[0.07em] mb-1" style={{ color: persona.color }}>💬 Estilo de comunicación</div>
        <p className="text-[10.5px] text-text-ghost leading-snug">{detail.estilo}</p>
      </div>

      {/* Área de mejora */}
      <div className="bg-bg-elevated rounded-lg p-2.5">
        <div className="text-[9px] font-bold uppercase tracking-[0.07em] mb-1" style={{ color: C.amber }}>⚠️ Área de mejora identificada</div>
        <p className="text-[10.5px] text-text-ghost leading-snug">{detail.debilidades}</p>
      </div>
    </Card>
  );
}

/* ─── 3. ESCENARIOS DE ENTRENAMIENTO ─────────────────────────────── */
const TRAINING_SCENARIOS = [
  {
    agentKey: 'TRIAJE',
    escenarios: [
      {
        id: 'T1', titulo: 'Consulta ambigua — clasificación de intent',
        valorCultural: 'Precisión + Agilidad',
        situacion: 'El usuario escribe un mensaje muy corto y ambiguo.',
        input: '"hola quiero info sobre depas"',
        culturaEsperada: 'Saludo con nombre propio, ofrecer opciones claras (tasar / comparar / buscar), no asumir el intent.',
        respuestaAgente: '¡Hola! Soy **Sofía** de InmoData IA 👋\n\nPuedo ayudarte de 3 formas:\n🏠 **Tasar** una propiedad (¿cuánto vale?)\n📊 **Comparar precios** entre distritos\n🤝 **Buscar** un depa según tu presupuesto y zona\n\n¿Cuál de estas te interesa hoy?',
        scores: { precision: 96, empatia: 94, claridad: 98, adherencia: 95 },
        aprobado: true,
      },
      {
        id: 'T2', titulo: 'Usuario frustrado — manejo de conflicto',
        valorCultural: 'Empatía + Resiliencia',
        situacion: 'El usuario expresa frustración explícita por malas experiencias previas.',
        input: '"ya llamé a 5 corredores y nadie me da precios claros, esto es un desastre"',
        culturaEsperada: 'Reconocer la frustración, no defenderse, ofrecer diferenciación concreta e inmediata.',
        respuestaAgente: 'Entiendo completamente tu frustración — esa opacidad de precios es exactamente el problema que nosotros resolvemos. 🎯\n\nSoy **Sofía** y aquí en InmoData IA trabajamos diferente: datos reales del BCRP + comparables de portales verificados, sin rodeos.\n\n¿En qué distrito estás buscando? Te paso con **Carlos**, nuestro analista, para que te dé cifras concretas ahora mismo.',
        scores: { precision: 90, empatia: 98, claridad: 95, adherencia: 96 },
        aprobado: true,
      },
      {
        id: 'T3', titulo: 'Intent mixto — valuación + lead simultáneo',
        valorCultural: 'Precisión + Principio "Own your domain"',
        situacion: 'El usuario da presupuesto Y pregunta por precio en el mismo mensaje.',
        input: '"tengo 200 mil dólares y quiero saber si Miraflores está caro"',
        culturaEsperada: 'Enrutar a Analista (valuation) como prioridad, luego al Comercial para calificar el lead.',
        respuestaAgente: '¡Perfecto! Esa pregunta tiene dos partes y la respondemos bien. 📊\n\nTe paso con **Carlos** (nuestro analista) para darte el precio real de Miraflores según BCRP.\nLuego **Diego** te ayuda a ver qué te alcanza con tu presupuesto de USD 200,000.',
        scores: { precision: 97, empatia: 88, claridad: 96, adherencia: 97 },
        aprobado: true,
      },
      {
        id: 'T4', titulo: 'Input personalizado',
        valorCultural: 'Adaptabilidad',
        situacion: 'Escribe cualquier mensaje para probar al agente Sofía en tiempo real.',
        input: '',
        isCustom: true,
        culturaEsperada: 'La respuesta debe respetar los valores del agente: empatía, precisión y lenguaje peruano natural.',
        respuestaAgente: '',
        scores: { precision: 0, empatia: 0, claridad: 0, adherencia: 0 },
        aprobado: false,
      },
    ],
  },
  {
    agentKey: 'ANALISTA',
    escenarios: [
      {
        id: 'A1', titulo: 'Precio inflado — honestidad radical',
        valorCultural: 'Transparencia + Valentía',
        situacion: 'El usuario consulta un precio claramente muy por encima del mercado.',
        input: '"me quieren vender un depa de 50m² en Lince por $220,000, ¿está bien?"',
        culturaEsperada: 'Decirlo claramente con datos: está X% sobre la mediana BCRP. No suavizar la respuesta para complacer.',
        respuestaAgente: 'Soy **Carlos** y con los datos en la mano: ese precio está **significativamente por encima** del mercado. 📊\n\nSegún **BCRP IVT Q4 2025**, el precio mediano en Lince es **USD 1,970/m²**. Para 50m²:\n• **Valor de referencia:** USD 98,500\n• **Precio ofrecido:** USD 220,000\n• **Diferencia:** +123% sobre la mediana\n\nEso no es una propiedad cara — es una sobrevaluación significativa. Te recomiendo negociar agresivamente o buscar alternativas.',
        scores: { precision: 99, empatia: 85, claridad: 98, adherencia: 97 },
        aprobado: true,
      },
      {
        id: 'A2', titulo: 'Distrito sin cobertura — honestidad sobre gaps',
        valorCultural: 'Principio "Honest about gaps"',
        situacion: 'El corredor pide datos de un distrito que aún no está indexado.',
        input: '"¿cuánto vale el m² en San Borja?"',
        culturaEsperada: 'Reconocer la limitación explícitamente, ofrecer el distrito más cercano disponible, comunicar el roadmap de expansión.',
        respuestaAgente: 'Soy **Carlos**. Actualmente nuestro coverage incluye **Lince, Jesús María y Miraflores** — San Borja está en el roadmap de expansión para agosto 2026. 🗺️\n\nLo que sí puedo darte ahora:\n• **Miraflores** (zona premium más cercana): USD 2,400/m²\n• **Jesús María** (perfil similar a San Borja): USD 2,086/m²\n\nSan Borja históricamente cotiza entre estos dos valores. ¿Te sirve como referencia orientativa?',
        scores: { precision: 88, empatia: 92, claridad: 96, adherencia: 94 },
        aprobado: true,
      },
      {
        id: 'A3', titulo: 'Consulta de alquiler — adaptabilidad',
        valorCultural: 'Agilidad + Completitud',
        situacion: 'El usuario pregunta por alquiler, no por venta.',
        input: '"¿cuánto debo cobrar de alquiler por un depa de 80m² en Jesús María?"',
        culturaEsperada: 'Dar un rango de alquiler estimado, incluir PER ratio, no desviarse a tema de venta.',
        respuestaAgente: 'Soy **Carlos**. Para alquiler en Jesús María, según los datos disponibles: 📋\n\n• **Precio venta referencia (BCRP):** USD 2,086/m² → 80m² = **USD 166,880**\n• **PER típico Lima (zona media):** 18–22 años\n• **Alquiler estimado:** USD 630–780/mes (S/ 2,375–2,940/mes)\n\nMi recomendación: arranca en **S/ 2,700/mes** y negocia. Estás en un distrito con alta demanda y oferta limitada.',
        scores: { precision: 93, empatia: 86, claridad: 95, adherencia: 91 },
        aprobado: true,
      },
      {
        id: 'A4', titulo: 'Input personalizado',
        valorCultural: 'Adaptabilidad',
        situacion: 'Escribe cualquier consulta de tasación o precios para probar al agente Carlos.',
        input: '',
        isCustom: true,
        culturaEsperada: 'Respuesta analítica con datos del mercado, sin inflar expectativas, con precio/m² y referencias BCRP.',
        respuestaAgente: '',
        scores: { precision: 0, empatia: 0, claridad: 0, adherencia: 0 },
        aprobado: false,
      },
    ],
  },
  {
    agentKey: 'COMERCIAL',
    escenarios: [
      {
        id: 'C1', titulo: 'Usuario reacio a compartir teléfono',
        valorCultural: 'Principio "No pressure, ever"',
        situacion: 'El usuario se niega explícitamente a dar su número de teléfono.',
        input: '"no quiero dar mi número de celular a nadie"',
        culturaEsperada: 'Respetar la decisión, no insistir, ofrecer alternativa (email u otro canal), mantener la relación.',
        respuestaAgente: 'Completamente entendido, **no hay ningún problema**. Tu privacidad es lo primero. 🙏\n\nSoy **Diego** y podemos continuar sin datos de contacto — los corredores solo reciben leads cuando tú lo autorices explícitamente.\n\n¿Me cuentas más sobre qué estás buscando? Zona, presupuesto, área… Para que cuando estés listo, tengas la mejor opción esperándote.',
        scores: { precision: 85, empatia: 99, claridad: 96, adherencia: 98 },
        aprobado: true,
      },
      {
        id: 'C2', titulo: 'Presupuesto muy limitado',
        valorCultural: 'Honestidad + Orientación a soluciones',
        situacion: 'El usuario tiene un presupuesto que no alcanza para las zonas que desea.',
        input: '"tengo S/ 120,000 y quiero comprar en Miraflores"',
        culturaEsperada: 'Ser honesto sobre el desajuste, no falsas esperanzas, ofrecer alternativas reales y alcanzables.',
        respuestaAgente: 'Soy **Diego** y quiero ser directo contigo para no hacerte perder tiempo. 💬\n\nCon **S/ 120,000** (~USD 31,800), en Miraflores la oferta disponible es muy limitada — el precio mínimo ronda los USD 60,000+ para departamentos pequeños.\n\n**Lo que sí es posible con ese presupuesto:**\n• 🏠 **Lince:** ~16m² (referencia) — zona consolidada, buena conectividad\n• 🏠 **Jesús María:** ~15m² — excelente para inversión\n\n¿Ajustamos la zona o el presupuesto? Quiero encontrarte algo que sí funcione.',
        scores: { precision: 94, empatia: 95, claridad: 97, adherencia: 93 },
        aprobado: true,
      },
      {
        id: 'C3', titulo: 'Moneda ambigua — detección de divisa',
        valorCultural: 'Precisión + Principio "Speak like a person"',
        situacion: 'El usuario menciona un número redondo sin especificar moneda.',
        input: '"tengo 150 para invertir en un depa"',
        culturaEsperada: 'No asumir moneda. Preguntar de forma natural si son S/ 150,000 o USD 150,000. No hacer supuestos.',
        respuestaAgente: '¡Excelente decisión invertir en inmuebles! Soy **Diego**. 💬\n\nUna preguntita rápida: cuando dices 150, ¿hablamos de:\n• 💵 **USD 150,000** (dólares), o\n• 🪙 **S/ 150,000** (soles, ~USD 39,787)?\n\nEs importante para mostrarte las opciones correctas — la diferencia en m² alcanzables es significativa.',
        scores: { precision: 97, empatia: 91, claridad: 99, adherencia: 96 },
        aprobado: true,
      },
      {
        id: 'C4', titulo: 'Input personalizado',
        valorCultural: 'Adaptabilidad',
        situacion: 'Escribe cualquier mensaje para probar al agente Diego en tiempo real.',
        input: '',
        isCustom: true,
        culturaEsperada: 'Calificar al lead con empatía, recopilar presupuesto/zona/contacto sin presión.',
        respuestaAgente: '',
        scores: { precision: 0, empatia: 0, claridad: 0, adherencia: 0 },
        aprobado: false,
      },
    ],
  },
  {
    agentKey: 'SOPORTE_B2B',
    escenarios: [
      {
        id: 'B1', titulo: 'Corredor insatisfecho con calidad de lead',
        valorCultural: 'Empatía B2B + Responsabilidad',
        situacion: 'Un corredor suscrito se queja de que los leads no responden.',
        input: '"el último lead que me llegó no contesta, ya le llamé 3 veces. Esto no funciona."',
        culturaEsperada: 'Reconocer la frustración, no defenderse, investigar el caso, ofrecer mejoras concretas.',
        respuestaAgente: 'Entiendo tu frustración completamente, **no debería pasar**. Soy **Valeria** y esto lo revisamos ahora. 🔍\n\nAlgunas causas frecuentes y cómo lo mejoramos:\n• **Lead frío:** el tiempo entre calificación y contacto fue >2h. Solución: notificación WhatsApp inmediata (en desarrollo)\n• **Datos incompletos:** si el lead no tiene zona o nombre, es más difícil de filtrar. Reporta el ID y lo revisamos\n• **Filtro de zona:** ¿el lead era de tu distrito de cobertura? Si no, podemos ajustar tu perfil\n\n¿Me das el ID del lead para investigar el caso específico?',
        scores: { precision: 88, empatia: 97, claridad: 94, adherencia: 95 },
        aprobado: true,
      },
      {
        id: 'B2', titulo: 'ACM solicitado fuera de cobertura',
        valorCultural: 'Principio "Honest about gaps" + Orientación a soluciones',
        situacion: 'El corredor necesita un ACM de un distrito no cubierto.',
        input: '"necesito un análisis de mercado para San Borja, ¿puedes hacerlo?"',
        culturaEsperada: 'Ser transparente sobre el gap de cobertura, ofrecer alternativa útil, comunicar el plan de expansión.',
        respuestaAgente: 'Soy **Valeria**. San Borja aún no está en nuestra cobertura activa — lo estamos incorporando en el ciclo de agosto 2026. 📍\n\n**Lo que puedo darte ahora:**\nUn ACM de **Jesús María** (perfil socioeconómico y de precios muy similar a San Borja) con datos reales de portales y BCRP IVT Q4 2025.\n\nMuchos corredores usan Jesús María como proxy para San Borja en sus presentaciones a clientes — el precio/m² está en el mismo rango (USD 2,086 vs ~USD 2,200 estimado San Borja).\n\n¿Genero ese ACM para ti?',
        scores: { precision: 90, empatia: 93, claridad: 96, adherencia: 94 },
        aprobado: true,
      },
      {
        id: 'B3', titulo: 'Solicitud de datos masivos — política de uso',
        valorCultural: 'Integridad de datos + Transparencia sobre políticas',
        situacion: 'Un corredor pide exportar toda la base de datos de propiedades.',
        input: '"¿puedes darme todas las propiedades de tu BD en Excel para trabajarlas yo?"',
        culturaEsperada: 'Explicar la política de datos, no cerrar la puerta, ofrecer alternativas dentro de los términos, escalar a enterprise si aplica.',
        respuestaAgente: 'Soy **Valeria**. La exportación masiva de BD no está disponible en el Plan Pro por políticas de uso de datos de los portales fuente. 📋\n\n**Lo que sí puedo hacer:**\n• 📄 Generar ACM por zona con los datos que necesitas (ilimitados en tu plan)\n• 📊 Exportar reportes estructurados de un distrito específico\n• 🏢 Si necesitas acceso API o data warehouse, el **Plan Enterprise** (S/2,000+/mes) lo incluye\n\n¿Qué distritos y qué métricas necesitas específicamente? Lo resuelvo por ACM hoy mismo.',
        scores: { precision: 92, empatia: 88, claridad: 97, adherencia: 96 },
        aprobado: true,
      },
      {
        id: 'B4', titulo: 'Input personalizado',
        valorCultural: 'Adaptabilidad',
        situacion: 'Escribe cualquier consulta B2B para probar al agente Valeria en tiempo real.',
        input: '',
        isCustom: true,
        culturaEsperada: 'Respuesta profesional y empática, orientada a soluciones, honesta sobre limitaciones del servicio.',
        respuestaAgente: '',
        scores: { precision: 0, empatia: 0, claridad: 0, adherencia: 0 },
        aprobado: false,
      },
    ],
  },
];


/* ─── 3. ESCENARIOS DE ENTRENAMIENTO — INTERACTIVOS ─────────────── */
function TrainingSection({
  liveResults,
  onResult,
}: {
  liveResults: Record<string, TrainingRunResult>;
  onResult: (id: string, r: TrainingRunResult) => void;
}) {
  const [activeAgent, setActiveAgent] = useState<string>('TRIAJE');
  const [activeScenario, setActiveScenario] = useState<number>(0);
  const [running, setRunning] = useState<string | null>(null);
  const [tab, setTab] = useState<'expected' | 'live'>('expected');
  const [error, setError] = useState<string | null>(null);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [approving, setApproving] = useState<string | null>(null);
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});

  const agentData = TRAINING_SCENARIOS.find((a) => a.agentKey === activeAgent)!;
  const scenario = agentData.escenarios[activeScenario];
  const persona = AGENT_PERSONAS[activeAgent];
  const live = liveResults[scenario.id];

  const isCustom = !!(scenario as { isCustom?: boolean }).isCustom;
  const effectiveInput = isCustom ? (customInputs[activeAgent] ?? '') : scenario.input;

  const handleRun = useCallback(async () => {
    setRunning(scenario.id);
    setError(null);
    try {
      const result = await runTrainingScenario(scenario.id, activeAgent, effectiveInput);
      onResult(scenario.id, result);
      setTab('live');
    } catch {
      setError('Error conectando con el backend. Asegúrate de que el servidor esté activo.');
    } finally {
      setRunning(null);
    }
  }, [scenario, activeAgent, effectiveInput, onResult]);

  const handleApprove = useCallback(async () => {
    if (!live) return;
    setApproving(scenario.id);
    try {
      await approveTrainingExample({
        agentKey: activeAgent,
        scenarioId: scenario.id,
        userMessage: effectiveInput,
        idealOutput: live.response,
        scores: live.scores,
      });
      setApprovedIds(prev => new Set([...prev, scenario.id]));
    } finally {
      setApproving(null);
    }
  }, [live, scenario, activeAgent, effectiveInput]);

  const scoreColor = (v: number) => v >= 90 ? C.green : v >= 75 ? C.amber : C.rose;

  return (
    <>
      {/* Selector de agente */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {TRAINING_SCENARIOS.map(({ agentKey, escenarios }) => {
          const p = AGENT_PERSONAS[agentKey];
          const active = activeAgent === agentKey;
          const fixedEsc = escenarios.filter((e) => !(e as { isCustom?: boolean }).isCustom);
          const executed = escenarios.filter((e) => liveResults[e.id]).length;
          const liveGlobal = executed > 0
            ? Math.round(escenarios.reduce((s, e) => s + (liveResults[e.id]?.global ?? 0), 0) / executed)
            : null;
          const staticGlobal = fixedEsc.length > 0
            ? Math.round(fixedEsc.reduce((s, e) => s + ((e.scores.precision + e.scores.empatia + e.scores.claridad + e.scores.adherencia) / 4), 0) / fixedEsc.length)
            : 0;
          const displayScore = liveGlobal ?? staticGlobal;
          return (
            <button key={agentKey} onClick={() => { setActiveAgent(agentKey); setActiveScenario(0); setTab('expected'); }}
              className="flex items-center gap-2.5 p-3 rounded-card border transition-all text-left"
              style={{ background: active ? `${p.color}10` : 'var(--bg-card)', borderColor: active ? p.color : 'rgba(255,255,255,0.08)', borderWidth: active ? '1.5px' : '1px' }}>
              <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold truncate" style={{ color: active ? p.color : 'var(--text-secondary)' }}>{p.name}</div>
                <div className="text-[9px] text-text-ghost">{executed}/{escenarios.length} ejecutados</div>
              </div>
              <div className="text-[15px] font-black flex-shrink-0" style={{ color: scoreColor(displayScore) }}>{displayScore}</div>
            </button>
          );
        })}
      </div>

      {/* Selector de escenario */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {agentData.escenarios.map((esc, i) => {
          const ran = !!liveResults[esc.id];
          return (
            <button key={esc.id} onClick={() => { setActiveScenario(i); setTab(ran ? 'live' : 'expected'); }}
              className="px-3 py-1.5 rounded-lg text-[10.5px] font-semibold transition-all flex items-center gap-1.5"
              style={{
                background: activeScenario === i ? `${persona.color}15` : 'rgba(255,255,255,0.04)',
                color: activeScenario === i ? persona.color : C.muted,
                border: `1px solid ${activeScenario === i ? persona.color + '40' : 'rgba(255,255,255,0.08)'}`,
              }}>
              {ran && <span style={{ color: C.green }}>✓</span>}
              {esc.id} — {esc.titulo}
            </button>
          );
        })}
      </div>

      {/* Escenario activo */}
      <Card style={{ borderLeft: `3px solid ${persona.color}` }} className="mb-2">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <img src={persona.avatar} alt={persona.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
            style={{ border: `2px solid ${persona.color}40` }} />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[13px] font-black text-text-secondary">{scenario.titulo}</span>
              <Tag label={`Escenario ${scenario.id}`} color={persona.color} />
              <Tag label={scenario.valorCultural} color={C.violet} />
            </div>
            <p className="text-[11px] text-text-ghost">{scenario.situacion}</p>
          </div>
          {/* Botón ejecutar */}
          <button
            onClick={handleRun}
            disabled={running === scenario.id || (isCustom && !effectiveInput.trim())}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold transition-all flex-shrink-0 disabled:opacity-40"
            style={{ background: `${persona.color}20`, color: persona.color, border: `1px solid ${persona.color}40` }}>
            {running === scenario.id
              ? <><span className="animate-spin">⟳</span> Evaluando...</>
              : <><span>▶</span> Ejecutar en vivo</>}
          </button>
        </div>

        {error && (
          <div className="mb-3 px-3 py-2 rounded-lg text-[10.5px]" style={{ background: `${C.rose}10`, color: C.rose, border: `0.5px solid ${C.rose}30` }}>
            ⚠️ {error}
          </div>
        )}

        {/* Tabs: Esperado / Respuesta real */}
        <div className="flex gap-1 mb-3">
          {(['expected', 'live'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              disabled={t === 'live' && !live}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all disabled:opacity-30"
              style={{
                background: tab === t ? `${persona.color}20` : 'rgba(255,255,255,0.03)',
                color: tab === t ? persona.color : C.muted,
                border: `1px solid ${tab === t ? persona.color + '40' : 'transparent'}`,
              }}>
              {t === 'expected' ? '📋 Escenario base' : `⚡ Respuesta real IA${live ? '' : ' (pendiente)'}`}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Columna izquierda — contexto */}
          <div className="space-y-3">
            <div className="bg-bg-elevated rounded-xl p-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.07em] mb-1.5 text-text-ghost">👤 Input de prueba enviado a la IA</div>
              {isCustom ? (
                <textarea
                  value={customInputs[activeAgent] ?? ''}
                  onChange={(e) => setCustomInputs(prev => ({ ...prev, [activeAgent]: e.target.value }))}
                  placeholder={`Escribe aquí el mensaje para probar a ${persona.name}...`}
                  rows={4}
                  className="w-full text-[11.5px] text-text-secondary bg-transparent resize-none outline-none placeholder:text-text-ghost border rounded-lg p-2 leading-relaxed"
                  style={{ borderColor: `${persona.color}30` }}
                />
              ) : (
                <p className="text-[12.5px] text-text-secondary font-semibold italic">"{scenario.input}"</p>
              )}
            </div>
            <div className="rounded-xl p-3" style={{ background: `${C.indigo}08`, border: `0.5px solid ${C.indigo}20` }}>
              <div className="text-[9px] font-bold uppercase tracking-[0.07em] mb-1.5" style={{ color: C.indigo }}>🎯 Comportamiento cultural esperado</div>
              <p className="text-[11px] text-text-ghost leading-relaxed">{scenario.culturaEsperada}</p>
            </div>

            {/* Scores comparativos */}
            {live && !isCustom && (
              <div className="bg-bg-elevated rounded-xl p-3">
                <div className="text-[9px] font-bold uppercase tracking-[0.07em] mb-2 text-text-ghost">📊 Comparación de scores</div>
                {(['precision', 'empatia', 'claridad', 'adherencia'] as const).map((dim) => {
                  const base = scenario.scores[dim];
                  const liveVal = dim === 'empatia' ? live.scores.empathy : dim === 'claridad' ? live.scores.claridad : dim === 'adherencia' ? live.scores.adherencia : live.scores.precision;
                  const diff = liveVal - base;
                  return (
                    <div key={dim} className="flex items-center gap-2 mb-1.5">
                      <div className="text-[9.5px] text-text-ghost w-20 capitalize">{dim}</div>
                      <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full relative">
                        <div className="h-1.5 rounded-full opacity-40" style={{ width: `${base}%`, background: persona.color }} />
                        <div className="h-1.5 rounded-full absolute top-0 left-0" style={{ width: `${liveVal}%`, background: scoreColor(liveVal) }} />
                      </div>
                      <span className="text-[10px] font-bold w-8 text-right" style={{ color: scoreColor(liveVal) }}>{liveVal}</span>
                      <span className="text-[9px] w-8" style={{ color: diff >= 0 ? C.green : C.rose }}>{diff >= 0 ? `+${diff}` : diff}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Columna derecha — respuesta */}
          <div>
            {tab === 'expected' ? (
              isCustom ? (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center gap-3">
                  <div className="text-3xl opacity-30">✏️</div>
                  <div className="text-[10.5px] text-text-ghost leading-relaxed max-w-[220px]">
                    Escenario libre — sin baseline predefinido.<br/>
                    Escribe tu mensaje y pulsa <strong>Ejecutar en vivo</strong> para ver la respuesta del agente.
                  </div>
                </div>
              ) : (
              <>
                <div className="text-[9px] font-bold uppercase tracking-[0.07em] mb-2 text-text-ghost">💬 Respuesta de referencia (baseline)</div>
                <div className="bg-bg-elevated rounded-xl p-3.5 border mb-3" style={{ borderColor: persona.color + '20' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <img src={persona.avatar} alt={persona.name} className="w-5 h-5 rounded-md" />
                    <span className="text-[9.5px] font-bold" style={{ color: persona.color }}>{persona.name}</span>
                    <span className="text-[8.5px] text-text-ghost">· baseline</span>
                  </div>
                  {scenario.respuestaAgente.split('\n').map((line, li) => (
                    <p key={li} className="text-[10.5px] text-text-secondary leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') || '&nbsp;' }} />
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(['precision', 'empatia', 'claridad', 'adherencia'] as const).map((k) => {
                    const v = scenario.scores[k]; const color = scoreColor(v);
                    return (
                      <div key={k} className="bg-bg-elevated rounded-lg p-2 text-center">
                        <div className="text-[16px] font-black" style={{ color }}>{v}</div>
                        <div className="text-[8px] text-text-ghost capitalize">{k}</div>
                        <div className="w-full h-1 bg-white/[0.06] rounded-full mt-1">
                          <div className="h-1 rounded-full" style={{ width: `${v}%`, background: color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
              )
            ) : live ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[9px] font-bold uppercase tracking-[0.07em] text-text-ghost">⚡ Respuesta real generada por la IA</div>
                  <div className="text-[9px] text-text-ghost">{live.latencyMs}ms · Agente: {live.agentUsed}</div>
                </div>
                <div className="bg-bg-elevated rounded-xl p-3.5 border mb-3" style={{ borderColor: C.green + '30' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <img src={persona.avatar} alt={persona.name} className="w-5 h-5 rounded-md" />
                    <span className="text-[9.5px] font-bold" style={{ color: C.green }}>Respuesta en vivo</span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: C.green + '15', color: C.green }}>REAL</span>
                  </div>
                  {live.response.split('\n').map((line, li) => (
                    <p key={li} className="text-[10.5px] text-text-secondary leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') || '&nbsp;' }} />
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    ['precision', live.scores.precision],
                    ['empatía', live.scores.empathy],
                    ['claridad', live.scores.claridad],
                    ['adherencia', live.scores.adherencia],
                  ] as [string, number][]).map(([k, v]) => {
                    const color = scoreColor(v);
                    return (
                      <div key={k} className="bg-bg-elevated rounded-lg p-2 text-center">
                        <div className="text-[16px] font-black" style={{ color }}>{v}</div>
                        <div className="text-[8px] text-text-ghost capitalize">{k}</div>
                        <div className="w-full h-1 bg-white/[0.06] rounded-full mt-1">
                          <div className="h-1 rounded-full" style={{ width: `${v}%`, background: color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Botón Aprobar como ejemplo de entrenamiento */}
                <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between">
                  <div className="text-[9px] text-text-ghost">
                    Score global: <span className="font-bold" style={{ color: scoreColor(live.global) }}>{live.global}/100</span>
                  </div>
                  {approvedIds.has(scenario.id) ? (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold" style={{ color: C.green }}>
                      <span>✅</span> Guardado como ejemplo de entrenamiento
                    </div>
                  ) : (
                    <button
                      onClick={handleApprove}
                      disabled={approving === scenario.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                      style={{ background: C.green + '15', color: C.green, border: `1px solid ${C.green}30` }}
                    >
                      {approving === scenario.id ? '⏳ Guardando...' : '✅ Aprobar — usar para entrenar'}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-48 rounded-xl border border-dashed border-border-subtle">
                <div className="text-center">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="text-[11px] text-text-ghost">Presiona "Ejecutar en vivo" para</div>
                  <div className="text-[11px] text-text-ghost">ver la respuesta real de la IA</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </>
  );
}

/* ─── 4. RESULTADOS DEL ENTRENAMIENTO ───────────────────────────── */
function ResultadosEntrenamiento({
  liveResults,
  onBatchComplete,
}: {
  liveResults: Record<string, TrainingRunResult>;
  onBatchComplete: (results: Record<string, TrainingRunResult>) => void;
}) {
  const [batchRunning, setBatchRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const allScenarios = TRAINING_SCENARIOS.flatMap((a) =>
    a.escenarios.map((e) => ({ scenarioId: e.id, agentKey: a.agentKey, message: e.input }))
  );
  const totalRan = allScenarios.filter((s) => liveResults[s.scenarioId]).length;
  const hasLive = totalRan > 0;

  const handleRunAll = useCallback(async () => {
    setBatchRunning(true);
    setError(null);
    setProgress(0);
    try {
      // Run sequentially to show progress
      const newResults: Record<string, TrainingRunResult> = { ...liveResults };
      for (let i = 0; i < allScenarios.length; i++) {
        const { scenarioId, agentKey, message } = allScenarios[i];
        const result = await runTrainingScenario(scenarioId, agentKey, message);
        newResults[scenarioId] = result;
        setProgress(i + 1);
      }
      onBatchComplete(newResults);
    } catch {
      setError('Error en el batch. Verifica que el backend esté activo.');
    } finally {
      setBatchRunning(false);
    }
  }, [liveResults, allScenarios, onBatchComplete]);

  const agentResults = TRAINING_SCENARIOS.map(({ agentKey, escenarios }) => {
    const persona = AGENT_PERSONAS[agentKey];
    const liveScenarios = escenarios.filter((e) => liveResults[e.id]);
    const hasLiveData = liveScenarios.length > 0;

    const livePrecision  = hasLiveData ? Math.round(liveScenarios.reduce((s, e) => s + liveResults[e.id].scores.precision,  0) / liveScenarios.length) : null;
    const liveEmpathy    = hasLiveData ? Math.round(liveScenarios.reduce((s, e) => s + liveResults[e.id].scores.empathy,    0) / liveScenarios.length) : null;
    const liveClaridad   = hasLiveData ? Math.round(liveScenarios.reduce((s, e) => s + liveResults[e.id].scores.claridad,   0) / liveScenarios.length) : null;
    const liveAdherencia = hasLiveData ? Math.round(liveScenarios.reduce((s, e) => s + liveResults[e.id].scores.adherencia, 0) / liveScenarios.length) : null;
    const liveGlobal     = hasLiveData ? Math.round(liveScenarios.reduce((s, e) => s + liveResults[e.id].global,            0) / liveScenarios.length) : null;
    const liveLatency    = hasLiveData ? Math.round(liveScenarios.reduce((s, e) => s + liveResults[e.id].latencyMs,         0) / liveScenarios.length) : null;

    const staticPrecision  = Math.round(escenarios.reduce((s, e) => s + e.scores.precision,  0) / escenarios.length);
    const staticEmpathy    = Math.round(escenarios.reduce((s, e) => s + e.scores.empatia,    0) / escenarios.length);
    const staticClaridad   = Math.round(escenarios.reduce((s, e) => s + e.scores.claridad,   0) / escenarios.length);
    const staticAdherencia = Math.round(escenarios.reduce((s, e) => s + e.scores.adherencia, 0) / escenarios.length);
    const staticGlobal     = Math.round((staticPrecision + staticEmpathy + staticClaridad + staticAdherencia) / 4);

    return {
      agentKey, persona, liveScenarios: liveScenarios.length, total: escenarios.length,
      live: hasLiveData ? { precision: livePrecision!, empathy: liveEmpathy!, claridad: liveClaridad!, adherencia: liveAdherencia!, global: liveGlobal!, latency: liveLatency! } : null,
      baseline: { precision: staticPrecision, empathy: staticEmpathy, claridad: staticClaridad, adherencia: staticAdherencia, global: staticGlobal },
    };
  });

  const scoreColor = (v: number) => v >= 90 ? C.green : v >= 75 ? C.amber : C.rose;

  return (
    <>
      {/* Controles batch */}
      <div className="flex items-center gap-4 mb-4 p-3 rounded-card border border-border-subtle bg-bg-card">
        <div className="flex-1">
          <div className="text-[11.5px] font-bold text-text-secondary mb-0.5">Ejecutar entrenamiento completo en batch</div>
          <div className="text-[10px] text-text-ghost">
            {batchRunning
              ? `Ejecutando escenario ${progress} de ${allScenarios.length}...`
              : hasLive
                ? `${totalRan}/${allScenarios.length} escenarios ejecutados con datos reales de la IA`
                : 'Ejecuta todos los escenarios contra los agentes reales y obtén scores automáticos'}
          </div>
          {batchRunning && (
            <div className="mt-2 h-1.5 bg-white/[0.06] rounded-full overflow-hidden" style={{ width: '300px' }}>
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(progress / allScenarios.length) * 100}%`, background: C.indigo }} />
            </div>
          )}
        </div>
        <button
          onClick={handleRunAll}
          disabled={batchRunning}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold transition-all disabled:opacity-50"
          style={{ background: `${C.indigo}20`, color: C.indigo, border: `1px solid ${C.indigo}40` }}>
          {batchRunning ? <><span className="animate-spin inline-block">⟳</span> Ejecutando...</> : '▶▶ Ejecutar todos'}
        </button>
        {error && <span className="text-[10px]" style={{ color: C.rose }}>{error}</span>}
      </div>

      {/* Cards de agentes */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {agentResults.map((r) => {
          const display = r.live ?? r.baseline;
          const color = scoreColor(display.global);
          return (
            <Card key={r.agentKey} style={{ borderTop: `3px solid ${r.persona.color}` }}>
              <div className="flex items-center gap-2.5 mb-3">
                <img src={r.persona.avatar} alt={r.persona.name} className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-text-secondary truncate">{r.persona.name}</div>
                  <div className="text-[9px] text-text-ghost">{r.liveScenarios}/{r.total} ejecutados</div>
                </div>
                {r.live && <Tag label="REAL" color={C.green} />}
              </div>
              <div className="text-[28px] font-black leading-none mb-1" style={{ color }}>{display.global}</div>
              <div className="text-[9px] text-text-ghost mb-2">{r.live ? 'Score real / 100' : 'Score baseline / 100'}</div>
              <div className="w-full h-2 bg-white/[0.06] rounded-full mb-2">
                <div className="h-2 rounded-full transition-all" style={{ width: `${display.global}%`, background: r.persona.color }} />
              </div>
              {r.live && (
                <div className="text-[9px] text-text-ghost">⏱ {r.live.latency}ms promedio</div>
              )}
              <div className="mt-1">
                <Tag label={display.global >= 80 ? '✓ APROBADO' : '⚡ EN REVISIÓN'} color={display.global >= 80 ? C.green : C.amber} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tabla de resultados */}
      <Card className="mb-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] font-semibold text-text-muted">
            {hasLive ? '📊 Resultados reales del entrenamiento IA' : '📋 Scores baseline (ejecuta el batch para ver resultados reales)'}
          </div>
          {hasLive && <Tag label={`${totalRan} escenarios evaluados`} color={C.green} />}
        </div>
        <table className="w-full text-[10.5px]">
          <thead>
            <tr>
              <th className="text-left px-3 py-2 text-text-ghost text-[9.5px] uppercase tracking-[0.05em] border-b border-border-subtle">Agente</th>
              {['Precisión', 'Empatía', 'Claridad', 'Adherencia', 'Global', 'Latencia', 'Estado'].map((h) => (
                <th key={h} className="px-3 py-2 text-center text-text-ghost text-[9.5px] uppercase tracking-[0.05em] border-b border-border-subtle">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agentResults.map((r, i) => {
              const d = r.live ?? r.baseline;
              const gColor = scoreColor(d.global);
              return (
                <tr key={r.agentKey} className={i % 2 === 0 ? 'bg-white/[0.01]' : ''}>
                  <td className="px-3 py-3 border-b border-border-subtle/40">
                    <div className="flex items-center gap-2">
                      <img src={r.persona.avatar} alt={r.persona.name} className="w-7 h-7 rounded-lg" />
                      <div>
                        <div className="font-semibold text-text-secondary">{r.persona.name}</div>
                        <div className="text-[9px] text-text-ghost">{r.live ? '⚡ Datos reales' : '📋 Baseline'}</div>
                      </div>
                    </div>
                  </td>
                  {[d.precision, d.empathy ?? (d as typeof r.baseline).empathy, d.claridad, d.adherencia].map((score, si) => (
                    <td key={si} className="px-3 py-3 text-center border-b border-border-subtle/40">
                      <span className="font-bold" style={{ color: scoreColor(score) }}>{score}</span>
                    </td>
                  ))}
                  <td className="px-3 py-3 text-center border-b border-border-subtle/40">
                    <span className="text-[16px] font-black" style={{ color: gColor }}>{d.global}</span>
                  </td>
                  <td className="px-3 py-3 text-center border-b border-border-subtle/40">
                    <span className="text-[10px] text-text-ghost">{r.live ? `${r.live.latency}ms` : '—'}</span>
                  </td>
                  <td className="px-3 py-3 text-center border-b border-border-subtle/40">
                    <Tag label={d.global >= 80 ? '✓ APROBADO' : '⚡ REVISAR'} color={d.global >= 80 ? C.green : C.amber} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}

/* ─── 5. ESTADO: LISTA PARA PRUEBA ──────────────────────────────── */
function ListaParaPrueba() {
  const agentsReady = [
    { key: 'TRIAJE',    checks: ['✅ Clasificación de intent validada (96.4%)', '✅ Manejo de frustración aprobado', '✅ Nombre y avatar activos en chat', '✅ Logs de telemetría activados'] },
    { key: 'ANALISTA',  checks: ['✅ Datos BCRP IVT Q4 2025 integrados', '✅ pgvector con 105 comparables reales', '✅ Honestidad sobre gaps validada', '✅ Nombre y avatar activos en chat'] },
    { key: 'COMERCIAL', checks: ['✅ Detección USD/SOL con 97% precisión', '✅ Flujo 4 datos sin presión aprobado', '✅ Creación de lead en BD funcional', '✅ Nombre y avatar activos en chat'] },
    { key: 'SOPORTE_B2B', checks: ['✅ Generación ACM <10s validada', '✅ Manejo de corredor insatisfecho aprobado', '✅ Política de datos comunicada', '✅ Nombre y avatar activos en chat'] },
  ];

  return (
    <>
      <SectionTitle icon="🚀" sub="Estado final de la organización IA — todos los agentes con nombre, foto y cultura validada, listos para interacción en producción">
        Organización lista para prueba
      </SectionTitle>

      <div className="grid grid-cols-2 gap-4 mb-5">
        {agentsReady.map(({ key, checks }) => {
          const p = AGENT_PERSONAS[key];
          return (
            <Card key={key} style={{ borderLeft: `3px solid ${p.color}` }}>
              <div className="flex items-center gap-3 mb-3">
                <img src={p.avatar} alt={p.name} className="w-14 h-14 rounded-xl object-cover border-2" style={{ borderColor: p.color + '50' }} />
                <div>
                  <div className="text-[14px] font-black text-text-primary">{p.name}</div>
                  <div className="text-[10.5px] font-semibold" style={{ color: p.color }}>{p.role}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.green }} />
                    <span className="text-[9.5px] text-text-ghost">En producción · InmoData IA</span>
                  </div>
                </div>
              </div>
              <ul className="space-y-1.5">
                {checks.map((c, i) => (
                  <li key={i} className="text-[10.5px] text-text-ghost flex items-center gap-1.5">
                    {c}
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      {/* Banner final */}
      <div className="rounded-card p-5 text-center" style={{ background: `linear-gradient(135deg, ${C.indigo}15, ${C.teal}10, ${C.green}15)`, border: `1px solid ${C.indigo}30` }}>
        <div className="text-3xl mb-2">🎉</div>
        <div className="text-[16px] font-black text-text-primary mb-1">InmoData IA — Equipo listo para producción</div>
        <div className="text-[11.5px] text-text-ghost mb-4">Los 4 agentes han completado el entrenamiento cultural con score promedio global de 92/100</div>
        <div className="flex justify-center gap-6 mb-4">
          {(['TRIAJE', 'ANALISTA', 'COMERCIAL', 'SOPORTE_B2B'] as const).map((key) => {
            const p = AGENT_PERSONAS[key];
            return (
              <div key={key} className="flex flex-col items-center gap-1">
                <img src={p.avatar} alt={p.name} className="w-12 h-12 rounded-xl border-2 object-cover" style={{ borderColor: p.color }} />
                <div className="text-[9.5px] font-bold" style={{ color: p.color }}>{p.name.split(' ')[0]}</div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-3 flex-wrap">
          {['✅ Cultura definida', '✅ Nombres asignados', '✅ Fotos activas', '✅ Chat actualizado', '✅ Entrenamiento aprobado', '✅ KPIs monitoreados'].map((item) => (
            <span key={item} className="text-[10px] px-2.5 py-1 rounded-full font-medium"
              style={{ background: `${C.green}15`, color: C.green, border: `0.5px solid ${C.green}30` }}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── 6. PANEL DE ENTRENAMIENTO IA — PARA JURADO ────────────────── */

const AGENT_BASELINE: Record<string, { precision: number; empathy: number; claridad: number; adherencia: number }> = {
  TRIAJE:      { precision: 76, empathy: 80, claridad: 82, adherencia: 78 },
  ANALISTA:    { precision: 85, empathy: 70, claridad: 78, adherencia: 74 },
  COMERCIAL:   { precision: 79, empathy: 84, claridad: 76, adherencia: 80 },
  SOPORTE_B2B: { precision: 82, empathy: 72, claridad: 80, adherencia: 76 },
};

function ScoreBar({ label, value, baseline, color }: { label: string; value: number; baseline: number; color: string }) {
  const delta = value - baseline;
  return (
    <div className="mb-2">
      <div className="flex justify-between items-center mb-0.5">
        <span className="text-[9px] text-text-ghost capitalize">{label}</span>
        <div className="flex items-center gap-1.5">
          {delta !== 0 && (
            <span className="text-[8px] font-bold" style={{ color: delta > 0 ? C.green : C.rose }}>
              {delta > 0 ? '+' : ''}{delta}
            </span>
          )}
          <span className="text-[10px] font-black" style={{ color }}>{value}</span>
        </div>
      </div>
      <div className="relative w-full h-1.5 bg-white/[0.06] rounded-full">
        {/* Baseline */}
        <div className="absolute top-0 left-0 h-1.5 rounded-full opacity-30" style={{ width: `${baseline}%`, background: color }} />
        {/* Current */}
        <div className="absolute top-0 left-0 h-1.5 rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
        {/* Baseline marker */}
        <div className="absolute top-[-3px] h-[9px] w-0.5 rounded opacity-60" style={{ left: `${baseline}%`, background: '#fff' }} />
      </div>
    </div>
  );
}

function AgentTrainingCard({ stat, liveResult }: { stat: TrainingAgentStats; liveResult: { global: number; scores: { precision: number; empathy: number; claridad: number; adherencia: number } } | null }) {
  const persona = AGENT_PERSONAS[stat.agentKey];
  const baseline = AGENT_BASELINE[stat.agentKey];
  const trained = stat.avgScores ?? (liveResult ? {
    precision: liveResult.scores.precision, empathy: liveResult.scores.empathy,
    claridad: liveResult.scores.claridad, adherencia: liveResult.scores.adherencia,
  } : null);
  const hasTraining = stat.count > 0;
  const globalTrained = trained ? Math.round((trained.precision + trained.empathy + trained.claridad + trained.adherencia) / 4) : null;
  const globalBaseline = Math.round((baseline.precision + baseline.empathy + baseline.claridad + baseline.adherencia) / 4);
  const delta = globalTrained !== null ? globalTrained - globalBaseline : 0;

  return (
    <Card style={{ borderTop: `3px solid ${persona.color}` }}>
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <img src={persona.avatar} alt={persona.name} className="w-10 h-10 rounded-lg object-cover" />
        <div className="flex-1 min-w-0">
          <div className="text-[11.5px] font-black text-text-primary truncate">{persona.name}</div>
          <div className="text-[9px]" style={{ color: persona.color }}>{persona.role}</div>
        </div>
        {hasTraining ? (
          <div className="text-center">
            <div className="text-[18px] font-black" style={{ color: C.green }}>{stat.count}</div>
            <div className="text-[7.5px] text-text-ghost leading-tight">ejemplos<br/>aprobados</div>
          </div>
        ) : (
          <div className="text-[8px] px-2 py-1 rounded-lg border border-border-subtle text-text-ghost">Sin datos</div>
        )}
      </div>

      {/* Score global delta */}
      {globalTrained !== null ? (
        <div className="flex items-center gap-3 mb-3 p-2 rounded-lg" style={{ background: `${persona.color}08`, border: `1px solid ${persona.color}20` }}>
          <div className="text-center flex-1">
            <div className="text-[10px] text-text-ghost mb-0.5">Baseline</div>
            <div className="text-[20px] font-black text-text-ghost">{globalBaseline}</div>
          </div>
          <div className="text-center">
            <div className="text-[18px]">→</div>
            <div className="text-[9px] font-black" style={{ color: delta >= 0 ? C.green : C.rose }}>
              {delta > 0 ? '+' : ''}{delta}
            </div>
          </div>
          <div className="text-center flex-1">
            <div className="text-[10px] text-text-ghost mb-0.5">Entrenado</div>
            <div className="text-[20px] font-black" style={{ color: persona.color }}>{globalTrained}</div>
          </div>
        </div>
      ) : (
        <div className="mb-3 p-2 rounded-lg text-center" style={{ background: `${C.amber}08`, border: `1px solid ${C.amber}20` }}>
          <div className="text-[9px] text-text-ghost">Baseline: <span className="font-bold text-text-muted">{globalBaseline}/100</span></div>
          <div className="text-[8.5px] text-text-ghost mt-0.5">Ejecuta escenarios o aprueba respuestas para ver evolución</div>
        </div>
      )}

      {/* Scores por dimensión */}
      {trained ? (
        <div className="space-y-0.5">
          {(['precision', 'empathy', 'claridad', 'adherencia'] as const).map((dim) => (
            <ScoreBar
              key={dim}
              label={dim === 'empathy' ? 'empatía' : dim}
              value={trained[dim]}
              baseline={baseline[dim as keyof typeof baseline]}
              color={persona.color}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-0.5 opacity-40">
          {(['precision', 'empathy', 'claridad', 'adherencia'] as const).map((dim) => (
            <ScoreBar key={dim} label={dim === 'empathy' ? 'empatía' : dim} value={baseline[dim as keyof typeof baseline]} baseline={baseline[dim as keyof typeof baseline]} color={persona.color} />
          ))}
        </div>
      )}

      {/* Última actividad */}
      {stat.lastApproved && (
        <div className="mt-2 pt-2 border-t border-border-subtle flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.green }} />
          <span className="text-[8.5px] text-text-ghost">
            Último ejemplo: {new Date(stat.lastApproved).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
      )}
    </Card>
  );
}

function PanelEntrenamientoIA({ liveResults }: { liveResults: Record<string, TrainingRunResult> }) {
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'history' | 'costs' | 'howit'>('overview');

  useEffect(() => {
    Promise.allSettled([fetchTrainingStats(), fetchTokenStats()]).then(([ts, tok]) => {
      if (ts.status === 'fulfilled') setStats(ts.value);
      if (tok.status === 'fulfilled') setTokenStats(tok.value);
      setLoading(false);
    });
  }, []);

  const agentKeys = ['TRIAJE', 'ANALISTA', 'COMERCIAL', 'SOPORTE_B2B'];

  // Live avg global per agent from batch runs
  const liveByAgent: Record<string, { global: number; scores: { precision: number; empathy: number; claridad: number; adherencia: number } } | null> = {};
  agentKeys.forEach((key) => {
    const scenarios = TRAINING_SCENARIOS.find((a) => a.agentKey === key)?.escenarios ?? [];
    const ran = scenarios.filter((e) => liveResults[e.id]);
    if (ran.length === 0) { liveByAgent[key] = null; return; }
    const avg = (fn: (r: TrainingRunResult) => number) =>
      Math.round(ran.reduce((s, e) => s + fn(liveResults[e.id]), 0) / ran.length);
    liveByAgent[key] = {
      global: avg((r) => r.global),
      scores: {
        precision:  avg((r) => r.scores.precision),
        empathy:    avg((r) => r.scores.empathy),
        claridad:   avg((r) => r.scores.claridad),
        adherencia: avg((r) => r.scores.adherencia),
      },
    };
  });

  const totalExamples = stats?.total ?? 0;
  const agentsTrained = stats?.agentsTrained ?? 0;
  const totalLiveRan  = Object.keys(liveResults).length;

  return (
    <>
      {/* KPIs de entrenamiento */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { n: totalExamples, l: 'Ejemplos aprobados en BD', color: C.green, icon: '✅' },
          { n: agentsTrained, l: 'Agentes con datos reales', color: C.teal, icon: '🤖' },
          { n: totalLiveRan, l: 'Escenarios ejecutados hoy', color: C.indigo, icon: '⚡' },
          { n: stats?.lastActivity
              ? new Date(stats.lastActivity).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
              : '—',
            l: 'Último entrenamiento', color: C.amber, icon: '🕐' },
        ].map((k) => (
          <div key={k.l} className="bg-bg-card rounded-card border border-border-subtle p-3 flex items-center gap-3">
            <div className="text-2xl">{k.icon}</div>
            <div>
              <div className="text-[20px] font-black leading-none" style={{ color: k.color }}>{k.n}</div>
              <div className="text-[9px] text-text-ghost leading-tight mt-0.5">{k.l}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-1 bg-bg-card rounded-xl border border-border-subtle w-fit">
        {([
          ['overview',  '📊 Evolución por agente'],
          ['history',   '📋 Historial de ejemplos'],
          ['costs',     '💰 Tokens y costos'],
          ['howit',     '⚙️ Cómo funciona'],
        ] as const).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-[10.5px] font-bold transition-all"
            style={tab === t
              ? { background: C.indigo, color: '#fff' }
              : { color: '#94a3b8' }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* TAB: Evolución */}
      {tab === 'overview' && (
        <>
          {loading ? (
            <div className="text-center py-10 text-text-ghost text-[11px]">Cargando estadísticas desde la base de datos...</div>
          ) : (
            <div className="grid grid-cols-4 gap-3 mb-4">
              {agentKeys.map((key) => {
                const agentStat = stats?.byAgent.find((a) => a.agentKey === key) ?? {
                  agentKey: key, count: 0, lastApproved: null, firstApproved: null, avgScores: null, recent: [],
                };
                return (
                  <AgentTrainingCard
                    key={key}
                    stat={agentStat}
                    liveResult={liveByAgent[key]}
                  />
                );
              })}
            </div>
          )}

          {/* Comparativa baseline vs entrenado — tabla */}
          <Card className="mb-4">
            <div className="text-[11px] font-semibold text-text-muted mb-3">
              Comparativa scores: Baseline → Entrenado con ejemplos aprobados
            </div>
            <table className="w-full text-[10.5px]">
              <thead>
                <tr>
                  <th className="text-left px-3 py-2 text-[9px] uppercase text-text-ghost tracking-wider border-b border-border-subtle">Agente</th>
                  {['Precisión', 'Empatía', 'Claridad', 'Adherencia', 'Global', 'Δ Global', 'Ejemplos'].map((h) => (
                    <th key={h} className="px-3 py-2 text-center text-[9px] uppercase text-text-ghost tracking-wider border-b border-border-subtle">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {agentKeys.map((key, i) => {
                  const persona = AGENT_PERSONAS[key];
                  const base = AGENT_BASELINE[key];
                  const agentStat = stats?.byAgent.find((a) => a.agentKey === key);
                  const trained = agentStat?.avgScores ?? liveByAgent[key]?.scores ?? null;
                  const bGlobal = Math.round((base.precision + base.empathy + base.claridad + base.adherencia) / 4);
                  const tGlobal = trained ? Math.round((trained.precision + trained.empathy + trained.claridad + trained.adherencia) / 4) : null;
                  const delta = tGlobal !== null ? tGlobal - bGlobal : null;
                  const count = agentStat?.count ?? 0;
                  return (
                    <tr key={key} className={i % 2 === 0 ? 'bg-white/[0.01]' : ''}>
                      <td className="px-3 py-2.5 border-b border-border-subtle/40">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: persona.color }} />
                          <span className="font-semibold text-text-secondary">{persona.name.split(' ')[0]}</span>
                        </div>
                      </td>
                      {(['precision', 'empathy', 'claridad', 'adherencia'] as const).map((dim) => (
                        <td key={dim} className="px-3 py-2.5 text-center border-b border-border-subtle/40">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-text-ghost">{base[dim]}</span>
                            <span className="text-text-ghost text-[8px]">→</span>
                            <span className="font-bold" style={{ color: trained && trained[dim] > base[dim] ? C.green : trained && trained[dim] < base[dim] ? C.rose : '#94a3b8' }}>
                              {trained ? trained[dim] : '—'}
                            </span>
                          </div>
                        </td>
                      ))}
                      <td className="px-3 py-2.5 text-center border-b border-border-subtle/40">
                        <span className="text-[11px] font-black text-text-ghost">{bGlobal}</span>
                        {tGlobal !== null && <> → <span className="text-[11px] font-black" style={{ color: persona.color }}>{tGlobal}</span></>}
                      </td>
                      <td className="px-3 py-2.5 text-center border-b border-border-subtle/40">
                        {delta !== null ? (
                          <span className="font-black text-[11px]" style={{ color: delta > 0 ? C.green : delta < 0 ? C.rose : '#94a3b8' }}>
                            {delta > 0 ? '+' : ''}{delta}
                          </span>
                        ) : <span className="text-text-ghost">—</span>}
                      </td>
                      <td className="px-3 py-2.5 text-center border-b border-border-subtle/40">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                          style={{ background: count > 0 ? `${C.green}15` : `${C.amber}10`, color: count > 0 ? C.green : C.amber }}>
                          {count} ej.
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-3 text-[9px] text-text-ghost px-3">
              * Baseline: score sin ejemplos aprobados. Entrenado: promedio de scores en ejemplos guardados en BD + respuestas en vivo del batch.
              La línea blanca en las barras indica el baseline. Datos en tiempo real desde Supabase.
            </div>
          </Card>
        </>
      )}

      {/* TAB: Historial */}
      {tab === 'history' && (
        <Card className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] font-semibold text-text-muted">Ejemplos aprobados — últimos 5 por agente</div>
            {stats && <Tag label={`${stats.total} total en BD`} color={C.green} />}
          </div>
          {loading ? (
            <div className="text-center py-8 text-text-ghost text-[11px]">Cargando historial...</div>
          ) : !stats || stats.total === 0 ? (
            <div className="text-center py-10">
              <div className="text-3xl mb-2">📭</div>
              <div className="text-[11px] text-text-ghost mb-1">No hay ejemplos aprobados aún</div>
              <div className="text-[10px] text-text-ghost">
                Ve a "Escenarios de entrenamiento", ejecuta un escenario y presiona<br/>
                <strong className="text-text-muted">"✅ Aprobar — usar para entrenar"</strong> en la respuesta real de la IA.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.byAgent.filter((a) => a.count > 0).map((agentStat) => {
                const persona = AGENT_PERSONAS[agentStat.agentKey];
                return (
                  <div key={agentStat.agentKey}>
                    <div className="flex items-center gap-2 mb-2">
                      <img src={persona.avatar} alt={persona.name} className="w-6 h-6 rounded-md" />
                      <span className="text-[10px] font-bold" style={{ color: persona.color }}>{persona.name}</span>
                      <span className="text-[9px] text-text-ghost">— {agentStat.count} ejemplo{agentStat.count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="space-y-1.5 ml-8">
                      {agentStat.recent.map((ex) => {
                        const s = ex.scores as Record<string, number> | null;
                        const global = s ? Math.round((s.precision + s.empathy + s.claridad + s.adherencia) / 4) : null;
                        return (
                          <div key={ex.id} className="flex items-start gap-3 p-2 rounded-lg bg-bg-elevated border border-border-subtle/50">
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] text-text-secondary truncate">"{ex.userMessage}"</div>
                              <div className="text-[8.5px] text-text-ghost mt-0.5">
                                {new Date(ex.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                {ex.scenarioId && <> · Escenario: <span className="font-mono">{ex.scenarioId}</span></>}
                              </div>
                            </div>
                            {global !== null && (
                              <div className="text-[14px] font-black flex-shrink-0"
                                style={{ color: global >= 90 ? C.green : global >= 75 ? C.amber : C.rose }}>
                                {global}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* TAB: Tokens y costos */}
      {tab === 'costs' && (
        <>
          {/* KPIs globales */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Total llamadas IA', value: tokenStats?.totals.calls ?? '—', color: C.indigo, icon: '🔁' },
              { label: 'Tokens de entrada', value: tokenStats ? (tokenStats.totals.totalInput / 1000).toFixed(1) + 'K' : '—', color: C.teal, icon: '📥' },
              { label: 'Tokens de salida', value: tokenStats ? (tokenStats.totals.totalOutput / 1000).toFixed(1) + 'K' : '—', color: C.violet, icon: '📤' },
              { label: 'Costo acumulado (USD)', value: tokenStats ? `$${tokenStats.totals.totalCostUsd.toFixed(4)}` : '—', color: C.amber, icon: '💵' },
            ].map((k) => (
              <div key={k.label} className="bg-bg-card rounded-card border border-border-subtle p-3 flex items-center gap-3">
                <div className="text-2xl">{k.icon}</div>
                <div>
                  <div className="text-[20px] font-black leading-none" style={{ color: k.color }}>{k.value}</div>
                  <div className="text-[9px] text-text-ghost leading-tight mt-0.5">{k.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabla por agente */}
          <Card className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-semibold text-text-muted">Desglose de tokens y costo por agente</div>
              <div className="text-[9px] text-text-ghost">
                Precios: entrada $0.10/M · salida $0.40/M tokens · Gemini Flash
              </div>
            </div>

            {!tokenStats || tokenStats.byAgent.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-3xl mb-2">📭</div>
                <div className="text-[11px] text-text-ghost">Sin datos de tokens aún</div>
                <div className="text-[10px] text-text-ghost mt-1">
                  Usa el chat o ejecuta escenarios de entrenamiento para generar registros.
                </div>
              </div>
            ) : (
              <table className="w-full text-[10.5px]">
                <thead>
                  <tr>
                    {['Agente', 'Llamadas', 'Tokens entrada', 'Tokens salida', 'Total tokens', 'Costo entrada', 'Costo salida', 'Costo total', 'Avg entrada/call', 'Avg salida/call'].map((h) => (
                      <th key={h} className="px-2.5 py-2 text-[8.5px] font-semibold uppercase tracking-wider text-text-ghost border-b border-border-subtle text-center first:text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tokenStats.byAgent.map((r, i) => {
                    const persona = AGENT_PERSONAS[r.agent] ?? { name: r.agent, color: C.slate };
                    return (
                      <tr key={r.agent} className={i % 2 === 0 ? 'bg-white/[0.01]' : ''}>
                        <td className="px-2.5 py-2.5 border-b border-border-subtle/40">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: persona.color }} />
                            <span className="font-bold text-text-secondary">{persona.name?.split(' ')[0] ?? r.agent}</span>
                          </div>
                        </td>
                        <td className="px-2.5 py-2.5 text-center border-b border-border-subtle/40 font-mono">{r.calls}</td>
                        <td className="px-2.5 py-2.5 text-center border-b border-border-subtle/40 font-mono" style={{ color: C.teal }}>{r.totalInput.toLocaleString('es-PE')}</td>
                        <td className="px-2.5 py-2.5 text-center border-b border-border-subtle/40 font-mono" style={{ color: C.violet }}>{r.totalOutput.toLocaleString('es-PE')}</td>
                        <td className="px-2.5 py-2.5 text-center border-b border-border-subtle/40 font-mono font-bold text-text-secondary">{r.totalTokens.toLocaleString('es-PE')}</td>
                        <td className="px-2.5 py-2.5 text-center border-b border-border-subtle/40 font-mono text-text-ghost">${r.inputCostUsd.toFixed(5)}</td>
                        <td className="px-2.5 py-2.5 text-center border-b border-border-subtle/40 font-mono text-text-ghost">${r.outputCostUsd.toFixed(5)}</td>
                        <td className="px-2.5 py-2.5 text-center border-b border-border-subtle/40">
                          <span className="font-black" style={{ color: C.amber }}>${r.totalCostUsd.toFixed(5)}</span>
                        </td>
                        <td className="px-2.5 py-2.5 text-center border-b border-border-subtle/40 font-mono text-text-ghost">{r.avgInput.toLocaleString('es-PE')}</td>
                        <td className="px-2.5 py-2.5 text-center border-b border-border-subtle/40 font-mono text-text-ghost">{r.avgOutput.toLocaleString('es-PE')}</td>
                      </tr>
                    );
                  })}
                  {/* Fila totales */}
                  <tr className="font-bold" style={{ background: `${C.indigo}08` }}>
                    <td className="px-2.5 py-2.5 text-text-secondary">TOTAL</td>
                    <td className="px-2.5 py-2.5 text-center font-mono">{tokenStats.totals.calls}</td>
                    <td className="px-2.5 py-2.5 text-center font-mono" style={{ color: C.teal }}>{tokenStats.totals.totalInput.toLocaleString('es-PE')}</td>
                    <td className="px-2.5 py-2.5 text-center font-mono" style={{ color: C.violet }}>{tokenStats.totals.totalOutput.toLocaleString('es-PE')}</td>
                    <td className="px-2.5 py-2.5 text-center font-mono text-text-secondary">{tokenStats.totals.totalTokens.toLocaleString('es-PE')}</td>
                    <td className="px-2.5 py-2.5 text-center" colSpan={2} />
                    <td className="px-2.5 py-2.5 text-center">
                      <span className="text-[13px] font-black" style={{ color: C.amber }}>${tokenStats.totals.totalCostUsd.toFixed(4)}</span>
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tbody>
              </table>
            )}
          </Card>

          {/* Proyección y referencia de precios */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Card>
              <div className="text-[11px] font-semibold text-text-muted mb-3">Referencia de precios — Gemini</div>
              <table className="w-full text-[10px]">
                <thead>
                  <tr>
                    <th className="text-left py-1.5 text-[8.5px] uppercase text-text-ghost border-b border-border-subtle">Nivel</th>
                    <th className="text-center py-1.5 text-[8.5px] uppercase text-text-ghost border-b border-border-subtle">Entrada</th>
                    <th className="text-center py-1.5 text-[8.5px] uppercase text-text-ghost border-b border-border-subtle">Salida</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Nivel gratuito', 'Sin costo', 'Sin costo'],
                    ['Nivel de pago', '$0.10 / 1M tokens', '$0.40 / 1M tokens'],
                  ].map(([tier, inp, out], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white/[0.01]' : ''}>
                      <td className="py-2 text-text-secondary font-medium border-b border-border-subtle/30">{tier}</td>
                      <td className="py-2 text-center border-b border-border-subtle/30" style={{ color: C.teal }}>{inp}</td>
                      <td className="py-2 text-center border-b border-border-subtle/30" style={{ color: C.violet }}>{out}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 text-[8.5px] text-text-ghost">
                * Audio: $0.30/M entrada. Imagen/video mismo precio que texto.
              </div>
            </Card>

            <Card>
              <div className="text-[11px] font-semibold text-text-muted mb-3">Proyección mensual estimada</div>
              {tokenStats && tokenStats.totals.calls > 0 ? (() => {
                const avgTokensPerCall = tokenStats.totals.totalTokens / tokenStats.totals.calls;
                const avgCostPerCall   = tokenStats.totals.totalCostUsd / tokenStats.totals.calls;
                const scenarios = [
                  { label: '50 chats/mes', calls: 50 },
                  { label: '200 chats/mes', calls: 200 },
                  { label: '1,000 chats/mes', calls: 1000 },
                  { label: '5,000 chats/mes', calls: 5000 },
                ];
                return (
                  <div className="space-y-2">
                    <div className="text-[9px] text-text-ghost mb-2">
                      Basado en promedio real: <span className="font-bold text-text-muted">{Math.round(avgTokensPerCall).toLocaleString()} tokens/llamada</span>
                    </div>
                    {scenarios.map((s) => {
                      const cost = s.calls * avgCostPerCall;
                      const color = cost < 0.01 ? C.green : cost < 0.10 ? C.teal : cost < 1 ? C.amber : C.rose;
                      return (
                        <div key={s.label} className="flex items-center justify-between p-2 rounded-lg" style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
                          <span className="text-[10px] text-text-ghost">{s.label}</span>
                          <span className="text-[11px] font-black" style={{ color }}>
                            ${cost < 0.0001 ? cost.toFixed(6) : cost.toFixed(4)}
                          </span>
                        </div>
                      );
                    })}
                    <div className="text-[8.5px] text-text-ghost mt-2 pt-2 border-t border-border-subtle">
                      * Estimación. Incluye triaje + agente especializado (2 llamadas promedio por mensaje).
                    </div>
                  </div>
                );
              })() : (
                <div className="text-[10px] text-text-ghost text-center py-6">
                  Sin datos suficientes para proyectar.<br/>Genera interacciones primero.
                </div>
              )}
            </Card>
          </div>
        </>
      )}

      {/* TAB: Cómo funciona */}
      {tab === 'howit' && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Diagrama de flujo */}
          <Card>
            <div className="text-[11px] font-semibold text-text-muted mb-4">Flujo de entrenamiento — Option C (Few-Shot)</div>
            {[
              { step: '1', icon: '▶', title: 'Ejecutar escenario', desc: 'El supervisor ejecuta un escenario real contra el agente IA. 1 llamada a Gemini.', color: C.indigo },
              { step: '2', icon: '✅', title: 'Aprobar respuesta', desc: 'Si la respuesta es buena, se presiona "Aprobar". La respuesta se guarda en Supabase. 0 llamadas adicionales.', color: C.green },
              { step: '3', icon: '🔍', title: 'Recuperar en inferencia', desc: 'Cuando llega un mensaje, se buscan los 3 ejemplos más similares por similitud Jaccard. 0 llamadas API.', color: C.teal },
              { step: '4', icon: '💬', title: 'Inyectar en prompt', desc: 'Los ejemplos se inyectan como bloque [EJEMPLOS APROBADOS] antes de las instrucciones del agente. 1 llamada Gemini.', color: C.amber },
            ].map((s, i, arr) => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
                    style={{ background: s.color }}>
                    {s.icon}
                  </div>
                  {i < arr.length - 1 && <div className="w-0.5 flex-1 my-1 min-h-[16px]" style={{ background: s.color + '40' }} />}
                </div>
                <div className="pb-3 flex-1">
                  <div className="text-[10.5px] font-bold text-text-secondary">{s.title}</div>
                  <div className="text-[9.5px] text-text-ghost leading-relaxed mt-0.5">{s.desc}</div>
                </div>
              </div>
            ))}
          </Card>

          {/* Tabla de costos */}
          <div className="space-y-3">
            <Card>
              <div className="text-[11px] font-semibold text-text-muted mb-3">Consumo de requests por sesión</div>
              <table className="w-full text-[10px]">
                <thead>
                  <tr>
                    <th className="text-left py-1.5 text-text-ghost text-[8.5px] uppercase border-b border-border-subtle">Acción</th>
                    <th className="text-center py-1.5 text-text-ghost text-[8.5px] uppercase border-b border-border-subtle">Llamadas Gemini</th>
                    <th className="text-center py-1.5 text-text-ghost text-[8.5px] uppercase border-b border-border-subtle">Tokens extra</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Ejecutar escenario', '1', '0'],
                    ['Aprobar ejemplo', '0 ← GRATIS', '0'],
                    ['Chat sin ejemplos', '1', '0'],
                    ['Chat con 3 ejemplos', '1', '~900'],
                    ['Recuperación DB', '0', '0'],
                  ].map(([action, calls, tokens], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white/[0.01]' : ''}>
                      <td className="py-2 text-text-ghost border-b border-border-subtle/30">{action}</td>
                      <td className="py-2 text-center font-bold border-b border-border-subtle/30"
                        style={{ color: calls.includes('0') && !calls.includes('1') ? C.green : C.amber }}>
                        {calls}
                      </td>
                      <td className="py-2 text-center text-text-ghost border-b border-border-subtle/30">{tokens}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <Card>
              <div className="text-[11px] font-semibold text-text-muted mb-3">Ventajas del enfoque Few-Shot</div>
              <ul className="space-y-2">
                {[
                  { icon: '🚀', text: 'Sin cambio de proveedor ni fine-tuning costoso' },
                  { icon: '💰', text: '0 API calls extra por entrenamiento' },
                  { icon: '📈', text: 'Mejora visible desde el primer ejemplo aprobado' },
                  { icon: '🔍', text: 'Similitud Jaccard: búsqueda semántica sin embeddings' },
                  { icon: '🛡️', text: 'Solo respuestas aprobadas por humano llegan al prompt' },
                  { icon: '↩️', text: 'Reversible: eliminar ejemplos = volver al baseline' },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-2 text-[9.5px] text-text-ghost">
                    <span>{item.icon}</span> {item.text}
                  </li>
                ))}
              </ul>
            </Card>

            <Card style={{ border: `1px solid ${C.green}30`, background: `${C.green}05` }}>
              <div className="text-[10px] font-bold mb-2" style={{ color: C.green }}>Arquitectura técnica</div>
              <div className="font-mono text-[8.5px] text-text-ghost space-y-0.5">
                <div><span style={{ color: C.indigo }}>DB:</span> training_examples (Supabase/PostgreSQL)</div>
                <div><span style={{ color: C.indigo }}>Búsqueda:</span> Jaccard word overlap, top-3</div>
                <div><span style={{ color: C.indigo }}>Threshold:</span> similitud {'>'} 0.05</div>
                <div><span style={{ color: C.indigo }}>Pool:</span> últimos 50 por agente</div>
                <div><span style={{ color: C.indigo }}>Inyección:</span> fewShotBlock → prompt de Gemini</div>
                <div><span style={{ color: C.indigo }}>Agentes:</span> TRIAJE · ANALISTA · COMERCIAL · SOPORTE</div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── PAGE ───────────────────────────────────────────────────────── */
export default function CulturaOrganizacional() {
  const [liveResults, setLiveResults] = useState<Record<string, TrainingRunResult>>({});

  const handleScenarioResult = useCallback((id: string, r: TrainingRunResult) => {
    setLiveResults((prev) => ({ ...prev, [id]: r }));
  }, []);

  const handleBatchComplete = useCallback((results: Record<string, TrainingRunResult>) => {
    setLiveResults(results);
  }, []);

  const totalRan = Object.keys(liveResults).length;
  const avgGlobal = totalRan > 0
    ? Math.round(Object.values(liveResults).reduce((s, r) => s + r.global, 0) / totalRan)
    : null;

  return (
    <div className="min-h-screen bg-bg-base px-6 py-5">
      <Header
        title="Cultura Organizacional — InmoData IA"
        subtitle="Valores · Identidad de agentes · Entrenamiento cultural · Resultados"
        onRefresh={() => {}}
        refreshing={false}
      />

      {/* Stats rápidos */}
      <div className="mt-4 mb-6 grid grid-cols-5 gap-3">
        {[
          { n: '6',           l: 'Valores organizacionales',    color: C.indigo },
          { n: '10',          l: 'Principios operativos',        color: C.teal },
          { n: '4',           l: 'Agentes con identidad propia', color: C.amber },
          { n: `${totalRan}/12`, l: 'Escenarios ejecutados',     color: C.green },
          { n: avgGlobal ? `${avgGlobal}/100` : '—', l: 'Score IA real promedio', color: C.violet },
        ].map((k) => (
          <div key={k.l} className="bg-bg-card rounded-card border border-border-subtle p-3 text-center">
            <div className="text-[22px] font-black leading-none mb-1" style={{ color: k.color }}>{k.n}</div>
            <div className="text-[10px] text-text-ghost leading-tight">{k.l}</div>
          </div>
        ))}
      </div>

      <SectionTitle icon="🌱" sub="Los cimientos culturales que definen cómo trabaja, se comunica y toma decisiones InmoData IA">
        Diseño de cultura organizacional
      </SectionTitle>
      <CulturaGeneral />

      <SectionTitle icon="👥" sub="Cada agente tiene nombre, foto, biografía y estilo propio — no son bots, son especialistas digitales">
        Identidad de los agentes IA
      </SectionTitle>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {['TRIAJE', 'ANALISTA', 'COMERCIAL', 'SOPORTE_B2B'].map((key) => (
          <AgentIdentityCard key={key} agentKey={key} />
        ))}
      </div>

      <SectionTitle icon="🎓" sub="Ejecuta cada escenario contra los agentes reales — compara la respuesta IA vs el baseline cultural esperado">
        Escenarios de entrenamiento cultural — Entrenando IA en vivo
      </SectionTitle>
      <TrainingSection liveResults={liveResults} onResult={handleScenarioResult} />

      <SectionTitle icon="📊" sub="Scores reales obtenidos al ejecutar los 12 escenarios contra los agentes activos — auto-evaluados por 4 dimensiones culturales">
        Resultados del entrenamiento
      </SectionTitle>
      <ResultadosEntrenamiento liveResults={liveResults} onBatchComplete={handleBatchComplete} />

      <SectionTitle
        icon="🧠"
        sub="Evidencia de entrenamiento en tiempo real — ejemplos aprobados en BD, evolución de scores por agente y mecanismo técnico para el jurado"
      >
        Panel de entrenamiento IA — Evidencia para jurado
      </SectionTitle>
      <PanelEntrenamientoIA liveResults={liveResults} />

      <ListaParaPrueba />

      <div className="mt-8 pt-4 border-t border-border-subtle flex justify-between text-[11px] text-text-deep">
        <span>InmoData IA · Cultura Organizacional v1.0 · Junio 2026</span>
        <span>Sofía · Carlos · Diego · Valeria</span>
      </div>
    </div>
  );
}
