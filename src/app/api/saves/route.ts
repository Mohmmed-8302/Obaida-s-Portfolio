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
const isConfigured = () => !!process.env.BLOB_READ_WRITE_TOKEN;

function pathFor(deviceId: string): string {
  const safe = deviceId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
  return `${PREFIX}${safe || "anon"}.json`;
}

export async function GET(request: Request) {
  if (!isConfigured()) return Response.json({ configured: false });
  const deviceId = new URL(request.url).searchParams.get("deviceId");
  if (!deviceId) return Response.json({ error: "deviceId required" }, { status: 400 });
  try {
    const res = await get(pathFor(deviceId), { access: "public" });
    if (!res || res.statusCode !== 200) return Response.json({ configured: true, savedAt: 0, data: null });
    const parsed = JSON.parse(await new Response(res.stream).text());
    return Response.json({ configured: true, savedAt: parsed.savedAt ?? 0, data: parsed.data ?? null });
  } catch {
    // Missing blob / parse error → treat as empty cloud.
    return Response.json({ configured: true, savedAt: 0, data: null });
  }
}

export async function PUT(request: Request) {
  if (!isConfigured()) return Response.json({ configured: false });
  try {
    const { deviceId, savedAt, data } = (await request.json()) ?? {};
    if (!deviceId || !data) return Response.json({ error: "bad payload" }, { status: 400 });
    const json = JSON.stringify({ savedAt: savedAt ?? Date.now(), data });
    await put(pathFor(deviceId), json, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    });
    return Response.json({ configured: true, ok: true });
  } catch (e) {
    return Response.json({ configured: true, ok: false, error: String(e) }, { status: 500 });
  }
}
