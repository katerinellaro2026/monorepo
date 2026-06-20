# InmoData IA — Prompt completo para regenerar el proyecto desde cero

> Copia y pega este documento completo como prompt a un LLM para regenerar el monorepo.
> Stack: React + Vite + Tailwind / Fastify + Prisma + PostgreSQL / Gemini AI / Railway.

---

## 1. VISIÓN DEL PRODUCTO

Crea **InmoData IA**, una plataforma PropTech B2B para el mercado inmobiliario de Lima, Perú. El sistema tiene dos caras:

1. **Chat público** (`/chat`) — Un chatbot de IA conversacional que atiende compradores de vivienda: tasa propiedades, compara precios de mercado con datos del BCRP, y califica leads (captura nombre, teléfono, presupuesto y zona).
2. **Dashboard privado** — Panel para CEOs, administradores y corredores inmobiliarios que muestra métricas de negocio, leads calificados, transacciones, subscripciones, y herramientas de análisis estratégico.

Los distritos cubiertos son: **Lince, Jesús María y Miraflores**.

---

## 2. ESTRUCTURA DEL MONOREPO

```
inmodata-ia/                    ← raíz del workspace npm
├── package.json                ← workspaces: ["backend", "frontend", "scraper"]
├── package-lock.json
├── .env.example
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── index.ts            ← entry point Fastify
│       ├── middleware/
│       │   └── auth.ts
│       ├── routes/
│       │   ├── properties.ts
│       │   ├── users.ts
│       │   ├── leads.ts
│       │   ├── subscriptions.ts
│       │   ├── transactions.ts
│       │   ├── chat.ts
│       │   ├── metrics.ts
│       │   ├── scraping.ts
│       │   ├── training.ts
│       │   └── exchange.ts
│       ├── services/
│       │   ├── geminiClient.ts
│       │   ├── exchangeRate.ts
│       │   ├── agentOrchestrator.ts
│       │   └── agents/
│       │       ├── triageAgent.ts
│       │       ├── analystAgent.ts
│       │       ├── commercialAgent.ts
│       │       └── supportAgent.ts
│       └── data/
│           └── bcrpData.ts     ← datos BCRP IVT 2025 hardcodeados
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── types.ts
│       ├── api/
│       │   └── client.ts
│       ├── data/
│       │   └── agentPersonas.ts
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Sidebar.tsx
│       │   │   └── Header.tsx
│       │   └── dashboard/
│       │       ├── KPICard.tsx
│       │       ├── RevenueChart.tsx
│       │       ├── TransactionsTable.tsx
│       │       ├── AgentTelemetry.tsx
│       │       ├── DemandVsSupply.tsx
│       │       ├── DataSources.tsx
│       │       └── ConversionFunnel.tsx
│       └── pages/
│           ├── Login.tsx
│           ├── PublicChat.tsx
│           ├── CommandCenter.tsx
│           ├── ProDashboard.tsx
│           ├── PlanEstrategico.tsx
│           ├── MapaProcesos.tsx
│           ├── SimuladorBSC.tsx
│           ├── EstructuraIA.tsx
│           └── CulturaOrganizacional.tsx
└── scraper/
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts
        ├── scrapers/
        │   ├── urbania.ts
        │   └── adondevivir.ts
        └── utils/
            ├── normalize.ts
            ├── browser.ts
            └── extractCards.ts
```

---

## 3. TECH STACK EXACTO

### Root `package.json`
```json
{
  "name": "inmodata-ia",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["backend", "frontend", "scraper"],
  "scripts": {
    "dev:backend": "npm run dev --workspace=backend",
    "dev:frontend": "npm run dev --workspace=frontend",
    "build": "npm run build --workspace=backend && npm run build --workspace=frontend",
    "db:migrate": "npm run db:migrate --workspace=backend",
    "db:seed": "npm run db:seed --workspace=backend"
  }
}
```

