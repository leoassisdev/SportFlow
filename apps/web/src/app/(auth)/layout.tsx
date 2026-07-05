import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-ink-950 md:grid-cols-2">
      <aside className="relative hidden overflow-hidden md:block">
        <div className="absolute inset-0 bg-gradient-to-br from-ink-900 via-ink-950 to-ink-800" />
        <div className="absolute inset-0 bg-grid-glow opacity-90" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-400 shadow-glowSm">
              <span className="font-display text-xl font-black">S</span>
            </div>
            <span className="font-display text-xl font-bold">SportFlow</span>
          </Link>
          <div>
            <p className="font-display text-4xl font-black leading-tight">
              Onde o placar
              <br />
              acontece.
            </p>
            <p className="mt-4 max-w-md text-ink-100">
              Do primeiro apito ao relatorio final — SportFlow entrega o
              controle do seu campeonato em tempo real.
            </p>
          </div>
        </div>
      </aside>
      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
