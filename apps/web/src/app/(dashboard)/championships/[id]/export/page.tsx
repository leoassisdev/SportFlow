import Link from 'next/link';
import { FileText, FileSpreadsheet, Clock, CheckCircle2, XCircle } from 'lucide-react';

const JOBS = [
  { id: 'j1', format: 'pdf', modules: ['results', 'financial'], status: 'completed', when: '05/07 10:22', url: '#' },
  { id: 'j2', format: 'csv', modules: ['participants'], status: 'processing', when: '05/07 11:03', url: null },
  { id: 'j3', format: 'pdf', modules: ['results'], status: 'failed', when: '04/07 18:44', url: null, error: 'Timeout Puppeteer' },
] as const;

const STATUS_ICON: Record<string, JSX.Element> = {
  completed: <CheckCircle2 className="h-4 w-4 text-success" />,
  processing: <Clock className="h-4 w-4 animate-spin text-brand-500" />,
  pending: <Clock className="h-4 w-4 text-ink-400" />,
  failed: <XCircle className="h-4 w-4 text-danger" />,
};

export const metadata = { title: 'Exportacoes' };

export default function ExportPage({ params: _params }: { params: { id: string } }) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-ink-100">Exportacoes</p>
        <h1 className="font-display text-3xl font-black">Gere relatorios do campeonato</h1>
      </div>

      <div className="card">
        <h2 className="font-display text-xl font-bold">Nova exportacao</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <button className="flex items-center gap-3 rounded-2xl border border-ink-800 bg-ink-800/40 p-4 text-left hover:border-brand-500">
            <FileText className="h-8 w-8 text-brand-400" />
            <div>
              <p className="font-semibold">PDF</p>
              <p className="text-xs text-ink-100">Relatorio visual pronto para imprimir</p>
            </div>
          </button>
          <button className="flex items-center gap-3 rounded-2xl border border-ink-800 bg-ink-800/40 p-4 text-left hover:border-brand-500">
            <FileSpreadsheet className="h-8 w-8 text-success" />
            <div>
              <p className="font-semibold">CSV</p>
              <p className="text-xs text-ink-100">Dados brutos para planilha</p>
            </div>
          </button>
        </div>
        <div className="mt-4">
          <p className="mb-2 text-xs uppercase text-ink-100">Modulos a incluir</p>
          <div className="flex flex-wrap gap-3">
            {['Resultados', 'Financeiro', 'Participantes'].map((m) => (
              <label key={m} className="flex items-center gap-2 rounded-xl border border-ink-800 bg-ink-900 px-3 py-2 text-sm">
                <input type="checkbox" defaultChecked className="accent-brand-500" />
                {m}
              </label>
            ))}
          </div>
        </div>
        <button className="btn-accent mt-4">Gerar exportacao</button>
      </div>

      <div className="card">
        <h2 className="font-display text-xl font-bold">Fila</h2>
        <ul className="mt-3 divide-y divide-ink-800">
          {JOBS.map((j) => (
            <li key={j.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                {STATUS_ICON[j.status]}
                <div>
                  <p className="font-medium">
                    {j.format.toUpperCase()} · {j.modules.join(', ')}
                  </p>
                  <p className="text-xs text-ink-100">{j.when} {'error' in j ? `· ${j.error}` : ''}</p>
                </div>
              </div>
              {j.status === 'completed' && j.url ? (
                <Link href={j.url} className="btn-primary text-xs">
                  Baixar
                </Link>
              ) : (
                <span className="text-xs uppercase text-ink-100">{j.status}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
