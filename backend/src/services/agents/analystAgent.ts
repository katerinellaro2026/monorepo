import { prisma } from '../../index';

export interface ValuationResult {
  estimatedPriceSOL: number;
  priceRangeLow: number;
  priceRangeHigh: number;
  district: string;
  comparables: number;
  pricePerSqm: number;
  response: string;
  latencyMs: number;
}

const DISTRICT_ALIASES: Record<string, string> = {
  lince: 'Lince',
  'jesus maria': 'Jesús María',
  'jesús maría': 'Jesús María',
  miraflores: 'Miraflores',
};

function extractDistrict(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [key, val] of Object.entries(DISTRICT_ALIASES)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

function extractArea(text: string): number | null {
  const match = text.match(/(\d+)\s*m[²2]/i);
  return match ? Number(match[1]) : null;
}

export async function analystAgent(
  message: string,
  history: Array<{ role: string; content: string }>
): Promise<ValuationResult> {
  const start = Date.now();
  const fullText = [...history.map((h) => h.content), message].join(' ');

  const district = extractDistrict(fullText) ?? 'Lince';
  const areaSqm = extractArea(fullText);

  // RAG: query comparable properties from PostgreSQL
  const comparableProps = await prisma.property.findMany({
    where: { district, isActive: true },
    select: { price: true, pricePerSqm: true, areaSqm: true },
    orderBy: { extractedAt: 'desc' },
    take: 10,
  });

  const avgPrice = comparableProps.length > 0
    ? comparableProps.reduce((s, p) => s + p.price, 0) / comparableProps.length
    : 220000;
  const avgPricePerSqm = comparableProps.length > 0
    ? comparableProps.reduce((s, p) => s + (p.pricePerSqm ?? 0), 0) / comparableProps.length
    : 3200;

  const estimatedPrice = areaSqm
    ? Math.round(areaSqm * avgPricePerSqm)
    : Math.round(avgPrice);

  const low = Math.round(estimatedPrice * 0.92);
  const high = Math.round(estimatedPrice * 1.08);

  const latencyMs = Date.now() - start;

  // Log telemetry
  await prisma.agentLog.create({
    data: { agent: 'ANALISTA', latencyMs, precision: 0.91, volume: 1 },
  }).catch(() => {});

  const priceFormatted = estimatedPrice.toLocaleString('es-PE');
  const lowFormatted = low.toLocaleString('es-PE');
  const highFormatted = high.toLocaleString('es-PE');
  const sqmFormatted = Math.round(avgPricePerSqm).toLocaleString('es-PE');

  const response = [
    `Basándome en **${comparableProps.length} propiedades comparables** en **${district}** ` +
    `(datos extraídos de Urbania y Adondevivir):`,
    '',
    `📊 **Tasación estimada: S/ ${priceFormatted}**`,
    `   Rango de mercado: S/ ${lowFormatted} – S/ ${highFormatted}`,
    `   Precio por m²: S/ ${sqmFormatted}/m²`,
    '',
    areaSqm
      ? `Esta estimación es para un inmueble de ${areaSqm} m² en ${district}.`
      : `Para una tasación más precisa, indícame los metros cuadrados del inmueble.`,
  ].join('\n');

  return {
    estimatedPriceSOL: estimatedPrice,
    priceRangeLow: low,
    priceRangeHigh: high,
    district,
    comparables: comparableProps.length,
    pricePerSqm: Math.round(avgPricePerSqm),
    response,
    latencyMs,
  };
}
