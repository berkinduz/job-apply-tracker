import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseJobUrl } from "@/lib/jobs/parse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

export async function POST(req: Request) {
  // Auth gate — only signed-in users can hit the scraper. Prevents the route
  // from being used as a generic web-fetch proxy.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const url = (body as { url?: string })?.url;
  if (!url || typeof url !== "string" || url.length > 2048) {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  // Block private network targets so the route can't be used for SSRF.
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
  } catch {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }
  if (!/^https?:$/.test(parsedUrl.protocol)) {
    return NextResponse.json({ error: "invalid_scheme" }, { status: 400 });
  }
  if (isPrivateHost(parsedUrl.hostname)) {
    return NextResponse.json({ error: "private_host_blocked" }, { status: 400 });
  }

  try {
    const result = await parseJobUrl(parsedUrl.toString());
    return NextResponse.json({ ok: true, data: result });
  } catch (e) {
    return NextResponse.json(
      { error: "parse_failed", message: (e as Error).message },
      { status: 502 },
    );
  }
}

function isPrivateHost(host: string): boolean {
  if (host === "localhost" || host.endsWith(".local")) return true;
  // Block obvious private ranges (best-effort — DNS rebinding still possible
  // at the network layer; Vercel egress mitigates).
  if (/^127\./.test(host)) return true;
  if (/^10\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return true;
  if (host === "0.0.0.0" || host === "::1") return true;
  return false;
}
