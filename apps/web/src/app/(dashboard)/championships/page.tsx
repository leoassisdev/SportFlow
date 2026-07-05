import Link from 'next/link';

const MOCK = [
  { id: 'demo-1', name: 'Interbairros 2026', sport: 'Futebol', status: 'live', participants: 8, startsAt: '05 jul, 18:30' },
  { id: 'demo-2', name: 'Copa de Volei Escolar', sport: 'Volei', status: 'scheduled', participants: 6, startsAt: '12 jul, 10:00' },
  { id: 'demo-3', name: 'Skate Contest Central', sport: 'Skate', status: 'draft', participants: 0, startsAt: '—' },
];

export const metadata = { title: 'Campeonatos' };

export default function ChampionshipsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-black">Campeonatos</h1>
          <p className="text-sm text-ink-100">Todos os torneios que voce criou.</p>
        </div>
        <Link href="/championships/new" className="btn-accent">
          + Novo campeonato
        </Link>
      </div>
      <div className="overflow-hidden rounded-2xl border border-ink-800">
        <table className="w-full text-sm">
          <thead className="bg-ink-900 text-left text-xs uppercase tracking-wide text-ink-100">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Esporte</th>
              <th className="px-4 py-3">Participantes</th>
              <th className="px-4 py-3">Inicio</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-800 bg-ink-950">
            {MOCK.map((c) => (
              <tr key={c.id} className="hover:bg-ink-900/60">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-ink-100">{c.sport}</td>
                <td className="px-4 py-3 text-ink-100">{c.participants}</td>
                <td className="px-4 py-3 text-ink-100">{c.startsAt}</td>
                <td className="px-4 py-3">
                  <span
                    className={`badge ${
                      c.status === 'live'
                        ? 'animate-pulseGlow bg-accent-500 text-white'
                        : c.status === 'scheduled'
                          ? 'bg-brand-500/20 text-brand-300'
                          : 'bg-ink-800 text-ink-100'
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/championships/${c.id}`} className="btn-ghost text-xs">
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