### Backend `package.json`
```json
{
  "name": "backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "prisma generate && tsc",
    "start": "node dist/index.js",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@fastify/cors": "^9.0.1",
    "@fastify/jwt": "^8.0.1",
    "@google/generative-ai": "^0.24.1",
    "@prisma/client": "^5.22.0",
    "fastify": "^4.28.1",
    "prisma": "^5.22.0",
    "typescript": "^5.6.3",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "tsx": "^4.19.2"
  }
}
```

### Frontend `package.json`
```json
{
  "name": "frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "start": "vite preview --host 0.0.0.0 --port ${PORT:-4173}"
  },
  "dependencies": {
    "axios": "^1.7.9",
    "lucide-react": "^0.460.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0",
    "recharts": "^2.13.3"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.15",
    "typescript": "^5.6.3",
    "vite": "^5.4.10"
  }
}
```

### Backend `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noImplicitAny": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Frontend `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "types": ["vite/client"],
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### `vite.config.ts`
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
      '/auth': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
```

---

## 4. BASE DE DATOS — PRISMA SCHEMA COMPLETO

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
  extensions = [pgvector(map: "vector")]
}

enum UserRole              { BUYER BROKER ADMIN }
enum QualificationStatus  { NEW CONTACTED QUALIFIED DISQUALIFIED }
enum LeadStatus            { NEW SOLD DISCARDED }
enum SubscriptionStatus    { ACTIVE CANCELLED TRIAL }
enum SubscriptionPlan      { BASIC PRO ENTERPRISE }
enum TransactionType       { LEAD SUBSCRIPTION }
enum PaymentMethod         { CREDIT_CARD BANK_TRANSFER YAPE_PLIN }
enum PropertySource        { URBANIA ADONDEVIVIR MANUAL }
enum AgentType             { TRIAJE ANALISTA COMERCIAL SOPORTE_B2B }
enum ChatOutcome           { VALUATION_DELIVERED LEAD_QUALIFIED ABANDONED IN_PROGRESS }

model User {
  id                  String              @id @default(cuid())
  name                String?
  email               String?             @unique
  phone               String?
  budgetMin           Float?
  budgetMax           Float?
  districtOfInterest  String?
  propertyType        String?
  source              String?             @default("chat")
  role                UserRole            @default(BUYER)
  qualificationStatus QualificationStatus @default(NEW)
  passwordHash        String?
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt
  chatSessions ChatSession[]
  leads        Lead[]
  subscription Subscription?
  @@map("users")
}

model Property {
  id           String         @id @default(cuid())
  district     String
  address      String?
  zone         String?
  price        Float
  pricePerSqm  Float?
  areaSqm      Float?
  bedrooms     Int?
  bathrooms    Int?
  propertyType String?
  source       PropertySource
  sourceUrl    String?
  sourceId     String?
  extractedAt  DateTime       @default(now())
  isActive     Boolean        @default(true)
  embedding    Unsupported("vector(768)")?
  @@map("properties")
}

model ChatSession {
  id        String      @id @default(cuid())
  userId    String?
  messages  Json        @default("[]")
  agentLogs Json        @default("[]")
  outcome   ChatOutcome @default(IN_PROGRESS)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  user User? @relation(fields: [userId], references: [id])
  lead Lead?
  @@map("chat_sessions")
}

model Lead {
  id              String     @id @default(cuid())
  userId          String
  chatSessionId   String?    @unique
  budgetExtracted Float?     // siempre en USD
  phone           String?
  email           String?
  districtSought  String?
  notes           String?
  status          LeadStatus @default(NEW)
  agencyBuyerId   String?
  salePriceSOL    Float?
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
  user        User         @relation(fields: [userId], references: [id])
  chatSession ChatSession? @relation(fields: [chatSessionId], references: [id])
  transaction Transaction?
  @@map("leads")
}

model Subscription {
  id        String             @id @default(cuid())
  userId    String             @unique
  plan      SubscriptionPlan   @default(PRO)
  status    SubscriptionStatus @default(ACTIVE)
  mrrSOL    Float
  startedAt DateTime           @default(now())
  endsAt    DateTime?
  createdAt DateTime           @default(now())
  updatedAt DateTime           @updatedAt
  user         User          @relation(fields: [userId], references: [id])
  transactions Transaction[]
  @@map("subscriptions")
}

model Transaction {
  id             String          @id @default(cuid())
  type           TransactionType
  clientName     String
  amountSOL      Float
  paymentMethod  PaymentMethod
  leadId         String?         @unique
  subscriptionId String?
  createdAt      DateTime        @default(now())
  lead         Lead?         @relation(fields: [leadId], references: [id])
  subscription Subscription? @relation(fields: [subscriptionId], references: [id])
  @@map("transactions")
}

model AgentLog {
  id        String    @id @default(cuid())
  agent     AgentType
  sessionId String?
  latencyMs Int?
  precision Float?
  volume    Int?
  extraData Json?
  createdAt DateTime  @default(now())
  @@map("agent_logs")
}
```

