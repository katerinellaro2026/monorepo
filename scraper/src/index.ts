import 'dotenv/config';
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { scrapeUrbania } from './scrapers/urbania';
import { scrapeAdondevivir } from './scrapers/adondevivir';
import { normalizeListing, normalizeDistrict } from './utils/normalize';

const prisma = new PrismaClient();

const TARGET_DISTRICTS = ['Lince', 'Jesús María', 'Miraflores'];
const INTERVAL_MINUTES = Number(process.env.SCRAPING_INTERVAL_MINUTES ?? 60);

async function runScraping() {
  console.log(`[Scraper] Starting run at ${new Date().toISOString()}`);

  // Secuencial para evitar que dos browsers compitan por CPU/memoria
  const urbaniaRaw = await scrapeUrbania(TARGET_DISTRICTS);
  const adondeRaw  = await scrapeAdondevivir(TARGET_DISTRICTS);

  let inserted = 0;
  let skipped = 0;

  for (const [raw, source] of [
    ...urbaniaRaw.map((r) => [r, 'URBANIA'] as const),
    ...adondeRaw.map((r) => [r, 'ADONDEVIVIR'] as const),
  ]) {
    const district = raw.district ? (normalizeDistrict(raw.district) ?? raw.district) : null;
    if (!district) { skipped++; continue; }

    const normalized = normalizeListing(raw, district);
    if (!normalized) { skipped++; continue; }

    // Skip duplicates by sourceId
    if (normalized.sourceId) {
      const exists = await prisma.property.findFirst({ where: { sourceId: normalized.sourceId } });
      if (exists) { skipped++; continue; }
    }

    await prisma.property.create({
      data: { ...normalized, source },
    });
    inserted++;
  }

  console.log(`[Scraper] Done — inserted: ${inserted}, skipped: ${skipped}`);
}

// Run immediately on start
runScraping().catch(console.error);

// Schedule recurring run
const cronExpression = `*/${INTERVAL_MINUTES} * * * *`;
cron.schedule(cronExpression, () => {
  runScraping().catch(console.error);
});

console.log(`[Scraper] Scheduled every ${INTERVAL_MINUTES} minutes. Cron: ${cronExpression}`);
