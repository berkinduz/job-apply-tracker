import { ImageResponse } from "next/og";
import { getPublicProfile } from "@/lib/public-profile/stats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ handle: string }> },
) {
  const { handle } = await ctx.params;
  const profile = await getPublicProfile(handle);

  if (!profile) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0c0c10",
            color: "#fff",
            fontSize: 40,
            fontWeight: 700,
          }}
        >
          Profile not found
        </div>
      ),
      { width: 1200, height: 630 },
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "60px 72px",
          background:
            "linear-gradient(135deg, #1e1e44 0%, #2a2a66 55%, #4f46e5 100%)",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "system-ui",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "#fff",
              color: "#4F46E5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 22,
            }}
          >
            j
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>
            jobtrack
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: "-0.035em",
              lineHeight: 1,
            }}
          >
            {profile.displayName}
          </div>
          <div
            style={{
              fontSize: 26,
              color: "rgba(255,255,255,0.72)",
              maxWidth: 900,
            }}
          >
            {profile.totalApplications} applications ·{" "}
            {profile.responseRatePercent}% response · {profile.offerCount} offer
            {profile.offerCount === 1 ? "" : "s"}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 16,
            padding: "20px 24px",
            backdropFilter: "blur(20px)",
          }}
        >
          {profile.funnel.slice(0, 4).map((s) => (
            <div
              key={s.key}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {s.label}
              </div>
              <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em" }}>
                {s.ratePercent}%
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
