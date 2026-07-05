'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { consentService } from '@/services/consent.service';

export default function OnboardingPage() {
  const router = useRouter();
  const [email, setEmail] = useState(false);
  const [whats, setWhats] = useState(false);
  const emailMut = useMutation({ mutationFn: (v: boolean) => consentService.set('email_marketing', v) });
  const whatsMut = useMutation({ mutationFn: (v: boolean) => consentService.set('whatsapp_marketing', v) });

  const continuar = async () => {
    await Promise.all([emailMut.mutateAsync(email), whatsMut.mutateAsync(whats)]);
    router.push('/dashboard');
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-ink-100">Bem-vindo(a) 👋</p>
        <h1 className="mt-2 font-display text-3xl font-black">Vamos configurar 30 segundos</h1>
        <p className="text-sm text-ink-100">Voce pode alterar em Configurações depois.</p>
      </div>

      <div className="card space-y-4">
        <label className="flex items-start gap-3 text-sm text-ink-100">
          <input
            type="checkbox"
            checked={email}
            onChange={(e) => setEmail(e.target.checked)}
            className="mt-1 h-4 w-4 accent-brand-500"
          />
          <span>
            Aceito receber <b>emails</b> com novidades, ofertas e dicas de organização de campeonatos.
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm text-ink-100">
          <input
            type="checkbox"
            checked={whats}
            onChange={(e) => setWhats(e.target.checked)}
            className="mt-1 h-4 w-4 accent-brand-500"
          />
          <span>
            Aceito receber <b>WhatsApp</b> com novidades e ofertas.
          </span>
        </label>
        <button
          className="btn-accent w-full"
          onClick={continuar}
          disabled={emailMut.isPending || whatsMut.isPending}
        >
          Continuar
        </button>
        <button
          className="text-xs text-ink-100 hover:text-white"
          onClick={() => router.push('/dashboard')}
        >
          Depois eu decido
        </button>
      </div>
    </div>
  );
}
