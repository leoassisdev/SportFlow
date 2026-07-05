import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export const metadata = { title: 'Pagamento confirmado' };

export default function PaymentSuccessPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-ink-950 px-6 text-center">
      <div className="card max-w-md">
        <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
        <h1 className="mt-4 font-display text-3xl font-black">Licença ativada!</h1>
        <p className="mt-2 text-sm text-ink-100">
          Recebemos o pagamento. Sua conta já esta com acesso completo. Boa arena!
        </p>
        <Link href="/dashboard" className="btn-accent mt-6 inline-flex">
          Ir para o painel
        </Link>
      </div>
    </main>
  );
}
