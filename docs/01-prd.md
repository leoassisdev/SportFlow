# PRD — SportFlow

**Agente responsavel:** 01-prd-analyst
**Versao:** 1.0
**Data:** 2026-07-05
**Status:** Aprovado como fonte da verdade para a esteira

---

## 1. Visao Geral

**Problema:** Organizadores de campeonatos esportivos amadores e semi-profissionais (ligas de bairro, escolas, academias, clubes, eventos de skate/tenis) hoje operam com planilhas, grupos de WhatsApp e papel. Perdem historico, nao tem controle financeiro claro, sofrem para divulgar placar ao vivo e nao conseguem escalar para mais de um campeonato simultaneo.

**Solucao:** SportFlow e uma plataforma SaaS multi-tenant onde o organizador (Contratante) cria campeonatos, cadastra participantes, controla placar em tempo real com timer sincronizado, registra receitas/despesas/patrocinios e exporta relatorios em PDF/CSV. Espectadores acompanham o placar via link publico sem cadastro.

**Usuarios-alvo:**
- Organizadores de campeonatos amadores (ligas de bairro, escolas)
- Coordenadores de eventos esportivos (skate, tenis, futebol society)
- Academias e clubes com torneios internos
- Federacoes estaduais amadoras

**Multitenante:** Sim. Cada Contratante e um tenant isolado por Row-Level Security no PostgreSQL. Nao ha cross-tenant leakage por design.

**Esportes suportados no MVP:** Futebol, Volei, Tenis, Skate.

---

## 2. Perfis de Usuario (ACL)

| Perfil | Descricao | Permissoes Principais |
|--------|-----------|-----------------------|
| **SuperAdmin (Admin FlowCore)** | Time interno FlowCore que gerencia a plataforma | CRUD tenants, criar/renovar licencas, ver leads, ver metricas globais, auditar logs, override de tenant (com log) |
| **Owner (Contratante)** | Cliente pagante que criou o tenant | CRUD campeonatos/participantes/matches/scores/financeiro, gerar exportacoes, gerenciar membros do tenant, ver painel financeiro |
| **Member (Membro do tenant)** | Colaborador convidado pelo Owner (mesa/arbitragem/financeiro) | Atualizar placar/timer, criar transacoes financeiras (se autorizado), visualizar tudo do tenant. Nao gerencia licenca nem membros. |
| **Espectador (Publico)** | Qualquer pessoa com o link `/live/{token}` | Ver placar ao vivo (SSR + Socket.io read-only). Nao ve financeiro, nao ve outros jogos, nao interage. |

---

## 3. Modulos do Sistema

### Modulo Autenticacao
- **Descricao:** Registro de lead, login, refresh de sessao, logout, recuperacao de senha.
- **Perfis com acesso:** Todos (exceto Espectador).
- **Funcionalidades:**
  - Register cria user + tenant em modo `preview`
  - Login retorna JWT em cookies HttpOnly (access 15min + refresh 7d)
  - Refresh automatico transparente
  - Rate limit 10 req/min em login
  - Registro obrigatorio: email, senha, nome, WhatsApp, esporte principal

### Modulo Multi-tenancy e Licenca
- **Descricao:** Isolamento por tenant + gestao de licencas pagas.
- **Perfis com acesso:** SuperAdmin (gestao) + middleware transparente (todos).
- **Funcionalidades:**
  - Tenant em modo `preview`: max 3 participantes, sem exportacao, sem financeiro, marca d'agua no placar publico
  - Tenant `active` com licenca vigente: acesso completo
  - Tenant `expired`: acesso bloqueado (403), dados preservados 30 dias (LGPD)
  - Exclusao automatica apos 30 dias
  - Renovacao reativa o tenant

### Modulo Campeonatos
- **Descricao:** CRUD de campeonatos com configuracao por esporte.
- **Perfis com acesso:** Owner, Member.
- **Funcionalidades:**
  - Criar campeonato: nome, esporte, datas, config (JSONB)
  - Sport presets (configuracao automatica): futebol, volei, tenis, skate
  - Gerenciar participantes (individual ou time)
  - Status: `draft` → `active` → `finished` / `cancelled`
  - Categorias (masculino/feminino/idade/peso etc via `metadata` JSONB)
  - Soft delete + auditoria

