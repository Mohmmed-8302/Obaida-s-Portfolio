import { put, get } from "@vercel/blob";

/** Per-device cloud save store, backed by Vercel Blob.
 *
 *  Each anonymous device keeps one JSON document at `xp-saves/<deviceId>.json`.
 *  The deviceId is an unguessable UUID, so a public blob is effectively private
 *  while avoiding any private-tier dependency.
 *
 *  When the Blob store isn't provisioned (no BLOB_READ_WRITE_TOKEN — e.g. local
 *  dev), both handlers report `{ configured: false }` and the client silently
 *  stays localStorage-only. Linking a Blob store on Vercel activates sync with
 *  no code change. */

export const dynamic = "force-dynamic";

const PREFIX = "xp-saves/";
const MAX_PAYLOAD_SIZE = 1_000_000; // 1MB limit
const isConfigured = () => !!process.env.BLOB_READ_WRITE_TOKEN;

/** Allowed origins for CORS validation */
const ALLOWED_ORIGINS = (() => {
  const envOrigins = process.env.ALLOWED_ORIGINS;
  if (envOrigins) return envOrigins.split(',').map(o => o.trim());
  return ['http://localhost:3000', 'http://localhost:3001'];
})();

/** Validate request origin */
function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // Same-origin requests don't send origin
  return ALLOWED_ORIGINS.some(allowed => origin === allowed || origin.endsWith('.vercel.app'));
}

function pathFor(deviceId: string): string {
  const safe = deviceId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
  return `${PREFIX}${safe || "anon"}.json`;
}

export async function GET(request: Request) {
  if (!isConfigured()) return Response.json({ configured: false });
  if (!validateOrigin(request)) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  const deviceId = new URL(request.url).searchParams.get("deviceId");
  if (!deviceId) return Response.json({ error: "deviceId required" }, { status: 400 });
  try {
    const res = await get(pathFor(deviceId), { access: "public" });
    if (!res || res.statusCode !== 200) return Response.json({ configured: true, savedAt: 0, data: null });
    let parsed;
    try {
      const text = await new Response(res.stream).text();
      parsed = JSON.parse(text);
    } catch (parseError: unknown) {
      const msg = parseError instanceof Error ? parseError.message : String(parseError);
      console.error('[GET /api/saves] JSON parse error:', msg);
      return Response.json({ configured: true, savedAt: 0, data: null });
    }
    return Response.json({ configured: true, savedAt: parsed.savedAt ?? 0, data: parsed.data ?? null });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[GET /api/saves] Error:', msg);
    // Missing blob / parse error → treat as empty cloud.
    return Response.json({ configured: true, savedAt: 0, data: null });
  }
}

export async function PUT(request: Request) {
  if (!isConfigured()) return Response.json({ configured: false });
  if (!validateOrigin(request)) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  
  let body: { deviceId?: unknown; savedAt?: unknown; data?: unknown };
  try {
    body = (await request.json()) ?? {};
  } catch (parseError: unknown) {
    const msg = parseError instanceof Error ? parseError.message : String(parseError);
    console.error('[PUT /api/saves] JSON parse error:', msg);
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }
  
  const { deviceId, savedAt, data } = body;
  
  // Validate deviceId
  if (!deviceId || typeof deviceId !== 'string' || deviceId.trim() === '') {
    return Response.json({ error: "deviceId required and must be non-empty string" }, { status: 400 });
  }
  
  // Validate data exists
  if (!data) {
    return Response.json({ error: "data required" }, { status: 400 });
  }
  
  try {
    const json = JSON.stringify({ savedAt: savedAt ?? Date.now(), data });
    
    // Check size limit
    if (json.length > MAX_PAYLOAD_SIZE) {
      return Response.json({ error: "payload too large (max 1MB)" }, { status: 413 });
    }
    
    await put(pathFor(deviceId), json, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    });
    return Response.json({ configured: true, ok: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[PUT /api/saves] Error:', msg);
    return Response.json({ configured: true, ok: false, error: msg }, { status: 500 });
  }
}