> **Nota Supabase/pgbouncer**: `DATABASE_URL` usa el connection pooler (`?pgbouncer=true`), `DIRECT_DATABASE_URL` usa el puerto directo 5432. Prisma necesita ambos cuando se usa pgbouncer.

---

## 5. VARIABLES DE ENTORNO

### Backend (`.env` o Railway Variables)
```env
DATABASE_URL="postgresql://user:pass@host:6543/db?pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="minimo-32-caracteres-aleatorios"
JWT_EXPIRES_IN="7d"
GEMINI_API_KEY="tu-gemini-api-key"
GEMINI_MODEL="gemini-2.5-flash-lite"
SCRAPING_ENABLED="false"
SCRAPING_INTERVAL_MINUTES="60"
SCRAPING_USER_AGENT="InmoDataIA-Bot/1.0 (contact@inmodata.ia)"
NODE_ENV="production"
CORS_ORIGIN="https://tu-frontend.up.railway.app"
ADMIN_PASSWORD="tu-password-de-admin"
PORT=3001
```

### Frontend (Railway Variables)
```env
VITE_API_URL="https://tu-backend.up.railway.app"
```
> `VITE_API_URL` es el origen del backend **sin** `/api` al final. El código agrega `/api` automáticamente.

---

## 6. BACKEND — ENTRY POINT (`src/index.ts`)

```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';
// importar todas las rutas...

export const prisma = new PrismaClient();

async function main() {
  const app = Fastify({ logger: true });

  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
  await app.register(cors, {
    origin: corsOrigin,
    credentials: corsOrigin !== '*', // IMPORTANTE: '*' + credentials=true viola la spec CORS
  });

  await app.register(jwt, {
    secret: process.env.JWT_SECRET ?? 'dev-secret',
  });

  app.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }));

  // Auth login — contraseña desde ADMIN_PASSWORD env var
  app.post('/auth/login', async (req, reply) => {
    const { email, password } = req.body as { email: string; password: string };
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return reply.status(401).send({ error: 'Invalid credentials' });
    const expected = process.env.ADMIN_PASSWORD ?? 'dev-pass';
    if (password !== expected) return reply.status(401).send({ error: 'Invalid credentials' });
    const token = app.jwt.sign({ sub: user.id, role: user.role });
    return { token, role: user.role, name: user.name };
  });

  // Registrar todas las rutas con prefijo /api
  await app.register(propertiesRoutes,    { prefix: '/api/properties' });
  await app.register(usersRoutes,         { prefix: '/api/users' });
  await app.register(leadsRoutes,         { prefix: '/api/leads' });
  await app.register(subscriptionsRoutes, { prefix: '/api/subscriptions' });
  await app.register(transactionsRoutes,  { prefix: '/api/transactions' });
  await app.register(chatRoutes,          { prefix: '/api/chat' });
  await app.register(metricsRoutes,       { prefix: '/api/metrics' });
  await app.register(scrapingRoutes,      { prefix: '/api/scraping' });
  await app.register(trainingRoutes,      { prefix: '/api/training' });
  await app.register(exchangeRoutes,      { prefix: '/api/exchange' });

  const port = Number(process.env.PORT ?? 3001);
  await app.listen({ port, host: '0.0.0.0' });
}
```

---

## 7. AUTENTICACIÓN (`src/middleware/auth.ts`)

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';

