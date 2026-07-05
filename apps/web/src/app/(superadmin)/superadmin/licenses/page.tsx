const MOCK = [
  { id: 'l1', tenant: 'Liga do Bairro (Demo)', days: 30, price: 500, status: 'active', expires: '31/07' },
  { id: 'l2', tenant: 'Skate Contest ZN', days: 30, price: 500, status: 'active', expires: '19/07' },
  { id: 'l3', tenant: 'Copa Amadora Centro', days: 30, price: 500, status: 'expired', expires: '09/06' },
];

export const metadata = { title: 'SuperAdmin — Licencas' };

export default function LicensesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-black">Licencas</h1>
        <button className="btn-accent">+ Nova licenca</button>
      </div>

      <div className="card space-y-3">
        <h2 className="font-display text-lg font-bold">Emitir licenca (Stripe Checkout)</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <input className="input-base md:col-span-2" placeholder="Tenant (autocomplete)" />
          <input className="input-base" placeholder="Dias" type="number" defaultValue={30} />
          <input className="input-base" placeholder="Preco BRL" type="number" defaultValue={500} />
        </div>
        <button className="btn-primary">Gerar link Stripe + enviar</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-800">
        <table className="w-full text-sm">
          <thead className="bg-ink-900 text-left text-xs uppercase text-ink-100">
            <tr>
              <th className="px-4 py-3">Tenant</th>
              <th className="px-4 py-3">Dias</th>
              <th className="px-4 py-3">Preco</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Expira</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-800 bg-ink-950">
            {MOCK.map((l) => (
              <tr key={l.id}>
                <td className="px-4 py-3 font-medium">{l.tenant}</td>
                <td className="px-4 py-3 text-ink-100">{l.days}d</td>
                <td className="px-4 py-3 text-ink-100 font-mono">R$ {l.price}</td>
                <td className="px-4 py-3">
                  <span
                    className={`badge ${
                      l.status === 'active' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                    }`}
                  >
                    {l.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-100">{l.expires}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
