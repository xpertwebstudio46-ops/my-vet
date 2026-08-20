import type { ApiEnvelope } from "./types";
import { getAccessToken, setAccessToken } from "../auth/access-token";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000").replace(/\/$/, "");

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly details?: Record<string, string[]>,
  ) {
    super(message);
  }
}

let refreshRequest: Promise<string> | null = null;

async function readEnvelope<T>(response: Response): Promise<T> {
  const envelope = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !envelope?.success) {
    throw new ApiClientError(
      envelope?.message ?? "The request could not be completed",
      response.status,
      envelope?.error?.code ?? "API_ERROR",
      envelope?.error?.details,
    );
  }
  return envelope.data as T;
}

export async function refreshAccessToken() {
  if (!refreshRequest) {
    refreshRequest = fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => readEnvelope<{ accessToken: string }>(response))
      .then(({ accessToken }) => {
        setAccessToken(accessToken);
        return accessToken;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }
  return refreshRequest;
}

export async function apiClient<T>(
  path: string,
  init: RequestInit = {},
  options: { authenticated?: boolean; retry?: boolean } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has("content-type")) headers.set("content-type", "application/json");
  if (options.authenticated !== false) {
    const token = getAccessToken();
    if (token) headers.set("authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...init, headers, credentials: "include" });
  if (response.status === 401 && options.authenticated !== false && options.retry !== false) {
    try {
      const token = await refreshAccessToken();
      headers.set("authorization", `Bearer ${token}`);
      return apiClient<T>(path, { ...init, headers }, { ...options, retry: false });
    } catch {
      setAccessToken(null);
    }
  }
  return readEnvelope<T>(response);
}

export function apiBaseUrl() {
  return API_URL;
}
