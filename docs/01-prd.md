# PRD — SportFlow

**Agente responsável:** 01-prd-analyst
**Versão:** 1.0
**Data:** 2026-07-05
**Status:** Aprovado como fonte da verdade para a esteira

---

## 1. Visao Geral

**Problema:** Organizadores de campeonatos esportivos amadores e semi-profissionais (ligas de bairro, escolas, academias, clubes, eventos de skate/tênis) hoje operam com planilhas, grupos de WhatsApp e papel. Perdem histórico, não tem controle financeiro claro, sofrem para divulgar placar ao vivo e não conseguem escalar para mais de um campeonato simultaneo.

**Solução:** SportFlow e uma plataforma SaaS multi-tenant onde o organizador (Contratante) cria campeonatos, cadastra participantes, controla placar em tempo real com timer sincronizado, registra receitas/despesas/patrocinios e exporta relatórios em PDF/CSV. Espectadores acompanham o placar via link público sem cadastro.

**Usuarios-alvo:**
- Organizadores de campeonatos amadores (ligas de bairro, escolas)
- Coordenadores de eventos esportivos (skate, tênis, futebol society)
- Academias e clubes com torneios internos
- Federacoes estaduais amadoras

**Multitenante:** Sim. Cada Contratante e um tenant isolado por Row-Level Security no PostgreSQL. Não há cross-tenant leakage por design.

**Esportes suportados no MVP:** Futebol, Vôlei, Tênis, Skate.

---

## 2. Perfis de Usuario (ACL)

| Perfil | Descrição | Permissões Principais |
|--------|-----------|-----------------------|
| **SuperAdmin (Admin FlowCore)** | Time interno FlowCore que gerencia a plataforma | CRUD tenants, criar/renovar licenças, ver leads, ver métricas globais, auditar logs, override de tenant (com log) |
| **Owner (Contratante)** | Cliente pagante que criou o tenant | CRUD campeonatos/participantes/matches/scores/financeiro, gerar exportações, gerenciar membros do tenant, ver painel financeiro |
| **Member (Membro do tenant)** | Colaborador convidado pelo Owner (mesa/arbitragem/financeiro) | Atualizar placar/timer, criar transações financeiras (se autorizado), visualizar tudo do tenant. Não gerencia licença nem membros. |
| **Espectador (Público)** | Qualquer pessoa com o link `/live/{token}` | Ver placar ao vivo (SSR + Socket.io read-only). Não ve financeiro, não ve outros jogos, não interage. |

---

## 3. Modulos do Sistema

### Modulo Autenticação
- **Descrição:** Registro de lead, login, refresh de sessão, logout, recuperacao de senha.
- **Perfis com acesso:** Todos (exceto Espectador).
- **Funcionalidades:**
  - Register cria user + tenant em modo `preview`
  - Login retorna JWT em cookies HttpOnly (access 15min + refresh 7d)
  - Refresh automático transparente
  - Rate limit 10 req/min em login
  - Registro obrigatório: email, senha, nome, WhatsApp, esporte principal

### Modulo Multi-tenancy e Licença
- **Descrição:** Isolamento por tenant + gestão de licenças pagas.
- **Perfis com acesso:** SuperAdmin (gestão) + middleware transparente (todos).
- **Funcionalidades:**
  - Tenant em modo `preview`: max 3 participantes, sem exportação, sem financeiro, marca d'agua no placar público
  - Tenant `active` com licença vigente: acesso completo
  - Tenant `expired`: acesso bloqueado (403), dados preservados 30 dias (LGPD)
  - Exclusão automática após 30 dias
  - Renovação reativa o tenant

### Modulo Campeonatos
- **Descrição:** CRUD de campeonatos com configuração por esporte.
- **Perfis com acesso:** Owner, Member.
- **Funcionalidades:**
  - Criar campeonato: nome, esporte, datas, config (JSONB)
  - Sport presets (configuração automática): futebol, vôlei, tênis, skate
  - Gerenciar participantes (individual ou time)
  - Status: `draft` → `active` → `finished` / `cancelled`
  - Categorias (masculino/feminino/idade/peso etc via `metadata` JSONB)
  - Soft delete + auditoria

