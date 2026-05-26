import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "YearInReview — Design a Life Worth Living"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(145deg, #faf8f5 0%, #f0ebe3 55%, #e8dfd2 100%)",
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 22,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#b8956a",
          }}
        >
          YearInReview
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 72,
              lineHeight: 1.05,
              fontWeight: 600,
              color: "#5c4d3c",
              maxWidth: 900,
            }}
          >
            Design a life worth living
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.4,
              color: "#7a6a58",
              maxWidth: 780,
            }}
          >
            Reflect weekly. Plan in areas and projects. Walk your year with calm
            clarity.
          </div>
        </div>
        <div style={{ fontSize: 20, color: "#8b7355" }}>yearinreview.online</div>
      </div>
    ),
    { ...size },
  )
}
