"use client";

import {
  Menu,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from "@ui-sdk/react/menu";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { cx, menuItemCls, popupAnimCls, popupCls } from "@/components/ui";
import { authClient } from "@/lib/auth-client";

const initials = (name: string) =>
  name
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const UserMenu = ({ compact }: { compact?: boolean }) => {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div
        className={cx(
          "skeleton",
          compact ? "h-9 w-9 rounded-full" : "h-11 w-full min-w-36"
        )}
      />
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Menu
      onAction={(value) => {
        if (value === "sign-out") {
          authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                router.push("/");
              },
            },
          });
        }
      }}
    >
      <MenuTrigger
        aria-label={`Account menu for ${session.user.name}`}
        className={cx(
          "hover:bg-muted focus-visible:outline-ring flex min-w-0 items-center gap-2.5 rounded-lg text-left transition-colors duration-100 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none",
          compact ? "justify-center p-1.5" : "flex-1 px-2 py-1.5"
        )}
      >
        <span
          aria-hidden="true"
          className="bg-primary/15 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
        >
          {initials(session.user.name)}
        </span>
        {compact ? null : (
          <>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-foreground truncate text-[13px] leading-tight font-medium">
                {session.user.name}
              </span>
              <span className="text-muted-foreground truncate text-[11px] leading-tight capitalize">
                {session.user.role ?? "viewer"}
              </span>
            </span>
            <ChevronsUpDown
              aria-hidden="true"
              className="text-muted-foreground h-3.5 w-3.5 shrink-0"
            />
          </>
        )}
      </MenuTrigger>
      <MenuContent
        align="start"
        className={cx(popupCls, popupAnimCls, "w-56 p-1")}
        side={compact ? "right" : "top"}
        sideOffset={6}
      >
        <MenuGroup>
          <MenuGroupLabel className="text-muted-foreground flex items-center justify-between gap-2 px-2.5 py-1.5 text-sm">
            <span className="truncate">{session.user.email}</span>
            <span className="bg-primary/10 text-primary shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize">
              {session.user.role ?? "viewer"}
            </span>
          </MenuGroupLabel>
        </MenuGroup>
        <MenuSeparator className="bg-border my-1 h-px" />
        <MenuItem className={cx(menuItemCls, "text-danger")} value="sign-out">
          <LogOut aria-hidden="true" className="h-3.5 w-3.5" />
          Sign Out
        </MenuItem>
      </MenuContent>
    </Menu>
  );
};

export default UserMenu;
