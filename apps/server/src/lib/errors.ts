/** Operational error surfaced to clients as {error:{code,message}}. */
export class AppError extends Error {
  constructor(
    public code: string,
    public status: number,
    message?: string,
  ) {
    super(message ?? code);
  }
}

/** Raw HTTP failure from an engine provider; never leaves the server. */
export class EngineHttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export class EngineTimeoutError extends Error {
  constructor(engineId: string) {
    super(`engine ${engineId} timed out`);
  }
}

export class BudgetExceededError extends Error {
  constructor() {
    super("daily LLM budget exceeded");
  }
}
