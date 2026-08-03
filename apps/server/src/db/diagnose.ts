/**
 * §0.1: turn an opaque driver failure into the three causes that actually
 * happen in this project, so a connection problem is never mistaken for a UI
 * bug. Shared by connectDb (logging) and `pnpm db:check` (the CLI).
 */

export interface MongoDiagnosis {
  name: string;
  code: string;
  message: string;
  /** Ordered, most-likely-first remedies. */
  hints: string[];
}

/** Hide the credentials before a URI reaches a log line. */
export function redactUri(uri: string): string {
  return uri.replace(/\/\/[^@/]+@/, "//***@");
}

/** True when the URI carries no database name, so the driver silently uses `test`. */
export function missingDatabaseName(uri: string): boolean {
  const afterHost = uri.replace(/^mongodb(\+srv)?:\/\/[^/?]+/, "");
  const path = afterHost.split("?")[0] ?? "";
  return path === "" || path === "/";
}

/**
 * True when the password contains characters that must be percent-encoded.
 * `@ : / ? # [ ] %` break URI parsing or silently truncate the password.
 */
export function passwordNeedsEncoding(uri: string): boolean {
  const match = /^mongodb(?:\+srv)?:\/\/[^:/?#]+:([^@]*)@/.exec(uri);
  if (!match) return false;
  return /[@:/?#[\]%]/.test(match[1]);
}

export function diagnoseMongoError(err: unknown, uri: string): MongoDiagnosis {
  const error = err as Error & { code?: unknown; codeName?: string };
  const name = error.name ?? "Error";
  const code = String(error.code ?? error.codeName ?? "none");
  const message = error.message ?? String(err);
  const hints: string[] = [];

  const authFailure =
    /authentication failed|bad auth|not authorized/i.test(message) || code === "18";
  const selectionFailure =
    /server selection|could not connect to any servers|ReplicaSetNoPrimary/i.test(message) ||
    name === "MongooseServerSelectionError";
  const dnsFailure = /ENOTFOUND|EAI_AGAIN|querySrv/i.test(message);

  if (authFailure) {
    hints.push(
      "Authentication was rejected. Check the user and password in MONGODB_URI (Atlas: Database Access).",
    );
    if (passwordNeedsEncoding(uri)) {
      hints.push(
        "The password contains characters that must be percent-encoded in a URI: @ becomes %40, : becomes %3A, / becomes %2F, # becomes %23, ? becomes %3F, % becomes %25.",
      );
    }
  } else if (dnsFailure) {
    hints.push(
      "The cluster hostname did not resolve. Check the host in MONGODB_URI and your DNS or VPN.",
    );
  } else if (selectionFailure) {
    hints.push(
      "No cluster member accepted the connection. The usual cause is the Atlas IP allowlist: open Atlas, go to Network Access, and add your current IP address (Add IP Address, then Add Current IP Address).",
    );
    hints.push(
      "If you are on a VPN, mobile hotspot, or a changing home IP, the allowlist entry from last time no longer matches.",
    );
  }

  if (missingDatabaseName(uri)) {
    hints.push(
      "MONGODB_URI has no database name, so the driver would use `test`. Add it before the query string, for example: ...mongodb.net/synapai?appName=Synap",
    );
  }

  if (hints.length === 0) {
    hints.push("Verify MONGODB_URI, then run `pnpm db:check` again for the raw driver error.");
  }
  return { name, code, message, hints };
}
