'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { championshipService } from '@/services/championship.service';

export const useChampionships = (params?: { q?: string; sport?: string; status?: string; page?: number }) =>
  useQuery({
    queryKey: ['championships', params],
    queryFn: () => championshipService.list(params),
  });

export const useChampionship = (id: string | undefined) =>
  useQuery({
    queryKey: ['championship', id],
    queryFn: () => championshipService.get(id!),
    enabled: !!id,
  });

export const useCreateChampionship = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; sportType: string; startDate?: string; endDate?: string }) =>
      championshipService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['championships'] }),
  });
};

export const useUpdateChampionship = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name?: string; startDate?: string; endDate?: string; status?: string }) =>
      championshipService.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['championship', id] });
      qc.invalidateQueries({ queryKey: ['championships'] });
    },
  });
};

export const useDeleteChampionship = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => championshipService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['championships'] }),
  });
};
