# SportFlow — Plataforma SaaS de Gestao Esportiva

**Desenvolvido por FlowCore**

Plataforma multi-tenant para gestao de campeonatos, placares em tempo real e financas esportivas. Arquitetura segura, robusta e escalavel construida com a esteira de agentes FlowCore.

---

## Visao Geral

O SportFlow permite que **organizadores de eventos esportivos** (Contratantes) criem campeonatos, gerenciem placares ao vivo e controlem financas — tudo em uma plataforma SaaS com isolamento total de dados por tenant.

### Tres Perfis de Acesso

| Perfil | Acesso | Autenticacao |
|--------|--------|-------------|
| **Admin (SuperAdmin)** | Gestao completa do sistema, tenants, licencas, metricas | JWT + 2FA + IP whitelist |
| **Contratante (Tenant)** | Campeonatos, placar, financeiro, exportacoes | JWT + Licenca ativa |
| **Espectador (Publico)** | Placar ao vivo via link publico | Nenhuma (SSR, read-only) |

---

## Stack Tecnologica

| Camada | Tecnologia |
|--------|-----------|
| **Backend** | Node.js + TypeScript + Express |
| **ORM** | Prisma (PostgreSQL) |
| **Frontend** | Next.js 14 (App Router) + React + TypeScript |
| **UI** | shadcn/ui + Tailwind CSS |
| **Database** | PostgreSQL 15+ com Row-Level Security (RLS) |
| **Cache / Filas** | Redis 7+ + Bull/BullMQ |
| **Real-time** | Socket.io (WebSocket + long-polling) |
| **Pagamentos** | Stripe (Checkout + Webhooks) |
| **Auth** | JWT HttpOnly cookies (15min access + 7d refresh) |
| **Monorepo** | Turborepo |
| **Infra** | Docker + Docker Compose |
| **CI/CD** | GitHub Actions |
| **Deploy** | Railway / Render (inicial) → AWS (escala) |
| **Observabilidade** | Prometheus + Grafana + Pino + Sentry |
| **Storage** | S3 / Cloudflare R2 |
| **Testes** | Vitest + Supertest + Playwright |

---

## Estrutura do Monorepo

```
sportflow/
├── apps/
│   ├── api/                          # Backend Node.js + Express
│   │   ├── src/
│   │   │   ├── config/               # env.ts (Zod), database.ts, redis.ts
│   │   │   ├── middlewares/          # auth, tenant, license, rateLimit, audit
│   │   │   ├── modules/
│   │   │   │   ├── auth/             # login, register, JWT refresh
│   │   │   │   ├── tenant/           # CRUD tenants, preview mode
│   │   │   │   ├── championship/     # campeonatos, sport presets
│   │   │   │   ├── scoreboard/       # placar real-time (Socket.io)
│   │   │   │   ├── financial/        # receitas, despesas, patrocinadores
│   │   │   │   ├── export/           # PDF/CSV async (Bull queue)
│   │   │   │   └── license/          # Stripe, ativacao, expiracao
│   │   │   ├── workers/             # export, email, license checker
│   │   │   ├── events/              # publisher, contracts, consumers
│   │   │   ├── shared/              # errors, logger (Pino), pagination
│   │   │   ├── app.ts               # Express setup
│   │   │   ├── server.ts            # Entry point
│   │   │   └── socket.ts            # Socket.io init
│   │   ├── prisma/
│   │   │   ├── schema.prisma        # Schema + RLS
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── sql/
│   │   │   └── rls-policies.sql     # Row-Level Security
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   └── e2e/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── web/                          # Frontend Next.js 14
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/           # /login, /register
│       │   │   ├── (dashboard)/      # rotas autenticadas (contratante)
│       │   │   │   ├── championships/
│       │   │   │   ├── championships/[id]/
│       │   │   │   ├── championships/[id]/scoreboard/
│       │   │   │   ├── championships/[id]/financial/
│       │   │   │   ├── championships/[id]/calendar/
│       │   │   │   └── championships/[id]/export/
│       │   │   ├── (superadmin)/     # painel admin (/superadmin)
│       │   │   │   ├── tenants/
│       │   │   │   ├── licenses/
│       │   │   │   ├── leads/
│       │   │   │   └── metrics/
│       │   │   └── live/[token]/     # placar publico (SSR, sem auth)
│       │   ├── components/
│       │   │   ├── ui/               # shadcn/ui
│       │   │   ├── scoreboard/       # LiveScoreboard, GameTimer, ScoreUpdater
│       │   │   ├── financial/
│       │   │   └── championship/
│       │   ├── hooks/
│       │   │   ├── useSocket.ts
│       │   │   ├── useLiveScore.ts
│       │   │   └── useAuth.ts
│       │   ├── services/             # camada de servicos
│       │   ├── dto/                  # DTOs TypeScript
│       │   ├── lib/
│       │   │   ├── api.ts            # Axios + interceptors
│       │   │   └── auth.ts           # config de auth
│       │   └── middleware.ts         # protecao de rotas
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   ├── shared-types/                 # DTOs e interfaces compartilhadas
│   │   ├── src/
│   │   │   ├── auth.ts
│   │   │   ├── championship.ts
│   │   │   ├── scoreboard.ts
│   │   │   ├── financial.ts
│   │   │   └── index.ts
│   │   └── package.json
│   └── ui-kit/                       # Componentes UI reutilizaveis
│       └── package.json
│
├── infra/
│   ├── docker-compose.yml            # dev local (postgres, redis)
│   ├── docker-compose.prod.yml
│   ├── nginx.conf                    # proxy reverso
│   ├── prometheus/
│   │   └── prometheus.yml
│   └── grafana/
│       └── dashboards/
│
├── .github/
│   └── workflows/
│       ├── ci.yml                    # lint + typecheck + test + build
│       ├── deploy-backend.yml
│       ├── deploy-frontend.yml
│       └── deploy-full.yml
│
├── .env.example                      # template de variaveis
├── turbo.json                        # config Turborepo
├── package.json                      # root do monorepo
├── CLAUDE.md                         # guia completo de construcao
└── README.md                         # este arquivo
```

