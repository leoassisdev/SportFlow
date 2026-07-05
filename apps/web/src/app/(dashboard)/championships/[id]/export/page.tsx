'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, FileSpreadsheet, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { exportService, type ExportJob } from '@/services/export.service';
import { asApiError } from '@/lib/api';

const STATUS_ICON: Record<string, JSX.Element> = {
  completed: <CheckCircle2 className="h-4 w-4 text-success" />,
  processing: <Clock className="h-4 w-4 animate-spin text-brand-500" />,
  pending: <Clock className="h-4 w-4 text-ink-400" />,
  failed: <XCircle className="h-4 w-4 text-danger" />,
};

const MODULES = ['results', 'financial', 'participants'] as const;
const MODULE_LABEL: Record<string, string> = {
  results: 'Resultados',
  financial: 'Financeiro',
  participants: 'Participantes',
};

export default function ExportPage({ params }: { params: { id: string } }) {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ['export-jobs', params.id],
    queryFn: () => exportService.list(params.id),
    refetchInterval: 3000,
  });
  const create = useMutation({
    mutationFn: exportService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['export-jobs'] }),
  });

  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
  const [selected, setSelected] = useState<Set<string>>(new Set(['results', 'financial']));
  const [err, setErr] = useState<string | null>(null);

  const toggle = (m: string) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(m)) n.delete(m); else n.add(m);
      return n;
    });
  };

  const submit = async () => {
    setErr(null);
    if (selected.size === 0) {
      setErr('Selecione pelo menos 1 módulo.');
      return;
    }
    try {
      await create.mutateAsync({
        championshipId: params.id,
        format,
        modules: Array.from(selected) as Array<'results' | 'financial' | 'participants'>,
      });
    } catch (e) {
      setErr(asApiError(e).message);
    }
  };

  const previewErr = list.error as { response?: { data?: { error?: { code?: string } } } } | null;
  const isPreviewBlocked = previewErr?.response?.data?.error?.code === 'PREVIEW_LIMITED';

  if (isPreviewBlocked) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="card text-center">
          <p className="text-4xl">🔒</p>
          <h2 className="mt-3 font-display text-2xl font-bold">Exportação bloqueada no modo preview</h2>
          <p className="mt-2 text-sm text-ink-100">
            Ative a licença completa para desbloquear relatórios PDF e CSV.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-ink-100">Exportações</p>
        <h1 className="font-display text-3xl font-black">Gere relatórios do campeonato</h1>
      </div>

      <div className="card">
        <h2 className="font-display text-xl font-bold">Nova exportação</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <button
            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${format === 'pdf' ? 'border-brand-500 bg-brand-500/10' : 'border-ink-800 bg-ink-800/40 hover:border-brand-500'}`}
            onClick={() => setFormat('pdf')}
          >
            <FileText className="h-8 w-8 text-brand-400" />
            <div>
              <p className="font-semibold">PDF</p>
              <p className="text-xs text-ink-100">Relatório visual pronto para imprimir</p>
            </div>
          </button>
          <button
            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${format === 'csv' ? 'border-brand-500 bg-brand-500/10' : 'border-ink-800 bg-ink-800/40 hover:border-brand-500'}`}
            onClick={() => setFormat('csv')}
          >
            <FileSpreadsheet className="h-8 w-8 text-success" />
            <div>
              <p className="font-semibold">CSV</p>
              <p className="text-xs text-ink-100">Dados brutos para planilha</p>
            </div>
          </button>
        </div>
        <div className="mt-4">
          <p className="mb-2 text-xs uppercase text-ink-100">Módulos a incluir</p>
          <div className="flex flex-wrap gap-3">
            {MODULES.map((m) => (
              <label key={m} className="flex items-center gap-2 rounded-xl border border-ink-800 bg-ink-900 px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.has(m)}
                  onChange={() => toggle(m)}
                  className="accent-brand-500"
                />
                {MODULE_LABEL[m]}
              </label>
            ))}
          </div>
        </div>
        {err ? <p className="mt-3 text-sm text-danger">{err}</p> : null}
        <button className="btn-accent mt-4" onClick={submit} disabled={create.isPending}>
          {create.isPending ? 'Enfileirando...' : 'Gerar exportação'}
        </button>
      </div>

      <div className="card">
        <h2 className="font-display text-xl font-bold">Fila</h2>
        {list.isLoading ? (
          <div className="animate-pulse mt-3 space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-6 rounded bg-ink-800" />)}
          </div>
        ) : (list.data ?? []).length === 0 ? (
          <p className="mt-3 text-sm text-ink-100">Nenhuma exportação ainda.</p>
        ) : (
          <ul className="mt-3 divide-y divide-ink-800">
            {(list.data ?? []).map((j: ExportJob) => (
              <li key={j.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  {STATUS_ICON[j.status]}
                  <div>
                    <p className="font-medium">
                      {j.format.toUpperCase()} · {j.modules.join(', ')}
                    </p>
                    <p className="text-xs text-ink-100">
                      {new Date(j.createdAt).toLocaleString('pt-BR')}
                      {j.errorMessage ? ` · ${j.errorMessage}` : ''}
                    </p>
                  </div>
                </div>
                {j.status === 'completed' && j.fileUrl ? (
                  <Link href={j.fileUrl} className="btn-primary text-xs" target="_blank">
                    Baixar
                  </Link>
                ) : (
                  <span className="text-xs uppercase text-ink-100">{j.status}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
