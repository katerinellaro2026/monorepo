/**
 * Extractor compartido para Urbania y Adondevivir.
 * Ambos portales usan la plataforma Navent/Lifull con idénticos data-qa.
 */
import type { Page } from 'playwright';
import type { RawListing } from './normalize';

export async function extractCards(page: Page, district: string): Promise<RawListing[]> {
  return page.evaluate((districtName) => {
    const results: Array<RawListing & { district: string }> = [];

    const cards = document.querySelectorAll('.postingCardLayout-module__posting-card-container');

    cards.forEach((card) => {
      const priceEl    = card.querySelector('[data-qa="POSTING_CARD_PRICE"]');
      const locationEl = card.querySelector('[data-qa="POSTING_CARD_LOCATION"]');
      const featuresEl = card.querySelector('[data-qa="POSTING_CARD_FEATURES"]');

      // Skip development projects ("Departamentos desde") — those aren't individual units
      const priceText = priceEl?.textContent?.trim() ?? '';
      if (!priceText || !/\d/.test(priceText)) return;
      if (/desde/i.test(priceText)) return;

      // Price: handle dual-currency format "S/ 448,500 · USD 131,800" — prefer USD
      let priceForNormalization: string;
      const midDotIdx = priceText.indexOf('·');
      if (midDotIdx !== -1) {
        const parts = priceText.split('·').map((s) => s.trim());
        const usdPart = parts.find((p) => /USD/i.test(p));
        priceForNormalization = (usdPart ?? parts[0]).replace(/USD/gi, '').trim();
      } else {
        priceForNormalization = priceText.replace(/S\/|USD/gi, '').trim();
      }

      // sourceId from property detail href (href ending in -{8+digits}.html)
      const allLinks = [...card.querySelectorAll('a[href]')] as HTMLAnchorElement[];
      const propLink = allLinks
        .map((a) => a.getAttribute('href') ?? '')
        .find((h) => /\/clasificado\/.*-\d{7,}\.html/.test(h) || /\/proyecto\/.*-\d{7,}\.html/.test(h));

      const idMatch = propLink?.match(/-(\d{7,})\.html/);
      const sourceId = idMatch ? `navent-${idMatch[1]}` : undefined;
      const url = propLink ? `https://www.adondevivir.com${propLink.split('?')[0]}` : undefined;

      // Features: area, bedrooms, bathrooms
      let area: string | undefined;
      let bedrooms: string | undefined;
      let bathrooms: string | undefined;

      if (featuresEl) {
        const spans = [...featuresEl.querySelectorAll('span,li')];
        const areaSpan     = spans.find((s) => /m²/i.test(s.textContent ?? ''));
        const bedroomSpan  = spans.find((s) => /dorm|hab/i.test(s.textContent ?? ''));
        const bathroomSpan = spans.find((s) => /ba[ñn]/i.test(s.textContent ?? ''));
        area      = areaSpan?.textContent?.trim();
        bedrooms  = bedroomSpan?.textContent?.trim();
        bathrooms = bathroomSpan?.textContent?.trim();
      }

      results.push({
        price:    priceForNormalization,
        area,
        address:  locationEl?.textContent?.trim(),
        url,
        sourceId,
        bedrooms,
        bathrooms,
        district: districtName,
      });
    });

    return results;
  }, district);
}
