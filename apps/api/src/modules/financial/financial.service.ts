import { prisma } from '../../config/database.js';
import { NotFoundError, PreviewLimitedError } from '../../shared/errors.js';
import type { CreateTransactionInput, UpdateTransactionInput } from './financial.schema.js';

const isTenantPreview = async (tenantId: string) => {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { status: true } });
  return t?.status === 'preview';
};

const guardPreview = async (tenantId: string) => {
  if (await isTenantPreview(tenantId)) {
    throw new PreviewLimitedError('Financeiro');
  }
};

export const financialService = {
  async create(tenantId: string, input: CreateTransactionInput) {
    await guardPreview(tenantId);
    const championship = await prisma.championship.findFirst({
      where: { id: input.championshipId, tenantId, deletedAt: null },
      select: { id: true },
    });
    if (!championship) throw new NotFoundError('Campeonato');
    return prisma.financialTransaction.create({
      data: {
        tenantId,
        championshipId: input.championshipId,
        type: input.type,
        category: input.category,
        amount: input.amount.toFixed(2),
        description: input.description ?? null,
        sponsorName: input.sponsorName ?? null,
        transactionDate: input.transactionDate,
      },
    });
  },

  async list(tenantId: string, championshipId: string) {
    await guardPreview(tenantId);
    return prisma.financialTransaction.findMany({
      where: { tenantId, championshipId, deletedAt: null },
      orderBy: { transactionDate: 'desc' },
    });
  },

  async summary(tenantId: string, championshipId: string) {
    await guardPreview(tenantId);
    const txs = await prisma.financialTransaction.findMany({
      where: { tenantId, championshipId, deletedAt: null },
      select: { type: true, amount: true, category: true, sponsorName: true },
    });
    let income = 0;
    let expense = 0;
    const byCategory: Record<string, number> = {};
    const sponsors = new Set<string>();
    for (const t of txs) {
      const value = Number(t.amount.toString());
      if (t.type === 'income') income += value;
      else expense += value;
      byCategory[t.category] = (byCategory[t.category] ?? 0) + value;
      if (t.sponsorName) sponsors.add(t.sponsorName);
    }
    return {
      income,
      expense,
      balance: income - expense,
      byCategory,
      sponsors: Array.from(sponsors),
    };
  },

  async update(tenantId: string, id: string, input: UpdateTransactionInput) {
    await guardPreview(tenantId);
    const found = await prisma.financialTransaction.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!found) throw new NotFoundError('Transação');
    return prisma.financialTransaction.update({
      where: { id },
      data: {
        ...(input.type !== undefined ? { type: input.type } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.amount !== undefined ? { amount: input.amount.toFixed(2) } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.sponsorName !== undefined ? { sponsorName: input.sponsorName } : {}),
        ...(input.transactionDate !== undefined ? { transactionDate: input.transactionDate } : {}),
      },
    });
  },

  async remove(tenantId: string, id: string) {
    await guardPreview(tenantId);
    const found = await prisma.financialTransaction.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!found) throw new NotFoundError('Transação');
    await prisma.financialTransaction.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};
