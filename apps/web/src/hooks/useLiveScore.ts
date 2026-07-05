'use client';

import { useEffect, useState } from 'react';
import { createSocket } from '@/lib/socket';

interface State {
  homeScore: number;
  awayScore: number;
  timerRunning: boolean;
  timerSeconds: number;
  connected: boolean;
}

export function useLiveScore(liveToken: string, initial?: Partial<State>) {
  const [state, setState] = useState<State>({
    homeScore: initial?.homeScore ?? 0,
    awayScore: initial?.awayScore ?? 0,
    timerRunning: initial?.timerRunning ?? false,
    timerSeconds: initial?.timerSeconds ?? 0,
    connected: false,
  });

  useEffect(() => {
    if (!liveToken) return;
    const socket = createSocket();
    socket.on('connect', () => {
      socket.emit('join:public', liveToken);
      setState((s) => ({ ...s, connected: true }));
    });
    socket.on('disconnect', () => setState((s) => ({ ...s, connected: false })));
    socket.on('score:updated', (evt: { homeScore: number; awayScore: number }) => {
      setState((s) => ({ ...s, homeScore: evt.homeScore, awayScore: evt.awayScore }));
    });
    socket.on('timer:started', (evt: { seconds: number }) =>
      setState((s) => ({ ...s, timerRunning: true, timerSeconds: evt.seconds })),
    );
    socket.on('timer:paused', (evt: { seconds: number }) =>
      setState((s) => ({ ...s, timerRunning: false, timerSeconds: evt.seconds })),
    );
    socket.on('timer:reset', () => setState((s) => ({ ...s, timerRunning: false, timerSeconds: 0 })));
    return () => {
      socket.disconnect();
    };
  }, [liveToken]);

  return state;
}