---

## Fluxos Principais

### Fluxo 1: Lead → Cliente Ativo

```
1. Lead preenche formulario (email, WhatsApp, esporte)
   POST /api/v1/leads

2. Sistema cria tenant em modo "preview"
   - Max 3 participantes
   - Sem exportacao
   - Sem financeiro
   - Marca d'agua no placar

3. Admin cria licenca no painel superadmin
   POST /superadmin/licenses { tenant_id, days: 3, price: 500 }

4. Sistema gera link Stripe Checkout → envia por email

5. Lead paga → Stripe webhook confirma
   POST /api/v1/webhooks/stripe

6. License Service ativa tenant automaticamente
   license.status = 'active'
   expires_at = now + 3 dias

7. Apos expiracao: License Worker bloqueia (403)
   - Dados preservados por 30 dias (LGPD)

8. Apos 30 dias: exclusao automatica
```

### Fluxo 2: Placar em Tempo Real

```
LADO ADMIN (Contratante):
1. Abre painel do jogo → Socket.io room match:admin:{matchId}
2. Clica "+1 ponto" → PATCH /api/v1/matches/:id/score
3. Backend:
   - Salva em score_entries (PostgreSQL)
   - Publica via Redis Pub/Sub
   - Registra em audit_logs
4. Controla timer: socket.emit('timer:start' | 'timer:pause')

LADO PUBLICO (Espectador):
1. Acessa /live/{live_token} (sem auth, SSR)
2. Next.js renderiza placar no servidor (sem flicker)
3. Conecta ao Socket.io room match:public:{token} (read-only)
4. Recebe atualizacoes < 100ms:
   - score:updated
   - timer:started / paused / reset
5. NAO acessa financeiro, outros jogos ou painel admin
```

### Fluxo 3: Exportacao (PDF/CSV) Assincrona

```
1. Contratante solicita exportacao
   POST /api/v1/championships/:id/export
   { format: 'pdf', modules: ['results', 'financial'] }
   → Resposta imediata com job_id

2. Job entra na fila Bull (Redis)
   export_jobs.status = 'pending'

3. Worker processa em background
   - PDF via Puppeteer (HTML → PDF)
   - CSV via fast-csv
   - Upload para S3/R2

4. Notificacao ao usuario
   - Socket.io: export:ready { download_url }
   - Email com link (expira em 24h)
```

---

## Schema do Banco de Dados

### Tabelas Principais

