import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../index';
import { requireAdmin } from '../middleware/auth';
import { z } from 'zod';

const CreatePropertySchema = z.object({
  district: z.string(),
  address: z.string().optional(),
  zone: z.string().optional(),
  price: z.number().positive(),
  areaSqm: z.number().positive().optional(),
  bedrooms: z.number().int().optional(),
  bathrooms: z.number().int().optional(),
  propertyType: z.string().optional(),
  source: z.enum(['URBANIA', 'ADONDEVIVIR', 'MANUAL']),
  sourceUrl: z.string().url().optional(),
});

const propertiesRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (req) => {
    const { district, source, limit = '50', offset = '0' } = req.query as Record<string, string>;
    return prisma.property.findMany({
      where: {
        ...(district && { district }),
        ...(source && { source: source as any }),
        isActive: true,
      },
      orderBy: { extractedAt: 'desc' },
      take: Math.min(Number(limit), 200),
      skip: Number(offset),
    });
  });

  app.get<{ Params: { id: string } }>('/:id', async (req, reply) => {
    const prop = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!prop) return reply.status(404).send({ error: 'Property not found' });
    return prop;
  });

  app.post('/', { preHandler: requireAdmin }, async (req, reply) => {
    const body = CreatePropertySchema.parse(req.body);
    const prop = await prisma.property.create({
      data: {
        ...body,
        pricePerSqm: body.areaSqm ? body.price / body.areaSqm : undefined,
      },
    });
    return reply.status(201).send(prop);
  });

  app.patch<{ Params: { id: string } }>('/:id', { preHandler: requireAdmin }, async (req, reply) => {
    const body = CreatePropertySchema.partial().parse(req.body);
    const prop = await prisma.property.update({
      where: { id: req.params.id },
      data: body,
    });
    return prop;
  });

  app.delete<{ Params: { id: string } }>('/:id', { preHandler: requireAdmin }, async (req, reply) => {
    await prisma.property.update({ where: { id: req.params.id }, data: { isActive: false } });
    return reply.status(204).send();
  });

  // Stats by district
  app.get('/stats/by-district', async () => {
    const stats = await prisma.property.groupBy({
      by: ['district'],
      where: { isActive: true },
      _avg: { price: true, pricePerSqm: true, areaSqm: true },
      _count: { id: true },
    });
    return stats.map((s) => ({
      district: s.district,
      avgPrice: Math.round(s._avg.price ?? 0),
      avgPricePerSqm: Math.round(s._avg.pricePerSqm ?? 0),
      avgAreaSqm: Math.round(s._avg.areaSqm ?? 0),
      count: s._count.id,
    }));
  });
};

export default propertiesRoutes;