### Modulo Placar Real-time
- **Descrição:** Atualização de placar e timer com latencia < 100ms.
- **Perfis com acesso:** Owner, Member (escrita) + Espectador (leitura).
- **Funcionalidades:**
  - PATCH /matches/:id/score → persiste + pública via Redis Pub/Sub
  - Timer start/pause/reset sincronizado
  - Histórico de score_entries (nunca perde ponto já marcado)
  - Rooms Socket.io: `match:admin:{id}` (auth) e `match:public:{token}` (read-only)
  - Reconexao automática no frontend
  - Undo (último lancamento)

### Modulo Financeiro
- **Descrição:** Rastreamento de receitas e despesas por campeonato.
- **Perfis com acesso:** Owner + Member (se autorizado).
- **Funcionalidades:**
  - CRUD de transações (income / expense) por campeonato
  - Categorias: inscrição, patrocinio, aluguel, arbitragem, premiacao, etc
  - Resumo: total receita, total despesa, saldo, gráfico
  - Filtros por tipo, categoria, data
  - Registro de patrocinadores (nome + valor)
  - **BLOQUEADO em modo preview**

### Modulo Exportação PDF/CSV
- **Descrição:** Geração assincrona de relatórios via Bull queue.
- **Perfis com acesso:** Owner.
- **Funcionalidades:**
  - Escolher modulos a exportar: resultados, financeiro, participantes
  - Formato PDF (Puppeteer) ou CSV (fast-csv)
  - Job enfileirado no Bull → processamento em background
  - Upload para Azure Blob Storage
  - Signed URL com expiracao de 24h
  - Notificação via Socket.io + email
  - **BLOQUEADO em modo preview**

### Modulo Placar Público
- **Descrição:** Pagina SSR de placar ao vivo, sem autenticação.
- **Perfis com acesso:** Espectador (público).
- **Funcionalidades:**
  - URL `/live/{live_token}` (token único por match)
  - Renderiza HTML no servidor (Next.js Server Component)
  - Após hydration, Socket.io conecta ao room público
  - Recebe score:updated, timer:*, sem escrita
  - Meta tags OpenGraph (nome do campeonato/jogo)
  - Não expoe financeiro, outros jogos, ou painel admin
  - Marca d'agua "modo preview" se tenant não pagou

### Modulo Pagamento (Stripe)
- **Descrição:** Cobranca de licenças via Stripe Checkout.
- **Perfis com acesso:** SuperAdmin (cria licença) + Lead (paga).
- **Funcionalidades:**
  - SuperAdmin cria licença: `{ tenantId, days, priceBrl }`
  - Sistema gera Stripe Checkout Session
  - Link enviado por email para o lead
  - Webhook `checkout.session.completed` ativa licença automaticamente
  - License Worker (horario) expira licenças vencidas
  - Histórico de pagamentos preservado

### Modulo SuperAdmin
- **Descrição:** Painel FlowCore-only para gestão da plataforma.
- **Perfis com acesso:** SuperAdmin.
- **Funcionalidades:**
  - Listar/detalhar/pausar tenants
  - Criar/gerenciar licenças
  - Ver leads recentes (que se cadastraram e ainda não pagaram)
  - Dashboard de métricas: MRR, tenants ativos, novos leads/mes, campeonatos criados
  - Buscar audit_logs
  - 2FA obrigatório + (opcional) IP whitelist

---

## 4. Regras de Negocio

