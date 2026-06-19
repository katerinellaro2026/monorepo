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
import trainingRoutes from './routes/training';

export const prisma = new PrismaClient();

async function main() {
  const app = Fastify({ logger: true });

  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
  await app.register(cors, {
    origin: corsOrigin,
    // credentials: true only when origin is not wildcard (browsers block * + credentials)
    credentials: corsOrigin !== '*',
  });

  await app.register(jwt, {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-prod',
  });

  // Health check
  app.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }));

  // Auth login
  app.post<{ Body: { email: string; password: string } }>('/auth/login', async (req, reply) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return reply.status(401).send({ error: 'Invalid credentials' });
    const expectedPassword = process.env.ADMIN_PASSWORD ?? 'dev-pass';
    if (password !== expectedPassword) return reply.status(401).send({ error: 'Invalid credentials' });
    const token = app.jwt.sign({ sub: user.id, role: user.role });
    return { token, role: user.role, name: user.name };
  });

  await app.register(propertiesRoutes,    { prefix: '/api/properties' });
  await app.register(usersRoutes,         { prefix: '/api/users' });
  await app.register(leadsRoutes,         { prefix: '/api/leads' });
  await app.register(subscriptionsRoutes, { prefix: '/api/subscriptions' });
  await app.register(transactionsRoutes,  { prefix: '/api/transactions' });
  await app.register(chatRoutes,          { prefix: '/api/chat' });
  await app.register(metricsRoutes,       { prefix: '/api/metrics' });
  await app.register(scrapingRoutes,      { prefix: '/api/scraping' });
  await app.register(trainingRoutes,     { prefix: '/api/training' });

  const port = Number(process.env.PORT ?? 3001);
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`InmoData IA backend running on port ${port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
