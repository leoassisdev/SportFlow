import Link from 'next/link';
import { XCircle } from 'lucide-react';

export const metadata = { title: 'Pagamento cancelado' };

export default function PaymentCancelPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-ink-950 px-6 text-center">
      <div className="card max-w-md">
        <XCircle className="mx-auto h-16 w-16 text-danger" />
        <h1 className="mt-4 font-display text-3xl font-black">Pagamento cancelado</h1>
        <p className="mt-2 text-sm text-ink-100">
          Voce continua no modo preview. Quando quiser, só retomar de onde parou.
        </p>
        <Link href="/settings" className="btn-primary mt-6 inline-flex">
          Ver planos
        </Link>
      </div>
    </main>
  );
}
