# CLAUDE.md — SportFlow: Guia Completo de Construcao

**Projeto:** SportFlow — Plataforma SaaS de Gestao Esportiva
**Empresa:** FlowCore
**Esteira:** AGENTE_SAAS (21 agentes)
**Status:** Blueprint completo, implementacao pendente

---

## SUMARIO

1. [Visao do Produto](#1-visao-do-produto)
2. [Stack Tecnologica](#2-stack-tecnologica)
3. [Passo a Passo Completo](#3-passo-a-passo-completo)
4. [Fase 0 — Setup do Monorepo](#fase-0--setup-do-monorepo)
5. [Fase 1 — Autenticacao e Multi-tenancy](#fase-1--autenticacao-e-multi-tenancy)
6. [Fase 2 — Modulo de Campeonatos](#fase-2--modulo-de-campeonatos)
7. [Fase 3 — Placar em Tempo Real](#fase-3--placar-em-tempo-real)
8. [Fase 4 — Modulo Financeiro](#fase-4--modulo-financeiro)
9. [Fase 5 — Exportacao PDF/CSV](#fase-5--exportacao-pdfcsv)
10. [Fase 6 — Licenciamento e Stripe](#fase-6--licenciamento-e-stripe)
11. [Fase 7 — Painel SuperAdmin](#fase-7--painel-superadmin)
12. [Fase 8 — Placar Publico (SSR)](#fase-8--placar-publico-ssr)
13. [Fase 9 — Testes Completos](#fase-9--testes-completos)
14. [Fase 10 — Observabilidade](#fase-10--observabilidade)
15. [Fase 11 — Deploy e CI/CD](#fase-11--deploy-e-cicd)
16. [Fase 12 — Hardening de Seguranca](#fase-12--hardening-de-seguranca)
17. [Mapeamento Agentes x Fases](#mapeamento-agentes-x-fases)
18. [Checklists de Qualidade](#checklists-de-qualidade)
19. [Troubleshooting](#troubleshooting)

---

## 1. VISAO DO PRODUTO

### O que eh o SportFlow?
Plataforma SaaS multi-tenant para organizadores de eventos esportivos. Permite criar campeonatos, gerenciar placares ao vivo com atualizacao em tempo real, controlar financas e exportar relatorios — tudo com isolamento completo de dados por cliente.

### Problema que resolve
Organizadores de campeonatos amadores e semi-profissionais usam planilhas, WhatsApp e papel para gerenciar eventos. Perdem dados, nao tem controle financeiro e nao conseguem compartilhar placares em tempo real.

### Tres perfis de acesso
- **Admin (voce):** Gestao do sistema, tenants, licencas, metricas via `/superadmin`
- **Contratante:** Cria campeonatos, atualiza placares, controla financas. Acesso via licenca paga
- **Espectador:** Ve placar ao vivo via link publico `/live/{token}`. Sem autenticacao

### Modelo de negocio
1. Lead se cadastra → tenant criado em modo "preview" (limitado)
2. Voce fecha a venda → cria licenca (3 dias, 30 dias, etc.) com preco personalizado
3. Lead paga via Stripe → licenca ativa automaticamente
4. Apos expirar → acesso bloqueado (403), dados preservados 30 dias
5. Renovacao → nova licenca reativa o tenant

---

## 2. STACK TECNOLOGICA

```
FRONTEND                          BACKEND                           INFRA
─────────────────────            ─────────────────────             ─────────────────────
Next.js 14 (App Router)          Node.js + TypeScript              Docker + Docker Compose
React + TypeScript               Express (HTTP server)             GitHub Actions (CI/CD)
shadcn/ui + Tailwind CSS         Prisma ORM                       Railway / Render / AWS
Axios (HTTP client)              Zod (validacao)                   Nginx (reverse proxy)
Socket.io client                 Socket.io server                  Prometheus + Grafana
                                 Bull/BullMQ (filas)               Pino + Sentry (logs)
                                 Redis (cache/pub-sub)             S3/R2 (storage)
                                 Stripe SDK (pagamentos)
                                 Puppeteer (PDF)

DATABASE                         TESTES                            MONOREPO
─────────────────────            ─────────────────────             ─────────────────────
PostgreSQL 15+ (RLS)             Vitest (unitario)                 Turborepo
Redis 7+ (cache/filas)           Supertest (integracao)            apps/api + apps/web
                                 Playwright (E2E)                  packages/shared-types
                                 React Testing Library             packages/ui-kit
```

---

## 3. PASSO A PASSO COMPLETO

A construcao segue 13 fases em ordem. **Cada fase deve ser 100% completa antes de avancar.** Nao pule etapas.

```
Fase 0  → Setup do Monorepo (fundacao)
Fase 1  → Auth + Multi-tenancy (nada funciona sem isso)
Fase 2  → Campeonatos (modulo core)
Fase 3  → Placar Real-time (feature principal)
Fase 4  → Financeiro (controle de receitas)
Fase 5  → Exportacao PDF/CSV (valor agregado)
Fase 6  → Licenciamento + Stripe (monetizacao)
Fase 7  → Painel SuperAdmin (gestao)
Fase 8  → Placar Publico SSR (espectadores)
Fase 9  → Testes Completos (qualidade)
Fase 10 → Observabilidade (monitoramento)
Fase 11 → Deploy + CI/CD (producao)
Fase 12 → Hardening de Seguranca (blindagem)
```

---

## FASE 0 — Setup do Monorepo

**Objetivo:** Criar a estrutura base do projeto com Turborepo, configurar todas as ferramentas e subir a infra local.

**Agente responsavel:** Nenhum — setup manual / fundacao

### Passo 0.1 — Criar o monorepo Turborepo

```bash
# Criar projeto
npx create-turbo@latest sportflow
cd sportflow

# Estrutura esperada apos setup:
sportflow/
├── apps/
│   ├── api/          # criar manualmente
│   └── web/          # criar com: npx create-next-app@latest
├── packages/
│   ├── shared-types/ # criar manualmente
│   └── ui-kit/       # criar manualmente
├── turbo.json
├── package.json
└── .gitignore
```

### Passo 0.2 — Configurar o backend (apps/api)

```bash
cd apps/api
npm init -y
npm install express cors helmet compression cookie-parser
npm install -D typescript @types/node @types/express @types/cors @types/cookie-parser
npm install -D tsx nodemon
npx tsc --init
```

Configurar `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Passo 0.3 — Instalar dependencias do backend

```bash
# ORM e Database
npm install @prisma/client
npm install -D prisma

# Validacao
npm install zod

# Auth
npm install jsonwebtoken bcryptjs
npm install -D @types/jsonwebtoken @types/bcryptjs

# Real-time
npm install socket.io
npm install -D @types/socket.io

# Filas
npm install bullmq ioredis
npm install -D @types/ioredis

# Logging
npm install pino pino-pretty

# Pagamentos
npm install stripe

# Export
npm install puppeteer fast-csv
npm install -D @types/puppeteer

# Rate limiting
npm install express-rate-limit

# Inicializar Prisma
npx prisma init
```

### Passo 0.4 — Configurar o frontend (apps/web)

```bash
cd apps/web
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir

# shadcn/ui
npx shadcn@latest init

# Adicionar componentes base
npx shadcn@latest add button card input dialog alert badge skeleton toast tabs table dropdown-menu avatar sheet select separator label textarea

# Dependencias adicionais
npm install axios socket.io-client
npm install -D @types/node
```

### Passo 0.5 — Configurar shared-types

```bash
cd packages/shared-types
npm init -y
```

Criar `src/index.ts`:
```typescript
// packages/shared-types/src/index.ts
export * from './auth';
export * from './championship';
export * from './scoreboard';
export * from './financial';
export * from './tenant';
export * from './license';
```

### Passo 0.6 — Docker Compose (infra local)

Criar `docker-compose.yml` na raiz:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: sportflow-db
    environment:
      POSTGRES_USER: sportflow
      POSTGRES_PASSWORD: sportflow_dev
      POSTGRES_DB: sportflow
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: sportflow-redis
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Passo 0.7 — Variaveis de ambiente

Criar `.env.example` na raiz:
```env
# Database
DATABASE_URL="postgresql://sportflow:sportflow_dev@localhost:5432/sportflow"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_ACCESS_SECRET="gerar-secret-seguro-aqui-min-32-chars"
JWT_REFRESH_SECRET="gerar-outro-secret-seguro-aqui"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PUBLIC_KEY="pk_test_..."

# Storage (S3 ou R2)
STORAGE_BUCKET="sportflow-exports"
STORAGE_REGION="us-east-1"
STORAGE_ACCESS_KEY="..."
STORAGE_SECRET_KEY="..."
STORAGE_ENDPOINT=""

# App
NODE_ENV="development"
API_PORT=3001
API_URL="http://localhost:3001"
WEB_URL="http://localhost:3000"
CORS_ORIGINS="http://localhost:3000"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_WS_URL="http://localhost:3001"
NEXT_PUBLIC_USE_MOCK="false"
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="pk_test_..."
```

### Passo 0.8 — Configurar turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "lint": {},
    "type-check": {},
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```

### Passo 0.9 — Scripts no package.json raiz

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "test": "turbo run test",
    "test:integration": "turbo run test:integration",
    "test:e2e": "turbo run test:e2e",
    "format": "prettier --write \"**/*.{ts,tsx,js,json,md}\"",
    "db:migrate": "cd apps/api && npx prisma migrate dev",
    "db:seed": "cd apps/api && npx prisma db seed",
    "db:studio": "cd apps/api && npx prisma studio",
    "db:reset": "cd apps/api && npx prisma migrate reset",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down"
  }
}
```

### Passo 0.10 — Verificar setup

```bash
# Subir infra
docker-compose up -d

# Verificar PostgreSQL
docker exec sportflow-db pg_isready

# Verificar Redis
docker exec sportflow-redis redis-cli ping

# Verificar monorepo
npm run dev
# API deve rodar em http://localhost:3001
# Web deve rodar em http://localhost:3000
```

**Criterio de conclusao Fase 0:**
- [ ] Monorepo Turborepo funcionando
- [ ] Backend Express rodando na porta 3001
- [ ] Frontend Next.js rodando na porta 3000
- [ ] PostgreSQL e Redis via Docker Compose
- [ ] Prisma inicializado
- [ ] shadcn/ui configurado
- [ ] .env.example completo
- [ ] `npm run dev` inicia ambos os apps

---

## FASE 1 — Autenticacao e Multi-tenancy

**Objetivo:** Implementar JWT, RBAC, middleware chain, RLS no PostgreSQL e isolamento de tenant.

**Agentes:** 03 (Arquiteto Backend) + 04 (Arquiteto Frontend) + 07 (Database)

### Passo 1.1 — Schema Prisma Base

Criar `apps/api/prisma/schema.prisma`:
```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum TenantStatus {
  preview
  active
  suspended
  expired
}

enum UserRole {
  superadmin
  owner
  member
}

enum LicenseStatus {
  pending
  active
  expired
  cancelled
}

model Tenant {
  id        String       @id @default(uuid()) @db.Uuid
  slug      String       @unique
  name      String
  email     String
  whatsapp  String?
  status    TenantStatus @default(preview)
  createdAt DateTime     @default(now()) @map("created_at")
  updatedAt DateTime     @updatedAt @map("updated_at")
  deletedAt DateTime?    @map("deleted_at")

  users         User[]
  licenses      License[]
  championships Championship[]
  auditLogs     AuditLog[]

  @@map("tenants")
}

model User {
  id           String   @id @default(uuid()) @db.Uuid
  tenantId     String   @map("tenant_id") @db.Uuid
  email        String
  passwordHash String   @map("password_hash")
  name         String
  role         UserRole @default(member)
  lastLogin    DateTime? @map("last_login")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  deletedAt    DateTime? @map("deleted_at")

  tenant    Tenant     @relation(fields: [tenantId], references: [id])
  auditLogs AuditLog[]

  @@unique([email, tenantId])
  @@index([tenantId])
  @@map("users")
}

model License {
  id              String        @id @default(uuid()) @db.Uuid
  tenantId        String        @map("tenant_id") @db.Uuid
  startsAt        DateTime?     @map("starts_at")
  expiresAt       DateTime?     @map("expires_at")
  durationDays    Int           @map("duration_days")
  priceBrl        Decimal       @map("price_brl") @db.Decimal(10, 2)
  stripePaymentId String?       @map("stripe_payment_id")
  status          LicenseStatus @default(pending)
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@index([tenantId])
  @@index([status])
  @@map("licenses")
}

model AuditLog {
  id        String   @id @default(uuid()) @db.Uuid
  tenantId  String   @map("tenant_id") @db.Uuid
  userId    String?  @map("user_id") @db.Uuid
  action    String
  resource  String
  payload   Json?
  ipAddress String?  @map("ip_address")
  createdAt DateTime @default(now()) @map("created_at")

  tenant Tenant @relation(fields: [tenantId], references: [id])
  user   User?  @relation(fields: [userId], references: [id])

  @@index([tenantId, createdAt])
  @@map("audit_logs")
}
```

### Passo 1.2 — RLS Policies

Criar `apps/api/sql/rls-policies.sql`:
```sql
-- Habilitar RLS em todas as tabelas com tenant_id
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Funcao helper para pegar tenant_id da sessao
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS uuid AS $$
  SELECT NULLIF(current_setting('app.current_tenant_id', true), '')::uuid;
$$ LANGUAGE sql STABLE;

-- Funcao helper para verificar se eh superadmin
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS boolean AS $$
  SELECT COALESCE(current_setting('app.is_superadmin', true), 'false')::boolean;
$$ LANGUAGE sql STABLE;

-- Policy padrao: tenant ve apenas seus dados, superadmin ve tudo
CREATE POLICY tenant_isolation ON users
  USING (
    is_superadmin() OR tenant_id = current_tenant_id()
  );

CREATE POLICY tenant_isolation ON licenses
  USING (
    is_superadmin() OR tenant_id = current_tenant_id()
  );

CREATE POLICY tenant_isolation ON audit_logs
  USING (
    is_superadmin() OR tenant_id = current_tenant_id()
  );
```

### Passo 1.3 — Middleware Chain

Criar os middlewares na ordem de execucao:

**`apps/api/src/middlewares/auth.middleware.ts`**
```typescript
// Verifica JWT no cookie HttpOnly
// Extrai userId e tenantId do token
// Popula req.user com { id, tenantId, role }
// Retorna 401 se token ausente ou invalido
// Renova access token automaticamente via refresh token
```

**`apps/api/src/middlewares/tenant.middleware.ts`**
```typescript
// Le tenantId de req.user (injetado pelo auth middleware)
// Executa SET LOCAL app.current_tenant_id = tenantId (para RLS)
// Garante que toda query Prisma subsequente respeita o tenant
```

**`apps/api/src/middlewares/license.middleware.ts`**
```typescript
// Busca licenca ativa do tenant
// Se licenca expirada ou inexistente: retorna 403
// Pula verificacao para rotas publicas e superadmin
```

**`apps/api/src/middlewares/rateLimit.middleware.ts`**
```typescript
// Rate limiting por IP + tenant
// 100 req/min para rotas normais
// 10 req/min para login/register
// Headers: X-RateLimit-Limit, X-RateLimit-Remaining
```

**`apps/api/src/middlewares/audit.middleware.ts`**
```typescript
// Registra acoes de escrita (POST, PUT, PATCH, DELETE)
// Salva: userId, tenantId, action, resource, payload, ipAddress
// Nao bloqueia a resposta (fire-and-forget)
```

**Ordem no Express:**
```typescript
// app.ts
app.use(cors({ origin: CORS_ORIGINS, credentials: true }));
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(express.json());

// Rotas publicas (sem auth)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/live', liveRoutes);
app.use('/api/v1/webhooks', webhookRoutes);

// Middleware chain para rotas protegidas
app.use(authMiddleware);       // 1. Valida JWT
app.use(tenantMiddleware);     // 2. Injeta tenant no RLS
app.use(licenseMiddleware);    // 3. Valida licenca ativa
app.use(rateLimitMiddleware);  // 4. Rate limiting
app.use(auditMiddleware);      // 5. Log de audit

// Rotas protegidas
app.use('/api/v1/championships', championshipRoutes);
app.use('/api/v1/matches', matchRoutes);
app.use('/api/v1/financial', financialRoutes);
app.use('/api/v1/export-jobs', exportRoutes);

// Rotas superadmin (auth + role check adicional)
app.use('/superadmin', superadminMiddleware, superadminRoutes);
```

### Passo 1.4 — Auth Module (Backend)

Implementar em `apps/api/src/modules/auth/`:
```
auth/
├── auth.controller.ts    # Rotas: register, login, refresh, logout
├── auth.service.ts       # Logica: hash password, gerar tokens, validar
├── auth.repository.ts    # Acesso: buscar user, criar user
├── auth.schema.ts        # Zod: RegisterInput, LoginInput, TokenPayload
├── auth.factory.ts       # Criacao de tokens JWT
└── auth.mapper.ts        # User entity → response DTO
```

**Fluxo de login:**
```
1. POST /api/v1/auth/login { email, password }
2. Controller valida input com Zod schema
3. Service busca user via Repository
4. Service compara password com bcrypt
5. Factory gera access token (15min) + refresh token (7d)
6. Controller seta cookies HttpOnly:
   - access_token (path=/, httpOnly, secure, sameSite=strict, maxAge=15min)
   - refresh_token (path=/api/v1/auth/refresh, httpOnly, secure, sameSite=strict, maxAge=7d)
7. Retorna { user: { id, name, email, role } }
```

### Passo 1.5 — Auth no Frontend

**`apps/web/src/middleware.ts`** (Next.js middleware):
```typescript
// Intercepta todas as rotas
// Rotas publicas: /, /login, /register, /live/* → permite
// Rotas dashboard: /championships/* → redireciona para /login se sem cookie
// Rotas superadmin: /superadmin/* → redireciona se role != superadmin
```

**`apps/web/src/hooks/useAuth.ts`:**
```typescript
// Hook de autenticacao
// Verifica se usuario esta logado (cookie presente)
// Expoe: user, isLoading, login(), logout(), isAuthenticated
```

**`apps/web/src/lib/api.ts`:**
```typescript
// Axios instance com:
// - baseURL: NEXT_PUBLIC_API_URL
// - withCredentials: true (envia cookies HttpOnly)
// - Interceptor de resposta: se 401, tenta refresh automatico
// - Se refresh falha, redireciona para /login
```

**Criterio de conclusao Fase 1:**
- [ ] Register cria user + tenant em modo preview
- [ ] Login retorna JWT em HttpOnly cookies
- [ ] Refresh token renova access token
- [ ] Middleware chain funciona na ordem correta
- [ ] RLS ativo — tenant A nao ve dados do tenant B
- [ ] Frontend protege rotas via middleware.ts
- [ ] Axios envia cookies automaticamente
- [ ] Rate limiting ativo (10 req/min em login)
- [ ] Audit log registra login/register

---

## FASE 2 — Modulo de Campeonatos

**Objetivo:** CRUD completo de campeonatos com participantes, categorias e configuracao por esporte.

**Agentes:** 03 (Backend) + 04 (Frontend) + 09 (Dev Frontend) + 10 (Dev Backend)

### Passo 2.1 — Schema Prisma (adicionar ao schema.prisma)

```prisma
enum ChampionshipStatus {
  draft
  active
  finished
  cancelled
}

model Championship {
  id          String              @id @default(uuid()) @db.Uuid
  tenantId    String              @map("tenant_id") @db.Uuid
  name        String
  sportType   String              @map("sport_type")
  rulesConfig Json?               @map("rules_config")
  status      ChampionshipStatus  @default(draft)
  startDate   DateTime?           @map("start_date")
  endDate     DateTime?           @map("end_date")
  createdAt   DateTime            @default(now()) @map("created_at")
  updatedAt   DateTime            @updatedAt @map("updated_at")
  deletedAt   DateTime?           @map("deleted_at")

  tenant       Tenant        @relation(fields: [tenantId], references: [id])
  participants Participant[]
  matches      Match[]

  @@index([tenantId])
  @@index([tenantId, status])
  @@map("championships")
}

model Participant {
  id              String  @id @default(uuid()) @db.Uuid
  championshipId  String  @map("championship_id") @db.Uuid
  tenantId        String  @map("tenant_id") @db.Uuid
  name            String
  category        String?
  metadata        Json?
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  deletedAt       DateTime? @map("deleted_at")

  championship Championship @relation(fields: [championshipId], references: [id])

  @@index([championshipId])
  @@index([tenantId])
  @@map("participants")
}
```

### Passo 2.2 — Backend Module

```
apps/api/src/modules/championship/
├── championship.controller.ts    # CRUD routes
├── championship.service.ts       # Business logic (validacoes, regras)
├── championship.repository.ts    # Prisma queries (sempre com tenantId)
├── championship.schema.ts        # Zod schemas
├── championship.factory.ts       # Criacao de objetos
├── championship.mapper.ts        # Entity → Response DTO
└── sport-presets.ts              # Configs padrao por esporte
```

**Sport Presets (configuracao por esporte):**
```typescript
// sport-presets.ts
export const SPORT_PRESETS = {
  futebol: {
    scoreType: 'goals',
    periods: 2,
    periodDuration: 45, // minutos
    hasTimer: true,
    maxParticipants: 32,
  },
  volei: {
    scoreType: 'sets_and_points',
    setsToWin: 3,
    pointsPerSet: 25,
    hasTimer: false,
    maxParticipants: 16,
  },
  skate: {
    scoreType: 'judges_score',
    rounds: 3,
    maxScore: 100,
    hasTimer: false,
    maxParticipants: 64,
  },
  // ... mais esportes
};
```

### Passo 2.3 — Frontend Pages

```
apps/web/src/app/(dashboard)/championships/
├── page.tsx                          # Lista de campeonatos
├── new/page.tsx                      # Criar novo campeonato
└── [id]/
    ├── page.tsx                      # Detalhe do campeonato
    ├── participants/page.tsx         # Gerenciar participantes
    └── brackets/page.tsx             # Chave/tabela do campeonato
```

**Criterio de conclusao Fase 2:**
- [ ] CRUD completo de campeonatos (criar, listar, editar, excluir)
- [ ] CRUD de participantes vinculados ao campeonato
- [ ] Sport presets funcionando (config automatica por esporte)
- [ ] Validacao: modo preview limita a 3 participantes
- [ ] Tenant isolation: campeonatos isolados por tenant
- [ ] Paginacao na listagem
- [ ] Busca por nome
- [ ] data-testid em todos os elementos interativos

---

## FASE 3 — Placar em Tempo Real

**Objetivo:** Implementar Socket.io para atualizacao de placar ao vivo com latencia < 100ms.

**Agentes:** 03 (Backend) + 04 (Frontend) + 10 (Dev Backend) + 09 (Dev Frontend)

### Passo 3.1 — Schema Prisma (adicionar)

```prisma
enum MatchStatus {
  scheduled
  live
  finished
  cancelled
}

model Match {
  id                 String      @id @default(uuid()) @db.Uuid
  championshipId     String      @map("championship_id") @db.Uuid
  tenantId           String      @map("tenant_id") @db.Uuid
  homeParticipantId  String      @map("home_participant_id") @db.Uuid
  awayParticipantId  String      @map("away_participant_id") @db.Uuid
  status             MatchStatus @default(scheduled)
  scheduledAt        DateTime?   @map("scheduled_at")
  liveToken          String      @unique @map("live_token")
  timerSeconds       Int         @default(0) @map("timer_seconds")
  timerRunning       Boolean     @default(false) @map("timer_running")
  createdAt          DateTime    @default(now()) @map("created_at")
  updatedAt          DateTime    @updatedAt @map("updated_at")

  championship     Championship   @relation(fields: [championshipId], references: [id])
  scoreEntries     ScoreEntry[]

  @@index([tenantId])
  @@index([liveToken])
  @@map("matches")
}

model ScoreEntry {
  id            String   @id @default(uuid()) @db.Uuid
  matchId       String   @map("match_id") @db.Uuid
  tenantId      String   @map("tenant_id") @db.Uuid
  participantId String   @map("participant_id") @db.Uuid
  scoreData     Json     @map("score_data")
  updatedBy     String   @map("updated_by") @db.Uuid
  createdAt     DateTime @default(now()) @map("created_at")

  match Match @relation(fields: [matchId], references: [id])

  @@index([matchId])
  @@index([tenantId])
  @@map("score_entries")
}
```

### Passo 3.2 — Socket.io Server Setup

```typescript
// apps/api/src/socket.ts

// 1. Inicializar Socket.io com CORS
// 2. Middleware de auth para rooms admin (verificar JWT do cookie)
// 3. Rooms:
//    - match:admin:{matchId}  → autenticado, leitura+escrita
//    - match:public:{liveToken} → sem auth, somente leitura

// 4. Eventos:
//    - score:update    (admin → server → broadcast)
//    - timer:start     (admin → server → broadcast)
//    - timer:pause     (admin → server → broadcast)
//    - timer:reset     (admin → server → broadcast)
//    - score:updated   (server → todos na room)
//    - timer:started   (server → todos na room)

// 5. Redis adapter para escalar horizontalmente
//    const pubClient = new Redis(REDIS_URL);
//    const subClient = pubClient.duplicate();
//    io.adapter(createAdapter(pubClient, subClient));
```

### Passo 3.3 — Fluxo de Atualizacao de Placar

```
Admin clica "+1 ponto"
       │
       ▼
PATCH /api/v1/matches/:id/score
       │
       ▼
Controller → Service → Repository (salva score_entry)
       │
       ▼
Service publica via Redis Pub/Sub
       │
       ▼
Socket.io broadcast para:
  ├── match:admin:{matchId}    (painel admin)
  └── match:public:{liveToken} (espectadores)
       │
       ▼
Frontend recebe 'score:updated' → atualiza UI (< 100ms)
```

### Passo 3.4 — Frontend Components

```
apps/web/src/components/scoreboard/
├── LiveScoreboard.tsx     # Exibe placar em tempo real
├── GameTimer.tsx           # Timer do jogo (start/pause/reset)
├── ScoreUpdater.tsx        # Botoes +1/-1 (somente admin)
└── ScoreHistory.tsx        # Historico de pontuacoes
```

**`apps/web/src/hooks/useLiveScore.ts`:**
```typescript
// Hook que:
// 1. Conecta ao Socket.io room do match
// 2. Escuta 'score:updated' e 'timer:*'
// 3. Retorna { homeScore, awayScore, timer, isLive }
// 4. Reconecta automaticamente se desconectar
```

**Criterio de conclusao Fase 3:**
- [ ] Socket.io server rodando junto com Express
- [ ] Rooms admin e public funcionando
- [ ] Autenticacao na room admin (JWT do cookie)
- [ ] Room public sem autenticacao
- [ ] Atualizacao de placar < 100ms latencia
- [ ] Timer sincronizado entre admin e espectadores
- [ ] Historico de score_entries salvo no PostgreSQL
- [ ] Redis Pub/Sub para broadcast
- [ ] Reconexao automatica no frontend

---

## FASE 4 — Modulo Financeiro

**Objetivo:** Rastreamento de receitas e despesas por campeonato, com suporte a patrocinadores.

**Agentes:** 03 (Backend) + 04 (Frontend) + 09 + 10

### Passo 4.1 — Schema Prisma (adicionar)

```prisma
enum TransactionType {
  income
  expense
}

model FinancialTransaction {
  id              String          @id @default(uuid()) @db.Uuid
  championshipId  String          @map("championship_id") @db.Uuid
  tenantId        String          @map("tenant_id") @db.Uuid
  type            TransactionType
  category        String
  amount          Decimal         @db.Decimal(10, 2)
  description     String?
  sponsorName     String?         @map("sponsor_name")
  transactionDate DateTime        @map("transaction_date")
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")
  deletedAt       DateTime?       @map("deleted_at")

  @@index([championshipId])
  @@index([tenantId])
  @@map("financial_transactions")
}
```

### Passo 4.2 — Endpoints

```
GET    /api/v1/championships/:id/financial           # Resumo (totais, por categoria)
GET    /api/v1/championships/:id/financial/transactions  # Lista paginada
POST   /api/v1/financial/transactions                # Criar transacao
PATCH  /api/v1/financial/transactions/:id            # Atualizar
DELETE /api/v1/financial/transactions/:id            # Soft delete
```

### Passo 4.3 — Frontend

```
apps/web/src/app/(dashboard)/championships/[id]/financial/
└── page.tsx
    # Cards: Total Receita, Total Despesa, Saldo
    # Tabela de transacoes com filtro por tipo e categoria
    # Dialog para criar/editar transacao
    # Grafico de receitas vs despesas (opcional)
```

**Criterio de conclusao Fase 4:**
- [ ] CRUD de transacoes financeiras
- [ ] Resumo com totais (receita, despesa, saldo)
- [ ] Filtros por tipo, categoria, data
- [ ] Paginacao
- [ ] Vinculado ao campeonato (championship_id)
- [ ] Tenant isolation
- [ ] Soft delete
- [ ] Validacao: modo preview bloqueia modulo financeiro

---

## FASE 5 — Exportacao PDF/CSV

**Objetivo:** Gerar relatorios asincronos usando Bull queue, com upload para S3/R2.

**Agentes:** 03 (Backend) + 10 (Dev Backend) + opc-b (Mensageria)

### Passo 5.1 — Schema Prisma (adicionar)

```prisma
enum ExportFormat {
  pdf
  csv
}

enum ExportStatus {
  pending
  processing
  completed
  failed
}

model ExportJob {
  id              String       @id @default(uuid()) @db.Uuid
  championshipId  String       @map("championship_id") @db.Uuid
  tenantId        String       @map("tenant_id") @db.Uuid
  format          ExportFormat
  modules         Json         // ['results', 'financial', 'participants']
  status          ExportStatus @default(pending)
  fileUrl         String?      @map("file_url")
  errorMessage    String?      @map("error_message")
  completedAt     DateTime?    @map("completed_at")
  createdAt       DateTime     @default(now()) @map("created_at")

  @@index([tenantId])
  @@index([status])
  @@map("export_jobs")
}
```

### Passo 5.2 — Bull Queue + Worker

```typescript
// apps/api/src/workers/export.worker.ts

// 1. Worker escuta fila 'export-jobs' no Bull
// 2. Recebe job com { exportJobId, championshipId, format, modules }
// 3. Busca dados do campeonato (resultados, financeiro, participantes)
// 4. Se PDF: renderiza HTML com dados → Puppeteer gera PDF
// 5. Se CSV: fast-csv gera arquivo
// 6. Upload para S3/R2
// 7. Gera signed URL (expira em 24h)
// 8. Atualiza export_jobs: status=completed, file_url=signedUrl
// 9. Notifica via Socket.io: export:ready { download_url }
// 10. Envia email com link de download
```

### Passo 5.3 — Fluxo

```
Contratante clica "Exportar PDF"
       │
       ▼
POST /api/v1/championships/:id/export { format: 'pdf', modules: [...] }
       │
       ▼
Controller → Service → cria ExportJob (pending) + enfileira no Bull
       │
       ▼
Retorna imediatamente: { jobId: "uuid", status: "pending" }
       │
       ▼
Worker processa em background (10s a 5min)
       │
       ▼
Upload para S3 → atualiza status → notifica via Socket.io
       │
       ▼
Frontend recebe 'export:ready' → mostra botao de download
```

**Criterio de conclusao Fase 5:**
- [ ] Bull queue configurado com Redis
- [ ] Worker de exportacao rodando
- [ ] PDF gerado via Puppeteer com dados reais
- [ ] CSV gerado via fast-csv
- [ ] Upload para S3/R2
- [ ] Signed URL com expiracao de 24h
- [ ] Notificacao via Socket.io
- [ ] Frontend mostra status do job (pending → processing → completed)
- [ ] Validacao: modo preview bloqueia exportacao

---

## FASE 6 — Licenciamento e Stripe

**Objetivo:** Integrar Stripe para pagamento de licencas, com ativacao automatica via webhook.

**Agentes:** 03 (Backend) + 10 (Dev Backend) + 04 (Frontend)

### Passo 6.1 — Stripe Integration

```typescript
// apps/api/src/modules/license/

// license.service.ts
// - criarLicenca(tenantId, days, priceBrl) → gera Stripe Checkout Session
// - ativarLicenca(stripePaymentId) → ativa tenant + seta expiresAt
// - verificarExpiracao() → Worker horario que bloqueia licencas expiradas

// stripe.webhook.ts
// - Recebe POST /api/v1/webhooks/stripe
// - Verifica assinatura do Stripe (stripe.webhooks.constructEvent)
// - Evento 'checkout.session.completed' → ativa licenca
// - NUNCA confiar em dados do frontend para ativar licenca
```

### Passo 6.2 — License Worker

```typescript
// apps/api/src/workers/license.worker.ts

// Roda a cada 1 hora via Bull repeatable job:
// 1. Busca licencas com status='active' e expiresAt < now()
// 2. Atualiza status para 'expired'
// 3. Atualiza tenant.status para 'expired'
// 4. Loga acao no audit_logs
// 5. (Futuro) Envia email avisando expiracao
```

### Passo 6.3 — Fluxo Completo de Pagamento

```
1. Admin cria licenca no superadmin:
   POST /superadmin/licenses { tenantId, days: 30, priceBrl: 500 }

2. Service cria Stripe Checkout Session:
   - line_items: [{ price_data: { unit_amount: 50000, currency: 'brl' } }]
   - success_url: WEB_URL/payment/success
   - cancel_url: WEB_URL/payment/cancel
   - metadata: { licenseId, tenantId }

3. Sistema envia link de pagamento por email ao lead

4. Lead paga → Stripe dispara webhook:
   POST /api/v1/webhooks/stripe
   event: checkout.session.completed

5. Webhook handler:
   - Verifica assinatura com STRIPE_WEBHOOK_SECRET
   - Extrai licenseId dos metadata
   - Chama licenseService.ativarLicenca(licenseId)
   - Atualiza: license.status = 'active', tenant.status = 'active'

6. Tenant agora tem acesso completo ate expiresAt
```

**Criterio de conclusao Fase 6:**
- [ ] Stripe Checkout Session criada corretamente
- [ ] Webhook recebe e verifica assinatura
- [ ] Licenca ativada automaticamente apos pagamento
- [ ] Worker horario expira licencas vencidas
- [ ] License middleware retorna 403 para licencas expiradas
- [ ] Dados preservados 30 dias apos expiracao (LGPD)
- [ ] Email de confirmacao enviado ao lead
- [ ] Modo preview funciona sem licenca (com limitacoes)

---

## FASE 7 — Painel SuperAdmin

**Objetivo:** Painel administrativo para gestao de tenants, licencas, leads e metricas.

**Agentes:** 04 (Frontend) + 03 (Backend) + 09 + 10

### Passo 7.1 — Rotas SuperAdmin (Backend)

```
GET    /superadmin/tenants              # Lista todos os tenants (paginado)
GET    /superadmin/tenants/:id          # Detalhe do tenant
PATCH  /superadmin/tenants/:id          # Atualizar status
GET    /superadmin/licenses             # Lista todas as licencas
POST   /superadmin/licenses             # Criar nova licenca
PATCH  /superadmin/licenses/:id         # Ativar/desativar
GET    /superadmin/leads                # Leads recentes
GET    /superadmin/metrics              # Dashboard de metricas
GET    /superadmin/audit-logs           # Logs de auditoria
```

**Protecao:**
```typescript
// superadmin.middleware.ts
// 1. Verifica se user.role === 'superadmin'
// 2. Verifica IP whitelist (opcional)
// 3. Verifica 2FA (se implementado)
// 4. Retorna 403 se nao autorizado
// 5. RLS: SET app.is_superadmin = true (bypass tenant filter)
```

### Passo 7.2 — Frontend SuperAdmin

```
apps/web/src/app/(superadmin)/
├── layout.tsx               # Layout com sidebar admin
├── tenants/page.tsx         # Tabela de tenants (status, licenca, criacao)
├── licenses/page.tsx        # Criar/gerenciar licencas
├── leads/page.tsx           # Leads recentes
├── metrics/page.tsx         # Dashboard com KPIs
└── audit-logs/page.tsx      # Busca em logs de auditoria
```

**Dashboard de Metricas:**
```
- Total de tenants (ativos, preview, expirados)
- Receita total (MRR)
- Leads no ultimo mes
- Campeonatos criados (total e por tenant)
- Uptime do sistema
```

**Criterio de conclusao Fase 7:**
- [ ] CRUD de tenants
- [ ] Criar licenca com link Stripe
- [ ] Visualizar leads
- [ ] Dashboard de metricas
- [ ] Logs de auditoria com busca
- [ ] Protecao por role superadmin
- [ ] IP whitelist configuravel
- [ ] Separado visualmente do dashboard normal

---

## FASE 8 — Placar Publico (SSR)

**Objetivo:** Pagina publica de placar renderizada no servidor (SSR) para carga instantanea.

**Agentes:** 04 (Frontend) + 09 (Dev Frontend)

### Passo 8.1 — Rota Publica

```
apps/web/src/app/live/[token]/page.tsx
```

**Caracteristicas:**
- **Server-Side Rendering (SSR)** — pagina renderiza no servidor com dados atuais
- **Sem autenticacao** — qualquer pessoa com o link acessa
- **Read-only** — nenhuma acao de escrita
- **Socket.io** — apos carga inicial (SSR), conecta ao WebSocket para atualizacoes
- **SEO-friendly** — meta tags com nome do campeonato e esporte
- **Sem flicker** — dados ja vem renderizados do servidor
- **Minimalista** — sem sidebar, sem menu, apenas o placar

```typescript
// apps/web/src/app/live/[token]/page.tsx

// Server Component (SSR):
// 1. Busca dados do match via API interna (sem auth)
//    GET /api/v1/live/{token}
// 2. Renderiza HTML com placar atual
// 3. Injeta token para Socket.io client-side

// Client Component (apos hydration):
// 1. Conecta ao Socket.io room match:public:{token}
// 2. Escuta score:updated, timer:started, etc.
// 3. Atualiza UI em real-time (< 100ms)
```

### Passo 8.2 — Endpoint Publico (Backend)

```typescript
// GET /api/v1/live/:token
// SEM autenticacao, SEM tenant middleware
// Retorna apenas dados publicos do match:
// {
//   championship: { name, sportType },
//   match: { homeParticipant, awayParticipant, status },
//   score: { home: 2, away: 1 },
//   timer: { seconds: 1234, running: true }
// }
// NUNCA retorna dados financeiros ou de outros matches
```

**Criterio de conclusao Fase 8:**
- [ ] Pagina /live/{token} renderiza via SSR (sem flicker)
- [ ] Sem autenticacao necessaria
- [ ] Socket.io conecta apos hydration
- [ ] Atualizacoes em tempo real < 100ms
- [ ] Nao expoe dados financeiros ou de outros jogos
- [ ] Meta tags para compartilhamento (OpenGraph)
- [ ] Responsivo (funciona bem em mobile)
- [ ] Marca d'agua se tenant em modo preview

---

## FASE 9 — Testes Completos

**Objetivo:** Cobertura de testes em todas as camadas.

**Agentes:** 11 (QA Unitario) + 12 (QA Integracao) + 13 (QA Tela) + 14 (Playwright)

### Passo 9.1 — Testes Unitarios (Vitest)

```bash
# Backend
apps/api/tests/unit/
├── services/
│   ├── auth.service.test.ts
│   ├── championship.service.test.ts
│   ├── scoreboard.service.test.ts
│   ├── financial.service.test.ts
│   ├── license.service.test.ts
│   └── export.service.test.ts
├── schemas/
│   ├── auth.schema.test.ts
│   └── championship.schema.test.ts
└── factories/
    └── auth.factory.test.ts

# Frontend
apps/web/tests/unit/
├── dto/
│   ├── championship.dto.test.ts
│   └── financial.dto.test.ts
├── services/
│   └── championship.service.test.ts
└── hooks/
    ├── useAuth.test.ts
    └── useLiveScore.test.ts
```

**O que testar (unitario):**
- Zod schemas validam campos obrigatorios e tipos
- Services aplicam regras de negocio corretamente
- Factories criam objetos validos
- DTOs: constructor, isValid(), toPayload()
- Hooks: estados corretos (loading, error, success)

### Passo 9.2 — Testes de Integracao (Supertest)

```bash
apps/api/tests/integration/
├── auth.integration.test.ts
├── championship.integration.test.ts
├── scoreboard.integration.test.ts
├── financial.integration.test.ts
├── license.integration.test.ts
└── tenant-isolation.integration.test.ts  # CRITICO
```

**O que testar (integracao):**
- Fluxo completo: HTTP request → controller → service → database → response
- Tenant isolation: criar dados com tenant A, buscar com tenant B → vazio
- Auth: rotas protegidas retornam 401 sem token
- License: rotas retornam 403 com licenca expirada
- Stripe webhook: processar evento e ativar licenca
- Socket.io: evento emitido apos score update

**TESTE CRITICO — Isolamento de Tenant:**
```typescript
test('tenant A nao ve dados do tenant B', async () => {
  // 1. Criar championship com tenant A
  // 2. Autenticar como tenant B
  // 3. GET /api/v1/championships → deve retornar lista vazia
  // 4. GET /api/v1/championships/{id-do-tenant-A} → deve retornar 404
});
```

### Passo 9.3 — Testes E2E (Playwright)

```bash
apps/web/tests/e2e/
├── auth/
│   ├── login.spec.ts
│   ├── register.spec.ts
│   └── logout.spec.ts
├── championship/
│   ├── create-championship.spec.ts
│   ├── manage-participants.spec.ts
│   └── list-championships.spec.ts
├── scoreboard/
│   ├── update-score.spec.ts
│   └── live-scoreboard.spec.ts
├── financial/
│   └── manage-transactions.spec.ts
├── superadmin/
│   ├── manage-tenants.spec.ts
│   └── create-license.spec.ts
└── saas/
    ├── tenant-isolation.spec.ts       # CRITICO
    ├── license-expiration.spec.ts     # CRITICO
    └── preview-mode-limits.spec.ts
```

**Fluxos E2E obrigatorios:**
1. Register → Login → Criar campeonato → Adicionar participantes
2. Criar match → Atualizar placar → Verificar live page
3. Lead signup → Pagamento → Acesso completo
4. Licenca expirar → Acesso bloqueado (403)
5. Tenant A nao ve dados do tenant B
6. Modo preview: max 3 participantes, sem export, sem financeiro

**Criterio de conclusao Fase 9:**
- [ ] Cobertura unitaria > 80% em services e schemas
- [ ] Testes de integracao para cada endpoint
- [ ] Teste de isolamento de tenant passando
- [ ] Testes E2E para todos os fluxos criticos
- [ ] Testes rodam em CI (GitHub Actions)
- [ ] Nenhum teste flaky (instavel)

---

## FASE 10 — Observabilidade

**Objetivo:** Monitoramento, logging estruturado, alertas e dashboards.

**Agentes:** 17 (Deploy) + 15 (Guardiao)

### Passo 10.1 — Logging (Pino)

```typescript
// apps/api/src/shared/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
  // Em producao: JSON estruturado
  // Campos obrigatorios: timestamp, level, message, tenantId, requestId
});
```

### Passo 10.2 — Metricas (Prometheus)

```typescript
// Metricas a expor em GET /metrics:
// - http_requests_total (method, route, status)
// - http_request_duration_seconds (histogram)
// - active_websocket_connections (gauge)
// - bull_jobs_total (queue, status)
// - bull_job_duration_seconds (histogram)
// - active_tenants (gauge)
// - database_query_duration_seconds (histogram)
```

### Passo 10.3 — Error Tracking (Sentry)

```typescript
// Integrar Sentry no backend e frontend
// Backend: Sentry.init() no app.ts
// Frontend: Sentry.init() no instrumentation.ts (Next.js)
// Capturar: erros nao tratados, rejeicoes de promise
// Contexto: tenantId, userId, route
```

### Passo 10.4 — Health Check

```typescript
// GET /api/health
// Retorna:
// {
//   status: 'ok',
//   database: 'connected',
//   redis: 'connected',
//   uptime: 12345,
//   version: '1.0.0'
// }
```

**Criterio de conclusao Fase 10:**
- [ ] Pino logando em JSON estruturado
- [ ] Prometheus expondo metricas em /metrics
- [ ] Grafana com dashboard de performance
- [ ] Sentry capturando erros em producao
- [ ] Health check endpoint funcionando
- [ ] Alertas configurados (email/WhatsApp para erros criticos)

---

## FASE 11 — Deploy e CI/CD

**Objetivo:** Pipeline automatizado de deploy via GitHub Actions.

**Agente:** 17 (Deploy CI/CD)

### Passo 11.1 — Dockerfiles

**Backend (`apps/api/Dockerfile`):**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared-types/package*.json ./packages/shared-types/
RUN npm ci --workspace=apps/api --workspace=packages/shared-types
COPY . .
RUN npm run build --workspace=packages/shared-types
RUN npm run build --workspace=apps/api
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

**Frontend (`apps/web/Dockerfile`):**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY packages/ui-kit/package*.json ./packages/ui-kit/
RUN npm ci
COPY . .
RUN npm run build --workspace=apps/web

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/package.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
```

### Passo 11.2 — GitHub Actions

**CI (`.github/workflows/ci.yml`):**
```yaml
name: CI
on: [push, pull_request]
jobs:
  ci:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: sportflow_test
        ports: ['5432:5432']
      redis:
        image: redis:7-alpine
        ports: ['6379:6379']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run test:integration
      - run: npm run build
```

**Deploy Backend (`.github/workflows/deploy-backend.yml`):**
```yaml
name: Deploy Backend
on:
  push:
    branches: [main]
    paths: ['apps/api/**', 'packages/shared-types/**']
  workflow_dispatch:
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test --workspace=apps/api
      - run: npm run build --workspace=apps/api
      # Deploy para Railway/Render/AWS conforme ambiente
```

### Passo 11.3 — Ambientes

```
.env.development  → local (localhost, Docker Compose)
.env.staging      → staging (copia de producao para testes)
.env.production   → producao (secrets no GitHub Secrets)
```

**REGRA ABSOLUTA: NUNCA deploy manual. SEMPRE via GitHub Actions.**

**Criterio de conclusao Fase 11:**
- [ ] Dockerfiles otimizados (multi-stage build)
- [ ] CI rodando lint + typecheck + testes em cada push
- [ ] Deploy automatico ao fazer push para main
- [ ] Staging environment funcionando
- [ ] Database migrations rodam no deploy (prisma migrate deploy)
- [ ] Rollback documentado
- [ ] Health check valida apos deploy
- [ ] Secrets no GitHub Secrets (nunca no codigo)

---

## FASE 12 — Hardening de Seguranca

**Objetivo:** Revisao final de seguranca e blindagem do sistema.

**Agente:** 15 (Guardiao de Arquitetura)

### Checklist de Seguranca Final

**Autenticacao:**
- [ ] JWT em HttpOnly cookies (nunca localStorage)
- [ ] Access token expira em 15 minutos
- [ ] Refresh token expira em 7 dias
- [ ] bcrypt com cost factor 12 para passwords
- [ ] Rate limiting em login (10 req/min)
- [ ] 2FA obrigatorio para superadmin

**Multi-tenancy:**
- [ ] RLS ativo em TODAS as tabelas com tenant_id
- [ ] Middleware injeta tenant context em TODA request
- [ ] Teste de isolamento passando (tenant A ≠ tenant B)
- [ ] SuperAdmin bypass controlado via app.is_superadmin

**API:**
- [ ] CORS restrito ao dominio frontend
- [ ] Helmet.js com CSP headers
- [ ] Rate limiting global (100 req/min)
- [ ] Validacao Zod em TODOS os inputs
- [ ] Nenhum SQL raw sem prepared statements
- [ ] Stripe webhook verifica assinatura

**Dados:**
- [ ] Soft delete implementado (deletedAt)
- [ ] Retencao de 30 dias apos expiracao (LGPD)
- [ ] Exclusao automatica apos 30 dias
- [ ] Audit logs para todas as acoes criticas
- [ ] Nenhum dado sensivel em logs

**Infraestrutura:**
- [ ] HTTPS em producao (SSL/TLS)
- [ ] Secrets em variaveis de ambiente (nunca no codigo)
- [ ] .env* no .gitignore
- [ ] Docker images sem ferramentas desnecessarias
- [ ] Dependencias sem vulnerabilidades conhecidas (npm audit)

**Frontend:**
- [ ] Nenhum token/secret acessivel via JavaScript
- [ ] CSP previne XSS
- [ ] React escapa HTML automaticamente
- [ ] Nenhuma chamada de API sem tratamento de erro

---

## MAPEAMENTO AGENTES x FASES

| Fase | Agentes Envolvidos | Descricao |
|------|-------------------|-----------|
| 0 - Setup | Manual | Fundacao do monorepo |
| 1 - Auth | 03, 04, 07, 09, 10 | JWT + RLS + Middleware chain |
| 2 - Campeonatos | 03, 04, 09, 10 | CRUD completo |
| 3 - Placar Real-time | 03, 04, 09, 10 | Socket.io + Redis Pub/Sub |
| 4 - Financeiro | 03, 04, 09, 10 | Receitas e despesas |
| 5 - Exportacao | 03, 10, opc-b | Bull queue + S3/R2 |
| 6 - Licenciamento | 03, 04, 10 | Stripe + License Worker |
| 7 - SuperAdmin | 03, 04, 09, 10 | Painel administrativo |
| 8 - Placar Publico | 04, 09 | SSR + Socket.io (sem auth) |
| 9 - Testes | 11, 12, 13, 14 | Unit + Integration + E2E |
| 10 - Observabilidade | 17, 15 | Prometheus + Grafana + Sentry |
| 11 - Deploy | 17 | Docker + GitHub Actions |
| 12 - Hardening | 15 | Revisao final de seguranca |

### Agentes no Pre-desenvolvimento

| Agente | Quando Executar | Entrega |
|--------|----------------|---------|
| 01 - PRD Analyst | Antes de tudo | PRD completo |
| 02 - Analista de Tela | Apos PRD | Mapa de telas |
| 02-b - Diagnostico Infra | Paralelo com 03/04/05 | Recomendacoes estruturais |
| 05 - Arquiteto Designer | Apos telas | Design visual |
| 06 - Dev Mockado | Apos design | Prototipo navegavel (GATE) |
| 08 - Product Owner | Apos mock aprovado | Pacotes de desenvolvimento |
| 16 - Arquiteto Eventos | Apos tudo pronto | Plano de evolucao EDA |

---

## CHECKLISTS DE QUALIDADE

### Checklist por Endpoint (Backend)

```
- [ ] Zod schema valida input
- [ ] Controller delega para Service (sem logica)
- [ ] Service contem regras de negocio
- [ ] Repository acessa banco via Prisma
- [ ] tenantId em TODA operacao
- [ ] JWT validado em rota protegida
- [ ] Licenca verificada em rota protegida
- [ ] Erro tratado com HTTP status correto
- [ ] Audit log para operacoes de escrita
- [ ] Rate limiting aplicado
```

### Checklist por Pagina (Frontend)

```
- [ ] Middleware protege rota (se autenticada)
- [ ] Estado de loading (Skeleton)
- [ ] Estado de erro (mensagem clara)
- [ ] Estado vazio (CTA para proxima acao)
- [ ] Estado de sucesso (Toast)
- [ ] Validacao de formulario antes de submit
- [ ] data-testid em elementos interativos
- [ ] Responsivo (mobile-first)
- [ ] Acessibilidade basica (labels, alt text, focus)
- [ ] Tailwind apenas (sem inline CSS)
```

### Checklist por Modulo (Completo)

```
- [ ] Schema Prisma definido com indices
- [ ] RLS policy criada
- [ ] Backend: controller + service + repository + schema + mapper + factory
- [ ] Frontend: page + components + service + DTO + hook (se real-time)
- [ ] Testes unitarios para service e schema
- [ ] Teste de integracao para fluxo completo
- [ ] Teste de isolamento de tenant
- [ ] Documentacao de endpoints (se novo modulo)
```

---

## TROUBLESHOOTING

### Erros Comuns

| Erro | Causa | Solucao |
|------|-------|---------|
| `401 Unauthorized` | JWT ausente ou expirado | Verificar cookie HttpOnly, verificar refresh |
| `403 Forbidden` | Licenca expirada ou role insuficiente | Verificar license.status e user.role |
| `404 Not Found` | Recurso nao existe OU pertence a outro tenant | RLS filtrando corretamente — comportamento esperado |
| `409 Conflict` | Registro duplicado (email, slug) | Verificar unique constraints |
| `429 Too Many Requests` | Rate limit atingido | Aguardar cooldown |
| Socket.io nao conecta | CORS ou URL errada | Verificar NEXT_PUBLIC_WS_URL e CORS_ORIGINS |
| Placar nao atualiza | Redis Pub/Sub desconectado | Verificar conexao Redis |
| Export job travado | Worker nao rodando | Verificar Bull queue e logs do worker |
| Stripe webhook falha | Assinatura invalida | Verificar STRIPE_WEBHOOK_SECRET |
| Prisma migration falha | Schema incompativel | `npx prisma migrate reset` (dev only) |
| Build falha no CI | Dependencia faltando | `npm ci` (nao `npm install`) |
| Tenant ve dados de outro | RLS nao configurado | Verificar policy e middleware tenant |

### Comandos de Debug

```bash
# Verificar conexao PostgreSQL
docker exec sportflow-db pg_isready

# Verificar Redis
docker exec sportflow-redis redis-cli ping

# Ver logs do backend em tempo real
cd apps/api && npm run dev | npx pino-pretty

# Verificar RLS policies
docker exec sportflow-db psql -U sportflow -c "SELECT * FROM pg_policies;"

# Ver jobs na fila Bull
docker exec sportflow-redis redis-cli keys "bull:*"

# Prisma Studio (visualizar banco)
npx prisma studio

# Verificar JWT manualmente
node -e "console.log(JSON.parse(Buffer.from('TOKEN'.split('.')[1], 'base64').toString()))"
```

---

## RESUMO EXECUTIVO

```
SportFlow = Next.js 14 + Node.js/Express + PostgreSQL RLS + Redis + Socket.io + Stripe

13 fases de construcao, cada uma 100% completa antes de avancar.
21 agentes FlowCore guiam cada etapa.
3 gates obrigatorios: Mock (cliente aprova), QA (testes passam), Guardiao (seguranca OK).

Seguranca: JWT HttpOnly + RLS + License middleware + RBAC + 2FA + LGPD
Real-time: Socket.io < 100ms latencia
Pagamentos: Stripe automatizado via webhooks
Deploy: GitHub Actions → Railway/Render/AWS
```

---

**FlowCore** — Engenharia de Software com Inteligencia Artificial
