'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { superadminService } from '@/services/superadmin.service';

export default function TenantsPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const { data, isLoading, error } = useQuery({
    queryKey: ['super', 'tenants', { q, status }],
    queryFn: () => superadminService.listTenants({ q: q || undefined, status: status || undefined }),
  });

  const items = data ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-black">Tenants</h1>
        <div className="flex gap-2">
          <input className="input-base" placeholder="Buscar por nome..." value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="input-base" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="preview">Preview</option>
            <option value="active">Ativo</option>
            <option value="expired">Expirado</option>
            <option value="suspended">Suspenso</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-800">
        {isLoading ? (
          <div className="animate-pulse p-4">
            {[...Array(4)].map((_, i) => <div key={i} className="my-2 h-4 rounded bg-ink-800" />)}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-danger">Erro ao carregar tenants.</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-100">Nenhum tenant encontrado.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-ink-900 text-left text-xs uppercase text-ink-100">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Usuários</th>
                <th className="px-4 py-3">Campeonatos</th>
                <th className="px-4 py-3">Criado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800 bg-ink-950">
              {items.map((t) => (
                <tr key={t.id} className="hover:bg-ink-900/60">
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3 text-ink-100">{t.email}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${
                      t.status === 'active' ? 'bg-success/20 text-success' :
                      t.status === 'preview' ? 'bg-warning/20 text-warning' :
                      'bg-danger/20 text-danger'
                    }`}>{t.status}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-100">{t._count?.users ?? 0}</td>
                  <td className="px-4 py-3 text-ink-100">{t._count?.championships ?? 0}</td>
                  <td className="px-4 py-3 text-ink-100">{new Date(t.createdAt).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
