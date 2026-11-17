"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui-sdk/react/tooltip";
import {
  LayoutDashboard,
  Menu as MenuIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Stethoscope,
  Users,
} from "lucide-react";
import type { Route } from "next";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { backdropCls } from "@/components/dialogs";
import { Logo } from "@/components/logo";
import { ModeToggle } from "@/components/mode-toggle";
import SearchPalette from "@/components/search-palette";
import {
  btn,
  cx,
  kbdCls,
  popupAnimCls,
  popupCls,
  searchFieldCls,
} from "@/components/ui";
import UserMenu, { CollapsedUserMenu } from "@/components/user-menu";

const COLLAPSED_KEY = "dt.sidebar.collapsed";
const COLLAPSED_EVENT = "dt:sidebar-toggle";

const subscribeCollapsed = (onChange: () => void) => {
  window.addEventListener(COLLAPSED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(COLLAPSED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
};

const readCollapsed = () => window.localStorage.getItem(COLLAPSED_KEY) === "1";
const readCollapsedServer = () => false;

const links = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: Stethoscope, label: "Doctors", to: "/doctors" },
  { icon: Users, label: "Patients", to: "/patients" },
] as const;

const isActive = (pathname: string, to: string) =>
  pathname === to || pathname.startsWith(`${to}/`);

const isEditableTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT");

const Brand = ({ collapsed }: { collapsed?: boolean }) => (
  <Link
    aria-label={collapsed ? "Doctor Tracker home" : undefined}
    className="focus-visible:outline-ring flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
    href="/dashboard"
  >
    <Logo className="h-7 w-7 shrink-0" />
    {collapsed ? null : (
      <span className="flex min-w-0 flex-col">
        <span className="text-sm font-semibold tracking-tight" translate="no">
          Doctor Tracker
        </span>
        <span className="text-muted-foreground text-[11px]">Admin console</span>
      </span>
    )}
  </Link>
);

