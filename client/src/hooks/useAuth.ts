import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';
import type { AuthResponse, User } from '@/types';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const { user, setUser, logout: clearAuth } = useAuthStore();
  const queryClient = useQueryClient();

  // Get current user
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const { data } = await api.get<AuthResponse>('/auth/me');
        setUser(data.user);
        return data.user;
      } catch (error) {
        setUser(null);
        return null;
      }
    },
    enabled: !!user, // Only fetch if we think we're logged in
  });

  // Register
  const registerMutation = useMutation({
    mutationFn: async (userData: { name: string; email: string; password: string }) => {
      const { data } = await api.post<AuthResponse>('/auth/register', userData);
      return data;
    },
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast.success('Registration successful!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Login
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await api.post<AuthResponse>('/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast.success('Login successful!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      toast.success('Logged out successfully');
    },
  });

  return {
    user: currentUser || user,
    isLoading,
    isAuthenticated: !!user,
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
  };
};
