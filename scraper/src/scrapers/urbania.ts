/*
 * AVISO LEGAL: Este módulo es un MOCK. Antes de implementar scraping real en Urbania:
 *  1. Leer https://urbania.pe/robots.txt
 *  2. Revisar los Términos de Servicio de Urbania
 *  3. Implementar rate limiting (≥5s entre requests)
 *  4. Usar el User-Agent declarado en SCRAPING_USER_AGENT
 *  5. Considerar obtener acceso a su API oficial si existe
 *
 * La implementación real debería usar Playwright o Puppeteer con un browser headless
 * para manejar el renderizado JS de Urbania.
 */

import type { RawListing } from '../utils/normalize';

const MOCK_URBANIA_LISTINGS: RawListing[] = [
  { price: 215000, area: 65, district: 'Lince',       address: 'Av. Arequipa 2400', bedrooms: 2, bathrooms: 2, sourceId: 'urb-lince-001' },
  { price: 230000, area: 70, district: 'Lince',       address: 'Ca. Manuel Candamo 156', bedrooms: 3, bathrooms: 2, sourceId: 'urb-lince-002' },
  { price: 290000, area: 78, district: 'Jesús María', address: 'Av. Salaverry 1800', bedrooms: 2, bathrooms: 2, sourceId: 'urb-jm-001' },
  { price: 315000, area: 85, district: 'Jesús María', address: 'Av. Petit Thouars 3100', bedrooms: 3, bathrooms: 2, sourceId: 'urb-jm-002' },
  { price: 435000, area: 90, district: 'Miraflores',  address: 'Av. Larco 1200', bedrooms: 2, bathrooms: 2, sourceId: 'urb-mf-001' },
  { price: 520000, area: 115, district: 'Miraflores', address: 'Malecón de la Reserva 610', bedrooms: 3, bathrooms: 3, sourceId: 'urb-mf-002' },
];

export async function scrapeUrbania(districts: string[]): Promise<RawListing[]> {
  // TODO: Replace with real HTTP requests once legal review is complete.
  // Example real implementation would:
  //   const browser = await chromium.launch();
  //   const page = await browser.newPage();
  //   await page.goto(`https://urbania.pe/inmuebles/venta/departamentos/lima/${encodeURIComponent(district)}`);
  //   ... parse listings ...

  console.log(`[Urbania] Mock scraping for districts: ${districts.join(', ')}`);

  // Simulate network delay
  await new Promise((r) => setTimeout(r, 200));

  return MOCK_URBANIA_LISTINGS.filter((l) =>
    districts.includes(l.district ?? '')
  );
}
