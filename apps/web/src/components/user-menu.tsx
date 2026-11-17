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
import type { ReactNode } from "react";

import { cx, menuItemCls, popupAnimCls, popupCls } from "@/components/ui";
import { authClient } from "@/lib/auth-client";

const initials = (name: string) =>
  name
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const Avatar = ({ name }: { name: string }) => (
  <span
    aria-hidden="true"
    className="bg-primary/15 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
  >
    {initials(name)}
  </span>
);

interface SessionUser {
  email?: string;
  name: string;
  role?: string;
}

const AccountMenu = ({
  children,
  side,
  user,
}: {
  children: ReactNode;
  side: "right" | "top";
  user: SessionUser;
}) => {
  const router = useRouter();
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
      {children}
      <MenuContent
        align="start"
        className={cx(popupCls, popupAnimCls, "w-56 p-1")}
        side={side}
        sideOffset={6}
      >
        <MenuGroup>
          <MenuGroupLabel className="text-muted-foreground flex items-center justify-between gap-2 px-2.5 py-1.5 text-sm">
            <span className="truncate">{user.email}</span>
            <span className="bg-primary/10 text-primary shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize">
              {user.role ?? "viewer"}
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

const triggerBase =
  "focus-visible:outline-ring flex min-w-0 items-center gap-2.5 rounded-lg border-0 text-left transition-colors duration-100 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none";

const useSessionUser = () => {
  const { data: session, isPending } = authClient.useSession();
  return { isPending, user: session?.user as SessionUser | undefined };
};

const UserMenu = () => {
  const { isPending, user } = useSessionUser();

  if (isPending) {
    return <div className="skeleton h-11 w-full min-w-36" />;
  }
  if (!user) {
    return null;
  }

  return (
    <AccountMenu side="top" user={user}>
      <MenuTrigger
        aria-label={`Account menu for ${user.name}`}
        className={cx(
          triggerBase,
          "bg-primary/10 hover:bg-primary/15 flex-1 px-2 py-1.5"
        )}
      >
        <Avatar name={user.name} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-foreground truncate text-[13px] leading-tight font-medium">
            {user.name}
          </span>
          <span className="text-muted-foreground truncate text-[11px] leading-tight capitalize">
            {user.role ?? "viewer"}
          </span>
        </span>
        <ChevronsUpDown
          aria-hidden="true"
          className="text-muted-foreground h-3.5 w-3.5 shrink-0"
        />
      </MenuTrigger>
    </AccountMenu>
  );
};

const CollapsedUserMenu = () => {
  const { isPending, user } = useSessionUser();

  if (isPending) {
    return <div className="skeleton h-9 w-9 rounded-full" />;
  }
  if (!user) {
    return null;
  }

  return (
    <AccountMenu side="right" user={user}>
      <MenuTrigger
        aria-label={`Account menu for ${user.name}`}
        className={cx(triggerBase, "hover:bg-muted h-10 w-10 justify-center")}
      >
        <Avatar name={user.name} />
      </MenuTrigger>
    </AccountMenu>
  );
};

export { CollapsedUserMenu };
export default UserMenu;
