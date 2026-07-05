import Link from 'next/link';

export const metadata = { title: 'Detalhe do campeonato' };

export default function ChampionshipDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-100">Campeonato</p>
          <h1 className="font-display text-3xl font-black">Interbairros 2026</h1>
          <p className="text-sm text-ink-100">Futebol · 05 jul → 20 ago</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/championships/${params.id}/matches/demo-match`} className="btn-primary">
            Abrir placar
          </Link>
          <Link href="#" className="btn-ghost">
            Editar
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Participantes" value="8" />
        <StatCard label="Jogos finalizados" value="6" />
        <StatCard label="Jogos ao vivo" value="1" />
        <StatCard label="Saldo" value="R$ 2.480" tone="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="font-display text-lg font-bold">Participantes</h2>
          <ul className="mt-3 divide-y divide-ink-800 text-sm">
            {['Bairro Alto', 'Vila Norte', 'Centro FC', 'Jardim Atletico', 'FC Aurora', 'Costa United', 'Sul Sports', 'Portal FC'].map((p, i) => (
              <li key={p} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-500/10 text-xs font-bold text-brand-400">
                    {i + 1}
                  </span>
                  <span>{p}</span>
                </div>
                <span className="text-xs text-ink-100">Grupo A</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2 className="font-display text-lg font-bold">Proximos jogos</h2>
          <ul className="mt-3 divide-y divide-ink-800 text-sm">
            {[
              { home: 'Bairro Alto', away: 'Vila Norte', when: 'Hoje 18:30', live: true },
              { home: 'Centro FC', away: 'FC Aurora', when: 'Amanha 19:00', live: false },
              { home: 'Jardim Atletico', away: 'Costa United', when: 'Dom 10:00', live: false },
            ].map((m) => (
              <li key={`${m.home}-${m.away}`} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">
                    {m.home} <span className="text-ink-100">×</span> {m.away}
                  </p>
                  <p className="text-xs text-ink-100">{m.when}</p>
                </div>
                <Link
                  href={`/championships/${params.id}/matches/demo-match`}
                  className={m.live ? 'btn-accent text-xs' : 'btn-ghost text-xs'}
                >
                  {m.live ? 'AO VIVO' : 'Abrir'}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone?: 'success' }) {
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-widest text-ink-100">{label}</p>
      <p className={`mt-2 font-display text-3xl font-black ${tone === 'success' ? 'text-success' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}
