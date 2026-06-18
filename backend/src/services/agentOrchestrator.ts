import { triageAgent } from './agents/triageAgent';
import { analystAgent } from './agents/analystAgent';
import { commercialAgent } from './agents/commercialAgent';
import { supportAgent } from './agents/supportAgent';
import { ChatOutcome } from '@prisma/client';

export interface OrchestratorInput {
  sessionId: string;
  userMessage: string;
  history: Array<{ role: string; content: string }>;
  userId?: string;
}

export interface OrchestratorResult {
  response: string;
  agent: string;
  outcome: ChatOutcome | null;
  userId: string | null;
}

export async function orchestrate(input: OrchestratorInput): Promise<OrchestratorResult> {
  const { sessionId, userMessage, history, userId } = input;

  // Step 1: Triage
  const triage = await triageAgent(userMessage, history);

  let response: string;
  let agent: string;
  let outcome: ChatOutcome | null = null;
  let resolvedUserId: string | null = userId ?? null;

  // Step 2: Route to appropriate agent
  switch (triage.intent) {
    case 'VALUATION': {
      const result = await analystAgent(userMessage, history);
      response = result.response;
      agent = 'ANALISTA';
      outcome = ChatOutcome.VALUATION_DELIVERED;

      // After valuation, the commercial agent appends a soft qualification prompt
      if (history.length >= 1) {
        const commercial = await commercialAgent(userMessage, history, sessionId, userId);
        if (commercial.leadCreated) {
          outcome = ChatOutcome.LEAD_QUALIFIED;
          resolvedUserId = commercial.userId;
          response = result.response + '\n\n' + commercial.response;
          agent = 'ANALISTA + COMERCIAL';
        } else if (!userId) {
          // Append soft CTA
          response += '\n\n' + commercial.response;
        }
      }
      break;
    }

    case 'QUALIFICATION': {
      const result = await commercialAgent(userMessage, history, sessionId, userId);
      response = result.response;
      agent = 'COMERCIAL';
      resolvedUserId = result.userId ?? resolvedUserId;
      if (result.leadCreated) outcome = ChatOutcome.LEAD_QUALIFIED;
      break;
    }

    case 'SUPPORT_B2B': {
      const result = await supportAgent(userMessage, history, userId);
      response = result.response;
      agent = 'SOPORTE_B2B';
      break;
    }

    default: {
      response = [
        '¡Hola! Soy el asistente de **InmoData IA**. Puedo ayudarte a:',
        '',
        '🏠 **Tasar una propiedad** en Lince, Jesús María o Miraflores',
        '📊 **Comparar precios** del mercado actual',
        '🤝 **Conectarte** con un corredor especialista',
        '',
        '¿Qué propiedad te gustaría consultar?',
      ].join('\n');
      agent = 'TRIAJE';
    }
  }

  return { response, agent, outcome, userId: resolvedUserId };
}
