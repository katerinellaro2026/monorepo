/**
 * Datos BCRP — Nota de Estudios No. 16, 09 de marzo de 2026
 * Indicadores del Mercado Inmobiliario IVT 2025 (Q4 2025)
 * Fuente: Urbania / Elaboración BCRP
 *
 * Cuadro 5: Precio de venta US$/m²
 * Cuadro 6: Alquiler anual US$/m²
 * Cuadro 4: PER (años para recuperar inversión via alquiler)
 */

export interface BcrpDistrictData {
  district: string;
  sector: 'altos' | 'medios';
  /** Precio de venta mediana en US$/m² — IVT 2025 */
  salePriceUsdPerSqm: number;
  /** Alquiler anual en US$/m² — IVT 2025 */
  annualRentUsdPerSqm: number;
  /** PER: años para recuperar inversión via alquiler — IVT 2025 */
  per: number;
}

export const BCRP_IVT_2025: BcrpDistrictData[] = [
  // ── Sector Ingresos Altos ────────────────────────────────────────────────────
  { district: 'San Isidro',   sector: 'altos',  salePriceUsdPerSqm: 2273, annualRentUsdPerSqm: 143, per: 15.9 },
  { district: 'Miraflores',   sector: 'altos',  salePriceUsdPerSqm: 2400, annualRentUsdPerSqm: 137, per: 17.5 },
  { district: 'Barranco',     sector: 'altos',  salePriceUsdPerSqm: 2463, annualRentUsdPerSqm: 161, per: 15.3 },
  { district: 'San Borja',    sector: 'altos',  salePriceUsdPerSqm: 2000, annualRentUsdPerSqm: 110, per: 18.1 },
  { district: 'Surco',        sector: 'altos',  salePriceUsdPerSqm: 1873, annualRentUsdPerSqm: 94,  per: 19.8 },
  { district: 'La Molina',    sector: 'altos',  salePriceUsdPerSqm: 1392, annualRentUsdPerSqm: 90,  per: 15.4 },
  // ── Sector Ingresos Medios ───────────────────────────────────────────────────
  { district: 'Jesús María',  sector: 'medios', salePriceUsdPerSqm: 2086, annualRentUsdPerSqm: 125, per: 16.7 },
  { district: 'Lince',        sector: 'medios', salePriceUsdPerSqm: 1970, annualRentUsdPerSqm: 132, per: 15.0 },
  { district: 'Magdalena',    sector: 'medios', salePriceUsdPerSqm: 1880, annualRentUsdPerSqm: 116, per: 16.2 },
  { district: 'Pueblo Libre', sector: 'medios', salePriceUsdPerSqm: 1717, annualRentUsdPerSqm: 115, per: 14.9 },
  { district: 'San Miguel',   sector: 'medios', salePriceUsdPerSqm: 1697, annualRentUsdPerSqm: 100, per: 16.9 },
  { district: 'Surquillo',    sector: 'medios', salePriceUsdPerSqm: 1849, annualRentUsdPerSqm: 128, per: 14.4 },
];

/** Promedios ponderados del mercado — IVT 2025 */
export const BCRP_MARKET_AVERAGES = {
  /** Promedio 12 distritos — US$/m² venta */
  allDistricts: { salePriceUsdPerSqm: 1967, annualRentUsdPerSqm: 121, per: 16.3 },
  /** Sector altos — US$/m² venta */
  sectorAltos:  { salePriceUsdPerSqm: 2090, annualRentUsdPerSqm: 143, per: 15.6 },
  /** Sector medios — US$/m² venta */
  sectorMedios: { salePriceUsdPerSqm: 1868, annualRentUsdPerSqm: 121, per: 15.7 },
};

export function getBcrpData(district: string): BcrpDistrictData | null {
  const normalized = district.trim();
  return (
    BCRP_IVT_2025.find(
      (d) => d.district.toLowerCase() === normalized.toLowerCase()
    ) ?? null
  );
}

/**
 * Evalúa un precio de venta vs la referencia BCRP.
 * Devuelve variación porcentual y etiqueta semafórica.
 */
export function evaluateSalePrice(
  priceUsd: number,
  areaSqm: number,
  district: string
): { pricePerSqm: number; referencePerSqm: number; diffPct: number; label: string; source: string } | null {
  const ref = getBcrpData(district);
  if (!ref) return null;

  const pricePerSqm = priceUsd / areaSqm;
  const diffPct = ((pricePerSqm - ref.salePriceUsdPerSqm) / ref.salePriceUsdPerSqm) * 100;

  let label: string;
  if (diffPct > 15)       label = 'significativamente por encima del mercado';
  else if (diffPct > 5)   label = 'por encima del mercado';
  else if (diffPct > -5)  label = 'en línea con el mercado';
  else if (diffPct > -15) label = 'por debajo del mercado';
  else                    label = 'significativamente por debajo del mercado';

  return {
    pricePerSqm: Math.round(pricePerSqm),
    referencePerSqm: ref.salePriceUsdPerSqm,
    diffPct: Math.round(diffPct * 10) / 10,
    label,
    source: 'BCRP Nota de Estudios No. 16 — IVT 2025',
  };
}

/**
 * Evalúa un precio de alquiler mensual vs la referencia BCRP.
 */
export function evaluateRentPrice(
  monthlyRentUsd: number,
  areaSqm: number,
  district: string
): { rentPerSqmMonthly: number; referencePerSqmMonthly: number; diffPct: number; label: string; source: string } | null {
  const ref = getBcrpData(district);
  if (!ref) return null;

  const rentPerSqmMonthly = monthlyRentUsd / areaSqm;
  const refMonthly = ref.annualRentUsdPerSqm / 12;
  const diffPct = ((rentPerSqmMonthly - refMonthly) / refMonthly) * 100;

  let label: string;
  if (diffPct > 15)       label = 'significativamente por encima del mercado';
  else if (diffPct > 5)   label = 'por encima del mercado';
  else if (diffPct > -5)  label = 'en línea con el mercado';
  else if (diffPct > -15) label = 'por debajo del mercado';
  else                    label = 'significativamente por debajo del mercado';

  return {
    rentPerSqmMonthly: Math.round(rentPerSqmMonthly * 100) / 100,
    referencePerSqmMonthly: Math.round(refMonthly * 100) / 100,
    diffPct: Math.round(diffPct * 10) / 10,
    label,
    source: 'BCRP Nota de Estudios No. 16 — IVT 2025',
  };
}
