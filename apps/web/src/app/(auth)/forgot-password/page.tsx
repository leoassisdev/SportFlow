import Link from 'next/link';

export const metadata = { title: 'Esqueci minha senha' };

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-black">Esqueceu a senha?</h1>
      <p className="mt-2 text-sm text-ink-100">
        Envia teu email, mandamos um link pra criar uma nova.
      </p>
      <form className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-100">Email</label>
          <input className="input-base" type="email" placeholder="voce@time.com" />
        </div>
        <button type="submit" className="btn-primary w-full">
          Enviar link
        </button>
      </form>
      <p className="mt-6 text-sm text-ink-100">
        <Link href="/login" className="text-brand-400 hover:text-brand-300">
          Voltar para login
        </Link>
      </p>
    </div>
  );
}
