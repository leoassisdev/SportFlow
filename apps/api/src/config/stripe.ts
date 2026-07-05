import Stripe from 'stripe';
import { env } from './env.js';

let stripeInstance: Stripe | null = null;

export const getStripe = (): Stripe => {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY nao configurado');
  }
  if (!stripeInstance) {
    stripeInstance = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia' as Stripe.LatestApiVersion,
    });
  }
  return stripeInstance;
};

export const stripeAvailable = () => Boolean(env.STRIPE_SECRET_KEY);
