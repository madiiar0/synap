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
