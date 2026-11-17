import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "../index.css";
import AppShell from "@/components/app-shell";
import Providers from "@/components/providers";
import { ENV } from "@/env";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const siteDescription =
  "Secure admin portal for managing doctors and their patients — CRUD, search, filters, pagination and dashboard analytics on Next.js, Express and MongoDB.";

export const metadata: Metadata = {
  applicationName: "Doctor Tracker",
  authors: [{ name: "Seyam Alam", url: "https://github.com/Seyamalam" }],
  creator: "Seyam Alam",
  description: siteDescription,
  keywords: [
    "doctor tracker",
    "patient management",
    "admin dashboard",
    "healthcare",
    "next.js",
    "express",
    "mongodb",
  ],
  metadataBase: new URL(ENV.NEXT_PUBLIC_APP_URL || "https://doctor-tracker-tau-sage.vercel.app"),
  openGraph: {
    description: siteDescription,
    siteName: "Doctor Tracker",
    title: "Doctor Tracker — Admin",
    type: "website",
    url: "/",
  },
  robots: { follow: true, index: true },
  title: {
    default: "Doctor Tracker — Admin",
    template: "%s — Doctor Tracker",
  },
  twitter: {
    card: "summary_large_image",
    description: siteDescription,
    title: "Doctor Tracker — Admin",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  interactiveWidget: "resizes-content",
  themeColor: [
    { color: "#ffffff", media: "(prefers-color-scheme: light)" },
    { color: "#141416", media: "(prefers-color-scheme: dark)" },
  ],
  viewportFit: "cover",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <html lang="en" suppressHydrationWarning>
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <Providers>
        <AppShell>{children}</AppShell>
      </Providers>
    </body>
  </html>
);

export default RootLayout;
