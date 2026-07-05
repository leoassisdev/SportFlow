import Image from 'next/image';

const KPIS = [
  { label: 'MRR', value: 'R$ 8.4k', trend: '+18% mes', tone: 'success' as const },
  { label: 'Tenants ativos', value: '17', trend: '3 novos essa semana', tone: 'brand' as const },
  { label: 'Leads (mes)', value: '42', trend: '9 hoje', tone: 'accent' as const },
  { label: 'Campeonatos criados (mes)', value: '31', trend: '+7 vs mes anterior', tone: 'brand' as const },
];

export const metadata = { title: 'SuperAdmin — Métricas' };

export default function SuperAdminPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-ink-800">
        <Image
          src="/imagens/v2/geral/superadmin-operações.png"
          alt=""
          width={1200}
          height={400}
          className="h-40 w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/70 to-transparent" />
        <div className="absolute inset-0 flex items-center gap-4 p-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-danger">SuperAdmin FlowCore</p>
            <h1 className="font-display text-3xl font-black">Painel operacional</h1>
            <p className="text-sm text-ink-100">MRR, tenants, leads e alertas</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {KPIS.map((k) => (
          <div key={k.label} className="card">
            <p className="text-xs uppercase tracking-widest text-ink-100">{k.label}</p>
            <p
              className={`mt-2 font-display text-3xl font-black ${
                k.tone === 'accent'
                  ? 'text-accent-400'
                  : k.tone === 'success'
                    ? 'text-success'
                    : 'text-brand-400'
              }`}
            >
              {k.value}
            </p>
            <p className="mt-1 text-xs text-ink-100">{k.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="font-display text-xl font-bold">Licenças expirando em 7d</h2>
          <ul className="mt-3 divide-y divide-ink-800 text-sm">
            <li className="flex items-center justify-between py-2">
              <span>Liga do Bairro (Demo)</span>
              <span className="badge bg-warning/20 text-warning">expira em 3d</span>
            </li>
            <li className="flex items-center justify-between py-2">
              <span>Skate Contest ZN</span>
              <span className="badge bg-warning/20 text-warning">expira em 6d</span>
            </li>
          </ul>
        </div>
        <div className="card">
          <h2 className="font-display text-xl font-bold">Alertas de seguranca</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="rounded-lg border border-ink-800 bg-ink-950 p-3">Gitleaks: 0 findings no último scan (05/07)</li>
            <li className="rounded-lg border border-ink-800 bg-ink-950 p-3">npm audit: 2 low (não críticas)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
