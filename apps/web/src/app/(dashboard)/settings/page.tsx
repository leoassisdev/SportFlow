import Link from 'next/link';

export const metadata = { title: 'Configuracoes' };

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-ink-100">Configuracoes</p>
        <h1 className="font-display text-3xl font-black">Sua conta e seu tenant</h1>
      </div>

      <div className="card space-y-4">
        <h2 className="font-display text-xl font-bold">Perfil</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input className="input-base" placeholder="Nome" defaultValue="Leonardo (Owner)" />
          <input className="input-base" placeholder="Email" defaultValue="leo@ligadobairro.com" />
        </div>
        <button className="btn-primary">Salvar</button>
      </div>

      <div className="card space-y-4">
        <h2 className="font-display text-xl font-bold">Licenca</h2>
        <div className="flex items-center justify-between rounded-2xl border border-warning/40 bg-warning/10 p-4">
          <div>
            <p className="font-bold text-warning">Modo preview</p>
            <p className="text-xs text-warning">Voce esta usando o plano gratuito de avaliacao.</p>
          </div>
          <Link href="#" className="btn-accent text-xs">
            Ativar licenca
          </Link>
        </div>
        <div className="text-sm text-ink-100">
          <p>Planos disponiveis (mock):</p>
          <ul className="mt-2 list-disc pl-6">
            <li>3 dias — R$ 500</li>
            <li>30 dias — R$ 1.500</li>
            <li>Anual — R$ 12.000</li>
          </ul>
          <p className="mt-3 text-xs text-ink-400">Pagamento via Stripe. Ativacao automatica apos confirmacao.</p>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-display text-xl font-bold">Membros do tenant</h2>
        <ul className="divide-y divide-ink-800 text-sm">
          <li className="flex items-center justify-between py-2">
            <span>leo@ligadobairro.com <span className="badge ml-2 bg-brand-500/20 text-brand-300">Owner</span></span>
            <span className="text-xs text-ink-100">criado 01/07</span>
          </li>
          <li className="flex items-center justify-between py-2">
            <span>filipe@ligadobairro.com <span className="badge ml-2 bg-ink-800 text-ink-100">Member</span></span>
            <button className="btn-ghost text-xs">Remover</button>
          </li>
        </ul>
        <div className="flex gap-2">
          <input className="input-base flex-1" placeholder="email@dominio.com" />
          <button className="btn-primary">Convidar</button>
        </div>
      </div>
    </div>
  );
}
