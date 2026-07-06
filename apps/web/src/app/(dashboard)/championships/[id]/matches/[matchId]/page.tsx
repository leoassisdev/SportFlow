'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  useFinishMatch,
  useMatchDetail,
  useMatchHistory,
  useMatchLiveState,
  useUndoLast,
  useUpdateScore,
  useUpdateTimer,
} from '@/hooks/useMatchAdmin';
import { asApiError } from '@/lib/api';

const fmtTimer = (s: number) => {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
};

export default function MatchAdminPage({ params }: { params: { id: string; matchId: string } }) {
  const { data: match, isLoading, error } = useMatchDetail(params.matchId);
  const live = useMatchLiveState(match);
  const updateScore = useUpdateScore(params.matchId);
  const updateTimer = useUpdateTimer(params.matchId);
  const undo = useUndoLast(params.matchId);
  const finish = useFinishMatch(params.matchId);
  const history = useMatchHistory(params.matchId);
  const [err, setErr] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!live) return;
    setTick(live.timerSeconds);
    if (!live.timerRunning) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [live?.timerSeconds, live?.timerRunning]);

  const doScore = (participantId: string, delta: number) => {
    setErr(null);
    updateScore.mutate({ participantId, delta }, { onError: (e) => setErr(asApiError(e).message) });
  };

  const doTimer = (action: 'start' | 'pause' | 'reset') => {
    setErr(null);
    updateTimer.mutate(action, { onError: (e) => setErr(asApiError(e).message) });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl animate-pulse space-y-4">
        <div className="h-8 w-64 rounded bg-ink-800" />
        <div className="h-72 rounded-3xl bg-ink-800" />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="card text-center">
          <p className="text-4xl">🚫</p>
          <h3 className="mt-3 font-display text-xl font-bold">Jogo não encontrado</h3>
          <Link href={`/championships/${params.id}`} className="btn-primary mt-4 text-xs">
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  const homeScore = live?.homeScore ?? match.homeScore;
  const awayScore = live?.awayScore ?? match.awayScore;
  const timerRunning = live?.timerRunning ?? match.timerRunning;
  const timerSeconds = tick || live?.timerSeconds || match.timerSeconds;
  const isConnected = live?.connected ?? false;

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/live/${match.liveToken}`
    : `/live/${match.liveToken}`;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-100">
            {match.championship.name} · {match.championship.sportType}
          </p>
          <h1 className="font-display text-3xl font-black">Painel do placar</h1>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-ghost text-xs"
            onClick={() => navigator.clipboard.writeText(shareUrl)}
            title="Copiar link público"
          >
            📋 Link público
          </button>
          <Link href={`/live/${match.liveToken}`} target="_blank" className="btn-ghost text-xs">
            Abrir placar público ↗
          </Link>
          <Link href={`/championships/${params.id}`} className="btn-ghost text-xs">
            Voltar
          </Link>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-ink-800 bg-gradient-to-b from-ink-900 to-ink-950 p-8 shadow-glow">
        <Image src="/imagens/v2/geral/placar-live.png" alt="" fill className="object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/60 via-ink-950/40 to-ink-950/80" />
        <div className="absolute inset-0 bg-grid-glow opacity-70" />
        <div className="relative">
          <div className="mb-6 flex items-center justify-between">
            <span className={`badge ${match.status === 'live' ? 'animate-pulseGlow bg-accent-500 text-white' : 'bg-ink-800 text-ink-100'}`}>
              {match.status === 'live' ? 'AO VIVO' : match.status.toUpperCase()}
            </span>
            <div className="rounded-xl bg-ink-950/70 px-4 py-1.5 font-mono text-2xl font-bold tabular-nums text-white">
              {fmtTimer(timerSeconds)}
            </div>
            <span className={`badge ${isConnected ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
              {isConnected ? '● conectado' : '○ desconectado'}
            </span>
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <ScoreColumn
              name={match.homeParticipant.name}
              score={homeScore}
              onPlus={() => doScore(match.homeParticipant.id, +1)}
              onMinus={() => doScore(match.homeParticipant.id, -1)}
              busy={updateScore.isPending}
            />
            <div className="text-center font-display text-6xl font-black text-brand-500">×</div>
            <ScoreColumn
              name={match.awayParticipant.name}
              score={awayScore}
              onPlus={() => doScore(match.awayParticipant.id, +1)}
              onMinus={() => doScore(match.awayParticipant.id, -1)}
              busy={updateScore.isPending}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="card">
          <h2 className="font-display text-lg font-bold">Timer</h2>
          <div className="mt-3 flex items-center gap-2">
            <button
              className="btn-primary"
              onClick={() => doTimer(timerRunning ? 'pause' : 'start')}
              disabled={updateTimer.isPending || match.status === 'finished'}
            >
              {timerRunning ? '⏸ Pausar' : '▶ Iniciar'}
            </button>
            <button
              className="btn-ghost"
              onClick={() => doTimer('reset')}
              disabled={updateTimer.isPending || match.status === 'finished'}
            >
              ↺ Reset
            </button>
          </div>
          <p className="mt-3 text-xs text-ink-100">
            Timer server-authoritative. O tempo local é apenas interpolação visual.
          </p>
        </div>
        <div className="card">
          <h2 className="font-display text-lg font-bold">Ações do jogo</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              className="btn-ghost"
              onClick={() => undo.mutate()}
              disabled={undo.isPending || match.status === 'finished'}
              title="Desfaz o último lançamento de placar"
            >
              ↶ Desfazer último
            </button>
            <button
              className="btn-accent"
              onClick={() => {
                if (confirm('Encerrar este jogo? Após finalizar, o placar fica congelado.')) {
                  finish.mutate();
                }
              }}
              disabled={finish.isPending || match.status === 'finished'}
            >
              🏁 Finalizar jogo
            </button>
          </div>
          {match.status === 'finished' ? (
            <p className="mt-3 text-xs text-success">Jogo finalizado. Placar congelado.</p>
          ) : null}
        </div>
      </div>

      <div className="card">
        <h2 className="font-display text-lg font-bold">Histórico de lançamentos</h2>
        {history.isLoading ? (
          <p className="mt-3 text-xs text-ink-100">Carregando…</p>
        ) : (history.data ?? []).length === 0 ? (
          <p className="mt-3 text-xs text-ink-100">Nenhum lançamento ainda.</p>
        ) : (
          <ul className="mt-3 max-h-64 divide-y divide-ink-800 overflow-y-auto text-sm">
            {(history.data ?? []).map((h) => (
              <li key={h.id} className="flex items-center justify-between py-2">
                <div>
                  <span className="font-medium">{h.participant.name}</span>{' '}
                  <span className={h.delta >= 0 ? 'text-success' : 'text-warning'}>
                    {h.delta >= 0 ? `+${h.delta}` : h.delta}
                  </span>
                </div>
                <span className="font-mono text-xs text-ink-100">
                  {new Date(h.createdAt).toLocaleTimeString('pt-BR')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h2 className="font-display text-lg font-bold">Compartilhamento</h2>
        <p className="mt-2 text-xs text-ink-100">Envie este link para os espectadores:</p>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-ink-800 bg-ink-950 p-2">
          <code className="flex-1 truncate font-mono text-xs text-brand-300">{shareUrl}</code>
          <button className="btn-primary text-xs" onClick={() => navigator.clipboard.writeText(shareUrl)}>
            Copiar
          </button>
        </div>
      </div>

      {err ? <div className="card text-sm text-danger">{err}</div> : null}
    </div>
  );
}

function ScoreColumn({
  name,
  score,
  onPlus,
  onMinus,
  busy,
}: {
  name: string;
  score: number;
  onPlus: () => void;
  onMinus: () => void;
  busy: boolean;
}) {
  return (
    <div className="text-center">
      <p className="mb-3 font-display text-2xl font-bold uppercase tracking-wide">{name}</p>
      <p className="font-display text-[8rem] font-black leading-none tabular-nums">{score}</p>
      <div className="mt-4 flex justify-center gap-2">
        <button className="btn-primary" onClick={onPlus} disabled={busy}>
          +1
        </button>
        <button className="btn-ghost" onClick={onMinus} disabled={busy}>
          -1
        </button>
      </div>
    </div>
  );
}
