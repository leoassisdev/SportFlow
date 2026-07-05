import Image from 'next/image';
import Link from 'next/link';

const KPIS = [
  { label: 'Campeonatos ativos', value: '2', trend: '+1 esta semana', tone: 'brand' as const },
  { label: 'Proximo jogo', value: '18:30', trend: 'Interbairros · Semifinal', tone: 'accent' as const },
  { label: 'Saldo do campeonato', value: 'R$ 2.480', trend: 'Interbairros 2026', tone: 'success' as const },
  { label: 'Placares publicos', value: '1', trend: 'Ao vivo agora', tone: 'brand' as const },
];

const RECENT = [
  { id: 'demo-1', name: 'Interbairros 2026', sport: 'Futebol', status: 'Ao vivo', participants: 8 },
  { id: 'demo-2', name: 'Copa de Volei Escolar', sport: 'Volei', status: 'Agendado', participants: 6 },
];

export const metadata = { title: 'Painel' };

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
        <b>Modo preview.</b> Voce pode criar 1 campeonato com ate 3 participantes.{' '}
        <Link href="/settings" className="underline">
          Ative a licenca completa
        </Link>{' '}
        para desbloquear financeiro, exportacao e mais participantes.
      </div>
      <div className="relative overflow-hidden rounded-3xl border border-ink-800 bg-ink-900">
        <Image
          src="/imagens/v2/geral/dashboard-cards.png"
          alt=""
          fill
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/50 to-transparent" />
        <div className="relative flex items-end justify-between p-8">
          <div>
            <h1 className="font-display text-3xl font-black">Bem-vindo de volta</h1>
            <p className="text-sm text-ink-100">O que rola hoje na sua arena.</p>
          </div>
          <Link href="/championships/new" className="btn-accent">
            + Criar campeonato
          </Link>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((k) => (
          <div key={k.label} className="card">
            <p className="text-xs uppercase tracking-widest text-ink-100">{k.label}</p>
            <p className={`mt-2 font-display text-4xl font-black ${k.tone === 'accent' ? 'text-accent-400' : k.tone === 'success' ? 'text-success' : 'text-brand-400'}`}>
              {k.value}
            </p>
            <p className="mt-1 text-xs text-ink-100">{k.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Campeonatos recentes</h2>
            <Link href="/championships" className="text-xs text-brand-400 hover:text-brand-300">
              Ver todos →
            </Link>
          </div>
          <ul className="divide-y divide-ink-800">
            {RECENT.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-ink-100">
                    {c.sport} · {c.participants} participantes
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`badge ${
                      c.status === 'Ao vivo'
                        ? 'animate-pulseGlow bg-accent-500 text-white'
                        : 'bg-ink-800 text-ink-100'
                    }`}
                  >
                    {c.status}
                  </span>
                  <Link href={`/championships/${c.id}`} className="btn-ghost text-xs">
                    Abrir
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2 className="font-display text-xl font-bold">Placar publico ao vivo</h2>
          <p className="mt-1 text-xs text-ink-100">Compartilhe o link com quem quiser acompanhar.</p>
          <div className="mt-4 rounded-xl border border-ink-800 bg-ink-950 p-4">
            <div className="flex items-center justify-between text-xs text-ink-100">
              <span className="badge animate-pulseGlow bg-accent-500 text-white">AO VIVO</span>
              <span className="font-mono">42:18</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-center">
                <p className="text-[10px] uppercase text-ink-100">Bairro Alto</p>
                <p className="font-display text-4xl font-black">3</p>
              </div>
              <span className="font-display text-3xl text-brand-500">×</span>
              <div className="text-center">
                <p className="text-[10px] uppercase text-ink-100">Vila Norte</p>
                <p className="font-display text-4xl font-black">1</p>
              </div>
            </div>
          </div>
          <Link href="/live/demo-token" className="btn-primary mt-4 w-full text-center">
            Abrir placar publico
          </Link>
        </div>
      </div>
    </div>
  );
}
