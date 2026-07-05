# Mapa de Telas — SportFlow

**Agente responsavel:** 02-analista-de-tela
**Base:** docs/01-prd.md + imagens em `imagens/geral/` e `imagens/{esporte}/`
**Referencias visuais:** fundo dark de arena/quadra, azul neon + laranja como acentos, tipografia esportiva (ver `imagens/geral/hero-desktop.png` e `logo.png`).

---

## 1. Inventario de Telas

### Publicas (sem auth)
| Rota | Perfil | Objetivo |
|------|--------|----------|
| `/` | Publico | Landing institucional (breve) + CTA "Comecar teste gratis" |
| `/login` | Publico | Login de Owner/Member/SuperAdmin |
| `/register` | Publico | Cadastro de lead → cria tenant preview |
| `/live/[token]` | Espectador | Placar publico do match, SSR + Socket.io read-only |
| `/payment/success` | Publico | Confirmacao pos-Stripe |
| `/payment/cancel` | Publico | Cancelamento pos-Stripe |
| `/404` / `/500` | Publico | Erros amigaveis com tema esportivo |

### Dashboard (Owner + Member)
| Rota | Perfil | Objetivo |
|------|--------|----------|
| `/dashboard` | Owner/Member | Home: cards com campeonatos ativos, proximo jogo, saldo financeiro |
| `/championships` | Owner/Member | Lista de campeonatos |
| `/championships/new` | Owner | Criar campeonato + escolher esporte |
| `/championships/[id]` | Owner/Member | Detalhe do campeonato, tabs (visao geral, participantes, jogos, financeiro, exportacoes) |
| `/championships/[id]/participants` | Owner/Member | CRUD participantes |
| `/championships/[id]/matches` | Owner/Member | Lista de jogos (agendados/em andamento/finalizados) |
| `/championships/[id]/matches/[matchId]` | Owner/Member | Painel de controle do placar (com escrita) |
| `/championships/[id]/financial` | Owner (Member se autorizado) | Receitas, despesas, patrocinadores |
| `/championships/[id]/export` | Owner | Solicitar/acompanhar exportacoes |
| `/settings` | Owner | Perfil, senha, membros do tenant, licenca atual |

### SuperAdmin (FlowCore-only)
| Rota | Perfil | Objetivo |
|------|--------|----------|
| `/superadmin` | SuperAdmin | Dashboard de metricas (MRR, tenants ativos, leads, campeonatos criados) |
| `/superadmin/tenants` | SuperAdmin | Tabela de tenants (status, licenca, criacao) |
| `/superadmin/tenants/[id]` | SuperAdmin | Detalhe + override (com log) |
| `/superadmin/licenses` | SuperAdmin | CRUD licencas, gerar link Stripe |
| `/superadmin/leads` | SuperAdmin | Leads recentes (preview sem pagamento) |
| `/superadmin/audit-logs` | SuperAdmin | Busca em logs de auditoria |

---

## 2. Estados globais por tela

Toda tela deve ter estados explicitos:
- **loading** → Skeleton com shimmer no tema dark
- **success** → conteudo renderizado
- **empty** → ilustracao esportiva + CTA para proxima acao
- **error** → mensagem clara + botao "tentar novamente" + link para suporte
- **unauthorized (403)** → tela com CTA para renovar licenca (se expirada) ou solicitar acesso (se permissao)
- **preview limited** → banner topo "Modo preview — recurso bloqueado. [Ativar licenca]"

---

## 3. Detalhamento por Tela

### 3.1 `/register` — Cadastro de Lead

**Objetivo:** Coletar dados minimos, criar tenant preview, redirecionar para `/dashboard`.

**Campos (obrigatorios):**
- Nome completo (input)
- Email (input, validacao de formato)
- WhatsApp (input com mascara BR)
- Senha (input com forca visual: fraca/media/forte)
- Esporte principal (select: futebol, volei, tenis, skate)
- Nome do time/liga/organizacao (input — vira `tenant.name`)

**Campos opcionais:**
- Como conheceu? (select analytics)

**Acoes:**
- Botao primario "Comecar teste gratis" → POST /api/v1/auth/register
- Link "Ja tenho conta" → /login

**Estados:**
- loading (submit em progresso)
- success (redirect + toast)
- error de validacao inline por campo
- error de email duplicado → mensagem + link para /login

**Regras (RN):**
- RN-012: rate limit 10 req/min
- RN-002: apos criar, tenant fica em modo `preview`

---

### 3.2 `/login`

**Objetivo:** Autenticar e redirecionar para dashboard (Owner/Member) ou `/superadmin` (SuperAdmin).

**Campos:** email + senha + checkbox "manter conectado" (afeta refresh, nao access token).

**Acoes:**
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

**Objetivo:** Panorama rapido do tenant.