### Modulo Placar Real-time
- **Descricao:** Atualizacao de placar e timer com latencia < 100ms.
- **Perfis com acesso:** Owner, Member (escrita) + Espectador (leitura).
- **Funcionalidades:**
  - PATCH /matches/:id/score → persiste + publica via Redis Pub/Sub
  - Timer start/pause/reset sincronizado
  - Historico de score_entries (nunca perde ponto ja marcado)
  - Rooms Socket.io: `match:admin:{id}` (auth) e `match:public:{token}` (read-only)
  - Reconexao automatica no frontend
  - Undo (ultimo lancamento)

### Modulo Financeiro
- **Descricao:** Rastreamento de receitas e despesas por campeonato.
- **Perfis com acesso:** Owner + Member (se autorizado).
- **Funcionalidades:**
  - CRUD de transacoes (income / expense) por campeonato
  - Categorias: inscricao, patrocinio, aluguel, arbitragem, premiacao, etc
  - Resumo: total receita, total despesa, saldo, grafico
  - Filtros por tipo, categoria, data
  - Registro de patrocinadores (nome + valor)
  - **BLOQUEADO em modo preview**

### Modulo Exportacao PDF/CSV
- **Descricao:** Geracao assincrona de relatorios via Bull queue.
- **Perfis com acesso:** Owner.
- **Funcionalidades:**
  - Escolher modulos a exportar: resultados, financeiro, participantes
  - Formato PDF (Puppeteer) ou CSV (fast-csv)
  - Job enfileirado no Bull → processamento em background
  - Upload para Azure Blob Storage
  - Signed URL com expiracao de 24h
  - Notificacao via Socket.io + email
  - **BLOQUEADO em modo preview**

### Modulo Placar Publico
- **Descricao:** Pagina SSR de placar ao vivo, sem autenticacao.
- **Perfis com acesso:** Espectador (publico).
- **Funcionalidades:**
  - URL `/live/{live_token}` (token unico por match)
  - Renderiza HTML no servidor (Next.js Server Component)
  - Apos hydration, Socket.io conecta ao room publico
  - Recebe score:updated, timer:*, sem escrita
  - Meta tags OpenGraph (nome do campeonato/jogo)
  - Nao expoe financeiro, outros jogos, ou painel admin
  - Marca d'agua "modo preview" se tenant nao pagou

### Modulo Pagamento (Stripe)
- **Descricao:** Cobranca de licencas via Stripe Checkout.
- **Perfis com acesso:** SuperAdmin (cria licenca) + Lead (paga).
- **Funcionalidades:**
  - SuperAdmin cria licenca: `{ tenantId, days, priceBrl }`
  - Sistema gera Stripe Checkout Session
  - Link enviado por email para o lead
  - Webhook `checkout.session.completed` ativa licenca automaticamente
  - License Worker (horario) expira licencas vencidas
  - Historico de pagamentos preservado

### Modulo SuperAdmin
- **Descricao:** Painel FlowCore-only para gestao da plataforma.
- **Perfis com acesso:** SuperAdmin.
- **Funcionalidades:**
  - Listar/detalhar/pausar tenants
  - Criar/gerenciar licencas
  - Ver leads recentes (que se cadastraram e ainda nao pagaram)
  - Dashboard de metricas: MRR, tenants ativos, novos leads/mes, campeonatos criados
  - Buscar audit_logs
  - 2FA obrigatorio + (opcional) IP whitelist

---

## 4. Regras de Negocio

