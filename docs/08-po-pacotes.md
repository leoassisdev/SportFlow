# Product Owner — Pacotes de Desenvolvimento

**Agente responsavel:** 08-p-o-product-owner
**Base:** docs/01-prd + 02-telas + 03-backend + 04-frontend + 05-design
**Metodo:** cada pacote e uma historia de usuario com criterios de aceite verificaveis por QA.

---

## Convencao

- Cada historia tem ID `SF-XXX`
- Cada pacote agrupa historias relacionadas de uma fase
- Criterios de aceite sao verificaveis por testes (unitario, integracao ou E2E)
- Toda historia sai com owner: Dev Backend (BE), Dev Frontend (FE), ambos (FS)

Priorizacao (MoSCoW):
- **M** must — MVP nao sai sem
- **S** should — desejavel no MVP
- **C** could — nice-to-have no MVP
- **W** wont — fica para pos-MVP

---

## PACOTE 1 — Auth e Multi-tenancy (Fase 1) — M

### SF-001 · Register cria User + Tenant preview
- Como lead, ao preencher o formulario, quero ter minha conta criada e ser levado ao painel.
- Criterios:
  - POST `/api/v1/auth/register` cria Tenant status `preview` + User role `owner`
  - Retorna cookies HttpOnly `access_token` (15m) e `refresh_token` (7d)
  - Retorna JSON `{ user: UserDTO }`
  - Duplicidade de email → 409 CONFLICT
- Owner: FS

### SF-002 · Login autentica e retorna sessao
- Criterios:
  - Credenciais corretas → 200 + cookies + user
  - Credenciais erradas → 401 UNAUTHORIZED
  - Rate limit 10 req/min ativado
- Owner: FS

### SF-003 · Refresh renova access token
- Criterios:
  - POST `/api/v1/auth/refresh` com refresh valido → renova access
  - Refresh invalido/expirado → 401
- Owner: BE

### SF-004 · Logout limpa cookies
- Owner: BE

### SF-005 · Middleware chain funcional
- Ordem: auth → tenant → rateLimit → license → audit
- RLS PostgreSQL SET LOCAL executa a cada request
- Owner: BE

### SF-006 · Teste de isolamento de tenant passando
- E2E: Tenant A cria dado. Tenant B logado nao ve. Nunca. Ponto.
- Owner: BE + QA

---

## PACOTE 2 — Campeonatos (Fase 2) — M

### SF-010 · CRUD Campeonatos
- Criar (nome, esporte, datas, config) → status `draft`
- Listar com paginacao + busca por nome
- Detalhe
- Editar
- Arquivar (soft delete)
- Sport type imutavel apos create
- Owner: FS

### SF-011 · Sport presets carregados
- GET `/api/v1/sports` retorna 4 esportes (futebol, volei, tenis, skate) com configs padrao
- Endpoint publico
- Owner: BE

### SF-012 · CRUD Participantes
- Criar/listar/editar/excluir participantes vinculados a campeonato
- Categorias (opcional)
- Preview mode: max 3 participantes por campeonato → 403 PREVIEW_LIMITED apos 3
- Owner: FS

### SF-013 · Wizard visual de criacao
- Steps: esporte → info → config → categorias → revisao
- Backgrounds tematicos por esporte (imagens/{esporte}/background-01.png)
- Owner: FE

---

## PACOTE 3 — Placar Real-time (Fase 3) — M

### SF-020 · Socket.io + Redis adapter
- Rooms `match:admin:{id}` (auth) e `match:public:{token}` (read-only)
- Reconexao automatica
- Owner: BE

### SF-021 · Update de placar
- PATCH `/api/v1/matches/:id/score` grava ScoreEntry + publica evento
- Broadcast em < 100ms para ambas rooms
- Owner: FS

### SF-022 · Timer server-authoritative
- Start/pause/reset gravam timestamp + broadcast
- Client sincroniza baseado no serverTime + interpola
- Owner: FS

### SF-023 · Undo do ultimo lancamento
- Nova entrada com delta invertido
- Owner: BE

### SF-024 · Painel de placar admin
- UI grande, mobile-first (arbitro no celular)
- Botoes +/- com feedback otimista
- Owner: FE

---

## PACOTE 4 — Financeiro (Fase 4) — M

