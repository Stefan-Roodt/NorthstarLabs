/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import {
  consumeRateLimit,
  oversizedJsonRequest,
  rateLimitPolicy,
  rateLimitResponse,
} from "../lib/security";
import {
  recordSystemEvent,
  requestId,
  safeErrorMessage,
} from "../lib/system-monitor";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const currentRequestId = requestId(request);

    try {
      if (oversizedJsonRequest(request)) {
        return withSecurityHeaders(
          Response.json(
            { error: "Request body is too large.", requestId: currentRequestId },
            { status: 413 },
          ),
          url,
          currentRequestId,
        );
      }

      const policy = rateLimitPolicy(request);
      if (policy) {
        const limit = await consumeRateLimit(env.DB, request, policy);
        if (!limit.allowed) {
          return withSecurityHeaders(
            rateLimitResponse(limit),
            url,
            currentRequestId,
          );
        }
      }

      if (url.pathname === "/_vinext/image") {
        const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
        const imageResponse = await handleImageOptimization(request, {
          fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
          transformImage: async (body, { width, format, quality }) => {
            const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
            return result.response();
          },
        }, allowedWidths);
        return withSecurityHeaders(imageResponse, url, currentRequestId);
      }

      const response = await handler.fetch(request, env, ctx);
      if (response.status >= 500) {
        ctx.waitUntil(recordSystemEvent(env.DB, {
          severity: "error",
          source: "worker",
          eventType: "http.server_error",
          message: `Request returned HTTP ${response.status}.`,
          requestId: currentRequestId,
          route: `${request.method} ${url.pathname}`,
          detail: { status: response.status },
        }));
      }
      return withSecurityHeaders(response, url, currentRequestId);
    } catch (error) {
      const message = safeErrorMessage(error);
      ctx.waitUntil(recordSystemEvent(env.DB, {
        severity: "critical",
        source: "worker",
        eventType: "http.unhandled_exception",
        message,
        requestId: currentRequestId,
        route: `${request.method} ${url.pathname}`,
      }));
      return withSecurityHeaders(
        Response.json(
          {
            error: "The request could not be completed.",
            requestId: currentRequestId,
          },
          { status: 500 },
        ),
        url,
        currentRequestId,
      );
    }
  },
};

function withSecurityHeaders(response: Response, url: URL, currentRequestId: string): Response {
  const headers = new Headers(response.headers);
  headers.set("content-security-policy", [
    "default-src 'self'",
    "base-uri 'self'",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "font-src 'self' data:",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data: blob:",
    "media-src 'self' blob:",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "upgrade-insecure-requests",
  ].join("; "));
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=()");
  headers.set("cross-origin-opener-policy", "same-origin");
  headers.set("cross-origin-resource-policy", "same-origin");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-dns-prefetch-control", "off");
  headers.set("x-frame-options", "DENY");
  headers.set("x-permitted-cross-domain-policies", "none");
  headers.set("x-request-id", currentRequestId);
  if (url.protocol === "https:") {
    headers.set("strict-transport-security", "max-age=31536000; includeSubDomains");
  }
  if (url.pathname.startsWith("/api/") && url.pathname !== "/api/catalog") {
    headers.set("cache-control", "private, no-store");
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default worker;
