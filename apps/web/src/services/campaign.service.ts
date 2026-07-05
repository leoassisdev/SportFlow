import { api } from '@/lib/api';

export type CampaignChannel = 'email' | 'whatsapp';
export type CampaignAudience = 'leads' | 'users_active' | 'users_preview' | 'users_all';
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';

export interface Campaign {
  id: string;
  title: string;
  channel: CampaignChannel;
  audience: CampaignAudience;
  subject?: string | null;
  body: string;
  status: CampaignStatus;
  scheduledAt?: string | null;
  sentAt?: string | null;
  sentCount: number;
  skippedCount: number;
  failedCount: number;
  createdAt: string;
}

export interface CreateCampaignInput {
  title: string;
  channel: CampaignChannel;
  audience: CampaignAudience;
  subject?: string;
  body: string;
  scheduledAt?: string;
}

export const campaignService = {
  list: () =>
    api.get<{ items: Campaign[] }>('/superadmin/campaigns').then((r) => r.data.items),
  create: (input: CreateCampaignInput) =>
    api.post<Campaign>('/superadmin/campaigns', input).then((r) => r.data),
  send: (id: string) =>
    api.post<{ ok: boolean }>(`/superadmin/campaigns/${id}/send`).then((r) => r.data),
  remove: (id: string) => api.delete(`/superadmin/campaigns/${id}`),
};
