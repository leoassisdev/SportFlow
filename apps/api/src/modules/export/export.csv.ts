import { format } from 'fast-csv';
import type { ExportData } from './export.data.js';

export const buildCsv = async (data: ExportData, modules: string[]): Promise<Buffer> => {
  const rows: Record<string, string | number>[] = [];

  rows.push({ section: 'Campeonato', field: 'Nome', value: data.championship.name });
  rows.push({ section: 'Campeonato', field: 'Esporte', value: data.championship.sportType });
  rows.push({ section: 'Campeonato', field: 'Status', value: data.championship.status });

  if (modules.includes('participants')) {
    data.participants.forEach((p, i) =>
      rows.push({ section: 'Participantes', field: `#${i + 1}`, value: `${p.name}${p.category ? ` (${p.category})` : ''}` }),
    );
  }

  if (modules.includes('results')) {
    data.results.forEach((r, i) =>
      rows.push({
        section: 'Resultados',
        field: `Jogo #${i + 1}`,
        value: `${r.home} ${r.homeScore} × ${r.awayScore} ${r.away} [${r.status}]`,
      }),
    );
  }

  if (modules.includes('financial')) {
    data.financial.forEach((t, i) =>
      rows.push({
        section: 'Financeiro',
        field: `${t.type} ${i + 1}`,
        value: `${t.date.toISOString().slice(0, 10)} · ${t.category} · R$ ${t.amount}${t.sponsor ? ` (${t.sponsor})` : ''}`,
      }),
    );
  }

  return await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const stream = format({ headers: true, delimiter: ';' });
    stream.on('data', (c: Buffer) => chunks.push(c));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
    rows.forEach((r) => stream.write(r));
    stream.end();
  });
};
