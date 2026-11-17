"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog";
import { LayoutDashboard, Menu as MenuIcon, Stethoscope, Users } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { backdropCls } from "@/components/dialogs";
import { Logo } from "@/components/logo";
import { ModeToggle } from "@/components/mode-toggle";
import { btn, cx } from "@/components/ui";
import UserMenu from "@/components/user-menu";

const links = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: Stethoscope, label: "Doctors", to: "/doctors" },
  { icon: Users, label: "Patients", to: "/patients" },
] as const;

const isActive = (pathname: string, to: string) => pathname === to || pathname.startsWith(`${to}/`);

const Brand = () => (
  <Link
    className="focus-visible:outline-ring flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
    href="/dashboard"
  >
    <Logo className="h-7 w-7" />
    <span className="flex flex-col">
      <span className="text-sm font-semibold tracking-tight">Doctor Tracker</span>
      <span className="text-muted-foreground text-[11px]">Admin console</span>
    </span>
  </Link>
);

const NavList = ({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) => (
  <nav aria-label="Main" className="flex flex-col gap-1">
    <p className="text-muted-foreground px-3 pb-1.5 text-[11px] font-medium tracking-[0.08em] uppercase">
      Workspace
    </p>
    {links.map(({ to, label, icon: Icon }) => {
      const active = isActive(pathname, to);
      return (
        <Link
          aria-current={active ? "page" : undefined}
          className={cx(
            "group relative flex h-10 items-center gap-2.5 rounded-lg px-3 font-medium text-sm transition-colors duration-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none",
            active
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
          href={to as Route}
          key={to}
          onClick={onNavigate}
        >
          <span
            aria-hidden="true"
            className={cx(
              "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary transition-opacity duration-150 motion-reduce:transition-none",
              active ? "opacity-100" : "opacity-0",
            )}
          />
          <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
          {label}
        </Link>
      );
    })}
  </nav>
);

const drawerCls =
  "fixed left-0 top-0 z-50 m-0 flex h-dvh w-72 max-w-[85vw] flex-col gap-4 rounded-none border-r border-border bg-card p-4 text-foreground shadow-xl transition-[opacity,translate] duration-200 ease-out data-ending-style:-translate-x-4 data-starting-style:-translate-x-4 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-opacity";

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (pathname === "/login") {
    return children;
  }

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <aside className="bg-card border-border fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r lg:flex">
        <div className="px-4 pt-5 pb-4">
          <Brand />
        </div>
        <div className="flex-1 px-3">
          <NavList pathname={pathname} />
        </div>
        <div className="border-border flex items-center justify-between gap-2 border-t p-3">
          <UserMenu />
          <ModeToggle />
        </div>
      </aside>

      <div className="border-border bg-card sticky top-0 z-30 flex h-14 items-center gap-2 border-b px-3 pr-[max(0.75rem,env(safe-area-inset-right))] pl-[max(0.75rem,env(safe-area-inset-left))] lg:hidden">
        <Dialog onOpenChange={setDrawerOpen} open={drawerOpen}>
          <DialogTrigger
            aria-expanded={drawerOpen}
            aria-label="Open navigation"
            className={btn.icon}
          >
            <MenuIcon aria-hidden="true" className="h-4 w-4" />
          </DialogTrigger>
          <DialogBackdrop className={backdropCls} />
          <DialogContent className={drawerCls}>
            <div className="px-1 pt-1">
              <Brand />
            </div>
            <DialogTitle className="sr-only">Navigation</DialogTitle>
            <div className="flex-1">
              <NavList onNavigate={closeDrawer} pathname={pathname} />
            </div>
            <div className="border-border flex items-center justify-between gap-2 border-t pt-3">
              <UserMenu />
              <ModeToggle />
            </div>
          </DialogContent>
        </Dialog>
        <Brand />
      </div>

      <div className="lg:pl-64">{children}</div>
    </>
  );
};

export default AppShell;
