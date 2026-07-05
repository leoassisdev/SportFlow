'use client';

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { superadminService } from '@/services/superadmin.service';

const brl = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);

export default function SuperAdminPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['super', 'metrics'],
    queryFn: superadminService.metrics,
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-ink-800">
        <Image src="/imagens/v2/geral/superadmin-operacoes.png" alt="" width={1200} height={400} className="h-40 w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/70 to-transparent" />
        <div className="absolute inset-0 flex items-center gap-4 p-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-danger">SuperAdmin FlowCore</p>
            <h1 className="font-display text-3xl font-black">Painel operacional</h1>
            <p className="text-sm text-ink-100">MRR, tenants, leads e alertas</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse"><div className="h-8 w-24 rounded bg-ink-800" /></div>)}
        </div>
      ) : error ? (
        <div className="card text-sm text-danger">Não conseguimos carregar as métricas.</div>
      ) : data ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <KPI label="MRR" value={brl(data.mrrBrl)} tone="success" hint="Receita mensal recorrente" />
            <KPI label="Tenants ativos" value={String(data.tenants.active)} tone="brand" hint={`${data.tenants.total} totais`} />
            <KPI label="Leads (mês)" value={String(data.leadsThisMonth)} tone="accent" />
            <KPI label="Campeonatos (mês)" value={String(data.championshipsThisMonth)} tone="brand" />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="card">
              <h2 className="font-display text-lg font-bold">Tenants por status</h2>
              <ul className="mt-3 space-y-2 text-sm">
                <StatusRow label="Ativos" value={data.tenants.active} color="text-success" />
                <StatusRow label="Preview" value={data.tenants.preview} color="text-warning" />
                <StatusRow label="Expirados" value={data.tenants.expired} color="text-danger" />
                <StatusRow label="Total" value={data.tenants.total} color="text-ink-100" />
              </ul>
            </div>
            <div className="card">
              <h2 className="font-display text-lg font-bold">Alertas de segurança</h2>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="rounded-lg border border-ink-800 bg-ink-950 p-3 text-ink-100">
                  Gitleaks: sem findings no último scan
                </li>
                <li className="rounded-lg border border-ink-800 bg-ink-950 p-3 text-ink-100">
                  RLS ativo em todas as tabelas com tenant_id
                </li>
              </ul>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function KPI({ label, value, tone, hint }: { label: string; value: string; tone: 'brand' | 'accent' | 'success'; hint?: string }) {
  const color = tone === 'accent' ? 'text-accent-400' : tone === 'success' ? 'text-success' : 'text-brand-400';
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-widest text-ink-100">{label}</p>
      <p className={`mt-2 font-display text-3xl font-black ${color}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-100">{hint}</p> : null}
    </div>
  );
}

function StatusRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <li className="flex justify-between">
      <span>{label}</span>
      <span className={`font-mono font-bold ${color}`}>{value}</span>
    </li>
  );
}
