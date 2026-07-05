import axios, { type AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15000,
});

let refreshingPromise: Promise<unknown> | null = null;

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    if (
      typeof window !== 'undefined' &&
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes('/api/v1/auth/')
    ) {
      original._retry = true;
      refreshingPromise ??= api
        .post('/api/v1/auth/refresh')
        .finally(() => {
          refreshingPromise = null;
        });
      try {
        await refreshingPromise;
        return api(original);
      } catch {
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export const asApiError = (err: unknown): ApiError => {
  const axiosErr = err as AxiosError<{ error?: ApiError }>;
  const data = axiosErr.response?.data;
  if (data?.error) return data.error;
  return { code: 'UNKNOWN', message: axiosErr.message ?? 'Erro inesperado' };
};
