import axios from 'axios';
import type { DashboardMetrics, RevenueByMonth, Transaction, Lead, Property, Subscription } from '@/types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
});

// Attach JWT if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('inmodata_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ─────────────────────────────────────────────────────────────────────
// Nota: el endpoint de login está en /auth/login (fuera de /api), por eso se
// usa axios directo en lugar del cliente con baseURL='/api'.

export async function login(email: string, password: string) {
  const { data } = await axios.post('/auth/login', { email, password });
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

// ── Chat ──────────────────────────────────────────────────────────────────────

export async function sendChatMessage(message: string, sessionId?: string) {
  const { data } = await api.post('/chat', { message, sessionId });
  return data;
}
