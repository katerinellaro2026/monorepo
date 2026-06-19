import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const deleted = await prisma.property.deleteMany({});
  console.log(`Eliminadas ${deleted.count} propiedades. BD limpia.`);
}
main().catch(console.error).finally(() => process.exit(0));
