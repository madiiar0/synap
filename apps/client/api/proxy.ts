declare const process: { env: Record<string, string | undefined> };

const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

function configurationError(message: string): Response {
  return Response.json(
    { error: { code: "BACKEND_UNAVAILABLE", message } },
    { status: 503, headers: NO_STORE_HEADERS },
  );
}

/**
 * Same-origin bridge from the Vercel-hosted frontend to the separately
 * deployed Synap API. BACKEND_URL stays server-side; the browser continues to
 * call /api and receives the existing host-only HTTP-only session cookie.
 */
export async function proxyRequest(
  request: Request,
  configuredBackend = process.env.BACKEND_URL,
  forwardedApiPath?: string,
): Promise<Response> {
  if (!configuredBackend) {
    return configurationError("The frontend BACKEND_URL environment variable is not configured");
  }

  let backend: URL;
  try {
    backend = new URL(configuredBackend);
  } catch {
    return configurationError("The frontend BACKEND_URL environment variable is invalid");
  }
  if (backend.protocol !== "https:" && process.env.VERCEL === "1") {
    return configurationError("The deployed backend URL must use HTTPS");
  }

  const incoming = new URL(request.url);
  const targetPath = forwardedApiPath
    ? `/api/${forwardedApiPath.replace(/^\/+/, "")}`
    : incoming.pathname;
  incoming.searchParams.delete("__synap_path");
  const target = new URL(`${targetPath}${incoming.search}`, backend.origin);
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  // The server-side fetch runtime transparently decompresses upstream bodies.
  // Do not negotiate browser compression through the bridge: forwarding the
  // original content-encoding afterwards makes the browser decode JSON twice.
  headers.delete("accept-encoding");
  headers.set("x-forwarded-host", incoming.host);
  headers.set("x-forwarded-proto", incoming.protocol.replace(":", ""));

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    redirect: "manual",
  });

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.delete("transfer-encoding");

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}
