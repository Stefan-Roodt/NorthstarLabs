import { env } from "cloudflare:workers";
import { parseByteRange, safeMediaFilename } from "../../../../../lib/media-stream";
import { sha256Hex } from "../../../../../lib/security";

type ExportDownload = {
  id: string;
  objectKey: string;
  filename: string;
};

function missingExport() {
  return Response.json({ error: "Export not found or private link expired." }, {
    status: 404,
    headers: { "cache-control": "private, no-store" },
  });
}

function invalidRange(size: number) {
  return new Response(null, {
    status: 416,
    headers: {
      "accept-ranges": "bytes",
      "content-range": `bytes */${size}`,
      "cache-control": "private, no-store",
    },
  });
}

async function serve(
  request: Request,
  context: { params: Promise<{ token: string }> },
  headOnly: boolean,
) {
  const { token } = await context.params;
  if (!/^[a-f0-9]{64}$/.test(token)) return missingExport();
  const tokenHash = await sha256Hex(token);
  const item = await env.DB.prepare(
    `SELECT id,object_key AS objectKey,filename FROM academy_exports
     WHERE download_token_hash=? AND download_token_expires_at>?
       AND status='completed' AND expires_at>? AND object_key IS NOT NULL LIMIT 1`,
  ).bind(tokenHash, Date.now(), Date.now()).first<ExportDownload>();
  if (!item) return missingExport();
  const metadata = await env.UPLOADS.head(item.objectKey);
  if (!metadata) return missingExport();
  const range = parseByteRange(request.headers.get("range"), metadata.size);
  if (range === "invalid") return invalidRange(metadata.size);

  const headers = new Headers({
    "accept-ranges": "bytes",
    "cache-control": "private, no-store",
    "content-disposition": `attachment; filename="${safeMediaFilename(item.filename)}"`,
    "content-type": "application/zip",
    "cross-origin-resource-policy": "same-origin",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
  });
  headers.set("etag", metadata.httpEtag);
  headers.set("last-modified", metadata.uploaded.toUTCString());
  if (!headOnly) {
    await env.DB.prepare(
      "UPDATE academy_exports SET downloaded_at=? WHERE id=?",
    ).bind(Date.now(), item.id).run();
  }
  if (range) {
    headers.set("content-length", String(range.length));
    headers.set("content-range", `bytes ${range.start}-${range.end}/${metadata.size}`);
    if (headOnly) return new Response(null, { status: 206, headers });
    const object = await env.UPLOADS.get(item.objectKey, {
      range: { offset: range.start, length: range.length },
    });
    if (!object || !("body" in object)) return missingExport();
    return new Response(object.body, { status: 206, headers });
  }
  headers.set("content-length", String(metadata.size));
  if (headOnly) return new Response(null, { headers });
  const object = await env.UPLOADS.get(item.objectKey);
  if (!object || !("body" in object)) return missingExport();
  return new Response(object.body, { headers });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  return serve(request, context, false);
}

export async function HEAD(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  return serve(request, context, true);
}
