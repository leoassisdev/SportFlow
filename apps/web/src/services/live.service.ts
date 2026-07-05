import { api } from '@/lib/api';

export interface LiveMatch {
  championship: { name: string; sportType: string };
  match: {
    status: string;
    homeScore: number;
    awayScore: number;
    timerSeconds: number;
    timerRunning: boolean;
    homeParticipant: { name: string };
    awayParticipant: { name: string };
  };
  isPreview: boolean;
}

export const liveService = {
  get: (token: string) => api.get<LiveMatch>(`/api/v1/live/${token}`).then((r) => r.data),
};
