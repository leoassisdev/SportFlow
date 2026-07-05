'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { financialService, type CreateTransactionInput } from '@/services/financial.service';
import { asApiError } from '@/lib/api';

const brl = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);

export default function FinancialPage({ params }: { params: { id: string } }) {
  const qc = useQueryClient();
  const summary = useQuery({
    queryKey: ['financial', 'summary', params.id],
    queryFn: () => financialService.summary(params.id),
  });
  const list = useQuery({
    queryKey: ['financial', 'list', params.id],
    queryFn: () => financialService.list(params.id),
  });
  const create = useMutation({
    mutationFn: (input: CreateTransactionInput) => financialService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['financial'] }),
  });
  const remove = useMutation({
    mutationFn: financialService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['financial'] }),
  });

  const [showModal, setShowModal] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: 'income' as 'income' | 'expense',
    category: '',
    amount: '',
    description: '',
    sponsorName: '',
    transactionDate: new Date().toISOString().slice(0, 10),
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      await create.mutateAsync({
        championshipId: params.id,
        type: form.type,
        category: form.category,
        amount: Number(form.amount),
        description: form.description || undefined,
        sponsorName: form.sponsorName || undefined,
        transactionDate: form.transactionDate,
      });
      setShowModal(false);
      setForm({ ...form, category: '', amount: '', description: '', sponsorName: '' });
    } catch (e) {
      setErr(asApiError(e).message);
    }
  };

  const previewErr = summary.error as { response?: { data?: { error?: { code?: string } } } } | null;
  const isPreviewBlocked = previewErr?.response?.data?.error?.code === 'PREVIEW_LIMITED';

  if (isPreviewBlocked) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="card text-center">
          <p className="text-4xl">🔒</p>
          <h2 className="mt-3 font-display text-2xl font-bold">Financeiro bloqueado no modo preview</h2>
          <p className="mt-2 text-sm text-ink-100">
            Ative a licença completa para desbloquear controle financeiro, exportação e mais.
          </p>
        </div>
      </div>
    );
  }

  const s = summary.data;
  const items = list.data ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-ink-800">
        <Image src="/imagens/v2/geral/financeiro-sponsor.png" alt="" width={1200} height={400} className="h-40 w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/70 to-transparent" />
        <div className="absolute inset-0 flex items-end justify-between p-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink-100">Financeiro do campeonato</p>
            <h1 className="font-display text-3xl font-black">Controle de receitas e despesas</h1>
          </div>
          <button className="btn-accent" onClick={() => setShowModal(true)}>+ Nova transação</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Receita" value={brl(s?.income ?? 0)} tone="success" />
        <StatCard label="Despesa" value={brl(s?.expense ?? 0)} tone="danger" />
        <StatCard label="Saldo" value={brl(s?.balance ?? 0)} tone={(s?.balance ?? 0) >= 0 ? 'success' : 'danger'} />
        <StatCard label="Patrocinadores" value={String(s?.sponsors?.length ?? 0)} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-800">
        {list.isLoading ? (
          <div className="animate-pulse p-4">
            {[...Array(4)].map((_, i) => <div key={i} className="my-2 h-4 rounded bg-ink-800" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="grid place-items-center p-12 text-center">
            <p className="text-4xl">💸</p>
            <p className="mt-3 font-display text-lg font-bold">Nenhuma transação registrada</p>
            <button className="btn-primary mt-4 text-xs" onClick={() => setShowModal(true)}>Registrar a primeira</button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-ink-900 text-left text-xs uppercase text-ink-100">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800 bg-ink-950">
              {items.map((t) => (
                <tr key={t.id} className="hover:bg-ink-900/60">
                  <td className="px-4 py-3 text-ink-100">{new Date(t.transactionDate).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3">
                    {t.category}
                    {t.sponsorName ? <span className="ml-2 text-xs text-brand-400">({t.sponsorName})</span> : null}
                  </td>
                  <td className="px-4 py-3 text-ink-100">{t.description ?? '—'}</td>
                  <td className={`px-4 py-3 text-right font-mono font-bold ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                    {t.type === 'income' ? '+' : '-'} {brl(Number(t.amount))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs text-danger hover:text-danger/80" onClick={() => remove.mutate(t.id)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/80 p-6 backdrop-blur">
          <div className="w-full max-w-md">
            <form onSubmit={submit} className="card space-y-3">
              <h2 className="font-display text-xl font-bold">Nova transação</h2>
              <div className="grid grid-cols-2 gap-3">
                <select className="input-base" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'income' | 'expense' })}>
                  <option value="income">Receita</option>
                  <option value="expense">Despesa</option>
                </select>
                <input className="input-base" placeholder="Valor" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <input className="input-base" placeholder="Categoria (ex: Inscrição, Patrocínio)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
              <input className="input-base" placeholder="Descrição (opcional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              {form.type === 'income' ? (
                <input className="input-base" placeholder="Patrocinador (opcional)" value={form.sponsorName} onChange={(e) => setForm({ ...form, sponsorName: e.target.value })} />
              ) : null}
              <input className="input-base" type="date" value={form.transactionDate} onChange={(e) => setForm({ ...form, transactionDate: e.target.value })} required />
              {err ? <p className="text-sm text-danger">{err}</p> : null}
              <div className="flex justify-end gap-2">
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-accent" disabled={create.isPending}>
                  {create.isPending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone?: 'success' | 'danger' }) {
  const color = tone === 'success' ? 'text-success' : tone === 'danger' ? 'text-danger' : 'text-white';
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-widest text-ink-100">{label}</p>
      <p className={`mt-2 font-display text-3xl font-black ${color}`}>{value}</p>
    </div>
  );
}
