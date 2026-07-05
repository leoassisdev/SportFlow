import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from '../../src/modules/auth/auth.schema.js';

const base = {
  name: 'Leonardo',
  email: 'LEO@sportflow.com',
  password: 'Senha123',
  whatsapp: '11 90000-0000',
  sport: 'futebol',
  organizationName: 'Liga do Bairro',
  acceptPrivacy: true,
  acceptEmailMarketing: false,
  acceptWhatsappMarketing: false,
};

describe('auth.schema', () => {
  describe('registerSchema', () => {
    it('aceita input valido', () => {
      const parsed = registerSchema.parse(base);
      expect(parsed.email).toBe('leo@sportflow.com');
      expect(parsed.sport).toBe('futebol');
      expect(parsed.acceptPrivacy).toBe(true);
    });

    it('rejeita quando acceptPrivacy = false', () => {
      const r = registerSchema.safeParse({ ...base, acceptPrivacy: false });
      expect(r.success).toBe(false);
    });

    it('aceita opt-ins de marketing opcionais', () => {
      const r = registerSchema.parse({ ...base, acceptEmailMarketing: true, acceptWhatsappMarketing: true });
      expect(r.acceptEmailMarketing).toBe(true);
      expect(r.acceptWhatsappMarketing).toBe(true);
    });

    it('rejeita senha fraca (sem numero)', () => {
      const r = registerSchema.safeParse({ ...base, password: 'Sensivel' });
      expect(r.success).toBe(false);
    });

    it('rejeita esporte fora do MVP', () => {
      const r = registerSchema.safeParse({ ...base, sport: 'basquete' });
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
