'use client';

import Link from 'next/link';
import { useChampionship } from '@/hooks/useChampionships';
import { SPORT_LABEL, type SportKey } from '@/lib/constants';

export default function ChampionshipDetailPage({ params }: { params: { id: string } }) {
  const { data, isLoading, error } = useChampionship(params.id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse space-y-4">
        <div className="h-8 w-64 rounded bg-ink-800" />
        <div className="h-4 w-96 rounded bg-ink-800" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-ink-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="card text-center">
          <p className="text-4xl">🚫</p>
          <h3 className="mt-3 font-display text-xl font-bold">Campeonato nao encontrado</h3>
          <p className="mt-1 text-sm text-ink-100">Pode ter sido excluido ou voce nao tem acesso.</p>
          <Link href="/championships" className="btn-primary mt-4 text-xs">
            Voltar para a lista
          </Link>
        </div>
      </div>
    );
  }

  const c = data;

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
          <Link href={`/championships/${params.id}/matches/demo-match`} className="btn-primary">
            Abrir placar
          </Link>
          <Link href={`/championships/${params.id}/financial`} className="btn-ghost">
            Financeiro
          </Link>
          <Link href={`/championships/${params.id}/export`} className="btn-ghost">
            Exportar
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Participantes" value={String(c.participantsCount ?? 0)} />
        <StatCard label="Jogos" value={String(c.matchesCount ?? 0)} />
        <StatCard label="Status" value={c.status} tone="brand" />
        <StatCard label="Esporte" value={SPORT_LABEL[c.sportType as SportKey] ?? c.sportType} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="font-display text-lg font-bold">Configuracao</h2>
          <pre className="mt-3 rounded-xl bg-ink-950 p-4 font-mono text-xs text-ink-100">
            {JSON.stringify(c.rulesConfig ?? {}, null, 2)}
          </pre>
        </div>
        <div className="card">
          <h2 className="font-display text-lg font-bold">Proximos passos</h2>
          <ol className="mt-3 space-y-2 text-sm text-ink-100">
            <li>1. Cadastre participantes (aba proxima versao).</li>
            <li>2. Crie jogos entre os participantes.</li>
            <li>3. Abra o painel de placar e comece a marcar.</li>
            <li>4. Copie o link publico e compartilhe com os espectadores.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone?: 'brand' }) {
  const color = tone === 'brand' ? 'text-brand-400' : 'text-white';
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-widest text-ink-100">{label}</p>
      <p className={`mt-2 font-display text-3xl font-black ${color}`}>{value}</p>
    </div>
  );
}