| ID | Regra | Modulo |
|----|-------|--------|
| RN-001 | Tenant sem licença ativa recebe 403 em rotas protegidas | Licença |
| RN-002 | Tenant `preview` limitado a 3 participantes por campeonato | Campeonatos |
| RN-003 | Tenant `preview` bloqueado de gerar exportação | Exportação |
| RN-004 | Tenant `preview` bloqueado de acessar modulo financeiro | Financeiro |
| RN-005 | Placar público exibe marca d'agua se tenant em `preview` | Placar Público |
| RN-006 | Dados de tenant expirado preservados 30 dias (LGPD) e excluidos automaticamente | Licença |
| RN-007 | Cross-tenant leakage e proibido — RLS + middleware `tenant.middleware.ts` obrigatórios | Multi-tenancy |
| RN-008 | Stripe webhook e a ÚNICA fonte de verdade para ativar licença (nunca confiar em frontend) | Pagamento |
| RN-009 | Score entries são imutaveis (apenas insercao) — undo cria nova entrada com sinal invertido | Placar |
| RN-010 | Timer sincronizado via server-authoritative timestamp, não clock local | Placar |
| RN-011 | Live token de match e único, gerado no create, imutavel | Placar Público |
| RN-012 | Rate limit: 100 req/min normal, 10 req/min em `/auth/login` e `/auth/register` | API |
| RN-013 | Toda ação de escrita gera audit_log (fire-and-forget, não bloqueia resposta) | Todos |
| RN-014 | Sport preset define scoreType, gameplay e limites — não pode ser mudado após criar campeonato | Campeonatos |
| RN-015 | SuperAdmin override de tenant registra `superadmin_access` no audit_log com IP + motivo | SuperAdmin |

---

## 5. Integrações Externas

| Sistema | Tipo | Finalidade |
|---------|------|-----------|
| **Stripe** | API REST + Webhook | Cobranca de licenças, Checkout Session, confirmação de pagamento |
| **Azure Blob Storage** | SDK | Armazenamento de PDFs/CSVs gerados na exportação |
| **Redis** | Cache + Pub/Sub + Queue | Socket.io adapter, Bull queue, cache de sessão |
| **Sentry** | SDK | Error tracking (backend + frontend) |
| **Email (SMTP / Resend)** | SMTP/API | Notificações: link de pagamento, exportação pronta, expiracao próxima |
| **Azure App Service** | Deploy | Hospedagem via GitHub Actions (`plan-tcc` / `rg-webapps`) |

---

## 6. Requisitos Não Funcionais

- **Performance:**
  - Placar atualiza em < 100ms entre admin e espectador
  - API responde 95% das requisicoes em < 300ms
  - Placar público (SSR) carrega em < 1s (LCP)
  - Export de PDF conclui em < 30s para campeonato de até 32 participantes
- **Seguranca:**
  - JWT em HttpOnly cookies (nunca localStorage)
  - RLS PostgreSQL ativo em todas as tabelas com `tenant_id`
  - bcrypt cost factor 12
  - Rate limiting global + login específico
  - Helmet + CSP + CORS restrito
  - 2FA obrigatório no SuperAdmin
  - Scan de segredos no CI (regra 02-c-SEGURANCA)
- **Escalabilidade:**
  - Socket.io com Redis adapter (horizontal scaling)
  - Bull queue para jobs pesados (não bloqueia HTTP)
  - Prisma connection pool
  - Preparado para split de leitura/escrita no futuro
- **Observabilidade:**
  - Logs estruturados em JSON (Pino)
  - Métricas Prometheus expostas em `/metrics`
  - Sentry para erros não tratados
  - Health check em `/api/health`
- **LGPD:**
  - Soft delete (`deletedAt`) em toda entidade sensivel
  - Retencao de 30 dias após expiracao
  - Exclusão automática documentada
  - Audit log de todas as ações críticas
- **Acessibilidade:**
  - WCAG AA nas telas de dashboard e placar público
  - Contraste minimo 4.5:1
  - Navegacao por teclado
  - Screen reader-friendly no placar público (importante para transmissão)

---

## 7. MVP — Escopo do Primeiro Lancamento

- Autenticação (register/login/refresh/logout)
- Multi-tenancy com RLS
- Campeonatos + participantes (4 esportes: futebol, vôlei, tênis, skate)
- Placar real-time via Socket.io
- Placar público SSR
- Financeiro (receitas/despesas)
- Exportação PDF/CSV via Bull queue
- Licença via Stripe + webhook
- Painel SuperAdmin (tenants, licenças, leads, métricas)
- Deploy Azure App Service via GitHub Actions
- Cobertura de testes: unitario + integração + E2E dos fluxos críticos

