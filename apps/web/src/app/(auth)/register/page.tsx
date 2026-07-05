import Link from 'next/link';
import { SPORTS } from '@/lib/constants';

export const metadata = { title: 'Comecar teste gratis' };

export default function RegisterPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-black">Comecar teste gratis</h1>
      <p className="mt-2 text-sm text-ink-100">
        Sem cartao. Voce cria seu primeiro campeonato em modo preview.
      </p>
      <form className="mt-8 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-100">
              Nome
            </label>
            <input className="input-base" data-testid="register-name" placeholder="Seu nome" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-100">
              WhatsApp
            </label>
            <input className="input-base" data-testid="register-whatsapp" placeholder="(11) 90000-0000" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-100">Email</label>
          <input className="input-base" data-testid="register-email" placeholder="voce@time.com" type="email" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-100">Senha</label>
          <input className="input-base" data-testid="register-password" type="password" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-100">Time / Liga</label>
          <input className="input-base" data-testid="register-org" placeholder="Liga do bairro" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-100">
            Esporte principal
          </label>
          <div className="grid grid-cols-4 gap-2">
            {SPORTS.map((s) => (
              <label
                key={s.key}
                className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-ink-700 bg-ink-800 px-2 py-3 text-xs font-medium text-ink-100 hover:border-brand-500"
              >
                <input type="radio" name="sport" value={s.key} className="sr-only" />
                <span className="text-2xl">{s.icon}</span>
                {s.label}
              </label>
            ))}
          </div>
        </div>
        <button type="submit" className="btn-accent w-full" data-testid="register-submit">
          Criar minha conta
        </button>
      </form>
      <p className="mt-6 text-sm text-ink-100">
        Ja tem conta?{' '}
        <Link href="/login" className="text-brand-400 hover:text-brand-300">
          Entrar
        </Link>
      </p>
    </div>
  );
}
