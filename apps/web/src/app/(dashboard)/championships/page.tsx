'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useChampionships } from '@/hooks/useChampionships';
import { SPORT_LABEL, type SportKey } from '@/lib/constants';

export default function ChampionshipsPage() {
  const [q, setQ] = useState('');
  const [sport, setSport] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const { data, isLoading, error } = useChampionships({
    q: q || undefined,
    sport: sport || undefined,
    status: status || undefined,
  });

  const items = data?.items ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-ink-800">
        <Image
          src="/imagens/v2/geral/campeonatos-cards.png"
          alt=""
          width={1200}
          height={400}
          className="h-40 w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/70 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-between p-8">
          <div>
            <h1 className="font-display text-3xl font-black">Campeonatos</h1>
            <p className="text-sm text-ink-100">Todos os torneios que voce criou.</p>
          </div>
          <Link href="/championships/new" className="btn-accent">
            + Novo campeonato
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          className="input-base flex-1 min-w-[200px]"
          placeholder="Buscar por nome..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="input-base" value={sport} onChange={(e) => setSport(e.target.value)}>
          <option value="">Todos os esportes</option>
          <option value="futebol">Futebol</option>
          <option value="volei">Volei</option>
          <option value="tenis">Tenis</option>
          <option value="skate">Skate</option>
        </select>
        <select className="input-base" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos os status</option>
          <option value="draft">Rascunho</option>
          <option value="active">Ativo</option>
          <option value="finished">Finalizado</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-800">
        {isLoading ? (
          <SkeletonRows />
        ) : error ? (
          <ErrorState />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-ink-900 text-left text-xs uppercase tracking-wide text-ink-100">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Esporte</th>
                <th className="px-4 py-3">Participantes</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800 bg-ink-950">
              {items.map((c) => (
                <tr key={c.id} className="hover:bg-ink-900/60">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-ink-100">{SPORT_LABEL[c.sportType as SportKey] ?? c.sportType}</td>
                  <td className="px-4 py-3 text-ink-100">{c.participantsCount}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`badge ${
                        c.status === 'active'
                          ? 'animate-pulseGlow bg-accent-500 text-white'
                          : c.status === 'finished'
                            ? 'bg-success/20 text-success'
                            : 'bg-ink-800 text-ink-100'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/championships/${c.id}`} className="btn-ghost text-xs">
                      Abrir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="animate-pulse divide-y divide-ink-800">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <div className="h-4 flex-1 rounded bg-ink-800" />
          <div className="h-4 w-20 rounded bg-ink-800" />
          <div className="h-4 w-16 rounded bg-ink-800" />
          <div className="h-4 w-24 rounded bg-ink-800" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="grid place-items-center p-12 text-center">
      <p className="text-4xl">🏆</p>
      <h3 className="mt-3 font-display text-xl font-bold">Nenhum campeonato ainda</h3>
      <p className="mt-1 text-sm text-ink-100">Comece criando seu primeiro torneio.</p>
      <Link href="/championships/new" className="btn-accent mt-4">
        + Criar campeonato
      </Link>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="grid place-items-center p-12 text-center">
      <p className="text-4xl">⚠️</p>
      <h3 className="mt-3 font-display text-xl font-bold">Nao conseguimos carregar</h3>
      <p className="mt-1 text-sm text-ink-100">
        Verifique se voce esta logado. Se o problema persistir, tente novamente.
      </p>
    </div>
  );
}
