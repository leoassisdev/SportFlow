'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useChampionship } from '@/hooks/useChampionships';
import { SPORT_LABEL, type SportKey } from '@/lib/constants';
import { participantService } from '@/services/participant.service';
import { matchService } from '@/services/match.service';
import { asApiError } from '@/lib/api';

export default function ChampionshipDetailPage({ params }: { params: { id: string } }) {
  const qc = useQueryClient();
  const { data, isLoading, error } = useChampionship(params.id);
  const participants = useQuery({
    queryKey: ['participants', params.id],
    queryFn: () => participantService.list(params.id),
  });
  const matches = useQuery({
    queryKey: ['matches', params.id],
    queryFn: () => matchService.list(params.id),
  });
  const createMatch = useMutation({
    mutationFn: matchService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['matches', params.id] }),
  });

  const [showModal, setShowModal] = useState(false);
  const [home, setHome] = useState('');
  const [away, setAway] = useState('');
  const [when, setWhen] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const submitMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      const created = await createMatch.mutateAsync({
        championshipId: params.id,
        homeParticipantId: home,
        awayParticipantId: away,
        scheduledAt: when || undefined,
      });
      setShowModal(false);
      setHome('');
      setAway('');
      setWhen('');
      window.location.href = `/championships/${params.id}/matches/${created.id}`;
    } catch (e) {
      setErr(asApiError(e).message);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse space-y-4">
        <div className="h-8 w-64 rounded bg-ink-800" />
        <div className="h-4 w-96 rounded bg-ink-800" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="card text-center">
          <p className="text-4xl">🚫</p>
          <h3 className="mt-3 font-display text-xl font-bold">Campeonato não encontrado</h3>
          <Link href="/championships" className="btn-primary mt-4 text-xs">
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  const c = data;
  const partList = participants.data ?? [];
  const matchList = matches.data ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-100">Campeonato</p>
          <h1 className="font-display text-3xl font-black">{c.name}</h1>
          <p className="text-sm text-ink-100">
            {SPORT_LABEL[c.sportType as SportKey] ?? c.sportType}
            {c.startDate ? ` · ${new Date(c.startDate).toLocaleDateString('pt-BR')}` : ''}
            {c.endDate ? ` → ${new Date(c.endDate).toLocaleDateString('pt-BR')}` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/championships/${params.id}/participants`} className="btn-ghost text-xs">
            Participantes
          </Link>
          <Link href={`/championships/${params.id}/financial`} className="btn-ghost text-xs">
            Financeiro
          </Link>
          <Link href={`/championships/${params.id}/export`} className="btn-ghost text-xs">
            Exportar
          </Link>
          <button className="btn-accent text-xs" onClick={() => setShowModal(true)} disabled={partList.length < 2}>
            + Novo jogo
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Participantes" value={String(partList.length)} />
        <StatCard label="Jogos" value={String(matchList.length)} />
        <StatCard label="Ao vivo" value={String(matchList.filter((m) => m.status === 'live').length)} tone="accent" />
        <StatCard label="Status" value={c.status} tone="brand" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Participantes</h2>
            <Link href={`/championships/${params.id}/participants`} className="text-xs text-brand-400 hover:text-brand-300">
              Gerenciar →
            </Link>
          </div>
          {partList.length === 0 ? (
            <div className="grid place-items-center py-6 text-center">
              <p className="text-3xl">🧑‍🤝‍🧑</p>
              <p className="mt-2 text-sm text-ink-100">Nenhum participante ainda.</p>
              <Link href={`/championships/${params.id}/participants`} className="btn-primary mt-3 text-xs">
                Adicionar
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-ink-800 text-sm">
              {partList.slice(0, 8).map((p, i) => (
                <li key={p.id} className="flex items-center gap-3 py-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-500/10 text-xs font-bold text-brand-400">
                    {i + 1}
                  </span>
                  <span>{p.name}</span>
                  {p.category ? <span className="ml-auto text-xs text-ink-100">{p.category}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2 className="font-display text-lg font-bold">Jogos</h2>
          {matchList.length === 0 ? (
            <div className="grid place-items-center py-6 text-center">
              <p className="text-3xl">🏟️</p>
              <p className="mt-2 text-sm text-ink-100">Nenhum jogo criado.</p>
              <button
                className="btn-primary mt-3 text-xs"
                onClick={() => setShowModal(true)}
                disabled={partList.length < 2}
              >
                {partList.length < 2 ? 'Precisa 2+ participantes' : 'Criar primeiro jogo'}
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-ink-800 text-sm">
              {matchList.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">
                      {m.homeParticipant.name} <span className="text-ink-100">{m.homeScore} × {m.awayScore}</span>{' '}
                      {m.awayParticipant.name}
                    </p>
                    <p className="text-xs text-ink-100">
                      {m.scheduledAt ? new Date(m.scheduledAt).toLocaleString('pt-BR') : 'sem data'}
                    </p>
                  </div>
                  <Link
                    href={`/championships/${params.id}/matches/${m.id}`}
                    className={m.status === 'live' ? 'btn-accent text-xs' : 'btn-ghost text-xs'}
                  >
                    {m.status === 'live' ? 'AO VIVO' : 'Abrir'}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/80 p-6 backdrop-blur">
          <div className="w-full max-w-md">
            <form onSubmit={submitMatch} className="card space-y-3">
              <h2 className="font-display text-xl font-bold">Novo jogo</h2>
              <select className="input-base" value={home} onChange={(e) => setHome(e.target.value)} required>
                <option value="">Casa...</option>
                {partList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select className="input-base" value={away} onChange={(e) => setAway(e.target.value)} required>
                <option value="">Fora...</option>
                {partList
                  .filter((p) => p.id !== home)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
              <input
                className="input-base"
                type="datetime-local"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                placeholder="Data (opcional)"
              />
              {err ? <p className="text-sm text-danger">{err}</p> : null}
              <div className="flex justify-end gap-2">
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-accent" disabled={createMatch.isPending}>
                  {createMatch.isPending ? 'Criando...' : 'Criar jogo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone?: 'brand' | 'accent' }) {
  const color = tone === 'accent' ? 'text-accent-400' : tone === 'brand' ? 'text-brand-400' : 'text-white';
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-widest text-ink-100">{label}</p>
      <p className={`mt-2 font-display text-3xl font-black ${color}`}>{value}</p>
    </div>
  );
}
