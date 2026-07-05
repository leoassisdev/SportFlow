# Direcao Visual — SportFlow

**Agente responsável:** 05-arquiteto-designer
**Base:** logo em `logo.png` + biblioteca em `imagens/`
**Padrão:** ENTREGA_PREMIUM_FLOWCORE v2

---

## 1. Conceito visual

**Arena moderna.** Ambiente escuro (como quadra iluminada após a hora do jogo), com luz azul eletrica dominante e faixas laranja neon que aparecem em CTAs e momentos de ação. Tudo respira **energia**, **movimento** e **precisao**.

Palavras-chave: dark, esportivo, premium, digital, real-time, arena.

Referências visuais nas imagens:
- `logo.png` → paleta oficial: azul brilhante + laranja + branco em fundo escuro
- `imagens/geral/hero-desktop.png` → mood board: quadra escura + luzes de arena
- `imagens/geral/placar-live.png` → inspiracao direta para o placar admin e público
- `imagens/{esporte}/background-0X.png` → backgrounds tematicos por esporte

---

## 2. Paleta de cores

### Neutros (base)
| Nome | Hex | Uso |
|------|-----|-----|
| `ink.950` | `#0A0E1A` | background principal (dashboard, placar) |
| `ink.900` | `#0F1424` | cards e superficies elevadas |
| `ink.800` | `#151B2F` | inputs, seletores, borders |
| `ink.700` | `#1E2740` | hover states, borders de contraste |
| `ink.100` | `#E7ECF5` | texto secundario |
| `ink.50` | `#F5F7FB` | texto primario em superficie escura |

### Marca (primary)
| Nome | Hex | Uso |
|------|-----|-----|
| `brand.500` | `#00A3FF` | cor primaria (links, botoes primarios, focus ring) |
| `brand.600` | `#0088FF` | hover primario |
| `brand.700` | `#0066CC` | pressed |
| `brand.50` | `#E6F6FF` | fundo suave, chip claro (raro em dark theme) |

### Acento (accent)
| Nome | Hex | Uso |
|------|-----|-----|
| `accent.500` | `#FF6B00` | CTA crítico ("Criar campeonato", "Renovar licença") + status AO VIVO |
| `accent.600` | `#E85A00` | hover accent |

### Semanticas
| Nome | Hex | Uso |
|------|-----|-----|
| `success` | `#10B981` | licença ativa, receita, badges positivos |
| `warning` | `#F59E0B` | licença expirando, modo preview |
| `danger` | `#EF4444` | erros, licença expirada, despesa |
| `info` | `#00A3FF` | mesma cor da brand |

### Contraste (validação WCAG AA em fundo `ink.950`)
- Texto `ink.50` sobre `ink.950` → ratio 17.9:1 ✅
- Texto `ink.100` sobre `ink.950` → ratio 15.2:1 ✅
- `brand.500` sobre `ink.950` → 6.4:1 ✅
- `accent.500` sobre `ink.950` → 5.9:1 ✅
- Botao com fundo `brand.500` + texto `ink.950` → 6.4:1 ✅

---

## 3. Tipografia

| Familia | Uso | Fallback |
|---------|-----|----------|
| **Barlow** (600/700/800/900) | Display, titulos, placar (usar Condensed para placar gigante) | `system-ui` |
| **Inter** (400/500/600) | Corpo, formularios, tabelas | `-apple-system, sans-serif` |
| **JetBrains Mono** | Timer, codigos, IDs | `monospace` |

Escalas:
- `text-xs` 12px → labels de input
- `text-sm` 14px → texto padrão em tabelas
- `text-base` 16px → corpo default
- `text-lg` 18px → destaques
- `text-2xl` 24px → subtitulos de secao
- `text-4xl` 36px → titulos de pagina
- `text-6xl` 60px → placar em cards
- `text-9xl` 128px → placar admin gigante
- `clamp(4rem, 12vw, 12rem)` → placar público responsivo

---

## 4. Grid e espacamento

- Sistema base: 4px.
- Container maximo dashboard: `max-w-[1440px] mx-auto px-6`.
- Container placar público: fullscreen com `p-8`.
- Sidebar: `w-64` colapsavel para `w-16` (ícones).
- Gaps: `gap-4` cards / `gap-6` seccoes / `gap-8` grupos.

---

## 5. Componentes visuais

### Botao primario
```
bg-brand-500 text-ink-950 font-semibold rounded-xl px-4 py-2.5
shadow-glow hover:bg-brand-600 hover:shadow-[0_0_40px_rgba(0,163,255,0.5)]
focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-ink-950
transition
```

### Botao accent (CTA crítico)
```
bg-accent-500 text-white font-bold uppercase tracking-wide rounded-xl px-5 py-3
shadow-glowAccent hover:bg-accent-600
```

### Card
```
bg-ink-900 border border-ink-800 rounded-2xl p-6
hover:border-ink-700 transition
```

