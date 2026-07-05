import { api } from '@/lib/api';

export interface Transaction {
  id: string;
  championshipId: string;
  type: 'income' | 'expense';
  category: string;
  amount: string;
  description: string | null;
  sponsorName: string | null;
  transactionDate: string;
  createdAt: string;
}

export interface FinancialSummary {
  income: number;
  expense: number;
  balance: number;
  byCategory: Record<string, number>;
  sponsors: string[];
}

export interface CreateTransactionInput {
  championshipId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  sponsorName?: string;
  transactionDate: string;
}

export const financialService = {
  list: (championshipId: string) =>
    api
      .get<{ items: Transaction[] }>('/api/v1/financial/transactions', { params: { championshipId } })
      .then((r) => r.data.items),
  summary: (championshipId: string) =>
    api
      .get<FinancialSummary>('/api/v1/financial/summary', { params: { championshipId } })
      .then((r) => r.data),
  create: (input: CreateTransactionInput) =>
    api.post<Transaction>('/api/v1/financial/transactions', input).then((r) => r.data),
  remove: (id: string) => api.delete(`/api/v1/financial/transactions/${id}`),
};