| ID | Regra | Modulo |
|----|-------|--------|
| RN-001 | Tenant sem licenca ativa recebe 403 em rotas protegidas | Licenca |
| RN-002 | Tenant `preview` limitado a 3 participantes por campeonato | Campeonatos |
| RN-003 | Tenant `preview` bloqueado de gerar exportacao | Exportacao |
| RN-004 | Tenant `preview` bloqueado de acessar modulo financeiro | Financeiro |
| RN-005 | Placar publico exibe marca d'agua se tenant em `preview` | Placar Publico |
| RN-006 | Dados de tenant expirado preservados 30 dias (LGPD) e excluidos automaticamente | Licenca |
| RN-007 | Cross-tenant leakage e proibido — RLS + middleware `tenant.middleware.ts` obrigatorios | Multi-tenancy |
| RN-008 | Stripe webhook e a UNICA fonte de verdade para ativar licenca (nunca confiar em frontend) | Pagamento |
| RN-009 | Score entries sao imutaveis (apenas insercao) — undo cria nova entrada com sinal invertido | Placar |
| RN-010 | Timer sincronizado via server-authoritative timestamp, nao clock local | Placar |
| RN-011 | Live token de match e unico, gerado no create, imutavel | Placar Publico |
| RN-012 | Rate limit: 100 req/min normal, 10 req/min em `/auth/login` e `/auth/register` | API |
| RN-013 | Toda acao de escrita gera audit_log (fire-and-forget, nao bloqueia resposta) | Todos |
| RN-014 | Sport preset define scoreType, gameplay e limites — nao pode ser mudado apos criar campeonato | Campeonatos |
| RN-015 | SuperAdmin override de tenant registra `superadmin_access` no audit_log com IP + motivo | SuperAdmin |

---

## 5. Integracoes Externas

| Sistema | Tipo | Finalidade |
|---------|------|-----------|
| **Stripe** | API REST + Webhook | Cobranca de licencas, Checkout Session, confirmacao de pagamento |
| **Azure Blob Storage** | SDK | Armazenamento de PDFs/CSVs gerados na exportacao |
| **Redis** | Cache + Pub/Sub + Queue | Socket.io adapter, Bull queue, cache de sessao |
| **Sentry** | SDK | Error tracking (backend + frontend) |
| **Email (SMTP / Resend)** | SMTP/API | Notificacoes: link de pagamento, exportacao pronta, expiracao proxima |
| **Azure App Service** | Deploy | Hospedagem via GitHub Actions (`plan-tcc` / `rg-webapps`) |

---

## 6. Requisitos Nao Funcionais

- **Performance:**
  - Placar atualiza em < 100ms entre admin e espectador
  - API responde 95% das requisicoes em < 300ms
  - Placar publico (SSR) carrega em < 1s (LCP)
  - Export de PDF conclui em < 30s para campeonato de ate 32 participantes
- **Seguranca:**
  - JWT em HttpOnly cookies (nunca localStorage)
  - RLS PostgreSQL ativo em todas as tabelas com `tenant_id`
  - bcrypt cost factor 12
  - Rate limiting global + login especifico
  - Helmet + CSP + CORS restrito
  - 2FA obrigatorio no SuperAdmin
  - Scan de segredos no CI (regra 02-c-SEGURANCA)
- **Escalabilidade:**
  - Socket.io com Redis adapter (horizontal scaling)
  - Bull queue para jobs pesados (nao bloqueia HTTP)
  - Prisma connection pool
  - Preparado para split de leitura/escrita no futuro
- **Observabilidade:**
  - Logs estruturados em JSON (Pino)
  - Metricas Prometheus expostas em `/metrics`
  - Sentry para erros nao tratados
  - Health check em `/api/health`
- **LGPD:**
  - Soft delete (`deletedAt`) em toda entidade sensivel
  - Retencao de 30 dias apos expiracao
  - Exclusao automatica documentada
  - Audit log de todas as acoes criticas
- **Acessibilidade:**
  - WCAG AA nas telas de dashboard e placar publico
  - Contraste minimo 4.5:1
  - Navegacao por teclado
  - Screen reader-friendly no placar publico (importante para transmissao)

---

## 7. MVP — Escopo do Primeiro Lancamento

- Autenticacao (register/login/refresh/logout)
- Multi-tenancy com RLS
- Campeonatos + participantes (4 esportes: futebol, volei, tenis, skate)
- Placar real-time via Socket.io
- Placar publico SSR
- Financeiro (receitas/despesas)
- Exportacao PDF/CSV via Bull queue
- Licenca via Stripe + webhook
- Painel SuperAdmin (tenants, licencas, leads, metricas)
- Deploy Azure App Service via GitHub Actions
- Cobertura de testes: unitario + integracao + E2E dos fluxos criticos

