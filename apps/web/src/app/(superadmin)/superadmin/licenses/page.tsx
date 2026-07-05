'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { superadminService } from '@/services/superadmin.service';
import { asApiError } from '@/lib/api';

const brl = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);

export default function LicensesPage() {
  const qc = useQueryClient();
  const tenants = useQuery({
    queryKey: ['super', 'tenants', 'for-license'],
    queryFn: () => superadminService.listTenants({ page: 1 }),
  });
  const create = useMutation({
    mutationFn: superadminService.createLicense,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['super'] }),
  });

  const [form, setForm] = useState({ tenantId: '', durationDays: 30, priceBrl: 500 });
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ checkoutUrl: string | null } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setResult(null);
    try {
      const r = await create.mutateAsync(form);
      setResult({ checkoutUrl: (r as { checkoutUrl?: string | null }).checkoutUrl ?? null });
    } catch (e) {
      setErr(asApiError(e).message);
    }
  };

  const tenantsList = tenants.data ?? [];
  const allLicenses = tenantsList.flatMap((t) =>
    (t.licenses ?? []).map((l) => ({ ...l, tenantName: t.name, tenantId: t.id })),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-black">Licenças</h1>
      </div>

      <div className="card space-y-3">
        <h2 className="font-display text-lg font-bold">Emitir licença</h2>
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-4">
          <select className="input-base md:col-span-2" value={form.tenantId} onChange={(e) => setForm({ ...form, tenantId: e.target.value })} required>
            <option value="">Selecione o tenant...</option>
            {tenantsList.map((t) => (
              <option key={t.id} value={t.id}>{t.name} ({t.status})</option>
            ))}
          </select>
          <input className="input-base" placeholder="Dias" type="number" min={1} value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })} required />
          <input className="input-base" placeholder="Preço BRL" type="number" step="0.01" value={form.priceBrl} onChange={(e) => setForm({ ...form, priceBrl: Number(e.target.value) })} required />
          <button type="submit" className="btn-accent md:col-span-4" disabled={create.isPending}>
            {create.isPending ? 'Gerando...' : 'Gerar licença + link Stripe'}
          </button>
        </form>
        {err ? <p className="text-sm text-danger">{err}</p> : null}
        {result ? (
          <div className="rounded-xl border border-success/40 bg-success/10 p-3 text-sm text-success">
            Licença criada.
            {result.checkoutUrl ? (
              <>
                {' '}Link Stripe:{' '}
                <a href={result.checkoutUrl} target="_blank" className="underline" rel="noopener">
                  copiar
                </a>
              </>
            ) : (
              <> Stripe não configurado — envie link manualmente ao lead.</>
            )}
          </div>
        ) : null}
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-bold">Licenças existentes</h2>
        <div className="overflow-hidden rounded-2xl border border-ink-800">
          {tenants.isLoading ? (
            <div className="animate-pulse p-4">
              {[...Array(3)].map((_, i) => <div key={i} className="my-2 h-4 rounded bg-ink-800" />)}
            </div>
          ) : allLicenses.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink-100">Nenhuma licença emitida ainda.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-ink-900 text-left text-xs uppercase text-ink-100">
                <tr>
                  <th className="px-4 py-3">Tenant</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Expira</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800 bg-ink-950">
                {allLicenses.map((l) => (
                  <tr key={l.id}>
                    <td className="px-4 py-3 font-medium">{l.tenantName}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${l.status === 'active' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>{l.status}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-100">
                      {l.expiresAt ? new Date(l.expiresAt).toLocaleDateString('pt-BR') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
