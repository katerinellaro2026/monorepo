import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  // Propiedades sin sourceId = demo del seed
  const demo = await prisma.property.findMany({
    where: { sourceId: null },
    select: { id: true, district: true, price: true, source: true, sourceId: true },
  });
  console.log(`Demo (sin sourceId): ${demo.length}`);
  demo.forEach(p => console.log(' ', p.district, p.price, p.source, p.sourceId));

  // Propiedades con sourceId = scraped reales
  const real = await prisma.property.count({ where: { NOT: { sourceId: null } } });
  console.log(`Reales (con sourceId): ${real}`);
}
main().catch(console.error).finally(() => process.exit(0));
