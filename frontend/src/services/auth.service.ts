import { api } from "../lib/axios";
import type { ApiSuccess, User, LoginPayload, RegisterPayload } from "../types/api";

export const registerRequest = (payload: RegisterPayload) =>
  api.post<ApiSuccess<{ user: User }>>("/api/auth/register", payload).then((res) => res.data);

export const loginRequest = (payload: LoginPayload) =>
  api
    .post<ApiSuccess<{ accessToken: string; user: User }>>("/api/auth/login", payload)
    .then((res) => res.data);

export const refreshTokenRequest = () =>
  api.post<ApiSuccess<{ accessToken: string }>>("/api/auth/refresh-token").then((res) => res.data);

export const logoutRequest = () =>
  api.post<ApiSuccess<null>>("/api/auth/logout").then((res) => res.data);

export const meRequest = () =>
  api.get<ApiSuccess<{ user: User }>>("/api/auth/me").then((res) => res.data);
