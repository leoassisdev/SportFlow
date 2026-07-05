import Link from 'next/link';

export const metadata = { title: 'Politica de Privacidade' };

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-ink-950 px-6 py-12 text-ink-50">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link href="/" className="text-xs text-brand-400 hover:text-brand-300">
            ← Voltar
          </Link>
          <h1 className="mt-4 font-display text-4xl font-black">Politica de Privacidade</h1>
          <p className="mt-2 text-sm text-ink-100">Versao 2026-07-05-v1</p>
        </div>

        <section className="card space-y-3">
          <h2 className="font-display text-xl font-bold">1. Quem somos</h2>
          <p className="text-sm text-ink-100">
            SportFlow e uma plataforma SaaS de gestao de campeonatos esportivos, operada pela
            FlowCore. Este documento explica como coletamos, usamos e protegemos seus dados
            pessoais.
          </p>
        </section>

        <section className="card space-y-3">
          <h2 className="font-display text-xl font-bold">2. Que dados coletamos</h2>
          <ul className="list-disc pl-6 text-sm text-ink-100">
            <li>Dados de cadastro: nome, email, WhatsApp, senha (criptografada com bcrypt).</li>
            <li>Dados do time/liga: nome, esporte, calendario de jogos.</li>
            <li>
              Login Google: apenas nome, email e foto de perfil publica. Nunca acessamos seus
              contatos ou arquivos.
            </li>
            <li>Registros tecnicos: IP, user agent, timestamps para auditoria e seguranca.</li>
          </ul>
        </section>

        <section className="card space-y-3">
          <h2 className="font-display text-xl font-bold">3. Para que usamos</h2>
          <ul className="list-disc pl-6 text-sm text-ink-100">
            <li>Operar sua conta e seus campeonatos.</li>
            <li>Enviar comunicados operacionais (senha, licenca, expiracao).</li>
            <li>
              Enviar ofertas e novidades — <b>apenas se voce autorizar</b> no cadastro ou nas
              Configuracoes.
            </li>
            <li>Melhorar o servico com metricas agregadas e anonimas.</li>
          </ul>
        </section>

        <section className="card space-y-3">
          <h2 className="font-display text-xl font-bold">4. Seus direitos (LGPD)</h2>
          <ul className="list-disc pl-6 text-sm text-ink-100">
            <li>Acessar seus dados em <Link href="/settings/privacidade" className="text-brand-400 underline">Configuracoes → Privacidade</Link>.</li>
            <li>Corrigir dados incorretos.</li>
            <li>Excluir sua conta (retencao de 30 dias apos exclusao, para auditoria).</li>
            <li>Revogar consentimento de marketing a qualquer momento.</li>
            <li>Portabilidade: exportar seus dados em CSV/JSON.</li>
          </ul>
        </section>

        <section className="card space-y-3">
          <h2 className="font-display text-xl font-bold">5. Compartilhamento</h2>
          <p className="text-sm text-ink-100">
            Nao vendemos seus dados. Compartilhamos apenas com provedores essenciais:
          </p>
          <ul className="list-disc pl-6 text-sm text-ink-100">
            <li>Google (autenticacao OAuth 2.0).</li>
            <li>Stripe (processamento de pagamentos).</li>
            <li>Azure (hospedagem e armazenamento).</li>
            <li>Sentry (monitoramento de erros — sem dados pessoais sensiveis).</li>
          </ul>
        </section>

        <section className="card space-y-3">
          <h2 className="font-display text-xl font-bold">6. Seguranca</h2>
          <p className="text-sm text-ink-100">
            Senhas com bcrypt cost 12, JWT em cookies HttpOnly, TLS obrigatorio em producao,
            Row-Level Security no PostgreSQL, isolamento total entre clientes (multi-tenant).
          </p>
        </section>

        <section className="card space-y-3">
          <h2 className="font-display text-xl font-bold">7. Contato</h2>
          <p className="text-sm text-ink-100">
            Duvidas ou solicitacoes:{' '}
            <a href="mailto:privacidade@sportflow.com.br" className="text-brand-400 underline">
              privacidade@sportflow.com.br
            </a>
          </p>
        </section>

        <p className="text-center text-xs text-ink-400">
          Ultima atualizacao: 05 de julho de 2026 · Versao 2026-07-05-v1
        </p>
      </div>
    </main>
  );
}
