import { describe, it, expect } from 'vitest';
import { generateLiveToken, generateSlug, hashPassword, comparePassword } from '../../src/shared/crypto.js';

describe('crypto helpers', () => {
  it('gera live token de 32 chars hex', () => {
    const t = generateLiveToken();
    expect(t).toMatch(/^[a-f0-9]{32}$/);
  });

  it('slug remove acento e espaco', () => {
    const s = generateSlug('Liga do Bairro São Paulo');
    expect(s).toMatch(/^liga-do-bairro-sao-paulo-[a-f0-9]{6}$/);
  });

  it('hash+compare password funciona', async () => {
    const hash = await hashPassword('Senha123');
    expect(await comparePassword('Senha123', hash)).toBe(true);
    expect(await comparePassword('Errada', hash)).toBe(false);
  });
});
