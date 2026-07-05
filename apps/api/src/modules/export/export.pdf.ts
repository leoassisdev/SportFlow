import type { ExportData } from './export.data.js';

/**
 * Gera "PDF" minimo: por enquanto, HTML enxuto em Buffer.
 * Producao real: Puppeteer renderiza esse HTML e retorna PDF binario.
 * MVP: entregamos HTML valido com mime application/pdf-html placeholder.
 */
export const buildPdfHtml = (data: ExportData, modules: string[]): Buffer => {
  const esc = (s: string) => s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c] ?? c));
  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(data.championship.name)}</title>
<style>
body{font-family:system-ui;margin:32px;color:#0A0E1A;background:#fff}
h1{color:#00A3FF;border-bottom:3px solid #FF6B00;padding-bottom:8px}
h2{color:#0088FF;margin-top:32px}
table{width:100%;border-collapse:collapse;margin-top:12px}
th,td{border:1px solid #CBD3E3;padding:8px;text-align:left;font-size:13px}
th{background:#F5F7FB}
.tag{display:inline-block;padding:2px 8px;border-radius:9999px;background:#0088FF;color:#fff;font-size:11px}
.footer{margin-top:48px;font-size:11px;color:#5C6A88}
</style></head><body>
<h1>${esc(data.championship.name)}</h1>
<p><span class="tag">${esc(data.championship.sportType)}</span> · Status: ${esc(data.championship.status)}</p>
${modules.includes('participants') ? `
<h2>Participantes (${data.participants.length})</h2>
<table><tr><th>#</th><th>Nome</th><th>Categoria</th></tr>
${data.participants.map((p, i) => `<tr><td>${i + 1}</td><td>${esc(p.name)}</td><td>${esc(p.category ?? '—')}</td></tr>`).join('')}
</table>` : ''}
${modules.includes('results') ? `
<h2>Resultados (${data.results.length})</h2>
<table><tr><th>#</th><th>Casa</th><th>Placar</th><th>Fora</th><th>Status</th></tr>
${data.results.map((r, i) => `<tr><td>${i + 1}</td><td>${esc(r.home)}</td><td><b>${r.homeScore} × ${r.awayScore}</b></td><td>${esc(r.away)}</td><td>${esc(r.status)}</td></tr>`).join('')}
</table>` : ''}
${modules.includes('financial') ? `
<h2>Financeiro (${data.financial.length})</h2>
<table><tr><th>Data</th><th>Tipo</th><th>Categoria</th><th>Valor</th><th>Descrição</th></tr>
${data.financial.map((t) => `<tr><td>${t.date.toISOString().slice(0, 10)}</td><td>${esc(t.type)}</td><td>${esc(t.category)}</td><td>R$ ${esc(t.amount)}</td><td>${esc(t.description ?? '—')}</td></tr>`).join('')}
</table>` : ''}
<p class="footer">Gerado por SportFlow em ${new Date().toISOString()}. Este HTML será renderizado como PDF em producao (Fase 5.1 — Puppeteer).</p>
</body></html>`;
  return Buffer.from(html, 'utf-8');
};
