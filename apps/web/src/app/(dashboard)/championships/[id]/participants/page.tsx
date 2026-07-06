'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { participantService } from '@/services/participant.service';
import { asApiError } from '@/lib/api';

export default function ParticipantsPage({ params }: { params: { id: string } }) {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ['participants', params.id],
    queryFn: () => participantService.list(params.id),
  });
  const create = useMutation({
    mutationFn: participantService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['participants', params.id] }),
  });
  const remove = useMutation({
    mutationFn: participantService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['participants', params.id] }),
  });

  const [form, setForm] = useState({ name: '', category: '' });
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      await create.mutateAsync({
        championshipId: params.id,
        name: form.name,
        category: form.category || undefined,
      });
      setForm({ name: '', category: '' });
    } catch (e) {
      setErr(asApiError(e).message);
    }
  };

  const items = list.data ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-100">Campeonato</p>
          <h1 className="font-display text-3xl font-black">Participantes</h1>
        </div>
        <Link href={`/championships/${params.id}`} className="btn-ghost text-xs">
          ← Voltar ao campeonato
        </Link>
      </div>

      <form onSubmit={submit} className="card space-y-3">
        <h2 className="font-display text-lg font-bold">Adicionar participante</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="input-base"
            placeholder="Nome (time / atleta)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="input-base"
            placeholder="Categoria (opcional)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </div>
        {err ? <p className="text-sm text-danger">{err}</p> : null}
        <button className="btn-accent" type="submit" disabled={create.isPending}>
          {create.isPending ? 'Adicionando...' : '+ Adicionar'}
        </button>
      </form>

      <div className="card">
        <h2 className="font-display text-lg font-bold">Participantes ({items.length})</h2>
        {list.isLoading ? (
          <div className="animate-pulse mt-3 space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-6 rounded bg-ink-800" />)}
          </div>
        ) : items.length === 0 ? (
          <p className="mt-3 text-sm text-ink-100">
            Nenhum participante ainda. Adicione o primeiro no formulário acima.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-ink-800">
            {items.map((p, i) => (
              <li key={p.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-500/10 text-xs font-bold text-brand-400">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium">{p.name}</p>
                    {p.category ? <p className="text-xs text-ink-100">{p.category}</p> : null}
                  </div>
                </div>
                <button
                  className="text-xs text-danger hover:text-danger/80"
                  onClick={() => remove.mutate(p.id)}
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
