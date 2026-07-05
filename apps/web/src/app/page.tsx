import Image from 'next/image';
import Link from 'next/link';
import { APP_NAME, APP_TAGLINE, SPORTS } from '@/lib/constants';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink-950">
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
            <Link href="/login" className="text-ink-100 hover:text-white">
              Entrar
            </Link>
            <Link href="/register" className="btn-primary">
              Comecar teste
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
                Comecar teste gratis
              </Link>
              <Link href="/login" className="btn-ghost">
                Ja tenho conta
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
                  <span>Campeonato Interbairros 2026</span>
                  <span>Semifinal</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-auto pt-16 text-xs text-ink-100">
          <p>© 2026 SportFlow · FlowCore — Engenharia de Software com IA</p>
        </footer>
      </div>
    </main>
  );
}