---

## 8. Roadmap — Fora do MVP

- Chaveamento automatico (bracket generation) por sport type
- Streaming de video integrado ao placar publico
- App mobile nativo (React Native / Flutter) — reativa agentes 18/19
- Notificacoes push (WhatsApp API, PWA)
- Publico paga para "seguir campeonato" (tickets premium)
- BI para SuperAdmin (opc-c-engenheiro-de-dados-plus-bi)
- Evolucao para EDA (agente 16) quando volume justificar
- Marketplace de arbitros/juizes
- Integracao com federacoes estaduais
- Pagamento de inscricao direto do participante (Split Stripe)
- Multi-idioma (i18n)
- White label (subdominio do cliente)

---

## 9. Duvidas em Aberto

- **Publico paga inscricao pelo sistema?** No MVP nao. Assumido: Contratante recebe fora e registra manualmente como receita. Confirmar com Leo.
- **Financeiro precisa integrar com sistema contabil do Contratante?** Assumido: nao no MVP, apenas exportacao CSV/PDF.
- **Idioma:** MVP apenas pt-BR. Confirmar se algum cliente-alvo demandaria en-US ou es-BR.
- **Nomes de dominio:** producao vai rodar em qual URL? Sugestao: `app.sportflow.com.br` (dashboard) + `live.sportflow.com.br/{token}` (publico). Confirmar com Leo.
- **Precificacao:** MVP tem plano fixo de R$500 / 3 dias como no fluxo do CLAUDE.md, ou lista de planos (7d/30d/anual)? Confirmar.
- **Envio de email:** Resend, SendGrid, SMTP proprio? Impacta 02-b (mensageria).
- **Notificacao WhatsApp:** entra no MVP para avisar organizador de pagamento/expiracao? Ou fica para v1.1?

---

## Objetivo de Conversao (Padrao Premium)

**Acao principal do lead:** completar cadastro no formulario publico + pagar primeira licenca via Stripe Checkout.

**Proposta de valor (1 frase):** "Organize campeonatos esportivos com placar ao vivo, financeiro no controle e relatorios prontos — sem planilha, sem grupo perdido de WhatsApp."

**Publico e objecoes principais:**
- "Ja uso planilha, funciona" → SportFlow mostra em 1 minuto que sao 3 cliques para o mesmo resultado, com bonus de placar ao vivo publico.
- "Custa caro?" → Plano de teste de 3 dias por preco simbolico permite provar o valor.
- "E complicado configurar?" → Sport presets prontos (futebol, volei, tenis, skate) — cria campeonato em 30 segundos.

**Mapa de funil (site institucional, fora do escopo tecnico do app):**
1. Instagram/Google → landing SportFlow
2. Landing → CTA "Comecar teste gratis"
3. Cadastro (tenant preview) → dashboard limitado
4. Contatoo SuperAdmin ativa licenca → email com link Stripe
5. Pagamento → tenant ativo, plano completo desbloqueado
6. Renovacao automatica (v1.1) ou manual (MVP)

---

## Handoff para Agente 02 (Analista de Tela)

**Entradas para o proximo agente:**
- Todos os modulos listados na secao 3
- Perfis da secao 2 (SuperAdmin, Owner, Member, Espectador)
- Regras de negocio como restricoes de UI (RN-002/003/004 exigem estado disabled + tooltip)
- Fluxos criticos: register→pay→create championship→scoreboard→export
- Estilo visual: ver imagens em `imagens/geral/` e `imagens/{esporte}/` + logo em `logo.png`

**Pendencias que Analista de Tela deve resolver:**
- Definir estados de erro/vazio/loading por tela
- Definir modais e confirmacoes
- Definir componentes que precisam ser reutilizados
- Marcar o que precisa ser responsivo mobile-first (ATENCAO: placar publico e critico em mobile)
