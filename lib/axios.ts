import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

const rawAxios = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (res) => res,

  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    if (status === 403 && typeof window !== "undefined") {
      const currentUrl = new URL(window.location.href);
      const isTeamWorkspace =
        currentUrl.searchParams.get("workspaceStyle") === "TEAM";

      if (isTeamWorkspace) {
        window.location.replace("/dashboard");
        return Promise.reject(error);
      }
    }
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = rawAxios
          .post("/auth/refresh")
          .then((res) => {
            const newToken = res.data.accessToken;
            useAuthStore.getState().setAccessToken(newToken);
            return newToken;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newToken = await refreshPromise;

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().clearAuth();

      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }

      return Promise.reject(refreshError);
    }
  },
);
