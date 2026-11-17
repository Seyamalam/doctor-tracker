"use client";

import { Menu, MenuContent, MenuItem, MenuTrigger } from "@ui-sdk/react/menu";
import { Menu as MenuIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Logo } from "@/components/logo";
import { ModeToggle } from "@/components/mode-toggle";
import { btn, cx, menuItemCls, popupAnimCls, popupCls } from "@/components/ui";
import UserMenu from "@/components/user-menu";

const links = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Doctors", to: "/doctors" },
  { label: "Patients", to: "/patients" },
] as const;

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);

  return (
    <header className="border-border bg-card border-b">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))]">
        <div className="flex min-w-0 items-center gap-6">
          <Link
            className="flex shrink-0 items-center gap-2 rounded-md transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href="/dashboard"
          >
            <Logo className="h-6 w-6" />
            <span className="truncate text-sm font-semibold">Doctor Tracker</span>
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {links.map(({ to, label }) => (
              <Link
                aria-current={isActive(to) ? "page" : undefined}
                className={cx(
                  "rounded-md px-3 py-1.5 font-medium text-[13px] transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  isActive(to)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                href={to as Route}
                key={to}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-1.5">
          <ModeToggle />
          <UserMenu />
          <Menu onAction={(value) => router.push(value as Route)}>
            <MenuTrigger aria-label="Open navigation" className={cx(btn.icon, "md:hidden")}>
              <MenuIcon className="h-4 w-4" />
            </MenuTrigger>
            <MenuContent
              align="end"
              className={cx(popupCls, popupAnimCls, "w-44 p-1")}
              side="bottom"
              sideOffset={4}
            >
              {links.map(({ to, label }) => (
                <MenuItem
                  className={cx(
                    menuItemCls,
                    isActive(to) && "bg-primary/10 font-medium text-primary",
                  )}
                  key={to}
                  value={to}
                >
                  {label}
                </MenuItem>
              ))}
            </MenuContent>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default Header;
