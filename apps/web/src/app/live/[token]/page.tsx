import Image from 'next/image';
import type { Metadata } from 'next';
import { PublicScoreboard } from '@/components/scoreboard/PublicScoreboard';
import { liveService, type LiveMatch } from '@/services/live.service';

interface Props {
  params: { token: string };
}

export const dynamic = 'force-dynamic';

async function fetchLive(token: string): Promise<LiveMatch | null> {
  try {
    return await liveService.get(token);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await fetchLive(params.token);
  if (!data) return { title: 'Placar não encontrado' };
  const { home, away } = data.match.homeParticipant && data.match.awayParticipant
    ? { home: data.match.homeParticipant.name, away: data.match.awayParticipant.name }
    : { home: 'Casa', away: 'Fora' };
  return {
    title: `${data.match.homeScore} × ${data.match.awayScore} — ${home} vs ${away}`,
    description: `${data.championship.name} · ${home} × ${away} AO VIVO no SportFlow`,
    openGraph: {
      title: `${home} ${data.match.homeScore} × ${data.match.awayScore} ${away}`,
      description: `${data.championship.name} — ${data.championship.sportType}`,
      type: 'website',
    },
  };
}

export default async function LivePage({ params }: Props) {
  const data = await fetchLive(params.token);

  if (!data) {
    return (
      <main className="grid min-h-screen place-items-center bg-ink-950 px-6 text-center">
        <div className="card max-w-md">
          <h1 className="font-display text-3xl font-black">Placar não encontrado</h1>
          <p className="mt-2 text-sm text-ink-100">
            O link pode ter expirado ou o jogo ainda não comecou.
          </p>
        </div>
      </main>
    );
  }

  const { championship, match, isPreview } = data;
  const sport = championship.sportType as 'futebol' | 'volei' | 'tenis' | 'skate';
  const backgroundBySport: Record<string, string> = {
    futebol: '/imagens/v2/futebol/background-hero.png',
    volei: '/imagens/v2/volei/background-hero.png',
    tenis: '/imagens/v2/tenis/background-hero.png',
    skate: '/imagens/v2/skate/background-hero.png',
  };
  const bg = backgroundBySport[sport] ?? '/imagens/v2/geral/hero-desktop.png';

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink-950 px-6 py-12 text-center">
      <Image src={bg} alt="" fill priority className="object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/40" />

      {isPreview ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="rotate-[-25deg] font-display text-[12vw] font-black text-white/[0.04]">MODO PREVIEW</p>
        </div>
      ) : null}

      <div className="relative w-full max-w-6xl">
        <div className="mb-6 flex items-center justify-between text-sm text-ink-100">
          <div className="text-left">
            <p className="font-display text-lg font-bold uppercase tracking-widest drop-shadow-lg">
              {championship.name}
            </p>
            <p className="text-xs uppercase text-ink-100">{championship.sportType}</p>
          </div>
          <span
            className={`badge ${match.status === 'live' ? 'animate-pulseGlow bg-accent-500 text-white' : 'bg-ink-800 text-ink-100'}`}
          >
            {match.status === 'live' ? 'AO VIVO' : match.status.toUpperCase()}
          </span>
        </div>

        <div className="mb-4 flex items-center justify-between text-xs uppercase text-ink-100">
          <span className="font-display text-2xl font-bold text-white">{match.homeParticipant.name}</span>
          <span className="font-display text-2xl font-bold text-white">{match.awayParticipant.name}</span>
        </div>

        <div className="rounded-3xl border border-ink-800 bg-gradient-to-b from-ink-900/90 to-ink-950/95 p-10 shadow-glow backdrop-blur">
          <PublicScoreboard
            token={params.token}
            initial={{
              homeScore: match.homeScore,
              awayScore: match.awayScore,
              timerSeconds: match.timerSeconds,
              timerRunning: match.timerRunning,
            }}
          />
        </div>

        <p className="mt-8 text-xs uppercase tracking-widest text-ink-100">Powered by SportFlow · sportflow.com.br</p>
      </div>
    </main>
  );
}
