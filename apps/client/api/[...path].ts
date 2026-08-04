import { proxyRequest } from "./proxy.js";

export default {
  fetch(request: Request): Promise<Response> {
    return proxyRequest(request);
  },
};