---

## 8. Roadmap — Fora do MVP

- Chaveamento automático (bracket generation) por sport type
- Streaming de vídeo integrado ao placar público
- App mobile nativo (React Native / Flutter) — reativa agentes 18/19
- Notificações push (WhatsApp API, PWA)
- Público paga para "seguir campeonato" (tickets premium)
- BI para SuperAdmin (opc-c-engenheiro-de-dados-plus-bi)
- Evolução para EDA (agente 16) quando volume justificar
- Marketplace de árbitros/juizes
- Integração com federacoes estaduais
- Pagamento de inscrição direto do participante (Split Stripe)
- Multi-idioma (i18n)
- White label (subdominio do cliente)

---

## 9. Duvidas em Aberto

- **Público paga inscrição pelo sistema?** No MVP não. Assumido: Contratante recebe fora e registra manualmente como receita. Confirmar com Leo.
- **Financeiro precisa integrar com sistema contabil do Contratante?** Assumido: não no MVP, apenas exportação CSV/PDF.
- **Idioma:** MVP apenas pt-BR. Confirmar se algum cliente-alvo demandaria en-US ou es-BR.
- **Nomes de dominio:** producao vai rodar em qual URL? Sugestao: `app.sportflow.com.br` (dashboard) + `live.sportflow.com.br/{token}` (público). Confirmar com Leo.
- **Precificacao:** MVP tem plano fixo de R$500 / 3 dias como no fluxo do CLAUDE.md, ou lista de planos (7d/30d/anual)? Confirmar.
- **Envio de email:** Resend, SendGrid, SMTP próprio? Impacta 02-b (mensageria).
- **Notificação WhatsApp:** entra no MVP para avisar organizador de pagamento/expiracao? Ou fica para v1.1?

---

## Objetivo de Conversao (Padrão Premium)

**Ação principal do lead:** completar cadastro no formulario público + pagar primeira licença via Stripe Checkout.

**Proposta de valor (1 frase):** "Organize campeonatos esportivos com placar ao vivo, financeiro no controle e relatórios prontos — sem planilha, sem grupo perdido de WhatsApp."

**Público e objecoes principais:**
- "Já uso planilha, funciona" → SportFlow mostra em 1 minuto que são 3 cliques para o mesmo resultado, com bonus de placar ao vivo público.
- "Custa caro?" → Plano de teste de 3 dias por preço simbolico permite provar o valor.
- "E complicado configurar?" → Sport presets prontos (futebol, vôlei, tênis, skate) — cria campeonato em 30 segundos.

**Mapa de funil (site institucional, fora do escopo técnico do app):**
1. Instagram/Google → landing SportFlow
2. Landing → CTA "Comecar teste gratis"
3. Cadastro (tenant preview) → dashboard limitado
4. Contatoo SuperAdmin ativa licença → email com link Stripe
5. Pagamento → tenant ativo, plano completo desbloqueado
6. Renovação automática (v1.1) ou manual (MVP)

---

## Handoff para Agente 02 (Analista de Tela)

**Entradas para o próximo agente:**
- Todos os modulos listados na secao 3
- Perfis da secao 2 (SuperAdmin, Owner, Member, Espectador)
- Regras de negocio como restricoes de UI (RN-002/003/004 exigem estado disabled + tooltip)
- Fluxos críticos: register→pay→create championship→scoreboard→export
- Estilo visual: ver imagens em `imagens/geral/` e `imagens/{esporte}/` + logo em `logo.png`

**Pendencias que Analista de Tela deve resolver:**
- Definir estados de erro/vazio/loading por tela
- Definir modais e confirmações
- Definir componentes que precisam ser reutilizados
- Marcar o que precisa ser responsivo mobile-first (ATENÇÃO: placar público e crítico em mobile)
