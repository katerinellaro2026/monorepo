import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../index';
import { hashPassword, verifyPassword } from '../utils/password';
import { requireAuth, JwtPayload } from '../middleware/auth';

const RegisterSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  accountType: z.enum(['USER', 'COMPANY']),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function hasActiveSubscription(userId: string): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  return !!sub && sub.status === 'ACTIVE';
}

const authRoutes: FastifyPluginAsync = async (app) => {
  // ── Registro ────────────────────────────────────────────────────────────────
  app.post('/register', async (req, reply) => {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Datos inválidos', details: parsed.error.flatten() });
    }
    const { name, email, password, accountType } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.status(409).send({ error: 'Ya existe una cuenta con ese correo' });
    }

    const role = accountType === 'COMPANY' ? 'BROKER' : 'BUYER';
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { name, email, passwordHash, role, source: 'signup' },
    });

    const token = app.jwt.sign({ sub: user.id, role: user.role }, { expiresIn: '30d' });
    return reply.status(201).send({
      token,
      role: user.role,
      name: user.name,
      hasSubscription: false,
    });
  });

  // ── Login (todos los roles, incluido ADMIN) ──────────────────────────────────
  app.post('/login', async (req, reply) => {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Datos inválidos' });
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return reply.status(401).send({ error: 'Credenciales incorrectas' });
    }
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return reply.status(401).send({ error: 'Credenciales incorrectas' });
    }

    const token = app.jwt.sign({ sub: user.id, role: user.role }, { expiresIn: '30d' });
    return {
      token,
      role: user.role,
      name: user.name,
      hasSubscription: user.role === 'ADMIN' ? true : await hasActiveSubscription(user.id),
    };
  });

  // ── Usuario actual + estado de suscripción ───────────────────────────────────
  app.get('/me', { preHandler: requireAuth }, async (req, reply) => {
    const payload = req.user as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });
    if (!user) return reply.status(404).send({ error: 'Usuario no encontrado' });

    const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });
    return {
      user,
      hasSubscription: user.role === 'ADMIN' ? true : (!!subscription && subscription.status === 'ACTIVE'),
      subscription,
    };
  });
};

export default authRoutes;
