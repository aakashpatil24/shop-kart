import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getAccessToken, setAccessToken } from "./tokenStore";
import type { ApiErrorResponse } from "../types/api";

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Set by AuthContext; called when a refresh attempt fails so the app can
// clear auth state. A plain callback keeps this file free of React imports.
let onAuthFailure: (() => void) | null = null;
export const setOnAuthFailure = (callback: () => void): void => {
  onAuthFailure = callback;
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Concurrent 401s share one in-flight refresh call instead of each triggering their own.
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  // plain axios, not `api`, so this never re-enters the response interceptor
  const res = await axios.post<{ data: { accessToken: string } }>(
    "/api/auth/refresh-token",
    {},
    { baseURL: import.meta.env.VITE_API_URL, withCredentials: true }
  );
  const newToken = res.data.data.accessToken;
  setAccessToken(newToken);
  return newToken;
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as RetryableConfig | undefined;
    const isExpiredAccessToken =
      error.response?.status === 401 && error.response.data?.code === "TOKEN_EXPIRED";
    const isRefreshEndpoint = originalRequest?.url?.includes("/auth/refresh-token");

    if (isExpiredAccessToken && originalRequest && !originalRequest._retry && !isRefreshEndpoint) {
      originalRequest._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = refreshAccessToken().finally(() => {
            isRefreshing = false;
          });
        }
        const newToken = await refreshPromise!;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        onAuthFailure?.();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
