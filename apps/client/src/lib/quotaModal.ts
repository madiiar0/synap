type Listener = () => void;

const listeners = new Set<Listener>();

/** Fired centrally whenever the API returns QUOTA_EXCEEDED (§6.4). */
export function openQuotaModal(): void {
  for (const listener of listeners) listener();
}

export function onQuotaExceeded(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const verifyListeners = new Set<Listener>();

/** Fired centrally whenever the API returns EMAIL_NOT_VERIFIED (§5). */
export function openVerifyEmailModal(): void {
  for (const listener of verifyListeners) listener();
}

export function onEmailNotVerified(listener: Listener): () => void {
  verifyListeners.add(listener);
  return () => verifyListeners.delete(listener);
}
