import { api } from '@/lib/api';

export interface Championship {
  id: string;
  name: string;
  sportType: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  rulesConfig?: Record<string, unknown> | null;
  participantsCount: number;
  matchesCount: number;
  createdAt: string;
}

export interface ListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export const championshipService = {
  list: (params?: { q?: string; sport?: string; status?: string; page?: number }) =>
    api
      .get<{ items: Championship[]; meta: ListMeta }>('/api/v1/championships', { params })
      .then((r) => r.data),

  get: (id: string) =>
    api.get<Championship>(`/api/v1/championships/${id}`).then((r) => r.data),

  create: (input: { name: string; sportType: string; startDate?: string; endDate?: string }) =>
    api.post<Championship>('/api/v1/championships', input).then((r) => r.data),

  remove: (id: string) => api.delete(`/api/v1/championships/${id}`),
};
