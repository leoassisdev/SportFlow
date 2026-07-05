import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-ink-950 md:grid-cols-2">
      <aside className="relative hidden overflow-hidden md:block">
        <Image
          src="/imagens/v2/geral/login-desktop.png"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ink-950/40 via-ink-950/60 to-ink-950/90" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl shadow-glowSm">
              <Image src="/logo.png" alt="SportFlow" width={40} height={40} className="object-cover" />
            </div>
            <span className="font-display text-xl font-bold">SportFlow</span>
          </Link>
          <div>
            <p className="font-display text-4xl font-black leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              Onde o placar
              <br />
              acontece.
            </p>
            <p className="mt-4 max-w-md text-ink-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
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