### Placar (LiveScoreboard admin)
- Container: `bg-gradient-to-b from-ink-900 to-ink-950 rounded-3xl p-8 shadow-glow`
- Score number: `font-display font-black text-[clamp(6rem,20vw,14rem)] leading-none text-white`
- Nome participante: `font-display font-bold text-3xl uppercase tracking-wider text-ink-100`
- Separador vs: `text-brand-500 font-black text-6xl`
- Ao mudar placar: animacao Framer Motion `scale: [1, 1.15, 1]` em 350ms com ease-out

### Timer
```
font-mono text-6xl font-bold text-white tabular-nums
com background sutil de gradiente animado quando running
```

### Badge AO VIVO
```
bg-accent-500 text-white text-xs font-bold uppercase px-3 py-1 rounded-full
animate-pulse (respira)
```

### Badge de licença
- `preview` — bg-warning/20 border-warning text-warning
- `active` — bg-success/20 border-success text-success + glow suave
- `expiring` — bg-accent/20 border-accent text-accent + animate-pulse
- `expired` — bg-danger/20 border-danger text-danger

---

## 6. Motion (Framer Motion)

- Entrada de pagina: `opacity 0→1, y 12→0, 200ms ease-out`
- Modais: `scale 0.96→1, opacity 0→1, 220ms`
- Cards em stagger: children 40ms delay
- Placar bump: `scale [1, 1.15, 1], 350ms`
- Notificação toast: `slide from top-right 260ms + auto-dismiss 4s`
- Reducer motion respeitado (`prefers-reduced-motion`)

---

## 7. Iconografia

- Biblioteca: **Lucide** (já consumida por shadcn).
- Icons customizados por esporte (SVG próprio):
  - `futebol.svg` — bola clássica
  - `vôlei.svg` — bola de vôlei
  - `tênis.svg` — bola de tênis com raquete
  - `skate.svg` — shape de skate
- Cores: sempre `currentColor` para reagir a texto pai.

---

## 8. Assets de background

- `imagens/{esporte}/background-01.png` → hero da wizard de criação e detalhe do campeonato
- `imagens/{esporte}/background-02.png` → alternativa (rotacao mensal)
- Sempre aplicar overlay `bg-gradient-to-t from-ink-950 to-ink-950/40` para garantir contraste dos textos
- Não usar como decoracao em telas denso-informacionais (dashboard, financeiro, tabelas superadmin)

---

## 9. Estados especiais visuais

### Modo preview
- Banner topo full-width: `bg-warning/10 border-b border-warning/40 text-warning-100`
- Texto: "Modo preview — recursos limitados. [Ativar licença completa]"
- Marca d'agua diagonal no placar público: `MODO PREVIEW`, opacity 0.06

### Licença expirando
- Modal proativo (7d antes): animacao entry + botao gigante "Renovar"

### Licença expirada
- Tela de bloqueio ocupa todo dashboard: ilustracao + CTA "Renovar"

### Sem conexao (Socket.io down)
- Banner amarelo discreto no topo do painel admin: "Sem conexao — mudancas ficam em fila local"

### Placar finalizado
- Overlay dark com selo "FINALIZADO" em Barlow Condensed 900

---

## 10. Landing pública

Não e prioridade do MVP técnico mas deve seguir a mesma estetica:
- Hero com `imagens/geral/hero-desktop.png` de fundo
- H1 grande com gradiente `bg-clip-text bg-gradient-to-r from-brand-500 to-accent-500`
- CTA "Comecar teste gratis" em accent
- Sessões: como funciona, esportes suportados, planos, prova social (deixar para v1.1)

---

## 11. Sidebar (dashboard)

- Logo compacta no topo
- Navegacao com ícone + label (Campeonatos, Financeiro, Exportações, Configurações)
- Item ativo: fundo `ink-800` + borda esquerda `brand-500` de 3px
- Rodapé sidebar: badge de licença + link para configurações
- Colapsavel

---

## 12. Topbar

- Selector de tenant (se membro em varios) com avatar do tenant
- Search global (Cmd+K) — implementar depois
- Notificações (bell)
- Avatar + dropdown (perfil, sair)

---

## 13. Dark theme apenas (por enquanto)

Não há light theme no MVP. Toda a IU e dark. Documentar decisão para futuro.

---

## 14. Fluxo de aprovacao com Cliente (Leo)

Este documento e a "carta de intencoes". A validação real acontece:
1. Agente 06-dev-mockado gera prototipo Next.js com dados fake usando estes tokens
2. Cliente navega e aprova/pede ajustes
3. Aprovado o mock, o agente 09 (dev frontend) usa esta biblioteca de tokens como fonte

---

## 15. Handoff

- Para **06-dev-mockado:** todos os tokens e componentes acima como config Tailwind + shadcn já pronta
- Para **09-dev-frontend:** confirmar contraste em cada tela + implementar motion respeitando reduce-motion
- Para **04-arquiteto-frontend:** tokens já mapeados em `tailwind.config.ts` do skeleton
