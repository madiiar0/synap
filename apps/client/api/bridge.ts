import { proxyRequest } from "./proxy.js";

export default {
  fetch(request: Request): Promise<Response> {
    const paths = new URL(request.url).searchParams.getAll("__synap_path");
    const forwardedPath = paths.at(-1);
    return proxyRequest(request, undefined, forwardedPath);
  },
};
