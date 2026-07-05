# Mapa de Telas — SportFlow

**Agente responsável:** 02-analista-de-tela
**Base:** docs/01-prd.md + imagens em `imagens/geral/` e `imagens/{esporte}/`
**Referências visuais:** fundo dark de arena/quadra, azul neon + laranja como acentos, tipografia esportiva (ver `imagens/geral/hero-desktop.png` e `logo.png`).

---

## 1. Inventario de Telas

### Públicas (sem auth)
| Rota | Perfil | Objetivo |
|------|--------|----------|
| `/` | Público | Landing institucional (breve) + CTA "Comecar teste gratis" |
| `/login` | Público | Login de Owner/Member/SuperAdmin |
| `/register` | Público | Cadastro de lead → cria tenant preview |
| `/live/[token]` | Espectador | Placar público do match, SSR + Socket.io read-only |
| `/payment/success` | Público | Confirmação pos-Stripe |
| `/payment/cancel` | Público | Cancelamento pos-Stripe |
| `/404` / `/500` | Público | Erros amigaveis com tema esportivo |

### Dashboard (Owner + Member)
| Rota | Perfil | Objetivo |
|------|--------|----------|
| `/dashboard` | Owner/Member | Home: cards com campeonatos ativos, próximo jogo, saldo financeiro |
| `/championships` | Owner/Member | Lista de campeonatos |
| `/championships/new` | Owner | Criar campeonato + escolher esporte |
| `/championships/[id]` | Owner/Member | Detalhe do campeonato, tabs (visao geral, participantes, jogos, financeiro, exportações) |
| `/championships/[id]/participants` | Owner/Member | CRUD participantes |
| `/championships/[id]/matches` | Owner/Member | Lista de jogos (agendados/em andamento/finalizados) |
| `/championships/[id]/matches/[matchId]` | Owner/Member | Painel de controle do placar (com escrita) |
| `/championships/[id]/financial` | Owner (Member se autorizado) | Receitas, despesas, patrocinadores |
| `/championships/[id]/export` | Owner | Solicitar/acompanhar exportações |
| `/settings` | Owner | Perfil, senha, membros do tenant, licença atual |

### SuperAdmin (FlowCore-only)
| Rota | Perfil | Objetivo |
|------|--------|----------|
| `/superadmin` | SuperAdmin | Dashboard de métricas (MRR, tenants ativos, leads, campeonatos criados) |
| `/superadmin/tenants` | SuperAdmin | Tabela de tenants (status, licença, criação) |
| `/superadmin/tenants/[id]` | SuperAdmin | Detalhe + override (com log) |
| `/superadmin/licenses` | SuperAdmin | CRUD licenças, gerar link Stripe |
| `/superadmin/leads` | SuperAdmin | Leads recentes (preview sem pagamento) |
| `/superadmin/audit-logs` | SuperAdmin | Busca em logs de auditoria |

---

## 2. Estados globais por tela

Toda tela deve ter estados explicitos:
- **loading** → Skeleton com shimmer no tema dark
- **success** → conteudo renderizado
- **empty** → ilustracao esportiva + CTA para próxima ação
- **error** → mensagem clara + botao "tentar novamente" + link para suporte
- **unauthorized (403)** → tela com CTA para renovar licença (se expirada) ou solicitar acesso (se permissão)
- **preview limited** → banner topo "Modo preview — recurso bloqueado. [Ativar licença]"

---

## 3. Detalhamento por Tela

### 3.1 `/register` — Cadastro de Lead

**Objetivo:** Coletar dados minimos, criar tenant preview, redirecionar para `/dashboard`.

**Campos (obrigatórios):**
- Nome completo (input)
- Email (input, validação de formato)
- WhatsApp (input com mascara BR)
- Senha (input com forca visual: fraca/media/forte)
- Esporte principal (select: futebol, vôlei, tênis, skate)
- Nome do time/liga/organização (input — vira `tenant.name`)

**Campos opcionais:**
- Como conheceu? (select analytics)

**Ações:**
- Botao primario "Comecar teste gratis" → POST /api/v1/auth/register
- Link "Já tenho conta" → /login

