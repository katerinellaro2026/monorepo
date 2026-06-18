import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../index';
import { requireAdmin } from '../middleware/auth';
import { z } from 'zod';

const CreateTransactionSchema = z.object({
  type: z.enum(['LEAD', 'SUBSCRIPTION']),
  clientName: z.string(),
  amountSOL: z.number().positive(),
  paymentMethod: z.enum(['CREDIT_CARD', 'BANK_TRANSFER', 'YAPE_PLIN']),
  leadId: z.string().optional(),
  subscriptionId: z.string().optional(),
});

const transactionsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', { preHandler: requireAdmin }, async (req) => {
    const { type, limit = '20', offset = '0' } = req.query as Record<string, string>;
    return prisma.transaction.findMany({
      where: { ...(type && { type: type as any }) },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(limit), 100),
      skip: Number(offset),
    });
  });

  app.post('/', { preHandler: requireAdmin }, async (req, reply) => {
    const body = CreateTransactionSchema.parse(req.body);
    const tx = await prisma.transaction.create({ data: body });
    return reply.status(201).send(tx);
  });

  // Revenue by month (last 6 months) — used by the combined revenue chart
  app.get('/stats/revenue-by-month', { preHandler: requireAdmin }, async () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const rows = await prisma.transaction.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { type: true, amountSOL: true, createdAt: true },
    });

    const months: Record<string, { mes: string; SaaS: number; Leads: number }> = {};
    rows.forEach((r) => {
      const key = r.createdAt.toISOString().slice(0, 7); // "YYYY-MM"
      const label = r.createdAt.toLocaleDateString('es-PE', { month: 'short' });
      if (!months[key]) months[key] = { mes: label.charAt(0).toUpperCase() + label.slice(1), SaaS: 0, Leads: 0 };
      if (r.type === 'SUBSCRIPTION') months[key].SaaS += r.amountSOL;
      else months[key].Leads += r.amountSOL;
    });

    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);
  });
};

export default transactionsRoutes;
