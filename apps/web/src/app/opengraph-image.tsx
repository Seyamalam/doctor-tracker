import { ImageResponse } from "next/og";

export const alt =
  "Doctor Tracker — secure admin dashboard for managing doctors and patients";
export const size = { height: 630, width: 1200 };
export const contentType = "image/png";

const LogoMark = ({ px }: { px: number }) => (
  <svg fill="none" height={px} viewBox="0 0 32 32" width={px}>
    <rect fill="#0d9488" height="32" rx="8" width="32" />
    <path
      d="M6 18h5l2.5-7 4 12 2.5-5H26"
      stroke="#ffffff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.4"
    />
  </svg>
);

const PulseLine = () => (
  <svg fill="none" height="120" viewBox="0 0 1200 120" width="1200">
    <path
      d="M0 60h180l30-34 45 88 34-70 22 16h160l28-30 44 76 30-58 24 12h170l30-34 45 88 34-70 22 16h150l28-30 44 76 30-58 24 12h88"
      opacity="0.55"
      stroke="#0d9488"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3"
    />
  </svg>
);

const OpenGraphImage = () =>
  new ImageResponse(
    <div
      style={{
        background: "#141416",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: "72px 80px 0",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "28px",
            maxWidth: "760px",
          }}
        >
          <div style={{ alignItems: "center", display: "flex", gap: "20px" }}>
            <LogoMark px={72} />
            <span
              style={{
                color: "#ffffff",
                fontSize: "56px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Doctor Tracker
            </span>
          </div>
          <span
            style={{
              color: "#a1a1aa",
              fontSize: "28px",
              lineHeight: 1.4,
            }}
          >
            Secure admin portal for managing doctors and their patients —
            search, filters, pagination and live analytics.
          </span>
          <div style={{ display: "flex", gap: "14px" }}>
            {["Next.js 16", "Express 5", "MongoDB", "RBAC"].map((label) => (
              <span
                key={label}
                style={{
                  border: "1px solid #3f3f46",
                  borderRadius: "999px",
                  color: "#2dd4bf",
                  fontSize: "20px",
                  padding: "8px 20px",
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
        <div
          style={{
            alignItems: "center",
            background: "#1c1c1f",
            border: "1px solid #3f3f46",
            borderRadius: "32px",
            display: "flex",
            height: "220px",
            justifyContent: "center",
            width: "220px",
          }}
        >
          <LogoMark px={140} />
        </div>
      </div>
      <PulseLine />
    </div>,
    { ...size }
  );

export default OpenGraphImage;
