import { prisma } from '../../index';
import { geminiEnabled, getFlashModel } from '../geminiClient';

export type Intent = 'VALUATION' | 'QUALIFICATION' | 'SUPPORT_B2B' | 'GENERAL';

export interface TriageResult {
  intent: Intent;
  confidence: number;
  latencyMs: number;
}

// ── Fallback keyword triage (used when GEMINI_API_KEY is not set) ─────────────
const VALUATION_KEYWORDS = ['tasar', 'precio', 'vale', 'cuesta', 'valor', 'cuánto', 'tasación', 'avalúo', 'm²', 'metro', 'departamento', 'casa', 'inmueble', 'propiedad', 'comprar', 'alquiler'];
const SUPPORT_KEYWORDS = ['reporte', 'acm', 'análisis comparativo', 'corredor', 'broker', 'informe', 'dashboard', 'suscripción'];
const QUALIFICATION_KEYWORDS = ['presupuesto', 'teléfono', 'llamar', 'contactar', 'interesado', 'quiero comprar', 'busco'];

function keywordTriage(message: string, history: Array<{ role: string; content: string }>): { intent: Intent; confidence: number } {
  const lower = message.toLowerCase();
  const valScore = VALUATION_KEYWORDS.filter((k) => lower.includes(k)).length;
  const suppScore = SUPPORT_KEYWORDS.filter((k) => lower.includes(k)).length;
  const qualScore = QUALIFICATION_KEYWORDS.filter((k) => lower.includes(k)).length;
  const historyText = history.map((h) => h.content).join(' ').toLowerCase();
  const hasPhoneInHistory = /\b\d{9}\b/.test(historyText);
  const hasBudgetInHistory = /s\/\s?\d+|presupuesto/.test(historyText);

  if (suppScore > 0 && suppScore >= valScore) return { intent: 'SUPPORT_B2B', confidence: 0.85 };
  if (valScore >= 2) return { intent: 'VALUATION', confidence: 0.9 };
  if (valScore >= 1 && !hasPhoneInHistory) return { intent: 'VALUATION', confidence: 0.75 };
  if (hasBudgetInHistory || qualScore >= 1) return { intent: 'QUALIFICATION', confidence: 0.8 };
  if (history.length >= 2) return { intent: 'QUALIFICATION', confidence: 0.7 };
  return { intent: 'GENERAL', confidence: 0.6 };
}

// ── Gemini triage ─────────────────────────────────────────────────────────────
async function geminiTriage(message: string, history: Array<{ role: string; content: string }>): Promise<{ intent: Intent; confidence: number; inputTokens: number; outputTokens: number; prompt: string; geminiResponse: string }> {
  const flash = getFlashModel(true);
  const historySnippet = history.slice(-4).map((h) => `${h.role}: ${h.content}`).join('\n');

  const prompt = `Clasifica la intención del usuario en este chat inmobiliario peruano.
Devuelve SOLO JSON con el campo "intent" y "confidence" (0.0-1.0).

Opciones de intent:
- "VALUATION": el usuario quiere saber el precio/valor de una propiedad
- "QUALIFICATION": el usuario está dando su presupuesto, teléfono o quiere ser contactado
- "SUPPORT_B2B": el usuario pide reporte ACM, análisis de mercado o menciona ser corredor/broker
- "GENERAL": saludo, pregunta genérica, otro tema

Historial reciente:
${historySnippet || '(inicio de conversación)'}

Mensaje actual: "${message}"

Ejemplo de respuesta: {"intent": "VALUATION", "confidence": 0.92}`;

  const result = await flash.generateContent(prompt);
  const meta = result.response.usageMetadata;
  const geminiResponse = result.response.text();
  const parsed = JSON.parse(geminiResponse) as { intent: Intent; confidence: number };
  return {
    intent: parsed.intent ?? 'GENERAL',
    confidence: parsed.confidence ?? 0.7,
    inputTokens: meta?.promptTokenCount ?? 0,
    outputTokens: meta?.candidatesTokenCount ?? 0,
    prompt,
    geminiResponse,
  };
}

// ── Public function ───────────────────────────────────────────────────────────
export async function triageAgent(message: string, history: Array<{ role: string; content: string }>): Promise<TriageResult> {
  const start = Date.now();

  let intent: Intent;
  let confidence: number;
  let inputTokens = 0;
  let outputTokens = 0;
  let logPrompt = '';
  let logGeminiResponse = '';
  let geminiError: string | null = null;

  try {
    if (geminiEnabled) {
      const r = await geminiTriage(message, history);
      intent = r.intent; confidence = r.confidence;
      inputTokens = r.inputTokens; outputTokens = r.outputTokens;
      logPrompt = r.prompt; logGeminiResponse = r.geminiResponse;
    } else {
      geminiError = 'GEMINI_API_KEY no configurada';
      ({ intent, confidence } = keywordTriage(message, history));
    }
  } catch (err: unknown) {
    geminiError = err instanceof Error ? err.message : String(err);
    console.error('[TriageAgent] Gemini error:', geminiError);
    ({ intent, confidence } = keywordTriage(message, history));
  }

  const latencyMs = Date.now() - start;
  await prisma.agentLog.create({
    data: {
      agent: 'TRIAJE', latencyMs, precision: confidence, volume: 1,
      extraData: { inputTokens, outputTokens, userMessage: message, prompt: logPrompt, geminiResponse: logGeminiResponse, geminiError },
    },
  }).catch(() => {});

  return { intent, confidence, latencyMs };
}
