import { OAuth2Client } from 'google-auth-library';
import { env } from './env.js';

let clientInstance: OAuth2Client | null = null;

export const getGoogleClient = (): OAuth2Client => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth não configurado (GOOGLE_CLIENT_ID/SECRET)');
  }
  if (!clientInstance) {
    clientInstance = new OAuth2Client({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      redirectUri: env.GOOGLE_REDIRECT_URI,
    });
  }
  return clientInstance;
};

export const googleAvailable = () => Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

export const GOOGLE_SCOPES = ['openid', 'email', 'profile'];
