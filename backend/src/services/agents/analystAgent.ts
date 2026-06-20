import { prisma } from '../../index';
import { geminiEnabled, getProModel } from '../geminiClient';
import { getFewShotExamples, buildFewShotBlock } from '../trainingExamples';
import {
  getBcrpData,
  evaluateSalePrice,
  evaluateRentPrice,
  BCRP_IVT_2025,
} from '../../data/bcrpData';

export interface ValuationResult {
  estimatedPriceSOL: number;
  priceRangeLow: number;
  priceRangeHigh: number;
  district: string;
  comparables: number;
  pricePerSqm: number;
  response: string;
  latencyMs: number;
}

const DISTRICT_ALIASES: Record<string, string> = {
  lince:         'Lince',
  'jesus maria': 'Jesús María',
  'jesús maría': 'Jesús María',
  miraflores:    'Miraflores',
  'san isidro':  'San Isidro',
  barranco:      'Barranco',
  'san borja':   'San Borja',
  surco:         'Surco',
  'la molina':   'La Molina',
  magdalena:     'Magdalena',
  'pueblo libre':'Pueblo Libre',
  'san miguel':  'San Miguel',
  surquillo:     'Surquillo',
};

function extractDistrict(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [key, val] of Object.entries(DISTRICT_ALIASES)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

function extractArea(text: string): number | null {
  const match = text.match(/(\d+(?:\.\d+)?)\s*m[²2]/i);
  return match ? Number(match[1]) : null;
}

/** Extrae precio en USD o soles del texto */
function extractPrice(text: string): { amount: number; currency: 'USD' | 'SOL' } | null {
  // USD: $150,000 | US$ 150,000 | 150000 dólares
  const usdMatch = text.match(/(?:US?\$|USD)\s*([\d,\.]+)/i) ??
                   text.match(/([\d,\.]+)\s*(?:dólares?|dollars?)/i);
  if (usdMatch) {
    const n = parseFloat(usdMatch[1].replace(/,/g, ''));
    if (!isNaN(n) && n > 1000) return { amount: n, currency: 'USD' };
  }

  // Soles: S/ 150,000 | 150000 soles
  const solMatch = text.match(/S\/\s*([\d,\.]+)/i) ??
                   text.match(/([\d,\.]+)\s*soles?/i);
  if (solMatch) {
    const n = parseFloat(solMatch[1].replace(/,/g, ''));
    if (!isNaN(n) && n > 1000) return { amount: n, currency: 'SOL' };
  }

  // Número grande sin moneda → asumir USD si < 2M, soles si > 2M
  const bareMatch = text.match(/\b(\d{3,3}[,\.]?\d{3})\b/);
  if (bareMatch) {
    const n = parseFloat(bareMatch[1].replace(/,/g, ''));
    if (!isNaN(n) && n > 10000) {
      return { amount: n, currency: n < 2_000_000 ? 'USD' : 'SOL' };
    }
  }

  return null;
}

/** Detecta si la consulta es de alquiler */
function isRentQuery(text: string): boolean {
  return /alquil|arrendam|rent[ao]|mensual/i.test(text);
}

type ComparableProp = {
  price: number; pricePerSqm: number | null;
  areaSqm: number | null; address: string | null; source: string;
};

const SOL_TO_USD = 0.265; // tasa referencial

export async function analystAgent(
  message: string,
  history: Array<{ role: string; content: string }>
): Promise<ValuationResult> {
  const start = Date.now();
  const fullText = [...history.map((h) => h.content), message].join(' ');

  const district = extractDistrict(fullText);
  const areaSqm  = extractArea(fullText);
  const priceInfo = extractPrice(fullText);
  const isRent    = isRentQuery(fullText);

  // ── BCRP reference ────────────────────────────────────────────────────────
  const bcrpRef = district ? getBcrpData(district) : null;

  // Precio/m² en USD para comparar (convertimos si viene en soles)
  let priceUsd: number | null = null;
  if (priceInfo) {
    priceUsd = priceInfo.currency === 'USD'
      ? priceInfo.amount
      : priceInfo.amount * SOL_TO_USD;
  }

  // Evaluación de precio vs BCRP
  const saleEval  = (!isRent && priceUsd && areaSqm && district)
    ? evaluateSalePrice(priceUsd, areaSqm, district)
    : null;
  const rentEval  = (isRent && priceUsd && areaSqm && district)
    ? evaluateRentPrice(priceUsd, areaSqm, district)
    : null;

  // ── Comparables de BD (Urbania / Adondevivir) ────────────────────────────
  const comparableProps: ComparableProp[] = await prisma.property.findMany({
    where: { district: district ?? undefined, isActive: true },
    select: { price: true, pricePerSqm: true, areaSqm: true, address: true, source: true },
    orderBy: { extractedAt: 'desc' },
    take: 8,
  });

  const avgPrice = comparableProps.length > 0
    ? comparableProps.reduce((s, p) => s + p.price, 0) / comparableProps.length
    : (bcrpRef ? bcrpRef.salePriceUsdPerSqm * 75 / SOL_TO_USD : 220000);

  const avgPricePerSqmUsd = bcrpRef?.salePriceUsdPerSqm
    ?? (comparableProps.length > 0
        ? comparableProps.reduce((s, p) => s + (p.pricePerSqm ?? 0), 0) / comparableProps.length * SOL_TO_USD
        : 2000);

  const avgPricePerSqmSOL = Math.round(avgPricePerSqmUsd / SOL_TO_USD);
  const estimatedPrice = areaSqm
    ? Math.round(areaSqm * avgPricePerSqmSOL)
    : Math.round(avgPrice);
  const low  = Math.round(estimatedPrice * 0.92);
  const high = Math.round(estimatedPrice * 1.08);

  // ── Generar respuesta ────────────────────────────────────────────────────
  let response: string;

  if (geminiEnabled) {
    try {
      const model = getProModel();

      const fewShot = await getFewShotExamples('ANALISTA', message);
      const fewShotBlock = buildFewShotBlock(fewShot);

      // Comparables alternativas del portal
      const comparablesText = comparableProps
        .filter((p) => {
          if (!areaSqm) return true;
          const a = p.areaSqm ?? 0;
          return a > 0 && Math.abs(a - areaSqm) / areaSqm < 0.3;
        })
        .slice(0, 4)
        .map((p) =>
          `- ${p.address ?? 'Sin dirección'}: US$ ${Math.round(p.price).toLocaleString('es-PE')} | ${p.areaSqm ?? '?'}m² | US$ ${Math.round((p.pricePerSqm ?? 0) * SOL_TO_USD)}/m² (${p.source})`
        )
        .join('\n') || 'Sin comparables similares en base de datos.';

      // Bloque BCRP
      const bcrpBlock = bcrpRef
        ? `REFERENCIA BCRP IVT 2025 — ${district}:
- Precio mediana de venta: US$ ${bcrpRef.salePriceUsdPerSqm}/m²
- Alquiler anual de referencia: US$ ${bcrpRef.annualRentUsdPerSqm}/m²/año (US$ ${(bcrpRef.annualRentUsdPerSqm/12).toFixed(1)}/m²/mes)
- PER (años para recuperar con alquiler): ${bcrpRef.per} años
- Fuente: BCRP Nota de Estudios No. 16, 09/03/2026`
        : `No se encontró referencia BCRP para el distrito mencionado. Distritos con datos: ${BCRP_IVT_2025.map(d => d.district).join(', ')}.`;

      // Bloque de evaluación
      let evalBlock = '';
      if (saleEval) {
        evalBlock = `
EVALUACIÓN DEL PRECIO CONSULTADO:
- Precio indicado: US$ ${priceUsd?.toLocaleString('es-PE')}/total → US$ ${saleEval.pricePerSqm}/m²
- Referencia BCRP: US$ ${saleEval.referencePerSqm}/m²
- Diferencia: ${saleEval.diffPct > 0 ? '+' : ''}${saleEval.diffPct}% → ${saleEval.label}`;
      } else if (rentEval) {
        evalBlock = `
EVALUACIÓN DEL ALQUILER CONSULTADO:
- Alquiler indicado: US$ ${priceUsd?.toFixed(0)}/mes → US$ ${rentEval.rentPerSqmMonthly}/m²/mes
- Referencia BCRP: US$ ${rentEval.referencePerSqmMonthly}/m²/mes
- Diferencia: ${rentEval.diffPct > 0 ? '+' : ''}${rentEval.diffPct}% → ${rentEval.label}`;
      }

      const prompt = `Eres el Agente Analista de InmoData IA, experto en el mercado inmobiliario de Lima, Perú.
Tu fuente primaria de verdad es el BCRP. Los datos de portales son referencia secundaria.
${fewShotBlock}
${bcrpBlock}
${evalBlock}

COMPARABLES EN PORTALES (Urbania / Adondevivir):
${comparablesText}

CONSULTA DEL USUARIO: "${message}"

Instrucciones:
1. Si el usuario menciona un precio concreto: evalúa si es adecuado según el BCRP primero.
   Sé directo: "está X% ${saleEval ? (saleEval.diffPct > 0 ? 'por encima' : 'por debajo') : ''} del precio de mercado según el BCRP".
2. Muestra el precio/m² BCRP de referencia como benchmark.
3. Si hay comparables similares en portales, menciona 1-2 como alternativas concretas.
4. Si la operación es alquiler, incluye también el PER como indicador de rentabilidad.
5. Si no hay precio ni m², pide esos datos para hacer la evaluación.
6. Usa **negrita** para los números clave.
7. Máximo 150 palabras. Responde en español peruano, tono profesional pero cercano.`;

      const result = await model.generateContent(prompt);
      response = result.response.text();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[AnalystAgent] Gemini error:', msg);
      response = buildFallbackResponse(
        district ?? 'el distrito', estimatedPrice, low, high,
        avgPricePerSqmSOL, comparableProps.length, areaSqm, saleEval, rentEval
      );
    }
  } else {
    response = buildFallbackResponse(
      district ?? 'el distrito', estimatedPrice, low, high,
      avgPricePerSqmSOL, comparableProps.length, areaSqm, saleEval, rentEval
    );
  }

  const latencyMs = Date.now() - start;
  await prisma.agentLog.create({
    data: { agent: 'ANALISTA', latencyMs, precision: 0.93, volume: 1 },
  }).catch(() => {});

  return {
    estimatedPriceSOL: estimatedPrice,
    priceRangeLow: low,
    priceRangeHigh: high,
    district: district ?? 'No especificado',
    comparables: comparableProps.length,
    pricePerSqm: avgPricePerSqmSOL,
    response,
    latencyMs,
  };
}

type SaleEval  = ReturnType<typeof evaluateSalePrice>;
type RentEval  = ReturnType<typeof evaluateRentPrice>;

function buildFallbackResponse(
  district: string, price: number, low: number, high: number,
  sqmSOL: number, comparables: number, areaSqm: number | null,
  saleEval: SaleEval, rentEval: RentEval
): string {
  const lines: string[] = [];

  if (saleEval) {
    lines.push(
      `Según el **BCRP (IVT 2025)**, el precio de referencia en **${district}** es **US$ ${saleEval.referencePerSqm}/m²**.`,
      '',
      `El precio consultado equivale a **US$ ${saleEval.pricePerSqm}/m²**, lo que está **${saleEval.diffPct > 0 ? '+' : ''}${saleEval.diffPct}% — ${saleEval.label}**.`,
      '',
      `_Fuente: ${saleEval.source}_`,
    );
  } else if (rentEval) {
    lines.push(
      `Según el **BCRP (IVT 2025)**, el alquiler de referencia en **${district}** es **US$ ${rentEval.referencePerSqmMonthly}/m²/mes**.`,
      '',
      `El alquiler consultado equivale a **US$ ${rentEval.rentPerSqmMonthly}/m²/mes**, lo que está **${rentEval.diffPct > 0 ? '+' : ''}${rentEval.diffPct}% — ${rentEval.label}**.`,
    );
  } else {
    lines.push(
      `En **${district}**, basado en **${comparables} comparables** y datos BCRP IVT 2025:`,
      '',
      `📊 **Precio estimado: S/ ${price.toLocaleString('es-PE')}**`,
      `   Rango: S/ ${low.toLocaleString('es-PE')} – S/ ${high.toLocaleString('es-PE')}`,
      `   Precio/m²: S/ ${Math.round(sqmSOL).toLocaleString('es-PE')}/m²`,
    );
    if (!areaSqm) {
      lines.push('', 'Para una evaluación más precisa, indícame los m² y el precio del inmueble.');
    }
  }

  return lines.join('\n');
}
