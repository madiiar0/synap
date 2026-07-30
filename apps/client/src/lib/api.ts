export class ApiError extends Error {
  constructor(
    public code: string,
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  const body = (await res.json().catch(() => ({}))) as {
    error?: { code?: string; message?: string };
  };
  if (!res.ok) {
    throw new ApiError(
      body.error?.code ?? "UNKNOWN",
      res.status,
      body.error?.message ?? `HTTP ${res.status}`,
    );
  }
  return body as T;
}

export const apiGet = <T>(path: string): Promise<T> => request<T>(path);

export const apiPost = <T>(path: string, data?: unknown): Promise<T> =>
  request<T>(path, { method: "POST", body: JSON.stringify(data ?? {}) });

export const apiPatch = <T>(path: string, data?: unknown): Promise<T> =>
  request<T>(path, { method: "PATCH", body: JSON.stringify(data ?? {}) });

export interface AppConfig {
  brandName: string;
  demo: boolean;
  calendlyUrl: string | null;
  whatsappUrl: string | null;
}