**Blocos:**
- **Header:** logo + nome do tenant + selector de tenant (se membro em multiplos) + badge de licenca (`preview` amarelo / `active` verde / `expiring` laranja / `expired` vermelho) + avatar do usuario.
- **Card KPI 1:** Campeonatos ativos (numero grande + esporte icon).
- **Card KPI 2:** Proximo jogo agendado (contagem regressiva + botao "abrir placar").
- **Card KPI 3:** Saldo financeiro (do campeonato ativo — se >1, seletor).
- **Card KPI 4:** Placares publicos ativos agora (com link).
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
- Filtros: esporte (chips), status (chips), periodo (date range)
- Botao "Criar campeonato" (destaque)
- Tabela / cards responsivos: nome, esporte, status, participantes, inicio, acao

**Estados:** loading (skeleton rows), empty (com CTA), error, paginacao.

---

### 3.5 `/championships/new` — Wizard de Criacao

**Objetivo:** Fluxo guiado em passos.

**Steps:**
1. **Esporte** → cards visuais grandes (futebol, volei, tenis, skate) com imagens de `imagens/{esporte}/background-01.png`.
2. **Info basica** → nome, datas inicio/fim, descricao.
3. **Configuracao** → preenchido com `sport-presets`, editavel (n de sets, pontos por set, tempo de partida, rounds, etc).
4. **Categorias** → nome + criterio (idade/peso/genero/livre) — opcional.
5. **Revisao** → resumo + botao "Criar" → redireciona para detalhe.

**Regras:**
- RN-014: apos criar, `sportType` e imutavel
- RN-002: tenant preview so pode ter 1 campeonato ativo + max 3 participantes

---

### 3.6 `/championships/[id]` — Detalhe

**Objetivo:** Hub do campeonato. Header + tabs.

**Header:** nome, esporte (icon), status (badge), datas, CTA "Novo jogo" + menu (editar, arquivar).

**Tabs:**
- Visao geral (KPIs, proximos jogos, ultimos placares)
- Participantes
- Jogos
- Financeiro (bloqueado preview)
- Exportacoes (bloqueado preview)

---

### 3.7 `/championships/[id]/matches/[matchId]` — Painel do Placar (ADMIN)

**Objetivo:** Controlar placar e timer em tempo real. Tela MAIS critica do sistema.

**Layout (responsivo, mobile-first porque arbitro usa no celular):**
- **Topo:** Campeonato + esporte + status (agendado/ao vivo/finalizado) + botao "compartilhar link publico" (copia `/live/{token}`).
- **Placar central (60% tela):**
  - Nome participante casa + placar gigante (font 96px+)
  - Separador visual (vs + timer se hasTimer)
  - Nome participante fora + placar gigante
- **Controles por participante:** botoes `+1`, `+2`, `+3` (varia por esporte), `undo`.
- **Timer:** display + botoes start/pause/reset (visivel so se `hasTimer=true`).
- **Historico lateral:** ultimos 10 lancamentos com timestamp + autor.
- **Footer:** botao "Finalizar jogo" (confirmacao) + "abrir placar publico em nova aba".

**Regras:**
- RN-009: score entry imutavel — undo cria negativa
- RN-010: timer server-authoritative
- Latencia < 100ms (feedback otimista + confirma)

**Estados especiais:**
- offline banner "Sem conexao — mudancas ficam em fila local"
- reconectando spinner discreto no topo
- ja finalizado → placar somente leitura com selo "FINALIZADO"

**Visual:** placar imita "telao de arena" (`imagens/geral/placar-live.png`) — fundo dark, numeros brancos com brilho azul.

---

### 3.8 `/live/[token]` — Placar Publico (SSR)

**Objetivo:** Espectador ve placar em tempo real, sem interacao.

**Layout minimalista:**
- Header pequeno: nome do campeonato + esporte + status "AO VIVO" pulsando
- Placar gigante (mesmo estilo do admin, mas sem controles)
- Timer central (se aplicavel)
- Rodape: powered by SportFlow + link para site + logo pequeno
- Se tenant em preview: marca d'agua diagonal semi-transparente "MODO PREVIEW"

**Requisitos criticos:**
- Renderiza no servidor com dados iniciais (sem flicker)
- Apos hydration, conecta Socket.io
- Meta tags OpenGraph com placar atual (para preview no WhatsApp)
- Mobile-first (a maioria vai abrir no celular)
- Contraste alto para leitura em ambiente externo (arena, quadra)
- Sem cookies, sem tracking, sem prompt de consent (LGPD-safe)

---

### 3.9 `/championships/[id]/financial`

**Objetivo:** Registrar e visualizar dinheiro do campeonato.

**Blocos:**
- **KPIs:** Total receita (verde), Total despesa (vermelho), Saldo (verde/vermelho conforme), Patrocinadores ativos.
- **Grafico:** barras por mes ou pizza por categoria.
- **Botao:** "Nova transacao" → modal (tipo, categoria, valor, descricao, data, patrocinador).
- **Tabela:** todas as transacoes com filtro (tipo/categoria/data), acoes (editar, excluir).
- **Export rapido:** botao "Exportar CSV" (enfileira job).

