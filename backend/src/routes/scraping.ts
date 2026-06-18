import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../index';
import { requireAdmin } from '../middleware/auth';

/*
 * AVISO LEGAL: Antes de habilitar el scraping en producción, revisar:
 *  - robots.txt de Urbania (urbania.pe/robots.txt)
 *  - robots.txt de Adondevivir (adondevivir.com/robots.txt)
 *  - Términos de Servicio de cada portal
 *  - Implementar rate limiting respetuoso (≥5s entre requests)
 *  - Usar User-Agent identificado (ver SCRAPING_USER_AGENT en .env)
 */

let lastSync: Date | null = null;
let listingsToday = 0;

const scrapingRoutes: FastifyPluginAsync = async (app) => {
  // Status del scraper
  app.get('/status', { preHandler: requireAdmin }, async () => {
    const propertyCount = await prisma.property.count({ where: { isActive: true } });
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const extractedToday = await prisma.property.count({
      where: { extractedAt: { gte: todayStart } },
    });

    return {
      enabled: process.env.SCRAPING_ENABLED === 'true',
      lastSync: lastSync?.toISOString() ?? null,
      minutesSinceSync: lastSync ? Math.round((Date.now() - lastSync.getTime()) / 60000) : null,
      extractedToday,
      totalProperties: propertyCount,
      sources: ['URBANIA', 'ADONDEVIVIR'],
      districts: ['Lince', 'Jesús María', 'Miraflores'],
    };
  });

  // Trigger manual de scraping (usa mock si SCRAPING_ENABLED=false)
  app.post('/trigger', { preHandler: requireAdmin }, async (req, reply) => {
    if (process.env.SCRAPING_ENABLED !== 'true') {
      // Mock: inserta 3 propiedades de ejemplo para demostración
      const mockProperties = [
        { district: 'Lince',       price: 210000 + Math.random() * 20000, areaSqm: 62 + Math.random() * 10, source: 'URBANIA' as const,     address: 'Av. Arequipa 2500' },
        { district: 'Jesús María', price: 285000 + Math.random() * 30000, areaSqm: 75 + Math.random() * 15, source: 'ADONDEVIVIR' as const, address: 'Av. Brasil 1950' },
        { district: 'Miraflores',  price: 440000 + Math.random() * 50000, areaSqm: 92 + Math.random() * 20, source: 'URBANIA' as const,     address: 'Av. Pardo 680' },
      ];
      await prisma.property.createMany({
        data: mockProperties.map((p) => ({
          ...p,
          pricePerSqm: p.price / p.areaSqm,
          bedrooms: 2,
          bathrooms: 2,
          propertyType: 'Departamento',
        })),
      });
      lastSync = new Date();
      listingsToday += mockProperties.length;
      return { mode: 'mock', inserted: mockProperties.length, ts: lastSync.toISOString() };
    }

    // Real scraping would be called here — delegate to scraper workspace
    return reply.status(501).send({ error: 'Real scraping not yet configured. Set SCRAPING_ENABLED=true and implement scraper.' });
  });
};

export default scrapingRoutes;