**Estados:**
- loading (submit em progresso)
- success (redirect + toast)
- error de validação inline por campo
- error de email duplicado → mensagem + link para /login

**Regras (RN):**
- RN-012: rate limit 10 req/min
- RN-002: após criar, tenant fica em modo `preview`

---

### 3.2 `/login`

**Objetivo:** Autenticar e redirecionar para dashboard (Owner/Member) ou `/superadmin` (SuperAdmin).

**Campos:** email + senha + checkbox "manter conectado" (afeta refresh, não access token).

**Ações:**
- "Entrar" → POST /api/v1/auth/login
- "Esqueci senha" → modal ou `/forgot-password`
- "Criar conta" → /register

**Estados:**
- loading
- success → redirect por role
- error → toast + input destacado
- rate-limited → mensagem "muitas tentativas, aguarde X min"

**Visual:** hero em duas colunas — esquerda com imagem `imagens/geral/login-desktop.png` blur + gradient azul; direita com card centralizado.

---

### 3.3 `/dashboard` (Owner/Member)

**Objetivo:** Panorama rápido do tenant.

**Blocos:**
- **Header:** logo + nome do tenant + selector de tenant (se membro em multiplos) + badge de licença (`preview` amarelo / `active` verde / `expiring` laranja / `expired` vermelho) + avatar do usuario.
- **Card KPI 1:** Campeonatos ativos (número grande + esporte icon).
- **Card KPI 2:** Próximo jogo agendado (contagem regressiva + botao "abrir placar").
- **Card KPI 3:** Saldo financeiro (do campeonato ativo — se >1, seletor).
- **Card KPI 4:** Placares públicos ativos agora (com link).
- **Lista:** Campeonatos recentes (top 5) com esporte, status, participantes, botao "abrir".
- **CTA lateral:** "Criar campeonato" (primario laranja).

**Estados:**
- empty (tenant novo, 0 campeonatos) → ilustracao + CTA gigante "Crie seu primeiro campeonato".
- banner preview se aplicavel.

---

### 3.4 `/championships` — Lista

**Objetivo:** Buscar, filtrar, criar campeonatos.

**Elementos:**
- Barra de busca (nome)
- Filtros: esporte (chips), status (chips), período (date range)
- Botao "Criar campeonato" (destaque)
- Tabela / cards responsivos: nome, esporte, status, participantes, inicio, ação

**Estados:** loading (skeleton rows), empty (com CTA), error, paginacao.

---

### 3.5 `/championships/new` — Wizard de Criação

**Objetivo:** Fluxo guiado em passos.

**Steps:**
1. **Esporte** → cards visuais grandes (futebol, vôlei, tênis, skate) com imagens de `imagens/{esporte}/background-01.png`.
2. **Info básica** → nome, datas inicio/fim, descrição.
3. **Configuração** → preenchido com `sport-presets`, editavel (n de sets, pontos por set, tempo de partida, rounds, etc).
4. **Categorias** → nome + critério (idade/peso/genero/livre) — opcional.
5. **Revisao** → resumo + botao "Criar" → redireciona para detalhe.

**Regras:**
- RN-014: após criar, `sportType` e imutavel
- RN-002: tenant preview só pode ter 1 campeonato ativo + max 3 participantes

---

### 3.6 `/championships/[id]` — Detalhe

**Objetivo:** Hub do campeonato. Header + tabs.

**Header:** nome, esporte (icon), status (badge), datas, CTA "Novo jogo" + menu (editar, arquivar).

**Tabs:**
- Visao geral (KPIs, próximos jogos, últimos placares)
- Participantes
- Jogos
- Financeiro (bloqueado preview)
- Exportações (bloqueado preview)

---

### 3.7 `/championships/[id]/matches/[matchId]` — Painel do Placar (ADMIN)

**Objetivo:** Controlar placar e timer em tempo real. Tela MAIS crítica do sistema.

