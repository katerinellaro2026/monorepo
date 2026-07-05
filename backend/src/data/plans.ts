// ── Catálogo de planes — fuente única de verdad de precios y features ──────────
// Reusa el enum SubscriptionPlan (BASIC | PRO | ENTERPRISE) diferenciando por rol.
// Rol BUYER = "Usuario" (persona), rol BROKER = "Empresa" (inmobiliaria).

export type PlanKey = 'BASIC' | 'PRO' | 'ENTERPRISE';
export type PlanRole = 'BUYER' | 'BROKER';

export interface PlanDef {
  key: PlanKey;
  label: string;        // nombre visible del plan
  priceSOL: number;     // precio mensual → mrrSOL
  tagline: string;
  features: string[];
  menus: string[];      // ítems de navegación que habilita este plan
  highlighted?: boolean;
}

// Menús disponibles para clientes (keys usadas en el Sidebar del frontend)
export const CLIENT_MENUS = {
  CHAT: 'chat',
  COMPARADOR: 'comparador',
  ALERTAS: 'alertas',
  ACM: 'acm',
  LEADS: 'leads',
  API: 'api',
} as const;

export const PLAN_CATALOG: Record<PlanRole, Record<PlanKey, PlanDef>> = {
  // ── USUARIO (persona individual) ──────────────────────────────────────────
  BUYER: {
    BASIC: {
      key: 'BASIC',
      label: 'Básico',
      priceSOL: 29,
      tagline: 'Para empezar a tasar tu propiedad ideal',
      features: [
        'Chat Tasador ilimitado',
        'Cobertura de 1 distrito',
        'Precios de referencia BCRP',
      ],
      menus: [CLIENT_MENUS.CHAT],
    },
    PRO: {
      key: 'PRO',
      label: 'Pro',
      priceSOL: 59,
      tagline: 'Compara el mercado y no te pierdas oportunidades',
      features: [
        'Todo lo del plan Básico',
        'Comparador de precios entre distritos',
        'Cobertura de 3 distritos (Lince, Jesús María, Miraflores)',
        'Alertas de nuevas propiedades',
      ],
      menus: [CLIENT_MENUS.CHAT, CLIENT_MENUS.COMPARADOR, CLIENT_MENUS.ALERTAS],
      highlighted: true,
    },
    ENTERPRISE: {
      key: 'ENTERPRISE',
      label: 'Premium',
      priceSOL: 99,
      tagline: 'Análisis profesional para decisiones grandes',
      features: [
        'Todo lo del plan Pro',
        'ACM personal (análisis comparativo)',
        'Reportes en PDF descargables',
        'Atención prioritaria',
      ],
      menus: [CLIENT_MENUS.CHAT, CLIENT_MENUS.COMPARADOR, CLIENT_MENUS.ALERTAS, CLIENT_MENUS.ACM],
    },
  },

  // ── EMPRESA (inmobiliaria / corredor) ─────────────────────────────────────
  BROKER: {
    BASIC: {
      key: 'BASIC',
      label: 'Básico',
      priceSOL: 150,
      tagline: 'Herramientas esenciales para tu inmobiliaria',
      features: [
        'Dashboard de corredor',
        'Leads básicos del mercado',
        'Chat Tasador para tu equipo',
      ],
      menus: [CLIENT_MENUS.CHAT, CLIENT_MENUS.LEADS],
    },
    PRO: {
      key: 'PRO',
      label: 'Pro',
      priceSOL: 350,
      tagline: 'Capta y califica más leads con IA',
      features: [
        'Todo lo del plan Básico',
        'Leads calificados ilimitados',
        'ACM ilimitado (análisis comparativo de mercado)',
        'Comparador de precios avanzado',
      ],
      menus: [CLIENT_MENUS.CHAT, CLIENT_MENUS.LEADS, CLIENT_MENUS.ACM, CLIENT_MENUS.COMPARADOR],
      highlighted: true,
    },
    ENTERPRISE: {
      key: 'ENTERPRISE',
      label: 'Enterprise',
      priceSOL: 2000,
      tagline: 'Integración total para grandes operaciones',
      features: [
        'Todo lo del plan Pro',
        'Acceso API para integración',
        'Leads exclusivos por distrito',
        'Cuentas multiusuario',
        'Soporte dedicado',
      ],
      menus: [CLIENT_MENUS.CHAT, CLIENT_MENUS.LEADS, CLIENT_MENUS.ACM, CLIENT_MENUS.COMPARADOR, CLIENT_MENUS.API],
    },
  },
};

/** Roles que corresponden a cuentas de cliente con catálogo de planes. */
export function isPlanRole(role: string): role is PlanRole {
  return role === 'BUYER' || role === 'BROKER';
}

/** Devuelve la definición de un plan para un rol dado, o null si no existe. */
export function getPlan(role: string, plan: string): PlanDef | null {
  if (!isPlanRole(role)) return null;
  const byRole = PLAN_CATALOG[role];
  return byRole[plan as PlanKey] ?? null;
}

/** Devuelve los 3 planes de un rol como arreglo ordenado. */
export function getPlansForRole(role: string): PlanDef[] {
  if (!isPlanRole(role)) return [];
  const byRole = PLAN_CATALOG[role];
  return [byRole.BASIC, byRole.PRO, byRole.ENTERPRISE];
}
