import type { ReactNode } from "react";

export const cx = (...parts: (string | false | null | undefined)[]): string =>
  parts.filter(Boolean).join(" ");

const btnBase =
  "inline-flex touch-manipulation select-none items-center justify-center gap-2 rounded-lg font-medium transition-[background-color,color,transform,opacity] duration-100 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:scale-100";

export const btn = {
  danger: `${btnBase} h-9 bg-danger px-4 text-danger-foreground text-sm hover:bg-danger/90 coarse:h-10`,
  dangerGhost: `${btnBase} h-9 px-3 text-danger text-sm hover:bg-danger/10 coarse:h-10`,
  ghost: `${btnBase} h-9 px-3 text-foreground text-sm hover:bg-muted coarse:h-10`,
  icon: `${btnBase} h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground coarse:h-10 coarse:w-10`,
  outline: `${btnBase} h-9 border border-border bg-card px-4 text-foreground text-sm hover:bg-muted coarse:h-10`,
  primary: `${btnBase} h-9 bg-primary px-4 text-primary-foreground text-sm hover:bg-primary/90 coarse:h-10`,
};

export const inputCls =
  "h-9 w-full rounded-lg border border-input bg-card px-3 text-foreground text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring disabled:opacity-50 coarse:h-10";

export const labelCls = "font-medium text-[13px] text-foreground";

export const popupCls =
  "z-50 rounded-lg border border-border bg-card text-card-foreground shadow-lg";

export const popupAnimCls =
  "origin-(--transform-origin) transition-[opacity,scale] duration-150 ease-out data-ending-style:scale-95 data-starting-style:scale-95 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-opacity";

export const menuItemCls =
  "flex cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-muted data-highlighted:text-foreground coarse:py-2.5";

export const selectItemCls =
  "flex cursor-pointer select-none items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-muted coarse:py-2.5";

export const PageHeader = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-balance">
        {title}
      </h1>
      {description ? (
        <p className="text-muted-foreground mt-0.5 text-[13px] text-pretty">
          {description}
        </p>
      ) : null}
    </div>
    {children ? (
      <div className="flex items-center gap-2">{children}</div>
    ) : null}
  </div>
);

export const Card = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <section
    className={cx(
      "rounded-xl border border-border bg-card p-5 shadow-sm",
      className
    )}
  >
    {children}
  </section>
);

export const Skeleton = ({ className }: { className?: string }) => (
  <div aria-hidden="true" className={cx("skeleton", className)} />
);

export const badgeCls =
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap";

export const Badge = ({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "primary";
}) => (
  <span
    className={cx(
      badgeCls,
      tone === "primary"
        ? "bg-primary/10 text-primary"
        : "bg-muted text-foreground"
    )}
  >
    {children}
  </span>
);

const initialsOf = (name: string) =>
  name
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

export const CellAvatar = ({
  name,
  tone = "primary",
}: {
  name: string;
  tone?: "muted" | "primary";
}) => (
  <span
    aria-hidden="true"
    className={cx(
      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
      tone === "primary"
        ? "bg-primary/15 text-primary"
        : "bg-muted text-muted-foreground"
    )}
  >
    {initialsOf(name)}
  </span>
);

export const FieldErrors = ({ errors }: { errors: unknown[] }) => {
  const messages = errors
    .map((error) => {
      if (typeof error === "string") {
        return error;
      }
      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
      ) {
        return (error as { message: string }).message;
      }
      return null;
    })
    .filter((m): m is string => Boolean(m));
  if (messages.length === 0) {
    return null;
  }
  return (
    <p className="text-danger text-xs" role="alert">
      {messages[0]}
    </p>
  );
};

export const EmptyState = ({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) => (
  <div className="flex flex-col items-center gap-1.5 px-6 py-12 text-center">
    <p className="text-foreground text-sm font-medium">{title}</p>
    {description ? (
      <p className="text-muted-foreground max-w-sm text-[13px]">
        {description}
      </p>
    ) : null}
    {action ? <div className="mt-3">{action}</div> : null}
  </div>
);
