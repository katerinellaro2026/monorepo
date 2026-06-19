import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const total = await prisma.property.count();
  const byDistrict = await prisma.property.groupBy({ by: ['district'], _count: true });
  const bySource   = await prisma.property.groupBy({ by: ['source'],   _count: true });
  console.log('Total propiedades:', total);
  byDistrict.forEach((d) => console.log(' ', d.district, ':', d._count));
  bySource.forEach((s) => console.log(' ', s.source, ':', s._count));
}
main().catch(console.error).finally(() => process.exit(0));
