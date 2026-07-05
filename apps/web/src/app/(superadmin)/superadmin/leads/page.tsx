const LEADS = [
  { id: 'l1', name: 'Rodrigo Nunes', email: 'rodrigo@zonasul.com', whatsapp: '11 90000-1234', sport: 'futebol', createdAt: '04/07' },
  { id: 'l2', name: 'Camila Alves', email: 'camila@voleiescolar.com', whatsapp: '11 90000-4321', sport: 'volei', createdAt: '03/07' },
  { id: 'l3', name: 'Fabio Skate', email: 'fabio@skatecrew.com', whatsapp: '11 90000-9876', sport: 'skate', createdAt: '02/07' },
];

export const metadata = { title: 'SuperAdmin — Leads' };

const waLink = (whatsapp: string, name: string) => {
  const digits = whatsapp.replace(/\D/g, '');
  const msg = encodeURIComponent(`Oi ${name}, aqui e do SportFlow. Vi teu cadastro e queria te contar como podemos ajudar seu campeonato...`);
  return `https://wa.me/55${digits}?text=${msg}`;
};

export default function LeadsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="font-display text-3xl font-black">Leads recentes</h1>
      <div className="overflow-hidden rounded-2xl border border-ink-800">
        <table className="w-full text-sm">
          <thead className="bg-ink-900 text-left text-xs uppercase text-ink-100">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">WhatsApp</th>
              <th className="px-4 py-3">Esporte</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-800 bg-ink-950">
            {LEADS.map((l) => (
              <tr key={l.id}>
                <td className="px-4 py-3 font-medium">{l.name}</td>
                <td className="px-4 py-3 text-ink-100">{l.email}</td>
                <td className="px-4 py-3 text-ink-100">{l.whatsapp}</td>
                <td className="px-4 py-3 capitalize text-ink-100">{l.sport}</td>
                <td className="px-4 py-3 text-ink-100">{l.createdAt}</td>
                <td className="px-4 py-3 text-right">
                  <a href={waLink(l.whatsapp, l.name)} target="_blank" rel="noopener" className="btn-accent text-xs">
                    Chamar WhatsApp
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
