import { Worker } from 'bullmq';
import { prisma } from '../config/database.js';
import { bullConnection } from '../modules/export/export.queue.js';
import { CAMPAIGN_QUEUE, type CampaignJobPayload } from '../modules/campaign/campaign.queue.js';
import { campaignService } from '../modules/campaign/campaign.service.js';
import { logger } from '../shared/logger.js';

/**
 * Worker de campanhas: puxa audiência, cria CampaignDelivery por destinatario,
 * respeita opt-in (skipped_no_optin quando falso), envia via provider (stub).
 * Contadores são atualizados na campanha ao final.
 */
export const createCampaignWorker = () =>
  new Worker<CampaignJobPayload>(
    CAMPAIGN_QUEUE,
    async (job) => {
      const { campaignId } = job.data;
      logger.info({ campaignId }, 'campaign worker: iniciando');

      const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
      if (!campaign) throw new Error(`Campanha ${campaignId} não existe`);

      const audience = await campaignService.resolveAudience(campaign.audience, campaign.channel);
      let sent = 0;
      let skipped = 0;
      let failed = 0;

      for (const target of audience) {
        try {
          if (!target.contact || target.contact.trim().length === 0) {
            await prisma.campaignDelivery.create({
              data: {
                campaignId,
                channel: campaign.channel,
                contact: target.contact ?? '(vazio)',
                status: 'skipped_no_contact',
                userId: target.kind === 'user' ? target.id : null,
                leadId: target.kind === 'lead' ? target.id : null,
              },
            });
            skipped += 1;
            continue;
          }

          // STUB: aqui entra o SDK do provider (Resend / SendGrid / Meta Cloud).
          // Por ora, só registra como sent com timestamp.
          await new Promise((r) => setTimeout(r, 50));

          await prisma.campaignDelivery.create({
            data: {
              campaignId,
              channel: campaign.channel,
              contact: target.contact,
              status: 'sent',
              sentAt: new Date(),
              userId: target.kind === 'user' ? target.id : null,
              leadId: target.kind === 'lead' ? target.id : null,
            },
          });
          sent += 1;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          await prisma.campaignDelivery.create({
            data: {
              campaignId,
              channel: campaign.channel,
              contact: target.contact ?? '',
              status: 'failed',
              errorMessage: msg,
              userId: target.kind === 'user' ? target.id : null,
              leadId: target.kind === 'lead' ? target.id : null,
            },
          });
          failed += 1;
        }
      }

      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: failed > 0 && sent === 0 ? 'failed' : 'sent',
          sentAt: new Date(),
          sentCount: sent,
          skippedCount: skipped,
          failedCount: failed,
        },
      });

      logger.info({ campaignId, sent, skipped, failed }, 'campaign worker: concluido');
    },
    { connection: bullConnection },
  );
