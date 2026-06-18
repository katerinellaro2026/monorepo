import { prisma } from '../../index';

export interface CommercialResult {
  response: string;
  extractedPhone: string | null;
  extractedBudget: number | null;
  leadCreated: boolean;
  userId: string | null;
  latencyMs: number;
}

const PHONE_REGEX = /\b(9\d{8})\b/;
const BUDGET_REGEX = /s\/\s?(\d[\d,\.]*)/i;

function parseBudget(text: string): number | null {
  const match = text.match(BUDGET_REGEX);
  if (!match) return null;
  return Number(match[1].replace(/[,\.]/g, ''));
}

export async function commercialAgent(
  message: string,
  history: Array<{ role: string; content: string }>,
  sessionId: string,
  existingUserId?: string
): Promise<CommercialResult> {
  const start = Date.now();
  const fullText = [...history.map((h) => h.content), message].join(' ');

  const phone = fullText.match(PHONE_REGEX)?.[1] ?? null;
  const budget = parseBudget(fullText);

  let response: string;
  let leadCreated = false;
  let userId = existingUserId ?? null;

  if (phone && budget) {
    // We have enough to qualify the lead
    let user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          budgetMax: budget,
          source: 'chat',
          qualificationStatus: 'QUALIFIED',
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { phone: phone ?? undefined, budgetMax: budget ?? undefined, qualificationStatus: 'QUALIFIED' },
      });
    }
    userId = user.id;

    // Create lead if not already exists for this session
    const existingLead = await prisma.lead.findUnique({ where: { chatSessionId: sessionId } });
    if (!existingLead) {
      await prisma.lead.create({
        data: {
          userId: user.id,
          chatSessionId: sessionId,
          budgetExtracted: budget,
          phone,
          status: 'NEW',
          salePriceSOL: 320,
        },
      });
      leadCreated = true;
    }

    response = `Perfecto, ¡te hemos registrado! Un corredor especialista en tu zona se contactará contigo pronto al ${phone}. ` +
               `Con tu presupuesto de S/ ${budget.toLocaleString('es-PE')}, tenemos opciones muy interesantes disponibles. 🏠`;
  } else if (budget && !phone) {
    response = `¡Excelente presupuesto! Para conectarte con el corredor adecuado, ¿me podrías compartir tu número de celular?`;
  } else if (phone && !budget) {
    response = `Gracias por tu número. Para encontrarte las mejores opciones, ¿cuál es tu presupuesto aproximado en soles?`;
  } else {
    // Gentle qualification prompt
    const prompts = [
      '¿Tienes un presupuesto aproximado en mente para esta propiedad?',
      'Para ayudarte mejor, ¿cuál es tu rango de presupuesto?',
      '¿Te gustaría que un especialista de la zona te contacte? Solo necesitamos tu número.',
    ];
    const turnIndex = history.filter((h) => h.role === 'assistant').length % prompts.length;
    response = prompts[turnIndex];
  }

  const latencyMs = Date.now() - start;
  await prisma.agentLog.create({
    data: { agent: 'COMERCIAL', latencyMs, precision: leadCreated ? 1 : 0.35, volume: 1 },
  }).catch(() => {});

  return { response, extractedPhone: phone, extractedBudget: budget, leadCreated, userId, latencyMs };
}
