import { Queue, type ConnectionOptions } from 'bullmq';
import { bullConnection } from '../export/export.queue.js';

export const CAMPAIGN_QUEUE = 'campaign-sender';

export const campaignQueue = new Queue(CAMPAIGN_QUEUE, {
  connection: bullConnection as ConnectionOptions,
});

export interface CampaignJobPayload {
  campaignId: string;
}
