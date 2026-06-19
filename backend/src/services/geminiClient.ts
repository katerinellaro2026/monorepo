import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY ?? '';

export const geminiEnabled = apiKey.length > 0;

const genAI = geminiEnabled ? new GoogleGenerativeAI(apiKey) : null;

const MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash-lite';

export function getProModel() {
  if (!genAI) throw new Error('GEMINI_API_KEY not set');
  return genAI.getGenerativeModel({ model: MODEL });
}

export function getFlashModel(jsonMode = false) {
  if (!genAI) throw new Error('GEMINI_API_KEY not set');
  return genAI.getGenerativeModel({
    model: MODEL,
    ...(jsonMode && { generationConfig: { responseMimeType: 'application/json' } }),
  });
}