export type JwtPayload = { sub: string; role: 'BUYER' | 'BROKER' | 'ADMIN'; iat: number; exp: number };

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try { await request.jwtVerify(); }
  catch { reply.status(401).send({ error: 'Unauthorized' }); }
}

export async function requireBrokerOrAdmin(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    const payload = request.user as JwtPayload;
    if (!['BROKER', 'ADMIN'].includes(payload.role))
      reply.status(403).send({ error: 'Forbidden' });
  } catch { reply.status(401).send({ error: 'Unauthorized' }); }
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    const payload = request.user as JwtPayload;
    if (payload.role !== 'ADMIN') reply.status(403).send({ error: 'Forbidden' });
  } catch { reply.status(401).send({ error: 'Unauthorized' }); }
}
```

---

## 8. TIPO DE CAMBIO (`src/services/exchangeRate.ts`)

```typescript
// Fetcha dolar.pe, cachea 1 hora, fallback 3.77
interface RateCache { rate: number; fetchedAt: number }
const FALLBACK = 3.77;
const TTL_MS   = 60 * 60 * 1000;
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

// GET /api/exchange/usd-pen → { rate, pair, source, ts }
```

---

## 9. ARQUITECTURA DE IA — ORQUESTADOR + 4 AGENTES

### Flujo del orquestador (`src/services/agentOrchestrator.ts`)

```
Usuario → POST /api/chat → orchestrate()
  ↓
TriageAgent (Gemini Flash / keyword NLP)
  ├── VALUATION    → AnalystAgent  [+CommercialAgent si history >= 1]
  ├── QUALIFICATION → CommercialAgent
  ├── SUPPORT_B2B  → SupportAgent
  └── GENERAL      → respuesta genérica
```

### Agente 1 — Triaje (`triageAgent.ts`)
- Clasifica intención: `VALUATION | QUALIFICATION | SUPPORT_B2B | GENERAL`
- Usa Gemini Flash en modo JSON cuando está disponible
- **Fallback NLP por keywords** cuando Gemini no está disponible
- Keywords VALUATION: tasar, precio, vale, cuesta, m², departamento...
- Keywords SUPPORT_B2B: reporte, acm, corredor, broker, suscripción...
- Registra latencia en `AgentLog`

### Agente 2 — Analista (`analystAgent.ts`)
- Extrae: distrito, m², precio mencionado, si es alquiler o venta
- Compara precio contra **BCRP IVT 2025** (datos hardcodeados en `bcrpData.ts`)
- Busca comparables reales en `Property` table (Urbania/Adondevivir)
- Genera respuesta con Gemini Pro o fallback NLP
- Convierte SOL↔USD usando el rate del día (`getUsdToPen()`)
- Distritos con datos BCRP: Lince (USD 1,970/m²), Jesús María (USD 2,086/m²), Miraflores (USD 2,400/m²)

### Agente 3 — Comercial (`commercialAgent.ts`)
- **Objetivo**: capturar 4 datos — nombre, teléfono, presupuesto, zona
- Usa Gemini Flash en modo JSON para extraer del mensaje:
  ```json
  { "phone": "987654321", "budget": 100000, "currency": "USD", "name": "Carlos", "district": "Miraflores" }
  ```
- **Fallbacks NLP** cuando Gemini falla (offline mode):
  - `extractName()` — detecta "me llamo X", "soy X", o mensaje de solo 2 palabras (cualquier capitalización)
  - `capitalizeName()` — normaliza "carlos ramirez" → "Carlos Ramirez"
  - `parseBudget()` — detecta "150 mil dólares" (USD), "S/ 200,000" (SOL), "100 mil" (SOL)
  - `extractDistrict()` — mapea aliases: "miraflores", "jesus maria", etc.
- **IMPORTANTE**: detectar "N mil dólares/dolares" ANTES de "N mil" genérico en parseBudget
- Convierte presupuesto a USD para guardar en `Lead.budgetExtracted`
- Usa tipo de cambio real de `getUsdToPen()` (no hardcodeado)
- Al tener teléfono + presupuesto: crea o actualiza Lead
  - `findFirst` por `chatSessionId` para no duplicar
  - Si existe, hace UPDATE (no skip)
- Busca propiedades en rango ±25% del presupuesto (en USD y SOL equivalente)

### Agente 4 — Soporte B2B (`supportAgent.ts`)
- Atiende a corredores inmobiliarios que piden reportes ACM
- Genera análisis comparativo de mercado (ACM) por distrito
- Responde preguntas sobre subscripciones y funcionalidades del dashboard

---

## 10. DATOS BCRP (`src/data/bcrpData.ts`)

```typescript
export const BCRP_IVT_2025 = [
  { district: 'Miraflores',  salePriceUsdPerSqm: 2400, annualRentUsdPerSqm: 120, per: 20 },
  { district: 'Jesús María', salePriceUsdPerSqm: 2086, annualRentUsdPerSqm: 99,  per: 21 },
  { district: 'Lince',       salePriceUsdPerSqm: 1970, annualRentUsdPerSqm: 88,  per: 22 },
  // San Isidro, Barranco, etc. opcionales
];

