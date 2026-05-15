import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "JobTrack — Land your next role without the spreadsheet.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0F1014 0%, #1A1B2E 100%)",
          color: "#fff",
          padding: 64,
          fontFamily: "'Geist', system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 99,
              border: "2.5px solid #7E82F0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#7E82F0",
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 700 }}>✓</span>
          </div>
          <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em" }}>
            jobtrack
          </span>
        </div>

        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 60,
            padding: "6px 14px",
            borderRadius: 99,
            background: "rgba(126, 130, 240, 0.16)",
            border: "1px solid rgba(126, 130, 240, 0.36)",
            color: "#BCBEF5",
            fontSize: 16,
            fontWeight: 500,
            alignSelf: "flex-start",
          }}
        >
          Built for the messy job hunt
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1.04,
            margin: "24px 0 0",
            maxWidth: 1000,
          }}
        >
          Land your next role
          <br />
          <span style={{ color: "rgba(255,255,255,0.55)" }}>
            without the spreadsheet.
          </span>
        </h1>

        {/* Subline / trust strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginTop: "auto",
            fontSize: 18,
            color: "rgba(255,255,255,0.72)",
          }}
        >
          <span>Free, forever</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
          <span>EU-hosted</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
          <span>Your data is yours</span>
        </div>

        {/* decorative amber glow */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(245,184,66,0.45) 0%, rgba(245,184,66,0) 60%)",
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  );
}