### SF-030 · CRUD transacoes financeiras
- Vinculado a campeonato
- Preview mode → 403 PREVIEW_LIMITED em toda rota financial/*
- Owner: FS

### SF-031 · Resumo financeiro
- KPIs (receita, despesa, saldo, patrocinadores)
- Filtros e paginacao
- Owner: FS

---

## PACOTE 5 — Exportacao PDF/CSV (Fase 5) — M

### SF-040 · Job de exportacao enfileirado
- POST /api/v1/championships/:id/export → 202 + jobId
- Bull queue processa em background
- Preview mode → 403 PREVIEW_LIMITED
- Owner: BE

### SF-041 · Worker PDF (Puppeteer) e CSV (fast-csv)
- Owner: BE

### SF-042 · Upload Azure Blob + signed URL
- Signed URL expira 24h
- Owner: BE

### SF-043 · Notificacao Socket.io + email
- Frontend recebe `export:ready` e atualiza tabela
- Owner: FS

---

## PACOTE 6 — Licenciamento + Stripe (Fase 6) — M

### SF-050 · SuperAdmin cria licenca
- POST `/superadmin/licenses` { tenantId, days, priceBrl } → gera Stripe Checkout Session
- Owner: BE

### SF-051 · Envio de email com link
- Owner: BE

### SF-052 · Webhook Stripe ativa licenca
- Verifica assinatura HMAC
- checkout.session.completed → license.status=active, tenant.status=active
- Idempotente (2 recebimentos do mesmo evento nao ativam 2x)
- Owner: BE

### SF-053 · License Worker expira licencas
- Bull repeatable hora em hora
- Marca license.status=expired, tenant.status=expired
- Owner: BE

### SF-054 · Middleware license bloqueia tenant expirado
- Owner: BE

---

## PACOTE 7 — SuperAdmin (Fase 7) — M

### SF-060 · Dashboard metricas
- MRR, tenants ativos, leads no mes, campeonatos criados
- Owner: FS

### SF-061 · CRUD tenants (visualizar, pausar, override com log)
- Owner: FS

### SF-062 · CRUD licencas
- Owner: FS

### SF-063 · Visualizar leads
- Botao "Contactar" (WhatsApp Web pre-preenchido)
- Owner: FE

### SF-064 · Audit logs busca
- Owner: FS

### SF-065 · 2FA obrigatorio SuperAdmin — S
- Owner: BE

---

## PACOTE 8 — Placar Publico SSR (Fase 8) — M

### SF-070 · Rota `/live/{token}` SSR
- GET `/api/v1/live/:token` publico
- Meta tags OpenGraph com placar atual
- Sem cookies, sem tracking
- Owner: FS

### SF-071 · Socket.io read-only para publico
- Marca d'agua se tenant preview
- Owner: FS

---

## PACOTE 9 — Testes (Fase 9) — M

### SF-080 · Unit (Vitest) — cobertura > 80% em services e schemas
### SF-081 · Integration (Supertest) — todos os endpoints principais + isolamento de tenant
### SF-082 · E2E (Playwright) — fluxos criticos F1 a F5 do docs/02
### SF-083 · CI roda tudo em cada push
- Owner: QA

---

## PACOTE 10 — Observabilidade (Fase 10) — S

### SF-090 · Pino structured logs
### SF-091 · Prometheus /metrics
### SF-092 · Sentry backend + frontend
### SF-093 · Health check /api/health

---

## PACOTE 11 — Deploy (Fase 11) — M

### SF-100 · Dockerfiles otimizados
### SF-101 · GitHub Actions CI verde
### SF-102 · GitHub Actions Deploy Backend Azure
### SF-103 · GitHub Actions Deploy Frontend Azure
### SF-104 · Slot staging + slot swap para prod
### SF-105 · Prisma migrate deploy no CI
### SF-106 · Rollback documentado

---

## PACOTE 12 — Continuous Security (Fase 12) — M

### SF-110 · Scan gitleaks no CI
### SF-111 · npm audit falha em critical
### SF-112 · Rate limit + RLS validados em cada release
### SF-113 · Politica LGPD + hard delete apos 30d

---

## PACOTE OPCIONAL — Evolucao (pos-MVP)

- SF-200 · Chaveamento automatico por sport
- SF-201 · WhatsApp API (opc-b) para avisos de expiracao
- SF-202 · Publico paga inscricao via Stripe Split
- SF-203 · BI SuperAdmin (opc-c)
- SF-204 · EDA (16-arquiteto-eventos) quando MRR > R$5k/mes

---

## Ordem de execucao recomendada

Fase 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12

Cada fase e um marco de release interno. Antes de avancar:
- QA aprova (11-12-13-14 tudo verde)
- 15-guardiao de arquitetura audita
- 02-c-SEGURANCA da verde no scan
- Cliente valida no ambiente de staging

---

## Handoff

- Para **09-dev-frontend + 10-dev-backend:** este backlog e o input direto
- Para **11-12-13-14 QA:** criterios de aceite viram testes
- Para **15-guardiao:** valida se cada pacote respeita middleware chain, RLS e camadas
- Para **17-deploy:** pacote 11 pronto pra rodar quando o resto verde
