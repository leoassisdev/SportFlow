'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { matchService, type MatchDetail } from '@/services/match.service';
import { createSocket } from '@/lib/socket';

export const useMatchDetail = (id: string | undefined) =>
  useQuery({
    queryKey: ['match', id],
    queryFn: () => matchService.get(id!),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

export const useUpdateScore = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ participantId, delta }: { participantId: string; delta: number }) =>
      matchService.updateScore(id, participantId, delta),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['match', id] }),
  });
};

export const useUpdateTimer = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (action: 'start' | 'pause' | 'reset') => matchService.updateTimer(id, action),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['match', id] }),
  });
};

export const useUndoLast = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => matchService.undoLast(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['match', id] });
      qc.invalidateQueries({ queryKey: ['match-history', id] });
    },
  });
};

export const useFinishMatch = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => matchService.finish(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['match', id] }),
  });
};

export const useMatchHistory = (id: string | undefined) =>
  useQuery({
    queryKey: ['match-history', id],
    queryFn: () => matchService.history(id!),
    enabled: !!id,
  });

/**
 * Escuta broadcast Socket.io do match e devolve estado ao vivo.
 * Independente da query REST (o REST fica pra invalidacao pontual).
 */
export const useMatchLiveState = (match: MatchDetail | undefined) => {
  const [state, setState] = useState<{
    homeScore: number;
    awayScore: number;
    timerSeconds: number;
    timerRunning: boolean;
    connected: boolean;
  } | null>(null);

  useEffect(() => {
    if (!match) return;
    setState({
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      timerSeconds: match.timerSeconds,
      timerRunning: match.timerRunning,
      connected: false,
    });
    const socket = createSocket({ auth: true });
    socket.on('connect', () => {
      socket.emit('join:admin', match.id);
      socket.emit('join:public', match.liveToken);
      setState((s) => (s ? { ...s, connected: true } : s));
    });
    socket.on('disconnect', () => setState((s) => (s ? { ...s, connected: false } : s)));
    socket.on('score:updated', (evt: { homeScore: number; awayScore: number }) => {
      setState((s) => (s ? { ...s, homeScore: evt.homeScore, awayScore: evt.awayScore } : s));
    });
    socket.on('timer:started', (evt: { seconds: number }) =>
      setState((s) => (s ? { ...s, timerRunning: true, timerSeconds: evt.seconds } : s)),
    );
    socket.on('timer:paused', (evt: { seconds: number }) =>
      setState((s) => (s ? { ...s, timerRunning: false, timerSeconds: evt.seconds } : s)),
    );
    socket.on('timer:reset', () =>
      setState((s) => (s ? { ...s, timerRunning: false, timerSeconds: 0 } : s)),
    );
    return () => {
      socket.disconnect();
    };
  }, [match?.id, match?.liveToken]);

  return state;
};