export function getBcrpData(district: string) { /* busca por nombre */ }
export function evaluateSalePrice(priceUsd: number, areaSqm: number, district: string) {
  // retorna: { pricePerSqm, referencePerSqm, diffPct, label, source }
}
export function evaluateRentPrice(rentUsdPerMonth: number, areaSqm: number, district: string) {
  // retorna: { rentPerSqmMonthly, referencePerSqmMonthly, diffPct, label }
}
```

---

## 11. RUTAS BACKEND

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/login` | — | Login con email + ADMIN_PASSWORD |
| GET | `/health` | — | Health check |
| GET | `/api/exchange/usd-pen` | — | Tipo de cambio dolar.pe (caché 1h) |
| POST | `/api/chat` | — | Enviar mensaje al chatbot, retorna respuesta + sessionId |
| GET | `/api/chat/:id` | — | Obtener historial de sesión |
| GET | `/api/properties` | — | Listar propiedades (filtros: district, source) |
| GET | `/api/properties/stats/by-district` | — | Estadísticas por distrito |
| GET | `/api/leads` | BROKER/ADMIN | Listar leads (filtros: status, district) |
| PATCH | `/api/leads/:id` | BROKER/ADMIN | Actualizar estado del lead |
| GET | `/api/leads/stats/summary` | ADMIN | Resumen de leads |
| GET | `/api/metrics/dashboard` | ADMIN | Todas las KPIs del CEO dashboard en una llamada |
| GET | `/api/transactions` | ADMIN | Listar transacciones |
| GET | `/api/transactions/stats/revenue-by-month` | ADMIN | Ingresos últimos 6 meses |
| GET | `/api/subscriptions` | ADMIN | Listar suscripciones |
| GET | `/api/scraping/status` | ADMIN | Estado del scraper |
| POST | `/api/scraping/trigger` | ADMIN | Disparar scraping (mock si SCRAPING_ENABLED=false) |
| POST | `/api/training/run` | BROKER/ADMIN | Ejecutar escenario de entrenamiento contra IA real |
| POST | `/api/training/run-batch` | BROKER/ADMIN | Ejecutar todos los escenarios en batch |

---

## 12. FRONTEND — CLIENTE API (`src/api/client.ts`)

```typescript
import axios from 'axios';

const BACKEND_ORIGIN = import.meta.env.VITE_API_URL ?? '';

const api = axios.create({
  baseURL: BACKEND_ORIGIN ? `${BACKEND_ORIGIN}/api` : '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('inmodata_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth: URL absoluta para no pasar por proxy Vite en producción
export async function login(email: string, password: string) {
  const { data } = await axios.post(`${BACKEND_ORIGIN}/auth/login`, { email, password });
  localStorage.setItem('inmodata_token', data.token);
  return data as { token: string; role: string; name: string };
}

export async function fetchExchangeRate(): Promise<{ rate: number; ts: string }> {
  const { data } = await api.get('/exchange/usd-pen');
  return data;
}

export async function sendChatMessage(message: string, sessionId?: string) {
  const { data } = await api.post('/chat', { message, sessionId });
  return data;
}

// + fetchDashboardMetrics, fetchLeads, fetchProperties, fetchTransactions,
//   fetchSubscriptions, fetchScrapingStatus, triggerScraping,
//   runTrainingScenario, runTrainingBatch
```

