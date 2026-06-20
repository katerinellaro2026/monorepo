import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../index';
import { requireAdmin } from '../middleware/auth';

const metricsRoutes: FastifyPluginAsync = async (app) => {
  // ── Endpoint principal: todas las métricas del CEO dashboard en una sola llamada ──
  app.get('/dashboard', { preHandler: requireAdmin }, async () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

    // MRR
    const mrrData = await prisma.subscription.aggregate({
      where: { status: 'ACTIVE' },
      _sum: { mrrSOL: true },
      _count: { id: true },
    });

    // CPL este mes
    const cplThisMonth = await prisma.transaction.aggregate({
      where: { type: 'LEAD', createdAt: { gte: monthStart } },
      _sum: { amountSOL: true },
      _count: { id: true },
    });
    const cplLastMonth = await prisma.transaction.aggregate({
      where: { type: 'LEAD', createdAt: { gte: prevMonthStart, lt: monthStart } },
      _sum: { amountSOL: true },
    });

    // MRR prev month (rough: sum of subscriptions created before this month)
    const mrrLastMonth = await prisma.subscription.aggregate({
      where: { status: 'ACTIVE', startedAt: { lt: monthStart } },
      _sum: { mrrSOL: true },
    });

    // Tasa de conversión: leads / chat sessions
    const totalSessions = await prisma.chatSession.count();
    const qualifiedLeads = await prisma.lead.count({ where: { status: 'NEW' } });
    const conversionRate = totalSessions > 0 ? (qualifiedLeads / totalSessions) * 100 : 0;

    // Sesiones activas hoy
    const chatSessionsToday = await prisma.chatSession.count({
      where: { createdAt: { gte: todayStart } },
    });

    // Tasaciones (sessions con outcome VALUATION_DELIVERED)
    const valuationsToday = await prisma.chatSession.count({
      where: { outcome: 'VALUATION_DELIVERED', createdAt: { gte: todayStart } },
    });

    // DDP
    const ddpTotal = await prisma.user.count({ where: { role: 'BUYER' } });
    const ddpNewThisWeek = await prisma.user.count({
      where: { role: 'BUYER', createdAt: { gte: weekAgo } },
    });

    // Propiedades scrapeadas hoy
    const propertiesExtractedToday = await prisma.property.count({
      where: { extractedAt: { gte: todayStart } },
    });

    // Telemetría de agentes (último log de cada agente)
    const agentLogs = await prisma.agentLog.findMany({
      orderBy: { createdAt: 'desc' },
      distinct: ['agent'],
    });

    // Demanda vs Oferta por distrito
    const ofertaByDistrict = await prisma.property.groupBy({
      by: ['district'],
      where: { isActive: true, district: { in: ['Lince', 'Jesús María', 'Miraflores'] } },
      _avg: { price: true },
    });
    const demandaByDistrict = await prisma.user.groupBy({
      by: ['districtOfInterest'],
      where: { role: 'BUYER', districtOfInterest: { in: ['Lince', 'Jesús María', 'Miraflores'] } },
      _avg: { budgetMax: true },
    });

    const demandVsSupply = ['Lince', 'Jesús María', 'Miraflores'].map((d) => ({
      distrito: d,
      demanda: Math.round(demandaByDistrict.find((x) => x.districtOfInterest === d)?._avg.budgetMax ?? 0),
      oferta: Math.round(ofertaByDistrict.find((x) => x.district === d)?._avg.price ?? 0),
    }));

    // Funnel
    const funnelData = {
      usersB2C: ddpTotal,
      intentionDiscovered: await prisma.chatSession.count({ where: { outcome: { not: 'IN_PROGRESS' } } }),
      qualifiedLeads: await prisma.lead.count(),
      soldLeads: await prisma.lead.count({ where: { status: 'SOLD' } }),
    };

    const mrrCurrent = mrrData._sum.mrrSOL ?? 0;
    const mrrPrev = mrrLastMonth._sum.mrrSOL ?? 0;
    const cplCurrent = cplThisMonth._sum.amountSOL ?? 0;
    const cplPrev = cplLastMonth._sum.amountSOL ?? 0;

    return {
      kpis: {
        mrrSOL: mrrCurrent,
        mrrChangePct: mrrPrev > 0 ? ((mrrCurrent - mrrPrev) / mrrPrev) * 100 : null,
        cplSOL: cplCurrent,
        cplChangePct: cplPrev > 0 ? ((cplCurrent - cplPrev) / cplPrev) * 100 : null,
        activeBrokers: mrrData._count.id,
        conversionRate: Math.round(conversionRate * 10) / 10,
      },
      operations: {
        chatSessionsToday,
        valuationsToday,
        leadsQualifiedToday: cplThisMonth._count.id,
        qualificationRate: chatSessionsToday > 0
          ? Math.round((cplThisMonth._count.id / chatSessionsToday) * 1000) / 10
          : 0,
      },
      dataSources: {
        propertiesExtractedToday,
        totalActiveProperties: await prisma.property.count({ where: { isActive: true } }),
        ddpTotal,
        ddpNewThisWeek,
        vectorDocsIndexed: await prisma.property.count({ where: { isActive: true } }),
      },
      agentTelemetry: agentLogs.map((l) => ({
        agent: l.agent,
        latencyMs: l.latencyMs,
        precision: l.precision,
        volume: l.volume,
      })),
      demandVsSupply,
      funnel: funnelData,
    };
  });

  // Logs de Gemini con prompt y respuesta completos
  app.get<{ Querystring: { agent?: string; limit?: string; page?: string } }>(
    '/gemini-logs',
    { preHandler: requireAdmin },
    async (req) => {
      const { prisma } = await import('../index');
      const limit  = Math.min(parseInt(req.query.limit ?? '20'), 50);
      const page   = Math.max(parseInt(req.query.page  ?? '1'), 1);
      const offset = (page - 1) * limit;

      const where = req.query.agent
        ? `WHERE agent = '${req.query.agent}' AND "extraData"->>'prompt' IS NOT NULL`
        : `WHERE "extraData"->>'prompt' IS NOT NULL`;

      type RawLog = {
        id: string; agent: string; latency_ms: number | null;
        created_at: Date; extra_data: Record<string, unknown>;
        total: bigint;
      };

      const rows: RawLog[] = await prisma.$queryRawUnsafe(`
        SELECT id, agent, "latencyMs" AS latency_ms, "createdAt" AS created_at,
               "extraData" AS extra_data,
               COUNT(*) OVER() AS total
        FROM agent_logs
        ${where}
        ORDER BY "createdAt" DESC
        LIMIT ${limit} OFFSET ${offset}
      `);

      const total = rows[0] ? Number(rows[0].total) : 0;
      const logs = rows.map((r) => {
        const ed = r.extra_data as Record<string, unknown>;
        const inp = Number(ed.inputTokens  ?? 0);
        const out = Number(ed.outputTokens ?? 0);
        return {
          id:            r.id,
          agent:         r.agent,
          latencyMs:     r.latency_ms,
          createdAt:     r.created_at,
          userMessage:   ed.userMessage   ?? null,
          prompt:        ed.prompt        ?? null,
          geminiResponse: ed.geminiResponse ?? null,
          inputTokens:   inp,
          outputTokens:  out,
          totalTokens:   inp + out,
          inputCostUsd:  +((inp  / 1_000_000) * 0.10).toFixed(6),
          outputCostUsd: +((out / 1_000_000) * 0.40).toFixed(6),
          totalCostUsd:  +(((inp / 1_000_000) * 0.10) + ((out / 1_000_000) * 0.40)).toFixed(6),
        };
      });

      return { logs, total, page, limit, pages: Math.ceil(total / limit) };
    },
  );

  // Token usage & cost stats por agente
  app.get('/token-stats', { preHandler: requireAdmin }, async () => {
    const { prisma } = await import('../index');

    // Lee extraData JSONB de agent_logs
    type RawRow = { agent: string; calls: bigint; total_input: bigint | null; total_output: bigint | null; avg_input: number | null; avg_output: number | null };
    const rows: RawRow[] = await prisma.$queryRaw`
      SELECT
        agent,
        COUNT(*)::bigint                                         AS calls,
        SUM(("extraData"->>'inputTokens')::integer)::bigint      AS total_input,
        SUM(("extraData"->>'outputTokens')::integer)::bigint     AS total_output,
        AVG(("extraData"->>'inputTokens')::integer)              AS avg_input,
        AVG(("extraData"->>'outputTokens')::integer)             AS avg_output
      FROM agent_logs
      WHERE "extraData" IS NOT NULL
        AND "extraData"->>'inputTokens' IS NOT NULL
      GROUP BY agent
    `;

    const INPUT_PRICE_PER_M  = 0.10;  // USD por 1M tokens input
    const OUTPUT_PRICE_PER_M = 0.40;  // USD por 1M tokens output

    const byAgent = rows.map((r) => {
      const totalInput  = Number(r.total_input  ?? 0);
      const totalOutput = Number(r.total_output ?? 0);
      const inputCost   = (totalInput  / 1_000_000) * INPUT_PRICE_PER_M;
      const outputCost  = (totalOutput / 1_000_000) * OUTPUT_PRICE_PER_M;
      return {
        agent:         r.agent,
        calls:         Number(r.calls),
        totalInput,
        totalOutput,
        totalTokens:   totalInput + totalOutput,
        avgInput:      Math.round(r.avg_input  ?? 0),
        avgOutput:     Math.round(r.avg_output ?? 0),
        inputCostUsd:  +inputCost.toFixed(6),
        outputCostUsd: +outputCost.toFixed(6),
        totalCostUsd:  +(inputCost + outputCost).toFixed(6),
      };
    });

    const totals = byAgent.reduce(
      (acc, r) => ({
        calls:        acc.calls        + r.calls,
        totalInput:   acc.totalInput   + r.totalInput,
        totalOutput:  acc.totalOutput  + r.totalOutput,
        totalTokens:  acc.totalTokens  + r.totalTokens,
        totalCostUsd: acc.totalCostUsd + r.totalCostUsd,
      }),
      { calls: 0, totalInput: 0, totalOutput: 0, totalTokens: 0, totalCostUsd: 0 }
    );
    totals.totalCostUsd = +totals.totalCostUsd.toFixed(6);

    return { byAgent, totals, pricing: { inputPerMillon: INPUT_PRICE_PER_M, outputPerMillon: OUTPUT_PRICE_PER_M } };
  });
};

export default metricsRoutes;
