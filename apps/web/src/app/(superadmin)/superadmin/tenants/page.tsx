const MOCK = [
  { id: 't1', name: 'Liga do Bairro (Demo)', status: 'active', users: 3, createdAt: '01/07', license: '30d ativo' },
  { id: 't2', name: 'Skate Contest ZN', status: 'active', users: 2, createdAt: '18/06', license: '30d ativo' },
  { id: 't3', name: 'Volei Escolar Sul', status: 'preview', users: 1, createdAt: '02/07', license: '—' },
  { id: 't4', name: 'Copa Amadora Centro', status: 'expired', users: 4, createdAt: '10/05', license: '30d expirado' },
];

export const metadata = { title: 'SuperAdmin — Tenants' };

export default function TenantsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-black">Tenants</h1>
        <div className="flex gap-2">
          <input className="input-base" placeholder="Buscar por nome..." />
          <select className="input-base">
            <option>Todos os status</option>
            <option>Preview</option>
            <option>Ativo</option>
            <option>Expirado</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-800">
        <table className="w-full text-sm">
          <thead className="bg-ink-900 text-left text-xs uppercase text-ink-100">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Usuarios</th>
              <th className="px-4 py-3">Licenca</th>
              <th className="px-4 py-3">Criado</th>
              <th className="px-4 py-3 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-800 bg-ink-950">
            {MOCK.map((t) => (
              <tr key={t.id} className="hover:bg-ink-900/60">
                <td className="px-4 py-3 font-medium">{t.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`badge ${
                      t.status === 'active'
                        ? 'bg-success/20 text-success'
                        : t.status === 'preview'
                          ? 'bg-warning/20 text-warning'
                          : 'bg-danger/20 text-danger'
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3">{t.users}</td>
                <td className="px-4 py-3 text-ink-100">{t.license}</td>
                <td className="px-4 py-3 text-ink-100">{t.createdAt}</td>
                <td className="px-4 py-3 text-right">
                  <button className="btn-ghost text-xs">Ver</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