---

## 13. FRONTEND — PÁGINAS Y RUTAS

### Routing (`App.tsx`)
```
/login          → Login.tsx          (público)
/chat           → PublicChat.tsx     (público, ruta por defecto)
/command-center → CommandCenter.tsx  (solo ADMIN)
/pro-dashboard  → ProDashboard.tsx   (BROKER | ADMIN)
/plan-estrategico → PlanEstrategico.tsx (BROKER | ADMIN)
/mapa-procesos  → MapaProcesos.tsx   (BROKER | ADMIN)
/simulador-bsc  → SimuladorBSC.tsx   (BROKER | ADMIN)
/estructura-ia  → EstructuraIA.tsx   (BROKER | ADMIN)
/cultura-organizacional → CulturaOrganizacional.tsx (BROKER | ADMIN)
```

### Descripción de cada página

**`PublicChat.tsx`** — Chat público B2C
- Input de texto + historial de mensajes estilo WhatsApp
- Muestra el agente que responde con avatar e indicador de color
- Avatares de agentes desde `randomuser.me` (fotos reales por género)
- Personas de agentes definidas en `src/data/agentPersonas.ts`:
  - TRIAJE: Sofía Torres (`/portraits/women/44.jpg`)
  - ANALISTA: Carlos Mendoza (`/portraits/men/32.jpg`)
  - COMERCIAL: Diego Quispe (`/portraits/men/67.jpg`)
  - SOPORTE_B2B: Valeria Castro (`/portraits/women/68.jpg`)
- Persiste `sessionId` en `localStorage`

**`Login.tsx`** — Login
- Form email + password
- Guarda `inmodata_token` y `inmodata_role` en localStorage

**`CommandCenter.tsx`** — Dashboard CEO (solo ADMIN)
- KPI cards: MRR, CPL, Tasa conversión, Corredores activos
- Gráfico de ingresos por mes (SaaS + Leads) — Recharts LineChart
- Tabla de últimas transacciones
- Telemetría de agentes (latencia, precisión por agente)
- Gráfico Demanda vs Oferta por distrito — Recharts BarChart
- Funnel de conversión

**`ProDashboard.tsx`** — Dashboard Corredor (BROKER | ADMIN)
- Lista de leads activos con: nombre, zona, presupuesto USD, teléfono, estado, fecha
- Filtros por estado y distrito
- Badge de estado coloreado (NUEVO/VENDIDO/DESCARTADO)
- Chat widget embebido (misma interfaz que PublicChat)
- Descripción de los 4 agentes con sus capacidades

**`PlanEstrategico.tsx`** — Plan estratégico
- OKRs visualizados en tabla con semáforo de estado
- Roadmap de producto por trimestre
- Estrategia de financiamiento (angel round, seed VC)
- Vista tipo informe ejecutivo estático

**`MapaProcesos.tsx`** — Mapa de procesos
- Diagrama de flujo del proceso completo (scraping → IA → lead → corredor)
- Tabla RACI por proceso
- Detalle técnico de cada etapa

**`SimuladorBSC.tsx`** — Simulador Balanced Scorecard
- 4 perspectivas BSC: Financiera, Clientes, Procesos, Aprendizaje
- Sliders interactivos para variables clave (precio lead, tasa conversión, etc.)
- 3 escenarios: Base / Optimista / Pesimista
- Gráficos radar y de proyección
- Muestra tipo de cambio real desde `GET /api/exchange/usd-pen`

**`EstructuraIA.tsx`** — Estructura de IA
- Diagrama de la arquitectura de agentes
- Fichas técnicas por agente con métricas de precisión
- Flujo de datos de la cadena IA

