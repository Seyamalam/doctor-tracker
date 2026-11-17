import { Button } from "@ui-sdk/react/button";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { btn, cx } from "@/components/ui";

export const metadata: Metadata = {
  title: "Not Found",
};

const NotFound = () => (
  <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
    <div className="flex flex-col gap-2">
      <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
        404
      </p>
      <h1 className="text-2xl font-semibold tracking-tight text-balance">
        Nothing at this address.
      </h1>
      <p className="text-muted-foreground max-w-sm text-sm text-pretty">
        The record may have been deleted or the link is mistyped.
      </p>
    </div>
    <Button
      className={cx(btn.outline, "h-11 gap-2 px-5")}
      render={<Link href="/dashboard" />}
    >
      <ArrowLeft aria-hidden="true" className="h-4 w-4" />
      Back to dashboard
    </Button>
  </div>
);

export default NotFound;
