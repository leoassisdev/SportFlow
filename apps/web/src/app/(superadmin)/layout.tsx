import Link from 'next/link';
import { LayoutDashboard, Users, Shield, FileWarning, Building, LogOut, Megaphone } from 'lucide-react';

const NAV = [
  { href: '/superadmin', label: 'Metricas', icon: LayoutDashboard },
  { href: '/superadmin/tenants', label: 'Tenants', icon: Building },
  { href: '/superadmin/licenses', label: 'Licencas', icon: Shield },
  { href: '/superadmin/leads', label: 'Leads', icon: Users },
  { href: '/superadmin/campaigns', label: 'Campanhas', icon: Megaphone },
  { href: '/superadmin/audit-logs', label: 'Auditoria', icon: FileWarning },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-ink-950 text-ink-50">
      <aside className="hidden w-64 shrink-0 border-r border-danger/20 bg-gradient-to-b from-ink-950 to-ink-900 lg:flex lg:flex-col">
        <div className="flex items-center gap-3 border-b border-ink-800 px-6 py-5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-danger/10 text-danger shadow-[0_0_16px_rgba(239,68,68,0.4)]">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <p className="font-display text-lg font-bold leading-tight">SportFlow</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-danger">FLOWCORE</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-100 hover:bg-ink-800 hover:text-white"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-ink-800 p-4">
          <Link href="/" className="flex items-center gap-2 text-xs text-ink-100 hover:text-white">
            <LogOut className="h-4 w-4" /> Sair
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-6 lg:p-8">{children}</main>
    </div>
  );
}