**`CulturaOrganizacional.tsx`** — Cultura organizacional + Entrenamiento IA
- 4 secciones de entrenamiento (una por agente)
- Cada sección tiene escenarios de prueba con botón "▶ Ejecutar en vivo"
- Al ejecutar: llama a `POST /api/training/run` con el mensaje del escenario
- Muestra respuesta real de la IA en tab "Respuesta real IA" vs "Escenario base"
- Scoring automático en 4 dimensiones: precisión, empatía, claridad, adherencia cultural
- Visualización de scores con barras de progreso
- Botón "▶▶ Ejecutar todos" para batch con progress bar
- Estado global: `0/12 ejecutados` y `Score IA real promedio` en el header

---

## 14. DISEÑO VISUAL

### Paleta de colores (Tailwind custom en `tailwind.config.js`)
```javascript
colors: {
  'bg-base': '#0f1117',      // fondo general muy oscuro
  'bg-card': '#1a1d27',      // cards
  'bg-hover': '#22263a',     // hover states
  'border-subtle': '#2a2f45',// bordes
  'text-primary': '#e2e8f0', // texto principal
  'text-muted': '#64748b',   // texto secundario
  'accent-violet': '#6366f1',// violeta principal (InmoData brand)
  'accent-teal': '#2dd4bf',  // teal para métricas positivas
  'accent-amber': '#f59e0b', // amber para warnings
  'accent-rose': '#f43f5e',  // rose para negativo/error
  'accent-green': '#22c55e', // verde para éxito
}
```

### Sidebar
- Fondo `bg-base`, borde derecho `border-subtle`
- Logo InmoData IA con ícono de casa
- Navegación por sección con iconos Lucide
- Role badge en la parte inferior (ADMIN / BROKER)
- Colapsa en mobile

### Cards
- Bordes `border-subtle`, fondo `bg-card`
- Sin sombras agresivas, estilo minimalista oscuro
- Badges de estado con colores semánticos

---

## 15. AVATAR Y PERSONAS DE AGENTES (`src/data/agentPersonas.ts`)

```typescript
export const AGENT_PERSONAS = {
  TRIAJE:      { name: 'Sofía Torres',   avatar: 'https://randomuser.me/api/portraits/women/44.jpg', color: '#6366f1', role: 'Coordinadora de Triage' },
  ANALISTA:    { name: 'Carlos Mendoza', avatar: 'https://randomuser.me/api/portraits/men/32.jpg',   color: '#f59e0b', role: 'Analista de Mercado' },
  COMERCIAL:   { name: 'Diego Quispe',   avatar: 'https://randomuser.me/api/portraits/men/67.jpg',   color: '#2dd4bf', role: 'Ejecutivo Comercial' },
  SOPORTE_B2B: { name: 'Valeria Castro', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', color: '#22c55e', role: 'Especialista B2B' },
  DEFAULT:     { name: 'InmoData IA',    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',   color: '#6366f1', role: 'Asistente' },
};
```

---

## 16. TRAINING ENDPOINT — SCORING AUTOMÁTICO

El endpoint `POST /api/training/run` usa `autoScore()` para evaluar respuestas:

```typescript
function autoScore(response: string, agentKey: string) {
  // Precisión: detecta datos concretos (m², USD, BCRP, distritos, números)
  // Empatía: detecta lenguaje cercano (entiendo, con gusto, tu, !, perfecto)
  // Claridad: detecta estructura (negritas **, viñetas -, doble salto, longitud razonable)
  // Adherencia: detecta nombre del agente, ausencia de spam, oferta de alternativas
  // Cada dimensión: base 60 + hits * 8, capped a 100
  return { precision, empathy, claridad, adherencia };
}
```

---

## 17. SCRAPER (`scraper/`)

El workspace `scraper` es un **job de línea de comandos**, NO un servidor web. No desplegarlo en Railway como servicio.

- Usa Playwright para scrapear Urbania y Adondevivir
- Normaliza precios: detecta USD vs SOL por heurística (<700k = USD, ≥700k = SOL)
- Guarda en `Property` table via Prisma
- Solo corre cuando `SCRAPING_ENABLED=true`
- Cron interno: cada `SCRAPING_INTERVAL_MINUTES` minutos

---

## 18. DESPLIEGUE EN RAILWAY