```
tenants          → id, slug, name, email, whatsapp, status, createdAt
licenses         → id, tenantId, startsAt, expiresAt, durationDays, priceBrl,
                   stripePaymentId, status
users            → id, tenantId, email, passwordHash, role, lastLogin
championships    → id, tenantId, name, sportType, rulesConfig (JSONB),
                   status, startDate, endDate
participants     → id, championshipId, tenantId, name, category, metadata (JSONB)
matches          → id, championshipId, tenantId, homeParticipantId,
                   awayParticipantId, status, scheduledAt, liveToken,
                   timerSeconds, timerRunning
score_entries    → id, matchId, tenantId, participantId, scoreData (JSONB),
                   updatedBy, createdAt
financial_txns   → id, championshipId, tenantId, type, category, amount,
                   description, sponsorName, transactionDate
calendar_events  → id, championshipId, tenantId, title, type, startsAt,
                   endsAt, notes
export_jobs      → id, championshipId, tenantId, format, status, fileUrl,
                   completedAt
audit_logs       → id, tenantId, userId, action, resource, payload (JSONB),
                   ipAddress, createdAt
```

### Multi-tenancy (RLS)

Toda tabela possui `tenantId`. Row-Level Security no PostgreSQL garante isolamento:

```sql
-- Politica RLS: tenant so ve seus proprios dados
ALTER TABLE championships ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON championships
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

O middleware `tenant.middleware.ts` injeta o tenant_id do JWT em cada request:

```typescript
// Antes de cada query
await prisma.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
```

---

## API Endpoints

### Auth
```
POST   /api/v1/auth/register          # Cadastro de lead
POST   /api/v1/auth/login             # Login (retorna JWT em HttpOnly cookie)
POST   /api/v1/auth/refresh           # Renovar access token
POST   /api/v1/auth/logout            # Invalidar refresh token
```

### Championships (tenant-scoped)
```
GET    /api/v1/championships           # Listar campeonatos do tenant
POST   /api/v1/championships           # Criar campeonato
GET    /api/v1/championships/:id       # Detalhe
PATCH  /api/v1/championships/:id       # Atualizar
DELETE /api/v1/championships/:id       # Soft delete
```

### Matches & Scoreboard (real-time via Socket.io)
```
GET    /api/v1/matches/:id             # Detalhe do jogo
PATCH  /api/v1/matches/:id/score       # Atualizar placar → Redis pub/sub
PATCH  /api/v1/matches/:id/timer       # Iniciar/pausar timer
GET    /api/v1/live/:token             # Dados publicos do placar (SSR)
```

### Financial
```
GET    /api/v1/championships/:id/financial     # Resumo financeiro
POST   /api/v1/financial/transactions          # Criar transacao
PATCH  /api/v1/financial/transactions/:id      # Atualizar
DELETE /api/v1/financial/transactions/:id      # Remover
```

### Export (async)
```
POST   /api/v1/championships/:id/export        # Enfileirar job
GET    /api/v1/export-jobs/:id                 # Status do job
```

### SuperAdmin (apenas Admin)
```
GET    /superadmin/tenants              # Listar todos os tenants
POST   /superadmin/licenses             # Criar licenca
PATCH  /superadmin/licenses/:id         # Ativar/desativar
GET    /superadmin/leads                # Ver leads
GET    /superadmin/metrics              # Metricas do sistema
```

### Webhooks
```
POST   /api/v1/webhooks/stripe          # Stripe payment confirmation
```

### Socket.io Events
```
Rooms:
  match:admin:{matchId}     # Admin (autenticado)
  match:public:{liveToken}  # Publico (read-only)

Events emitidos:
  score:updated             # Placar atualizado
  timer:started             # Timer iniciado
  timer:paused              # Timer pausado
  timer:reset               # Timer resetado
  export:ready              # Exportacao concluida
