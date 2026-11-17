import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "../index.css";
import Header from "@/components/header";
import Providers from "@/components/providers";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  description: "Admin dashboard for managing doctors and patients",
  title: {
    default: "Doctor Tracker — Admin",
    template: "%s — Doctor Tracker",
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
        <div className="grid min-h-dvh grid-cols-1 grid-rows-[auto_1fr]">
          <Header />
          {children}
        </div>
      </Providers>
    </body>
  </html>
);

export default RootLayout;
