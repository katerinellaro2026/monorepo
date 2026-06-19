import { PrismaClient, PropertySource, UserRole, PaymentMethod, TransactionType, SubscriptionPlan, AgentType, ChatOutcome, LeadStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding InmoData IA database...');

  // ── Users ──────────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@inmodata.ia' },
    update: {},
    create: {
      email: 'admin@inmodata.ia',
      name: 'CEO InmoData',
      role: UserRole.ADMIN,
      passwordHash: '$2b$10$placeholder_hash_change_before_prod',
    },
  });

  const brokers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'carlos.mendoza@corredor.pe' },
      update: {},
      create: {
        email: 'carlos.mendoza@corredor.pe',
        name: 'Carlos Mendoza',
        phone: '999000001',
        role: UserRole.BROKER,
        districtOfInterest: 'Miraflores',
      },
    }),
    prisma.user.upsert({
      where: { email: 'sofia.rios@nexo.pe' },
      update: {},
      create: {
        email: 'sofia.rios@nexo.pe',
        name: 'Sofía Ríos Paredes',
        phone: '999000002',
        role: UserRole.BROKER,
        districtOfInterest: 'Jesús María',
      },
    }),
  ]);

  const buyers = await Promise.all(
    [
      { name: 'María García', phone: '912345001', budget: 180000, district: 'Lince' },
      { name: 'Pedro Flores', phone: '912345002', budget: 250000, district: 'Jesús María' },
      { name: 'Ana Torres',   phone: '912345003', budget: 420000, district: 'Miraflores' },
      { name: 'Luis Chávez',  phone: '912345004', budget: 195000, district: 'Lince' },
      { name: 'Rosa Huamán',  phone: '912345005', budget: 280000, district: 'Jesús María' },
    ].map((b) =>
      prisma.user.create({
        data: {
          name: b.name,
          phone: b.phone,
          budgetMax: b.budget,
          districtOfInterest: b.district,
          role: UserRole.BUYER,
          source: 'chat',
        },
      })
    )
  );

  // ── Subscriptions ──────────────────────────────────────────────────────────
  await Promise.all(
    brokers.map((b, i) =>
      prisma.subscription.upsert({
        where: { userId: b.id },
        update: {},
        create: {
          userId: b.id,
          plan: SubscriptionPlan.PRO,
          mrrSOL: 150,
          startedAt: new Date(Date.now() - (i + 1) * 30 * 24 * 60 * 60 * 1000),
        },
      })
    )
  );

  // ── Properties ─────────────────────────────────────────────────────────────
  const propertySeed = [
    { district: 'Lince',       price: 215000, areaSqm: 65,  source: PropertySource.URBANIA,      address: 'Av. Arequipa 2400' },
    { district: 'Lince',       price: 198000, areaSqm: 58,  source: PropertySource.ADONDEVIVIR,  address: 'Jr. Risso 340' },
    { district: 'Lince',       price: 230000, areaSqm: 70,  source: PropertySource.URBANIA,      address: 'Ca. Manuel Candamo 156' },
    { district: 'Jesús María', price: 290000, areaSqm: 78,  source: PropertySource.URBANIA,      address: 'Av. Salaverry 1800' },
    { district: 'Jesús María', price: 275000, areaSqm: 72,  source: PropertySource.ADONDEVIVIR,  address: 'Ca. Horacio Urteaga 620' },
    { district: 'Jesús María', price: 315000, areaSqm: 85,  source: PropertySource.URBANIA,      address: 'Av. Petit Thouars 3100' },
    { district: 'Miraflores',  price: 435000, areaSqm: 90,  source: PropertySource.URBANIA,      address: 'Av. Larco 1200' },
    { district: 'Miraflores',  price: 480000, areaSqm: 105, source: PropertySource.ADONDEVIVIR,  address: 'Ca. Schell 380' },
    { district: 'Miraflores',  price: 520000, areaSqm: 115, source: PropertySource.URBANIA,      address: 'Malecón de la Reserva 610' },
    { district: 'Miraflores',  price: 395000, areaSqm: 82,  source: PropertySource.ADONDEVIVIR,  address: 'Av. Benavides 2900' },
  ];

  await prisma.property.createMany({
    data: propertySeed.map((p) => ({
      ...p,
      pricePerSqm: p.price / p.areaSqm,
      bedrooms: Math.floor(p.areaSqm / 25),
      bathrooms: 2,
      propertyType: 'Departamento',
      isActive: true,
    })),
    skipDuplicates: true,
  });

  // ── Chat Sessions + Leads ──────────────────────────────────────────────────
  for (const buyer of buyers.slice(0, 3)) {
    const session = await prisma.chatSession.create({
      data: {
        userId: buyer.id,
        outcome: ChatOutcome.LEAD_QUALIFIED,
        messages: [
          { role: 'user', content: `Hola, busco un departamento en ${buyer.districtOfInterest}` },
          { role: 'assistant', content: `Con gusto te ayudo. ¿Cuál es tu presupuesto aproximado?` },
          { role: 'user', content: `Tengo hasta S/ ${buyer.budgetMax?.toLocaleString('es-PE')}` },
          { role: 'assistant', content: `Perfecto. Basado en el mercado actual en ${buyer.districtOfInterest}, encontré departamentos de 65–80 m² en ese rango. ¿Me compartes tu número para coordinarte con un corredor?` },
          { role: 'user', content: buyer.phone ?? '' },
        ],
      },
    });

    await prisma.lead.create({
      data: {
        userId: buyer.id,
        chatSessionId: session.id,
        budgetExtracted: buyer.budgetMax,
        phone: buyer.phone,
        districtSought: buyer.districtOfInterest,
        status: LeadStatus.NEW,
        salePriceSOL: 320,
      },
    });
  }

  // ── Transactions ──────────────────────────────────────────────────────────
  const txData = [
    { clientName: 'Inmobiliaria Pacífico', type: TransactionType.LEAD,         amountSOL: 320, paymentMethod: PaymentMethod.CREDIT_CARD },
    { clientName: 'Carlos Mendoza',        type: TransactionType.SUBSCRIPTION, amountSOL: 150, paymentMethod: PaymentMethod.BANK_TRANSFER },
    { clientName: 'Grupo Habitat Perú',    type: TransactionType.LEAD,         amountSOL: 480, paymentMethod: PaymentMethod.YAPE_PLIN },
    { clientName: 'Sofía Ríos Paredes',    type: TransactionType.SUBSCRIPTION, amountSOL: 150, paymentMethod: PaymentMethod.CREDIT_CARD },
    { clientName: 'Nexo Inmobiliario SAC', type: TransactionType.LEAD,         amountSOL: 640, paymentMethod: PaymentMethod.BANK_TRANSFER },
  ];

  await prisma.transaction.createMany({
    data: txData.map((t, i) => ({
      ...t,
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
    })),
    skipDuplicates: true,
  });

  // ── Agent Logs ─────────────────────────────────────────────────────────────
  const agentLogData = [
    { agent: AgentType.TRIAJE,      latencyMs: 42,  precision: 0.964, volume: 4821 },
    { agent: AgentType.ANALISTA,    latencyMs: 1300, precision: 0.91,  volume: 1247 },
    { agent: AgentType.COMERCIAL,   latencyMs: 380,  precision: 0.346, volume: 89 },
    { agent: AgentType.SOPORTE_B2B, latencyMs: 2100, precision: 0.942, volume: 23 },
  ];

  await prisma.agentLog.createMany({
    data: agentLogData,
    skipDuplicates: false,
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
