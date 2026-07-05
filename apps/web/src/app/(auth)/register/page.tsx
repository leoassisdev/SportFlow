'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SPORTS, type SportKey } from '@/lib/constants';
import { useRegister } from '@/hooks/useAuthMutations';
import { asApiError } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    whatsapp: '',
    sport: 'futebol' as SportKey,
    organizationName: '',
  });
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const register = useRegister();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg(null);
    try {
      await register.mutateAsync(form);
      router.push('/dashboard');
    } catch (err) {
      setErrMsg(asApiError(err).message);
    }
  };

  const upd = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <h1 className="font-display text-3xl font-black">Comecar teste gratis</h1>
      <p className="mt-2 text-sm text-ink-100">
        Sem cartao. Voce cria seu primeiro campeonato em modo preview.
      </p>
      <form className="mt-8 space-y-4" onSubmit={submit}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-100">Nome</label>
            <input
              className="input-base"
              data-testid="register-name"
              placeholder="Seu nome"
              value={form.name}
              onChange={(e) => upd('name', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-100">WhatsApp</label>
            <input
              className="input-base"
              data-testid="register-whatsapp"
              placeholder="(11) 90000-0000"
              value={form.whatsapp}
              onChange={(e) => upd('whatsapp', e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-100">Email</label>
          <input
            className="input-base"
            data-testid="register-email"
            placeholder="voce@time.com"
            type="email"
            value={form.email}
            onChange={(e) => upd('email', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-100">Senha</label>
          <input
            className="input-base"
            data-testid="register-password"
            type="password"
            value={form.password}
            onChange={(e) => upd('password', e.target.value)}
            minLength={8}
            required
          />
          <p className="mt-1 text-[10px] text-ink-400">Min 8 caracteres, com maiuscula, minuscula e numero.</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-100">Time / Liga</label>
          <input
            className="input-base"
            data-testid="register-org"
            placeholder="Liga do bairro"
            value={form.organizationName}
            onChange={(e) => upd('organizationName', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-100">
            Esporte principal
          </label>
          <div className="grid grid-cols-4 gap-2">
            {SPORTS.map((s) => (
              <label
                key={s.key}
                className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-medium hover:border-brand-500 ${
                  form.sport === s.key ? 'border-brand-500 bg-brand-500/10 text-brand-300' : 'border-ink-700 bg-ink-800 text-ink-100'
                }`}
              >
                <input
                  type="radio"
                  name="sport"
                  value={s.key}
                  className="sr-only"
                  checked={form.sport === s.key}
                  onChange={() => upd('sport', s.key)}
                />
                <span className="text-2xl">{s.icon}</span>
                {s.label}
              </label>
            ))}
          </div>
        </div>
        {errMsg ? <p className="text-sm text-danger">{errMsg}</p> : null}
        <button
          type="submit"
          className="btn-accent w-full"
          data-testid="register-submit"
          disabled={register.isPending}
        >
          {register.isPending ? 'Criando...' : 'Criar minha conta'}
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
