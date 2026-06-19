import { prisma } from '../../index';
import { geminiEnabled, getFlashModel } from '../geminiClient';
import { getBcrpData } from '../../data/bcrpData';

export interface CommercialResult {
  response: string;
  extractedPhone: string | null;
  extractedBudget: number | null;
  leadCreated: boolean;
  userId: string | null;
  latencyMs: number;
}

const PHONE_REGEX = /\b(9\d{8})\b/;
const SOL_TO_USD = 1 / 3.77; // tipo de cambio referencial

// ─── Extractores NLP para modo sin Gemini ────────────────────────────────────

function capitalizeName(raw: string): string {
  return raw.trim().split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function extractName(text: string): string | null {
  // Declaración explícita: "me llamo X Y", "soy X Y", "mi nombre es X Y"
  const explicit = text.match(
    /(?:me\s+llamo|soy|mi\s+nombre\s+(?:es)?)\s+([A-Za-záéíóúñÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-Za-záéíóúñÁÉÍÓÚÑ][a-záéíóúñ]+)*)/i
  );
  if (explicit) return capitalizeName(explicit[1]);

  // Mensaje que es SOLO palabras (2+), sin números ni signos — cualquier capitalización
  const justName = text.trim().match(/^([a-záéíóúñ]+(?:\s+[a-záéíóúñ]+)+)$/i);
  if (justName) return capitalizeName(justName[1]);

  return null;
}

const DISTRICT_MAP: Record<string, string> = {
  'miraflores': 'Miraflores',
  'lince': 'Lince',
  'jesús maría': 'Jesús María',
  'jesus maria': 'Jesús María',
  'san isidro': 'San Isidro',
  'barranco': 'Barranco',
  'surco': 'Surco',
  'san borja': 'San Borja',
  'pueblo libre': 'Pueblo Libre',
  'magdalena': 'Magdalena del Mar',
  'san miguel': 'San Miguel',
  'la molina': 'La Molina',
};

