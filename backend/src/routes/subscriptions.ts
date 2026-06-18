import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../index';
import { requireAdmin } from '../middleware/auth';
import { z } from 'zod';

const CreateSubscriptionSchema = z.object({
  userId: z.string(),
  plan: z.enum(['BASIC', 'PRO', 'ENTERPRISE']),
  mrrSOL: z.number().positive(),
  endsAt: z.string().datetime().optional(),
});

const subscriptionsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', { preHandler: requireAdmin }, async (req) => {
    const { status } = req.query as Record<string, string>;
    return prisma.subscription.findMany({
      where: { ...(status && { status: status as any }) },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { startedAt: 'desc' },
    });
  });

  app.post('/', { preHandler: requireAdmin }, async (req, reply) => {
    const body = CreateSubscriptionSchema.parse(req.body);
    const sub = await prisma.subscription.create({
      data: { ...body, endsAt: body.endsAt ? new Date(body.endsAt) : undefined },
    });
    return reply.status(201).send(sub);
  });

  app.patch<{ Params: { id: string } }>('/:id', { preHandler: requireAdmin }, async (req, reply) => {
    const body = CreateSubscriptionSchema.partial().omit({ userId: true }).parse(req.body);
    const sub = await prisma.subscription.update({ where: { id: req.params.id }, data: body });
    return sub;
  });

  app.delete<{ Params: { id: string } }>('/:id', { preHandler: requireAdmin }, async (req, reply) => {
    await prisma.subscription.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED', endsAt: new Date() },
    });
    return reply.status(204).send();
  });

  app.get('/stats/mrr', { preHandler: requireAdmin }, async () => {
    const active = await prisma.subscription.aggregate({
      where: { status: 'ACTIVE' },
      _sum: { mrrSOL: true },
      _count: { id: true },
    });
    return {
      mrrSOL: active._sum.mrrSOL ?? 0,
      activeBrokers: active._count.id,
    };
  });
};

export default subscriptionsRoutes;
