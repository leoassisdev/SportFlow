import { api } from '@/lib/api';

export interface MatchDetail {
  id: string;
  championshipId: string;
  status: 'scheduled' | 'live' | 'finished' | 'cancelled';
  scheduledAt: string | null;
  liveToken: string;
  timerSeconds: number;
  timerRunning: boolean;
  timerStartedAt: string | null;
  homeScore: number;
  awayScore: number;
  homeParticipant: { id: string; name: string };
  awayParticipant: { id: string; name: string };
  championship: { name: string; sportType: string };
}

export const matchService = {
  get: (id: string) => api.get<MatchDetail>(`/api/v1/matches/${id}`).then((r) => r.data),
  updateScore: (id: string, participantId: string, delta: number) =>
    api.patch(`/api/v1/matches/${id}/score`, { participantId, delta }).then((r) => r.data),
  updateTimer: (id: string, action: 'start' | 'pause' | 'reset') =>
    api.patch(`/api/v1/matches/${id}/timer`, { action }).then((r) => r.data),
};
