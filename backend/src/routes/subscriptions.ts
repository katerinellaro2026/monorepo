import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../index';
import { requireAdmin, requireAuth, JwtPayload } from '../middleware/auth';
import { z } from 'zod';
import { getPlan, getPlansForRole, isPlanRole } from '../data/plans';
import { isValidTestCard, cardLast4 } from '../data/testCards';

const CreateSubscriptionSchema = z.object({
  userId: z.string(),
  plan: z.enum(['BASIC', 'PRO', 'ENTERPRISE']),
  mrrSOL: z.number().positive(),
  endsAt: z.string().datetime().optional(),
});

const SubscribeSchema = z.object({
  plan: z.enum(['BASIC', 'PRO', 'ENTERPRISE']),
  card: z.object({
    number: z.string().min(1),
    name: z.string().optional(),
    exp: z.string().optional(),
    cvv: z.string().optional(),
  }),
});

const subscriptionsRoutes: FastifyPluginAsync = async (app) => {
  // ── Catálogo de planes (público) ─────────────────────────────────────────────
  app.get('/plans', async (req) => {
    const { role } = req.query as Record<string, string>;
    if (role && isPlanRole(role)) {
      return { role, plans: getPlansForRole(role) };
    }
    return {
      BUYER: getPlansForRole('BUYER'),
      BROKER: getPlansForRole('BROKER'),
    };
  });

  // ── Suscripción del usuario actual ───────────────────────────────────────────
  app.get('/me', { preHandler: requireAuth }, async (req) => {
    const payload = req.user as JwtPayload;
    const subscription = await prisma.subscription.findUnique({
      where: { userId: payload.sub },
      include: { transactions: { orderBy: { createdAt: 'desc' } } },
    });
    if (!subscription) return { subscription: null, plan: null };
    const plan = getPlan(payload.role, subscription.plan);
    return { subscription, plan };
  });

  // ── Suscribirse (pasarela simulada) ──────────────────────────────────────────
  app.post('/subscribe', { preHandler: requireAuth }, async (req, reply) => {
    const payload = req.user as JwtPayload;
    const parsed = SubscribeSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Datos de pago inválidos' });
    }
    const { plan, card } = parsed.data;

    if (!isPlanRole(payload.role)) {
      return reply.status(403).send({ error: 'Este tipo de cuenta no puede suscribirse' });
    }

    // Validar tarjeta contra las 3 hardcodeadas
    if (!isValidTestCard(card.number)) {
      return reply.status(402).send({ error: 'Tarjeta no válida. Usa una de las tarjetas de prueba.' });
    }

    // Precio SIEMPRE desde el catálogo del servidor (el cliente no fija el monto)
    const planDef = getPlan(payload.role, plan);
    if (!planDef) {
      return reply.status(400).send({ error: 'Plan no disponible para tu tipo de cuenta' });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return reply.status(404).send({ error: 'Usuario no encontrado' });

    const endsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const subscription = await prisma.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        plan,
        status: 'ACTIVE',
        mrrSOL: planDef.priceSOL,
        endsAt,
      },
      update: {
        plan,
        status: 'ACTIVE',
        mrrSOL: planDef.priceSOL,
        startedAt: new Date(),
        endsAt,
      },
    });

    await prisma.transaction.create({
      data: {
        type: 'SUBSCRIPTION',
        clientName: `${user.name ?? user.email ?? 'Cliente'} ····${cardLast4(card.number)}`,
        amountSOL: planDef.priceSOL,
        paymentMethod: 'CREDIT_CARD',
        subscriptionId: subscription.id,
      },
    });

    return reply.status(201).send({ subscription, plan: planDef });
  });

  // ── Admin: listado de suscripciones con pagos ────────────────────────────────
  app.get('/', { preHandler: requireAdmin }, async (req) => {
    const { status } = req.query as Record<string, string>;
    return prisma.subscription.findMany({
      where: { ...(status && { status: status as any }) },
      include: {
        user: { select: { name: true, email: true, role: true } },
        transactions: { orderBy: { createdAt: 'desc' } },
      },
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

  app.patch<{ Params: { id: string } }>('/:id', { preHandler: requireAdmin }, async (req) => {
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
