import express, { Router, type Request, type Response } from 'express';
import type Stripe from 'stripe';
import { env } from '../../config/env.js';
import { getStripe, stripeAvailable } from '../../config/stripe.js';
import { logger } from '../../shared/logger.js';
import { licenseService } from './license.service.js';

const router = Router();

// Stripe exige raw body para verificar assinatura HMAC.
router.post('/stripe', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  if (!stripeAvailable() || !env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({ error: { code: 'STRIPE_DISABLED', message: 'Stripe nao configurado' } });
  }

  const sig = req.headers['stripe-signature'];
  if (!sig || Array.isArray(sig)) {
    return res.status(400).json({ error: { code: 'BAD_SIGNATURE', message: 'Assinatura ausente' } });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(req.body as Buffer, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.warn({ err }, 'assinatura Stripe invalida');
    return res.status(400).json({ error: { code: 'BAD_SIGNATURE', message: 'Assinatura invalida' } });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const licenseId = session.metadata?.licenseId;
    if (!licenseId) {
      logger.warn({ sessionId: session.id }, 'metadata.licenseId ausente');
      return res.status(200).json({ ok: true });
    }
    try {
      await licenseService.activate(licenseId, session.payment_intent as string);
      logger.info({ licenseId }, 'licenca ativada via webhook');
    } catch (err) {
      logger.warn({ err, licenseId }, 'ativacao falhou (talvez ja ativa)');
    }
  }

  return res.json({ received: true });
});

export { router as stripeWebhookRoutes };
