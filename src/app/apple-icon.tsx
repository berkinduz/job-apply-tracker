import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4F46E5 0%, #6366F1 60%, #818CF8 100%)",
          borderRadius: 38,
        }}
      >
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="1.9" />
          <circle cx="12" cy="12" r="4.5" stroke="#fff" strokeWidth="1.7" opacity="0.55" />
          <path
            d="M8.4 12.2 L10.9 14.7 L15.8 9.4"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
