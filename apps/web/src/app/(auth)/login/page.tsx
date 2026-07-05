import Link from 'next/link';

export const metadata = { title: 'Entrar' };

export default function LoginPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-black">Entrar</h1>
      <p className="mt-2 text-sm text-ink-100">
        Bem-vindo de volta. Acesse seu painel do campeonato.
      </p>
      <form className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-100">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            data-testid="login-email"
            placeholder="voce@time.com"
            className="input-base"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-100">
            Senha
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            data-testid="login-password"
            className="input-base"
          />
        </div>
        <button type="submit" className="btn-primary w-full" data-testid="login-submit">
          Entrar
        </button>
      </form>
      <p className="mt-6 text-sm text-ink-100">
        Ainda nao tem conta?{' '}
        <Link href="/register" className="text-brand-400 hover:text-brand-300">
          Cadastre-se em 30 segundos
        </Link>
      </p>
    </div>
  );
}