```

---

## Seguranca

| Pilar | Implementacao |
|-------|-------------|
| **Multi-tenancy** | PostgreSQL RLS + middleware tenant |
| **Autenticacao** | JWT em HttpOnly cookies (15min access + 7d refresh) |
| **Autorizacao** | RBAC (Admin, Tenant Owner, Tenant Member, Public) |
| **Licenciamento** | Middleware valida licenca ativa em toda rota protegida |
| **Rate Limiting** | 100 req/min normal, 10 req/min login |
| **Passwords** | bcrypt com cost factor 12 |
| **2FA** | Obrigatorio para painel superadmin |
| **CORS** | Apenas dominio frontend permitido |
| **CSP** | Helmet.js com Content Security Policy |
| **SQL Injection** | Prisma ORM (prepared statements) |
| **XSS** | React (escape automatico) + CSP headers |
| **Audit** | Toda acao critica logada em audit_logs |
| **LGPD** | Soft delete com retencao 30 dias + exclusao automatica |
| **Webhooks** | Verificacao de assinatura Stripe em todo webhook |
| **Secrets** | Variaveis de ambiente, NUNCA no codigo |

---

## Setup Local

### Pre-requisitos
- Node.js 20 LTS
- Docker e Docker Compose
- Git

### Instalacao

```bash
# 1. Clonar repositorio
git clone https://github.com/flowcore/sportflow.git
cd sportflow

# 2. Instalar dependencias
npm install

# 3. Subir infra local (PostgreSQL + Redis)
docker-compose up -d

# 4. Configurar variaveis de ambiente
cp .env.example .env.development

# 5. Rodar migrations
npm run db:migrate

# 6. Popular com dados de exemplo
npm run db:seed

# 7. Iniciar em modo desenvolvimento
npm run dev
# API: http://localhost:3001
# Web: http://localhost:3000
```

### Comandos Uteis

```bash
# Monorepo (Turborepo)
npm run dev              # API + Web simultaneamente
npm run build            # Build de producao
npm run lint             # ESLint em todo monorepo
npm run type-check       # TypeScript check
npm run format           # Prettier

# Database
npm run db:migrate       # Rodar migrations pendentes
npm run db:seed          # Popular banco com dados de exemplo
npm run db:studio        # Abrir Prisma Studio (GUI)
npm run db:reset         # Reset completo (dev only)

# Testes
npm run test             # Testes unitarios (Vitest)
npm run test:integration # Testes de integracao (Supertest)
npm run test:e2e         # Testes E2E (Playwright)
npm run test:coverage    # Relatorio de cobertura

# Docker
docker-compose up -d     # Subir PostgreSQL + Redis
docker-compose down      # Parar containers
```

---

## Deploy

### Railway (Recomendado para inicio)

```bash
# Backend
railway link
railway up --service api

# Frontend
railway up --service web
```

### AWS (Escala)

```
EC2 / ECS Fargate → API servers (auto-scaling)
RDS               → PostgreSQL (managed)
ElastiCache       → Redis (managed)
S3                → File storage (exports)
CloudFront        → CDN (static assets)
```

### CI/CD (GitHub Actions)

Push para `main` dispara deploy automatico:
- `apps/api/**` alterado → deploy backend
- `apps/web/**` alterado → deploy frontend
- `workflow_dispatch` para deploy manual

---

## Ordem de Construcao Recomendada

Para o MVP mais rapido com features funcionais:

1. **Auth + Tenant + License** — fundacao, nada funciona sem isso
2. **Championship Service** — criar campeonatos, categorias esportivas
3. **Scoreboard com real-time** — feature mais visivel (Socket.io)
4. **Financial Service** — rastreamento de receitas/despesas
5. **Export Service** — geracao de PDF/CSV (async com Bull)
6. **Placar publico** — link ao vivo para espectadores (SSR)
7. **Integracao Stripe** — habilitar pagamentos
8. **Observabilidade** — monitoramento, alertas, logging
9. **Hardening** — patches de seguranca, tuning de performance

---

## Esteira de Agentes FlowCore

Este projeto segue a esteira completa de 21 agentes definida em `/AGENTE_SAAS/`:

```
01-PRD Analyst → 02-Analista de Tela → 03/04/05 (paralelo) →
06-Dev Mockado (GATE) → 07-Database → 08-P.O. →
09/10 Dev (paralelo) → 11/12/13/14 QA (sequencial) →
15-Guardiao → 16-Eventos → 17-Deploy
```

Consulte `CLAUDE.md` neste repositorio para o guia completo de construcao.

---

## Licenca

Proprietario — FlowCore. Todos os direitos reservados.

---

**FlowCore** — Engenharia de Software com Inteligencia Artificial
