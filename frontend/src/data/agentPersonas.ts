export interface AgentPersona {
  key: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  emoji: string;
  personality: string;
  tagline: string;
}

export const AGENT_PERSONAS: Record<string, AgentPersona> = {
  TRIAJE: {
    key: 'TRIAJE',
    name: 'Sofía Torres',
    role: 'Coordinadora de Consultas',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    color: '#6366f1',
    emoji: '🔀',
    personality: 'Empática · Ágil · Orientada al cliente',
    tagline: 'Clasifico tu consulta y te conecto con el especialista correcto.',
  },
  ANALISTA: {
    key: 'ANALISTA',
    name: 'Carlos Mendoza',
    role: 'Analista de Mercado Inmobiliario',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    color: '#f59e0b',
    emoji: '🔍',
    personality: 'Preciso · Analítico · Basado en datos BCRP',
    tagline: 'Valúo propiedades con datos reales del mercado y el BCRP.',
  },
  'ANALISTA + COMERCIAL': {
    key: 'ANALISTA + COMERCIAL',
    name: 'Carlos & Diego',
    role: 'Análisis + Calificación de lead',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    color: '#f59e0b',
    emoji: '🔍💬',
    personality: 'Análisis de mercado seguido de captación',
    tagline: 'Valuación + oportunidad comercial en un solo flujo.',
  },
  COMERCIAL: {
    key: 'COMERCIAL',
    name: 'Diego Quispe',
    role: 'Ejecutivo Comercial',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    color: '#2dd4bf',
    emoji: '💬',
    personality: 'Amigable · Persuasivo · Centrado en el cliente',
    tagline: 'Te acompaño a encontrar la propiedad ideal según tu presupuesto.',
  },
  SOPORTE_B2B: {
    key: 'SOPORTE_B2B',
    name: 'Valeria Castro',
    role: 'Especialista en Corredores',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    color: '#22c55e',
    emoji: '📄',
    personality: 'Profesional · Experta · Orientada a resultados B2B',
    tagline: 'Genero reportes ACM y doy soporte técnico a corredores.',
  },
  DEFAULT: {
    key: 'DEFAULT',
    name: 'InmoData IA',
    role: 'Asistente Inmobiliario',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    color: '#6366f1',
    emoji: '🏠',
    personality: 'Asistente general de bienes raíces en Lima',
    tagline: 'Tu guía de inteligencia inmobiliaria en Lima, Perú.',
  },
};

export function getPersona(agentKey?: string | null): AgentPersona {
  if (!agentKey) return AGENT_PERSONAS.DEFAULT;
  return AGENT_PERSONAS[agentKey] ?? AGENT_PERSONAS.DEFAULT;
}
