'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useChampionships } from '@/hooks/useChampionships';
import { SPORT_LABEL, type SportKey } from '@/lib/constants';

export default function DashboardPage() {
  const { data } = useChampionships({ page: 1 });
  const championships = data?.items ?? [];
  const total = data?.meta?.total ?? 0;
  const active = championships.filter((c) => c.status === 'active').length;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
        <b>Modo preview.</b> Voce pode criar 1 campeonato com ate 3 participantes.{' '}
        <Link href="/settings" className="underline">
          Ative a licenca completa
        </Link>{' '}
        para desbloquear financeiro, exportacao e mais participantes.
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-ink-800 bg-ink-900">
        <Image src="/imagens/v2/geral/dashboard-cards.png" alt="" fill className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/50 to-transparent" />
        <div className="relative flex items-end justify-between p-8">
          <div>
            <h1 className="font-display text-3xl font-black">Bem-vindo de volta</h1>
            <p className="text-sm text-ink-100">O que rola hoje na sua arena.</p>
          </div>
          <Link href="/championships/new" className="btn-accent">
            + Criar campeonato
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPI label="Total de campeonatos" value={total.toString()} tone="brand" hint={`${active} ativos`} />
        <KPI label="Campeonatos ativos" value={active.toString()} tone="accent" hint="AO VIVO" />
        <KPI label="Saldo (pendente)" value="—" tone="success" hint="Ative licenca para financeiro" />
        <KPI label="Placares publicos" value="—" tone="brand" hint="Requer licenca ativa" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Campeonatos recentes</h2>
            <Link href="/championships" className="text-xs text-brand-400 hover:text-brand-300">
              Ver todos →
            </Link>
          </div>
          {championships.length === 0 ? (
            <div className="grid place-items-center py-8 text-center">
              <p className="text-4xl">🏆</p>
              <p className="mt-3 font-display text-lg font-bold">Nenhum campeonato ainda</p>
              <p className="mt-1 text-xs text-ink-100">Comece pelo primeiro.</p>
              <Link href="/championships/new" className="btn-primary mt-4 text-xs">
                Criar
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-ink-800">
              {championships.slice(0, 5).map((c) => (
                <li key={c.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-ink-100">
                      {SPORT_LABEL[c.sportType as SportKey] ?? c.sportType} · {c.participantsCount} participantes
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`badge ${
                        c.status === 'active'
                          ? 'animate-pulseGlow bg-accent-500 text-white'
                          : 'bg-ink-800 text-ink-100'
                      }`}
                    >
                      {c.status}
                    </span>
                    <Link href={`/championships/${c.id}`} className="btn-ghost text-xs">
                      Abrir
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h2 className="font-display text-xl font-bold">Dica rapida</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-100">
            <li>1. Crie um campeonato pelo botao acima.</li>
            <li>2. Cadastre participantes (max 3 no preview).</li>
            <li>3. Abra o placar admin e compartilhe o link publico.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, tone, hint }: { label: string; value: string; tone: 'brand' | 'accent' | 'success'; hint?: string }) {
  const color = tone === 'accent' ? 'text-accent-400' : tone === 'success' ? 'text-success' : 'text-brand-400';
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-widest text-ink-100">{label}</p>
      <p className={`mt-2 font-display text-4xl font-black ${color}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-100">{hint}</p> : null}
    </div>
  );
}
