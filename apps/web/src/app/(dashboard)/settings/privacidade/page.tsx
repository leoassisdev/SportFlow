'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { consentService, type ConsentKind } from '@/services/consent.service';

export default function PrivacidadeSettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['consents', 'mine'],
    queryFn: () => consentService.mine(),
  });

  const mutation = useMutation({
    mutationFn: ({ kind, accepted }: { kind: ConsentKind; accepted: boolean }) =>
      consentService.set(kind, accepted),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['consents', 'mine'] }),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-ink-100">Configuracoes</p>
        <h1 className="font-display text-3xl font-black">Privacidade e comunicacoes</h1>
        <p className="text-sm text-ink-100">
          Gerencie o que voce aceita receber. Voce pode mudar de ideia a qualquer momento.
        </p>
      </div>

      {isLoading ? (
        <div className="card animate-pulse">
          <div className="h-4 w-48 rounded bg-ink-800" />
          <div className="mt-3 h-4 w-full rounded bg-ink-800" />
        </div>
      ) : error ? (
        <div className="card text-sm text-danger">Nao conseguimos carregar seus consentimentos.</div>
      ) : (
        <>
          <div className="card space-y-4">
            <ConsentRow
              title="Politica de Privacidade"
              description={`Versao atual: ${data?.currentVersion ?? '—'}. Este aceite e obrigatorio para usar o SportFlow.`}
              accepted={data?.current.privacy_policy?.accepted ?? false}
              disabled
            />
            <ConsentRow
              title="Emails de marketing"
              description="Novidades, ofertas de licenca, dicas de organizacao."
              accepted={data?.current.email_marketing?.accepted ?? false}
              onChange={(v) => mutation.mutate({ kind: 'email_marketing', accepted: v })}
              loading={mutation.isPending}
            />
            <ConsentRow
              title="WhatsApp de marketing"
              description="Novidades e ofertas via WhatsApp Business."
              accepted={data?.current.whatsapp_marketing?.accepted ?? false}
              onChange={(v) => mutation.mutate({ kind: 'whatsapp_marketing', accepted: v })}
              loading={mutation.isPending}
            />
          </div>

          <div className="card">
            <h2 className="font-display text-lg font-bold">Historico</h2>
            <ul className="mt-3 space-y-1 font-mono text-xs text-ink-100">
              {(data?.history ?? []).slice(0, 15).map((h) => (
                <li key={h.id}>
                  {new Date(h.createdAt).toLocaleString('pt-BR')} · {h.kind} ={' '}
                  <span className={h.accepted ? 'text-success' : 'text-danger'}>
                    {h.accepted ? 'aceito' : 'revogado'}
                  </span>{' '}
                  · v{h.version}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-ink-100">
            Veja a{' '}
            <Link href="/privacidade" className="text-brand-400 underline">
              Politica de Privacidade completa
            </Link>{' '}
            ou solicite exclusao da conta em{' '}
            <a href="mailto:privacidade@sportflow.com.br" className="text-brand-400 underline">
              privacidade@sportflow.com.br
            </a>
            .
          </p>
        </>
      )}
    </div>
  );
}

function ConsentRow({
  title,
  description,
  accepted,
  onChange,
  loading,
  disabled,
}: {
  title: string;
  description: string;
  accepted: boolean;
  onChange?: (v: boolean) => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-xs text-ink-100">{description}</p>
      </div>
      <label className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${accepted ? 'bg-brand-500' : 'bg-ink-700'} ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
        <input
          type="checkbox"
          className="peer sr-only"
          checked={accepted}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled || loading}
        />
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${accepted ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </label>
    </div>
  );
}
