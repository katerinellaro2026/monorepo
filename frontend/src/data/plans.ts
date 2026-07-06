// ── Catálogo de planes (espejo de presentación) ───────────────────────────────
// La fuente de verdad de los montos está en el backend (backend/src/data/plans.ts).
// Aquí solo se usa para render. El precio real lo valida el servidor al suscribir.

export type PlanKey = 'BASIC' | 'PRO' | 'ENTERPRISE';
export type PlanRole = 'BUYER' | 'BROKER';

export interface PlanDef {
  key: PlanKey;
  label: string;
  priceSOL: number;
  tagline: string;
  features: string[];
  menus: string[];
  highlighted?: boolean;
}

export const CLIENT_MENUS = {
  CHAT: 'chat',
  COMPARADOR: 'comparador',
  ALERTAS: 'alertas',
  ACM: 'acm',
  LEADS: 'leads',
  API: 'api',
} as const;

export const PLAN_CATALOG: Record<PlanRole, Record<PlanKey, PlanDef>> = {
  BUYER: {
    BASIC: {
      key: 'BASIC', label: 'Básico', priceSOL: 29,
      tagline: 'Para empezar a tasar tu propiedad ideal',
      features: ['Chat Tasador ilimitado', 'Cobertura de 1 distrito', 'Precios de referencia BCRP'],
      menus: [CLIENT_MENUS.CHAT],
    },
    PRO: {
      key: 'PRO', label: 'Pro', priceSOL: 59,
      tagline: 'Compara el mercado y no te pierdas oportunidades',
      features: ['Todo lo del plan Básico', 'Comparador de precios entre distritos', 'Cobertura de 3 distritos', 'Alertas de nuevas propiedades'],
      menus: [CLIENT_MENUS.CHAT, CLIENT_MENUS.COMPARADOR, CLIENT_MENUS.ALERTAS],
      highlighted: true,
    },
    ENTERPRISE: {
      key: 'ENTERPRISE', label: 'Premium', priceSOL: 99,
      tagline: 'Análisis profesional para decisiones grandes',
      features: ['Todo lo del plan Pro', 'ACM personal (análisis comparativo)', 'Reportes en PDF descargables', 'Atención prioritaria'],
      menus: [CLIENT_MENUS.CHAT, CLIENT_MENUS.COMPARADOR, CLIENT_MENUS.ALERTAS, CLIENT_MENUS.ACM],
    },
  },
  BROKER: {
    BASIC: {
      key: 'BASIC', label: 'Básico', priceSOL: 150,
      tagline: 'Herramientas esenciales para tu inmobiliaria',
      features: ['Dashboard de corredor', 'Leads básicos del mercado', 'Chat Tasador para tu equipo'],
      menus: [CLIENT_MENUS.CHAT, CLIENT_MENUS.LEADS],
    },
    PRO: {
      key: 'PRO', label: 'Pro', priceSOL: 350,
      tagline: 'Capta y califica más leads con IA',
      features: ['Todo lo del plan Básico', 'Leads calificados ilimitados', 'ACM ilimitado', 'Comparador de precios avanzado'],
      menus: [CLIENT_MENUS.CHAT, CLIENT_MENUS.LEADS, CLIENT_MENUS.ACM, CLIENT_MENUS.COMPARADOR],
      highlighted: true,
    },
    ENTERPRISE: {
      key: 'ENTERPRISE', label: 'Enterprise', priceSOL: 2000,
      tagline: 'Integración total para grandes operaciones',
      features: ['Todo lo del plan Pro', 'Acceso API para integración', 'Leads exclusivos por distrito', 'Cuentas multiusuario', 'Soporte dedicado'],
      menus: [CLIENT_MENUS.CHAT, CLIENT_MENUS.LEADS, CLIENT_MENUS.ACM, CLIENT_MENUS.COMPARADOR, CLIENT_MENUS.API],
    },
  },
};

export function isPlanRole(role: string | null | undefined): role is PlanRole {
  return role === 'BUYER' || role === 'BROKER';
}

export function getPlansForRole(role: string | null | undefined): PlanDef[] {
  if (!isPlanRole(role)) return [];
  const byRole = PLAN_CATALOG[role];
  return [byRole.BASIC, byRole.PRO, byRole.ENTERPRISE];
}

export function getPlanDef(role: string | null | undefined, plan: string | null | undefined): PlanDef | null {
  if (!isPlanRole(role) || !plan) return null;
  return PLAN_CATALOG[role][plan as PlanKey] ?? null;
}

export const ROLE_LABEL: Record<string, string> = {
  BUYER: 'Usuario',
  BROKER: 'Empresa',
  ADMIN: 'Administrador',
};
