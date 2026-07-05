export const SPORTS = [
  { key: 'futebol', label: 'Futebol', icon: '⚽' },
  { key: 'volei', label: 'Volei', icon: '🏐' },
  { key: 'tenis', label: 'Tenis', icon: '🎾' },
  { key: 'skate', label: 'Skate', icon: '🛹' },
] as const;

export type SportKey = (typeof SPORTS)[number]['key'];

export const SPORT_LABEL: Record<SportKey, string> = {
  futebol: 'Futebol',
  volei: 'Volei',
  tenis: 'Tenis',
  skate: 'Skate',
};

export const APP_NAME = 'SportFlow';
export const APP_TAGLINE = 'Organize campeonatos com placar ao vivo, financeiro no controle e relatorios prontos.';
