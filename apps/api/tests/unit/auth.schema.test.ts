import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from '../../src/modules/auth/auth.schema.js';

describe('auth.schema', () => {
  describe('registerSchema', () => {
    it('aceita input valido', () => {
      const parsed = registerSchema.parse({
        name: 'Leonardo',
        email: 'LEO@sportflow.com',
        password: 'Senha123',
        whatsapp: '11 90000-0000',
        sport: 'futebol',
        organizationName: 'Liga do Bairro',
      });
      expect(parsed.email).toBe('leo@sportflow.com');
      expect(parsed.sport).toBe('futebol');
    });

    it('rejeita senha fraca (sem numero)', () => {
      const r = registerSchema.safeParse({
        name: 'X',
        email: 'x@y.com',
        password: 'Sensivel',
        whatsapp: '11 90000-0000',
        sport: 'futebol',
        organizationName: 'Y',
      });
      expect(r.success).toBe(false);
    });

    it('rejeita esporte fora do MVP', () => {
      const r = registerSchema.safeParse({
        name: 'Leo',
        email: 'l@y.com',
        password: 'Senha123',
        whatsapp: '11 90000-0000',
        sport: 'basquete',
        organizationName: 'Y',
      });
      expect(r.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('normaliza email lowercase', () => {
      const parsed = loginSchema.parse({ email: 'A@B.COM', password: 'x' });
      expect(parsed.email).toBe('a@b.com');
    });
  });
});
