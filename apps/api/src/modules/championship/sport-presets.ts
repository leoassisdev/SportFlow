/**
 * Sport presets — configuração padrão de cada esporte do MVP.
 * MVP: Futebol, Vôlei, Tênis, Skate.
 * Adicionar novo esporte AQUI não exige alteração de schema — `rulesConfig` no
 * modelo `Championship` é JSONB livre.
 *
 * Nota: as chaves ficam SEM acento (identifiers válidos e URL-safe). Só o
 * `label` é exibido pro usuário e usa acento.
 */

export type SportKey = 'futebol' | 'volei' | 'tenis' | 'skate';
export type ScoreType = 'goals' | 'sets_and_points' | 'judges_score';

export interface SportPreset {
  key: SportKey;
  label: string;
  scoreType: ScoreType;
  hasTimer: boolean;
  maxParticipants: number;
  rulesConfig: Record<string, unknown>;
}

export const SPORT_PRESETS: Record<SportKey, SportPreset> = {
  futebol: {
    key: 'futebol',
    label: 'Futebol',
    scoreType: 'goals',
    hasTimer: true,
    maxParticipants: 32,
    rulesConfig: {
      periods: 2,
      periodDuration: 45,
      allowExtraTime: false,
      allowShootout: false,
    },
  },
  volei: {
    key: 'volei',
    label: 'Vôlei',
    scoreType: 'sets_and_points',
    hasTimer: false,
    maxParticipants: 16,
    rulesConfig: {
      setsToWin: 3,
      pointsPerSet: 25,
      tieBreakPoints: 15,
    },
  },
  tenis: {
    key: 'tenis',
    label: 'Tênis',
    scoreType: 'sets_and_points',
    hasTimer: false,
    maxParticipants: 64,
    rulesConfig: {
      setsToWin: 2,
      gamesPerSet: 6,
      tieBreakAt: 6,
      pointsScale: [0, 15, 30, 40],
    },
  },
  skate: {
    key: 'skate',
    label: 'Skate',
    scoreType: 'judges_score',
    hasTimer: false,
    maxParticipants: 64,
    rulesConfig: {
      rounds: 3,
      maxScore: 100,
      judges: 5,
    },
  },
};

export const listPresets = () => Object.values(SPORT_PRESETS);

export const getPreset = (key: string): SportPreset | undefined => {
  if (key in SPORT_PRESETS) return SPORT_PRESETS[key as SportKey];
  return undefined;
};

export const isValidSport = (key: string): key is SportKey => key in SPORT_PRESETS;
