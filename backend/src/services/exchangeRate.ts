interface RateCache { rate: number; fetchedAt: number }

const FALLBACK = 3.77;
const TTL_MS   = 60 * 60 * 1000; // 1 hora
let cache: RateCache | null = null;

export async function getUsdToPen(): Promise<number> {
  if (cache && Date.now() - cache.fetchedAt < TTL_MS) return cache.rate;
  try {
    const res  = await fetch('https://dolar.pe/api/public/series?pair=USD-PEN');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json() as { series: { 'USD-PEN': { data: number[] } } };
    const rate = json?.series?.['USD-PEN']?.data?.[0];
    if (typeof rate !== 'number' || rate <= 0) throw new Error('invalid rate');
    cache = { rate, fetchedAt: Date.now() };
    return rate;
  } catch {
    return cache?.rate ?? FALLBACK;
  }
}

export function getCachedRate(): number {
  return cache?.rate ?? FALLBACK;
}