**Layout (responsivo, mobile-first porque árbitro usa no celular):**
- **Topo:** Campeonato + esporte + status (agendado/ao vivo/finalizado) + botao "compartilhar link público" (copia `/live/{token}`).
- **Placar central (60% tela):**
  - Nome participante casa + placar gigante (font 96px+)
  - Separador visual (vs + timer se hasTimer)
  - Nome participante fora + placar gigante
- **Controles por participante:** botoes `+1`, `+2`, `+3` (varia por esporte), `undo`.
- **Timer:** display + botoes start/pause/reset (visivel só se `hasTimer=true`).
- **Histórico lateral:** últimos 10 lancamentos com timestamp + autor.
- **Footer:** botao "Finalizar jogo" (confirmação) + "abrir placar público em nova aba".

**Regras:**
- RN-009: score entry imutavel — undo cria negativa
- RN-010: timer server-authoritative
- Latencia < 100ms (feedback otimista + confirma)

**Estados especiais:**
- offline banner "Sem conexao — mudancas ficam em fila local"
- reconectando spinner discreto no topo
- já finalizado → placar somente leitura com selo "FINALIZADO"

**Visual:** placar imita "telao de arena" (`imagens/geral/placar-live.png`) — fundo dark, números brancos com brilho azul.

---

### 3.8 `/live/[token]` — Placar Público (SSR)

**Objetivo:** Espectador ve placar em tempo real, sem interacao.

**Layout minimalista:**
- Header pequeno: nome do campeonato + esporte + status "AO VIVO" pulsando
- Placar gigante (mesmo estilo do admin, mas sem controles)
- Timer central (se aplicavel)
- Rodapé: powered by SportFlow + link para site + logo pequeno
- Se tenant em preview: marca d'agua diagonal semi-transparente "MODO PREVIEW"

**Requisitos críticos:**
- Renderiza no servidor com dados iniciais (sem flicker)
- Após hydration, conecta Socket.io
- Meta tags OpenGraph com placar atual (para preview no WhatsApp)
- Mobile-first (a maioria vai abrir no celular)
- Contraste alto para leitura em ambiente externo (arena, quadra)
- Sem cookies, sem tracking, sem prompt de consent (LGPD-safe)

---

### 3.9 `/championships/[id]/financial`

**Objetivo:** Registrar e visualizar dinheiro do campeonato.

**Blocos:**
- **KPIs:** Total receita (verde), Total despesa (vermelho), Saldo (verde/vermelho conforme), Patrocinadores ativos.
- **Gráfico:** barras por mes ou pizza por categoria.
- **Botao:** "Nova transação" → modal (tipo, categoria, valor, descrição, data, patrocinador).
- **Tabela:** todas as transações com filtro (tipo/categoria/data), ações (editar, excluir).
- **Export rápido:** botao "Exportar CSV" (enfileira job).

**Bloqueado em preview** → tela mostra call-out gigante "Ative sua licença para desbloquear o financeiro" com CTA.

---

### 3.10 `/championships/[id]/export`

**Objetivo:** Solicitar exportações e acompanhar jobs.

**Blocos:**
- **Novo export:** cards de formato (PDF/CSV) + checklist de modulos (resultados, financeiro, participantes) + botao "Gerar".
- **Fila:** lista dos jobs (status: pending/processing/completed/failed) com timestamps e link de download quando pronto.
- **Job pronto → notificação toast** + Socket.io atualiza tabela em tempo real.

---

### 3.11 `/settings`

**Objetivo:** Configurações do tenant e usuario.

**Tabs:**
- Perfil (nome, email, foto, senha)
- Membros (lista + convite por email + toggle de permissões)
- Licença (plano atual, dias restantes, histórico de pagamentos, botao "renovar")
- Preferencias (idioma futuro, notificações)

---

### 3.12 `/superadmin` — Dashboard FlowCore

**Objetivo:** Métricas para o time comercial/técnico interno.

**KPIs no topo:** MRR, tenants ativos, novos leads no mes, campeonatos criados no mes, uptime.

**Gráficos:** MRR ao longo dos meses, novos tenants por mes, leads convertidos vs perdidos.

**Alertas:** licenças expirando em 7d, tenants sem atividade em 30d.

---

### 3.13 `/superadmin/tenants` e `/superadmin/licenses`

