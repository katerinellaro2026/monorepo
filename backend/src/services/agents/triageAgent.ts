import { prisma } from '../../index';

export type Intent = 'VALUATION' | 'QUALIFICATION' | 'SUPPORT_B2B' | 'GENERAL';

export interface TriageResult {
  intent: Intent;
  confidence: number;
  latencyMs: number;
}

const VALUATION_KEYWORDS = ['tasar', 'precio', 'vale', 'cuesta', 'valor', 'cuánto', 'tasación', 'avalúo', 'm²', 'metro', 'departamento', 'casa', 'inmueble', 'propiedad', 'comprar', 'alquiler'];
const SUPPORT_KEYWORDS = ['reporte', 'acm', 'análisis comparativo', 'corredor', 'broker', 'informe', 'dashboard', 'suscripción'];
const QUALIFICATION_KEYWORDS = ['presupuesto', 'teléfono', 'llamar', 'contactar', 'interesado', 'quiero comprar', 'busco'];

export async function triageAgent(message: string, history: Array<{ role: string; content: string }>): Promise<TriageResult> {
  const start = Date.now();
  const lower = message.toLowerCase();

  // Detect intent by keyword scoring
  const valScore = VALUATION_KEYWORDS.filter((k) => lower.includes(k)).length;
  const suppScore = SUPPORT_KEYWORDS.filter((k) => lower.includes(k)).length;
  const qualScore = QUALIFICATION_KEYWORDS.filter((k) => lower.includes(k)).length;

  // If user has already provided budget/phone in history, lean toward qualification
  const historyText = history.map((h) => h.content).join(' ').toLowerCase();
  const hasPhoneInHistory = /\b\d{9}\b/.test(historyText);
  const hasBudgetInHistory = /s\/\s?\d+|presupuesto|budget/.test(historyText);

  let intent: Intent = 'GENERAL';
  let confidence = 0.6;

  if (suppScore > 0 && suppScore >= valScore) {
    intent = 'SUPPORT_B2B';
    confidence = 0.85;
  } else if (valScore >= 2) {
    intent = 'VALUATION';
    confidence = 0.9;
  } else if (valScore >= 1 && !hasPhoneInHistory) {
    intent = 'VALUATION';
    confidence = 0.75;
  } else if (hasBudgetInHistory || qualScore >= 1) {
    intent = 'QUALIFICATION';
    confidence = 0.8;
  } else if (history.length >= 2) {
    // After 2 turns of valuation, push toward qualification
    intent = 'QUALIFICATION';
    confidence = 0.7;
  }

  const latencyMs = Date.now() - start;

  // Log telemetry
  await prisma.agentLog.create({
    data: { agent: 'TRIAJE', latencyMs, precision: confidence, volume: 1 },
  }).catch(() => {}); // non-blocking

  return { intent, confidence, latencyMs };
}
