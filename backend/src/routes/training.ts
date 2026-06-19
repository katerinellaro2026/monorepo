import { FastifyPluginAsync } from 'fastify';
import { requireBrokerOrAdmin } from '../middleware/auth';
import { orchestrate } from '../services/agentOrchestrator';

/* ── Auto-scoring cultural ────────────────────────────────────────────────── */

function autoScore(response: string, agentKey: string): {
  precision: number; empathy: number; claridad: number; adherencia: number;
} {
  const r = response;

  // ── Precisión: datos concretos, cifras, fuentes ──────────────────────────
  const dataSignals = [
    /\d+[\d,\.]*\s*(m²|usd|s\/|%|mil|k\b)/i,
    /bcrp|ivt|q[1-4]\s*202/i,
    /precio\s*(de\s*)?\w+|m²|metro\s*cuadr/i,
    /miraflores|lince|jes[úu]s\s*mar[íi]a/i,
    /\d{4,}/,
  ];
  const precisionHits = dataSignals.filter((re) => re.test(r)).length;
  let precision = 60 + precisionHits * 8;

  // ── Empatía: lenguaje cercano, reconocimiento, no presión ───────────────
  const empathySignals = [
    /entiendo|comprendo|claro que sí|por supuesto|con gusto|gracias|no hay problema/i,
    /\btu\b|\btu\s+\w+/i,
    /!|¡/,
    /perfecto|excelente|genial/i,
    /privacidad|respeto|sin\s+presión/i,
  ];
  const empathyHits = empathySignals.filter((re) => re.test(r)).length;
  let empathy = 60 + empathyHits * 8;

  // ── Claridad: estructura, negritas, viñetas ──────────────────────────────
  const claritySignals = [
    /\*\*[^*]+\*\*/,
    /•|·|-\s+\w/,
    /\n\n/,
    r.length > 150,
    r.length < 900,
  ];
  const clarityHits = claritySignals.filter((s) => (typeof s === 'boolean' ? s : s.test(r))).length;
  let claridad = 60 + clarityHits * 8;

  // ── Adherencia cultural: se presenta con nombre, no presiona, ofrece alternativa ──
  const agentNames: Record<string, RegExp> = {
    TRIAJE:      /sof[íi]a|coordinadora/i,
    ANALISTA:    /carlos\s+mendoza|analista/i,
    COMERCIAL:   /diego\s+quispe|ejecutivo\s+comercial/i,
    SOPORTE_B2B: /valeria\s+castro|especialista/i,
  };
  const namePresent = agentNames[agentKey]?.test(r) ?? false;
  const noSpam = !/urgente|última\s+oportunidad|no\s+pierdas/i.test(r);
  const offersAlternative = /alternativa|también|puedo\s+ofrecerte|sin\s+embargo/i.test(r);
  const honestAboutGaps = /no\s+(cubrimos|tenemos|contamos|disponible)|aún\s+no/i.test(r);
  let adherencia = 65
    + (namePresent ? 12 : 0)
    + (noSpam ? 8 : 0)
    + (offersAlternative ? 8 : 0)
    + (honestAboutGaps ? 7 : 0);

  // Cap a 100
  precision  = Math.min(100, precision);
  empathy    = Math.min(100, empathy);
  claridad   = Math.min(100, claridad);
  adherencia = Math.min(100, adherencia);

  return { precision, empathy, claridad, adherencia };
}

/* ── Route ────────────────────────────────────────────────────────────────── */

interface RunBody {
  scenarioId: string;
  agentKey: string;
  message: string;
  history?: Array<{ role: string; content: string }>;
}

const trainingRoutes: FastifyPluginAsync = async (app) => {
  // Run a single scenario against the real AI pipeline
  app.post<{ Body: RunBody }>(
    '/run',
    { preHandler: requireBrokerOrAdmin },
    async (req) => {
      const { scenarioId, agentKey, message, history = [] } = req.body;
      const sessionId = `training-${agentKey}-${scenarioId}-${Date.now()}`;

      const start = Date.now();
      const result = await orchestrate({ sessionId, userMessage: message, history });
      const latencyMs = Date.now() - start;

      const scores = autoScore(result.response, agentKey);
      const global = Math.round(
        (scores.precision + scores.empathy + scores.claridad + scores.adherencia) / 4,
      );

      return {
        response:  result.response,
        agentUsed: result.agent,
        latencyMs,
        scores,
        global,
      };
    },
  );

  // Run all scenarios for all agents in batch
  app.post<{ Body: { scenarios: RunBody[] } }>(
    '/run-batch',
    { preHandler: requireBrokerOrAdmin },
    async (req) => {
      const results = await Promise.all(
        req.body.scenarios.map(async ({ scenarioId, agentKey, message, history = [] }) => {
          const sessionId = `training-${agentKey}-${scenarioId}-${Date.now()}`;
          const start = Date.now();
          const result = await orchestrate({ sessionId, userMessage: message, history }).catch(() => ({
            response: '[Error ejecutando escenario]', agent: agentKey,
          }));
          const latencyMs = Date.now() - start;
          const scores = autoScore(result.response, agentKey);
          const global = Math.round(
            (scores.precision + scores.empathy + scores.claridad + scores.adherencia) / 4,
          );
          return { scenarioId, agentKey, response: result.response, latencyMs, scores, global };
        }),
      );
      return { results };
    },
  );
};

export default trainingRoutes;
