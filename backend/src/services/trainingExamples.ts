import { prisma } from '../index';

export interface FewShotExample {
  userMessage: string;
  idealOutput: string;
}

// Similitud por solapamiento de palabras (Jaccard aproximado)
// No requiere embeddings ni llamadas extra a la API
function similarity(a: string, b: string): number {
  const stopWords = new Set(['el', 'la', 'los', 'las', 'de', 'en', 'un', 'una', 'que', 'y', 'a', 'es', 'se', 'del', 'con', 'por', 'para', 'como', 'me', 'mi', 'tu', 'su']);
  const words = (s: string) =>
    new Set(s.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w)));
  const wa = words(a);
  const wb = words(b);
  const intersection = [...wa].filter(w => wb.has(w)).length;
  const union = new Set([...wa, ...wb]).size;
  return union === 0 ? 0 : intersection / union;
}

// Retorna los top-K ejemplos aprobados más similares al mensaje actual
// SQL fetch + scoring local — 0 llamadas a la API de IA
export async function getFewShotExamples(
  agentKey: string,
  message: string,
  topK = 3,
): Promise<FewShotExample[]> {
  const examples = await prisma.trainingExample.findMany({
    where: { agentKey },
    select: { userMessage: true, idealOutput: true },
    orderBy: { createdAt: 'desc' },
    take: 50, // cargar hasta 50, rankear localmente
  });

  if (examples.length === 0) return [];

  return examples
    .map(e => ({ ...e, score: similarity(message, e.userMessage) }))
    .sort((a, b) => b.score - a.score)
    .filter(e => e.score > 0.05) // descartar ejemplos sin relación
    .slice(0, topK)
    .map(({ userMessage, idealOutput }) => ({ userMessage, idealOutput }));
}

// Construye el bloque de texto few-shot para inyectar en el prompt
export function buildFewShotBlock(examples: FewShotExample[]): string {
  if (examples.length === 0) return '';
  const lines = examples.map((e, i) =>
    `Ejemplo ${i + 1}:\n  Usuario: "${e.userMessage}"\n  Respuesta ideal: "${e.idealOutput}"`,
  );
  return `\n[EJEMPLOS DE RESPUESTAS APROBADAS — úsalos como referencia de tono y calidad]\n${lines.join('\n\n')}\n[FIN DE EJEMPLOS]\n`;
}

// Guarda un ejemplo aprobado en la BD
export async function saveTrainingExample(data: {
  agentKey: string;
  scenarioId?: string;
  userMessage: string;
  idealOutput: string;
  scores?: object;
  approvedBy?: string;
}) {
  return prisma.trainingExample.create({ data });
}

// Lista ejemplos para el panel de admin
export async function listTrainingExamples(agentKey?: string) {
  return prisma.trainingExample.findMany({
    where: agentKey ? { agentKey } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}