function extractDistrict(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [key, val] of Object.entries(DISTRICT_MAP)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

function parseBudget(text: string): { amount: number; currency: 'USD' | 'SOL' } | null {
  // 1. Detectar "N mil dólares/dolares" primero (e.g. "150 mil dólares")
  const milUsdMatch = text.match(/(\d[\d,\.]*)\s*mil\s+(?:d[oó]lar(?:es)?|dolares?)/i);
  if (milUsdMatch) {
    const n = Number(milUsdMatch[1].replace(/[,\.]/g, '')) * 1000;
    if (n > 1000) return { amount: n, currency: 'USD' };
  }
  // 2. Detectar "USD N" o "N dólares" o "dólares N"
  const usdMatch = text.match(/usd\s?([\d,\.]+)|(?:d[oó]lar(?:es)?|dolares?)\s+(?:de\s+)?([\d,\.]+)|([\d,\.]+)\s+(?:d[oó]lar(?:es)?|dolares?)/i);
  if (usdMatch) {
    const raw = (usdMatch[1] ?? usdMatch[2] ?? usdMatch[3]).replace(/[,\.]/g, '');
    const n = Number(raw);
    if (n > 1000) return { amount: n, currency: 'USD' };
  }
  // 3. Detectar "S/ N"
  const solMatch = text.match(/s\/\s?([\d,\.]+)/i);
  if (solMatch) {
    const n = Number(solMatch[1].replace(/[,\.]/g, ''));
    if (n > 1000) return { amount: n, currency: 'SOL' };
  }
  // 4. Detectar "N mil" sin moneda → soles
  const milMatch = text.match(/(\d[\d,\.]*)\s*mil\b/i);
  if (milMatch) return { amount: Number(milMatch[1].replace(/[,\.]/g, '')) * 1000, currency: 'SOL' };
  return null;
}

interface GeminiExtraction {
  phone: string | null;
  budget: number | null;
  currency: 'USD' | 'SOL';
  name: string | null;
  district: string | null;
  response: string;
}

async function geminiCommercial(
  message: string,
  history: Array<{ role: string; content: string }>
): Promise<GeminiExtraction> {
  const flash = getFlashModel(true);
  const historyText = history.slice(-6).map((h) => `${h.role === 'user' ? 'Usuario' : 'Asistente'}: ${h.content}`).join('\n');

  const prompt = `Eres el Agente Comercial de InmoData IA. Tu objetivo es calificar leads inmobiliarios de forma natural y conversacional en Lima, Perú.

HISTORIAL DE CONVERSACIÓN:
${historyText || '(inicio)'}

MENSAJE ACTUAL DEL USUARIO: "${message}"

INSTRUCCIONES:
1. Extrae de TODA la conversación (no solo el mensaje actual):
   - name: nombre propio del usuario (ej: "Juan", "María Fernanda"). null si no se mencionó.
   - phone: teléfono peruano, 9 dígitos comenzando con 9 (ej: 987654321). null si no se mencionó.
   - budget: monto numérico del presupuesto. null si no se mencionó.
   - currency: "USD" si dijo dólares/USD, "SOL" si dijo soles/S/. Default "SOL".
   - district: distrito de Lima que busca (ej: "Miraflores", "Lince", "Jesús María"). null si no se mencionó.

2. ORDEN DE RECOLECCIÓN (pregunta de a uno a la vez, de forma conversacional):
   a. Si no tienes presupuesto → pregunta el presupuesto y la moneda.
   b. Si no tienes nombre → pregunta el nombre.
   c. Si no tienes teléfono → pide el celular.
   d. Si no tienes distrito → pregunta en qué zona de Lima busca.
   e. Si tienes los 4 datos → confirma entusiastamente que un corredor los contactará pronto.

3. Responde siempre en español peruano natural y amigable. Nunca pidas dos datos a la vez.

Devuelve SOLO JSON válido:
{
  "phone": "987654321" | null,
  "budget": 100000 | null,
  "currency": "USD" | "SOL",
  "name": "Juan" | null,
  "district": "Miraflores" | null,
  "response": "tu respuesta aquí"
}`;

  const result = await flash.generateContent(prompt);
  const text = result.response.text();
  const parsed = JSON.parse(text) as GeminiExtraction;
  if (!parsed.currency) parsed.currency = 'SOL'; // fallback seguro
  return parsed;
}

export async function commercialAgent(
  message: string,
  history: Array<{ role: string; content: string }>,
  sessionId: string,
  existingUserId?: string
): Promise<CommercialResult> {
  const start = Date.now();
  const fullText = [...history.map((h) => h.content), message].join(' ');

  let phone: string | null = null;
  let budget: number | null = null;
  let currency: 'USD' | 'SOL' = 'SOL';
  let name: string | null = null;
  let district: string | null = null;
  let responseText: string;

  if (geminiEnabled) {
    try {
      const extracted = await geminiCommercial(message, history);
      phone    = extracted.phone;
      budget   = extracted.budget;
      currency = extracted.currency ?? 'SOL';
      name     = extracted.name;
      district = extracted.district;
    } catch (err: unknown) {
      console.error('[CommercialAgent] Gemini error:', err instanceof Error ? err.message : String(err));
    }
  }

  // NLP fallback: rellenar campos que Gemini no extrajo (o Gemini está offline)
  if (!phone)  phone = fullText.match(PHONE_REGEX)?.[1] ?? null;
  if (!budget) {
    const nlp = parseBudget(fullText);
    if (nlp) { budget = nlp.amount; currency = nlp.currency; }
  }
  if (!district) district = extractDistrict(fullText) ?? null;

  // Para el nombre: buscar primero en el mensaje actual, luego en el historial del usuario
  if (!name) {
    const userMessages = [message, ...history.filter((h) => h.role === 'user').map((h) => h.content).reverse()];
    for (const msg of userMessages) {
      const found = extractName(msg);
      if (found) { name = found; break; }
    }
  }

  if (phone && budget && name && district) {
    responseText = await buildConfirmationWithProperties(phone, budget, currency, name, district);
  } else {
    responseText = buildFallbackResponse(phone, budget, name, district, history.length);
  }

  let leadCreated = false;
  let userId = existingUserId ?? null;

  // Crear lead cuando tenemos al menos teléfono + presupuesto (nombre y zona enriquecen si están)
  if (phone && budget) {
    let user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name: name ?? undefined,
          budgetMax: budget,
          source: 'chat',
          qualificationStatus: 'QUALIFIED',
          districtOfInterest: district ?? undefined,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          phone: phone ?? undefined,
          name: name ?? user.name ?? undefined,
          budgetMax: budget ?? undefined,
          qualificationStatus: 'QUALIFIED',
          districtOfInterest: district ?? user.districtOfInterest ?? undefined,
        },
      });
    }
    userId = user.id;

    const budgetUsdForLead = currency === 'USD' ? budget : (budget ?? 0) * SOL_TO_USD;
    const existingLead = await prisma.lead.findFirst({ where: { chatSessionId: sessionId } });
    if (!existingLead) {
      await prisma.lead.create({
        data: {
          userId: user.id,
          chatSessionId: sessionId,
          budgetExtracted: budgetUsdForLead,
          phone,
          districtSought: district ?? undefined,
          status: 'NEW',
          salePriceSOL: 320,
        },
      });
      leadCreated = true;
    } else {
      // Actualizar el lead existente con cualquier dato nuevo disponible
      const needsUpdate =
        (phone   && existingLead.phone            !== phone) ||
        (district && existingLead.districtSought  !== district) ||
        (budgetUsdForLead > 0 && existingLead.budgetExtracted !== budgetUsdForLead);
      if (needsUpdate) {
        await prisma.lead.update({
          where: { id: existingLead.id },
          data: {
            ...(phone            && { phone }),
            ...(district         && { districtSought: district }),
            ...(budgetUsdForLead > 0 && { budgetExtracted: budgetUsdForLead }),
          },
        });
      }
    }
  }

  const latencyMs = Date.now() - start;
  await prisma.agentLog.create({
    data: { agent: 'COMERCIAL', latencyMs, precision: leadCreated ? 1 : 0.35, volume: 1 },
  }).catch(() => {});

  return { response: responseText, extractedPhone: phone, extractedBudget: budget, leadCreated, userId, latencyMs };
}

