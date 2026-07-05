import Image from 'next/image';
import Link from 'next/link';

const TXS = [
  { id: '1', type: 'income', category: 'Inscrição', amount: 400, description: 'Time A - Grupo A', date: '01/07', sponsor: null },
  { id: '2', type: 'income', category: 'Patrocinio', amount: 1500, description: 'Padaria Central', date: '02/07', sponsor: 'Padaria Central' },
  { id: '3', type: 'expense', category: 'Arbitragem', amount: -280, description: 'Árbitro Silva', date: '03/07', sponsor: null },
  { id: '4', type: 'expense', category: 'Aluguel', amount: -600, description: 'Quadra municipal', date: '04/07', sponsor: null },
] as const;

export const metadata = { title: 'Financeiro' };

export default function FinancialPage({ params: _params }: { params: { id: string } }) {
  const income = TXS.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const expense = Math.abs(TXS.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0));
  const balance = income - expense;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-ink-800">
        <Image
          src="/imagens/v2/geral/financeiro-sponsor.png"
          alt=""
          width={1200}
          height={400}
          className="h-40 w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/70 to-transparent" />
        <div className="absolute inset-0 flex items-end justify-between p-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink-100">Financeiro do campeonato</p>
            <h1 className="font-display text-3xl font-black">Interbairros 2026</h1>
          </div>
          <button className="btn-accent">+ Nova transação</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Receita" value={`R$ ${income.toLocaleString('pt-BR')}`} tone="success" />
        <StatCard label="Despesa" value={`R$ ${expense.toLocaleString('pt-BR')}`} tone="danger" />
        <StatCard label="Saldo" value={`R$ ${balance.toLocaleString('pt-BR')}`} tone={balance >= 0 ? 'success' : 'danger'} />
        <StatCard label="Patrocinadores" value="1" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-800">
        <table className="w-full text-sm">
          <thead className="bg-ink-900 text-left text-xs uppercase text-ink-100">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3 text-right">Valor</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-800 bg-ink-950">
            {TXS.map((t) => (
              <tr key={t.id} className="hover:bg-ink-900/60">
                <td className="px-4 py-3 text-ink-100">{t.date}</td>
                <td className="px-4 py-3">{t.category}</td>
                <td className="px-4 py-3 text-ink-100">{t.description}</td>
                <td
                  className={`px-4 py-3 text-right font-mono font-bold ${
                    t.type === 'income' ? 'text-success' : 'text-danger'
                  }`}
                >
                  {t.type === 'income' ? '+' : '-'} R$ {Math.abs(t.amount).toLocaleString('pt-BR')}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href="#" className="btn-ghost text-xs">Editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone?: 'success' | 'danger' }) {
  const color = tone === 'success' ? 'text-success' : tone === 'danger' ? 'text-danger' : 'text-white';
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-widest text-ink-100">{label}</p>
      <p className={`mt-2 font-display text-3xl font-black ${color}`}>{value}</p>
    </div>
  );
}
