'use client';

import { useEffect, useState } from 'react';
import { useLiveScore } from '@/hooks/useLiveScore';

interface Props {
  token: string;
  initial: {
    homeScore: number;
    awayScore: number;
    timerSeconds: number;
    timerRunning: boolean;
  };
}

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function PublicScoreboard({ token, initial }: Props) {
  const state = useLiveScore(token, initial);
  const [tick, setTick] = useState(state.timerSeconds);

  // Interpolacao local: incrementa 1s enquanto running
  useEffect(() => {
    setTick(state.timerSeconds);
    if (!state.timerRunning) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [state.timerSeconds, state.timerRunning]);

  return (
    <>
      <div className="grid grid-cols-3 items-center gap-4">
        <div className="text-center">
          <p
            className="font-display font-black leading-none tabular-nums text-white transition-transform"
            style={{ fontSize: 'clamp(6rem, 20vw, 14rem)' }}
          >
            {state.homeScore}
          </p>
        </div>
        <div className="flex flex-col items-center gap-4">
          <span className="font-display text-6xl font-black text-brand-500">×</span>
          <div className="rounded-2xl bg-ink-950/80 px-6 py-2 font-mono text-4xl font-bold tabular-nums text-white">
            {formatTimer(tick)}
          </div>
          <span className={`badge ${state.connected ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
            {state.connected ? 'AO VIVO' : 'reconectando...'}
          </span>
        </div>
        <div className="text-center">
          <p
            className="font-display font-black leading-none tabular-nums text-white transition-transform"
            style={{ fontSize: 'clamp(6rem, 20vw, 14rem)' }}
          >
            {state.awayScore}
          </p>
        </div>
      </div>
    </>
  );
}
