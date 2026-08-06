import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { LoginDto, RegisterDto } from "@/types/auth";

export const AUTH_QUERY_KEY = ["auth", "user"];

export function useUser() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      const res = await authService.me();
      return res.data;
    },
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
    onSuccess: (res) => {
      setAccessToken(res.data.accessToken);
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
}
export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterDto) => authService.register(data),
  });
}
export function useLogout() {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearAuth();
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
}
