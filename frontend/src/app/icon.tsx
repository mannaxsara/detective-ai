import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#edfe5e",
          borderRadius: "6px",
          border: "2px solid #000000",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="13" cy="13" r="9" stroke="#000000" strokeWidth="3" />
          <circle cx="13" cy="13" r="4.5" stroke="#000000" strokeWidth="2" strokeDasharray="2 2" />
          <circle cx="11" cy="11" r="1.5" fill="#000000" />
          <circle cx="15" cy="14" r="1.5" fill="#000000" />
          <line x1="19.5" y1="19.5" x2="27.5" y2="27.5" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
