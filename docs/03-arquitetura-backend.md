# Arquitetura Backend — SportFlow

**Agente responsável:** 03-arquiteto-it-valley-backend
**Stack:** Node.js 20 + TypeScript + Express + Prisma + PostgreSQL 15 (RLS) + Redis 7 + Socket.io + Bull + Stripe SDK + Puppeteer

---

## 1. Estrutura de pastas (apps/api)

```
apps/api/
├── src/
│   ├── config/
│   │   ├── env.ts                 # Zod parse do process.env
│   │   ├── database.ts            # Prisma client singleton
│   │   ├── redis.ts               # ioredis client singleton
│   │   └── stripe.ts              # Stripe SDK singleton
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts     # Valida JWT, popula req.user
│   │   ├── tenant.middleware.ts   # SET LOCAL app.current_tenant_id
│   │   ├── license.middleware.ts  # Bloqueia se licença expirada
│   │   ├── rateLimit.middleware.ts
│   │   ├── audit.middleware.ts    # Fire-and-forget
│   │   └── superadmin.middleware.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   ├── auth.schema.ts     # Zod
│   │   │   ├── auth.factory.ts    # Token generation
│   │   │   ├── auth.mapper.ts     # Entity → DTO
│   │   │   └── auth.routes.ts
│   │   ├── tenant/
│   │   ├── championship/
│   │   │   ├── ...
│   │   │   └── sport-presets.ts   # 4 esportes MVP
│   │   ├── participant/
│   │   ├── match/
│   │   ├── scoreboard/
│   │   ├── financial/
│   │   ├── export/
│   │   ├── license/
│   │   ├── superadmin/
│   │   └── live/                  # rotas públicas /live
│   │
│   ├── workers/
│   │   ├── export.worker.ts
│   │   ├── email.worker.ts
│   │   ├── license.worker.ts      # Bull repeatable
│   │   └── audit-flush.worker.ts  # opcional
│   │
│   ├── events/
│   │   ├── publisher.ts           # emit em Redis pub/sub
│   │   ├── contracts.ts           # tipos dos eventos
│   │   └── consumers/             # readers do pub/sub
│   │
│   ├── shared/
│   │   ├── errors.ts              # AppError, ValidationError, etc
│   │   ├── logger.ts              # Pino config
│   │   ├── pagination.ts
│   │   ├── result.ts              # Result<T, E> pattern (opcional)
│   │   └── crypto.ts              # bcrypt helpers, generateLiveToken
│   │
│   ├── app.ts                     # Express setup + middleware chain
│   ├── server.ts                  # bootstrap + graceful shutdown
│   └── socket.ts                  # Socket.io init + rooms + auth
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── sql/
│   └── rls-policies.sql
├── tests/
│   ├── unit/
│   ├── integration/
│   └── helpers/
├── Dockerfile
├── package.json
└── tsconfig.json
```

---

## 2. Camadas (por modulo)

**Controller → Service → Repository** (regra rígida).

- **Controller** e fino: valida input (Zod), chama Service, formata resposta HTTP. Nenhuma logica de negocio.
- **Service** contém regras de negocio, orquestra repositories, pública eventos, dispara Bull jobs.
- **Repository** e a ÚNICA camada que fala com Prisma. Sempre inclui `tenantId` na query (RLS ajuda mas não dispensa).
- **Schema** exporta Zod schemas + tipos TS.
- **Factory** cria objetos complexos (tokens JWT, live tokens, sport preset resolvido).
- **Mapper** converte entity Prisma → DTO da API.

Nenhum Controller importa Prisma. Nenhum Service faz `res.json()`.

---

## 3. Middleware chain (ordem)

```typescript
// app.ts
app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }))
app.use(helmet())
app.use(compression())
app.use(cookieParser())
app.use(express.json({ limit: '1mb' }))
app.use(pinoHttp({ logger }))

// PÚBLICO (sem auth)
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/live', liveRoutes)
app.use('/api/v1/webhooks', webhookRoutes) // Stripe
app.get('/api/health', healthController)
app.get('/metrics', prometheusController)

// PROTEGIDO — ordem NÃO negociavel
app.use(authMiddleware)         // 1. JWT → req.user
app.use(tenantMiddleware)       // 2. SET LOCAL app.current_tenant_id
app.use(rateLimitMiddleware)    // 3. Rate limit por IP+tenant
app.use(licenseMiddleware)      // 4. Licença ativa?
app.use(auditMiddleware)        // 5. Log de audit fire-and-forget

app.use('/api/v1/championships', championshipRoutes)
app.use('/api/v1/participants', participantRoutes)
app.use('/api/v1/matches', matchRoutes)
app.use('/api/v1/financial', financialRoutes)
app.use('/api/v1/export-jobs', exportRoutes)

// SUPERADMIN — extra layer
app.use('/superadmin', superadminMiddleware, superadminRoutes)

// Error handler
app.use(errorHandler)
```

---

## 4. Autenticação (fluxo)

