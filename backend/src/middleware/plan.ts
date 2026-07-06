import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../index';
import { getPlan } from '../data/plans';
import { JwtPayload } from './auth';

/**
 * preHandler factory: exige que el plan activo del usuario incluya `feature`.
 * ADMIN siempre pasa. Sin suscripción activa → 402. Sin la feature → 403.
 * Deja el plan resuelto en request.planKey para el handler.
 */
export function requireFeature(feature: string) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const payload = request.user as JwtPayload;
    if (payload.role === 'ADMIN') {
      (request as any).planKey = 'ADMIN';
      return;
    }

    const subscription = await prisma.subscription.findUnique({ where: { userId: payload.sub } });
    if (!subscription || subscription.status !== 'ACTIVE') {
      return reply.status(402).send({ error: 'Necesitas una suscripción activa' });
    }

    const plan = getPlan(payload.role, subscription.plan);
    if (!plan || !plan.menus.includes(feature)) {
      return reply.status(403).send({ error: 'Tu plan no incluye esta función' });
    }

    (request as any).planKey = subscription.plan;
  };
}
