<!-- ASSINATURA FLOWCORE -->
```
    ________              ______
   / ____/ /___ _      __/ ____/___  ________
  / /_  / / __ \ | /| / / /   / __ \/ ___/ _ \
 / __/ / / /_/ / |/ |/ / /___/ /_/ / /  /  __/
/_/   /_/\____/|__/|__/\____/\____/_/   \___/

+-+-+-+-+-+-+-+-+-+
| S O L U Ç Õ E S |
+-+-+-+-+-+-+-+-+-+

      Desenvolvido por Leonardo Assis
```


# SportFlow — Plataforma SaaS de Gestão Esportiva

**Desenvolvido por FlowCore**

Plataforma multi-tenant para gestão de campeonatos, placares em tempo real e financas esportivas. Arquitetura segura, robusta e escalavel construida com a esteira de agentes FlowCore.

---

## Visao Geral

O SportFlow permite que **organizadores de eventos esportivos** (Contratantes) criem campeonatos, gerenciem placares ao vivo e controlem financas — tudo em uma plataforma SaaS com isolamento total de dados por tenant.

### Tres Perfis de Acesso

| Perfil | Acesso | Autenticação |
|--------|--------|-------------|
| **Admin (SuperAdmin)** | Gestão completa do sistema, tenants, licenças, métricas | JWT + 2FA + IP whitelist |
| **Contratante (Tenant)** | Campeonatos, placar, financeiro, exportações | JWT + Licença ativa |
| **Espectador (Público)** | Placar ao vivo via link público | Nenhuma (SSR, read-only) |

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
| **Deploy** | Azure App Service (`plan-tcc` / `rg-webapps`) via GitHub Actions |
| **Observabilidade** | Prometheus + Grafana + Pino + Sentry |
| **Storage** | Azure Blob Storage (ou S3/R2 conforme decisão final) |
| **Testes** | Vitest + Supertest + Playwright |

---

## Esportes Suportados (MVP)

| Esporte | Motor de Placar | Timer | Configuração |
|---------|-----------------|-------|--------------|
| **Futebol** | Gols | Sim | 2 tempos x 45min, max 32 participantes |
| **Vôlei** | Sets + pontos | Não | 3 sets, 25 pts/set, max 16 participantes |
| **Tênis** | Sets + games (15/30/40) | Não | Best-of-3 sets, 6 games/set, tie-break em 6-6, max 64 |
| **Skate** | Notas de juizes | Não | 3 rounds, nota max 100, max 64 participantes |

Novos esportes são adicionados via `apps/api/src/modules/championship/sport-presets.ts` sem alterar schema — o campo `rulesConfig` (JSONB) suporta qualquer configuração.

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
│   │   │   │   └── license/          # Stripe, ativação, expiracao
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
│       │   │   └── live/[token]/     # placar público (SSR, sem auth)
│       │   ├── components/
│       │   │   ├── ui/               # shadcn/ui
│       │   │   ├── scoreboard/       # LiveScoreboard, GameTimer, ScoreUpdater
│       │   │   ├── financial/
│       │   │   └── championship/
│       │   ├── hooks/
│       │   │   ├── useSocket.ts
│       │   │   ├── useLiveScore.ts
│       │   │   └── useAuth.ts
│       │   ├── services/             # camada de serviços
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
├── .env.example                      # template de variáveis
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
   - Sem exportação
   - Sem financeiro
   - Marca d'agua no placar

3. Admin cria licença no painel superadmin
   POST /superadmin/licenses { tenant_id, days: 3, price: 500 }

4. Sistema gera link Stripe Checkout → envia por email

5. Lead paga → Stripe webhook confirma
   POST /api/v1/webhooks/stripe

6. License Service ativa tenant automaticamente
   license.status = 'active'
   expires_at = now + 3 dias

7. Após expiracao: License Worker bloqueia (403)
   - Dados preservados por 30 dias (LGPD)

8. Após 30 dias: exclusão automática
```

### Fluxo 2: Placar em Tempo Real

```
LADO ADMIN (Contratante):
1. Abre painel do jogo → Socket.io room match:admin:{matchId}
2. Clica "+1 ponto" → PATCH /api/v1/matches/:id/score
3. Backend:
   - Salva em score_entries (PostgreSQL)
   - Pública via Redis Pub/Sub
   - Registra em audit_logs
4. Controla timer: socket.emit('timer:start' | 'timer:pause')

LADO PÚBLICO (Espectador):
1. Acessa /live/{live_token} (sem auth, SSR)
2. Next.js renderiza placar no servidor (sem flicker)
3. Conecta ao Socket.io room match:public:{token} (read-only)
4. Recebe atualizações < 100ms:
   - score:updated
   - timer:started / paused / reset
5. NÃO acessa financeiro, outros jogos ou painel admin
```

### Fluxo 3: Exportação (PDF/CSV) Assincrona

```
1. Contratante solicita exportação
   POST /api/v1/championships/:id/export
   { format: 'pdf', modules: ['results', 'financial'] }
   → Resposta imediata com job_id

2. Job entra na fila Bull (Redis)
   export_jobs.status = 'pending'

3. Worker processa em background
   - PDF via Puppeteer (HTML → PDF)
   - CSV via fast-csv
   - Upload para S3/R2

