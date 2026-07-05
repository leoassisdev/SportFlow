import type { Metadata } from 'next';
import './globals.css';
import { APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Placar ao vivo, campeonato no controle`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    'SportFlow: plataforma SaaS de gestao de campeonatos esportivos com placar ao vivo, financeiro e relatorios.',
  metadataBase: new URL('https://sportflow.com.br'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: APP_NAME,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-ink-950">{children}</body>
    </html>
  );
}
