import { FastifyRequest, FastifyReply } from 'fastify';

export type JwtPayload = {
  sub: string;
  role: 'BUYER' | 'BROKER' | 'ADMIN';
  iat: number;
  exp: number;
};

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    reply.status(401).send({ error: 'Unauthorized' });
  }
}

export async function requireBrokerOrAdmin(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    const payload = request.user as JwtPayload;
    if (payload.role !== 'BROKER' && payload.role !== 'ADMIN') {
      reply.status(403).send({ error: 'Forbidden: broker or admin role required' });
    }
  } catch {
    reply.status(401).send({ error: 'Unauthorized' });
  }
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    const payload = request.user as JwtPayload;
    if (payload.role !== 'ADMIN') {
      reply.status(403).send({ error: 'Forbidden: admin role required' });
    }
  } catch {
    reply.status(401).send({ error: 'Unauthorized' });
  }
}
