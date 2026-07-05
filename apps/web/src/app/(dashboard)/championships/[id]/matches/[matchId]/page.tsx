'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function MatchAdminPage({ params }: { params: { id: string; matchId: string } }) {
  const [home, setHome] = useState(3);
  const [away, setAway] = useState(1);
  const [timer, setTimer] = useState('42:18');
  const [running, setRunning] = useState(true);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-100">
            Interbairros 2026 · Semifinal
          </p>
          <h1 className="font-display text-3xl font-black">Painel do placar</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/live/demo-token" target="_blank" className="btn-ghost text-xs">
            Abrir placar público ↗
          </Link>
          <Link href={`/championships/${params.id}`} className="btn-ghost text-xs">
            Voltar
          </Link>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-ink-800 bg-gradient-to-b from-ink-900 to-ink-950 p-8 shadow-glow">
        <Image
          src="/imagens/v2/geral/placar-live.png"
          alt=""
          fill
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/60 via-ink-950/40 to-ink-950/80" />
        <div className="absolute inset-0 bg-grid-glow opacity-70" />
        <div className="relative">
          <div className="mb-6 flex items-center justify-between">
            <span className="badge animate-pulseGlow bg-accent-500 text-white">AO VIVO</span>
            <div className="rounded-xl bg-ink-950/70 px-4 py-1.5 font-mono text-2xl font-bold tabular-nums text-white">
              {timer}
            </div>
            <span className="text-xs uppercase text-ink-100">Match #{params.matchId}</span>
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <div className="text-center">
              <p className="mb-3 font-display text-2xl font-bold uppercase tracking-wide">
                Bairro Alto
              </p>
              <p className="font-display text-[8rem] font-black leading-none tabular-nums">{home}</p>
              <div className="mt-4 flex justify-center gap-2">
                <button className="btn-primary" onClick={() => setHome((v) => v + 1)}>
                  +1
                </button>
                <button className="btn-ghost" onClick={() => setHome((v) => Math.max(0, v - 1))}>
                  -1
                </button>
              </div>
            </div>
            <div className="text-center font-display text-6xl font-black text-brand-500">×</div>
            <div className="text-center">
              <p className="mb-3 font-display text-2xl font-bold uppercase tracking-wide">
                Vila Norte
              </p>
              <p className="font-display text-[8rem] font-black leading-none tabular-nums">{away}</p>
              <div className="mt-4 flex justify-center gap-2">
                <button className="btn-primary" onClick={() => setAway((v) => v + 1)}>
                  +1
                </button>
                <button className="btn-ghost" onClick={() => setAway((v) => Math.max(0, v - 1))}>
                  -1
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="card">
          <h2 className="font-display text-lg font-bold">Timer</h2>
          <div className="mt-3 flex items-center gap-2">
            <button
              className="btn-primary"
              onClick={() => setRunning((r) => !r)}
              data-testid="timer-toggle"
            >
              {running ? 'Pausar' : 'Retomar'}
            </button>
            <button
              className="btn-ghost"
              onClick={() => setTimer('00:00')}
              data-testid="timer-reset"
            >
              Reset
            </button>
          </div>
          <p className="mt-3 text-xs text-ink-100">
            Timer server-authoritative na implementação real (Fase 3).
          </p>
        </div>
        <div className="card">
          <h2 className="font-display text-lg font-bold">Histórico (mock)</h2>
          <ul className="mt-2 space-y-1 text-sm">
            <li>42:00 - Bairro Alto marca +1</li>
            <li>38:12 - Vila Norte marca +1</li>
            <li>27:44 - Bairro Alto marca +1</li>
            <li>11:32 - Bairro Alto marca +1</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
