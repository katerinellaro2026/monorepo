import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';

import propertiesRoutes from './routes/properties';
import usersRoutes from './routes/users';
import leadsRoutes from './routes/leads';
import subscriptionsRoutes from './routes/subscriptions';
import transactionsRoutes from './routes/transactions';
import chatRoutes from './routes/chat';
import metricsRoutes from './routes/metrics';
import scrapingRoutes from './routes/scraping';

export const prisma = new PrismaClient();

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  credentials: true,
});

await app.register(jwt, {
  secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-prod',
});

// Health check
app.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }));

// Auth login endpoint (minimal — returns JWT)
app.post<{ Body: { email: string; password: string } }>('/auth/login', async (req, reply) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) return reply.status(401).send({ error: 'Invalid credentials' });
  // TODO: replace placeholder with bcrypt.compare(password, user.passwordHash)
  if (password !== 'dev-pass') return reply.status(401).send({ error: 'Invalid credentials' });
  const token = app.jwt.sign({ sub: user.id, role: user.role });
  return { token, role: user.role, name: user.name };
});

// Routes
await app.register(propertiesRoutes,    { prefix: '/api/properties' });
await app.register(usersRoutes,         { prefix: '/api/users' });
await app.register(leadsRoutes,         { prefix: '/api/leads' });
await app.register(subscriptionsRoutes, { prefix: '/api/subscriptions' });
await app.register(transactionsRoutes,  { prefix: '/api/transactions' });
await app.register(chatRoutes,          { prefix: '/api/chat' });
await app.register(metricsRoutes,       { prefix: '/api/metrics' });
await app.register(scrapingRoutes,      { prefix: '/api/scraping' });

const port = Number(process.env.PORT ?? 3001);
await app.listen({ port, host: '0.0.0.0' });
console.log(`InmoData IA backend running on port ${port}`);
