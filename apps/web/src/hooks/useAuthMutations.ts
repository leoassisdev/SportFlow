'use client';

import { useMutation } from '@tanstack/react-query';
import { authService, type LoginInput, type RegisterInput } from '@/services/auth.service';

export const useLogin = () => useMutation({ mutationFn: (input: LoginInput) => authService.login(input) });
export const useRegister = () => useMutation({ mutationFn: (input: RegisterInput) => authService.register(input) });
export const useLogout = () => useMutation({ mutationFn: () => authService.logout() });
