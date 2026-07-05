import { api } from '@/lib/api';

export interface ExportJob {
  id: string;
  championshipId: string;
  format: 'pdf' | 'csv';
  modules: Array<'results' | 'financial' | 'participants'>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileUrl: string | null;
  errorMessage: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface CreateExportInput {
  championshipId: string;
  format: 'pdf' | 'csv';
  modules: Array<'results' | 'financial' | 'participants'>;
}

export const exportService = {
  list: (championshipId: string) =>
    api
      .get<{ items: ExportJob[] }>('/api/v1/export-jobs', { params: { championshipId } })
      .then((r) => r.data.items),
  create: (input: CreateExportInput) =>
    api.post<ExportJob>('/api/v1/export-jobs', input).then((r) => r.data),
  status: (id: string) => api.get<ExportJob>(`/api/v1/export-jobs/${id}`).then((r) => r.data),
};
