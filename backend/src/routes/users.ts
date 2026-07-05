import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../index';
import { requireAdmin, requireAuth, JwtPayload } from '../middleware/auth';
import { hashPassword } from '../utils/password';
import { z } from 'zod';

const UpdateMeSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(6).optional(),
});

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
  // ── Perfil propio (cualquier usuario autenticado) ────────────────────────────
  app.patch('/me', { preHandler: requireAuth }, async (req, reply) => {
    const payload = req.user as JwtPayload;
    const parsed = UpdateMeSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Datos inválidos' });
    }
    const { name, email, phone, password } = parsed.data;

    // Verificar que el email no esté tomado por otro usuario
    if (email) {
      const other = await prisma.user.findUnique({ where: { email } });
      if (other && other.id !== payload.sub) {
        return reply.status(409).send({ error: 'Ese correo ya está en uso' });
      }
    }

    const user = await prisma.user.update({
      where: { id: payload.sub },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(password ? { passwordHash: await hashPassword(password) } : {}),
      },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });
    return user;
  });

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
