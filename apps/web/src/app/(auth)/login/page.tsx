'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { useLogin } from '@/hooks/useAuthMutations';
import { asApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

const GOOGLE_ERR_MSG: Record<string, string> = {
  google_no_code: 'Autorização Google incompleta.',
  google_state: 'Sessão Google inválida (CSRF). Tente novamente.',
  google_unauthorized: 'Não foi possível validar sua conta Google.',
  google_failed: 'Falha no login Google. Tente de novo.',
  google_disabled: 'Login Google indisponível no momento.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-100">Carregando...</p>}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const googleErr = params.get('error');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errMsg, setErrMsg] = useState<string | null>(
    googleErr && GOOGLE_ERR_MSG[googleErr] ? GOOGLE_ERR_MSG[googleErr]! : null,
  );
  const login = useLogin();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg(null);
    try {
      const { user } = await login.mutateAsync({ email, password });
      router.push(user.role === 'superadmin' ? '/superadmin' : '/dashboard');
    } catch (err) {
      setErrMsg(asApiError(err).message);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-black">Entrar</h1>
      <p className="mt-2 text-sm text-ink-100">
        Bem-vindo de volta. Acesse seu painel do campeonato.
      </p>
      <div className="mt-6">
        <GoogleButton />
      </div>
      <div className="my-6 flex items-center gap-3 text-xs uppercase text-ink-100">
        <div className="h-px flex-1 bg-ink-800" />
        ou com email
        <div className="h-px flex-1 bg-ink-800" />
      </div>
      <form className="space-y-4" onSubmit={submit}>
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {errMsg ? <p className="text-sm text-danger">{errMsg}</p> : null}
        <button
          type="submit"
          className="btn-primary w-full"
          data-testid="login-submit"
          disabled={login.isPending}
        >
          {login.isPending ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <p className="mt-6 text-sm text-ink-100">
        Ainda não tem conta?{' '}
        <Link href="/register" className="text-brand-400 hover:text-brand-300">
          Cadastre-se em 30 segundos
        </Link>
      </p>
      <p className="mt-2 text-xs text-ink-100">
        <Link href="/forgot-password" className="text-brand-400 hover:text-brand-300">
          Esqueci minha senha
        </Link>
      </p>
    </div>
  );
}