- **Register:** cria User + Tenant em transaction. Tenant status `preview`. Retorna cookies.
- **Login:** compara bcrypt → gera access(15m) + refresh(7d). Cookies HttpOnly.
- **Refresh:** cookie refresh presente → verifica → gera novo access. Se refresh inválido → 401.
- **Logout:** limpa cookies + adiciona refresh token a blacklist Redis (TTL = expiracao original).

JWT payload:
```json
{
  "sub": "user_uuid",
  "tenantId": "tenant_uuid",
  "role": "owner|member|superadmin",
  "iat": ...,
  "exp": ...
}
```

---

## 5. Multi-tenancy — implementação prática

**Tenant middleware:**
```typescript
export const tenantMiddleware = async (req, res, next) => {
  const tenantId = req.user?.tenantId
  if (!tenantId) return next(new UnauthorizedError())
  await prisma.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`
  if (req.user.role === 'superadmin') {
    await prisma.$executeRaw`SELECT set_config('app.is_superadmin', 'true', true)`
  }
  next()
}
```

**RLS + Repository juntos:** RLS bloqueia, mas repositorios AINDA passam `tenantId` explicitamente por defense-in-depth. Se um dia RLS falhar, o codigo ainda esta correto.

---

## 6. Socket.io — arquitetura

- Adapter Redis para escalar horizontal
- Auth de room admin: middleware Socket.io le cookie do handshake, verifica JWT
- Room público `match:public:{liveToken}` não exige auth mas e read-only (server descarta emits do client)
- Eventos server → client: `score:updated`, `timer:started|paused|reset`, `export:ready`, `match:finished`
- Eventos client → server (admin only): `score:update`, `timer:start|pause|reset`

Fluxo de score update:
```
Admin emite score:update
  → server verifica auth + permissão no match
  → chama ScoreboardService.recordScore(...)
  → persiste ScoreEntry
  → recomputa placar
  → pública em Redis (adapter)
  → broadcast para match:admin:{id} + match:public:{token}
```

---

## 7. Bull queue — configuração

- `Queue` para producers (dentro do API)
- `Worker` como processo separado (mesmo repo, entry point `workers/index.ts`)
- Retry exponencial: 3 tentativas com backoff 5s → 25s → 125s
- `removeOnComplete: 100` e `removeOnFail: 500`
- Dashboard `bull-board` exposto em `/admin/queues` (protegido por superadmin)

---

## 8. Stripe integration

- **Nunca** usar SDK no frontend para operações sensiveis.
- Backend cria `Session` → retorna URL.
- Webhook em `/api/v1/webhooks/stripe`:
  1. Le `stripe-signature` header
  2. `stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET)`
  3. Se `checkout.session.completed`:
     - Extrai `licenseId` de `session.metadata`
     - Chama `LicenseService.activate(licenseId, session.payment_intent)`
  4. Retorna 200 rápido; toda logica pesada e assincrona

---

## 9. Puppeteer para PDF

- Roda no export.worker.ts
- Chromium em headless
- Template HTML renderizado com dados do campeonato
- Timeout 30s
- Se falhar, salva `error_message` no job e Sentry captura

Dockerfile do worker precisa incluir dependencias Chromium (documentar).

---

## 10. Padrão de erro

```typescript
// shared/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) { super(message) }
}

// Especializacoes
class ValidationError extends AppError { constructor(details) { super(400, 'VALIDATION_ERROR', ...) } }
class UnauthorizedError extends AppError { constructor() { super(401, 'UNAUTHORIZED', ...) } }
class ForbiddenError extends AppError { constructor(reason) { super(403, 'FORBIDDEN', reason) } }
class NotFoundError extends AppError { constructor() { super(404, 'NOT_FOUND', ...) } }
class LicenseExpiredError extends AppError { constructor() { super(403, 'LICENSE_EXPIRED', ...) } }
```

Error handler central:
```typescript
export const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details }
    })
  }
  logger.error({ err }, 'unhandled error')
  Sentry.captureException(err)
  return res.status(500).json({ error: { code: 'INTERNAL', message: 'erro interno' } })
}
```

---

## 11. Config via Zod

```typescript
// config/env.ts
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  API_PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  CORS_ORIGINS: z.string().transform(s => s.split(',')),
  WEB_URL: z.string().url(),
  AZURE_BLOB_CONNECTION_STRING: z.string().optional(),
  AZURE_BLOB_CONTAINER: z.string().default('sportflow-exports'),
})
export const env = envSchema.parse(process.env)
```

App falha rápido no boot se config errada.

---

## 12. Testabilidade

- Serviços aceitam dependencias por parametro (não usar singletons in-line) → fácil mockar
- Repositories fakes com Map em memória para testes unitarios
- Integration tests: banco Postgres real + RLS ativo + transactions rollback per test

---

## 13. Handoff

- Para **04-frontend:** contratos de API (documentar via `packages/shared-types` — DTO por endpoint), eventos Socket.io e cookies esperados
- Para **07-sql-mongodb:** schema Prisma da secao 15 do docs/01-prd
- Para **10-dev-backend:** este documento + skeleton de pastas já bootstrapado no monorepo
- Para **02-c:** confirmar que RLS + rate limit + Zod estão em todo endpoint
