import { api } from '@/lib/api';

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'owner' | 'member';
  tenantId: string;
  tenant?: { id: string; slug: string; name: string; status: string };
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  whatsapp: string;
  sport: 'futebol' | 'volei' | 'tenis' | 'skate';
  organizationName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const authService = {
  register: (input: RegisterInput) =>
    api.post<{ user: UserResponse }>('/api/v1/auth/register', input).then((r) => r.data),

  login: (input: LoginInput) =>
    api.post<{ user: UserResponse }>('/api/v1/auth/login', input).then((r) => r.data),

  logout: () => api.post('/api/v1/auth/logout'),
};
