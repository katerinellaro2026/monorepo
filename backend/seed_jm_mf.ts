/**
 * Seed manual para Jesús María y Miraflores.
 * Precios basados en BCRP Nota de Estudios No. 16 IVT Q4 2025.
 * Jesús María: mediana $2,086/m² | Miraflores: mediana $2,400/m²
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const properties = [
  // ── Jesús María ($2,086/m² mediana BCRP IVT 2025) ─────────────────────
  { district: 'Jesús María', price: 146020, areaSqm: 70,  bedrooms: 2, bathrooms: 2, address: 'Av. Salaverry 2150, Jesús María',       source: 'MANUAL', sourceId: 'jm-001' },
  { district: 'Jesús María', price: 187740, areaSqm: 90,  bedrooms: 3, bathrooms: 2, address: 'Av. Gregorio Escobedo 550, Jesús María',  source: 'MANUAL', sourceId: 'jm-002' },
  { district: 'Jesús María', price: 125160, areaSqm: 60,  bedrooms: 2, bathrooms: 1, address: 'Ca. Horacio Urteaga 380, Jesús María',   source: 'MANUAL', sourceId: 'jm-003' },
  { district: 'Jesús María', price: 208600, areaSqm: 100, bedrooms: 3, bathrooms: 2, address: 'Av. Brasil 1950, Jesús María',           source: 'MANUAL', sourceId: 'jm-004' },
  { district: 'Jesús María', price: 166880, areaSqm: 80,  bedrooms: 2, bathrooms: 2, address: 'Ca. Huiracocha 240, Jesús María',        source: 'MANUAL', sourceId: 'jm-005' },
  { district: 'Jesús María', price: 229460, areaSqm: 110, bedrooms: 3, bathrooms: 3, address: 'Av. Petit Thouars 3450, Jesús María',    source: 'MANUAL', sourceId: 'jm-006' },
  { district: 'Jesús María', price: 135590, areaSqm: 65,  bedrooms: 2, bathrooms: 1, address: 'Ca. Chota 182, Jesús María',             source: 'MANUAL', sourceId: 'jm-007' },
  { district: 'Jesús María', price: 177310, areaSqm: 85,  bedrooms: 3, bathrooms: 2, address: 'Av. Cuba 180, Jesús María',              source: 'MANUAL', sourceId: 'jm-008' },
  { district: 'Jesús María', price: 250320, areaSqm: 120, bedrooms: 4, bathrooms: 3, address: 'Av. Arequipa 4800, Jesús María',         source: 'MANUAL', sourceId: 'jm-009' },
  { district: 'Jesús María', price: 114730, areaSqm: 55,  bedrooms: 1, bathrooms: 1, address: 'Ca. Manuel Segura 310, Jesús María',     source: 'MANUAL', sourceId: 'jm-010' },

  // ── Miraflores ($2,400/m² mediana BCRP IVT 2025) ──────────────────────
  { district: 'Miraflores',  price: 168000, areaSqm: 70,  bedrooms: 2, bathrooms: 2, address: 'Ca. Tarata 280, Miraflores',             source: 'MANUAL', sourceId: 'mf-001' },
  { district: 'Miraflores',  price: 216000, areaSqm: 90,  bedrooms: 2, bathrooms: 2, address: 'Av. Larco 1450, Miraflores',             source: 'MANUAL', sourceId: 'mf-002' },
  { district: 'Miraflores',  price: 288000, areaSqm: 120, bedrooms: 3, bathrooms: 3, address: 'Malecón de la Reserva 920, Miraflores',  source: 'MANUAL', sourceId: 'mf-003' },
  { district: 'Miraflores',  price: 144000, areaSqm: 60,  bedrooms: 1, bathrooms: 1, address: 'Ca. Shell 490, Miraflores',              source: 'MANUAL', sourceId: 'mf-004' },
  { district: 'Miraflores',  price: 240000, areaSqm: 100, bedrooms: 3, bathrooms: 2, address: 'Av. Benavides 3200, Miraflores',         source: 'MANUAL', sourceId: 'mf-005' },
  { district: 'Miraflores',  price: 192000, areaSqm: 80,  bedrooms: 2, bathrooms: 2, address: 'Av. 28 de Julio 545, Miraflores',        source: 'MANUAL', sourceId: 'mf-006' },
  { district: 'Miraflores',  price: 336000, areaSqm: 140, bedrooms: 4, bathrooms: 3, address: 'Ca. Alcanfores 620, Miraflores',         source: 'MANUAL', sourceId: 'mf-007' },
  { district: 'Miraflores',  price: 120000, areaSqm: 50,  bedrooms: 1, bathrooms: 1, address: 'Ca. Berlín 420, Miraflores',             source: 'MANUAL', sourceId: 'mf-008' },
  { district: 'Miraflores',  price: 360000, areaSqm: 150, bedrooms: 4, bathrooms: 4, address: 'Malecón Cisneros 1100, Miraflores',      source: 'MANUAL', sourceId: 'mf-009' },
  { district: 'Miraflores',  price: 264000, areaSqm: 110, bedrooms: 3, bathrooms: 2, address: 'Av. Reducto 1650, Miraflores',           source: 'MANUAL', sourceId: 'mf-010' },
];

async function main() {
  let inserted = 0;
  for (const p of properties) {
    const exists = await prisma.property.findFirst({ where: { sourceId: p.sourceId } });
    if (exists) continue;
    await prisma.property.create({
      data: {
        district:  p.district,
        price:     p.price,
        areaSqm:   p.areaSqm,
        bedrooms:  p.bedrooms,
        bathrooms: p.bathrooms,
        address:   p.address,
        source:    p.source,
        sourceId:  p.sourceId,
      },
    });
    inserted++;
  }
  console.log(`Insertadas ${inserted} propiedades de referencia para JM y Miraflores.`);
}
main().catch(console.error).finally(() => process.exit(0));
