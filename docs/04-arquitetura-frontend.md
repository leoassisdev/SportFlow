# Arquitetura Frontend — SportFlow

**Agente responsavel:** 04-arquiteto-it-valley-frontend
**Stack:** Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS + shadcn/ui + Axios + Socket.io client + Zustand (state global leve) + React Query (server state) + Framer Motion (motion)

---

## 1. Estrutura de pastas (apps/web)

```
apps/web/
├── src/
│   ├── app/
│   │   ├── layout.tsx                     # root layout (fonts, providers)
│   │   ├── page.tsx                       # landing publica
│   │   ├── globals.css                    # Tailwind + tokens
│   │   ├── (auth)/
│   │   │   ├── layout.tsx                 # split visual login/register
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                 # sidebar + topbar
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── championships/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── participants/page.tsx
│   │   │   │       ├── matches/
│   │   │   │       │   ├── page.tsx
│   │   │   │       │   └── [matchId]/page.tsx
│   │   │   │       ├── financial/page.tsx
│   │   │   │       └── export/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── (superadmin)/
│   │   │   ├── layout.tsx
│   │   │   ├── superadmin/page.tsx
│   │   │   ├── tenants/
│   │   │   ├── licenses/
│   │   │   ├── leads/
│   │   │   └── audit-logs/
│   │   ├── live/
│   │   │   └── [token]/page.tsx           # SSR publico
│   │   ├── payment/
│   │   │   ├── success/page.tsx
│   │   │   └── cancel/page.tsx
│   │   ├── privacidade/page.tsx
│   │   └── api/
│   │       └── health/route.ts            # health do Next
│   │
│   ├── components/
│   │   ├── ui/                            # shadcn (button, card, dialog, etc)
│   │   ├── layout/                        # Sidebar, Topbar, Container
│   │   ├── championship/                  # ChampionshipCard, SportPicker, ...
│   │   ├── scoreboard/                    # LiveScoreboard, GameTimer, ScoreUpdater, ScoreHistory
│   │   ├── financial/                     # TxRow, TxModal, KpiCards
│   │   ├── export/                        # ExportJobRow, ExportPicker
│   │   ├── superadmin/
│   │   └── common/                        # PreviewBlocked, EmptyState, LicenseBadge, SportBadge
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSocket.ts
│   │   ├── useLiveScore.ts
│   │   ├── useChampionships.ts            # wrapper React Query
│   │   ├── useExportJobs.ts
│   │   └── useDebouncedValue.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── championship.service.ts
│   │   ├── match.service.ts
│   │   ├── financial.service.ts
│   │   ├── export.service.ts
│   │   ├── license.service.ts
│   │   └── superadmin.service.ts
│   │
│   ├── dto/                               # tipos TS espelhando API contracts
│   │   ├── auth.dto.ts
│   │   ├── championship.dto.ts
│   │   ├── scoreboard.dto.ts
│   │   └── ...
│   │
│   ├── lib/
│   │   ├── api.ts                         # Axios instance + interceptors
│   │   ├── socket.ts                      # Socket.io client
│   │   ├── queryClient.ts                 # React Query config
│   │   ├── auth.ts                        # helpers
│   │   ├── format.ts                      # dinheiro, data, telefone
│   │   └── constants.ts
│   │
│   ├── store/                             # Zustand stores (state UI global)
│   │   ├── ui.store.ts                    # sidebar open, theme, etc
│   │   └── notifications.store.ts
│   │
│   └── middleware.ts                      # Next.js middleware (protecao de rotas)
│
├── public/
│   ├── logo.png
│   └── imagens/                           # backgrounds por esporte (referenciar imagens/)
├── tests/
│   ├── unit/
│   └── e2e/                               # Playwright
├── Dockerfile
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## 2. Roteamento e groups

- `(auth)` — layout com split visual, sem sidebar.
- `(dashboard)` — layout com Sidebar (colapsavel) + Topbar (tenant switcher + user menu).
- `(superadmin)` — layout escuro com badge "FLOWCORE" no header, sem opcao de trocar tenant.
- `live/[token]` — SSR puro, minimalista, sem cookies, sem tracking.

Rotas `/api/*` do Next apenas para health check — todo backend real e Express separado.

---

## 3. Middleware Next (`src/middleware.ts`)

```typescript
export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // publicas
  const publicPaths = ['/', '/login', '/register', '/forgot-password', '/privacidade']
  if (publicPaths.includes(path) || path.startsWith('/live/') || path.startsWith('/payment/')) {
    return NextResponse.next()
  }

  const accessCookie = req.cookies.get('access_token')?.value
  if (!accessCookie) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // superadmin routes exigem role — verificacao final no server component
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png|imagens/).*)'],
}
```

Verificacao dupla: middleware (edge, rapido) + Server Component (checa role real e trata expiracao/refresh).

---

## 4. Axios (lib/api.ts)

```typescript
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // envia cookies HttpOnly
  timeout: 15000,
})

let refreshingPromise: Promise<void> | null = null

api.interceptors.response.use(
  r => r,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      refreshingPromise ??= api.post('/api/v1/auth/refresh').finally(() => { refreshingPromise = null })
      try {
        await refreshingPromise
        return api(original)
      } catch {
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)
```

---

## 5. Socket.io client (lib/socket.ts)

```typescript
export const createSocket = (path: string, opts?: { auth?: boolean }) => {
  const socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
    withCredentials: opts?.auth ?? false,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 20,
  })
  return socket
}
```

Hook `useLiveScore`:
```typescript
export function useLiveScore({ matchId, liveToken, isAdmin }: Args) {
  const [state, setState] = useState<ScoreState>(initial)
  useEffect(() => {
    const socket = createSocket('', { auth: isAdmin })
    const room = isAdmin ? `match:admin:${matchId}` : `match:public:${liveToken}`
    socket.emit('join', room)
    socket.on('score:updated', p => setState(prev => ({ ...prev, home: p.home, away: p.away })))
    socket.on('timer:started', p => setState(prev => ({ ...prev, timer: p.timer, timerRunning: true })))
    // ... outros eventos
    return () => { socket.disconnect() }
  }, [matchId, liveToken, isAdmin])
  return state
}
```

---

## 6. React Query — camada de server state

- Todo `service.*` retorna Promise → wrapper em hook `use*` com React Query.
- `queryKey` sempre inclui `tenantId` (implicito via cookie) e filtros.
- Invalidacao automatica em mutations relevantes.
- Retry: 1 no GET, 0 no POST/PATCH/DELETE.

---

## 7. Zustand — state UI

Apenas coisas realmente globais e efemeras:
- Sidebar open/collapsed
- Toast queue
- Tenant atual selecionado (se membro em varios) — persistido em cookie tambem

**Nao** guardar dados de dominio no Zustand — isso e responsabilidade do React Query.

---

## 8. Design tokens (Tailwind config extra)

```typescript
// tailwind.config.ts
extend: {
  colors: {
    ink: {
      950: '#0A0E1A', // background principal
      900: '#0F1424',
      800: '#151B2F',
      700: '#1E2740',
    },
    brand: {
      DEFAULT: '#00A3FF',
      50: '#E6F6FF',
      500: '#00A3FF',
      600: '#0088FF',
      700: '#0066CC',
    },
    accent: {
      DEFAULT: '#FF6B00',
      500: '#FF6B00',
      600: '#E85A00',
    },
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
  fontFamily: {
    display: ['Barlow', 'system-ui'],   // titulos/placar
    sans: ['Inter', 'system-ui'],       // corpo
    mono: ['JetBrains Mono', 'monospace'], // codigo/timer
  },
  boxShadow: {
    glow: '0 0 32px rgba(0,163,255,0.35)',
    glowAccent: '0 0 32px rgba(255,107,0,0.35)',
  },
}
```

---

## 9. Componentes-chave

- **`<Scoreboard />`** — modo `admin` (com controles) ou `public` (readonly). Font grande, glow azul, animacao "bump" no incremento.
- **`<GameTimer />`** — server-authoritative, sincroniza a cada tick recebido, interpola local para suavidade.
- **`<SportBadge />`** — icon + gradiente por esporte.
- **`<LicenseBadge status />`** — preview (amarelo) / active (verde+glow) / expiring (laranja pulsando) / expired (vermelho).
- **`<PreviewBlockedCallout />`** — aparece em telas bloqueadas em modo preview, gigante, com CTA.

---

## 10. Formularios

- React Hook Form + Zod resolver.
- Validacao inline com mensagem embaixo do campo.
- Botao submit desabilita durante request.
- Toast de sucesso/erro depois.

---

## 11. Loading / Empty / Error

- Toda rota tem `loading.tsx` (Skeleton).
- Toda listagem tem estado empty com ilustracao esportiva.
- ErrorBoundary por segmento; error.tsx no route level.

---

## 12. SSR do placar publico

`app/live/[token]/page.tsx` e um **Server Component** que:
1. `fetch('/api/v1/live/{token}')` no server (com timeout 3s)
2. Renderiza `<PublicScoreboard initial={data} token={token} />` (Client Component)
3. O Client Component monta Socket.io e passa a atualizar em real-time

Meta tags dinamicas (`generateMetadata`) com nome do campeonato + placar atual → OpenGraph rico.

---

## 13. Acessibilidade

- shadcn/ui ja implementa a11y correta em dialog/menu/tooltip.
- Every button has aria-label quando so tem icon.
- Focus visivel com `ring-2 ring-brand`.
- Placar publico com `aria-live="assertive"` para leitores de tela.

---

## 14. Performance

- Server Components por padrao no App Router.
- Client Components explicitos (`'use client'`) apenas quando necessario.
- Imagens via `next/image` com `sizes` corretos.
- Fonts via `next/font` (Inter + Barlow) — self-hosted.
- Bundle analyzer no CI em modo debug.

---

## 15. Config via `next.config.js`

- `output: 'standalone'` para deploy Azure enxuto
- `images.remotePatterns` para blob storage
- Rewrites para `/api/*` → API se compartilhar dominio, senao usar `NEXT_PUBLIC_API_URL` direto

---

## 16. Handoff

- Para **05-designer:** paleta e tokens ja definidos aqui; validar contraste WCAG AA nos backgrounds.
- Para **09-dev-frontend:** este documento + skeleton bootstrapado.
- Para **03-backend:** contratos DTO ficam em `packages/shared-types`.
- Para **13-qa-tela:** `data-testid` obrigatorio em botoes, inputs, cards de lista, badges de status.
