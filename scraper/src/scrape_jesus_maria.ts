import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { scrapeUrbania } from './scrapers/urbania';
import { scrapeAdondevivir } from './scrapers/adondevivir';
import { normalizeListing, normalizeDistrict } from './utils/normalize';

const prisma = new PrismaClient();
const DISTRICTS = ['Jesús María'];

async function main() {
  console.log('[Jesús María] Iniciando scrape...');

  const urbaniaRaw = await scrapeUrbania(DISTRICTS);
  const adondeRaw  = await scrapeAdondevivir(DISTRICTS);

  let inserted = 0;
  let skipped  = 0;

  for (const [raw, source] of [
    ...urbaniaRaw.map((r) => [r, 'URBANIA'] as const),
    ...adondeRaw.map((r) => [r, 'ADONDEVIVIR'] as const),
  ]) {
    const district = raw.district ? (normalizeDistrict(raw.district) ?? raw.district) : null;
    if (!district) { skipped++; continue; }

    const normalized = normalizeListing(raw, district);
    if (!normalized) { skipped++; continue; }

    if (normalized.sourceId) {
      const exists = await prisma.property.findFirst({ where: { sourceId: normalized.sourceId } });
      if (exists) { skipped++; continue; }
    }

    await prisma.property.create({ data: { ...normalized, source } });
    inserted++;
  }

  console.log(`[Jesús María] Done — insertadas: ${inserted}, omitidas: ${skipped}`);
  await prisma.$disconnect();
}

main().catch(console.error);
