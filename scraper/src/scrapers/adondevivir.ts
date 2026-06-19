import path from 'path';
import fs from 'fs';
import type { RawListing } from '../utils/normalize';
import { extractCards } from '../utils/extractCards';
import { newContext, sleep } from '../utils/browser';

const BASE_URL = 'https://www.adondevivir.com';
const MAX_PAGES = 5;
const RATE_LIMIT_MS = 6000;

const DISTRICT_SLUGS: Record<string, string> = {
  'Lince':       'lince',
  'Jesús María': 'jesus-maria',
  'Miraflores':  'miraflores',
};

function buildUrl(districtSlug: string, page: number): string {
  if (page === 1) return `${BASE_URL}/departamentos-en-venta-en-${districtSlug}.html`;
  return `${BASE_URL}/departamentos-en-venta-en-${districtSlug}-pagina-${page}.html`;
}

export async function scrapeAdondevivir(districts: string[]): Promise<RawListing[]> {
  if (process.env.SCRAPING_ENABLED !== 'true') {
    console.log('[Adondevivir] SCRAPING_ENABLED=false — usando mock data');
    return MOCK_FALLBACK.filter((l) => districts.includes(l.district ?? ''));
  }

  const context = await newContext();
  const allListings: RawListing[] = [];
  const debugDir = path.join(process.cwd(), 'debug');
  if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir);

  try {
    for (const district of districts) {
      const slug = DISTRICT_SLUGS[district];
      if (!slug) continue;

      console.log(`[Adondevivir] Scraping ${district}...`);

      for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum++) {
        const url = buildUrl(slug, pageNum);
        const page = await context.newPage();

        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

          // Mismo selector que Urbania — misma plataforma Navent/Lifull
          const found = await page.waitForSelector(
            '[data-qa="POSTING_CARD_PRICE"]',
            { timeout: 30000 }
          ).catch(() => null);

          if (pageNum === 1) {
            fs.writeFileSync(
              path.join(debugDir, `adondevivir-${slug}.html`),
              await page.content()
            );
          }

          if (!found) {
            console.log(`[Adondevivir] ${district} p${pageNum}: sin resultados`);
            break;
          }

          const listings = await extractCards(page, district);
          console.log(`[Adondevivir] ${district} p${pageNum}: ${listings.length} propiedades`);
          if (listings.length === 0) break;
          allListings.push(...listings);
        } catch (err) {
          console.error(`[Adondevivir] Error en ${url}:`, (err as Error).message);
        } finally {
          await page.close();
        }

        if (pageNum < MAX_PAGES) await sleep(RATE_LIMIT_MS);
      }

      if (districts.indexOf(district) < districts.length - 1) await sleep(RATE_LIMIT_MS);
    }
  } finally {
    await context.close();
  }

  console.log(`[Adondevivir] Total extraídas: ${allListings.length}`);
  return allListings;
}

const MOCK_FALLBACK: RawListing[] = [
  { price: 198000, area: 58,  district: 'Lince',       address: 'Jr. Risso 340',          bedrooms: 2, bathrooms: 1, sourceId: 'adv-lince-001' },
  { price: 205000, area: 62,  district: 'Lince',       address: 'Av. 2 de Mayo 850',       bedrooms: 2, bathrooms: 2, sourceId: 'adv-lince-002' },
  { price: 275000, area: 72,  district: 'Jesús María', address: 'Ca. Horacio Urteaga 620', bedrooms: 2, bathrooms: 2, sourceId: 'adv-jm-001' },
  { price: 480000, area: 105, district: 'Miraflores',  address: 'Ca. Schell 380',          bedrooms: 3, bathrooms: 2, sourceId: 'adv-mf-001' },
  { price: 395000, area: 82,  district: 'Miraflores',  address: 'Av. Benavides 2900',      bedrooms: 2, bathrooms: 2, sourceId: 'adv-mf-002' },
];