### Servicios a crear (NO incluir scraper como servicio)
1. **backend** — Root Directory: `/backend` — Build: `npm run build --workspace=backend` — Start: `npm run start --workspace=backend`
2. **frontend** — Root Directory: `/frontend` — Build: `npm run build --workspace=frontend` — Start: `npm run start --workspace=frontend`

### Variables críticas de Railway

**Backend:**
```
DATABASE_URL         = postgresql://...?pgbouncer=true
DIRECT_DATABASE_URL  = postgresql://...  (sin pgbouncer)
JWT_SECRET           = (mínimo 32 chars aleatorios)
GEMINI_API_KEY       = (tu clave de Google AI Studio)
GEMINI_MODEL         = gemini-2.5-flash-lite
ADMIN_PASSWORD       = (tu contraseña de admin)
CORS_ORIGIN          = https://frontend-xxx.up.railway.app
NODE_ENV             = production
```

**Frontend:**
```
VITE_API_URL = https://backend-xxx.up.railway.app
```

### Orden de despliegue
1. Desplegar **backend** primero con `CORS_ORIGIN=*` temporal
2. Desplegar **frontend**, obtener su URL
3. Actualizar `CORS_ORIGIN` en backend con la URL real del frontend

### Trampas conocidas de Railway + Railpack
- Railpack v0.29.0 detecta el workspace automáticamente y corre `npm ci` desde la raíz
- `npm ci` requiere que `package-lock.json` esté en sincronía — siempre correr `npm install` antes de push
- `prisma` y `typescript` deben estar en `dependencies` (no `devDependencies`) porque Railway omite devDeps en producción
- `vite preview` sirve el build de producción — agregar `preview.allowedHosts: true` en `vite.config.ts`
- `VITE_API_URL` debe apuntar al origen del backend sin `/api` — el código lo agrega internamente

---

## 19. SEED DE BASE DE DATOS (`prisma/seed.ts`)

```typescript
// Usuario admin
email: 'admin@inmodata.ia', role: 'ADMIN', passwordHash: 'placeholder'
// La autenticación NO usa bcrypt — compara contra ADMIN_PASSWORD env var

// 2 brokers con subscripción PRO (S/ 150/mes)
// 5 compradores (BUYER) con presupuestos S/ 180k - S/ 420k
// 10 propiedades en Lince, Jesús María y Miraflores
// 3 chat sessions + leads calificados
// 5 transacciones de los últimos 5 días
// 4 agent logs (uno por tipo de agente)
```

> Si la BD ya tiene datos, usar `skipDuplicates: true` en `createMany` y `upsert` para usuarios/suscripciones.

---

## 20. DECISIONES DE ARQUITECTURA RELEVANTES

1. **Autenticación simple sin bcrypt**: La contraseña se compara contra `ADMIN_PASSWORD` env var en texto plano. Es suficiente para MVP/demo. Para producción real, migrar a bcrypt.

2. **Tipo de cambio USD/PEN**: Se fetcha de `https://dolar.pe/api/public/series?pair=USD-PEN` con caché de 1 hora en memoria. Fallback a 3.77 si la API falla.

3. **Budgets siempre en USD en la BD**: `Lead.budgetExtracted` se guarda en USD independientemente de si el usuario dijo soles o dólares. La conversión se hace con el TC real en el momento de creación.

4. **Gemini offline mode**: Todos los agentes tienen fallback NLP completo para funcionar sin API key. El comercialAgent detecta nombres en minúsculas y capitaliza automáticamente.

5. **Lead deduplication**: Se usa `findFirst({ where: { chatSessionId } })` en lugar de `findUnique` para evitar duplicados. Si el lead existe, se hace UPDATE en lugar de skip.

6. **CORS + credentials**: Con `CORS_ORIGIN=*`, se desactiva `credentials: true` automáticamente para cumplir la spec del navegador. Con URL específica, se activa.

7. **Frontend en producción**: `vite preview` con `--host 0.0.0.0 --port ${PORT:-4173}`. El backend URL se deriva de `VITE_API_URL` + `/api`. El login usa URL absoluta para bypass del proxy Vite.

8. **pgvector**: El schema incluye `embedding vector(768)` en `Property` para RAG futuro. No se usa todavía — la columna existe pero está vacía.