const NavLink = ({
  collapsed,
  icon: Icon,
  label,
  onNavigate,
  pathname,
  to,
}: {
  collapsed?: boolean;
  icon: typeof LayoutDashboard;
  label: string;
  onNavigate?: () => void;
  pathname: string;
  to: string;
}) => {
  const active = isActive(pathname, to);
  const link = (
    <Link
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
      className={cx(
        "group relative flex h-10 items-center gap-2.5 rounded-lg font-medium text-sm transition-colors duration-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none",
        collapsed ? "justify-center px-0" : "px-3",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
      href={to as Route}
      onClick={onNavigate}
    >
      <span
        aria-hidden="true"
        className={cx(
          "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary transition-opacity duration-150 motion-reduce:transition-none",
          active ? "opacity-100" : "opacity-0",
          collapsed && "left-[-3px]"
        )}
      />
      <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
      {collapsed ? null : label}
    </Link>
  );
  if (!collapsed) {
    return link;
  }
  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent
        className={cx(popupCls, popupAnimCls, "px-2.5 py-1.5 text-xs")}
        side="right"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
};

const NavList = ({
  collapsed,
  pathname,
  onNavigate,
}: {
  collapsed?: boolean;
  pathname: string;
  onNavigate?: () => void;
}) => (
  <nav aria-label="Main" className="flex flex-col gap-1">
    {collapsed ? null : (
      <p className="text-muted-foreground px-3 pb-1.5 text-[11px] font-medium tracking-[0.08em] uppercase">
        Workspace
      </p>
    )}
    {links.map(({ to, label, icon }) => (
      <NavLink
        collapsed={collapsed}
        icon={icon}
        key={to}
        label={label}
        onNavigate={onNavigate}
        pathname={pathname}
        to={to}
      />
    ))}
  </nav>
);

const drawerCls =
  "fixed left-0 top-0 z-50 m-0 flex h-dvh w-72 max-w-[85vw] flex-col gap-4 overscroll-contain rounded-none border-r border-border bg-card p-4 text-foreground shadow-xl transition-[opacity,translate] duration-200 ease-out data-ending-style:-translate-x-4 data-starting-style:-translate-x-4 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-opacity";

const CollapseButton = ({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) => (
  <Tooltip>
    <TooltipTrigger
      aria-keyshortcuts="b"
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className={btn.icon}
      onClick={onToggle}
      type="button"
    >
      {collapsed ? (
        <PanelLeftOpen aria-hidden="true" className="h-4 w-4" />
      ) : (
        <PanelLeftClose aria-hidden="true" className="h-4 w-4" />
      )}
    </TooltipTrigger>
    <TooltipContent
      className={cx(popupCls, popupAnimCls, "px-2.5 py-1.5 text-xs")}
      side={collapsed ? "right" : "bottom"}
    >
      {collapsed ? "Expand sidebar" : "Collapse sidebar"} (B)
    </TooltipContent>
  </Tooltip>
);

const SidebarSearchButton = ({
  collapsed,
  onOpen,
}: {
  collapsed: boolean;
  onOpen: () => void;
}) => {
  if (!collapsed) {
    return (
      <button
        aria-keyshortcuts="meta+k"
        className={cx(searchFieldCls, "w-full")}
        onClick={onOpen}
        type="button"
      >
        <Search aria-hidden="true" className="h-4 w-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate">Search…</span>
        <kbd className={kbdCls}>⌘K</kbd>
      </button>
    );
  }
  return (
    <Tooltip>
      <TooltipTrigger
        aria-label="Search"
        className={cx(btn.icon, "h-10 w-10")}
        onClick={onOpen}
        type="button"
      >
        <Search aria-hidden="true" className="h-4 w-4" />
      </TooltipTrigger>
      <TooltipContent
        className={cx(popupCls, popupAnimCls, "px-2.5 py-1.5 text-xs")}
        side="right"
      >
        Search (⌘K)
      </TooltipContent>
    </Tooltip>
  );
};

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const collapsed = useSyncExternalStore(
    subscribeCollapsed,
    readCollapsed,
    readCollapsedServer
  );
  const { resolvedTheme, setTheme } = useTheme();

  const toggleCollapsed = useCallback(() => {
    window.localStorage.setItem(COLLAPSED_KEY, readCollapsed() ? "0" : "1");
    window.dispatchEvent(new Event(COLLAPSED_EVENT));
  }, []);

  useEffect(() => {
    const onKeydown = (event: KeyboardEvent) => {
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        isEditableTarget(event.target)
      ) {
        return;
      }
      if (event.key === "b") {
        toggleCollapsed();
      } else if (event.key === "d") {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
      }
    };
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, [resolvedTheme, setTheme, toggleCollapsed]);

  if (pathname === "/login") {
    return children;
  }

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <a
        className="bg-primary text-primary-foreground sr-only z-[60] rounded-md px-3 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        href="#main-content"
      >
        Skip to content
      </a>
      <aside
        className={cx(
          "bg-card border-border fixed inset-y-0 left-0 z-30 hidden flex-col border-r transition-[width] duration-200 ease-out motion-reduce:transition-none lg:flex",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div
          className={cx(
            "flex pb-3 pt-5",
            collapsed
              ? "flex-col items-center gap-3 px-2"
              : "items-center justify-between pl-4 pr-3"
          )}
        >
          <Brand collapsed={collapsed} />
          <CollapseButton collapsed={collapsed} onToggle={toggleCollapsed} />
        </div>
        <div className={cx("pb-3", collapsed ? "px-2" : "px-3")}>
          <SidebarSearchButton
            collapsed={collapsed}
            onOpen={() => setPaletteOpen(true)}
          />
        </div>
        <div className={cx("flex-1", collapsed ? "px-2" : "px-3")}>
          <NavList collapsed={collapsed} pathname={pathname} />
        </div>
        <div
          className={cx(
            "border-border flex items-center border-t",
            collapsed ? "flex-col gap-2 py-3" : "gap-2 p-3"
          )}
        >
          <div className={collapsed ? undefined : "min-w-0 flex-1"}>
            {collapsed ? <CollapsedUserMenu /> : <UserMenu />}
          </div>
          <ModeToggle />
        </div>
      </aside>

      <div
        className={cx(
          "flex min-h-dvh flex-col transition-[padding] duration-200 ease-out motion-reduce:transition-none",
          collapsed ? "lg:pl-16" : "lg:pl-64"
        )}
      >
        <header className="border-border bg-background/80 sticky top-0 z-30 flex h-14 items-center gap-2 border-b px-3 pr-[max(0.75rem,env(safe-area-inset-right))] pl-[max(0.75rem,env(safe-area-inset-left))] backdrop-blur sm:px-4">
          <Dialog onOpenChange={setDrawerOpen} open={drawerOpen}>
            <DialogTrigger
              aria-expanded={drawerOpen}
              aria-label="Open navigation"
              className={cx(btn.icon, "lg:hidden")}
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
          <div className="lg:hidden">
            <Brand collapsed />
          </div>
          <div className="min-w-0 flex-1 sm:px-4">
            <SearchPalette
              onOpenChange={setPaletteOpen}
              onToggleSidebar={toggleCollapsed}
              open={paletteOpen}
            />
          </div>
        </header>
        <main className="flex-1" id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </>
  );
};

export default AppShell;
