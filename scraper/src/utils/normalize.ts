export interface RawListing {
  title?: string;
  price?: string | number;
  area?: string | number;
  address?: string;
  district?: string;
  url?: string;
  sourceId?: string;
  bedrooms?: string | number;
  bathrooms?: string | number;
}

export interface NormalizedProperty {
  district: string;
  address?: string;
  price: number;
  areaSqm?: number;
  pricePerSqm?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType: string;
  sourceUrl?: string;
  sourceId?: string;
}

const DISTRICT_MAP: Record<string, string> = {
  lince: 'Lince',
  'jesus maria': 'Jesús María',
  'jesus maría': 'Jesús María',
  'jesús maria': 'Jesús María',
  'jesús maría': 'Jesús María',
  miraflores: 'Miraflores',
};

export function normalizeDistrict(raw: string): string | null {
  const lower = raw.toLowerCase().trim();
  return DISTRICT_MAP[lower] ?? null;
}

export function normalizePrice(raw: string | number | undefined): number | null {
  if (raw == null) return null;
  if (typeof raw === 'number') return raw > 0 ? raw : null;
  // Eliminar todo excepto dígitos, comas y puntos
  let cleaned = raw.replace(/[^0-9.,]/g, '');
  // Si hay coma como separador de miles (ej: "120,000") → eliminar coma
  // Si hay punto como separador de miles (ej: "120.000") → eliminar punto
  // Detectar: si hay coma seguida de exactamente 3 dígitos al final → miles
  if (/,\d{3}$/.test(cleaned)) {
    cleaned = cleaned.replace(/,/g, '');
  } else if (/\.\d{3}$/.test(cleaned) && !cleaned.includes(',')) {
    cleaned = cleaned.replace(/\./g, '');
  } else {
    // Coma como decimal europeo → convertir a punto
    cleaned = cleaned.replace(',', '.');
  }
  const n = parseFloat(cleaned);
  return isNaN(n) || n <= 0 ? null : n;
}

export function normalizeArea(raw: string | number | undefined): number | null {
  if (raw == null) return null;
  if (typeof raw === 'number') return raw > 0 ? raw : null;
  const match = raw.match(/(\d+(?:\.\d+)?)/);
  const n = match ? parseFloat(match[1]) : NaN;
  return isNaN(n) || n <= 0 ? null : n;
}

export function normalizeListing(raw: RawListing, district: string): NormalizedProperty | null {
  const price = normalizePrice(raw.price);
  if (price == null || price < 10000) return null; // filter out bad data

  const area = normalizeArea(raw.area);

  return {
    district,
    address: raw.address,
    price,
    areaSqm: area ?? undefined,
    pricePerSqm: area && area > 0 ? Math.round(price / area) : undefined,
    bedrooms: raw.bedrooms ? Number(raw.bedrooms) : undefined,
    bathrooms: raw.bathrooms ? Number(raw.bathrooms) : undefined,
    propertyType: 'Departamento',
    sourceUrl: raw.url,
    sourceId: raw.sourceId,
  };
}
