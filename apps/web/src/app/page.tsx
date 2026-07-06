import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { APP_NAME, APP_TAGLINE, SPORTS } from '@/lib/constants';

const STEPS = [
  {
    n: '01',
    title: 'Cadastre seu campeonato',
    text: 'Escolha o esporte (temos preset pronto pra futebol, vôlei, tênis e skate), coloque nome e datas.',
  },
  {
    n: '02',
    title: 'Adicione participantes e jogos',
    text: 'Cadastra os times ou atletas, monta a agenda e pronto — o link público do placar já está disponível.',
  },
  {
    n: '03',
    title: 'Marque em tempo real',
    text: 'Placar sincroniza em menos de 100ms para todos os espectadores. Timer server-authoritative, undo, histórico.',
  },
];

const PLANS = [
  {
    title: 'Teste grátis',
    price: 'R$ 0',
    period: 'Enquanto testa',
    highlights: ['1 campeonato', '3 participantes', 'Placar público (com marca d\'água)'],
    cta: 'Começar agora',
    href: '/register',
    tone: 'ghost' as const,
  },
  {
    title: 'Evento (3 dias)',
    price: 'R$ 500',
    period: '3 dias corridos',
    highlights: ['Campeonatos ilimitados', 'Financeiro completo', 'Exportação PDF/CSV'],
    cta: 'Falar com atendimento',
    href: '/register',
    tone: 'primary' as const,
    badge: 'Mais escolhido',
  },
  {
    title: 'Mensal',
    price: 'R$ 1.500',
    period: '30 dias',
    highlights: ['Tudo do plano Evento', 'Prioridade no suporte', 'Marca sua'],
    cta: 'Assinar',
    href: '/register',
    tone: 'ghost' as const,
  },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-ink-950">
      {/* HERO */}
      <section className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0 z-0">
          <Image
            src="/imagens/v2/geral/hero-desktop.png"
            alt=""
            fill
            priority
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/80 to-ink-950/60" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl shadow-glowSm">
                <Image src="/logo.png" alt={APP_NAME} width={40} height={40} className="object-cover" />
              </div>
              <span className="font-display text-xl font-bold tracking-wide">{APP_NAME}</span>
            </div>
            <nav className="flex items-center gap-4 text-sm">
              <a href="#como-funciona" className="hidden text-ink-100 hover:text-white sm:inline">
                Como funciona
              </a>
              <a href="#planos" className="hidden text-ink-100 hover:text-white sm:inline">
                Planos
              </a>
              <Link href="/login" className="text-ink-100 hover:text-white">
                Entrar
              </Link>
              <Link href="/register" className="btn-primary">
                Começar teste
              </Link>
            </nav>
          </header>

          <section className="mt-24 grid gap-16 md:mt-32 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div>
              <span className="badge bg-brand-500/10 text-brand-300">Nova plataforma</span>
              <h1 className="mt-4 font-display text-5xl font-black leading-tight md:text-6xl">
                Placar ao vivo.
                <br />
                <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-accent-500 bg-clip-text text-transparent">
                  Campeonato no controle.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-ink-100">{APP_TAGLINE}</p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/register" className="btn-accent">
                  Começar teste grátis
                </Link>
                <Link href="/login" className="btn-ghost">
                  Já tenho conta
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-3">
                {SPORTS.map((s) => (
                  <div
                    key={s.key}
                    className="flex items-center gap-2 rounded-full border border-ink-800 bg-ink-900/70 px-4 py-2 text-sm font-medium text-ink-100 backdrop-blur"
                  >
                    <span className="text-lg">{s.icon}</span>
                    {s.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="card relative overflow-hidden backdrop-blur">
                <div className="absolute inset-0 bg-grid-glow opacity-70" />
                <div className="relative">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="badge animate-pulseGlow bg-accent-500 text-white">AO VIVO</span>
                    <span className="font-mono text-sm text-ink-100">42:18</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-widest text-ink-100">Casa</p>
                      <p className="font-display text-6xl font-black">3</p>
                    </div>
                    <span className="font-display text-4xl font-black text-brand-500">×</span>
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-widest text-ink-100">Fora</p>
                      <p className="font-display text-6xl font-black">1</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between text-xs text-ink-100">
                    <span>Interbairros 2026</span>
                    <span>Semifinal</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="relative border-t border-ink-800 bg-ink-950 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <span className="badge bg-brand-500/10 text-brand-300">Como funciona</span>
            <h2 className="mt-4 font-display text-4xl font-black md:text-5xl">
              Do apito à premiação em 3 passos
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-100">
              Nada de planilhas confusas. O SportFlow foi feito para você marcar +1 e o mundo ver.
            </p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="card relative">
                <div className="absolute -top-4 -left-4 rounded-2xl bg-brand-500/10 px-3 py-2 font-display text-2xl font-black text-brand-400 shadow-glowSm">
                  {s.n}
                </div>
                <h3 className="mt-4 font-display text-2xl font-bold">{s.title}</h3>
                <p className="mt-3 text-sm text-ink-100">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ESPORTES */}
      <section className="relative border-t border-ink-800 bg-gradient-to-b from-ink-950 to-ink-900 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <span className="badge bg-accent-500/10 text-accent-400">4 esportes no MVP</span>
            <h2 className="mt-4 font-display text-4xl font-black md:text-5xl">
              Preset pronto pra cada modalidade
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-100">
              Regras de pontuação padrão já configuradas. Você só ajusta o que precisar.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {SPORTS.map((s) => (
              <div key={s.key} className="relative overflow-hidden rounded-2xl border border-ink-800">
                <Image
                  src={`/imagens/v2/${s.key}/background-cards.png`}
                  alt=""
                  width={400}
                  height={300}
                  className="h-48 w-full object-cover opacity-45"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <span className="text-3xl">{s.icon}</span>
                  <p className="mt-2 font-display text-xl font-bold">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="relative border-t border-ink-800 bg-ink-950 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <span className="badge bg-success/10 text-success">Planos</span>
            <h2 className="mt-4 font-display text-4xl font-black md:text-5xl">
              Pague quando precisar. Sem mensalidade obrigatória.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-100">
              Cancelamento a qualquer momento. Sem letra miúda.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.title}
                className={`card relative ${
                  p.tone === 'primary' ? 'border-brand-500 shadow-glow' : ''
                }`}
              >
                {p.badge ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink-950">
                    {p.badge}
                  </span>
                ) : null}
                <p className="text-xs uppercase tracking-widest text-ink-100">{p.title}</p>
                <p className="mt-2 font-display text-4xl font-black">{p.price}</p>
                <p className="text-xs text-ink-100">{p.period}</p>
                <ul className="mt-6 space-y-2 text-sm text-ink-100">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-400" />
                      {h}
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.href}
                  className={`mt-6 block text-center ${p.tone === 'primary' ? 'btn-accent' : 'btn-ghost'}`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative border-t border-ink-800 bg-gradient-to-b from-ink-900 to-ink-950 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-4xl font-black md:text-5xl">
            Pronto pra o primeiro apito?
          </h2>
          <p className="mt-4 text-lg text-ink-100">
            Sem cartão. Sem burocracia. Você cria o primeiro campeonato em menos de 60 segundos.
          </p>
          <Link href="/register" className="btn-accent mt-8 inline-flex">
            Criar conta grátis
          </Link>
        </div>
      </section>

      <footer className="border-t border-ink-800 bg-ink-950 py-8 text-center text-xs text-ink-100">
        <p>© 2026 SportFlow · FlowCore — Engenharia de Software com IA</p>
        <p className="mt-2">
          <Link href="/privacidade" className="hover:text-white">
            Política de Privacidade
          </Link>
        </p>
      </footer>
    </main>
  );
}
