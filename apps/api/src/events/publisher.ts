import { redis } from '../config/redis.js';

type MatchEvent =
  | {
      type: 'score:updated';
      matchId: string;
      liveToken: string;
      homeScore: number;
      awayScore: number;
      lastEntry?: { participantId: string; delta: number; at: string };
    }
  | {
      type: 'timer:started' | 'timer:paused' | 'timer:reset';
      matchId: string;
      liveToken: string;
      running: boolean;
      seconds: number;
      serverTime: string;
    };

const CHANNEL = 'sportflow:match';

export const publishMatchEvent = async (evt: MatchEvent) => {
  await redis.publish(CHANNEL, JSON.stringify(evt));
};

export const matchChannel = CHANNEL;
export type { MatchEvent };
