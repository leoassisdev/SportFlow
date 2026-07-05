'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { superadminService } from '@/services/superadmin.service';

export default function AuditLogsPage() {
  const [action, setAction] = useState('');
  const { data, isLoading, error } = useQuery({
    queryKey: ['super', 'audit', { action }],
    queryFn: () => superadminService.listAuditLogs({ action: action || undefined }),
  });
  const items = data ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="font-display text-3xl font-black">Auditoria</h1>

      <div className="card space-y-3">
        <div className="grid gap-3 md:grid-cols-4">
          <input className="input-base md:col-span-2" placeholder="Filtrar por ação (ex: PATCH)" value={action} onChange={(e) => setAction(e.target.value)} />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-800">
        {isLoading ? (
          <div className="animate-pulse p-4">
            {[...Array(3)].map((_, i) => <div key={i} className="my-2 h-4 rounded bg-ink-800" />)}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-danger">Erro ao carregar logs.</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-100">Nenhum log ainda.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-ink-900 text-left text-xs uppercase text-ink-100">
              <tr>
                <th className="px-4 py-3">Quando</th>
                <th className="px-4 py-3">Tenant</th>
                <th className="px-4 py-3">Usuário</th>
                <th className="px-4 py-3">Ação</th>
                <th className="px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800 bg-ink-950 font-mono text-xs">
              {items.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-2 text-ink-100">{new Date(l.createdAt).toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-2">{l.tenantId?.slice(0, 8) ?? '—'}</td>
                  <td className="px-4 py-2 text-ink-100">{l.userId?.slice(0, 8) ?? '—'}</td>
                  <td className="px-4 py-2 text-brand-300">{l.action}</td>
                  <td className="px-4 py-2 text-ink-100">{l.ipAddress ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
