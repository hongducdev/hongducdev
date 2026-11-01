import { ImageResponse } from "next/og";

export const alt = "hongducdev";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 80,
          background: "#0b0d10",
          color: "#e8e6e1",
          fontFamily: "monospace",
        }}
      >
        <div style={{ fontSize: 96, display: "flex" }}>hongducdev</div>
        <div style={{ fontSize: 36, opacity: 0.6, marginTop: 16, display: "flex" }}>hongduc.dev</div>
      </div>
    ),
    size,
  );
}
