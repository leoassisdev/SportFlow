'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, MessageCircle, Send, Trash2 } from 'lucide-react';
import { campaignService, type Campaign } from '@/services/campaign.service';
import { asApiError } from '@/lib/api';

export default function CampaignsPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ['campaigns'], queryFn: campaignService.list });
  const create = useMutation({
    mutationFn: campaignService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });
  const send = useMutation({
    mutationFn: campaignService.send,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });
  const remove = useMutation({
    mutationFn: campaignService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });

  const [form, setForm] = useState({
    title: '',
    channel: 'email' as 'email' | 'whatsapp',
    audience: 'users_active' as 'leads' | 'users_active' | 'users_preview' | 'users_all',
    subject: '',
    body: '',
  });
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      await create.mutateAsync({
        title: form.title,
        channel: form.channel,
        audience: form.audience,
        subject: form.channel === 'email' ? form.subject : undefined,
        body: form.body,
      });
      setForm({ ...form, title: '', subject: '', body: '' });
    } catch (e) {
      setErr(asApiError(e).message);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-danger">SuperAdmin FlowCore</p>
        <h1 className="font-display text-3xl font-black">Campanhas</h1>
        <p className="text-sm text-ink-100">
          Envie ofertas e comunicados. So sao entregues para usuarios com opt-in ativo.
        </p>
      </div>

      <div className="card space-y-4">
        <h2 className="font-display text-xl font-bold">Nova campanha</h2>
        <form onSubmit={submit} className="space-y-3">
          <input
            className="input-base"
            placeholder="Titulo interno (nao vai pro destinatario)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <div className="grid gap-3 md:grid-cols-2">
            <select
              className="input-base"
              value={form.channel}
              onChange={(e) => setForm({ ...form, channel: e.target.value as 'email' | 'whatsapp' })}
            >
              <option value="email">📧 Email</option>
              <option value="whatsapp">💬 WhatsApp</option>
            </select>
            <select
              className="input-base"
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value as typeof form.audience })}
            >
              <option value="users_active">Owners com licenca ativa</option>
              <option value="users_preview">Owners em modo preview</option>
              <option value="users_all">Todos os owners</option>
              <option value="leads">Leads (nao converteram)</option>
            </select>
          </div>
          {form.channel === 'email' ? (
            <input
              className="input-base"
              placeholder="Assunto do email"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          ) : null}
          <textarea
            className="input-base h-32"
            placeholder="Corpo da mensagem"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            required
          />
          {err ? <p className="text-sm text-danger">{err}</p> : null}
          <button type="submit" className="btn-accent" disabled={create.isPending}>
            {create.isPending ? 'Criando...' : 'Salvar rascunho'}
          </button>
        </form>
      </div>

      <div>
        <h2 className="mb-3 font-display text-xl font-bold">Campanhas existentes</h2>
        {isLoading ? (
          <div className="card animate-pulse">
            <div className="h-4 w-64 rounded bg-ink-800" />
          </div>
        ) : error ? (
          <div className="card text-sm text-danger">Nao conseguimos carregar as campanhas.</div>
        ) : (data ?? []).length === 0 ? (
          <div className="card text-center text-sm text-ink-100">Nenhuma campanha ainda.</div>
        ) : (
          <div className="space-y-2">
            {(data ?? []).map((c) => (
              <CampaignRow
                key={c.id}
                c={c}
                onSend={() => send.mutate(c.id)}
                onDelete={() => remove.mutate(c.id)}
                sending={send.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CampaignRow({
  c,
  onSend,
  onDelete,
  sending,
}: {
  c: Campaign;
  onSend: () => void;
  onDelete: () => void;
  sending: boolean;
}) {
  const canSend = c.status === 'draft' || c.status === 'scheduled';
  const canDelete = c.status === 'draft' || c.status === 'scheduled';
  return (
    <div className="card flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {c.channel === 'email' ? (
          <Mail className="h-6 w-6 text-brand-400" />
        ) : (
          <MessageCircle className="h-6 w-6 text-success" />
        )}
        <div>
          <p className="font-semibold">{c.title}</p>
          <p className="text-xs text-ink-100">
            {c.audience} · {new Date(c.createdAt).toLocaleString('pt-BR')}
          </p>
          {c.status === 'sent' ? (
            <p className="text-xs text-success">
              {c.sentCount} enviados · {c.skippedCount} skipped · {c.failedCount} falhas
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`badge ${
            c.status === 'sent'
              ? 'bg-success/20 text-success'
              : c.status === 'sending'
                ? 'animate-pulse bg-brand-500/20 text-brand-300'
                : c.status === 'failed'
                  ? 'bg-danger/20 text-danger'
                  : 'bg-ink-800 text-ink-100'
          }`}
        >
          {c.status}
        </span>
        {canSend ? (
          <button className="btn-primary text-xs" onClick={onSend} disabled={sending}>
            <Send className="mr-1 inline h-3 w-3" /> Enviar
          </button>
        ) : null}
        {canDelete ? (
          <button className="btn-ghost text-xs" onClick={onDelete}>
            <Trash2 className="inline h-3 w-3" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
