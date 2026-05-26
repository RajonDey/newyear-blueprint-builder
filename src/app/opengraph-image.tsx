import { ImageResponse } from "next/og"
import { brandColors } from "@/lib/brand-colors"

export const runtime = "edge"
export const alt = "YearInReview — Design a Life Worth Living"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

function BrandMarkOg({ size: px }: { size: number }) {
  const rings = [
    { r: 42, stroke: 2.4 },
    { r: 30, stroke: 2.2 },
    { r: 18, stroke: 2 },
  ]
  return (
    <div
      style={{
        position: "relative",
        width: px,
        height: px,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {rings.map(({ r, stroke }) => {
        const d = (r / 42) * (px * 0.88)
        return (
          <div
            key={r}
            style={{
              position: "absolute",
              width: d,
              height: d,
              borderRadius: "50%",
              border: `${stroke}px solid ${brandColors.amber}`,
            }}
          />
        )
      })}
      <div
        style={{
          position: "absolute",
          width: px * 0.07,
          height: px * 0.07,
          borderRadius: "50%",
          background: brandColors.amber,
        }}
      />
    </div>
  )
}

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
          background: `linear-gradient(145deg, ${brandColors.paper} 0%, ${brandColors.paperDeep} 55%, #E8DFD2 100%)`,
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
          }}
        >
          <BrandMarkOg size={72} />
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: brandColors.amber,
              letterSpacing: "-0.02em",
            }}
          >
            YearInReview
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 72,
              lineHeight: 1.05,
              fontWeight: 600,
              color: brandColors.inkSoft,
              maxWidth: 900,
              letterSpacing: "-0.03em",
            }}
          >
            Design a life worth living
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.4,
              color: brandColors.muted,
              maxWidth: 780,
            }}
          >
            Reflect weekly. Plan in areas and projects. Walk your year with calm
            clarity.
          </div>
        </div>
        <div style={{ fontSize: 20, color: brandColors.muted }}>
          yearinreview.online
        </div>
      </div>
    ),
    { ...size },
  )
}
