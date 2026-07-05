import { prisma } from '../../config/database.js';
import { env } from '../../config/env.js';
import { getStripe, stripeAvailable } from '../../config/stripe.js';
import { ConflictError, NotFoundError } from '../../shared/errors.js';
import { logger } from '../../shared/logger.js';
import type { CreateLicenseInput } from './license.schema.js';

export const licenseService = {
  async create(input: CreateLicenseInput) {
    const tenant = await prisma.tenant.findUnique({ where: { id: input.tenantId } });
    if (!tenant) throw new NotFoundError('Tenant');

    const license = await prisma.license.create({
      data: {
        tenantId: input.tenantId,
        durationDays: input.durationDays,
        priceBrl: input.priceBrl.toFixed(2),
        status: 'pending',
      },
    });

    let checkoutUrl: string | null = null;
    if (stripeAvailable()) {
      try {
        const stripe = getStripe();
        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          success_url: `${env.WEB_URL}/payment/success`,
          cancel_url: `${env.WEB_URL}/payment/cancel`,
          line_items: [
            {
              price_data: {
                currency: 'brl',
                unit_amount: Math.round(input.priceBrl * 100),
                product_data: {
                  name: `SportFlow - Licenca ${input.durationDays} dias`,
                  description: `Tenant: ${tenant.name}`,
                },
              },
              quantity: 1,
            },
          ],
          metadata: { licenseId: license.id, tenantId: input.tenantId },
        });
        checkoutUrl = session.url;
        await prisma.license.update({
          where: { id: license.id },
          data: { stripeSessionId: session.id },
        });
      } catch (err) {
        logger.warn({ err }, 'Stripe indisponivel; licenca criada sem session');
      }
    }

    return { license, checkoutUrl };
  },

  async activate(licenseId: string, stripePaymentId: string) {
    const license = await prisma.license.findUnique({ where: { id: licenseId } });
    if (!license) throw new NotFoundError('Licenca');
    if (license.status === 'active') {
      throw new ConflictError('Licenca ja ativa (idempotencia)');
    }
    const now = new Date();
    const expiresAt = new Date(now.getTime() + license.durationDays * 24 * 60 * 60 * 1000);
    await prisma.$transaction([
      prisma.license.update({
        where: { id: licenseId },
        data: { status: 'active', startsAt: now, expiresAt, stripePaymentId },
      }),
      prisma.tenant.update({
        where: { id: license.tenantId },
        data: { status: 'active' },
      }),
    ]);
    return { activated: true };
  },

  async expireOverdue() {
    const now = new Date();
    const overdue = await prisma.license.findMany({
      where: { status: 'active', expiresAt: { lt: now } },
      select: { id: true, tenantId: true },
    });
    for (const l of overdue) {
      await prisma.$transaction([
        prisma.license.update({ where: { id: l.id }, data: { status: 'expired' } }),
        prisma.tenant.update({ where: { id: l.tenantId }, data: { status: 'expired' } }),
      ]);
    }
    return { expired: overdue.length };
  },
};
