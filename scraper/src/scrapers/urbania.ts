import path from 'path';
import fs from 'fs';
import type { RawListing } from '../utils/normalize';
import { extractCards } from '../utils/extractCards';
import { newContext, sleep } from '../utils/browser';

const BASE_URL = 'https://urbania.pe';
const MAX_PAGES = 5;
const RATE_LIMIT_MS = 6000;

const DISTRICT_SLUGS: Record<string, string> = {
  'Lince':       'lince',
  'Jesús María': 'jesus-maria',
  'Miraflores':  'miraflores',
};

function buildUrl(districtSlug: string, page: number): string {
  // Navent/Lifull URL format — same pattern as Adondevivir
  if (page === 1) return `${BASE_URL}/departamentos-en-venta-en-${districtSlug}.html`;
  return `${BASE_URL}/departamentos-en-venta-en-${districtSlug}-pagina-${page}.html`;
}

export async function scrapeUrbania(districts: string[]): Promise<RawListing[]> {
  if (process.env.SCRAPING_ENABLED !== 'true') {
    console.log('[Urbania] SCRAPING_ENABLED=false — usando mock data');
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

      console.log(`[Urbania] Scraping ${district}...`);

      for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum++) {
        const url = buildUrl(slug, pageNum);
        const page = await context.newPage();

        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

          // Esperar a que React renderice las tarjetas (selector real confirmado)
          const found = await page.waitForSelector(
            '[data-qa="POSTING_CARD_PRICE"]',
            { timeout: 30000 }
          ).catch(() => null);

          if (pageNum === 1) {
            fs.writeFileSync(
              path.join(debugDir, `urbania-${slug}.html`),
              await page.content()
            );
          }

          if (!found) {
            console.log(`[Urbania] ${district} p${pageNum}: sin resultados (timeout selector)`);
            break;
          }

          const listings = await extractCards(page, district);
          console.log(`[Urbania] ${district} p${pageNum}: ${listings.length} propiedades`);
          if (listings.length === 0) break;
          allListings.push(...listings);
        } catch (err) {
          console.error(`[Urbania] Error en ${url}:`, (err as Error).message);
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

  console.log(`[Urbania] Total extraídas: ${allListings.length}`);
  return allListings;
}

const MOCK_FALLBACK: RawListing[] = [
  { price: 215000, area: 65,  district: 'Lince',       address: 'Av. Arequipa 2400',        bedrooms: 2, bathrooms: 2, sourceId: 'urb-lince-001' },
  { price: 230000, area: 70,  district: 'Lince',       address: 'Ca. Manuel Candamo 156',    bedrooms: 3, bathrooms: 2, sourceId: 'urb-lince-002' },
  { price: 290000, area: 78,  district: 'Jesús María', address: 'Av. Salaverry 1800',        bedrooms: 2, bathrooms: 2, sourceId: 'urb-jm-001' },
  { price: 315000, area: 85,  district: 'Jesús María', address: 'Av. Petit Thouars 3100',    bedrooms: 3, bathrooms: 2, sourceId: 'urb-jm-002' },
  { price: 435000, area: 90,  district: 'Miraflores',  address: 'Av. Larco 1200',            bedrooms: 2, bathrooms: 2, sourceId: 'urb-mf-001' },
  { price: 520000, area: 115, district: 'Miraflores',  address: 'Malecón de la Reserva 610', bedrooms: 3, bathrooms: 3, sourceId: 'urb-mf-002' },
];