**Tabela padrão com:** busca, filtro por status, ações (ver detalhe, criar licença, pausar, excluir).

**Criar licença (modal):** tenantId (autocomplete), dias, preço em BRL, gera link Stripe, botao "Enviar por email".

---

### 3.14 `/superadmin/leads`

**Tabela:** email, WhatsApp, esporte, data cadastro, última atividade, botao "Contactar" (link WhatsApp Web pre-preenchido) + "Criar licença".

---

### 3.15 `/superadmin/audit-logs`

**Busca:** tenant, usuario, ação, período. Tabela detalhada com JSON expandivel para payload.

---

## 4. Componentes reutilizaveis

- `<SportBadge sport="futebol|vôlei|tênis|skate" />` — icon + cor
- `<LicenseStatus status="preview|active|expiring|expired" />` — badge com cor
- `<Scoreboard mode="admin|public" match={...} />` — placar principal
- `<GameTimer serverTime={} isRunning={} />` — timer sincronizado
- `<PreviewBlockedCallout feature="financial|export" />` — bloqueio preview
- `<AuditLogRow entry={} expanded={} />`
- `<StatCard title label value icon variant />`
- `<EmptyState illustration ctaLabel ctaHref />`
- Skeletons por variante (list, card, scoreboard)

---

## 5. Fluxos críticos (end-to-end)

### F1: Cadastro → Placar público ativo
`/register` → `/dashboard` (preview) → `/championships/new` → detalhe → criar participantes → criar match → painel do placar → copiar link → abrir `/live/[token]` em outra aba → funciona.

### F2: Ativação de licença
SuperAdmin em `/superadmin/licenses/new` → seleciona tenant + dias + preço → gera Stripe URL → envia email → lead paga → webhook ativa tenant → banner preview some.

### F3: Expiracao
License worker (hora em hora) marca `expired` → middleware retorna 403 nas rotas protegidas → dashboard mostra tela "renovar" → Owner clica → SuperAdmin cria nova licença.

### F4: Exportação
`/export` → escolher PDF + modulos → job enfileirado → banner "gerando..." → Socket.io recebe `export:ready` → tabela atualiza → download.

### F5: Placar em partida real
Árbitro abre no celular em `/matches/[id]` → +1/-1 nos botoes gigantes → 20 espectadores em `/live/[token]` veem tudo instant.

---

## 6. Diretrizes de responsividade

- **Mobile-first para:** `/live/[token]`, painel de placar admin, register/login.
- **Desktop-first para:** `/superadmin/*`, `/championships/[id]/financial`, `/championships/[id]/export`.
- **Ambos igualmente:** dashboard, lista de campeonatos.

---

## 7. Acessibilidade

- Todos inputs com `label` visivel + `data-testid`
- Botoes com contraste minimo 4.5:1 no tema dark
- `aria-live="polite"` no placar admin para lancamentos
- `aria-live="assertive"` no placar público para mudancas de score
- Focus visivel com anel azul neon
- Textos com `lang="pt-BR"`
- Navegacao 100% teclado nas telas críticas

---

## Handoff para 05-arquiteto-designer

- **Paleta base sugerida:** dark #0A0E1A, primary blue #00A3FF, accent orange #FF6B00, success green, warning yellow, danger red.
- **Tipografia sugerida:** Titulos `Barlow` ou `Rubik` (esportivo, condensed disponível para placar). Corpo `Inter` (legibilidade).
- **Motion:** entradas suaves (fade + slide 200ms), pulso no badge AO VIVO, contagem regressiva animada, placar com "bump" (scale 1.1 → 1.0) ao mudar.
- **Assets prontos:** `imagens/geral/*.png` para heroes + `imagens/{esporte}/background-0X.png` para telas de esporte.

## Handoff para 06-dev-mockado

Prototipar TODAS as telas acima com dados fake. Priorizar (nessa ordem):
1. `/register` + `/login` + `/dashboard` + `/championships/new` + `/championships/[id]` + `/matches/[id]` + `/live/[token]`
2. `/financial` + `/export`
3. `/superadmin/*`
