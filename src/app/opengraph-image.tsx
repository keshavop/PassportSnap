import { ImageResponse } from "next/og"

export const alt = "PassportSnap: free passport photo maker"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #0f172a, #1d4ed8)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 800 }}>PassportSnap</div>
        <div style={{ fontSize: 40, marginTop: 24, opacity: 0.9 }}>
          Free passport photo maker: crop, resize and compress in your browser
        </div>
        <div style={{ fontSize: 30, marginTop: 40, opacity: 0.7 }}>
          35×45 mm · 2×2 in · custom sizes · private
        </div>
      </div>
    ),
    size
  )
}
