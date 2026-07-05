import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';

const BCRYPT_ROUNDS = 12;

export const hashPassword = (plain: string) => bcrypt.hash(plain, BCRYPT_ROUNDS);
export const comparePassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

export const generateLiveToken = () => randomBytes(16).toString('hex');
export const generateSlug = (base: string) => {
  const slug = base
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  const suffix = randomBytes(3).toString('hex');
  return `${slug || 'tenant'}-${suffix}`;
};
