'use client';

import { useQuery } from '@tanstack/react-query';
import { superadminService } from '@/services/superadmin.service';

const waLink = (whatsapp: string, name: string) => {
  const digits = whatsapp.replace(/\D/g, '');
  const msg = encodeURIComponent(`Oi ${name}, aqui é do SportFlow. Vi teu cadastro e queria te contar como podemos ajudar seu campeonato...`);
  return `https://wa.me/55${digits}?text=${msg}`;
};

export default function LeadsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['super', 'leads'],
    queryFn: () => superadminService.listLeads(),
  });
  const items = data ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black">Leads recentes</h1>
        <p className="text-sm text-ink-100">Cadastros que ainda não converteram em licença ativa.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-800">
        {isLoading ? (
          <div className="animate-pulse p-4">
            {[...Array(3)].map((_, i) => <div key={i} className="my-2 h-4 rounded bg-ink-800" />)}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-danger">Erro ao carregar leads.</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-100">Nenhum lead ainda.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-ink-900 text-left text-xs uppercase text-ink-100">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3">Esporte</th>
                <th className="px-4 py-3">Consentimento</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800 bg-ink-950">
              {items.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-3 font-medium">{l.name}</td>
                  <td className="px-4 py-3 text-ink-100">{l.email}</td>
                  <td className="px-4 py-3 text-ink-100">{l.whatsapp}</td>
                  <td className="px-4 py-3 capitalize text-ink-100">{l.sport}</td>
                  <td className="px-4 py-3 text-xs">
                    {l.optInEmail ? <span className="badge bg-success/20 text-success">email</span> : null}
                    {l.optInWhatsapp ? <span className="badge ml-1 bg-success/20 text-success">wa</span> : null}
                  </td>
                  <td className="px-4 py-3 text-ink-100">{new Date(l.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3 text-right">
                    <a href={waLink(l.whatsapp, l.name)} target="_blank" rel="noopener" className="btn-accent text-xs">
                      Chamar WhatsApp
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
