import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../index';
import { requireFeature } from '../middleware/plan';
import { JwtPayload } from '../middleware/auth';
import {
  BCRP_IVT_2025,
  BCRP_MARKET_AVERAGES,
  getBcrpData,
} from '../data/bcrpData';

const COVERED = ['Lince', 'Jesús María', 'Miraflores'];
const SOL_TO_USD = 0.265;
const USD_TO_SOL = 1 / SOL_TO_USD;

function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '—';
  return phone.slice(0, 3) + '••••' + phone.slice(-2);
}
function maskEmail(email: string | null | undefined): string {
  if (!email) return '—';
  const [u, d] = email.split('@');
  if (!d) return '•••';
  return u.slice(0, 2) + '•••@' + d;
}

const featuresRoutes: FastifyPluginAsync = async (app) => {
  // ── LEADS (Empresa) ──────────────────────────────────────────────────────────
  app.get('/leads', { preHandler: requireFeature('leads') }, async (req) => {
    const tier = (req as any).planKey as string;
    const { district } = req.query as Record<string, string>;
    const masked = tier === 'BASIC';
    const limit = masked ? 5 : 200;

    const leads = await prisma.lead.findMany({
      where: { ...(district && { districtSought: district }) },
      include: { user: { select: { name: true, email: true, phone: true, budgetMax: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const total = await prisma.lead.count();
    const avgBudget = await prisma.lead.aggregate({ _avg: { budgetExtracted: true } });
    const newCount = await prisma.lead.count({ where: { status: 'NEW' } });

    return {
      tier,
      masked,
      limitApplied: masked ? limit : null,
      total,
      summary: {
        new: newCount,
        avgBudgetSOL: Math.round(avgBudget._avg.budgetExtracted ?? 0),
      },
      leads: leads.map((l) => ({
        id: l.id,
        name: l.user?.name ?? 'Prospecto',
        phone: masked ? maskPhone(l.phone ?? l.user?.phone) : (l.phone ?? l.user?.phone ?? '—'),
        email: masked ? maskEmail(l.email ?? l.user?.email) : (l.email ?? l.user?.email ?? '—'),
        budgetSOL: Math.round(l.budgetExtracted ?? l.user?.budgetMax ?? 0),
        district: l.districtSought ?? '—',
        status: l.status,
        createdAt: l.createdAt,
      })),
    };
  });

  // ── ACM — Análisis Comparativo de Mercado (Empresa Pro+ / Usuario Premium) ─────
  app.get('/acm', { preHandler: requireFeature('acm') }, async (req) => {
    const { district = 'Miraflores', areaSqm = '80' } = req.query as Record<string, string>;
    const area = Math.max(20, Math.min(500, Number(areaSqm) || 80));
    const bcrp = getBcrpData(district);

    const comparables = await prisma.property.findMany({
      where: { district, isActive: true },
      select: { address: true, price: true, areaSqm: true, pricePerSqm: true, source: true, bedrooms: true },
      orderBy: { extractedAt: 'desc' },
      take: 12,
    });

    const withPpsm = comparables.filter((c) => c.pricePerSqm && c.pricePerSqm > 0);
    const avgPricePerSqmSOL = withPpsm.length
      ? Math.round(withPpsm.reduce((s, c) => s + (c.pricePerSqm ?? 0), 0) / withPpsm.length)
      : bcrp ? Math.round(bcrp.salePriceUsdPerSqm * USD_TO_SOL) : 0;

    const refUsdPerSqm = bcrp?.salePriceUsdPerSqm ?? BCRP_MARKET_AVERAGES.allDistricts.salePriceUsdPerSqm;
    const midUsd = refUsdPerSqm * area;

    return {
      district,
      covered: COVERED.includes(district),
      areaSqm: area,
      bcrp: bcrp
        ? {
            sector: bcrp.sector,
            salePriceUsdPerSqm: bcrp.salePriceUsdPerSqm,
            annualRentUsdPerSqm: bcrp.annualRentUsdPerSqm,
            monthlyRentUsdPerSqm: Math.round((bcrp.annualRentUsdPerSqm / 12) * 100) / 100,
            per: bcrp.per,
          }
        : null,
      valuation: {
        low: Math.round(midUsd * 0.92),
        mid: Math.round(midUsd),
        high: Math.round(midUsd * 1.08),
        currency: 'USD',
      },
      market: {
        comparablesCount: comparables.length,
        avgPricePerSqmSOL,
        avgPricePerSqmUSD: Math.round(avgPricePerSqmSOL * SOL_TO_USD),
      },
      comparables: comparables.map((c) => ({
        address: c.address ?? 'Sin dirección',
        priceSOL: Math.round(c.price),
        priceUSD: Math.round(c.price * SOL_TO_USD),
        areaSqm: c.areaSqm,
        bedrooms: c.bedrooms,
        pricePerSqmSOL: c.pricePerSqm ? Math.round(c.pricePerSqm) : null,
        source: c.source,
      })),
      source: 'BCRP Nota de Estudios No. 16 — IVT 2025 + comparables de portales',
      generatedAt: new Date().toISOString(),
    };
  });

  // ── COMPARADOR de precios (Usuario Pro+ / Empresa Pro+) ────────────────────────
  app.get('/comparador', { preHandler: requireFeature('comparador') }, async () => {
    const stats = await prisma.property.groupBy({
      by: ['district'],
      where: { isActive: true },
      _avg: { price: true, pricePerSqm: true, areaSqm: true },
      _count: { id: true },
    });
    const statMap = new Map(stats.map((s) => [s.district, s]));

    const districts = BCRP_IVT_2025.filter((d) => COVERED.includes(d.district)).map((d) => {
      const s = statMap.get(d.district);
      return {
        district: d.district,
        sector: d.sector,
        bcrpPriceUsdPerSqm: d.salePriceUsdPerSqm,
        bcrpPriceSolPerSqm: Math.round(d.salePriceUsdPerSqm * USD_TO_SOL),
        annualRentUsdPerSqm: d.annualRentUsdPerSqm,
        monthlyRentUsdPerSqm: Math.round((d.annualRentUsdPerSqm / 12) * 100) / 100,
        per: d.per,
        marketAvgPriceSOL: s?._avg.price ? Math.round(s._avg.price) : null,
        marketAvgPricePerSqmSOL: s?._avg.pricePerSqm ? Math.round(s._avg.pricePerSqm) : null,
        listingCount: s?._count.id ?? 0,
      };
    });

    return { districts, marketAverages: BCRP_MARKET_AVERAGES, source: 'BCRP IVT 2025' };
  });

  // ── ALERTAS de propiedades (Usuario Pro+) ──────────────────────────────────────
  app.get('/alertas', { preHandler: requireFeature('alertas') }, async (req) => {
    const payload = req.user as JwtPayload;
    const me = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { districtOfInterest: true, budgetMax: true },
    });

    const where: any = { isActive: true };
    if (me?.districtOfInterest && COVERED.includes(me.districtOfInterest)) {
      where.district = me.districtOfInterest;
    }

    const properties = await prisma.property.findMany({
      where,
      orderBy: { extractedAt: 'desc' },
      take: 15,
      select: {
        id: true, district: true, address: true, price: true, areaSqm: true,
        bedrooms: true, source: true, extractedAt: true, pricePerSqm: true,
      },
    });

    return {
      matchedDistrict: where.district ?? null,
      budgetSOL: me?.budgetMax ?? null,
      properties: properties.map((p) => ({
        ...p,
        priceSOL: Math.round(p.price),
        withinBudget: me?.budgetMax ? p.price <= me.budgetMax : null,
      })),
    };
  });

  // ── ACCESO API (Empresa Enterprise) ────────────────────────────────────────────
  app.get('/api-access', { preHandler: requireFeature('api') }, async (req) => {
    const payload = req.user as JwtPayload;
    const apiToken = app.jwt.sign({ sub: payload.sub, role: payload.role }, { expiresIn: '365d' });
    return {
      apiToken,
      baseUrl: '/api',
      docs: [
        { method: 'GET', path: '/api/properties?district=Miraflores', desc: 'Listado de propiedades por distrito' },
        { method: 'GET', path: '/api/properties/stats/by-district', desc: 'Estadísticas de precios por distrito' },
        { method: 'GET', path: '/api/features/comparador', desc: 'Comparador de precios BCRP + mercado' },
        { method: 'GET', path: '/api/features/acm?district=Lince&areaSqm=80', desc: 'Análisis comparativo de mercado' },
        { method: 'GET', path: '/api/features/leads', desc: 'Leads calificados (según tu plan)' },
      ],
      note: 'Incluye el token en el header: Authorization: Bearer <apiToken>',
    };
  });
};

export default featuresRoutes;
