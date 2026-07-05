import { api } from '@/lib/api';

export interface SuperMetrics {
  tenants: { total: number; active: number; preview: number; expired: number };
  leadsThisMonth: number;
  championshipsThisMonth: number;
  mrrBrl: number;
}

export interface AdminTenant {
  id: string;
  slug: string;
  name: string;
  email: string;
  status: 'preview' | 'active' | 'suspended' | 'expired';
  createdAt: string;
  _count?: { users: number; championships: number };
  licenses?: Array<{ id: string; status: string; expiresAt: string | null }>;
}

export interface AdminLead {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  sport: string;
  source: string | null;
  convertedAt: string | null;
  createdAt: string;
  optInEmail: boolean;
  optInWhatsapp: boolean;
}

export interface AdminAuditLog {
  id: string;
  tenantId: string;
  userId: string | null;
  action: string;
  resource: string;
  payload: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

export const superadminService = {
  metrics: () => api.get<SuperMetrics>('/superadmin/metrics').then((r) => r.data),
  listTenants: (params?: { q?: string; status?: string; page?: number }) =>
    api.get<{ items: AdminTenant[] }>('/superadmin/tenants', { params }).then((r) => r.data.items),
  listLeads: (params?: { page?: number }) =>
    api.get<{ items: AdminLead[] }>('/superadmin/leads', { params }).then((r) => r.data.items),
  listAuditLogs: (params?: { tenantId?: string; action?: string; page?: number }) =>
    api.get<{ items: AdminAuditLog[] }>('/superadmin/audit-logs', { params }).then((r) => r.data.items),
  createLicense: (input: { tenantId: string; durationDays: number; priceBrl: number }) =>
    api.post('/superadmin/licenses', input).then((r) => r.data),
};
