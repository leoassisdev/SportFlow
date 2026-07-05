import { api } from '@/lib/api';

export type ConsentKind =
  | 'privacy_policy'
  | 'terms_of_service'
  | 'email_marketing'
  | 'whatsapp_marketing';

export interface ConsentState {
  current: Record<ConsentKind, { accepted: boolean; version: string; at: string } | undefined>;
  history: Array<{ id: string; kind: ConsentKind; accepted: boolean; version: string; createdAt: string }>;
  currentVersion: string;
}

export const consentService = {
  mine: () => api.get<ConsentState>('/api/v1/consents/mine').then((r) => r.data),
  set: (kind: ConsentKind, accepted: boolean) =>
    api.post('/api/v1/consents', { kind, accepted }).then((r) => r.data),
};
