"use client";

import { Button } from "@ui-sdk/react/button";
import {
  Menu,
  MenuContent,
  MenuGroupLabel,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from "@ui-sdk/react/menu";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { btn, cx, menuItemCls, popupAnimCls, popupCls } from "@/components/ui";
import { authClient } from "@/lib/auth-client";

const UserMenu = () => {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <div className="skeleton h-9 w-24" />;
  }

  if (!session) {
    return (
      <Link href="/login">
        <Button className={btn.primary}>Sign In</Button>
      </Link>
    );
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
      <MenuTrigger className={cx(btn.ghost, "max-w-36 truncate border border-border bg-card")}>
        {session.user.name}
      </MenuTrigger>
      <MenuContent
        align="end"
        className={cx(popupCls, popupAnimCls, "w-48 p-1")}
        side="bottom"
        sideOffset={4}
      >
        <MenuGroupLabel className="text-muted-foreground truncate px-2.5 py-1.5 text-sm">
          {session.user.email}
        </MenuGroupLabel>
        <MenuSeparator className="bg-border my-1 h-px" />
        <MenuItem className={cx(menuItemCls, "text-danger")} value="sign-out">
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </MenuItem>
      </MenuContent>
    </Menu>
  );
};

export default UserMenu;