**Bloqueado em preview** → tela mostra call-out gigante "Ative sua licenca para desbloquear o financeiro" com CTA.

---

### 3.10 `/championships/[id]/export`

**Objetivo:** Solicitar exportacoes e acompanhar jobs.

**Blocos:**
- **Novo export:** cards de formato (PDF/CSV) + checklist de modulos (resultados, financeiro, participantes) + botao "Gerar".
- **Fila:** lista dos jobs (status: pending/processing/completed/failed) com timestamps e link de download quando pronto.
- **Job pronto → notificacao toast** + Socket.io atualiza tabela em tempo real.

---

### 3.11 `/settings`

**Objetivo:** Configuracoes do tenant e usuario.

**Tabs:**
- Perfil (nome, email, foto, senha)
- Membros (lista + convite por email + toggle de permissoes)
- Licenca (plano atual, dias restantes, historico de pagamentos, botao "renovar")
- Preferencias (idioma futuro, notificacoes)

---

### 3.12 `/superadmin` — Dashboard FlowCore

**Objetivo:** Metricas para o time comercial/tecnico interno.

**KPIs no topo:** MRR, tenants ativos, novos leads no mes, campeonatos criados no mes, uptime.

**Graficos:** MRR ao longo dos meses, novos tenants por mes, leads convertidos vs perdidos.

**Alertas:** licencas expirando em 7d, tenants sem atividade em 30d.

---

### 3.13 `/superadmin/tenants` e `/superadmin/licenses`

**Tabela padrao com:** busca, filtro por status, acoes (ver detalhe, criar licenca, pausar, excluir).

**Criar licenca (modal):** tenantId (autocomplete), dias, preco em BRL, gera link Stripe, botao "Enviar por email".

---

### 3.14 `/superadmin/leads`

**Tabela:** email, WhatsApp, esporte, data cadastro, ultima atividade, botao "Contactar" (link WhatsApp Web pre-preenchido) + "Criar licenca".

---

### 3.15 `/superadmin/audit-logs`

**Busca:** tenant, usuario, acao, periodo. Tabela detalhada com JSON expandivel para payload.

---

## 4. Componentes reutilizaveis

- `<SportBadge sport="futebol|volei|tenis|skate" />` — icon + cor
- `<LicenseStatus status="preview|active|expiring|expired" />` — badge com cor
- `<Scoreboard mode="admin|public" match={...} />` — placar principal
- `<GameTimer serverTime={} isRunning={} />` — timer sincronizado
- `<PreviewBlockedCallout feature="financial|export" />` — bloqueio preview
- `<AuditLogRow entry={} expanded={} />`
- `<StatCard title label value icon variant />`
- `<EmptyState illustration ctaLabel ctaHref />`
- Skeletons por variante (list, card, scoreboard)

---

## 5. Fluxos criticos (end-to-end)

### F1: Cadastro → Placar publico ativo
`/register` → `/dashboard` (preview) → `/championships/new` → detalhe → criar participantes → criar match → painel do placar → copiar link → abrir `/live/[token]` em outra aba → funciona.

### F2: Ativacao de licenca
SuperAdmin em `/superadmin/licenses/new` → seleciona tenant + dias + preco → gera Stripe URL → envia email → lead paga → webhook ativa tenant → banner preview some.

### F3: Expiracao
License worker (hora em hora) marca `expired` → middleware retorna 403 nas rotas protegidas → dashboard mostra tela "renovar" → Owner clica → SuperAdmin cria nova licenca.

### F4: Exportacao
`/export` → escolher PDF + modulos → job enfileirado → banner "gerando..." → Socket.io recebe `export:ready` → tabela atualiza → download.

### F5: Placar em partida real
Arbitro abre no celular em `/matches/[id]` → +1/-1 nos botoes gigantes → 20 espectadores em `/live/[token]` veem tudo instant.

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
- `aria-live="assertive"` no placar publico para mudancas de score
- Focus visivel com anel azul neon
- Textos com `lang="pt-BR"`
- Navegacao 100% teclado nas telas criticas

---

## Handoff para 05-arquiteto-designer

- **Paleta base sugerida:** dark #0A0E1A, primary blue #00A3FF, accent orange #FF6B00, success green, warning yellow, danger red.
- **Tipografia sugerida:** Titulos `Barlow` ou `Rubik` (esportivo, condensed disponivel para placar). Corpo `Inter` (legibilidade).
- **Motion:** entradas suaves (fade + slide 200ms), pulso no badge AO VIVO, contagem regressiva animada, placar com "bump" (scale 1.1 → 1.0) ao mudar.
- **Assets prontos:** `imagens/geral/*.png` para heroes + `imagens/{esporte}/background-0X.png` para telas de esporte.

## Handoff para 06-dev-mockado

Prototipar TODAS as telas acima com dados fake. Priorizar (nessa ordem):
1. `/register` + `/login` + `/dashboard` + `/championships/new` + `/championships/[id]` + `/matches/[id]` + `/live/[token]`
2. `/financial` + `/export`
3. `/superadmin/*`
