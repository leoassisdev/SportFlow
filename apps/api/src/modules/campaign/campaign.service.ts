import type { CampaignAudience, CampaignChannel } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { ConflictError, NotFoundError } from '../../shared/errors.js';
import { campaignQueue, CAMPAIGN_QUEUE, type CampaignJobPayload } from './campaign.queue.js';
import type { CreateCampaignInput, UpdateCampaignInput } from './campaign.schema.js';

export const campaignService = {
  async create(userId: string, input: CreateCampaignInput) {
    return prisma.campaign.create({
      data: {
        title: input.title,
        channel: input.channel,
        audience: input.audience,
        subject: input.subject ?? null,
        body: input.body,
        scheduledAt: input.scheduledAt ?? null,
        status: 'draft',
        createdBy: userId,
      },
    });
  },

  async list(query: { status?: string; page: number; pageSize: number }) {
    const where = query.status ? { status: query.status as any } : {};
    const [items, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.campaign.count({ where }),
    ]);
    return { items, meta: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) } };
  },

  async get(id: string) {
    const c = await prisma.campaign.findUnique({
      where: { id },
      include: {
        deliveries: { orderBy: { createdAt: 'desc' }, take: 100 },
        _count: { select: { deliveries: true } },
      },
    });
    if (!c) throw new NotFoundError('Campanha');
    return c;
  },

  async update(id: string, input: UpdateCampaignInput) {
    const found = await prisma.campaign.findUnique({ where: { id } });
    if (!found) throw new NotFoundError('Campanha');
    if (found.status !== 'draft' && found.status !== 'scheduled') {
      throw new ConflictError('Campanha já em envio ou enviada');
    }
    return prisma.campaign.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.channel !== undefined ? { channel: input.channel } : {}),
        ...(input.audience !== undefined ? { audience: input.audience } : {}),
        ...(input.subject !== undefined ? { subject: input.subject } : {}),
        ...(input.body !== undefined ? { body: input.body } : {}),
        ...(input.scheduledAt !== undefined ? { scheduledAt: input.scheduledAt } : {}),
      },
    });
  },

  async enqueueSend(id: string) {
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundError('Campanha');
    if (campaign.status === 'sending' || campaign.status === 'sent') {
      throw new ConflictError('Campanha já em envio ou enviada');
    }
    await prisma.campaign.update({ where: { id }, data: { status: 'sending' } });
    const payload: CampaignJobPayload = { campaignId: id };
    await campaignQueue.add(CAMPAIGN_QUEUE, payload, {
      attempts: 1,
      removeOnComplete: 50,
      removeOnFail: 200,
    });
    return { ok: true };
  },

  async remove(id: string) {
    const found = await prisma.campaign.findUnique({ where: { id } });
    if (!found) throw new NotFoundError('Campanha');
    if (found.status === 'sending' || found.status === 'sent') {
      throw new ConflictError('Não pode excluir campanha já enviada (mantida para auditoria)');
    }
    await prisma.campaign.delete({ where: { id } });
  },

  /**
   * Resolve o público com base na audiência da campanha. Filtra por opt-in
   * do canal e contato presente.
   */
  async resolveAudience(audience: CampaignAudience, channel: CampaignChannel) {
    if (audience === 'leads') {
      const leads = await prisma.lead.findMany({
        where: channel === 'email' ? { optInEmail: true } : { optInWhatsapp: true, whatsapp: { not: '' } },
        select: { id: true, email: true, whatsapp: true, name: true },
      });
      return leads.map((l) => ({
        kind: 'lead' as const,
        id: l.id,
        contact: channel === 'email' ? l.email : l.whatsapp,
        name: l.name,
      }));
    }

    const where = {
      deletedAt: null,
      ...(audience === 'users_active' ? { tenant: { status: 'active' as const } } : {}),
      ...(audience === 'users_preview' ? { tenant: { status: 'preview' as const } } : {}),
      ...(channel === 'email' ? { optInEmail: true } : { optInWhatsapp: true }),
    };
    const users = await prisma.user.findMany({
      where,
      select: { id: true, email: true, name: true, tenant: { select: { whatsapp: true } } },
    });
    return users.map((u) => ({
      kind: 'user' as const,
      id: u.id,
      contact: channel === 'email' ? u.email : (u.tenant.whatsapp ?? ''),
      name: u.name,
    }));
  },
};
