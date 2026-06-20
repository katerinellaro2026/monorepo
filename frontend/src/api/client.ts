import axios from 'axios';
import type { DashboardMetrics, RevenueByMonth, Transaction, Lead, Property, Subscription } from '@/types';

// VITE_API_URL = backend root (e.g. https://backend.up.railway.app), no trailing /api
// In dev it's undefined → fall back to Vite proxy at /api
const BACKEND_ORIGIN = import.meta.env.VITE_API_URL ?? '';

export const api = axios.create({
  baseURL: BACKEND_ORIGIN ? `${BACKEND_ORIGIN}/api` : '/api',
});

// Attach JWT if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('inmodata_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  // Use absolute URL in production so Vite preview proxy is bypassed
  const { data } = await axios.post(`${BACKEND_ORIGIN}/auth/login`, { email, password });
  localStorage.setItem('inmodata_token', data.token);
  return data as { token: string; role: string; name: string };
}

export function logout() {
  localStorage.removeItem('inmodata_token');
}

// ── Metrics ───────────────────────────────────────────────────────────────────

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const { data } = await api.get('/metrics/dashboard');
  return data;
}

export async function fetchRevenueByMonth(): Promise<RevenueByMonth[]> {
  const { data } = await api.get('/transactions/stats/revenue-by-month');
  return data;
}

// ── Transactions ──────────────────────────────────────────────────────────────

export async function fetchTransactions(limit = 5): Promise<Transaction[]> {
  const { data } = await api.get(`/transactions?limit=${limit}`);
  return data;
}

// ── Leads ─────────────────────────────────────────────────────────────────────

export async function fetchLeads(params?: { status?: string; district?: string }): Promise<Lead[]> {
  const { data } = await api.get('/leads', { params });
  return data;
}

// ── Properties ────────────────────────────────────────────────────────────────

export async function fetchProperties(params?: { district?: string }): Promise<Property[]> {
  const { data } = await api.get('/properties', { params });
  return data;
}

export async function fetchPropertyStatsByDistrict() {
  const { data } = await api.get('/properties/stats/by-district');
  return data as Array<{ district: string; avgPrice: number; avgPricePerSqm: number; count: number }>;
}

// ── Subscriptions ─────────────────────────────────────────────────────────────

export async function fetchSubscriptions(): Promise<Subscription[]> {
  const { data } = await api.get('/subscriptions');
  return data;
}

// ── Scraping ──────────────────────────────────────────────────────────────────

export async function fetchScrapingStatus() {
  const { data } = await api.get('/scraping/status');
  return data;
}

export async function triggerScraping() {
  const { data } = await api.post('/scraping/trigger');
  return data;
}

// ── Training examples ─────────────────────────────────────────────────────────

export interface TrainingExample {
  id: string; agentKey: string; scenarioId?: string;
  userMessage: string; idealOutput: string;
  scores?: object; approvedBy?: string; createdAt: string;
}

export async function approveTrainingExample(data: {
  agentKey: string; scenarioId: string;
  userMessage: string; idealOutput: string;
  scores: object; approvedBy?: string;
}): Promise<{ ok: boolean; id: string }> {
  const { data: res } = await api.post('/training/approve', data);
  return res;
}

export async function fetchTrainingExamples(agentKey?: string): Promise<TrainingExample[]> {
  const { data } = await api.get('/training/examples', { params: agentKey ? { agentKey } : {} });
  return data;
}

export async function deleteTrainingExample(id: string): Promise<void> {
  await api.delete(`/training/examples/${id}`);
}

export interface TrainingAgentStats {
  agentKey: string;
  count: number;
  lastApproved: string | null;
  firstApproved: string | null;
  avgScores: { precision: number; empathy: number; claridad: number; adherencia: number } | null;
  recent: Array<{ id: string; scenarioId: string | null; userMessage: string; createdAt: string; scores: object | null }>;
}

export interface TrainingStats {
  total: number;
  agentsTrained: number;
  lastActivity: string | null;
  byAgent: TrainingAgentStats[];
}

export async function fetchTrainingStats(): Promise<TrainingStats> {
  const { data } = await api.get('/training/stats');
  return data;
}

// ── Training ──────────────────────────────────────────────────────────────────

export interface TrainingScores {
  precision: number; empathy: number; claridad: number; adherencia: number;
}
export interface TrainingRunResult {
  response: string; agentUsed: string; latencyMs: number;
  scores: TrainingScores; global: number;
}

export async function runTrainingScenario(
  scenarioId: string, agentKey: string, message: string,
  history?: Array<{ role: string; content: string }>,
): Promise<TrainingRunResult> {
  const { data } = await api.post('/training/run', { scenarioId, agentKey, message, history });
  return data;
}

export async function runTrainingBatch(
  scenarios: Array<{ scenarioId: string; agentKey: string; message: string }>,
): Promise<{ results: Array<TrainingRunResult & { scenarioId: string; agentKey: string }> }> {
  const { data } = await api.post('/training/run-batch', { scenarios });
  return data;
}

// ── Token stats ───────────────────────────────────────────────────────────────

export interface AgentTokenStats {
  agent: string; calls: number;
  totalInput: number; totalOutput: number; totalTokens: number;
  avgInput: number; avgOutput: number;
  inputCostUsd: number; outputCostUsd: number; totalCostUsd: number;
}
export interface TokenStats {
  byAgent: AgentTokenStats[];
  totals: { calls: number; totalInput: number; totalOutput: number; totalTokens: number; totalCostUsd: number };
  pricing: { inputPerMillon: number; outputPerMillon: number };
}
export async function fetchTokenStats(): Promise<TokenStats> {
  const { data } = await api.get('/metrics/token-stats');
  return data;
}

// ── Exchange rate ─────────────────────────────────────────────────────────────

export async function fetchExchangeRate(): Promise<{ rate: number; ts: string }> {
  const { data } = await api.get('/exchange/usd-pen');
  return data;
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export async function sendChatMessage(message: string, sessionId?: string) {
  const { data } = await api.post('/chat', { message, sessionId });
  return data;
}
