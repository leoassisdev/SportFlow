import Image from 'next/image';
import type { Metadata } from 'next';

interface Props {
  params: { token: string };
}

export const generateMetadata = ({ params }: Props): Metadata => ({
  title: `AO VIVO — Interbairros 2026 (${params.token})`,
  description: 'Placar em tempo real do SportFlow',
});

export default function LivePage({ params: _params }: Props) {
  // Mock — hydration Socket.io vira na Fase 8 real
  const data = {
    championship: 'Interbairros 2026',
    stage: 'Semifinal',
    home: { name: 'Bairro Alto', score: 3 },
    away: { name: 'Vila Norte', score: 1 },
    timer: '42:18',
    isPreview: true,
    sport: 'futebol' as const,
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink-950 px-6 py-12 text-center">
      <Image
        src={`/imagens/v2/${data.sport}/background-hero.png`}
        alt=""
        fill
        priority
        className="object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/40" />

      {data.isPreview ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="rotate-[-25deg] font-display text-[12vw] font-black text-white/[0.04]">
            MODO PREVIEW
          </p>
        </div>
      ) : null}

      <div className="relative w-full max-w-6xl">
        <div className="mb-6 flex items-center justify-between text-sm text-ink-100">
          <span className="font-display text-lg font-bold uppercase tracking-widest text-ink-100 drop-shadow-lg">
            {data.championship} · {data.stage}
          </span>
          <span className="badge animate-pulseGlow bg-accent-500 text-white">AO VIVO</span>
        </div>

        <div className="rounded-3xl border border-ink-800 bg-gradient-to-b from-ink-900/90 to-ink-950/95 p-10 shadow-glow backdrop-blur">
          <div className="grid grid-cols-3 items-center gap-4">
            <div className="text-center">
              <p className="mb-4 font-display text-3xl font-bold uppercase tracking-wide text-ink-100">
                {data.home.name}
              </p>
              <p
                className="font-display font-black leading-none tabular-nums text-white"
                style={{ fontSize: 'clamp(6rem, 20vw, 14rem)' }}
              >
                {data.home.score}
              </p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <span className="font-display text-6xl font-black text-brand-500">×</span>
              <div className="rounded-2xl bg-ink-950/80 px-6 py-2 font-mono text-4xl font-bold tabular-nums text-white">
                {data.timer}
              </div>
            </div>
            <div className="text-center">
              <p className="mb-4 font-display text-3xl font-bold uppercase tracking-wide text-ink-100">
                {data.away.name}
              </p>
              <p
                className="font-display font-black leading-none tabular-nums text-white"
                style={{ fontSize: 'clamp(6rem, 20vw, 14rem)' }}
              >
                {data.away.score}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-xs uppercase tracking-widest text-ink-100">
          Powered by SportFlow · sportflow.com.br
        </p>
      </div>
    </main>
  );
}
