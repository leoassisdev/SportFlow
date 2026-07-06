import { api } from '@/lib/api';

export interface Participant {
  id: string;
  championshipId: string;
  name: string;
  category: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export const participantService = {
  list: (championshipId: string) =>
    api
      .get<{ items: Participant[] }>('/api/v1/participants', { params: { championshipId } })
      .then((r) => r.data.items),
  create: (input: { championshipId: string; name: string; category?: string }) =>
    api.post<Participant>('/api/v1/participants', input).then((r) => r.data),
  update: (id: string, input: { name?: string; category?: string }) =>
    api.patch<Participant>(`/api/v1/participants/${id}`, input).then((r) => r.data),
  remove: (id: string) => api.delete(`/api/v1/participants/${id}`),
};
