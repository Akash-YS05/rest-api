"use client";

import type { ApiResponse, AuthResult } from "@/types/api";

let accessToken = "";

export const tokenStore = {
  get(): string {
    return accessToken;
  },
  set(token: string): void {
    accessToken = token;
  },
  clear(): void {
    accessToken = "";
  },
};

const toFailure = (message: string, code = "REQUEST_FAILED"): ApiResponse<never> => ({
  success: false,
  error: {
    code,
    message,
  },
});

const parseApiResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  try {
    return (await response.json()) as ApiResponse<T>;
  } catch {
    if (!response.ok) {
      return toFailure(`Request failed with status ${response.status}`, "INVALID_RESPONSE");
    }

    return toFailure("Unexpected response format", "INVALID_RESPONSE");
  }
};

const request = async <T>(
  input: string,
  init?: RequestInit,
  retryOn401 = true
): Promise<ApiResponse<T>> => {
  try {
    const headers = new Headers(init?.headers);
    headers.set("Content-Type", "application/json");

    const token = tokenStore.get();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(input, {
      ...init,
      headers,
      credentials: "include",
    });

    const payload = await parseApiResponse<T>(response);

    if (response.status === 401 && retryOn401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return request<T>(input, init, false);
      }
    }

    return payload;
  } catch {
    return toFailure("Network error. Please check if the API server is running.", "NETWORK_ERROR");
  }
};

export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const response = await fetch("/api/v1/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
      credentials: "include",
    });

    const payload = await parseApiResponse<AuthResult>(response);

    if (!response.ok || !payload.success) {
      tokenStore.clear();
      return false;
    }

    tokenStore.set(payload.data.accessToken);
    return true;
  } catch {
    tokenStore.clear();
    return false;
  }
};

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
