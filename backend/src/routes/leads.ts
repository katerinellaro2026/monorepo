import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../index';
import { requireBrokerOrAdmin, requireAdmin } from '../middleware/auth';
import { z } from 'zod';

const UpdateLeadSchema = z.object({
  status: z.enum(['NEW', 'SOLD', 'DISCARDED']).optional(),
  notes: z.string().optional(),
  agencyBuyerId: z.string().optional(),
  salePriceSOL: z.number().optional(),
});

const leadsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', { preHandler: requireBrokerOrAdmin }, async (req) => {
    const { status, district, limit = '50', offset = '0' } = req.query as Record<string, string>;
    return prisma.lead.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(district && { districtSought: district }),
      },
      include: {
        user: { select: { name: true, email: true, phone: true, budgetMax: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(limit), 200),
      skip: Number(offset),
    });
  });

  app.get<{ Params: { id: string } }>('/:id', { preHandler: requireBrokerOrAdmin }, async (req, reply) => {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      include: { user: true, chatSession: true },
    });
    if (!lead) return reply.status(404).send({ error: 'Lead not found' });
    return lead;
  });

  app.patch<{ Params: { id: string } }>('/:id', { preHandler: requireBrokerOrAdmin }, async (req, reply) => {
    const body = UpdateLeadSchema.parse(req.body);
    const lead = await prisma.lead.update({ where: { id: req.params.id }, data: body });
    return lead;
  });

  // Lead stats for metrics endpoint
  app.get('/stats/summary', { preHandler: requireAdmin }, async () => {
    const total = await prisma.lead.count();
    const byStatus = await prisma.lead.groupBy({
      by: ['status'],
      _count: { id: true },
    });
    const thisMonth = await prisma.lead.count({
      where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
    });
    const avgBudget = await prisma.lead.aggregate({
      _avg: { budgetExtracted: true },
    });
    return {
      total,
      thisMonth,
      avgBudgetSOL: Math.round(avgBudget._avg.budgetExtracted ?? 0),
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
    };
  });
};

export default leadsRoutes;
