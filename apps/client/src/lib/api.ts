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
    const code = body.error?.code ?? "UNKNOWN";
    // §6.4: any quota rejection, anywhere, opens the end-of-trial modal.
    if (code === "QUOTA_EXCEEDED") {
      const { openQuotaModal } = await import("./quotaModal");
      openQuotaModal();
    }
    // §5: the first scan needs a verified email; offer to resend the link.
    if (code === "EMAIL_NOT_VERIFIED") {
      const { openVerifyEmailModal } = await import("./quotaModal");
      openVerifyEmailModal();
    }
    throw new ApiError(code, res.status, body.error?.message ?? `HTTP ${res.status}`);
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
  authMode: "firebase" | "mock";
  /** §0.1: true when the in-memory fallback database is in use (dev only). */
  memoryDb: boolean;
  isDev: boolean;
}