4. Notificação ao usuario
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
-- Política RLS: tenant só ve seus próprios dados
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
GET    /api/v1/live/:token             # Dados públicos do placar (SSR)
```

### Financial
```
GET    /api/v1/championships/:id/financial     # Resumo financeiro
POST   /api/v1/financial/transactions          # Criar transação
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
POST   /superadmin/licenses             # Criar licença
PATCH  /superadmin/licenses/:id         # Ativar/desativar
GET    /superadmin/leads                # Ver leads
GET    /superadmin/metrics              # Métricas do sistema
```

### Webhooks
```
POST   /api/v1/webhooks/stripe          # Stripe payment confirmation
```

### Socket.io Events
```
Rooms:
  match:admin:{matchId}     # Admin (autenticado)
  match:public:{liveToken}  # Público (read-only)

Events emitidos:
  score:updated             # Placar atualizado
  timer:started             # Timer iniciado
  timer:paused              # Timer pausado
  timer:reset               # Timer resetado
  export:ready              # Exportação concluida
```

---

## Seguranca

| Pilar | Implementação |
|-------|-------------|
| **Multi-tenancy** | PostgreSQL RLS + middleware tenant |
| **Autenticação** | JWT em HttpOnly cookies (15min access + 7d refresh) |
| **Autorização** | RBAC (Admin, Tenant Owner, Tenant Member, Public) |
| **Licenciamento** | Middleware valida licença ativa em toda rota protegida |
| **Rate Limiting** | 100 req/min normal, 10 req/min login |
| **Passwords** | bcrypt com cost factor 12 |
| **2FA** | Obrigatório para painel superadmin |
| **CORS** | Apenas dominio frontend permitido |
| **CSP** | Helmet.js com Content Security Policy |
| **SQL Injection** | Prisma ORM (prepared statements) |
| **XSS** | React (escape automático) + CSP headers |
| **Audit** | Toda ação crítica logada em audit_logs |
| **LGPD** | Soft delete com retencao 30 dias + exclusão automática |
| **Webhooks** | Verificacao de assinatura Stripe em todo webhook |
| **Secrets** | Variáveis de ambiente, NUNCA no codigo |

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

# 4. Configurar variáveis de ambiente
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
npm run test:integration # Testes de integração (Supertest)
npm run test:e2e         # Testes E2E (Playwright)
npm run test:coverage    # Relatório de cobertura

# Docker
docker-compose up -d     # Subir PostgreSQL + Redis
docker-compose down      # Parar containers
```

---

## Deploy

**Alvo único:** Azure App Service, sempre via GitHub Actions.

- **App Service Plan:** `plan-tcc`
- **Resource Group:** `rg-webapps`
- **Apps:** `sportflow-api` (backend) e `sportflow-web` (frontend)
- **SCM Basic Auth Publishing:** `true`
- **Basic Authentication:** `true`

**PROIBIDO:** deploy manual, zip deploy, `az webapp deploy --src-path`, upload via Kudu, publicacao FTP.

### CI/CD (GitHub Actions)

Push para `main` dispara deploy automático via `azure/webapps-deploy@v3`:
- `apps/api/**` alterado → deploy backend (`sportflow-api`)
- `apps/web/**` alterado → deploy frontend (`sportflow-web`)
- `workflow_dispatch` para deploy manual autorizado

Publish profile no GitHub Secrets:
- `AZURE_WEBAPP_PUBLISH_PROFILE_API`
- `AZURE_WEBAPP_PUBLISH_PROFILE_WEB`

---

## Ordem de Construcao Recomendada

Para o MVP mais rápido com features funcionais:

1. **Auth + Tenant + License** — fundacao, nada funciona sem isso
2. **Championship Service** — criar campeonatos, categorias esportivas
3. **Scoreboard com real-time** — feature mais visivel (Socket.io)
4. **Financial Service** — rastreamento de receitas/despesas
5. **Export Service** — geração de PDF/CSV (async com Bull)
6. **Placar público** — link ao vivo para espectadores (SSR)
7. **Integração Stripe** — habilitar pagamentos
8. **Observabilidade** — monitoramento, alertas, logging
9. **Hardening** — patches de seguranca, tuning de performance

---

## Esteira de Agentes FlowCore

Fonte da verdade: `~/dev/AGENTES_ARQUITETURA/ARQUITETO-SKILLS/`
Padrão obrigatório de entrega: `00-padrões/ENTREGA_PREMIUM_FLOWCORE.md`

```
DESCOBERTA        01-prd-analyst → 02-analista-de-tela
ARQUITETURA       02-b (infra) + 02-c (SEGURANCA) + 03 + 04 + 05  [paralelo]
VALIDAÇÃO         06-dev-mockado  [GATE cliente]
DADOS+PLANO       07-arquiteto-sql-plus-mongodb + 08-p-o-product-owner
DESENVOLVIMENTO   09-dev-frontend + 10-dev-backend + 15-guardiao (recorrente)
QA (sequencial)   11-qa-unitario → 12-qa-integração → 13-qa-tela → 14-playwright-e2e
EVOLUÇÃO          16-arquiteto-eventos  (só com sistema 100% aprovado)
DEPLOY            17-deploy-cicd  (Azure App Service via GitHub Actions)
MOBILE            18/19  — NÃO se aplica (SportFlow e web-only)
OPCIONAIS         opc-a-ui-ux, opc-b-mensageria, opc-c-dados-bi
```

Regras herdadas:
- Deploy SEMPRE via GitHub Actions (NUNCA zip deploy)
- Nenhum agente versiona segredo, token, `.env`, credencial ou certificado
- Handoff registra entrada, saida, decisões, pendencias e próximo agente
- Seguranca e continua (02-c em arquitetura + 15 em dev/QA), não uma fase final

---

## Licença

Proprietario — FlowCore. Todos os direitos reservados.

---

**FlowCore** — Engenharia de Software com Inteligência Artificial
