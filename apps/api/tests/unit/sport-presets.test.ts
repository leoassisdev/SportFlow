import { describe, it, expect } from 'vitest';
import { SPORT_PRESETS, getPreset, isValidSport, listPresets } from '../../src/modules/championship/sport-presets.js';

describe('sport-presets', () => {
  it('possui os 4 esportes do MVP', () => {
    expect(Object.keys(SPORT_PRESETS).sort()).toEqual(['futebol', 'skate', 'tenis', 'volei'].sort());
  });

  it('futebol tem timer, volei nao', () => {
    expect(SPORT_PRESETS.futebol.hasTimer).toBe(true);
    expect(SPORT_PRESETS.volei.hasTimer).toBe(false);
  });

  it('tenis usa sets_and_points com pontuacao classica', () => {
    expect(SPORT_PRESETS.tenis.scoreType).toBe('sets_and_points');
    expect(SPORT_PRESETS.tenis.rulesConfig.pointsScale).toEqual([0, 15, 30, 40]);
  });

  it('skate usa judges_score', () => {
    expect(SPORT_PRESETS.skate.scoreType).toBe('judges_score');
  });

  it('getPreset retorna undefined para chave invalida', () => {
    expect(getPreset('basquete')).toBeUndefined();
  });

  it('isValidSport valida corretamente', () => {
    expect(isValidSport('futebol')).toBe(true);
    expect(isValidSport('basquete')).toBe(false);
  });

  it('listPresets retorna 4 presets', () => {
    expect(listPresets()).toHaveLength(4);
  });
});
