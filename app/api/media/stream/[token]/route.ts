import { env } from "cloudflare:workers";
import {
  hashPlaybackToken,
  parseByteRange,
  safeMediaFilename,
} from "../../../../../lib/media-stream";

type PlaybackGrant = {
  assetKey: string;
  filename: string;
  contentType: string;
};

function missingMedia() {
  return Response.json({ error: "Media not found." }, {
    status: 404,
    headers: { "cache-control": "private, no-store" },
  });
}

function rangeNotSatisfiable(size: number) {
  return new Response(null, {
    status: 416,
    headers: {
      "accept-ranges": "bytes",
      "content-range": `bytes */${size}`,
      "cache-control": "private, no-store",
    },
  });
}

async function serveMedia(
  request: Request,
  context: { params: Promise<{ token: string }> },
  headOnly: boolean,
) {
  const { token } = await context.params;
  if (!/^[a-f0-9]{64}$/.test(token)) return missingMedia();
  const tokenHash = await hashPlaybackToken(token);
  const grant = await env.DB.prepare(
    `SELECT g.asset_key AS assetKey,g.filename,g.content_type AS contentType
     FROM media_playback_grants g
     JOIN courses c ON c.id=g.course_id
     JOIN lessons l ON l.id=g.lesson_id AND l.course_id=g.course_id
     LEFT JOIN enrollments e ON e.course_id=g.course_id
       AND e.user_id=g.user_id AND e.status='active'
     LEFT JOIN school_members sm ON sm.school_id=c.school_id
       AND sm.user_id=g.user_id AND sm.status='active'
       AND sm.role IN ('owner','admin','instructor')
     WHERE g.token_hash=? AND g.expires_at>?
       AND (
         (g.user_id='public-preview' AND c.status='published' AND l.is_preview=1)
         OR e.id IS NOT NULL OR sm.id IS NOT NULL
       )
     LIMIT 1`,
  ).bind(tokenHash, Date.now()).first<PlaybackGrant>();
  if (!grant?.assetKey) return missingMedia();

  if (grant.assetKey.startsWith("static:")) {
    const path = grant.assetKey.replace(/^static:/, "");
    if (!path.startsWith("/media/faculty/") || path.includes("..")) return missingMedia();
    const assetUrl = new URL(path, request.url);
    const assetHeaders = new Headers();
    const rangeHeader = request.headers.get("range");
    if (rangeHeader) assetHeaders.set("range", rangeHeader);
    const upstream = await env.ASSETS.fetch(new Request(assetUrl, {
      method: headOnly ? "HEAD" : "GET",
      headers: assetHeaders,
    }));
    if (!upstream.ok && upstream.status !== 206) return missingMedia();
    const headers = new Headers(upstream.headers);
    headers.set("cache-control", "private, no-store");
    headers.set("content-disposition", `inline; filename="${safeMediaFilename(grant.filename)}"`);
    headers.set("content-type", grant.contentType || "video/mp4");
    headers.set("cross-origin-resource-policy", "same-origin");
    headers.set("referrer-policy", "no-referrer");
    headers.set("x-content-type-options", "nosniff");
    return new Response(headOnly ? null : upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  }
  if (!grant.assetKey.startsWith("r2:")) return missingMedia();

  const objectKey = grant.assetKey.replace(/^r2:/, "");
  const metadata = await env.UPLOADS.head(objectKey);
  if (!metadata) return missingMedia();

  const range = parseByteRange(request.headers.get("range"), metadata.size);
  if (range === "invalid") return rangeNotSatisfiable(metadata.size);

  const headers = new Headers();
  metadata.writeHttpMetadata(headers);
  headers.set("accept-ranges", "bytes");
  headers.set("cache-control", "private, no-store");
  headers.set("content-disposition", `inline; filename="${safeMediaFilename(grant.filename)}"`);
  headers.set("content-type", grant.contentType || "application/octet-stream");
  headers.set("cross-origin-resource-policy", "same-origin");
  headers.set("etag", metadata.httpEtag);
  headers.set("last-modified", metadata.uploaded.toUTCString());
  headers.set("referrer-policy", "no-referrer");
  headers.set("x-content-type-options", "nosniff");

  if (range) {
    headers.set("content-length", String(range.length));
    headers.set("content-range", `bytes ${range.start}-${range.end}/${metadata.size}`);
    if (headOnly) return new Response(null, { status: 206, headers });
    const object = await env.UPLOADS.get(objectKey, {
      range: { offset: range.start, length: range.length },
    });
    if (!object || !("body" in object)) return missingMedia();
    return new Response(object.body, { status: 206, headers });
  }

  headers.set("content-length", String(metadata.size));
  if (headOnly) return new Response(null, { status: 200, headers });
  const object = await env.UPLOADS.get(objectKey);
  if (!object || !("body" in object)) return missingMedia();
  return new Response(object.body, { status: 200, headers });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  return serveMedia(request, context, false);
}

export async function HEAD(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  return serveMedia(request, context, true);
}
