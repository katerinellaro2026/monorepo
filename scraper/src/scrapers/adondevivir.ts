/*
 * AVISO LEGAL: Este módulo es un MOCK. Antes de implementar scraping real en Adondevivir:
 *  1. Leer https://www.adondevivir.com/robots.txt
 *  2. Revisar los Términos de Servicio de Adondevivir
 *  3. Implementar rate limiting (≥5s entre requests)
 *  4. Usar el User-Agent declarado en SCRAPING_USER_AGENT
 */

import type { RawListing } from '../utils/normalize';

const MOCK_ADONDE_LISTINGS: RawListing[] = [
  { price: 198000, area: 58, district: 'Lince',       address: 'Jr. Risso 340', bedrooms: 2, bathrooms: 1, sourceId: 'adv-lince-001' },
  { price: 205000, area: 62, district: 'Lince',       address: 'Av. 2 de Mayo 850', bedrooms: 2, bathrooms: 2, sourceId: 'adv-lince-002' },
  { price: 275000, area: 72, district: 'Jesús María', address: 'Ca. Horacio Urteaga 620', bedrooms: 2, bathrooms: 2, sourceId: 'adv-jm-001' },
  { price: 480000, area: 105, district: 'Miraflores', address: 'Ca. Schell 380', bedrooms: 3, bathrooms: 2, sourceId: 'adv-mf-001' },
  { price: 395000, area: 82, district: 'Miraflores',  address: 'Av. Benavides 2900', bedrooms: 2, bathrooms: 2, sourceId: 'adv-mf-002' },
];

export async function scrapeAdondevivir(districts: string[]): Promise<RawListing[]> {
  // TODO: Replace with real HTTP requests once legal review is complete.
  console.log(`[Adondevivir] Mock scraping for districts: ${districts.join(', ')}`);
  await new Promise((r) => setTimeout(r, 180));
  return MOCK_ADONDE_LISTINGS.filter((l) => districts.includes(l.district ?? ''));
}
