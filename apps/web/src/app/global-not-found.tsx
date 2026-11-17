import { Button } from "@ui-sdk/react/button";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";

import "../index.css";
import { Logo } from "@/components/logo";
import { btn, cx } from "@/components/ui";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const themeBoot = `try{var t=localStorage.getItem('theme');var d=t==='dark'||((t==null||t==='system')&&matchMedia('(prefers-color-scheme: dark)').matches);if(d){var e=document.documentElement;e.classList.add('dark');e.style.colorScheme='dark'}}catch(_){}`;

export const metadata: Metadata = {
  description: "The page you are looking for does not exist.",
  title: "Not Found — Doctor Tracker",
};

const GlobalNotFound = () => (
  <html
    lang="en"
    suppressHydrationWarning
    className={`${geistSans.variable} ${geistMono.variable}`}
  >
    <body className="bg-background text-foreground antialiased">
      <script
        // oxlint-disable-next-line react/no-danger -- static theme boot script, no user input
        dangerouslySetInnerHTML={{ __html: themeBoot }}
      />
      <main className="flex min-h-svh flex-col items-center justify-center gap-8 px-6 text-center">
        <span className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl">
          <Logo className="h-8 w-8" />
        </span>
        <div className="flex flex-col gap-3">
          <p className="text-primary text-sm font-semibold tracking-[0.16em] uppercase">
            404
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            This page doesn’t exist.
          </h1>
          <p className="text-muted-foreground mx-auto max-w-md text-base text-pretty">
            The link may be old or mistyped — the console and its records are
            one click away.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            className={cx(btn.primary, "h-11 gap-2 px-5")}
            render={<Link href="/dashboard" />}
          >
            Go to the console
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Button>
          <Button
            className={cx(btn.ghost, "h-11")}
            render={<Link href="/login" />}
          >
            Sign in
          </Button>
        </div>
      </main>
    </body>
  </html>
);

export default GlobalNotFound;
