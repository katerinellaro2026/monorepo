// ── Enums ──────────────────────────────────────────────────────────────────────

export type UserRole = 'BUYER' | 'BROKER' | 'ADMIN';
export type LeadStatus = 'NEW' | 'SOLD' | 'DISCARDED';
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'TRIAL';
export type SubscriptionPlan = 'BASIC' | 'PRO' | 'ENTERPRISE';
export type TransactionType = 'LEAD' | 'SUBSCRIPTION';
export type PaymentMethod = 'CREDIT_CARD' | 'BANK_TRANSFER' | 'YAPE_PLIN';
export type PropertySource = 'URBANIA' | 'ADONDEVIVIR' | 'MANUAL';
export type AgentType = 'TRIAJE' | 'ANALISTA' | 'COMERCIAL' | 'SOPORTE_B2B';
export type ChatOutcome = 'VALUATION_DELIVERED' | 'LEAD_QUALIFIED' | 'ABANDONED' | 'IN_PROGRESS';

// ── Domain models ─────────────────────────────────────────────────────────────

export interface Property {
  id: string;
  district: string;
  address?: string;
  zone?: string;
  price: number;
  pricePerSqm?: number;
  areaSqm?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  source: PropertySource;
  sourceUrl?: string;
  extractedAt: string;
  isActive: boolean;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  budgetMin?: number;
  budgetMax?: number;
  districtOfInterest?: string;
  role: UserRole;
  qualificationStatus: string;
  source?: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  userId: string;
  chatSessionId?: string;
  budgetExtracted?: number;
  phone?: string;
  districtSought?: string;
  status: LeadStatus;
  salePriceSOL?: number;
  createdAt: string;
  user?: Pick<User, 'name' | 'email' | 'phone' | 'budgetMax'>;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  mrrSOL: number;
  startedAt: string;
  endsAt?: string;
  user?: Pick<User, 'name' | 'email'>;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  clientName: string;
  amountSOL: number;
  paymentMethod: PaymentMethod;
  leadId?: string;
  subscriptionId?: string;
  createdAt: string;
}

export interface AgentLog {
  agent: AgentType;
  latencyMs?: number;
  precision?: number;
  volume?: number;
}

// ── Dashboard metrics (from /api/metrics/dashboard) ──────────────────────────

export interface DashboardMetrics {
  kpis: {
    mrrSOL: number;
    mrrChangePct: number | null;
    cplSOL: number;
    cplChangePct: number | null;
    activeBrokers: number;
    conversionRate: number;
  };
  operations: {
    chatSessionsToday: number;
    valuationsToday: number;
    leadsQualifiedToday: number;
    qualificationRate: number;
  };
  dataSources: {
    propertiesExtractedToday: number;
    totalActiveProperties: number;
    ddpTotal: number;
    ddpNewThisWeek: number;
    vectorDocsIndexed: number;
  };
  agentTelemetry: AgentLog[];
  demandVsSupply: Array<{ distrito: string; demanda: number; oferta: number }>;
  funnel: {
    usersB2C: number;
    intentionDiscovered: number;
    qualifiedLeads: number;
    soldLeads: number;
  };
}

export interface RevenueByMonth {
  mes: string;
  SaaS: number;
  Leads: number;
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  agent?: string;
}

export interface ChatResponse {
  sessionId: string;
  response: string;
  agent: string;
  outcome: ChatOutcome;
}
