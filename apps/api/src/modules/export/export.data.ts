import { prisma } from '../../config/database.js';

export interface ExportData {
  championship: { name: string; sportType: string; status: string; startDate: Date | null; endDate: Date | null };
  results: Array<{ home: string; away: string; homeScore: number; awayScore: number; status: string; scheduledAt: Date | null }>;
  financial: Array<{ date: Date; type: string; category: string; amount: string; description: string | null; sponsor: string | null }>;
  participants: Array<{ name: string; category: string | null }>;
}

export const loadExportData = async (tenantId: string, championshipId: string): Promise<ExportData> => {
  const [championship, matches, transactions, participants] = await Promise.all([
    prisma.championship.findFirstOrThrow({
      where: { id: championshipId, tenantId },
      select: { name: true, sportType: true, status: true, startDate: true, endDate: true },
    }),
    prisma.match.findMany({
      where: { tenantId, championshipId },
      include: {
        homeParticipant: { select: { name: true } },
        awayParticipant: { select: { name: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    }),
    prisma.financialTransaction.findMany({
      where: { tenantId, championshipId, deletedAt: null },
      orderBy: { transactionDate: 'desc' },
    }),
    prisma.participant.findMany({
      where: { tenantId, championshipId, deletedAt: null },
      orderBy: { name: 'asc' },
    }),
  ]);

  return {
    championship,
    results: matches.map((m) => ({
      home: m.homeParticipant.name,
      away: m.awayParticipant.name,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      status: m.status,
      scheduledAt: m.scheduledAt,
    })),
    financial: transactions.map((t) => ({
      date: t.transactionDate,
      type: t.type,
      category: t.category,
      amount: t.amount.toString(),
      description: t.description,
      sponsor: t.sponsorName,
    })),
    participants: participants.map((p) => ({ name: p.name, category: p.category })),
  };
};
