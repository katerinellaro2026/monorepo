import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY ?? '';

export const geminiEnabled = apiKey.length > 0;

const genAI = geminiEnabled ? new GoogleGenerativeAI(apiKey) : null;

export function getProModel() {
  if (!genAI) throw new Error('GEMINI_API_KEY not set');
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
}

export function getFlashModel(jsonMode = false) {
  if (!genAI) throw new Error('GEMINI_API_KEY not set');
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    ...(jsonMode && { generationConfig: { responseMimeType: 'application/json' } }),
  });
}
