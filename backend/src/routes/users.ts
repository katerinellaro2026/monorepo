import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../index';
import { requireAdmin } from '../middleware/auth';
import { z } from 'zod';

const UpsertUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  districtOfInterest: z.string().optional(),
  propertyType: z.string().optional(),
  source: z.string().optional(),
});

const usersRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', { preHandler: requireAdmin }, async (req) => {
    const { role, district, limit = '50', offset = '0' } = req.query as Record<string, string>;
    return prisma.user.findMany({
      where: {
        ...(role && { role: role as any }),
        ...(district && { districtOfInterest: district }),
      },
      select: {
        id: true, name: true, email: true, phone: true,
        budgetMin: true, budgetMax: true, districtOfInterest: true,
        role: true, qualificationStatus: true, source: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(limit), 200),
      skip: Number(offset),
    });
  });

  app.get<{ Params: { id: string } }>('/:id', { preHandler: requireAdmin }, async (req, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { leads: true, subscription: true },
    });
    if (!user) return reply.status(404).send({ error: 'User not found' });
    return user;
  });

  app.post('/', async (req, reply) => {
    const body = UpsertUserSchema.parse(req.body);
    const user = await prisma.user.create({ data: body });
    return reply.status(201).send(user);
  });

  app.patch<{ Params: { id: string } }>('/:id', { preHandler: requireAdmin }, async (req, reply) => {
    const body = UpsertUserSchema.partial().parse(req.body);
    const user = await prisma.user.update({ where: { id: req.params.id }, data: body });
    return user;
  });

  // DDP total count
  app.get('/stats/ddp', { preHandler: requireAdmin }, async () => {
    const total = await prisma.user.count({ where: { role: 'BUYER' } });
    const thisWeek = await prisma.user.count({
      where: {
        role: 'BUYER',
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    });
    return { total, newThisWeek: thisWeek };
  });
};

export default usersRoutes;
