import Link from 'next/link';
import { CalendarClock, LayoutDashboard, Trophy, Wallet, LogOut, Settings } from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Painel', icon: LayoutDashboard },
  { href: '/championships', label: 'Campeonatos', icon: Trophy },
  { href: '/dashboard#agenda', label: 'Agenda', icon: CalendarClock },
  { href: '/dashboard#financeiro', label: 'Financeiro', icon: Wallet },
  { href: '/settings', label: 'Configuracoes', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-ink-950 text-ink-50">
      <aside className="hidden w-64 shrink-0 border-r border-ink-800 bg-ink-900/70 lg:flex lg:flex-col">
        <div className="flex items-center gap-3 border-b border-ink-800 px-6 py-5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500/10 text-brand-400 shadow-glowSm">
            <span className="font-display text-lg font-black">S</span>
          </div>
          <span className="font-display text-lg font-bold">SportFlow</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-100 hover:bg-ink-800 hover:text-white"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-ink-800 p-4 text-xs text-ink-100">
          <div className="mb-2 flex items-center justify-between">
            <span>Modo</span>
            <span className="badge bg-warning/20 text-warning">preview</span>
          </div>
          <Link href="/settings" className="text-brand-400 hover:text-brand-300">
            Ativar licenca completa →
          </Link>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-ink-800 bg-ink-950/60 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink-100">Tenant</p>
            <p className="font-display text-sm font-bold">Liga do Bairro (Demo)</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-ink-100 hover:text-white">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sair</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
