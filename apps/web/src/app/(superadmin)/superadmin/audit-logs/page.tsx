const LOGS = [
  { id: 'a1', at: '05/07 11:22', tenant: 'Liga do Bairro', user: 'leo@', action: 'PATCH /matches/:id/score', ip: '187.12.30.4' },
  { id: 'a2', at: '05/07 11:20', tenant: 'Liga do Bairro', user: 'leo@', action: 'POST /championships', ip: '187.12.30.4' },
  { id: 'a3', at: '05/07 10:44', tenant: '—', user: 'flowcore', action: 'superadmin.tenant.override', ip: '10.0.0.9' },
];

export const metadata = { title: 'SuperAdmin — Auditoria' };

export default function AuditLogsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="font-display text-3xl font-black">Auditoria</h1>

      <div className="card space-y-3">
        <div className="grid gap-3 md:grid-cols-4">
          <input className="input-base" placeholder="Tenant" />
          <input className="input-base" placeholder="Usuario" />
          <input className="input-base" placeholder="Acao" />
          <input className="input-base" type="date" />
        </div>
        <button className="btn-primary">Buscar</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-800">
        <table className="w-full text-sm">
          <thead className="bg-ink-900 text-left text-xs uppercase text-ink-100">
            <tr>
              <th className="px-4 py-3">Quando</th>
              <th className="px-4 py-3">Tenant</th>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Acao</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-800 bg-ink-950 font-mono text-xs">
            {LOGS.map((l) => (
              <tr key={l.id}>
                <td className="px-4 py-2 text-ink-100">{l.at}</td>
                <td className="px-4 py-2">{l.tenant}</td>
                <td className="px-4 py-2 text-ink-100">{l.user}</td>
                <td className="px-4 py-2 text-brand-300">{l.action}</td>
                <td className="px-4 py-2 text-ink-100">{l.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