/** Construye la respuesta de confirmación con propiedades reales sugeridas */
async function buildConfirmationWithProperties(
  phone: string,
  budget: number,
  currency: 'USD' | 'SOL',
  name: string | null,
  district: string | null,
): Promise<string> {

  // Presupuesto en USD (para comparar con BCRP y buscar propiedades)
  const budgetUsd = currency === 'USD' ? budget : budget * SOL_TO_USD;

  // Buscar propiedades en rango ±25% del presupuesto USD
  // La BD mezcla precios USD y SOL; buscamos ambos rangos
  const usdMin = budgetUsd * 0.75;
  const usdMax = budgetUsd * 1.25;
  const solMin = usdMin / SOL_TO_USD;
  const solMax = usdMax / SOL_TO_USD;

  const props = await prisma.property.findMany({
    where: {
      isActive: true,
      OR: [
        // Propiedades con precio en rango USD
        { price: { gte: usdMin, lte: usdMax } },
        // Propiedades con precio en rango SOL equivalente
        { price: { gte: solMin, lte: solMax } },
      ],
      ...(district ? { district } : {}),
    },
    orderBy: { price: 'asc' },
    take: 3,
    select: { address: true, district: true, price: true, areaSqm: true, bedrooms: true, source: true },
  });

  const bcrpRef = district ? getBcrpData(district) : null;

  const budgetLabel = currency === 'USD'
    ? `USD ${budget.toLocaleString('en-US')}`
    : `S/ ${budget.toLocaleString('es-PE')}`;

  const greeting = name ? `, **${name}**` : '';
  let text = `✅ **¡Todo listo${greeting}!** Un corredor especialista te llamará al **${phone}**.\n\n`;
  if (name)     text += `👤 Nombre: **${name}**\n`;
  if (district) text += `📍 Zona de interés: **${district}**\n`;
  text += `💰 Presupuesto: **${budgetLabel}**\n`;

  if (bcrpRef && district) {
    const sqmApprox = Math.round(budgetUsd / bcrpRef.salePriceUsdPerSqm);
    text += `📐 Con ese presupuesto puedes acceder a ~**${sqmApprox} m²** en ${district} (ref. BCRP IVT 2025)\n`;
  }

  if (props.length > 0) {
    text += `\n🏠 **Propiedades que coinciden con tu búsqueda:**\n`;
    props.forEach((p) => {
      // Heurístico: en Lima, precios USD de dptos van de ~$50k a ~$800k
      // Precios en SOL empiezan desde ~S/180k. Umbral: <700k → USD, >=700k → SOL
      const isUsd = p.price < 700_000;
      const priceLabel = isUsd
        ? `USD ${Math.round(p.price).toLocaleString('en-US')}`
        : `S/ ${Math.round(p.price).toLocaleString('es-PE')}`;
      const dorms = p.bedrooms ? `${p.bedrooms} dorm.` : '';
      // Limpiar dirección: quitar sufijos ", Lima" redundantes
      const addr = (p.address ?? p.district)
        .replace(/,\s*(Lima|Perú|Peru)\s*$/i, '')
        .trim();
      const features = [p.areaSqm ? `${p.areaSqm}m²` : null, dorms || null].filter(Boolean).join(' | ');
      text += `• ${addr} | ${features} | ${priceLabel} _(${p.source})_\n`;
    });
  } else {
    text += `\n📋 El corredor te presentará opciones actualizadas según tu perfil.`;
  }

  return text;
}

function buildFallbackResponse(
  phone: string | null, budget: number | null,
  name: string | null, district: string | null,
  turns: number
): string {
  if (!budget)   return '¿Cuál es tu presupuesto aproximado? Puede ser en soles o dólares.';
  if (!name)     return '¡Perfecto! ¿Cuál es tu nombre para personalizar la atención?';
  if (!phone)    return `Gracias, ${name}. ¿Me compartes tu número de celular para que el corredor te contacte?`;
  if (!district) return '¿En qué zona o distrito de Lima estás buscando?';
  return prompts[turns % prompts.length];
}

const prompts = [
  '¿Tienes un presupuesto aproximado en mente para esta propiedad?',
  '¿Te gustaría que un especialista de la zona te contacte?',
];
