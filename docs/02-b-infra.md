# Diagnostico de Infra — SportFlow

**Agente responsável:** 02-b-diagnostico-infra
**Status:** NÃO BLOQUEIA. Relatório preventivo.
**Data:** 2026-07-05

---

## 1. Verdicto no MVP

**Monolito modular vence.** SportFlow no MVP e um monolito Node.js/Express + Next.js com Redis para pub/sub e Bull queue.
Não há justificativa de negocio para microservicos, event bus dedicado (Kafka/RabbitMQ) ou Kubernetes agora.

Regra herdada da esteira: "Sistema nasce monolito, evolui para eventos — nunca o contrario". Aplicada.

---

## 2. Uso de mensageria/assincronismo NO MVP (necessario)

| Recurso | Uso | Ferramenta MVP | Motivo |
|---------|-----|----------------|--------|
| **Pub/Sub em memória compartilhada** | Broadcast de score/timer para instancias Socket.io | Redis Pub/Sub (via ioredis) | Socket.io scale horizontal exige adapter; Redis já esta na stack |
| **Fila de trabalho pesado** | Exportações PDF/CSV assincronas | Bull/BullMQ sobre Redis | Já documentado no CLAUDE.md; não precisa broker separado |
| **Job recorrente** | License worker (marca expiradas de hora em hora) | Bull repeatable job | Reaproveita infra |
| **Webhook receiver** | Stripe checkout.session.completed | Endpoint HTTP com verificacao de assinatura | Simples, sem broker |

Tudo isso RODA DENTRO do monolito ou como worker separado do MESMO codigo (compartilha modelos e config).

---

## 3. Alerta preventivo — Onde a dor VAI aparecer

Não e problema hoje. Anote para revisao quando triggers baterem.

### Trigger 1 — > 500 espectadores simultaneos em 1 match
- **Sintoma:** 1 instancia Socket.io comeca a apresentar lag.
- **Ação:** Adicionar 2a instancia + Redis adapter já configurado (funciona automático).
- **Custo:** trocar App Service Plan para tier B2 → S1 (autoscale).

### Trigger 2 — > 100 exportações/dia
- **Sintoma:** Puppeteer engarrafa; RAM sobe.
- **Ação:** Isolar worker de export em App Service separado. Codigo já e worker isolado.
- **Custo:** +1 App Service básico.

### Trigger 3 — > 50 tenants ativos
- **Sintoma:** relatórios cross-tenant do superadmin ficam lentos.
- **Ação:** Adicionar replica read-only do Postgres + rotear queries de leitura.
- **Custo:** +1 database Azure.

### Trigger 4 — Necessidade de notificar multiplos consumers do mesmo evento
- **Sintoma:** BI + email + WhatsApp querem saber quando "campeonato finalizado".
- **Ação:** Introduzir agente 16 (arquiteto-eventos) — event bus dedicado (Azure Service Bus ou Kafka).
- **Custo:** re-arquitetura moderada.

---

## 4. Microservicos? Não.

Quando faz sentido evoluir para microservicos:
- Times separados donos de dominios diferentes
- Escala independente crítica (ex: export = 100x mais recursos que auth)
- Poliglota (ex: modulo ML em Python separado)

**Hoje SportFlow tem 1 time. Não há essas dores. Não adicionar complexidade.**

---

## 5. Redis — configuração MVP

- Instancia Azure Cache for Redis (Basic C0 no lancamento)
- Databases logicos:
  - `db 0` → cache de sessão / rate limit
  - `db 1` → Bull queue
  - `db 2` → Socket.io pub/sub adapter
- Password + TLS obrigatórios
- Backup diário

---

## 6. Bull queue — filas planejadas

| Fila | Producer | Consumer | Prioridade |
|------|----------|----------|------------|
| `export-jobs` | ExportService (API) | ExportWorker | media |
| `email-jobs` | Multiplos services | EmailWorker | alta (baixa em batch) |
| `license-check` | Bull repeatable (hora em hora) | LicenseWorker | crítica |
| `audit-flush` (opcional) | AuditMiddleware | AuditWorker | baixa |

Todos com retry exponencial (3 tentativas), dead-letter queue simples via campo `failedAt`.

---

## 7. Ambientes

| Ambiente | Ferramenta | Uso |
|----------|-----------|-----|
| Local | docker-compose | Postgres 15 + Redis 7 |
| CI (GitHub Actions) | services do workflow | Postgres 15 + Redis 7 |
| Staging | Azure App Service slot `staging` | mesmo plano de PROD |
| Prod | Azure App Service slot `production` | `plan-tcc` / `rg-webapps` |

---

## 8. Observabilidade minima (MVP)

- Pino JSON structured logs → captura no Azure Log Analytics
- Prometheus scrape em `/metrics` (backend Node) via sidecar futuro; MVP pode expor endpoint e coletar manualmente
- Sentry em backend e frontend com PII scrubbing
- Health check `/api/health` acionado pelo Azure App Service

---

## 9. Custos estimados iniciais (mensal, USD)

| Item | Tier | Custo |
|------|------|-------|
| App Service Plan `plan-tcc` (B1 ou B2) | Basic B2 (ambos apps) | ~55 |
| Azure Database for PostgreSQL Flexible Server | B1ms | ~30 |
| Azure Cache for Redis | Basic C0 | ~17 |
| Azure Blob Storage | LRS Hot | ~5 (baixo volume) |
| App Insights / Log Analytics | Free tier | 0 |
| Sentry Free | Free | 0 |
| **Total estimado** | | **~107 USD/mes** |

---

## 10. Handoff

Não bloqueia. Arquitetura backend/frontend/designer podem seguir em paralelo. Este relatório deve ser reavaliado quando:
- MRR > R$5k/mes (justifica investir em resiliencia)
- >100 tenants ativos
- Timeout medio > 500ms em qualquer endpoint core
